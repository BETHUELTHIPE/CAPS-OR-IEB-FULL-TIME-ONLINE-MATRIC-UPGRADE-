import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  Plus,
  GripVertical,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  BookOpen,
  RotateCcw,
  Tag,
  Grid,
  ListFilter,
  Zap,
  Flame,
  Target,
  Trophy,
  Award,
  TrendingUp,
  Check,
  Flag,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sliders,
  Bell,
  BellRing,
  BrainCircuit
} from "lucide-react";
import { Profile, TimeSlot, SubjectPaletteItem, MilestoneItem, ScheduledStudySession } from "../types";
import { CountUp } from "./CountUp";
import { StudyNotificationSettings } from "./StudyNotificationSettings";
import { SmartQuizSchedulerModal } from "./SmartQuizSchedulerModal";
import { AutomatedStudyScheduleGenerator } from "./AutomatedStudyScheduleGenerator";
import { SwipeableCard } from "./SwipeableCard";

export type { TimeSlot, SubjectPaletteItem, MilestoneItem, ScheduledStudySession };

export const TIME_SLOTS: TimeSlot[] = [
  { id: "slot-0800", label: "08:00 - 10:00", periodName: "Early Morning Focus", timeRange: "08:00 - 10:00" },
  { id: "slot-1000", label: "10:00 - 12:00", periodName: "Late Morning Session", timeRange: "10:00 - 12:00" },
  { id: "slot-1400", label: "14:00 - 16:00", periodName: "Afternoon Practice", timeRange: "14:00 - 16:00" },
  { id: "slot-1600", label: "16:00 - 18:00", periodName: "Late Afternoon Drill", timeRange: "16:00 - 18:00" },
  { id: "slot-1800", label: "18:00 - 20:00", periodName: "Evening Problem Solving", timeRange: "18:00 - 20:00" },
  { id: "slot-2000", label: "20:00 - 22:00", periodName: "Night Exam Paper Review", timeRange: "20:00 - 22:00" }
];

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const SUBJECT_PALETTE: SubjectPaletteItem[] = [
  {
    id: "sub-calculus",
    name: "Differential Calculus",
    category: "Calculus",
    icon: "📐",
    defaultMinutes: 120,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/40"
  },
  {
    id: "sub-trig",
    name: "Trigonometry & Identities",
    category: "Trigonometry",
    icon: "📉",
    defaultMinutes: 120,
    color: "text-pink-500 dark:text-pink-400",
    bgColor: "bg-pink-500/15",
    borderColor: "border-pink-500/40"
  },
  {
    id: "sub-algebra",
    name: "Algebra, Equations & Functions",
    category: "Algebra",
    icon: "🔢",
    defaultMinutes: 120,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500/40"
  },
  {
    id: "sub-geometry",
    name: "Euclidean & Analytical Geometry",
    category: "Geometry",
    icon: "📏",
    defaultMinutes: 120,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/40"
  },
  {
    id: "sub-financial",
    name: "Financial Maths & Annuities",
    category: "Financial Maths",
    icon: "💰",
    defaultMinutes: 120,
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/40"
  },
  {
    id: "sub-stats",
    name: "Statistics & Probability",
    category: "Statistics",
    icon: "📊",
    defaultMinutes: 120,
    color: "text-cyan-500 dark:text-cyan-400",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/40"
  },
  {
    id: "sub-examprep",
    name: "Past Paper 1 & 2 Trial Mock Exam",
    category: "Exam Prep",
    icon: "📝",
    defaultMinutes: 120,
    color: "text-rose-500 dark:text-rose-400",
    bgColor: "bg-rose-500/15",
    borderColor: "border-rose-500/40"
  }
];

