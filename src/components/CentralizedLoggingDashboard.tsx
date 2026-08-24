import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, Search, Filter, RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, Info, Download, Trash2, Zap, Bug, Code, Terminal, Layers,
  Clock, User, Globe, ChevronRight, Eye, AlertOctagon, BarChart2
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import { LogPayload, logger } from "../lib/logger";
import { Profile } from "../types";

interface CentralizedLoggingDashboardProps {
  user?: Profile | null;
}

export const CentralizedLoggingDashboard: React.FC<CentralizedLoggingDashboardProps> = ({ user }) => {
  const [logs, setLogs] = useState<LogPayload[]>([]);
  const [summary, setSummary] = useState<{ total: number; errors: number; warnings: number; info: number }>({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedComponent, setSelectedComponent] = useState<string>("all");

  // Selected Log Drawer / Modal
  const [inspectLog, setInspectLog] = useState<LogPayload | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsSyncing(true);
      const params = new URLSearchParams({
        ...(selectedLevel !== "all" && { level: selectedLevel }),
        ...(selectedComponent !== "all" && { component: selectedComponent }),
        ...(searchQuery && { search: searchQuery })
      });

      const res = await fetch(`/api/logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch centralized logs");
      const data = await res.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
      setLoading(false);
    } catch (err) {
      console.warn("Backend log service offline, reading from local cache:", err);
      // Fallback: Read from local storage
      const cached = JSON.parse(localStorage.getItem("amh_centralized_logs") || "[]");
      setLogs(cached);
      setSummary({
        total: cached.length,
        errors: cached.filter((l: any) => l.level === "error" || l.level === "critical").length,
        warnings: cached.filter((l: any) => l.level === "warn").length,
        info: cached.filter((l: any) => l.level === "info").length
      });
      setLoading(false);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

  useEffect(() => {
    fetchLogs();
    logger.init();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedLevel, selectedComponent, searchQuery]);

  const handleSimulateClientError = () => {
    try {
      // Intentionally trigger a simulated error
      const nullObj: any = null;
      nullObj.triggerSimulatedPropertyAccess();
    } catch (err: any) {
      logger.error(
        `Simulated Client Error: ${err.message || "Cannot read properties of null"}`,
        "AdminDashboard",
        err.stack,
        {
          feature: "Centralized Logging Incident Simulator",
          browserMemoryMB: 128,
          retryAttempts: 1
        }
      );
      setNotification("Simulated client error captured and dispatched to central ingestion!");
      setTimeout(() => setNotification(null), 3500);
      fetchLogs();
    }
  };

  const handleSimulateAdminEvent = () => {
    logger.logAdminEvent(
      "DISPATCH_EXAM_PREDICTION_REPORT",
      "AdminDashboard",
      {
        targetGroup: "Grade 12 CAPS Matric Students",
        batchSize: 42,
        exportFormat: "PDF_VERIFIED"
      },
      user
    );
    setNotification("Administrative event logged successfully into central pipeline!");
    setTimeout(() => setNotification(null), 3500);
    fetchLogs();
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to flush all centralized logs?")) return;
    try {
      await fetch("/api/logs/clear", { method: "POST" });
      localStorage.removeItem("amh_centralized_logs");
      setLogs([]);
      setSummary({ total: 0, errors: 0, warnings: 0, info: 0 });
      setNotification("Centralized log store flushed!");
      setTimeout(() => setNotification(null), 3500);
    } catch {
      localStorage.removeItem("amh_centralized_logs");
      setLogs([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp", "Level", "Component", "Message", "Actor Email", "URL", "Stack Trace"];
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      l.level,
      l.component,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${l.actor?.email || ""}"`,
      `"${l.url || ""}"`,
      `"${(l.stack || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amaris-centralized-logs-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute breakdown by component for Recharts chart
  const componentDistribution = React.useMemo(() => {
    const map: Record<string, { total: number; errors: number }> = {};
    logs.forEach(l => {
      const c = l.component || "Client";
      if (!map[c]) map[c] = { total: 0, errors: 0 };
      map[c].total += 1;
      if (l.level === "error" || l.level === "critical") map[c].errors += 1;
    });

    return Object.keys(map).map(comp => ({
      name: comp,
      total: map[comp].total,
      errors: map[comp].errors
    })).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [logs]);

  const uniqueComponents = Array.from(new Set(logs.map(l => l.component || "Client")));

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case "critical":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "error":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "warn":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-royal-500/10 text-royal-600 dark:text-royal-400 border-royal-500/20";
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
        <RefreshCw className="w-8 h-8 text-royal-500 animate-spin" />
        <p className="text-xs font-mono font-bold text-navy-600 dark:text-navy-300">
          Connecting to Centralized Logging Pipeline & Telemetry Node...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* HEADER & TELEMETRY CONTROL BAR */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-royal-500" />
              Centralized Logging Service
            </h2>
            <span className="bg-royal-500/10 text-royal-600 dark:text-royal-400 text-[10px] font-mono font-black px-2 py-0.5 rounded border border-royal-500/20 uppercase tracking-wider">
              INGESTION STREAM ACTIVE
            </span>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Real-time client error boundary ingestion, stack trace aggregation, and administrative event telemetry.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateClientError}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Client Error</span>
          </button>

          <button
            onClick={handleSimulateAdminEvent}
            className="px-3 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Log Admin Event</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              autoRefresh
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-emerald-500" : ""}`} />
            <span>{autoRefresh ? "Live Stream ON" : "Paused"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-royal-500" />
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Flush Central Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={fetchLogs}
            disabled={isSyncing}
            className="p-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{notification}</span>
        </motion.div>
      )}

      {/* STATS & INCIDENT SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Aggregated Logs</span>
          <div className="text-2xl font-black text-navy-900 dark:text-white">{summary.total}</div>
          <span className="text-[10px] text-navy-500 block">Total captured in buffer</span>
        </div>

        <div className="bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Errors & Exceptions</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{summary.errors}</div>
          <span className="text-[10px] text-rose-500 block">Client & stack rejections</span>
        </div>

        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">System Warnings</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{summary.warnings}</div>
          <span className="text-[10px] text-amber-500 block">Buffer pressure & latency flags</span>
        </div>

        <div className="bg-royal-500/10 dark:bg-royal-500/5 border border-royal-500/20 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-royal-600 dark:text-royal-400 uppercase tracking-wider block">Info & Admin Events</span>
          <div className="text-2xl font-black text-royal-600 dark:text-royal-400">{summary.info}</div>
          <span className="text-[10px] text-royal-500 block">Operational audit traces</span>
        </div>
      </div>

      {/* COMPONENT ERROR BREAKDOWN RECHARTS BAR CHART */}
      {componentDistribution.length > 0 && (
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between font-mono">
            <h3 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-royal-500" />
              Log Volume & Error Distribution by Component
            </h3>
            <span className="text-[10px] text-navy-400">Top 6 Logging Modules</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", color: "#fff", fontSize: "11px" }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Logs" />
                <Bar dataKey="errors" fill="#ef4444" radius={[4, 4, 0, 0]} name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Keyword Search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search log messages, stack trace, user, URL..."
              className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-mono outline-none focus:border-royal-500 text-navy-900 dark:text-white transition-all"
            />
          </div>

          {/* Log Level Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {["all", "info", "warn", "error"].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer uppercase ${
                  selectedLevel === lvl
                    ? lvl === "error"
                      ? "bg-rose-600 text-white"
                      : lvl === "warn"
                      ? "bg-amber-600 text-white"
                      : "bg-royal-600 text-white"
                    : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Component Selector & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-navy-100 dark:border-navy-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-royal-500" />
            <span className="text-[10px] font-bold text-navy-400 uppercase">Filter by Component:</span>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="px-3 py-1 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs outline-none text-navy-800 dark:text-navy-200"
            >
              <option value="all">All Components</option>
              {uniqueComponents.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {(selectedLevel !== "all" || selectedComponent !== "all" || searchQuery !== "") && (
            <button
              onClick={() => {
                setSelectedLevel("all");
                setSelectedComponent("all");
                setSearchQuery("");
              }}
              className="text-royal-600 dark:text-royal-400 font-bold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* LOG STREAM TABLE */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3 font-mono">
          <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-royal-500" />
            Central Log Ingestion Stream ({logs.length} Entries)
          </h3>
          <span className="text-xs text-navy-400">
            Auto-refresh interval: <span className="text-emerald-500 font-bold">4.0s</span>
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center text-navy-400 font-mono space-y-2">
            <AlertTriangle className="w-10 h-10 mx-auto text-navy-300 opacity-60" />
            <p className="text-sm">No log entries matched your filter parameters.</p>
            <p className="text-xs text-navy-500">Try triggering a simulated client error or clearing active search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-navy-100 dark:border-navy-800 text-[10px] text-navy-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Level & ID</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Message & Stack Trace</th>
                  <th className="py-2.5 px-3">User Context</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-navy-50/60 dark:hover:bg-navy-850/60 transition-colors">
                    {/* Level & ID */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${getLevelBadge(log.level)}`}>
                          {log.level}
                        </span>
                        <span className="text-[10px] text-navy-400">{log.id}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-navy-800 dark:text-navy-200">
                        {new Date(log.timestamp || "").toLocaleTimeString()}
                      </div>
                      <div className="text-[10px] text-navy-400">
                        {new Date(log.timestamp || "").toLocaleDateString()}
                      </div>
                    </td>

                    {/* Component */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200 font-bold text-[10px]">
                        {log.component || "Client"}
                      </span>
                    </td>

                    {/* Message & Stack preview */}
                    <td className="py-3 px-3 max-w-md">
                      <div className={`font-bold truncate ${log.level === "error" ? "text-rose-500" : "text-navy-900 dark:text-white"}`}>
                        {log.message}
                      </div>
                      {log.stack && (
                        <div className="text-[10px] text-rose-400 dark:text-rose-300 font-mono truncate max-w-xs opacity-80">
                          {log.stack.split("\n")[0]}
                        </div>
                      )}
                    </td>

                    {/* User */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-navy-800 dark:text-navy-200">{log.actor?.name || "Anonymous"}</div>
                      <div className="text-[10px] text-navy-400">{log.actor?.email || log.actor?.role || "system"}</div>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="px-2.5 py-1 bg-royal-600/10 hover:bg-royal-600/20 text-royal-600 dark:text-royal-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3" /> Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOG INSPECTION MODAL DRAWER */}
      <AnimatePresence>
        {inspectLog && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-left font-mono space-y-4"
            >
              <button
                onClick={() => setInspectLog(null)}
                className="absolute top-4 right-4 text-navy-400 hover:text-navy-600 dark:hover:text-white p-1 rounded-full hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-navy-100 dark:border-navy-800 pb-3">
                <div className={`p-2.5 rounded-xl ${inspectLog.level === "error" ? "bg-rose-500/10 text-rose-500" : "bg-royal-500/10 text-royal-500"}`}>
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-navy-900 dark:text-white uppercase">
                    Centralized Log Inspection #{inspectLog.id}
                  </h3>
                  <p className="text-[11px] text-navy-400">Captured: {new Date(inspectLog.timestamp || "").toLocaleString()}</p>
                </div>
              </div>

              {/* Message Banner */}
              <div className={`p-3 rounded-xl border text-xs font-bold ${
                inspectLog.level === "error" ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-royal-500/10 border-royal-500/30 text-royal-600 dark:text-royal-400"
              }`}>
                {inspectLog.message}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-150 dark:border-navy-800">
                  <span className="text-[10px] text-navy-400 uppercase block">Component</span>
                  <strong className="text-royal-600 dark:text-royal-400">{inspectLog.component}</strong>
                </div>

                <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-150 dark:border-navy-800">
                  <span className="text-[10px] text-navy-400 uppercase block">User Context</span>
                  <strong className="text-navy-900 dark:text-white block">{inspectLog.actor?.name || "Unknown"}</strong>
                  <span className="text-[10px] text-navy-400">{inspectLog.actor?.email}</span>
                </div>
              </div>

              {/* Stack Trace if present */}
              {inspectLog.stack && (
                <div className="space-y-1">
                  <span className="text-[10px] text-rose-500 uppercase font-bold flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Stack Trace Rejection
                  </span>
                  <pre className="p-3 bg-navy-950 text-rose-300 rounded-xl border border-rose-900/50 text-[11px] overflow-x-auto font-mono whitespace-pre-wrap">
                    {inspectLog.stack}
                  </pre>
                </div>
              )}

              {/* Raw JSON */}
              <div className="space-y-1">
                <span className="text-[10px] text-navy-400 uppercase font-bold block">Complete Telemetry Object</span>
                <pre className="p-3 bg-navy-950 text-gold-400 rounded-xl border border-navy-800 text-[11px] overflow-x-auto font-mono">
                  {JSON.stringify(inspectLog, null, 2)}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
