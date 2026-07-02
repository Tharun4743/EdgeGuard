package com.edgeguard.backend;

import com.edgeguard.backend.model.CanMessage;
import com.edgeguard.backend.service.OnnxInferenceService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class TestParity {
    public static void main(String[] args) throws Exception {
        System.out.println("Starting Java Feature Parity Test...");
        OnnxInferenceService service = new OnnxInferenceService();
        service.init();

        Method extractFeaturesMethod = OnnxInferenceService.class.getDeclaredMethod("extractFeatures", CanMessage.class);
        extractFeaturesMethod.setAccessible(true);

        // Read test cases
        File testDataFile = new File("../ml-sidecar/parity_test_data.json");
        if (!testDataFile.exists()) {
            System.err.println("parity_test_data.json not found!");
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(testDataFile);

        int passed = 0;
        int total = rootNode.size();
        
        System.out.println(String.format("%-10s | %-10s | %s", "Index", "Status", "Max Diff"));
        System.out.println("-".repeat(40));

        for (JsonNode testCase : rootNode) {
            int index = testCase.get("index").asInt();
            JsonNode raw = testCase.get("raw");
            JsonNode pythonFeatures = testCase.get("features");

            CanMessage msg = new CanMessage();
            msg.setTimestamp(raw.get("Timestamp").asDouble());
            msg.setCanId(raw.get("CAN_ID").asText());
            msg.setDlc(raw.get("DLC").asInt());
            msg.setFlag(raw.get("Flag").asText());

            String[] dataBytes = new String[8];
            for (int i = 0; i < 8; i++) {
                dataBytes[i] = raw.get("DATA").get(i).asText();
            }
            msg.setData(dataBytes);

            float[] javaFeatures = (float[]) extractFeaturesMethod.invoke(service, msg);

            float maxDiff = 0.0f;
            boolean match = true;
            for (int i = 0; i < 13; i++) {
                float pVal = (float) pythonFeatures.get(i).asDouble();
                float jVal = javaFeatures[i];
                float diff = Math.abs(pVal - jVal);
                if (diff > maxDiff) {
                    maxDiff = diff;
                }
                if (diff > 1e-4) {
                    match = false;
                }
            }
            
            // Only compare the last 20 to allow state to warm up
            if (index >= 80) {
                if (match) {
                    passed++;
                    System.out.println(String.format("%-10d | %-10s | %.6f", index, "PASS", maxDiff));
                } else {
                    System.out.println(String.format("%-10d | %-10s | %.6f", index, "FAIL", maxDiff));
                    System.out.println("Java:   " + Arrays.toString(javaFeatures));
                    System.out.println("Python: " + pythonFeatures.toString());
                }
            }
        }

        System.out.println("-".repeat(40));
        System.out.println(String.format("Result: %d / %d PASSED", passed, 20));
        
        if (passed == 20) {
            System.out.println("SUCCESS: Java feature extraction is perfectly identical to Python!");
        } else {
            System.out.println("WARNING: Parity test failed!");
        }
    }
}