export const UPCOMING_MILESTONES: MilestoneItem[] = [
  {
    id: "ms-nsc-paper1",
    title: "NSC Paper 1 Trial Mock Exam",
    category: "Exam Trial",
    targetDay: "Friday",
    rewardXP: 500,
    badgeName: "NSC Distinction Pathfinder",
    description: "Complete a full 3-hour Paper 1 trial simulation covering Algebra, Sequences & Calculus.",
    linkedCategory: "Exam Prep",
    isUrgent: true
  },
  {
    id: "ms-goal-crusher",
    title: "Goal Crusher Badge (100% Weekly Goal)",
    category: "Badge Unlock",
    targetDay: "Sunday",
    rewardXP: 200,
    badgeName: "Goal Crusher",
    description: "Schedule & complete at least 15 hours of study this week to claim your level badge.",
    linkedCategory: "Calculus"
  },
  {
    id: "ms-trig-titan",
    title: "Trigonometry Titan Mastery",
    category: "Syllabus Mastery",
    targetDay: "Wednesday",
    rewardXP: 250,
    badgeName: "Trigonometry Titan",
    description: "Solve 180°-θ reduction and compound angle expansion past paper questions.",
    linkedCategory: "Trigonometry"
  }
];

const INITIAL_SCHEDULED_SESSIONS: ScheduledStudySession[] = [
  {
    id: "session-1",
    title: "Calculus First Principles & Power Rule Drill",
    category: "Calculus",
    dayAssigned: "Monday",
    timeSlotId: "slot-0800",
    estimatedMinutes: 120,
    completed: true,
    milestoneTag: "Goal Crusher Badge (100% Weekly Goal)"
  },
  {
    id: "session-2",
    title: "Trigonometry Double Angle Proofs & Equations",
    category: "Trigonometry",
    dayAssigned: "Monday",
    timeSlotId: "slot-1400",
    estimatedMinutes: 120,
    completed: true,
    milestoneTag: "Trigonometry Titan Mastery"
  },
  {
    id: "session-3",
    title: "2023 November Paper 1 Question 7 (Cubic Graphs)",
    category: "Exam Prep",
    dayAssigned: "Wednesday",
    timeSlotId: "slot-1800",
    estimatedMinutes: 120,
    completed: false,
    milestoneTag: "NSC Paper 1 Trial Mock Exam"
  },
  {
    id: "session-4",
    title: "Present & Future Value Annuities Formula Practice",
    category: "Financial Maths",
    dayAssigned: "Thursday",
    timeSlotId: "slot-1000",
    estimatedMinutes: 120,
    completed: false
  },
  {
    id: "session-5",
    title: "Euclidean Geometry Proportionality & Circle Theorems",
    category: "Geometry",
    dayAssigned: "Friday",
    timeSlotId: "slot-1600",
    estimatedMinutes: 120,
    completed: false,
    milestoneTag: "NSC Paper 1 Trial Mock Exam"
  }
];

export interface WeeklyStudyPlannerProps {
  user?: Profile | null;
}

