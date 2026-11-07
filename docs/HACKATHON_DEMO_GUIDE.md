# RECALLX AI — 60-Second Hackathon Presentation Playbook

## Presentation Pitch
> "Every Incident Teaches. Every Response Gets Smarter."

## 60-Second Demo Script

### 0–10s: Introduce the Problem
- "DevOps engineers constantly reinvent the wheel. When a database connection pool exhausts or a cache evicts under load, responders waste 45 minutes rediscovering the exact same fix someone else applied two days ago."
- *Action*: Open the **AI Learning Demo** page (`/demo-comparison`).

### 10–25s: Submit the First Incident & Investigate
- "Here is INC-2041, an unfamiliar payment failure in our US cluster. Without memory, an AI chatbot gives generic guesses: 'Restart the pods', 'Check the database'. Responders spend 58 minutes isolating the issue."
- *Action*: Click "Without Historical Memory" to show the speculative recommendations.

### 25–35s: Show Hindsight Storing the Verified Fix
- "Once our SRE commander verified that scaling PgBouncer pool to 250 with connection retry jitter solved the issue, RECALLX executed `client.retain()` to permanently commit this verified knowledge into our Hindsight memory bank."
- *Action*: Show the **Hindsight Explorer** and the certified fix with its Hindsight ID and tags.

### 35–50s: Submit the Second Incident in a New Session
- "Two days later in a new session, INC-2048 strikes our European checkout service with similar connection timeouts. Watch what happens when RECALLX activates Hindsight."
- *Action*: Click "With Hindsight Memory" or "Side-by-Side Comparison".

### 50–60s: Evidence-Backed Recall & 74% MTTR Reduction
- "Instantly, RECALLX queries Hindsight, detects a 94% match to our previous verified fix, pinpoints PgBouncer starvation, and outputs the exact command: `kubectl set env deployment/pgbouncer POOL_SIZE=250`."
- "No guessing. No lost hours. MTTR drops from 58 minutes to 14 minutes. That is the power of RECALLX AI powered by Hindsight."
- *Action*: Click "Download PDF Report" to show the audit-ready postmortem generated instantly.
