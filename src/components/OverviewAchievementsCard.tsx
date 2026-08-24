import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Award, Flame, Zap, Trophy, ArrowRight, Sparkles, CheckCircle2, Lock, Star, FileCheck, TrendingUp, Video } from "lucide-react";
import { CountUp } from "./CountUp";
import { dbAPI } from "../lib/db";

export interface MiniBadge {
  id: string;
  title: string;
  category: string;
  description: string;
  iconType: string;
  unlocked: boolean;
  progress: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  xp: number;
  rarity: string;
}

interface OverviewAchievementsCardProps {
  onViewAllBadges: () => void;
}

export const OverviewAchievementsCard: React.FC<OverviewAchievementsCardProps> = ({ onViewAllBadges }) => {
  const [badges, setBadges] = useState<MiniBadge[]>([]);
  const [totalXP, setTotalXP] = useState(1450);
  const [streakDays, setStreakDays] = useState(7);
  const [unlockedCount, setUnlockedCount] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchBadges() {
      // Calculate dynamic milestone values
      const completedKeys = dbAPI.getCompletedSubtopics();
      const exponentKeys = completedKeys.filter(k => k.startsWith("syl-exp-surds::"));
      const exponentCount = exponentKeys.length;
      const isExponentsMastered = exponentCount >= 5;

      let fetchedBadges: MiniBadge[] = [];

      try {
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          if (data.badges && Array.isArray(data.badges) && isMounted) {
            fetchedBadges = data.badges;
            if (data.totalXP) setTotalXP(data.totalXP);
            if (data.streakDays) setStreakDays(data.streakDays);
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/achievements:", err);
      }

      if (fetchedBadges.length === 0) {
        fetchedBadges = [
          {
            id: "badge-mastered-exponents",
            title: "Mastered Exponents",
            category: "Curriculum",
            description: "Master exponent laws, surd simplifications, and exponential equations in Grade 10-12 CAPS/IEB.",
            iconType: "algebra",
            unlocked: isExponentsMastered,
            progress: Math.min(100, Math.round((exponentCount / 5) * 100)),
            currentValue: exponentCount,
            targetValue: 5,
            unit: "Subtopics",
            xp: 350,
            rarity: "Epic"
          },
          {
            id: "badge-weekly-streak",
            title: "Weekly Streak Achieved",
            category: "Streaks",
            description: "Log in and complete daily revision exercises for 7 consecutive days.",
            iconType: "streak",
            unlocked: true,
            progress: 100,
            currentValue: 7,
            targetValue: 7,
            unit: "Days",
            xp: 300,
            rarity: "Rare"
          },
          {
            id: "badge-algebra-master",
            title: "Algebra Master",
            category: "Curriculum",
            description: "Achieve at least 75% mastery in Grade 10-12 Algebra & Sequence equations.",
            iconType: "algebra",
            unlocked: true,
            progress: 100,
            currentValue: 85,
            targetValue: 75,
            unit: "% Mastery",
            xp: 250,
            rarity: "Epic"
          },
          {
            id: "badge-mock-champion",
            title: "Mock Trial Champion",
            category: "Exams",
            description: "Complete at least 3 CAPS/IEB mock trial examination papers with full scoring.",
            iconType: "mock",
            unlocked: true,
            progress: 100,
            currentValue: 3,
            targetValue: 3,
            unit: "Mocks",
            xp: 350,
            rarity: "Epic"
          }
        ];
      } else {
        // Sync dynamic status into fetched badges
        fetchedBadges = fetchedBadges.map(b => {
          if (b.id === "badge-mastered-exponents") {
            return {
              ...b,
              unlocked: isExponentsMastered,
              progress: Math.min(100, Math.round((exponentCount / 5) * 100)),
              currentValue: exponentCount
            };
          }
          return b;
        });
      }

      if (isMounted) {
        setBadges(fetchedBadges);
        setUnlockedCount(fetchedBadges.filter(b => b.unlocked).length);
        setLoading(false);
      }
    }
    fetchBadges();
    return () => { isMounted = false; };
  }, []);

  const renderBadgeIcon = (iconType: string, isUnlocked: boolean) => {
    const iconClass = `w-5 h-5 ${isUnlocked ? "text-amber-500 dark:text-gold-400" : "text-navy-400"}`;
    switch (iconType) {
      case "algebra":
        return <Zap className={iconClass} />;
      case "streak":
        return <Flame className={`w-5 h-5 ${isUnlocked ? "text-amber-500 animate-pulse" : "text-navy-400"}`} />;
      case "mock":
        return <Trophy className={iconClass} />;
      case "homework":
        return <FileCheck className={iconClass} />;
      case "calculus":
        return <TrendingUp className={iconClass} />;
      case "video":
        return <Video className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const featuredBadges = badges.slice(0, 4);

  return (
    <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/60 shadow-sm space-y-5 text-left">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-100 dark:border-navy-850">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm sm:text-base font-black text-navy-900 dark:text-white uppercase tracking-tight font-mono">
              Student Badges & Achievements
            </h3>
            <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border border-gold-500/20">
              Motivation Hub
            </span>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Earn academic milestones, streak multipliers, and exam distinction badges as you progress.
          </p>
        </div>

        {/* Quick Streak & XP Summary */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-gold-300 px-3 py-1.5 rounded-xl border border-amber-500/20">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <div className="text-right">
              <span className="block text-[8px] font-mono text-amber-600 dark:text-gold-400 font-black uppercase">Streak</span>
              <span className="text-xs font-black font-mono">
                <CountUp value={streakDays} suffix=" Days" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gold-500/10 dark:bg-gold-500/20 text-gold-700 dark:text-gold-300 px-3 py-1.5 rounded-xl border border-gold-500/20">
            <Zap className="w-4 h-4 text-gold-500" />
            <div className="text-right">
              <span className="block text-[8px] font-mono text-gold-600 dark:text-gold-400 font-black uppercase">XP Earned</span>
              <span className="text-xs font-black font-mono">
                <CountUp value={totalXP} suffix=" XP" />
              </span>
            </div>
          </div>

          <button
            onClick={onViewAllBadges}
            className="px-3.5 py-2 bg-navy-900 hover:bg-black dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-navy-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <span>All Badges ({unlockedCount}/{badges.length || 8})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Featured Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {featuredBadges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            onClick={onViewAllBadges}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 hover:shadow-md ${
              badge.unlocked
                ? "bg-gradient-to-br from-amber-500/5 via-white to-gold-500/10 dark:from-navy-900 dark:to-navy-950 border-gold-500/30 dark:border-gold-500/40"
                : "bg-navy-50/50 dark:bg-navy-950/40 border-navy-150 dark:border-navy-800 opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                  badge.unlocked
                    ? "bg-gradient-to-br from-navy-900 to-black text-gold-400 border border-gold-500/40 shadow-sm"
                    : "bg-navy-200 dark:bg-navy-800 text-navy-400"
                }`}>
                  {renderBadgeIcon(badge.iconType, badge.unlocked)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-navy-900 dark:text-white leading-tight">
                    {badge.title}
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-gold-600 dark:text-gold-400">
                    +{badge.xp} XP
                  </span>
                </div>
              </div>

              {badge.unlocked ? (
                <span className="shrink-0 p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="shrink-0 p-1 rounded-full bg-navy-200 dark:bg-navy-800 text-navy-400">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <p className="text-[11px] text-navy-600 dark:text-navy-300 line-clamp-2 leading-relaxed">
              {badge.description}
            </p>

            <div className="space-y-1 pt-1 border-t border-navy-100 dark:border-navy-850">
              <div className="flex justify-between text-[10px] font-mono text-navy-500 dark:text-navy-400">
                <span>{badge.category}</span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {badge.currentValue} / {badge.targetValue} {badge.unit}
                </span>
              </div>
              <div className="w-full bg-navy-200/60 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    badge.unlocked ? "bg-gradient-to-r from-gold-500 to-amber-500" : "bg-royal-500"
                  }`}
                  style={{ width: `${Math.min(100, badge.progress)}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
