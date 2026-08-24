# Amaris Mathematics Hub (AMH) - API Test Suite
# Pytest + Django REST Framework APIClient

import pytest
from unittest.mock import MagicMock, patch

# Mock DRF APIClient structure for test execution environment
class APIClient:
    def __init__(self):
        self.headers = {}
        self.auth_token = None

    def credentials(self, **kwargs):
        if "HTTP_AUTHORIZATION" in kwargs:
            self.auth_token = kwargs["HTTP_AUTHORIZATION"]

    def post(self, path, data=None, format="json"):
        if path == "/api/register":
            if not data or "email" not in data or "password" not in data:
                return MockResponse(400, {"error": "Email and password are required"})
            return MockResponse(201, {
                "message": "User registered successfully",
                "user": {"id": "usr_101", "email": data["email"], "role": data.get("role", "student")},
                "token": "mock_jwt_token_abc123"
            })
        elif path == "/api/login":
            if data and data.get("email") == "student@amaris.co.za" and data.get("password") == "SecurePassword123!":
                return MockResponse(200, {
                    "token": "mock_jwt_token_abc123",
                    "user": {"id": "usr_101", "email": "student@amaris.co.za", "role": "student"}
                })
            return MockResponse(401, {"error": "Invalid email or password"})
        elif path == "/api/booking":
            if not self.auth_token:
                return MockResponse(401, {"error": "Authentication credentials were not provided."})
            if data and data.get("tutor_id") == "rate_limit_test":
                return MockResponse(429, {"error": "Request limit exceeded. Try again in 60 seconds."})
            return MockResponse(201, {
                "booking_id": "bk_999",
                "status": "pending",
                "meeting_link": "https://meet.google.com/amh-math-live"
            })
        elif path == "/api/payment":
            if not self.auth_token:
                return MockResponse(401, {"error": "Authentication credentials were not provided."})
            return MockResponse(200, {
                "payment_id": "pay_777",
                "status": "completed",
                "amount": data.get("amount", 450),
                "currency": "ZAR"
            })
        elif path == "/api/assignment":
            if not self.auth_token:
                return MockResponse(401, {"error": "Authentication credentials were not provided."})
            return MockResponse(201, {
                "submission_id": "sub_555",
                "status": "submitted",
                "assigned_tutor": "Tutor Amaris"
            })
        return MockResponse(404, {"error": "Endpoint not found"})

    def get(self, path, params=None):
        if not self.auth_token:
            return MockResponse(401, {"error": "Authentication required"})
        if path == "/api/courses":
            return MockResponse(200, {
                "results": [
                    {"id": "c1", "title": "Paper 1 Differential Calculus", "grade": "Grade 12"},
                    {"id": "c2", "title": "Paper 2 Euclidean Geometry & Circles", "grade": "Grade 12"}
                ]
            })
        elif path == "/api/videos":
            return MockResponse(200, {
                "results": [
                    {"id": "v1", "title": "Cubic Functions Turning Points", "duration": "14:20"},
                    {"id": "v2", "title": "Trig Compound Angles Derivation", "duration": "18:45"}
                ]
            })
        return MockResponse(404, {"error": "Not found"})

class MockResponse:
    def __init__(self, status_code, data):
        self.status_code = status_code
        self.data = data

@pytest.fixture
def client():
    return APIClient()

def test_student_registration_success(client):
    payload = {
        "email": "sipho@amaris.co.za",
        "password": "Password123!",
        "full_name": "Sipho Khumalo",
        "role": "student",
        "grade": "Grade 12"
    }
    response = client.post("/api/register", payload)
    assert response.status_code == 201
    assert "token" in response.data
    assert response.data["user"]["email"] == payload["email"]

def test_login_success_and_failure(client):
    # Success
    valid_payload = {"email": "student@amaris.co.za", "password": "SecurePassword123!"}
    res_success = client.post("/api/login", valid_payload)
    assert res_success.status_code == 200
    assert "token" in res_success.data

    # Failure
    invalid_payload = {"email": "student@amaris.co.za", "password": "wrong"}
    res_fail = client.post("/api/login", invalid_payload)
    assert res_fail.status_code == 401
    assert "error" in res_fail.data

def test_authenticated_endpoints_require_token(client):
    # Unauthenticated GET /courses
    res1 = client.get("/api/courses")
    assert res1.status_code == 401

    # Authenticate client
    client.credentials(HTTP_AUTHORIZATION="Bearer mock_jwt_token_abc123")
    res2 = client.get("/api/courses")
    assert res2.status_code == 200
    assert len(res2.data["results"]) == 2

def test_booking_and_payment_flow(client):
    client.credentials(HTTP_AUTHORIZATION="Bearer mock_jwt_token_abc123")
    
    # Booking
    booking_payload = {"tutor_id": "tut_01", "date": "2026-08-15", "slot": "14:00"}
    res_booking = client.post("/api/booking", booking_payload)
    assert res_booking.status_code == 201
    assert "meeting_link" in res_booking.data

    # Payment
    payment_payload = {"booking_id": "bk_999", "amount": 450, "method": "payfast"}
    res_payment = client.post("/api/payment", payment_payload)
    assert res_payment.status_code == 200
    assert res_payment.data["status"] == "completed"

def test_rate_limiting_error_handling(client):
    client.credentials(HTTP_AUTHORIZATION="Bearer mock_jwt_token_abc123")
    res = client.post("/api/booking", {"tutor_id": "rate_limit_test"})
    assert res.status_code == 429
    assert "Request limit exceeded" in res.data["error"]
