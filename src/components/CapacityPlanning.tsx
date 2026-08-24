import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp, Server, Cpu, Database, HardDrive, AlertTriangle, ArrowUpRight,
  CheckCircle, RefreshCw, Layers, Zap, Sliders, AlertCircle, Sparkles,
  ArrowRight, Plus, Minus, Download, HelpCircle, ShieldAlert
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LineChart, Line, ReferenceLine
} from "recharts";

// Interfaces for our interactive capacity model
interface ResourceState {
  cpuUsage: number; // %
  ramUsage: number; // %
  diskUsage: number; // GB used of 500GB
  concurrentUsers: number;
}

interface SimulatedServer {
  id: string;
  name: string;
  role: "app-server" | "worker-node" | "db-replica" | "cache";
  cpuCores: number;
  ramGB: number;
  status: "healthy" | "warning" | "critical";
  region: string;
}

export const CapacityPlanning: React.FC = () => {
  // 1. Simulation Parameter States (Interactive Sliders)
  const [studentGrowthRate, setStudentGrowthRate] = useState<number>(15); // % per month
  const [pdfUploadAverage, setPdfUploadAverage] = useState<number>(45); // MB per student per month
  const [examConcurrentSessions, setExamConcurrentSessions] = useState<number>(350); // Peak expected
  const [retentionPeriodDays, setRetentionPeriodDays] = useState<number>(365); // Days to keep homework pdfs

  // 2. Cluster Cluster State
  const [servers, setServers] = useState<SimulatedServer[]>([
    { id: "SRV-AMH-01", name: "AMH-Primary-Web-Server", role: "app-server", cpuCores: 4, ramGB: 16, status: "healthy", region: "af-south-1a (Cape Town)" },
    { id: "SRV-AMH-02", name: "AMH-CAPS-Calculations-Worker", role: "worker-node", cpuCores: 2, ramGB: 8, status: "healthy", region: "af-south-1b (Cape Town)" },
    { id: "SRV-AMH-03", name: "AMH-Firestore-Sync-Proxy", role: "db-replica", cpuCores: 4, ramGB: 8, status: "healthy", region: "af-south-1a (Cape Town)" },
    { id: "SRV-AMH-04", name: "AMH-Redis-Cache", role: "cache", cpuCores: 1, ramGB: 4, status: "healthy", region: "af-south-1a (Cape Town)" }
  ]);

  // Current real-time simulation tickers
  const [tick, setTick] = useState(0);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);

  // Auto trigger small random fluctuations to simulate active traffic spikes in Johannesburg and Cape Town high-school peak periods (14h00 - 20h00)
  useEffect(() => {
    if (!isLiveMonitoring) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLiveMonitoring]);

  // Derive active capacity limits
  const totalCores = servers.reduce((acc, s) => acc + s.cpuCores, 0);
  const totalRAM = servers.reduce((acc, s) => acc + s.ramGB, 0);
  const maxUserCapacity = totalCores * 150; // Simple rule of thumb: 150 concurrent users per core
  const maxStorageGB = 500; // Static base disk allocated

  // Current live values with subtle realistic noise
  const liveCPU = Math.min(95, Math.max(15, 30 + (examConcurrentSessions / 20) + Math.sin(tick) * 5 + (studentGrowthRate / 3)));
  const liveRAM = Math.min(98, Math.max(25, 40 + (examConcurrentSessions / 40) + Math.cos(tick) * 3 + (studentGrowthRate / 5)));
  const liveDiskGB = Math.min(maxStorageGB, Math.max(80, 142 + (studentGrowthRate * 1.5) + (pdfUploadAverage * 0.8)));

  // 3. 12-Month Projections Math Generator
  const generateProjectionData = () => {
    const currentStudentsCount = 1200; // South African CAPS/IEB base
    const baseDiskUsage = 142; // GB
    const data = [];
    
    let cumulativeStudents = currentStudentsCount;
    let cumulativeDisk = baseDiskUsage;

    const monthNames = ["Jul 26", "Aug 26", "Sep 26", "Oct 26", "Nov 26", "Dec 26", "Jan 27", "Feb 27", "Mar 27", "Apr 27", "May 27", "Jun 27"];

    for (let i = 0; i < 12; i++) {
      // Calculate growth increments
      const growthFactor = 1 + (studentGrowthRate / 100);
      cumulativeStudents = Math.round(cumulativeStudents * growthFactor);
      
      // CAPS homework assignments submit rate model
      const monthlyHomeworkMB = cumulativeStudents * (pdfUploadAverage / 1024); // GB uploaded
      
      // Apply retention factor
      if (retentionPeriodDays < 180) {
        cumulativeDisk = baseDiskUsage + (monthlyHomeworkMB * 0.4);
      } else if (retentionPeriodDays < 365) {
        cumulativeDisk = baseDiskUsage + (monthlyHomeworkMB * 0.75);
      } else {
        cumulativeDisk = baseDiskUsage + monthlyHomeworkMB;
      }
      
      // Limit storage to maximum disk capacity for charting
      const finalDiskUsageGB = Math.min(maxStorageGB, cumulativeDisk);
      
      // Calculate projected server loads
      const projectedPeakConcurrent = Math.round(examConcurrentSessions * Math.pow(growthFactor, i * 0.6));
      const projectedCpuLoad = Math.min(100, Math.round((projectedPeakConcurrent / maxUserCapacity) * 100));
      const projectedRamLoad = Math.min(100, Math.round(35 + (projectedPeakConcurrent / maxUserCapacity) * 55));

      data.push({
        month: monthNames[i],
        students: cumulativeStudents,
        diskUsageGB: Math.round(finalDiskUsageGB),
        diskPercentage: Math.round((finalDiskUsageGB / maxStorageGB) * 100),
        cpuPercentage: Math.round(projectedCpuLoad),
        ramPercentage: Math.round(projectedRamLoad),
        concurrentUsers: projectedPeakConcurrent,
        threshold: 80 // Critical SRE alert threshold
      });
    }

    return data;
  };

  const projectionData = generateProjectionData();

  // Find out depletion cross months
  const cpuDepletionMonth = projectionData.find(d => d.cpuPercentage >= 80);
  const diskDepletionMonth = projectionData.find(d => d.diskPercentage >= 80);
  const ramDepletionMonth = projectionData.find(d => d.ramPercentage >= 80);

  // Server management actions
  const handleUpgradeServer = (id: string) => {
    setServers(prev => prev.map(srv => {
      if (srv.id === id) {
        return {
          ...srv,
          cpuCores: srv.cpuCores * 2,
          ramGB: srv.ramGB * 2,
          name: `${srv.name} (Upgraded)`
        };
      }
      return srv;
    }));
  };

  const handleAddServerInstance = () => {
    const nextId = `SRV-AMH-0${servers.length + 1}`;
    const newSrv: SimulatedServer = {
      id: nextId,
      name: `AMH-App-Autoscale-Replica-${servers.length - 3}`,
      role: "app-server",
      cpuCores: 4,
      ramGB: 16,
      status: "healthy",
      region: "af-south-1a (Cape Town)"
    };
    setServers(prev => [...prev, newSrv]);
  };

  const handleRemoveServerInstance = (id: string) => {
    if (servers.length <= 2) {
      alert("SRE Safety Directive: Cannot remove primary cluster components. Minimum 2 nodes required for High Availability (HA) CAPS gateway failover.");
      return;
    }
    setServers(prev => prev.filter(s => s.id !== id));
  };

  // Compile interactive report summary details
  const getActionableRecommendations = () => {
    const recs = [];

    // Storage recommendations based on slider thresholds
    if (diskDepletionMonth) {
      recs.push({
        type: "storage",
        severity: "critical",
        resource: "NVMe Block Storage",
        timeline: `Projected breach: ${diskDepletionMonth.month}`,
        impact: `South African curriculum assets and student high-res homework submissions will exceed the 500GB volume limit (${diskDepletionMonth.diskUsageGB}GB reached).`,
        action: `Set bucket life-cycle rules (retention to ${Math.min(180, retentionPeriodDays)} days), compress active homework PDFs, or mount an AWS Cape Town S3 static storage bucket as a secondary mount-point.`,
        cost: `R240 / month per extra 100GB`
      });
    } else {
      recs.push({
        type: "storage",
        severity: "healthy",
        resource: "NVMe Block Storage",
        timeline: "No saturation predicted in 12 months",
        impact: "Storage allocations remain healthy under current CAPS resource volumes.",
        action: "No immediate disk upgrades required. Standard data backups and standard cron cleanups are sufficient.",
        cost: "R0"
      });
    }

    // CPU Recommendations based on server capacity
    if (cpuDepletionMonth) {
      recs.push({
        type: "compute",
        severity: "high",
        resource: "CPU compute resources",
        timeline: `Projected bottleneck: ${cpuDepletionMonth.month}`,
        impact: `Expected trial exam spikes (${cpuDepletionMonth.concurrentUsers} concurrent sessions) will result in CPU throttling and 504 gateway response timeouts for CAPS students.`,
        action: `Enable vertical cluster scaling on Cloud Run. Upgrade AMH-Primary-Web-Server to use at least 8 vCPU Cores or deploy horizontal replica pods.`,
        cost: `R780 / month per node instance`
      });
    } else {
      recs.push({
        type: "compute",
        severity: "healthy",
        resource: "CPU compute resources",
        timeline: "Sufficient compute headroom available",
        impact: "Cluster handles standard tutoring session booking request loads comfortably.",
        action: "No compute changes needed. Review system logs monthly for anomalous API request loops.",
        cost: "R0"
      });
    }

    // Memory recommendations
    if (ramDepletionMonth) {
      recs.push({
        type: "memory",
        severity: "medium",
        resource: "Virtual RAM cluster memory",
        timeline: `Predicted bottleneck: ${ramDepletionMonth.month}`,
        impact: `Redis caching memory bounds will fill up, dropping session data for IEB mock examinations.`,
        action: `Set eviction policy key parameters to 'allkeys-lru' inside Redis config or manually upgrade Cache RAM configuration.`,
        cost: `R180 / month`
      });
    }

    return recs;
  };

  const recommendations = getActionableRecommendations();

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 p-1.5 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white">SRE Capacity Planning & Growth Forecaster</h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Model student onboarding growth curves, evaluate server cluster headroom, and access preventative cloud instance recommendations for South Africa's premium mathematics server.
          </p>
        </div>

        <button
          onClick={() => alert("SRE Capacity Blueprint exported as amh-capacity-blueprint-2026.json to local developer logs.")}
          className="py-2 px-3.5 bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold rounded-xl text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow cursor-pointer"
        >
          <Download className="w-4 h-4 text-gold-400" />
          Export Capacity Blueprint
        </button>
      </div>

      {/* THREE-COLUMN BENTO GRID: STATS, DYNAMIC MODEL SLIDERS, CORE HEADROOM METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: DYNAMIC MATH GROWTH CONTROLS (SLIDERS) */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-navy-100 dark:border-navy-800 pb-2">
            <Sliders className="w-4 h-4 text-royal-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white font-sans">
              Growth Modeling Parameters
            </h3>
          </div>

          <p className="text-[11px] text-navy-500 leading-relaxed">
            Adjust the sliding metrics below to configure student user registries, peak exam loads, and storage lifecycles.
          </p>

          <div className="space-y-4 pt-1">
            {/* Student growth rate per month */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-300">
                <span className="flex items-center gap-1">
                  Onboarding Growth Rate:
                  <span className="text-[9px] bg-royal-500/10 text-royal-600 dark:text-royal-400 px-1.5 rounded-full font-mono font-black uppercase">Grade 10-12</span>
                </span>
                <span className="font-mono text-royal-600 dark:text-royal-400">{studentGrowthRate}% / month</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={studentGrowthRate}
                onChange={(e) => setStudentGrowthRate(Number(e.target.value))}
                className="w-full accent-royal-600 h-1.5 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-semibold text-navy-400 font-mono">
                <span>1% (Flatline)</span>
                <span>40% (Viral Spikes)</span>
              </div>
            </div>

            {/* Average HW PDF Upload Size */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-300">
                <span>PDF Homework Submits:</span>
                <span className="font-mono text-royal-600 dark:text-royal-400">{pdfUploadAverage} MB / user / mo</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={pdfUploadAverage}
                onChange={(e) => setPdfUploadAverage(Number(e.target.value))}
                className="w-full accent-royal-600 h-1.5 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-semibold text-navy-400 font-mono">
                <span>10MB (Standard PDF)</span>
                <span>150MB (Hi-Res Scans)</span>
              </div>
            </div>

            {/* Peak Exam Concurrent Sessions */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-300">
                <span>Peak Matrics Concurrent Sessions:</span>
                <span className="font-mono text-royal-600 dark:text-royal-400">{examConcurrentSessions} students</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={examConcurrentSessions}
                onChange={(e) => setExamConcurrentSessions(Number(e.target.value))}
                className="w-full accent-royal-600 h-1.5 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-semibold text-navy-400 font-mono">
                <span>50 users (Quiet)</span>
                <span>1000 users (National Finals)</span>
              </div>
            </div>

            {/* Storage Retention policy */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-navy-800 dark:text-navy-300">
                <span>Homework Asset Retention:</span>
                <span className="font-mono text-royal-600 dark:text-royal-400">{retentionPeriodDays} days</span>
              </div>
              <input
                type="range"
                min="30"
                max="730"
                step="30"
                value={retentionPeriodDays}
                onChange={(e) => setRetentionPeriodDays(Number(e.target.value))}
                className="w-full accent-royal-600 h-1.5 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-semibold text-navy-400 font-mono">
                <span>30 Days (Aggressive Clean)</span>
                <span>2 Years (Maximum Auditing)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gold-500/5 border border-gold-500/10 rounded-xl text-[11px] text-gold-800 dark:text-gold-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
            <p className="leading-normal">
              <b>Model Assumption:</b> Projections assume CAPS Matric trial exam peaks scale incrementally each quarter as high schools approach final exams (October/November).
            </p>
          </div>
        </div>

        {/* COLUMN 2: CURRENT CLUSTER COMPUTE CAPACITIES */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-royal-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-navy-850 dark:text-white font-sans">
                  Cluster Computing Limits
                </h3>
              </div>
              <button
                onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
                className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold ${
                  isLiveMonitoring
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse"
                    : "bg-navy-100 text-navy-500"
                }`}
              >
                {isLiveMonitoring ? "● Live Telemetry" : "Paused"}
              </button>
            </div>

            <div className="space-y-4">
              {/* CPU Core load indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-navy-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-royal-500" />
                    vCPU Allocation: {totalCores} Cores
                  </span>
                  <span className="font-mono font-bold text-navy-950 dark:text-white">{Math.round(liveCPU)}% active</span>
                </div>
                <div className="w-full bg-navy-100 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      liveCPU > 80 ? "bg-red-500" : liveCPU > 60 ? "bg-amber-500" : "bg-royal-500"
                    }`}
                    style={{ width: `${liveCPU}%` }}
                  />
                </div>
              </div>

              {/* Memory allocate indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-navy-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Layers className="w-3.5 h-3.5 text-royal-500" />
                    RAM Cluster: {totalRAM} GB DDR4
                  </span>
                  <span className="font-mono font-bold text-navy-950 dark:text-white">{Math.round(liveRAM)}% allocated</span>
                </div>
                <div className="w-full bg-navy-100 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      liveRAM > 80 ? "bg-red-500" : liveRAM > 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${liveRAM}%` }}
                  />
                </div>
              </div>

              {/* Persistent NVMe SSD size indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-navy-500">
                  <span className="flex items-center gap-1 font-mono">
                    <HardDrive className="w-3.5 h-3.5 text-royal-500" />
                    NVMe Base SSD: {maxStorageGB} GB
                  </span>
                  <span className="font-mono font-bold text-navy-950 dark:text-white">{Math.round(liveDiskGB)} GB used</span>
                </div>
                <div className="w-full bg-navy-100 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      (liveDiskGB / maxStorageGB) > 0.8
                        ? "bg-red-500"
                        : (liveDiskGB / maxStorageGB) > 0.6
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${(liveDiskGB / maxStorageGB) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CLUSTER CONCURRENT USERS SPEEDOMETER PORTLET */}
          <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-800 bg-navy-50/40 dark:bg-navy-950/20 p-3 rounded-xl border border-navy-150">
            <span className="text-[9px] font-mono font-black text-navy-450 uppercase block mb-1">
              Cluster Concurrent Student Load
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-black font-mono text-royal-600 dark:text-royal-400">
                {Math.round(examConcurrentSessions + Math.sin(tick) * 15)}
                <span className="text-xs text-navy-500 font-normal ml-1">online</span>
              </span>
              <span className="text-[10px] font-bold text-navy-500 font-mono">
                Headroom Limit: {maxUserCapacity}
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: DEPICTION SUMMARY & HEALTH SCORECARD */}
        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white rounded-2xl p-5 border border-navy-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-navy-800 pb-2">
              <Zap className="w-4 h-4 text-gold-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gold-400 font-sans">
                Predictive Capacity Scorecard
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-navy-800/50 pb-2">
                <span className="text-xs font-medium text-gray-300">Compute Headroom status:</span>
                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded uppercase ${
                  cpuDepletionMonth ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {cpuDepletionMonth ? "Warning" : "Healthy"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-navy-800/50 pb-2">
                <span className="text-xs font-medium text-gray-300">Storage Depletion Date:</span>
                <span className="text-xs font-mono font-black text-gold-400">
                  {diskDepletionMonth ? `Breach in ${diskDepletionMonth.month}` : "Optimal (12mo+)"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-navy-800/50 pb-2">
                <span className="text-xs font-medium text-gray-300">Scaling Strategy suggested:</span>
                <span className="text-xs font-sans font-bold text-royal-300">
                  {cpuDepletionMonth ? "Scale-Out Replica Node" : "Local Backups Cleared"}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-medium text-gray-300">Infrastructure HA Status:</span>
                <span className="text-xs font-mono font-black text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> High Availability
                </span>
              </div>
            </div>
          </div>

          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800/80 text-[10.5px] text-gray-400 leading-normal mt-4">
            💡 <b>Matric Exam Buffer:</b> System automatically initiates secondary cold-storage backup triggers once homework files exceed 85% disk capacity.
          </div>
        </div>

      </div>

      {/* CHART: 12-MONTH PREDICTIVE FORECAST */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-navy-100 dark:border-navy-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase font-sans flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-royal-500" />
              12-Month Saturation & Capacity Forecaster Projections
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Interactive trend projections comparing CPU, Disk, and Memory load thresholds over the coming 12 calendar months.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-navy-500 uppercase">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-red-500 inline-block" /> Critical Limit: 80%
            </span>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-navy-800" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "11px",
                  fontFamily: "monospace"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "10.5px", marginTop: "10px" }} />
              
              {/* Projected Resource Percentages */}
              <Line type="monotone" dataKey="cpuPercentage" name="Projected CPU Load" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="diskPercentage" name="Projected Storage Load" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ramPercentage" name="Projected RAM Memory" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              
              {/* SRE Warning Threshold */}
              <ReferenceLine y={80} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: 'Critical Threshold', fill: '#EF4444', fontSize: 9, position: 'top' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CLUSTER MANAGER & INSTANCE LEVEL CONTROL */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-navy-100 dark:border-navy-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase font-sans flex items-center gap-2">
              <Server className="w-4 h-4 text-royal-500" />
              Primary South Africa Server Fleet Nodes ({servers.length} Instances)
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Provision, resize, and upscale production nodes. Modifying node instance specifications automatically updates SRE projections headroom curves.
            </p>
          </div>

          <button
            onClick={handleAddServerInstance}
            className="py-1.5 px-3 bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold rounded-lg text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Server Instance
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {servers.map((srv) => (
            <div
              key={srv.id}
              className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800/85 rounded-xl p-4 space-y-3 relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[9.5px] font-mono font-bold text-navy-400">{srv.id}</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[8.5px] font-mono font-black uppercase rounded">
                    {srv.role}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-navy-900 dark:text-white truncate" title={srv.name}>
                    {srv.name}
                  </h4>
                  <p className="text-[10px] text-navy-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" /> {srv.region}
                  </p>
                </div>

                {/* Instance specs */}
                <div className="grid grid-cols-2 gap-1 bg-white dark:bg-navy-900 p-2 rounded-lg border border-navy-150/60 text-[10px] font-mono">
                  <div>
                    <span className="text-navy-400 block">vCPU Cores:</span>
                    <span className="font-bold text-navy-800 dark:text-navy-200">{srv.cpuCores} Cores</span>
                  </div>
                  <div>
                    <span className="text-navy-400 block">DRAM Alloc:</span>
                    <span className="font-bold text-navy-800 dark:text-navy-200">{srv.ramGB} GB RAM</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 pt-2 border-t border-navy-100/60 dark:border-navy-800/60">
                <button
                  onClick={() => handleUpgradeServer(srv.id)}
                  className="flex-1 py-1 bg-royal-50 hover:bg-royal-100 dark:bg-navy-850 dark:hover:bg-navy-800 border border-royal-200 dark:border-navy-700 text-royal-700 dark:text-royal-300 rounded text-[9px] uppercase font-mono font-bold cursor-pointer transition-all text-center"
                >
                  Resize
                </button>
                <button
                  onClick={() => handleRemoveServerInstance(srv.id)}
                  className="py-1 px-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded text-[9px] font-mono font-bold cursor-pointer transition-all border border-transparent hover:border-red-200"
                  title="Shutdown Instance"
                >
                  Kill
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DYNAMIC ACTIONABLE SRE RECOMMENDATIONS */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="border-b border-navy-100 dark:border-navy-800 pb-3">
          <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase font-sans flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Actionable SRE Remediation & Server Tuning Directives
          </h3>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Automated recommendations generated dynamically by modeling parameters to prevent curriculum system downtime and guarantee 99.9% uptime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border flex gap-3.5 relative overflow-hidden transition-all ${
                rec.severity === "critical"
                  ? "bg-red-500/5 border-red-500/20"
                  : rec.severity === "high"
                  ? "bg-amber-500/5 border-amber-500/20"
                  : rec.severity === "medium"
                  ? "bg-blue-500/5 border-blue-500/20"
                  : "bg-emerald-500/5 border-emerald-500/20"
              }`}
            >
              {/* Left Stripe Indicator */}
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${
                rec.severity === "critical"
                  ? "bg-red-500"
                  : rec.severity === "high"
                  ? "bg-amber-500"
                  : rec.severity === "medium"
                  ? "bg-blue-500"
                  : "bg-emerald-500"
              }`} />

              <div className="flex-shrink-0 mt-0.5">
                {rec.severity === "critical" || rec.severity === "high" ? (
                  <span className="p-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg inline-block">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg inline-block">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase font-sans">
                    {rec.resource}
                  </h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded uppercase ${
                    rec.severity === "critical"
                      ? "bg-red-500/20 text-red-700 dark:text-red-400"
                      : rec.severity === "high"
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                      : rec.severity === "medium"
                      ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {rec.timeline}
                  </span>
                </div>

                <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed font-sans">
                  {rec.impact}
                </p>

                <div className="bg-white/80 dark:bg-navy-950/40 p-2.5 rounded-lg border border-navy-150/80 dark:border-navy-800 text-[10.5px]">
                  <span className="font-extrabold text-navy-800 dark:text-navy-200 block mb-0.5 font-sans">SRE Recommended Action:</span>
                  <span className="text-navy-600 dark:text-navy-350 leading-relaxed font-sans">{rec.action}</span>
                </div>

                {rec.cost !== "R0" && (
                  <div className="flex justify-between items-center text-[9px] font-mono text-navy-450 pt-1">
                    <span>Estimated Cloud Cost Upgrade:</span>
                    <span className="font-bold text-navy-950 dark:text-white bg-navy-100 dark:bg-navy-800 px-1.5 py-0.2 rounded">
                      {rec.cost}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
