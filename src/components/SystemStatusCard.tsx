import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database, Cpu, HardDrive, RefreshCw, AlertTriangle, CheckCircle,
  Zap, Settings, Activity, Sparkles, ShieldCheck, Clock, Layers, Download, FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis
} from "recharts";

// 7-day historical uptime mock data
const UPTIME_HISTORY = [
  { day: "Mon", uptime: 99.98, status: "Excellent" },
  { day: "Tue", uptime: 99.99, status: "Excellent" },
  { day: "Wed", uptime: 99.97, status: "Good" },
  { day: "Thu", uptime: 100.00, status: "Perfect" },
  { day: "Fri", uptime: 99.95, status: "Good" },
  { day: "Sat", uptime: 99.99, status: "Excellent" },
  { day: "Sun", uptime: 99.98, status: "Excellent" }
];

interface ServiceState {
  name: string;
  uptime: number;
  latency: number;
  status: "nominal" | "degraded" | "outage" | "maintenance";
  metrics: Record<string, string | number>;
}

export const SystemStatusCard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now");
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [globalSla, setGlobalSla] = useState<number>(99.98);

  // Core Service states
  const [services, setServices] = useState<Record<string, ServiceState>>({
    postgres: {
      name: "PostgreSQL Database (Primary)",
      uptime: 99.96,
      latency: 14,
      status: "nominal",
      metrics: {
        connections: "42/150",
        cacheHitRate: "99.9%",
        queriesPerSec: 185
      }
    },
    redis: {
      name: "Redis Cache & Sessions",
      uptime: 99.99,
      latency: 0.8,
      status: "nominal",
      metrics: {
        memoryUsed: "14.2 MB",
        hitRate: "98.4%",
        activeKeys: 4820
      }
    },
    s3: {
      name: "AWS S3 Object Storage",
      uptime: 99.95,
      latency: 48,
      status: "nominal",
      metrics: {
        totalSize: "1.42 TB",
        assetCount: "24,180 files",
        bandwidth: "18.4 MB/s"
      }
    }
  });

  const logTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Time formatter
  const formatTime = () => {
    return new Date().toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const addLog = (msg: string) => {
    setSimulationLog(prev => [`[${formatTime()}] ${msg}`, ...prev].slice(0, 15));
  };

  // Live noise simulation to make the chart and latencies feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => {
        const next = { ...prev };
        
        // Only jitter if nominal
        if (next.postgres.status === "nominal") {
          next.postgres.latency = Math.max(8, Math.min(25, next.postgres.latency + (Math.random() * 4 - 2)));
          next.postgres.metrics.queriesPerSec = Math.max(120, Math.min(280, (next.postgres.metrics.queriesPerSec as number) + Math.floor(Math.random() * 20 - 10)));
        }
        if (next.redis.status === "nominal") {
          next.redis.latency = parseFloat((Math.max(0.4, Math.min(1.5, next.redis.latency + (Math.random() * 0.2 - 0.1)))).toFixed(2));
          next.redis.metrics.activeKeys = (next.redis.metrics.activeKeys as number) + Math.floor(Math.random() * 6 - 3);
        }
        if (next.s3.status === "nominal") {
          next.s3.latency = Math.max(35, Math.min(65, next.s3.latency + (Math.random() * 6 - 3)));
        }

        return next;
      });

      // Subtle jitter to SLA
      setGlobalSla(prev => {
        const diff = (Math.random() * 0.002 - 0.001);
        return parseFloat(Math.max(99.90, Math.min(100.00, prev + diff)).toFixed(4));
      });
    }, 5000);

    addLog("Infrastructure heartbeat pipeline initialized.");
    return () => clearInterval(interval);
  }, []);

  // Manual refresh trigger
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    addLog("Triggering global infrastructure SLA probe...");
    setTimeout(() => {
      setIsRefreshing(false);
      const timeStr = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastRefreshed(`at ${timeStr}`);
      addLog("Global SLA probe completed. All core packets acknowledged.");
    }, 1200);
  };

  const downloadStatusReportCSV = () => {
    let csv = "AMARIS MATHEMATICS HUB - INFRASTRUCTURE SLA & CORE SYSTEMS REPORT\n";
    csv += `Generated At,${new Date().toLocaleString("en-ZA")}\n`;
    csv += `Global Live SLA Met,${globalSla}%\n\n`;
    
    csv += "CORE SERVICES SUMMARY\n";
    csv += "Service Key,Service Name,Uptime (%),Latency (ms),Status,Metrics\n";
    Object.entries(services).forEach(([key, svc]) => {
      const metricsStr = Object.entries(svc.metrics)
        .map(([mName, val]) => `${mName}: ${val}`)
        .join(" | ");
      csv += `${key},"${svc.name}",${svc.uptime},${svc.latency},${svc.status},"${metricsStr}"\n`;
    });
    csv += "\n";
    
    csv += "7-DAY HISTORICAL UPTIME TRACKING\n";
    csv += "Day,Uptime (%),Status Rating\n";
    UPTIME_HISTORY.forEach(item => {
      csv += `${item.day},${item.uptime},${item.status}\n`;
    });
    csv += "\n";

    csv += "RECENT TELEMETRY LOGS\n";
    csv += "Log Statement\n";
    simulationLog.forEach(log => {
      csv += `"${log.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amaris_infrastructure_system_status_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addLog("💾 Offline system status CSV report compiled and downloaded.");
  };

  // Run complex simulations
  const simulateLoadSpike = () => {
    addLog("⚡ [SIMULATION] Initiating heavy load spike test on PostgreSQL...");
    setServices(prev => ({
      ...prev,
      postgres: {
        ...prev.postgres,
        status: "degraded",
        latency: 480,
        metrics: {
          ...prev.postgres.metrics,
          connections: "148/150",
          queriesPerSec: 1250
        }
      }
    }));

    // Auto heal after 8 seconds
    if (logTimeoutRef.current) clearTimeout(logTimeoutRef.current);
    logTimeoutRef.current = setTimeout(() => {
      setServices(prev => ({
        ...prev,
        postgres: {
          ...prev.postgres,
          status: "nominal",
          latency: 16,
          metrics: {
            ...prev.postgres.metrics,
            connections: "48/150",
            queriesPerSec: 210
          }
        }
      }));
      addLog("🛡️ [AUTO-HEAL] Connection pooling limits enforced. PostgreSQL returned to nominal latency.");
    }, 8000);
  };

  const simulateRedisFlush = () => {
    addLog("🔑 [SIMULATION] Triggering Redis cache keyspace invalidate...");
    setServices(prev => ({
      ...prev,
      redis: {
        ...prev.redis,
        status: "degraded",
        latency: 18.5,
        metrics: {
          ...prev.redis.metrics,
          activeKeys: 0,
          hitRate: "12.5%"
        }
      }
    }));

    // Warm cache up again
    setTimeout(() => {
      setServices(prev => ({
        ...prev,
        redis: {
          ...prev.redis,
          status: "nominal",
          latency: 0.7,
          metrics: {
            ...prev.redis.metrics,
            activeKeys: 3200,
            hitRate: "95.2%"
          }
        }
      }));
      addLog("🔄 [CACHE-WARM] Redis keyspace successfully rebuilt from cold backup.");
    }, 5000);
  };

  const simulateS3UploadSpike = () => {
    addLog("📂 [SIMULATION] Injecting bulk matric practice PDFs to S3 bucket...");
    setServices(prev => ({
      ...prev,
      s3: {
        ...prev.s3,
        status: "degraded",
        latency: 240,
        metrics: {
          ...prev.s3.metrics,
          bandwidth: "142.5 MB/s",
          assetCount: "25,310 files"
        }
      }
    }));

    setTimeout(() => {
      setServices(prev => ({
        ...prev,
        s3: {
          ...prev.s3,
          status: "nominal",
          latency: 42,
          metrics: {
            ...prev.s3.metrics,
            bandwidth: "4.8 MB/s"
          }
        }
      }));
      addLog("✅ [UPLOAD-COMPLETE] CDN edge caches successfully purged. AWS S3 metrics nominal.");
    }, 6000);
  };

  const forceSelfHeal = () => {
    addLog("🛠️ [MANUAL OVERRIDE] Dispatching automated self-healing kubernetes cron...");
    setServices(prev => ({
      postgres: {
        ...prev.postgres,
        status: "nominal",
        latency: 12,
        metrics: {
          ...prev.postgres.metrics,
          connections: "35/150",
          queriesPerSec: 145
        }
      },
      redis: {
        ...prev.redis,
        status: "nominal",
        latency: 0.6,
        metrics: {
          ...prev.redis.metrics,
          activeKeys: 4950,
          hitRate: "99.1%"
        }
      },
      s3: {
        ...prev.s3,
        status: "nominal",
        latency: 45,
        metrics: {
          ...prev.s3.metrics,
          bandwidth: "2.1 MB/s"
        }
      }
    }));
    addLog("🟢 [HEALED] Infrastructure returned to standard high-performance CAPS compliance.");
  };

  const getStatusIcon = (status: ServiceState["status"]) => {
    switch (status) {
      case "nominal":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />;
      case "outage":
        return <AlertTriangle className="w-4 h-4 text-rose-500 animate-ping" />;
      case "maintenance":
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadgeClass = (status: ServiceState["status"]) => {
    switch (status) {
      case "nominal":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "degraded":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse";
      case "outage":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      case "maintenance":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <div id="infra-status-root-card" className="border border-navy-100 dark:border-navy-800 rounded-2xl p-5 bg-white dark:bg-navy-900/40 space-y-6 text-left shadow-sm">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-navy-100 dark:border-navy-850 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-royal-600 dark:text-gold-400" />
            <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">
              Infrastructure SLA & Core Systems
            </h3>
          </div>
          <p className="text-[11px] text-navy-500 dark:text-navy-400">
            Real-time server connectivity telemetry for Amaris LMS databases and block media buckets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-navy-400">
            {lastRefreshed}
          </span>
          <button
            onClick={downloadStatusReportCSV}
            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
            title="Download Status Report CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Status CSV</span>
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-300 rounded-lg border border-navy-200 dark:border-navy-700 transition-colors cursor-pointer"
            title="Probe status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main SLA stats and Historical Graph */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Metric circle */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-navy-50/40 dark:bg-navy-950/20 rounded-2xl border border-navy-100 dark:border-navy-850/60 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] px-2 py-0.5 rounded-bl font-black uppercase tracking-wider">
            SLA Met
          </div>

          <span className="text-[9px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase tracking-widest block mb-1">
            Global Live Availability
          </span>

          <div className="flex items-baseline justify-center gap-0.5 text-3xl font-black text-navy-900 dark:text-white font-sans">
            {globalSla}%
          </div>

          <div className="flex items-center gap-1 mt-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              All Systems Nominal
            </span>
          </div>

          <div className="w-full mt-4 bg-navy-150 dark:bg-navy-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${globalSla}%` }}
            />
          </div>
        </div>

        {/* Mini 7-day bar chart */}
        <div className="md:col-span-7 space-y-2 p-3 bg-navy-50/20 dark:bg-navy-950/10 border border-navy-100/50 dark:border-navy-850/30 rounded-2xl">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-mono font-bold text-navy-400">7-Day Outage Tracking</span>
            <span className="text-[9px] text-royal-600 dark:text-gold-400 font-mono font-black">CAPS/IEB LMS</span>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={UPTIME_HISTORY} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <Tooltip 
                  contentStyle={{ fontSize: 9, background: "#0c1524", border: "none", color: "#fff", borderRadius: 6 }} 
                  formatter={(value) => [`${value}% Uptime`]}
                />
                <Bar dataKey="uptime" radius={[4, 4, 0, 0]}>
                  {UPTIME_HISTORY.map((entry, index) => {
                    const color = entry.uptime >= 99.98 ? "#10b981" : "#f59e0b";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Services status list */}
      <div className="space-y-3">
        {Object.entries(services).map(([key, svc]) => {
          return (
            <div 
              key={key}
              className="p-3 bg-navy-50/20 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-850 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-navy-200 dark:hover:border-navy-750"
            >
              {/* Left Column: Name & Status */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-royal-100/40 dark:bg-navy-800 text-royal-600 dark:text-gold-400 rounded-lg">
                  {key === "postgres" && <Database className="w-4 h-4" />}
                  {key === "redis" && <Cpu className="w-4 h-4" />}
                  {key === "s3" && <HardDrive className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-navy-800 dark:text-navy-100 block">
                    {svc.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-navy-400">
                      Uptime: <strong className="text-navy-600 dark:text-navy-300">{svc.uptime}%</strong>
                    </span>
                    <span className="text-navy-300 dark:text-navy-700">•</span>
                    <span className="text-[10px] font-mono text-navy-400">
                      Latency: <strong className="text-royal-500">{svc.latency} ms</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Details & Status Badge */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-navy-100 dark:border-navy-850 pt-2 sm:pt-0">
                <div className="flex gap-3 text-right">
                  {Object.entries(svc.metrics).map(([metricName, val]) => (
                    <div key={metricName} className="space-y-0.5">
                      <span className="text-[8px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase block">
                        {metricName.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-[10px] font-mono font-black text-navy-700 dark:text-navy-300 block">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${getStatusBadgeClass(svc.status)}`}>
                    {getStatusIcon(svc.status)}
                    <span>{svc.status === "nominal" ? "Online" : svc.status}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Actions */}
      <div className="border-t border-navy-150 dark:border-navy-800/80 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-navy-400" />
            <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">
              AIOps Simulation Console
            </span>
          </div>
          <button
            onClick={forceSelfHeal}
            className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Force Self-Heal</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={simulateLoadSpike}
            className="px-2 py-1.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9.5px] font-black rounded-lg transition-all cursor-pointer text-center"
          >
            PostgreSQL Stress
          </button>
          <button
            onClick={simulateRedisFlush}
            className="px-2 py-1.5 bg-royal-500/5 hover:bg-royal-500/10 border border-royal-500/10 hover:border-royal-500/20 text-royal-600 dark:text-royal-400 text-[9.5px] font-black rounded-lg transition-all cursor-pointer text-center"
          >
            Flush Cache
          </button>
          <button
            onClick={simulateS3UploadSpike}
            className="px-2 py-1.5 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 hover:border-purple-500/20 text-purple-600 dark:text-purple-400 text-[9.5px] font-black rounded-lg transition-all cursor-pointer text-center"
          >
            S3 Upload Wave
          </button>
        </div>

        {/* Live Simulation Terminal Console */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 font-mono text-[9px] text-slate-400 shadow-inner max-h-24 overflow-y-auto space-y-1 scrollbar-thin">
          {simulationLog.length === 0 ? (
            <div className="text-slate-600 italic">No telemetry operations logged in terminal.</div>
          ) : (
            simulationLog.map((log, index) => (
              <div key={index} className="leading-relaxed whitespace-pre-wrap">
                {log.includes("[HEALED]") || log.includes("[AUTO-HEAL]") ? (
                  <span className="text-emerald-400">{log}</span>
                ) : log.includes("[SIMULATION]") ? (
                  <span className="text-amber-400">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
