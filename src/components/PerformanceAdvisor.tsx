import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Cpu, Database, AlertTriangle, CheckCircle, Gauge, RefreshCw,
  TrendingUp, Play, ArrowRight, ChevronRight, Code, FileText, Lightbulb,
  Sliders, Activity, HardDrive, ShieldAlert, Zap, AlertCircle, History, Terminal
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
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

interface OptimizationRecommendation {
  id: string;
  title: string;
  category: "database" | "server" | "caching" | "infrastructure";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  whyThisBottleneck: string;
  impactAssessment: string;
  actionPlan: string[];
  codeSnippet: string;
  codeLanguage: string;
}

export const PerformanceAdvisor: React.FC = () => {
  // Simulator State (Sliders)
  const [cpuUsage, setCpuUsage] = useState<number>(78);
  const [memUsage, setMemUsage] = useState<number>(84);
  const [avgQueryTime, setAvgQueryTime] = useState<number>(145); // ms
  const [cacheHitRatio, setCacheHitRatio] = useState<number>(62); // %
  const [activeQueueDepth, setActiveQueueDepth] = useState<number>(120); // jobs

  // Selected Profile
  const [selectedProfile, setSelectedProfile] = useState<string>("exam-rush");

  // Diagnostic Logs Console
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState<boolean>(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<number>(100);

  // Selected recommendation for side drawer/detail panel
  const [selectedRecId, setSelectedRecId] = useState<string | null>("REC-001");

  // Benchmark history retrieved from local storage
  const [recentRuns, setRecentRuns] = useState<LoadTestHistoryItem[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  // Load benchmark history on mount
  useEffect(() => {
    const saved = localStorage.getItem("amh_load_test_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentRuns(parsed);
        } else {
          loadSeedHistory();
        }
      } catch (e) {
        console.error("Failed to parse history", e);
        loadSeedHistory();
      }
    } else {
      loadSeedHistory();
    }
  }, []);

  const loadSeedHistory = () => {
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
      },
      {
        id: "RUN-704",
        timestamp: new Date(Date.now() - 3600000 * 48).toLocaleString(),
        tool: "wrk",
        targetUrl: "https://amh-portal.co.za/api/v1/pdf-compile",
        users: 8000,
        spawnRate: 350,
        duration: 60,
        peakRps: 6200,
        avgLatency: 285,
        errorRate: 8.20,
        status: "Failed"
      }
    ];
    setRecentRuns(seed);
    if (!localStorage.getItem("amh_load_test_history")) {
      localStorage.setItem("amh_load_test_history", JSON.stringify(seed));
    }
  };

  const correlateHistoricalRun = (run: LoadTestHistoryItem) => {
    setSelectedRunId(run.id);
    setIsRunningDiagnostic(true);
    setDiagnosticProgress(0);
    setDiagnosticLogs([
      `[CORRELATOR] Parsing historical load test log: [${run.id}]`,
      `[CORRELATOR] Target endpoint: ${run.targetUrl}`,
      `[CORRELATOR] Correlating ${run.users} virtual users (VUs) with local hypervisor CPU scheduler...`
    ]);

    // Calculate correlated system metrics
    const targetCpu = Math.min(98, Math.max(20, Math.round(15 + (run.users / 110) + (run.peakRps / 120))));
    const targetMem = Math.min(95, Math.max(30, Math.round(25 + (run.users / 130) + (run.avgLatency / 10))));
    const targetQueryTime = Math.min(500, Math.max(10, Math.round(run.avgLatency * 1.2)));
    const targetCacheHit = Math.max(15, Math.min(99, Math.round(98 - (run.avgLatency / 3.5) - (run.errorRate * 4))));
    const targetQueue = Math.min(1000, Math.max(0, Math.round((run.errorRate * 50) + (run.users / 12))));

    let logSequence = [
      `[CORRELATOR] Computed CPU Load Saturation: ${targetCpu}%`,
      `[CORRELATOR] Computed Physical memory block allocation: ${targetMem}%`,
      `[CORRELATOR] PostgreSQL back-propagation query delay: ${targetQueryTime}ms`,
      `[CORRELATOR] Computed Redis Cache hit ratio: ${targetCacheHit}%`,
      `[CORRELATOR] Estimated queued worker thread depth: ${targetQueue} tasks`,
      `[CORRELATOR] System telemetry correlated successfully. Generating prioritizations...`
    ];

    let currentLogIdx = 0;
    const logInterval = setInterval(() => {
      if (currentLogIdx < logSequence.length) {
        setDiagnosticLogs(prev => [...prev, logSequence[currentLogIdx]]);
        currentLogIdx++;
        setDiagnosticProgress(Math.floor((currentLogIdx / logSequence.length) * 100));
      } else {
        clearInterval(logInterval);
        setIsRunningDiagnostic(false);
        // Apply computed metrics
        setCpuUsage(targetCpu);
        setMemUsage(targetMem);
        setAvgQueryTime(targetQueryTime);
        setCacheHitRatio(targetCacheHit);
        setActiveQueueDepth(targetQueue);
      }
    }, 300);
  };

  // Update simulator parameters based on presets
  const applyPreset = (preset: string) => {
    setSelectedProfile(preset);
    setIsRunningDiagnostic(true);
    setDiagnosticProgress(0);
    setDiagnosticLogs([
      `[DIAGNOSTIC] Initializing system performance analysis core...`,
      `[DIAGNOSTIC] Loading environment profile preset: [${preset.toUpperCase()}]`
    ]);

    let logSequence = [
      "[DIAGNOSTIC] Scanning virtual machine hypervisor registers...",
      "[DIAGNOSTIC] Analyzing PostgreSQL pg_stat_statements query execution trees...",
      "[DIAGNOSTIC] Correlating Redis key eviction count vs memory fragmentation...",
      "[DIAGNOSTIC] Measuring queue latency standard deviation on background workers...",
      "[DIAGNOSTIC] Evaluating CAPS Sandbox formula execution microbenchmarks...",
      "[DIAGNOSTIC] Diagnostic run finalized. Synthesis complete."
    ];

    let currentLogIdx = 0;
    const logInterval = setInterval(() => {
      if (currentLogIdx < logSequence.length) {
        setDiagnosticLogs(prev => [...prev, logSequence[currentLogIdx]]);
        currentLogIdx++;
        setDiagnosticProgress(Math.floor((currentLogIdx / logSequence.length) * 100));
      } else {
        clearInterval(logInterval);
        setIsRunningDiagnostic(false);
      }
    }, 400);

    switch (preset) {
      case "normal":
        setCpuUsage(34);
        setMemUsage(42);
        setAvgQueryTime(24);
        setCacheHitRatio(94);
        setActiveQueueDepth(4);
        break;
      case "exam-rush":
        setCpuUsage(88);
        setMemUsage(91);
        setAvgQueryTime(240);
        setCacheHitRatio(48);
        setActiveQueueDepth(450);
        break;
      case "batch-processing":
        setCpuUsage(95);
        setMemUsage(68);
        setAvgQueryTime(78);
        setCacheHitRatio(81);
        setActiveQueueDepth(850);
        break;
      case "db-stress":
        setCpuUsage(62);
        setMemUsage(89);
        setAvgQueryTime(410);
        setCacheHitRatio(35);
        setActiveQueueDepth(85);
        break;
    }
  };

  // Run full system diagnostic on parameters
  const runFullDiagnostic = () => {
    applyPreset(selectedProfile);
  };

  // Generate dynamic recommendations based on sliders
  const getDynamicRecommendations = (): OptimizationRecommendation[] => {
    const list: OptimizationRecommendation[] = [];

    // 1. Database Indexing
    if (avgQueryTime > 100) {
      list.push({
        id: "REC-001",
        title: "Create Database Index on High-Volume Portal Tables",
        category: "database",
        severity: avgQueryTime > 250 ? "critical" : "high",
        description: "The database query analyzer detected sequential table scans on `amh_homework_submissions` and `amh_bookings` tables. Sequential scans lock major blocks of memory, raising average query execution times.",
        whyThisBottleneck: `Average database query time is currently ${avgQueryTime}ms (SLA target is < 50ms). Observed high sequential reads during trial score visualizer load loops.`,
        impactAssessment: "Estimated latency reduction: -65% average query response lag (~22ms index seek vs scan).",
        actionPlan: [
          "Establish secondary composite B-Tree indexes for student profile IDs.",
          "Optimize JOIN query paths in homework tracking aggregates.",
          "Run VACUUM ANALYZE to update PostgreSQL optimizer query statistics charts."
        ],
        codeSnippet: `-- PostgreSQL Index Optimization Script
CREATE INDEX CONCURRENTLY idx_submissions_student_homework 
ON amh_homework_submissions (student_id, homework_assignment_id);

CREATE INDEX CONCURRENTLY idx_bookings_tutor_date 
ON amh_bookings (tutor_id, scheduled_date);

VACUUM ANALYZE amh_homework_submissions;`,
        codeLanguage: "sql"
      });
    }

    // 2. Gunicorn / Node worker thread expansion
    if (cpuUsage > 75 || activeQueueDepth > 200) {
      list.push({
        id: "REC-002",
        title: "Exhausted Worker Pool: Scale Gunicorn/Node Worker Count",
        category: "server",
        severity: cpuUsage > 85 ? "critical" : "high",
        description: "The application core cluster is suffering from thread starvation. Available server instances are blocking on synchronous PDF generation or CAPS limit calculations, forcing subsequent student API requests to wait in queues.",
        whyThisBottleneck: `Server CPU usage is sustained at ${cpuUsage}%, and background task queue depth is ${activeQueueDepth} jobs. VUs are experiencing high scheduling overhead.`,
        impactAssessment: "Boost throughput capacity by up to 140% under concurrent peak NSC exam loads.",
        actionPlan: [
          "Increase server process concurrency from default threads to scale dynamically with CPU core availability.",
          "Migrate heavy PDF and video requests to asynchronous background queues.",
          "Adjust system process priority (nice levels) for Node web servers."
        ],
        codeSnippet: `# Scale Express/Vite Cluster Workers or Gunicorn/Uvicorn configuration
# Recommended configuration: 2 * (Number of CPU Cores) + 1
export WEB_CONCURRENCY=4
pm2 scale amh-server 4 --max-memory-restart 1G

# If using Python background wrappers:
gunicorn --workers=9 --threads=4 --worker-class=gthread server:app`,
        codeLanguage: "bash"
      });
    }

    // 3. Redis / Memcached eviction and sizing
    if (cacheHitRatio < 75) {
      list.push({
        id: "REC-003",
        title: "Optimize Cache Invalidation Policy & Increase Size",
        category: "caching",
        severity: cacheHitRatio < 50 ? "high" : "medium",
        description: "Low cache hit ratio causes too many read requests to fall through directly to the database layer, choking resources. Static formula sheets and catalog endpoints should be kept warm in-memory.",
        whyThisBottleneck: `Cache Hit Ratio is currently ${cacheHitRatio}% (SLA recommends > 85% for exam portals). This causes high disk IOPS load on the main storage container.`,
        impactAssessment: "Saves up to 45% DB read cycles, slashing p95 response latencies to single digits.",
        actionPlan: [
          "Change Redis maxmemory eviction policy to volatile-lru (Least Recently Used).",
          "Extend TTL expiration for static IEB/CAPS formula sheets to 24 hours.",
          "Implement cache pre-heating (warming) scripts before active morning tutoring hours."
        ],
        codeSnippet: `# Redis Runtime Memory and Eviction Tuning Commands
redis-cli CONFIG SET maxmemory 1073741824 # Scale to 1GB RAM
redis-cli CONFIG SET maxmemory-policy volatile-lru

# Verify key expiration and distribution
redis-cli INFO stats | grep keyspace_hits_ratio`,
        codeLanguage: "bash"
      });
    }

    // 4. Asynchronous PDF & Video Processing
    if (activeQueueDepth > 50) {
      list.push({
        id: "REC-004",
        title: "Transition Heavy PDF Compiles to Background Jobs",
        category: "infrastructure",
        severity: activeQueueDepth > 300 ? "high" : "medium",
        description: "Rendering CAPS homework worksheets and trial paper answer keys is blocking the active student navigation worker loop. Users encounter timeout errors when generating big PDF files during examination periods.",
        whyThisBottleneck: `Task queue depth is at ${activeQueueDepth} pending jobs. Server is processing large homework file attachments synchronously.`,
        impactAssessment: "Isolates response-critical HTTP endpoints from slow system file compilations.",
        actionPlan: [
          "Integrate asynchronous background work queues.",
          "Deploy separate worker processes dedicated solely to PDF rendering and telemetry logging.",
          "Implement WebSockets or polling alerts on the student dashboard for worksheet readiness notifications."
        ],
        codeSnippet: `// Example Transitioning to Background Queue Processing
// Instead of synchronous server rendering:
app.post("/api/homework/compile", async (req, res) => {
  // ❌ BAD: Blocking active HTTP thread
  // const pdf = await compilePDF(req.body);
  
  // ✅ GOOD: Delegate to Background Queue (Nodemailer / BullMQ)
  const job = await pdfQueue.add({
    assignmentId: req.body.id,
    studentEmail: req.user.email
  });
  
  return res.status(202).json({ jobId: job.id, status: "queued" });
});`,
        codeLanguage: "typescript"
      });
    }

    // 5. Regional Load Balancing & CDN Edge Caching
    if (list.length === 0) {
      // Static baseline low priority
      list.push({
        id: "REC-005",
        title: "Incorporate Regional Cloudflare CDN Edge Caching",
        category: "infrastructure",
        severity: "low",
        description: "Static resource assets (algebra guides, IEB trig charts, exam mock sheets) are served directly from the Johannesburg origin server, increasing network overhead for Durban or Cape Town students.",
        whyThisBottleneck: "Baseline latency optimization for geographically distributed high school students.",
        impactAssessment: "Reduces initial Page Load time by 40% for students outside Gauteng province.",
        actionPlan: [
          "Configure cloud CDN caching rules for static resources in public assets directory.",
          "Enable edge response gzip compression schemas."
        ],
        codeSnippet: `# Cloudflare Page Rules CDN configuration
# Match: https://amh-portal.co.za/assets/*
# Setting: Cache Level = Cache Everything, Edge Cache TTL = 7 Days`,
        codeLanguage: "plaintext"
      });
    }

    return list;
  };

  const recommendations = getDynamicRecommendations();

  // Calculate Overall SLA Readiness Score based on current simulated metrics
  const calculateSlaScore = (): number => {
    let score = 100;
    // Deduct for CPU above 70%
    if (cpuUsage > 70) score -= (cpuUsage - 70) * 0.4;
    // Deduct for memory above 80%
    if (memUsage > 80) score -= (memUsage - 80) * 0.3;
    // Deduct for high query times
    if (avgQueryTime > 50) score -= (avgQueryTime - 50) * 0.12;
    // Deduct for low cache hits
    if (cacheHitRatio < 85) score -= (85 - cacheHitRatio) * 0.25;
    // Deduct for queue backlog
    if (activeQueueDepth > 50) score -= Math.min(15, (activeQueueDepth - 50) * 0.05);

    return Math.max(10, Math.round(score));
  };

  const slaScore = calculateSlaScore();

  // Radar chart showing system health dimension weights
  const systemMetricsRadarData = [
    { subject: "Database Efficiency", val: Math.max(15, 100 - (avgQueryTime / 5)) },
    { subject: "Memory Safety", val: Math.max(15, 100 - memUsage) },
    { subject: "CPU Headroom", val: Math.max(15, 100 - cpuUsage) },
    { subject: "Cache Ratio", val: cacheHitRatio },
    { subject: "Queue Processing", val: Math.max(15, 100 - Math.min(85, activeQueueDepth / 10)) }
  ];

  const getSeverityBadge = (severity: "critical" | "high" | "medium" | "low") => {
    switch (severity) {
      case "critical":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-royal-500/15 text-royal-600 dark:text-royal-400 border-royal-500/30";
      case "low":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
  };

  const getCategoryIcon = (category: "database" | "server" | "caching" | "infrastructure") => {
    switch (category) {
      case "database":
        return <Database className="w-3.5 h-3.5" />;
      case "server":
        return <Cpu className="w-3.5 h-3.5" />;
      case "caching":
        return <Zap className="w-3.5 h-3.5" />;
      case "infrastructure":
        return <HardDrive className="w-3.5 h-3.5" />;
    }
  };

  const currentSelectedRec = recommendations.find(r => r.id === selectedRecId) || recommendations[0];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-navy-150 dark:border-navy-800 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-gold-500/15 border border-gold-500/30 text-gold-600 dark:text-gold-400 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-wider font-sans">Performance Optimization Advisor</h2>
          </div>
          <span className="text-[10px] bg-royal-500/15 text-royal-600 px-3 py-1 rounded-full font-black uppercase font-mono tracking-wider">
            AI-Driven Recommendations Engine
          </span>
        </div>
        <p className="text-xs text-navy-500 dark:text-navy-400">
          The expert system analyzes latest mock load benchmarks, correlates with simulated system telemetry (Gunicorn threading, memory blocks, sequential reads), and produces prioritized, production-ready remediation guides.
        </p>
      </div>

      {/* Historical Load Benchmark Correlation Center */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-navy-50 dark:border-navy-850 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-gold-500" />
              Historical Load Benchmark Correlation Center
            </h3>
            <p className="text-[11px] text-navy-500">
              Select a cluster benchmark run from history. The system will reverse-engineer load factors and auto-map system telemetry.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-navy-400 bg-navy-50 dark:bg-navy-950 px-2.5 py-1 rounded border border-navy-100 dark:border-navy-850">
            {recentRuns.length} Logs Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recentRuns.map((run) => {
            const isSelected = selectedRunId === run.id;
            return (
              <button
                key={run.id}
                type="button"
                onClick={() => correlateHistoricalRun(run)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer block relative ${
                  isSelected
                    ? "bg-navy-950 border-gold-400 text-white shadow-md scale-[1.01]"
                    : "bg-navy-50/40 dark:bg-navy-950/20 hover:bg-navy-50/90 border-navy-100 dark:border-navy-850 text-navy-800 dark:text-navy-300"
                }`}
              >
                {/* Badge top-right */}
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">
                    {run.id} • {run.tool.toUpperCase()}
                  </span>
                  <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border ${
                    run.status === "Passed"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : run.status === "Degraded"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  }`}>
                    {run.status}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <h4 className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-gold-400" : "text-navy-900 dark:text-white"}`}>
                    {run.targetUrl.replace("https://", "")}
                  </h4>
                  <span className="text-[10px] text-navy-400 font-mono block">
                    Executed: {run.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-navy-100/10 text-[10px] font-mono text-navy-400">
                  <div>
                    <span className="text-[8px] block uppercase text-navy-400">VUs</span>
                    <span className={`font-bold ${isSelected ? "text-white" : "text-navy-700 dark:text-navy-200"}`}>{run.users.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[8px] block uppercase text-navy-400">Peak RPS</span>
                    <span className={`font-bold ${isSelected ? "text-white" : "text-navy-700 dark:text-navy-200"}`}>{run.peakRps.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[8px] block uppercase text-navy-400">Latency</span>
                    <span className={`font-bold ${run.avgLatency > 150 ? "text-rose-500" : run.avgLatency > 80 ? "text-amber-500" : "text-emerald-500"}`}>{run.avgLatency}ms</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Diagnostic stream overlay */}
        {diagnosticLogs.length > 0 && (
          <div className="bg-navy-950 rounded-xl border border-navy-850 p-3.5 mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-gold-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-ping" />
                Active Diagnostic Correlation Stream
              </span>
              <span className="text-[9px] font-mono text-navy-400">
                Process Thread ID: AMH-DIAG-{(selectedRunId || "PRES").replace("RUN-", "")}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-navy-900 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-gold-400 h-1 transition-all duration-300"
                style={{ width: `${diagnosticProgress}%` }}
              />
            </div>

            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-emerald-400">
              {diagnosticLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-navy-600 shrink-0 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tunable Simulators & Score Dials (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* SLA Performance Score Card */}
          <div className="bg-navy-950 text-white p-5 rounded-2xl border border-navy-850 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[9px] font-mono font-black text-gold-400 uppercase tracking-widest block mb-1">CAPS/IEB Platform Health</span>
            <h3 className="text-sm font-sans font-black uppercase tracking-wider text-navy-200">SLA Readiness Score</h3>

            <div className="flex items-center gap-4 py-3">
              <div className="relative flex items-center justify-center">
                {/* Score Dial */}
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="stroke-navy-800"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className={`${slaScore > 80 ? "stroke-emerald-500" : slaScore > 50 ? "stroke-amber-400" : "stroke-rose-500"} transition-all duration-1000`}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * slaScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-black font-mono text-white">{slaScore}%</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-navy-300">SLA Status Evaluation:</div>
                <div className="text-sm font-black font-mono">
                  {slaScore > 85 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> SECURED
                    </span>
                  ) : slaScore > 60 ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 animate-bounce" /> DEGRADED
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 animate-pulse" /> HIGH RISK
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-navy-400 leading-tight">
                  {slaScore > 85
                    ? "Systems configured optimally for maximum matriculant traffic."
                    : "Action items below require immediate administrator review."}
                </p>
              </div>
            </div>
          </div>

          {/* Preset Environment Loader */}
          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm space-y-3">
            <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
              1. Load Scenario Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset("normal")}
                className={`p-2 rounded-xl text-[11px] font-bold font-sans border text-center transition-all cursor-pointer ${
                  selectedProfile === "normal"
                    ? "bg-navy-950 text-gold-400 border-gold-400 font-extrabold"
                    : "border-navy-100 hover:bg-navy-50 text-navy-600 dark:text-navy-400 dark:border-navy-850"
                }`}
              >
                Normal Day Workload
              </button>
              <button
                type="button"
                onClick={() => applyPreset("exam-rush")}
                className={`p-2 rounded-xl text-[11px] font-bold font-sans border text-center transition-all cursor-pointer ${
                  selectedProfile === "exam-rush"
                    ? "bg-navy-950 text-gold-400 border-gold-400 font-extrabold"
                    : "border-navy-100 hover:bg-navy-50 text-navy-600 dark:text-navy-400 dark:border-navy-850"
                }`}
              >
                Final Matric Exam Rush
              </button>
              <button
                type="button"
                onClick={() => applyPreset("batch-processing")}
                className={`p-2 rounded-xl text-[11px] font-bold font-sans border text-center transition-all cursor-pointer ${
                  selectedProfile === "batch-processing"
                    ? "bg-navy-950 text-gold-400 border-gold-400 font-extrabold"
                    : "border-navy-100 hover:bg-navy-50 text-navy-600 dark:text-navy-400 dark:border-navy-850"
                }`}
              >
                Asynchronous PDF Batch
              </button>
              <button
                type="button"
                onClick={() => applyPreset("db-stress")}
                className={`p-2 rounded-xl text-[11px] font-bold font-sans border text-center transition-all cursor-pointer ${
                  selectedProfile === "db-stress"
                    ? "bg-navy-950 text-gold-400 border-gold-400 font-extrabold"
                    : "border-navy-100 hover:bg-navy-50 text-navy-600 dark:text-navy-400 dark:border-navy-850"
                }`}
              >
                DB Sequential Scans
              </button>
            </div>
          </div>

          {/* Interactive Sliders (Tune Simulated Loads) */}
          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-800 pb-2">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                2. Live Telemetry Simulators
              </span>
              <Sliders className="w-4 h-4 text-royal-500" />
            </div>

            {/* Slider: CPU Usage */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-navy-500 uppercase font-bold">
                <span>CPU Core Saturation</span>
                <span className={cpuUsage > 80 ? "text-rose-500 font-bold" : "text-navy-800 dark:text-white"}>{cpuUsage}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={cpuUsage}
                onChange={(e) => {
                  setCpuUsage(parseInt(e.target.value));
                  setSelectedProfile("custom");
                }}
                className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
              />
            </div>

            {/* Slider: Memory Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-navy-500 uppercase font-bold">
                <span>RAM Usage Blocks</span>
                <span className={memUsage > 85 ? "text-rose-500 font-bold" : "text-navy-800 dark:text-white"}>{memUsage}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={memUsage}
                onChange={(e) => {
                  setMemUsage(parseInt(e.target.value));
                  setSelectedProfile("custom");
                }}
                className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
              />
            </div>

            {/* Slider: Avg Query Time */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-navy-500 uppercase font-bold">
                <span>Database Query Latency</span>
                <span className={avgQueryTime > 150 ? "text-amber-500 font-bold" : "text-navy-800 dark:text-white"}>{avgQueryTime} ms</span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={avgQueryTime}
                onChange={(e) => {
                  setAvgQueryTime(parseInt(e.target.value));
                  setSelectedProfile("custom");
                }}
                className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
              />
            </div>

            {/* Slider: Cache Hit Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-navy-500 uppercase font-bold">
                <span>Redis Cache Hit Rate</span>
                <span className={cacheHitRatio < 70 ? "text-amber-500 font-bold" : "text-navy-800 dark:text-white"}>{cacheHitRatio}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={cacheHitRatio}
                onChange={(e) => {
                  setCacheHitRatio(parseInt(e.target.value));
                  setSelectedProfile("custom");
                }}
                className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
              />
            </div>

            {/* Slider: Task Queue Depth */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-navy-500 uppercase font-bold">
                <span>Active Celery Queue Jobs</span>
                <span className={activeQueueDepth > 200 ? "text-amber-500 font-bold" : "text-navy-800 dark:text-white"}>{activeQueueDepth} items</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={10}
                value={activeQueueDepth}
                onChange={(e) => {
                  setActiveQueueDepth(parseInt(e.target.value));
                  setSelectedProfile("custom");
                }}
                className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
              />
            </div>

            <button
              type="button"
              onClick={runFullDiagnostic}
              disabled={isRunningDiagnostic}
              className="w-full py-2.5 bg-royal-600 hover:bg-royal-700 disabled:opacity-55 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? "animate-spin" : ""}`} />
              Run System Diagnostic Analyzer
            </button>
          </div>
        </div>

        {/* Right Column: Recommendations List (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Radar System Health Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl shadow-sm">
            <div className="md:col-span-5 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                  3. System Dimensions Analyzer
                </span>
                <h3 className="text-base font-sans font-black text-navy-900 dark:text-white uppercase tracking-wider">
                  Operational Balance Radar
                </h3>
                <p className="text-xs text-navy-500 leading-relaxed">
                  Visualization of resource availability parameters. Values closer to 100 represent perfect performance overhead capacity; dips indicate critical bottlenecks.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-navy-50 dark:border-navy-800">
                <span className="text-[10px] font-mono text-navy-400 uppercase block font-bold">Diagnosed Critical Triggers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {cpuUsage > 80 && (
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-rose-500/15 text-rose-500 border border-rose-500/20">
                      Thread Exhaustion
                    </span>
                  )}
                  {avgQueryTime > 150 && (
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                      Sequential Read
                    </span>
                  )}
                  {cacheHitRatio < 65 && (
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-royal-500/15 text-royal-500 border border-royal-500/20">
                      Cache Leakage
                    </span>
                  )}
                  {activeQueueDepth > 300 && (
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                      Queue Jammed
                    </span>
                  )}
                  {cpuUsage <= 80 && avgQueryTime <= 150 && cacheHitRatio >= 65 && activeQueueDepth <= 300 && (
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                      Stable SLA Normal
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-7 h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={systemMetricsRadarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" className="text-[9px] font-mono fill-navy-600 dark:fill-navy-300" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-[8px] font-mono" />
                  <Radar name="Active Metrics State" dataKey="val" stroke="#1e3a8a" fill="#3b82f6" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actionable Recommendations Header */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-850 pb-2">
              <h3 className="text-sm font-black font-sans text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-gold-500" />
                Remediation Optimization Advisor List
              </h3>
              <span className="text-xs font-mono text-navy-400">
                {recommendations.length} items prioritized
              </span>
            </div>

            {/* List and Expanded Detail Flex Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Recommendations mini-cards (Span 5) */}
              <div className="md:col-span-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {recommendations.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setSelectedRecId(rec.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer block relative ${
                      selectedRecId === rec.id
                        ? "bg-navy-950 border-gold-400 text-white dark:bg-navy-950 dark:border-gold-400 shadow-sm"
                        : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-800 text-navy-800 hover:bg-navy-50/60 dark:hover:bg-navy-950/40"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[8px] font-mono font-black text-navy-400 block uppercase tracking-wider">
                        {rec.id} • {rec.category}
                      </span>
                      <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border ${getSeverityBadge(rec.severity)}`}>
                        {rec.severity}
                      </span>
                    </div>

                    <h4 className={`text-xs font-black font-sans mt-1.5 leading-tight ${selectedRecId === rec.id ? "text-gold-400" : "text-navy-900 dark:text-white"}`}>
                      {rec.title}
                    </h4>

                    <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-mono text-navy-500">
                      {getCategoryIcon(rec.category)}
                      <span className="capitalize">{rec.category} focus</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Recommendation Detailed View (Span 7) */}
              <div className="md:col-span-7 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm space-y-4">
                {currentSelectedRec ? (
                  <div className="space-y-4">
                    {/* Severity and Title */}
                    <div className="flex justify-between items-start border-b border-navy-50 dark:border-navy-850 pb-2.5">
                      <div>
                        <span className="text-[9px] font-mono font-black text-navy-400 block uppercase tracking-wider">
                          Prioritized Fix • {currentSelectedRec.id}
                        </span>
                        <h4 className="text-sm font-black font-sans text-navy-900 dark:text-white uppercase tracking-wide mt-1">
                          {currentSelectedRec.title}
                        </h4>
                      </div>
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border shrink-0 ${getSeverityBadge(currentSelectedRec.severity)}`}>
                        {currentSelectedRec.severity} Priority
                      </span>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-mono font-black text-navy-500 uppercase tracking-widest block">Issue Diagnosis</span>
                        <p className="text-xs text-navy-600 dark:text-navy-300 mt-1 leading-relaxed">
                          {currentSelectedRec.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-navy-50/50 dark:bg-navy-950/40 p-2.5 rounded-xl border border-navy-100 dark:border-navy-850">
                        <div>
                          <span className="text-[8px] font-mono font-black text-navy-400 uppercase block">Bottleneck Correlated</span>
                          <p className="text-[10px] font-semibold text-navy-800 dark:text-navy-200 mt-0.5">
                            {currentSelectedRec.whyThisBottleneck}
                          </p>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono font-black text-navy-400 uppercase block">Expected Impact</span>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {currentSelectedRec.impactAssessment}
                          </p>
                        </div>
                      </div>

                      {/* Action Plan */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-black text-navy-500 uppercase tracking-widest block">Action Plan Guide</span>
                        <ul className="space-y-1.5 text-xs text-navy-600 dark:text-navy-300">
                          {currentSelectedRec.actionPlan.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-royal-500 mt-0.5 font-bold font-mono">[{idx + 1}]</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Deployment Snippet */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-black text-navy-500 uppercase tracking-widest block flex items-center gap-1">
                          <Code className="w-3 h-3 text-royal-500" />
                          Remediation Code & CLI commands
                        </span>
                        <pre className="bg-navy-950 text-emerald-400 text-[10px] font-mono p-3 rounded-xl overflow-x-auto leading-relaxed border border-navy-850 shadow-inner">
                          <code>{currentSelectedRec.codeSnippet}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-navy-400 italic text-xs">
                    Please select an optimization recommendation card.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
