import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit,
  Sparkles,
  X,
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Gamepad2,
  ArrowRight,
  ShieldAlert,
  ListPlus,
  Loader2
} from "lucide-react";
import { Profile, ArcadeScore, ScheduledStudySession } from "../types";
import { dbAPI } from "../lib/db";

export interface SmartQuizSchedulerModalProps {
  user?: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySchedule: (newSessions: ScheduledStudySession[]) => void;
  existingScheduleCount?: number;
}

export interface WeakTopicAnalysis {
  topic: string;
  accuracy: number;
  reason: string;
}

export const SmartQuizSchedulerModal: React.FC<SmartQuizSchedulerModalProps> = ({
  user,
  isOpen,
  onClose,
  onApplySchedule,
  existingScheduleCount = 0
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [arcadeScores, setArcadeScores] = useState<ArcadeScore[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [weakTopics, setWeakTopics] = useState<WeakTopicAnalysis[]>([]);
  const [recommendedSessions, setRecommendedSessions] = useState<ScheduledStudySession[]>([]);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  const studentId = user?.id || "usr-bethuel";
  const studentName = user ? `${user.first_name} ${user.surname}`.trim() : "Bethuel Moukangwe";

  useEffect(() => {
    if (isOpen) {
      try {
        const scores = dbAPI.getArcadeScores(studentId);
        setArcadeScores(scores);
      } catch (e) {
        console.error("Failed to load arcade scores for scheduler:", e);
      }
    }
  }, [isOpen, studentId]);

  const handleGenerateAiSchedule = async () => {
    setLoading(true);
    setApplied(false);
    try {
      const response = await fetch("/api/ai/smart-schedule-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentName,
          arcadeScores,
          existingScheduleCount,
          weeklyGoalHours: 15
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiSummary(data.aiSummary || "Analysis complete.");
        setWeakTopics(data.weakTopicsAnalysis || []);
        setRecommendedSessions(data.recommendedSessions || []);
        setHasGenerated(true);
      }
    } catch (e) {
      console.error("Smart scheduler error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToPlanner = () => {
    if (recommendedSessions.length > 0) {
      onApplySchedule(recommendedSessions);
      setApplied(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto font-mono text-left">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-navy-900 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative overflow-hidden my-8 space-y-6 text-slate-900 dark:text-white"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
              Gemini AI Smart Scheduler
            </span>
            <span className="text-xs text-slate-400">Arcade Performance Analyzer</span>
          </div>

          <h3 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Smart Quiz & Study Scheduler
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analyzes your long-term Arcade Mode speed sprints & accuracy metrics to automatically schedule daily practice sessions in your Weekly Planner.
          </p>
        </div>

        {/* PERFORMANCE SUMMARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Arcade Sessions</span>
              <span className="text-base font-black font-mono">{arcadeScores.length} Runs Logged</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Avg Arcade Accuracy</span>
              <span className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                {arcadeScores.length > 0 
                  ? Math.round(arcadeScores.reduce((acc, s) => acc + s.accuracy_percentage, 0) / arcadeScores.length) 
                  : 68}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Target Planner Goal</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">15 Hours/Week</span>
            </div>
          </div>
        </div>

        {/* GENERATE ACTION BUTTON */}
        {!hasGenerated && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-50 dark:via-navy-950 to-amber-500/5 border border-amber-500/30 text-center space-y-4">
            <div className="max-w-md mx-auto space-y-2">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
              <h4 className="text-base font-black font-display text-slate-900 dark:text-white">
                Ready to optimize your weekly study plan?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gemini AI will inspect your Arcade Mode accuracy across Algebra, Trigonometry, Calculus, and Geometry to pinpoint error patterns and schedule targeted daily drills.
              </p>
            </div>

            <button
              onClick={handleGenerateAiSchedule}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Gemini AI Analyzing Arcade Data...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  <span>Generate AI Targeted Practice Schedule</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AI GENERATED RESULTS */}
        {hasGenerated && (
          <div className="space-y-5">
            {/* AI SUMMARY BOX */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-4 h-4" /> Gemini AI Diagnostic Report
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {aiSummary}
              </p>
            </div>

            {/* WEAK TOPICS IDENTIFIED */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Identified Arcade Weak Accuracy Topics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {weakTopics.map((wt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white truncate">{wt.topic}</span>
                      <span className="text-rose-500 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px]">
                        {wt.accuracy}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {wt.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RECOMMENDED PRACTICE SESSIONS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListPlus className="w-3.5 h-3.5 text-amber-500" />
                  Recommended Daily Practice Sessions ({recommendedSessions.length})
                </h4>
                <span className="text-[10px] text-amber-500 font-mono">
                  {recommendedSessions.reduce((acc, s) => acc + s.estimatedMinutes, 0) / 60} Total Hours
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {recommendedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">{session.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                          {session.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>🗓️ {session.dayAssigned}</span>
                        <span>⏰ {session.timeSlotId?.replace("slot-", "")}:00</span>
                        <span>⏱️ {session.estimatedMinutes} Mins</span>
                      </div>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button
                onClick={handleGenerateAiSchedule}
                disabled={loading}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                Re-analyze Arcade Performance
              </button>

              <button
                onClick={handleApplyToPlanner}
                disabled={applied}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  applied
                    ? "bg-emerald-500 text-white"
                    : "bg-royal-600 hover:bg-royal-700 text-white border border-royal-500/30"
                }`}
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Applied to Weekly Planner!</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-gold-400" />
                    <span>Apply {recommendedSessions.length} Sessions to Planner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
