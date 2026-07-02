package com.edgeguard.backend.controller;

import com.edgeguard.backend.model.CanMessage;
import com.edgeguard.backend.model.PredictionResult;
import com.edgeguard.backend.service.OnnxInferenceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CanDataController {

    private final OnnxInferenceService inferenceService;

    public CanDataController(OnnxInferenceService inferenceService) {
        this.inferenceService = inferenceService;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictionResult> predict(@RequestBody CanMessage message) {
        try {
            long start = System.nanoTime();
            double[] res = inferenceService.predict(message);
            double latencyMs = (System.nanoTime() - start) / 1000000.0;
            String[] classes = {"Normal", "DoS", "Fuzzy", "Spoofing"};
            int label = (int)res[0];
            String className = (label >= 0 && label < 4) ? classes[label] : "Unknown";
            
            PredictionResult result = new PredictionResult(message, label, className, latencyMs, res.length > 1 ? res[1] : 0.0);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
