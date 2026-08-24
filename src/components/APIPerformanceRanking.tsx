import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Search, BarChart3,
  SlidersHorizontal, RefreshCw, Cpu, Database, Play, Check, Server,
  ChevronDown, ChevronUp, Terminal, Zap, Flame, ShieldCheck, Filter, ArrowUpDown, FileText, ArrowRight, HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, Cell, LineChart, Line, AreaChart, Area
} from "recharts";

// Endpoint telemetry structure
interface APIEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  requestCount: number;
  module: "Calculus Sandbox" | "Live Classroom" | "Exam Predictor" | "PDF Homework" | "SMTP Dispatch" | "Booking Wizard";
  description: string;
  bottleneckCause: string;
  recommendation: string;
}

export const APIPerformanceRanking: React.FC = () => {
  // Baseline static endpoints with high-school math context
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([
    {
      id: "ep-1",
      method: "POST",
      path: "/api/v1/exam-predictor/matric-trial-simulate",
      avgLatencyMs: 385,
      p95LatencyMs: 840,
      errorRate: 4.8,
      requestCount: 4250,
      module: "Exam Predictor",
      description: "Generates high-fidelity CAPS trial mathematics marks predictions using Deep Neural Weights and statistical matrices.",
      bottleneckCause: "Heavy memory footprints from concurrent NumPy/matrix operations during SAST school-hours surge.",
      recommendation: "Shift prediction models to asynchronous Celery jobs, back-buffered by Redis cache streams."
    },
    {
      id: "ep-2",
      method: "POST",
      path: "/api/v1/classroom/save-whiteboard-vector",
      avgLatencyMs: 245,
      p95LatencyMs: 490,
      errorRate: 3.2,
      requestCount: 18200,
      module: "Live Classroom",
      description: "Persists collaborative whiteboard vector drawing logs to the database so parents and students can review post-session recordings.",
      bottleneckCause: "High-frequency SQL INSERT statements writing raw geometry coordinates in a single transactional state block.",
      recommendation: "Implement client-side throttle/debounce, and bundle drawings in Redis lists before pushing bulk UPSERT statements."
    },
    {
      id: "ep-3",
      method: "GET",
      path: "/api/v1/resources/caps-formulas/sandbox",
      avgLatencyMs: 42,
      p95LatencyMs: 95,
      errorRate: 0.1,
      requestCount: 28400,
      module: "Calculus Sandbox",
      description: "Retrieves step-by-step calculus limit derivations and quadratic variable evaluations for student sandbox practices.",
      bottleneckCause: "Extremely fast, pure mathematical function operations. Mostly lightweight GET responses.",
      recommendation: "Ensure aggressive client-side caching using browser LocalStorage and long-lived cloud Edge headers."
    },
    {
      id: "ep-4",
      method: "POST",
      path: "/api/v1/homework/compile-pdf-worksheet",
      avgLatencyMs: 650,
      p95LatencyMs: 1420,
      errorRate: 8.5,
      requestCount: 1100,
      module: "PDF Homework",
      description: "Assembles custom IEB/CAPS question papers with diagrams into downloadable PDF assets dynamically using server-side rendering.",
      bottleneckCause: "Sub-processes spawned to compile LaTeX-based mathematical formula graphs and vectors into PDF binary blocks.",
      recommendation: "Pre-render static formula blocks and buffer final worksheets inside a regional Cloud Storage bucket."
    },
    {
      id: "ep-5",
      method: "POST",
      path: "/api/v1/bookings/lessons/wizard-lock",
      avgLatencyMs: 185,
      p95LatencyMs: 340,
      errorRate: 1.8,
      requestCount: 8900,
      module: "Booking Wizard",
      description: "Coordinates booking locks on weekly tutor availability grids, checking for double-booking conflicts.",
      bottleneckCause: "Locking queries block the tutor availability calendar table, causing high thread pools waiting on Postgres locks.",
      recommendation: "Introduce optimistic locking with Redis key expiration, avoiding continuous transactional state locks."
    },
    {
      id: "ep-6",
      method: "POST",
      path: "/api/v1/smtp/reminder-dispatch-bulk",
      avgLatencyMs: 450,
      p95LatencyMs: 1200,
      errorRate: 6.2,
      requestCount: 1540,
      module: "SMTP Dispatch",
      description: "Triggers Nodemailer bulk mail flows notifying high school students and parents about upcoming weekly math sessions.",
      bottleneckCause: "Sequential SMTP Handshakes with Gmail / Outlook relay servers done synchronously inside the HTTP response thread.",
      recommendation: "Outsource reminder dispatch to a background worker queue with automatic mail-server retry backoffs."
    },
    {
      id: "ep-7",
      method: "GET",
      path: "/api/v1/classroom/active-sessions-grid",
      avgLatencyMs: 68,
      p95LatencyMs: 145,
      errorRate: 0.5,
      requestCount: 22100,
      module: "Live Classroom",
      description: "Polls active tutoring classroom rooms and provides websocket orchestration details for administrative oversight.",
      bottleneckCause: "Polled frequently by all administrators and active dashboard clients simultaneously.",
      recommendation: "Migrate client polling entirely to lightweight Server-Sent Events (SSE) or a persistent WebSockets gateway."
    },
    {
      id: "ep-8",
      method: "GET",
      path: "/api/v1/resources/caps-formulas/trigonometry",
      avgLatencyMs: 38,
      p95LatencyMs: 78,
      errorRate: 0.0,
      requestCount: 31200,
      module: "Calculus Sandbox",
      description: "Serves reference grids, cosine rules, and double-angle formulas tailored to NSC/IEB Matric syllabus guidelines.",
      bottleneckCause: "Extremely fast read-only assets. Highly efficient static database responses.",
      recommendation: "Configure permanent regional CDN cache replication to minimize server round trips."
    }
  ]);

  // Search & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"avgLatency" | "p95Latency" | "errorRate" | "requestCount">("avgLatency");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Sim state
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("ep-1");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(true);

  // Generate periodic trace logs
  const [traceLogs, setTraceLogs] = useState<string[]>([
    "[TRACE] Listening on express-gateway at port :3000...",
    "[TRACE] Trace audit log verified for region za-jhn-1.",
  ]);

  // Periodic simulated live fluctuations
  useEffect(() => {
    if (!isLiveTelemetry) return;

    const interval = setInterval(() => {
      setEndpoints(prev =>
        prev.map(ep => {
          // Add minor fluctuation to request count & average latencies
          const reqVariance = Math.floor(Math.random() * 15) - 7;
          const latencyVariance = Math.floor(Math.random() * 9) - 4;
          
          let nextError = ep.errorRate;
          if (Math.random() > 0.85) {
            const errVariance = Number(((Math.random() * 0.8) - 0.4).toFixed(2));
            nextError = Math.max(0, Number((ep.errorRate + errVariance).toFixed(2)));
          }

          return {
            ...ep,
            requestCount: Math.max(100, ep.requestCount + reqVariance),
            avgLatencyMs: Math.max(10, ep.avgLatencyMs + latencyVariance),
            p95LatencyMs: Math.max(20, ep.p95LatencyMs + (latencyVariance * 2)),
            errorRate: nextError
          };
        })
      );

      // Random trace log
      if (Math.random() > 0.7) {
        const randomEp = endpoints[Math.floor(Math.random() * endpoints.length)];
        const time = new Date().toLocaleTimeString();
        setTraceLogs(prev => [
          `[${time}] TRACE ${randomEp.method} ${randomEp.path} - HTTP 200 - ${randomEp.avgLatencyMs}ms`,
          ...prev.slice(0, 14)
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveTelemetry, endpoints]);

  // Sort and filter endpoints
  const filteredAndSortedEndpoints = endpoints
    .filter(ep => {
      const matchesSearch = ep.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ep.module.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedModule === "All" || ep.module === selectedModule;
      return matchesSearch && matchesModule;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "avgLatency") comparison = a.avgLatencyMs - b.avgLatencyMs;
      if (sortBy === "p95Latency") comparison = a.p95LatencyMs - b.p95LatencyMs;
      if (sortBy === "errorRate") comparison = a.errorRate - b.errorRate;
      if (sortBy === "requestCount") comparison = a.requestCount - b.requestCount;

      return sortOrder === "desc" ? -comparison : comparison;
    });

  const selectedEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

  // Simulated AI Code Tuner runbook optimization
  const optimizeSelectedEndpoint = () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setOptimizationLogs([
      `[SRE-TUNER] Bootstrapping optimization workspace for: ${selectedEndpoint.path}`,
      `[SRE-TUNER] Scanning code files & indexing bottlenecks...`,
    ]);

    const logSequence = [
      `[SRE-TUNER] Identified query bottlenecks in module: [${selectedEndpoint.module}]`,
      `[SRE-TUNER] Generating recommended indexes and caching buffers...`,
      `[SRE-TUNER] Bundling server-side code changes...`,
      `[SRE-TUNER] Testing cold-starts in isolation: SUCCESS (0 errors)`,
      `[SRE-TUNER] Hot-swapping routing pathways to optimized caching proxies...`,
      `[SRE-TUNER] Remediated response metrics. P95 latency reduced successfully!`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logSequence.length) {
        setOptimizationLogs(prev => [...prev, logSequence[step]]);
        setOptimizationProgress(Math.floor(((step + 1) / logSequence.length) * 100));
        step++;
      } else {
        clearInterval(interval);
        setIsOptimizing(false);
        // Reduce the optimized endpoint's latency and error rate significantly
        setEndpoints(prev =>
          prev.map(ep => {
            if (ep.id === selectedEndpoint.id) {
              return {
                ...ep,
                avgLatencyMs: Math.max(15, Math.round(ep.avgLatencyMs * 0.4)),
                p95LatencyMs: Math.max(30, Math.round(ep.p95LatencyMs * 0.35)),
                errorRate: Math.max(0.0, Number((ep.errorRate * 0.1).toFixed(2)))
              };
            }
            return ep;
          })
        );
      }
    }, 600);
  };

  const handleSort = (field: "avgLatency" | "p95Latency" | "errorRate" | "requestCount") => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Prepare charts data for Recharts
  const chartData = filteredAndSortedEndpoints.map(ep => ({
    name: ep.path.replace("/api/v1/", ""),
    avg: ep.avgLatencyMs,
    p95: ep.p95LatencyMs,
    error: ep.errorRate,
    requests: ep.requestCount
  }));

  // List of unique modules for filter dropdown
  const modules = ["All", "Calculus Sandbox", "Live Classroom", "Exam Predictor", "PDF Homework", "SMTP Dispatch", "Booking Wizard"];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-royal-500/10 text-royal-600 dark:text-gold-400 rounded-lg shrink-0">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
              API Performance Ranking
            </h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Real-time API profiling and latency audits across South Africa’s high school maths portal. Sort, query, and deploy caching runbooks with SRE tools.
          </p>
        </div>

        {/* Live streaming indicator toggler */}
        <button
          type="button"
          onClick={() => setIsLiveTelemetry(!isLiveTelemetry)}
          className={`px-3 py-1.5 border rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
            isLiveTelemetry
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
              : "bg-navy-50 text-navy-600 border-navy-200 dark:bg-navy-900"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveTelemetry ? "bg-emerald-500 animate-pulse" : "bg-navy-400"}`} />
          {isLiveTelemetry ? "Telemetry Live" : "Telemetry Paused"}
        </button>
      </div>

      {/* Main Grid: Analytical Visualizers on top, list & side inspector below */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Visual Charts (Col Span: 12) */}
        <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Latency Comparison Chart */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
                Latency profiling by endpoint (Avg vs P95)
              </h3>
              <span className="text-[10px] text-navy-400 font-mono">ms - Lower is better</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-navy-850" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ fontSize: "11px", borderRadius: "12px", backgroundColor: "#0f172a", color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="avg" name="Average Latency (ms)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="p95" name="P95 Latency (ms)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Density & Errors Scatter/Area chart */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Error Rate Trace & Request Load Density
              </h3>
              <span className="text-[10px] text-navy-400 font-mono">% Error Rate vs Load Volume</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-navy-850" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <defs>
                    <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area yAxisId="left" type="monotone" dataKey="error" name="Error Rate (%)" stroke="#f43f5e" fillOpacity={1} fill="url(#errorGrad)" />
                  <Line yAxisId="right" type="monotone" dataKey="requests" name="Request Load count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Filters and List view (Col Span: 8) */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-navy-50 dark:bg-navy-900 border border-navy-100 dark:border-navy-850 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-royal-500 text-navy-900 dark:text-white transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
              <span className="text-[11px] font-mono font-bold text-navy-400 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Module:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {modules.map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setSelectedModule(mod)}
                    className={`px-2.5 py-1 text-[10.5px] font-mono rounded-lg border transition-all cursor-pointer ${
                      selectedModule === mod
                        ? "bg-royal-600 border-royal-500 text-white font-bold"
                        : "bg-navy-50 dark:bg-navy-900 border-navy-100 dark:border-navy-850 text-navy-600 dark:text-navy-300 hover:bg-navy-100"
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Endpoint Tables List */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-50/70 dark:bg-navy-900 border-b border-navy-100 dark:border-navy-850 text-[10px] font-mono text-navy-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Endpoint Path</th>
                    <th className="py-3 px-3 cursor-pointer select-none hover:text-navy-900 dark:hover:text-white" onClick={() => handleSort("avgLatency")}>
                      <div className="flex items-center gap-1">
                        Avg Latency
                        <ArrowUpDown className="w-3 h-3 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer select-none hover:text-navy-900 dark:hover:text-white" onClick={() => handleSort("p95Latency")}>
                      <div className="flex items-center gap-1">
                        P95 Latency
                        <ArrowUpDown className="w-3 h-3 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer select-none hover:text-navy-900 dark:hover:text-white" onClick={() => handleSort("errorRate")}>
                      <div className="flex items-center gap-1">
                        Error Rate
                        <ArrowUpDown className="w-3 h-3 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer select-none hover:text-navy-900 dark:hover:text-white" onClick={() => handleSort("requestCount")}>
                      <div className="flex items-center gap-1">
                        Requests
                        <ArrowUpDown className="w-3 h-3 shrink-0" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-850 text-xs">
                  {filteredAndSortedEndpoints.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-navy-400 italic font-mono">
                        No active metrics mapped matching search parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedEndpoints.map((ep) => {
                      const isSelected = selectedEndpointId === ep.id;
                      
                      // Method styling
                      let methodStyle = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                      if (ep.method === "POST") methodStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                      if (ep.method === "DELETE") methodStyle = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                      
                      // Latency highlight colors
                      const latencyColor = ep.avgLatencyMs > 300 
                        ? "text-rose-600 dark:text-rose-400 font-bold" 
                        : ep.avgLatencyMs > 150 
                        ? "text-amber-600 dark:text-amber-400 font-bold" 
                        : "text-emerald-600 dark:text-emerald-400 font-bold";

                      const errorColor = ep.errorRate > 5.0
                        ? "bg-rose-500/15 text-rose-600 border-rose-500/20"
                        : ep.errorRate > 1.5
                        ? "bg-amber-500/15 text-amber-600 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

                      return (
                        <tr 
                          key={ep.id}
                          onClick={() => setSelectedEndpointId(ep.id)}
                          className={`cursor-pointer transition-all hover:bg-navy-50/50 dark:hover:bg-navy-900/40 ${
                            isSelected ? "bg-navy-100/50 dark:bg-navy-900/80 font-semibold" : ""
                          }`}
                        >
                          {/* Path & Method */}
                          <td className="py-3 px-4 font-mono max-w-[280px]">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded border ${methodStyle}`}>
                                {ep.method}
                              </span>
                              <span className="text-[11px] truncate text-navy-800 dark:text-navy-200">
                                {ep.path}
                              </span>
                            </div>
                            <span className="text-[9px] block text-navy-400 mt-0.5 font-sans">
                              Module: {ep.module}
                            </span>
                          </td>

                          {/* Average Latency */}
                          <td className="py-3 px-3 font-mono">
                            <span className={latencyColor}>{ep.avgLatencyMs} ms</span>
                          </td>

                          {/* P95 Latency */}
                          <td className="py-3 px-3 font-mono">
                            <span className={ep.p95LatencyMs > 600 ? "text-rose-600 font-bold" : "text-navy-700 dark:text-navy-300"}>
                              {ep.p95LatencyMs} ms
                            </span>
                          </td>

                          {/* Error Rate */}
                          <td className="py-3 px-3 font-mono">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${errorColor}`}>
                              {ep.errorRate}%
                            </span>
                          </td>

                          {/* Request Count */}
                          <td className="py-3 px-4 font-mono text-navy-600 dark:text-navy-300">
                            {ep.requestCount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Detailed Inspector sidebar (Col Span: 4) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Profile Inspector */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-850 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-royal-500/15 text-royal-600 dark:text-gold-400 rounded-lg shrink-0">
                  <Server className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">
                  Endpoint Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono text-navy-400 uppercase">{selectedEndpoint.id}</span>
            </div>

            {/* Path description */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold bg-navy-100 dark:bg-navy-900 px-2 py-0.5 rounded border dark:border-navy-800">
                  {selectedEndpoint.method}
                </span>
                <span className="text-[10px] text-navy-400 font-mono">Port 3000 Ingress</span>
              </div>
              <h4 className="text-xs font-black text-navy-900 dark:text-white font-mono break-all leading-relaxed">
                {selectedEndpoint.path}
              </h4>
              <p className="text-[11.5px] text-navy-500 leading-normal">
                {selectedEndpoint.description}
              </p>
            </div>

            {/* Microservice context highlights */}
            <div className="bg-navy-50 dark:bg-navy-900/40 p-3 rounded-2xl border border-navy-100 dark:border-navy-850 space-y-3.5 text-left">
              
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-mono text-rose-500 font-bold block uppercase tracking-wider">
                  Root Cause of Slowdowns:
                </span>
                <p className="text-[11px] text-navy-600 dark:text-navy-300 leading-normal">
                  {selectedEndpoint.bottleneckCause}
                </p>
              </div>

              <div className="space-y-0.5 border-t border-navy-100 dark:border-navy-850 pt-2.5">
                <span className="text-[8.5px] font-mono text-emerald-500 font-bold block uppercase tracking-wider">
                  SRE Recommendation Action:
                </span>
                <p className="text-[11px] text-navy-600 dark:text-navy-300 leading-normal italic">
                  {selectedEndpoint.recommendation}
                </p>
              </div>

            </div>

            {/* Tuning simulation block */}
            <div className="pt-2 border-t border-navy-100 dark:border-navy-850 space-y-3">
              <button
                type="button"
                onClick={optimizeSelectedEndpoint}
                disabled={isOptimizing}
                className="w-full py-2.5 px-3 bg-navy-950 text-gold-400 hover:bg-navy-900 border border-gold-500/30 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isOptimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-gold-500" />}
                {isOptimizing ? `Tuning ${optimizationProgress}%` : "Optimize Endpoint Cache"}
              </button>

              {/* Live stream process overlay logs */}
              {optimizationLogs.length > 0 && (
                <div className="bg-navy-950 text-emerald-400 border border-navy-850 p-3 rounded-xl font-mono text-[9px] text-left space-y-1 max-h-32 overflow-y-auto">
                  {optimizationLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-navy-600 shrink-0 select-none">&gt;</span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* SRE Logger Terminal */}
          <div className="bg-navy-950 text-white border border-navy-850 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-navy-850 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-gold-400">
                <Terminal className="w-4 h-4 text-gold-500" />
                Live Ingress Log traces
              </div>
              <button
                type="button"
                onClick={() => setTraceLogs([])}
                className="text-[9px] font-mono text-navy-400 hover:text-white cursor-pointer hover:underline"
              >
                Clear
              </button>
            </div>

            <div className="h-40 overflow-y-auto space-y-1.5 font-mono text-[9.5px] text-emerald-400 text-left pr-1">
              {traceLogs.length === 0 ? (
                <div className="text-navy-500 italic py-4">Terminal trace logger empty. Listening for ingress requests...</div>
              ) : (
                traceLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-navy-600 shrink-0 select-none">&gt;</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
