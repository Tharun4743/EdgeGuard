package com.edgeguard.backend.model;

public class CanMessage {
    private double timestamp;
    private String canId;
    private int dlc;
    private String[] data;
    private String flag;

    // Constructors, Getters, Setters
    public CanMessage() {}

    public CanMessage(double timestamp, String canId, int dlc, String[] data, String flag) {
        this.timestamp = timestamp;
        this.canId = canId;
        this.dlc = dlc;
        this.data = data;
        this.flag = flag;
    }

    public double getTimestamp() { return timestamp; }
    public void setTimestamp(double timestamp) { this.timestamp = timestamp; }

    public String getCanId() { return canId; }
    public void setCanId(String canId) { this.canId = canId; }

    public int getDlc() { return dlc; }
    public void setDlc(int dlc) { this.dlc = dlc; }

    public String[] getData() { return data; }
    public void setData(String[] data) { this.data = data; }

    public String getFlag() { return flag; }
    public void setFlag(String flag) { this.flag = flag; }
}
