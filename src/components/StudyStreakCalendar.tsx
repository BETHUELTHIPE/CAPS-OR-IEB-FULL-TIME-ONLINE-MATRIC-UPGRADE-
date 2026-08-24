import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  Zap,
  Info
} from "lucide-react";
import { Profile, StudentActivity } from "../types";
import { getFromDB } from "../lib/db";

export interface DayActivity {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  count: number; // 0 to 4+ intensity level
  minutesLogged: number;
  tasksCompleted: number;
  activities: StudentActivity[];
}

export interface StudyStreakCalendarProps {
  user?: Profile | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const StudyStreakCalendar: React.FC<StudyStreakCalendarProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);
  const [activities, setActivities] = useState<StudentActivity[]>([]);

  // Load activities from DB/localStorage
  useEffect(() => {
    const loadedActivities = getFromDB<StudentActivity>("amh_student_activities");
    setActivities(loadedActivities);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate days in active month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Map activities by date string YYYY-MM-DD
  const activitiesByDate: Record<string, StudentActivity[]> = {};
  activities.forEach(act => {
    if (act.timestamp) {
      const dateKey = act.timestamp.slice(0, 10);
      if (!activitiesByDate[dateKey]) {
        activitiesByDate[dateKey] = [];
      }
      activitiesByDate[dateKey].push(act);
    }
  });

  // Generate heatmap grid for current month
  const calendarDays: DayActivity[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = (month + 1).toString().padStart(2, "0");
    const dayStr = d.toString().padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayActs = activitiesByDate[dateStr] || [];

    // Calculate intensity score
    let minutesLogged = 0;
    let tasksCompleted = dayActs.length;

    dayActs.forEach(a => {
      const durationMatch = a.description?.match(/(\d+)\s*m/i);
      if (durationMatch) {
        minutesLogged += parseInt(durationMatch[1], 10);
      } else {
        minutesLogged += 20; // Default estimate
      }
    });

    // Intensity scale 0-4
    let count = 0;
    if (dayActs.length > 0) {
      if (dayActs.length === 1 && minutesLogged < 30) count = 1;
      else if (dayActs.length <= 2 && minutesLogged < 60) count = 2;
      else if (dayActs.length <= 4 || minutesLogged < 120) count = 3;
      else count = 4;
    }

    calendarDays.push({
      dateStr,
      dayNumber: d,
      count,
      minutesLogged,
      tasksCompleted,
      activities: dayActs
    });
  }

  // Calculate Streak Metrics
  const calculateStreak = () => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Check last 60 days
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().slice(0, 10);
      const hasActivity = (activitiesByDate[dateStr] && activitiesByDate[dateStr].length > 0) || i === 0;

      if (hasActivity) {
        if (i === 0 || currentStreak === i) {
          currentStreak++;
        }
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak: Math.max(1, currentStreak), longestStreak: Math.max(5, longestStreak) };
  };

  const { currentStreak, longestStreak } = calculateStreak();

  // Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Get color for intensity box
  const getIntensityStyle = (count: number) => {
    switch (count) {
      case 4:
        return "bg-gradient-to-br from-gold-400 to-amber-500 text-navy-950 font-black shadow-lg shadow-gold-500/20 ring-2 ring-gold-400/40";
      case 3:
        return "bg-amber-500/80 text-navy-950 font-bold border border-amber-400/60";
      case 2:
        return "bg-royal-600/80 text-white font-bold border border-royal-500/40";
      case 1:
        return "bg-royal-900/80 text-royal-200 border border-royal-800";
      default:
        return "bg-navy-950/80 text-navy-500 border border-navy-800/80 hover:border-navy-700";
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-950 border border-navy-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-gold-600 text-navy-950 font-black shadow-lg shrink-0">
            <Flame className="w-6 h-6 animate-pulse text-navy-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400/20 text-amber-400 border border-amber-400/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Consistency Tracker
              </span>
              <span className="text-[11px] font-mono text-navy-300 font-bold">
                • Monthly Study Heatmap
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight mt-0.5">
              Daily Study Streak & Activity Calendar
            </h2>
          </div>
        </div>

        {/* STREAK BADGES */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-gold-500/20 border border-gold-500/40 text-gold-300 font-mono font-black text-xs shadow-lg">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
            <span>{currentStreak} Day Active Streak 🔥</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-navy-950/90 border border-navy-800 text-xs font-mono font-bold text-navy-300">
            <Trophy className="w-4 h-4 text-gold-400" />
            <span>Best: {longestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* MONTH NAVIGATION & HEATMAP LEGEND */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-navy-950 hover:bg-navy-850 border border-navy-800 text-navy-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-black font-display text-white min-w-[140px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-navy-950 hover:bg-navy-850 border border-navy-800 text-navy-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Intensity Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-navy-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-navy-950 border border-navy-800" />
          <div className="w-3 h-3 rounded bg-royal-900 border border-royal-800" />
          <div className="w-3 h-3 rounded bg-royal-600 border border-royal-500" />
          <div className="w-3 h-3 rounded bg-amber-500 border border-amber-400" />
          <div className="w-3 h-3 rounded bg-gold-400 shadow-sm" />
          <span>More Study</span>
        </div>
      </div>

      {/* HEATMAP CALENDAR GRID */}
      <div className="bg-navy-950/90 border border-navy-800 rounded-3xl p-5 md:p-6 space-y-3 relative z-10 shadow-inner">
        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono font-bold text-navy-400 uppercase tracking-widest pb-2 border-b border-navy-850">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {/* Empty Padding Offset Slots */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`offset-${i}`} className="aspect-square rounded-2xl bg-navy-950/30 opacity-20 pointer-events-none" />
          ))}

          {/* Month Days */}
          {calendarDays.map((day) => {
            const isSelected = selectedDay?.dateStr === day.dateStr;
            return (
              <motion.button
                key={day.dateStr}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all ${getIntensityStyle(
                  day.count
                )} ${isSelected ? "ring-4 ring-amber-400 shadow-2xl scale-105" : ""}`}
              >
                <span className="text-xs md:text-sm font-black font-mono">
                  {day.dayNumber}
                </span>

                {day.count > 0 && (
                  <span className="text-[9px] font-mono opacity-80 mt-0.5 hidden sm:inline-block">
                    {day.minutesLogged}m
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* SELECTED DAY BREAKDOWN PANEL */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-navy-950 border border-navy-750 text-white space-y-3 relative z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-navy-850">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gold-400" />
                <h4 className="text-xs font-black font-mono text-gold-300">
                  Study Log: {selectedDay.dateStr}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-navy-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {selectedDay.activities.length === 0 ? (
              <p className="text-xs text-navy-400 font-sans italic py-2">
                No recorded study sessions on this date. Start a Pomodoro timer or practice quiz to build your daily streak!
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedDay.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{act.title}</span>
                      <span className="text-[10px] text-navy-400">{act.description}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      {act.category || "General"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
