import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, Terminal, Cpu, Layers, HardDrive, Server, RefreshCw, Play, Square, 
  Skull, TrendingUp, Coins, Users, Video, Mail, FileText, PlusCircle, Download, 
  AlertTriangle, CheckCircle2, MessageSquare, Settings, Clock, Compass, Network, 
  Database, ShieldAlert, CheckCircle, Info, Send, ChevronRight, Trash2, Edit3,
  Pause, Sliders, Copy, Plus, X, ShieldCheck, AlertOctagon, Brain, Calendar, Percent
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, Legend, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { jsPDF } from "jspdf";

// Types
interface Metric {
  name: string;
  value: number;
  unit: string;
  change: number;
  status: "nominal" | "warning" | "critical";
  sparkline: { time: string; val: number }[];
}

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "warning" | "resolved";
  source: string;
  triggeredAt: string;
  runbookSteps: string[];
}

interface Incident {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Investigating" | "Acknowledged" | "Resolved";
  assignedEngineer: string;
  startedAt: string;
  estimatedRecovery: string;
  rootCause: string;
  resolution: string;
}

interface TraceSpan {
  id: string;
  service: string;
  operation: string;
  durationMs: number;
  status: "ok" | "error";
  spanType: "client" | "server" | "db" | "cache" | "broker" | "smtp" | "external";
}

interface TopologyNode {
  id: string;
  label: string;
  type: "infrastructure" | "app" | "database" | "cache" | "worker" | "external";
  status: "healthy" | "degraded" | "failed";
  cpu: number;
  memory: number;
  latencyMs: number;
  connections: number;
}

// Enterprise Benchmark Sandbox Types
interface BenchmarkJob {
  id: string;
  status: "idle" | "running" | "paused" | "completed" | "cancelled";
  tool: "locust" | "k6" | "wrk";
  startedAt: string;
  duration: number; // in seconds
  elapsed: number; // in seconds
  operator: string;
  environment: "Local Docker" | "Development" | "Staging" | "Production";
  progress: number; // percentage
  users: number;
  spawnRate: number;
  profileName: string;
  peakRps: number;
  avgLatency: number;
  p95: number;
  errorRate: number;
  slaResult: "PASS" | "FAIL" | "PENDING";
}

interface BenchmarkTemplate {
  id: string;
  name: string;
  tool: "locust" | "k6" | "wrk";
  users: number;
  rate: number;
  duration: number;
  profile: "load" | "stress" | "spike" | "soak";
}

interface BenchmarkSchedule {
  id: string;
  name: string;
  cron: string;
  tool: "locust" | "k6" | "wrk";
  users: number;
  duration: number;
  enabled: boolean;
}

interface BottleneckResult {
  diagnosis: string;
  confidence: number;
  reason: string;
  recommendation: string;
}

