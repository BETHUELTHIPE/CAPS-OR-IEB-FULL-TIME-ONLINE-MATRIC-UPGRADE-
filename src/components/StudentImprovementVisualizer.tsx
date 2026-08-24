import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  LineChart,
  Line,
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
  ReferenceLine,
  Cell
} from "recharts";
import {
  TrendingUp,
  LineChart as LineChartIcon,
  BarChart3,
  Compass,
  Award,
  Sparkles,
  Target,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  Layers,
  BookOpen,
  Plus,
  Zap,
  Flame,
  Clock,
  RefreshCw,
  HelpCircle,
  BarChart2,
  Percent
} from "lucide-react";
import { Profile, MockExamScore } from "../types";
import { dbAPI } from "../lib/db";

export interface StudentImprovementVisualizerProps {
  user: Profile;
  onNavigateTab?: (tab: string) => void;
}

export type VisualizationMode = "quiz_scores" | "module_completions" | "combined_growth" | "radar_mastery";
export type TimeHorizon = "all" | "7days" | "30days" | "90days" | "year";

interface TrajectoryDataPoint {
  id?: string;
  dateKey: string;
  displayDate: string;
  periodLabel: string;
  quizScore?: number;
  averageScore?: number;
  modulesCompleted: number;
  cumulativeModules: number;
  topic?: string;
  assessmentTitle?: string;
  targetBoundary: number;
}

interface RadarTopicData {
  topic: string;
  baseline: number;
  current: number;
  fullMark: number;
}

const CAPS_MATH_TOPICS = [
  "Algebra & Equations",
  "Differential Calculus",
  "Trigonometry",
  "Euclidean Geometry",
  "Analytical Geometry",
  "Functions & Graphs",
  "Financial Mathematics",
  "Statistics & Probability"
];

// Baseline seed data representing high-school matric progression curve
const DEFAULT_TIMELINE_SERIES: TrajectoryDataPoint[] = [
  {
    dateKey: "2026-01-20",
    displayDate: "20 Jan 2026",
    periodLabel: "Jan Diagnostic",
    quizScore: 54,
    averageScore: 54,
    modulesCompleted: 3,
    cumulativeModules: 3,
    topic: "Algebra & Equations",
    assessmentTitle: "Diagnostic Baseline Assessment",
    targetBoundary: 80
  },
  {
    dateKey: "2026-02-15",
    displayDate: "15 Feb 2026",
    periodLabel: "Feb Term 1 Test",
    quizScore: 63,
    averageScore: 58.5,
    modulesCompleted: 5,
    cumulativeModules: 8,
    topic: "Functions & Graphs",
    assessmentTitle: "Term 1 Control Test 1",
    targetBoundary: 80
  },
  {
    dateKey: "2026-03-18",
    displayDate: "18 Mar 2026",
    periodLabel: "Mar Control Test",
    quizScore: 71,
    averageScore: 62.6,
    modulesCompleted: 6,
    cumulativeModules: 14,
    topic: "Trigonometry",
    assessmentTitle: "Term 1 Formal Test",
    targetBoundary: 80
  },
  {
    dateKey: "2026-04-22",
    displayDate: "22 Apr 2026",
    periodLabel: "Apr Vacation Drill",
    quizScore: 78,
    averageScore: 66.5,
    modulesCompleted: 8,
    cumulativeModules: 22,
    topic: "Differential Calculus",
    assessmentTitle: "Holiday Workshop Challenge",
    targetBoundary: 80
  },
  {
    dateKey: "2026-05-25",
    displayDate: "25 May 2026",
    periodLabel: "May Term 2 Mid",
    quizScore: 84,
    averageScore: 70.0,
    modulesCompleted: 7,
    cumulativeModules: 29,
    topic: "Euclidean Geometry",
    assessmentTitle: "Term 2 Mid-Year Warmup",
    targetBoundary: 80
  },
  {
    dateKey: "2026-06-28",
    displayDate: "28 Jun 2026",
    periodLabel: "Jun Mid-Year Exam",
    quizScore: 89,
    averageScore: 73.1,
    modulesCompleted: 9,
    cumulativeModules: 38,
    topic: "Differential Calculus",
    assessmentTitle: "CAPS Mid-Year Exam Paper 1 & 2",
    targetBoundary: 80
  },
  {
    dateKey: "2026-07-20",
    displayDate: "20 Jul 2026",
    periodLabel: "Jul Trial Prep",
    quizScore: 92,
    averageScore: 75.8,
    modulesCompleted: 11,
    cumulativeModules: 49,
    topic: "Algebra & Equations",
    assessmentTitle: "National Trial Simulator Q1-Q10",
    targetBoundary: 80
  },
  {
    dateKey: "2026-08-10",
    displayDate: "10 Aug 2026",
    periodLabel: "Aug Preliminary",
    quizScore: 95,
    averageScore: 78.2,
    modulesCompleted: 8,
    cumulativeModules: 57,
    topic: "Trigonometry",
    assessmentTitle: "IEB & CAPS Mock Prelims 2026",
    targetBoundary: 80
  }
];

