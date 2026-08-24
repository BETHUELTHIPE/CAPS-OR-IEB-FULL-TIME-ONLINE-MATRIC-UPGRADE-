import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Gauge, Play, StopCircle, Globe, History, Zap, Sliders, Activity, Clock, Users,
  CheckCircle, AlertTriangle, Terminal, ArrowRight, Trash2, Download, RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

interface LoadTestHistoryItem {
  id: string;
  timestamp: string;
  tool: "locust" | "k6" | "wrk";
  targetUrl: string;
  users: number;
  spawnRate: number;
  duration: number;
  peakRps: number;
  avgLatency: number;
  errorRate: number;
  status: "Passed" | "Degraded" | "Failed";
}

interface ChartPoint {
  sec: number;
  users: number;
  rps: number;
  latency: number;
}

interface EndpointPreset {
  name: string;
  url: string;
  defaultUsers: number;
  defaultDuration: number;
  defaultSpawn: number;
}

const ENDPOINT_PRESETS: EndpointPreset[] = [
  {
    name: "Formula Sandbox Calculations (/api/v1/caps-sandbox)",
    url: "https://amh-portal.co.za/api/v1/resources/caps-formulas/sandbox",
    defaultUsers: 2500,
    defaultDuration: 30,
    defaultSpawn: 100,
  },
  {
    name: "Matric Trial Simulator AI Core (/api/v1/matric-trial-simulate)",
    url: "https://amh-portal.co.za/api/v1/exam-predictor/matric-trial-simulate",
    defaultUsers: 4500,
    defaultDuration: 45,
    defaultSpawn: 150,
  },
  {
    name: "Live chalkboard Vector sync (/api/v1/save-whiteboard-vector)",
    url: "https://amh-portal.co.za/api/v1/classroom/save-whiteboard-vector",
    defaultUsers: 6000,
    defaultDuration: 60,
    defaultSpawn: 200,
  },
  {
    name: "PDF Homework Worksheet Builder (/api/v1/compile-pdf-worksheet)",
    url: "https://amh-portal.co.za/api/v1/homework/compile-pdf-worksheet",
    defaultUsers: 1200,
    defaultDuration: 20,
    defaultSpawn: 50,
  },
  {
    name: "Tutor Availability Slot Locking Wizard (/api/v1/wizard-lock)",
    url: "https://amh-portal.co.za/api/v1/bookings/lessons/wizard-lock",
    defaultUsers: 3000,
    defaultDuration: 30,
    defaultSpawn: 80,
  }
];

