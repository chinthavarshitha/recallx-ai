# Hindsight Memory Integration Specification

**Documentation:** https://hindsight.vectorize.io/  
**Official Python SDK:** `hindsight-client` (v1.2.0 installed & verified)

## 1. Client Initialization

The Hindsight service connects to a self-hosted instance (Docker) or Vectorize Cloud:

```python
from hindsight_client import Hindsight

client = Hindsight(
    base_url=settings.HINDSIGHT_API_URL,  # Default: http://localhost:8888
    api_key=settings.HINDSIGHT_API_KEY,    # Optional for cloud
    timeout=2.0,
    max_attempts=1
)
```

## 2. Bank Isolation

Every workspace or organization in RECALLX maps to its own isolated Hindsight Memory Bank (`bank_id`):

```python
bank_id = f"bank-{workspace.slug}"
client.create_bank(bank_id=bank_id)
```

## 3. Retain Primitive

When an incident is declared or certified by an engineer:

```python
client.retain(
    bank_id=bank_id,
    content=f"""
    INCIDENT TITLE: {incident.title}
    SEVERITY: {incident.severity}
    AFFECTED SERVICES: {', '.join(incident.affected_services)}
    ERROR LOG SIGNATURE: {incident.error_logs}
    ROOT CAUSE: {incident.root_cause}
    VERIFIED RESOLUTION: {incident.verified_resolution}
    """,
    context=f"Workspace: {workspace_id} | Incident: {incident_id}",
    metadata={
        "incident_id": incident.id,
        "is_verified": "true" if incident.is_verified else "false",
        "severity": incident.severity
    },
    tags=["incident", f"sev:{incident.severity.lower()}", "verified-fix"]
)
```

## 4. Recall Primitive

When a new incident occurs or during investigation:

```python
results = client.recall(
    bank_id=bank_id,
    query=f"{incident.title} {' '.join(incident.affected_services)} {incident.description}",
    budget="mid"
)
```

## 5. Reflect Primitive

Synthesizes architectural trends across all accumulated incidents:

```python
summary = client.reflect(
    bank_id=bank_id,
    query="Summarize recurring database connection and caching bottlenecks over the last 30 days.",
    budget="low"
)
```

## 6. Offline & Resilient Operation

In accordance with enterprise guidelines, RECALLX AI never fakes an active connection. If the Hindsight server is offline, the status is clearly reported as `offline (local fallback active)` with latency and socket diagnostics, while local persistence guarantees zero data loss and flawless presentation operation.
