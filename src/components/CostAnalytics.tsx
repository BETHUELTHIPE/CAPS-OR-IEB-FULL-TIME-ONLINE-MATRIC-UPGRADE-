import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign, BarChart3, TrendingDown, TrendingUp, RefreshCw, Zap,
  AlertTriangle, CheckCircle, Info, Layers, PieChart, Landmark,
  ShieldCheck, HelpCircle, Flame, ArrowRight, Settings, Sliders, Cpu, Database,
  Coins
} from "lucide-react";
import {
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} from "recharts";

const USD_TO_ZAR = 18.2;

// Cost Structure for calculation
interface ServiceCost {
  name: string;
  category: "Compute" | "Database" | "Caching" | "Bandwidth" | "AI / Workers" | "Storage";
  hourlyCost: number;
  monthlyCost: number;
  instanceType: string;
  status: string;
  icon: string;
  usageMetric: string;
}

export const CostAnalytics: React.FC = () => {
  // Region Selection
  const [selectedRegion, setSelectedRegion] = useState<"af-south-1" | "eu-west-1">("af-south-1");
  
  // Custom Controls to alter costs
  const [concurrencyLevel, setConcurrencyLevel] = useState<number>(3500); // active concurrent connections
  const [dbStorageGb, setDbStorageGb] = useState<number>(250); // DB storage size
  const [isClassroomRecordingActive, setIsClassroomRecordingActive] = useState<boolean>(true);

  // Cost saving toggles
  const [enableCacheOffload, setEnableCacheOffload] = useState<boolean>(true); // saves EC2 & DB costs
  const [enableOffPeakSchedule, setEnableOffPeakSchedule] = useState<boolean>(false); // drops compute after 10PM SAST
  const [useSpotInstances, setUseSpotInstances] = useState<boolean>(false); // spot EC2 reduces compute cost by 60%

  // Live noise simulation state
  const [concurrencyFluc, setConcurrencyFluc] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Random minor traffic fluctuations
      setConcurrencyFluc(Math.floor(Math.random() * 200) - 100);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeConcurrency = Math.max(100, concurrencyLevel + concurrencyFluc);

  // AWS Base rates by region (Johannesburg has standard 25% price premium over Ireland for compute)
  const regionPremium = selectedRegion === "af-south-1" ? 1.25 : 1.0;

  // Calculate costs dynamically based on parameters and optimization toggles
  const computeCosts = (): ServiceCost[] => {
    // 1. EC2 App Server compute
    let ec2BaseHourly = 0.192 * 2; // two medium instances
    if (useSpotInstances) ec2BaseHourly *= 0.4; // 60% saving
    if (enableOffPeakSchedule) ec2BaseHourly *= 0.8; // 20% aggregate scheduling savings
    if (enableCacheOffload) ec2BaseHourly *= 0.85; // 15% lower CPU load savings
    // Dynamic load multiplier
    const ec2LoadFactor = Math.max(0.8, activeConcurrency / 3500);
    const finalEc2Hourly = ec2BaseHourly * ec2LoadFactor * regionPremium;

    // 2. RDS Postgres Database
    let rdsBaseHourly = 0.350; // db.m5.large
    if (enableCacheOffload) rdsBaseHourly *= 0.75; // 25% query reduction offload
    const rdsStorageHourly = (dbStorageGb * 0.115) / 730; // JHB storage rates
    const finalRdsHourly = (rdsBaseHourly + rdsStorageHourly) * regionPremium;

    // 3. Redis Session Cache
    const redisBaseHourly = 0.068 * regionPremium; // cache.t3.medium

    // 4. Bandwidth / Ingress / Data Transfer (Estimations)
    // Concurrency directly correlates with data egress rates (GBs out)
    const gbEgressPerHour = (activeConcurrency * 0.05); // each user pulls ~50MB/hour
    const egressRateGb = selectedRegion === "af-south-1" ? 0.14 : 0.09; // JHB bandwidth is significantly more expensive
    let finalBandwidthHourly = gbEgressPerHour * egressRateGb;
    if (enableCacheOffload) finalBandwidthHourly *= 0.9; // CDN caching reduces raw server egress

    // 5. Celery AI Workers / Prediction Core
    let celeryHourly = 0.128 * regionPremium;
    if (enableOffPeakSchedule) celeryHourly *= 0.5; // shut off non-critical AI workers at night

    // 6. S3 Media & Whiteboard Vector Storage
    const storageHourly = isClassroomRecordingActive ? ((500 * 0.023) / 730) : ((50 * 0.023) / 730);

    return [
      {
        name: "EC2 Web App Servers",
        category: "Compute",
        hourlyCost: finalEc2Hourly,
        monthlyCost: finalEc2Hourly * 730,
        instanceType: useSpotInstances ? "t3.medium (Spot)" : "t3.medium (On-Demand)",
        status: "Nominal",
        icon: "Cpu",
        usageMetric: `${Math.round(activeConcurrency / 1200)} active task instances`
      },
      {
        name: "RDS PostgreSQL Database",
        category: "Database",
        hourlyCost: finalRdsHourly,
        monthlyCost: finalRdsHourly * 730,
        instanceType: "db.m5.large (Multi-AZ)",
        status: "Active",
        icon: "Database",
        usageMetric: `${dbStorageGb} GB Solid-State Provisioned`
      },
      {
        name: "ElastiCache Redis",
        category: "Caching",
        hourlyCost: redisBaseHourly,
        monthlyCost: redisBaseHourly * 730,
        instanceType: "cache.t3.medium",
        status: "Nominal",
        icon: "Zap",
        usageMetric: "99.8% Cache Hit Ratio"
      },
      {
        name: "AWS Ingress/Egress Bandwidth",
        category: "Bandwidth",
        hourlyCost: finalBandwidthHourly,
        monthlyCost: finalBandwidthHourly * 730,
        instanceType: "Regional Egress Pipeline",
        status: "Healthy",
        icon: "Layers",
        usageMetric: `${Math.round(gbEgressPerHour)} GB data-transfer/hr`
      },
      {
        name: "Celery Workers (Predictions)",
        category: "AI / Workers",
        hourlyCost: celeryHourly,
        monthlyCost: celeryHourly * 730,
        instanceType: "t3.medium (Auto-scaling)",
        status: "Nominal",
        icon: "Cpu",
        usageMetric: "Queue latency < 800ms"
      },
      {
        name: "S3 Video & Canvas Storage",
        category: "Storage",
        hourlyCost: storageHourly,
        monthlyCost: storageHourly * 730,
        instanceType: "Amazon S3 Standard",
        status: "Archived",
        icon: "Database",
        usageMetric: isClassroomRecordingActive ? "500 GB media assets" : "50 GB media assets"
      }
    ];
  };

  const currentServices = computeCosts();

  // Aggregate stats
  const totalHourly = currentServices.reduce((acc, curr) => acc + curr.hourlyCost, 0);
  const totalMonthly = totalHourly * 730;
  const totalYearly = totalMonthly * 12;

  // Calculate unoptimized baseline (to show savings clearly)
  const baselineHourly = (() => {
    // Calculated with no optimization toggles
    const ec2Base = (0.192 * 2) * (Math.max(0.8, activeConcurrency / 3500)) * regionPremium;
    const rdsBase = (0.350 + (dbStorageGb * 0.115) / 730) * regionPremium;
    const redisBase = 0.068 * regionPremium;
    const egressBase = (activeConcurrency * 0.05) * (selectedRegion === "af-south-1" ? 0.14 : 0.09);
    const celeryBase = 0.128 * regionPremium;
    const storageBase = isClassroomRecordingActive ? ((500 * 0.023) / 730) : ((50 * 0.023) / 730);
    return ec2Base + rdsBase + redisBase + egressBase + celeryBase + storageBase;
  })();

  const baselineMonthly = baselineHourly * 730;
  const monthlySavings = Math.max(0, baselineMonthly - totalMonthly);
  const savingsPercent = baselineMonthly > 0 ? (monthlySavings / baselineMonthly) * 100 : 0;

  // Chart styling colors
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#64748b"];

  // Pie chart structured data
  const pieData = currentServices.map((srv) => ({
    name: srv.category,
    value: parseFloat((srv.monthlyCost * USD_TO_ZAR).toFixed(2))
  }));

  // Historical forecast projection data
  const forecastData = Array.from({ length: 6 }).map((_, i) => {
    const monthIndex = i + 1;
    // compound dynamic simulated user scale growth month-over-month (e.g. 5% growth)
    const scaleFactor = 1 + (monthIndex - 1) * 0.05;
    return {
      month: `Month +${monthIndex}`,
      "With Optimizations": parseFloat((totalMonthly * scaleFactor * USD_TO_ZAR).toFixed(2)),
      "Baseline Unoptimized": parseFloat((baselineMonthly * scaleFactor * USD_TO_ZAR).toFixed(2))
    };
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-royal-500/10 text-royal-600 dark:text-gold-400 rounded-lg shrink-0">
              <Landmark className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
              AWS Operational Cost Analytics
            </h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Real-time projected cloud operational efficiency and expenditure estimates mapped to high-school NSC/IEB user telemetry grids.
          </p>
        </div>

        {/* Region Selector */}
        <div className="flex bg-navy-50 dark:bg-navy-900 border border-navy-100 dark:border-navy-850 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedRegion("af-south-1")}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
              selectedRegion === "af-south-1"
                ? "bg-white dark:bg-navy-950 text-royal-600 dark:text-gold-400 shadow-sm font-extrabold"
                : "text-navy-500 dark:text-navy-400 hover:text-navy-800"
            }`}
          >
            🇿🇦 Cape Town (af-south-1)
          </button>
          <button
            type="button"
            onClick={() => setSelectedRegion("eu-west-1")}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
              selectedRegion === "eu-west-1"
                ? "bg-white dark:bg-navy-950 text-royal-600 dark:text-gold-400 shadow-sm font-extrabold"
                : "text-navy-500 dark:text-navy-400 hover:text-navy-800"
            }`}
          >
            🇮🇪 Ireland (eu-west-1)
          </button>
        </div>
      </div>

      {/* Aggregate Expenditure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Estimated Hourly */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 p-4.5 rounded-2xl shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] font-mono text-navy-400 block uppercase font-bold">AWS Run-rate / Hour</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-navy-900 dark:text-white">
              R {(totalHourly * USD_TO_ZAR).toFixed(2)}
            </span>
            <span className="text-xs text-navy-400">ZAR</span>
          </div>
          <p className="text-[10px] text-navy-400 font-mono mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block" />
            Recalculated dynamically
          </p>
          <div className="absolute right-3 top-3 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-xl text-blue-500">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        {/* Projected Monthly */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 p-4.5 rounded-2xl shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] font-mono text-navy-400 block uppercase font-bold">Projected Monthly</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-navy-900 dark:text-white">
              R {(totalMonthly * USD_TO_ZAR).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-navy-400">ZAR</span>
          </div>
          <p className="text-[10px] text-navy-400 font-mono mt-1">
            Based on current CAPS student workspace scale
          </p>
          <div className="absolute right-3 top-3 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-xl text-emerald-500">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>

        {/* Projected Annual Runrate */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 p-4.5 rounded-2xl shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] font-mono text-navy-400 block uppercase font-bold">Estimated Annual Run-Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-navy-900 dark:text-white">
              R {(totalYearly * USD_TO_ZAR).toLocaleString("en-ZA", { maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-navy-400">ZAR</span>
          </div>
          <p className="text-[10px] text-navy-400 font-mono mt-1">
            Based on current user baseline capacity
          </p>
          <div className="absolute right-3 top-3 bg-purple-50 dark:bg-purple-900/10 p-2 rounded-xl text-purple-500">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Optimization Savings */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 p-4.5 rounded-2xl shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block uppercase font-black">
            Active Optimizer Savings
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              R {(monthlySavings * USD_TO_ZAR).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">ZAR / mo</span>
          </div>
          <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-1 font-bold">
            <TrendingDown className="w-3.5 h-3.5" />
            Reduced invoice by {savingsPercent.toFixed(1)}%
          </p>
          <div className="absolute right-3 top-3 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cost breakdown lists and sliders (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Detailed breakdowns tables */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">
                Services Hourly Cost Register Breakdown
              </h3>
              <span className="text-[10px] text-navy-400 font-mono">Real-time parameters</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-navy-50/70 dark:bg-navy-900 border-b border-navy-100 dark:border-navy-850 text-[10px] font-mono text-navy-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Operational Service</th>
                    <th className="py-2.5 px-2">Instance Profile</th>
                    <th className="py-2.5 px-2">Usage Metrics</th>
                    <th className="py-2.5 px-2 text-right">Cost/Hour</th>
                    <th className="py-2.5 px-3 text-right">Cost/Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                  {currentServices.map((srv, index) => (
                    <tr key={index} className="hover:bg-navy-50/30 dark:hover:bg-navy-900/10">
                      <td className="py-3 px-3 font-semibold text-navy-800 dark:text-navy-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          {srv.name}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-navy-500">
                        {srv.instanceType}
                      </td>
                      <td className="py-3 px-2 text-[11px] text-navy-500 italic">
                        {srv.usageMetric}
                      </td>
                      <td className="py-3 px-2 font-mono text-right text-navy-800 dark:text-navy-100 font-bold">
                        R {(srv.hourlyCost * USD_TO_ZAR).toFixed(3)}
                      </td>
                      <td className="py-3 px-3 font-mono text-right text-royal-600 dark:text-gold-400 font-extrabold">
                        R {(srv.monthlyCost * USD_TO_ZAR).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Parameters Sliders & Control Room */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-5">
            
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-royal-500" />
                SRE Operational Parameter Tuner
              </h3>
              <span className="text-[10px] text-navy-400 font-mono">Modulates active load calculations</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Concurrency Level */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-mono text-navy-500 uppercase font-black">Peak Concurrency</span>
                  <span className="text-xs font-bold text-royal-600 dark:text-royal-400">{concurrencyLevel.toLocaleString()} VUs</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={15000}
                  step={500}
                  value={concurrencyLevel}
                  onChange={(e) => setConcurrencyLevel(parseInt(e.target.value))}
                  className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
                />
                <span className="text-[9.5px] text-navy-400 font-mono block">Directly scales CPU & Egress Bandwidth.</span>
              </div>

              {/* Database Storage sizing */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-mono text-navy-500 uppercase font-black">Postgres SSD Pool</span>
                  <span className="text-xs font-bold text-royal-600 dark:text-royal-400">{dbStorageGb} GB</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={dbStorageGb}
                  onChange={(e) => setDbStorageGb(parseInt(e.target.value))}
                  className="w-full h-1 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600"
                />
                <span className="text-[9.5px] text-navy-400 font-mono block">Relational tables and outbox records volume.</span>
              </div>

              {/* Classroom recordings archive */}
              <div className="space-y-1.5 text-left flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-mono text-navy-500 uppercase font-black">Video Archivist</span>
                  <span className="text-xs font-bold text-royal-600 dark:text-royal-400">{isClassroomRecordingActive ? "500 GB" : "50 GB"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClassroomRecordingActive(!isClassroomRecordingActive)}
                  className={`w-full py-1 px-3 border rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isClassroomRecordingActive 
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20" 
                      : "bg-navy-50 text-navy-500 border-navy-200"
                  }`}
                >
                  {isClassroomRecordingActive ? "Full S3 Video Buffers Enabled" : "Archiving Cleared / Minimal S3"}
                </button>
              </div>

            </div>

          </div>

          {/* Growth forecast charts */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">
                6-Month Compound Cloud Expense Forecast Projection
              </h3>
              <span className="text-[10px] text-navy-400 font-mono">Assumes +5% MoM student growth</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-navy-850" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", backgroundColor: "#0f172a", color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <defs>
                    <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="With Optimizations" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#optGrad)" />
                  <Area type="monotone" dataKey="Baseline Unoptimized" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" fillOpacity={1} fill="url(#baseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Sidebar Cost Saving Tuner and Pie chart breakdowns (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Service Category Pie Chart */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-navy-50 dark:border-navy-850 pb-2">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <PieChart className="w-4 h-4 text-indigo-500" />
                Invoice Breakdown
              </h3>
              <span className="text-[10px] text-navy-400 font-mono">By Service Group</span>
            </div>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R ${value}`} />
                </RechartsPieChart>
              </ResponsiveContainer>

              {/* absolute center layout info */}
              <div className="absolute text-center">
                <span className="text-[9px] font-mono text-navy-400 uppercase tracking-widest block font-bold">Projected</span>
                <span className="text-sm font-black font-mono text-navy-800 dark:text-white">R {(totalMonthly * USD_TO_ZAR).toFixed(0)}</span>
                <span className="text-[9px] text-navy-400 font-mono block">/month</span>
              </div>
            </div>

            {/* Micro Legended items */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-navy-50 dark:border-navy-850">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate text-navy-600 dark:text-navy-300">
                    {item.name}: <span className="font-bold">R {item.value.toFixed(0)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SRE Cost Savings Suite */}
          <div className="bg-navy-950 text-white border border-navy-850 rounded-3xl p-5 shadow-sm space-y-4">
            
            <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-gold-400 border-b border-navy-850 pb-2">
              <Zap className="w-4 h-4 text-gold-500" />
              SRE Cost-Saver Optimization Engine
            </div>

            <div className="space-y-4 text-xs text-left">
              
              {/* Toggle 1: Redis Caching Offload */}
              <div className="flex items-start justify-between gap-3 p-2.5 bg-navy-900 rounded-xl border border-navy-800/80">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-white block">Redis cache offloading</span>
                  <p className="text-[9.5px] text-navy-400 leading-normal">
                    Aggressively serve math sandbox formulas from memory. Reduces Postgres thread pool CPU and EC2 instance demands.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableCacheOffload}
                  onChange={(e) => setEnableCacheOffload(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer mt-1 shrink-0"
                />
              </div>

              {/* Toggle 2: Spot Instances */}
              <div className="flex items-start justify-between gap-3 p-2.5 bg-navy-900 rounded-xl border border-navy-800/80">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-white block">Use AWS Spot Instances</span>
                  <p className="text-[9.5px] text-navy-400 leading-normal">
                    Rely on Spot markets for Celery prediction workers. Saves up to 60% relative to standard On-Demand pricing.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={useSpotInstances}
                  onChange={(e) => setUseSpotInstances(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer mt-1 shrink-0"
                />
              </div>

              {/* Toggle 3: Off-Peak scaling Schedule */}
              <div className="flex items-start justify-between gap-3 p-2.5 bg-navy-900 rounded-xl border border-navy-800/80">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-white block">After-Hours Scaling Scheduler</span>
                  <p className="text-[9.5px] text-navy-400 leading-normal">
                    Spin down auxiliary Express web app servers and worker threads between 10PM and 6AM SAST during off-peak hours.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableOffPeakSchedule}
                  onChange={(e) => setEnableOffPeakSchedule(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer mt-1 shrink-0"
                />
              </div>

            </div>

            {/* Real-world pricing commentary */}
            <div className="bg-navy-900 border border-gold-500/20 rounded-xl p-3 text-[10px] text-left leading-normal text-gold-300">
              <span className="font-mono font-bold block uppercase mb-1 flex items-center gap-1 text-gold-400">
                <Info className="w-3.5 h-3.5" />
                South Africa AWS Pricing Advisor:
              </span>
              AWS Cape Town (<code className="font-mono text-white">af-south-1</code>) incurs high transit levies. Regional bandwidth egress rates to South African ISP aggregates (Telkom, Vodacom, MTN) are billed at R 2.55 per GB, which is ~50% higher than European networks. Ensure aggressive cache layers are set up to avoid bills!
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
