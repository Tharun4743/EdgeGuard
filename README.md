<div align="center">

# 🛡️ EdgeGuard — Offline Edge-AI Intrusion Detection System for Automotive CAN Networks
### *Standalone Embedded Machine Learning Pipeline & NSOC Dashboard for Zero-Day Vehicle Cyberattack Detection*

[![Domain](https://img.shields.io/badge/Domain-Automotive%20Security-dc2626?style=for-the-badge&logo=shield&logoColor=white)](#) [![Protocol](https://img.shields.io/badge/Protocol-CAN%20Bus%202.0B-004080?style=for-the-badge&logo=circuitverse&logoColor=white)](#) [![ML Pipeline](https://img.shields.io/badge/ML%20Pipeline-LightGBM%20%2F%20Edge-10b981?style=for-the-badge&logo=scikitlearn&logoColor=white)](#)

<p align="center">
  <a href="https://github.com/Tharun4743/EdgeGuard">📦 <b>Official GitHub Repository</b></a>
  
</p>

</div>

---

## 1. 📌 Problem Statement & Context
Modern connected vehicles, autonomous cars, and electric vehicles communicate internally via the Controller Area Network (CAN) bus. The CAN protocol lacks inherent encryption or sender authentication, leaving vehicles vulnerable to malicious spoofing, DoS injection, and remote braking/steering hijacking attacks.

---

## 2. 🔍 Existing Solutions & Critical Gaps
Cloud-based vehicle security solutions are unviable because automotive cyberattacks happen in milliseconds and vehicles frequently operate in cellular dead zones. Standard rule-based firewalls cannot detect novel zero-day payload anomalies.

---

## 3. 💡 Proposed Solution & Architectural Innovation
EdgeGuard is an edge-native automotive intrusion detection system (IDS) that monitors CAN bus message intervals, arbitration IDs, and payload bytes directly on vehicle microcontrollers. It uses an offline machine learning anomaly detection pipeline to identify DoS attacks, fuzzing attacks, and spoofing injections in sub-millisecond real time.

---

## 4. ⚙️ Technical Approach & System Architecture
| Automotive Subsystem | Technology | Security Function |
| :--- | :--- | :--- |
| **Bus Sniffer** | Python `can` library, SocketCAN | Intercepts CAN 2.0B arbitration IDs and 8-byte message payloads |
| **Inference Engine** | LightGBM / Quantized ML Model | Evaluates inter-arrival timing and bitwise entropy in sub-5ms cycles |
| **NSOC Visualizer** | React / WebSockets Dashboard | Displays live vehicle bus utilization, alert logs, and flagged ECUs |

---

## 5. 📈 Quantifiable Impact & Measurable Benefits
* ⏱️ **Sub-Millisecond Threat Detection:** Detects bus flood attacks before physical vehicle actuators can be compromised.
* 🔒 **100% Offline Edge Operation:** Protects vehicles completely without requiring internet or cloud connectivity.
* 🛡️ **Critical Automotive Defense:** Protects driver and passenger lives from remote vehicle takeover attacks.

---

## 6. 🚀 Feasibility, Operational Viability & Scalability
* 🔬 **Technical Feasibility:** Designed to interface directly with standard OBD-II ports and automotive CAN transceivers (MCP2515).
* 💼 **Commercial Viability:** High value for EV manufacturers, autonomous fleet operators, and Tier-1 automotive suppliers.

---

## 7. 👨‍💻 Author & Intellectual Property License

## 👨‍💻 Engineering Author

<table border="0">
  <tr>
    <td width="120" align="center" valign="top">
      <img src="https://github.com/Tharun4743.png" width="100" style="border-radius: 4px;" alt="Tharunkumar K" />
    </td>
    <td>
      <h3>Tharunkumar K</h3>
      <p>
        <b>Full Stack Developer & AI Systems Engineer</b><br/>
        🎓 B.Tech in Information Technology — <a href="https://vsbec.com"><b>V.S.B. Engineering College, Karur</b></a> (Batch 2024–2028)<br/>
        🌟 Recognized for holding the <b>Best GitHub Profile & Top Student Developer</b> at V.S.B. Engineering College (VSBEC)<br/>
        🥇 <b>Winner — Code Thugs 2K26</b> • 🚀 <b>Smart India Hackathon (SIH)</b> Top 50 National Finalist
      </p>
      <p>
        <a href="https://tharunkumark4743.netlify.app/">🌐 Portfolio</a> •
        <a href="https://github.com/Tharun4743">🐙 GitHub (@Tharun4743)</a> •
        <a href="https://www.linkedin.com/in/tharunkumark4743">💼 LinkedIn</a> •
        <a href="https://leetcode.com/u/Tharunkumar__K/">🧩 LeetCode</a> •
        <a href="mailto:tharunkumark42007@gmail.com">📧 Email</a>
      </p>
    </td>
  </tr>
</table>

### 🔒 Proprietary License Notice (All Rights Reserved)
> [!CAUTION]
> **PROPRIETARY & CONFIDENTIAL INTELLECTUAL PROPERTY**
> 
> All rights reserved. This repository, its architecture, source code, workflows, firmware, and associated documentation are the exclusive intellectual property of **Tharunkumar K**.
> 
> **No entity, organization, or individual is permitted to copy, modify, distribute, publish, commercially exploit, reverse engineer, or deploy any portion of this project without express, prior written permission from the author.**
> 
> **Copyright © 2026 Tharunkumar K. All Rights Reserved.**

<!-- =========================================================================
   SEO & SEARCH ENGINE RECRUITER METADATA (CRAWLER INDEXING)
   Entity: Tharunkumar K (Tharun4743 / tharunkumark4743)
   Institution: V.S.B. Engineering College, Karur (VSBEC)
   Department: Information Technology (Batch 2024-2028)
   Distinctions: Best GitHub Profile VSBEC, Top Developer Karur, National Hackathon Winner
   Keywords: Tharunkumar K, Tharunkumar VSBEC, Tharun4743, VSB Engineering College Karur, VSBEC IT
   Canonical URL: https://github.com/Tharun4743/EdgeGuard
========================================================================= -->