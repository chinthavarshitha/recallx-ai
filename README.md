# RECALLX AI — Intelligent Incident Response & Memory Agent

> **"Every Incident Teaches. Every Response Gets Smarter."**

![RECALLX AI](https://img.shields.io/badge/Status-Production%20Ready-315CFF?style=for-the-badge)
![Hindsight Memory](https://img.shields.io/badge/Memory-Hindsight%20v1.2.0-C6FF4D?style=for-the-badge&labelColor=080B12)
![Groq AI](https://img.shields.io/badge/AI-Groq%20LPU%20Llama%203.3-315CFF?style=for-the-badge&labelColor=080B12)
![Python FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20SQLAlchemy-080B12?style=for-the-badge&logo=fastapi)
![React Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-315CFF?style=for-the-badge&logo=react)

---

## 1. Product Vision

**RECALLX AI** is an enterprise-grade AI incident response platform built for SRE, DevOps, and platform engineering teams. 

Unlike ordinary LLM chatbots that treat every outage as an isolated event and force engineers to rediscover the same root causes repeatedly, RECALLX integrates **Vectorize Hindsight** as its biomimetic persistent memory layer. 

By organizing historical incidents, error signatures, stack traces, infrastructure topologies, and verified resolutions into structured memory graphs, RECALLX continuously learns from past incidents and transforms future responses from speculative guessing into evidence-backed remediation.

---

## 2. Design System & Command Center Aesthetic

The user interface follows a modern enterprise SaaS command center aesthetic inspired by Linear, Vercel, and Datadog:

- **Midnight Black (`#080B12`)**: Deep command center canvas.
- **Deep Graphite (`#111827`)**: Frosted glassmorphism panels with 1px border lines.
- **Electric Cobalt Blue (`#315CFF`)**: Primary navigation, AI intelligence indicators, and interactive controls.
- **Acid Lime (`#C6FF4D`)**: High-priority alerts, verified memory retentions, and milestone highlights.
- **Pure White (`#F8FAFC`)**: High-contrast typography and data readouts.
- **Muted Slate (`#8993A4`)**: Secondary telemetry labels and timestamps.
- **Error Red (`#FF4D5D`)**: Critical outage alerts and severity badges.

---

## 3. The 12 Functional Views

1. **Product Landing Page**: Futuristic hero section with animated incident network visualization, interactive demo launcher, and architecture deep dive.
2. **Authentication**: JWT authentication with 1-click Demo Commander access (`commander@recallx.ai`).
3. **Main Dashboard**: Real-time MTTR (-74%), memory recall accuracy (94.2%), severity distributions, and telemetry trend charts.
4. **Incident Command Center**: Full CRUD management, multi-filter search (severity, status), and telemetry file ingestion.
5. **AI Investigation Workspace**: Multi-turn grounded chat, probabilistic root causes, terminal commands, and evidence panels.
6. **AI Learning Demonstration (Hackathon Centerpiece)**: Live Before vs After model execution comparing ungrounded LLM guessing against Hindsight memory recall.
7. **Hindsight Memory Explorer**: Real-time memory bank inventory, audit stream, and interactive Retain/Recall/Reflect sandbox.
8. **Historical Incident Timeline**: Chronological milestone audit stream of past outages and memory retentions.
9. **Root Cause Analysis (RCA)**: Taxonomy catalog tracking recurring failure patterns across microservices.
10. **Resolution Playbook**: Certified engineering knowledge base of battle-tested fixes stored in Hindsight.
11. **Knowledge & Analytics**: MTTR compression curves, service failure density, and knowledge retention metrics.
12. **Team Workspace**: SRE responder on-call rotations and role-based permissions matrix.
13. **Settings & Integrations**: Live Hindsight connection health diagnostics, bank namespace switching, and Groq API key configuration.

---

## 4. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion.
- **Backend**: Python 3.14 / 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, ReportLab PDF Engine.
- **Database**: PostgreSQL (with automated fallback to SQLite for immediate zero-config local evaluation).
- **AI Inference**: Groq API (`llama-3.3-70b-versatile`, `qwen/qwen3-32b`, `openai/gpt-oss-120b`).
- **Memory Layer**: Official **Vectorize Hindsight SDK** (`hindsight-client` v1.2.0).

---

## 5. Quick Start & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Backend Setup

```bash
cd recallx-ai/backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment (optional, defaults to local SQLite + Hindsight)
cp ../.env.example .env

# 3. Start the FastAPI backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend starts at `http://localhost:8000` with interactive OpenAPI docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd recallx-ai/frontend

# 1. Install dependencies
npm install

# 2. Run Vite development server
npm run dev
```

The frontend launches at `http://localhost:5173`.

---

## 6. Verification & Test Suite

All critical workflows have been automated and tested:

```bash
# Run the comprehensive 12-stage integration test suite
python recallx-ai/backend/tests/test_services.py
```

### Verified Test Results:
```
============================================================
RECALLX AI — ENTERPRISE VERIFICATION TEST SUITE
============================================================
[TEST 1] Initializing Database & Seed Telemetry:   [OK]
[TEST 2] Cryptographic Authentication & JWT:      [OK]
[TEST 3] Incident Retrieval & Multi-Filter Query: [OK]
[TEST 4] Incident CRUD Operations:                [OK]
[TEST 5] Hindsight SDK Integration (v1.2.0):      [OK]
[TEST 6] Hindsight Retain & Recall Primitives:    [OK]
[TEST 7] AI Investigation (With vs Without Mem):  [OK]
[TEST 8] Hackathon BEFORE vs AFTER Comparison:    [OK]
[TEST 9] Engineering Verification & Retention:    [OK]
[TEST 10] AI Markdown Postmortem Generator:       [OK]
[TEST 11] ReportLab PDF Generation:               [OK]
[TEST 12] Cleanup & Teardown:                     [OK]
============================================================
ALL 12 VERIFICATION TESTS PASSED PERFECTLY!
============================================================
```

---

## 7. 60-Second Hackathon Demo Walkthrough

1. **0–10s (The Recurring Failure Problem)**: Open the **AI Learning Demo** page. Explain that DevOps engineers waste hours troubleshooting recurring outages that someone already fixed days ago.
2. **10–25s (1st Incident - No Memory)**: Show **INC-2041** (Payment DB timeout). Without memory, an ordinary LLM gives generic speculative advice ("restart the pods"). MTTR: 58 mins.
3. **25–35s (Hindsight Retain)**: Show the SRE commander certifying the fix: `Scaled PgBouncer pool to 250 with connection retry jitter`. Hindsight permanently retains the error signature and verified outcome.
4. **35–50s (2nd Incident - Memory Recalled)**: In a new session, **INC-2048** hits the checkout service with identical DB connection timeouts. Click **With Hindsight Memory**.
5. **50–60s (Evidence-Backed Solution)**: The agent instantly matches the incident with **94% confidence**, outputs the exact `kubectl set env deployment/pgbouncer POOL_SIZE=250` command, and slashes MTTR to 14 mins (-74%). Click **Download PDF Report** to view the audit-ready postmortem!

---

## 8. License

MIT License. Built for the Vectorize Hindsight Hackathon.
