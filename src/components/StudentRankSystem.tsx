import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Award,
  Crown,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  Target,
  Medal,
  Star,
  Info,
  ShieldCheck,
  ArrowUpRight,
  RotateCcw
} from "lucide-react";
import { Profile } from "../types";
import { getFromDB } from "../lib/db";
import { DailyQuizRecord } from "./DailyChallengeQuiz";

export interface RankTier {
  id: number;
  title: string;
  badgeSymbol: string;
  minChallenges: number;
  maxChallenges: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  perk: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 1,
    title: "Novice Mathematician",
    badgeSymbol: "🥉",
    minChallenges: 0,
    maxChallenges: 2,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Embarking on the CAPS & IEB mathematics practice journey.",
    perk: "Access to Daily Practice Challenges & Instant Formula Hints"
  },
  {
    id: 2,
    title: "Formula Apprentice",
    badgeSymbol: "🥈",
    minChallenges: 3,
    maxChallenges: 6,
    color: "text-slate-600 dark:text-slate-300",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    description: "Developing strong consistency in algebra and trigonometry problem solving.",
    perk: "Unlocks 5% Bonus XP on daily streak completions"
  },
  {
    id: 3,
    title: "Theorem Tactician",
    badgeSymbol: "🥇",
    minChallenges: 7,
    maxChallenges: 12,
    color: "text-amber-500 dark:text-gold-400",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/40",
    description: "Mastering multi-step geometric proofs, quadratic sequences, and functions.",
    perk: "Unlocks Priority Custom Video Solution Request status"
  },
  {
    id: 4,
    title: "Calculus Scholar",
    badgeSymbol: "💎",
    minChallenges: 13,
    maxChallenges: 20,
    color: "text-cyan-600 dark:text-cyan-300",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/40",
    description: "Demonstrating distinction-level derivative and limits solving speed.",
    perk: "Unlocks Distinction Certificate Badge & +15% XP Booster"
  },
  {
    id: 5,
    title: "CAPS & IEB Grandmaster",
    badgeSymbol: "👑",
    minChallenges: 21,
    maxChallenges: 999,
    color: "text-purple-600 dark:text-purple-300",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/40",
    description: "Achieved elite distinction status across all Grade 10-12 CAPS & IEB topics.",
    perk: "Featured on National Student Leaderboard & Hall of Fame"
  }
];

export interface AchievementBadge {
  id: string;
  title: string;
  icon: string;
  description: string;
  requiredCount: number;
  xpBonus: number;
  category: string;
}

export const MILESTONE_BADGES: AchievementBadge[] = [
  {
    id: "badge-first",
    title: "First Step Hero",
    icon: "🚀",
    description: "Complete 1 Daily Math Challenge problem.",
    requiredCount: 1,
    xpBonus: 50,
    category: "Participation"
  },
  {
    id: "badge-streak-3",
    title: "Streak Catalyst",
    icon: "🔥",
    description: "Complete 3 Daily Challenges to ignite your streak.",
    requiredCount: 3,
    xpBonus: 100,
    category: "Consistency"
  },
  {
    id: "badge-tactician",
    title: "Theorem Tactician",
    icon: "📐",
    description: "Reach Rank 3 by completing 7 Daily Math Challenges.",
    requiredCount: 7,
    xpBonus: 200,
    category: "Rank Progression"
  },
  {
    id: "badge-marathon",
    title: "Syllabus Marathoner",
    icon: "🏃‍♂️",
    description: "Complete 10 Daily Math Challenges across syllabus topics.",
    requiredCount: 10,
    xpBonus: 300,
    category: "Endurance"
  },
  {
    id: "badge-grandmaster",
    title: "Matric Grandmaster",
    icon: "👑",
    description: "Complete 21 Daily Challenges to attain top tier Grandmaster Rank.",
    requiredCount: 21,
    xpBonus: 500,
    category: "Mastery"
  }
];

