import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
  Target,
  Shield,
  Medal,
  Crown,
  Flame,
  Star,
  BookOpen,
  ChevronRight,
  Filter,
  Check,
  AlertCircle
} from "lucide-react";
import { Profile } from "../types";
import { CountUp } from "./CountUp";

export interface MilestoneBadge {
  id: string;
  title: string;
  category: "Algebra" | "Geometry" | "Trigonometry" | "Calculus" | "Finance & Stats" | "Overall";
  description: string;
  icon: string; // Emoji or Lucide icon name
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  xpReward: number;
  requiredModuleIds: string[]; // Specific module IDs needed
  requiredCount?: number; // Or minimum total module count needed
  unlocked: boolean;
  currentCount: number;
  targetCount: number;
  unlockedAt?: string;
}

interface StudentMilestonesProps {
  user?: Profile | null;
  onNavigateTab?: (tabName: string) => void;
}

export const StudentMilestones: React.FC<StudentMilestonesProps> = ({ user, onNavigateTab }) => {
  const userId = user?.id || user?.email || "default_student";
  const courseStorageKey = `amh_completed_course_modules_${userId}`;
  const topicStorageKey = `amh_completed_modules_${userId}`;

  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeModalBadge, setActiveModalBadge] = useState<MilestoneBadge | null>(null);
  const [claimedXpBadgeIds, setClaimedXpBadgeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`amh_claimed_milestone_xp_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load completed module IDs from localStorage
  useEffect(() => {
    const loadModules = () => {
      try {
        let courseMods: string[] = [];
        let topicMods: string[] = [];

        if (user?.completed_modules && Array.isArray(user.completed_modules)) {
          courseMods = user.completed_modules;
        } else {
          const savedCourseMods = localStorage.getItem(courseStorageKey);
          if (savedCourseMods) courseMods = JSON.parse(savedCourseMods);
        }

        const savedTopicMods = localStorage.getItem(topicStorageKey);
        if (savedTopicMods) topicMods = JSON.parse(savedTopicMods);

        const combined = Array.from(new Set([...courseMods, ...topicMods]));
        if (combined.length === 0) {
          // Default seed if empty for immediate rich visual display
          setCompletedModuleIds([
            "mod_g12_1", "mod_g12_3", "mod_g12_4", "mod_g12_7", "mod_g12_9",
            "mod_g11_1", "mod_g11_2", "mod_g11_3", "mod_g11_5",
            "mod_ap_1", "mod_ap_3",
            "mod_g10_1", "mod_g10_2", "mod_g10_3", "mod_g10_4"
          ]);
        } else {
          setCompletedModuleIds(combined);
        }
      } catch (e) {
        console.warn("Could not load completed modules for milestones:", e);
      }
    };

    loadModules();
    const interval = setInterval(loadModules, 2000);
    return () => clearInterval(interval);
  }, [userId, user]);

  // Define module category lists for mapping
  const algebraModules = ["mod_g12_1", "mod_g12_2", "mod_g12_3", "mod_g12_4", "mod_g12_5", "mod_g11_1", "mod_g11_2", "mod_g11_3", "mod_g11_4", "mod_g10_1", "mod_g10_2", "mod_g10_3"];
  const geometryModules = ["mod_g12_9", "mod_g12_10", "mod_g11_6", "mod_g11_7", "mod_g10_5"];
  const trigModules = ["mod_g12_7", "mod_g12_8", "mod_g11_5", "mod_g10_4"];
  const calculusModules = ["mod_g12_1", "mod_g12_2", "mod_ap_1", "mod_ap_2"];
  const financeStatsModules = ["mod_g12_6", "mod_g12_11", "mod_ap_5"];

  const algebraDoneCount = algebraModules.filter(id => completedModuleIds.includes(id)).length;
  const geometryDoneCount = geometryModules.filter(id => completedModuleIds.includes(id)).length;
  const trigDoneCount = trigModules.filter(id => completedModuleIds.includes(id)).length;
  const calculusDoneCount = calculusModules.filter(id => completedModuleIds.includes(id)).length;
  const financeStatsDoneCount = financeStatsModules.filter(id => completedModuleIds.includes(id)).length;
  const totalDoneCount = completedModuleIds.length;

  // Compute dynamic Milestone Badges
  const milestoneBadges: MilestoneBadge[] = [
    {
      id: "badge-alg-ace",
      title: "Algebra Ace",
      category: "Algebra",
      description: "Demonstrated superior command over CAPS Quadratic Equations, Surds, Exponents, and Number Patterns.",
      icon: "⚡",
      rarity: "Epic",
      xpReward: 250,
      requiredModuleIds: algebraModules,
      requiredCount: 3,
      unlocked: algebraDoneCount >= 3,
      currentCount: Math.min(3, algebraDoneCount),
      targetCount: 3,
      unlockedAt: algebraDoneCount >= 3 ? "2026-07-28" : undefined
    },
    {
      id: "badge-geo-guru",
      title: "Geometry Guru",
      category: "Geometry",
      description: "Mastered Analytical Circle Equations, Tangents, and Euclidean Circle Theorems 1 to 7.",
      icon: "📐",
      rarity: "Legendary",
      xpReward: 350,
      requiredModuleIds: geometryModules,
      requiredCount: 3,
      unlocked: geometryDoneCount >= 3,
      currentCount: Math.min(3, geometryDoneCount),
      targetCount: 3,
      unlockedAt: geometryDoneCount >= 3 ? "2026-07-29" : undefined
    },
    {
      id: "badge-trig-titan",
      title: "Trigonometry Titan",
      category: "Trigonometry",
      description: "Flawlessly solved Compound Angle Expansions, Double Angle Identities, and 2D/3D Sine/Cosine Rules.",
      icon: "🔁",
      rarity: "Epic",
      xpReward: 300,
      requiredModuleIds: trigModules,
      requiredCount: 2,
      unlocked: trigDoneCount >= 2,
      currentCount: Math.min(2, trigDoneCount),
      targetCount: 2,
      unlockedAt: trigDoneCount >= 2 ? "2026-07-26" : undefined
    },
    {
      id: "badge-calc-captain",
      title: "Calculus Captain",
      category: "Calculus",
      description: "Conquered Differential Limits, f'(x) First Principles, and Cubic Polynomial Optimization curves.",
      icon: "♾️",
      rarity: "Mythic",
      xpReward: 500,
      requiredModuleIds: calculusModules,
      requiredCount: 2,
      unlocked: calculusDoneCount >= 2,
      currentCount: Math.min(2, calculusDoneCount),
      targetCount: 2,
      unlockedAt: calculusDoneCount >= 2 ? "2026-07-30" : undefined
    },
    {
      id: "badge-finance-virtuoso",
      title: "Finance & Probability Virtuoso",
      category: "Finance & Stats",
      description: "Accurately calculated Present/Future Value Annuities, Sinking Funds, and Fundamental Counting Permutations.",
      icon: "💰",
      rarity: "Rare",
      xpReward: 200,
      requiredModuleIds: financeStatsModules,
      requiredCount: 1,
      unlocked: financeStatsDoneCount >= 1,
      currentCount: Math.min(1, financeStatsDoneCount),
      targetCount: 1,
      unlockedAt: financeStatsDoneCount >= 1 ? "2026-07-27" : undefined
    },
    {
      id: "badge-syllabus-pioneer",
      title: "Syllabus Pioneer",
      category: "Overall",
      description: "Completed 5 core CAPS/IEB syllabus modules across any mathematical topic.",
      icon: "🚀",
      rarity: "Rare",
      xpReward: 200,
      requiredModuleIds: [],
      requiredCount: 5,
      unlocked: totalDoneCount >= 5,
      currentCount: Math.min(5, totalDoneCount),
      targetCount: 5,
      unlockedAt: totalDoneCount >= 5 ? "2026-07-22" : undefined
    },
    {
      id: "badge-matric-hero",
      title: "Matric Milestone Master",
      category: "Overall",
      description: "Crossed the double-digit mark by mastering 10 high school mathematics modules.",
      icon: "👑",
      rarity: "Legendary",
      xpReward: 400,
      requiredModuleIds: [],
      requiredCount: 10,
      unlocked: totalDoneCount >= 10,
      currentCount: Math.min(10, totalDoneCount),
      targetCount: 10,
      unlockedAt: totalDoneCount >= 10 ? "2026-07-30" : undefined
    },
    {
      id: "badge-distinction-pathfinder",
      title: "Distinction Pathfinder",
      category: "Overall",
      description: "Achieved absolute distinction readiness by completing 15 or more matric curriculum modules.",
      icon: "🌟",
      rarity: "Mythic",
      xpReward: 600,
      requiredModuleIds: [],
      requiredCount: 15,
      unlocked: totalDoneCount >= 15,
      currentCount: Math.min(15, totalDoneCount),
      targetCount: 15,
      unlockedAt: totalDoneCount >= 15 ? "2026-07-31" : undefined
    }
  ];

  const handleClaimXp = (badge: MilestoneBadge) => {
    if (!claimedXpBadgeIds.includes(badge.id)) {
      const updated = [...claimedXpBadgeIds, badge.id];
      setClaimedXpBadgeIds(updated);
      try {
        localStorage.setItem(`amh_claimed_milestone_xp_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.error("Error claiming XP:", e);
      }
    }
  };

  const unlockedCount = milestoneBadges.filter(b => b.unlocked).length;
  const totalBadges = milestoneBadges.length;
  const overallPercent = Math.round((unlockedCount / totalBadges) * 100);
  const totalEarnedXp = milestoneBadges.filter(b => b.unlocked).reduce((sum, b) => sum + b.xpReward, 0);

  // Filtered badges
  const filteredBadges = milestoneBadges.filter(badge => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Unlocked") return badge.unlocked;
    if (selectedFilter === "In Progress") return !badge.unlocked;
    return badge.category === selectedFilter;
  });

  const getRarityBadgeStyle = (rarity: MilestoneBadge["rarity"]) => {
    switch (rarity) {
      case "Common":
        return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-navy-800 dark:text-slate-300 dark:border-navy-700";
      case "Rare":
        return "bg-royal-500/10 text-royal-600 border-royal-500/20 dark:text-royal-400";
      case "Epic":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400";
      case "Legendary":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400";
      case "Mythic":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400";
    }
  };

  return (
    <div
      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-7 shadow-xl transition-all space-y-6 text-left relative overflow-hidden"
      id="student-milestones-widget"
    >
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-royal-600/5 dark:bg-royal-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Syllabus Module Achievements
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400 border border-royal-500/20">
              Module Mastery Rewards
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Student Milestones</span>
            <span className="text-xs font-mono font-normal text-amber-600 dark:text-gold-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {unlockedCount} / {totalBadges} Badges Unlocked
            </span>
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Earn virtual badges (e.g. <b>Geometry Guru</b>, <b>Algebra Ace</b>) as you complete specific high school mathematics modules.
          </p>
        </div>

        {/* SUMMARY BADGE PROGRESS STATS */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl px-4 py-2 text-center">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase">Total XP Earned</span>
            <div className="text-lg font-black font-mono text-amber-500 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>{totalEarnedXp} XP</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl px-4 py-2 text-center">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase">Completion Rate</span>
            <div className="text-lg font-black font-mono text-royal-600 dark:text-royal-400">
              {overallPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono font-bold scrollbar-none">
        {["All", "Unlocked", "In Progress", "Algebra", "Geometry", "Trigonometry", "Calculus"].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              selectedFilter === filter
                ? "bg-royal-600 text-white border-royal-600 shadow-xs"
                : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-royal-400"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* MILESTONE BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const isClaimed = claimedXpBadgeIds.includes(badge.id);
          const percent = Math.min(100, Math.round((badge.currentCount / badge.targetCount) * 100));

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3 }}
              className={`border rounded-2xl p-4 transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
                badge.unlocked
                  ? "bg-gradient-to-b from-white to-amber-500/5 dark:from-navy-900 dark:to-amber-500/10 border-amber-500/40 dark:border-amber-500/30 shadow-md ring-1 ring-amber-500/20"
                  : "bg-slate-50/70 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800/80 opacity-80 hover:opacity-100"
              }`}
            >
              {/* TOP ROW: ICON & RARITY */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border ${
                    badge.unlocked
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-gold-400"
                      : "bg-slate-200/60 dark:bg-navy-800 border-slate-300 dark:border-navy-700 text-slate-400 grayscale"
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getRarityBadgeStyle(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-gold-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-500" />
                    +{badge.xpReward} XP
                  </span>
                </div>
              </div>

              {/* MIDDLE: TITLE & DESCRIPTION */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate font-display">
                    {badge.title}
                  </h3>
                  {badge.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* PROGRESS BAR & UNLOCK CONDITION */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-navy-800/60">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400 font-semibold">
                    {badge.unlocked ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Unlocked {badge.unlockedAt || ""}
                      </span>
                    ) : (
                      <span>Req: {badge.targetCount} Modules</span>
                    )}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {badge.currentCount}/{badge.targetCount}
                  </span>
                </div>

                {/* PROGRESS TRACK */}
                <div className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      badge.unlocked
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-royal-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* CLAIM XP / VIEW DETAILS BUTTON */}
              <div>
                {badge.unlocked ? (
                  <button
                    onClick={() => handleClaimXp(badge)}
                    disabled={isClaimed}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1 cursor-pointer ${
                      isClaimed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500 hover:bg-amber-600 text-navy-950 shadow-xs"
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>XP Claimed</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Claim +{badge.xpReward} XP</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModalBadge(badge)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer font-mono"
                  >
                    <Lock className="w-3 h-3" />
                    <span>How to Unlock</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* HOW TO UNLOCK MODAL */}
      {activeModalBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 shadow-2xl space-y-4 text-left relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeModalBadge.icon}</span>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">{activeModalBadge.title}</h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getRarityBadgeStyle(activeModalBadge.rarity)}`}>
                    {activeModalBadge.rarity} Badge
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalBadge(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeModalBadge.description}
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase">
                Unlock Requirement:
              </span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Complete {activeModalBadge.targetCount} core modules in {activeModalBadge.category}. You have currently finished {activeModalBadge.currentCount} / {activeModalBadge.targetCount}.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveModalBadge(null);
                if (onNavigateTab) onNavigateTab("resources");
              }}
              className="w-full py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to Resource Library & Complete Modules</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
