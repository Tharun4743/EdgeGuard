package com.edgeguard.backend.model;

public class PredictionResult {
    private CanMessage message;
    private int predictionLabel; // 0: Normal, 1: DoS, 2: Fuzzy, 3: Spoofing
    private String predictionClass;
    private double latencyMs;
    private double anomalyScore;

    public PredictionResult() {}

    public PredictionResult(CanMessage message, int predictionLabel, String predictionClass, double latencyMs, double anomalyScore) {
        this.message = message;
        this.predictionLabel = predictionLabel;
        this.predictionClass = predictionClass;
        this.latencyMs = latencyMs;
        this.anomalyScore = anomalyScore;
    }

    public CanMessage getMessage() { return message; }
    public void setMessage(CanMessage message) { this.message = message; }

    public int getPredictionLabel() { return predictionLabel; }
    public void setPredictionLabel(int predictionLabel) { this.predictionLabel = predictionLabel; }

    public String getPredictionClass() { return predictionClass; }
    public void setPredictionClass(String predictionClass) { this.predictionClass = predictionClass; }

    public double getLatencyMs() { return latencyMs; }
    public void setLatencyMs(double latencyMs) { this.latencyMs = latencyMs; }

    public double getAnomalyScore() { return anomalyScore; }
    public void setAnomalyScore(double anomalyScore) { this.anomalyScore = anomalyScore; }
}
