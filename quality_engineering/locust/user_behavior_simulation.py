import time
import json
import random
from locust import HttpUser, task, between, events

class AmarisHighSchoolStudentUser(HttpUser):
    """
    Simulates high-fidelity behavior patterns of South African Grade 10-12 CAPS/IEB students
    interacting with the Amaris Mathematics Hub (AMH).
    """
    # Simulate realistic delay between students reading papers, solving equations, and navigating pages
    wait_time = between(1.0, 3.5)
    
    def on_start(self):
        """
        Executes on initial startup for each virtual user. Simulates student sign-in
        and caches access session credentials.
        """
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        self.student_id = f"simulated-matric-student-{random.randint(1000, 9999)}"
        self.student_name = f"Student Thipe {random.choice(['A', 'B', 'C', 'D'])}"
        
        # Authenticate first
        login_data = {
            "email": "student.amaris@learning-hub.co.za",
            "password": "Password123"
        }
        with self.client.post("/api/auth/login", data=json.dumps(login_data), headers=self.headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Auth failed with code: {response.status_code}")

    @task(4)
    def browse_caps_reference_formulas(self):
        """
        Simulates high-frequency access to the CAPS Curriculum formula grids.
        """
        self.client.get("/", headers=self.headers)

    @task(3)
    def calculate_formula_sandbox(self):
        """
        Simulates students using the interactive CAPS Sandbox calculator, feeding
        variables into Quadratic, Trigonometric, or Derivative equations.
        """
        payload = {
            "grade": 12,
            "topic": "Trigonometry - Cosine Rule",
            "formula_values": {
                "side_b": "8.5",
                "side_c": "12.0",
                "angle_a": "45"
            }
        }
        self.client.post("/api/v1/caps-sandbox", data=json.dumps(payload), headers=self.headers)

    @task(3)
    def sync_whiteboard_vectors(self):
        """
        Simulates high-frequency draw vectors emitted from active whiteboard drawing sessions.
        """
        payload = {
            "brush_color": "#d9b310",
            "brush_size": random.choice([2, 4, 6]),
            "points": [
                {"x": random.randint(0, 500), "y": random.randint(0, 500)},
                {"x": random.randint(50, 600), "y": random.randint(50, 600)}
            ],
            "shape_type": "line"
        }
        self.client.post("/api/v1/save-whiteboard-vector", data=json.dumps(payload), headers=self.headers)

    @task(2)
    def submit_homework_assignment(self):
        """
        Simulates scanned homework file upload and submission to the outbox database.
        """
        payload = {
            "assignment_id": "hw-algebra-lims-101",
            "student_id": self.student_id,
            "scan_url": f"https://amh-portal.co.za/storage/submissions/{self.student_id}-assignment.png",
            "file_size_kb": random.randint(250, 1500),
            "academic_integrity_passed": True
        }
        self.client.post("/api/v1/homework-submissions", data=json.dumps(payload), headers=self.headers)

    @task(1)
    def simulate_payfast_checkout(self):
        """
        Simulates students executing high-contrast checkout payments on the portal.
        Performance targets demand completed callbacks inside 1 second.
        """
        payload = {
            "student_id": self.student_id,
            "package_name": "Premium High-School NSC Matric Package",
            "amount": 450.00,
            "payment_method": "EFT_PayFast",
            "reference": f"AMH-PAY-{random.randint(100000, 999999)}"
        }
        self.client.post("/api/v1/checkout-simulation", data=json.dumps(payload), headers=self.headers)

    @task(1)
    def trigger_ai_matric_trial_simulation(self):
        """
        Triggers the Gemini-backed matric trial exam prediction generator (SLA < 10s).
        """
        payload = {
            "student_id": self.student_id,
            "student_name": self.student_name,
            "curriculum": random.choice(["CAPS", "IEB"]),
            "grade_level": "Grade 12",
            "paper_type": random.choice(["p1", "p2"])
        }
        self.client.post("/api/v1/matric-trial-simulate", data=json.dumps(payload), headers=self.headers)


# Hook events to track telemetry and format outputs for Prometheus / Grafana integrations
@events.request.add_listener
def monitor_latency_thresholds(request_type, name, response_time, response_length, exception, **kwargs):
    if response_time > 1000:
        print(f"[Warning] High Latency Alert! Request {name} took {response_time}ms")
