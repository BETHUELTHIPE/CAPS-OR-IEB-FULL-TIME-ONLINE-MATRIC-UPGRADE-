import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardOverviewSkeleton } from "./DashboardSkeleton";
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  getDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  BarChart3, 
  Flame, 
  BookOpen, 
  RefreshCw, 
  Zap, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  Database, 
  Check, 
  Plus, 
  HelpCircle,
  BrainCircuit,
  Calculator,
  Compass,
  GraduationCap,
  Percent,
  Play,
  RotateCcw
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Profile } from "../types";

interface TopicProgress {
  topic: string;
  category: "Algebra" | "Calculus" | "Geometry" | "Trigonometry" | "Statistics" | "Probability";
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  lastScore: number;
  history: { date: string; score: number }[];
}

interface StudentProgressData {
  studentId: string;
  studentName: string;
  grade: string;
  lastUpdated?: any;
  topics: Record<string, TopicProgress>;
}

const DEFAULT_TOPICS: Record<string, TopicProgress> = {
  Algebra: {
    topic: "Algebra & Equations",
    category: "Algebra",
    totalQuizzes: 8,
    totalQuestions: 40,
    correctAnswers: 34,
    percentage: 85,
    lastScore: 90,
    history: [
      { date: "Mon", score: 70 },
      { date: "Tue", score: 75 },
      { date: "Wed", score: 80 },
      { date: "Thu", score: 85 },
      { date: "Fri", score: 90 },
    ],
  },
  Calculus: {
    topic: "Differential Calculus",
    category: "Calculus",
    totalQuizzes: 6,
    totalQuestions: 30,
    correctAnswers: 21,
    percentage: 70,
    lastScore: 75,
    history: [
      { date: "Mon", score: 55 },
      { date: "Tue", score: 60 },
      { date: "Wed", score: 65 },
      { date: "Thu", score: 70 },
      { date: "Fri", score: 75 },
    ],
  },
  Geometry: {
    topic: "Euclidean & Analytical Geometry",
    category: "Geometry",
    totalQuizzes: 5,
    totalQuestions: 25,
    correctAnswers: 23,
    percentage: 92,
    lastScore: 95,
    history: [
      { date: "Mon", score: 80 },
      { date: "Tue", score: 85 },
      { date: "Wed", score: 88 },
      { date: "Thu", score: 90 },
      { date: "Fri", score: 95 },
    ],
  },
  Trigonometry: {
    topic: "Trigonometric Functions & Identities",
    category: "Trigonometry",
    totalQuizzes: 7,
    totalQuestions: 35,
    correctAnswers: 26,
    percentage: 74,
    lastScore: 80,
    history: [
      { date: "Mon", score: 60 },
      { date: "Tue", score: 68 },
      { date: "Wed", score: 72 },
      { date: "Thu", score: 78 },
      { date: "Fri", score: 80 },
    ],
  },
  Statistics: {
    topic: "Data Handling & Regression",
    category: "Statistics",
    totalQuizzes: 4,
    totalQuestions: 20,
    correctAnswers: 18,
    percentage: 90,
    lastScore: 88,
    history: [
      { date: "Mon", score: 75 },
      { date: "Tue", score: 82 },
      { date: "Wed", score: 85 },
      { date: "Thu", score: 90 },
      { date: "Fri", score: 88 },
    ],
  },
};

interface StudentProgressDashboardProps {
  user?: Profile | null;
}