export const WeeklyStudyPlanner: React.FC<WeeklyStudyPlannerProps> = ({ user }) => {
  const [sessions, setSessions] = useState<ScheduledStudySession[]>([]);
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");
  const [draggedSubject, setDraggedSubject] = useState<SubjectPaletteItem | null>(null);
  const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; slotId: string } | null>(null);

  // Goal tracking integration state
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(15);
  const [syncedSuccessMessage, setSyncedSuccessMessage] = useState<boolean>(false);

  // Notification settings modal state
  const [showNotificationSettings, setShowNotificationSettings] = useState<boolean>(false);

  // Smart Quiz Scheduler modal state
  const [showSmartScheduler, setShowSmartScheduler] = useState<boolean>(false);

  // Automated Exam 30-Min Schedule Generator modal state
  const [showAutomatedScheduleModal, setShowAutomatedScheduleModal] = useState<boolean>(false);

  // Modal State for adding custom slot session
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<SubjectPaletteItem["category"]>("Calculus");
  const [newDay, setNewDay] = useState<string>("Monday");
  const [newSlotId, setNewSlotId] = useState<string>("slot-0800");
  const [newMilestoneTag, setNewMilestoneTag] = useState<string>("None");
  const [newMinutes, setNewMinutes] = useState<number>(120);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("amh_weekly_study_planner");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
        } else {
          setSessions(INITIAL_SCHEDULED_SESSIONS);
        }
      } else {
        setSessions(INITIAL_SCHEDULED_SESSIONS);
      }

      // Read weekly target goal from amh_weekly_study_goal_v1
      const savedGoalStr = localStorage.getItem("amh_weekly_study_goal_v1");
      if (savedGoalStr) {
        const parsedGoal = JSON.parse(savedGoalStr);
        if (parsedGoal && typeof parsedGoal.weeklyGoalHours === "number") {
          setWeeklyTargetHours(parsedGoal.weeklyGoalHours);
        }
      }
    } catch (e) {
      console.error("Error reading weekly study planner state:", e);
      setSessions(INITIAL_SCHEDULED_SESSIONS);
    }
  }, []);

  const saveSessions = (updated: ScheduledStudySession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem("amh_weekly_study_planner", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Error saving study planner:", e);
    }
  };

  // Sync scheduled/completed sessions to amh_weekly_study_goal_v1
  const handleSyncToGoalTracker = () => {
    try {
      // Map DAYS_OF_WEEK to short day names
      const dayMap: Record<string, { shortName: string; fullDayName: string; dateStr: string }> = {
        Monday: { shortName: "Mon", fullDayName: "Monday", dateStr: "2026-07-27" },
        Tuesday: { shortName: "Tue", fullDayName: "Tuesday", dateStr: "2026-07-28" },
        Wednesday: { shortName: "Wed", fullDayName: "Wednesday", dateStr: "2026-07-29" },
        Thursday: { shortName: "Thu", fullDayName: "Thursday", dateStr: "2026-07-30" },
        Friday: { shortName: "Fri", fullDayName: "Friday", dateStr: "2026-07-31" },
        Saturday: { shortName: "Sat", fullDayName: "Saturday", dateStr: "2026-08-01" },
        Sunday: { shortName: "Sun", fullDayName: "Sunday", dateStr: "2026-08-02" }
      };

      // Calculate total completed hours per day
      const dailyLogs = DAYS_OF_WEEK.map((fullDay) => {
        const info = dayMap[fullDay];
        const dayCompletedMins = sessions
          .filter((s) => s.dayAssigned === fullDay && s.completed)
          .reduce((acc, s) => acc + s.estimatedMinutes, 0);

        const hours = Math.round((dayCompletedMins / 60) * 10) / 10;
        return {
          dayName: info.shortName,
          fullDayName: info.fullDayName,
          hours,
          dateStr: info.dateStr
        };
      });

      const updatedGoalData = {
        weeklyGoalHours: weeklyTargetHours,
        dailyLogs,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem("amh_weekly_study_goal_v1", JSON.stringify(updatedGoalData));
      window.dispatchEvent(new Event("storage"));

      setSyncedSuccessMessage(true);
      setTimeout(() => setSyncedSuccessMessage(false), 3000);
    } catch (e) {
      console.error("Error syncing to goal tracker:", e);
    }
  };

  // Drag and drop event handlers
  const handleSubjectDragStart = (e: React.DragEvent, subject: SubjectPaletteItem) => {
    setDraggedSubject(subject);
    setDraggedSessionId(null);
    e.dataTransfer.setData("type", "palette-subject");
    e.dataTransfer.setData("subject-id", subject.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleSessionDragStart = (e: React.DragEvent, sessionId: string) => {
    setDraggedSessionId(sessionId);
    setDraggedSubject(null);
    e.dataTransfer.setData("type", "existing-session");
    e.dataTransfer.setData("session-id", sessionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverCell = (e: React.DragEvent, day: string, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedSubject ? "copy" : "move";
    if (hoveredCell?.day !== day || hoveredCell?.slotId !== slotId) {
      setHoveredCell({ day, slotId });
    }
  };

  const handleDropOnCell = (e: React.DragEvent, day: string, slotId: string) => {
    e.preventDefault();
    setHoveredCell(null);

    const type = e.dataTransfer.getData("type");

    if (draggedSubject || type === "palette-subject") {
      const subject = draggedSubject || SUBJECT_PALETTE.find((s) => s.id === e.dataTransfer.getData("subject-id"));
      if (subject) {
        const newSession: ScheduledStudySession = {
          id: `session-${Date.now()}`,
          title: `${subject.name} Review`,
          category: subject.category,
          dayAssigned: day,
          timeSlotId: slotId,
          estimatedMinutes: subject.defaultMinutes,
          completed: false
        };
        saveSessions([...sessions, newSession]);
      }
    } else if (draggedSessionId || type === "existing-session") {
      const sId = draggedSessionId || e.dataTransfer.getData("session-id");
      if (sId) {
        const updated = sessions.map((s) => (s.id === sId ? { ...s, dayAssigned: day, timeSlotId: slotId } : s));
        saveSessions(updated);
      }
    }

    setDraggedSubject(null);
    setDraggedSessionId(null);
  };

  const handleToggleComplete = (id: string) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    saveSessions(updated);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);
  };

  const handleQuickScheduleMilestone = (ms: MilestoneItem) => {
    setNewTitle(ms.title);
    setNewCategory(ms.linkedCategory);
    setNewDay(ms.targetDay);
    setNewSlotId("slot-1400");
    setNewMilestoneTag(ms.title);
    setShowAddModal(true);
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSession: ScheduledStudySession = {
      id: `session-custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      dayAssigned: newDay,
      timeSlotId: newSlotId,
      estimatedMinutes: newMinutes,
      completed: false,
      milestoneTag: newMilestoneTag !== "None" ? newMilestoneTag : undefined
    };

    saveSessions([...sessions, newSession]);
    setNewTitle("");
    setNewMilestoneTag("None");
    setShowAddModal(false);
  };

  const handleResetPlanner = () => {
    saveSessions(INITIAL_SCHEDULED_SESSIONS);
  };

  const handleApplySmartSchedule = (newAiSessions: ScheduledStudySession[]) => {
    saveSessions([...sessions, ...newAiSessions]);
  };

  // Metrics calculation
  const totalHoursPlanned = Math.round((sessions.reduce((acc, s) => acc + s.estimatedMinutes, 0) / 60) * 10) / 10;
  const completedHours = Math.round((sessions.filter((s) => s.completed).reduce((acc, s) => acc + s.estimatedMinutes, 0) / 60) * 10) / 10;
  const goalCoveragePercentage = Math.min(100, Math.round((totalHoursPlanned / (weeklyTargetHours || 1)) * 100));
  const completionPercentage = sessions.length > 0 ? Math.round((sessions.filter((s) => s.completed).length / sessions.length) * 100) : 0;

  const getCategoryBadgeStyle = (category: SubjectPaletteItem["category"]) => {
    switch (category) {
      case "Calculus":
        return "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30";
      case "Trigonometry":
        return "bg-pink-500/20 text-pink-600 dark:text-pink-300 border-pink-500/30";
      case "Algebra":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30";
      case "Geometry":
        return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
      case "Financial Maths":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30";
      case "Statistics":
        return "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30";
      case "Exam Prep":
        return "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30";
      default:
        return "bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-700";
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-xl text-slate-900 dark:text-white relative overflow-hidden space-y-6">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-royal-500/5 dark:bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-navy-800 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-navy-900 text-gold-400 font-black shadow-lg shrink-0 border border-royal-500/30">
            <Calendar className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-royal-500/20 text-royal-600 dark:text-royal-300 border border-royal-500/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-400" /> Weekly Study Planner
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold hidden sm:inline">
                • Goal-Tracking & Milestones Integrated
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight mt-0.5">
              Mathematics Weekly Study Scheduler
            </h2>
          </div>
        </div>

        {/* METRICS & CONTROLS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs font-mono font-bold">
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "matrix"
                  ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Time Slot Grid</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "cards"
                  ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Day Cards View</span>
            </button>
          </div>

          <button
            onClick={() => setShowAutomatedScheduleModal(true)}
            className="px-3.5 py-2 text-xs font-mono font-black rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-slate-950 border border-gold-400/50"
            title="Generate automated 30-min revision plan based on weak topics & exam date"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Automated 30-Min Schedule</span>
          </button>

          <button
            onClick={() => setShowSmartScheduler(true)}
            className="px-3.5 py-2 text-xs font-mono font-black rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-400/50"
          >
            <BrainCircuit className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>Smart AI Quiz Scheduler</span>
          </button>

          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md border ${
              showNotificationSettings
                ? "bg-amber-500 text-navy-950 border-amber-400 font-extrabold"
                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-gold-400 border-amber-500/30"
            }`}
          >
            <BellRing className="w-4 h-4 text-gold-400 animate-pulse" />
            <span>10-Min Push Alerts</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-mono font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md border border-royal-500/30"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Session</span>
          </button>

          <button
            onClick={handleResetPlanner}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-850 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-800 transition-colors cursor-pointer"
            title="Reset Default Weekly Schedule"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* NOTIFICATION SETTINGS EXPANDABLE PANEL */}
      <AnimatePresence>
        {showNotificationSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 overflow-hidden"
          >
            <StudyNotificationSettings onClose={() => setShowNotificationSettings(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GOAL-TRACKING INTEGRATION & COVERAGE BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
        {/* Weekly Goal Coverage Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-500/5 dark:from-navy-950 dark:to-amber-500/5 border border-amber-500/30 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                  Weekly Goal Coverage
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  {totalHoursPlanned}h Scheduled / {weeklyTargetHours}h Target
                </h4>
              </div>
            </div>

            <span className="text-lg font-black font-display text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
              {goalCoveragePercentage}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${goalCoveragePercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>Completed: {completedHours}h ({completionPercentage}%)</span>
              <span>{Math.max(0, Math.round((weeklyTargetHours - totalHoursPlanned) * 10) / 10)}h remaining</span>
            </div>
          </div>
        </div>

        {/* Sync to Goal Tracker Trigger Button Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-royal-600 dark:text-royal-400 uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-gold-400" /> D3 Goal Tracker Sync
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
                Sync Schedule to Progress Ring
              </h4>
            </div>
            {syncedSuccessMessage ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> Synced!
              </span>
            ) : (
              <Zap className="w-4 h-4 text-gold-400" />
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            Pushes your scheduled & completed session hours into the D3 Ring and Badges progress engine.
          </p>

          <button
            onClick={handleSyncToGoalTracker}
            className="w-full py-2 bg-slate-200 dark:bg-navy-800 hover:bg-amber-500 hover:text-white text-slate-800 dark:text-slate-200 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
            <span>Sync Schedule to Goal Ring</span>
          </button>
        </div>

        {/* UPCOMING MILESTONES SUMMARY CHIP */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-rose-500 uppercase flex items-center gap-1">
              <Flag className="w-3 h-3 text-rose-500" /> Milestone Targets
            </span>
            <span className="text-[10px] font-mono font-extrabold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
              +{UPCOMING_MILESTONES.reduce((acc, m) => acc + m.rewardXP, 0)} XP Potential
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-24 pr-1 scrollbar-none">
            {UPCOMING_MILESTONES.map((ms) => (
              <div
                key={ms.id}
                onClick={() => handleQuickScheduleMilestone(ms)}
                className="p-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-400 transition-colors cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{ms.title}</span>
                </div>
                <span className="text-[10px] font-mono text-amber-500 font-bold shrink-0 bg-amber-500/10 px-1.5 py-0.2 rounded">
                  {ms.targetDay}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUBJECT PALETTE (DRAGGABLE SUBJECT CHIPS) */}
      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 relative z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-amber-500" />
            Drag & Drop Subject Cards into any Time Slot below:
          </span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            Holds 2-hour focused CAPS & IEB study intervals
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {SUBJECT_PALETTE.map((subject) => (
            <div
              key={subject.id}
              draggable
              onDragStart={(e) => handleSubjectDragStart(e, subject)}
              className={`p-2.5 rounded-xl border ${subject.borderColor} ${subject.bgColor} hover:scale-105 transition-all cursor-grab active:cursor-grabbing flex items-center gap-2 shrink-0 shadow-xs`}
            >
              <span className="text-lg">{subject.icon}</span>
              <div>
                <h4 className={`text-xs font-bold font-display ${subject.color}`}>
                  {subject.name}
                </h4>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block">
                  2h Slot • Drag to Slot
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MATRIX TIME SLOT GRID VIEW */}
      {viewMode === "matrix" ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 relative z-10 shadow-inner">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/90 font-mono text-xs text-slate-600 dark:text-slate-300">
                <th className="p-3.5 w-36 border-r border-slate-200 dark:border-navy-800 font-bold">
                  Time Slot
                </th>
                {DAYS_OF_WEEK.map((day) => {
                  const daySessionCount = sessions.filter((s) => s.dayAssigned === day).length;
                  const hasMilestone = UPCOMING_MILESTONES.some((m) => m.targetDay === day);
                  return (
                    <th key={day} className="p-3 border-r border-slate-200 dark:border-navy-800 text-center font-bold relative">
                      <div className="text-slate-900 dark:text-white font-display text-xs flex items-center justify-center gap-1">
                        <span>{day}</span>
                        {hasMilestone && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Upcoming Milestone Deadline" />
                        )}
                      </div>
                      <span className="text-[10px] font-normal text-slate-400">
                        {daySessionCount} {daySessionCount === 1 ? "session" : "sessions"}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800/80">
              {TIME_SLOTS.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30 transition-colors">
                  {/* Slot Label Cell */}
                  <td className="p-3.5 border-r border-slate-200 dark:border-navy-800 bg-slate-50/80 dark:bg-navy-900/50 space-y-0.5">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-gold-400 block">
                      {slot.timeRange}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">
                      {slot.periodName}
                    </span>
                  </td>

                  {/* Day Columns for this Slot */}
                  {DAYS_OF_WEEK.map((day) => {
                    const slotSessions = sessions.filter(
                      (s) => s.dayAssigned === day && s.timeSlotId === slot.id
                    );
                    const isHovered = hoveredCell?.day === day && hoveredCell?.slotId === slot.id;

                    return (
                      <td
                        key={day}
                        onDragOver={(e) => handleDragOverCell(e, day, slot.id)}
                        onDrop={(e) => handleDropOnCell(e, day, slot.id)}
                        className={`p-2 border-r border-slate-200 dark:border-navy-800 align-top h-28 min-w-[110px] transition-all relative ${
                          isHovered
                            ? "bg-amber-500/10 dark:bg-royal-500/20 ring-2 ring-amber-400 ring-inset"
                            : "bg-transparent"
                        }`}
                      >
                        {slotSessions.length === 0 ? (
                          <div className="h-full border border-dashed border-slate-200 dark:border-navy-800 rounded-xl flex items-center justify-center p-2 text-center text-[10px] font-mono text-slate-400 opacity-0 hover:opacity-100 transition-opacity">
                            + Drop Session
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {slotSessions.map((session) => (
                              <div
                                key={session.id}
                                draggable
                                onDragStart={(e) => handleSessionDragStart(e, session.id)}
                                className={`p-2 rounded-xl border text-xs transition-all relative group cursor-grab active:cursor-grabbing shadow-xs ${
                                  session.completed
                                    ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                                    : session.milestoneTag
                                    ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/40 text-slate-900 dark:text-white"
                                    : "bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white hover:border-amber-400"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border ${getCategoryBadgeStyle(session.category)}`}>
                                    {session.category}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                    title="Delete Session"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                {session.milestoneTag && (
                                  <div className="text-[8px] font-mono font-extrabold text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20 mb-1 flex items-center gap-0.5 truncate">
                                    <Flag className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                    <span className="truncate">{session.milestoneTag}</span>
                                  </div>
                                )}

                                <div className="flex items-start gap-1.5">
                                  <button
                                    onClick={() => handleToggleComplete(session.id)}
                                    className="mt-0.5 text-slate-400 hover:text-emerald-500 shrink-0 cursor-pointer"
                                  >
                                    {session.completed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </button>
                                  <span className={`text-[11px] font-semibold leading-tight ${session.completed ? "line-through text-slate-400" : ""}`}>
                                    {session.title}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* DAY CARDS VIEW MODE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 relative z-10">
          {DAYS_OF_WEEK.map((day) => {
            const daySessions = sessions.filter((s) => s.dayAssigned === day);
            return (
              <div
                key={day}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 flex flex-col justify-between space-y-3 min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-navy-800">
                  <h3 className="text-sm font-black font-display text-slate-900 dark:text-white">{day}</h3>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {daySessions.length} {daySessions.length === 1 ? "Session" : "Sessions"}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {daySessions.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400 font-mono">
                      No study sessions scheduled for {day}.
                    </div>
                  ) : (
                    daySessions.map((session) => {
                      const slot = TIME_SLOTS.find((ts) => ts.id === session.timeSlotId);
                      const detailContent = (
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Time Slot: <span className="text-amber-500 font-mono">{slot?.timeRange || "Custom"}</span>
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                            Focus Area: {session.category} • Grade 12 NSC/IEB CAPS
                          </p>
                          {session.milestoneTag && (
                            <p className="text-amber-600 dark:text-gold-400 font-bold font-mono text-[10px]">
                              Milestone: {session.milestoneTag}
                            </p>
                          )}
                        </div>
                      );

                      return (
                        <SwipeableCard
                          key={session.id}
                          id={session.id}
                          onDismiss={handleDeleteSession}
                          onComplete={handleToggleComplete}
                          dismissText="Delete"
                          completeText={session.completed ? "Undo" : "Complete"}
                          details={detailContent}
                          showGestureHints={false}
                          className="my-1"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-amber-600 dark:text-gold-400 font-bold">{slot?.timeRange || "Custom Time"}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${getCategoryBadgeStyle(session.category)}`}>
                                {session.category}
                              </span>
                            </div>

                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => handleToggleComplete(session.id)}
                                className="mt-0.5 shrink-0 cursor-pointer"
                              >
                                {session.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                              <span className={`text-xs font-bold leading-snug ${session.completed ? "line-through text-slate-400" : ""}`}>
                                {session.title}
                              </span>
                            </div>
                          </div>
                        </SwipeableCard>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE SESSION MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-900 dark:text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-black font-display">Schedule Mathematics Session</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Session Topic / Exercise Name</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Past Paper 1 Trigonometry Identities Q4..."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Subject Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal-500"
                    >
                      {SUBJECT_PALETTE.map((sub) => (
                        <option key={sub.id} value={sub.category}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Day of Week</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal-500"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Time Slot</label>
                    <select
                      value={newSlotId}
                      onChange={(e) => setNewSlotId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal-500"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.id} value={slot.id}>{slot.timeRange} ({slot.periodName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Duration</label>
                    <select
                      value={newMinutes}
                      onChange={(e) => setNewMinutes(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal-500"
                    >
                      <option value={60}>1 Hour</option>
                      <option value={90}>1.5 Hours</option>
                      <option value={120}>2 Hours</option>
                      <option value={180}>3 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Link to Milestone Target</label>
                  <select
                    value={newMilestoneTag}
                    onChange={(e) => setNewMilestoneTag(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal-500"
                  >
                    <option value="None">None (Standard Session)</option>
                    {UPCOMING_MILESTONES.map((ms) => (
                      <option key={ms.id} value={ms.title}>{ms.title} ({ms.targetDay})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-xs font-mono font-bold rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Schedule Session
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SMART QUIZ SCHEDULER MODAL */}
      <SmartQuizSchedulerModal
        user={user}
        isOpen={showSmartScheduler}
        onClose={() => setShowSmartScheduler(false)}
        onApplySchedule={handleApplySmartSchedule}
        existingScheduleCount={sessions.length}
      />

      {/* AUTOMATED 30-MIN STUDY SCHEDULE GENERATOR MODAL */}
      <AutomatedStudyScheduleGenerator
        user={user}
        isOpen={showAutomatedScheduleModal}
        onClose={() => setShowAutomatedScheduleModal(false)}
      />
    </div>
  );
};
