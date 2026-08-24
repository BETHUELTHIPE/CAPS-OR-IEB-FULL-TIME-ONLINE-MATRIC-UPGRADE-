import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import {
  TrendingUp,
  LineChart as LineChartIcon,
  BarChart3,
  Compass,
  Award,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  Layers,
  GraduationCap,
  Target
} from "lucide-react";
import { Profile } from "../types";

export interface MonthlyTopicData {
  period: string;
  Algebra: number;
  Calculus: number;
  Trigonometry: number;
  Geometry: number;
  Financial: number;
  OverallAvg: number;
}

export interface TopicRadarData {
  subject: string;
  baseline: number;
  current: number;
  fullMark: number;
}

const MONTHLY_PROGRESS_DATA: MonthlyTopicData[] = [
  { period: "Jan (Diagnostic)", Algebra: 58, Calculus: 45, Trigonometry: 52, Geometry: 48, Financial: 65, OverallAvg: 53.6 },
  { period: "Feb (Term 1 Test)", Algebra: 66, Calculus: 54, Trigonometry: 60, Geometry: 55, Financial: 72, OverallAvg: 61.4 },
  { period: "Mar (Term 1 Control)", Algebra: 74, Calculus: 65, Trigonometry: 68, Geometry: 62, Financial: 78, OverallAvg: 69.4 },
  { period: "Apr (Vacation Drill)", Algebra: 80, Calculus: 72, Trigonometry: 74, Geometry: 69, Financial: 84, OverallAvg: 75.8 },
  { period: "May (Term 2 Test)", Algebra: 85, Calculus: 79, Trigonometry: 81, Geometry: 75, Financial: 88, OverallAvg: 81.6 },
  { period: "Jun (Mid-Year Trials)", Algebra: 89, Calculus: 84, Trigonometry: 86, Geometry: 81, Financial: 92, OverallAvg: 86.4 }
];

const RADAR_TOPIC_DATA: TopicRadarData[] = [
  { subject: "Algebra & Eqns", baseline: 58, current: 89, fullMark: 100 },
  { subject: "Differential Calculus", baseline: 45, current: 84, fullMark: 100 },
  { subject: "Trigonometry", baseline: 52, current: 86, fullMark: 100 },
  { subject: "Euclidean Geometry", baseline: 48, current: 81, fullMark: 100 },
  { subject: "Financial Maths", baseline: 65, current: 92, fullMark: 100 },
  { subject: "Analytical Geometry", baseline: 50, current: 83, fullMark: 100 }
];

const TOPIC_CONFIG: Record<string, { label: string; color: string; gradientId: string }> = {
  Algebra: { label: "Algebra & Functions", color: "#3b82f6", gradientId: "gradAlgebra" },
  Calculus: { label: "Differential Calculus", color: "#f59e0b", gradientId: "gradCalculus" },
  Trigonometry: { label: "Trigonometry", color: "#ec4899", gradientId: "gradTrig" },
  Geometry: { label: "Euclidean Geometry", color: "#10b981", gradientId: "gradGeometry" },
  Financial: { label: "Financial Maths", color: "#8b5cf6", gradientId: "gradFinancial" }
};

export interface TopicImprovementChartProps {
  user?: Profile | null;
}

