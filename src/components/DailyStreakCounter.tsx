import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Award, 
  Zap, 
  ShieldCheck, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  HelpCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Profile } from "../types";
import { getFromDB } from "../lib/db";
import { DailyQuizRecord } from "./DailyChallengeQuiz";
import { triggerStreakToast, triggerMilestoneToast } from "../lib/toast";

export interface DailyStreakCounterProps {
  user?: Profile | null;
  onOpenChallenge?: () => void;
}

interface WeekDayStatus {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  completed: boolean;
  isCorrect?: boolean;
  pointsEarned?: number;
}

export const DailyStreakCounter: React.FC<DailyStreakCounterProps> = ({ user, onOpenChallenge }) => {
  const userId = user?.id || "usr-student";
  const [streakDays, setStreakDays] = useState<number>(7);
  const [longestStreak, setLongestStreak] = useState<number>(12);
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(false);
  const [quizHistory, setQuizHistory] = useState<DailyQuizRecord[]>([]);
  const [streakFreezeAvailable, setStreakFreezeAvailable] = useState<boolean>(true);

  const todayKey = new Date().toISOString().slice(0, 10);

  // Load and refresh streak state
  const loadStreakData = () => {
    // 1. History
    const history = getFromDB<DailyQuizRecord>("amh_daily_quiz_history");
    const userHistory = history.filter(item => item.user_id === userId);
    setQuizHistory(userHistory);

    // 2. Check today completion
    const todayRecord = userHistory.find(item => item.date === todayKey);
    setHasCompletedToday(!!todayRecord);

    // 3. Saved Streak
    const savedStreak = localStorage.getItem(`amh_streak_${userId}`);
    let streakVal = 7; // default default streak
    if (savedStreak) {
      streakVal = parseInt(savedStreak, 10);
    } else {
      // Calculate from history if not saved
      let count = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const record = userHistory.find(r => r.date === dateStr);
        if (record) {
          count++;
        } else if (i > 0) {
          // break streak if missed past day
          break;
        }
      }
      streakVal = count > 0 ? count : 7;
    }
    setStreakDays(streakVal);

    // 4. Longest streak
    const savedLongest = localStorage.getItem(`amh_longest_streak_${userId}`);
    if (savedLongest) {
      setLongestStreak(parseInt(savedLongest, 10));
    } else {
      const maxStreak = Math.max(streakVal, 12);
      setLongestStreak(maxStreak);
    }
  };

  useEffect(() => {
    loadStreakData();

    // Listen for completion events from DailyChallengeQuiz or storage updates
    const handleQuizCompleted = () => {
      loadStreakData();
    };

    window.addEventListener("dailyChallengeCompleted", handleQuizCompleted);
    window.addEventListener("storage", handleQuizCompleted);

    return () => {
      window.removeEventListener("dailyChallengeCompleted", handleQuizCompleted);
      window.removeEventListener("storage", handleQuizCompleted);
    };
  }, [userId, todayKey]);

  // Generate 7-day rolling window for weekly day cards
  const weekDays = React.useMemo<WeekDayStatus[]>(() => {
    const days: WeekDayStatus[] = [];
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
    
    // Standard Monday - Sunday week
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      const isToday = dateStr === todayKey;
      const isPast = d < new Date(todayKey);
      const isFuture = d > new Date(todayKey);

      const record = quizHistory.find(r => r.date === dateStr);

      days.push({
        dateStr,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        isToday,
        isPast,
        isFuture,
        completed: !!record,
        isCorrect: record?.is_correct,
        pointsEarned: record?.points_earned
      });
    }

    return days;
  }, [todayKey, quizHistory]);

  // Determine streak milestone tier
  const getMilestoneInfo = (streak: number) => {
    if (streak < 3) return { next: 3, label: "3-Day Starter", reward: "+50 Bonus XP" };
    if (streak < 7) return { next: 7, label: "7-Day Flame Scholar", reward: "CAPS Cheat Sheet Unlock" };
    if (streak < 14) return { next: 14, label: "14-Day Math Champion", reward: "10% Tutoring Voucher" };
    if (streak < 30) return { next: 30, label: "30-Day Matric Legend", reward: "Custom Verified Badge" };
    return { next: 50, label: "50-Day Grandmaster", reward: "VIP Free Masterclass Pass" };
  };

  const milestone = getMilestoneInfo(streakDays);
  const milestoneProgress = Math.min(100, Math.round((streakDays / milestone.next) * 100));

  const handleScrollToQuiz = () => {
    if (onOpenChallenge) {
      onOpenChallenge();
      return;
    }
    const elem = document.getElementById("daily-math-challenge");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-900 border-2 border-gold-500/30 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden my-6">
      {/* Background Flame Glow Effects */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3.5 bg-gradient-to-tr from-amber-600 via-gold-500 to-amber-400 rounded-2xl shadow-lg text-navy-950 ring-4 ring-gold-500/20 shrink-0 flex items-center justify-center">
              <Flame className="w-8 h-8 animate-pulse text-navy-950 fill-navy-950" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-navy-950 text-[10px] font-black font-mono px-1.5 py-0.2 rounded-full border border-emerald-300">
              Active
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">
                Daily Math Challenge Streak
              </span>
              {hasCompletedToday ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Today Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                  <Clock className="w-3 h-3" /> Today Pending
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-black font-display text-white tracking-tight">
                {streakDays} <span className="text-gold-400 text-2xl">Days</span>
              </h2>
              <span className="text-xs text-navy-300 font-mono">
                (Personal Record: {longestStreak} Days)
              </span>
            </div>
          </div>
        </div>

        {/* Action Button & Freeze Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => triggerStreakToast(7)}
            className="hidden sm:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 rounded-xl border border-amber-500/30 text-xs font-mono text-amber-300 hover:text-amber-200 transition-all cursor-pointer"
            title="Test 7-Day Streak Toast Alert"
            id="btn-test-streak-toast"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div className="text-left">
              <div className="text-[9px] text-amber-400 font-bold uppercase">Streak Alert</div>
              <div className="font-bold text-[11px]">Preview 7d Streak</div>
            </div>
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-navy-800/80 px-3 py-2 rounded-xl border border-navy-700 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-navy-300 font-bold uppercase">Streak Safeguard</div>
              <div className="text-emerald-400 font-bold">1 Freeze Active</div>
            </div>
          </div>

          {!hasCompletedToday ? (
            <button
              onClick={handleScrollToQuiz}
              className="px-4 py-3 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-black text-xs rounded-2xl shadow-lg hover:shadow-gold-500/20 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shrink-0"
              id="btn-solve-today-challenge"
            >
              <Zap className="w-4 h-4 fill-navy-950" />
              <span>Solve Today's Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleScrollToQuiz}
              className="px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-black text-xs rounded-2xl border border-emerald-500/40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Review Today's Answer</span>
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Visual Tracker Row */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-navy-300 tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold-400" />
            Weekly Challenge Streak Tracker
          </span>
          <span className="text-[11px] font-mono text-navy-300">
            {hasCompletedToday ? "Streak maintained for today!" : "Complete today's problem before 23:59"}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekDays.map((day) => {
            return (
              <div
                key={day.dateStr}
                className={`relative flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center ${
                  day.isToday
                    ? day.completed
                      ? "bg-gradient-to-b from-emerald-950/80 to-navy-900 border-emerald-400 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                      : "bg-gradient-to-b from-amber-950/80 to-navy-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30 animate-pulse"
                    : day.completed
                    ? "bg-navy-850/90 border-emerald-500/40 text-emerald-300"
                    : day.isPast
                    ? "bg-navy-900/60 border-navy-800 opacity-60"
                    : "bg-navy-900/40 border-navy-800/60 opacity-40"
                }`}
              >
                <span className="text-[10px] font-mono font-extrabold uppercase text-navy-300 mb-1">
                  {day.dayName}
                </span>

                <span className="text-sm font-black font-mono text-white mb-2">
                  {day.dayNumber}
                </span>

                <div className="mt-auto">
                  {day.completed ? (
                    <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : day.isToday ? (
                    <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-bounce">
                      <Flame className="w-4 h-4 fill-amber-400" />
                    </div>
                  ) : day.isPast ? (
                    <div className="p-1 rounded-full bg-navy-800 text-navy-500 border border-navy-700">
                      <XCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-navy-800/40 text-navy-600">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {day.isToday && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black uppercase tracking-tighter px-1.5 py-0.2 rounded-full bg-gold-400 text-navy-950 shadow">
                    Today
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Milestone Progress & Gamified Rewards */}
      <div className="mt-6 pt-5 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-2/3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-navy-200 font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-gold-400" />
              Next Milestone Goal: <span className="text-gold-400 font-black">{milestone.next} Days</span> ({milestone.label})
            </span>
            <span className="text-gold-400 font-black">{milestoneProgress}%</span>
          </div>

          <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden p-0.5 border border-navy-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-500 via-gold-400 to-emerald-400 rounded-full shadow"
            />
          </div>

          <p className="text-[11px] text-navy-300 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-400 shrink-0" />
            Reward on reaching {milestone.next} days: <span className="text-emerald-400 font-bold">{milestone.reward}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-850/80 p-3 rounded-2xl border border-navy-750 text-xs w-full md:w-auto">
          <Award className="w-5 h-5 text-gold-400 shrink-0" />
          <div className="text-left font-mono">
            <div className="text-[10px] text-navy-300 uppercase font-bold">Retention Tier</div>
            <div className="font-bold text-white text-xs">{milestone.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
