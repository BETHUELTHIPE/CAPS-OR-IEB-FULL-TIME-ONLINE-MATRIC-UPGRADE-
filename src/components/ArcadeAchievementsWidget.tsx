import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Crown, 
  Zap, 
  Flame, 
  Award, 
  Sparkles, 
  Target, 
  Shield, 
  Medal, 
  CheckCircle2, 
  Lock, 
  Star, 
  Filter, 
  TrendingUp, 
  ChevronRight,
  Share2
} from "lucide-react";
import { Profile, ArcadeAchievement } from "../types";
import { dbAPI } from "../lib/db";

export interface ArcadeAchievementsWidgetProps {
  user?: Profile | null;
  compactMode?: boolean;
}

export type TierFilterOption = "ALL" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export const ArcadeAchievementsWidget: React.FC<ArcadeAchievementsWidgetProps> = ({
  user,
  compactMode = false
}) => {
  const [achievements, setAchievements] = useState<ArcadeAchievement[]>([]);
  const [tierFilter, setTierFilter] = useState<TierFilterOption>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const studentId = user?.id || "usr-bethuel";

  const loadAchievements = () => {
    try {
      const data = dbAPI.getArcadeAchievements(studentId);
      setAchievements(data);
    } catch (e) {
      console.error("Failed to load arcade achievements:", e);
    }
  };

  useEffect(() => {
    loadAchievements();

    const handleUpdate = () => {
      loadAchievements();
    };

    window.addEventListener("arcadeScoreLogged", handleUpdate);
    window.addEventListener("arcadeAchievementsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("arcadeScoreLogged", handleUpdate);
      window.removeEventListener("arcadeAchievementsUpdated", handleUpdate);
    };
  }, [studentId]);

  // Derived metrics
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Render Icon helper
  const renderIcon = (iconName: string, isUnlocked: boolean, tier: string) => {
    const iconProps = { className: "w-6 h-6" };
    switch (iconName) {
      case "Zap": return <Zap {...iconProps} />;
      case "Flame": return <Flame {...iconProps} />;
      case "Crown": return <Crown {...iconProps} />;
      case "Trophy": return <Trophy {...iconProps} />;
      case "Award": return <Award {...iconProps} />;
      case "Sparkles": return <Sparkles {...iconProps} />;
      case "Target": return <Target {...iconProps} />;
      case "Shield": return <Shield {...iconProps} />;
      case "Medal": return <Medal {...iconProps} />;
      default: return <Star {...iconProps} />;
    }
  };

  // Tier Styling mapping
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return {
          bg: "bg-amber-800/15 border-amber-800/40 text-amber-700 dark:text-amber-400",
          accent: "from-amber-700 to-amber-900",
          text: "Bronze Tier"
        };
      case "Silver":
        return {
          bg: "bg-slate-300/20 border-slate-400/40 text-slate-700 dark:text-slate-300",
          accent: "from-slate-300 to-slate-500",
          text: "Silver Tier"
        };
      case "Gold":
        return {
          bg: "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300",
          accent: "from-amber-400 to-amber-600",
          text: "Gold Tier"
        };
      case "Platinum":
        return {
          bg: "bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-300",
          accent: "from-cyan-400 to-blue-600",
          text: "Platinum Tier"
        };
      case "Diamond":
        return {
          bg: "bg-purple-500/20 border-purple-500/40 text-purple-600 dark:text-purple-300",
          accent: "from-purple-400 via-pink-500 to-indigo-600",
          text: "Diamond Tier"
        };
      default:
        return {
          bg: "bg-slate-200 text-slate-700",
          accent: "from-slate-400 to-slate-600",
          text: tier
        };
    }
  };

  const filtered = achievements.filter(a => {
    if (tierFilter !== "ALL" && a.tier !== tierFilter) return false;
    if (selectedCategory !== "ALL" && a.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-navy-900 border-2 border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-6 text-left relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              Trophy Room
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Profile Verified Badges</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            Arcade Achievements & Trophies
          </h3>
        </div>

        {/* PROGRESS METRIC PILL */}
        <div className="bg-slate-100 dark:bg-navy-950 px-4 py-2 rounded-2xl border border-slate-200 dark:border-navy-800 flex items-center gap-3 shrink-0 font-mono">
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 block font-bold">Trophies Unlocked</span>
            <span className="text-base font-black text-amber-500">
              {unlockedCount} / {totalCount} <span className="text-xs text-slate-400 font-normal">({unlockPercentage}%)</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs">
            <Crown className="w-5 h-5 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* PROGRESS BAR STRIP */}
      <div className="space-y-1 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span>Overall Trophy Mastery</span>
          <span className="text-amber-500 font-black">{unlockPercentage}% Completed</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-navy-950 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-navy-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 rounded-full transition-all duration-700"
            style={{ width: `${unlockPercentage}%` }}
          />
        </div>
      </div>

      {/* TIER FILTERS */}
      {!compactMode && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {[
            { id: "ALL", label: "All Trophies" },
            { id: "Bronze", label: "Bronze" },
            { id: "Silver", label: "Silver" },
            { id: "Gold", label: "Gold" },
            { id: "Platinum", label: "Platinum" },
            { id: "Diamond", label: "Diamond" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTierFilter(t.id as TierFilterOption)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                tierFilter === t.id
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* TROPHIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, compactMode ? 6 : filtered.length).map((ach) => {
          const tierInfo = getTierBadge(ach.tier);
          const pct = Math.min(100, Math.round((ach.progress_value / ach.required_value) * 100));

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-3 font-mono ${
                ach.unlocked
                  ? "bg-gradient-to-br from-amber-500/10 via-slate-50 dark:via-navy-950 to-amber-500/5 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                  : "bg-slate-50/60 dark:bg-navy-950/60 border-slate-200 dark:border-navy-800 opacity-80"
              }`}
            >
              <div className="space-y-2">
                {/* CARD TOP ROW: ICON & TIER BADGE */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                    ach.unlocked
                      ? `bg-gradient-to-tr ${tierInfo.accent} text-white scale-105`
                      : "bg-slate-200 dark:bg-navy-800 text-slate-400 dark:text-slate-500"
                  }`}>
                    {ach.unlocked ? (
                      renderIcon(ach.icon, true, ach.tier)
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${tierInfo.bg}`}>
                    {tierInfo.text}
                  </span>
                </div>

                {/* TITLE & DESCRIPTION */}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                    {ach.title}
                    {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* PROGRESS / UNLOCKED DATE FOOTER */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-navy-800/60 text-[10px]">
                {ach.unlocked ? (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Unlocked
                    </span>
                    <span className="text-slate-400 font-normal">
                      {ach.unlocked_at ? new Date(ach.unlocked_at).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }) : "Claimed"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <span>Progress</span>
                      <span>
                        {ach.progress_value} / {ach.required_value} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