export const TopicImprovementChart: React.FC<TopicImprovementChartProps> = ({ user }) => {
  const [chartType, setChartType] = useState<"area" | "line" | "bar" | "radar">("area");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Algebra", "Calculus", "Trigonometry", "Geometry", "Financial"]);
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);

  // Toggle selected topic
  const toggleTopic = (topicKey: string) => {
    if (selectedTopics.includes(topicKey)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topicKey));
      }
    } else {
      setSelectedTopics([...selectedTopics, topicKey]);
    }
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-950/95 border border-navy-750 p-3.5 rounded-2xl shadow-2xl text-white font-mono text-xs space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-navy-800 pb-1.5 font-bold text-navy-300">
            <span>{label}</span>
            <span className="text-[10px] text-amber-400">CAPS Assessment</span>
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-navy-200 font-sans text-[11px]">{entry.name}:</span>
                </div>
                <span className="font-bold text-white">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl text-navy-900 dark:text-white relative overflow-hidden space-y-6">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-royal-500/5 dark:bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-150 dark:border-navy-800 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-navy-900 text-gold-400 font-black shadow-lg shrink-0 border border-royal-500/30">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" /> Longitudinal Recharts Analytics
              </span>
              <span className="text-[11px] font-mono text-navy-500 dark:text-navy-400 font-bold">
                • 2026 Academic Progress Tracker
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight mt-0.5">
              Topic Improvement & Score Trajectory
            </h2>
          </div>
        </div>

        {/* CHART TYPE SELECTOR TABS */}
        <div className="flex items-center gap-2 shrink-0 bg-navy-50 dark:bg-navy-950 p-1.5 rounded-2xl border border-navy-200 dark:border-navy-800 text-xs font-mono font-bold">
          {[
            { id: "area", label: "Area Trend", icon: LineChartIcon },
            { id: "line", label: "Multi-Line", icon: TrendingUp },
            { id: "bar", label: "Monthly Bar", icon: BarChart3 },
            { id: "radar", label: "Radar Comparison", icon: Compass }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = chartType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setChartType(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black shadow-md"
                    : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* HIGHLIGHT MILESTONE BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-navy-950 font-black shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase block">
              Highest Improvement
            </span>
            <span className="text-sm font-black font-display text-navy-900 dark:text-white">
              Differential Calculus (+39%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-gold-500/10 border border-amber-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-navy-950 font-black shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase block">
              Distinction Level (80%+)
            </span>
            <span className="text-sm font-black font-display text-navy-900 dark:text-white">
              5 of 6 Topics Achieved
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-royal-500/10 to-indigo-500/10 border border-royal-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-royal-600 text-white font-black shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-royal-600 dark:text-royal-300 uppercase block">
              Current Overall Mean
            </span>
            <span className="text-sm font-black font-display text-navy-900 dark:text-white">
              86.4% Level 7 Distinction
            </span>
          </div>
        </div>
      </div>

      {/* TOPIC FILTER CHIPS (FOR LINE/AREA/BAR) */}
      {chartType !== "radar" && (
        <div className="flex items-center justify-between gap-3 flex-wrap relative z-10 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Toggle Topics:
            </span>
            {Object.keys(TOPIC_CONFIG).map((key) => {
              const conf = TOPIC_CONFIG[key];
              const isSelected = selectedTopics.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleTopic(key)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-navy-900 dark:bg-navy-950 text-white border-navy-700 shadow-sm"
                      : "bg-navy-50 dark:bg-navy-850 text-navy-400 border-navy-200 dark:border-navy-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.color }} />
                  <span>{conf.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowTargetLine(!showTargetLine)}
            className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
              showTargetLine
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40"
                : "bg-navy-50 dark:bg-navy-850 text-navy-500 border-navy-200 dark:border-navy-800"
            }`}
          >
            {showTargetLine ? "Hide 80% Target Line" : "Show 80% Target Line"}
          </button>
        </div>
      )}

      {/* RECHARTS MAIN CONTAINER */}
      <div className="p-4 rounded-3xl bg-navy-950 border border-navy-800 text-white relative z-10 shadow-inner">
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={MONTHLY_PROGRESS_DATA} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  {Object.keys(TOPIC_CONFIG).map((key) => {
                    const conf = TOPIC_CONFIG[key];
                    return (
                      <linearGradient key={conf.gradientId} id={conf.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={conf.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={conf.color} stopOpacity={0.0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip content={<CustomTooltip />} />
                {showTargetLine && (
                  <ReferenceLine
                    y={80}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: "Level 7 Distinction (80%)", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }}
                  />
                )}
                {selectedTopics.map((key) => {
                  const conf = TOPIC_CONFIG[key];
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={conf.label}
                      stroke={conf.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#${conf.gradientId})`}
                    />
                  );
                })}
              </AreaChart>
            ) : chartType === "line" ? (
              <LineChart data={MONTHLY_PROGRESS_DATA} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip content={<CustomTooltip />} />
                {showTargetLine && (
                  <ReferenceLine
                    y={80}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: "Target 80%", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }}
                  />
                )}
                {selectedTopics.map((key) => {
                  const conf = TOPIC_CONFIG[key];
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={conf.label}
                      stroke={conf.color}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  );
                })}
              </LineChart>
            ) : chartType === "bar" ? (
              <BarChart data={MONTHLY_PROGRESS_DATA} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip content={<CustomTooltip />} />
                {showTargetLine && (
                  <ReferenceLine
                    y={80}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                  />
                )}
                {selectedTopics.map((key) => {
                  const conf = TOPIC_CONFIG[key];
                  return <Bar key={key} dataKey={key} name={conf.label} fill={conf.color} radius={[4, 4, 0, 0]} />;
                })}
              </BarChart>
            ) : (
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_TOPIC_DATA}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: "sans-serif" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar name="January Baseline" dataKey="baseline" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                <Radar name="Current Mid-Year Score" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif", paddingTop: 10 }} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
