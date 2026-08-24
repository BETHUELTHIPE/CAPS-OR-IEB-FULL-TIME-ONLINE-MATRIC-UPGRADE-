import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration & Targets
export const options = {
  scenarios: {
    // 1. Smoke test to verify API health & baseline latencies
    smoke_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      exec: 'smokeTestScenario',
    },
    // 2. High concurrency multi-stage peak hour load test
    peak_load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },  // Ramp up
        { duration: '1m', target: 50 },   // Maintain peak load
        { duration: '30s', target: 0 },   // Ramp down
      ],
      gracefulRampDown: '15s',
      exec: 'peakLoadScenario',
    },
  },
  // High-priority SLIs matching AMARIS Performance Target SLA Metrics
  thresholds: {
    // 1. API general responses must be under 300ms on average
    'http_req_duration{scenario:smoke_test}': ['avg<300'],
    // 2. Login response must be under 500ms for p(95)
    'http_req_duration{page_type:login}': ['p(95)<500'],
    // 3. AI prediction & PDF compile must complete within 10s
    'http_req_duration{page_type:ai_predictor}': ['avg<10000'],
    // 4. Maximum allowed failed transaction rate is strictly below 1%
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

export function smokeTestScenario() {
  const headers = { 'Content-Type': 'application/json' };

  // A. Baseline API / Home check
  const resHome = http.get(`${BASE_URL}/`, { tags: { page_type: 'home' } });
  check(resHome, {
    'home server is 200': (r) => r.status === 200,
  });
  sleep(1);

  // B. Authentication endpoint check (SLA: <500ms)
  const loginPayload = JSON.stringify({ email: 'bethuelthipe@gmail.com' });
  const resLogin = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: headers,
    tags: { page_type: 'login' },
  });
  check(resLogin, {
    'login successfully authenticated': (r) => r.status === 200,
  });
  sleep(1);
}

export function peakLoadScenario() {
  const headers = { 'Content-Type': 'application/json' };

  // A. Simulate Students requesting CAPS/IEB formulas calculations (SLA: <300ms)
  const formulaPayload = JSON.stringify({
    grade: 12,
    topic: 'Differential Calculus',
    formula_values: { x: '2.5', h: '0.0001' }
  });
  const resCalc = http.post(`${BASE_URL}/api/v1/caps-sandbox`, formulaPayload, {
    headers: headers,
    tags: { page_type: 'formula_sandbox' },
  });
  check(resCalc, {
    'formula result computed successfully': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1.5);

  // B. Simulate high-throughput live classroom whiteboard vectors
  const vectorPayload = JSON.stringify({
    brush_color: '#124c3e',
    brush_size: 4,
    points: [{ x: 10, y: 15 }, { x: 45, y: 50 }],
    shape_type: 'brush'
  });
  const resVector = http.post(`${BASE_URL}/api/v1/save-whiteboard-vector`, vectorPayload, {
    headers: headers,
    tags: { page_type: 'whiteboard_vectors' },
  });
  check(resVector, {
    'whiteboard vector synced': (r) => r.status === 200 || r.status === 201,
  });
  sleep(0.5);

  // C. Simulate AI Trial Exam Prediction Dispatch (SLA: <10s)
  const predictPayload = JSON.stringify({
    student_id: 'usr-bethuel',
    curriculum: 'CAPS',
    grade_level: 'Grade 12',
    paper_type: 'p1'
  });
  const resPredict = http.post(`${BASE_URL}/api/v1/matric-trial-simulate`, predictPayload, {
    headers: headers,
    tags: { page_type: 'ai_predictor' },
  });
  check(resPredict, {
    'celery background predictor tasks scheduled': (r) => r.status === 200 || r.status === 201,
  });
  sleep(4);
}
