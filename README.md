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

### 📐 High-Level Architectural Flowchart:
```mermaid
graph TD
    VehicleCAN["Automotive CAN Bus Telemetry (OBD-II / J1939)"] -->|Raw Frame Stream| Ingestion["CAN Frame Ingestion & Normalizer"]
    Ingestion --> Filter["Payload Bitmask & ID Anomaly Filter"]
    Filter --> Model["Quantized Edge-AI Anomaly Classifier (ONNX / TFLite)"]
    Model --> Evaluator{"Zero-Day Intrusion Detected?"}
    Evaluator -->|Yes| AlertEngine["NSOC Incident Dispatcher & Alert Bus"]
    Evaluator -->|No| SafeLog[("Encrypted Local Ring Buffer Log")]
    AlertEngine --> NSOC["Central Automotive Security Operations Dashboard"]
```

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

## 7. 👨‍💻 Engineering Author

<table border="0" itemscope itemtype="https://schema.org/Person">
  <tr>
    <td width="130" align="center" valign="middle">
      <img src="https://github.com/Tharun4743.png" width="105" style="border-radius: 6px;" alt="Tharunkumar K — Full Stack Developer & AI Systems Engineer at V.S.B. Engineering College" title="Tharunkumar K — V.S.B. Engineering College (VSBEC)" itemprop="image" />
    </td>
    <td>
      <h3 itemprop="name">Tharunkumar K</h3>
      <p>
        <b itemprop="jobTitle">Full Stack Developer & AI Systems Engineer</b> | <b>V.S.B. Engineering College (VSBEC)</b><br/>
        🎓 <b>B.Tech in Information Technology</b> — <b>V.S.B. Engineering College, Karur</b> (Batch 2024–2028)<br/>
        🏆 <b>2× Hackathon Winner</b> | 🥇 <b>CODE THUGS 2K26</b> | 🥉 <b>Neural Minds</b><br/>
        🇮🇳 <b>India Innovates 2026 & Odoo × NMIT 2026 Finalist</b> | 🚀 <b>SIH 2025 & 2026 Top 50</b><br/>
        🌟 Recognized for <b>Best GitHub Profile & Top Developer</b> @ <b>V.S.B. ENGINEERING COLLEGE</b>
      </p>
      <p>
        🚀 <b>Top Flagship Engineering Projects:</b><br/>
        • 🏛️ <b>TaskManager (VSBEC IT Vault)</b> — Institutional Task Governance & LeetCode/GitHub Sync &nbsp;<a href="https://github.com/Tharun4743/Taskmanager"><img src="https://img.shields.io/badge/Code-181717?style=flat-square&logo=github&logoColor=white" alt="Code" /></a>&nbsp;<a href="https://it-taskmanager.vercel.app/"><img src="https://img.shields.io/badge/Live_Demo-10B981?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo" /></a><br/>
        • 🧠 <b>AURA</b> — Air-Gapped Local Multimodal RAG Engine & Offline AI Assistant &nbsp;<a href="https://github.com/Tharun4743/AURA"><img src="https://img.shields.io/badge/Code-181717?style=flat-square&logo=github&logoColor=white" alt="Code" /></a><br/>
        • 🪖 <b>Smart Helmet IoT</b> — SIH Top 50 Dual-Unit Motorcycle Accident Prevention System &nbsp;<a href="https://github.com/Tharun4743/AGILE-INNOVATORS-smart-helmet-"><img src="https://img.shields.io/badge/Code-181717?style=flat-square&logo=github&logoColor=white" alt="Code" /></a>
      </p>
      <p>
        <a href="https://tharunkumark4743.netlify.app/"><img src="https://img.shields.io/badge/Portfolio-0284c7?style=flat-square&logo=googlechrome&logoColor=white" alt="Portfolio" /></a>&nbsp;
        <a href="https://github.com/Tharun4743"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" /></a>&nbsp;
        <a href="https://www.linkedin.com/in/tharunkumark4743"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>&nbsp;
        <a href="https://leetcode.com/u/Tharunkumar__K/"><img src="https://img.shields.io/badge/LeetCode-FFA116?style=flat-square&logo=leetcode&logoColor=white" alt="LeetCode" /></a>&nbsp;
        <a href="mailto:tharunkumark42007@gmail.com"><img src="https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
      </p>
    </td>
  </tr>
</table>

<!-- =========================================================================
   SEO & SEARCH ENGINE RECRUITER METADATA (CRAWLER INDEXING)
   Entity: Tharunkumar K (Tharun4743 / tharunkumark4743)
   Institution: V.S.B. Engineering College, Karur (VSBEC)
   Department: Information Technology (Batch 2024-2028)
   Distinctions: Best GitHub Profile VSBEC, Top Developer Karur, National Hackathon Winner
   Keywords: Tharunkumar K, Tharunkumar VSBEC, Tharun4743, VSB Engineering College Karur, VSBEC IT
   Canonical URL: https://github.com/Tharun4743/EdgeGuard
========================================================================= -->
