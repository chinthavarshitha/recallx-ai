import pytest
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.services.incident_service import incident_service

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()
    db = SessionLocal()
    incident_service.seed_initial_demo_data(db)
    db.close()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "RECALLX AI" in data["name"]
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "hindsight" in data

def test_auth_login_demo_user():
    response = client.post("/api/v1/auth/login", json={
        "email": "commander@recallx.ai",
        "password": "recallx2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "commander@recallx.ai"

def test_list_incidents():
    response = client.get("/api/v1/incidents/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2
    # Check that INC-2041 exists
    titles = [item["title"] for item in data["items"]]
    assert any("INC-2041" in t for t in titles)

def test_create_and_delete_incident():
    # 1. Create
    payload = {
        "title": "INC-TEST: Synthetic Test Anomaly",
        "description": "Integration test created incident for validation",
        "severity": "Low",
        "status": "Detected",
        "affected_services": ["test-service"],
        "error_logs": "Test error log payload",
        "tags": ["test", "automated"]
    }
    create_res = client.post("/api/v1/incidents/", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    inc_id = created_data["id"]
    assert created_data["title"] == payload["title"]

    # 2. Update
    update_res = client.put(f"/api/v1/incidents/{inc_id}", json={
        "status": "Investigating",
        "description": "Updated test description"
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Investigating"

    # 3. Delete
    del_res = client.delete(f"/api/v1/incidents/{inc_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

def test_verify_resolution_and_hindsight_retention():
    # Fetch INC-2048
    list_res = client.get("/api/v1/incidents/")
    incidents = list_res.json()["items"]
    inc2048 = next((i for i in incidents if "INC-2048" in i["title"]), None)
    assert inc2048 is not None

    verify_payload = {
        "verified_resolution": "Scaled PgBouncer pool sizing to 250 and enabled retry jitter.",
        "root_cause": "PgBouncer pool starvation under traffic burst.",
        "retain_to_hindsight": True
    }
    verify_res = client.post(f"/api/v1/incidents/{inc2048['id']}/verify", json=verify_payload)
    assert verify_res.status_code == 200
    verified_data = verify_res.json()
    assert verified_data["is_verified"] is True
    assert verified_data["status"] == "Resolved"
    assert verified_data["verified_resolution"] == verify_payload["verified_resolution"]

def test_ai_investigation_and_memory_recall():
    list_res = client.get("/api/v1/incidents/")
    incidents = list_res.json()["items"]
    target_inc = incidents[0]

    # Test With Memory
    inv_res = client.post("/api/v1/investigation/start", json={
        "incident_id": target_inc["id"],
        "with_memory": True
    })
    assert inv_res.status_code == 200
    data = inv_res.json()
    assert data["with_memory"] is True
    assert len(data["root_causes"]) > 0
    assert len(data["suggested_actions"]) > 0

def test_before_vs_after_comparison():
    list_res = client.get("/api/v1/incidents/")
    incidents = list_res.json()["items"]
    target_inc = incidents[0]

    comp_res = client.post("/api/v1/investigation/compare", json={
        "incident_id": target_inc["id"]
    })
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "without_memory" in comp_data
    assert "with_memory" in comp_data
    assert comp_data["without_memory"]["with_memory"] is False
    assert comp_data["with_memory"]["with_memory"] is True
    assert len(comp_data["key_differences"]) > 0

def test_hindsight_endpoints():
    health_res = client.get("/api/v1/hindsight/health")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert "bank_id" in health_data
    assert "sdk_version" in health_data

    explorer_res = client.get("/api/v1/hindsight/explorer")
    assert explorer_res.status_code == 200
    explorer_data = explorer_res.json()
    assert explorer_data["total"] > 0
    assert len(explorer_data["memories"]) > 0

def test_analytics_overview():
    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["total_incidents"] >= 2
    assert "recurring_patterns" in data
    assert "memory_recall_accuracy" in data

def test_pdf_export():
    list_res = client.get("/api/v1/incidents/")
    inc_id = list_res.json()["items"][0]["id"]
    pdf_res = client.get(f"/api/v1/export/incident/{inc_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 500  # valid PDF binary stream