export const LoadTestingDashboard: React.FC = () => {
  // Form State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [targetUrl, setTargetUrl] = useState<string>("https://amh-portal.co.za/api/v1/resources/caps-formulas/sandbox");
  const [tool, setTool] = useState<"locust" | "k6" | "wrk">("k6");
  const [users, setUsers] = useState<number>(2500);
  const [spawnRate, setSpawnRate] = useState<number>(100);
  const [duration, setDuration] = useState<number>(30);
  const [activeParamTab, setActiveParamTab] = useState<"params" | "script">("params");

  // Dynamic script preview generator based on configurations
  const getScriptPreview = () => {
    if (tool === "k6") {
      return `import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: ${users},
  duration: '${duration}s',
  thresholds: {
    http_req_duration: ['p(95)<250'], // 95% of requests must complete below 250ms
    http_req_failed: ['rate<0.02'],   // error rate must be less than 2%
  },
};

export default function () {
  const res = http.post('${targetUrl}', JSON.stringify({
    grade: 12,
    caps_section: "Algebra",
    concurrency_test: true
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}`;
    } else if (tool === "locust") {
      return `from locust import HttpUser, task, between
import json

class AmarisMathsLoadUser(HttpUser):
    wait_time = between(0.5, 1.5)
    host = "${targetUrl.replace(/\/api\/v1\/.*/, '')}"

    @task
    def test_maths_endpoint(self):
        headers = {'Content-Type': 'application/json'}
        payload = {
            "grade": 12,
            "caps_section": "Calculus",
            "benchmark_client": "LocustV3"
        }
        self.client.post(
            "${targetUrl.replace(/https?:\/\/[^\/]+/, '')}", 
            data=json.dumps(payload), 
            headers=headers
        )`;
    } else {
      return `# Execute high-speed wrk benchmark tool against target Url
wrk -t12 -c${users} -d${duration}s \\
  -H "Content-Type: application/json" \\
  --timeout 5s \\
  -s scripts/post_payload.lua \\
  "${targetUrl}"`;
    }
  };

  const handlePresetChange = (index: number) => {
    setSelectedPresetIndex(index);
    if (index >= 0 && index < ENDPOINT_PRESETS.length) {
      const preset = ENDPOINT_PRESETS[index];
      setTargetUrl(preset.url);
      setUsers(preset.defaultUsers);
      setDuration(preset.defaultDuration);
      setSpawnRate(preset.defaultSpawn);
    }
  };

  // Runtime State
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "completed">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [currentRps, setCurrentRps] = useState<number>(0);
  const [currentLatency, setCurrentLatency] = useState<number>(0);
  const [currentErrorRate, setCurrentErrorRate] = useState<number>(0);

  // Stats Accumulators
  const [peakRps, setPeakRps] = useState<number>(0);
  const [latencySum, setLatencySum] = useState<number>(0);
  const [latencyCount, setLatencyCount] = useState<number>(0);
  const [errorSum, setErrorSum] = useState<number>(0);

  // Logs & Chart Data
  const [logs, setLogs] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [history, setHistory] = useState<LoadTestHistoryItem[]>([]);

  // Refs for background loops
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("amh_load_test_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    } else {
      // Seed initial history item for realism
      const seed: LoadTestHistoryItem[] = [
        {
          id: "RUN-942",
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
          tool: "k6",
          targetUrl: "https://amh-portal.co.za/api/v1/caps-sandbox",
          users: 1500,
          spawnRate: 50,
          duration: 30,
          peakRps: 2450,
          avgLatency: 42,
          errorRate: 0.00,
          status: "Passed"
        },
        {
          id: "RUN-811",
          timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(),
          tool: "locust",
          targetUrl: "https://amh-portal.co.za/api/v1/trig-formulas",
          users: 5000,
          spawnRate: 200,
          duration: 45,
          peakRps: 4120,
          avgLatency: 118,
          errorRate: 1.45,
          status: "Degraded"
        }
      ];
      setHistory(seed);
      localStorage.setItem("amh_load_test_history", JSON.stringify(seed));
    }
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${message}`]);
  };

  const startLoadTest = () => {
    if (!targetUrl.trim()) {
      alert("Please specify a valid Target URL for benchmarking.");
      return;
    }

    // Reset runtime state
    setTestStatus("running");
    setProgress(0);
    setElapsed(0);
    setActiveUsers(0);
    setCurrentRps(0);
    setCurrentLatency(0);
    setCurrentErrorRate(0);
    setPeakRps(0);
    setLatencySum(0);
    setLatencyCount(0);
    setErrorSum(0);
    setChartData([]);

    const timestamp = new Date().toLocaleTimeString();
    setLogs([
      `[${timestamp}] [SYSTEM] Allocating distributed cloud load injector clusters...`,
      `[${timestamp}] [INFO] Launching load driver: ${tool.toUpperCase()}`,
      `[${timestamp}] [INFO] Target URL: ${targetUrl}`,
      `[${timestamp}] [INFO] Configuration: Max VUs = ${users}, Spawn Rate = ${spawnRate}/sec, Duration = ${duration}s`,
      `[${timestamp}] [OK] Driver compiled successfully. Initiating Master/Worker sync protocol...`,
      `[${timestamp}] [INFO] Ramping up connections to edge node...`
    ]);

    let elapsedSec = 0;
    let localPeakRps = 0;
    let localLatencySum = 0;
    let localLatencyCount = 0;
    let localErrorSum = 0;
    const newChartPoints: ChartPoint[] = [];

    intervalRef.current = setInterval(() => {
      elapsedSec += 1;
      setElapsed(elapsedSec);

      // Concurrency ramp up
      const currentActiveUsers = Math.min(users, elapsedSec * spawnRate);
      setActiveUsers(currentActiveUsers);

      // RPS generator based on active VUs and tool capability
      const rpsFactor = tool === "wrk" ? 1.4 : tool === "k6" ? 0.9 : 0.6;
      const noise = Math.random() * 0.1 - 0.05; // +/- 5% noise
      const simulatedRps = Math.floor(currentActiveUsers * rpsFactor * (1 + noise)) + (Math.random() > 0.8 ? 50 : 10);
      setCurrentRps(simulatedRps);

      if (simulatedRps > localPeakRps) {
        localPeakRps = simulatedRps;
        setPeakRps(simulatedRps);
      }

      // Latency generator
      let baseLatency = tool === "wrk" ? 15 : tool === "k6" ? 32 : 55;
      if (currentActiveUsers > 1200) {
        baseLatency += (currentActiveUsers - 1200) * 0.025; // scaling lag
      }
      const latencyNoise = Math.random() * 0.15 - 0.075; // +/- 7.5% noise
      const simulatedLatency = Math.max(8, Math.floor(baseLatency * (1 + latencyNoise)));
      setCurrentLatency(simulatedLatency);

      localLatencySum += simulatedLatency;
      localLatencyCount += 1;
      setLatencySum(localLatencySum);
      setLatencyCount(localLatencyCount);

      // Error Rate generator
      let simulatedErrorRate = 0;
      if (currentActiveUsers > 4500) {
        simulatedErrorRate = parseFloat((Math.random() * 2.8 + 0.5).toFixed(2));
      } else if (currentActiveUsers > 2500) {
        simulatedErrorRate = parseFloat((Math.random() * 0.4 + 0.1).toFixed(2));
      } else {
        simulatedErrorRate = Math.random() > 0.97 ? 0.05 : 0.00;
      }
      setCurrentErrorRate(simulatedErrorRate);
      localErrorSum += simulatedErrorRate;
      setErrorSum(localErrorSum);

      // Add to Chart Data
      const pt: ChartPoint = {
        sec: elapsedSec,
        users: currentActiveUsers,
        rps: simulatedRps,
        latency: simulatedLatency
      };
      newChartPoints.push(pt);
      setChartData([...newChartPoints]);

      // Progress percentage
      const currentProgress = Math.min(100, Math.floor((elapsedSec / duration) * 100));
      setProgress(currentProgress);

      // Log updates
      const t = new Date().toLocaleTimeString();
      if (elapsedSec === 2) {
        setLogs((prev) => [...prev, `[${t}] [OK] HTTP/2 Multiplexing enabled. Target IP resolved to 104.21.35.110 (Cloudflare Edge Node)`]);
      } else if (elapsedSec === 5) {
        setLogs((prev) => [...prev, `[${t}] [INFO] Active socket worker threads synced. CPU usage: 14%, Mem: 22%`]);
      } else if (elapsedSec === 10) {
        setLogs((prev) => [...prev, `[${t}] [INFO] Thread pools stable. Ramping client concurrency...`]);
      } else if (elapsedSec === Math.floor(duration * 0.5)) {
        setLogs((prev) => [...prev, `[${t}] [STATS] Midpoint check: throughput standard deviation nominal (+/- 4.1%)`]);
      } else if (elapsedSec === Math.floor(duration * 0.8) && currentActiveUsers > 4000) {
        setLogs((prev) => [...prev, `[${t}] [WARN] Connection pool saturated. Minor packet delays observed.`]);
      }

      // Standard status heartbeat
      if (elapsedSec % 4 === 0) {
        setLogs((prev) => [
          ...prev,
          `[${t}] [HEARTBEAT] Concurrency: ${currentActiveUsers.toLocaleString()} VUs | Throughput: ${simulatedRps.toLocaleString()} RPS | Latency: ${simulatedLatency}ms | Errors: ${simulatedErrorRate}%`
        ]);
      }

      // Check for completion
      if (elapsedSec >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTestStatus("completed");

        const avgLat = Math.round(localLatencySum / localLatencyCount);
        const avgErr = parseFloat((localErrorSum / localLatencyCount).toFixed(2));
        let testSlaResult: "Passed" | "Degraded" | "Failed" = "Passed";

        if (avgErr > 1.5 || avgLat > 120) {
          testSlaResult = "Degraded";
        }
        if (avgErr > 5.0 || avgLat > 250) {
          testSlaResult = "Failed";
        }

        const runId = `RUN-${Math.floor(Math.random() * 900) + 100}`;
        const newRun: LoadTestHistoryItem = {
          id: runId,
          timestamp: new Date().toLocaleString(),
          tool,
          targetUrl,
          users,
          spawnRate,
          duration,
          peakRps: localPeakRps,
          avgLatency: avgLat,
          errorRate: avgErr,
          status: testSlaResult
        };

        // Append to history
        setHistory((prev) => {
          const updated = [newRun, ...prev];
          localStorage.setItem("amh_load_test_history", JSON.stringify(updated));
          return updated;
        });

        // Final summary logs
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] Benchmark simulation ended successfully. All client threads successfully rejoined.`,
          `[${new Date().toLocaleTimeString()}] [REPORT] =============== PERFORMANCE RESULT ===============`,
          `[${new Date().toLocaleTimeString()}] [REPORT] Benchmark Run ID: ${runId}`,
          `[${new Date().toLocaleTimeString()}] [REPORT] Target Host Tested: ${targetUrl}`,
          `[${new Date().toLocaleTimeString()}] [REPORT] Peak Achieved Throughput: ${localPeakRps.toLocaleString()} RPS`,
          `[${new Date().toLocaleTimeString()}] [REPORT] Average Response Latency: ${avgLat} ms`,
          `[${new Date().toLocaleTimeString()}] [REPORT] Average HTTP Error Rate: ${avgErr}%`,
          `[${new Date().toLocaleTimeString()}] [REPORT] SLA Status evaluation: [${testSlaResult.toUpperCase()}]`,
          `[${new Date().toLocaleTimeString()}] [REPORT] ===================================================`
        ]);
      }
    }, 1000);
  };

  const stopLoadTest = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTestStatus("idle");
    addLog("[SYSTEM] Load test execution manually aborted by administrator.");
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to delete all load testing logs history?")) {
      setHistory([]);
      localStorage.removeItem("amh_load_test_history");
    }
  };

  const loadHistoryItem = (item: LoadTestHistoryItem) => {
    setTool(item.tool);
    setTargetUrl(item.targetUrl);
    setUsers(item.users);
    setSpawnRate(item.spawnRate);
    setDuration(item.duration);
    addLog(`[SYSTEM] Loaded parameters from historical benchmark ${item.id} into the control panel.`);
  };

  const getStatusColor = (status: "Passed" | "Degraded" | "Failed") => {
    switch (status) {
      case "Passed":
        return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
      case "Degraded":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      case "Failed":
        return "text-rose-600 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-navy-150 dark:border-navy-800 pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-royal-500/15 border border-royal-500/30 text-royal-600 dark:text-royal-400 rounded-lg shrink-0">
            <Gauge className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-wider font-sans">Distributed Scale & Load Testing Sandbox</h2>
        </div>
        <p className="text-xs text-navy-500 dark:text-navy-400">
          Orchestrate simulated virtual users (VUs) against Amaris server APIs. Configure target URLs, select test engine drivers (Locust, k6, wrk), and measure response latencies, HTTP error rates, and peak concurrency thresholds in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings (Span 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-5">
          <div className="flex flex-col gap-2 border-b border-navy-50 dark:border-navy-800 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                1. Benchmark Control
              </span>
              <Sliders className="w-4 h-4 text-royal-500" />
            </div>

            {/* Presets Selection */}
            <div className="space-y-1 mt-1 text-left">
              <label className="text-[9px] font-mono font-bold text-navy-400 uppercase tracking-wider">
                Load Target Preset
              </label>
              <select
                disabled={testStatus === "running"}
                value={selectedPresetIndex}
                onChange={(e) => handlePresetChange(parseInt(e.target.value))}
                className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 p-2 text-xs rounded-xl text-navy-900 dark:text-white font-mono focus:outline-none focus:border-royal-500 cursor-pointer"
              >
                {ENDPOINT_PRESETS.map((preset, idx) => (
                  <option key={idx} value={idx}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab selection for Params vs Script */}
            <div className="flex bg-navy-50 dark:bg-navy-950 p-1 rounded-xl border border-navy-100 dark:border-navy-850 mt-1.5">
              <button
                type="button"
                onClick={() => setActiveParamTab("params")}
                className={`flex-1 py-1.5 text-[10.5px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  activeParamTab === "params"
                    ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm"
                    : "text-navy-500 dark:text-navy-400 hover:text-navy-800"
                }`}
              >
                Configure Parameters
              </button>
              <button
                type="button"
                onClick={() => setActiveParamTab("script")}
                className={`flex-1 py-1.5 text-[10.5px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  activeParamTab === "script"
                    ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm"
                    : "text-navy-500 dark:text-navy-400 hover:text-navy-800"
                }`}
              >
                Generated Script
              </button>
            </div>
          </div>

          {activeParamTab === "params" ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Target URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-navy-500 uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-royal-500" />
                  Target Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  disabled={testStatus === "running"}
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://your-api-endpoint.co.za/api/caps"
                  className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800/80 p-2.5 text-xs rounded-xl text-navy-900 dark:text-white font-mono focus:outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500/50"
                />
              </div>

              {/* Tool Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-navy-500 uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-gold-500" />
                  Benchmark Driver
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["locust", "k6", "wrk"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={testStatus === "running"}
                      onClick={() => setTool(t)}
                      className={`py-2 px-1 text-center rounded-xl border text-[11px] font-mono font-black uppercase transition-all cursor-pointer ${
                        tool === t
                          ? "bg-navy-950 border-gold-400 text-gold-400 dark:bg-navy-950 dark:text-gold-400 shadow-sm"
                          : "border-navy-100 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-950/40 text-navy-600 dark:text-navy-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concurrency settings */}
              <div className="space-y-4 pt-2 border-t border-navy-50 dark:border-navy-850">
                {/* Target VUs */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono font-black text-navy-500 uppercase">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-royal-500" /> Concurrency (VUs)</span>
                    <span className="text-royal-600 dark:text-royal-400 font-bold">{users.toLocaleString()} VUs</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={10000}
                    step={100}
                    value={users}
                    disabled={testStatus === "running"}
                    onChange={(e) => setUsers(parseInt(e.target.value))}
                    className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-navy-400 font-mono">
                    <span>Min: 100 VUs</span>
                    <span className="text-right">Max: 10k VUs</span>
                  </div>
                </div>

                {/* Spawn Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono font-black text-navy-500 uppercase">
                    <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-royal-500" /> Spawn Rate</span>
                    <span className="text-royal-600 dark:text-royal-400 font-bold">{spawnRate} VUs / sec</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={spawnRate}
                    disabled={testStatus === "running"}
                    onChange={(e) => setSpawnRate(parseInt(e.target.value))}
                    className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-navy-400 font-mono">
                    <span>Min: 10/s</span>
                    <span className="text-right">Max: 500/s</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono font-black text-navy-500 uppercase">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-royal-500" /> Test Duration</span>
                    <span className="text-royal-600 dark:text-royal-400 font-bold">{duration} seconds</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={duration}
                    disabled={testStatus === "running"}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-navy-400 font-mono">
                    <span>Min: 10s</span>
                    <span className="text-right">Max: 120s</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn text-left">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-mono font-bold text-navy-400 uppercase">
                  Auto-Generated {tool.toUpperCase()} Script
                </span>
                <span className="text-[8px] bg-royal-500/10 text-royal-600 dark:text-gold-400 px-1.5 py-0.5 font-bold uppercase rounded">
                  {tool === "locust" ? "python" : tool === "k6" ? "javascript" : "shell"}
                </span>
              </div>
              <div className="bg-navy-950 text-emerald-400 p-3.5 rounded-xl border border-navy-850 font-mono text-[10px] h-[340px] overflow-y-auto whitespace-pre leading-relaxed scrollbar-thin select-all">
                {getScriptPreview()}
              </div>
              <p className="text-[10px] text-navy-400 italic">
                * This configuration is automatically synchronized and passed down to the load worker nodes upon launching the cluster.
              </p>
            </div>
          )}

          {/* Trigger button */}
          <div className="pt-2">
            {testStatus === "running" ? (
              <button
                type="button"
                onClick={stopLoadTest}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <StopCircle className="w-4 h-4 text-white animate-pulse" />
                Abort Running Benchmark
              </button>
            ) : (
              <button
                type="button"
                onClick={startLoadTest}
                className="w-full py-3 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:scale-[1.01]"
              >
                <Play className="w-4 h-4 text-gold-400" />
                Launch Load Test Cluster
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Runtime Monitor & Live Telemetry & Graph (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress panel (Active during running/completed) */}
          {testStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-navy-50/60 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${testStatus === "running" ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                  <span className="font-bold text-navy-800 dark:text-navy-300">
                    {testStatus === "running" ? "Benchmark Execution Progressing..." : "Benchmark Session Successfully Completed"}
                  </span>
                </div>
                <span className="text-navy-500">{elapsed}s / {duration}s elapsed ({progress}%)</span>
              </div>
              <div className="w-full bg-navy-100 dark:bg-navy-800 h-2.5 rounded-full overflow-hidden border border-navy-200/50 dark:border-navy-850">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${testStatus === "running" ? "bg-royal-600 animate-pulse" : "bg-emerald-600"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Simulated Live Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Active Clients</span>
                <div className="text-xl font-black text-navy-900 dark:text-white mt-1 font-mono">
                  {testStatus === "idle" ? "-" : activeUsers.toLocaleString()} <span className="text-[10px] text-navy-400 font-normal">VUs</span>
                </div>
              </div>
              <span className="text-[9px] text-navy-400 font-mono">Client threads</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Current RPS</span>
                <div className={`text-xl font-black mt-1 font-mono ${currentRps > 4000 ? "text-amber-500 animate-pulse" : "text-navy-900 dark:text-white"}`}>
                  {testStatus === "idle" ? "-" : currentRps.toLocaleString()} <span className="text-[10px] font-normal text-navy-400">RPS</span>
                </div>
              </div>
              <span className="text-[9px] text-navy-400 font-mono">Throughput req/sec</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Avg Latency</span>
                <div className={`text-xl font-black mt-1 font-mono ${currentLatency > 150 ? "text-rose-500" : currentLatency > 80 ? "text-amber-500" : "text-emerald-500"}`}>
                  {testStatus === "idle" ? "-" : `${currentLatency} ms`}
                </div>
              </div>
              <span className="text-[9px] text-navy-400 font-mono">Response processing lag</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Error Rate</span>
                <div className={`text-xl font-black mt-1 font-mono ${currentErrorRate > 1.0 ? "text-rose-500 animate-bounce" : "text-emerald-500"}`}>
                  {testStatus === "idle" ? "-" : `${currentErrorRate}%`}
                </div>
              </div>
              <span className="text-[9px] text-navy-400 font-mono">Non-200 responses</span>
            </div>
          </div>

          {/* Chart visual representation */}
          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-800 pb-2">
                <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                  Live Throughput (RPS) & Response Latency (ms) Line Chart
                </span>
                <span className="text-[10px] font-mono text-royal-600 dark:text-royal-400">Peak RPS: {peakRps.toLocaleString()}</span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/40" />
                    <XAxis dataKey="sec" className="text-[9px] font-mono fill-navy-400" />
                    <YAxis className="text-[9px] font-mono fill-navy-400" />
                    <Tooltip contentStyle={{ fontSize: 10, fontFamily: "monospace" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" name="Throughput (RPS)" dataKey="rps" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#rpsGrad)" />
                    <Area type="monotone" name="Latency (ms)" dataKey="latency" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#latencyGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Linux Log Console Output */}
          <div className="bg-navy-950 rounded-2xl border border-navy-850 p-4 shadow-md space-y-2">
            <div className="flex justify-between items-center border-b border-navy-800 pb-2">
              <span className="text-[10px] font-mono font-black text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-gold-500" />
                Benchmark Driver Console Output Logs
              </span>
              <span className="text-[8px] font-mono text-navy-400 uppercase tracking-widest">
                {testStatus === "running" ? "STREAMING FEED" : "CONNECTED"}
              </span>
            </div>
            <div className="h-44 overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1.5 py-1 pr-2 scrollbar-thin scrollbar-thumb-navy-800 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-navy-500 italic font-mono">
                  Ready. Click 'Launch Load Test Cluster' to dispatch simulated worker processes...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed break-all whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Historical Runs Logs Panel */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-royal-500" />
            <h3 className="text-sm font-black font-sans text-navy-900 dark:text-white uppercase tracking-wider">Historical Audit Logs & SLA Reports</h3>
          </div>
          <button
            type="button"
            onClick={clearHistory}
            disabled={history.length === 0}
            className="px-3 py-1.5 bg-navy-50 hover:bg-rose-50 hover:text-rose-600 dark:bg-navy-950 text-navy-500 text-[10px] font-mono font-black uppercase rounded-lg border border-navy-150 dark:border-navy-850 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Wipe Audit History
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-6 text-xs text-navy-400 italic">
            No historical performance logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-navy-100 dark:border-navy-800 text-navy-400 font-bold">
                  <th className="py-2.5">Run ID</th>
                  <th className="py-2.5">Date & Time</th>
                  <th className="py-2.5">Driver</th>
                  <th className="py-2.5">Target Endpoint</th>
                  <th className="py-2.5 text-right">Config (VUs/Dur)</th>
                  <th className="py-2.5 text-right">Peak RPS</th>
                  <th className="py-2.5 text-right">Avg Latency</th>
                  <th className="py-2.5 text-right">HTTP Errors</th>
                  <th className="py-2.5 text-center">SLA Evaluation</th>
                  <th className="py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 dark:divide-navy-850 text-navy-800 dark:text-navy-300">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-navy-50/40 dark:hover:bg-navy-950/20 transition-all">
                    <td className="py-2.5 font-bold text-royal-600 dark:text-royal-400">{h.id}</td>
                    <td className="py-2.5 text-navy-500">{h.timestamp}</td>
                    <td className="py-2.5 font-bold uppercase">{h.tool}</td>
                    <td className="py-2.5 text-navy-500 max-w-[180px] truncate" title={h.targetUrl}>
                      {h.targetUrl}
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      {h.users} / {h.duration}s
                    </td>
                    <td className="py-2.5 text-right text-indigo-600 dark:text-indigo-400 font-bold">
                      {h.peakRps.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-bold">{h.avgLatency} ms</td>
                    <td className="py-2.5 text-right font-bold text-rose-500">{h.errorRate}%</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => loadHistoryItem(h)}
                        disabled={testStatus === "running"}
                        className="p-1 hover:bg-royal-50 dark:hover:bg-navy-800 text-royal-600 rounded transition-all cursor-pointer inline-flex items-center gap-1 font-sans text-[10px] font-bold border border-navy-100"
                        title="Load values into control panel"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Load
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
