<!-- SABAREESH COPYRIGHT NOTICE START -->

> **Copyright © 2026 Sabareesh M (@saba1207B). All Rights Reserved.**
>
> Original work in this repository is protected by copyright.
> No public license is granted for that original work.
> Unauthorized copying, modification, redistribution, commercial use,
> or AI/ML training use is prohibited without prior written permission.
>
> See [COPYRIGHT](COPYRIGHT) and [LICENSE](LICENSE).
>
> **Third-party materials remain subject to their respective licenses.**

<!-- SABAREESH COPYRIGHT NOTICE END -->

⚠️ STRICT COPYRIGHT NOTICE — ALL RIGHTS RESERVED
Copyright © 2026 Sabareesh M (saba1207B)

This repository is NOT open source.
Unauthorized copying, redistribution, modification, or use of any code, text, or materials from this repository is strictly prohibited.

Especially forbidden:

Copying or adapting any program/project for submission as your own work

Sharing or redistributing the code

Using any content for AI / machine learning training or generation

This repository is public only so that authorized mentors can review progress.
Full legal terms: LICENSE | COPYRIGHT | AI_INSTRUCTION.md

---

# VoxDefend
### Real-Time Voice Deepfake Detection & Prevention System

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue.svg)](https://sih.gov.in)
[![Problem Statement ID](https://img.shields.io/badge/Problem%20Statement-26104-indigo.svg)](https://sih.gov.in)
[![Compliance](https://img.shields.io/badge/Compliance-DPDP%20Act%202023%20%7C%20CERT--In-emerald.svg)](#privacy--compliance)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](#license)

**VoxDefend** is a production-grade cybersecurity Security Operations Center (SOC) dashboard designed to detect and prevent AI-generated voice cloning, deepfake audio synthesis, and executive impersonation attacks in real time across enterprise and banking telephony networks.

Developed for **Smart India Hackathon 2026 Problem Statement 26104**: *"AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks"*.

---

## 📑 Table of Contents
- [Key Features & Capabilities](#key-features--capabilities)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Quick Start & Local Deployment](#quick-start--local-deployment)
- [How to Use the Application (Step-by-Step)](#how-to-use-the-application-step-by-step)
  - [1. Executive Dashboard](#1-executive-dashboard)
  - [2. Live Voice Detection (Microphone & DSP Probe)](#2-live-voice-detection-microphone--dsp-probe)
  - [3. Audio File Analysis (Upload & Forensics)](#3-audio-file-analysis-upload--forensics)
  - [4. Real-Time Call Monitor](#4-real-time-call-monitor)
  - [5. Threat Intelligence & Cross-Call Correlation](#5-threat-intelligence--cross-call-correlation)
  - [6. Detection History & Export](#6-detection-history--export)
  - [7. Enterprise Analytics](#7-enterprise-analytics)
  - [8. Trusted Voices (Biometric Directory)](#8-trusted-voices-biometric-directory)
  - [9. Alert Center & Incident Triage](#9-alert-center--incident-triage)
  - [10. System Status & Health Telemetry](#10-system-status--health-telemetry)
  - [11. SIH 2026 Demo Mode](#11-sih-2026-demo-mode)
  - [12. Adaptive Security Policies & DPDP Ledger](#12-adaptive-security-policies--dpdp-ledger)
- [SIH 3-Minute Presentation Demo Guide](#sih-3-minute-presentation-demo-guide)
- [Privacy & Compliance (DPDP Act 2023)](#privacy--compliance)
- [API Reference](#api-reference)

---

## 🚀 Key Features & Capabilities

* **Multi-Signal Fusion Engine (7 Defense Signals)**:
  1. *Synthetic Speech Probability*: Neural vocoder phase smearing and mathematical artifact detection.
  2. *Speaker Identity Match*: Biometric cosine similarity comparison against enrolled voiceprints.
  3. *Vocoder Artifact Detection*: High-frequency spectral discontinuities (>7.8 kHz band).
  4. *Spectral Anomaly*: Unnatural brickwall rolloff and frequency truncation.
  5. *Prosody Consistency*: F0 pitch micro-tremors (human jitter $0.5\%-1.5\%$ vs. robotic TTS $<0.2\%$).
  6. *Loudspeaker Replay Transducer Analysis*: Total Harmonic Distortion (THD) and room impulse response echo tails.
  7. *Voice Authenticity Score*: Biological vocal envelope genuineness index.
* **Dual-Verification Architecture**:
  * Independently evaluates **Voice Authenticity** (Is this audio human or AI?) vs. **Speaker Identity** (Is this the claimed executive, or an unauthorized person?).
* **Real-Time DSP Visualizer**:
  * Direct in-browser Web Audio API processing (`AudioContext`, `AnalyserNode`, 256-bin FFT spectrum, live waveform oscilloscope).
* **Automated Defense Interlocks**:
  * Automated core banking transaction freezes (RTGS / NEFT approvals), Out-of-Band PSTN callback challenges, and SIP trunk quarantine.
* **Offline Audio File Forensics**:
  * Drag-and-drop analysis for `.wav`, `.mp3`, `.m4a`, and `.flac` with in-browser waveform playback.
* **Indian Language Prosody Normalization**:
  * Calibrated for 8 Indian languages (Hindi, English, Tamil, Telugu, Kannada, Bengali, Marathi, Malayalam) to eliminate false positives caused by regional cadence differences.
* **Tamper-Proof Audit Ledger**:
  * Cryptographic blockchain-style SHA-256 block ledger complying with the **Digital Personal Data Protection (DPDP) Act 2023** and **CERT-In** directions.

---

## 🏛 System Architecture

```
                          ┌────────────────────────────────────────────────────────┐
                          │            Incoming Audio / Telephony Stream           │
                          └──────────────────────────┬─────────────────────────────┘
                                                     │
                                   ┌─────────────────┴─────────────────┐
                                   ▼                                   ▼
                   ┌───────────────────────────────┐   ┌───────────────────────────────┐
                   │    Web Audio API / DSP Engine │   │   Biometric Voiceprint Match  │
                   │  - 256-bin FFT Spectrum       │   │  - Cosine Distance vs Profile │
                   │  - F0 Glottal Micro-Jitter    │   │  - Enrolled Executive Samples │
                   │  - Vocoder Phase Smearing     │   │  - Voiceprint Drift Tracking  │
                   └───────────────┬───────────────┘   └───────────────┬───────────────┘
                                   │                                   │
                                   └─────────────────┬─────────────────┘
                                                     ▼
                                   ┌───────────────────────────────────┐
                                   │  Multi-Signal Mathematical Fusion │
                                   │  (Risk = (100-Auth)*0.40 + ... )  │
                                   └─────────────────┬─────────────────┘
                                                     ▼
                                   ┌───────────────────────────────────┐
                                   │    Google Gemini 3.8 Flash LLM    │
                                   │   Forensic Reasoning & Dialect    │
                                   └─────────────────┬─────────────────┘
                                                     ▼
                 ┌───────────────────────────────────┴───────────────────────────────────┐
                 ▼                                   ▼                                   ▼
  ┌───────────────────────────────┐   ┌───────────────────────────────┐   ┌───────────────────────────────┐
  │      Automated Interlock      │   │  SHA-256 Tamper-Proof Ledger  │   │     Enterprise SOC Console    │
  │ - Freeze RTGS/NEFT approvals  │   │ - Cryptographic block hashes  │   │ - Live Waveform HUD           │
  │ - Mandate Out-of-band Callback│   │ - Zero-retention raw audio    │   │ - Incident triage & analytics │
  └───────────────────────────────┘   └───────────────────────────────┘   └───────────────────────────────┘
```

---

## 🧠 Machine Learning Pipeline & Current Training State

* **Audio Input Contract**: 16 kHz mono, exactly 48,000 samples (3.0-second context).
* **Feature Extraction**: 80-band Log-Mel spectrogram `[B, 1, 80, 301]` with `center=True` reflection padding.
* **Model Architecture**: Light-CNN-9 (LCNN-9) with Max-Feature-Map (MFM) activation and raw logit output.
* **Training Pipeline**: Prepared for ASVspoof 2019 Logical Access (LA) partition with training-only augmentations (SpecAugment, G.711 codec simulation, additive noise, volume gain jitter) and deterministic validation.
* **Calibration**: Platt scaling infrastructure prepared on held-out development partition (`theta_human`, `theta_synthetic`, `theta_eer`).
* **Acoustic Replay Separation**: Replay detection is an independent acoustic transducer resonance detector, decoupled from AI/synthetic speech detection.
* **Current Status**:
  - Model training has **NOT yet been performed**.
  - Real model accuracy and performance have **NOT yet been established**.
  - All offline preparation checks, tensor contracts, and ONNX opset 17 export logic are verified and ready for training (e.g., on an RTX 4070 or Google Colab T4).

---

## 📦 Prerequisites

* **Node.js**: v18.0.0 or higher (v20+ recommended).
* **Package Manager**: `npm` (v9+ or v10+).
* **Modern Web Browser**: Google Chrome, Microsoft Edge, Brave, or Mozilla Firefox with microphone permissions enabled.
* **Gemini API Key (Optional)**: A Google Gemini API key can be placed in `.env` for deep LLM forensic reasoning. If omitted, the deterministic DSP heuristic engine functions automatically.

---

## ⚡ Quick Start & Local Deployment

### 1. Clone or Open the Repository
```bash
cd VOCALSHIELD-AI-main
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (or verify existing `.env`):
```env
# Optional - Gemini API Key (Heuristic DSP fallback works automatically if empty)
GEMINI_API_KEY=

# Local server configuration
APP_URL=http://localhost:3000
PORT=3000
```

### 3. Install Dependencies
On Windows (PowerShell):
```powershell
npm.cmd install
```
On macOS / Linux:
```bash
npm install
```

### 4. Start the Application
On Windows (PowerShell):
```powershell
npm.cmd run dev
```
On macOS / Linux:
```bash
npm run dev
```

The application will start on:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🖥 How to Use the Application (Step-by-Step)

The user interface is organized into a persistent **Left Sidebar** with 12 specialized operational modules, backed by an instant **Global Feature Omnisearch** system to jump to any tool without scrolling:

### 🔍 Global Feature Search & Omnisearch (No-Scroll Quick Jump)
* **Problem Solved**: Eliminates the need to scroll through long pages or navigate deeply nested menus.
* **How to Access**:
  * **Top Header**: Click the prominent **Search Field** or **Search Button** located in the top navigation bar.
  * **Sidebar**: Click the **Search features...** button at the top of the sidebar.
  * **Floating Quick Search**: Click the blue **Search Features (Ctrl K)** floating pill in the bottom-right corner from *any* scroll position.
  * **Keyboard Shortcut**: Press `Ctrl + K` (or `Cmd + K` on Mac) or press `/` from anywhere in the app.
* **Capabilities**:
  * Real-time fuzzy filtering across all 25+ features, tools, reports, test scenarios, actions, and settings.
  * Category quick-filter tabs: `All`, `Operations`, `Live Audio`, `Forensics`, `Telephony`, `Intelligence`, `Biometrics`, `Governance`, `Demo Scenarios`, `Actions & Tools`.
  * Keyboard navigation: `↑` and `↓` arrow keys to browse, `ENTER` to immediately jump, `ESC` to close.

### 1. Executive Dashboard
* **Purpose**: High-level Security Operations Center (SOC) overview.
* **Features**:
  * **Protection Hero Banner**: Shows `PROTECTION ACTIVE` and current defense posture.
  * **5 Operational KPI Cards**: Calls Analysed (`1,420`), Threats Detected (`28`), Suspicious Sessions (`42`), Average Confidence (`97.4%`), and Average Latency (`184 ms`).
  * **Quick Launchers**: Quickly navigate to Live Detection, Upload an Audio File, or simulate an inbound call attack.
  * **Recent Detection Stream**: Real-time feed of recent calls and enforcement actions.

### 2. Live Voice Detection (Microphone & DSP Probe)
* **Purpose**: Real-time microphone listening, live waveform oscilloscope, and telephony stream interception.
* **How to Use**:
  1. Click **Live Detection** in the sidebar.
  2. Use the top toggle to choose between:
     * **Telephony Live HUD**: Inspects incoming telephony streams, shows caller identity, dynamic risk gauge, and defense action buttons.
     * **Microphone & DSP Probe**: Directly captures microphone audio from your browser.
  3. Click **START MONITORING** to activate your microphone.
  4. Speak into your microphone:
     * The **Canvas Oscilloscope** will animate with real-time FFT frequency bars.
     * Real-time DSP metrics update live: RMS Volume, Estimated Pitch (F0), Micro-Jitter (%), and Spectral Centroid (Hz).
     * The **6 State Badges** reflect system status: `MICROPHONE ACTIVE` → `LISTENING` → `ANALYSING` → `SAFE` / `SUSPICIOUS` / `HIGH RISK`.
  5. **No-Mic Demo Path**: If you are in a noisy hackathon hall or do not have a microphone connected, click any of the 4 **No-Mic Demo Clips** (e.g. *Zero-Shot AI Cloned Executive*, *Loudspeaker Replay Attack*) to run instant acoustic waveforms and classifications.

### 3. Audio File Analysis (Upload & Forensics)
* **Purpose**: Inspect pre-recorded call recordings or audio evidence files.
* **How to Use**:
  1. Click **Audio Analysis** in the sidebar.
  2. Drag and drop any `.wav`, `.mp3`, `.m4a`, or `.flac` audio file into the dashed drop zone, or click to browse.
  3. *(Alternative)* Click any of the **Instant Test Samples** on the right side if you don't have an audio file ready.
  4. Click **RUN FORENSIC SCAN**.
  5. Review the comprehensive forensic report:
     * Primary verdict: **`REAL / HUMAN`** vs **`SYNTHETIC / AI GENERATED`**
     * Composite Risk Score (0 - 100) and Confidence percentage
     * Acoustic indicator list detailing why the audio passed or failed.

### 4. Real-Time Call Monitor
* **Purpose**: Enterprise telephony surveillance console showing live inbound calls.
* **How to Use**:
  1. Click **Call Monitor** in the sidebar.
  2. Use the search bar to filter by session ID (e.g. `CALL-1042`), caller name, or phone number.
  3. Click status filter pills (`All`, `Safe`, `Suspicious`, `High Risk`, `Critical`).
  4. Click **Investigate** on any high-risk call to open the inspection modal and view carrier routing.

### 5. Threat Intelligence & Cross-Call Correlation
* **Purpose**: Identifies recurring fraud syndicates targeting multiple corporate treasury desks.
* **Features**:
  * Correlates common acoustic clone signatures across multiple separate phone numbers.
  * Visualizes cross-call match clusters and coordinated attack campaigns.

### 6. Detection History & Export
* **Purpose**: Historical audit trail of all completed voice inspections.
* **How to Use**:
  1. Click **Detection History** in the sidebar.
  2. Filter by detection result: `Human`, `Synthetic`, `Suspicious`, `Verified`, `Identity Mismatch`.
  3. Click column headers (`Timestamp`, `Risk Score`) to sort entries.
  4. Click **EXPORT JSON** to download the complete audit trail as a machine-readable JSON file.

### 7. Enterprise Analytics
* **Purpose**: SOC executive reporting and attack vector distribution.
* **Features**:
  * Attack vector breakdown (Neural Voice Cloning, Audio Replay, Spliced Audio, Genuine Speech).
  * Regional Indian Language cadence distribution.
  * Telephony carrier route risk profiles.

### 8. Trusted Voices (Biometric Directory)
* **Purpose**: Manages enrolled biometric identities for authorized executives.
* **How to Use**:
  1. Click **Trusted Voices** in the sidebar.
  2. View enrolled profiles (CFO, CEO, Joint Secretary, Treasury Director).
  3. Inspect biometric hashes, sample counts, and match confidence.
  4. Use the **Re-enroll** button to calibrate new voice samples or **Disable** to revoke access.

### 9. Alert Center & Incident Triage
* **Purpose**: Security incident queue for SOC operators.
* **How to Use**:
  1. Click **Alerts** in the sidebar.
  2. Filter by severity: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
  3. Manage status transitions: `Investigate`, `Resolve`, or flag as `False Positive` to train the offline benchmark dataset.

### 10. System Status & Health Telemetry
* **Purpose**: Real-time service health console consuming `/api/health`.
* **Features**:
  * Live status for Detection Engine, Speaker Verification, Audio DSP Processor, API Gateway, and Database Store.
  * Real-time latency tracking against the 250ms telephony SLA.

### 11. SIH 2026 Demo Mode
* **Purpose**: Tailored for the 3-minute jury presentation.
* **Features**:
  * 4 curated scenarios:
    1. **Cloned CFO RTGS Wire Fraud** (Synthetic Voice + Urgency)
    2. **Government Authority Coercion** (Cloned IAS Officer)
    3. **Genuine Executive Passthrough** (Authentic Human Speech)
    4. **Inconclusive Low-Quality Audio** (Degraded 2G fail-safe)
  * Step-by-step trigger button that auto-arms the interception engine.

### 12. Adaptive Security Policies & DPDP Ledger
* **Purpose**: Security threshold tuning and governance.
* **Features**:
  * Configure auto-lock risk thresholds (e.g. 70%) and quarantine thresholds (e.g. 85%).
  * Inspect the cryptographic SHA-256 blockchain audit ledger blocks.

---

## 🏆 SIH 3-Minute Presentation Demo Guide

When presenting to Smart India Hackathon evaluators, follow this recommended sequence:

1. **Minute 1: Executive Overview (The Problem)**
   * Open the **Main Dashboard**. Point out the `● PROTECTION ACTIVE` status and explain the 5 operational statistics.
   * Explain Problem 26104: Criminal syndicates use zero-shot AI voice cloning (ElevenLabs, XTTS) to impersonate CFOs and extort urgent wire transfers.
2. **Minute 2: Live Detection & Attack Interlock (The Solution)**
   * Click **SIH Demo Mode** and select **Demo 1: Cloned CFO RTGS Wire Fraud**.
   * Switch to **Live Detection**. Show the live waveform reacting in real time.
   * Highlight the **Unified 7-Signal Detection Panel**:
     * Synthetic Speech: `96%`
     * Micro-Jitter: `<0.14%` (robotic suppression)
     * Speaker Match: `61%` (mismatch against enrolled CFO voiceprint)
   * Point out the **Active Defense Interlock**: Core banking RTGS approvals are automatically frozen.
3. **Minute 3: Explainable AI & Compliance (The Value)**
   * Point out the **Chronological Live Timeline** (`00:00` → `00:13`) showing step-by-step forensic attribution.
   * Highlight the **Speaker Verification Card**: Explain why Voice Authenticity (real speech) is separated from Speaker Identity (authorized user).
   * Show the **Privacy Mode Card**: Reassure judges that under the DPDP Act 2023, raw biometric audio is discarded immediately, with only one-way mathematical embeddings stored.

---

## 🔒 Privacy & Compliance

VoxDefend was designed from the ground up to comply with Indian cybersecurity regulations:
* **DPDP Act 2023 (Digital Personal Data Protection Act)**:
  * **Zero-Retention Principle**: Raw voice audio is held only in a volatile circular RAM buffer during inference and is zeroized immediately.
  * **Biometric Privacy**: No raw biometric audio recordings are stored on disk. Only encrypted mathematical cosine embeddings (SHA-256 / AES-GCM-256) are preserved.
* **CERT-In Compliance (Directions under Section 70B)**:
  * All detection events, threat levels, and operator interventions are recorded in a cryptographically chained audit ledger with immutable SHA-256 block hashes.

---

## 🔌 API Reference

The Node.js Express server exposes the following RESTful endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns service health, timestamp, and AI readiness. |
| `POST` | `/api/analyze-voice` | Main forensic engine: DSP extraction + Gemini multimodal reasoning. |
| `POST` | `/api/analyze-audio` | Audio file upload inspection endpoint. |
| `POST` | `/api/verify-speaker` | Cosine similarity speaker verification against enrolled profiles. |
| `GET` | `/api/audit-ledger` | Fetches immutable blockchain audit ledger blocks. |
| `POST` | `/api/audit-log` | Appends a new verified event block to the ledger. |
| `POST` | `/api/feedback` | Records operator false-positive feedback for offline model retraining. |
| `POST` | `/api/analyst-reviews` | Human-in-the-loop analyst review submission. |
| `POST` | `/api/pluggable-model-analysis` | Standardized ML interface for external models (RawNet3, AASIST, AST). |
| `GET` | `/api/cross-call-intelligence` | Returns multi-call correlation clusters and recurring attacker signatures. |

---

## 🛠 Tech Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Web Audio API.
* **Backend**: Node.js, Express, TypeScript (`tsx`).
* **AI & DSP**: Google GenAI SDK (`@google/genai` with Gemini 3.8 Flash), Web Audio API FFT Analysis, Glottal Micro-Jitter DSP algorithms.
* **Build System**: Vite 6, esbuild.

---

## 📄 License

This project is developed for Smart India Hackathon 2026 under the MIT License.
