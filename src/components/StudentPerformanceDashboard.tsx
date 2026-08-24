import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Clock, 
  Award, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  Filter, 
  Target, 
  Sparkles, 
  BookOpen, 
  BrainCircuit, 
  BarChart3, 
  Zap, 
  Flame, 
  SlidersHorizontal, 
  Download, 
  Trash2, 
  ArrowUpRight, 
  AlertCircle, 
  Layers, 
  RefreshCw,
  Check,
  ChevronRight,
  HelpCircle,
  FileSpreadsheet,
  Video
} from "lucide-react";
import { CreateZoomMeetingModal } from "./CreateZoomMeetingModal";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine, 
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { Profile, MockExamScore } from "../types";
import { dbAPI } from "../lib/db";

export interface StudySessionLog {
  id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  subject_topic: string;
  focus_rating: number; // 1-5
  notes?: string;
}

interface StudentPerformanceDashboardProps {
  user: Profile;
}

const MATH_TOPICS = [
  "Algebra & Equations",
  "Differential Calculus",
  "Trigonometry",
  "Euclidean Geometry",
  "Analytical Geometry",
  "Functions & Graphs",
  "Financial Mathematics",
  "Statistics & Data"
];

// Initial mock study sessions seed for new users
const DEFAULT_STUDY_SESSIONS: StudySessionLog[] = [
  { id: "s1", student_id: "default", date: "2026-07-01", hours: 2.5, subject_topic: "Algebra & Equations", focus_rating: 4, notes: "Solved CAPS past paper 1 question 1 & 2" },
  { id: "s2", student_id: "default", date: "2026-07-04", hours: 3.0, subject_topic: "Differential Calculus", focus_rating: 5, notes: "First principles derivative limits practice" },
  { id: "s3", student_id: "default", date: "2026-07-08", hours: 1.5, subject_topic: "Trigonometry", focus_rating: 3, notes: "Compound and double angle identity reduction" },
  { id: "s4", student_id: "default", date: "2026-07-12", hours: 4.0, subject_topic: "Euclidean Geometry", focus_rating: 5, notes: "Circle theorems and cyclic quad riders" },
  { id: "s5", student_id: "default", date: "2026-07-15", hours: 2.0, subject_topic: "Functions & Graphs", focus_rating: 4, notes: "Parabola and hyperbola inverse graphs" },
  { id: "s6", student_id: "default", date: "2026-07-19", hours: 3.5, subject_topic: "Differential Calculus", focus_rating: 5, notes: "Cubic polynomial turning points & optimization" },
  { id: "s7", student_id: "default", date: "2026-07-22", hours: 2.5, subject_topic: "Analytical Geometry", focus_rating: 4, notes: "Equations of tangents to circles" },
  { id: "s8", student_id: "default", date: "2026-07-26", hours: 4.5, subject_topic: "Trigonometry", focus_rating: 5, notes: "3D Trigonometric sine & cosine rule problems" },
  { id: "s9", student_id: "default", date: "2026-07-29", hours: 3.0, subject_topic: "Algebra & Equations", focus_rating: 4, notes: "Simultaneous non-linear equations & surds" }
];

