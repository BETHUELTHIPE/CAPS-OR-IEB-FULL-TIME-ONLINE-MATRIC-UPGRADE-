import React, { useState, useEffect } from "react";
import { 
  Printer, 
  Clock, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Calendar, 
  FileText, 
  Filter, 
  Share2, 
  RefreshCw, 
  ChevronRight, 
  Zap, 
  Target, 
  ArrowLeft,
  Flame,
  Check,
  Copy,
  Download
} from "lucide-react";
import { DeepFocusSession, Profile } from "../types";
import { dbAPI } from "../lib/db";

export interface SessionReviewCardsProps {
  user?: Profile | null;
  onBackToFocus?: () => void;
}

export type TimeRangeOption = "1h" | "3h" | "24h" | "7d" | "all";

export const SessionReviewCards: React.FC<SessionReviewCardsProps> = ({
  user,
  onBackToFocus
}) => {
  const [sessions, setSessions] = useState<DeepFocusSession[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("1h");
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("ALL");

  const studentId = user?.id || "usr-bethuel";
  const studentName = user ? `${user.first_name} ${user.surname}`.trim() : "Bethuel Thipe";

  // Load Deep Focus Sessions
  const loadSessions = () => {
    try {
      const data = dbAPI.getDeepFocusSessions(studentId);
      setSessions(data);
    } catch (e) {
      console.error("Error loading deep focus sessions for review:", e);
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

  // Filter sessions based on selected time window
  const getFilteredByTime = () => {
    const now = Date.now();
    let cutoffMs = 1000 * 60 * 60; // default 1 hour (60 mins)

    if (timeRange === "3h") cutoffMs = 1000 * 60 * 60 * 3;
    if (timeRange === "24h") cutoffMs = 1000 * 60 * 60 * 24;
    if (timeRange === "7d") cutoffMs = 1000 * 60 * 60 * 24 * 7;
    if (timeRange === "all") cutoffMs = Number.MAX_SAFE_INTEGER;

    let timeFiltered = sessions.filter((s) => {
      const sessionTime = new Date(s.timestamp).getTime();
      return now - sessionTime <= cutoffMs;
    });

    // Fallback: If 1h filter returns 0 items, auto show recent sessions with a banner explanation
    if (timeRange === "1h" && timeFiltered.length === 0 && sessions.length > 0) {
      // return top 5 most recent sessions as fallback
      timeFiltered = sessions.slice(0, 5);
    }

    if (selectedSubjectFilter !== "ALL") {
      timeFiltered = timeFiltered.filter((s) => s.paper_category.includes(selectedSubjectFilter));
    }

    return timeFiltered;
  };

  const reviewSessions = getFilteredByTime();
  const isFallbackShown = timeRange === "1h" && sessions.length > 0 && reviewSessions.length > 0 && 
    (Date.now() - new Date(reviewSessions[0].timestamp).getTime() > 1000 * 60 * 60);

  // Summary Metrics
  const totalFocusedMinutes = reviewSessions.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
  const totalMarksScored = reviewSessions.reduce((acc, curr) => acc + (curr.marks_achieved || 0), 0);
  const totalMarksPossible = reviewSessions.reduce((acc, curr) => acc + (curr.total_marks || 0), 0);

  const gradedSessions = reviewSessions.filter((s) => s.score_percentage !== undefined);
  const averageAccuracy = gradedSessions.length > 0
    ? Math.round(gradedSessions.reduce((acc, curr) => acc + (curr.score_percentage || 0), 0) / gradedSessions.length)
    : 100;

  // Trigger Print View
  const handlePrint = () => {
    window.print();
  };

  // Copy Summary Text
  const handleCopySummary = () => {
    const summaryLines = [
      `📚 AMARIS MATHEMATICS HUB — HOURLY SESSION REVIEW CARDS`,
      `Student: ${studentName}`,
      `Date: ${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      `Time Window: ${timeRange.toUpperCase()} (${reviewSessions.length} sessions reviewed)`,
      `Total Focus: ${totalFocusedMinutes} mins | Score: ${totalMarksScored}/${totalMarksPossible} marks (${averageAccuracy}%)`,
      `----------------------------------------------------`,
      ...reviewSessions.map((s, idx) => 
        `[Card ${idx + 1}] ${s.topic_name} (${s.paper_category})\n- Duration: ${s.duration_minutes}m | Marks: ${s.marks_achieved ?? 'N/A'}/${s.total_marks ?? 'N/A'} (${s.score_percentage ?? 100}%)\n- Notes: ${s.notes || 'None'}\n`
      )
    ].join("\n");

    navigator.clipboard.writeText(summaryLines);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* PRINT STYLESHEET OVERRIDE FOR CARDS ONLY */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-review-cards, #printable-review-cards * {
            visibility: visible !important;
          }
          #printable-review-cards {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>

      {/* HEADER BANNER */}
      <div className="no-print bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBackToFocus && (
              <button
                type="button"
                onClick={onBackToFocus}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-navy-950 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer mr-1"
                title="Back to Focus Workspace"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Hourly Session Review Engine
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              [Printable Study Cards]
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Hourly Deep Focus Session Review
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
            Automatically compiles solved CAPS/IEB math problems into clear, printable flashcards for post-study review and retention.
          </p>
        </div>

        {/* PRINT / EXPORT ACTIONS */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-4 py-2.5 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-2xl border border-slate-200 dark:border-navy-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            {copiedStatus ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
            <span>{copiedStatus ? "Copied!" : "Copy Summary"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-mono font-black text-xs rounded-2xl border border-amber-400 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Print Cards / Save PDF</span>
          </button>
        </div>
      </div>

      {/* TIME RANGE & FILTER CONTROLS */}
      <div className="no-print bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Time Window Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Window:
          </span>
          <div className="bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-navy-800">
            {[
              { id: "1h", label: "Last 1 Hour" },
              { id: "3h", label: "Last 3 Hours" },
              { id: "24h", label: "24 Hours" },
              { id: "7d", label: "7 Days" },
              { id: "all", label: "All Time" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeRange(opt.id as TimeRangeOption)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  timeRange === opt.id
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
          >
            <option value="ALL">All Papers (P1 & P2)</option>
            <option value="P1">Paper 1 (Algebra & Calculus)</option>
            <option value="P2">Paper 2 (Trig & Geometry)</option>
          </select>

          <button
            type="button"
            onClick={loadSessions}
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-950 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh review logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FALLBACK NOTICE IF NO SESSIONS IN PAST HOUR */}
      {isFallbackShown && (
        <div className="no-print bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-700 dark:text-amber-300 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Note:</strong> No focus session was logged in the last 60 minutes. Displaying your most recent study sessions for review.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTimeRange("24h")}
            className="underline font-bold hover:text-amber-900 dark:hover:text-white shrink-0 cursor-pointer"
          >
            Switch to 24h
          </button>
        </div>
      )}

      {/* METRICS SUMMARY STRIP */}
      <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 shadow-lg space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
            Reviewed Sessions
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {reviewSessions.length} <span className="text-xs text-slate-400 font-normal">cards</span>
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 shadow-lg space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
            Total Time Focused
          </span>
          <span className="text-2xl font-black text-amber-500 block">
            {totalFocusedMinutes} <span className="text-xs text-slate-400 font-normal">mins</span>
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 shadow-lg space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
            Marks Achieved
          </span>
          <span className="text-2xl font-black text-emerald-500 block">
            {totalMarksScored} <span className="text-xs text-slate-400 font-normal">/ {totalMarksPossible > 0 ? totalMarksPossible : totalMarksScored} pts</span>
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-4 shadow-lg space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
            Average Score
          </span>
          <span className="text-2xl font-black text-royal-600 dark:text-gold-400 block">
            {averageAccuracy}%
          </span>
        </div>
      </div>

      {/* PRINTABLE CARDS CONTAINER */}
      <div id="printable-review-cards" className="space-y-6">
        {/* PRINT HEADER FOR PAPER OUTPUT */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-6 text-left">
          <h1 className="text-2xl font-black uppercase font-mono">
            Amaris Mathematics Hub — Session Review Cards
          </h1>
          <div className="flex items-center justify-between text-xs font-mono mt-1 text-slate-700">
            <span>Student: <strong>{studentName}</strong></span>
            <span>Generated: {new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            <span>Total Focused: {totalFocusedMinutes} mins</span>
          </div>
        </div>

        {reviewSessions.length === 0 ? (
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
              No Deep Focus Sessions Logged in this Window
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Complete a problem-solving session in the Deep Focus Workspace to automatically generate printable review flashcards!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewSessions.map((session, index) => {
              const formattedTime = new Date(session.timestamp).toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit"
              });
              const formattedDate = new Date(session.timestamp).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short"
              });

              return (
                <div
                  key={session.id}
                  className="print-card bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3 text-left">
                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-royal-500/15 text-royal-600 dark:text-gold-400 border border-royal-500/20">
                          {session.paper_category}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>

                    {/* TOPIC TITLE */}
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-amber-500 tracking-wider">
                        Topic / Question Title
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display leading-snug">
                        {session.topic_name}
                      </h4>
                    </div>

                    {/* PERFORMANCE STATS */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-navy-950 p-3 rounded-2xl border border-slate-200 dark:border-navy-800 font-mono text-xs">
                      <div>
                        <span className="text-[9px] uppercase text-slate-500 block font-bold">Focus Time</span>
                        <strong className="text-amber-500 font-black">{session.duration_minutes} mins</strong>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase text-slate-500 block font-bold">Marks Scored</span>
                        <strong className="text-slate-900 dark:text-white font-black">
                          {session.marks_achieved !== undefined ? `${session.marks_achieved}/${session.total_marks}` : "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase text-slate-500 block font-bold">Accuracy</span>
                        <strong className={`font-black ${
                          (session.score_percentage || 100) >= 80 ? "text-emerald-500" : "text-amber-500"
                        }`}>
                          {session.score_percentage !== undefined ? `${session.score_percentage}%` : "100%"}
                        </strong>
                      </div>
                    </div>

                    {/* NOTES / SOLUTION REFLECTION */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-500" />
                        Solution Reflection & Notes
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-navy-950/50 p-3 rounded-2xl border border-slate-100 dark:border-navy-800 italic leading-relaxed">
                        {session.notes || "No custom reflection notes entered during this session."}
                      </p>
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Verified CAPS/IEB Log
                    </span>
                    <span>Amaris Mathematics Hub</span>
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
