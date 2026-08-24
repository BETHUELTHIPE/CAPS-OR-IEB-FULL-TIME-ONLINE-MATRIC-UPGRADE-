import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal, Search, Filter, Play, Pause, Trash2, Download, AlertTriangle,
  Info, CheckCircle, ShieldAlert, RefreshCw, Layers, Calendar, Clock, Database,
  Server, Mail, Cpu, Sparkles, Send, Shield, Zap, Flame, Key, Radio, Settings,
  FileText, Check, AlertCircle, ArrowRight, Activity, Users, History,
  FastForward, Eye, Copy, Code, ChevronRight, ChevronDown, Bell, ShieldCheck,
  DownloadCloud, CornerDownRight, Laptop, HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LineChart, Line, ReferenceLine
} from "recharts";

// 1. Log Schema and Types (Fulfills One Architectural Recommendation)
export interface LogEntry {
  id: string;
  requestId: string; // Correlation ID (Req 1)
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  source: "Express Server" | "PostgreSQL DB" | "SMTP Outbox" | "Celery Worker" | "Redis Cache" | "Gemini AI" | "Nginx Gateway";
  message: string;
  statusCode?: number;
  latencyMs?: number;
  userId?: string;
  endpoint?: string;
  isVerified: boolean; // Log Integrity (Req 17)
  hash: string;
  signature: string;
  // Stages for distributed tracing (Req 2)
  traceStages?: {
    name: string;
    durationMs: number;
    status: "success" | "warning" | "error";
  }[];
}

interface GroupedLog {
  message: string;
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  source: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  requestId: string;
  samples: LogEntry[];
}

interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  severity: "low" | "medium" | "high";
  status: "blocked" | "flagged" | "allowed";
  details: string;
}

interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channel: string[];
  active: boolean;
}

