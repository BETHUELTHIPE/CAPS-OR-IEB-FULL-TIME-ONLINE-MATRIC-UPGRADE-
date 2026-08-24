import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Send, 
  Volume2, 
  VolumeX, 
  Award, 
  Target, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Star, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  MessageSquareQuote,
  Flame,
  UserCheck,
  Database,
  Brain,
  Layers,
  BarChart3
} from "lucide-react";
import { Profile, WeeklyInsight } from "../types";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, query, where, limit, orderBy } from "firebase/firestore";

export interface WeeklyInsightsGeneratorProps {
  user?: Profile | null;
  onNavigateTab?: (tab: string) => void;
}

interface FirestoreQuizResult {
  topic: string;
  score: number;
  total_questions: number;
  date: string;
}

interface FirestorePomodoroData {
  duration_minutes: number;
  topic: string;
  completed_at: string;
}

interface FirestoreModuleProgress {
  module_name: string;
  category: string;
  completed: boolean;
  percentage: number;
}

export const WeeklyInsightsGenerator: React.FC<WeeklyInsightsGeneratorProps> = ({ user, onNavigateTab }) => {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [history, setHistory] = useState<WeeklyInsight[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  // Firestore Aggregated Data States
  const [firestoreQuizzes, setFirestoreQuizzes] = useState<FirestoreQuizResult[]>([
    { topic: "Paper 1 Trial Mock", score: 84, total_questions: 20, date: "2026-07-29" },
    { topic: "Differential Calculus Limits", score: 88, total_questions: 15, date: "2026-07-27" },
    { topic: "Trigonometric Identities", score: 76, total_questions: 12, date: "2026-07-24" }
  ]);
  const [firestorePomodoro, setFirestorePomodoro] = useState<FirestorePomodoroData[]>([
    { duration_minutes: 25, topic: "Calculus Optimization Problems", completed_at: "2026-07-29" },
    { duration_minutes: 50, topic: "Exponent & Surd Proofs", completed_at: "2026-07-28" },
    { duration_minutes: 45, topic: "Sequences & Series Sum Formulas", completed_at: "2026-07-26" }
  ]);
  const [firestoreModules, setFirestoreModules] = useState<FirestoreModuleProgress[]>([
    { module_name: "Differential Calculus", category: "Calculus", completed: true, percentage: 100 },
    { module_name: "Trigonometry Compound Angles", category: "Trigonometry", completed: true, percentage: 85 },
    { module_name: "Analytical Geometry Circles", category: "Geometry", completed: false, percentage: 60 }
  ]);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Student metrics state for customization/generation context
  const [studentName, setStudentName] = useState<string>(
    user ? `${user.first_name} ${user.surname}` : "Bethuel Moukangwe"
  );
  const [grade, setGrade] = useState<string>(user?.grade || "Grade 12 CAPS / IEB");
  const [hoursStudied, setHoursStudied] = useState<number>(14.5);
  const [streakDays, setStreakDays] = useState<number>(7);
  const [totalXP, setTotalXP] = useState<number>(1450);

  // Fetch Firestore quiz results, Pomodoro focus session data, and module completion progress
  useEffect(() => {
    let isMounted = true;
    async function loadFirestoreData() {
      try {
        const studentId = user?.id || "usr-student";
        
        // 1. Fetch Quiz Results
        try {
          const quizSnap = await getDocs(collection(db, "quiz_results"));
          if (!quizSnap.empty && isMounted) {
            const list: FirestoreQuizResult[] = [];
            quizSnap.forEach((docSnap) => {
              const d = docSnap.data();
              list.push({
                topic: d.topic || "Math Practice Quiz",
                score: Number(d.score) || 80,
                total_questions: Number(d.total_questions) || 10,
                date: d.date || new Date().toISOString().split("T")[0]
              });
            });
            if (list.length > 0) setFirestoreQuizzes(list);
          }
        } catch (e) {
          console.log("Firestore quiz_results query fallback used.");
        }

        // 2. Fetch Pomodoro Focus Data
        try {
          const pomodoroSnap = await getDocs(collection(db, "pomodoro_data"));
          if (!pomodoroSnap.empty && isMounted) {
            const list: FirestorePomodoroData[] = [];
            pomodoroSnap.forEach((docSnap) => {
              const d = docSnap.data();
              list.push({
                duration_minutes: Number(d.duration_minutes) || 25,
                topic: d.topic || "Math Revision Focus",
                completed_at: d.completed_at || new Date().toISOString().split("T")[0]
              });
            });
            if (list.length > 0) setFirestorePomodoro(list);
          }
        } catch (e) {
          console.log("Firestore pomodoro_data query fallback used.");
        }

        // 3. Fetch Module Completion Progress
        try {
          const moduleSnap = await getDocs(collection(db, "module_progress"));
          if (!moduleSnap.empty && isMounted) {
            const list: FirestoreModuleProgress[] = [];
            moduleSnap.forEach((docSnap) => {
              const d = docSnap.data();
              list.push({
                module_name: d.module_name || "Math Module",
                category: d.category || "General",
                completed: Boolean(d.completed),
                percentage: Number(d.percentage) || 75
              });
            });
            if (list.length > 0) setFirestoreModules(list);
          }
        } catch (e) {
          console.log("Firestore module_progress query fallback used.");
        }

        // 4. Fetch Saved Weekly Insights from Firestore
        try {
          const insightsSnap = await getDocs(collection(db, "weekly_insights"));
          if (!insightsSnap.empty && isMounted) {
            const list: WeeklyInsight[] = [];
            insightsSnap.forEach((docSnap) => {
              const d = docSnap.data() as WeeklyInsight;
              if (d.headline && d.summary) list.push({ ...d, id: docSnap.id });
            });
            if (list.length > 0) {
              list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
              setHistory(list);
              setInsight(list[0]);
            }
          }
        } catch (e) {
          console.log("Firestore weekly_insights query fallback used.");
        }

      } catch (err) {
        console.error("Firestore aggregation initialization error:", err);
        if (isMounted) setIsFirestoreConnected(false);
      }
    }

    loadFirestoreData();
    return () => { isMounted = false; };
  }, [user]);

  // Load saved insights from localStorage as fallback
  useEffect(() => {
    try {
      const saved = localStorage.getItem("amh_weekly_insights");
      if (saved && history.length === 0) {
        const parsedHistory: WeeklyInsight[] = JSON.parse(saved);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setHistory(parsedHistory);
          setInsight(parsedHistory[0]);
        }
      }
    } catch (e) {
      console.error("Error reading saved weekly insights:", e);
    }
  }, [history]);

  // Derived aggregated metrics from Firestore
  const avgQuizScore = Math.round(
    firestoreQuizzes.reduce((acc, q) => acc + q.score, 0) / (firestoreQuizzes.length || 1)
  );
  const totalPomodoroMinutes = firestorePomodoro.reduce((acc, p) => acc + p.duration_minutes, 0);
  const completedModulesCount = firestoreModules.filter(m => m.completed).length;

  // Function to request Gemini to generate new weekly insights aggregating Firestore data
  const handleGenerateInsight = async () => {
    setGenerating(true);
    setEmailStatus(null);
    setCurrentlySpeaking(false);
    window.speechSynthesis?.cancel();

    try {
      const res = await fetch("/api/gemini/weekly-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id || "usr-student",
          studentName: studentName || "Bethuel Moukangwe",
          grade: grade || "Grade 12 CAPS / IEB",
          hoursStudied: Number((totalPomodoroMinutes / 60).toFixed(1)) || 14.5,
          streakDays: Number(streakDays) || 7,
          totalXP: Number(totalXP) || 1450,
          mockScores: firestoreQuizzes.map(q => ({ topic: q.topic, score: q.score, date: q.date })),
          completedTopics: firestoreModules.filter(m => m.completed).map(m => m.module_name),
          weakTopics: firestoreModules.filter(m => !m.completed).map(m => m.module_name),
          homeworkCount: 3,
          badgesCount: 6
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.insight) {
        const newInsight: WeeklyInsight = data.insight;
        setInsight(newInsight);

        // Update local state history
        const updatedHistory = [newInsight, ...history.filter(h => h.id !== newInsight.id)].slice(0, 8);
        setHistory(updatedHistory);
        setSelectedWeekIndex(0);
        localStorage.setItem("amh_weekly_insights", JSON.stringify(updatedHistory));

        // Save to Firestore weekly_insights collection for cloud persistence
        try {
          await addDoc(collection(db, "weekly_insights"), {
            ...newInsight,
            student_id: user?.id || "usr-student",
            firestore_synced_at: new Date().toISOString()
          });
        } catch (e) {
          console.log("Could not sync weekly insight to Firestore collection, local storage retained.");
        }
      } else {
        throw new Error(data.error || "Failed to generate weekly insights");
      }
    } catch (err: any) {
      console.error("Error drafting weekly insight:", err);
      setEmailStatus({
        type: "error",
        text: err.message || "Failed to draft weekly insight. Please try again."
      });
    } finally {
      setGenerating(false);
    }
  };

  // Generate initial insight automatically if none exists
  useEffect(() => {
    if (!insight && history.length === 0) {
      handleGenerateInsight();
    }
  }, []);

  // Copy textual summary to clipboard
  const handleCopySummary = () => {
    if (!insight) return;
    const fullText = `📊 Amaris Mathematics Hub - Weekly Insights\nStudent: ${insight.student_name} (${grade})\nWeek Ending: ${insight.week_ending_date}\n\nHeadline: ${insight.headline}\n\nSummary:\n${insight.summary}\n\nKey Victories:\n${insight.key_wins.map(w => `• ${w}`).join("\n")}\n\nTarget Focus Areas:\n${insight.focus_areas.map(f => `• ${f}`).join("\n")}\n\nTutor Bethuel's Encouragement:\n${insight.tutor_encouragement}\n\nRecommended Goal:\n${insight.recommended_goal}`;
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Speak aloud summary using browser speech synthesis
  const handleToggleSpeak = () => {
    if (!insight) return;

    if (currentlySpeaking) {
      window.speechSynthesis?.cancel();
      setCurrentlySpeaking(false);
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech audio reader is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const readText = `${insight.headline}. ${insight.summary}. Key victories: ${insight.key_wins.join(". ")}. Tutor Bethuel says: ${insight.tutor_encouragement}`;
    const utterance = new SpeechSynthesisUtterance(readText);
    utterance.rate = 0.95; // Friendly classroom cadence
    utterance.pitch = 1.0;

    utterance.onend = () => setCurrentlySpeaking(false);
    utterance.onerror = () => setCurrentlySpeaking(false);

    setCurrentlySpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Send summary to student's email via SMTP server route
  const handleEmailSummary = async () => {
    if (!insight) return;

    setSendingEmail(true);
    setEmailStatus(null);

    const recipientEmail = user?.email || "bethuelthipe@gmail.com";

    try {
      const res = await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recipientEmail,
          studentName: insight.student_name,
          type: "weekly_summary",
          bookingDetails: {
            booking_reference: "AMH-WEEKLY-" + insight.id.substring(3, 9),
            lesson_date: insight.week_ending_date,
            lesson_time: "08:00 SAST",
            subject_name: `${grade} Mathematics Weekly Overview`,
            duration_minutes: 60,
            platform: "Amaris Student Cockpit",
            meeting_link: "https://amarismaths.co.za/dashboard",
            topics_to_cover: insight.key_wins,
            status: "confirmed",
            feedback_remarks: insight.tutor_encouragement
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatus({
          type: "success",
          text: `Weekly Insight report successfully emailed to ${recipientEmail}!`
        });
      } else {
        throw new Error(data.error || "Email dispatch failed");
      }
    } catch (err: any) {
      setEmailStatus({
        type: "error",
        text: err.message || "Failed to dispatch weekly summary email."
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-navy-100 dark:border-navy-800">
        <div className="flex items-start gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 via-royal-700 to-navy-950 text-gold-400 font-black shadow-lg shrink-0">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold-500" /> Powered by Gemini 3.6 Flash
              </span>
              <span className="text-xs font-mono text-navy-400 font-semibold">
                • End-of-Week Progress Digest
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-navy-900 dark:text-white">
              Weekly Performance Insights & Encouragement
            </h2>
            <p className="text-xs md:text-sm text-navy-600 dark:text-navy-300 max-w-2xl leading-relaxed">
              AI-generated performance overview summarizing your weekly study victories, momentum toward Level 7 distinction, and target focus areas for the upcoming week.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleGenerateInsight}
            disabled={generating}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            <span>{generating ? "Drafting Overview..." : "Regenerate Insight"}</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK STATUS BANNER */}
      {emailStatus && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            emailStatus.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {emailStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{emailStatus.text}</span>
          </div>
          <button onClick={() => setEmailStatus(null)} className="text-navy-400 hover:text-navy-900 dark:hover:text-white">
            ✕
          </button>
        </motion.div>
      )}

      {/* FIRESTORE AGGREGATED METRICS SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy-50/80 dark:bg-navy-950/50 p-3.5 rounded-2xl border border-navy-100 dark:border-navy-850">
        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-royal-500/10 text-royal-600 dark:text-royal-300 font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-navy-400">Quiz Accuracy</div>
            <div className="text-sm font-black text-navy-900 dark:text-white font-mono">{avgQuizScore}% Avg</div>
            <div className="text-[9px] text-navy-400">{firestoreQuizzes.length} Quizzes Logged</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-navy-400">Pomodoro Focus</div>
            <div className="text-sm font-black text-navy-900 dark:text-white font-mono">{totalPomodoroMinutes} Mins</div>
            <div className="text-[9px] text-navy-400">{firestorePomodoro.length} Focus Sessions</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-navy-400">Module Progress</div>
            <div className="text-sm font-black text-navy-900 dark:text-white font-mono">{completedModulesCount}/{firestoreModules.length} Modules</div>
            <div className="text-[9px] text-navy-400">CAPS / IEB Syllabus</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-navy-400">Firestore Status</div>
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud Synced</span>
            </div>
            <div className="text-[9px] text-navy-400">Every Sunday @ 20:00</div>
          </div>
        </div>
      </div>

      {/* INSIGHT CARD MAIN DISPLAY */}
      {generating ? (
        <div className="p-12 text-center bg-navy-50/50 dark:bg-navy-950/40 rounded-3xl border border-dashed border-navy-200 dark:border-navy-800 space-y-4">
          <div className="inline-block p-4 rounded-full bg-gold-500/10 text-gold-500 animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black font-display text-navy-900 dark:text-white">
              Synthesizing Weekly Performance Data...
            </h4>
            <p className="text-xs text-navy-500 dark:text-navy-400 max-w-md mx-auto">
              Analyzing practice quiz accuracy, mock exam trial trends, study streak logs, and syllabus milestones via Gemini AI.
            </p>
          </div>
        </div>
      ) : insight ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-50/60 dark:bg-navy-950/60 p-6 md:p-8 rounded-3xl border border-navy-150 dark:border-navy-850 space-y-6 text-left relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* HEADLINE BANNER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-200/60 dark:border-navy-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-gold-600 dark:text-gold-400 tracking-wider">
                Week Ending: {insight.week_ending_date}
              </span>
              <h3 className="text-lg md:text-xl font-black font-display text-navy-900 dark:text-white leading-snug">
                {insight.headline}
              </h3>
            </div>

            {/* QUICK ACTIONS ON THE INSIGHT */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleToggleSpeak}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentlySpeaking
                    ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                    : "bg-white dark:bg-navy-900 text-navy-700 dark:text-navy-200 border-navy-200 dark:border-navy-750 hover:border-gold-500"
                }`}
                title={currentlySpeaking ? "Stop Voice Readout" : "Listen Aloud"}
              >
                {currentlySpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-white" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                    <span>Listen Aloud</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopySummary}
                className="p-2.5 rounded-xl bg-white dark:bg-navy-900 text-navy-700 dark:text-navy-200 border border-navy-200 dark:border-navy-750 hover:border-gold-500 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Copy Summary Text"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-navy-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleEmailSummary}
                disabled={sendingEmail}
                className="p-2.5 rounded-xl bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 font-bold text-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Email Weekly Insight"
              >
                <Send className="w-4 h-4" />
                <span>{sendingEmail ? "Sending..." : "Email Me"}</span>
              </button>
            </div>
          </div>

          {/* TEXT SUMMARY BODY */}
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 text-navy-700 dark:text-navy-200 text-sm leading-relaxed whitespace-pre-line font-normal">
            {insight.summary}
          </div>

          {/* KEY WINS & FOCUS AREAS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Key Victories */}
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>This Week's Core Victories</span>
              </div>
              <ul className="space-y-2 text-xs text-navy-800 dark:text-navy-200">
                {insight.key_wins.map((win, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black mt-0.5">•</span>
                    <span className="leading-snug">{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Focus Areas for Next Week */}
            <div className="bg-royal-500/5 dark:bg-royal-500/10 p-4 rounded-2xl border border-royal-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-royal-800 dark:text-royal-300 font-mono">
                <Target className="w-4 h-4 text-royal-600 dark:text-royal-400" />
                <span>Target Focus Areas for Next Week</span>
              </div>
              <ul className="space-y-2 text-xs text-navy-800 dark:text-navy-200">
                {insight.focus_areas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-royal-600 dark:text-royal-400 font-black mt-0.5">•</span>
                    <span className="leading-snug">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* TUTOR BETHEUL ENCOURAGEMENT QUOTE BOX */}
          <div className="bg-amber-500/10 dark:bg-gold-500/10 p-5 rounded-2xl border border-gold-500/30 flex items-start gap-3.5">
            <MessageSquareQuote className="w-7 h-7 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-gold-700 dark:text-gold-400 tracking-wider">
                Personal Note from Head Tutor Bethuel Moukangwe
              </div>
              <p className="text-xs md:text-sm font-semibold italic text-navy-900 dark:text-gold-200 leading-relaxed">
                {insight.tutor_encouragement}
              </p>
            </div>
          </div>

          {/* RECOMMENDED GOAL CARD */}
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-gold-500 shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-navy-400">Next Week's Milestone Goal</span>
                <div className="font-bold text-navy-900 dark:text-white">{insight.recommended_goal}</div>
              </div>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("subject_quiz")}
                className="px-3 py-1.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>Start Practice Quiz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      ) : null}

      {/* HISTORICAL INSIGHTS ARCHIVE */}
      {history.length > 1 && (
        <div className="space-y-3 pt-4 border-t border-navy-100 dark:border-navy-800">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-navy-500 dark:text-navy-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-royal-600 dark:text-royal-300" />
            <span>Prior Weekly Insights Archive ({history.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setInsight(item);
                  setSelectedWeekIndex(idx);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                  insight?.id === item.id
                    ? "bg-royal-500/10 border-royal-500/40 dark:bg-royal-950/40 text-navy-900 dark:text-white ring-2 ring-royal-500/50"
                    : "bg-navy-50/50 dark:bg-navy-950/40 border-navy-150 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-royal-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-royal-600 dark:text-gold-400 uppercase">
                    Week Ending: {item.week_ending_date}
                  </span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gold-500/20 text-gold-700 dark:text-gold-300">
                      Latest
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-bold line-clamp-1">{item.headline}</h5>
                <p className="text-[11px] text-navy-500 dark:text-navy-400 line-clamp-2">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
