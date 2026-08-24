import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Target, 
  Flame, 
  Award, 
  Headphones, 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
  Trash2, 
  Maximize2,
  BookOpen,
  CheckCircle2,
  Zap,
  BarChart3,
  RefreshCw,
  Printer,
  FileText
} from "lucide-react";
import { DeepFocusSession, Profile } from "../types";
import { dbAPI, saveToDB, getFromDB } from "../lib/db";

export interface FocusHistoryWidgetProps {
  user?: Profile | null;
  onStartFocusSession?: () => void;
  onOpenSessionReview?: () => void;
}

export const FocusHistoryWidget: React.FC<FocusHistoryWidgetProps> = ({
  user,
  onStartFocusSession,
  onOpenSessionReview
}) => {
  const [sessions, setSessions] = useState<DeepFocusSession[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const studentId = user?.id || "usr-bethuel";

  // Load Deep Focus Sessions
  const loadSessions = () => {
    setIsLoading(true);
    try {
      const data = dbAPI.getDeepFocusSessions(studentId);
      setSessions(data);
    } catch (e) {
      console.error("Failed to load deep focus sessions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();

    const handleSessionLogged = () => {
      loadSessions();
    };

    window.addEventListener("deepFocusSessionLogged", handleSessionLogged);
    window.addEventListener("storage", handleSessionLogged);

    return () => {
      window.removeEventListener("deepFocusSessionLogged", handleSessionLogged);
      window.removeEventListener("storage", handleSessionLogged);
    };
  }, [studentId]);

  // Calculations
  const totalMinutes = sessions.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSessionsCount = sessions.length;

  const gradedSessions = sessions.filter((s) => s.score_percentage !== undefined);
  const avgAccuracy = gradedSessions.length > 0
    ? Math.round(gradedSessions.reduce((acc, curr) => acc + (curr.score_percentage || 0), 0) / gradedSessions.length)
    : 100;

  // Audio preference breakdown
  const audioCounts = sessions.reduce((acc, curr) => {
    const key = curr.ambient_audio_used || "none";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let topAudioLabel = "Mute / Off";
  if ((audioCounts["focus_tone"] || 0) > (audioCounts["rain"] || 0) && (audioCounts["focus_tone"] || 0) > (audioCounts["none"] || 0)) {
    topAudioLabel = "432Hz Focus Tone";
  } else if ((audioCounts["rain"] || 0) > (audioCounts["focus_tone"] || 0) && (audioCounts["rain"] || 0) > (audioCounts["none"] || 0)) {
    topAudioLabel = "Soft Rain Ambient";
  }

  // Calculate Streak (consecutive days with at least 1 session)
  const calculateStreak = (): number => {
    if (sessions.length === 0) return 0;
    const uniqueDates = Array.from(new Set(
      sessions.map((s) => new Date(s.timestamp).toISOString().split("T")[0])
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let checkDate = uniqueDates.includes(today) ? today : uniqueDates.includes(yesterday) ? yesterday : null;
    if (!checkDate) return 0;

    let currTime = new Date(checkDate).getTime();
    while (true) {
      const dateStr = new Date(currTime).toISOString().split("T")[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        currTime -= 86400000; // go back 1 day
      } else {
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  // Filtered list
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = 
      s.topic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.paper_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedFilter === "ALL") return matchesSearch;
    if (selectedFilter === "CAPS_P1") return matchesSearch && s.paper_category.includes("P1");
    if (selectedFilter === "CAPS_P2") return matchesSearch && s.paper_category.includes("P2");
    if (selectedFilter === "PERFECT") return matchesSearch && s.score_percentage === 100;

    return matchesSearch;
  });

  // Delete single session log
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveToDB("amh_deep_focus_sessions", updated);
  };

  // Launch Focus Mode
  const handleLaunchDeepFocus = () => {
    if (onStartFocusSession) {
      onStartFocusSession();
    } else {
      localStorage.setItem("amh_focus_mode", "true");
      window.dispatchEvent(new CustomEvent("focusModeToggle", { detail: { active: true } }));
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
              Focus Mode Analytics
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              [CAPS & IEB Tracked]
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Deep Focus History & Session Logger
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
            Real-time tracking of distraction-free problem solving time, accuracy ratings, and topic consistency streaks.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0 flex-wrap">
          {onOpenSessionReview && (
            <button
              type="button"
              onClick={onOpenSessionReview}
              className="px-4 py-3 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-2xl border border-slate-200 dark:border-navy-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Hourly Session Review</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLaunchDeepFocus}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-mono font-black text-xs rounded-2xl border border-amber-400 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-slate-950" />
            <span>Launch Deep Focus Mode</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY BENTO GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400">
              Total Focus Time
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {totalHours}h
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({totalMinutes} mins)
            </span>
          </div>
          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Distraction-free study
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400">
              Sessions Completed
            </span>
            <div className="p-2 rounded-xl bg-royal-500/10 text-royal-600 dark:text-royal-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {totalSessionsCount}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Sprints
            </span>
          </div>
          <div className="text-[10px] font-mono text-royal-600 dark:text-royal-400 font-bold">
            Avg {totalSessionsCount > 0 ? Math.round(totalMinutes / totalSessionsCount) : 0} mins / session
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400">
              Focus Streak
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {streakDays}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Days Active
            </span>
          </div>
          <div className="text-[10px] font-mono text-rose-500 font-bold">
            {streakDays > 0 ? "🔥 Consistency streak alive!" : "Start a sprint today"}
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400">
              Marks Accuracy
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {avgAccuracy}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              Score
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 truncate">
            <Headphones className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{topAudioLabel}</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or notes..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedFilter === "ALL"
                ? "bg-amber-500 text-slate-950 font-black"
                : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Logs ({sessions.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter("CAPS_P1")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedFilter === "CAPS_P1"
                ? "bg-royal-600 text-white font-black"
                : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Paper 1
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter("CAPS_P2")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedFilter === "CAPS_P2"
                ? "bg-royal-600 text-white font-black"
                : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Paper 2
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter("PERFECT")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedFilter === "PERFECT"
                ? "bg-emerald-600 text-white font-black"
                : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            100% Full Marks
          </button>
        </div>
      </div>

      {/* SESSION LOG LIST */}
      <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
          <span className="font-mono font-black text-xs uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Logged Focus Sessions ({filteredSessions.length})
          </span>

          <button
            type="button"
            onClick={loadSessions}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-navy-950 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-950 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-xs font-mono text-slate-500 font-bold">
              No deep focus session logs matching filter.
            </p>
            <button
              type="button"
              onClick={handleLaunchDeepFocus}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs rounded-xl cursor-pointer"
            >
              Start First Deep Focus Sprint
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const formattedDate = new Date(session.timestamp).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-amber-400/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-royal-500/15 text-royal-600 dark:text-gold-400 border border-royal-500/20">
                        {session.paper_category}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formattedDate}
                      </span>

                      {session.ambient_audio_used && session.ambient_audio_used !== "none" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          {session.ambient_audio_used === "focus_tone" ? "432Hz Tone" : "Soft Rain"}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {session.topic_name}
                    </h4>

                    {session.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        "{session.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                          {session.duration_minutes}m
                        </span>
                      </div>

                      {session.score_percentage !== undefined && (
                        <span className={`text-[11px] font-mono font-bold block ${
                          session.score_percentage >= 80 ? "text-emerald-500" : "text-amber-500"
                        }`}>
                          {session.marks_achieved !== undefined && session.total_marks !== undefined
                            ? `${session.marks_achieved}/${session.total_marks} Marks (${session.score_percentage}%)`
                            : `${session.score_percentage}% Score`}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
