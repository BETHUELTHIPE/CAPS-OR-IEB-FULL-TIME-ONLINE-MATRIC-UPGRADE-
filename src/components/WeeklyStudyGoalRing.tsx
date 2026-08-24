import React, { useState, useEffect, useRef, useId } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Clock,
  Plus,
  Minus,
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Zap,
  TrendingUp,
  Award,
  Edit2,
  Check
} from "lucide-react";
import { Profile } from "../types";

export interface DailyStudyLog {
  dayName: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  fullDayName: string; // "Monday", "Tuesday", etc.
  hours: number;
  dateStr: string;
}

export interface WeeklyStudyGoalData {
  weeklyGoalHours: number; // e.g., 15
  dailyLogs: DailyStudyLog[];
  lastUpdated: string;
}

const DEFAULT_DAYS: DailyStudyLog[] = [
  { dayName: "Mon", fullDayName: "Monday", hours: 2.5, dateStr: "2026-07-27" },
  { dayName: "Tue", fullDayName: "Tuesday", hours: 3.0, dateStr: "2026-07-28" },
  { dayName: "Wed", fullDayName: "Wednesday", hours: 1.5, dateStr: "2026-07-29" },
  { dayName: "Thu", fullDayName: "Thursday", hours: 2.0, dateStr: "2026-07-30" },
  { dayName: "Fri", fullDayName: "Friday", hours: 2.0, dateStr: "2026-07-31" },
  { dayName: "Sat", fullDayName: "Saturday", hours: 1.0, dateStr: "2026-08-01" },
  { dayName: "Sun", fullDayName: "Sunday", hours: 0.0, dateStr: "2026-08-02" }
];

const PRESET_GOALS = [10, 15, 20, 25, 30];

export interface WeeklyStudyGoalRingProps {
  user?: Profile | null;
}

