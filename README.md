# EdgeGuard — Offline Edge-AI Intrusion Detection System for Automotive CAN Networks

A standalone, production-grade ML pipeline and NSOC dashboard for detecting anomalies on vehicle CAN buses with zero cloud dependency.

![Built for Tata Technologies InnoVent 2026](https://img.shields.io/badge/Built_for-Tata_Technologies_InnoVent_2026-blue)
![Offline-First](https://img.shields.io/badge/Architecture-Offline--First-success)
![Java 21 + Spring Boot](https://img.shields.io/badge/Backend-Java_21_+_Spring_Boot-green)
![React 18](https://img.shields.io/badge/Frontend-React_18-cyan)
![ONNX Runtime](https://img.shields.io/badge/ML-ONNX_Runtime-orange)

═══════════════════════════════════════════════
## 2. PROBLEM STATEMENT
═══════════════════════════════════════════════

Modern automotive CAN (Controller Area Network) buses are inherently insecure, entirely lacking built-in authentication or encryption. By 2030, McKinsey estimates that 95% of new vehicles sold globally will be highly connected, massively expanding the attack surface for remote exploitation, spoofing, and Denial of Service (DoS) attacks on critical vehicle systems (brakes, steering, engine).

Existing Intrusion Detection System (IDS) approaches frequently require continuous cloud connectivity for model inference or federated learning, which fails in edge environments (e.g., rural areas, tunnels) and introduces unacceptable latency. Alternatively, lightweight signature-based edge rulesets fail to catch zero-day fuzzing or sophisticated spoofing patterns. 

Built for the **Edge AI for Automotive Cybersecurity** category, EdgeGuard solves this by deploying a fully self-contained ML classifier directly to the vehicle edge. It processes high-frequency CAN traffic locally, relying exclusively on an optimized ONNX runtime, ensuring deterministic latency and privacy without any external network dependency.

═══════════════════════════════════════════════
## 3. SOLUTION OVERVIEW
═══════════════════════════════════════════════

EdgeGuard monitors live CAN bus traffic and classifies each message as either `Normal`, `DoS`, `Fuzzy`, or `Spoofing` in real-time. It operates completely offline, processing the high-velocity stream through a locally-run Random Forest model compiled to an ONNX runtime. The system is packaged as a standalone offline desktop application, featuring a National Security Operations Center (NSOC) styled dashboard for visualizing threats, timeline anomalies, and system health.

═══════════════════════════════════════════════
## 4. ARCHITECTURE DIAGRAM
═══════════════════════════════════════════════

```text
       [OFFLINE EDGE BOUNDARY]
+-------------------------------------------------------------------------------+
|                                                                               |
|  [ML Pipeline (One-Time)]              [EdgeGuard Runtime]                    |
|                                                                               |
|   +-------------------+                +-----------------------+              |
|   | HCRL CAN Dataset  |                | Live CAN Bus Interface|              |
|   +---------+---------+                +-----------+-----------+              |
|             | (CSV parsing)                        | (Streaming)              |
|             v                                      v                          |
|   +-------------------+                +-----------------------+              |
|   | Python Training   |                | Spring Boot Backend   |              |
|   | (scikit-learn)    |                | (Java 21)             |              |
|   +---------+---------+                +-----------+-----------+              |
|             |                                      |                          |
|             | export                               | inference                |
|             v                                      v                          |
|   +-------------------+                +-----------------------+              |
|   | model.onnx        |--------------->| ONNX Runtime (C++)    |              |
|   +-------------------+                +-----------+-----------+              |
|                                                    |                          |
|                                                    | STOMP WebSocket          |
|                                                    | (/ws/alerts)             |
|                                                    v                          |
|                                        +-----------------------+              |
|                                        | React 18 Dashboard    |              |
|                                        | (Vite + Tailwind)     |              |
|                                        +-----------------------+              |
|                                                    |                          |
|                                        [Wrapped via Electron]                 |
+-------------------------------------------------------------------------------+
```

═══════════════════════════════════════════════
## 5. TECH STACK
═══════════════════════════════════════════════

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **ML Training** | Python, scikit-learn, skl2onnx | Feature engineering and model training |
| **Backend** | Java 21, Spring Boot 3.3, ONNX Runtime | High-throughput streaming and low-latency local inference |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts | NSOC styled real-time telemetry dashboard |
| **Desktop App** | Electron, electron-builder | Standalone packaging for edge deployment |
| **Dataset** | HCRL Car-Hacking Dataset | Real-world CAN data for training and simulation |

═══════════════════════════════════════════════
## 6. MODEL METHODOLOGY
═══════════════════════════════════════════════

**Dataset:**
Trained using the real-world [HCRL Car-Hacking Dataset](https://ocslab.hksecurity.net/Datasets/car-hacking-dataset). We utilized a stratified sample to manage memory limits during training (60k train / 15k test per file).

**Engineered Features:**
- `CAN_ID_INT`: Hex ID parsed to integer to identify the ECU.
- `DLC`: Data Length Code (packet size).
- `Time_Delta`: Elapsed time since the last message from the *same* CAN ID.
- `Payload_Entropy`: Shannon entropy of the 8-byte payload (captures randomness from Fuzzing).
- `ID_Freq_50`: Rolling count of occurrences for a CAN ID in the last 50 total messages.
- `Is_<Top5>`: One-hot encoding for the 5 most frequent, dominant CAN IDs on the bus.
- `Payload_Byte_Diff`: Absolute difference between consecutive payloads of the same CAN ID (separates static spoofing from random fuzzing).
- `DLC_Anomaly_Flag`: Binary flag indicating if the DLC differs from the historical mode for that CAN ID.

**CRITICAL FINDING — Temporal Leakage Avoidance:**
During initial testing, standard random 80/20 train/test splitting yielded an artificially inflated accuracy of ~99.9%. We explicitly identified this as **temporal leakage**: because our features (like rolling-window frequency and time-deltas) rely on neighboring chronological rows, random sampling allows the model to "peek" into the context of test anomalies via surrounding training rows. 
To ensure honest, real-world edge metrics, we implemented a **strict chronological split**: we sorted each file by timestamp, training on the first 80% of the timeline, and testing strictly on the unseen, contiguous *future* 20% of the timeline. 

**Model Architecture:**
We utilized a `RandomForestClassifier` with `class_weight='balanced'`. In comparative testing on the strict temporal split, this native class-weighting outperformed synthetic oversampling (SMOTE) which distorted the chronological test distribution.

═══════════════════════════════════════════════
## 7. RESULTS
═══════════════════════════════════════════════

*All metrics reported against the strict chronological hold-out test set.*

| Metric | Value |
| :--- | :--- |
| **Accuracy** | 70.08% |
| **Macro F1 Score** | 75.85% |
| **Model Size** | 8.5 MB |
| **Inference Latency** | 0.11 ms |
| **ONNX Parity** | 100% Match |

### Per-Class Performance
| Class | Precision | Recall | F1 Score |
| :--- | :--- | :--- | :--- |
| **Normal (0)** | 0.9723 | 0.9635 | 0.9679 |
| **DoS (1)** | 0.6908 | 0.7118 | 0.7011 |
| **Fuzzy (2)** | 0.6372 | 0.6207 | 0.6288 |
| **Spoofing (3)** | 0.7375 | 0.7350 | 0.7362 |

**Interpretation:**
The model achieves highly reliable binary attack detection (Normal vs Anomalous) with an F1 score of ~96.79% for Normal traffic. This is the most safety-critical function (identifying that *something* malicious is occurring). Distinguishing between specific attack subtypes (DoS vs Fuzzy vs Spoofing) without temporal leakage is a significantly harder challenge, operating in the 62-73% F1 range. We present these numbers as an honest reflection of edge-deployment realities on legacy CAN architectures.

═══════════════════════════════════════════════
## 8. FULL CONFUSION MATRIX
═══════════════════════════════════════════════

*(Strict Temporal Split)*
| Actual \ Predicted | Normal | DoS | Fuzzy | Spoofing |
| :--- | :--- | :--- | :--- | :--- |
| **Normal** | 1927 | 0 | 73 | 0 |
| **DoS** | 0 | 10677 | 3040 | 1283 |
| **Fuzzy** | 55 | 2993 | 9310 | 2642 |
| **Spoofing** | 0 | 1787 | 2188 | 11025 |

═══════════════════════════════════════════════
## 9. DASHBOARD 
═══════════════════════════════════════════════

![EdgeGuard Dashboard](docs/screenshot.png)

═══════════════════════════════════════════════
## 10. SETUP & RUN INSTRUCTIONS
═══════════════════════════════════════════════

### Option A: Quick Start (Packaged App)
Currently in development. Check the Releases tab for pre-compiled standalone `.exe` distributions.

### Option B: Full Local Development Setup

**1. Clone and download dataset**
```bash
git clone <repository_url>
cd EdgeGuard
```
Download the HCRL dataset and place it in the `data/` folder. Refer to `data/README.md` for exact links and folder structure.

**2. Retrain ML Model (Optional)**
```bash
cd ml-sidecar
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python proper_temporal_test.py
python export_onnx.py
```

**3. Run Spring Boot Backend**
```bash
cd backend
./mvnw spring-boot:run
```
*(Backend runs on `localhost:8080` and exposes STOMP websockets at `/ws/alerts`)*

**4. Run React Frontend**
```bash
cd frontend
npm install
npm run dev
```
*(Dashboard accessible at `http://localhost:5173`)*

### Option C: Build the Electron Installer
```bash
cd desktop
npm install
npm run build
```

═══════════════════════════════════════════════
## 11. PROJECT STRUCTURE
═══════════════════════════════════════════════

```text
EdgeGuard/
├── backend/            # Spring Boot Java 21 app (ONNX inference & STOMP stream)
├── data/               # HCRL CAN bus dataset (CSVs)
├── desktop/            # Electron packaging wrapper
├── docs/               # Screenshots and documentation assets
├── frontend/           # React 18 + Vite NSOC Dashboard (Tailwind + Recharts)
└── ml-sidecar/         # Python training pipeline and scikit-learn feature extraction
```

═══════════════════════════════════════════════
## 12. KNOWN LIMITATIONS & FUTURE WORK
═══════════════════════════════════════════════

- **Attack Sub-classification:** Attack-subtype classification accuracy has room for improvement (62-73% F1). Future work involves deploying sequence-based models (LSTM) or graph-based approaches to capture inter-message context better than row-level features.
- **Hardware Validation:** Currently validated on the HCRL benchmark dataset; real-world ECU deployment would require validation on live vehicle hardware.
- **Vehicle-Specific Tuning:** This is a generalized single-vehicle model. A production system might benefit from per-vehicle-model fine-tuning to adapt to specific OEM CAN ID structures.

═══════════════════════════════════════════════
## 13. ACKNOWLEDGMENTS
═══════════════════════════════════════════════

Dataset provided by the **Hacking and Countermeasure Research Lab (HCRL)** at Korea University. 

═══════════════════════════════════════════════
## 14. LICENSE
═══════════════════════════════════════════════

This project is licensed under the MIT License - see the LICENSE file for details.
