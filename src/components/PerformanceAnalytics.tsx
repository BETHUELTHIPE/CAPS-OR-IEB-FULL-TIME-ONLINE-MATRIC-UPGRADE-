import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Gauge, Play, StopCircle, RefreshCw, AlertTriangle, CheckCircle,
  Terminal, Sliders, Download, Zap, Users, Clock, ArrowRight,
  ShieldAlert, Layers, ChevronRight, Activity, TrendingUp, Info,
  Database, Sparkles, Plus, FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, BarChart, Bar, ReferenceLine
} from "recharts";

// Interfaces
interface SimulationPoint {
  sec: number;
  vus: number;
  rps: number;
  avgLatency: number;
  p95Latency: number;
  errors: number;
  successes: number;
}

interface EndpointSummary {
  path: string;
  method: "GET" | "POST";
  requests: number;
  avgLatency: number;
  p95Latency: number;
  errorRate: number;
  slaLimit: number;
}

interface HistoricalReport {
  id: string;
  timestamp: string;
  scenarioName: string;
  vus: number;
  duration: number;
  peakRps: number;
  avgLatency: number;
  errorRate: number;
  slaStatus: "PASSED" | "FAILED" | "WARNING";
}

interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  endpoints: { path: string; method: "GET" | "POST"; baseLatency: number; errorWeight: number }[];
  baseRpsPerVu: number;
  peakRpsMultiplier: number;
}

// Scenarios configuration mirroring our quality_engineering k6 suite
const SCENARIOS: ScenarioConfig[] = [
  {
    id: "sandbox_load",
    name: "CAPS/IEB Formula Sandbox Load Test",
    description: "Simulates high-frequency student requests feeding variables into CAPS math calculators (/api/v1/caps-sandbox). Focuses on fast, stateless algebraic computations.",
    endpoints: [
      { path: "/", method: "GET", baseLatency: 35, errorWeight: 0.02 },
      { path: "/api/v1/caps-sandbox", method: "POST", baseLatency: 120, errorWeight: 0.1 }
    ],
    baseRpsPerVu: 4.5,
    peakRpsMultiplier: 1.2
  },
  {
    id: "ai_trial_spike",
    name: "AI Matric Trial Simulation Spike",
    description: "Emulates high-density student spikes running the Gemini-backed matric exam trials generator (/api/v1/matric-trial-simulate). Characterized by high latencies and heavy backend parsing.",
    endpoints: [
      { path: "/api/auth/login", method: "POST", baseLatency: 280, errorWeight: 0.3 },
      { path: "/api/v1/matric-trial-simulate", method: "POST", baseLatency: 1850, errorWeight: 1.5 }
    ],
    baseRpsPerVu: 0.8,
    peakRpsMultiplier: 0.95
  },
  {
    id: "whiteboard_surge",
    name: "Live Whiteboard Vector Surge",
    description: "Simulates continuous streams of drawing vectors emitted from interactive student-tutor live classrooms (/api/v1/save-whiteboard-vector). Demands extremely fast, lightweight writes.",
    endpoints: [
      { path: "/api/v1/save-whiteboard-vector", method: "POST", baseLatency: 65, errorWeight: 0.05 }
    ],
    baseRpsPerVu: 12.0,
    peakRpsMultiplier: 1.4
  },
  {
    id: "sla_benchmark",
    name: "SLA Comprehensive Benchmark Suite",
    description: "Sweeps all operational core endpoints under standard workload to audit compliance with high-school service-level agreements.",
    endpoints: [
      { path: "/", method: "GET", baseLatency: 35, errorWeight: 0.02 },
      { path: "/api/auth/login", method: "POST", baseLatency: 280, errorWeight: 0.3 },
      { path: "/api/v1/caps-sandbox", method: "POST", baseLatency: 120, errorWeight: 0.1 },
      { path: "/api/v1/save-whiteboard-vector", method: "POST", baseLatency: 65, errorWeight: 0.05 },
      { path: "/api/v1/matric-trial-simulate", method: "POST", baseLatency: 1850, errorWeight: 1.5 }
    ],
    baseRpsPerVu: 3.2,
    peakRpsMultiplier: 1.1
  }
];

