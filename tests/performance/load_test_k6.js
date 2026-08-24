// Amaris Mathematics Hub (AMH) - Locust & k6 Load Benchmarking Script

// k6 Load Test Configuration & Metrics
export const k6_load_test_options = {
  stages: [
    { duration: "2m", target: 1000 },  // Ramp up to 1,000 concurrent students
    { duration: "5m", target: 10000 }, // Scale up to 10,000 concurrent students
    { duration: "3m", target: 10000 }, // Sustain peak load of 10,000 concurrent users
    { duration: "2m", target: 0 }      // Ramp down safely
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // 95% of API requests must complete in < 200ms
    http_req_failed: ["rate<0.01"]    // Error rate must remain under 1%
  }
};

export const PerformanceTargetMetrics = {
  concurrentStudents: 10000,
  targetAPIRequestsPerMinute: 100000,
  maxAllowedLatencyP95: "180ms",
  cachedDashboardLatency: "12ms",
  redisCacheHitRate: "98.4%",
  celeryTaskThroughputPerSec: 250
};
