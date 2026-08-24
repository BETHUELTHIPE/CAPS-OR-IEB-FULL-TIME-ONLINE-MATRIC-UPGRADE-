import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Zap, 
  Crown, 
  Flame, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Filter, 
  UserCheck, 
  Target,
  Medal,
  Clock
} from "lucide-react";
import { Profile, ArcadeScore } from "../types";
import { dbAPI } from "../lib/db";

export interface ArcadeTopScorersWidgetProps {
  user?: Profile | null;
  onLaunchArcade?: () => void;
  compactMode?: boolean;
}

export type ScoreFilterMode = "all" | "60s_blitz" | "survival_3_lives" | "algebra_frenzy" | "speed_calc";

export const ArcadeTopScorersWidget: React.FC<ArcadeTopScorersWidgetProps> = ({ 
  user, 
  onLaunchArcade,
  compactMode = false
}) => {
  const [scores, setScores] = useState<ArcadeScore[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<ScoreFilterMode>("all");
  const [viewType, setViewType] = useState<"SINGLE_RUN" | "AGGREGATED">("SINGLE_RUN");

  const studentId = user?.id || "usr-bethuel";

  // Load scores from localStorage DB
  const loadScores = () => {
    try {
      const data = dbAPI.getArcadeScores();
      setScores(data);
    } catch (e) {
      console.error("Failed to load arcade scores:", e);
    }
  };

  useEffect(() => {
    loadScores();

    const handleScoreLogged = () => {
      loadScores();
    };

    window.addEventListener("arcadeScoreLogged", handleScoreLogged);
    return () => {
      window.removeEventListener("arcadeScoreLogged", handleScoreLogged);
    };
  }, []);

  // Filtered scores
  const filteredScores = scores.filter((s) => {
    if (selectedFilter === "all") return true;
    return s.mode === selectedFilter;
  });

  // Ranking by Single High Score
  const singleRunRankings = [...filteredScores].sort((a, b) => b.velocity_points - a.velocity_points);

  // Aggregated Total Points per Student
  const studentTotalsMap = new Map<string, { student_id: string; student_name: string; total_points: number; max_combo: number; total_runs: number }>();
  
  scores.forEach((s) => {
    const existing = studentTotalsMap.get(s.student_id);
    if (existing) {
      existing.total_points += s.velocity_points;
      existing.max_combo = Math.max(existing.max_combo, s.max_combo);
      existing.total_runs += 1;
    } else {
      studentTotalsMap.set(s.student_id, {
        student_id: s.student_id,
        student_name: s.student_name,
        total_points: s.velocity_points,
        max_combo: s.max_combo,
        total_runs: 1
      });
    }
  });

  const aggregatedRankings = Array.from(studentTotalsMap.values()).sort((a, b) => b.total_points - a.total_points);

  // Top Champion (1st Place)
  const topChampion = singleRunRankings.length > 0 ? singleRunRankings[0] : null;

  // Find User's Rank in Single High Scores
  const userRankIndex = singleRunRankings.findIndex((s) => s.student_id === studentId);
  const userBestRun = userRankIndex !== -1 ? singleRunRankings[userRankIndex] : null;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  // Gap to Next Rank
  let gapToNextRank = 0;
  let nextRankName = "";
  if (userRankIndex > 0) {
    const nextAhead = singleRunRankings[userRankIndex - 1];
    gapToNextRank = nextAhead.velocity_points - (userBestRun?.velocity_points || 0) + 1;
    nextRankName = nextAhead.student_name;
  }

  return (
    <div className="bg-white dark:bg-navy-900 border-2 border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-6 text-left relative overflow-hidden">
      {/* GLOW DECORATION */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 border border-amber-500/30">
              <Zap className="w-3 h-3 fill-amber-500" />
              Live Rankings
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Synced Real-Time</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Arcade Top Scorers
          </h3>
        </div>

        {/* Action Button & View Type Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-navy-800 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setViewType("SINGLE_RUN")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewType === "SINGLE_RUN" 
                  ? "bg-amber-500 text-slate-950 shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Best Run
            </button>
            <button
              type="button"
              onClick={() => setViewType("AGGREGATED")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewType === "AGGREGATED" 
                  ? "bg-amber-500 text-slate-950 shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Total Velocity
            </button>
          </div>

          {onLaunchArcade && (
            <button
              type="button"
              onClick={onLaunchArcade}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-mono font-black text-xs rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Arcade</span>
            </button>
          )}
        </div>
      </div>

      {/* ARCADE CHAMPION SPOTLIGHT CARD */}
      {topChampion && (
        <div className="bg-gradient-to-r from-navy-950 via-purple-950 to-navy-900 text-white p-5 rounded-3xl border-2 border-amber-500/50 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 z-10">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-gold-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Crown className="w-8 h-8 fill-slate-950 animate-bounce" />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-mono font-black text-[9px] px-1.5 py-0.2 rounded-full border border-slate-950 uppercase shadow">
                #1
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Current Arcade Champion
              </span>
              <h4 className="text-xl font-black text-white font-display">
                {topChampion.student_name}
              </h4>
              <p className="text-xs text-purple-200 font-mono">
                Mode: <strong className="text-amber-300">{topChampion.mode.replace("_", " ")}</strong> • {topChampion.accuracy_percentage}% Accuracy
              </p>
            </div>
          </div>

          <div className="bg-navy-900/80 border border-amber-500/40 px-5 py-3 rounded-2xl text-center sm:text-right font-mono z-10 shrink-0">
            <span className="text-[9px] uppercase text-purple-300 font-bold block">Highest Velocity Score</span>
            <span className="text-3xl font-black text-amber-400 tracking-wider">
              {topChampion.velocity_points} <span className="text-xs text-amber-300 font-normal">PTS</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
              🔥 {topChampion.max_combo}x Combo Streak
            </span>
          </div>
        </div>
      )}

      {/* MODE FILTER CHIPS */}
      {viewType === "SINGLE_RUN" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {[
            { id: "all", label: "All Modes" },
            { id: "60s_blitz", label: "60s Blitz" },
            { id: "survival_3_lives", label: "3 Lives Survival" },
            { id: "algebra_frenzy", label: "Algebra Frenzy" },
            { id: "speed_calc", label: "Mental Math" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSelectedFilter(mode.id as ScoreFilterMode)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === mode.id
                  ? "bg-purple-600 text-white shadow-md font-black"
                  : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {/* COMPETITOR RANK TRACKER CARD FOR CURRENT USER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-gold-500/10 to-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
            {userRank ? `#${userRank}` : "N/A"}
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold block">
              Your Position
            </span>
            <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {user ? `${user.first_name} ${user.surname}` : "Bethuel Thipe"} ({userBestRun ? `${userBestRun.velocity_points} pts` : "No score yet"})
            </h5>
          </div>
        </div>

        <div className="text-right sm:text-right text-xs">
          {userRankIndex === 0 ? (
            <span className="text-amber-500 font-extrabold flex items-center gap-1">
              <Crown className="w-4 h-4 fill-current" /> You lead the leaderboard!
            </span>
          ) : userRankIndex > 0 ? (
            <span className="text-purple-600 dark:text-purple-300 font-extrabold">
              ⚡ Need <strong className="text-amber-500 font-black">{gapToNextRank} pts</strong> to pass {nextRankName}!
            </span>
          ) : (
            <span className="text-slate-500 font-bold">
              Play a sprint to claim your rank!
            </span>
          )}
        </div>
      </div>

      {/* TOP SCORERS LIST TABLE */}
      <div className="space-y-2">
        {viewType === "SINGLE_RUN" ? (
          singleRunRankings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No scores recorded for this mode yet.
            </div>
          ) : (
            singleRunRankings.slice(0, compactMode ? 4 : 10).map((score, index) => {
              const isUser = score.student_id === studentId;
              const formattedDate = new Date(score.timestamp).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short"
              });

              return (
                <div
                  key={score.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 font-mono ${
                    isUser
                      ? "bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/40"
                      : "bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      index === 0 ? "bg-amber-500 text-slate-950 shadow" :
                      index === 1 ? "bg-slate-300 text-slate-950" :
                      index === 2 ? "bg-amber-700 text-white" :
                      "bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      #{index + 1}
                    </div>

                    <div>
                      <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {score.student_name}
                        {isUser && (
                          <span className="text-[8px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                            You
                          </span>
                        )}
                      </h5>
                      <span className="text-[10px] text-slate-400 block">
                        {score.mode.replace("_", " ")} • {score.accuracy_percentage}% Accuracy • {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-black text-amber-500 block">
                      {score.velocity_points} <span className="text-[10px]">pts</span>
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold block">
                      🔥 {score.max_combo}x Streak
                    </span>
                  </div>
                </div>
              );
            })
          )
        ) : (
          aggregatedRankings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No aggregate totals recorded yet.
            </div>
          ) : (
            aggregatedRankings.slice(0, compactMode ? 4 : 10).map((student, index) => {
              const isUser = student.student_id === studentId;

              return (
                <div
                  key={student.student_id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 font-mono ${
                    isUser
                      ? "bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/40"
                      : "bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      index === 0 ? "bg-amber-500 text-slate-950 shadow" :
                      index === 1 ? "bg-slate-300 text-slate-950" :
                      index === 2 ? "bg-amber-700 text-white" :
                      "bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      #{index + 1}
                    </div>

                    <div>
                      <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {student.student_name}
                        {isUser && (
                          <span className="text-[8px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                            You
                          </span>
                        )}
                      </h5>
                      <span className="text-[10px] text-slate-400 block">
                        {student.total_runs} Sprints Completed • Highest Streak: {student.max_combo}x
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-black text-emerald-500 block">
                      {student.total_points} <span className="text-[10px]">pts</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Accumulated Total
                    </span>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};
