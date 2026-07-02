package com.edgeguard.backend.service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;
import com.edgeguard.backend.model.CanMessage;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.nio.FloatBuffer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OnnxInferenceService {

    private OrtEnvironment env;
    private OrtSession session;
    private final String modelPath = "../ml-sidecar/model.onnx";
    
    // State for feature extraction
    private Map<String, Double> lastSeenTimestamps = new HashMap<>();
    private Map<String, Deque<Float>> deltaHistory = new HashMap<>();
    private Deque<String> slidingWindow = new ArrayDeque<>();
    private static final int WINDOW_SIZE = 50;
    
    private List<String> top5Ids = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            env = OrtEnvironment.getEnvironment();
            session = env.createSession(modelPath, new OrtSession.SessionOptions());
            System.out.println("ONNX model loaded successfully.");
            
            // Load TOP 5 IDs from model config
            String configPath = "../ml-sidecar/model_config.json";
            String jsonStr = new String(Files.readAllBytes(Paths.get(configPath)));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonStr);
            for (JsonNode idNode : root.get("top_5_can_ids")) {
                top5Ids.add(idNode.asText());
            }
            System.out.println("Loaded TOP 5 IDs: " + top5Ids);
            
        } catch (Exception e) {
            System.err.println("Failed to initialize OnnxInferenceService: " + e.getMessage());
        }
    }

    @PreDestroy
    public void close() {
        try {
            if (session != null) session.close();
            if (env != null) env.close();
        } catch (OrtException e) {
            e.printStackTrace();
        }
    }

    public double[] predict(CanMessage msg) {
        if (session == null) return new double[]{-1.0, 0.0}; // Model not loaded
        
        try {
            float[] features = extractFeatures(msg);
            
            // Create input tensor (1 row, 13 columns)
            FloatBuffer floatBuffer = FloatBuffer.wrap(features);
            long[] shape = new long[]{1, 13};
            OnnxTensor inputTensor = OnnxTensor.createTensor(env, floatBuffer, shape);
            
            // Run inference
            String inputName = session.getInputNames().iterator().next();
            Map<String, OnnxTensor> inputs = Collections.singletonMap(inputName, inputTensor);
            
            try (OrtSession.Result result = session.run(inputs)) {
                long[] labels = (long[]) result.get(0).getValue();
                double label = labels[0];
                
                // Get probabilities
                @SuppressWarnings("unchecked")
                List<ai.onnxruntime.OnnxMap> probabilities = (List<ai.onnxruntime.OnnxMap>) result.get(1).getValue();
                ai.onnxruntime.OnnxMap onnxMap = probabilities.get(0);
                
                @SuppressWarnings("unchecked")
                Map<Long, Float> probMap = (Map<Long, Float>) onnxMap.getValue();
                
                // Anomaly score is 1.0 - probability of class 0 (Normal)
                float normalProb = probMap.getOrDefault(0L, 0.0f);
                double anomalyScore = 1.0 - normalProb;
                
                return new double[]{label, anomalyScore};
            } finally {
                inputTensor.close();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return new double[]{-1.0, 0.0};
        }
    }
    
    private float[] extractFeatures(CanMessage msg) {
        float[] features = new float[13];
        
        // Pad data to exactly 8 bytes (fill missing with "00")
        String[] originalData = msg.getData();
        String[] dataStr = new String[8];
        for (int i = 0; i < 8; i++) {
            if (i < originalData.length) {
                dataStr[i] = originalData[i];
            } else {
                dataStr[i] = "00";
            }
        }
        
        // 1. CAN ID to INT
        int canIdInt = Integer.parseInt(msg.getCanId(), 16);
        features[0] = (float) canIdInt;
        
        // 2. DLC
        features[1] = (float) msg.getDlc();
        
        // 3. Time Delta
        double lastTime = lastSeenTimestamps.getOrDefault(msg.getCanId(), msg.getTimestamp());
        float timeDelta = (float) (msg.getTimestamp() - lastTime);
        features[2] = timeDelta;
        lastSeenTimestamps.put(msg.getCanId(), msg.getTimestamp());
        
        // 4. Payload Entropy
        features[3] = calculateEntropy(dataStr);
        
        // 5. Byte Variance
        features[4] = calculateVariance(dataStr);
        
        // 6. Hamming Weight
        int hammingWeight = 0;
        for (String hex : dataStr) {
            hammingWeight += Integer.bitCount(Integer.parseInt(hex, 16));
        }
        features[5] = (float) hammingWeight;
        
        // 7. ID Freq 50
        slidingWindow.addLast(msg.getCanId());
        if (slidingWindow.size() > WINDOW_SIZE) {
            slidingWindow.removeFirst();
        }
        int freq = 0;
        for (String id : slidingWindow) {
            if (id.equals(msg.getCanId())) {
                freq++;
            }
        }
        features[6] = (float) freq;
        
        // 8. Inter Arrival Variance
        deltaHistory.putIfAbsent(msg.getCanId(), new ArrayDeque<>());
        Deque<Float> history = deltaHistory.get(msg.getCanId());
        history.addLast(timeDelta);
        if (history.size() > 5) {
            history.removeFirst();
        }
        
        float variance = 0.0f;
        if (history.size() > 1) {
            float mean = 0.0f;
            for (float d : history) mean += d;
            mean /= history.size();
            for (float d : history) {
                variance += (d - mean) * (d - mean);
            }
            variance /= history.size();
        }
        features[7] = variance;
        
        // 9-13. One-Hot Top 5
        for (int i = 0; i < 5; i++) {
            if (i < top5Ids.size()) {
                features[8 + i] = msg.getCanId().equals(top5Ids.get(i)) ? 1.0f : 0.0f;
            } else {
                features[8 + i] = 0.0f;
            }
        }
        
        return features;
    }
    
    private float calculateVariance(String[] dataStr) {
        if (dataStr.length == 0) return 0.0f;
        float mean = 0.0f;
        for (String hex : dataStr) {
            mean += Integer.parseInt(hex, 16);
        }
        mean /= dataStr.length;
        float var = 0.0f;
        for (String hex : dataStr) {
            float val = Integer.parseInt(hex, 16);
            var += (val - mean) * (val - mean);
        }
        return var / dataStr.length;
    }
    
    private float calculateEntropy(String[] dataStr) {
        Map<Integer, Integer> counts = new HashMap<>();
        int total = dataStr.length;
        
        for (String hex : dataStr) {
            int val = Integer.parseInt(hex, 16);
            counts.put(val, counts.getOrDefault(val, 0) + 1);
        }
        
        double entropy = 0.0;
        for (int count : counts.values()) {
            double p = (double) count / total;
            entropy -= p * (Math.log(p) / Math.log(2));
        }
        return (float) entropy;
    }
}
