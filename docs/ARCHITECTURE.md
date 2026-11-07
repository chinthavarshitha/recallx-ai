# RECALLX AI — System Architecture & Memory Specification

## 1. System Overview

**RECALLX AI** is an intelligent AI-powered incident response platform for engineering and DevOps teams. It integrates Vectorize **Hindsight** as its core biomimetic long-term memory engine to ensure that every production incident, error telemetry signature, and verified resolution becomes permanent institutional knowledge.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RECALLX AI PLATFORM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Frontend (React + Vite + TypeScript + Tailwind + Framer Motion)           │
│   ├── Landing Page                                                          │
│   ├── Incident Command Center (CRUD, Search, Filter, Sort, Upload)          │
│   ├── AI Investigation Studio (Multi-turn chat, Root Causes, Actions)       │
│   ├── Hackathon Demo: Before vs After Memory Comparison                     │
│   ├── Hindsight Memory Explorer (Inventory, Sandbox, Audit Logs)            │
│   └── Export Suite (ReportLab PDF Generation & Postmortems)                 │
│                                      │                                      │
│                               REST / JSON                                   │
│                                      ▼                                      │
│   Backend (FastAPI + Pydantic v2 + SQLAlchemy 2.0 + ReportLab)              │
│   ├── Auth Service (JWT + Salted SHA-256 / PBKDF2)                          │
│   ├── Incident Management Service                                           │
│   ├── AI Agent Service (Groq API: Llama-3.3-70B / Fallback Engine)          │
│   ├── Hindsight Memory Service (Official hindsight-client v1.2.0 SDK)       │
│   └── PDF Report Generation Service                                         │
│                    │                                   │                    │
│                    ▼                                   ▼                    │
│   Database Layer (PostgreSQL / SQLite)       Hindsight Memory Engine        │
│   ├── Users & Workspaces                     ├── Isolated Memory Banks      │
│   ├── Incidents & Structured Timelines       ├── Retain: Entities & Facts   │
│   ├── Investigation Sessions                 ├── Recall: Parallel Hybrid    │
│   └── Memory Audit Logs                      └── Reflect: Pattern Reasoning │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Hindsight Memory Primitives

Unlike traditional vector search (RAG) which performs naive flat chunk similarity over static text, Hindsight implements a structured biomimetic memory model:

1. **`Retain`**: Ingests incident telemetry, error logs, and engineer-verified solutions. It constructs logical memory units tagged with service namespaces and verified flags.
2. **`Recall`**: Performs multi-strategy hybrid retrieval:
   - Dense vector semantic matching on error signatures
   - BM25 keyword matching for exact function names, exceptions, and container namespaces
   - Entity graph traversal linking services (e.g. `checkout-service` -> `pgbouncer` -> `postgres-primary`)
   - Temporal decay prioritization so recent architectural fixes rank higher
3. **`Reflect`**: Triggers a reasoning layer over accumulated memory banks to synthesize recurring pattern warnings across the entire infrastructure.

## 3. The 2-Interaction Learning Demonstration

- **First Interaction (Unfamiliar Failure)**:
  - An unfamiliar incident occurs (`INC-2041`: Payment service DB timeout).
  - The agent generates diagnostic hypotheses.
  - An SRE commander validates the fix: "Scaled PgBouncer pool to 250 with transaction pooling and retry jitter."
  - This verified outcome is committed to Hindsight using `client.retain()`.
- **Second Interaction (Memory Recalled)**:
  - In a new session, a similar failure hits the European cluster (`INC-2048`).
  - The agent executes `client.recall()`, recognizes the identical PgBouncer starvation signature with 94% confidence, and immediately recommends the proven remediation command without exploratory troubleshooting.
  - **Result**: MTTR reduced from 58 minutes to 14 minutes (-74%).
