import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  CheckCircle, 
  Calendar, 
  Filter, 
  Clock, 
  Target, 
  Plus, 
  Trash2, 
  BarChart2, 
  Award, 
  Sliders, 
  X, 
  BookOpen, 
  Flame, 
  Sparkles, 
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  ReferenceLine 
} from "recharts";
import { MockExamScore, Profile } from "../types";
import { dbAPI } from "../lib/db";

interface StudentProgressAnalyticsProps {
  user: Profile;
}

interface StudyGoal {
  id: string;
  text: string;
  completed: boolean;
  targetDate: string;
  subject?: string; // Optional explicit subject tag
}

// South African CAPS/IEB standard mathematical topics
const MATH_TOPICS = [
  "Algebra & Equations",
  "Sequences & Series",
  "Functions & Graphs",
  "Financial Mathematics",
  "Differential Calculus",
  "Analytical Geometry",
  "Trigonometry",
  "Euclidean Geometry",
  "Probability & Counting",
  "Statistics & Data"
];

export const StudentProgressAnalytics: React.FC<StudentProgressAnalyticsProps> = ({ user }) => {
  // 1. STATE FOR STUDY GOALS & QUIZZES
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [quizzes, setQuizzes] = useState<MockExamScore[]>([]);
  
  // 2. FILTERS
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("All"); // All, 7days, 30days, 90days, term

  // 3. GOAL CREATION STATE
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalSubject, setNewGoalSubject] = useState(MATH_TOPICS[0]);
  const [newGoalDate, setNewGoalDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState("");

  // 4. LOAD DATA ON MOUNT / CHANGE
  const loadData = () => {
    // Load Goals
    const savedGoalsStr = localStorage.getItem("amaris_session_goals");
    if (savedGoalsStr) {
      try {
        const parsed = JSON.parse(savedGoalsStr) as StudyGoal[];
        setGoals(parsed);
      } catch (err) {
        console.error("Error parsing goals:", err);
      }
    } else {
      // Seed default goals if empty
      const seeds: StudyGoal[] = [
        { id: "g1", text: "Master Trigonometric identities and compound angle proofs", completed: false, targetDate: "2026-07-25", subject: "Trigonometry" },
        { id: "g2", text: "Complete Calculus Optimization Assignment with 80%+", completed: true, targetDate: "2026-07-08", subject: "Differential Calculus" },
        { id: "g3", text: "Attempt CAPS 2024 Mathematics Paper 1 past exam paper", completed: false, targetDate: "2026-07-30", subject: "Algebra & Equations" },
        { id: "g4", text: "Review vertical projectile motion formulas & diagrams", completed: false, targetDate: "2026-08-05", subject: "Functions & Graphs" }
      ];
      localStorage.setItem("amaris_session_goals", JSON.stringify(seeds));
      setGoals(seeds);
    }

    // Load Quiz / Mock scores
    try {
      const data = dbAPI.getMockExamScores(user.id);
      // Sort chronologically
      const sorted = [...data].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
      setQuizzes(sorted);
    } catch (err) {
      console.error("Error fetching mock scores:", err);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen for custom storage events to stay in sync if updated elsewhere
    const syncOnStorage = () => loadData();
    window.addEventListener("storage", syncOnStorage);
    return () => window.removeEventListener("storage", syncOnStorage);
  }, [user.id]);

  // Dynamic automatic detector for subject keyword matching if explicit subject doesn't exist
  const detectSubjectFromText = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("trig") || lower.includes("sine") || lower.includes("cosine") || lower.includes("tangent") || lower.includes("angle") || lower.includes("reduction") || lower.includes("identity")) return "Trigonometry";
    if (lower.includes("calculus") || lower.includes("deriv") || lower.includes("limit") || lower.includes("optim") || lower.includes("first principles")) return "Differential Calculus";
    if (lower.includes("algebra") || lower.includes("quadratic") || lower.includes("root") || lower.includes("equation") || lower.includes("surd") || lower.includes("exponent")) return "Algebra & Equations";
    if (lower.includes("pattern") || lower.includes("sequence") || lower.includes("series") || lower.includes("sigma") || lower.includes("arithmetic") || lower.includes("geometric")) return "Sequences & Series";
    if (lower.includes("function") || lower.includes("graph") || lower.includes("parabola") || lower.includes("hyperbola") || lower.includes("log") || lower.includes("inverse")) return "Functions & Graphs";
    if (lower.includes("finance") || lower.includes("interest") || lower.includes("annuit") || lower.includes("loan") || lower.includes("sinking") || lower.includes("balance")) return "Financial Mathematics";
    if (lower.includes("analytical") || lower.includes("coordinate") || lower.includes("circle") || lower.includes("tangent to circle")) return "Analytical Geometry";
    if (lower.includes("euclidean") || lower.includes("theorem") || lower.includes("similarity") || lower.includes("proportion") || lower.includes("riders")) return "Euclidean Geometry";
    if (lower.includes("prob") || lower.includes("counting") || lower.includes("permutation") || lower.includes("combination") || lower.includes("venn") || lower.includes("bayes")) return "Probability & Counting";
    if (lower.includes("stat") || lower.includes("data") || lower.includes("regression") || lower.includes("ogive") || lower.includes("box") || lower.includes("deviation")) return "Statistics & Data";
    return "Algebra & Equations"; // Default fallback
  };

  // Get active subject tag for a goal
  const getGoalSubject = (goal: StudyGoal): string => {
    return goal.subject || detectSubjectFromText(goal.text);
  };

  // 5. HELPER: FILTER BY TIME RANGE
  const filterByTime = (dateStr: string): boolean => {
    if (selectedTimeRange === "All") return true;
    
    const itemDate = new Date(dateStr);
    const today = new Date();
    const diffTime = today.getTime() - itemDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (selectedTimeRange === "7days") return diffDays <= 7 && diffDays >= 0;
    if (selectedTimeRange === "30days") return diffDays <= 30 && diffDays >= 0;
    if (selectedTimeRange === "90days") return diffDays <= 90 && diffDays >= 0;
    if (selectedTimeRange === "term") {
      // South African school terms roughly: filter for this calendar year's second half (June onwards for trial prep)
      return itemDate.getFullYear() === 2026 && itemDate.getMonth() >= 5; // June onwards
    }
    return true;
  };

  // 6. PROCESS FILTERED DATA
  const processedGoals = goals.map(g => ({
    ...g,
    resolvedSubject: getGoalSubject(g)
  })).filter(g => {
    const matchesSubject = selectedSubject === "All" || g.resolvedSubject === selectedSubject;
    const matchesTime = filterByTime(g.targetDate);
    return matchesSubject && matchesTime;
  });

  const processedQuizzes = quizzes.filter(q => {
    const matchesSubject = selectedSubject === "All" || q.subject_or_topic === selectedSubject;
    const matchesTime = filterByTime(q.exam_date);
    return matchesSubject && matchesTime;
  });

  // 7. COMPUTE STATS
  const totalGoalsCount = processedGoals.length;
  const completedGoalsCount = processedGoals.filter(g => g.completed).length;
  const goalCompletionRate = totalGoalsCount > 0 
    ? Math.round((completedGoalsCount / totalGoalsCount) * 100) 
    : 0;

  const quizCount = processedQuizzes.length;
  const averageQuizScore = quizCount > 0
    ? Math.round(processedQuizzes.reduce((sum, q) => sum + q.score_percentage, 0) / quizCount)
    : 0;

  const highestScore = quizCount > 0
    ? Math.max(...processedQuizzes.map(q => q.score_percentage))
    : 0;

  // Calculate study streak - count of completed goals
  const activeStreak = goals.filter(g => g.completed).length;

  // 8. DATA FOR RECHARTS
  // Graph A: Goals Completion Rate by Subject Chapter
  const getGoalsChartData = () => {
    // Prepare structures for all Math Topics or just the filtered one
    const topicsToInclude = selectedSubject === "All" ? MATH_TOPICS : [selectedSubject];
    
    return topicsToInclude.map(topic => {
      const topicGoals = goals.map(g => ({ ...g, resolvedSubject: getGoalSubject(g) }))
                            .filter(g => g.resolvedSubject === topic);
      const total = topicGoals.length;
      const completed = topicGoals.filter(g => g.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        subject: topic,
        "Total Goals": total,
        "Completed Goals": completed,
        "Completion Rate %": rate
      };
    }).filter(d => d["Total Goals"] > 0); // Only show topics that have at least one goal
  };

  const goalsChartData = getGoalsChartData();

  // Graph B: Quiz Performance Curve
  const getQuizChartData = () => {
    return processedQuizzes.map(q => {
      try {
        const d = new Date(q.exam_date);
        const formattedDate = d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
        return {
          ...q,
          formattedDate,
          "Score %": q.score_percentage,
          "Class Average": 68 // Reference line comparison
        };
      } catch (e) {
        return {
          ...q,
          formattedDate: q.exam_date,
          "Score %": q.score_percentage,
          "Class Average": 68
        };
      }
    });
  };

  const quizChartData = getQuizChartData();

  // 9. EVENT HANDLERS
  const handleToggleGoal = (id: string) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        return { ...g, completed: !g.completed };
      }
      return g;
    });
    setGoals(updated);
    localStorage.setItem("amaris_session_goals", JSON.stringify(updated));
    
    // Trigger storage event manually to notify other components
    window.dispatchEvent(new Event("storage"));
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("Are you sure you want to remove this study goal?")) {
      const updated = goals.filter(g => g.id !== id);
      setGoals(updated);
      localStorage.setItem("amaris_session_goals", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalFeedback("");

    if (!newGoalText.trim()) {
      setGoalFeedback("Goal description cannot be empty.");
      return;
    }

    const newGoal: StudyGoal = {
      id: "goal-" + Date.now(),
      text: newGoalText.trim(),
      completed: false,
      targetDate: newGoalDate || new Date().toISOString().split("T")[0],
      subject: newGoalSubject
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    localStorage.setItem("amaris_session_goals", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));

    // Reset Form
    setNewGoalText("");
    setIsGoalFormOpen(false);
    setGoalFeedback("Goal added successfully!");
    setTimeout(() => setGoalFeedback(""), 3000);
  };

  // CAPS level descriptor helper
  const getCAPSDescriptor = (percent: number) => {
    if (percent >= 80) return { code: "Level 7", label: "Outstanding (Distinction)", color: "text-amber-500 border-amber-500/20 bg-amber-500/5" };
    if (percent >= 70) return { code: "Level 6", label: "Meritorious", color: "text-royal-500 border-royal-500/20 bg-royal-500/5" };
    if (percent >= 60) return { code: "Level 5", label: "Substantial", color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" };
    if (percent >= 50) return { code: "Level 4", label: "Adequate (Pass)", color: "text-blue-500 border-blue-500/20 bg-blue-500/5" };
    return { code: "Level 1-3", label: "Requires Intervention", color: "text-red-500 border-red-500/20 bg-red-500/5" };
  };

  const averageLevel = getCAPSDescriptor(averageQuizScore);

  return (
    <div id="student-progress-analytics-root" className="space-y-6 text-left">
      
      {/* 1. BRANDED SUB-HEADER & FILTER BAR */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5.5 h-5.5 text-royal-600 dark:text-gold-400" />
              <h3 className="text-base sm:text-lg font-black text-navy-900 dark:text-white uppercase tracking-tight font-display">
                Interactive Learning Analytics Dashboard
              </h3>
            </div>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Correlate syllabus study goal achievements with your school assessment marks using custom multi-variable filtering.
            </p>
          </div>

          <button
            onClick={() => setIsGoalFormOpen(!isGoalFormOpen)}
            className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            {isGoalFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isGoalFormOpen ? "Close Planner" : "Schedule Study Goal"}</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-navy-100 dark:border-navy-850">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-navy-600 dark:text-navy-300">
            <Filter className="w-3.5 h-3.5 text-royal-500" />
            <span>Active Filters:</span>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-black text-navy-400 uppercase">Chapter/Syllabus:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
            >
              <option value="All">All Chapters (Cumulative)</option>
              {MATH_TOPICS.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-black text-navy-400 uppercase">Time Horizon:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
            >
              <option value="All">All History</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="term">Matric Trial Cycle (2026 Term 3)</option>
            </select>
          </div>

          {/* Reset Filters Quick Button */}
          {(selectedSubject !== "All" || selectedTimeRange !== "All") && (
            <button
              onClick={() => { setSelectedSubject("All"); setSelectedTimeRange("All"); }}
              className="text-[10px] font-mono text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-0.5"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Slide down Goal Creator Form */}
      <AnimatePresence>
        {isGoalFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleAddGoalSubmit}
              className="p-5 bg-navy-50/50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-800 rounded-2xl space-y-4"
            >
              <h4 className="text-xs font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-royal-500" />
                Schedule Custom Syllabus Study Goal
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Text input */}
                <div className="md:col-span-6 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Goal Description / Actionable Metric *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Master the quadratic formula nature of roots algebraic proofs"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 placeholder-navy-300 dark:placeholder-navy-600"
                  />
                </div>

                {/* Subject selection */}
                <div className="md:col-span-3 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Syllabus Chapter *
                  </label>
                  <select
                    value={newGoalSubject}
                    onChange={(e) => setNewGoalSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  >
                    {MATH_TOPICS.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                {/* Target Date */}
                <div className="md:col-span-3 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Target Completion Date
                  </label>
                  <input 
                    type="date"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-100 dark:border-navy-850">
                <button
                  type="button"
                  onClick={() => setIsGoalFormOpen(false)}
                  className="px-3 py-1.5 border border-navy-200 dark:border-navy-800 hover:bg-navy-100 dark:hover:bg-navy-900 text-xs text-navy-700 dark:text-navy-300 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm"
                >
                  Save Study Goal
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Feedback Messaging */}
      {goalFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl flex items-center gap-2 font-mono">
          <CheckCircle className="w-4 h-4" />
          <span>{goalFeedback}</span>
        </div>
      )}

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Metric 1: Goals Completion Rate */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1">
          <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Goals Completed</span>
          <div className="text-2xl font-black text-royal-600 dark:text-gold-400 mt-1 flex items-baseline gap-1">
            <span>{goalCompletionRate}%</span>
            <span className="text-xs font-mono font-normal text-navy-500">({completedGoalsCount}/{totalGoalsCount})</span>
          </div>
          <div className="w-full bg-navy-100 dark:bg-navy-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-royal-500 h-full" style={{ width: `${goalCompletionRate}%` }} />
          </div>
        </div>

        {/* Metric 2: Quiz Average Mark */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1">
          <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Quiz Average Score</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {quizCount > 0 ? `${averageQuizScore}%` : "No tests"}
          </div>
          <span className={`inline-block text-[8px] font-mono font-black border px-1.5 py-0.2 rounded mt-2 uppercase ${averageLevel.color}`}>
            {quizCount > 0 ? averageLevel.code : "N/A"}: {quizCount > 0 ? averageLevel.label : "Log Scores"}
          </span>
        </div>

        {/* Metric 3: Highest Mark Filtered */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Highest Mark</span>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {quizCount > 0 ? `${highestScore}%` : "N/A"}
            </div>
          </div>
          <span className="text-[9px] font-mono text-navy-500">In filtered time & topic</span>
        </div>

        {/* Metric 4: Goal Mastery Streak */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Mastery Index</span>
            <div className="text-2xl font-black text-royal-600 dark:text-gold-400 mt-1 flex items-center gap-1">
              <Flame className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{activeStreak} Mastered</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-navy-500">Cumulative goals met</span>
        </div>
      </div>

      {/* 3. DOUBLE RECHARTS GRAPH VISUALIZATION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRAPH A: GOAL COMPLETION RATES BY TOPIC */}
        <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40 text-left">
          <div className="space-y-1 mb-6 border-b border-navy-100 dark:border-navy-850 pb-3">
            <h3 className="text-xs sm:text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-royal-500" />
              Syllabus Study Goal Achievement Rate
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Breakdown of custom study goals completed vs scheduled per core CAPS/IEB topic
            </p>
          </div>

          {goalsChartData.length > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800" />
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 9 }} 
                    className="text-navy-400 font-mono"
                    tickFormatter={(val) => val.split(" & ")[0].split(" ")[0]} // Truncate long labels
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }} 
                    className="text-navy-400 font-mono" 
                    allowDecimals={false} 
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11, background: "#0f172a", border: "none", color: "#fff", borderRadius: 8 }}
                    cursor={{ fill: "rgba(37, 99, 235, 0.05)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }} />
                  <Bar dataKey="Completed Goals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total Goals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-72 flex flex-col items-center justify-center border border-dashed border-navy-200 dark:border-navy-800 rounded-xl space-y-2 text-center p-4">
              <BookOpen className="w-8 h-8 text-navy-300 dark:text-navy-700" />
              <p className="text-xs font-bold text-navy-700 dark:text-navy-300">No Goal Data in Active Filter</p>
              <p className="text-[10px] text-navy-400 max-w-xs leading-normal">
                Schedule study goals for <b>{selectedSubject !== "All" ? selectedSubject : "Maths Chapters"}</b> using the goal planner at the top right to view real-time completion analytics.
              </p>
            </div>
          )}
        </div>

        {/* GRAPH B: QUIZ PERFORMANCE TRENDS */}
        <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40 text-left">
          <div className="space-y-1 mb-6 border-b border-navy-100 dark:border-navy-850 pb-3">
            <h3 className="text-xs sm:text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Filtered Quiz & Test Performance Trends
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Chronological progress tracking with comparative CAPS distinction baseline reference ceilings
            </p>
          </div>

          {quizChartData.length > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quizChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800" />
                  <XAxis dataKey="formattedDate" tick={{ fontSize: 9 }} className="text-navy-400 font-mono" />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 30, 50, 70, 80, 100]} 
                    tick={{ fontSize: 9 }} 
                    className="text-navy-400 font-mono" 
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const scoreData = payload[0].payload as MockExamScore;
                        const lvl = getCAPSDescriptor(scoreData.score_percentage);
                        return (
                          <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-xl max-w-xs space-y-1 text-left font-sans">
                            <div className="text-[9px] text-navy-400 font-mono font-bold uppercase">{scoreData.exam_date}</div>
                            <div className="text-xs font-black text-white">{scoreData.exam_title}</div>
                            <div className="text-[11px] font-mono text-emerald-400">
                              Mark secured: <b className="text-gold-400">{scoreData.score_percentage}%</b>
                            </div>
                            <div className="text-[10px] text-slate-300 font-mono">Topic: {scoreData.subject_or_topic}</div>
                            <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded font-black uppercase ${lvl.color}`}>
                              {lvl.code} Descriptors
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* distinction line */}
                  <ReferenceLine 
                    y={80} 
                    stroke="#eab308" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Level 7 Boundary (80%)', fill: '#eab308', fontSize: 8, position: 'insideBottomRight' }} 
                  />
                  {/* pass boundary line */}
                  <ReferenceLine 
                    y={50} 
                    stroke="#3b82f6" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Adequate Boundary (50%)', fill: '#3b82f6', fontSize: 8, position: 'insideBottomRight' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Score %" 
                    stroke="#eab308" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#analyticsScoreGrad)"
                    dot={{ r: 4, strokeWidth: 1.5, stroke: "#eab308", fill: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-72 flex flex-col items-center justify-center border border-dashed border-navy-200 dark:border-navy-800 rounded-xl space-y-2 text-center p-4">
              <TrendingUp className="w-8 h-8 text-navy-300 dark:text-navy-700" />
              <p className="text-xs font-bold text-navy-700 dark:text-navy-300">No Quiz Scores Recorded in Filter</p>
              <p className="text-[10px] text-navy-400 max-w-xs leading-normal">
                No quiz scores were logged for the selected options. Go to the <b>Mock Performance</b> tab to record new test results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTIVE STUDY CHECKLIST INTEGRATION WITH IMMEDIATE CHART-UPDATE CALLBACKS */}
      <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-navy-100 dark:border-navy-850 gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Target className="w-4 h-4 text-royal-500" />
              Filtered Study Goals Master Checklist
            </h4>
            <p className="text-[11px] text-navy-500 dark:text-navy-400">
              Complete goals in the checkbox list below; your Recharts rates above will dynamically recalculate immediately!
            </p>
          </div>
          <span className="text-[10px] font-mono text-navy-400 whitespace-nowrap bg-navy-50 dark:bg-navy-950 px-2.5 py-1 rounded-lg border border-navy-100 dark:border-navy-800">
            Matching Goals: <b>{totalGoalsCount}</b>
          </span>
        </div>

        {processedGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {processedGoals.map(goal => (
              <div 
                key={goal.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  goal.completed 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-navy-900 dark:text-white" 
                    : "bg-white dark:bg-navy-950 border-navy-150 dark:border-navy-850"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggleGoal(goal.id)}
                    className={`mt-0.5 w-4.5 h-4.5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                      goal.completed 
                        ? "bg-emerald-500 border-emerald-600 text-white" 
                        : "border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-900"
                    }`}
                  >
                    {goal.completed && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  <div className="text-left space-y-0.5">
                    <span className={`text-xs font-medium block leading-snug ${goal.completed ? "line-through text-navy-400 dark:text-navy-500" : ""}`}>
                      {goal.text}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[9px] text-navy-400">
                      <span>Target: <b>{goal.targetDate}</b></span>
                      <span className="text-royal-600 dark:text-gold-400 font-bold bg-royal-100/40 dark:bg-navy-850 px-1.5 py-0.2 rounded border border-royal-200/20">
                        {goal.resolvedSubject}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-1.5 text-navy-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center border border-dashed border-navy-200 dark:border-navy-800 rounded-xl space-y-2">
            <Clock className="w-8 h-8 text-navy-300 dark:text-navy-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-navy-800 dark:text-white">No Matched Goals Available</p>
              <p className="text-[10px] text-navy-400 max-w-xs mx-auto leading-normal">
                No active goals matched your subject/chapter filters. Set your selectors to <b>All Chapters</b> or create a new goal with this tag!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. DYNAMIC SYLLABUS INSIGHTS BOX */}
      <div className="flex items-start gap-3 bg-royal-50/30 dark:bg-navy-950/20 p-4 rounded-xl border border-royal-100/30 dark:border-navy-850">
        <Sparkles className="w-5 h-5 text-royal-600 dark:text-gold-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-navy-900 dark:text-white uppercase font-mono tracking-wide">
            Syllabus Coverage Correlation Advice
          </h5>
          <p className="text-[11px] text-navy-600 dark:text-navy-400 leading-relaxed">
            By checking off core syllabus modules as "completed goals" and logging corresponding test scores, you can track whether your understanding matches your performance. 
            If your goal completion rate is high (80%+) for a chapter like <b>Differential Calculus</b>, but your quiz average remains below 60%, prioritize scheduling a whiteboard coaching lesson with <b>Tutor Bethuel</b> to resolve hidden conceptual weaknesses!
          </p>
        </div>
      </div>

    </div>
  );
};
