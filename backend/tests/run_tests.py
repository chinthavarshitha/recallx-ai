import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.services.incident_service import incident_service

print("[1/12] Initializing Database...")
t0 = time.time()
init_db()
print(f"      Database initialized in {time.time()-t0:.2f}s")

print("[2/12] Seeding initial data...")
t0 = time.time()
db = SessionLocal()
incident_service.seed_initial_demo_data(db)
db.close()
print(f"      Data seeded in {time.time()-t0:.2f}s")

print("[3/12] Creating TestClient...")
t0 = time.time()
client = TestClient(app)
print(f"      TestClient created in {time.time()-t0:.2f}s")

print("[4/12] Testing Root Endpoint...")
t0 = time.time()
res = client.get("/")
assert res.status_code == 200
assert "RECALLX AI" in res.json()["name"]
print(f"      PASS (Status 200 in {time.time()-t0:.2f}s)")

print("[5/12] Testing Health Endpoint...")
t0 = time.time()
res = client.get("/health")
assert res.status_code == 200
print(f"      PASS (Status 200 in {time.time()-t0:.2f}s)")

print("[6/12] Testing Auth Login...")
t0 = time.time()
res = client.post("/api/v1/auth/login", json={"email": "commander@recallx.ai", "password": "recallx2026"})
assert res.status_code == 200
token = res.json()["access_token"]
print(f"      PASS (Login successful in {time.time()-t0:.2f}s)")

headers = {"Authorization": f"Bearer {token}"}

print("[7/12] Testing List Incidents...")
t0 = time.time()
res = client.get("/api/v1/incidents/", headers=headers)
assert res.status_code == 200
incidents = res.json()["items"]
assert len(incidents) >= 2
print(f"      PASS (Retrieved {len(incidents)} incidents in {time.time()-t0:.2f}s)")

print("[8/12] Testing Incident CRUD (Create, Update, Delete)...")
t0 = time.time()
c_res = client.post("/api/v1/incidents/", json={
    "title": "INC-TEST: Smoke Anomaly",
    "description": "Validation test payload",
    "severity": "Low",
    "status": "Detected",
    "affected_services": ["smoke-test"]
}, headers=headers)
assert c_res.status_code == 201
test_id = c_res.json()["id"]

u_res = client.put(f"/api/v1/incidents/{test_id}", json={"status": "Investigating"}, headers=headers)
assert u_res.status_code == 200

d_res = client.delete(f"/api/v1/incidents/{test_id}", headers=headers)
assert d_res.status_code == 200
print(f"      PASS (CRUD verified in {time.time()-t0:.2f}s)")

print("[9/12] Testing AI Investigation With Memory Recall...")
t0 = time.time()
target_id = incidents[0]["id"]
inv_res = client.post("/api/v1/investigation/start", json={"incident_id": target_id, "with_memory": True}, headers=headers)
assert inv_res.status_code == 200
inv_data = inv_res.json()
assert len(inv_data["root_causes"]) > 0
print(f"      PASS (Investigation generated {len(inv_data['root_causes'])} root causes in {time.time()-t0:.2f}s)")

print("[10/12] Testing BEFORE vs AFTER Comparison...")
t0 = time.time()
comp_res = client.post("/api/v1/investigation/compare", json={"incident_id": target_id}, headers=headers)
assert comp_res.status_code == 200
comp_data = comp_res.json()
assert len(comp_data["key_differences"]) > 0
print(f"      PASS (Comparison completed in {time.time()-t0:.2f}s with {len(comp_data['key_differences'])} differences)")

print("[11/12] Testing Hindsight Explorer & Health...")
t0 = time.time()
h_res = client.get("/api/v1/hindsight/health", headers=headers)
assert h_res.status_code == 200
e_res = client.get("/api/v1/hindsight/explorer", headers=headers)
assert e_res.status_code == 200
print(f"      PASS (Explorer listed {e_res.json()['total']} memories in {time.time()-t0:.2f}s)")

print("[12/12] Testing Analytics & PDF Export...")
t0 = time.time()
a_res = client.get("/api/v1/analytics/overview", headers=headers)
assert a_res.status_code == 200
pdf_res = client.get(f"/api/v1/export/incident/{target_id}/pdf", headers=headers)
assert pdf_res.status_code == 200
assert len(pdf_res.content) > 500
print(f"      PASS (Analytics & PDF {len(pdf_res.content)} bytes generated in {time.time()-t0:.2f}s)")

print("\n" + "="*50)
print("ALL 12 BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")
print("="*50)