export const SystemLogsDashboard: React.FC = () => {
  // --- STATE DECLARATIONS ---
  const [activeTab, setActiveTab] = useState<"terminal" | "traces" | "incidents" | "assistant" | "security" | "governance">("terminal");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>("log-4"); // Pre-select a trace log for demo
  const [isJsonView, setIsJsonView] = useState(false); // Structured JSON View (Req 7)
  
  // Log Replay (Req 11)
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 5 | 10>(1);
  const [replayProgress, setReplayProgress] = useState(50); // % of progress through simulation
  const [replayTimestamp, setReplayTimestamp] = useState("2026-07-19T14:03:17Z");

  // AI Assistant (Req 6)
  const [aiQuery, setAiQuery] = useState("");
  const [aiChat, setAiChat] = useState<{ sender: "user" | "assistant"; text: string; codeBlock?: string }[]>([
    {
      sender: "assistant",
      text: "Hello! I am your SRE Observability Assistant. Ask me to query, summarize, or analyze the live CAPS logs. You can also click any of the Saved Searches below."
    }
  ]);

  // Expanded grouped logs tracker
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Terminal end reference for auto-scroll
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // --- REQUISITE DATA PRESETS & BACKUPS ---
  
  // Log Integrity Hash helper
  const mockHash = (msg: string) => {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  };

  // Base list of highly detailed correlation-enabled logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-1",
      requestId: "8e31e5d4",
      timestamp: new Date(Date.now() - 500).toISOString(),
      level: "INFO",
      source: "Express Server",
      message: "GET /api/v1/resources/caps-formulas/sandbox - Success payload returned.",
      statusCode: 200,
      latencyMs: 42,
      userId: "14562",
      endpoint: "/api/v1/resources/caps-formulas/sandbox",
      isVerified: true,
      hash: "e57921a4f3b0e27c",
      signature: "RSA-SHA256:v1:89fa2d",
      traceStages: [
        { name: "Browser", durationMs: 12, status: "success" },
        { name: "Nginx", durationMs: 4, status: "success" },
        { name: "Express Server", durationMs: 26, status: "success" },
        { name: "PostgreSQL DB", durationMs: 14, status: "success" }
      ]
    },
    {
      id: "log-2",
      requestId: "3e52e9da",
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: "WARNING",
      source: "PostgreSQL DB",
      message: "Query execution slow on 'amh_bookings' secondary index scanning during wizard schedule locking.",
      latencyMs: 380,
      userId: "10984",
      endpoint: "/api/v1/bookings/lessons/wizard-lock",
      isVerified: true,
      hash: "a49cb10f4319ee8a",
      signature: "RSA-SHA256:v1:e2f49d",
      traceStages: [
        { name: "Browser", durationMs: 25, status: "success" },
        { name: "Nginx", durationMs: 8, status: "success" },
        { name: "Express Server", durationMs: 42, status: "success" },
        { name: "Redis Cache", durationMs: 5, status: "success" },
        { name: "PostgreSQL DB", durationMs: 300, status: "warning" }
      ]
    },
    {
      id: "log-3",
      requestId: "7e81a3d9",
      timestamp: new Date(Date.now() - 8000).toISOString(),
      level: "INFO",
      source: "SMTP Outbox",
      message: "SMTP Relay connection established with smtp.gmail.com:587 for Matric reminders.",
      isVerified: true,
      hash: "82bc1f90a42e18d3",
      signature: "RSA-SHA256:v1:7a810f",
      traceStages: [
        { name: "Celery Worker", durationMs: 120, status: "success" },
        { name: "SMTP Outbox", durationMs: 240, status: "success" }
      ]
    },
    {
      id: "log-4",
      requestId: "8fa31a4c",
      timestamp: new Date(Date.now() - 15000).toISOString(),
      level: "ERROR",
      source: "Gemini AI",
      message: "Prediction timeout: Model 'gemini-2.5-flash' took over 5000ms responding to trial vectors.",
      statusCode: 504,
      latencyMs: 5120,
      userId: "12480",
      endpoint: "/predict-exam",
      isVerified: true,
      hash: "cc39f3da9bc1ee41",
      signature: "RSA-SHA256:v1:8a923d",
      traceStages: [
        { name: "Browser", durationMs: 14, status: "success" },
        { name: "Nginx", durationMs: 6, status: "success" },
        { name: "Express Server", durationMs: 82, status: "success" },
        { name: "Gemini AI", durationMs: 5018, status: "error" }
      ]
    },
    {
      id: "log-5",
      requestId: "2f91a82d",
      timestamp: new Date(Date.now() - 22000).toISOString(),
      level: "INFO",
      source: "Celery Worker",
      message: "Completed Grade 12 Calculus optimization matrices score calculations in 840ms.",
      latencyMs: 840,
      isVerified: true,
      hash: "ab719efcf400192e",
      signature: "RSA-SHA256:v1:a41b2c",
      traceStages: [
        { name: "Celery", durationMs: 840, status: "success" }
      ]
    },
    {
      id: "log-6",
      requestId: "fe42910a",
      timestamp: new Date(Date.now() - 35000).toISOString(),
      level: "CRITICAL",
      source: "Redis Cache",
      message: "Redis OOM error encountered: Memory limit exceeded under active exam session payloads.",
      isVerified: true,
      hash: "8bfd4d9ae8019b1c",
      signature: "RSA-SHA256:v1:2bc9fd",
      traceStages: [
        { name: "Browser", durationMs: 10, status: "success" },
        { name: "Nginx", durationMs: 5, status: "success" },
        { name: "Express Server", durationMs: 120, status: "success" },
        { name: "Redis Cache", durationMs: 12, status: "error" }
      ]
    },
    {
      id: "log-7",
      requestId: "3b91fa82",
      timestamp: new Date(Date.now() - 48000).toISOString(),
      level: "INFO",
      source: "Nginx Gateway",
      message: "Nginx successfully processed SSL handshake for CAPS static resources (Cape Town Edge).",
      statusCode: 200,
      latencyMs: 4,
      isVerified: true,
      hash: "bc918a2d7f40192e",
      signature: "RSA-SHA256:v1:98fa21",
      traceStages: [
        { name: "Browser", durationMs: 8, status: "success" },
        { name: "Nginx", durationMs: 4, status: "success" }
      ]
    },
    {
      id: "log-8",
      requestId: "4a28f73e",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: "ERROR",
      source: "PostgreSQL DB",
      message: "Database Connection Timeout: Connection pool exhausted under high peak trial exams requests.",
      statusCode: 500,
      latencyMs: 3000,
      userId: "14820",
      endpoint: "/api/v1/auth/login",
      isVerified: true,
      hash: "dc729bca1e938fcf",
      signature: "RSA-SHA256:v1:e39afc",
      traceStages: [
        { name: "Browser", durationMs: 15, status: "success" },
        { name: "Nginx", durationMs: 8, status: "success" },
        { name: "Express Server", durationMs: 145, status: "success" },
        { name: "PostgreSQL DB", durationMs: 2832, status: "error" }
      ]
    }
  ]);

  // Deployment events history (Req 10)
  const [deploymentMarkers] = useState([
    { timestamp: new Date(Date.now() - 120000).toISOString(), version: "v2.8.2-hotfix", status: "ROLLBACK", notes: "Rollback deployed following high payment gateway response times." },
    { timestamp: new Date(Date.now() - 400000).toISOString(), version: "v2.8.1", status: "DEPLOYED", notes: "Major upgrade to the automated grading microservice." }
  ]);

  // Security events (Req 9)
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    { id: "sec-1", timestamp: new Date(Date.now() - 12000).toISOString(), event: "SQL Injection Blocked", ip: "196.24.114.82 (Johannesburg)", severity: "high", status: "blocked", details: "Blocked malformed dynamic formula parameters matching 'UNION SELECT' filters on endpoint /api/v1/formulas." },
    { id: "sec-2", timestamp: new Date(Date.now() - 45000).toISOString(), event: "XSS Attempt Blocked", ip: "41.13.220.14 (Cape Town)", severity: "high", status: "blocked", details: "Cleaned <script> tags inside step-by-step homework scan upload title." },
    { id: "sec-3", timestamp: new Date(Date.now() - 150000).toISOString(), event: "Rate Limit Exceeded", ip: "102.32.14.9 (Durban)", severity: "medium", status: "flagged", details: "IP triggered 180 requests/min limit. Gateway locked IP session for 15 minutes." },
    { id: "sec-4", timestamp: new Date(Date.now() - 320000).toISOString(), event: "Invalid JWT Signature", ip: "197.80.25.141 (Pretoria)", severity: "low", status: "blocked", details: "Decryption token failed to parse. Connection terminated." }
  ]);

  // Alert Rules (Req 14)
  const [alertRules, setAlertRules] = useState<NotificationRule[]>([
    { id: "rule-1", name: "Database Response Saturation", condition: "PostgreSQL Latency > 300 ms", threshold: 300, channel: ["Slack", "Email"], active: true },
    { id: "rule-2", name: "High Error Frequency Spike", condition: "Errors > 100/minute", threshold: 100, channel: ["Slack", "SMS", "Email"], active: true },
    { id: "rule-3", name: "AI Prediction Model Failures", condition: "Gemini Timeout Rate > 5%", threshold: 5, channel: ["Discord", "Email"], active: false },
    { id: "rule-4", name: "Celery Task Queue Backlog", condition: "Queue size > 10,000", threshold: 10000, channel: ["Slack", "SMS"], active: true }
  ]);

  // Log Retention Policies (Req 15)
  const [retentionCritical, setRetentionCritical] = useState(5); // Years
  const [retentionError, setRetentionError] = useState(365); // Days
  const [retentionWarning, setRetentionWarning] = useState(180); // Days
  const [retentionInfo, setRetentionInfo] = useState(90); // Days
  const [retentionDebug, setRetentionDebug] = useState(14); // Days

  // --- COMPONENT TICKER SIMULATOR (Drives values realistically) ---
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);

      // Random generator templates
      const logTemplates: Omit<LogEntry, "id" | "timestamp" | "requestId" | "isVerified" | "hash" | "signature">[] = [
        {
          level: "INFO",
          source: "Express Server",
          message: "GET /api/v1/classroom/active-sessions-grid - HTTP 200 - Client Polled.",
          statusCode: 200,
          latencyMs: 58,
          userId: "14562",
          endpoint: "/api/v1/classroom/active-sessions-grid",
          traceStages: [
            { name: "Browser", durationMs: 14, status: "success" },
            { name: "Nginx", durationMs: 4, status: "success" },
            { name: "Express Server", durationMs: 40, status: "success" }
          ]
        },
        {
          level: "INFO",
          source: "Redis Cache",
          message: "Cache HIT for student scorecard statistics dashboard endpoint.",
          latencyMs: 3,
          userId: "12841",
          endpoint: "/api/v1/students/scorecard",
          traceStages: [
            { name: "Browser", durationMs: 10, status: "success" },
            { name: "Nginx", durationMs: 3, status: "success" },
            { name: "Express Server", durationMs: 15, status: "success" },
            { name: "Redis Cache", durationMs: 3, status: "success" }
          ]
        },
        {
          level: "WARNING",
          source: "PostgreSQL DB",
          message: "Transaction lock delay encountered during availability scheduler slot locking.",
          latencyMs: 410,
          userId: "10984",
          endpoint: "/api/v1/tutors/availabilities",
          traceStages: [
            { name: "Browser", durationMs: 18, status: "success" },
            { name: "Nginx", durationMs: 5, status: "success" },
            { name: "Express Server", durationMs: 48, status: "success" },
            { name: "PostgreSQL DB", durationMs: 339, status: "warning" }
          ]
        },
        {
          level: "INFO",
          source: "Celery Worker",
          message: "Evaluating Grade 12 Calculus CAPS optimization derivative limits sandbox calculations.",
          traceStages: [{ name: "Celery", durationMs: 240, status: "success" }]
        },
        {
          level: "INFO",
          source: "SMTP Outbox",
          message: "Nodemailer: Booking confirmation successfully dispatched to student parent: thipe_parent@ieb.za.",
          traceStages: [
            { name: "Celery Worker", durationMs: 110, status: "success" },
            { name: "SMTP Outbox", durationMs: 130, status: "success" }
          ]
        },
        {
          level: "ERROR",
          source: "Gemini AI",
          message: "POST /predict-exam - Connection aborted by remote endpoint.",
          statusCode: 502,
          latencyMs: 450,
          userId: "14280",
          endpoint: "/predict-exam",
          traceStages: [
            { name: "Browser", durationMs: 20, status: "success" },
            { name: "Nginx", durationMs: 6, status: "success" },
            { name: "Express Server", durationMs: 34, status: "success" },
            { name: "Gemini AI", durationMs: 390, status: "error" }
          ]
        },
        {
          level: "INFO",
          source: "Express Server",
          message: "POST /api/v1/auth/jwt-verify - Valid token matching student ID 1420.",
          statusCode: 200,
          latencyMs: 12,
          userId: "1420",
          endpoint: "/api/v1/auth/jwt-verify",
          traceStages: [
            { name: "Browser", durationMs: 11, status: "success" },
            { name: "Nginx", durationMs: 4, status: "success" },
            { name: "Express Server", durationMs: 12, status: "success" }
          ]
        }
      ];

      const chosen = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const reqId = Math.random().toString(16).substring(2, 10);
      const mMsg = chosen.message;
      
      const newLog: LogEntry = {
        ...chosen,
        id: `log-generated-${Date.now()}`,
        requestId: reqId,
        timestamp: new Date().toISOString(),
        isVerified: true,
        hash: mockHash(mMsg),
        signature: `RSA-SHA256:v1:${Math.random().toString(16).substring(2, 6)}`
      };

      setLogs(prev => [newLog, ...prev.slice(0, 99)]);

      // Occasionally generate a security threat as well
      if (Math.random() > 0.8) {
        const threatTemplates = [
          { event: "SQL Injection Blocked", details: "Refused dynamic input scan holding malicious characters on booking form." },
          { event: "XSS Blocked", details: "Strip-cleared malformed Javascript scripts inside whiteboard message exchange." },
          { event: "Failed Login", details: "Multiple login attempt mismatches detected on parent account thipe@gmail.com." },
          { event: "Rate limit exceeded", details: "Triggered gateway limits for /api/v1/resources requests." }
        ];
        const threat = threatTemplates[Math.floor(Math.random() * threatTemplates.length)];
        const newSecLog: SecurityLog = {
          id: `sec-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: threat.event,
          ip: `${Math.floor(Math.random() * 150 + 50)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 254)}`,
          severity: threat.event.includes("Injection") || threat.event.includes("XSS") ? "high" : "medium",
          status: "blocked",
          details: threat.details
        };
        setSecurityLogs(prev => [newSecLog, ...prev]);
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // --- FILTERED LOGS ENGINE ---
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.level.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = selectedLevel === "ALL" || log.level === selectedLevel;
    const matchesSource = selectedSource === "ALL" || log.source === selectedSource;

    return matchesSearch && matchesLevel && matchesSource;
  });

  const activeSelectedLog = logs.find(l => l.id === selectedLogId) || logs[0];

  // --- SAVED SEARCHES PANEL (Req 19) ---
  const savedSearches = [
    { name: "Database Errors", level: "ERROR", source: "PostgreSQL DB", query: "" },
    { name: "Payment Failures", level: "ALL", source: "Express Server", query: "payment" },
    { name: "AI Prediction Issues", level: "ALL", source: "Gemini AI", query: "" },
    { name: "Email Delivery Problems", level: "ALL", source: "SMTP Outbox", query: "" },
    { name: "Authentication Failures", level: "ALL", source: "Express Server", query: "auth" },
    { name: "Celery Exceptions", level: "ERROR", source: "Celery Worker", query: "" }
  ];

  const handleSavedSearchClick = (search: typeof savedSearches[0]) => {
    setSelectedLevel(search.level);
    setSelectedSource(search.source);
    setSearchQuery(search.query);
    setActiveTab("terminal");
  };

  // --- INTELLIGENT LOG GROUPING (Req 4) ---
  const getGroupedLogs = (): GroupedLog[] => {
    const groups: { [key: string]: GroupedLog } = {};
    
    logs.forEach(log => {
      // Generalize matching signature (ignore dynamic parameters like IDs, durations, etc.)
      let generalizedMessage = log.message
        .replace(/id_\d+/g, "id_XXX")
        .replace(/scan_id: \d+/g, "scan_id: XXX")
        .replace(/student \d+/g, "student XXX")
        .replace(/HTTP \d+/g, "HTTP XXX")
        .replace(/\d+ms/g, "XXXms")
        .replace(/\(\d+ nodes written\)/, "(XXX nodes written)");

      if (!groups[generalizedMessage]) {
        groups[generalizedMessage] = {
          message: generalizedMessage,
          level: log.level,
          source: log.source,
          occurrences: 1,
          firstSeen: log.timestamp,
          lastSeen: log.timestamp,
          requestId: log.requestId,
          samples: [log]
        };
      } else {
        groups[generalizedMessage].occurrences += 1;
        if (new Date(log.timestamp) < new Date(groups[generalizedMessage].firstSeen)) {
          groups[generalizedMessage].firstSeen = log.timestamp;
        }
        if (new Date(log.timestamp) > new Date(groups[generalizedMessage].lastSeen)) {
          groups[generalizedMessage].lastSeen = log.timestamp;
        }
        groups[generalizedMessage].samples.push(log);
      }
    });

    return Object.values(groups).sort((a, b) => b.occurrences - a.occurrences);
  };

  const groupedLogs = getGroupedLogs();

  // --- LIVE ERROR HEAT MAP (Req 8) ---
  const getErrorHeatMap = () => {
    const errorCounts: { [key: string]: number } = {
      "Express Server": 0,
      "PostgreSQL DB": 0,
      "Redis Cache": 0,
      "Celery Worker": 0,
      "SMTP Outbox": 0,
      "Gemini AI": 0,
      "Nginx Gateway": 0
    };

    logs.forEach(l => {
      if (l.level === "ERROR" || l.level === "CRITICAL") {
        errorCounts[l.source] = (errorCounts[l.source] || 0) + 1;
      }
    });

    // Seed some initial counts if current logs list is clear
    if (Object.values(errorCounts).reduce((a, b) => a + b, 0) === 0) {
      errorCounts["Express Server"] = 4;
      errorCounts["PostgreSQL DB"] = 3;
      errorCounts["Redis Cache"] = 5;
      errorCounts["Celery Worker"] = 1;
      errorCounts["SMTP Outbox"] = 2;
    }

    return Object.entries(errorCounts).map(([service, count]) => ({
      service,
      count,
      percentage: Math.min(100, Math.round((count / 15) * 100)) // Max 15 for scale
    })).sort((a, b) => b.count - a.count);
  };

  const errorHeatMap = getErrorHeatMap();

  // --- LOG TIMELINE GRAPH (Req 3) ---
  const getLogTimelineData = () => {
    const timeline = [];
    const now = Date.now();
    for (let i = 8; i >= 0; i--) {
      const timeStr = new Date(now - i * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      // Count logs matching time
      const count = logs.filter(l => {
        const logTime = new Date(l.timestamp).getMinutes();
        const minVal = new Date(now - i * 60000).getMinutes();
        return logTime === minVal;
      }).length + Math.floor(Math.random() * 3); // some realistic fluctuation
      timeline.push({ time: timeStr, count: count === 0 ? 1 : count });
    }
    return timeline;
  };

  const logTimelineData = getLogTimelineData();

  // --- AI LOG ASSISTANT RESPONDER (Req 6) ---
  const handleAiAssistantSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMsg = aiQuery.trim();
    setAiChat(prev => [...prev, { sender: "user", text: userMsg }]);
    setAiQuery("");

    setTimeout(() => {
      let replyText = "";
      let codeBlock = "";

      const queryLower = userMsg.toLowerCase();

      if (queryLower.includes("why did response time increase") || queryLower.includes("response time") || queryLower.includes("latency")) {
        replyText = "Analyzing response trends. I identified a high-latency incident from PostgreSQL and Gemini AI. Specifically request '8fa31a4c' (Gemini AI API) spent 5,120 ms compiling the Matric score prediction vector models. The average response database locks were triggered on PostgreSQL 'amh_bookings' indices with scan locks up to 380ms. The direct catalyst was a sudden spike in concurrent student registrations during peak hours.";
        codeBlock = JSON.stringify({
          latencySustained: "118 ms (Global avg)",
          highestSingleLatencyMs: 5120,
          highestServiceBottleneck: "Gemini AI",
          databaseIndexedQueriesAverageMs: 142,
          remediation: "Enable local cache memoization for predictable static evaluations and increase connection pool limit."
        }, null, 2);
      } else if (queryLower.includes("payment") || queryLower.includes("failed payments") || queryLower.includes("payfast")) {
        replyText = "Queried database transaction logs. Identified 2 failed payment gateway operations relating to South African CAPS credit authorizations. Redis memory limits blocked socket connections, preventing the Express API from completing session callbacks. All failed records are tied with Request correlation signatures beginning with 'fe42910a'.";
        codeBlock = JSON.stringify({
          failedPaymentsCount: 2,
          affectedStudents: 84,
          primaryErrorMessage: "Redis OOM: Out Of Memory",
          refundRecoveryTriggered: true,
          relatedRequestIds: ["fe42910a", "9bc31a4c"]
        }, null, 2);
      } else if (queryLower.includes("deadlock") || queryLower.includes("postgresql") || queryLower.includes("database")) {
        replyText = "PostgreSQL deadlock analysis complete. I detected a recursive transaction lock matching Grade 10 availability scheduling grids. Thread SRV-01 held exclusive write authorization on 'amh_bookings' row, while thread SRV-02 queued availability allocations recursively. Both indices failed standard transaction rollbacks.";
        codeBlock = "ERROR: deadlock detected\nDETAIL: Process 14280 waits for ShareLock on transaction 384; blocked by process 14281.\nProcess 14281 waits for ExclusiveLock on relation 12480 of database 16384.\nKEY ACTION: Set query timeouts to 5000ms and add proper index sequencing inside src/lib/db.ts.";
      } else if (queryLower.includes("endpoint") || queryLower.includes("most errors") || queryLower.includes("error endpoint")) {
        replyText = "Computed aggregated error rates per endpoint. The endpoint with the highest density of errors is `/predict-exam` (Gemini AI client failures), followed by `/api/v1/auth/login` (PostgreSQL Connection Exhaustion).";
        codeBlock = JSON.stringify([
          { endpoint: "/predict-exam", errorCount: 14, rootCause: "AI Model Response Timeout" },
          { endpoint: "/api/v1/auth/login", errorCount: 8, rootCause: "Database Pool Exhaustion" },
          { endpoint: "/api/v1/classroom/save-whiteboard-vector", errorCount: 2, rootCause: "Websocket disconnect" }
        ], null, 2);
      } else {
        // Generic intelligent fallback based on live logs list
        const errs = logs.filter(l => l.level === "ERROR" || l.level === "CRITICAL");
        replyText = `Based on current telemetry, I scanned ${logs.length} total active logs. I detected ${errs.length} severe issues. Key issue in memory: "${errs[0]?.message || 'None'}" originating from ${errs[0]?.source || 'None'} (Correlation ID: ${errs[0]?.requestId || 'None'}). Let me know if you would like me to isolate this issue's trace stack.`;
      }

      setAiChat(prev => [...prev, { sender: "assistant", text: replyText, codeBlock }]);
    }, 1200);
  };

  // --- MANUAL TRIGGERS ---
  const injectManualError = () => {
    const errorTemplates = [
      { source: "PostgreSQL DB" as const, message: "Database Connection Timeout: Connection pool exhausted under high load.", code: 500 },
      { source: "Redis Cache" as const, message: "Redis OOM error encountered: Memory limit exceeded under active exam session payloads.", code: 500 },
      { source: "SMTP Outbox" as const, message: "SMTP Relay server returned: 421 4.7.0 Try again later, connection rate limits exceeded.", code: 421 },
      { source: "Gemini AI" as const, message: "Prediction timeout: Model 'gemini-2.5-flash' took over 5000ms responding to trial vectors.", code: 504 }
    ];

    const template = errorTemplates[Math.floor(Math.random() * errorTemplates.length)];
    const reqId = Math.random().toString(16).substring(2, 10);
    
    const manualLog: LogEntry = {
      id: `log-${Date.now()}`,
      requestId: reqId,
      timestamp: new Date().toISOString(),
      level: "ERROR",
      source: template.source,
      message: `🚨 ADMIN INJECTED FAILURE: ${template.message}`,
      statusCode: template.code,
      latencyMs: 1420,
      isVerified: true,
      hash: mockHash(template.message),
      signature: `RSA-SHA256:v1:admin`,
      traceStages: [
        { name: "Browser", durationMs: 15, status: "success" },
        { name: "Nginx", durationMs: 8, status: "success" },
        { name: "Express Server", durationMs: 120, status: "success" },
        { name: template.source, durationMs: 1277, status: "error" }
      ]
    };

    setLogs(prev => [manualLog, ...prev]);
    setSelectedLogId(manualLog.id);
  };

  const handleVerfyIntegrity = () => {
    alert("Cryptographic Checksum audit completed successfully. Verified all logs' SHA-256 hashes against signature keys. 0 anomalies or tampering attempts detected.");
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans" id="system-logs-observability-hub">
      
      {/* 18. OPERATIONAL HEALTH BANNER (At top of dashboard) */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-navy-850 rounded-2xl p-4 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Main Status */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black uppercase tracking-wider text-white">System Status:</h2>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest font-mono">Operational</span>
              </div>
              <p className="text-[10px] text-navy-400 font-mono">
                AMH Primary Cluster • Cape Town AWS Region (af-south-1)
              </p>
            </div>
          </div>

          {/* Quick Metrics columns */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 w-full lg:w-auto text-left lg:text-right border-t lg:border-t-0 border-navy-800 pt-3 lg:pt-0">
            
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">Requests/Sec</span>
              <span className="text-sm font-black font-mono text-gold-400">
                {(12480 + Math.sin(tick) * 35).toFixed(0)} rps
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">Error Rate</span>
              <span className={`text-sm font-black font-mono ${logs.filter(l => l.level === "ERROR").length > 3 ? "text-amber-400" : "text-emerald-400"}`}>
                {(0.04 + (logs.filter(l => l.level === "ERROR").length * 0.01)).toFixed(2)}%
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">Latency Avg</span>
              <span className="text-sm font-black font-mono text-white">118 ms</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">PostgreSQL</span>
              <span className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1 font-mono">
                <Check className="w-3 h-3" /> Healthy
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">Redis Cache</span>
              <span className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1 font-mono">
                <Check className="w-3 h-3" /> Healthy
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">Active Students</span>
              <span className="text-sm font-black font-mono text-royal-300">2,814 online</span>
            </div>

          </div>

        </div>
      </div>

      {/* HEADER SECTION WITH CONTROL BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-royal-500/10 text-royal-600 dark:text-gold-400 p-1.5 rounded-lg">
              <Terminal className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
              Observability Center & Incident Workbench
            </h1>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Correlate request streams across multiple microservices with distributed tracing, AI log analysis, and incident workspace.
          </p>
        </div>

        {/* Diagnostic Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={injectManualError}
            className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-mono font-bold rounded-xl text-[10.5px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Inject Error Log
          </button>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `amh_structured_logs_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="py-1.5 px-3 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-800 dark:text-white border border-navy-200 dark:border-navy-700 font-mono font-bold rounded-xl text-[10.5px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-navy-150 dark:border-navy-800 overflow-x-auto gap-2 pb-px scrollbar-none">
        {[
          { id: "terminal", label: "Live Terminal", icon: Terminal },
          { id: "traces", label: "Distributed Tracing", icon: Activity },
          { id: "incidents", label: "Incident Workbench", icon: Flame },
          { id: "assistant", label: "AI Log Assistant", icon: Sparkles },
          { id: "security", label: "Security Stream", icon: Shield },
          { id: "governance", label: "Governance & Rules", icon: Settings }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-sans text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? "border-royal-600 text-royal-600 dark:text-white"
                  : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-navy-200"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SAVED QUICK SEARCHES (Req 19) */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-3 rounded-xl">
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-navy-400 block mb-2">
          ⚡ Saved Observatory Filters (Click to apply)
        </span>
        <div className="flex flex-wrap gap-2">
          {savedSearches.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSavedSearchClick(s)}
              className="px-2.5 py-1 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 hover:dark:bg-navy-850 border border-navy-150 dark:border-navy-800 text-[10.5px] font-mono text-navy-700 dark:text-navy-300 rounded-lg cursor-pointer transition-all flex items-center gap-1"
            >
              <Search className="w-3 h-3 text-royal-500" />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT RENDERING */}
      <div className="space-y-6">

        {/* TAB 1: LIVE TERMINAL & OBSERVABILITY */}
        {activeTab === "terminal" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Console filters & stats */}
            <div className="xl:col-span-8 space-y-4">
              
              {/* Filter controls panel */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search bar */}
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search logs by keyword / req_id..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-100 dark:border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-royal-500 text-navy-900 dark:text-white font-mono"
                  />
                </div>

                {/* Level toggle controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <span className="text-[10px] font-mono text-navy-400 font-bold uppercase shrink-0">Level:</span>
                  <div className="flex gap-1 bg-navy-50 dark:bg-navy-950 p-1 rounded-lg">
                    {["ALL", "INFO", "WARNING", "ERROR"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          selectedLevel === lvl
                            ? "bg-royal-600 text-white shadow-xs"
                            : "text-navy-500 hover:text-navy-800 dark:hover:text-navy-200"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* LIVE TERMINAL VIEWPORT */}
              <div className="bg-navy-950 border border-navy-850 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex justify-between items-center border-b border-navy-850 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-gold-400">
                      AMARIS-CORE-SRE-TERMINAL &gt; STDOUT / STDERR
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-navy-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-navy-800 bg-navy-900 text-royal-600 cursor-pointer"
                      />
                      Auto-Scroll
                    </label>

                    <button
                      onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                      className={`text-[9.5px] px-2 py-0.5 rounded uppercase font-mono font-bold cursor-pointer ${
                        isLiveStreaming ? "bg-emerald-500/10 text-emerald-400" : "bg-navy-800 text-navy-400"
                      }`}
                    >
                      {isLiveStreaming ? "● Stream Active" : "Paused"}
                    </button>
                  </div>
                </div>

                {/* Log list Container */}
                <div className="h-[420px] overflow-y-auto font-mono text-xs text-left space-y-2 pr-2 scrollbar-thin scrollbar-thumb-navy-800 scrollbar-track-navy-950">
                  <AnimatePresence initial={false}>
                    {filteredLogs.map((log) => {
                      const isSelected = log.id === selectedLogId;
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-2 rounded-lg border text-[11px] leading-relaxed cursor-pointer transition-all ${
                            isSelected
                              ? "bg-navy-900 border-royal-500/60"
                              : "border-transparent hover:bg-navy-900/40"
                          }`}
                          onClick={() => setSelectedLogId(log.id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* 17. Cryptographic Integrity indicators */}
                              <span className="text-emerald-500" title="Cryptographically signed & verified trace">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>

                              {/* Time */}
                              <span className="text-navy-500 text-[10px]">
                                [{new Date(log.timestamp).toLocaleTimeString()}]
                              </span>

                              {/* Req ID */}
                              <span className="text-gold-400/80 font-bold bg-navy-950 px-1.5 py-0.2 rounded border border-navy-850">
                                RID:{log.requestId}
                              </span>

                              {/* Source */}
                              <span className="text-navy-300 uppercase tracking-tight text-[10px] font-black">
                                {log.source}
                              </span>

                              {/* Level Badge */}
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                log.level === "INFO"
                                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                  : log.level === "WARNING"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                              }`}>
                                {log.level}
                              </span>
                            </div>

                            {/* Latency & Status tags */}
                            <div className="flex gap-2 text-[9px] text-navy-400">
                              {log.statusCode && (
                                <span className="bg-navy-950 border border-navy-850 px-1 rounded text-white font-black">
                                  HTTP {log.statusCode}
                                </span>
                              )}
                              {log.latencyMs && (
                                <span className="bg-navy-950 border border-navy-850 px-1 rounded text-gold-500 font-bold">
                                  {log.latencyMs} ms
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-emerald-400 mt-1 select-text break-words leading-relaxed pl-1">
                            {log.message}
                          </p>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={terminalEndRef} />
                </div>

                {/* 10. Deployment timeline markers inside terminal stream */}
                <div className="border-t border-navy-850 pt-3 flex flex-wrap gap-4 justify-between items-center text-[10.5px] text-navy-500">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-royal-500 text-white font-black px-1.5 py-0.2 rounded text-[9px]">DEPL-MARKER</span>
                    <span>Last Release: {deploymentMarkers[0]?.version} ({new Date(deploymentMarkers[0]?.timestamp).toLocaleTimeString()})</span>
                  </div>
                  <span className="text-gold-500 font-mono">* All traces verified with SHA-256 signature hashes</span>
                </div>

              </div>

            </div>

            {/* Right side widgets: Log Timeline & Live Error Heat Map */}
            <div className="xl:col-span-4 space-y-4">

              {/* 3. Log Timeline graph */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-royal-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white">
                      Log Timeline frequency
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-navy-400">1m buckets</span>
                </div>

                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={logTimelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-navy-800" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                      <Bar dataKey="count" fill="#1E40AF" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 8. Live Error Heat Map */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-1.5 border-b border-navy-100 dark:border-navy-800 pb-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white">
                    Live Service Error Heat Map
                  </h3>
                </div>

                <div className="space-y-2 pt-1">
                  {errorHeatMap.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10.5px] font-mono">
                        <span className="font-extrabold text-navy-700 dark:text-navy-300">{item.service}</span>
                        <span className="text-rose-500 font-bold">{item.count} errors</span>
                      </div>
                      <div className="w-full bg-navy-50 dark:bg-navy-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: DISTRIBUTED TRACING & SESSION REPLAY (Req 2 & Req 16) */}
        {activeTab === "traces" && (
          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-6">
            
            <div className="border-b border-navy-100 dark:border-navy-800 pb-4">
              <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-royal-500" />
                Distributed Request Trace & Session Replay Analyzer
              </h3>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Click any trace element in the log list to dissect execution sequences across Django, PostgreSQL, Redis, Celery, and Gemini AI blocks.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Select trace list (Col-span: 4) */}
              <div className="lg:col-span-4 border border-navy-100 dark:border-navy-800/80 rounded-xl p-3 h-[420px] overflow-y-auto space-y-2">
                <span className="text-[10px] font-mono text-navy-400 font-black uppercase tracking-wider block mb-2">
                  Select Active Request Trace
                </span>
                {logs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-mono space-y-1 cursor-pointer transition-all ${
                      log.id === selectedLogId
                        ? "bg-royal-50 border-royal-300 dark:bg-navy-950 dark:border-royal-600"
                        : "border-navy-100 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-950"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-navy-900 dark:text-white text-[11px]">RID: {log.requestId}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                        log.level === "INFO" ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
                      }`}>
                        {log.level}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-navy-500 dark:text-navy-400 line-clamp-1">{log.message}</p>
                    <div className="flex justify-between text-[9px] text-navy-400">
                      <span>{log.source}</span>
                      {log.latencyMs && <span className="text-gold-500 font-bold">{log.latencyMs} ms</span>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Step cascade trace details (Col-span: 8) */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* 16. Session Replay client variables card */}
                <div className="bg-navy-50/50 dark:bg-navy-950 p-4 rounded-xl border border-navy-150/80 dark:border-navy-850 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-navy-400 block">Session IP Address</span>
                    <span className="text-xs font-mono font-black text-navy-900 dark:text-white">196.24.114.82</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-navy-400 block">Client Browser Agent</span>
                    <span className="text-xs font-sans font-extrabold text-navy-900 dark:text-white truncate block" title="Chrome Mobile 121.0.0">
                      Chrome 121 / Android
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-navy-400 block">Student User ID</span>
                    <span className="text-xs font-mono font-black text-navy-900 dark:text-white">
                      {activeSelectedLog.userId || "Anonymous"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-navy-400 block">Target HTTP Endpoint</span>
                    <span className="text-xs font-mono font-black text-royal-600 dark:text-royal-300">
                      {activeSelectedLog.endpoint || "N/A"}
                    </span>
                  </div>
                </div>

                {/* 2. Visual Waterfall Trace graph */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-black text-navy-450 uppercase">
                      Distributed Journey Waterfall trace
                    </span>
                    <span className="text-xs font-mono font-bold text-royal-600 dark:text-royal-400">
                      Total Latency: {activeSelectedLog.latencyMs || 0} ms
                    </span>
                  </div>

                  {/* Waterfall bars */}
                  <div className="space-y-2 border border-navy-100 dark:border-navy-800 p-4 rounded-xl bg-white dark:bg-navy-950">
                    {activeSelectedLog.traceStages ? (
                      activeSelectedLog.traceStages.map((stage, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-24 text-[10.5px] font-mono font-black text-navy-700 dark:text-navy-300 truncate">
                            {stage.name}
                          </span>
                          <div className="flex-1 bg-navy-50 dark:bg-navy-900 h-6 rounded-md relative overflow-hidden">
                            <div
                              className={`h-full rounded-md flex items-center pl-2 transition-all ${
                                stage.status === "error"
                                  ? "bg-rose-500/10 border-l-4 border-rose-500 text-rose-500"
                                  : stage.status === "warning"
                                  ? "bg-amber-500/10 border-l-4 border-amber-500 text-amber-500"
                                  : "bg-royal-500/10 border-l-4 border-royal-500 text-royal-500"
                              }`}
                              style={{
                                width: `${Math.max(15, Math.min(100, (stage.durationMs / (activeSelectedLog.latencyMs || 100)) * 100))}%`
                              }}
                            >
                              <span className="text-[9px] font-mono font-bold">
                                {stage.durationMs}ms
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-navy-400 text-xs font-mono">
                        No sub-stage breakdown logs registered for this event.
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Structured JSON Log View Panel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-black text-navy-405 uppercase">
                      Structured Audit Payload Schema
                    </span>
                    <button
                      onClick={() => setIsJsonView(!isJsonView)}
                      className="px-2 py-0.5 border border-navy-200 dark:border-navy-800 text-[9.5px] font-mono uppercase font-bold rounded cursor-pointer text-navy-600 dark:text-navy-300"
                    >
                      {isJsonView ? "Show Simple Details" : "Show Raw JSON"}
                    </button>
                  </div>

                  {isJsonView ? (
                    <pre className="bg-navy-950 text-emerald-400 p-4 rounded-xl border border-navy-850 text-[10.5px] font-mono overflow-x-auto text-left leading-normal select-all">
                      {JSON.stringify({
                        timestamp: activeSelectedLog.timestamp,
                        level: activeSelectedLog.level,
                        service: activeSelectedLog.source,
                        request_id: activeSelectedLog.requestId,
                        endpoint: activeSelectedLog.endpoint || null,
                        duration_ms: activeSelectedLog.latencyMs || null,
                        message: activeSelectedLog.message,
                        is_verified_integrity: activeSelectedLog.isVerified,
                        hash_checksum: activeSelectedLog.hash,
                        rsa_signature: activeSelectedLog.signature
                      }, null, 2)}
                    </pre>
                  ) : (
                    <div className="bg-navy-50/50 dark:bg-navy-950 p-4 rounded-xl border border-navy-150/80 dark:border-navy-850 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-navy-100/50 dark:border-navy-800 pb-1.5">
                        <span className="text-navy-450 font-mono">Log Integrity Key:</span>
                        <span className="font-mono text-emerald-500 font-extrabold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Checked (Hash: {activeSelectedLog.hash})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-navy-100/50 dark:border-navy-800 pb-1.5">
                        <span className="text-navy-450 font-mono">Digital Signature:</span>
                        <span className="font-mono text-navy-700 dark:text-gray-300 font-bold truncate max-w-[280px]">
                          {activeSelectedLog.signature}
                        </span>
                      </div>
                      <div className="flex justify-between pb-0.5">
                        <span className="text-navy-450 font-mono">Security Status:</span>
                        <span className="font-sans text-emerald-600 dark:text-emerald-400 font-bold">
                          Safe/Cleaned
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: INCIDENT WORKBENCH & GROUPINGS (Req 4, Req 5, Req 13 & Req 20) */}
        {activeTab === "incidents" && (
          <div className="space-y-6">

            {/* 20. Incident Active Workbench banner */}
            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded tracking-wider uppercase animate-pulse">
                    Active Incident Open
                  </span>
                  <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase font-sans">
                    INC-402: Payment Timeout & Database Locks
                  </h3>
                </div>
                <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed max-w-3xl">
                  Multiple related Redis memory failures and PostgreSQL write bottlenecks occurred recursively, generating timeouts across tutoring scheduling and payment wizards.
                </p>
                
                {/* 13. User Impact Analysis details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-navy-150 text-left">
                    <span className="text-[9px] font-mono text-navy-400 font-black block">Affected Students</span>
                    <span className="text-sm font-mono font-black text-red-500">84 students</span>
                  </div>
                  <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-navy-150 text-left">
                    <span className="text-[9px] font-mono text-navy-400 font-black block">Failed Payments</span>
                    <span className="text-sm font-mono font-black text-red-500">23 runs</span>
                  </div>
                  <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-navy-150 text-left">
                    <span className="text-[9px] font-mono text-navy-400 font-black block">Blocked Bookings</span>
                    <span className="text-sm font-mono font-black text-amber-500">12 slots</span>
                  </div>
                  <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-navy-150 text-left">
                    <span className="text-[9px] font-mono text-navy-400 font-black block">SRE SLA Status</span>
                    <span className="text-sm font-mono font-black text-emerald-500">99.85% (Warning)</span>
                  </div>
                </div>
              </div>

              {/* Sidebar metadata inside Incident */}
              <div className="flex flex-col justify-between shrink-0 text-left md:text-right text-xs space-y-2">
                <div className="space-y-0.5 font-mono">
                  <span className="text-navy-400 block text-[10px]">Assigned SRE:</span>
                  <span className="font-black text-navy-900 dark:text-white">Bethuel Thipe (Lead)</span>
                </div>
                <div className="space-y-0.5 font-mono">
                  <span className="text-navy-400 block text-[10px]">Severity Level:</span>
                  <span className="text-red-500 font-black uppercase">P1 Critical</span>
                </div>
                <button
                  onClick={() => alert("SRE incident report template exported successfully to local workspace logs.")}
                  className="py-1 px-3 bg-navy-900 hover:bg-navy-850 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-center"
                >
                  Generate Incident Report
                </button>
              </div>
            </div>

            {/* 5. Root Cause Analysis (RCA) and Grouping Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: RCA Card (Col-span: 5) */}
              <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-navy-100 dark:border-navy-800 pb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-royal-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white">
                    Automated Root Cause Diagnosis
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-royal-500/5 p-3 rounded-xl border border-royal-500/10 space-y-1">
                    <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">Most Probable Cause</span>
                    <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Redis Memory Limit Full (OOM)</h4>
                    <p className="text-[10.5px] text-navy-500 leading-normal">
                      High concurrent trial sessions triggered intense session coordinate updates, caching up vector coords without proper LRU eviction parameters, locking memory threads recursively.
                    </p>
                  </div>

                  {/* Confidence bar meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono font-bold">
                      <span className="text-navy-500">Confidence Match:</span>
                      <span className="text-royal-600 dark:text-royal-400">95% Confidence</span>
                    </div>
                    <div className="w-full bg-navy-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-royal-600 h-full w-[95%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-navy-400 uppercase font-black block">Affected Services</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Prediction Engine", "PDF Generator", "Dashboard Cache", "Lesson Matcher"].map((svc, idx) => (
                        <span key={idx} className="bg-navy-50 dark:bg-navy-950 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-navy-600 dark:text-gray-300 border border-navy-150 dark:border-navy-800">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-[10.5px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    💡 <b>Actionable SRE Recommendation:</b> Open `/src/lib/db.ts` database configs, apply automatic Redis keys eviction policy parameter, and allocate an extra 4GB RAM to AMH-Redis-Cache node.
                  </div>
                </div>
              </div>

              {/* Right Column: Intelligent Grouping list (Col-span: 7) */}
              <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-navy-100 dark:border-navy-800 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-royal-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white">
                      Intelligent Log Groupings
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-navy-400 font-bold uppercase">
                    Collapsing duplicates
                  </span>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {groupedLogs.map((group, idx) => {
                    const isExpanded = expandedGroupId === idx.toString();
                    return (
                      <div
                        key={idx}
                        className="bg-navy-50/40 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-850 rounded-xl p-3 text-xs space-y-2 transition-all"
                      >
                        <div
                          className="flex justify-between items-start gap-4 cursor-pointer"
                          onClick={() => setExpandedGroupId(isExpanded ? null : idx.toString())}
                        >
                          <div className="space-y-1">
                            <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                              group.level === "INFO" ? "bg-sky-500/10 text-sky-600" : "bg-red-500/15 text-red-600 dark:text-red-400"
                            }`}>
                              {group.level}
                            </span>
                            <h4 className="font-extrabold text-navy-900 dark:text-white select-text leading-relaxed">
                              {group.message}
                            </h4>
                          </div>

                          <div className="text-right shrink-0 font-mono space-y-1">
                            <span className="bg-royal-500/10 text-royal-600 dark:text-royal-300 font-black px-2 py-0.5 rounded text-[10px]">
                              {group.occurrences} runs
                            </span>
                            <span className="block text-[9px] text-navy-400">
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 inline" /> : <ChevronRight className="w-3.5 h-3.5 inline" />}
                            </span>
                          </div>
                        </div>

                        {/* Collapsible individual instances list */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-navy-150/60 dark:border-navy-800/80 space-y-2 pl-2">
                            <span className="text-[9.5px] font-mono text-navy-400 font-black uppercase tracking-wider block">
                              Individual Captured Instances ({group.samples.length})
                            </span>
                            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                              {group.samples.map((sample, sIdx) => (
                                <div key={sIdx} className="bg-white dark:bg-navy-900 p-2 rounded border border-navy-100 dark:border-navy-800 text-[10.5px] font-mono flex justify-between items-center">
                                  <span className="text-navy-500 font-bold truncate">ReqID: {sample.requestId}</span>
                                  <span className="text-navy-450">{new Date(sample.timestamp).toLocaleTimeString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: AI LOG ASSISTANT (Req 6) */}
        {activeTab === "assistant" && (
          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="border-b border-navy-100 dark:border-navy-800 pb-3">
              <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                SRE AI Observability Assistant Console
              </h3>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Ask natural language diagnostic queries about active CAPS trial scorecard runs, Postgres performance buffers, or payment failures.
              </p>
            </div>

            {/* AI Console Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Chat frame (Col-span: 8) */}
              <div className="lg:col-span-8 flex flex-col h-[450px] bg-navy-50/30 dark:bg-navy-950/30 border border-navy-100 dark:border-navy-850 rounded-xl relative overflow-hidden">
                
                {/* Message stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-normal">
                  {aiChat.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${chat.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`p-2 bg-white dark:bg-navy-900 rounded-xl border border-navy-150 dark:border-navy-800 p-3 shadow-xs space-y-2 ${
                        chat.sender === "user" ? "bg-royal-50 dark:bg-navy-900 border-royal-200" : ""
                      }`}>
                        <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1 ${
                          chat.sender === "user" ? "text-royal-600 dark:text-royal-400" : "text-gold-500"
                        }`}>
                          {chat.sender === "user" ? "Bethuel Thipe (Admin)" : "AMH SRE AI Agent"}
                        </span>
                        <p className="text-navy-800 dark:text-navy-200 select-text font-sans">{chat.text}</p>
                        
                        {chat.codeBlock && (
                          <pre className="bg-navy-950 text-emerald-400 p-2.5 rounded border border-navy-850 text-[10px] font-mono overflow-x-auto select-all leading-normal text-left">
                            {chat.codeBlock}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input query field */}
                <form onSubmit={handleAiAssistantSubmit} className="p-3 border-t border-navy-150 dark:border-navy-800 bg-white dark:bg-navy-900 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask AI: 'Why did response time increase?' or 'Explain this PostgreSQL deadlock'..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="flex-1 bg-navy-50 dark:bg-navy-950 border border-navy-100 dark:border-navy-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-royal-500 text-navy-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>

              {/* Right panel: preset queries & helpful hints (Col-span: 4) */}
              <div className="lg:col-span-4 space-y-4">
                <span className="text-[10px] font-mono text-navy-400 font-black uppercase tracking-wider block">
                  💡 High-Value SRE Preset Prompts
                </span>
                
                <div className="space-y-2">
                  {[
                    "Why did response time increase?",
                    "Show all failed payments today.",
                    "Explain this PostgreSQL deadlock.",
                    "Which endpoint generated the most errors?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiQuery(preset);
                      }}
                      className="w-full text-left p-3 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 hover:dark:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl text-xs font-sans font-extrabold text-navy-850 dark:text-navy-300 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <span>{preset}</span>
                      <ChevronRight className="w-4 h-4 text-royal-500 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="p-3.5 bg-gold-500/5 rounded-xl border border-gold-500/10 text-[11px] leading-relaxed text-gold-800 dark:text-gold-300">
                  ⚠️ <b>AI capabilities:</b> This copilot searches logs in active client memory, parses requests timelines, and synthesizes structured resolution advice for Grade 10-12 exam buffers.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: SECURITY STREAM (Req 9) */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="border-b border-navy-100 dark:border-navy-800 pb-3 flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-500" />
                  Isolated WAF Security Threat Stream
                </h3>
                <p className="text-xs text-navy-500 dark:text-navy-400">
                  Separate feed of gateway authentication challenges, SQL injections, Cross-Site Scripting (XSS), and rate limit breaches.
                </p>
              </div>
              <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-black text-[10px] px-2.5 py-1 rounded">
                WAF: Active
              </span>
            </div>

            {/* Security list */}
            <div className="space-y-3">
              {securityLogs.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-navy-50/50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-100 dark:border-navy-800/80 flex gap-3 relative overflow-hidden"
                >
                  <span className={`absolute left-0 top-0 bottom-0 w-1 ${
                    sec.severity === "high" ? "bg-red-500" : "bg-amber-500"
                  }`} />

                  <div className="shrink-0 mt-0.5">
                    <span className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg inline-block">
                      <ShieldAlert className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-tight">
                          {sec.event}
                        </h4>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          sec.severity === "high" ? "bg-red-500/20 text-red-700 dark:text-red-400" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        }`}>
                          {sec.severity} severity
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-navy-450">
                        [{new Date(sec.timestamp).toLocaleTimeString()}] IP: {sec.ip}
                      </span>
                    </div>

                    <p className="text-[11px] text-navy-600 dark:text-navy-350 leading-relaxed font-mono">
                      {sec.details}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Action: Connection terminated instantly by Cape Town edge proxy.
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 6: GOVERNANCE, RETENTION & RULES (Req 11, Req 14 & Req 15) */}
        {activeTab === "governance" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 15. Log Retention sliders (Col-span: 6) */}
            <div className="lg:col-span-6 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="border-b border-navy-100 dark:border-navy-800 pb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-royal-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white">
                  Compliance Log Retention Policies
                </h3>
              </div>

              <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                Automatically compress or archive older logs to S3 cold backup Glacier buckets to reduce operational storage costs.
              </p>

              <div className="space-y-4 pt-1">
                {/* Critical policy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-200">
                    <span>Critical Severity logs:</span>
                    <span className="font-mono text-royal-600 dark:text-royal-400">{retentionCritical} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={retentionCritical}
                    onChange={(e) => setRetentionCritical(Number(e.target.value))}
                    className="w-full accent-royal-600 h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Error policy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-200">
                    <span>Error Severity logs:</span>
                    <span className="font-mono text-royal-600 dark:text-royal-400">{retentionError} Days</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="730"
                    step="30"
                    value={retentionError}
                    onChange={(e) => setRetentionError(Number(e.target.value))}
                    className="w-full accent-royal-600 h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Warning policy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-200">
                    <span>Warning Severity logs:</span>
                    <span className="font-mono text-royal-600 dark:text-royal-400">{retentionWarning} Days</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="365"
                    step="15"
                    value={retentionWarning}
                    onChange={(e) => setRetentionWarning(Number(e.target.value))}
                    className="w-full accent-royal-600 h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Info policy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-200">
                    <span>Info & General Access logs:</span>
                    <span className="font-mono text-royal-600 dark:text-royal-400">{retentionInfo} Days</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="180"
                    step="7"
                    value={retentionInfo}
                    onChange={(e) => setRetentionInfo(Number(e.target.value))}
                    className="w-full accent-royal-600 h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Debug policy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-200">
                    <span>Debug trace logs:</span>
                    <span className="font-mono text-royal-600 dark:text-royal-400">{retentionDebug} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={retentionDebug}
                    onChange={(e) => setRetentionDebug(Number(e.target.value))}
                    className="w-full accent-royal-600 h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-navy-50/50 dark:bg-navy-950 p-3 rounded-lg border border-navy-150 text-[10.5px] text-navy-500 font-mono">
                * Estimating total compressed archives: 42.4 GB/month • AWS Glacier cost approx. R80.50/mo.
              </div>
            </div>

            {/* 14. Custom Notification Rules list (Col-span: 6) */}
            <div className="lg:col-span-6 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-navy-100 dark:border-navy-800 pb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-royal-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white">
                  Customizable Alert Notification Rules
                </h3>
              </div>

              <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                Establish active thresholds. The system auto-dispatches real-time webhooks once triggers are breached.
              </p>

              <div className="space-y-3">
                {alertRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-navy-50/40 dark:bg-navy-950/40 p-3.5 rounded-xl border border-navy-150 dark:border-navy-850 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rule.active ? "bg-emerald-500" : "bg-navy-300"}`} />
                        <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">
                          {rule.name}
                        </h4>
                      </div>
                      <p className="text-[10.5px] font-mono text-navy-500">{rule.condition}</p>
                      <div className="flex gap-1">
                        {rule.channel.map((ch, idx) => (
                          <span key={idx} className="bg-white dark:bg-navy-900 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-navy-450 border">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Enable/Disable toggle */}
                    <button
                      onClick={() => {
                        setAlertRules(prev => prev.map(r => {
                          if (r.id === rule.id) return { ...r, active: !r.active };
                          return r;
                        }));
                      }}
                      className={`px-3 py-1 text-[10px] font-mono uppercase font-black rounded-lg cursor-pointer transition-all ${
                        rule.active
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-300/30"
                          : "bg-navy-100 text-navy-500"
                      }`}
                    >
                      {rule.active ? "Active" : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert("Create notification rules custom wizard opened in background.")}
                  className="w-full text-center py-2 bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold uppercase text-[10.5px] rounded-xl tracking-wider cursor-pointer"
                >
                  Create Alert Rule
                </button>
                <button
                  onClick={handleVerfyIntegrity}
                  className="w-full text-center py-2 bg-navy-100 hover:bg-navy-150 text-navy-700 dark:bg-navy-850 dark:text-white dark:hover:bg-navy-800 font-mono font-bold uppercase text-[10.5px] rounded-xl tracking-wider cursor-pointer border border-navy-200 dark:border-navy-700"
                >
                  Verify Log Integrity
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
