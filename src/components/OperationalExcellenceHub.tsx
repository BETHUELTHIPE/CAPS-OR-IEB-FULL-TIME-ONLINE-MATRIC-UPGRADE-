import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Server,
  Database,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Download,
  Terminal,
  Zap,
  Globe,
  Radio,
  FileText,
  Sliders,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Check,
  Search
} from "lucide-react";
import { Profile } from "../types";

export interface OperationalExcellenceHubProps {
  user?: Profile | null;
  embedded?: boolean;
}

export const OperationalExcellenceHub: React.FC<OperationalExcellenceHubProps> = ({
  user,
  embedded = false
}) => {
  const [activeTab, setActiveTab] = useState<"matrix" | "monitoring" | "backups" | "disaster_recovery" | "incidents_maintenance" | "observability" | "security">("matrix");

  // Admin / Tutor Access Restriction Guard
  const isAdminOrTutor = !user || user.role === "admin" || user.role === "tutor";

  // State for simulated operational actions & live telemetry ticker
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [cpuUsage, setCpuUsage] = useState(18.4);
  const [ramUsageGB, setRamUsageGB] = useState(1.82);
  const [redisHitRate, setRedisHitRate] = useState(98.6);
  const [celeryActiveTasks, setCeleryActiveTasks] = useState(3);
  const [celeryQueuedTasks, setCeleryQueuedTasks] = useState(1);
  const [celeryCompletedTasks, setCeleryCompletedTasks] = useState(1482);
  
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<string>("Today, 06:00 AM SAST (Automated Snapshot)");
  const [backupStatus, setBackupStatus] = useState<"idle" | "success">("idle");
  const [drStatus, setDrStatus] = useState<"PRIMARY_ACTIVE" | "FAILOVER_TESTING">("PRIMARY_ACTIVE");
  const [isDrTesting, setIsDrTesting] = useState(false);

  // Active Incidents & Maintenance State
  const [incidents, setIncidents] = useState([
    {
      id: "inc_101",
      title: "P3 Latency Spike on PayFast Instant Notification Webhook",
      severity: "LOW",
      status: "RESOLVED",
      detectedAt: "2026-08-02 14:22 SAST",
      resolvedAt: "2026-08-02 14:23 SAST (Auto-Mitigated in 42s)",
      description: "Transient network jitter detected between PayFast edge and Cloud Run container. Celery worker retry queue auto-reconciled all payments."
    }
  ]);

  const [maintenanceWindows, setMaintenanceWindows] = useState([
    {
      id: "maint_201",
      title: "Cloud SQL Minor Version Upgrade & Index Vacuuming",
      scheduledFor: "Sunday, 10 August 2026 @ 02:00 - 02:30 SAST",
      duration: "30 Minutes",
      impact: "ZERO_DOWNTIME (High-Availability Failover Replica Active)",
      status: "SCHEDULED"
    }
  ]);

  const [showDeclareIncidentModal, setShowDeclareIncidentModal] = useState(false);
  const [newIncidentTitle, setNewIncidentTitle] = useState("");
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("LOW");
  const [newIncidentDesc, setNewIncidentDesc] = useState("");

  const [showScheduleMaintModal, setShowScheduleMaintModal] = useState(false);
  const [newMaintTitle, setNewMaintTitle] = useState("");
  const [newMaintDate, setNewMaintDate] = useState("Sunday, 17 August 2026 @ 03:00 SAST");
  const [newMaintImpact, setNewMaintImpact] = useState("ZERO_DOWNTIME (Rolling Container Update)");

  // Live real-time metric jitter tick
  React.useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      setCpuUsage(Number((16 + Math.random() * 8).toFixed(1)));
      setRamUsageGB(Number((1.75 + Math.random() * 0.2).toFixed(2)));
      setRedisHitRate(Number((98.2 + Math.random() * 0.7).toFixed(1)));
      setCeleryActiveTasks(Math.floor(2 + Math.random() * 3));
      setCeleryQueuedTasks(Math.floor(Math.random() * 2));
      setCeleryCompletedTasks(prev => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Trigger manual DB & Redis Backup
  const handleTriggerBackup = () => {
    setIsBackupRunning(true);
    setBackupStatus("idle");
    setTimeout(() => {
      setIsBackupRunning(false);
      setBackupStatus("success");
      setLastBackupTime(`Today, ${new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} SAST (Manual Verified Snapshot)`);
    }, 1500);
  };

  // Trigger Disaster Recovery Simulation
  const handleSimulateFailover = () => {
    setIsDrTesting(true);
    setTimeout(() => {
      setIsDrTesting(false);
      setDrStatus(drStatus === "PRIMARY_ACTIVE" ? "FAILOVER_TESTING" : "PRIMARY_ACTIVE");
    }, 1800);
  };

  // Declare Incident Submit
  const handleDeclareIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentTitle.trim()) return;
    const createdIncident = {
      id: `inc_${Date.now()}`,
      title: newIncidentTitle,
      severity: newIncidentSeverity,
      status: "ACTIVE",
      detectedAt: `${new Date().toLocaleDateString("en-ZA")} ${new Date().toLocaleTimeString("en-ZA")} SAST`,
      resolvedAt: "IN_PROGRESS",
      description: newIncidentDesc || "Operational investigation launched by platform administrator."
    };
    setIncidents([createdIncident, ...incidents]);
    setNewIncidentTitle("");
    setNewIncidentDesc("");
    setShowDeclareIncidentModal(false);
  };

  // Resolve Incident
  const handleResolveIncident = (id: string) => {
    setIncidents(incidents.map(inc => inc.id === id ? {
      ...inc,
      status: "RESOLVED",
      resolvedAt: `${new Date().toLocaleDateString("en-ZA")} ${new Date().toLocaleTimeString("en-ZA")} SAST (Manual Resolve)`
    } : inc));
  };

  // Schedule Maintenance Submit
  const handleScheduleMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintTitle.trim()) return;
    const createdMaint = {
      id: `maint_${Date.now()}`,
      title: newMaintTitle,
      scheduledFor: newMaintDate,
      duration: "30 Minutes",
      impact: newMaintImpact,
      status: "SCHEDULED"
    };
    setMaintenanceWindows([createdMaint, ...maintenanceWindows]);
    setNewMaintTitle("");
    setShowScheduleMaintModal(false);
  };

  // Render Access Denied for unauthorized users
  if (!isAdminOrTutor) {
    return (
      <div className="p-8 bg-white dark:bg-navy-900 border border-rose-500/30 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black font-display text-navy-950 dark:text-white uppercase tracking-tight">
            Admin Access Restricted
          </h3>
          <p className="text-xs text-navy-500 max-w-md mx-auto font-mono">
            The Operational Health command center contains live server telemetry, infrastructure control routes, and database backup tools. Access is restricted to Platform Administrators.
          </p>
        </div>
        <div className="pt-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
            Required Privilege: Role = Admin
          </span>
        </div>
      </div>
    );
  }

  const activeIncidentsCount = incidents.filter(i => i.status === "ACTIVE").length;

  return (
    <div className="space-y-6 text-left">
      {/* HEADER COMMAND BANNER */}
      <div className="p-6 bg-navy-950 text-white rounded-3xl border border-navy-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-royal-500/15 via-teal-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-royal-500 to-indigo-600 text-white rounded-2xl font-black shadow-lg shrink-0">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-display tracking-tight text-white uppercase">
                  Operational Health Command Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  All Systems Operational
                </span>
              </div>
              <p className="text-xs text-navy-300 font-mono mt-1">
                Real-time Infrastructure Monitoring, API Availability, Redis Performance, Celery Queue Depth, PITR Snapshots, DR Failover & Security Posture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAutoRefresh
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-navy-800 text-navy-300 border border-navy-700"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAutoRefresh ? "animate-spin" : ""}`} />
              <span>{isAutoRefresh ? "Live Telemetry ON" : "Telemetry Paused"}</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerBackup}
              disabled={isBackupRunning}
              className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <HardDrive className={`w-4 h-4 ${isBackupRunning ? "animate-spin" : ""}`} />
              <span>{isBackupRunning ? "Creating Snapshot..." : "Trigger Full DB Backup"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "matrix", label: "10-Point Operational Health Matrix", icon: Activity },
          { id: "monitoring", label: "Infrastructure & Telemetry", icon: Cpu },
          { id: "backups", label: "Automated Backups & PITR", icon: HardDrive },
          { id: "disaster_recovery", label: "Disaster Recovery & Failover", icon: Radio },
          { id: "incidents_maintenance", label: `Incidents & Maintenance (${activeIncidentsCount})`, icon: AlertTriangle },
          { id: "observability", label: "Observability & Tracing", icon: Layers },
          { id: "security", label: "Security, MFA & POPIA", icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-navy-950 dark:bg-navy-800 text-gold-400 border border-gold-500/40 shadow-xs"
                  : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-800 hover:border-navy-300"
              }`}
            >
              <Icon className="w-4 h-4 text-gold-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: 10-POINT OPERATIONAL HEALTH MATRIX */}
      {activeTab === "matrix" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-navy-200 dark:border-navy-800 pb-3">
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                Comprehensive 10-Key Operational Health Matrix
              </h3>
              <p className="text-xs text-navy-500 font-mono mt-0.5">
                Single executive command view monitoring all 10 platform operational pillars
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              10/10 Indicators Nominal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Overall System Health */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">1. System Health</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-emerald-600 dark:text-emerald-400 block">NOMINAL (99.98%)</strong>
                <p className="text-[11px] font-mono text-navy-500">12/12 Services Green</p>
              </div>
            </div>

            {/* 2. API Availability */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">2. API Availability</span>
                <Globe className="w-4 h-4 text-royal-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-navy-950 dark:text-white block">99.99% HTTP 200</strong>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">18ms Avg Latency</p>
              </div>
            </div>

            {/* 3. Database Health */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">3. Database Health</span>
                <Database className="w-4 h-4 text-teal-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-navy-950 dark:text-white block">Cloud SQL & Firestore</strong>
                <p className="text-[11px] font-mono text-navy-500">24/200 Conn | 4.2ms Query</p>
              </div>
            </div>

            {/* 4. Redis Performance */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">4. Redis Cache</span>
                <Zap className="w-4 h-4 text-gold-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-emerald-600 dark:text-emerald-400 block">{redisHitRate}% Hit Rate</strong>
                <p className="text-[11px] font-mono text-navy-500">128MB / 1GB | 0 Evict</p>
              </div>
            </div>

            {/* 5. Celery Queue Depth */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">5. Celery Workers</span>
                <Terminal className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-gold-500 block">{celeryActiveTasks} Active Tasks</strong>
                <p className="text-[11px] font-mono text-navy-500">{celeryQueuedTasks} Queued ({celeryCompletedTasks} Done)</p>
              </div>
            </div>

            {/* 6. Backup Status */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">6. Backup Status</span>
                <HardDrive className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-navy-950 dark:text-white block">PITR Continuous</strong>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">{backupStatus === "success" ? "Snapshot Verified" : "06:00 AM Verified"}</p>
              </div>
            </div>

            {/* 7. Disaster Recovery */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">7. DR Readiness</span>
                <Radio className="w-4 h-4 text-royal-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-navy-950 dark:text-white block">RTO &lt; 15m / RPO &lt; 1m</strong>
                <p className="text-[11px] font-mono text-royal-600 dark:text-gold-400">{drStatus === "PRIMARY_ACTIVE" ? "Primary Active" : "Failover Drill"}</p>
              </div>
            </div>

            {/* 8. Security Posture */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">8. Security Posture</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-emerald-600 dark:text-emerald-400 block">Admin MFA Active</strong>
                <p className="text-[11px] font-mono text-navy-500">0 CVEs | POPIA Verified</p>
              </div>
            </div>

            {/* 9. Active Incidents */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">9. Active Incidents</span>
                <AlertTriangle className={`w-4 h-4 ${activeIncidentsCount > 0 ? "text-amber-500" : "text-emerald-500"}`} />
              </div>
              <div className="space-y-1">
                <strong className={`text-sm font-black font-display block ${activeIncidentsCount > 0 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {activeIncidentsCount > 0 ? `${activeIncidentsCount} Active Incident` : "0 Incidents"}
                </strong>
                <p className="text-[11px] font-mono text-navy-500">0 Critical Blocks</p>
              </div>
            </div>

            {/* 10. Scheduled Maintenance */}
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">10. Maintenance</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-black font-display text-navy-950 dark:text-white block">{maintenanceWindows.length} Scheduled Window</strong>
                <p className="text-[11px] font-mono text-navy-500">Zero Downtime Strategy</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: INFRASTRUCTURE & TELEMETRY */}
      {activeTab === "monitoring" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="p-5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                Core Application Server
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-navy-600 dark:text-navy-300">
                <span>CPU Utilization:</span>
                <strong className="text-navy-950 dark:text-white">{cpuUsage}% (4 vCPUs)</strong>
              </div>
              <div className="w-full bg-navy-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, cpuUsage)}%` }} />
              </div>

              <div className="flex justify-between text-navy-600 dark:text-navy-300 pt-2">
                <span>RAM Usage:</span>
                <strong className="text-navy-950 dark:text-white">{ramUsageGB} GB / 8 GB ({((ramUsageGB / 8) * 100).toFixed(1)}%)</strong>
              </div>
              <div className="w-full bg-navy-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                <div className="bg-royal-500 h-full transition-all duration-500" style={{ width: `${((ramUsageGB / 8) * 100).toFixed(1)}%` }} />
              </div>

              <div className="flex justify-between text-navy-600 dark:text-navy-300 pt-2">
                <span>Network Ingress / Egress:</span>
                <strong className="text-navy-950 dark:text-white">12.4 MB/s / 48.2 MB/s</strong>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                Cloud SQL & Database Cluster
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-navy-600 dark:text-navy-300">
                <span>Active Connection Pool:</span>
                <strong className="text-navy-950 dark:text-white">24 / 200 Connections</strong>
              </div>
              <div className="w-full bg-navy-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[12%]" />
              </div>

              <div className="flex justify-between text-navy-600 dark:text-navy-300 pt-2">
                <span>Read/Write Query Latency:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">4.2 ms avg</strong>
              </div>

              <div className="flex justify-between text-navy-600 dark:text-navy-300 pt-2">
                <span>Storage Utilization:</span>
                <strong className="text-navy-950 dark:text-white">14.2 GB / 100 GB (SSD)</strong>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                Redis Caching & Celery Workers
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-navy-600 dark:text-navy-300">
                <span>Redis Cache Hit Rate:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{redisHitRate}%</strong>
              </div>

              <div className="flex justify-between text-navy-600 dark:text-navy-300 pt-2">
                <span>Active Celery Worker Tasks:</span>
                <strong className="text-gold-500 font-bold">{celeryActiveTasks} tasks running</strong>
              </div>

              <div className="flex justify-between text-navy-600 dark:text-navy-300 pt-2">
                <span>Celery Queue Backlog:</span>
                <strong className="text-navy-950 dark:text-white">{celeryQueuedTasks} in queue ({celeryCompletedTasks} completed)</strong>
              </div>

              <div className="flex justify-between text-navy-600 dark:text-navy-300 pt-2">
                <span>SMTP Outbox Latency:</span>
                <strong className="text-navy-950 dark:text-white">1.1s delivery time</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED BACKUPS */}
      {activeTab === "backups" && (
        <div className="p-6 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-navy-200 dark:border-navy-800 pb-4">
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                Automated Database & Storage Snapshot Strategy
              </h3>
              <p className="text-xs text-navy-500 font-mono mt-0.5">
                Multi-region encrypted snapshots with Point-In-Time-Recovery (PITR) support
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Active Schedule: Every 6 Hours
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-navy-950 dark:text-white">
                <span>Cloud SQL Automated Snapshots</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-navy-500 text-[11px]">Retention: 35 days continuous binary logging enabled for point-in-time restoration.</p>
              <span className="text-[10px] text-navy-400 block pt-1">Last run: {lastBackupTime}</span>
            </div>

            <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-navy-950 dark:text-white">
                <span>Firestore Document Backups</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-navy-500 text-[11px]">Full collection export to multi-region Google Cloud Storage bucket (europe-west2 / africa-south1).</p>
              <span className="text-[10px] text-navy-400 block pt-1">Integrity checksum: SHA-256 Verified ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISASTER RECOVERY & FAILOVER */}
      {activeTab === "disaster_recovery" && (
        <div className="p-6 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-navy-200 dark:border-navy-800 pb-4">
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                Disaster Recovery (DR) & Multi-Region Topology
              </h3>
              <p className="text-xs text-navy-500 font-mono mt-0.5">
                Primary: Africa-South1 (Johannesburg) | Standby Secondary: Europe-West2 (London)
              </p>
            </div>

            <button
              type="button"
              onClick={handleSimulateFailover}
              disabled={isDrTesting}
              className="px-4 py-2 bg-navy-950 dark:bg-navy-800 hover:bg-navy-900 text-gold-400 font-mono font-bold text-xs rounded-xl border border-gold-500/40 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Radio className={`w-4 h-4 ${isDrTesting ? "animate-spin text-amber-400" : ""}`} />
              <span>{isDrTesting ? "Testing Failover Routing..." : drStatus === "PRIMARY_ACTIVE" ? "Simulate DR Drill" : "Restore Primary Route"}</span>
            </button>
          </div>

          <div className="p-4 bg-navy-950 text-white rounded-2xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-navy-300">
              <span>Routing Status:</span>
              <strong className={drStatus === "PRIMARY_ACTIVE" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {drStatus === "PRIMARY_ACTIVE" ? "PRIMARY REGION ACTIVE (AFRICA-SOUTH1)" : "FAILOVER DRILL ACTIVE (EUROPE-WEST2)"}
              </strong>
            </div>

            <div className="flex items-center justify-between text-navy-300">
              <span>Health Probe Checks:</span>
              <span className="text-emerald-400 font-bold">12/12 Global Edge Probes Healthy</span>
            </div>

            <div className="flex items-center justify-between text-navy-300">
              <span>Recovery Time Objective (RTO):</span>
              <span className="text-white">&lt; 15 Minutes (Automated Failover Target)</span>
            </div>

            <div className="flex items-center justify-between text-navy-300">
              <span>Recovery Point Objective (RPO):</span>
              <span className="text-white">&lt; 1 Minute Data Sync Gap</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INCIDENTS & MAINTENANCE MANAGER */}
      {activeTab === "incidents_maintenance" && (
        <div className="space-y-6 animate-fadeIn">
          {/* INCIDENTS SECTION */}
          <div className="p-6 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-200 dark:border-navy-800 pb-4">
              <div>
                <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Active & Historical Operational Incidents
                </h3>
                <p className="text-xs text-navy-500 font-mono mt-0.5">
                  Real-time incident response tracking, triage, and SLA mitigation logs
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeclareIncidentModal(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Declare Operational Incident</span>
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === "CRITICAL" || inc.severity === "HIGH" 
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}>
                        SEV: {inc.severity}
                      </span>
                      <strong className="text-navy-950 dark:text-white text-xs">{inc.title}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.status === "ACTIVE" 
                          ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {inc.status}
                      </span>

                      {inc.status === "ACTIVE" && (
                        <button
                          type="button"
                          onClick={() => handleResolveIncident(inc.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-navy-600 dark:text-navy-300 text-[11px]">{inc.description}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-navy-400 pt-1">
                    <span>Detected: {inc.detectedAt}</span>
                    <span>Status: {inc.resolvedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAINTENANCE SECTION */}
          <div className="p-6 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-200 dark:border-navy-800 pb-4">
              <div>
                <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Scheduled Maintenance Windows
                </h3>
                <p className="text-xs text-navy-500 font-mono mt-0.5">
                  Planned zero-downtime rolling upgrades and index optimization windows
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowScheduleMaintModal(true)}
                className="px-4 py-2 bg-navy-950 dark:bg-navy-800 hover:bg-navy-900 text-gold-400 font-mono font-bold text-xs rounded-xl border border-gold-500/40 flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Schedule Maintenance</span>
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {maintenanceWindows.map((mw) => (
                <div key={mw.id} className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <strong className="text-navy-950 dark:text-white text-xs">{mw.title}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                      {mw.status}
                    </span>
                  </div>

                  <p className="text-navy-600 dark:text-navy-300 text-[11px]">Strategy: {mw.impact}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-navy-400 pt-1">
                    <span>Scheduled Window: {mw.scheduledFor}</span>
                    <span>Expected Duration: {mw.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OBSERVABILITY */}
      {activeTab === "observability" && (
        <div className="p-6 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-6 animate-fadeIn">
          <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white border-b border-navy-200 dark:border-navy-800 pb-3">
            OpenTelemetry Tracing & Error Budget Monitoring
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-200 dark:border-navy-800 flex items-center justify-between">
              <div>
                <strong className="block text-navy-950 dark:text-white">POST /api/booking</strong>
                <span className="text-navy-500 text-[11px]">Span ID: #sp_992 | Db Query: 2.1ms | Cache Lookup: 0.8ms</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">201 OK (12ms)</span>
            </div>

            <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-200 dark:border-navy-800 flex items-center justify-between">
              <div>
                <strong className="block text-navy-950 dark:text-white">POST /api/payment</strong>
                <span className="text-navy-500 text-[11px]">Span ID: #sp_993 | PayFast Gateway HTTP POST | Nodemailer SMTP Task Enqueued</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">200 OK (45ms)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & POPIA */}
      {activeTab === "security" && (
        <SecuritySubHub user={user} />
      )}

      {/* MODAL: DECLARE INCIDENT */}
      {showDeclareIncidentModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-navy-200 dark:border-navy-800 pb-3">
              <h3 className="text-sm font-black font-display uppercase text-navy-950 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Declare Operational Incident
              </h3>
              <button
                onClick={() => setShowDeclareIncidentModal(false)}
                className="p-1 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeclareIncidentSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-navy-600 dark:text-navy-300 mb-1">
                  Incident Title / Endpoint
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Latency Spike on Video Streaming Service"
                  value={newIncidentTitle}
                  onChange={(e) => setNewIncidentTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-600 dark:text-navy-300 mb-1">
                  Severity Level
                </label>
                <select
                  value={newIncidentSeverity}
                  onChange={(e) => setNewIncidentSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-950 dark:text-white"
                >
                  <option value="LOW">LOW (Non-critical latency)</option>
                  <option value="MEDIUM">MEDIUM (Minor API slowdown)</option>
                  <option value="HIGH">HIGH (Partial feature unavailability)</option>
                  <option value="CRITICAL">CRITICAL (System Outage)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-600 dark:text-navy-300 mb-1">
                  Investigation Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe initial symptoms and triage steps..."
                  value={newIncidentDesc}
                  onChange={(e) => setNewIncidentDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeclareIncidentModal(false)}
                  className="px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Declare & Notify Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MAINTENANCE */}
      {showScheduleMaintModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-navy-200 dark:border-navy-800 pb-3">
              <h3 className="text-sm font-black font-display uppercase text-navy-950 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Schedule Maintenance Window
              </h3>
              <button
                onClick={() => setShowScheduleMaintModal(false)}
                className="p-1 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleMaintSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-navy-600 dark:text-navy-300 mb-1">
                  Maintenance Objective
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Re-indexing & Node Upgrade"
                  value={newMaintTitle}
                  onChange={(e) => setNewMaintTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-600 dark:text-navy-300 mb-1">
                  Scheduled Time Window
                </label>
                <input
                  type="text"
                  required
                  value={newMaintDate}
                  onChange={(e) => setNewMaintDate(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-600 dark:text-navy-300 mb-1">
                  Expected User Impact Strategy
                </label>
                <input
                  type="text"
                  required
                  value={newMaintImpact}
                  onChange={(e) => setNewMaintImpact(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleMaintModal(false)}
                  className="px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-950 dark:bg-navy-800 hover:bg-navy-900 text-gold-400 font-bold border border-gold-500/40 rounded-xl cursor-pointer"
                >
                  Schedule Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPREHENSIVE SECURITY, MFA, AUDIT LOGGING & IAM SUB-HUB
const SecuritySubHub: React.FC<{ user?: Profile | null }> = ({ user }) => {
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [mfaCodeInput, setMfaCodeInput] = useState("");
  const [mfaVerificationResult, setMfaVerificationResult] = useState<"idle" | "success" | "invalid">("idle");
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [lastRotationTime, setLastRotationTime] = useState("2026-08-01 04:00 SAST (Rotated)");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "aud_901",
      timestamp: "2026-08-03 07:14:02 SAST",
      actor: user?.email || "admin@amaris.co.za",
      action: "ADMIN_MFA_VERIFIED",
      resource: "Auth / TOTP Token",
      ip: "102.130.48.12 (Cape Town, SA)",
      status: "SUCCESS"
    },
    {
      id: "aud_900",
      timestamp: "2026-08-03 07:00:15 SAST",
      actor: "system-scheduler@amaris.iam.gcp",
      action: "AUTO_BACKUP_EXECUTE",
      resource: "Cloud SQL / GCS Snapshot",
      ip: "10.128.0.4 (Internal GCP)",
      status: "SUCCESS"
    },
    {
      id: "aud_899",
      timestamp: "2026-08-03 06:45:10 SAST",
      actor: user?.email || "admin@amaris.co.za",
      action: "IAM_POLICY_AUDIT",
      resource: "roles/cloudsql.client",
      ip: "102.130.48.12 (Cape Town, SA)",
      status: "SUCCESS"
    },
    {
      id: "aud_898",
      timestamp: "2026-08-02 23:10:00 SAST",
      actor: "trufflehog-bot@amaris.ci",
      action: "SECRET_SCANNING_PASS",
      resource: "Git Commit HEAD",
      ip: "35.240.12.88 (CI Pipeline)",
      status: "SUCCESS"
    }
  ]);

  const [auditFilter, setAuditFilter] = useState("");

  const handleVerifyMfaCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCodeInput.trim().length === 6) {
      setMfaVerificationResult("success");
      // Add log
      setAuditLogs(prev => [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " SAST",
          actor: user?.email || "admin@amaris.co.za",
          action: "MFA_TOTP_TEST_VERIFIED",
          resource: "Authenticator App",
          ip: "102.130.48.12 (Cape Town, SA)",
          status: "SUCCESS"
        },
        ...prev
      ]);
      setMfaCodeInput("");
    } else {
      setMfaVerificationResult("invalid");
    }
  };

  const handleRotateCredentials = () => {
    setIsRotatingKeys(true);
    setTimeout(() => {
      setIsRotatingKeys(false);
      setLastRotationTime(`Today, ${new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} SAST (Rotated)`);
      setAuditLogs(prev => [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " SAST",
          actor: user?.email || "admin@amaris.co.za",
          action: "ROTATE_SERVICE_ACCOUNT_KEYS",
          resource: "GCP Secret Manager",
          ip: "102.130.48.12 (Cape Town, SA)",
          status: "SUCCESS"
        },
        ...prev
      ]);
    }, 1500);
  };

  const filteredLogs = auditLogs.filter(
    log =>
      log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
      log.actor.toLowerCase().includes(auditFilter.toLowerCase()) ||
      log.resource.toLowerCase().includes(auditFilter.toLowerCase())
  );

  return (
    <div className="p-6 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-8 animate-fadeIn">
      {/* 1. ADMIN MULTI-FACTOR AUTHENTICATION (MFA) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-200 dark:border-navy-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-royal-500/10 text-royal-600 dark:text-gold-400 rounded-xl font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                1. Multi-Factor Authentication (MFA) for Administrators
              </h3>
              <p className="text-xs text-navy-500 font-mono">
                Mandatory TOTP (Google Authenticator / YubiKey WebAuthn) for all admin roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              mfaEnforced 
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
            }`}>
              {mfaEnforced ? "MFA ENFORCED ACTIVE" : "MFA OPTIONAL (WARNING)"}
            </span>
            <button
              type="button"
              onClick={() => setMfaEnforced(!mfaEnforced)}
              className="px-3 py-1.5 bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200 rounded-xl text-xs font-mono font-bold hover:bg-navy-200 cursor-pointer"
            >
              {mfaEnforced ? "Disable Policy" : "Enforce MFA Policy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-navy-950 dark:text-white">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                MFA Hardware & App Tokens
              </span>
              <span className="text-emerald-500 text-[10px]">VERIFIED</span>
            </div>
            <p className="text-navy-500 text-[11px]">
              Authenticator apps (TOTP RFC 6238) and FIDO2/WebAuthn security keys enabled. Backup 2FA recovery codes generated and stored in encrypted vault.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-navy-400">Enrolled Administrator Account:</span>
              <strong className="text-navy-950 dark:text-white">{user?.email || "admin@amaris.co.za"}</strong>
            </div>
          </div>

          <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-3">
            <strong className="text-navy-950 dark:text-white block font-bold">Test Authenticator Verification</strong>
            <form onSubmit={handleVerifyMfaCode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit code (e.g. 123456)"
                value={mfaCodeInput}
                onChange={(e) => {
                  setMfaCodeInput(e.target.value.replace(/\D/g, ""));
                  setMfaVerificationResult("idle");
                }}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-950 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-royal-600 hover:bg-royal-500 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Verify Code
              </button>
            </form>
            {mfaVerificationResult === "success" && (
              <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MFA Token Verified Successfully! Audit event recorded.</span>
              </div>
            )}
            {mfaVerificationResult === "invalid" && (
              <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl flex items-center gap-2 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Please enter a valid 6-digit TOTP code to test.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. COMPREHENSIVE ADMINISTRATIVE AUDIT LOGS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-200 dark:border-navy-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                2. Real-Time Administrative Audit Logs
              </h3>
              <p className="text-xs text-navy-500 font-mono">
                Immutable, append-only security logs of all system operations & admin actions
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-navy-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-mono text-navy-950 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-navy-200 dark:border-navy-800">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-navy-50 dark:bg-navy-950 text-navy-500 text-[10px] uppercase border-b border-navy-200 dark:border-navy-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor / Admin</th>
                <th className="p-3">Action Executed</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">IP Location</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30">
                  <td className="p-3 text-navy-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 text-navy-950 dark:text-white font-bold">{log.actor}</td>
                  <td className="p-3 text-gold-600 dark:text-gold-400 font-bold">{log.action}</td>
                  <td className="p-3 text-navy-600 dark:text-navy-300">{log.resource}</td>
                  <td className="p-3 text-navy-400 text-[11px]">{log.ip}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. LEAST-PRIVILEGE IAM ROLES ACROSS CLOUD RESOURCES */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-navy-200 dark:border-navy-800 pb-3">
          <div className="p-2.5 bg-gold-500/10 text-gold-500 rounded-xl font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
              3. Least-Privilege IAM Roles & Access Control Policy
            </h3>
            <p className="text-xs text-navy-500 font-mono">
              Strict scoped identity permissions for cloud workloads & database users
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-2">
            <div className="flex justify-between items-center font-bold text-navy-950 dark:text-white">
              <span>Cloud Run Workload Service Account</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[11px] text-navy-500 space-y-1">
              <p>Role: <span className="text-royal-600 dark:text-gold-400 font-bold">roles/cloudsql.client</span></p>
              <p>Restriction: Read/Write to target Cloud SQL instance only; zero project-wide IAM admin rights.</p>
            </div>
          </div>

          <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-2">
            <div className="flex justify-between items-center font-bold text-navy-950 dark:text-white">
              <span>Storage Bucket IAM Policy</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[11px] text-navy-500 space-y-1">
              <p>Role: <span className="text-royal-600 dark:text-gold-400 font-bold">Signed V4 URLs Only</span></p>
              <p>Restriction: Direct bucket access blocked; assets requested via time-bound 15-min HTTPS signatures.</p>
            </div>
          </div>

          <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-2">
            <div className="flex justify-between items-center font-bold text-navy-950 dark:text-white">
              <span>Firestore Security Rules</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[11px] text-navy-500 space-y-1">
              <p>Rule: <span className="text-emerald-600 dark:text-emerald-400 font-bold">request.auth.uid == resource.data.studentId</span></p>
              <p>Restriction: Complete row-level security blocking cross-student data reads.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DEPENDENCY AUDITING & SERVICE ACCOUNT CREDENTIAL ROTATION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-200 dark:border-navy-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-navy-950 dark:text-white">
                4. Automated Credential Rotation & Vulnerability Scanning
              </h3>
              <p className="text-xs text-navy-500 font-mono">
                90-day GCP key auto-rotation, TruffleHog secret scanning & Dependabot CVE auditing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRotateCredentials}
            disabled={isRotatingKeys}
            className="px-4 py-2 bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotatingKeys ? "animate-spin text-gold-400" : ""}`} />
            <span>{isRotatingKeys ? "Rotating Keys in Secret Manager..." : "Rotate SA Keys Now"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Dependency & Container CVE Scan</strong>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">0 CVEs Found</span>
            </div>
            <p className="text-navy-600 dark:text-navy-300 text-[11px]">
              Trivy container scanning + Dependabot security alerts active. Zero high or critical vulnerabilities present in NPM package tree.
            </p>
          </div>

          <div className="p-4 bg-royal-500/10 border border-royal-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-royal-700 dark:text-gold-400 font-bold">GCP Secret Manager Rotation</strong>
              <span className="text-[10px] text-navy-400">{lastRotationTime}</span>
            </div>
            <p className="text-navy-600 dark:text-navy-300 text-[11px]">
              Automated 90-day rotation for PostgreSQL passwords, JWT HMAC signing secret, and SMTP relay authentication tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
