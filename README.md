<div align="center">

# ≡ƒ¢í∩╕Å EdgeGuard ΓÇö Offline Edge-AI Intrusion Detection System for Automotive CAN Networks
### *Standalone Embedded Machine Learning Pipeline & NSOC Portal for Zero-Day Vehicle Cyberattack Detection*

[![Domain](https://img.shields.io/badge/Domain-Automotive%20Security-dc2626?style=for-the-badge&logo=shield&logoColor=white)](#) [![Protocol](https://img.shields.io/badge/Protocol-CAN%20Bus%202.0B-004080?style=for-the-badge&logo=circuitverse&logoColor=white)](#) [![ML Engine](https://img.shields.io/badge/ML%20Engine-LightGBM%20%2F%20Edge-10b981?style=for-the-badge&logo=scikitlearn&logoColor=white)](#) [![Latency](https://img.shields.io/badge/Latency-Sub-5ms%20Inference-f59e0b?style=for-the-badge&logo=speedtest&logoColor=white)](#) [![License](https://img.shields.io/badge/License-Strict%20Proprietary-dc2626?style=for-the-badge&logo=lock&logoColor=white)](#)

<p align="center">
  <a href="https://github.com/Tharun4743/EdgeGuard">≡ƒôª <b>Official GitHub Repository</b></a>
  
  
</p>

</div>

---

## 1. ≡ƒôî Problem Statement & Context
Connected vehicles and autonomous driving platforms communicate internally via Controller Area Network (CAN) bus protocols, introducing critical cybersecurity vulnerabilities:

* ≡ƒöô **Zero Inherent Encryption or Authentication:** CAN messages contain no cryptographic signatures or sender verification. Any compromised ECU (or rogue OBD-II dongle) can broadcast arbitrary commands.
* ≡ƒÜù **Catastrophic Physical Hijacking Risks:** Attackers injecting forged CAN frames can remotely override steering systems, kill engine acceleration, or disable braking mechanisms at highway speeds.
* ΓÅ▒∩╕Å **Sub-Millisecond Attack Dynamics:** Vehicle bus floods (Denial-of-Service) overwhelm vehicle microcontrollers within milliseconds, making cloud-based detection unviable.
* ≡ƒô┤ **Cellular Dead Zone Vulnerability:** Vehicles frequently travel through tunnels and remote rural highways where cloud security monitoring is completely unreachable.

---

## 2. ≡ƒöì Existing Solutions & Critical Gaps
| Automotive Defense Metric | Legacy In-Vehicle Gateways | Cloud Telematics Security | ≡ƒ¢í∩╕Å EdgeGuard On-Device IDS |
| :--- | :---: | :---: | :---: |
| **Detection Latency** | ΓÜá∩╕Å Rule Checks (10ΓÇô50ms) | Γ¥î High Cloud Lag (>2000ms) | Γ£à Sub-5ms Real-Time Edge Inference |
| **Zero-Day Anomaly Detection**| Γ¥î Static Filter Rules Only | ΓÜá∩╕Å Cloud Analytics Only | Γ£à Quantized Machine Learning (LightGBM) |
| **Offline Tunnel Operation** | Γ£à Offline (Rigid Rules) | Γ¥î Complete Security Blackout | Γ£à 100% Offline Edge Intelligence |
| **Message Timing & Entropy Check**| Γ¥î None | ΓÜá∩╕Å Aggregated Metrics | Γ£à Microsecond Inter-Arrival Telemetry |
| **NSOC Real-Time Visualizer** | Γ¥î None | ΓÜá∩╕Å Delayed Batch Reports | Γ£à Live WebSocket Telemetry Dashboard |

### ΓÜá∩╕Å Critical Limitations of Existing Alternatives:
* ≡ƒÜ½ **Bypassable Static Firewalls:** Simple whitelist firewalls fail when attackers inject malicious payloads using legitimate arbitration IDs.
* ≡ƒ¢æ **Dangerous Cloud Dependency:** Routing vehicular CAN packets to cloud servers introduces unacceptable latency that could result in fatal crashes.
* ≡ƒô┤ **Absence of Forensic Visualizers:** Vehicle maintenance teams lack intuitive tools to inspect historical bus flood anomalies after an attack occurs.

---

## 3. ≡ƒÆí Proposed Solution & Architectural Innovation
**EdgeGuard** is an edge-native automotive intrusion detection system (IDS) and Network Security Operations Center (NSOC) visualizer engineered for **automotive CAN networks**:

* ≡ƒ¢í∩╕Å **Sub-5ms Edge ML Inference:** Lightweight, quantized anomaly detection pipeline (LightGBM) executing directly on embedded vehicle microcontrollers (Raspberry Pi / ECUs).
* ΓÅ▒∩╕Å **Microsecond Message Frequency Analysis:** Continuously evaluates arbitration ID inter-arrival timing, byte-level payload entropy, and cyclic transmission regularity to identify DoS floods, fuzzing, and impersonation attacks.
* ≡ƒöÆ **100% Offline Operational Independence:** Protects vehicle passengers completely without requiring internet access or cloud telematics connections.
* ≡ƒôè **Automotive NSOC Diagnostic Visualizer:** Real-time dashboard rendering live CAN bus message velocity, anomaly threat scores, and compromised ECU arbitration IDs.
* ≡ƒÜù **Seamless OBD-II / CAN Transceiver Interfacing:** Designed to interface directly with physical vehicle buses via SocketCAN and MCP2515 hardware transceivers.

---

## 4. ΓÜÖ∩╕Å Technical Approach & System Architecture

### ≡ƒôÉ High-Level Architectural Flowchart:
```mermaid
graph TD
    CAN["Vehicle Controller Area Network (CAN 2.0B)"] --> Hardware["MCP2515 Transceiver & SocketCAN Driver"]
    Hardware --> Rolling["Rolling Window Timing & Entropy Extractor"]
    Rolling --> Model["Quantized LightGBM Edge Machine Learning"]
    Model --> Detector["Bus Flood, Fuzzing & Spoof Classifier"]
    Detector --> NSOC["Vehicle NSOC Real-Time Telemetry Dashboard"]
```

| Security Pipeline | Technologies Used | Functional Capability |
| :--- | :--- | :--- |
| **Bus Sniffer & Adapter** | Python `can` library, SocketCAN, MCP2515 | Intercepts raw CAN 2.0B frames from vehicle OBD-II diagnostic ports |
| **Feature Extraction Engine** | NumPy, Rolling Window Processor | Extracts inter-frame arrival deltas, payload entropy, and arbitration frequency |
| **Quantized Edge ML Model** | LightGBM, Scikit-Learn | Evaluates feature vectors in sub-5ms cycles with low memory consumption |
| **NSOC Telemetry Portal** | React, WebSockets, Tailwind CSS | Displays live vehicle bus utilization, alert logs, and flagged ECUs |

### ≡ƒöä End-to-End Operational Lifecycle Workflow:
```mermaid
flowchart LR
    A["1. High-Frequency CAN Frame Ingestion"] --> B["2. Inter-Arrival Delta Extraction"]
    B --> C["3. Quantized Model Inference (<5ms)"]
    C --> D["4. Anomaly Decision & Threat Tagging"]
    D --> E["5. Real-Time NSOC Dashboard Alert"]
```

1. **Frame Ingestion:** Hardware transceiver taps into CAN bus ΓåÆ Ingests high-frequency arbitration frames at 500 kbps.
2. **Feature Extraction:** Rolling window processor computes time deltas and byte entropy between sequential messages.
3. **Edge Anomaly Scoring:** Quantized LightGBM model evaluates incoming vectors ΓåÆ Flags unauthorized message injection in under 5ms ΓåÆ Triggers NSOC visual alert.

---

## 5. ≡ƒôê Quantifiable Impact & Measurable Benefits
* ΓÅ▒∩╕Å **Sub-Millisecond Threat Detection:** Detects bus flood attacks before physical vehicle actuators can be compromised.
* ≡ƒöÆ **100% Offline Edge Operation:** Protects vehicles completely without requiring internet or cloud connectivity.
* ≡ƒ¢í∩╕Å **Critical Automotive Defense:** Protects driver and passenger lives from remote vehicle takeover attacks.
* ≡ƒÜù **Standardized CAN Compatibility:** Operates across standard automotive CAN 2.0B protocols without altering factory ECU firmware.

---

## 6. ≡ƒÜÇ Feasibility, Operational Viability & Scalability
* ≡ƒö¼ **Technical Feasibility:** Designed to interface directly with standard OBD-II ports and automotive CAN transceivers (MCP2515).
* ≡ƒÆ░ **Economic & Financial Viability:** Low-cost edge deployment allows vehicle manufacturers to integrate IDS security for a fraction of current telematics costs.
* ≡ƒÅ¢∩╕Å **Operational Governance:** Passive bus sniffing introduces zero electrical or latency interference to critical vehicle braking and steering systems.
* ≡ƒôê **Horizontal Scalability Roadmap:** Easily deployable across commercial automotive fleets, electric vehicles, and autonomous test platforms.

---

## 7. ≡ƒæ¿ΓÇì≡ƒÆ╗ Author & Intellectual Property License

### Lead Architect & Author
**Tharunkumar K** ([@Tharun4743](https://github.com/Tharun4743))
* ≡ƒÄô B.Tech Information Technology ΓÇó V.S.B. Engineering College, Karur
* ≡ƒîÉ [GitHub Profile](https://github.com/Tharun4743) ΓÇó [LinkedIn](https://linkedin.com/in/tharunkumark4743) ΓÇó [Personal Portfolio](https://tharunkumark4743.netlify.app)

### ≡ƒöÆ Proprietary License Notice (All Rights Reserved)
> [!CAUTION]
> **PROPRIETARY & CONFIDENTIAL INTELLECTUAL PROPERTY**
> 
> All rights reserved. This repository, its architecture, source code, workflows, firmware, and associated documentation are the exclusive intellectual property of **Tharunkumar K**.
> 
> **No entity, organization, or individual is permitted to copy, modify, distribute, publish, commercially exploit, reverse engineer, or deploy any portion of this project without express, prior written permission from the author.**
> 
> **Copyright ┬⌐ 2026 Tharunkumar K. All Rights Reserved.**

<!-- =========================================================================
   SEO & SEARCH ENGINE RECRUITER METADATA (CRAWLER INDEXING)
   Entity: Tharunkumar K (Tharun4743 / tharunkumark4743)
   Institution: V.S.B. Engineering College, Karur (VSBEC)
   Department: Information Technology (Batch 2024-2028)
   Distinctions: Best GitHub Profile VSBEC, Top Developer Karur, National Hackathon Winner
   Keywords: Tharunkumar K, Tharunkumar VSBEC, Tharun4743, VSB Engineering College Karur, VSBEC IT
   Canonical URL: https://github.com/Tharun4743/EdgeGuard
========================================================================= -->