import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "safety_boundary" in data


def test_simulation_state_and_step_endpoints():
    # Reset
    resp = client.post("/api/simulation/reset")
    assert resp.status_code == 200
    state = resp.json()
    assert state["current_time"] == 0

    # Step
    resp_step = client.post("/api/simulation/step")
    assert resp_step.status_code == 200
    new_state = resp_step.json()
    assert new_state["current_time"] == 1


def test_experiments_benchmark_run():
    resp = client.post("/api/experiments/run")
    assert resp.status_code == 200
    exp = resp.json()
    assert "comparisons" in exp
    assert len(exp["comparisons"]) >= 6

    # Test CSV export
    csv_resp = client.get("/api/experiments/export/csv")
    assert csv_resp.status_code == 200
    assert "Scenario_ID" in csv_resp.text

    # Test Report export
    report_resp = client.get("/api/experiments/export/report")
    assert report_resp.status_code == 200
    assert "# OS Guardian" in report_resp.text