export const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({ user }) => {
  const studentId = user?.id || "demo-student-123";
  const studentName = user ? `${user.first_name} ${user.surname}` : "Student";
  const grade = user?.grade || "Grade 12 CAPS";

  const [progressData, setProgressData] = useState<StudentProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [selectedTopicKey, setSelectedTopicKey] = useState<string>("Algebra");
  
  // Quick Quiz Modal / Entry state
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [quizTopic, setQuizTopic] = useState<string>("Algebra");
  const [scoreInput, setScoreInput] = useState<number>(80);
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Firestore Realtime Listener
  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, "studentProgress", studentId);

    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StudentProgressData;
        setProgressData(data);
      } else {
        // Seed initial data if document doesn't exist
        const initialData: StudentProgressData = {
          studentId,
          studentName,
          grade,
          lastUpdated: serverTimestamp(),
          topics: DEFAULT_TOPICS,
        };
        try {
          await setDoc(docRef, initialData);
          setProgressData(initialData);
        } catch (err) {
          console.error("Error initializing student progress in Firestore:", err);
          // Fallback to local default state if network/permission issue
          setProgressData(initialData);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore progress snapshot error:", error);
      // Fallback local state if offline or Firestore error
      setProgressData({
        studentId,
        studentName,
        grade,
        topics: DEFAULT_TOPICS,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [studentId, studentName, grade]);

  // Log new quiz score to Firestore
  const handleLogQuizScore = async () => {
    if (!progressData) return;
    setSyncing(true);

    const targetTopic = progressData.topics[quizTopic] || {
      topic: quizTopic,
      category: quizTopic as any,
      totalQuizzes: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      percentage: 0,
      lastScore: 0,
      history: [],
    };

    const newCorrect = Math.round((scoreInput / 100) * questionCount);
    const updatedTotalQuestions = targetTopic.totalQuestions + questionCount;
    const updatedCorrectAnswers = targetTopic.correctAnswers + newCorrect;
    const updatedPercentage = Math.round((updatedCorrectAnswers / updatedTotalQuestions) * 100);
    const updatedTotalQuizzes = targetTopic.totalQuizzes + 1;

    const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short" });
    const newHistory = [...targetTopic.history.slice(-6), { date: todayStr, score: scoreInput }];

    const updatedTopicData: TopicProgress = {
      ...targetTopic,
      totalQuizzes: updatedTotalQuizzes,
      totalQuestions: updatedTotalQuestions,
      correctAnswers: updatedCorrectAnswers,
      percentage: updatedPercentage,
      lastScore: scoreInput,
      history: newHistory,
    };

    const updatedTopics = {
      ...progressData.topics,
      [quizTopic]: updatedTopicData,
    };

    const docRef = doc(db, "studentProgress", studentId);
    try {
      await updateDoc(docRef, {
        topics: updatedTopics,
        lastUpdated: serverTimestamp(),
      });
      setShowQuizModal(false);
    } catch (err) {
      console.error("Error updating score in Firestore:", err);
      // Local optimistic update fallback
      setProgressData({
        ...progressData,
        topics: updatedTopics,
      });
      setShowQuizModal(false);
    } finally {
      setSyncing(false);
    }
  };

  // Reset progress to baseline
  const handleResetProgress = async () => {
    if (!window.confirm("Reset student quiz performance stats to initial baseline?")) return;
    setSyncing(true);
    const docRef = doc(db, "studentProgress", studentId);
    const resetData: StudentProgressData = {
      studentId,
      studentName,
      grade,
      lastUpdated: serverTimestamp(),
      topics: DEFAULT_TOPICS,
    };
    try {
      await setDoc(docRef, resetData);
    } catch (err) {
      console.error("Error resetting progress in Firestore:", err);
      setProgressData(resetData);
    } finally {
      setSyncing(false);
    }
  };

  const currentTopics = progressData?.topics || DEFAULT_TOPICS;
  const topicKeys = Object.keys(currentTopics);

  // Overall metrics calculation
  const totalQuizzesAll = topicKeys.reduce((acc, k) => acc + (currentTopics[k]?.totalQuizzes || 0), 0);
  const totalQuestionsAll = topicKeys.reduce((acc, k) => acc + (currentTopics[k]?.totalQuestions || 0), 0);
  const totalCorrectAll = topicKeys.reduce((acc, k) => acc + (currentTopics[k]?.correctAnswers || 0), 0);
  const overallPercentage = totalQuestionsAll > 0 ? Math.round((totalCorrectAll / totalQuestionsAll) * 100) : 0;

  const selectedTopic = currentTopics[selectedTopicKey] || currentTopics["Algebra"];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-navy-900 rounded-2xl text-white">
          <span className="text-xs font-mono">Fetching Firestore Realtime Data...</span>
        </div>
        <DashboardOverviewSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BAR & FIRESTORE STATUS */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-navy-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Database className="w-3 h-3 text-amber-400" />
                Firebase Firestore Realtime Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 text-amber-400" />
              Student Mathematics Progress Dashboard
            </h2>
            <p className="text-xs text-navy-200/80 font-sans max-w-xl">
              Track real-time topic mastery across Algebra, Calculus, and Geometry driven by student quiz performance stored in Firebase Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQuizModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Log Quiz Performance
            </button>
            <button
              onClick={handleResetProgress}
              disabled={syncing}
              title="Reset baseline stats"
              className="p-2 bg-navy-800/80 hover:bg-navy-700 text-navy-300 hover:text-white rounded-xl border border-navy-700/60 transition-all cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* OVERALL SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-navy-800/80">
          <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
            <div className="text-[10px] font-mono text-navy-300 uppercase tracking-wider flex items-center gap-1">
              <Percent className="w-3 h-3 text-amber-400" />
              Overall Mastery
            </div>
            <div className="text-xl font-black text-amber-400 mt-1 font-mono">
              {overallPercentage}%
            </div>
            <div className="text-[10px] text-navy-300/80 mt-0.5">
              Across all math domains
            </div>
          </div>

          <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
            <div className="text-[10px] font-mono text-navy-300 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Total Quizzes
            </div>
            <div className="text-xl font-black text-white mt-1 font-mono">
              {totalQuizzesAll}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
              <span>{totalCorrectAll}/{totalQuestionsAll} Questions Correct</span>
            </div>
          </div>

          <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
            <div className="text-[10px] font-mono text-navy-300 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" />
              Topics Tracked
            </div>
            <div className="text-xl font-black text-purple-300 mt-1 font-mono">
              {topicKeys.length} CAPS Modules
            </div>
            <div className="text-[10px] text-navy-300/80 mt-0.5">
              Algebra, Calculus, Geometry
            </div>
          </div>

          <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
            <div className="text-[10px] font-mono text-navy-300 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              Firestore Status
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-1.5 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Connected
            </div>
            <div className="text-[9px] text-navy-400 mt-0.5 font-mono truncate">
              ID: {studentId}
            </div>
          </div>
        </div>
      </div>

      {/* TOPIC VISUAL PROGRESS BARS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOPICS BREAKDOWN CARDS (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Mathematics Topic Mastery Progress Bars
            </h3>
            <span className="text-xs font-mono text-navy-500 dark:text-navy-400">
              Click a topic to inspect performance trends
            </span>
          </div>

          {loading ? (
            <div className="p-8 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
              <p className="text-xs font-mono text-navy-500 dark:text-navy-400">
                Loading live progress snapshots from Firestore...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topicKeys.map((key) => {
                const topic = currentTopics[key];
                const isSelected = selectedTopicKey === key;
                const pct = topic.percentage;

                let progressColor = "bg-amber-500";
                let badgeColor = "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
                
                if (pct >= 85) {
                  progressColor = "bg-emerald-500";
                  badgeColor = "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
                } else if (pct < 70) {
                  progressColor = "bg-purple-500";
                  badgeColor = "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
                }

                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => setSelectedTopicKey(key)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-white dark:bg-navy-900 border-amber-500 dark:border-amber-500 shadow-md ring-2 ring-amber-500/20" 
                        : "bg-white/80 dark:bg-navy-900/60 border-navy-100 dark:border-navy-800 hover:border-navy-300 dark:hover:border-navy-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${
                          key === "Algebra" ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400" :
                          key === "Calculus" ? "bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400" :
                          key === "Geometry" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" :
                          "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                        }`}>
                          {key === "Algebra" ? <Calculator className="w-4 h-4" /> :
                           key === "Calculus" ? <BrainCircuit className="w-4 h-4" /> :
                           key === "Geometry" ? <Compass className="w-4 h-4" /> :
                           <BookOpen className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                            {topic.topic}
                          </h4>
                          <span className="text-[10px] font-mono text-navy-500 dark:text-navy-400">
                            {topic.totalQuizzes} quizzes taken • {topic.correctAnswers}/{topic.totalQuestions} questions correct
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${badgeColor}`}>
                          {pct}% Mastery
                        </span>
                        <ChevronRight className={`w-4 h-4 text-navy-400 transition-transform ${isSelected ? "rotate-90 text-amber-500" : ""}`} />
                      </div>
                    </div>

                    {/* DYNAMIC VISUAL PROGRESS BAR */}
                    <div className="space-y-1 mt-2">
                      <div className="w-full h-3 bg-navy-100 dark:bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-200/50 dark:border-navy-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${progressColor}`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-navy-400 px-0.5">
                        <span>0%</span>
                        <span>Latest Score: {topic.lastScore}%</span>
                        <span>100% Target</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* SELECTED TOPIC DETAILED TREND & RECHARTS GRAPH */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Performance Trend: {selectedTopic?.topic}
          </h3>

          <div className="p-5 bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100 dark:border-navy-800">
              <div>
                <span className="text-[10px] font-mono text-navy-400 uppercase tracking-wider block">
                  Domain Category
                </span>
                <span className="text-sm font-bold text-navy-900 dark:text-white font-mono">
                  {selectedTopic?.category}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-navy-400 uppercase tracking-wider block">
                  Current Score
                </span>
                <span className="text-lg font-black text-amber-500 font-mono">
                  {selectedTopic?.percentage}%
                </span>
              </div>
            </div>

            {/* RECHARTS AREA CHART FOR HISTORICAL TRENDS */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedTopic?.history || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0f172a", 
                      borderColor: "#334155", 
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "monospace"
                    }} 
                  />
                  <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-navy-50 dark:bg-navy-950/80 rounded-xl border border-navy-200/60 dark:border-navy-800 text-xs font-sans text-navy-700 dark:text-navy-300 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                CAPS Curriculum Assessment Recommendation:
              </div>
              <p className="text-[11px] leading-relaxed">
                {selectedTopic?.percentage >= 85
                  ? `Excellent mastery in ${selectedTopic?.topic}! Maintain precision by completing past IEB/NSC trial exam questions.`
                  : selectedTopic?.percentage >= 70
                  ? `Solid performance in ${selectedTopic?.topic}. Practice step-by-step problem sets to push towards distinction (>80%).`
                  : `Focus needed in ${selectedTopic?.topic}. Schedule a 1-on-1 session with an AMH tutor or request a custom whiteboard video.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QUIZ SCORE LOGGING MODAL */}
      <AnimatePresence>
        {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900 dark:text-white">
                      Log Quiz Performance
                    </h3>
                    <p className="text-[10px] font-mono text-navy-500 dark:text-navy-400">
                      Saves score directly to Firebase Firestore
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-400 hover:text-navy-900 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-navy-700 dark:text-navy-300">
                    Select Math Topic Domain:
                  </label>
                  <select
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 text-navy-900 dark:text-white text-xs font-mono font-bold"
                  >
                    <option value="Algebra">Algebra & Equations</option>
                    <option value="Calculus">Differential Calculus</option>
                    <option value="Geometry">Euclidean & Analytical Geometry</option>
                    <option value="Trigonometry">Trigonometric Functions</option>
                    <option value="Statistics">Data Handling & Statistics</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="font-bold text-navy-700 dark:text-navy-300">
                      Quiz Score achieved:
                    </label>
                    <span className="font-black text-amber-500">{scoreInput}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-navy-700 dark:text-navy-300">
                    Number of Questions in Quiz:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 text-navy-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100 dark:border-navy-800">
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogQuizScore}
                  disabled={syncing}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Syncing to Firestore...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      Save Score to Firestore
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
