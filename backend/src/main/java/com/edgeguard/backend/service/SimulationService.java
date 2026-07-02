package com.edgeguard.backend.service;

import com.edgeguard.backend.model.CanMessage;
import com.edgeguard.backend.model.PredictionResult;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class SimulationService {

    @Autowired
    private OnnxInferenceService inferenceService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private ScheduledExecutorService executorService;
    private BufferedReader reader;

    private static final String DATA_FILE = "../data/DoS_dataset.csv";

    private Double lastTimestamp = null;

    @PostConstruct
    public void startSimulation() {
        try {
            reader = new BufferedReader(new FileReader(DATA_FILE));
            executorService = Executors.newSingleThreadScheduledExecutor();
            
            // Start true temporal replay
            executorService.submit(this::simulationLoop);
            System.out.println("Started TRUE temporal CAN bus simulation...");
        } catch (IOException e) {
            System.err.println("Failed to open dataset: " + e.getMessage());
        }
    }

    @PreDestroy
    public void stopSimulation() {
        if (executorService != null) {
            executorService.shutdownNow();
        }
        if (reader != null) {
            try {
                reader.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void simulationLoop() {
        try {
            while (!Thread.currentThread().isInterrupted()) {
                String line = reader.readLine();
                if (line == null) {
                    // Loop back to start
                    reader.close();
                    reader = new BufferedReader(new FileReader(DATA_FILE));
                    line = reader.readLine();
                    lastTimestamp = null;
                }

                if (line != null) {
                    String[] parts = line.split(",");
                    if (parts.length != 12) continue;

                    double timestamp = Double.parseDouble(parts[0]);
                    double deltaSeconds = 0;
                    
                    if (lastTimestamp != null) {
                        deltaSeconds = timestamp - lastTimestamp;
                        long delayMs = (long) (deltaSeconds * 1000);
                        
                        // Add minimum throttle (5–20ms) to prevent UI freezing
                        if (delayMs < 5) delayMs = 5;
                        // Prevent indefinitely long gaps (e.g. gaps between dataset sections)
                        if (delayMs > 1000) delayMs = 1000;
                        
                        // Add jitter to arrival animation (±10ms)
                        long jitter = (long) (Math.random() * 20 - 10);
                        long finalDelay = delayMs + jitter;
                        if (finalDelay < 5) finalDelay = 5; // ensure minimum throttle is respected
                        
                        Thread.sleep(finalDelay);
                    }
                    lastTimestamp = timestamp;

                    String canId = parts[1];
                    int dlc = Integer.parseInt(parts[2]);
                    String[] data = new String[]{parts[3], parts[4], parts[5], parts[6], parts[7], parts[8], parts[9], parts[10]};
                    String flag = parts[11];

                    CanMessage msg = new CanMessage(timestamp, canId, dlc, data, flag);

                    long start = System.nanoTime();
                    double[] predictionData = inferenceService.predict(msg);
                    int prediction = (int) predictionData[0];
                    double anomalyScore = predictionData[1];
                    long end = System.nanoTime();
                    
                    double latencyMs = (end - start) / 1_000_000.0;
                    
                    String labelStr = switch(prediction) {
                        case 0 -> "Normal";
                        case 1 -> "DoS";
                        case 2 -> "Fuzzy";
                        case 3 -> "Spoofing";
                        default -> "Unknown";
                    };

                    PredictionResult result = new PredictionResult(msg, prediction, labelStr, latencyMs, anomalyScore);
                    messagingTemplate.convertAndSend("/topic/alerts", result);
                    
                    // Log periodically to prove timestamp-based replay
                    if (Math.random() < 0.01) {
                        System.out.printf("[Replay] Timestamp: %.4f | Delta: %.4f s | Sent %s%n", timestamp, deltaSeconds, canId);
                    }
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