export interface StudentRankSystemProps {
  user?: Profile | null;
  onNavigateToChallenge?: () => void;
}

export const StudentRankSystem: React.FC<StudentRankSystemProps> = ({
  user,
  onNavigateToChallenge
}) => {
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [showRankDetailsModal, setShowRankDetailsModal] = useState<boolean>(false);

  // Load quiz history and compute challenge metrics
  useEffect(() => {
    const userId = user?.id || "usr-student";
    
    // Load daily quiz history
    const quizHistory = getFromDB<DailyQuizRecord>("amh_daily_quiz_history");
    const userHistory = quizHistory.filter((item) => item.user_id === userId || !item.user_id);
    
    const totalCompleted = userHistory.length;
    const totalCorrect = userHistory.filter((item) => item.is_correct).length;
    
    setCompletedCount(totalCompleted);
    setCorrectCount(totalCorrect);

    // Load XP & Streak
    const savedXP = localStorage.getItem(`amh_xp_${userId}`);
    if (savedXP) {
      setTotalXP(parseInt(savedXP, 10));
    } else {
      setTotalXP(totalCorrect * 50 + (totalCompleted - totalCorrect) * 10);
    }

    const savedStreak = localStorage.getItem(`amh_streak_${userId}`);
    if (savedStreak) {
      setStreakDays(parseInt(savedStreak, 10));
    }
  }, [user]);

  // Determine current tier
  const currentTier = RANK_TIERS.find(
    (tier) => completedCount >= tier.minChallenges && completedCount <= tier.maxChallenges
  ) || RANK_TIERS[RANK_TIERS.length - 1];

  const nextTier = RANK_TIERS.find((tier) => tier.id === currentTier.id + 1);

  // Calculate progress percentage to next tier
  let progressToNextTier = 100;
  let challengesNeeded = 0;

  if (nextTier) {
    const tierRange = nextTier.minChallenges - currentTier.minChallenges;
    const currentProgress = completedCount - currentTier.minChallenges;
    progressToNextTier = Math.min(100, Math.max(0, Math.round((currentProgress / tierRange) * 100)));
    challengesNeeded = nextTier.minChallenges - completedCount;
  }

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl text-navy-900 dark:text-white relative overflow-hidden space-y-6">
      {/* Background glow styling */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-150 dark:border-navy-800 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-gold-600 text-navy-950 font-black shadow-lg shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500/20 text-amber-600 dark:text-gold-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" /> Daily Challenge Ranking
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight mt-0.5">
              Student Rank & Badge Achievements
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowRankDetailsModal(!showRankDetailsModal)}
          className="px-4 py-2 bg-navy-50 dark:bg-navy-950 hover:bg-navy-100 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 text-xs font-mono font-bold rounded-xl border border-navy-200 dark:border-navy-800 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Info className="w-4 h-4 text-amber-500" />
          <span>Rank System Rules</span>
        </button>
      </div>

      {/* CURRENT RANK SHOWCASE CARD */}
      <div className={`p-6 rounded-2xl border ${currentTier.borderColor} ${currentTier.bgColor} relative z-10 space-y-5 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 flex items-center justify-center text-3xl shadow-md shrink-0">
              {currentTier.badgeSymbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-extrabold uppercase text-navy-500 dark:text-navy-400">
                  Current Tier Level {currentTier.id} of {RANK_TIERS.length}
                </span>
              </div>
              <h3 className={`text-2xl font-black font-display ${currentTier.color}`}>
                {currentTier.title}
              </h3>
              <p className="text-xs text-navy-600 dark:text-navy-300 mt-0.5 max-w-lg">
                {currentTier.description}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-navy-200/50 dark:border-navy-800/50 pt-3 sm:pt-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-navy-500 dark:text-navy-400 uppercase font-bold block">
                Total Challenges Done
              </span>
              <span className="text-2xl font-black font-display text-navy-900 dark:text-white">
                {completedCount} <span className="text-xs font-normal text-navy-500">problems</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 mt-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{totalXP} Total XP</span>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR TO NEXT TIER */}
        <div className="space-y-2 pt-1 border-t border-navy-200/40 dark:border-navy-800/40">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-navy-600 dark:text-navy-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-royal-500" />
              {nextTier ? (
                <>Next Title: <span className={nextTier.color}>{nextTier.title}</span> ({challengesNeeded} more needed)</>
              ) : (
                <span className="text-amber-500">Max Rank Reached! You are a Math Grandmaster 👑</span>
              )}
            </span>
            <span className="text-navy-900 dark:text-white">{progressToNextTier}%</span>
          </div>

          <div className="w-full h-3 bg-navy-150 dark:bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-200 dark:border-navy-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextTier}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-500 via-gold-400 to-emerald-500 rounded-full shadow-sm"
            />
          </div>
        </div>

        {/* UNLOCKED PERK BANNER */}
        <div className="p-3 rounded-xl bg-white/80 dark:bg-navy-950/80 border border-navy-200 dark:border-navy-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span><strong className="text-emerald-600 dark:text-emerald-400">Active Tier Perk:</strong> {currentTier.perk}</span>
          </div>
        </div>
      </div>

      {/* MILESTONE BADGES GRID */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold font-display text-navy-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Milestone Achievement Badges
          </h4>
          <span className="text-xs font-mono text-navy-500 dark:text-navy-400">
            {MILESTONE_BADGES.filter((b) => completedCount >= b.requiredCount).length} of {MILESTONE_BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {MILESTONE_BADGES.map((badge) => {
            const isUnlocked = completedCount >= badge.requiredCount;
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? "bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 border-amber-500/40 shadow-sm"
                    : "bg-navy-50/50 dark:bg-navy-950/40 border-navy-200/50 dark:border-navy-800/50 opacity-60"
                }`}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{badge.icon}</span>
                  {isUnlocked ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-navy-200 dark:bg-navy-800 text-navy-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="text-xs font-bold font-display text-navy-900 dark:text-white">
                    {badge.title}
                  </h5>
                  <p className="text-[10px] text-navy-500 dark:text-navy-400 mt-0.5 line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-navy-400">{badge.requiredCount} Challenges</span>
                  <span className="text-amber-500 font-bold">+{badge.xpBonus} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANK SYSTEM RULES MODAL */}
      <AnimatePresence>
        {showRankDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl text-navy-900 dark:text-white space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy-200 dark:border-navy-800">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-black font-display">Student Rank & Title Hierarchy</h3>
                </div>
                <button
                  onClick={() => setShowRankDetailsModal(false)}
                  className="p-1 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-500 text-xs font-mono cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <p className="text-xs text-navy-600 dark:text-navy-300">
                Completing Daily Math Challenges awards XP points and advances your Student Rank. Higher ranks demonstrate your readiness for NSC (CAPS) & IEB Grade 10-12 matric examinations.
              </p>

              <div className="space-y-3">
                {RANK_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-3.5 rounded-2xl border ${tier.borderColor} ${tier.bgColor} flex items-start gap-3 text-xs`}
                  >
                    <span className="text-2xl">{tier.badgeSymbol}</span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-black font-display ${tier.color}`}>
                          Tier {tier.id}: {tier.title}
                        </h4>
                        <span className="font-mono text-[10px] text-navy-400 font-bold">
                          {tier.minChallenges} - {tier.maxChallenges === 999 ? "21+" : tier.maxChallenges} Challenges
                        </span>
                      </div>
                      <p className="text-navy-600 dark:text-navy-300">{tier.description}</p>
                      <span className="inline-block text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        🎁 Perk: {tier.perk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowRankDetailsModal(false)}
                  className="px-5 py-2.5 bg-royal-600 text-white font-mono font-bold text-xs rounded-xl hover:bg-royal-700 transition-colors cursor-pointer"
                >
                  Got It, Let's Practice!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