const DEFAULT_RADAR_DATA: RadarTopicData[] = [
  { topic: "Algebra & Eqns", baseline: 54, current: 95, fullMark: 100 },
  { topic: "Calculus", baseline: 46, current: 91, fullMark: 100 },
  { topic: "Trigonometry", baseline: 52, current: 88, fullMark: 100 },
  { topic: "Euclidean Geo", baseline: 48, current: 82, fullMark: 100 },
  { topic: "Functions", baseline: 60, current: 92, fullMark: 100 },
  { topic: "Financial Maths", baseline: 65, current: 94, fullMark: 100 },
  { topic: "Analytical Geo", baseline: 50, current: 86, fullMark: 100 },
  { topic: "Statistics", baseline: 68, current: 90, fullMark: 100 }
];

export const StudentImprovementVisualizer: React.FC<StudentImprovementVisualizerProps> = ({
  user,
  onNavigateTab
}) => {
  // 1. Controls & Filter States
  const [viewMode, setViewMode] = useState<VisualizationMode>("combined_growth");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);
  const [showMovingAvg, setShowMovingAvg] = useState<boolean>(true);

  // 2. Data Sources
  const [storedScores, setStoredScores] = useState<MockExamScore[]>([]);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);
  const [newScoreTitle, setNewScoreTitle] = useState("");
  const [newScoreTopic, setNewScoreTopic] = useState(CAPS_MATH_TOPICS[0]);
  const [newScorePercent, setNewScorePercent] = useState(85);
  const [newScoreDate, setNewScoreDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [logSuccessMsg, setLogSuccessMsg] = useState("");

  // Load real mock scores from local storage / API
  const refreshScores = () => {
    try {
      const scores = dbAPI.getMockExamScores(user.id);
      setStoredScores(scores);
    } catch (err) {
      console.error("Error loading mock exam scores:", err);
    }
  };

  useEffect(() => {
    refreshScores();

    const handleStorageChange = () => refreshScores();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user.id]);

  // Combine baseline progression with user's real logged test scores
  const combinedTimeSeries = useMemo(() => {
    const base = [...DEFAULT_TIMELINE_SERIES];

    // If user has recorded actual custom mock exam scores, merge them into the timeline
    if (storedScores && storedScores.length > 0) {
      const userPoints: TrajectoryDataPoint[] = storedScores.map((score, idx) => {
        let displayD = score.exam_date;
        try {
          const d = new Date(score.exam_date);
          displayD = d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
        } catch {
          // fallback
        }

        return {
          id: score.id,
          dateKey: score.exam_date,
          displayDate: displayD,
          periodLabel: score.exam_title.length > 18 ? score.exam_title.substring(0, 18) + "..." : score.exam_title,
          quizScore: score.score_percentage,
          modulesCompleted: Math.max(1, Math.round(score.score_percentage / 12)),
          cumulativeModules: 0, // calculated below
          topic: score.subject_or_topic,
          assessmentTitle: score.exam_title,
          targetBoundary: 80
        };
      });

      // Merge and sort chronologically
      const allPoints = [...base, ...userPoints].sort(
        (a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime()
      );

      // Recompute running averages and cumulative module counts
      let cumulativeSum = 0;
      let scoreSum = 0;
      return allPoints.map((pt, idx) => {
        cumulativeSum += pt.modulesCompleted;
        scoreSum += pt.quizScore || 0;
        return {
          ...pt,
          cumulativeModules: cumulativeSum,
          averageScore: Math.round((scoreSum / (idx + 1)) * 10) / 10
        };
      });
    }

    return base;
  }, [storedScores]);

  // Apply filters for Topic and Time Horizon
  const filteredData = useMemo(() => {
    let result = combinedTimeSeries;

    // Filter by Topic
    if (selectedTopic !== "All") {
      result = result.filter(
        (item) => !item.topic || item.topic.toLowerCase().includes(selectedTopic.toLowerCase())
      );
    }

    // Filter by Time Horizon
    if (timeHorizon !== "all") {
      const now = new Date();
      result = result.filter((item) => {
        const itemDate = new Date(item.dateKey);
        const diffDays = Math.ceil((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

        if (timeHorizon === "7days") return diffDays <= 7 && diffDays >= 0;
        if (timeHorizon === "30days") return diffDays <= 30 && diffDays >= 0;
        if (timeHorizon === "90days") return diffDays <= 90 && diffDays >= 0;
        if (timeHorizon === "year") return itemDate.getFullYear() === 2026;
        return true;
      });
    }

    return result;
  }, [combinedTimeSeries, selectedTopic, timeHorizon]);

  // Derived growth stats
  const stats = useMemo(() => {
    const count = filteredData.length;
    if (count === 0) {
      return {
        initialScore: 0,
        latestScore: 0,
        scoreGrowth: 0,
        totalModules: 0,
        averageScore: 0,
        distinctionCount: 0,
        distinctionRate: 0,
        bestTopic: "Differential Calculus"
      };
    }

    const firstScore = filteredData[0].quizScore || 0;
    const lastScore = filteredData[count - 1].quizScore || 0;
    const scoreGrowth = lastScore - firstScore;
    const totalModules = filteredData[count - 1].cumulativeModules || 0;

    const allScores = filteredData.map((d) => d.quizScore || 0);
    const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / count);
    const distinctions = allScores.filter((s) => s >= 80).length;
    const distinctionRate = Math.round((distinctions / count) * 100);

    return {
      initialScore: firstScore,
      latestScore: lastScore,
      scoreGrowth,
      totalModules,
      averageScore: avg,
      distinctionCount: distinctions,
      distinctionRate,
      bestTopic: "Differential Calculus (+39%)"
    };
  }, [filteredData]);

  // Handle logging new test score
  const handleSaveQuickScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScoreTitle.trim()) return;

    try {
      dbAPI.addMockExamScore({
        student_id: user.id,
        exam_title: newScoreTitle.trim(),
        subject_or_topic: newScoreTopic,
        score_percentage: Number(newScorePercent),
        exam_date: newScoreDate || new Date().toISOString().split("T")[0],
        notes: "Logged from Student Improvement Visualizer (Paper 1 CAPS)"
      });

      refreshScores();
      setNewScoreTitle("");
      setIsQuickLogOpen(false);
      setLogSuccessMsg("Score logged! Improvement chart updated dynamically.");
      setTimeout(() => setLogSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Error saving score:", err);
    }
  };

  // Custom Tooltip for Recharts
  const CustomTrajectoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: TrajectoryDataPoint = payload[0].payload;
      const score = data.quizScore;
      const isDistinction = score !== undefined && score >= 80;
      const isPass = score !== undefined && score >= 50;

      return (
        <div className="bg-navy-950/95 border border-navy-750 p-4 rounded-2xl shadow-2xl text-white font-sans text-xs space-y-2 backdrop-blur-md max-w-xs text-left">
          <div className="flex items-center justify-between border-b border-navy-800 pb-2">
            <div>
              <span className="font-bold text-navy-200 block text-xs">{data.displayDate}</span>
              <span className="text-[10px] font-mono text-gold-400">{data.assessmentTitle}</span>
            </div>
            {data.topic && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-royal-500/20 text-royal-300 border border-royal-500/30">
                {data.topic.split(" ")[0]}
              </span>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            {score !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-navy-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold-400" />
                  Quiz Mark:
                </span>
                <span className="font-mono font-black text-sm text-gold-400">{score}%</span>
              </div>
            )}

            {data.averageScore !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-navy-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-royal-400" />
                  Running Average:
                </span>
                <span className="font-mono font-bold text-royal-300">{data.averageScore}%</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <span className="text-navy-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Modules Completed:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                +{data.modulesCompleted} ({data.cumulativeModules} Total)
              </span>
            </div>

            {score !== undefined && (
              <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[10px] font-mono">
                <span className="text-navy-400">CAPS Standard:</span>
                <span
                  className={`font-black uppercase px-2 py-0.5 rounded ${
                    isDistinction
                      ? "text-amber-300 bg-amber-500/20 border border-amber-500/30"
                      : isPass
                      ? "text-emerald-300 bg-emerald-500/20"
                      : "text-rose-300 bg-rose-500/20"
                  }`}
                >
                  {isDistinction ? "Level 7 Distinction" : isPass ? "Level 4+ Pass" : "Requires Practice"}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="student-improvement-visualizer-root"
      className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl text-navy-900 dark:text-white relative overflow-hidden space-y-6 text-left"
    >
      {/* Background ambient gradient blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-royal-500/5 dark:bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION WITH TITLE & LOG TEST BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-150 dark:border-navy-800 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-navy-900 text-gold-400 font-black shadow-lg shrink-0 border border-royal-500/30">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" /> Recharts Student Trajectory
              </span>
              <span className="text-[11px] font-mono text-navy-500 dark:text-navy-400 font-bold">
                • 2026 Academic Growth Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight mt-0.5">
              Longitudinal Improvement & Mastery Trajectory
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsQuickLogOpen(!isQuickLogOpen)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-mono text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isQuickLogOpen ? "Close Logger" : "Log Test Mark"}</span>
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("performance")}
              className="px-3.5 py-2 bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-300 font-mono text-xs font-bold rounded-xl border border-navy-200 dark:border-navy-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-royal-500" />
              <span>Mock Center</span>
            </button>
          )}
        </div>
      </div>

      {/* QUICK SCORE LOGGING SLIDE-DOWN DRAWER */}
      <AnimatePresence>
        {isQuickLogOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden relative z-10"
          >
            <form
              onSubmit={handleSaveQuickScore}
              className="p-5 bg-gradient-to-r from-navy-50 to-royal-50/30 dark:from-navy-950 dark:to-navy-900 border border-royal-200 dark:border-navy-750 rounded-2xl space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black font-mono uppercase tracking-wider text-navy-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Record New Mathematics Quiz / Trial Exam Mark
                </h4>
                <span className="text-[10px] font-mono text-navy-400">Updates Recharts graph instantly</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Term 3 Trigonometry Drill"
                    value={newScoreTitle}
                    onChange={(e) => setNewScoreTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-sans"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    CAPS Topic / Chapter
                  </label>
                  <select
                    value={newScoreTopic}
                    onChange={(e) => setNewScoreTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-sans"
                  >
                    {CAPS_MATH_TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Score achieved (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={newScorePercent}
                      onChange={(e) => setNewScorePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono font-black pr-7"
                    />
                    <Percent className="w-3.5 h-3.5 text-navy-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Date of Assessment
                  </label>
                  <input
                    type="date"
                    required
                    value={newScoreDate}
                    onChange={(e) => setNewScoreDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-150 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsQuickLogOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
                >
                  Save & Update Chart
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS CONFIRMATION TOAST */}
      {logSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl flex items-center gap-2 font-mono font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{logSuccessMsg}</span>
        </div>
      )}

      {/* KPI HIGHLIGHT GROWTH METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {/* Card 1: Score Growth Trajectory */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase">
              Overall Score Delta
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500 text-navy-950 font-black">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-navy-900 dark:text-white flex items-baseline gap-1.5">
              <span>{stats.latestScore}%</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                (+{stats.scoreGrowth}%)
              </span>
            </div>
            <span className="text-[10px] font-mono text-navy-500 dark:text-navy-400 block mt-0.5">
              Started at {stats.initialScore}% in January baseline
            </span>
          </div>
        </div>

        {/* Card 2: Modules Mastered */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-royal-500/10 via-indigo-500/5 to-transparent border border-royal-500/30 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-royal-600 dark:text-royal-300 uppercase">
              Modules Completed
            </span>
            <div className="p-1.5 rounded-lg bg-royal-600 text-white font-black">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-navy-900 dark:text-white flex items-baseline gap-1.5">
              <span>{stats.totalModules}</span>
              <span className="text-xs font-mono text-navy-400 font-normal">Modules</span>
            </div>
            <span className="text-[10px] font-mono text-navy-500 dark:text-navy-400 block mt-0.5">
              Across all 8 core CAPS math chapters
            </span>
          </div>
        </div>

        {/* Card 3: Distinction Level Rate */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-gold-500/5 to-transparent border border-amber-500/30 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase">
              Distinction Rate (80%+)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500 text-navy-950 font-black">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-navy-900 dark:text-white flex items-baseline gap-1.5">
              <span>{stats.distinctionRate}%</span>
              <span className="text-xs font-mono text-amber-500 font-bold">
                ({stats.distinctionCount}/{filteredData.length})
              </span>
            </div>
            <span className="text-[10px] font-mono text-navy-500 dark:text-navy-400 block mt-0.5">
              Level 7 Distinction benchmark
            </span>
          </div>
        </div>

        {/* Card 4: Most Improved Chapter */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/30 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-purple-600 dark:text-purple-300 uppercase">
              Growth Velocity
            </span>
            <div className="p-1.5 rounded-lg bg-purple-600 text-white font-black">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-base font-black font-display text-navy-900 dark:text-white truncate">
              {stats.bestTopic}
            </div>
            <span className="text-[10px] font-mono text-navy-500 dark:text-navy-400 block mt-0.5">
              Highest scoring velocity & mastery
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS TOOLBAR: VIEW MODES, TIME HORIZONS & TOPIC FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-navy-50/80 dark:bg-navy-950/80 border border-navy-150 dark:border-navy-850 relative z-10">
        
        {/* VIEW MODE TABS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono font-black text-navy-500 dark:text-navy-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-royal-500" /> Plot Mode:
          </span>
          {[
            { id: "combined_growth", label: "Dual Metric (Scores + Modules)", icon: BarChart3 },
            { id: "quiz_scores", label: "Quiz Scores Only", icon: TrendingUp },
            { id: "module_completions", label: "Module Counts Only", icon: BookOpen },
            { id: "radar_mastery", label: "Diagnostic vs Current Radar", icon: Compass }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as VisualizationMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black shadow-md scale-[1.02]"
                    : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TIME HORIZON & TOPIC SELECTORS */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Topic Select */}
          {viewMode !== "radar_mastery" && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase">Topic:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl px-2.5 py-1 text-xs font-semibold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
              >
                <option value="All">All Chapters</option>
                {CAPS_MATH_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Horizon Select */}
          {viewMode !== "radar_mastery" && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase">Timeline:</span>
              <select
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
                className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl px-2.5 py-1 text-xs font-semibold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
              >
                <option value="all">Full 2026 History</option>
                <option value="90days">Last 90 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="7days">Last 7 Days</option>
              </select>
            </div>
          )}

          {/* Toggle distinctions / moving average */}
          {viewMode !== "radar_mastery" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowTargetLine(!showTargetLine)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  showTargetLine
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40"
                    : "bg-white dark:bg-navy-900 text-navy-500 border-navy-200 dark:border-navy-800"
                }`}
                title="Toggle 80% Distinction Benchmark Line"
              >
                {showTargetLine ? "80% Target Line: ON" : "Target: OFF"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN RECHARTS DATA VISUALIZATION CANVAS */}
      <div className="p-4 sm:p-6 rounded-3xl bg-navy-950 border border-navy-800 text-white relative z-10 shadow-inner">
        <div className="h-[360px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "combined_growth" ? (
              /* DUAL-AXIS COMPOSED CHART (BARS FOR MODULE COMPLETIONS, AREA/LINE FOR QUIZ SCORES) */
              <ComposedChart data={filteredData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="quizScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="periodLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                />
                {/* Left Y Axis: Quiz Score Percentage (0 to 100%) */}
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  stroke="#eab308"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  unit="%"
                />
                {/* Right Y Axis: Modules Completed Count */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, "auto"]}
                  stroke="#3b82f6"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTrajectoryTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    paddingTop: 10
                  }}
                />

                {showTargetLine && (
                  <ReferenceLine
                    yAxisId="left"
                    y={80}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    label={{
                      value: "Level 7 Distinction (80%)",
                      fill: "#eab308",
                      fontSize: 10,
                      position: "insideTopRight"
                    }}
                  />
                )}
                {showTargetLine && (
                  <ReferenceLine
                    yAxisId="left"
                    y={50}
                    stroke="#38bdf8"
                    strokeDasharray="3 3"
                    label={{
                      value: "Pass Mark (50%)",
                      fill: "#38bdf8",
                      fontSize: 10,
                      position: "insideBottomRight"
                    }}
                  />
                )}

                {/* Bars for Completed Modules per Assessment */}
                <Bar
                  yAxisId="right"
                  dataKey="modulesCompleted"
                  name="Completed Modules Count"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />

                {/* Area line for Quiz Score % */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="quizScore"
                  name="Quiz Score %"
                  stroke="#eab308"
                  strokeWidth={3}
                  fill="url(#quizScoreGrad)"
                  dot={{ r: 5, strokeWidth: 2, fill: "#0f172a", stroke: "#eab308" }}
                  activeDot={{ r: 8, stroke: "#ffffff", strokeWidth: 2, fill: "#eab308" }}
                />

                {/* Running average line */}
                {showMovingAvg && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="averageScore"
                    name="Moving Cumulative Average %"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </ComposedChart>
            ) : viewMode === "quiz_scores" ? (
              /* DEDICATED QUIZ SCORES AREA CHART */
              <AreaChart data={filteredData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="periodLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  unit="%"
                />
                <Tooltip content={<CustomTrajectoryTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingTop: 10 }} />

                {showTargetLine && (
                  <ReferenceLine
                    y={80}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    label={{
                      value: "Level 7 Distinction (80%)",
                      fill: "#eab308",
                      fontSize: 10,
                      position: "insideTopRight"
                    }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="quizScore"
                  name="Quiz Assessment Mark (%)"
                  stroke="#eab308"
                  strokeWidth={3.5}
                  fill="url(#scoreAreaGrad)"
                  dot={{ r: 5, strokeWidth: 2, fill: "#0f172a", stroke: "#eab308" }}
                  activeDot={{ r: 8, stroke: "#ffffff", strokeWidth: 2, fill: "#eab308" }}
                />

                <Line
                  type="monotone"
                  dataKey="averageScore"
                  name="Cumulative Mean (%)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            ) : viewMode === "module_completions" ? (
              /* DEDICATED MODULE COMPLETIONS BAR & CUMULATIVE LINE CHART */
              <ComposedChart data={filteredData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="periodLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                />
                <YAxis
                  yAxisId="count"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="cum"
                  orientation="right"
                  stroke="#10b981"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTrajectoryTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingTop: 10 }} />

                <Bar
                  yAxisId="count"
                  dataKey="modulesCompleted"
                  name="Modules Mastered in Period"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />

                <Line
                  yAxisId="cum"
                  type="monotone"
                  dataKey="cumulativeModules"
                  name="Total Cumulative Modules Completed"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: "#0f172a", stroke: "#10b981" }}
                />
              </ComposedChart>
            ) : (
              /* RADAR ASSESSMENT MASTER CHART */
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={DEFAULT_RADAR_DATA}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="topic"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fontFamily: "sans-serif" }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar
                  name="January Baseline Mark"
                  dataKey="baseline"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Current Mastery Level (August 2026)"
                  dataKey="current"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
                <Tooltip content={<CustomTrajectoryTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif", paddingTop: 10 }} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* FOOTER ACTIONABLE INSIGHT BOX */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-royal-50/40 dark:bg-navy-950/40 border border-royal-100/50 dark:border-navy-800 rounded-2xl text-xs relative z-10">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-navy-900 dark:text-white font-mono uppercase">
              Tutor Bethuel's Analytical Diagnostic
            </h4>
            <p className="text-[11px] text-navy-600 dark:text-navy-400 leading-relaxed">
              Your overall score trajectory demonstrates a <strong>+{stats.scoreGrowth}% growth curve</strong> since diagnostic baseline, with <strong>{stats.totalModules} modules mastered</strong>. Keep logging all school tests and completed worksheets to prepare for standard-setting Matric results!
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab("subject_quiz")}
            className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-mono text-xs font-bold rounded-xl whitespace-nowrap shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            Take Next Practice Quiz
          </button>
        )}
      </div>
    </div>
  );
};