export const WeeklyStudyGoalRing: React.FC<WeeklyStudyGoalRingProps> = ({ user }) => {
  const [goalHours, setGoalHours] = useState<number>(15);
  const [dailyLogs, setDailyLogs] = useState<DailyStudyLog[]>(DEFAULT_DAYS);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>("15");
  const [activeHoverDay, setActiveHoverDay] = useState<DailyStudyLog | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);

  const gradientId = useId();
  const innerGradientId = useId();

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("amh_weekly_study_goal_v1");
      if (saved) {
        const parsed: WeeklyStudyGoalData = JSON.parse(saved);
        if (parsed && typeof parsed.weeklyGoalHours === "number" && Array.isArray(parsed.dailyLogs)) {
          setGoalHours(parsed.weeklyGoalHours);
          setCustomGoalInput(String(parsed.weeklyGoalHours));
          setDailyLogs(parsed.dailyLogs);
        }
      }
    } catch (e) {
      console.warn("Error reading weekly study goal state:", e);
    }
  }, []);

  // Save to localStorage
  const saveState = (newGoal: number, newLogs: DailyStudyLog[]) => {
    setGoalHours(newGoal);
    setDailyLogs(newLogs);
    try {
      const data: WeeklyStudyGoalData = {
        weeklyGoalHours: newGoal,
        dailyLogs: newLogs,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem("amh_weekly_study_goal_v1", JSON.stringify(data));
    } catch (e) {
      console.error("Error saving study goal state:", e);
    }
  };

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Total Hours
  const totalCompletedHours = Math.round(
    dailyLogs.reduce((acc, log) => acc + log.hours, 0) * 10
  ) / 10;
  const progressPercent = Math.min(100, Math.round((totalCompletedHours / (goalHours || 1)) * 100));
  const isGoalReached = totalCompletedHours >= goalHours;

  // Render D3 Ring Chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = Math.min(containerWidth, 320);
    const width = size;
    const height = size;
    const margin = 16;
    const radius = size / 2 - margin;

    const outerRadius = radius;
    const outerInnerRadius = outerRadius - 16;

    const innerOuterRadius = outerInnerRadius - 8;
    const innerRadius = innerOuterRadius - 12;

    const centerX = width / 2;
    const centerY = height / 2;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // DEFS FOR GRADIENTS
    const defs = svg.append("defs");

    // Main Progress Arc Gradient
    const mainGrad = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");

    mainGrad.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b"); // Amber 500
    mainGrad.append("stop").attr("offset", "50%").attr("stop-color", "#3b82f6"); // Blue 500
    mainGrad.append("stop").attr("offset", "100%").attr("stop-color", "#10b981"); // Emerald 500

    // Inner Arc Gradient
    const innerGrad = defs
      .append("linearGradient")
      .attr("id", innerGradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    innerGrad.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1"); // Indigo
    innerGrad.append("stop").attr("offset", "100%").attr("stop-color", "#ec4899"); // Pink

    // 1. OUTER BACKGROUND TRACK
    const bgArc = d3
      .arc()
      .innerRadius(outerInnerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(Math.PI * 2);

    g.append("path")
      .attr("d", bgArc as any)
      .attr("fill", "rgba(148, 163, 184, 0.15)");

    // 2. OUTER PROGRESS ARC
    const progressAngle = (progressPercent / 100) * (Math.PI * 2);
    const progressArc = d3
      .arc()
      .innerRadius(outerInnerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(progressAngle)
      .cornerRadius(8);

    g.append("path")
      .attr("d", progressArc as any)
      .attr("fill", `url(#${gradientId})`)
      .attr("class", "transition-all duration-700 ease-out");

    // 3. INNER SEGMENTED DAILY BREAKDOWN RING
    const innerBgArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(innerOuterRadius)
      .startAngle(0)
      .endAngle(Math.PI * 2);

    g.append("path")
      .attr("d", innerBgArc as any)
      .attr("fill", "rgba(148, 163, 184, 0.08)");

    // Segment calculation for 7 days
    let currentStartAngle = 0;
    const totalDailyHoursCalculated = dailyLogs.reduce((a, b) => a + b.hours, 0) || 1;

    const dayColors = [
      "#3b82f6", // Mon - Blue
      "#10b981", // Tue - Emerald
      "#8b5cf6", // Wed - Purple
      "#f59e0b", // Thu - Amber
      "#06b6d4", // Fri - Cyan
      "#ec4899", // Sat - Pink
      "#e11d48"  // Sun - Rose
    ];

    dailyLogs.forEach((log, index) => {
      if (log.hours <= 0) return;

      const segmentAngle = (log.hours / totalDailyHoursCalculated) * (Math.PI * 2);
      const endAngle = currentStartAngle + segmentAngle;

      const segmentArc = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(innerOuterRadius)
        .startAngle(currentStartAngle + 0.03) // Padding gap
        .endAngle(endAngle - 0.03)
        .cornerRadius(4);

      g.append("path")
        .attr("d", segmentArc as any)
        .attr("fill", dayColors[index % dayColors.length])
        .attr("class", "cursor-pointer transition-transform duration-200 hover:opacity-80")
        .on("mouseenter", () => setActiveHoverDay(log))
        .on("mouseleave", () => setActiveHoverDay(null));

      currentStartAngle = endAngle;
    });

  }, [dailyLogs, goalHours, progressPercent, containerWidth, gradientId, innerGradientId]);

  // Adjust daily hours handler
  const handleUpdateDailyHours = (dayIndex: number, delta: number) => {
    const updated = dailyLogs.map((log, idx) => {
      if (idx !== dayIndex) return log;
      const newHours = Math.max(0, Math.round((log.hours + delta) * 10) / 10);
      return { ...log, hours: newHours };
    });
    saveState(goalHours, updated);
  };

  // Quick log +1 hour to today (or Monday if default)
  const handleLogQuickSession = (hoursToAdd: number = 1) => {
    // find today's day index or default to first day with lowest hours
    const dayOfWeekIndex = (new Date().getDay() + 6) % 7; // Monday = 0
    handleUpdateDailyHours(dayOfWeekIndex, hoursToAdd);
  };

  // Save modified goal
  const handleSaveGoal = () => {
    const parsed = parseFloat(customGoalInput);
    if (!isNaN(parsed) && parsed > 0) {
      saveState(parsed, dailyLogs);
    }
    setIsEditingGoal(false);
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden transition-all space-y-5"
    >
      {/* HEADER BAR */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
              D3 Progress Ring
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400">
              Weekly Target
            </span>
          </div>
          <h3 className="text-lg font-black font-display text-slate-900 dark:text-white mt-1">
            Weekly Study Goal
          </h3>
        </div>

        {/* Goal Edit Toggle */}
        <button
          onClick={() => {
            setIsEditingGoal(!isEditingGoal);
            setCustomGoalInput(String(goalHours));
          }}
          className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-xs font-mono font-bold flex items-center gap-1.5"
          title="Configure Target Goal Hours"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Set Goal</span>
        </button>
      </div>

      {/* EDIT GOAL MODAL / EXPANDABLE PANEL */}
      <AnimatePresence>
        {isEditingGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-900 dark:text-white">
              <span>Select or Set Weekly Target Hours:</span>
              <span className="text-amber-600 dark:text-amber-400">{goalHours} hrs/week</span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setCustomGoalInput(String(preset));
                    saveState(preset, dailyLogs);
                    setIsEditingGoal(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    goalHours === preset
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:border-amber-500"
                  }`}
                >
                  {preset} hrs
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                max="100"
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono text-xs font-bold"
                placeholder="Custom hrs"
              />
              <button
                onClick={handleSaveGoal}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN D3 RING CHART + CENTER CONTENT */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <svg ref={svgRef} className="w-full max-w-[300px] h-auto overflow-visible" />

        {/* ABSOLUTE CENTER STATS CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
            <span>Completed</span>
          </div>

          <div className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight my-0.5">
            {totalCompletedHours}
            <span className="text-sm font-normal text-slate-400"> / {goalHours}h</span>
          </div>

          <div
            className={`px-3 py-0.5 rounded-full text-xs font-mono font-black border flex items-center gap-1 shadow-xs ${
              isGoalReached
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            {isGoalReached ? (
              <>
                <Trophy className="w-3 h-3 text-emerald-500" />
                <span>Goal Met ({progressPercent}%)</span>
              </>
            ) : (
              <>
                <Flame className="w-3 h-3 text-amber-500" />
                <span>{progressPercent}% Achieved</span>
              </>
            )}
          </div>

          {activeHoverDay && (
            <div className="mt-2 text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-900/90 text-white px-2.5 py-1 rounded-lg backdrop-blur-sm">
              {activeHoverDay.fullDayName}: <strong>{activeHoverDay.hours} hrs</strong>
            </div>
          )}
        </div>
      </div>

      {/* DAILY LOGGING QUICK BUTTONS */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
          <span className="uppercase tracking-wider">Daily Hours Tracker</span>
          <button
            onClick={() => handleLogQuickSession(1)}
            className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+1 Hour Today</span>
          </button>
        </div>

        {/* 7-DAY MINI CARDS */}
        <div className="grid grid-cols-7 gap-1.5">
          {dailyLogs.map((log, idx) => {
            const dayOfWeekIndex = (new Date().getDay() + 6) % 7;
            const isToday = idx === dayOfWeekIndex;

            return (
              <div
                key={log.dayName}
                className={`p-2 rounded-2xl border text-center font-mono space-y-1 transition-all ${
                  isToday
                    ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 text-slate-900 dark:text-white shadow-xs"
                    : "bg-slate-50 dark:bg-navy-950/60 border-slate-200/80 dark:border-navy-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-[10px] font-bold uppercase">{log.dayName}</div>
                <div className="text-xs font-black">{log.hours}h</div>

                {/* Adjust buttons */}
                <div className="flex items-center justify-center gap-0.5 pt-0.5">
                  <button
                    onClick={() => handleUpdateDailyHours(idx, -0.5)}
                    className="w-4 h-4 rounded bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 flex items-center justify-center text-[10px] cursor-pointer"
                    title="Subtract 30 mins"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateDailyHours(idx, 0.5)}
                    className="w-4 h-4 rounded bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center text-[10px] cursor-pointer font-bold"
                    title="Add 30 mins"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOTIVATION / STATUS FOOTER */}
      <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {isGoalReached
              ? "Distinction milestone achieved! Keep the momentum going."
              : `${Math.max(0, Math.round((goalHours - totalCompletedHours) * 10) / 10)} hours remaining to reach your weekly goal.`}
          </span>
        </div>
        <button
          onClick={() => {
            const resetLogs = DEFAULT_DAYS.map((d) => ({ ...d, hours: 0 }));
            saveState(goalHours, resetLogs);
          }}
          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer shrink-0"
          title="Reset weekly logs to 0"
        >
          Reset Week
        </button>
      </div>
    </div>
  );
};