export const OpsDashboard: React.FC = () => {
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "executive" | "topology" | "scale" | "prometheus" | "grafana" | "alerts" | "incidents" | "tracing" | "aiops" | "configs"
  >("executive");

  // Dynamic system states
  const [systemUptime, setSystemUptime] = useState(2592000); // 30 days in seconds
  const [activeTutorsOnline, setActiveTutorsOnline] = useState(16);
  const [studentsOnline, setStudentsOnline] = useState(428);
  const [todayRevenue, setTodayRevenue] = useState(14250);
  const [examPredictions, setExamPredictions] = useState(1275);
  const [paymentsCompleted, setPaymentsCompleted] = useState(203);
  const [failedPayments, setFailedPayments] = useState(2);
  const [aiTokensConsumed, setAiTokensConsumed] = useState(4829100);
  const [emailsSent, setEmailsSent] = useState(4210);
  const [practicalSessions, setPracticalSessions] = useState(84);
  const [systemAvailability, setSystemAvailability] = useState(99.998);

  // Performance Sandbox & Load Testing States
  const [testType, setTestType] = useState<"load" | "stress" | "spike" | "soak">("load");
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "completed">("idle");
  const [testProgress, setTestProgress] = useState<number>(0);
  const [simulatedUsers, setSimulatedUsers] = useState<number>(0);
  const [simulatedRps, setSimulatedRps] = useState<number>(0);
  const [simulatedLatency, setSimulatedLatency] = useState<number>(0);
  const [simulatedP95, setSimulatedP95] = useState<number>(0);
  const [simulatedP99, setSimulatedP99] = useState<number>(0);
  const [simulatedErrorRate, setSimulatedErrorRate] = useState<number>(0);
  const [benchmarkLogs, setBenchmarkLogs] = useState<string[]>([]);
  const [benchmarkChartData, setBenchmarkChartData] = useState<{ sec: number; rps: number; latency: number; users: number; errors: number }[]>([]);
  const [activeCodeTab, setActiveCodeTab] = useState<"locust" | "k6" | "wrk" | "ab">("locust");
  
  // Interactive Load Testing Tool & Concurrency Parameter States
  const [loadTestTool, setLoadTestTool] = useState<"locust" | "k6" | "wrk">("locust");
  const [loadTestUsers, setLoadTestUsers] = useState<number>(1000);
  const [loadTestSpawnRate, setLoadTestSpawnRate] = useState<number>(50);
  const [loadTestDuration, setLoadTestDuration] = useState<number>(15);

  // Enterprise Benchmark States
  const [benchmarkJobs, setBenchmarkJobs] = useState<BenchmarkJob[]>([
    {
      id: "BMK-379",
      status: "completed",
      tool: "k6",
      startedAt: "10:15",
      duration: 30,
      elapsed: 30,
      operator: "Moukangwe Bethuel",
      environment: "Staging",
      progress: 100,
      users: 5000,
      spawnRate: 100,
      profileName: "Nightly Performance Test",
      peakRps: 12200,
      avgLatency: 48,
      p95: 64,
      errorRate: 0.05,
      slaResult: "PASS"
    },
    {
      id: "BMK-380",
      status: "completed",
      tool: "locust",
      startedAt: "11:30",
      duration: 15,
      elapsed: 15,
      operator: "Sipho Khumalo",
      environment: "Staging",
      progress: 100,
      users: 15000,
      spawnRate: 250,
      profileName: "Weekly Stress Test",
      peakRps: 22800,
      avgLatency: 182,
      p95: 245,
      errorRate: 1.85,
      slaResult: "FAIL"
    }
  ]);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<"Local Docker" | "Development" | "Staging" | "Production">("Staging");
  const [showProductionConfirm, setShowProductionConfirm] = useState(false);
  const [prodAccessCode, setProdAccessCode] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);

  const [benchmarkTemplates, setBenchmarkTemplates] = useState<BenchmarkTemplate[]>([
    { id: "tmpl-smoke", name: "Daily Smoke Test", tool: "wrk", users: 500, rate: 50, duration: 15, profile: "load" },
    { id: "tmpl-perf", name: "Nightly Performance Test", tool: "k6", users: 5000, rate: 100, duration: 45, profile: "load" },
    { id: "tmpl-stress", name: "Weekly Stress Test", tool: "locust", users: 15000, rate: 250, duration: 30, profile: "stress" },
    { id: "tmpl-capacity", name: "Monthly Capacity Test", tool: "k6", users: 25000, rate: 500, duration: 60, profile: "soak" },
    { id: "tmpl-prerelease", name: "Pre-release Benchmark", tool: "k6", users: 12000, rate: 300, duration: 20, profile: "stress" },
    { id: "tmpl-disaster", name: "Disaster Recovery Validation", tool: "locust", users: 40000, rate: 1500, duration: 15, profile: "spike" }
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const [schedules, setSchedules] = useState<BenchmarkSchedule[]>([
    { id: "sched-1", name: "Nightly Performance Audit", cron: "0 0 * * *", tool: "k6", users: 5000, duration: 30, enabled: true },
    { id: "sched-2", name: "Pre-Deployment Smoke Check", cron: "0 2 * * 0", tool: "wrk", users: 1000, duration: 15, enabled: false }
  ]);
  const [newSchedName, setNewSchedName] = useState("");
  const [newSchedCron, setNewSchedCron] = useState("0 2 * * *");
  const [newSchedTool, setNewSchedTool] = useState<"locust" | "k6" | "wrk">("k6");
  const [newSchedUsers, setNewSchedUsers] = useState(2000);
  const [newSchedDuration, setNewSchedDuration] = useState(15);
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  const [infraMetrics, setInfraMetrics] = useState({
    cpu: 18,
    memory: 42,
    dbConnections: 34,
    redisMemory: 2.1,
    gunicornWorkers: 8,
    celeryQueue: 0,
    nginxConnections: 45
  });

  const [activeBottleneck, setActiveBottleneck] = useState<BottleneckResult | null>(null);
  const [aiAdvisorText, setAiAdvisorText] = useState<string>("");

  const [peakObservedRps, setPeakObservedRps] = useState(41201);
  const [currentSustainableThroughput, setCurrentSustainableThroughput] = useState(38642);
  const targetRpsGoal = 100000;

  // Time filter for Grafana / Telemetry views
  const [timeFilter, setTimeFilter] = useState<"1h" | "24h" | "7d" | "30d" | "1y">("24h");

  // Chaos Testing & Interactive Topology Node States
  const [nodes, setNodes] = useState<TopologyNode[]>([
    { id: "internet", label: "Internet / DNS Route", type: "external", status: "healthy", cpu: 0, memory: 0, latencyMs: 5, connections: 428 },
    { id: "cloudfront", label: "CloudFront CDN", type: "infrastructure", status: "healthy", cpu: 12, memory: 28, latencyMs: 14, connections: 428 },
    { id: "nginx", label: "NGINX Reverse Proxy", type: "infrastructure", status: "healthy", cpu: 18, memory: 34, latencyMs: 8, connections: 428 },
    { id: "gunicorn", label: "Gunicorn Gateway", type: "infrastructure", status: "healthy", cpu: 25, memory: 40, latencyMs: 12, connections: 110 },
    { id: "django", label: "Django CAPS Core VM", type: "app", status: "healthy", cpu: 42, memory: 65, latencyMs: 54, connections: 110 },
    { id: "redis", label: "Redis ElastiCache", type: "cache", status: "healthy", cpu: 32, memory: 78, latencyMs: 1, connections: 250 },
    { id: "celery", label: "Celery Task Broker", type: "worker", status: "healthy", cpu: 38, memory: 55, latencyMs: 4, connections: 8 },
    { id: "exampredictor", label: "Exam Predictor Model", type: "app", status: "healthy", cpu: 15, memory: 48, latencyMs: 120, connections: 15 },
    { id: "smtp", label: "AWS SES SMTP Relay", type: "external", status: "healthy", cpu: 0, memory: 0, latencyMs: 85, connections: 2 },
    { id: "payfast", label: "PayFast Payment Gateway", type: "external", status: "healthy", cpu: 0, memory: 0, latencyMs: 140, connections: 14 },
    { id: "postgresql", label: "PostgreSQL Production DB", type: "database", status: "healthy", cpu: 48, memory: 72, latencyMs: 3, connections: 64 },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("django");

  // Prometheus Scraped Metrics simulation data
  const [promLogs, setPromLogs] = useState<string[]>([]);
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  // Active Alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alert-cpu",
      title: "Host Server CPU Usage > 80%",
      severity: "warning",
      source: "Node Exporter",
      triggeredAt: "10:42:15 SAST",
      runbookSteps: [
        "Check system active load using Node Exporter metrics.",
        "List high resource consuming tasks with htop or docker stats.",
        "Verify if Django core is executing large analytical reports or PDF generation.",
        "Scale the Django service container or scale down background batch sizes."
      ]
    },
    {
      id: "alert-deadlocks",
      title: "PostgreSQL DB Index Locks & Deadlocks Detected",
      severity: "warning",
      source: "Postgres Exporter",
      triggeredAt: "11:15:30 SAST",
      runbookSteps: [
        "Identify blocking transactions using pg_stat_activity query analyzer.",
        "Ensure indices on homework worksheets, bookings, and student submissions are robust.",
        "Terminate persistent dangling locks.",
        "Validate PostgreSQL cache hit ratio is above 98%."
      ]
    }
  ]);

  // Automated Self-Healing State Machine
  const [healingAlertId, setHealingAlertId] = useState<string | null>(null);
  const [healingProgress, setHealingProgress] = useState<number>(0);
  const [healingLogs, setHealingLogs] = useState<string[]>([]);
  const [isHealingRunning, setIsHealingRunning] = useState(false);

  // Incident Center Tickets
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "INC-2810",
      title: "Redis Cache Key Eviction Failure",
      severity: "Critical",
      status: "Resolved",
      assignedEngineer: "Moukangwe Bethuel",
      startedAt: "2026-07-17T14:23:00",
      estimatedRecovery: "Completed in 12 mins",
      rootCause: "Memory exhaustion due to rapid session goals caching on student cockpit.",
      resolution: "Allocated maxmemory-policy volatile-lru on Redis master node and executed automated flushing."
    },
    {
      id: "INC-2940",
      title: "Celery Workers Out Of Sync (Matric upgrade predictions delay)",
      severity: "High",
      status: "Investigating",
      assignedEngineer: "Sipho Khumalo",
      startedAt: "2026-07-18T10:15:00",
      estimatedRecovery: "5 minutes",
      rootCause: "Network split between CAPS model container and Celery queue broker.",
      resolution: "Investigating broker heartbeat failures."
    }
  ]);

  // Form states for adding incidents manually
  const [newIncTitle, setNewIncTitle] = useState("");
  const [newIncSeverity, setNewIncSeverity] = useState<"Critical" | "High" | "Medium" | "Low">("High");
  const [newIncStatus, setNewIncStatus] = useState<"Investigating" | "Acknowledged" | "Resolved">("Investigating");
  const [newIncEngineer, setNewIncEngineer] = useState("Moukangwe Bethuel");
  const [newIncRootCause, setNewIncRootCause] = useState("");
  const [newIncResolution, setNewIncResolution] = useState("");

  // Incident Filtering & Inline Editing States
  const [incidentSearchQuery, setIncidentSearchQuery] = useState("");
  const [incidentSeverityFilter, setIncidentSeverityFilter] = useState<string>("All");
  const [incidentStatusFilter, setIncidentStatusFilter] = useState<string>("All");

  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);
  const [editIncTitle, setEditIncTitle] = useState("");
  const [editIncSeverity, setEditIncSeverity] = useState<"Critical" | "High" | "Medium" | "Low">("High");
  const [editIncStatus, setEditIncStatus] = useState<"Investigating" | "Acknowledged" | "Resolved">("Investigating");
  const [editIncEngineer, setEditIncEngineer] = useState("");
  const [editIncRootCause, setEditIncRootCause] = useState("");
  const [editIncResolution, setEditIncResolution] = useState("");
  const [editIncRecovery, setEditIncRecovery] = useState("");

  // Tracing Flow Selection
  const [activeTraceFlow, setActiveTraceFlow] = useState<"booking" | "prediction" | "payment">("booking");

  // AI Operations Chat Assistant
  const [aiChatMessages, setAiChatMessages] = useState<{ role: "user" | "ai"; text: string; time: string }[]>([
    {
      role: "ai",
      text: "👋 Ayo! I'm your AMH AIOps Assistant. I monitor Prometheus scrapers, Grafana metrics, and our Django-Celery pipeline. Select a telemetry query below, or type your infrastructure question directly!",
      time: "11:56 AM"
    }
  ]);
  const [aiInputText, setAiInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const testIntervalRef = useRef<any>(null);
  const currentSecRef = useRef<number>(0);
  const activeJobIdRef = useRef<string | null>(null);

  // Stop active test interval
  const stopTestInterval = () => {
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTestInterval();
    };
  }, []);

  const handlePauseJob = (jobId: string) => {
    stopTestInterval();
    setTestStatus("idle");
    setBenchmarkJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return { ...job, status: "paused" };
      }
      return job;
    }));
    setBenchmarkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⏸️ BENCHMARK JOB ${jobId} PAUSED BY OPERATOR.`]);
  };

  const handleResumeJob = (jobId: string) => {
    const job = benchmarkJobs.find(j => j.id === jobId);
    if (!job) return;
    
    setTestStatus("running");
    setBenchmarkJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, status: "running" };
      }
      return j;
    }));
    setBenchmarkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ▶️ RESUMING BENCHMARK JOB ${jobId}...`]);
    executeBenchmarkLoop(jobId, job.duration, job.tool, job.users, job.spawnRate, job.profileName, job.environment);
  };

  const handleCancelJob = (jobId: string) => {
    stopTestInterval();
    setTestStatus("idle");
    setActiveJobId(null);
    activeJobIdRef.current = null;
    setBenchmarkJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, status: "cancelled", progress: Math.floor((currentSecRef.current / j.duration) * 100) };
      }
      return j;
    }));
    setBenchmarkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🛑 BENCHMARK JOB ${jobId} CANCELLED BY OPERATOR.`]);
  };

  const handleCloneJob = (job: BenchmarkJob) => {
    const newId = `BMK-${Math.floor(Math.random() * 900) + 100}`;
    const clonedJob: BenchmarkJob = {
      ...job,
      id: newId,
      status: "idle",
      progress: 0,
      elapsed: 0,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      slaResult: "PENDING"
    };
    setBenchmarkJobs(prev => [clonedJob, ...prev]);
    setBenchmarkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📋 Cloned job ${job.id} as ${clonedJob.id}.`]);
  };

  const handleRerunJob = (job: BenchmarkJob) => {
    setLoadTestTool(job.tool);
    setLoadTestUsers(job.users);
    setLoadTestSpawnRate(job.spawnRate);
    setLoadTestDuration(job.duration);
    setSelectedEnvironment(job.environment);
    
    const typeMap: Record<string, "load" | "stress" | "spike" | "soak"> = {
      "Daily Smoke Test": "load",
      "Nightly Performance Test": "load",
      "Weekly Stress Test": "stress",
      "Monthly Capacity Test": "soak",
      "Pre-release Benchmark": "stress",
      "Disaster Recovery Validation": "spike"
    };
    setTestType(typeMap[job.profileName] || "load");
    
    setTimeout(() => {
      triggerBenchmarkStart(job.tool, job.users, job.spawnRate, job.duration, job.environment, job.profileName);
    }, 100);
  };

  const triggerBenchmarkStart = (
    tool: "locust" | "k6" | "wrk",
    users: number,
    spawnRate: number,
    duration: number,
    env: "Local Docker" | "Development" | "Staging" | "Production",
    profileName: string
  ) => {
    const limitRps = users * (tool === "wrk" ? 3.5 : tool === "k6" ? 2.4 : 1.5);
    const limitDuration = duration;
    const limitUsers = users;

    if (env === "Production") {
      if (limitUsers > 50000 || limitDuration > 1800 || limitRps > 20000) {
        if (!isSuperAdmin) {
          setBenchmarkLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ❌ PROD BLOCK: Concurrency parameters exceed strict non-admin limits (Max: 50k VUs, 30m, 20k RPS). Execution aborted.`
          ]);
          return;
        }
      }
      if (!showProductionConfirm && prodAccessCode !== "AMH-PROD-SAFE") {
        setShowProductionConfirm(true);
        return;
      }
    }

    const jobId = `BMK-${Math.floor(Math.random() * 900) + 100}`;
    const newJob: BenchmarkJob = {
      id: jobId,
      status: "running",
      tool,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration,
      elapsed: 0,
      operator: "Moukangwe Bethuel",
      environment: env,
      progress: 0,
      users,
      spawnRate,
      profileName,
      peakRps: 0,
      avgLatency: 0,
      p95: 0,
      errorRate: 0,
      slaResult: "PENDING"
    };

    setBenchmarkJobs(prev => [newJob, ...prev]);
    setActiveJobId(jobId);
    activeJobIdRef.current = jobId;
    currentSecRef.current = 0;
    setTestStatus("running");
    setTestProgress(0);
    setSimulatedUsers(0);
    setSimulatedRps(0);
    setSimulatedLatency(0);
    setSimulatedP95(0);
    setSimulatedP99(0);
    setSimulatedErrorRate(0);
    setBenchmarkChartData([]);

    setBenchmarkLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 DISTRIBUTED QUEUE: Initiating Benchmark Job ${jobId} on Celery-Redis broker...`,
      `[${new Date().toLocaleTimeString()}] Target Environment: ${env.toUpperCase()} (Infrastructure Verification Active)`,
      `[${new Date().toLocaleTimeString()}] Configured Max Users: ${users.toLocaleString()} VUs | Spawn Rate: ${spawnRate}/sec`,
      `[${new Date().toLocaleTimeString()}] Test Profile: ${profileName} | Duration: ${duration}s`,
      `[${new Date().toLocaleTimeString()}] Spawning Locust/k6 workers globally... (Resource limits and safeguards loaded)`,
    ]);

    executeBenchmarkLoop(jobId, duration, tool, users, spawnRate, profileName, env);
  };

  const executeBenchmarkLoop = (
    jobId: string,
    duration: number,
    tool: "locust" | "k6" | "wrk",
    users: number,
    spawnRate: number,
    profileName: string,
    env: "Local Docker" | "Development" | "Staging" | "Production"
  ) => {
    stopTestInterval();
    const maxSec = duration;

    testIntervalRef.current = setInterval(() => {
      currentSecRef.current += 1;
      const sec = currentSecRef.current;
      const progress = Math.min(100, Math.floor((sec / maxSec) * 100));
      setTestProgress(progress);

      const factor = sec / maxSec; // 0 to 1

      let currentUsers = Math.min(users, Math.floor(sec * spawnRate));
      const isSpike = profileName.toLowerCase().includes("spike") || testType === "spike";
      const isStress = profileName.toLowerCase().includes("stress") || testType === "stress";
      const isSoak = profileName.toLowerCase().includes("soak") || testType === "soak" || profileName.toLowerCase().includes("capacity");

      if (isSoak) {
        currentUsers = users;
      } else if (isSpike && sec >= Math.floor(maxSec * 0.3) && sec <= Math.floor(maxSec * 0.7)) {
        currentUsers = Math.min(users * 2.5, 80000);
      }

      const rpsMultiplier = tool === "wrk" ? 3.5 : tool === "k6" ? 2.4 : 1.5;
      const rps = Math.floor(currentUsers * rpsMultiplier + Math.random() * 150);

      let baseLatency = tool === "wrk" ? 14 : tool === "k6" ? 28 : 45;
      let latency = baseLatency;
      if (currentUsers > 10000) {
        latency += Math.floor((currentUsers - 10000) * 0.012);
      } else {
        latency += Math.floor(currentUsers * 0.005);
      }

      if (isStress) {
        latency += Math.floor(factor * 120 + Math.random() * 30);
      } else if (isSpike && sec >= Math.floor(maxSec * 0.3) && sec <= Math.floor(maxSec * 0.7)) {
        latency += Math.floor(800 + Math.random() * 400);
      } else {
        latency += Math.floor(Math.random() * 15);
      }

      let errors = 0;
      if (currentUsers > 25000 || (isSpike && sec >= Math.floor(maxSec * 0.3) && sec <= Math.floor(maxSec * 0.7))) {
        errors = parseFloat((factor * 22.5 + Math.random() * 4).toFixed(2));
      } else if (currentUsers > 8000 || isStress) {
        errors = parseFloat((factor * 2.5 + Math.random() * 0.6).toFixed(2));
      } else {
        errors = Math.random() > 0.94 ? 0.08 : 0.0;
      }

      const p95 = Math.floor(latency * 1.32);
      const p99 = Math.floor(latency * 1.85);

      setSimulatedUsers(currentUsers);
      setSimulatedRps(rps);
      setSimulatedLatency(latency);
      setSimulatedP95(p95);
      setSimulatedP99(p99);
      setSimulatedErrorRate(errors);

      setBenchmarkChartData(prev => [
        ...prev,
        { sec, rps, latency, users: currentUsers, errors }
      ]);

      setInfraMetrics({
        cpu: Math.min(100, Math.floor(18 + currentUsers * 0.002 + (isStress ? 15 : 0) + (isSpike && sec >= Math.floor(maxSec * 0.3) && sec <= Math.floor(maxSec * 0.7) ? 45 : 0))),
        memory: Math.min(100, Math.floor(32 + currentUsers * 0.001 + (isSoak ? 12 : 0))),
        dbConnections: Math.min(500, Math.floor(34 + currentUsers * 0.004 + (isStress ? 40 : 0))),
        redisMemory: parseFloat((2.1 + (currentUsers * 0.0001) + (isSpike ? 1.5 : 0)).toFixed(1)),
        gunicornWorkers: Math.min(24, 8 + Math.floor(currentUsers / 3000)),
        celeryQueue: isSpike && sec >= Math.floor(maxSec * 0.3) && sec <= Math.floor(maxSec * 0.7) ? Math.floor(currentUsers / 500) : isStress ? Math.floor(currentUsers / 1000) : 0,
        nginxConnections: Math.floor(currentUsers * 1.1)
      });

      const logTemplates = {
        locust: [
          `[${new Date().toLocaleTimeString()}] [Locust Swarm] Spawning virtual clients. Active: ${currentUsers} users`,
          `[${new Date().toLocaleTimeString()}] [Locust Task] GET /api/courses/ NSC_Maths - Response 200 OK (${latency}ms)`,
          `[${new Date().toLocaleTimeString()}] [Locust Task] POST /api/bookings/reserve - Response 200 OK (${p95}ms)`,
          `[${new Date().toLocaleTimeString()}] [Locust Reporter] Current aggregate throughput: ${rps} RPS. Error rate: ${errors}%`,
        ],
        k6: [
          `[${new Date().toLocaleTimeString()}] [k6 Runner] VU Iteration step complete. Active VUs: ${currentUsers}`,
          `[${new Date().toLocaleTimeString()}] [k6 Metric] http_req_duration: avg=${latency}ms, p95=${p95}ms, p99=${p99}ms`,
          `[${new Date().toLocaleTimeString()}] [k6 Threshold] OK: http_req_failed < 2.0% (Current: ${errors}%)`,
        ],
        wrk: [
          `[${new Date().toLocaleTimeString()}] [wrk Thread] Pipeline sending concurrent HTTP requests. Socket rate: ${rps} req/s`,
          `[${new Date().toLocaleTimeString()}] [wrk Socket] Connections: ${currentUsers} open. Active socket pipeline depth: 4`,
          `[${new Date().toLocaleTimeString()}] [wrk Metric] Latency distribution: ${latency}ms average`,
        ]
      };

      const toolLogs = logTemplates[tool] || logTemplates.locust;
      const randomLine = toolLogs[Math.floor(Math.random() * toolLogs.length)];
      setBenchmarkLogs(prev => [...prev, randomLine]);

      setBenchmarkJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          const nextPeakRps = Math.max(job.peakRps, rps);
          const nextAvgLatency = Math.floor((job.avgLatency * (sec - 1) + latency) / sec);
          return {
            ...job,
            progress,
            elapsed: sec,
            peakRps: nextPeakRps,
            avgLatency: nextAvgLatency,
            p95: Math.max(job.p95, p95),
            errorRate: parseFloat(((job.errorRate * (sec - 1) + errors) / sec).toFixed(2))
          };
        }
        return job;
      }));

      if (sec >= maxSec) {
        stopTestInterval();
        setTestStatus("completed");
        setActiveJobId(null);
        activeJobIdRef.current = null;

        setBenchmarkJobs(prev => prev.map(job => {
          if (job.id === jobId) {
            const isPassSla = job.errorRate < 1.0 && job.p95 <= 200 && env !== "Production";
            const finalSla: "PASS" | "FAIL" = isPassSla ? "PASS" : "FAIL";

            evaluateBottleneckAndAdvisor(job.errorRate, job.p95, job.users, profileName);

            if (job.peakRps > peakObservedRps) {
              setPeakObservedRps(job.peakRps);
            }
            if (job.errorRate < 1.0 && job.peakRps > currentSustainableThroughput) {
              setCurrentSustainableThroughput(job.peakRps);
            }

            return {
              ...job,
              status: "completed",
              progress: 100,
              slaResult: finalSla
            };
          }
          return job;
        }));

        setBenchmarkLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ BENCHMARK JOB ${jobId} COMPLETED ON ${env.toUpperCase()} ENVIRONMENT.`,
          `[${new Date().toLocaleTimeString()}] Average Latency: ${latency}ms (P95: ${p95}ms, P99: ${p99}ms) | P95 SLA Threshold: 200ms`,
          `[${new Date().toLocaleTimeString()}] Peak Throughput Achieved: ${rps.toLocaleString()} RPS | Error Rate: ${errors}%`,
          `[${new Date().toLocaleTimeString()}] SLA Verification Result: ${errors < 1.0 && p95 <= 200 ? "✓ PASSED" : "✗ FAILED"}`
        ]);
      }
    }, 1000);
  };

  const evaluateBottleneckAndAdvisor = (errorRate: number, p95: number, users: number, profileName: string) => {
    let diag = "Nominal System Health";
    let conf = 98;
    let reason = "System handles simulated South African matric student spikes perfectly with well-configured WSGI buffers.";
    let rec = "No immediate actions needed. Infrastructure is optimal and highly sustainable.";
    let advisor = "All endpoints on our CAPS and IEB reference center are responsive. Memory and CPU load remained within comfortable bounds. Recommending regular nightly smoke audits to verify that upcoming PDF syllabus sheets additions do not degrade response times.";

    if (errorRate > 10.0 || (profileName.toLowerCase().includes("spike") && errorRate > 5.0)) {
      diag = "Redis Cache Invalidation Storm";
      conf = 87;
      reason = "High-frequency mock score caching and lesson scheduling requests triggered a stampede of parallel lookups directly to Django WSGI threads, missing cache hits.";
      rec = "Implement cache locking (Distributed Mutex) using redlock-py and stagger TTL cache expiry values.";
      advisor = "CRITICAL METRIC ALARM: Redis CPU cache lookups missed threshold. Our Gunicorn workers hit timeouts waiting for serialized JSON blocks. Implement client-side cache layers and leverage regional CDNs to offload static syllabus lookups.";
    } else if (p95 > 300 && users > 15000) {
      diag = "Database Connection Pool Saturation";
      conf = 94;
      reason = "Active PostgreSQL sockets scaled beyond the 100-connection Gunicorn worker limit. Active database threads entered queuing states waiting for locks.";
      rec = "Configure pgbouncer in transaction pooling mode or increase max_connections = 500 on AWS RDS Aurora PostgreSQL.";
      advisor = "PostgreSQL activity logs show heavy sequential scans on 'amh_homework_submissions' table. Add composite indexes on (student_id, assignment_id) to eliminate table scan latency during load spikes.";
    } else if (errorRate > 4.0 || users > 20000) {
      diag = "Gunicorn Worker Thread Starvation";
      conf = 89;
      reason = "Gunicorn WSGI sync class workers blocked on synchronous parent email logs and PDF worksheets streaming workloads.";
      rec = "Upgrade Gunicorn class to 'gthread' (e.g. --workers=16 --threads=4) or transition PDF compiler to asynchronous background tasks on Celery.";
      advisor = "WSGI worker saturation detected. High thread latency triggered ALB socket drops. Offload long-running homework verification scans entirely to Celery/Redis queue rather than processing inline within the Django HTTP request-response cycle.";
    }

    setActiveBottleneck({ diagnosis: diag, confidence: conf, reason, recommendation: rec });
    setAiAdvisorText(advisor);
  };

  const runBenchmarkSim = () => {
    const profileTitle = testType === "load" ? "Daily Smoke Test" : testType === "stress" ? "Weekly Stress Test" : testType === "spike" ? "Disaster Recovery Validation" : "Monthly Capacity Test";
    triggerBenchmarkStart(loadTestTool, loadTestUsers, loadTestSpawnRate, loadTestDuration, selectedEnvironment, profileTitle);
  };

  // Auto-scrolling terminal logs & simulated metric scraping
  useEffect(() => {
    const interval = setInterval(() => {
      // Periodic ticking of values to simulate live traffic
      setSystemUptime(prev => prev + 1);
      setStudentsOnline(prev => Math.max(380, Math.min(500, prev + Math.floor(Math.random() * 7) - 3)));
      setAiTokensConsumed(prev => prev + Math.floor(Math.random() * 450) + 50);

      // Random Prom Log Scraping Output Simulator
      const services = ["django", "celery", "redis", "postgresql", "nginx", "exampredictor"];
      const service = services[Math.floor(Math.random() * services.length)];
      const randomMetricType = ["http_request_duration_seconds_bucket", "db_query_latency_ms", "redis_connected_clients", "celery_active_tasks_count", "nginx_active_connections"];
      const metric = randomMetricType[Math.floor(Math.random() * randomMetricType.length)];
      const val = (Math.random() * 40).toFixed(2);
      const isOk = Math.random() > 0.05;
      const logLine = `[${new Date().toLocaleTimeString()}] SCRAPE OK: service="${service}" metric="${metric}" val=${val} status="${isOk ? "200" : "500"}" duration_ms=${(Math.random() * 15).toFixed(1)}`;
      
      setPromLogs(prev => {
        const next = [...prev, logLine];
        if (next.length > 100) next.shift();
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logTerminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promLogs]);

  // Chaos simulation triggers
  const triggerChaos = (type: "redis" | "celery" | "nginx") => {
    if (type === "redis") {
      setNodes(prev => prev.map(n => {
        if (n.id === "redis") return { ...n, status: "failed", cpu: 99, latencyMs: 950 };
        if (n.id === "django") return { ...n, status: "degraded", latencyMs: 140 };
        if (n.id === "celery") return { ...n, status: "degraded" };
        return n;
      }));

      // Prevent duplicates
      setAlerts(prev => {
        if (prev.some(a => a.id === "alert-redis")) return prev;
        return [
          ...prev,
          {
            id: "alert-redis",
            title: "Redis ElastiCache Node Down (Connection Refused)",
            severity: "critical",
            source: "Redis Exporter",
            triggeredAt: new Date().toLocaleTimeString() + " SAST",
            runbookSteps: [
              "Inspect Redis master cluster health in AWS dashboard / Docker daemon.",
              "Run docker-compose restart amh_redis or verify Redis memory caps.",
              "Flush stale LRU key mappings to restore fast transactional cache bindings."
            ]
          },
          {
            id: "alert-queue",
            title: "High Celery Queue Length - Backlog Rising",
            severity: "critical",
            source: "Celery Exporter",
            triggeredAt: new Date().toLocaleTimeString() + " SAST",
            runbookSteps: [
              "Verify broker is receiving task heartbeats from Grade 10-12 exam prediction runners.",
              "Inspect RabbitMQ/Redis container logs.",
              "Deploy auto-scaler triggers to increase concurrency workers."
            ]
          }
        ];
      });
    } else if (type === "celery") {
      setNodes(prev => prev.map(n => {
        if (n.id === "celery") return { ...n, status: "failed", cpu: 0, memory: 0 };
        return n;
      }));

      setAlerts(prev => {
        if (prev.some(a => a.id === "alert-celery")) return prev;
        return [
          ...prev,
          {
            id: "alert-celery",
            title: "Celery Worker Node Offline / Unreachable",
            severity: "critical",
            source: "Flower Metrics",
            triggeredAt: new Date().toLocaleTimeString() + " SAST",
            runbookSteps: [
              "Access Flower Dashboard to analyze active worker nodes registrations.",
              "Confirm Celery daemon processes are alive inside worker containers.",
              "Execute docker-compose restart amh_celery_worker to force rejoin."
            ]
          }
        ];
      });
    } else if (type === "nginx") {
      setNodes(prev => prev.map(n => {
        if (n.id === "nginx") return { ...n, status: "degraded", cpu: 89, latencyMs: 310 };
        if (n.id === "django") return { ...n, status: "degraded", latencyMs: 125 };
        return n;
      }));

      setAlerts(prev => {
        if (prev.some(a => a.id === "alert-nginx")) return prev;
        return [
          ...prev,
          {
            id: "alert-nginx",
            title: "NGINX Traffic Spike - Upstream Latency Degradation",
            severity: "warning",
            source: "NGINX Exporter",
            triggeredAt: new Date().toLocaleTimeString() + " SAST",
            runbookSteps: [
              "Monitor active HTTP 502/504 Bad Gateway trends from NGINX access logs.",
              "Check Rate-limiting configs in /etc/nginx/nginx.conf.",
              "Scale backend Gunicorn socket nodes or deploy CDN edge overrides."
            ]
          }
        ];
      });
    }
  };

  // Automated Self-Healing Execution Logic
  const startSelfHealing = (alertId: string) => {
    setHealingAlertId(alertId);
    setIsHealingRunning(true);
    setHealingProgress(10);
    setHealingLogs(["[Self-Healing] Automated Orchestration Agent Engaged.", `[Self-Healing] Diagnosing alert ID: ${alertId}...`]);

    const steps = [
      { prg: 30, log: "[Self-Healing] Step 1/4: Analyzing health checkers & system environment variables." },
      { prg: 50, log: "[Self-Healing] Step 2/4: Checking disk and cache allocation capacities." },
      { prg: 75, log: "[Self-Healing] Step 3/4: Restarting failed Docker Container microservice nodes gracefully..." },
      { prg: 90, log: "[Self-Healing] Step 4/4: Executing dynamic socket binding ping health tests." },
      { prg: 100, log: "[Self-Healing] SUCCESS: Microservices recovered completely. Closing incident ticket." }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setHealingProgress(step.prg);
        setHealingLogs(prev => [...prev, step.log]);

        if (step.prg === 100) {
          setIsHealingRunning(false);
          // Resolve alerts and restore nodes
          setAlerts(prev => prev.filter(a => a.id !== alertId));
          setNodes(prev => prev.map(n => {
            if (alertId === "alert-redis" && (n.id === "redis" || n.id === "django" || n.id === "celery")) {
              return { ...n, status: "healthy", cpu: 12, latencyMs: n.id === "redis" ? 1 : 45 };
            }
            if (alertId === "alert-celery" && n.id === "celery") {
              return { ...n, status: "healthy", cpu: 32, latencyMs: 4 };
            }
            if (alertId === "alert-nginx" && n.id === "nginx") {
              return { ...n, status: "healthy", cpu: 15, latencyMs: 6 };
            }
            if (alertId === "alert-cpu" && n.id === "django") {
              return { ...n, status: "healthy", cpu: 34 };
            }
            if (alertId === "alert-deadlocks" && n.id === "postgresql") {
              return { ...n, status: "healthy", latencyMs: 2 };
            }
            return n;
          }));

          // Clear secondary alerts associated
          if (alertId === "alert-redis") {
            setAlerts(prev => prev.filter(a => a.id !== "alert-queue"));
          }

          // Add resolved incident log automatically
          const targetAlert = alerts.find(a => a.id === alertId);
          setIncidents(prev => [
            {
              id: `INC-AUTO-${Math.floor(Math.random() * 9000) + 1000}`,
              title: `Auto-Healed: ${targetAlert?.title || "System Alert"}`,
              severity: "High",
              status: "Resolved",
              assignedEngineer: "Self-Healing Daemon",
              startedAt: new Date(Date.now() - 3 * 60000).toISOString(),
              estimatedRecovery: "Completed in 45 seconds",
              rootCause: `Automated recovery triggered by Prometheus alert scraping for ${targetAlert?.source}.`,
              resolution: "Executed self-healing microservice orchestration restart and purged cached socket buffers."
            },
            ...prev
          ]);
        }
      }, (index + 1) * 1200);
    });
  };

  // Manually open an incident ticket
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncTitle.trim()) return;

    const newTicket: Incident = {
      id: `INC-${Math.floor(Math.random() * 9000) + 1000}`,
      title: newIncTitle,
      severity: newIncSeverity,
      status: newIncStatus,
      assignedEngineer: newIncEngineer,
      startedAt: new Date().toISOString(),
      estimatedRecovery: newIncStatus === "Resolved" ? "Completed" : "30 minutes",
      rootCause: newIncRootCause || "Awaiting investigation.",
      resolution: newIncResolution || (newIncStatus === "Resolved" ? "Manual rollback and microservice configuration patch completed." : "Not resolved yet.")
    };

    setIncidents(prev => [newTicket, ...prev]);
    setNewIncTitle("");
    setNewIncRootCause("");
    setNewIncResolution("");
    alert(`Incident Ticket ${newTicket.id} has been opened successfully and assigned to ${newIncEngineer}.`);
  };

  // Start editing an incident
  const startEditingIncident = (incident: Incident) => {
    setEditingIncidentId(incident.id);
    setEditIncTitle(incident.title);
    setEditIncSeverity(incident.severity);
    setEditIncStatus(incident.status);
    setEditIncEngineer(incident.assignedEngineer);
    setEditIncRootCause(incident.rootCause);
    setEditIncResolution(incident.resolution);
    setEditIncRecovery(incident.estimatedRecovery);
  };

  // Save the edited incident
  const saveEditingIncident = () => {
    if (!editIncTitle.trim()) return;
    setIncidents(prev => prev.map(inc => {
      if (inc.id === editingIncidentId) {
        return {
          ...inc,
          title: editIncTitle,
          severity: editIncSeverity,
          status: editIncStatus,
          assignedEngineer: editIncEngineer,
          rootCause: editIncRootCause,
          resolution: editIncResolution,
          estimatedRecovery: editIncRecovery
        };
      }
      return inc;
    }));
    setEditingIncidentId(null);
  };

  // Delete an incident
  const deleteIncident = (id: string) => {
    if (confirm(`Are you sure you want to delete incident ${id}?`)) {
      setIncidents(prev => prev.filter(inc => inc.id !== id));
    }
  };

  // Quick resolve incident
  const quickResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status: "Resolved" as const,
          estimatedRecovery: "Completed",
          resolution: inc.resolution === "Not resolved yet." ? "Identified bottleneck, hot-patched relevant configurations, and verified metrics normalization." : inc.resolution
        };
      }
      return inc;
    }));
  };

  // Quick assign incident
  const quickAssignIncident = (id: string, engineer: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          assignedEngineer: engineer
        };
      }
      return inc;
    }));
  };

  // Generate beautiful Incident Postmortem PDF Report
  const handleExportPostmortem = (incident: Incident) => {
    try {
      const doc = new jsPDF();
      
      // Header & Primary Styling
      doc.setFillColor(15, 23, 42); // Navy theme
      doc.rect(0, 0, 210, 50, "F");
      
      doc.setTextColor(251, 191, 36); // Gold Accent
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AMARIS MATHEMATICS HUB", 20, 25);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("Helvetica", "normal");
      doc.text("ADMINISTRATIVE INCIDENT POSTMORTEM REPORT — CAPS/IEB TELEMETRY", 20, 38);
      
      // Content Grid styling
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Incident ID: ${incident.id}`, 20, 65);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 70, 190, 70);
      
      // Details metadata
      doc.setFontSize(10);
      doc.setFont("Helvetica", "bold");
      doc.text("Incident Title:", 20, 80);
      doc.setFont("Helvetica", "normal");
      doc.text(incident.title, 60, 80);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Severity Classification:", 20, 90);
      doc.setFont("Helvetica", "normal");
      doc.text(incident.severity, 60, 90);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Current Status:", 20, 100);
      doc.setFont("Helvetica", "normal");
      doc.text(incident.status, 60, 100);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Assigned Engineer:", 20, 110);
      doc.setFont("Helvetica", "normal");
      doc.text(incident.assignedEngineer, 60, 110);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Incident Start Time:", 20, 120);
      doc.setFont("Helvetica", "normal");
      doc.text(new Date(incident.startedAt).toLocaleString(), 60, 120);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Recovery Timeline:", 20, 130);
      doc.setFont("Helvetica", "normal");
      doc.text(incident.estimatedRecovery, 60, 130);
      
      doc.line(20, 140, 190, 140);
      
      // Multiline root cause and resolution
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Root Cause Assessment:", 20, 150);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const splitRootCause = doc.splitTextToSize(incident.rootCause, 165);
      doc.text(splitRootCause, 20, 158);
      
      const rcHeight = splitRootCause.length * 5;
      const resY = 165 + rcHeight;
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Resolution & Preventive Measures:", 20, resY);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const splitResolution = doc.splitTextToSize(incident.resolution, 165);
      doc.text(splitResolution, 20, resY + 8);
      
      // Footer Seal
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.5);
      doc.line(20, 260, 190, 260);
      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("AMARIS PRODUCTION INCIDENT MITIGATION PROTOCOLS — PROMETHEUS SCRAPING CERTIFIED", 20, 268);
      doc.text(`Generated on ${new Date().toLocaleString()} | Authenticated: Moukangwe Bethuel (BSc Math)`, 20, 273);
      
      doc.save(`postmortem-${incident.id}.pdf`);
    } catch (err) {
      alert("Error exporting PDF: " + err);
    }
  };

  // Submit AI message to node.js router and handle response
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim() || isAiLoading) return;

    const userMsg = aiInputText.trim();
    setAiInputText("");
    
    const userMsgObj = {
      role: "user" as const,
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setAiChatMessages(prev => [...prev, userMsgObj]);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/aiops/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            active_alerts: alerts,
            nodes_status: nodes,
            operational_metrics: {
              availability: systemAvailability,
              uptime_secs: systemUptime,
              students_online: studentsOnline,
              tutors_online: activeTutorsOnline,
              revenue_today_zar: todayRevenue,
              exam_predictions: examPredictions,
              payments_completed: paymentsCompleted,
              failed_payments: failedPayments,
              ai_tokens_consumed: aiTokensConsumed,
              emails_sent: emailsSent
            },
            incident_history: incidents
          }
        })
      });

      const data = await response.json();
      
      setAiChatMessages(prev => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "Telemetry Core responded successfully. System health is within normal bounds.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setAiChatMessages(prev => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Core connection timeout. Telemetry parsing completed locally: Node instances indicate solid health profiles and low connection queuing. Re-establishing link now.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger quick telemetry prompt to AI
  const handleQuickAiPrompt = (prompt: string) => {
    setAiInputText(prompt);
  };

  // Simulated chart telemetry data generators based on filters
  const getSimulatedTelemetryData = () => {
    const points = timeFilter === "1h" ? 12 : timeFilter === "24h" ? 24 : timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 12;
    const labels = [];
    for (let i = points - 1; i >= 0; i--) {
      if (timeFilter === "1h") labels.push(`${i * 5}m ago`);
      else if (timeFilter === "24h") labels.push(`${i}h ago`);
      else if (timeFilter === "7d") labels.push(`Day -${i}`);
      else if (timeFilter === "30d") labels.push(`Day -${i}`);
      else labels.push(`Month -${i}`);
    }

    return labels.map(label => ({
      time: label,
      cpu: parseFloat((35 + Math.sin(Math.random()) * 15 + (alerts.some(a=>a.id==="alert-cpu") ? 35 : 0)).toFixed(1)),
      memory: parseFloat((60 + Math.cos(Math.random()) * 10).toFixed(1)),
      latency: parseFloat((45 + Math.random() * 25 + (alerts.some(a=>a.id==="alert-redis") ? 250 : 0)).toFixed(1)),
      requests: Math.floor(180 + Math.random() * 120 + (alerts.some(a=>a.id==="alert-nginx") ? 280 : 0)),
      revenue: Math.floor(400 + Math.random() * 800),
      predictions: Math.floor(20 + Math.random() * 60)
    }));
  };

  const chartData = getSimulatedTelemetryData();

  // OpenTelemetry segment tracing structures
  const getTraceFlowSpans = (): TraceSpan[] => {
    if (activeTraceFlow === "booking") {
      return [
        { id: "span-1", service: "Client Browser", operation: "POST /api/bookings/reserve", durationMs: 4, status: "ok", spanType: "client" },
        { id: "span-2", service: "CloudFront Edge", operation: "HTTPS Proxy Routing", durationMs: 14, status: "ok", spanType: "server" },
        { id: "span-3", service: "NGINX Gateway", operation: "Pass upstream WSGI", durationMs: 8, status: "ok", spanType: "server" },
        { id: "span-4", service: "Django Gunicorn", operation: "Check Availability & Lock", durationMs: 54, status: "ok", spanType: "server" },
        { id: "span-5", service: "Redis Master", operation: "GET amh_tutor_availability", durationMs: 1, status: "ok", spanType: "cache" },
        { id: "span-6", service: "PostgreSQL DB", operation: "INSERT INTO amh_bookings", durationMs: 4, status: "ok", spanType: "db" },
        { id: "span-7", service: "Celery Broker", operation: "Publish Trigger SMTP", durationMs: 3, status: "ok", spanType: "broker" },
        { id: "span-8", service: "AWS SES Relay", operation: "Dispatch Email Confirmation", durationMs: 85, status: "ok", spanType: "smtp" },
      ];
    } else if (activeTraceFlow === "prediction") {
      return [
        { id: "span-1", service: "Client Browser", operation: "POST /api/exam/predict", durationMs: 5, status: "ok", spanType: "client" },
        { id: "span-2", service: "NGINX Gateway", operation: "Pass upstream", durationMs: 10, status: "ok", spanType: "server" },
        { id: "span-3", service: "Django App Core", operation: "Assemble SBA history", durationMs: 35, status: "ok", spanType: "server" },
        { id: "span-4", service: "PostgreSQL DB", operation: "SELECT student_homework_grades", durationMs: 2, status: "ok", spanType: "db" },
        { id: "span-5", service: "Exam Predictor Model", operation: "Compute Matrix Regression", durationMs: 120, status: "ok", spanType: "server" },
        { id: "span-6", service: "Celery Task", operation: "Log prediction result async", durationMs: 4, status: "ok", spanType: "broker" },
        { id: "span-7", service: "AWS SES Relay", operation: "Send exam prediction packet", durationMs: 90, status: "ok", spanType: "smtp" },
      ];
    } else {
      return [
        { id: "span-1", service: "Client Browser", operation: "POST /api/checkout/payfast", durationMs: 6, status: "ok", spanType: "client" },
        { id: "span-2", service: "NGINX Gateway", operation: "Pass upstream WSGI", durationMs: 9, status: "ok", spanType: "server" },
        { id: "span-3", service: "Django App Core", operation: "Create pending payment record", durationMs: 28, status: "ok", spanType: "server" },
        { id: "span-4", service: "Redis ElastiCache", operation: "SET lock_booking_payment", durationMs: 1, status: "ok", spanType: "cache" },
        { id: "span-5", service: "PostgreSQL DB", operation: "INSERT INTO amh_payments", durationMs: 3, status: "ok", spanType: "db" },
        { id: "span-6", service: "PayFast API", operation: "Simulate EFT Instant Verification", durationMs: 140, status: failedPayments > 2 ? "error" : "ok", spanType: "external" },
      ];
    }
  };

  const traceSpans = getTraceFlowSpans();
  const totalTraceDuration = traceSpans.reduce((acc, curr) => acc + curr.durationMs, 0);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-150 dark:border-navy-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-lg h-fit shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white">AMH Administrative Command & Observability</h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400 font-medium">
            Observability control center simulating live Prometheus metrics, Grafana analytics dashboards, self-healing orchestration, and automated incident mitigation.
          </p>
        </div>

        {/* Global Filter Switch */}
        <div className="flex items-center gap-1 bg-navy-50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-800 p-1 rounded-xl">
          {(["1h", "24h", "7d", "30d", "1y"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1 text-[10px] font-mono font-black uppercase rounded-lg transition-all cursor-pointer ${
                timeFilter === filter 
                  ? "bg-royal-600 text-white shadow-md"
                  : "text-navy-500 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* CORE TELEMETRY STRIP - EXECUTIVE VISUALS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-50/40 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Service SLA</span>
            <span className="text-[9px] font-mono text-emerald-500 font-extrabold flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              ● ONLINE
            </span>
          </div>
          <div className="text-xl font-black text-navy-900 dark:text-white mt-1.5 font-mono">{systemAvailability.toFixed(3)}%</div>
          <div className="text-[10px] text-navy-400 mt-1 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-gold-500" />
            Uptime: {(systemUptime / 86400).toFixed(1)} Days
          </div>
        </div>

        <div className="bg-navy-50/40 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 relative overflow-hidden">
          <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Active Users</span>
          <div className="text-xl font-black text-navy-900 dark:text-white mt-1.5 font-mono">{studentsOnline} Students</div>
          <div className="text-[10px] text-navy-400 mt-1 flex items-center gap-1 font-mono">
            <Users className="w-3 h-3 text-amber-500" />
            Tutors Live: {activeTutorsOnline}
          </div>
        </div>

        <div className="bg-navy-50/40 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 relative overflow-hidden">
          <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">EFT Revenue (Today)</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">R {todayRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-navy-400 mt-1 flex items-center gap-1 font-mono">
            <Coins className="w-3 h-3 text-emerald-500" />
            Checkouts Completed: {paymentsCompleted}
          </div>
        </div>

        <div className="bg-navy-50/40 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">AI Token Scraping</span>
            <span className="text-[9px] font-mono text-royal-500 font-extrabold flex items-center gap-0.5 bg-royal-500/10 px-1.5 py-0.5 rounded">
              Gemini 3.5
            </span>
          </div>
          <div className="text-xl font-black text-navy-900 dark:text-white mt-1.5 font-mono">{aiTokensConsumed.toLocaleString()}</div>
          <div className="text-[10px] text-navy-400 mt-1 flex items-center gap-1 font-mono">
            <Video className="w-3 h-3 text-royal-500" />
            Matric Predictions Run: {examPredictions}
          </div>
        </div>
      </div>

      {/* HORIZONTAL TELEMETRY TAB SELECTOR */}
      <div className="flex flex-wrap gap-1.5 border-b border-navy-150 dark:border-navy-800 pb-1">
        {[
          { id: "executive", label: "Executive BI", icon: TrendingUp },
          { id: "topology", label: "Infrastructure Map", icon: Network },
          { id: "scale", label: "Scale & Load Testing", icon: Layers },
          { id: "prometheus", label: "Prom Scraper logs", icon: Terminal },
          { id: "grafana", label: "Grafana Charts", icon: Activity },
          { id: "alerts", label: "Alerting & Self-Heal", icon: ShieldAlert },
          { id: "incidents", label: "Incident Response", icon: AlertTriangle },
          { id: "tracing", label: "Distributed Tracing", icon: Compass },
          { id: "aiops", label: "AI Ops Assistant", icon: MessageSquare },
          { id: "configs", label: "DevOps Provisioning", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeSubTab === tab.id
                  ? "bg-navy-950 text-gold-400 border border-gold-400/40 shadow-sm"
                  : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? "text-gold-400" : "text-navy-500"}`} />
              <span>{tab.label}</span>
              {tab.id === "alerts" && alerts.length > 0 && (
                <span className="bg-rose-500 text-white font-mono text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                  {alerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OPERATIONS & BI */}
      {activeSubTab === "executive" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Visuals: Revenue & Performance Double Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ZAR Revenue Analytics */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest">Revenue Analytics</h3>
                  <p className="text-sm font-black text-navy-900 dark:text-white">PayFast Simulated EFT Transaction volume</p>
                </div>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl h-fit text-emerald-500">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/50" />
                    <XAxis dataKey="time" className="text-[9px] font-mono text-navy-400" />
                    <YAxis className="text-[9px] font-mono text-navy-400" />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                    <Area type="monotone" dataKey="revenue" name="EFT Revenue (ZAR)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Predictions & Analytical Runs */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest">Exam Predictions Generated</h3>
                  <p className="text-sm font-black text-navy-900 dark:text-white">SBA verification and Level 7 predicted runs</p>
                </div>
                <div className="p-2 bg-royal-500/10 border border-royal-500/20 rounded-xl h-fit text-royal-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/50" />
                    <XAxis dataKey="time" className="text-[9px] font-mono text-navy-400" />
                    <YAxis className="text-[9px] font-mono text-navy-400" />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="predictions" name="SBA Predictions Run" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#4f46e5" : "#eab308"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Business KPIs bento layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-navy-50/30 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-navy-500 uppercase tracking-wider">
                <span>Diagnostic Reminders</span>
                <Mail className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-navy-900 dark:text-white font-mono">{emailsSent}</div>
              <p className="text-xs text-navy-500">Automated parent logs & homework notifications sent.</p>
            </div>

            <div className="bg-navy-50/30 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-navy-500 uppercase tracking-wider">
                <span>Fail Checkouts Log</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black text-red-500 font-mono">{failedPayments}</div>
              <p className="text-xs text-navy-500">Uncompleted EFT gateway callback requests today.</p>
            </div>

            <div className="bg-navy-50/30 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-navy-500 uppercase tracking-wider">
                <span>Tutoring Hours Concluded</span>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{practicalSessions} Hours</div>
              <p className="text-xs text-navy-500">Scheduled CAPS/IEB tutoring whiteboard hours active this week.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE TOPOLOGY */}
      {activeSubTab === "topology" && (
        <div className="space-y-6 animate-fadeIn text-left">
          {/* Header instructions */}
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="space-y-0.5">
              <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">Interactive Network Map</h3>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Click on any node to view real-time resource exhaustion metrics, microservice socket states, and trace active system connection lines.
              </p>
            </div>
            
            {/* Chaos Control buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => triggerChaos("redis")}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-[10px] uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Skull className="w-3.5 h-3.5" />
                Disconnect Redis
              </button>
              <button
                onClick={() => triggerChaos("celery")}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-mono font-black text-[10px] uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Kill Celery Worker
              </button>
              <button
                onClick={() => triggerChaos("nginx")}
                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-navy-950 font-mono font-black text-[10px] uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                Simulate NGINX Spike
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Map Canvas */}
            <div className="lg:col-span-2 bg-navy-950/95 border border-navy-800 rounded-3xl p-6 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-1.5 font-mono text-[9px] text-navy-400 uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Healthy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> Degraded</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Failed</span>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest font-black block">Active Microservices Graph</span>
                
                {/* Visual rendering of the topology network */}
                <div className="grid grid-cols-3 gap-y-12 gap-x-6 py-6 relative">
                  {nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const statusColors = {
                      healthy: "border-emerald-500 text-emerald-400 bg-emerald-950/20 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]",
                      degraded: "border-yellow-500 text-yellow-400 bg-yellow-950/20 shadow-[0_0_10px_-2px_rgba(234,179,8,0.3)] animate-pulse",
                      failed: "border-rose-500 text-rose-500 bg-rose-950/20 shadow-[0_0_15px_-2px_rgba(244,63,94,0.5)] animate-bounce"
                    };

                    const typeIcons = {
                      infrastructure: Server,
                      app: Cpu,
                      database: Database,
                      cache: Layers,
                      worker: Terminal,
                      external: Compass
                    };

                    const Icon = typeIcons[node.type];

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer text-center relative ${
                          isSelected ? "scale-105 ring-2 ring-gold-400 ring-offset-2 ring-offset-navy-950" : "hover:border-navy-500"
                        } ${statusColors[node.status]}`}
                      >
                        <Icon className="w-5 h-5 mb-1.5" />
                        <span className="text-[10px] font-bold font-mono tracking-tight leading-tight block truncate w-full">{node.label}</span>
                        
                        {/* Little CPU indicator */}
                        {node.cpu > 0 && (
                          <span className="text-[8px] font-mono text-navy-400 mt-1 block">
                            CPU: <span className="font-bold text-white">{node.cpu}%</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[9px] font-mono text-navy-500 text-center leading-normal">
                To test system resiliency, click "Disconnect Redis" above, watch alerts fire, and execute automated healing in the **Alerting & Self-Heal** sub-tab!
              </p>
            </div>

            {/* Selected Node Details Panel */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
              {(() => {
                const node = nodes.find(n => n.id === selectedNodeId);
                if (!node) {
                  return (
                    <div className="h-full flex items-center justify-center text-center py-20 text-navy-400 font-mono text-xs">
                      Select a node on the left to review metrics
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 text-left animate-fadeIn">
                    <div className="border-b border-navy-100 dark:border-navy-800 pb-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-widest">Node Specifications</span>
                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                          node.status === "healthy" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          node.status === "degraded" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                          "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {node.status}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-navy-900 dark:text-white font-mono">{node.label}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-navy-50 dark:bg-navy-950/40 p-3 rounded-xl border border-navy-100/50 dark:border-navy-800/40 space-y-1">
                        <span className="text-[8px] font-mono text-navy-400 font-bold uppercase block">Resource CPU</span>
                        <div className="text-sm font-black text-navy-950 dark:text-white font-mono">{node.cpu}%</div>
                        <div className="w-full bg-navy-200 dark:bg-navy-800 h-1 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${node.cpu > 80 ? "bg-red-500" : "bg-royal-600"}`} style={{ width: `${node.cpu}%` }} />
                        </div>
                      </div>

                      <div className="bg-navy-50 dark:bg-navy-950/40 p-3 rounded-xl border border-navy-100/50 dark:border-navy-800/40 space-y-1">
                        <span className="text-[8px] font-mono text-navy-400 font-bold uppercase block">Memory Heap</span>
                        <div className="text-sm font-black text-navy-950 dark:text-white font-mono">{node.memory}%</div>
                        <div className="w-full bg-navy-200 dark:bg-navy-800 h-1 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${node.memory > 80 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${node.memory}%` }} />
                        </div>
                      </div>

                      <div className="bg-navy-50 dark:bg-navy-950/40 p-3 rounded-xl border border-navy-100/50 dark:border-navy-800/40 space-y-1">
                        <span className="text-[8px] font-mono text-navy-400 font-bold uppercase block">Response Latency</span>
                        <div className="text-sm font-black text-navy-950 dark:text-white font-mono">{node.latencyMs} ms</div>
                        <span className="text-[8px] text-navy-400 font-mono block">Socket latency</span>
                      </div>

                      <div className="bg-navy-50 dark:bg-navy-950/40 p-3 rounded-xl border border-navy-100/50 dark:border-navy-800/40 space-y-1">
                        <span className="text-[8px] font-mono text-navy-400 font-bold uppercase block">Active Threads</span>
                        <div className="text-sm font-black text-navy-950 dark:text-white font-mono">{node.connections}</div>
                        <span className="text-[8px] text-navy-400 font-mono block">Concurrent sockets</span>
                      </div>
                    </div>

                    <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 p-3.5 rounded-2xl space-y-1.5 text-xs">
                      <div className="font-black text-navy-900 dark:text-white uppercase font-mono text-[9px] text-gold-500">Live Health Check Log</div>
                      {node.status === "healthy" && (
                        <p className="text-navy-600 dark:text-navy-300 font-medium leading-relaxed">
                          ✓ Socket binding succeeded. Metrics exporter running cleanly on port 3000 mapping successfully to server core. Internal caches verified.
                        </p>
                      )}
                      {node.status === "degraded" && (
                        <p className="text-yellow-600 dark:text-yellow-400 font-bold leading-relaxed">
                          ⚠ Socket pipeline latency is elevated. CPU threads are heavily utilized. Upstream nodes are reporting retry heartbeats.
                        </p>
                      )}
                      {node.status === "failed" && (
                        <p className="text-red-500 font-extrabold leading-relaxed animate-pulse">
                          ✕ CONNECTION REFUSED. Port unbound. Containers failing liveness checks. Check container log outputs and execute rolling self-healing.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2.5: SCALE & LOAD TESTING SANDBOX */}
      {activeSubTab === "scale" && (
        <div className="space-y-6 animate-fadeIn text-left">
          {/* Executive Performance KPIs & Safe Capacity Planning Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-navy-950 text-white border border-navy-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono text-gold-400 uppercase tracking-widest font-black block">Sustainable Throughput</span>
                <h4 className="text-xl font-black mt-1 font-mono text-white">{currentSustainableThroughput.toLocaleString()} <span className="text-xs text-navy-400">RPS</span></h4>
              </div>
              <span className="text-[9px] text-emerald-400 font-mono mt-2">✓ Verified nominal latency boundary</span>
            </div>
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono text-navy-400 uppercase tracking-widest font-black block">Peak Observed Throughput</span>
                <h4 className="text-xl font-black mt-1 font-mono text-navy-900 dark:text-white">{peakObservedRps.toLocaleString()} <span className="text-xs text-navy-400">RPS</span></h4>
              </div>
              <div className="w-full bg-navy-100 dark:bg-navy-850 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-gold-500 h-full" style={{ width: `${Math.min(100, (peakObservedRps / targetRpsGoal) * 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono text-navy-400 uppercase tracking-widest font-black block">Target Scale Objective</span>
                <h4 className="text-xl font-black mt-1 font-mono text-navy-900 dark:text-white">{targetRpsGoal.toLocaleString()} <span className="text-xs text-navy-400">RPS</span></h4>
              </div>
              <span className="text-[9px] text-royal-600 dark:text-royal-400 font-mono mt-2 font-black">{Math.floor((peakObservedRps / targetRpsGoal) * 100)}% of goal achieved</span>
            </div>
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono text-navy-400 uppercase tracking-widest font-black block">Est. Sustainable Daily Students</span>
                <h4 className="text-xl font-black mt-1 font-mono text-emerald-600 dark:text-emerald-400">
                  {Math.floor((currentSustainableThroughput * 86400) / 120).toLocaleString()}
                </h4>
              </div>
              <span className="text-[9px] text-navy-500 font-mono mt-2">Based on 120 requests/student daily bound</span>
            </div>
          </div>

          {/* Target Production Confirmation Modal Overlay */}
          {showProductionConfirm && (
            <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white dark:bg-navy-900 border border-rose-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-rose-500">
                  <AlertOctagon className="w-8 h-8 animate-bounce shrink-0" />
                  <div>
                    <h3 className="text-sm font-black font-mono uppercase tracking-wider">CRITICAL SAFEGUARD ALARM</h3>
                    <p className="text-xs text-navy-500">You are requesting a benchmark run against PRODUCTION!</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-navy-600 dark:text-navy-400 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 space-y-2">
                  <p className="font-bold">⚠️ PROD EXECUTION SAFETY BOUNDARIES CHECKLIST:</p>
                  <p>1. Never accidentally degrade Matric student mock trial engines.</p>
                  <p>2. Maximum non-admin boundary is capped at 50k VUs / 20k RPS.</p>
                  <p>3. Active checkout EFT APIs must be verified for sandboxed keys.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase block">Enter Production Access Override Token:</label>
                  <input
                    type="password"
                    placeholder="Enter Override Token..."
                    value={prodAccessCode}
                    onChange={(e) => setProdAccessCode(e.target.value)}
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2.5 rounded-xl font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      if (prodAccessCode === "AMH-PROD-SAFE") {
                        setShowProductionConfirm(false);
                        triggerBenchmarkStart(loadTestTool, loadTestUsers, loadTestSpawnRate, loadTestDuration, "Production", "Manual Prod Verification");
                      } else {
                        setBenchmarkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ INVALID Override code entered for Production testing. Safe limit aborted.`]);
                        setShowProductionConfirm(false);
                      }
                    }}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all"
                  >
                    Confirm Prod Run
                  </button>
                  <button
                    onClick={() => {
                      setShowProductionConfirm(false);
                      setSelectedEnvironment("Staging");
                      setBenchmarkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🛡️ Production run cancelled. Environment reverted to Staging.`]);
                    }}
                    className="px-4 py-2.5 bg-navy-100 dark:bg-navy-850 hover:bg-navy-200 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-mono font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Primary Operations Split: Control on Left, Real-Time Progress & Analytics on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Benchmark Controller (Span 4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Target Environment & Safeguard Selector */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-widest block border-b border-navy-50 dark:border-navy-800 pb-2">
                  1. Target Host Environment
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Local Docker", "Development", "Staging", "Production"] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => {
                        if (testStatus !== "running") {
                          setSelectedEnvironment(env);
                        }
                      }}
                      disabled={testStatus === "running"}
                      className={`p-2 rounded-xl text-[10px] font-mono font-black uppercase border text-center transition-all cursor-pointer ${
                        selectedEnvironment === env
                          ? env === "Production"
                            ? "bg-rose-600 border-rose-500 text-white"
                            : "bg-royal-600 border-royal-500 text-white"
                          : "border-navy-100 dark:border-navy-850 text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-950/50"
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
                {selectedEnvironment === "Production" && (
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-rose-500 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                    <span>PROD limits engaged. Authorization code required.</span>
                  </div>
                )}
              </div>

              {/* Benchmark Configuration Presets & Form Controls */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-800 pb-2">
                  <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                    2. Parameters & Presets
                  </span>
                  <Sliders className="w-3.5 h-3.5 text-royal-500" />
                </div>

                {/* Templates Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase block">Active Template Preset:</label>
                  <select
                    value={selectedTemplateId}
                    disabled={testStatus === "running"}
                    onChange={(e) => {
                      const tmplId = e.target.value;
                      setSelectedTemplateId(tmplId);
                      const tmpl = benchmarkTemplates.find(t => t.id === tmplId);
                      if (tmpl) {
                        setLoadTestTool(tmpl.tool);
                        setLoadTestUsers(tmpl.users);
                        setLoadTestSpawnRate(tmpl.rate);
                        setLoadTestDuration(tmpl.duration);
                        setTestType(tmpl.profile);
                        setBenchmarkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📋 Loaded configuration template: "${tmpl.name}"`]);
                      }
                    }}
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-2.5 rounded-xl font-mono text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  >
                    <option value="">-- Choose Reusable Config Template --</option>
                    {benchmarkTemplates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.tool.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                {/* Tool Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase block">Benchmark Driver:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["locust", "k6", "wrk"] as const).map(tool => (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => {
                          if (testStatus !== "running") {
                            setLoadTestTool(tool);
                            setActiveCodeTab(tool === "locust" ? "locust" : tool === "k6" ? "k6" : "wrk");
                          }
                        }}
                        className={`p-1.5 rounded-xl border font-mono text-[11px] font-black uppercase text-center transition-all ${
                          loadTestTool === tool
                            ? "bg-navy-950 border-gold-400 text-gold-400"
                            : "border-navy-100 dark:border-navy-850 hover:bg-navy-50 text-navy-500"
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Users Input */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-black text-navy-500 uppercase">
                    <span>Concurrency Limit:</span>
                    <span className="text-royal-600 dark:text-royal-400">{loadTestUsers.toLocaleString()} VUs</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={50000}
                    step={100}
                    disabled={testStatus === "running"}
                    value={loadTestUsers}
                    onChange={(e) => setLoadTestUsers(parseInt(e.target.value))}
                    className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
                  />
                </div>

                {/* Spawn Rate & Duration Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-500 uppercase block">Spawn Rate (/s):</label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      disabled={testStatus === "running"}
                      value={loadTestSpawnRate}
                      onChange={(e) => setLoadTestSpawnRate(Math.max(1, parseInt(e.target.value) || 10))}
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-2 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-500 uppercase block">Duration (Secs):</label>
                    <input
                      type="number"
                      min={10}
                      max={1800}
                      disabled={testStatus === "running"}
                      value={loadTestDuration}
                      onChange={(e) => setLoadTestDuration(Math.max(5, parseInt(e.target.value) || 10))}
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-2 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Trigger Buttons */}
                <button
                  onClick={() => {
                    const tmpl = benchmarkTemplates.find(t => t.id === selectedTemplateId);
                    const name = tmpl ? tmpl.name : "Custom Load Run";
                    triggerBenchmarkStart(loadTestTool, loadTestUsers, loadTestSpawnRate, loadTestDuration, selectedEnvironment, name);
                  }}
                  disabled={testStatus === "running"}
                  className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    testStatus === "running"
                      ? "bg-navy-50 dark:bg-navy-950 text-navy-400 cursor-not-allowed"
                      : "bg-royal-600 hover:bg-royal-700 text-white animate-pulse"
                  }`}
                >
                  <Play className="w-4 h-4 text-emerald-400" />
                  Spawn Celery Job
                </button>
              </div>

              {/* Recurring Schedules Orchestration Card */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-800 pb-2">
                  <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                    3. Recurring Cron Schedules
                  </span>
                  <Calendar className="w-3.5 h-3.5 text-royal-500" />
                </div>
                <div className="space-y-2">
                  {schedules.map(sched => (
                    <div key={sched.id} className="flex items-center justify-between bg-navy-50 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-800 p-2.5 rounded-xl font-mono text-[10px]">
                      <div>
                        <div className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${sched.enabled ? "bg-emerald-500 animate-ping" : "bg-navy-400"}`}></span>
                          {sched.name}
                        </div>
                        <div className="text-navy-500 mt-1">Cron: {sched.cron} | {sched.users} VUs ({sched.tool.toUpperCase()})</div>
                      </div>
                      <button
                        onClick={() => {
                          setSchedules(prev => prev.map(s => s.id === sched.id ? { ...s, enabled: !s.enabled } : s));
                        }}
                        className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                          sched.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-navy-200 text-navy-600"
                        }`}
                      >
                        {sched.enabled ? "Active" : "Paused"}
                      </button>
                    </div>
                  ))}
                </div>

                {showAddSchedule ? (
                  <div className="bg-navy-50/50 dark:bg-navy-950/30 border border-navy-100 dark:border-navy-800 p-3 rounded-xl space-y-3 font-mono text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-navy-500 block">Schedule Name:</label>
                      <input
                        type="text"
                        placeholder="Nightly Audit Run..."
                        value={newSchedName}
                        onChange={(e) => setNewSchedName(e.target.value)}
                        className="w-full bg-white dark:bg-navy-900 border p-1.5 rounded text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase font-black text-navy-500 block">Cron string:</label>
                        <input
                          type="text"
                          value={newSchedCron}
                          onChange={(e) => setNewSchedCron(e.target.value)}
                          className="w-full bg-white dark:bg-navy-900 border p-1.5 rounded text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black text-navy-500 block">Tool:</label>
                        <select
                          value={newSchedTool}
                          onChange={(e: any) => setNewSchedTool(e.target.value)}
                          className="w-full bg-white dark:bg-navy-900 border p-1 rounded text-xs"
                        >
                          <option value="locust">Locust</option>
                          <option value="k6">k6</option>
                          <option value="wrk">wrk</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-1.5 justify-end pt-1">
                      <button
                        onClick={() => {
                          if (!newSchedName) return;
                          const newSched: BenchmarkSchedule = {
                            id: `sched-${Date.now()}`,
                            name: newSchedName,
                            cron: newSchedCron,
                            tool: newSchedTool,
                            users: newSchedUsers,
                            duration: newSchedDuration,
                            enabled: true
                          };
                          setSchedules(prev => [...prev, newSched]);
                          setShowAddSchedule(false);
                          setNewSchedName("");
                        }}
                        className="bg-royal-600 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowAddSchedule(false)}
                        className="bg-navy-200 text-navy-700 px-2.5 py-1 rounded text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddSchedule(true)}
                    className="w-full py-1.5 bg-navy-50 dark:bg-navy-850 hover:bg-navy-100 dark:hover:bg-navy-800 border border-dashed border-navy-250 dark:border-navy-850 rounded-xl text-[10px] font-mono font-black uppercase text-center text-navy-600 dark:text-navy-400 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-royal-500" />
                    Create Cron Schedule
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Real-Time telemetry & Diagnostics (Span 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Telemetry Gauge Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest block">Active Clients</span>
                    <h3 className="text-xl font-black mt-1 font-mono text-navy-900 dark:text-white">
                      {testStatus === "idle" ? "-" : simulatedUsers.toLocaleString()}
                    </h3>
                  </div>
                  <span className="text-[9px] text-navy-400 font-mono">Simulated master VUs</span>
                </div>
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest block">Throughput (RPS)</span>
                    <h3 className="text-xl font-black mt-1 font-mono text-emerald-600 dark:text-emerald-400">
                      {testStatus === "idle" ? "-" : simulatedRps.toLocaleString()}
                    </h3>
                  </div>
                  <span className="text-[9px] text-navy-400 font-mono">Requests / sec</span>
                </div>
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest block">Avg Latency (ms)</span>
                    <h3 className={`text-xl font-black mt-1 font-mono ${simulatedLatency > 300 ? "text-rose-500 animate-pulse" : "text-navy-900 dark:text-white"}`}>
                      {testStatus === "idle" ? "-" : `${simulatedLatency}ms`}
                    </h3>
                  </div>
                  <div className="text-[8px] font-mono text-navy-400 flex justify-between">
                    <span>P95: {testStatus === "idle" ? "-" : `${simulatedP95}ms`}</span>
                    <span>P99: {testStatus === "idle" ? "-" : `${simulatedP99}ms`}</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest block">Error Rate (%)</span>
                    <h3 className={`text-xl font-black mt-1 font-mono ${simulatedErrorRate > 1.0 ? "text-rose-500 animate-bounce" : "text-emerald-600"}`}>
                      {testStatus === "idle" ? "-" : `${simulatedErrorRate}%`}
                    </h3>
                  </div>
                  <span className="text-[9px] text-navy-400 font-mono">Non-2xx HTTP failures</span>
                </div>
              </div>

              {/* Live Infrastructure Correlated Metrics Bar */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-widest block border-b border-navy-50 dark:border-navy-800 pb-2 mb-3">
                  Live Infrastructure Resource Correlation (Telemetry Meter)
                </span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-[9px] text-navy-500 font-bold">
                      <span>Server CPU:</span>
                      <span className={infraMetrics.cpu > 80 ? "text-rose-500 font-black animate-pulse" : "text-navy-900 dark:text-white"}>{infraMetrics.cpu}%</span>
                    </div>
                    <div className="w-full bg-navy-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${infraMetrics.cpu > 80 ? "bg-rose-500" : "bg-royal-500"}`} style={{ width: `${infraMetrics.cpu}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-[9px] text-navy-500 font-bold">
                      <span>VM Memory:</span>
                      <span>{infraMetrics.memory}%</span>
                    </div>
                    <div className="w-full bg-navy-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-royal-500 h-full" style={{ width: `${infraMetrics.memory}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-[9px] text-navy-500 font-bold">
                      <span>PG Pool Conns:</span>
                      <span className={infraMetrics.dbConnections > 120 ? "text-amber-500 font-black" : "text-navy-900 dark:text-white"}>{infraMetrics.dbConnections}/150</span>
                    </div>
                    <div className="w-full bg-navy-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${infraMetrics.dbConnections > 120 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (infraMetrics.dbConnections / 150) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-[9px] text-navy-500 font-bold">
                      <span>Redis Mem:</span>
                      <span>{infraMetrics.redisMemory} GB</span>
                    </div>
                    <div className="w-full bg-navy-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (infraMetrics.redisMemory / 4.0) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono col-span-2 md:col-span-1">
                    <div className="flex justify-between text-[9px] text-navy-500 font-bold">
                      <span>Celery Queue:</span>
                      <span className={infraMetrics.celeryQueue > 10 ? "text-rose-500 font-black" : "text-navy-900"}>{infraMetrics.celeryQueue}</span>
                    </div>
                    <div className="w-full bg-navy-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (infraMetrics.celeryQueue / 100) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distributed Logs Console */}
              <div className="bg-navy-950 rounded-2xl p-4 border border-navy-850 h-56 flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-navy-850 pb-2">
                  <span className="text-[9px] font-mono font-black text-gold-400 uppercase tracking-widest">
                    Distributed load agent systems out logs (Celery Broker Logs)
                  </span>
                  <span className="text-[8px] font-mono text-navy-500 uppercase">{testStatus === "running" ? "STREAMING" : "CONNECTED"}</span>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-[9px] text-navy-300 space-y-1 py-2 pr-2 scrollbar-thin max-h-40">
                  {benchmarkLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-navy-500 italic">
                      Trigger a benchmark job to start monitoring the active queue...
                    </div>
                  ) : (
                    benchmarkLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 leading-relaxed">
                        <span className="text-navy-550 select-none">[{idx + 1}]</span>
                        <span className={log.includes('⚠️') || log.includes('❌') ? "text-rose-400 font-bold" : log.includes('✅') ? "text-emerald-400 font-black" : "text-navy-300"}>
                          {log}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Progression Charts */}
              {testStatus !== "idle" && benchmarkChartData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm h-44">
                    <span className="text-[8px] font-mono font-black text-navy-400 uppercase block mb-2">Throughput Stream (RPS)</span>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={benchmarkChartData}>
                        <defs>
                          <linearGradient id="colorRps2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-850" />
                        <XAxis dataKey="sec" className="text-[8px] font-mono text-navy-400" />
                        <YAxis className="text-[8px] font-mono text-navy-400" />
                        <Area type="monotone" dataKey="rps" stroke="#10b981" strokeWidth={1.5} fill="url(#colorRps2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm h-44">
                    <span className="text-[8px] font-mono font-black text-navy-400 uppercase block mb-2">Avg Latency Stream (ms)</span>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={benchmarkChartData}>
                        <defs>
                          <linearGradient id="colorLat2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-850" />
                        <XAxis dataKey="sec" className="text-[8px] font-mono text-navy-400" />
                        <YAxis className="text-[8px] font-mono text-navy-400" />
                        <Area type="monotone" dataKey="latency" stroke="#4f46e5" strokeWidth={1.5} fill="url(#colorLat2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Automated Bottleneck Diagnostics & AI Advisor Panel */}
              {activeBottleneck && (
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-800 pb-2">
                    <div className="flex items-center gap-1.5 text-royal-600 dark:text-royal-400">
                      <Brain className="w-5 h-5 animate-pulse" />
                      <h4 className="text-xs font-black font-mono uppercase tracking-widest text-navy-900 dark:text-white">AI-Driven Bottleneck Diagnosis & Performance Advisor</h4>
                    </div>
                    <span className="text-[8px] font-mono bg-royal-500/10 text-royal-600 px-2.5 py-0.5 rounded-full font-black">
                      Confidence: {activeBottleneck.confidence}%
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-navy-50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-100 dark:border-navy-800 space-y-2">
                      <div className="text-[10px] uppercase font-black tracking-wider text-amber-500 font-mono">Active Diagnosis</div>
                      <h5 className="text-sm font-black text-navy-950 dark:text-white font-mono">{activeBottleneck.diagnosis}</h5>
                      <p className="text-[10.5px] leading-relaxed text-navy-500">{activeBottleneck.reason}</p>
                    </div>
                    <div className="bg-navy-50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-100 dark:border-navy-800 space-y-2">
                      <div className="text-[10px] uppercase font-black tracking-wider text-emerald-500 font-mono">✓ Optimization Recipe</div>
                      <code className="text-[10px] leading-relaxed text-navy-600 dark:text-navy-400 block font-mono bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 p-2 rounded-lg whitespace-pre-wrap">
                        {activeBottleneck.recommendation}
                      </code>
                    </div>
                  </div>
                  {aiAdvisorText && (
                    <div className="bg-royal-500/5 border border-royal-500/10 rounded-2xl p-4 text-[11px] leading-relaxed text-navy-600 dark:text-navy-300 font-mono space-y-2">
                      <div className="font-black text-royal-700 dark:text-royal-400 uppercase tracking-wider flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        CAPS Platform Capacity Planning Advisor Recommendation
                      </div>
                      <p>{aiAdvisorText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Job Management Queue & Historic Benchmarks Table */}
          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest">Job Registry</span>
                <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">Benchmark Job Queue (Celery Queue Management Console)</h4>
              </div>
              <span className="text-[10px] font-mono text-navy-400">Total Runs: {benchmarkJobs.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-800 text-navy-400 text-[9px] uppercase font-black">
                    <th className="pb-2.5">Job ID</th>
                    <th className="pb-2.5">Environment</th>
                    <th className="pb-2.5">Tool / Profile</th>
                    <th className="pb-2.5">Operator</th>
                    <th className="pb-2.5">Started At</th>
                    <th className="pb-2.5">Duration (Elapsed)</th>
                    <th className="pb-2.5 text-center">Peak RPS</th>
                    <th className="pb-2.5 text-center">Avg Lat (P95)</th>
                    <th className="pb-2.5 text-center">Error Rate</th>
                    <th className="pb-2.5 text-center">SLA BADGE</th>
                    <th className="pb-2.5 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-800/60">
                  {benchmarkJobs.map(job => (
                    <tr key={job.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-950/10">
                      <td className="py-3 font-bold text-navy-950 dark:text-white flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          job.status === "running" ? "bg-amber-500 animate-pulse" :
                          job.status === "paused" ? "bg-blue-400" :
                          job.status === "completed" ? "bg-emerald-500" : "bg-navy-300"
                        }`}></span>
                        {job.id}
                      </td>
                      <td className="py-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          job.environment === "Production" ? "bg-rose-500/10 text-rose-500" :
                          job.environment === "Staging" ? "bg-royal-500/10 text-royal-500" :
                          "bg-navy-100 text-navy-600"
                        }`}>{job.environment}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-black text-navy-900 dark:text-white">{job.tool.toUpperCase()}</span>
                        <div className="text-[9px] text-navy-400 mt-0.5">{job.profileName}</div>
                      </td>
                      <td className="py-3 text-navy-500">{job.operator}</td>
                      <td className="py-3 text-navy-500">{job.startedAt}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{job.elapsed}s / {job.duration}s</span>
                          {job.status === "running" && (
                            <div className="w-12 bg-navy-100 dark:bg-navy-850 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-royal-500 h-full animate-pulse" style={{ width: `${job.progress}%` }}></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center font-bold text-navy-950 dark:text-white">
                        {job.status === "running" && job.progress === 0 ? "-" : job.peakRps.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        {job.status === "running" && job.progress === 0 ? "-" : `${job.avgLatency}ms (${job.p95}ms)`}
                      </td>
                      <td className="py-3 text-center text-navy-500">
                        {job.status === "running" && job.progress === 0 ? "-" : `${job.errorRate}%`}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest ${
                          job.slaResult === "PASS" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          job.slaResult === "FAIL" ? "bg-rose-500/10 text-rose-500" :
                          "bg-navy-100 text-navy-400"
                        }`}>{job.slaResult}</span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {job.status === "running" && (
                            <>
                              <button
                                onClick={() => handlePauseJob(job.id)}
                                title="Pause active test worker"
                                className="p-1 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 dark:hover:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded text-navy-600 transition-all cursor-pointer"
                              >
                                <Pause className="w-3.5 h-3.5 text-royal-500" />
                              </button>
                              <button
                                onClick={() => handleCancelJob(job.id)}
                                title="Abort active Celery task"
                                className="p-1 bg-rose-50 hover:bg-rose-100 rounded text-rose-600 border border-rose-100 transition-all cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            </>
                          )}
                          {job.status === "paused" && (
                            <button
                              onClick={() => handleResumeJob(job.id)}
                              title="Resume execution queue"
                              className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 border border-emerald-100 transition-all cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 text-emerald-500" />
                            </button>
                          )}
                          {(job.status === "completed" || job.status === "cancelled") && (
                            <>
                              <button
                                onClick={() => handleRerunJob(job)}
                                title="Re-submit job to Celery"
                                className="p-1 bg-royal-50 hover:bg-royal-100 rounded text-royal-600 border border-royal-100 transition-all cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-royal-500" />
                              </button>
                              <button
                                onClick={() => handleCloneJob(job)}
                                title="Clone configuration criteria"
                                className="p-1 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 dark:hover:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded text-navy-600 transition-all cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-navy-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROMETHEUS SCRAPER LOGS */}
      {activeSubTab === "prometheus" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">Prometheus Metrix Log Scraper</h3>
            <p className="text-sm text-navy-500 dark:text-navy-400">
              Live-ticking Prometheus daemon endpoint scraper retrieving instrumentation variables from host, Celery workers, Redis cluster, and NGINX logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Scraper Stats Panel */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 space-y-2">
                <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest block">Scraping Status</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  ACTIVE
                </div>
                <div className="text-[10px] text-navy-500 font-mono">Interval: 1.5 seconds</div>
              </div>

              <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 space-y-1">
                <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest block">Total Scrapes Run</span>
                <div className="text-xl font-black text-navy-900 dark:text-white font-mono">112,841</div>
                <span className="text-[9px] text-navy-500 font-mono">Since system bootup</span>
              </div>

              <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 space-y-1">
                <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest block">Scrape Failure Rate</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">0.002%</div>
                <span className="text-[9px] text-navy-500 font-mono">Extremely nominal</span>
              </div>
            </div>

            {/* Simulated live-logging Terminal */}
            <div className="md:col-span-3 space-y-2 text-left">
              <span className="text-xs font-bold text-navy-500 uppercase tracking-wider font-mono">Scraper Pipeline Console Output</span>
              <div className="bg-navy-950 p-4 rounded-2xl border border-navy-850 h-[320px] overflow-y-auto font-mono text-[10.5px] text-navy-300 space-y-1.5 shadow-2xl relative">
                {promLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-navy-500">
                    Initializing Prometheus metric streams...
                  </div>
                ) : (
                  promLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 leading-relaxed">
                      <span className="text-navy-550 shrink-0 select-none">[{idx + 1}]</span>
                      <span className={log.includes('status="500"') ? "text-rose-400 font-black animate-pulse" : "text-navy-350"}>
                        {log}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logTerminalEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GRAFANA CHARTS */}
      {activeSubTab === "grafana" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-navy-150 dark:border-navy-800 pb-3">
            <div className="space-y-0.5 text-left">
              <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">Grafana Metrics Visualizer</h3>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Visualization dashboard mimicking complete container telemetry pipelines for host load average, NGINX networking, and cache latency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Health / CPU Load */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black text-navy-400 uppercase">System CPU & Memory load</span>
                <span className="text-[9px] bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-royal-300 font-mono font-black px-1.5 py-0.5 rounded">
                  Host-Exporter
                </span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/50" />
                    <XAxis dataKey="time" className="text-[8px] text-navy-400 font-mono" />
                    <YAxis className="text-[8px] text-navy-400 font-mono" />
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "8px" }} />
                    <Legend wrapperStyle={{ fontSize: "9px" }} />
                    <Line type="monotone" dataKey="cpu" name="Host CPU (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="memory" name="RAM Heap (%)" stroke="#ca8a04" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NGINX Requests Per Second */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black text-navy-400 uppercase">NGINX Requests Per Second</span>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-black px-1.5 py-0.5 rounded">
                  NGINX-Exporter
                </span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/50" />
                    <XAxis dataKey="time" className="text-[8px] text-navy-400 font-mono" />
                    <YAxis className="text-[8px] text-navy-400 font-mono" />
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="requests" name="HTTP Requests/Sec" stroke="#10b981" strokeWidth={2} fill="url(#colorRequests)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Application Latency Spikes */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black text-navy-400 uppercase">App Latency Scans</span>
                <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                  alerts.some(a=>a.id==="alert-redis") ? "bg-red-500/10 text-red-500" : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                }`}>
                  {alerts.some(a=>a.id==="alert-redis") ? "DEGRADED" : "Django-Core"}
                </span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/50" />
                    <XAxis dataKey="time" className="text-[8px] text-navy-400 font-mono" />
                    <YAxis className="text-[8px] text-navy-400 font-mono" />
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="latency" name="API Socket (ms)" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ALERTING & SELF-HEAL */}
      {activeSubTab === "alerts" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-0.5 text-left">
            <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">Alerts Outbox & Auto Self-Healing</h3>
            <p className="text-sm text-navy-500 dark:text-navy-400">
              Active system alerts triggered via Prometheus criteria. Run automatic self-healing routines to resolve, re-bind container sockets, and close tickets.
            </p>
          </div>

          {/* Healing orchestration runner visual logs */}
          {healingAlertId && (
            <div className="bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-800 p-5 rounded-3xl space-y-4 text-left animate-slideDown">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono font-black text-gold-400 uppercase tracking-widest">Self-Healing Execution logs</h4>
                {isHealingRunning ? (
                  <span className="text-[10px] font-mono font-bold text-amber-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Orchestrating Recovery...
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Self-Healing Complete
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-navy-200 dark:bg-navy-900 h-2.5 rounded-full overflow-hidden border border-navy-100 dark:border-navy-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300" 
                  style={{ width: `${healingProgress}%` }} 
                />
              </div>

              {/* Terminal progress logger */}
              <div className="bg-navy-950 p-4 rounded-xl border border-navy-850 max-h-48 overflow-y-auto font-mono text-[10px] text-navy-300 space-y-1.5">
                {healingLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-navy-500 shrink-0">[{index + 1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            {/* Active alerts panel */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-2">
                Active Prometheus Alerts ({alerts.length})
              </h3>

              {alerts.length === 0 ? (
                <div className="py-16 text-center text-navy-400 font-mono space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-navy-900 dark:text-white">All Microservices Nominal</p>
                  <p className="text-xs text-navy-500">Prometheus scraper telemetry verifies healthy SLAs across all clusters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border border-navy-150 dark:border-navy-800 rounded-2xl p-4 bg-navy-50/20 dark:bg-navy-950/20 space-y-3.5 relative overflow-hidden">
                      {/* Red bar indicator */}
                      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-rose-500" />
                      
                      <div className="pl-2 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-mono font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            CRITICAL
                          </span>
                          <span className="text-[9.5px] text-navy-400 font-mono">{alert.triggeredAt}</span>
                        </div>
                        <h4 className="text-xs font-black text-navy-900 dark:text-white font-mono">{alert.title}</h4>
                        <div className="text-[10px] text-navy-500 font-mono">Source: {alert.source}</div>
                      </div>

                      {/* Runbook Accordion */}
                      <div className="pl-2 space-y-1.5 bg-navy-50 dark:bg-navy-950/40 p-2.5 rounded-xl border border-navy-100/50 dark:border-navy-800/40">
                        <span className="text-[9px] font-mono font-black uppercase text-gold-500 tracking-wider block">Runbook Checklist:</span>
                        <ul className="space-y-1 text-[10px] font-medium text-navy-600 dark:text-navy-400">
                          {alert.runbookSteps.map((step, index) => (
                            <li key={index} className="flex gap-1.5">
                              <span className="text-royal-600 font-bold shrink-0">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pl-2 flex gap-2">
                        <button
                          onClick={() => startSelfHealing(alert.id)}
                          disabled={isHealingRunning}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-[10px] uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          Execute Self-Heal
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Incident Tickets and Outbox */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-2">
                Incident Response Tickets & Auditable Outbox
              </h3>

              {/* Form to open incident */}
              <form onSubmit={handleCreateIncident} className="bg-navy-50/50 dark:bg-navy-950/10 p-4 border border-navy-150 dark:border-navy-800 rounded-2xl space-y-3">
                <span className="text-[9px] font-mono font-black uppercase text-gold-500 block">Open New Incident Ticket</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-mono text-navy-400 uppercase block font-bold">Incident Summary Title</label>
                    <input 
                      type="text" 
                      value={newIncTitle}
                      onChange={(e)=>setNewIncTitle(e.target.value)}
                      placeholder="e.g. pg_restore: socket descriptor leak"
                      className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-navy-400 uppercase block font-bold">Severity</label>
                    <select
                      value={newIncSeverity}
                      onChange={(e)=>setNewIncSeverity(e.target.value as any)}
                      className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1.5 text-xs rounded-xl"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-navy-400 uppercase block font-bold">Status</label>
                    <select
                      value={newIncStatus}
                      onChange={(e)=>setNewIncStatus(e.target.value as any)}
                      className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1.5 text-xs rounded-xl"
                    >
                      <option value="Investigating">Investigating</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-mono text-navy-400 uppercase block font-bold">Root Cause Assessment</label>
                    <textarea 
                      value={newIncRootCause}
                      onChange={(e)=>setNewIncRootCause(e.target.value)}
                      placeholder="Describe what logs indicate..."
                      rows={2}
                      className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-royal-600 hover:bg-royal-700 text-white font-mono font-black text-[10px] uppercase rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Open Incident Ticket
                </button>
              </form>

              {/* Incidents ticket outbox */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {incidents.map((inc) => (
                  <div key={inc.id} className="border border-navy-150 dark:border-navy-800 p-3.5 rounded-xl bg-navy-50/30 dark:bg-navy-950/20 space-y-2 relative">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <div className="flex gap-1.5 items-center">
                        <span className="font-extrabold text-navy-900 dark:text-white uppercase text-[9px]">{inc.id}</span>
                        <span className={`px-1.5 rounded-full font-bold text-[8.5px] uppercase ${
                          inc.status === "Resolved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                          "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse"
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                      <span className="text-navy-400">{new Date(inc.startedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-navy-950 dark:text-white leading-snug">{inc.title}</h4>
                      <div className="text-[10px] text-navy-500">Assignee: {inc.assignedEngineer}</div>
                    </div>

                    <div className="text-[10px] bg-navy-50 dark:bg-navy-950/40 p-2 rounded-lg space-y-0.5 font-medium">
                      <div className="text-navy-550 font-black text-[8px] uppercase">Root Cause</div>
                      <p className="text-navy-700 dark:text-navy-300 line-clamp-2">{inc.rootCause}</p>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button 
                        onClick={() => handleExportPostmortem(inc)}
                        className="px-2.5 py-1 bg-navy-800 hover:bg-navy-750 text-navy-300 hover:text-white text-[9px] font-mono font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        Postmortem PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5.5: INCIDENT RESPONSE CENTER */}
      {activeSubTab === "incidents" && (
        <div className="space-y-6 animate-fadeIn text-left">
          {/* Section Header */}
          <div className="border-b border-navy-150 dark:border-navy-800 pb-4 space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">Incident Response & Postmortem Operations Center</h3>
              </div>
              <span className="font-mono text-[9px] font-black text-gold-500 uppercase bg-navy-950 px-2.5 py-1 rounded-lg border border-gold-500/20">
                PROMETHEUS TELEMETRY INTEGRATION
              </span>
            </div>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Track active system outages, allocate engineering task ownership, document root causes, and compile official PDF postmortem reports for stakeholders.
            </p>
          </div>

          {/* Key Outage KPI Strips */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Total Incidents Logged</span>
                <div className="text-2xl font-black text-navy-900 dark:text-white mt-1 font-mono">
                  {incidents.length}
                </div>
              </div>
              <span className="text-[9px] text-navy-450 font-mono">All-time system database tickets</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-rose-500 uppercase tracking-wider block">Critical Severities</span>
                <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
                  {incidents.filter(i => i.severity === "Critical").length}
                </div>
              </div>
              <span className="text-[9px] text-navy-450 font-mono">Immediate hotfix required</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-wider block">Active Unresolved</span>
                <div className="text-2xl font-black text-amber-600 mt-1 font-mono animate-pulse">
                  {incidents.filter(i => i.status !== "Resolved").length}
                </div>
              </div>
              <span className="text-[9px] text-navy-450 font-mono">Under active triage/mitigation</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-wider block">Avg MTTR (Mean-Time)</span>
                <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                  12.4 Min
                </div>
              </div>
              <span className="text-[9px] text-navy-450 font-mono">SLA benchmark guarantee: 30 Min</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* COLUMN 1: FORM TO OPEN INCIDENT */}
            <div className="xl:col-span-1 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="border-b border-navy-50 dark:border-navy-800 pb-2 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-royal-600" />
                <span className="text-xs font-mono font-black text-navy-950 dark:text-white uppercase tracking-wider">
                  Open New Incident Ticket
                </span>
              </div>

              <form onSubmit={handleCreateIncident} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-navy-500 uppercase block font-bold">Incident Title Summary</label>
                  <input
                    type="text"
                    value={newIncTitle}
                    onChange={(e) => setNewIncTitle(e.target.value)}
                    placeholder="e.g. Matric upgrade engine timeout"
                    required
                    className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2.5 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-navy-500 uppercase block font-bold">Severity</label>
                    <select
                      value={newIncSeverity}
                      onChange={(e) => setNewIncSeverity(e.target.value as any)}
                      className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white"
                    >
                      <option value="Critical">🚨 Critical</option>
                      <option value="High">⚠️ High</option>
                      <option value="Medium">⚡ Medium</option>
                      <option value="Low">💤 Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-navy-500 uppercase block font-bold">Initial Status</label>
                    <select
                      value={newIncStatus}
                      onChange={(e) => setNewIncStatus(e.target.value as any)}
                      className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white"
                    >
                      <option value="Investigating">🔍 Investigating</option>
                      <option value="Acknowledged">✍ Acknowledged</option>
                      <option value="Resolved">✅ Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-navy-500 uppercase block font-bold">Assignee Engineer</label>
                  <select
                    value={newIncEngineer}
                    onChange={(e) => setNewIncEngineer(e.target.value)}
                    className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2.5 text-xs rounded-xl text-navy-900 dark:text-white"
                  >
                    <option value="Moukangwe Bethuel">Moukangwe Bethuel (Admin)</option>
                    <option value="Sipho Khumalo">Sipho Khumalo (DevOps)</option>
                    <option value="Sipho Maseko">Sipho Maseko (DBA)</option>
                    <option value="Amanda Dlamini">Amanda Dlamini (SRE)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-navy-500 uppercase block font-bold">Root Cause Assessment</label>
                  <textarea
                    value={newIncRootCause}
                    onChange={(e) => setNewIncRootCause(e.target.value)}
                    placeholder="Describe failure signals, stack traces, or anomalous metrics..."
                    rows={3}
                    className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2.5 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-navy-500 uppercase block font-bold">Resolution Steps</label>
                  <textarea
                    value={newIncResolution}
                    onChange={(e) => setNewIncResolution(e.target.value)}
                    placeholder="Describe rollbacks, configuration updates, or database state flushing..."
                    rows={3}
                    className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2.5 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Dispatch Incident Ticket
                </button>
              </form>
            </div>

            {/* COLUMN 2: ACTIVE TICKET LEDGER LIST */}
            <div className="xl:col-span-2 space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    value={incidentSearchQuery}
                    onChange={(e) => setIncidentSearchQuery(e.target.value)}
                    placeholder="Search tickets by ID, title, or engineer..."
                    className="w-full bg-navy-50/50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 p-2 pl-3 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 w-full md:w-auto items-center justify-end flex-wrap">
                  {/* Severity Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-navy-400 font-bold uppercase">Severity:</span>
                    <select
                      value={incidentSeverityFilter}
                      onChange={(e) => setIncidentSeverityFilter(e.target.value)}
                      className="bg-navy-50/50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 p-1.5 text-xs rounded-xl text-navy-900 dark:text-white"
                    >
                      <option value="All">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-navy-400 font-bold uppercase">Status:</span>
                    <select
                      value={incidentStatusFilter}
                      onChange={(e) => setIncidentStatusFilter(e.target.value)}
                      className="bg-navy-50/50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 p-1.5 text-xs rounded-xl text-navy-900 dark:text-white"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tickets Stack */}
              <div className="space-y-4">
                {incidents
                  .filter((inc) => {
                    const matchesSearch = 
                      inc.id.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
                      inc.title.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
                      inc.assignedEngineer.toLowerCase().includes(incidentSearchQuery.toLowerCase());
                    const matchesSeverity = incidentSeverityFilter === "All" || inc.severity === incidentSeverityFilter;
                    const matchesStatus = incidentStatusFilter === "All" || inc.status === incidentStatusFilter;
                    return matchesSearch && matchesSeverity && matchesStatus;
                  })
                  .map((inc) => {
                    const isEditing = editingIncidentId === inc.id;
                    return (
                      <div
                        key={inc.id}
                        className={`bg-white dark:bg-navy-900 border transition-all rounded-2xl p-5 shadow-sm space-y-4 text-left ${
                          inc.status === "Resolved" 
                            ? "border-navy-150 dark:border-navy-850" 
                            : inc.severity === "Critical"
                            ? "border-rose-400 dark:border-rose-900/60 ring-1 ring-rose-500/10"
                            : "border-amber-400 dark:border-amber-900/60"
                        }`}
                      >
                        {/* Title Bar */}
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div className="space-y-1 flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-black text-navy-400 uppercase tracking-wider">{inc.id}</span>
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase ${
                                inc.severity === "Critical" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400" :
                                inc.severity === "High" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                                "bg-royal-100 text-royal-800 dark:bg-royal-950/40 dark:text-royal-400"
                              }`}>
                                {inc.severity}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase ${
                                inc.status === "Resolved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                                "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse"
                              }`}>
                                {inc.status}
                              </span>
                            </div>

                            {isEditing ? (
                              <input
                                type="text"
                                value={editIncTitle}
                                onChange={(e) => setEditIncTitle(e.target.value)}
                                className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl font-bold mt-1.5 text-navy-900 dark:text-white"
                              />
                            ) : (
                              <h4 className="text-sm font-black text-navy-950 dark:text-white leading-snug">
                                {inc.title}
                              </h4>
                            )}
                          </div>

                          <div className="text-right text-[10px] font-mono text-navy-400">
                            {new Date(inc.startedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </div>
                        </div>

                        {/* Assignee / Recovery timeline options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-navy-50 dark:border-navy-800/60 py-3.5">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-navy-450" />
                            <div className="space-y-0.5 flex-1">
                              <span className="text-[9px] font-mono text-navy-400 uppercase tracking-wider block">Assigned Specialist</span>
                              {isEditing ? (
                                <select
                                  value={editIncEngineer}
                                  onChange={(e) => setEditIncEngineer(e.target.value)}
                                  className="bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1.5 text-xs rounded-xl w-full text-navy-900 dark:text-white"
                                >
                                  <option value="Moukangwe Bethuel">Moukangwe Bethuel</option>
                                  <option value="Sipho Khumalo">Sipho Khumalo</option>
                                  <option value="Sipho Maseko">Sipho Maseko</option>
                                  <option value="Amanda Dlamini">Amanda Dlamini</option>
                                </select>
                              ) : (
                                <div className="text-xs font-bold text-navy-850 dark:text-navy-100 flex items-center gap-2 flex-wrap">
                                  <span>{inc.assignedEngineer}</span>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {["Moukangwe Bethuel", "Sipho Khumalo", "Amanda Dlamini"].filter(e => e !== inc.assignedEngineer).slice(0, 2).map((eng) => (
                                      <button
                                        key={eng}
                                        onClick={() => {
                                          quickAssignIncident(inc.id, eng);
                                        }}
                                        className="text-[9px] font-mono text-royal-600 dark:text-royal-450 hover:underline cursor-pointer bg-royal-50 dark:bg-royal-950/20 px-1.5 py-0.5 rounded"
                                      >
                                        Reassign {eng.split(" ")[0]}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-navy-450" />
                            <div className="space-y-0.5 flex-1">
                              <span className="text-[9px] font-mono text-navy-400 uppercase tracking-wider block">Recovery Timeline / SLA Bound</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editIncRecovery}
                                  onChange={(e) => setEditIncRecovery(e.target.value)}
                                  className="bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1 text-xs rounded-xl w-full text-navy-900 dark:text-white"
                                />
                              ) : (
                                <span className="text-xs font-mono font-black text-navy-800 dark:text-white">
                                  {inc.estimatedRecovery}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Root Cause & Resolution editable sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-850 p-3.5 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">
                              Root Cause Telemetry
                            </span>
                            {isEditing ? (
                              <textarea
                                value={editIncRootCause}
                                onChange={(e) => setEditIncRootCause(e.target.value)}
                                rows={2}
                                className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1.5 text-xs rounded-xl text-navy-900 dark:text-white"
                              />
                            ) : (
                              <p className="text-xs leading-relaxed text-navy-600 dark:text-navy-300">
                                {inc.rootCause}
                              </p>
                            )}
                          </div>

                          <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-850 p-3.5 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">
                              Resolution Protocols
                            </span>
                            {isEditing ? (
                              <textarea
                                value={editIncResolution}
                                onChange={(e) => setEditIncResolution(e.target.value)}
                                rows={2}
                                className="w-full bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1.5 text-xs rounded-xl text-navy-900 dark:text-white"
                              />
                            ) : (
                              <p className="text-xs leading-relaxed text-navy-600 dark:text-navy-300">
                                {inc.resolution}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Interactive Buttons footer bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-50 dark:border-navy-800/40 pt-4">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveEditingIncident}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-black uppercase rounded-lg shadow-sm cursor-pointer"
                                >
                                  Save Updates
                                </button>
                                <button
                                  onClick={() => setEditingIncidentId(null)}
                                  className="px-3 py-1.5 bg-navy-100 dark:bg-navy-850 text-navy-600 dark:text-navy-300 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditingIncident(inc)}
                                  className="px-3 py-1.5 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 hover:bg-navy-50 text-navy-600 dark:text-navy-300 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer flex items-center gap-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Edit Details
                                </button>
                                {inc.status !== "Resolved" && (
                                  <button
                                    onClick={() => quickResolveIncident(inc.id)}
                                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 text-emerald-600 hover:text-white text-[10px] font-mono font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Mark Resolved
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleExportPostmortem(inc)}
                              className="px-4 py-1.5 bg-navy-950 hover:bg-navy-900 border border-gold-400/30 text-gold-400 hover:text-gold-300 text-[10px] font-mono font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5 text-gold-400" />
                              Download Postmortem PDF
                            </button>
                            <button
                              onClick={() => deleteIncident(inc.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                              title="Delete Incident Ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {incidents.filter((inc) => {
                  const matchesSearch = 
                    inc.id.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
                    inc.title.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
                    inc.assignedEngineer.toLowerCase().includes(incidentSearchQuery.toLowerCase());
                  const matchesSeverity = incidentSeverityFilter === "All" || inc.severity === incidentSeverityFilter;
                  const matchesStatus = incidentStatusFilter === "All" || inc.status === incidentStatusFilter;
                  return matchesSearch && matchesSeverity && matchesStatus;
                }).length === 0 && (
                  <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-12 text-center text-navy-400 italic">
                    No active incident tickets match the current selection filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DISTRIBUTED TRACING */}
      {activeSubTab === "tracing" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">OpenTelemetry Distributed Tracing</h3>
            <p className="text-sm text-navy-500 dark:text-navy-400">
              Trace request lifecycles from the student's browser down through CDN caching, custom Gunicorn middleware, Redis pools, and AWS SMTP modules.
            </p>
          </div>

          {/* Trace selection */}
          <div className="flex gap-2">
            {[
              { id: "booking", label: "Save Whiteboard Booking" },
              { id: "prediction", label: "SBA Final Exam Predictor" },
              { id: "payment", label: "EFT Callback Checkout" }
            ].map((flow) => (
              <button
                key={flow.id}
                onClick={() => setActiveTraceFlow(flow.id as any)}
                className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase rounded-lg border transition-all cursor-pointer ${
                  activeTraceFlow === flow.id 
                    ? "bg-navy-950 text-gold-400 border-gold-400/40"
                    : "text-navy-500 border-navy-200 dark:border-navy-800 hover:bg-navy-50"
                }`}
              >
                {flow.label}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3 text-xs font-mono">
              <span className="text-[10px] font-bold text-navy-500 uppercase">Tracing Trace ID: <span className="text-royal-600">8f2c90df81e1a5f6</span></span>
              <span className="font-extrabold text-navy-900 dark:text-white">Total Latency: {totalTraceDuration} ms</span>
            </div>

            {/* Tracing Spans Timeline Visualizer */}
            <div className="space-y-3 pt-2">
              {traceSpans.map((span, index) => {
                const percentage = ((span.durationMs / totalTraceDuration) * 100).toFixed(1);
                
                // Color by type
                const colors = {
                  client: "bg-emerald-500",
                  server: "bg-royal-600",
                  db: "bg-purple-600",
                  cache: "bg-amber-500",
                  broker: "bg-teal-500",
                  smtp: "bg-sky-600",
                  external: "bg-yellow-500"
                };

                const isError = span.status === "error";

                return (
                  <div key={span.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 border border-navy-50 dark:border-navy-850 p-2.5 rounded-xl hover:bg-navy-50/50">
                    <div className="md:col-span-1 flex flex-col font-mono text-xs text-left">
                      <span className="font-bold text-navy-900 dark:text-white truncate">{span.service}</span>
                      <span className="text-[9px] text-navy-400 uppercase font-black">{span.spanType} span</span>
                    </div>

                    <div className="md:col-span-1 flex flex-col font-mono text-[10px] text-left">
                      <span className="font-bold text-navy-600 dark:text-navy-300 truncate">{span.operation}</span>
                      <span className="text-[8px] text-navy-400">Span ID: {span.id}</span>
                    </div>

                    {/* Timeline slider representation */}
                    <div className="md:col-span-2 flex items-center gap-3">
                      <div className="flex-1 bg-navy-100 dark:bg-navy-800 h-4 rounded-full overflow-hidden relative border border-navy-200/40 dark:border-navy-800/40">
                        <div 
                          className={`h-full transition-all rounded-full flex justify-end items-center pr-1.5 text-[8.5px] font-mono text-white font-extrabold ${
                            isError ? "bg-red-500 animate-pulse" : colors[span.spanType]
                          }`}
                          style={{ width: `${Math.max(12, parseFloat(percentage))}%`, marginLeft: `${(index * 4)}%` }}
                        >
                          {span.durationMs}ms
                        </div>
                      </div>
                      <span className="text-[9px] text-navy-500 font-mono font-bold shrink-0 w-8">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AI OPERATIONS ASSISTANT (AIOps) */}
      {activeSubTab === "aiops" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-0.5 text-left">
            <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">AI Operations Assistant (AIOps)</h3>
            <p className="text-sm text-navy-500 dark:text-navy-400">
              Dynamic chat interface communicating with Gemini 3.5 to diagnose alerts, explain Prometheus latency indicators, and predict microservice bounds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
            {/* Quick Prompts Bento Grid */}
            <div className="lg:col-span-1 space-y-4">
              <span className="text-xs font-bold text-navy-500 uppercase tracking-wider font-mono">Suggested Telemetry Queries</span>
              <div className="flex flex-col gap-2">
                {[
                  "Explain why host CPU alert is active.",
                  "Correlate PostgreSQL deadlocks to student submissions.",
                  "Predict Redis cache resource exhaustion trends.",
                  "Is the system SLA behaving normally?"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAiPrompt(prompt)}
                    className="p-3 text-left bg-navy-50 hover:bg-navy-100 dark:bg-navy-950/20 dark:hover:bg-navy-950/40 border border-navy-150 dark:border-navy-800 rounded-2xl text-xs font-semibold text-navy-700 dark:text-navy-300 transition-all cursor-pointer leading-snug"
                  >
                    💡 "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Box Container */}
            <div className="lg:col-span-3 flex flex-col h-[400px] bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-navy-950 border-b border-navy-850 p-4 flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-extrabold text-white">AIOps Telemetry Core</span>
                </div>
                <span className="text-[10px] text-navy-400 uppercase font-bold">MODEL: GEMINI-3.5-FLASH</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {aiChatMessages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={idx} className={`flex gap-3 max-w-xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                      {/* Avatar */}
                      <div className={`p-2 rounded-xl h-fit shrink-0 font-mono text-[9px] font-black uppercase ${
                        isUser ? "bg-royal-100 text-royal-700" : "bg-gold-500/10 text-gold-500 border border-gold-500/20"
                      }`}>
                        {isUser ? "Adm" : "AI"}
                      </div>

                      {/* Content */}
                      <div className={`space-y-1 p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser 
                          ? "bg-royal-600 text-white rounded-tr-none" 
                          : "bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-navy-200 rounded-tl-none border border-navy-100/50 dark:border-navy-800/40"
                      }`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span className={`text-[8px] font-mono block text-right ${isUser ? "text-royal-200" : "text-navy-450"}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isAiLoading && (
                  <div className="flex gap-3 max-w-xl mr-auto">
                    <div className="p-2 bg-gold-500/10 text-gold-500 border border-gold-500/20 rounded-xl h-fit font-mono text-[9px] font-black uppercase">
                      AI
                    </div>
                    <div className="p-3.5 bg-navy-50/50 dark:bg-navy-950/40 border border-navy-100/50 dark:border-navy-800/40 text-navy-500 text-xs rounded-2xl rounded-tl-none font-mono flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Fetching Prometheus and SLA metrics context...
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-navy-150 dark:border-navy-800 bg-navy-50/30 flex gap-2">
                <input
                  type="text"
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  placeholder="Ask about Prometheus scrapes, alerts, deadlocks, container status..."
                  className="flex-1 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-2.5 text-xs rounded-2xl text-navy-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiInputText.trim()}
                  className="px-4 py-2 bg-royal-600 hover:bg-royal-700 disabled:opacity-50 text-white font-mono font-black text-[10px] uppercase rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ask
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: DEV-OPS CONFIGS */}
      {activeSubTab === "configs" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-mono font-black text-navy-400 uppercase tracking-widest">Production Config files (Docker Compose)</h3>
            <p className="text-sm text-navy-500 dark:text-navy-400">
              Fully optimized configuration files to run Prometheus, Grafana, Node Exporter, and postgres-exporter microservices inside production containers.
            </p>
          </div>

          {/* Config Tabs code viewers */}
          <div className="space-y-4">
            <div className="bg-navy-950 border border-navy-850 p-5 rounded-3xl shadow-2xl space-y-4 font-mono text-xs text-navy-200 relative overflow-hidden">
              <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest font-black block">docker-compose.yml</span>
              <pre className="overflow-x-auto text-[10.5px] leading-relaxed max-h-96 text-navy-300">
{`version: "3.8"

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: amh_prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--storage.tsdb.retention.time=30d"
      - "--storage.tsdb.retention.size=10GB"
    ports:
      - "9090:9090"
    restart: always

  grafana:
    image: grafana/grafana:10.0.1
    container_name: amh_grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=amh_production_safe_pass
    restart: always

  node_exporter:
    image: prom/node-exporter:v1.6.0
    container_name: amh_node_exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - "--path.procfs=/host/proc"
      - "--path.sysfs=/host/sys"
      - "--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($|/)"
    ports:
      - "9100:9100"
    restart: always

  postgres_exporter:
    image: prometheuscommunity/postgres-exporter:v0.12.1
    container_name: amh_postgres_exporter
    environment:
      DATA_SOURCE_NAME: "postgresql://postgres:pass@amh_postgresql:5432/amh?sslmode=disable"
    ports:
      - "9187:9187"
    restart: always

volumes:
  prometheus_data:
  grafana_data:`}
              </pre>
            </div>

            {/* prometheus.yml config */}
            <div className="bg-navy-950 border border-navy-850 p-5 rounded-3xl shadow-2xl space-y-4 font-mono text-xs text-navy-200 relative overflow-hidden">
              <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest font-black block">prometheus.yml</span>
              <pre className="overflow-x-auto text-[10.5px] leading-relaxed max-h-96 text-navy-300">
{`global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            # - alertmanager:9093

rule_files:
  # - "first_rules.yml"

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "django-prometheus"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["amh_django:3000"]

  - job_name: "node-exporter"
    static_configs:
      - targets: ["amh_node_exporter:9100"]

  - job_name: "postgres-exporter"
    static_configs:
      - targets: ["amh_postgres_exporter:9187"]`}
              </pre>
            </div>

            {/* Nginx config security section */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-3xl space-y-4">
              <div className="border-b border-navy-100 dark:border-navy-800 pb-3 space-y-1">
                <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-widest">Nginx Config Reverse Proxy & Security Guard</span>
                <h4 className="text-sm font-black text-navy-900 dark:text-white">Admin Command Center NGINX Proxy Authentication</h4>
              </div>
              
              <div className="space-y-3 text-xs leading-relaxed text-navy-600 dark:text-navy-300 font-medium">
                <p>
                  To secure **Prometheus**, **Grafana**, and **PgAdmin** behind our production gateway, NGINX is configured to enforce strict HTTPS mapping and htpasswd Basic Authentication.
                </p>

                <div className="bg-navy-50/50 dark:bg-navy-950/20 p-3.5 border border-navy-150 dark:border-navy-800 rounded-xl font-mono text-[10px] space-y-1 max-h-60 overflow-y-auto text-navy-700 dark:text-navy-400 leading-normal">
{`server {
    listen 443 ssl;
    server_name monitoring.amarismaths.co.za;

    ssl_certificate /etc/letsencrypt/live/amarismaths/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amarismaths/privkey.pem;

    # Require administrators basic authentication
    auth_basic "Amaris Admins Only";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location /prometheus/ {
        proxy_pass http://amh_prometheus:9090/;
        proxy_set_header Host $host;
    }

    location /grafana/ {
        proxy_pass http://amh_grafana:3000/;
        proxy_set_header Host $host;
    }
}`}
                </div>

                <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-400 items-start">
                  <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <p className="text-[10.5px]">
                    Only administrators authenticated into the portal with superuser permissions can access the out-of-band monitoring URLs mapped directly from the Admin Command Center links.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
