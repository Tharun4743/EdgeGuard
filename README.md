# 🛡️ EdgeGuard — Offline Edge-AI Intrusion Detection System for Automotive CAN Networks
### *Standalone Embedded Machine Learning Pipeline & NSOC Dashboard for Zero-Day Vehicle Cyberattack Detection*

<p align="center">
  <a href="https://github.com/Tharun4743/EdgeGuard"><b>📦 GitHub Repository</b></a>
  
</p>

---

## 1. 📌 Problem Statement
Modern connected vehicles, autonomous cars, and electric vehicles communicate internally via the Controller Area Network (CAN) bus. The CAN protocol lacks inherent encryption or sender authentication, leaving vehicles vulnerable to malicious spoofing, DoS injection, and remote braking/steering hijacking attacks.

---

## 2. 🔍 Existing Solutions & Critical Gaps
Cloud-based vehicle security solutions are unviable because automotive cyberattacks happen in milliseconds and vehicles frequently operate in cellular dead zones. Standard rule-based firewalls cannot detect novel zero-day payload anomalies.

---

## 3. 💡 Proposed Solution
EdgeGuard is an edge-native automotive intrusion detection system (IDS) that monitors CAN bus message intervals, arbitration IDs, and payload bytes directly on vehicle microcontrollers. It uses an offline machine learning anomaly detection pipeline to identify DoS attacks, fuzzing attacks, and spoofing injections in sub-millisecond real time.

---

## 4. ⚙️ Technical Approach & System Architecture
* **Machine Learning Pipeline:** Python 3.10+, Scikit-Learn, LightGBM / Isolation Forest trained on automotive CAN bus traffic datasets.
* **Edge Optimization:** Quantized model running in sub-5ms inference cycles suitable for embedded hardware (Raspberry Pi / Jetson Nano / Automotive ECUs).
* **NSOC Dashboard:** Real-time telemetry dashboard visualizing CAN bus traffic rates, anomaly scores, and compromised arbitration IDs.

---

## 5. 📈 Impact & Measurable Benefits
* **Sub-Millisecond Threat Detection:** Detects bus flood attacks before physical vehicle actuators can be compromised.
* **100% Offline Edge Operation:** Protects vehicles completely without requiring internet or cloud connectivity.
* **Critical Automotive Defense:** Protects driver and passenger lives from remote vehicle takeover attacks.

---

## 6. 🚀 Feasibility & Viability Analysis
* **Technical:** Designed to interface directly with standard OBD-II ports and automotive CAN transceivers (MCP2515).
* **Commercial Viability:** High value for EV manufacturers, autonomous fleet operators, and Tier-1 automotive suppliers.

---

## 7. 👨‍💻 Author & Intellectual Property License

### Lead Architect & Author
**Tharunkumar K** ([@Tharun4743](https://github.com/Tharun4743))
* B.Tech Information Technology • V.S.B. Engineering College, Karur
* [GitHub Profile](https://github.com/Tharun4743) • [LinkedIn](https://linkedin.com/in/tharunkumark4743) • [Portfolio](https://tharunkumark4743.netlify.app)

### 🔒 Proprietary License Notice (All Rights Reserved)
> [!CAUTION]
> **PROPRIETARY & CONFIDENTIAL INTELLECTUAL PROPERTY**
> 
> All rights reserved. This repository, its architecture, source code, workflows, firmware, and associated documentation are the exclusive intellectual property of **Tharunkumar K**.
> 
> **No entity, organization, or individual is permitted to copy, modify, distribute, publish, commercially exploit, reverse engineer, or deploy any portion of this project without express, prior written permission from the author.**
> 
> **Copyright © 2026 Tharunkumar K. All Rights Reserved.**