export const PerformanceAnalytics: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("sandbox_load");
  const [targetVus, setTargetVus] = useState<number>(500);
  const [durationSeconds, setDurationSeconds] = useState<number>(30);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [currentSec, setCurrentSec] = useState<number>(0);

  // Live simulation data state
  const [simulationData, setSimulationData] = useState<SimulationPoint[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeMetricTab, setActiveMetricTab] = useState<"overview" | "response" | "throughput" | "errors">("overview");

  // Demo generator state variables
  const [customScenario, setCustomScenario] = useState<string>("CAPS/IEB Formula Sandbox Load Test");
  const [customVus, setCustomVus] = useState<number>(300);
  const [customRps, setCustomRps] = useState<number>(1200);
  const [customLatency, setCustomLatency] = useState<number>(115);
  const [customError, setCustomError] = useState<number>(0.05);

  // Demo Seed Engine Helpers
  const handleGeneratePreset = (type: "passed" | "failed" | "warning") => {
    const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const id = `rep-preset-${Date.now()}`;
    let preset: HistoricalReport;

    if (type === "passed") {
      preset = {
        id,
        timestamp: timestampStr,
        scenarioName: "SLA Comprehensive Benchmark Suite",
        vus: 450,
        duration: 30,
        peakRps: 1850,
        avgLatency: 75,
        errorRate: 0.02,
        slaStatus: "PASSED"
      };
    } else if (type === "failed") {
      preset = {
        id,
        timestamp: timestampStr,
        scenarioName: "AI Matric Trial Simulation Spike",
        vus: 3200,
        duration: 60,
        peakRps: 1450,
        avgLatency: 2850,
        errorRate: 14.8,
        slaStatus: "FAILED"
      };
    } else {
      preset = {
        id,
        timestamp: timestampStr,
        scenarioName: "Live Whiteboard Vector Surge",
        vus: 1200,
        duration: 45,
        peakRps: 12500,
        avgLatency: 295,
        errorRate: 0.82,
        slaStatus: "WARNING"
      };
    }

    setReports(prev => [preset, ...prev]);
  };

  const handleGenerateBulk = (count: number) => {
    const scenarios = [
      "CAPS/IEB Formula Sandbox Load Test",
      "AI Matric Trial Simulation Spike",
      "Live Whiteboard Vector Surge",
      "SLA Comprehensive Benchmark Suite"
    ];
    const generated: HistoricalReport[] = [];
    const baseTime = Date.now();

    for (let i = 0; i < count; i++) {
      const scenarioIndex = Math.floor(Math.random() * scenarios.length);
      const scenario = scenarios[scenarioIndex];
      const timeOffset = i * 2 * 3600 * 1000; // spread backwards in 2-hour increments
      const date = new Date(baseTime - timeOffset);
      const timestampStr = date.toISOString().replace("T", " ").substring(0, 19);
      
      const vus = Math.floor(Math.random() * 2000) + 100;
      const duration = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
      const peakRps = Math.floor(vus * (Math.random() * 5 + 2));
      
      // Compute status based on randomly selected latencies and errors
      let avgLatency = Math.floor(Math.random() * 400) + 40;
      let errorRate = parseFloat((Math.random() * 1.5).toFixed(2));

      // AI Spike gets higher values
      if (scenario.includes("AI Matric")) {
        avgLatency = Math.floor(Math.random() * 2200) + 500;
        errorRate = parseFloat((Math.random() * 15).toFixed(2));
      }

      let slaStatus: "PASSED" | "FAILED" | "WARNING" = "PASSED";
      if (errorRate > 1.0 || avgLatency > 300) {
        slaStatus = "FAILED";
      } else if (errorRate > 0.7 || avgLatency > 220) {
        slaStatus = "WARNING";
      }

      generated.push({
        id: `rep-bulk-${baseTime}-${i}`,
        timestamp: timestampStr,
        scenarioName: scenario,
        vus,
        duration,
        peakRps,
        avgLatency,
        errorRate,
        slaStatus
      });
    }

    setReports(prev => [...generated, ...prev]);
  };

  const handleGenerateCustom = () => {
    const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const id = `rep-custom-${Date.now()}`;
    
    let slaStatus: "PASSED" | "FAILED" | "WARNING" = "PASSED";
    if (customError > 1.0 || customLatency > 300) {
      slaStatus = "FAILED";
    } else if (customError > 0.7 || customLatency > 220) {
      slaStatus = "WARNING";
    }

    const newRep: HistoricalReport = {
      id,
      timestamp: timestampStr,
      scenarioName: customScenario,
      vus: customVus,
      duration: 30,
      peakRps: customRps,
      avgLatency: customLatency,
      errorRate: customError,
      slaStatus
    };

    setReports(prev => [newRep, ...prev]);
  };

  // Historical reports
  const [reports, setReports] = useState<HistoricalReport[]>(() => {
    const saved = localStorage.getItem("amh_k6_reports");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default initial mock reports for professional appearance
    return [
      {
        id: "rep-1",
        timestamp: "2026-07-20 10:15:22",
        scenarioName: "CAPS/IEB Formula Sandbox Load Test",
        vus: 100,
        duration: 30,
        peakRps: 452,
        avgLatency: 92,
        errorRate: 0.05,
        slaStatus: "PASSED"
      },
      {
        id: "rep-2",
        timestamp: "2026-07-19 16:40:05",
        scenarioName: "AI Matric Trial Simulation Spike",
        vus: 1200,
        duration: 45,
        peakRps: 980,
        avgLatency: 1980,
        errorRate: 1.45,
        slaStatus: "WARNING"
      },
      {
        id: "rep-3",
        timestamp: "2026-07-18 11:22:18",
        scenarioName: "Live Whiteboard Vector Surge",
        vus: 2500,
        duration: 30,
        peakRps: 31200,
        avgLatency: 84,
        errorRate: 0.12,
        slaStatus: "PASSED"
      }
    ];
  });

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  // Save reports
  useEffect(() => {
    localStorage.setItem("amh_k6_reports", JSON.stringify(reports));
  }, [reports]);

  // Compute stats of active simulation
  const getActiveStats = () => {
    if (simulationData.length === 0) {
      return {
        avgRps: 0,
        peakRps: 0,
        avgLatency: 0,
        maxLatency: 0,
        p95Latency: 0,
        totalRequests: 0,
        totalErrors: 0,
        errorRate: 0
      };
    }

    const totalRequests = simulationData.reduce((acc, curr) => acc + curr.successes + curr.errors, 0);
    const totalErrors = simulationData.reduce((acc, curr) => acc + curr.errors, 0);
    const peakRps = Math.max(...simulationData.map(d => d.rps));
    const avgRps = Math.round(totalRequests / simulationData.length);
    const avgLatency = Math.round(simulationData.reduce((acc, curr) => acc + curr.avgLatency, 0) / simulationData.length);
    const maxLatency = Math.max(...simulationData.map(d => d.p95Latency));
    const p95LatenciesSorted = [...simulationData.map(d => d.p95Latency)].sort((a, b) => a - b);
    const p95Latency = p95LatenciesSorted[Math.floor(p95LatenciesSorted.length * 0.95)] || maxLatency;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    return {
      avgRps,
      peakRps,
      avgLatency,
      maxLatency,
      p95Latency,
      totalRequests,
      totalErrors,
      errorRate
    };
  };

  const activeStats = getActiveStats();

  // Get active scenario configuration
  const currentScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  // SLA definitions
  const SLA_LIMITS = {
    avgLatency: 300,        // General API responses average under 300ms
    loginLatency: 500,      // Login under 500ms
    aiLatency: 10000,       // AI prediction under 10s (10000ms)
    errorRate: 1.0          // Error rate under 1%
  };

  // Run the k6 load simulation
  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setCurrentSec(0);
    setSimulationData([]);
    
    const logsList = [
      `[${new Date().toLocaleTimeString()}] k6 v0.49.0 starting...`,
      `[${new Date().toLocaleTimeString()}] loading script: load_test_api.js`,
      `[${new Date().toLocaleTimeString()}] execution: local`,
      `[${new Date().toLocaleTimeString()}] scenarios: (1) ramping-vus on "${currentScenario.name}"`,
      `[${new Date().toLocaleTimeString()}] target: up to ${targetVus} VUs for ${durationSeconds}s`,
      `[${new Date().toLocaleTimeString()}] starting pre-allocation of network threads...`,
      `[${new Date().toLocaleTimeString()}] system limits: [fd: 8192, threads: 16]`
    ];
    setConsoleLogs(logsList);

    let progressTimer = 0;
    const points: SimulationPoint[] = [];

    const interval = setInterval(() => {
      progressTimer += 1;
      const progressPercent = Math.min((progressTimer / durationSeconds) * 100, 100);
      setSimulationProgress(progressPercent);
      setCurrentSec(progressTimer);

      // Determine current VUs based on a ramp-up, maintain, ramp-down curve
      let currentVus = 0;
      const rampUpEnd = Math.floor(durationSeconds * 0.25);
      const rampDownStart = Math.floor(durationSeconds * 0.85);

      if (progressTimer <= rampUpEnd) {
        currentVus = Math.round((progressTimer / rampUpEnd) * targetVus);
      } else if (progressTimer >= rampDownStart) {
        currentVus = Math.round(((durationSeconds - progressTimer) / (durationSeconds - rampDownStart)) * targetVus);
      } else {
        currentVus = targetVus;
      }
      if (currentVus < 1) currentVus = 1;

      // Base latency scales slightly with high VUs to simulate queueing delay/resource exhaustion
      const loadMultiplier = 1 + (currentVus / 2500) * 0.7; // up to 70% increase in latency at 2500+ VUs
      const averageScenarioLatency = currentScenario.endpoints.reduce((acc, ep) => acc + ep.baseLatency, 0) / currentScenario.endpoints.length;
      const calculatedAvgLatency = Math.round(averageScenarioLatency * loadMultiplier + Math.random() * 15 - 7);
      const calculatedP95Latency = Math.round(calculatedAvgLatency * 1.45 + Math.random() * 45 - 20);

      // RPS scales proportionally with VUs, but plateaus at higher concurrencies due to physical thread limits
      const threadSaturationLimit = 3500; // VUs where throughput performance saturates
      const rpsScalingFactor = currentVus > threadSaturationLimit 
        ? threadSaturationLimit + (currentVus - threadSaturationLimit) * 0.1
        : currentVus;
      const calculatedRps = Math.round(rpsScalingFactor * currentScenario.baseRpsPerVu * currentScenario.peakRpsMultiplier + Math.random() * rpsScalingFactor * 0.2);

      // Errors increase if latency is high, or under saturation load, or randomly based on weights
      const isSaturated = currentVus > 1500;
      const baseErrorRatePercent = currentScenario.endpoints.reduce((acc, ep) => acc + ep.errorWeight, 0) * (isSaturated ? 2.5 : 1.0);
      const errorsCount = Math.max(0, Math.round(calculatedRps * (baseErrorRatePercent / 100) + (Math.random() < 0.05 ? Math.random() * 3 : 0)));
      const successesCount = Math.max(0, calculatedRps - errorsCount);

      const newPoint: SimulationPoint = {
        sec: progressTimer,
        vus: currentVus,
        rps: calculatedRps,
        avgLatency: calculatedAvgLatency,
        p95Latency: calculatedP95Latency,
        errors: errorsCount,
        successes: successesCount
      };

      points.push(newPoint);
      setSimulationData([...points]);

      // Add fresh standard out lines to console emulator
      const logTicks = [
        `[${new Date().toLocaleTimeString()}] VU: ${currentVus} | RPS: ${calculatedRps} | Latency: ${calculatedAvgLatency}ms | Error Rate: ${(errorsCount / (calculatedRps || 1) * 100).toFixed(2)}%`,
      ];
      
      if (progressTimer === rampUpEnd) {
        logTicks.push(`[${new Date().toLocaleTimeString()}] INFO: Peak workload target of ${targetVus} VUs fully saturated.`);
      }
      if (progressTimer === rampDownStart) {
        logTicks.push(`[${new Date().toLocaleTimeString()}] INFO: Initiating graceful client ramp-down phase.`);
      }
      if (errorsCount > calculatedRps * 0.02) {
        logTicks.push(`[${new Date().toLocaleTimeString()}] WARNING: SLA threshold breached on error rates! Active error: ${((errorsCount / calculatedRps) * 100).toFixed(2)}%`);
      }

      setConsoleLogs(prev => [...prev, ...logTicks]);

      if (progressTimer >= durationSeconds) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationProgress(100);

        // Finalize k6 stats & save report
        const totalRequests = points.reduce((acc, curr) => acc + curr.successes + curr.errors, 0);
        const totalErrors = points.reduce((acc, curr) => acc + curr.errors, 0);
        const finalErrorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
        const peakRps = Math.max(...points.map(d => d.rps));
        const finalAvgLatency = Math.round(points.reduce((acc, curr) => acc + curr.avgLatency, 0) / points.length);

        // SLA Check
        let finalSlaStatus: "PASSED" | "FAILED" | "WARNING" = "PASSED";
        if (finalErrorRate > SLA_LIMITS.errorRate || finalAvgLatency > SLA_LIMITS.avgLatency) {
          finalSlaStatus = "FAILED";
        } else if (finalErrorRate > SLA_LIMITS.errorRate * 0.7 || finalAvgLatency > SLA_LIMITS.avgLatency * 0.8) {
          finalSlaStatus = "WARNING";
        }

        const newReport: HistoricalReport = {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          scenarioName: currentScenario.name,
          vus: targetVus,
          duration: durationSeconds,
          peakRps: peakRps,
          avgLatency: finalAvgLatency,
          errorRate: finalErrorRate,
          slaStatus: finalSlaStatus
        };

        setReports(prev => [newReport, ...prev]);

        // Output complete test teardown summary
        setConsoleLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] k6 simulation completed successfully.`,
          `================= k6 TEST EXECUTION RESULTS =================`,
          `  Total Run Duration:       ${durationSeconds} seconds`,
          `  Virtual Users (VUs):      ${targetVus} peak`,
          `  Total HTTP Requests:      ${totalRequests.toLocaleString()}`,
          `  Http Throughput Peak:     ${peakRps.toLocaleString()} RPS`,
          `  Avg Request Latency:      ${finalAvgLatency}ms`,
          `  SLA Threshold Failures:   ${totalErrors.toLocaleString()} (Rate: ${finalErrorRate.toFixed(3)}%)`,
          `  Target compliance status: ${finalSlaStatus}`,
          `=============================================================`
        ]);
      }
    }, 1000);

    // Keep handle of active interval on window or local ref if component unmounts
    (window as any).k6ActiveInterval = interval;
  };

  const stopSimulation = () => {
    if ((window as any).k6ActiveInterval) {
      clearInterval((window as any).k6ActiveInterval);
    }
    setIsSimulating(false);
    setConsoleLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🛑 FORCE EXIT SIGINT: User requested immediate simulation cutoff.`
    ]);
  };

  useEffect(() => {
    return () => {
      if ((window as any).k6ActiveInterval) {
        clearInterval((window as any).k6ActiveInterval);
      }
    };
  }, []);

  // Generate simulated breakdown of individual endpoints based on current data
  const getEndpointBreakdown = (): EndpointSummary[] => {
    const isLive = simulationData.length > 0;
    
    return currentScenario.endpoints.map(ep => {
      // Scale latency based on general active metrics
      const activeFactor = isLive ? (activeStats.avgLatency / 150) : 1.0;
      const calculatedAvg = Math.round(ep.baseLatency * activeFactor + (Math.random() * 8 - 4));
      const calculatedP95 = Math.round(calculatedAvg * 1.5 + (Math.random() * 15 - 5));
      const calculatedRequests = isLive 
        ? Math.round(activeStats.totalRequests * (ep.method === "GET" ? 0.6 : 0.4) / currentScenario.endpoints.length)
        : Math.round(Math.random() * 1500 + 100);

      const calculatedErrorRate = isLive
        ? activeStats.errorRate * (ep.errorWeight * 1.2)
        : (ep.errorWeight * 0.4);

      // Determine SLA threshold based on endpoint type
      let epSla = SLA_LIMITS.avgLatency;
      if (ep.path.includes("login")) epSla = SLA_LIMITS.loginLatency;
      if (ep.path.includes("simulate")) epSla = SLA_LIMITS.aiLatency;

      return {
        path: ep.path,
        method: ep.method,
        requests: calculatedRequests,
        avgLatency: calculatedAvg,
        p95Latency: calculatedP95,
        errorRate: parseFloat(calculatedErrorRate.toFixed(2)),
        slaLimit: epSla
      };
    });
  };

  const endpointBreakdown = getEndpointBreakdown();

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      scenario: currentScenario,
      activeStats,
      timeline: simulationData,
      endpointBreakdown
    }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `k6_report_${selectedScenarioId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const triggerCSVDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadHistoricalRunsCSV = () => {
    const headers = ["ID", "Timestamp", "Scenario Name", "Peak VUs", "Duration Seconds", "Peak RPS", "Avg Latency ms", "Error Rate Percent", "SLA Status"];
    const rows = reports.map(rep => [
      rep.id,
      rep.timestamp,
      `"${rep.scenarioName.replace(/"/g, '""')}"`,
      rep.vus,
      rep.duration,
      rep.peakRps,
      rep.avgLatency,
      rep.errorRate.toFixed(3),
      rep.slaStatus
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    triggerCSVDownload(csvContent, `k6_historical_telemetry_registry.csv`);
  };

  const downloadActiveTimelineCSV = () => {
    if (simulationData.length === 0) return;
    const headers = ["Elapsed Second", "Virtual Users VUs", "Throughput RPS", "Avg Latency ms", "p95 Latency ms", "Http Successes", "Http Failures"];
    const rows = simulationData.map(d => [
      d.sec,
      d.vus,
      d.rps,
      d.avgLatency,
      d.p95Latency,
      d.successes,
      d.errors
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    triggerCSVDownload(csvContent, `k6_active_run_timeline_${selectedScenarioId}.csv`);
  };

  const downloadEndpointBreakdownCSV = () => {
    const headers = ["Endpoint Path", "HTTP Method", "Total Calls", "Avg Latency ms", "p95 Latency ms", "Error Rate Percent", "SLA Limit ms", "SLA Status"];
    const rows = endpointBreakdown.map(ep => {
      const isDegraded = ep.errorRate > 1.0 || ep.avgLatency > ep.slaLimit;
      return [
        `"${ep.path}"`,
        ep.method,
        ep.requests,
        ep.avgLatency,
        ep.p95Latency,
        ep.errorRate.toFixed(2),
        ep.slaLimit,
        isDegraded ? "DEGRADED" : "COMPLIANT"
      ];
    });
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    triggerCSVDownload(csvContent, `k6_endpoint_performance_matrix.csv`);
  };

  const downloadInfrastructureStatusCSV = () => {
    const headers = ["Service Key", "Service Name", "Uptime Percent", "Latency ms", "Operational Status", "Metric 1", "Metric 2", "Metric 3"];
    const rows = [
      ["postgres", "PostgreSQL Database (Primary)", "99.96", "14", "nominal", "Connections: 42/150", "Cache Hit Rate: 99.9%", "Queries/Sec: 185"],
      ["redis", "Redis Cache & Sessions", "99.99", "0.8", "nominal", "Memory Used: 14.2 MB", "Hit Rate: 98.4%", "Active Keys: 4820"],
      ["s3", "AWS S3 Object Storage", "99.95", "48", "nominal", "Total Size: 1.42 TB", "Asset Count: 24,180 files", "Bandwidth: 18.4 MB/s"]
    ];
    const csvContent = [headers.join(","), ...rows.map(e => e.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))].join("\n");
    triggerCSVDownload(csvContent, "lms_infrastructure_sla_status_report.csv");
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gauge className="w-6 h-6 text-royal-600 dark:text-royal-400" />
            <h1 className="text-2xl font-black text-navy-900 dark:text-white font-sans tracking-tight">
              k6 Load Testing & SLA Analytics
            </h1>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Real-time performance auditing panel utilizing simulated k6 load-testing runs to validate AMH platform scalability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#124c3e]/10 text-[#124c3e] dark:text-emerald-400 dark:bg-emerald-950/30 rounded border border-emerald-500/10">
            SLA: avg &lt; 300ms
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-950/30 rounded border border-rose-500/10">
            Errors &lt; 1%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:col-span-12 xl:grid-cols-12 gap-6">
        {/* Simulation Controls Sidebar */}
        <div className="xl:col-span-4 bg-navy-50/50 dark:bg-navy-950/15 border border-navy-150 dark:border-navy-800/80 rounded-2xl p-5 space-y-6">
          <div className="flex items-center gap-2 border-b border-navy-100 dark:border-navy-800 pb-3">
            <Sliders className="w-4 h-4 text-royal-500" />
            <h2 className="text-sm font-bold text-navy-800 dark:text-navy-200">Simulation Configurator</h2>
          </div>

          {/* Scenario Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block">Select Target Scenario</label>
            <div className="space-y-2">
              {SCENARIOS.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => !isSimulating && setSelectedScenarioId(sc.id)}
                  disabled={isSimulating}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedScenarioId === sc.id
                      ? "border-royal-500 bg-royal-500/5 text-royal-700 dark:text-royal-300 font-bold shadow-sm"
                      : "border-navy-150 dark:border-navy-800 hover:border-navy-300 dark:hover:border-navy-700 text-navy-600 dark:text-navy-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold">{sc.name}</span>
                    {selectedScenarioId === sc.id && <Zap className="w-3.5 h-3.5 text-royal-500 fill-royal-500 animate-pulse" />}
                  </div>
                  <span className="text-[10px] text-navy-500 dark:text-navy-400 font-normal leading-relaxed">{sc.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Users slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-navy-700 dark:text-navy-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-royal-500" /> Max Concurrency (VUs)
              </label>
              <span className="font-mono font-bold text-royal-600 dark:text-royal-400">{targetVus.toLocaleString()} VUs</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              disabled={isSimulating}
              value={targetVus}
              onChange={(e) => setTargetVus(parseInt(e.target.value))}
              className="w-full h-1.5 bg-navy-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
            />
            <div className="flex justify-between text-[10px] text-navy-500 font-mono">
              <span>50 VUs</span>
              <span>2 500 VUs</span>
              <span>5 000 VUs</span>
            </div>
          </div>

          {/* Test Duration slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-navy-700 dark:text-navy-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-royal-500" /> Target Duration (seconds)
              </label>
              <span className="font-mono font-bold text-royal-600 dark:text-royal-400">{durationSeconds}s</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              disabled={isSimulating}
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(parseInt(e.target.value))}
              className="w-full h-1.5 bg-navy-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
            />
            <div className="flex justify-between text-[10px] text-navy-500 font-mono">
              <span>10s</span>
              <span>60s</span>
              <span>120s</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2">
            {!isSimulating ? (
              <button
                onClick={startSimulation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer group"
              >
                <Play className="w-4 h-4 text-white fill-white transition-transform group-hover:scale-110" />
                <span>Execute k6 Load Simulation</span>
              </button>
            ) : (
              <button
                onClick={stopSimulation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer animate-pulse"
              >
                <StopCircle className="w-4 h-4 text-white" />
                <span>Abort Active Simulation</span>
              </button>
            )}
          </div>

          {/* ======================= DEMO DATA SEED ENGINE ======================= */}
          <div className="border-t border-navy-200/60 dark:border-navy-800/60 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500 animate-pulse" />
                <h2 className="text-sm font-bold text-navy-800 dark:text-navy-200">Demo Seed Engine</h2>
              </div>
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-amber-500/20">
                Mock Helper
              </span>
            </div>

            <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed text-left">
              Instantly prepend synthetic load testing results to the telemetry registry to demonstrate different performance, warnings, or outage states.
            </p>

            {/* Quick Presets Grid */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider block">Quick Presets</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGeneratePreset("passed")}
                  className="px-2.5 py-2 bg-[#124c3e]/10 hover:bg-[#124c3e]/15 border border-[#124c3e]/20 text-[#124c3e] dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-500/10 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>+1 Passed Run</span>
                </button>
                <button
                  onClick={() => handleGeneratePreset("failed")}
                  className="px-2.5 py-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>+1 Failed Run</span>
                </button>
                <button
                  onClick={() => handleGeneratePreset("warning")}
                  className="px-2.5 py-2 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  <span>+1 Warning Run</span>
                </button>
                <button
                  onClick={() => handleGenerateBulk(10)}
                  className="px-2.5 py-2 bg-royal-500/5 hover:bg-royal-500/10 border border-royal-500/20 text-royal-700 dark:text-royal-400 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-royal-500" />
                  <span>+10 Bulk Runs</span>
                </button>
              </div>
            </div>

            {/* Custom Run Builder Form */}
            <div className="border border-navy-150 dark:border-navy-800/80 rounded-xl p-3 bg-white dark:bg-navy-950/40 space-y-3 text-left">
              <span className="text-[10px] font-extrabold text-navy-400 dark:text-navy-500 block uppercase tracking-wider">Custom Run Builder</span>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-navy-600 dark:text-navy-400 block">Scenario Name</label>
                <select
                  value={customScenario}
                  onChange={(e) => setCustomScenario(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-lg text-navy-800 dark:text-navy-200 outline-none focus:border-royal-500"
                >
                  <option value="CAPS/IEB Formula Sandbox Load Test">CAPS/IEB Formula Sandbox Load Test</option>
                  <option value="AI Matric Trial Simulation Spike">AI Matric Trial Simulation Spike</option>
                  <option value="Live Whiteboard Vector Surge">Live Whiteboard Vector Surge</option>
                  <option value="SLA Comprehensive Benchmark Suite">SLA Comprehensive Benchmark Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-600 dark:text-navy-400 block">Peak VUs</label>
                  <input
                    type="number"
                    min="1"
                    value={customVus}
                    onChange={(e) => setCustomVus(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-1.5 bg-navy-50 dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-lg text-navy-800 dark:text-navy-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-600 dark:text-navy-400 block">Peak RPS</label>
                  <input
                    type="number"
                    min="1"
                    value={customRps}
                    onChange={(e) => setCustomRps(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-1.5 bg-navy-50 dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-lg text-navy-800 dark:text-navy-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-600 dark:text-navy-400 block">Avg Latency (ms)</label>
                  <input
                    type="number"
                    min="1"
                    value={customLatency}
                    onChange={(e) => setCustomLatency(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-2.5 py-1.5 bg-navy-50 dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-lg text-navy-800 dark:text-navy-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-600 dark:text-navy-400 block">Error Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={customError}
                    onChange={(e) => setCustomError(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full text-xs px-2.5 py-1.5 bg-navy-50 dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-lg text-navy-800 dark:text-navy-200 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateCustom}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject Custom Telemetry Run</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Visualizers */}
        <div className="xl:col-span-8 space-y-6">
          {/* Real-time Counter Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-xl p-4 space-y-1 text-left">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider block">Virtual Users (VUs)</span>
              <div className="text-2xl font-black text-navy-900 dark:text-white font-mono flex items-baseline gap-1">
                {isSimulating && simulationData.length > 0 ? (
                  simulationData[simulationData.length - 1].vus
                ) : (
                  0
                )}
                <span className="text-xs text-navy-400 font-normal">/ {targetVus}</span>
              </div>
            </div>

            <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-xl p-4 space-y-1 text-left">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider block">Throughput Rate</span>
              <div className="text-2xl font-black text-navy-900 dark:text-white font-mono">
                {isSimulating && simulationData.length > 0 ? (
                  `${simulationData[simulationData.length - 1].rps} RPS`
                ) : (
                  "0 RPS"
                )}
              </div>
            </div>

            <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-xl p-4 space-y-1 text-left">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider block">Response Time (p95)</span>
              <div className="text-2xl font-black text-navy-900 dark:text-white font-mono flex items-baseline gap-1">
                {isSimulating && simulationData.length > 0 ? (
                  `${simulationData[simulationData.length - 1].p95Latency}ms`
                ) : (
                  "0ms"
                )}
                <span className={`text-[10px] font-bold uppercase ${
                  isSimulating && simulationData.length > 0 && simulationData[simulationData.length - 1].p95Latency > 350
                    ? "text-rose-500 animate-pulse"
                    : "text-emerald-500"
                }`}>
                  {isSimulating && simulationData.length > 0 && simulationData[simulationData.length - 1].p95Latency > 350 ? "SLO Alert" : "Healthy"}
                </span>
              </div>
            </div>

            <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-xl p-4 space-y-1 text-left">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider block">Aggregated Error Rate</span>
              <div className="text-2xl font-black font-mono flex items-baseline gap-1 text-navy-900 dark:text-white">
                {isSimulating ? (
                  <span className={activeStats.errorRate > SLA_LIMITS.errorRate ? "text-rose-500" : "text-emerald-500"}>
                    {activeStats.errorRate.toFixed(2)}%
                  </span>
                ) : (
                  "0.00%"
                )}
                <span className="text-[10px] text-navy-400 font-normal">SLA &lt; {SLA_LIMITS.errorRate}%</span>
              </div>
            </div>
          </div>

          {/* Live Progress Bar */}
          {isSimulating && (
            <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-royal-600 dark:text-royal-400 flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-3.5 h-3.5" /> Simulation Run Progress
                </span>
                <span className="text-navy-600 dark:text-navy-400 font-mono">
                  {currentSec}s / {durationSeconds}s ({Math.round(simulationProgress)}%)
                </span>
              </div>
              <div className="w-full bg-navy-200 dark:bg-navy-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-royal-600 h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${simulationProgress}%` }}
                  transition={{ ease: "linear", duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Interactive Recharts Tabs */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-navy-50/40 dark:bg-navy-900/50 border-b border-navy-150 dark:border-navy-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-navy-100/50 dark:bg-navy-900 p-1 rounded-xl">
                <button
                  onClick={() => setActiveMetricTab("overview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMetricTab === "overview"
                      ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-royal-400 shadow-sm"
                      : "text-navy-500 hover:text-navy-800 dark:hover:text-navy-300"
                  }`}
                >
                  General SLO Overview
                </button>
                <button
                  onClick={() => setActiveMetricTab("response")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMetricTab === "response"
                      ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-royal-400 shadow-sm"
                      : "text-navy-500 hover:text-navy-800 dark:hover:text-navy-300"
                  }`}
                >
                  Latency Trends
                </button>
                <button
                  onClick={() => setActiveMetricTab("throughput")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMetricTab === "throughput"
                      ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-royal-400 shadow-sm"
                      : "text-navy-500 hover:text-navy-800 dark:hover:text-navy-300"
                  }`}
                >
                  Throughput RPS
                </button>
                <button
                  onClick={() => setActiveMetricTab("errors")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMetricTab === "errors"
                      ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-royal-400 shadow-sm"
                      : "text-navy-500 hover:text-navy-800 dark:hover:text-navy-300"
                  }`}
                >
                  Http Failures
                </button>
              </div>

              {simulationData.length > 0 && (
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-1.5 text-xs text-royal-600 dark:text-royal-400 hover:underline font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Report JSON
                </button>
              )}
            </div>

            <div className="p-6">
              {simulationData.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-center space-y-3 bg-navy-50/10 dark:bg-navy-950/10 border border-dashed border-navy-200 dark:border-navy-800 rounded-xl p-8">
                  <Activity className="w-10 h-10 text-navy-300 dark:text-navy-600 animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-navy-800 dark:text-navy-200">No active k6 load run is currently buffering</h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm leading-relaxed">
                      Configure your desired virtual student count on the left sidebar and trigger a k6 load test run to inspect real-time performance curves.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-80 w-full text-left">
                  {/* Overview tab: Double Y-Axis area chart showing how RPS and Latency scale with increasing VUs */}
                  {activeMetricTab === "overview" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e40af" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorVus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-navy-100 dark:stroke-navy-800" />
                        <XAxis dataKey="sec" label={{ value: "Seconds", position: "insideBottomRight", offset: -5 }} className="text-[10px] text-navy-400 font-mono" />
                        <YAxis yAxisId="left" label={{ value: "Throughput (RPS)", angle: -90, position: "insideLeft", offset: 10 }} className="text-[10px] text-navy-400 font-mono" />
                        <YAxis yAxisId="right" orientation="right" label={{ value: "Active VUs", angle: 90, position: "insideRight", offset: 10 }} className="text-[10px] text-navy-400 font-mono" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px" }}
                          labelFormatter={(label) => `Time: ${label}s`}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Area yAxisId="left" type="monotone" dataKey="rps" name="Throughput (RPS)" stroke="#1e40af" fillOpacity={1} fill="url(#colorRps)" strokeWidth={2.5} />
                        <Area yAxisId="right" type="monotone" dataKey="vus" name="Virtual Users" stroke="#0d9488" fillOpacity={1} fill="url(#colorVus)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {/* Latency tab: lines showing average latency vs p95 latency with threshold indicators */}
                  {activeMetricTab === "response" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-navy-100 dark:stroke-navy-800" />
                        <XAxis dataKey="sec" className="text-[10px] text-navy-400 font-mono" />
                        <YAxis label={{ value: "Latency (ms)", angle: -90, position: "insideLeft", offset: 10 }} className="text-[10px] text-navy-400 font-mono" />
                        <Tooltip contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px" }} />
                        <Legend verticalAlign="top" height={36} />
                        <Line type="monotone" dataKey="avgLatency" name="Average Latency" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="p95Latency" name="p95 SLA Target" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        <ReferenceLine y={SLA_LIMITS.avgLatency} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "SLA Threshold Limit (300ms)", fill: "#ef4444", fontSize: 10, position: "top" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {/* Throughput tab: throughput volume vs VUs */}
                  {activeMetricTab === "throughput" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-navy-100 dark:stroke-navy-800" />
                        <XAxis dataKey="sec" className="text-[10px] text-navy-400 font-mono" />
                        <YAxis className="text-[10px] text-navy-400 font-mono" />
                        <Tooltip contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px" }} />
                        <Legend verticalAlign="top" height={36} />
                        <Area type="monotone" dataKey="successes" name="Success RPS" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={2} />
                        <Area type="monotone" dataKey="errors" name="Failed RPS" stroke="#ef4444" fillOpacity={0.1} fill="#ef4444" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {/* HTTP Failures tab: Bar chart representation of system block errors */}
                  {activeMetricTab === "errors" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={simulationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-navy-100 dark:stroke-navy-800" />
                        <XAxis dataKey="sec" className="text-[10px] text-navy-400 font-mono" />
                        <YAxis className="text-[10px] text-navy-400 font-mono" />
                        <Tooltip contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px" }} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="errors" name="HTTP Failures (Rate &gt; 1% Alert)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="successes" name="HTTP Passes" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SLA Threshold Compliance Audits */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* SLA Audit Card */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 text-left shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
            <h3 className="text-sm font-bold text-navy-800 dark:text-navy-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-royal-500" /> AMARIS NSC Performance Target Audit
            </h3>
            <span className="text-[9px] font-mono font-black text-navy-400 uppercase">SLA Auditable</span>
          </div>

          <div className="space-y-3">
            {/* General Latency */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-950/30 border border-navy-100 dark:border-navy-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-800 dark:text-navy-200">General API Latency Limit</span>
                <p className="text-[10px] text-navy-500">Must be under 300ms average across all client devices.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-navy-700 dark:text-navy-300">
                  {simulationData.length > 0 ? `${activeStats.avgLatency}ms` : "35ms"}
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                  simulationData.length > 0 && activeStats.avgLatency > SLA_LIMITS.avgLatency
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}>
                  {simulationData.length > 0 && activeStats.avgLatency > SLA_LIMITS.avgLatency ? "VIOLATION" : "COMPLIANT"}
                </span>
              </div>
            </div>

            {/* Login Latency */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-950/30 border border-navy-100 dark:border-navy-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-800 dark:text-navy-200">Authentication Gateways</span>
                <p className="text-[10px] text-navy-500">Post requests for login endpoints must settle within 500ms.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-navy-700 dark:text-navy-300">
                  {simulationData.length > 0 ? `${Math.round(activeStats.avgLatency * 1.25)}ms` : "280ms"}
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                  simulationData.length > 0 && (activeStats.avgLatency * 1.25) > SLA_LIMITS.loginLatency
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}>
                  {simulationData.length > 0 && (activeStats.avgLatency * 1.25) > SLA_LIMITS.loginLatency ? "VIOLATION" : "COMPLIANT"}
                </span>
              </div>
            </div>

            {/* AI Trial Predictor */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-950/30 border border-navy-100 dark:border-navy-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-800 dark:text-navy-200">Gemini Neural Trial Predictions</span>
                <p className="text-[10px] text-navy-500">Heavy Celery backend processing has a threshold maximum SLA of 10s.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-navy-700 dark:text-navy-300">
                  {selectedScenarioId === "ai_trial_spike" && simulationData.length > 0
                    ? `${(activeStats.p95Latency * 4 / 1000).toFixed(2)}s`
                    : "1.85s"}
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`}>
                  COMPLIANT
                </span>
              </div>
            </div>

            {/* Error rate */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-950/30 border border-navy-100 dark:border-navy-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-800 dark:text-navy-200">API Transaction Failure Rate</span>
                <p className="text-[10px] text-navy-500">Acceptable threshold envelope strictly below 1.00% across runs.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-navy-700 dark:text-navy-300">
                  {simulationData.length > 0 ? `${activeStats.errorRate.toFixed(2)}%` : "0.00%"}
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                  simulationData.length > 0 && activeStats.errorRate > SLA_LIMITS.errorRate
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}>
                  {simulationData.length > 0 && activeStats.errorRate > SLA_LIMITS.errorRate ? "VIOLATION" : "COMPLIANT"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live CLI Stdout Console */}
        <div className="bg-[#050b14] border border-navy-800 rounded-2xl p-5 text-left shadow-sm flex flex-col h-72">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4" /> k6-standard-out@amh-k8s:~
            </h3>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded font-bold font-mono">
              tty-live
            </span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 text-emerald-300 scrollbar-thin scrollbar-thumb-navy-800">
            {consoleLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-navy-500 mr-1.5 select-none font-bold">$&gt;</span>
                {log}
              </div>
            ))}
            {consoleLogs.length === 0 && (
              <div className="text-navy-500 italic h-full flex items-center justify-center font-mono">
                Terminal idle. Trigger a k6 test run to output virtual stdout stream lines...
              </div>
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>

        {/* Offline Compliance & CSV Exporter */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 text-left shadow-sm space-y-4 flex flex-col justify-between h-72 overflow-y-auto scrollbar-thin">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
              <h3 className="text-sm font-bold text-navy-800 dark:text-navy-200 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Compliance Export Desk
              </h3>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-mono font-black px-1.5 py-0.5 rounded border border-emerald-500/15">
                CSV COMPILE
              </span>
            </div>

            <p className="text-[11px] text-navy-500 leading-normal">
              Extract tabular reports compatible with corporate infrastructure auditing software, Excel, or telemetry logs decoders.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={downloadHistoricalRunsCSV}
                className="w-full flex items-center justify-between px-3 py-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 rounded-xl text-[11.5px] text-navy-700 dark:text-navy-300 font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-royal-500" /> Telemetry Execution History
                </span>
                <span className="text-[9px] bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-royal-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  {reports.length} runs
                </span>
              </button>

              <button
                onClick={downloadActiveTimelineCSV}
                disabled={simulationData.length === 0}
                className="w-full flex items-center justify-between px-3 py-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 rounded-xl text-[11.5px] text-navy-700 dark:text-navy-300 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-royal-500" /> Active Run Timeline Data
                </span>
                <span className="text-[9px] bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-royal-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  {simulationData.length} pts
                </span>
              </button>

              <button
                onClick={downloadEndpointBreakdownCSV}
                className="w-full flex items-center justify-between px-3 py-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 rounded-xl text-[11.5px] text-navy-700 dark:text-navy-300 font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-royal-500" /> URL Controllers Breakdown
                </span>
                <span className="text-[9px] bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-royal-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  {endpointBreakdown.length} paths
                </span>
              </button>

              <button
                onClick={downloadInfrastructureStatusCSV}
                className="w-full flex items-center justify-between px-3 py-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 rounded-xl text-[11.5px] text-navy-700 dark:text-navy-300 font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-royal-500" /> Core Infrastructure SLA
                </span>
                <span className="text-[9px] bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-royal-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  3 services
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint Performance Table */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 text-left shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-navy-800 dark:text-navy-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-royal-500" /> Endpoint Breakdown Matrix
            </h3>
            <p className="text-[11px] text-navy-500">Individual metrics mapped against the loaded scenario's URL controllers.</p>
          </div>
          <span className="text-xs text-navy-400 font-mono">Count: {endpointBreakdown.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-navy-100 dark:border-navy-850 text-navy-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2.5">Endpoint Path</th>
                <th className="py-2.5">Method</th>
                <th className="py-2.5 text-right">HTTP Calls</th>
                <th className="py-2.5 text-right">Avg Latency</th>
                <th className="py-2.5 text-right">p95 Latency</th>
                <th className="py-2.5 text-right">Error Rate</th>
                <th className="py-2.5 text-right">SLA Target</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
              {endpointBreakdown.map((ep, i) => (
                <tr key={i} className="hover:bg-navy-50/40 dark:hover:bg-navy-950/20 transition-colors">
                  <td className="py-3 font-mono font-bold text-navy-800 dark:text-navy-200">{ep.path}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-black ${
                      ep.method === "POST" ? "bg-royal-500/10 text-royal-600" : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-medium text-navy-600 dark:text-navy-400">
                    {ep.requests.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono font-medium text-navy-800 dark:text-white">
                    {ep.avgLatency}ms
                  </td>
                  <td className="py-3 text-right font-mono text-navy-500">
                    {ep.p95Latency}ms
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-navy-600 dark:text-navy-400">
                    {ep.errorRate.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right font-mono text-navy-400">
                    &lt; {ep.slaLimit}ms
                  </td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      ep.errorRate > 1.0 || ep.avgLatency > ep.slaLimit
                        ? "text-rose-500"
                        : "text-emerald-500"
                    }`}>
                      {ep.errorRate > 1.0 || ep.avgLatency > ep.slaLimit ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" /> Degraded
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Compliant
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Runs Log */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 text-left shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-navy-800 dark:text-navy-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-royal-500" /> k6 Telemetry Execution Registry
            </h3>
            <p className="text-[11px] text-navy-500">Historical logs of previous simulated runs saved locally.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Clear historical runs?")) {
                setReports([]);
              }
            }}
            className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
          >
            Purge History
          </button>
        </div>

        <div className="space-y-2">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-navy-100 dark:border-navy-800/80 rounded-xl hover:border-royal-300 dark:hover:border-navy-700 transition-all text-xs gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-800 dark:text-navy-200">{rep.scenarioName}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    rep.slaStatus === "PASSED"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : rep.slaStatus === "WARNING"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {rep.slaStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-navy-500 font-mono">
                  <span>VUs: {rep.vus}</span>
                  <span>Duration: {rep.duration}s</span>
                  <span>Time: {rep.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:text-right">
                <div className="space-y-0.5 font-mono">
                  <span className="text-[10px] text-navy-400 uppercase block tracking-wider">Peak RPS</span>
                  <span className="font-bold text-navy-800 dark:text-navy-300">{rep.peakRps.toLocaleString()} RPS</span>
                </div>
                <div className="space-y-0.5 font-mono">
                  <span className="text-[10px] text-navy-400 uppercase block tracking-wider">Avg Latency</span>
                  <span className="font-bold text-navy-800 dark:text-navy-300">{rep.avgLatency}ms</span>
                </div>
                <div className="space-y-0.5 font-mono">
                  <span className="text-[10px] text-navy-400 uppercase block tracking-wider">Error Rate</span>
                  <span className="font-bold text-navy-800 dark:text-navy-300">{rep.errorRate.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="text-center py-6 text-navy-500 italic">No previous k6 runs recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};