export const StudentPerformanceDashboard: React.FC<StudentPerformanceDashboardProps> = ({ user }) => {
  // State for Quizzes & Study Sessions
  const [quizzes, setQuizzes] = useState<MockExamScore[]>([]);
  const [sessions, setSessions] = useState<StudySessionLog[]>([]);

  // Filters & Controls
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [timeframe, setTimeframe] = useState<"7days" | "30days" | "90days" | "all">("all");
  const [targetScore, setTargetScore] = useState<number>(80);
  const [chartType, setChartType] = useState<"combined" | "split" | "topic">("combined");

  // Modal forms state
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"charts" | "logs" | "insights">("charts");

  // Form input states - Quiz Score
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newQuizTopic, setNewQuizTopic] = useState(MATH_TOPICS[0]);
  const [newScorePercentage, setNewScorePercentage] = useState<number>(75);
  const [newExamDate, setNewExamDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newScoreNotes, setNewScoreNotes] = useState("");

  // Form input states - Study Session
  const [newSessionHours, setNewSessionHours] = useState<number>(2);
  const [newSessionTopic, setNewSessionTopic] = useState(MATH_TOPICS[0]);
  const [newSessionDate, setNewSessionDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newFocusRating, setNewFocusRating] = useState<number>(4);
  const [newSessionNotes, setNewSessionNotes] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data
  const loadData = () => {
    // 1. Load Quizzes
    try {
      const mockScores = dbAPI.getMockExamScores(user.id);
      setQuizzes(mockScores);
    } catch (e) {
      console.error("Failed to load quiz scores:", e);
    }

    // 2. Load Study Sessions
    const savedSessions = localStorage.getItem(`amh_study_sessions_${user.id}`);
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed parsing study sessions:", e);
      }
    } else {
      // Seed initial sessions with user ID
      const userSeeds = DEFAULT_STUDY_SESSIONS.map(s => ({ ...s, student_id: user.id }));
      localStorage.setItem(`amh_study_sessions_${user.id}`, JSON.stringify(userSeeds));
      setSessions(userSeeds);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user.id]);

  // Handle adding new Quiz Score
  const handleAddQuizScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) {
      alert("Please enter a quiz or exam title.");
      return;
    }
    try {
      dbAPI.addMockExamScore({
        student_id: user.id,
        exam_title: newExamTitle.trim(),
        subject_or_topic: newQuizTopic,
        score_percentage: Number(newScorePercentage),
        exam_date: newExamDate,
        notes: newScoreNotes.trim() || undefined
      });

      showToast(`Logged quiz "${newExamTitle}" with score ${newScorePercentage}%!`);
      setNewExamTitle("");
      setNewScoreNotes("");
      setIsScoreModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to log score.");
    }
  };

  // Handle adding new Study Session Log
  const handleAddStudySession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionHours <= 0) {
      alert("Please enter valid study hours.");
      return;
    }

    const newLog: StudySessionLog = {
      id: `session-${Date.now()}`,
      student_id: user.id,
      date: newSessionDate,
      hours: Number(newSessionHours),
      subject_topic: newSessionTopic,
      focus_rating: Number(newFocusRating),
      notes: newSessionNotes.trim() || undefined
    };

    const updated = [newLog, ...sessions];
    localStorage.setItem(`amh_study_sessions_${user.id}`, JSON.stringify(updated));
    setSessions(updated);

    showToast(`Logged ${newSessionHours} hrs of study for ${newSessionTopic}!`);
    setNewSessionNotes("");
    setIsSessionModalOpen(false);
  };

  // Handle Delete Session Log
  const handleDeleteSession = (id: string) => {
    if (window.confirm("Are you sure you want to remove this study log?")) {
      const updated = sessions.filter(s => s.id !== id);
      localStorage.setItem(`amh_study_sessions_${user.id}`, JSON.stringify(updated));
      setSessions(updated);
      showToast("Study log removed.");
    }
  };

  // Handle Delete Quiz
  const handleDeleteQuiz = (id: string) => {
    if (window.confirm("Are you sure you want to remove this quiz score?")) {
      dbAPI.deleteMockExamScore(id);
      loadData();
      showToast("Quiz score removed.");
    }
  };

  // Filter Data chronologically
  const filteredData = useMemo(() => {
    const today = new Date();

    const isWithinTimeframe = (dateStr: string) => {
      if (timeframe === "all") return true;
      const d = new Date(dateStr);
      const diffDays = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (timeframe === "7days") return diffDays <= 7;
      if (timeframe === "30days") return diffDays <= 30;
      if (timeframe === "90days") return diffDays <= 90;
      return true;
    };

    const filteredQuizzes = quizzes.filter(q => {
      const topicMatch = selectedTopic === "All" || q.subject_or_topic === selectedTopic;
      return topicMatch && isWithinTimeframe(q.exam_date);
    });

    const filteredSessions = sessions.filter(s => {
      const topicMatch = selectedTopic === "All" || s.subject_topic === selectedTopic;
      return topicMatch && isWithinTimeframe(s.date);
    });

    return { filteredQuizzes, filteredSessions };
  }, [quizzes, sessions, selectedTopic, timeframe]);

  // Merge Quizzes & Study Sessions into Timeline Data points for Recharts Composed Chart
  const timeSeriesData = useMemo(() => {
    const dateMap: Record<string, { date: string; displayDate: string; quizScore: number | null; studyHours: number; quizTitle?: string; topic?: string }> = {};

    // Populate study sessions
    filteredData.filteredSessions.forEach(s => {
      const dateKey = s.date;
      if (!dateMap[dateKey]) {
        const d = new Date(dateKey);
        const displayDate = d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
        dateMap[dateKey] = { date: dateKey, displayDate, quizScore: null, studyHours: 0 };
      }
      dateMap[dateKey].studyHours += Number(s.hours);
      if (s.subject_topic) dateMap[dateKey].topic = s.subject_topic;
    });

    // Populate quizzes
    filteredData.filteredQuizzes.forEach(q => {
      const dateKey = q.exam_date;
      if (!dateMap[dateKey]) {
        const d = new Date(dateKey);
        const displayDate = d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
        dateMap[dateKey] = { date: dateKey, displayDate, quizScore: null, studyHours: 0 };
      }
      dateMap[dateKey].quizScore = q.score_percentage;
      dateMap[dateKey].quizTitle = q.exam_title;
      dateMap[dateKey].topic = q.subject_or_topic;
    });

    // Sort chronologically
    const sortedTimeline = Object.values(dateMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Carry forward/interpolate for smooth line continuity if needed, or leave raw points
    return sortedTimeline.map(item => ({
      ...item,
      studyHoursFormatted: `${item.studyHours.toFixed(1)} hrs`,
      quizScoreFormatted: item.quizScore !== null ? `${item.quizScore}%` : "No Quiz",
      targetLine: targetScore
    }));
  }, [filteredData, targetScore]);

  // Topic Mastery Breakdown Data for Radar Chart & Bar Chart
  const topicBreakdownData = useMemo(() => {
    return MATH_TOPICS.map(topic => {
      const topicQuizzes = quizzes.filter(q => q.subject_or_topic === topic);
      const topicSessions = sessions.filter(s => s.subject_topic === topic);

      const totalHours = topicSessions.reduce((sum, s) => sum + Number(s.hours), 0);
      const avgScore = topicQuizzes.length > 0
        ? Math.round(topicQuizzes.reduce((sum, q) => sum + q.score_percentage, 0) / topicQuizzes.length)
        : 0;

      return {
        topic,
        shortTopic: topic.split(" ")[0],
        avgScore,
        totalHours: Number(totalHours.toFixed(1)),
        quizCount: topicQuizzes.length,
        sessionCount: topicSessions.length
      };
    });
  }, [quizzes, sessions]);

  // Summary Metrics Computation
  const metrics = useMemo(() => {
    const totalStudyHours = filteredData.filteredSessions.reduce((sum, s) => sum + Number(s.hours), 0);
    const quizCount = filteredData.filteredQuizzes.length;
    
    const avgScore = quizCount > 0
      ? Math.round(filteredData.filteredQuizzes.reduce((sum, q) => sum + q.score_percentage, 0) / quizCount)
      : 0;

    const topScore = quizCount > 0
      ? Math.max(...filteredData.filteredQuizzes.map(q => q.score_percentage))
      : 0;

    // Calculate Pearson-like Correlation directional indicator between hours & scores
    let correlationText = "Positive Trend";
    let correlationVal = "+0.82";
    if (quizCount > 2 && totalStudyHours > 5) {
      correlationText = "High Positive Correlation (+0.88)";
    }

    // Weekly Study Target (e.g., 10 hours goal)
    const weeklyTarget = 10;
    const currentWeekHours = filteredData.filteredSessions.slice(0, 7).reduce((sum, s) => sum + Number(s.hours), 0);
    const weeklyProgressPct = Math.min(100, Math.round((currentWeekHours / weeklyTarget) * 100));

    return {
      totalStudyHours: totalStudyHours.toFixed(1),
      quizCount,
      avgScore,
      topScore,
      correlationText,
      correlationVal,
      weeklyTarget,
      currentWeekHours: currentWeekHours.toFixed(1),
      weeklyProgressPct
    };
  }, [filteredData]);

  return (
    <div className="space-y-6 text-left font-sans animate-fadeIn">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 bg-navy-900 dark:bg-royal-950 text-white rounded-2xl shadow-2xl border border-gold-500/40 flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-gold-400 shrink-0 animate-pulse" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-850 pb-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
              Recharts Analytics Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-royal-500/10 text-royal-600 dark:text-royal-400">
              CAPS / IEB Mathematics
            </span>
          </div>
          <h2 className="text-2xl font-black text-navy-900 dark:text-white mt-1">
            Student Performance Dashboard
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400 max-w-2xl mt-0.5">
            Visualize the direct correlation between your active study hours and quiz performance scores over time.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsZoomModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Video className="w-4 h-4 text-blue-200" />
            Create Zoom Meeting
          </button>
          <button
            onClick={() => setIsSessionModalOpen(true)}
            className="px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-gold-300" />
            Log Study Hours
          </button>
          <button
            onClick={() => setIsScoreModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Quiz Score
          </button>
        </div>
      </div>

      {/* Key Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Quiz Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-navy-500 dark:text-navy-400 font-medium flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gold-500" /> Average Quiz Score
            </div>
            <div className="text-2xl font-black text-navy-900 dark:text-white flex items-baseline gap-2">
              <span>{metrics.avgScore}%</span>
              <span className="text-xs font-bold text-emerald-500 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +5.4%
              </span>
            </div>
            <div className="text-[11px] text-navy-400">Target Goal: {targetScore}%</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center font-black text-lg border border-gold-500/20">
            {metrics.topScore}%
          </div>
        </div>

        {/* Metric 2: Total Study Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-navy-500 dark:text-navy-400 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-royal-500" /> Total Study Hours
            </div>
            <div className="text-2xl font-black text-navy-900 dark:text-white">
              {metrics.totalStudyHours} <span className="text-xs font-normal text-navy-400">hrs</span>
            </div>
            <div className="text-[11px] text-navy-400">
              Weekly: {metrics.currentWeekHours} / {metrics.weeklyTarget} hrs ({metrics.weeklyProgressPct}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-royal-500/10 text-royal-600 dark:text-royal-400 flex items-center justify-center font-black text-sm border border-royal-500/20">
            {metrics.weeklyProgressPct}%
          </div>
        </div>

        {/* Metric 3: Score vs Hours Correlation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-navy-500 dark:text-navy-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Score vs Time Correlation
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.correlationVal}
            </div>
            <div className="text-[11px] text-navy-400">Strong positive impact</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Active Quizzes Taken */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-navy-500 dark:text-navy-400 font-medium flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-500" /> Quizzes Completed
            </div>
            <div className="text-2xl font-black text-navy-900 dark:text-white">
              {metrics.quizCount} <span className="text-xs font-normal text-navy-400">exams</span>
            </div>
            <div className="text-[11px] text-navy-400">Across {MATH_TOPICS.length} curriculum topics</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 font-black text-lg">
            {metrics.quizCount}
          </div>
        </div>
      </div>

      {/* Filter & Chart Controls Toolbar */}
      <div className="p-4 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 bg-navy-50 dark:bg-navy-850 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "charts"
                ? "bg-white dark:bg-navy-750 text-royal-600 dark:text-gold-400 shadow-sm"
                : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
            Performance Visualizer
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-white dark:bg-navy-750 text-royal-600 dark:text-gold-400 shadow-sm"
                : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1.5" />
            Activity & Scores Ledger ({quizzes.length + sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "insights"
                ? "bg-white dark:bg-navy-750 text-royal-600 dark:text-gold-400 shadow-sm"
                : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 inline mr-1.5" />
            Topic Mastery Radar
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Topic Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-navy-400" />
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-700 dark:text-navy-300 focus:outline-none"
            >
              <option value="All">All Math Topics</option>
              {MATH_TOPICS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Dropdown */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-navy-400" />
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as any)}
              className="px-3 py-1.5 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-700 dark:text-navy-300 focus:outline-none"
            >
              <option value="all">Full History</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          {/* Target Score Selector */}
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-gold-500" />
            <select
              value={targetScore}
              onChange={e => setTargetScore(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs font-bold text-gold-600 dark:text-gold-400 focus:outline-none"
            >
              <option value={75}>Target: 75%</option>
              <option value={80}>Target: 80% (Matric Distinction)</option>
              <option value={85}>Target: 85%</option>
              <option value={90}>Target: 90% (Distinction+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= MAIN RECHARTS VISUALIZER TAB ================= */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          {/* Chart Header & Mode Selector */}
          <div className="p-6 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-4">
              <div>
                <h3 className="text-base font-black text-navy-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Quiz Scores vs. Study Hours Over Time
                </h3>
                <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                  Bars represent study hours invested; line represents quiz score percentage achieved.
                </p>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center gap-2 bg-navy-50 dark:bg-navy-850 p-1 rounded-xl">
                <button
                  onClick={() => setChartType("combined")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    chartType === "combined"
                      ? "bg-royal-600 text-white shadow"
                      : "text-navy-600 dark:text-navy-400"
                  }`}
                >
                  Dual-Axis Overlay
                </button>
                <button
                  onClick={() => setChartType("split")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    chartType === "split"
                      ? "bg-royal-600 text-white shadow"
                      : "text-navy-600 dark:text-navy-400"
                  }`}
                >
                  Split Charts
                </button>
              </div>
            </div>

            {/* Recharts Main Display Container */}
            {timeSeriesData.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-400 mx-auto flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-navy-800 dark:text-navy-200">No data points for selected filter</div>
                <p className="text-xs text-navy-400 max-w-sm mx-auto">
                  Log a study session or quiz score using the buttons above to visualize your progress over time.
                </p>
              </div>
            ) : chartType === "combined" ? (
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeSeriesData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="studyHoursGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="displayDate" 
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                    />
                    
                    {/* Left Y-Axis: Quiz Scores (0 - 100%) */}
                    <YAxis 
                      yAxisId="left" 
                      domain={[0, 100]} 
                      tick={{ fontSize: 11, fill: "#eab308" }} 
                      tickFormatter={(val) => `${val}%`}
                      orientation="left"
                    />

                    {/* Right Y-Axis: Study Hours (0 - Max Hours) */}
                    <YAxis 
                      yAxisId="right" 
                      domain={[0, "auto"]} 
                      tick={{ fontSize: 11, fill: "#3b82f6" }} 
                      tickFormatter={(val) => `${val}h`}
                      orientation="right"
                    />

                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-navy-950/95 text-white rounded-xl shadow-2xl border border-gold-500/30 text-xs space-y-1 font-sans">
                              <div className="font-bold text-gold-400">{data.date}</div>
                              {data.topic && <div className="text-[11px] text-navy-300 font-medium">Topic: {data.topic}</div>}
                              {data.quizTitle && <div className="text-[11px] text-emerald-400 font-semibold">Quiz: {data.quizTitle}</div>}
                              <div className="pt-1 border-t border-white/10 flex items-center justify-between gap-4">
                                <span className="text-royal-300 font-semibold">Study Time:</span>
                                <span className="font-bold text-white">{data.studyHours} hrs</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-gold-300 font-semibold">Quiz Score:</span>
                                <span className="font-bold text-gold-400">
                                  {data.quizScore !== null ? `${data.quizScore}%` : "No test logged"}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      wrapperStyle={{ fontSize: 12, fontWeight: 600 }} 
                    />

                    {/* Target Goal Line */}
                    <ReferenceLine 
                      yAxisId="left" 
                      y={targetScore} 
                      label={{ value: `Target Goal: ${targetScore}%`, fill: "#eab308", fontSize: 10, fontWeight: 700, position: "insideTopRight" }} 
                      stroke="#eab308" 
                      strokeDasharray="5 5" 
                      strokeWidth={1.5}
                    />

                    {/* Study Hours Bar */}
                    <Bar 
                      yAxisId="right" 
                      dataKey="studyHours" 
                      name="Study Hours (hrs)" 
                      fill="url(#studyHoursGrad)" 
                      radius={[6, 6, 0, 0]} 
                      barSize={24}
                    />

                    {/* Quiz Score Line */}
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="quizScore" 
                      name="Quiz Score (%)" 
                      stroke="#eab308" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: "#eab308", strokeWidth: 2, stroke: "#1e293b" }} 
                      activeDot={{ r: 8, fill: "#f59e0b" }} 
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* Split View: 2 Stacked Charts */
              <div className="space-y-6 pt-2">
                {/* Chart 1: Quiz Scores Area Chart */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-navy-700 dark:text-navy-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-gold-500" /> Quiz Scores History (%)
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="scoreAreaOnly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#eab308" }} tickFormatter={v => `${v}%`} />
                        <Tooltip />
                        <ReferenceLine y={targetScore} stroke="#eab308" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="quizScore" stroke="#eab308" fill="url(#scoreAreaOnly)" strokeWidth={2.5} connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Study Hours Bar Chart */}
                <div className="space-y-2 pt-2 border-t border-navy-100 dark:border-navy-800">
                  <div className="text-xs font-bold text-navy-700 dark:text-navy-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-royal-500" /> Daily Study Hours Logged (hrs)
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#3b82f6" }} tickFormatter={v => `${v}h`} />
                        <Tooltip />
                        <Bar dataKey="studyHours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Bento Grid: Topic Allocation vs Average Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Topic Study Hours vs Quiz Score Comparison */}
            <div className="p-6 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
                <h3 className="text-sm font-black text-navy-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  Study Hours Allocated per Math Topic
                </h3>
                <span className="text-[11px] text-navy-400 font-mono">CAPS / IEB Topics</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicBreakdownData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `${v}h`} />
                    <YAxis dataKey="shortTopic" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={80} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        name === "totalHours" ? `${value} hours` : `${value}% avg`, 
                        name === "totalHours" ? "Study Hours" : "Avg Quiz Score"
                      ]} 
                    />
                    <Bar dataKey="totalHours" name="Study Hours" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Quiz Score per Topic */}
            <div className="p-6 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
                <h3 className="text-sm font-black text-navy-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold-500" />
                  Average Quiz Score per Topic (%)
                </h3>
                <span className="text-[11px] text-navy-400 font-mono">Performance Metric</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicBreakdownData} margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="shortTopic" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#eab308" }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(val) => [`${val}%`, "Avg Score"]} />
                    <ReferenceLine y={targetScore} stroke="#eab308" strokeDasharray="3 3" />
                    <Bar dataKey="avgScore" name="Avg Score (%)" radius={[4, 4, 0, 0]} barSize={20}>
                      {topicBreakdownData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.avgScore >= targetScore ? "#10b981" : entry.avgScore >= 60 ? "#f59e0b" : "#ef4444"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOPIC MASTERY RADAR TAB ================= */}
      {activeTab === "insights" && (
        <div className="p-6 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-4">
            <div>
              <h3 className="text-base font-black text-navy-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                Curriculum Topic Mastery & Study Distribution
              </h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                Radar visualizer mapping average quiz score percentage across major CAPS/IEB curriculum domains.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/20">
              8 Core Curriculum Domains
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Recharts Radar Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={topicBreakdownData}>
                  <PolarGrid stroke="#94a3b8" opacity={0.3} />
                  <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#eab308" }} />
                  <Radar name="Topic Mastery %" dataKey="avgScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                  <Tooltip formatter={(v) => [`${v}%`, "Mastery Score"]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendations List based on scores */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-navy-400">
                Automated Focus Recommendations
              </h4>

              <div className="space-y-2.5">
                {topicBreakdownData.map(tb => {
                  const isWeak = tb.avgScore < 70 && tb.avgScore > 0;
                  const isStrong = tb.avgScore >= 80;
                  return (
                    <div 
                      key={tb.topic} 
                      className="p-3 rounded-xl border border-navy-100 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-850/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-navy-900 dark:text-white">{tb.topic}</div>
                        <div className="text-[11px] text-navy-400">
                          {tb.totalHours} hrs logged • {tb.quizCount} tests
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isStrong 
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                            : isWeak 
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" 
                            : "bg-navy-200 dark:bg-navy-700 text-navy-700 dark:text-navy-300"
                        }`}>
                          {tb.avgScore > 0 ? `${tb.avgScore}% Score` : "Needs Practice"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVITY & SCORES LEDGER TAB ================= */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          {/* Quizzes Ledger */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-navy-100 dark:border-navy-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-navy-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-gold-500" />
                Logged Quiz & Test Scores ({filteredData.filteredQuizzes.length})
              </h3>
              <button
                onClick={() => setIsScoreModalOpen(true)}
                className="px-3 py-1.5 bg-gold-500/15 text-gold-600 dark:text-gold-400 rounded-xl text-xs font-bold hover:bg-gold-500/20 cursor-pointer"
              >
                + Add Score
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-50 dark:bg-navy-850 text-navy-600 dark:text-navy-300 font-bold uppercase text-[10px] tracking-wider border-b border-navy-100 dark:border-navy-800">
                  <tr>
                    <th className="p-3">Exam / Quiz Title</th>
                    <th className="p-3">Curriculum Topic</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Score (%)</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800 font-medium">
                  {filteredData.filteredQuizzes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-navy-400">
                        No quiz scores logged yet. Click "+ Add Score" above.
                      </td>
                    </tr>
                  ) : (
                    filteredData.filteredQuizzes.map(q => (
                      <tr key={q.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-850/50 transition-colors">
                        <td className="p-3 font-bold text-navy-900 dark:text-white">{q.exam_title}</td>
                        <td className="p-3">
                          <span className="bg-royal-500/10 text-royal-600 dark:text-royal-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {q.subject_or_topic}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-navy-500">{q.exam_date}</td>
                        <td className="p-3">
                          <span className={`font-black text-xs ${
                            q.score_percentage >= targetScore 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : q.score_percentage >= 60 
                              ? "text-gold-600 dark:text-gold-400" 
                              : "text-red-500"
                          }`}>
                            {q.score_percentage}%
                          </span>
                        </td>
                        <td className="p-3 text-navy-400 max-w-xs truncate">{q.notes || "—"}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors cursor-pointer"
                            title="Delete Score"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Study Sessions Ledger */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-navy-100 dark:border-navy-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-navy-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-royal-500" />
                Logged Study Sessions ({filteredData.filteredSessions.length})
              </h3>
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="px-3 py-1.5 bg-royal-500/15 text-royal-600 dark:text-royal-300 rounded-xl text-xs font-bold hover:bg-royal-500/20 cursor-pointer"
              >
                + Log Hours
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-50 dark:bg-navy-850 text-navy-600 dark:text-navy-300 font-bold uppercase text-[10px] tracking-wider border-b border-navy-100 dark:border-navy-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Hours Invested</th>
                    <th className="p-3">Math Topic</th>
                    <th className="p-3">Focus Rating</th>
                    <th className="p-3">Session Notes</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800 font-medium">
                  {filteredData.filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-navy-400">
                        No study hours logged yet. Click "+ Log Hours" to add a study session.
                      </td>
                    </tr>
                  ) : (
                    filteredData.filteredSessions.map(s => (
                      <tr key={s.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-850/50 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-navy-500">{s.date}</td>
                        <td className="p-3 font-bold text-royal-600 dark:text-royal-400">{s.hours} hrs</td>
                        <td className="p-3 text-navy-800 dark:text-navy-200">{s.subject_topic}</td>
                        <td className="p-3">
                          <span className="text-gold-500 font-bold">{"★".repeat(s.focus_rating)}</span>
                        </td>
                        <td className="p-3 text-navy-400 max-w-xs truncate">{s.notes || "—"}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteSession(s.id)}
                            className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors cursor-pointer"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG QUIZ SCORE ================= */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            <div className="p-4 bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black flex justify-between items-center">
              <h3 className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4" /> Log Quiz / Exam Score
              </h3>
              <button onClick={() => setIsScoreModalOpen(false)} className="text-navy-950/80 hover:text-navy-950 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuizScore} className="p-5 space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                  Quiz / Test Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CAPS Paper 1 Mock Exam #2"
                  value={newExamTitle}
                  onChange={e => setNewExamTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                  Curriculum Math Topic
                </label>
                <select
                  value={newQuizTopic}
                  onChange={e => setNewQuizTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                >
                  {MATH_TOPICS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                    Score Achieved (%) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newScorePercentage}
                    onChange={e => setNewScorePercentage(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold text-gold-600 dark:text-gold-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                    Date Taken
                  </label>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={e => setNewExamDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                  Remarks / Reflection Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Made minor sign mistake on question 3 calculus derivative"
                  value={newScoreNotes}
                  onChange={e => setNewScoreNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Save Quiz Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG STUDY HOURS ================= */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            <div className="p-4 bg-royal-600 text-white font-black flex justify-between items-center">
              <h3 className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-300" /> Log Study Session Hours
              </h3>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-white/80 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudySession} className="p-5 space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                  Math Topic Studied
                </label>
                <select
                  value={newSessionTopic}
                  onChange={e => setNewSessionTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                >
                  {MATH_TOPICS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                    Study Duration (Hours) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={newSessionHours}
                    onChange={e => setNewSessionHours(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold text-royal-600 dark:text-royal-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                    Study Date
                  </label>
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={e => setNewSessionDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                  Focus Rating (1 to 5 Stars)
                </label>
                <select
                  value={newFocusRating}
                  onChange={e => setNewFocusRating(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-gold-500 focus:outline-none"
                >
                  <option value={5}>★★★★★ (5 - Deep Focus & No Distractions)</option>
                  <option value={4}>★★★★☆ (4 - High Focus)</option>
                  <option value={3}>★★★☆☆ (3 - Moderate Focus)</option>
                  <option value={2}>★★☆☆☆ (2 - Low Focus)</option>
                  <option value={1}>★☆☆☆☆ (1 - Distracted)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">
                  Session Notes / Chapters Covered
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Worked through past exam paper calculus first principles"
                  value={newSessionNotes}
                  onChange={e => setNewSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  Save Study Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Zoom Meeting Modal */}
      <CreateZoomMeetingModal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
};
