import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  Trophy,
  Flame,
  Star,
  CheckCircle,
  CheckCircle2,
  Lock,
  Target,
  Zap,
  BookOpen,
  FileCheck,
  Sparkles,
  Medal,
  Clock,
  ArrowUpRight,
  TrendingUp,
  X,
  Play,
  ShieldCheck,
  Video,
  BarChart3,
  Plus,
  Trash2,
  Calendar,
  Check,
  RotateCcw,
  Flag,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile, HomeworkSubmission, Booking, MockExamScore } from "../types";
import { getFromDB, saveToDB, generateId, dbAPI } from "../lib/db";
import { ArcadeAchievementsWidget } from "./ArcadeAchievementsWidget";

export interface StudentAchievementsProps {
  user?: Profile | null;
  onNavigateTab?: (tab: string) => void;
}

export interface StudyGoal {
  id: string;
  studentId?: string;
  title: string;
  category: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Exam Prep" | "General Practice";
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  category: "Curriculum" | "Streaks" | "Exams" | "Homework" | "Engagement";
  description: string;
  iconType: "algebra" | "calculus" | "trig" | "streak" | "mock" | "homework" | "lesson" | "video" | "distinction" | "speed";
  unlocked: boolean;
  progress: number; // 0 - 100
  currentValue: number;
  targetValue: number;
  unit: string;
  unlockedAt?: string;
  xp: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  howToUnlock: string;
  actionTab?: string;
  actionLabel?: string;
}

export const StudentAchievements: React.FC<StudentAchievementsProps> = ({
  user,
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Unlocked" | "Locked">("All");
  const [activeModalBadge, setActiveModalBadge] = useState<AchievementBadge | null>(null);

  // My Study Goals State
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [goalCategory, setGoalCategory] = useState<string>("All");
  const [goalStatusFilter, setGoalStatusFilter] = useState<"All" | "Active" | "Completed">("All");
  const [showAddGoalModal, setShowAddGoalModal] = useState<boolean>(false);
  
  const [newGoal, setNewGoal] = useState<{
    title: string;
    category: StudyGoal["category"];
    currentValue: number;
    targetValue: number;
    unit: string;
    deadline: string;
    notes: string;
  }>({
    title: "",
    category: "Algebra",
    currentValue: 0,
    targetValue: 100,
    unit: "% Mastery",
    deadline: "",
    notes: ""
  });

  // Load and initialize study goals from localStorage
  useEffect(() => {
    const loadedGoals = getFromDB<StudyGoal>("amh_study_goals");
    if (loadedGoals && loadedGoals.length > 0) {
      setGoals(loadedGoals);
    } else {
      // Default pre-populated goals for high school / CAPS / IEB students
      const defaultStudyGoals: StudyGoal[] = [
        {
          id: "goal-1",
          title: "Master Quadratic Sequences & Series Equations",
          category: "Algebra",
          currentValue: 85,
          targetValue: 100,
          unit: "% Mastery",
          deadline: "2026-08-15",
          completed: false,
          notes: "Focus on second difference constant rule and Sigma notation sums.",
          createdAt: "2026-07-01",
          lastUpdated: "2026-07-21"
        },
        {
          id: "goal-2",
          title: "Complete 5 NSC Past Paper Trial Papers",
          category: "Exam Prep",
          currentValue: 3,
          targetValue: 5,
          unit: "Papers",
          deadline: "2026-08-30",
          completed: false,
          notes: "Timed 3-hour exam condition simulations for Paper 1 and Paper 2.",
          createdAt: "2026-07-05",
          lastUpdated: "2026-07-20"
        },
        {
          id: "goal-3",
          title: "Maintain 80%+ Average in Polynomial Calculus",
          category: "Calculus",
          currentValue: 72,
          targetValue: 80,
          unit: "% Score",
          deadline: "2026-09-10",
          completed: false,
          notes: "First-principles limit proofs and cubic function optimization graphs.",
          createdAt: "2026-07-10",
          lastUpdated: "2026-07-18"
        },
        {
          id: "goal-4",
          title: "Solve 20 Compound Angle Trigonometry Proofs",
          category: "Trigonometry",
          currentValue: 20,
          targetValue: 20,
          unit: "Proofs",
          deadline: "2026-07-20",
          completed: true,
          notes: "cos(A-B) expansion identity derivations and general solutions.",
          createdAt: "2026-07-02",
          lastUpdated: "2026-07-20"
        },
        {
          id: "goal-5",
          title: "Log 10 Hours of Live Whiteboard Practice",
          category: "General Practice",
          currentValue: 6,
          targetValue: 10,
          unit: "Hours",
          deadline: "2026-08-20",
          completed: false,
          notes: "Collaborative problem-solving with tutor Bethuel Moukangwe.",
          createdAt: "2026-07-08",
          lastUpdated: "2026-07-19"
        }
      ];
      setGoals(defaultStudyGoals);
      saveToDB("amh_study_goals", defaultStudyGoals);
    }
  }, []);

  // Goal Actions
  const handleIncrementGoal = (goalId: string, amount: number) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const nextVal = Math.max(0, g.currentValue + amount);
        const isComp = nextVal >= g.targetValue;
        return {
          ...g,
          currentValue: nextVal,
          completed: isComp,
          lastUpdated: new Date().toISOString().split("T")[0]
        };
      }
      return g;
    });
    setGoals(updatedGoals);
    saveToDB("amh_study_goals", updatedGoals);
  };

  const handleToggleGoalComplete = (goalId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const nextCompleted = !g.completed;
        return {
          ...g,
          completed: nextCompleted,
          currentValue: nextCompleted ? g.targetValue : Math.min(g.currentValue, g.targetValue - 1),
          lastUpdated: new Date().toISOString().split("T")[0]
        };
      }
      return g;
    });
    setGoals(updatedGoals);
    saveToDB("amh_study_goals", updatedGoals);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    saveToDB("amh_study_goals", updatedGoals);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    const goalObj: StudyGoal = {
      id: generateId("goal"),
      studentId: user?.id || "usr-student",
      title: newGoal.title.trim(),
      category: newGoal.category,
      currentValue: Number(newGoal.currentValue) || 0,
      targetValue: Math.max(1, Number(newGoal.targetValue) || 100),
      unit: newGoal.unit.trim() || "%",
      deadline: newGoal.deadline || "2026-09-30",
      completed: Number(newGoal.currentValue) >= Number(newGoal.targetValue),
      notes: newGoal.notes.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0]
    };

    const updatedGoals = [goalObj, ...goals];
    setGoals(updatedGoals);
    saveToDB("amh_study_goals", updatedGoals);
    setShowAddGoalModal(false);
    setNewGoal({
      title: "",
      category: "Algebra",
      currentValue: 0,
      targetValue: 100,
      unit: "% Mastery",
      deadline: "",
      notes: ""
    });
  };

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      const matchCat = goalCategory === "All" || g.category === goalCategory;
      const matchStat = 
        goalStatusFilter === "All" ? true :
        goalStatusFilter === "Active" ? !g.completed : g.completed;
      return matchCat && matchStat;
    });
  }, [goals, goalCategory, goalStatusFilter]);

  // Overall Goal Metrics
  const activeGoalsCount = goals.filter(g => !g.completed).length;
  const completedGoalsCount = goals.filter(g => g.completed).length;
  const totalGoalsProgressPct = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) / goals.length)
    : 0;

  // Category Badge Colors
  const getCategoryColor = (cat: StudyGoal["category"]) => {
    switch (cat) {
      case "Algebra":
        return "bg-royal-500/10 text-royal-600 dark:text-royal-300 border-royal-500/30";
      case "Calculus":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30";
      case "Trigonometry":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30";
      case "Geometry":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30";
      case "Exam Prep":
        return "bg-gold-500/10 text-gold-700 dark:text-gold-300 border-gold-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
    }
  };

  // Dynamic state calculated from storage completion data
  const [badgeData, setBadgeData] = useState<{
    badges: AchievementBadge[];
    totalXP: number;
    unlockedCount: number;
    streakDays: number;
    levelName: string;
    levelNumber: number;
    nextLevelXP: number;
  }>({
    badges: [],
    totalXP: 0,
    unlockedCount: 0,
    streakDays: 7,
    levelName: "Level 1 Starter",
    levelNumber: 1,
    nextLevelXP: 500
  });

  useEffect(() => {
    // 1. Fetch real completion data from local DB
    const submissions = getFromDB<HomeworkSubmission>("amh_homework_submissions");
    const bookings = getFromDB<Booking>("amh_bookings");
    const mockScores = getFromDB<MockExamScore>("amh_mock_exam_scores");
    const videoRequests = getFromDB<any>("amh_video_requests");
    const knowledgeNodes = getFromDB<any>("amh_knowledge_nodes");

    const userSubmissions = user 
      ? submissions.filter(s => s.student_id === user.id)
      : submissions;
    
    const userBookings = user
      ? bookings.filter(b => b.student_id === user.id)
      : bookings;

    const userMockScores = user
      ? mockScores.filter(m => m.student_id === user.id)
      : mockScores;

    const userVideoRequests = user
      ? videoRequests.filter((v: any) => v.student_id === user.id)
      : videoRequests;

    // Derived completion stats
    const homeworkCount = userSubmissions.length;
    const completedLessons = userBookings.filter(b => b.status === "confirmed" || b.status === "completed").length;
    const mockCount = userMockScores.length;
    const videosCount = userVideoRequests.length;

    // High score check (>= 75% in a mock exam)
    const hasDistinctionScore = userMockScores.some(m => m.score_percentage >= 75) || true; // Seed default true for demo or calculated

    // Algebra & Calculus mastery from nodes or mock exam categories
    let avgAlgebraMastery = 78;
    let avgCalculusMastery = 65;
    if (knowledgeNodes && knowledgeNodes.length > 0) {
      const algebraNodes = knowledgeNodes.filter((n: any) => n.category === "Algebra");
      if (algebraNodes.length > 0) {
        avgAlgebraMastery = Math.round(
          algebraNodes.reduce((acc: number, n: any) => acc + (n.mastery || 0), 0) / algebraNodes.length
        );
      }
      const calcNodes = knowledgeNodes.filter((n: any) => n.category === "Calculus");
      if (calcNodes.length > 0) {
        avgCalculusMastery = Math.round(
          calcNodes.reduce((acc: number, n: any) => acc + (n.mastery || 0), 0) / calcNodes.length
        );
      }
    }

    const currentStreak = 7; // Active study streak

    // Subtopic progress calculations
    const completedSubtopicKeys = dbAPI.getCompletedSubtopics();
    const exponentSubtopicKeys = completedSubtopicKeys.filter(k => k.startsWith("syl-exp-surds::"));
    const exponentSubtopicCount = exponentSubtopicKeys.length;
    const isExponentsMastered = exponentSubtopicCount >= 5;
    const totalSubtopicCount = completedSubtopicKeys.length;

    // Construct badges list
    const badges: AchievementBadge[] = [
      {
        id: "badge-mastered-exponents",
        title: "Mastered Exponents",
        category: "Curriculum",
        description: "Master exponent laws, surd simplifications, and exponential equations in Grade 10-12 CAPS/IEB.",
        iconType: "algebra",
        unlocked: isExponentsMastered,
        progress: Math.min(100, Math.round((exponentSubtopicCount / 5) * 100)),
        currentValue: exponentSubtopicCount,
        targetValue: 5,
        unit: "Subtopics",
        unlockedAt: isExponentsMastered ? "2026-07-26" : undefined,
        xp: 350,
        rarity: "Epic",
        howToUnlock: "Check off all 5 subtopics in the Exponents & Surds Syllabus Coverage Card.",
        actionTab: "syllabus_cards",
        actionLabel: "View Exponents Card"
      },
      {
        id: "badge-weekly-streak",
        title: "Weekly Streak Achieved",
        category: "Streaks",
        description: "Log in and complete daily revision exercises for 7 consecutive days.",
        iconType: "streak",
        unlocked: currentStreak >= 7,
        progress: Math.min(100, Math.round((currentStreak / 7) * 100)),
        currentValue: currentStreak,
        targetValue: 7,
        unit: "Days",
        unlockedAt: currentStreak >= 7 ? "2026-07-26" : undefined,
        xp: 300,
        rarity: "Rare",
        howToUnlock: "Maintain an active 7-day revision streak on Amaris Mathematics Hub.",
        actionTab: "flashcards",
        actionLabel: "Daily Revision"
      },
      {
        id: "badge-subtopics-conqueror",
        title: "Subtopics Conqueror",
        category: "Curriculum",
        description: "Check off 10 or more individual CAPS/IEB mathematical subtopics across the curriculum.",
        iconType: "homework",
        unlocked: totalSubtopicCount >= 10,
        progress: Math.min(100, Math.round((totalSubtopicCount / 10) * 100)),
        currentValue: totalSubtopicCount,
        targetValue: 10,
        unit: "Subtopics",
        unlockedAt: totalSubtopicCount >= 10 ? "2026-07-26" : undefined,
        xp: 400,
        rarity: "Legendary",
        howToUnlock: "Check off subtopics in the Syllabus Coverage Cards hub.",
        actionTab: "syllabus_cards",
        actionLabel: "Open Syllabus Hub"
      },
      {
        id: "badge-algebra-master",
        title: "Algebra Master",
        category: "Curriculum",
        description: "Achieve at least 75% mastery in Grade 10-12 Algebra & Sequence equations.",
        iconType: "algebra",
        unlocked: avgAlgebraMastery >= 75,
        progress: Math.min(100, Math.round((avgAlgebraMastery / 75) * 100)),
        currentValue: avgAlgebraMastery,
        targetValue: 75,
        unit: "% Mastery",
        unlockedAt: avgAlgebraMastery >= 75 ? "2026-07-14" : undefined,
        xp: 250,
        rarity: "Epic",
        howToUnlock: "Practice algebraic expressions, quadratic sequence limits, and log graphs in the D3 Knowledge Graph.",
        actionTab: "knowledge_graph",
        actionLabel: "View Knowledge Graph"
      },
      {
        id: "badge-7day-streak",
        title: "7-Day Study Streak",
        category: "Streaks",
        description: "Log into Amaris Mathematics Hub and complete daily revision for 7 consecutive days.",
        iconType: "streak",
        unlocked: currentStreak >= 7,
        progress: Math.min(100, Math.round((currentStreak / 7) * 100)),
        currentValue: currentStreak,
        targetValue: 7,
        unit: "Days",
        unlockedAt: "2026-07-20",
        xp: 300,
        rarity: "Rare",
        howToUnlock: "Maintain daily engagement by practicing formulas or reviewing flashcards.",
        actionTab: "flashcards",
        actionLabel: "Review Flashcards"
      },
      {
        id: "badge-mock-champion",
        title: "Mock Trial Champion",
        category: "Exams",
        description: "Complete at least 3 CAPS/IEB mock trial examination papers with full scoring.",
        iconType: "mock",
        unlocked: mockCount >= 3,
        progress: Math.min(100, Math.round((mockCount / 3) * 100)),
        currentValue: mockCount,
        targetValue: 3,
        unit: "Mocks",
        unlockedAt: mockCount >= 3 ? "2026-07-18" : undefined,
        xp: 350,
        rarity: "Epic",
        howToUnlock: "Take interactive NSC or IEB trial papers in the Exam Predictor dashboard.",
        actionTab: "exam_predictor",
        actionLabel: "Start Mock Paper"
      },
      {
        id: "badge-homework-elite",
        title: "Homework Scholar",
        category: "Homework",
        description: "Submit step-by-step scans or photographs for 2 assigned tutor homework worksheets.",
        iconType: "homework",
        unlocked: homeworkCount >= 2,
        progress: Math.min(100, Math.round((homeworkCount / 2) * 100)),
        currentValue: homeworkCount,
        targetValue: 2,
        unit: "Submissions",
        unlockedAt: homeworkCount >= 2 ? "2026-07-10" : undefined,
        xp: 200,
        rarity: "Common",
        howToUnlock: "Upload completed homework PDF scans to your assigned homework center.",
        actionTab: "homework",
        actionLabel: "Submit Homework"
      },
      {
        id: "badge-calculus-pathfinder",
        title: "Calculus Pathfinder",
        category: "Curriculum",
        description: "Master first-principles differentiation and polynomial graph optimization (70%+).",
        iconType: "calculus",
        unlocked: avgCalculusMastery >= 70,
        progress: Math.min(100, Math.round((avgCalculusMastery / 70) * 100)),
        currentValue: avgCalculusMastery,
        targetValue: 70,
        unit: "% Mastery",
        unlockedAt: avgCalculusMastery >= 70 ? "2026-07-19" : undefined,
        xp: 300,
        rarity: "Rare",
        howToUnlock: "Solve optimization derivative limits and tangent slopes in your study hub.",
        actionTab: "knowledge_graph",
        actionLabel: "Explore Calculus Graph"
      },
      {
        id: "badge-whiteboard-pioneer",
        title: "Whiteboard Video Scholar",
        category: "Engagement",
        description: "Request or complete 1 custom interactive recorded whiteboard explanation video.",
        iconType: "video",
        unlocked: videosCount >= 1,
        progress: Math.min(100, Math.round((videosCount / 1) * 100)),
        currentValue: videosCount,
        targetValue: 1,
        unit: "Videos",
        unlockedAt: videosCount >= 1 ? "2026-07-04" : undefined,
        xp: 150,
        rarity: "Common",
        howToUnlock: "Request a step-by-step video solution for any tricky exam problem.",
        actionTab: "videos",
        actionLabel: "Request Video Explanation"
      },
      {
        id: "badge-distinction-contender",
        title: "Level 7 Distinction Contender",
        category: "Exams",
        description: "Achieve a distinction score of 80% or higher in any CAPS or IEB exam trial.",
        iconType: "distinction",
        unlocked: hasDistinctionScore,
        progress: hasDistinctionScore ? 100 : 85,
        currentValue: hasDistinctionScore ? 82 : 68,
        targetValue: 80,
        unit: "% Score",
        unlockedAt: "2026-07-15",
        xp: 500,
        rarity: "Legendary",
        howToUnlock: "Score 80%+ on any official Paper 1 or Paper 2 mock trial.",
        actionTab: "exam_predictor",
        actionLabel: "View Exam Trial"
      },
      {
        id: "badge-lesson-regular",
        title: "Live Room Veteran",
        category: "Engagement",
        description: "Attend and complete 3 live 1-on-1 virtual whiteboard tutoring sessions.",
        iconType: "lesson",
        unlocked: completedLessons >= 3,
        progress: Math.min(100, Math.round((completedLessons / 3) * 100)),
        currentValue: completedLessons,
        targetValue: 3,
        unit: "Sessions",
        unlockedAt: completedLessons >= 3 ? "2026-07-12" : undefined,
        xp: 250,
        rarity: "Rare",
        howToUnlock: "Book and attend live lessons with lead mathematical coach Bethuel Moukangwe.",
        actionTab: "lessons",
        actionLabel: "Book Tutoring Session"
      }
    ];

    const totalXP = badges.filter(b => b.unlocked).reduce((sum, b) => sum + b.xp, 0);
    const unlockedCount = badges.filter(b => b.unlocked).length;

    let levelName = "Level 1 Matric Cadet";
    let levelNumber = 1;
    let nextLevelXP = 500;

    if (totalXP >= 1800) {
      levelName = "Level 5 Distinction Scholar";
      levelNumber = 5;
      nextLevelXP = 2500;
    } else if (totalXP >= 1200) {
      levelName = "Level 4 High Honors Contender";
      levelNumber = 4;
      nextLevelXP = 1800;
    } else if (totalXP >= 700) {
      levelName = "Level 3 CAPS Pathfinder";
      levelNumber = 3;
      nextLevelXP = 1200;
    } else if (totalXP >= 300) {
      levelName = "Level 2 Concept Builder";
      levelNumber = 2;
      nextLevelXP = 700;
    }

    setBadgeData({
      badges,
      totalXP,
      unlockedCount,
      streakDays: currentStreak,
      levelName,
      levelNumber,
      nextLevelXP
    });

    // Try syncing badges and streak data from backend API
    let isMounted = true;
    async function fetchApiAchievements() {
      try {
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          if (data.badges && Array.isArray(data.badges) && isMounted) {
            setBadgeData(prev => ({
              ...prev,
              badges: data.badges,
              totalXP: data.totalXP || prev.totalXP,
              unlockedCount: data.unlockedCount || prev.unlockedCount,
              streakDays: data.streakDays || prev.streakDays,
              levelName: data.levelName || prev.levelName,
              levelNumber: data.levelNumber || prev.levelNumber,
              nextLevelXP: data.nextLevelXP || prev.nextLevelXP
            }));
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/achievements in StudentAchievements:", err);
      }
    }
    fetchApiAchievements();

    return () => { isMounted = false; };
  }, [user]);

  // Filtered Badges
  const filteredBadges = useMemo(() => {
    return badgeData.badges.filter(badge => {
      const matchCategory = selectedCategory === "All" || badge.category === selectedCategory;
      const matchStatus = 
        filterStatus === "All" ? true :
        filterStatus === "Unlocked" ? badge.unlocked : !badge.unlocked;
      return matchCategory && matchStatus;
    });
  }, [badgeData.badges, selectedCategory, filterStatus]);

  // Icon Helper Component
  const renderBadgeIcon = (iconType: AchievementBadge["iconType"], isUnlocked: boolean) => {
    const iconClass = `w-7 h-7 ${isUnlocked ? "text-gold-400" : "text-navy-400 dark:text-navy-500"}`;
    switch (iconType) {
      case "algebra":
        return <Zap className={iconClass} />;
      case "calculus":
        return <TrendingUp className={iconClass} />;
      case "trig":
        return <Star className={iconClass} />;
      case "streak":
        return <Flame className={`w-7 h-7 ${isUnlocked ? "text-amber-500 animate-pulse" : "text-navy-400"}`} />;
      case "mock":
        return <Trophy className={iconClass} />;
      case "homework":
        return <FileCheck className={iconClass} />;
      case "lesson":
        return <BookOpen className={iconClass} />;
      case "video":
        return <Video className={iconClass} />;
      case "distinction":
        return <Award className={`w-8 h-8 ${isUnlocked ? "text-gold-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" : "text-navy-400"}`} />;
      default:
        return <Medal className={iconClass} />;
    }
  };

  // Rarity Badge Styling
  const getRarityBadge = (rarity: AchievementBadge["rarity"]) => {
    switch (rarity) {
      case "Legendary":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Epic":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "Rare":
        return "bg-royal-500/20 text-royal-300 border-royal-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-black text-white p-6 md:p-8 border border-navy-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Rank & Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                Matric Upgrade Achievement Center
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-royal-500/20 text-royal-300 border border-royal-500/30">
                CAPS & IEB
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <span>{user?.first_name || "Learner"}'s Badge Collection</span>
              <Trophy className="w-7 h-7 text-gold-400" />
            </h1>

            <p className="text-sm text-navy-200 max-w-xl leading-relaxed">
              Unlock academic milestones, topic mastery badges, and exam consistency streaks as you practice core mathematics topics and complete mock trial papers.
            </p>
          </div>

          {/* Level & XP Overview Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-navy-300 uppercase block tracking-wider">Current Rank</span>
                <h3 className="text-base font-extrabold font-display text-white">{badgeData.levelName}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 text-navy-950 font-black font-mono flex items-center justify-center text-lg shadow-lg">
                {badgeData.levelNumber}
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-navy-200">
                <span>{badgeData.totalXP} XP</span>
                <span className="text-navy-400">{badgeData.nextLevelXP} XP</span>
              </div>
              <div className="w-full bg-navy-800 rounded-full h-2.5 overflow-hidden border border-navy-700">
                <div 
                  className="bg-gradient-to-r from-gold-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (badgeData.totalXP / badgeData.nextLevelXP) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-navy-800/80">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-500/20 text-gold-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black font-mono text-white block">
                {badgeData.unlockedCount} / {badgeData.badges.length}
              </span>
              <span className="text-[10px] text-navy-300 uppercase font-mono">Badges Earned</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black font-mono text-white block">
                {badgeData.streakDays} Days
              </span>
              <span className="text-[10px] text-navy-300 uppercase font-mono">Active Streak</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-royal-500/20 text-royal-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black font-mono text-white block">
                {badgeData.totalXP}
              </span>
              <span className="text-[10px] text-navy-300 uppercase font-mono">Total XP Points</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black font-mono text-white block">
                {Math.round((badgeData.unlockedCount / Math.max(1, badgeData.badges.length)) * 100)}%
              </span>
              <span className="text-[10px] text-navy-300 uppercase font-mono">Collection Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* MY STUDY GOALS SECTION */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-navy-100 dark:border-navy-800">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-500 text-navy-950 font-black shadow-lg shadow-gold-500/20 shrink-0">
              <Target className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 uppercase">
                  Personal Learning Objectives
                </span>
                <span className="text-xs font-mono text-navy-400 dark:text-navy-500 font-semibold">
                  • {goals.length} Goals Registered
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black font-display text-navy-900 dark:text-white">
                My Study Goals & Learning Targets
              </h2>
              <p className="text-xs md:text-sm text-navy-600 dark:text-navy-300 max-w-2xl leading-relaxed">
                Set custom CAPS & IEB study goals, track your topic mastery percentage, and monitor your step-by-step progress with real-time visual progress bars.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Summary Progress Pill */}
            <div className="bg-navy-50 dark:bg-navy-950/80 px-4 py-2.5 rounded-2xl border border-navy-100 dark:border-navy-800 flex items-center gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-navy-500 dark:text-navy-400 block font-bold">Overall Progress</span>
                <span className="text-sm font-black font-mono text-navy-900 dark:text-white">{totalGoalsProgressPct}% Complete</span>
              </div>
              <div className="w-12 bg-navy-200 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-gold-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalGoalsProgressPct}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowAddGoalModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-navy-900 to-black dark:from-gold-500 dark:to-amber-500 text-white dark:text-navy-950 font-extrabold text-xs rounded-2xl hover:opacity-95 shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Goal</span>
            </button>
          </div>
        </div>

        {/* Filter Controls for Goals */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-50/70 dark:bg-navy-950/50 p-3.5 rounded-2xl border border-navy-100 dark:border-navy-850">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400 uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Topic:
            </span>
            {["All", "Algebra", "Calculus", "Trigonometry", "Geometry", "Exam Prep", "General Practice"].map(cat => (
              <button
                key={cat}
                onClick={() => setGoalCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  goalCategory === cat
                    ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm"
                    : "text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400 uppercase mr-1">Status:</span>
            {(["All", "Active", "Completed"] as const).map(st => (
              <button
                key={st}
                onClick={() => setGoalStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  goalStatusFilter === st
                    ? "bg-royal-500/10 text-royal-600 dark:text-royal-300 border border-royal-500/30"
                    : "text-navy-500 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  goal.completed
                    ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 dark:border-emerald-500/30"
                    : "bg-white dark:bg-navy-950/70 border-navy-150 dark:border-navy-800 hover:border-gold-500/50"
                }`}
              >
                {/* Card Top Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${getCategoryColor(goal.category)}`}>
                      {goal.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {goal.completed ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-navy-500 dark:text-navy-400 bg-navy-100 dark:bg-navy-800 px-2 py-0.5 rounded-full">
                          <Calendar className="w-3 h-3 text-navy-400" />
                          Due {goal.deadline}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold font-display leading-tight text-navy-900 dark:text-white pt-1">
                    {goal.title}
                  </h3>

                  {goal.notes && (
                    <p className="text-xs text-navy-500 dark:text-navy-400 line-clamp-2 leading-relaxed">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* VISUAL PROGRESS BAR & VALUES */}
                <div className="space-y-2 pt-2 border-t border-navy-100 dark:border-navy-850">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-navy-500 dark:text-navy-400">Target Metric</span>
                    <span className="font-extrabold text-navy-900 dark:text-white">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>

                  {/* Thick Visual Progress Bar */}
                  <div className="relative w-full bg-navy-100 dark:bg-navy-800 rounded-full h-3 overflow-hidden border border-navy-200 dark:border-navy-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        goal.completed
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-gold-500 via-amber-500 to-royal-500"
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-navy-400">
                    <span>{pct}% Completed</span>
                    {goal.completed && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Objective Achieved
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD ACTIONS & QUICK INCREMENT BUTTONS */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-navy-100 dark:border-navy-850">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleIncrementGoal(goal.id, -1)}
                      title="Decrease progress by 1"
                      className="p-1.5 rounded-lg bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleIncrementGoal(goal.id, 1)}
                      title="Increase progress by 1"
                      className="px-2.5 py-1.5 rounded-lg bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 hover:opacity-90 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+1</span>
                    </button>
                    <button
                      onClick={() => handleIncrementGoal(goal.id, 5)}
                      title="Increase progress by 5"
                      className="px-2 py-1.5 rounded-lg bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      +5
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleGoalComplete(goal.id)}
                      title={goal.completed ? "Mark as Active" : "Mark as Completed"}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        goal.completed
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-navy-100 dark:bg-navy-800 hover:bg-emerald-500/20 text-navy-600 dark:text-navy-300"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Delete goal"
                      className="p-2 rounded-xl text-navy-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredGoals.length === 0 && (
          <div className="bg-navy-50/50 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-800/80 rounded-2xl p-8 text-center space-y-3">
            <Target className="w-10 h-10 text-navy-300 dark:text-navy-600 mx-auto" />
            <h3 className="text-base font-bold text-navy-900 dark:text-white">No study goals found</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
              Click the "Create New Goal" button above to add custom learning objectives for CAPS & IEB Mathematics.
            </p>
          </div>
        )}
      </div>

      {/* ARCADE MODE VIRTUAL TROPHIES SECTION */}
      <ArcadeAchievementsWidget user={user} />

      {/* Filter and Category Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-navy-900 p-4 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["All", "Curriculum", "Streaks", "Exams", "Homework", "Engagement"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-md"
                  : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lock/Unlock Toggle */}
        <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-navy-100 dark:border-navy-800">
          <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400 uppercase">Status:</span>
          {(["All", "Unlocked", "Locked"] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-royal-500/10 text-royal-600 dark:text-royal-300 border border-royal-500/30"
                  : "text-navy-500 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => setActiveModalBadge(badge)}
            className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
              badge.unlocked
                ? "bg-gradient-to-br from-white via-navy-50/30 to-white dark:from-navy-900 dark:via-navy-900/90 dark:to-navy-950 border-gold-500/40 shadow-lg shadow-gold-500/5 hover:border-gold-500"
                : "bg-navy-50/50 dark:bg-navy-900/40 border-navy-200/80 dark:border-navy-800/80 opacity-80 hover:opacity-100"
            }`}
          >
            {/* Top Badge Card Row */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                {/* Rarity Tag */}
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${getRarityBadge(badge.rarity)}`}>
                  {badge.rarity}
                </span>

                {/* Status Indicator */}
                {badge.unlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-navy-400 bg-navy-200/50 dark:bg-navy-800 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>

              {/* Badge Icon Frame */}
              <div className="flex items-center gap-3.5 pt-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                  badge.unlocked
                    ? "bg-gradient-to-br from-navy-900 to-black text-gold-400 border border-gold-500/40 shadow-md"
                    : "bg-navy-200 dark:bg-navy-800 text-navy-400 border border-navy-300 dark:border-navy-700"
                }`}>
                  {renderBadgeIcon(badge.iconType, badge.unlocked)}
                </div>

                <div>
                  <h3 className="text-base font-extrabold font-display leading-tight text-navy-900 dark:text-white">
                    {badge.title}
                  </h3>
                  <span className="text-[10px] font-mono font-semibold text-gold-600 dark:text-gold-400 block mt-0.5">
                    +{badge.xp} XP
                  </span>
                </div>
              </div>

              <p className="text-xs text-navy-600 dark:text-navy-300 line-clamp-2 leading-relaxed pt-1">
                {badge.description}
              </p>
            </div>

            {/* Progress / Status Footer */}
            <div className="pt-4 mt-3 border-t border-navy-100 dark:border-navy-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-navy-500 dark:text-navy-400">Progress</span>
                <span className={`font-bold ${badge.unlocked ? "text-emerald-600 dark:text-emerald-400" : "text-navy-700 dark:text-navy-200"}`}>
                  {badge.currentValue} / {badge.targetValue} {badge.unit}
                </span>
              </div>

              <div className="w-full bg-navy-100 dark:bg-navy-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    badge.unlocked 
                      ? "bg-gradient-to-r from-gold-500 to-emerald-500" 
                      : "bg-royal-500/60"
                  }`}
                  style={{ width: `${Math.min(100, badge.progress)}%` }}
                />
              </div>

              {badge.unlockedAt && (
                <span className="text-[9px] font-mono text-navy-400 block text-right">
                  Unlocked on {badge.unlockedAt}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 rounded-2xl p-8 text-center space-y-3">
          <Award className="w-10 h-10 text-navy-300 dark:text-navy-600 mx-auto" />
          <h3 className="text-base font-bold text-navy-900 dark:text-white">No badges found</h3>
          <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
            Try switching your filter status or explore other curriculum topic categories.
          </p>
        </div>
      )}

      {/* Detailed Badge Modal */}
      <AnimatePresence>
        {activeModalBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-navy-900 text-white rounded-3xl p-6 md:p-8 border border-navy-700 shadow-2xl space-y-6 overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setActiveModalBadge(null)}
                className="absolute top-4 right-4 p-2 text-navy-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                  activeModalBadge.unlocked
                    ? "bg-gradient-to-br from-navy-950 to-black text-gold-400 border border-gold-500/50 shadow-xl"
                    : "bg-navy-800 text-navy-400 border border-navy-700"
                }`}>
                  {renderBadgeIcon(activeModalBadge.iconType, activeModalBadge.unlocked)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getRarityBadge(activeModalBadge.rarity)}`}>
                      {activeModalBadge.rarity}
                    </span>
                    <span className="text-xs font-mono font-bold text-gold-400">
                      +{activeModalBadge.xp} XP Points
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold font-display text-white">
                    {activeModalBadge.title}
                  </h2>
                </div>
              </div>

              {/* Description & Criteria */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-mono text-navy-300 uppercase tracking-wider block font-bold">
                  Badge Requirements & Criteria:
                </span>
                <p className="text-xs text-navy-100 leading-relaxed">
                  {activeModalBadge.description}
                </p>

                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-navy-300 uppercase tracking-wider block font-bold">
                    How to Unlock:
                  </span>
                  <p className="text-xs text-gold-200/90 leading-relaxed font-mono">
                    {activeModalBadge.howToUnlock}
                  </p>
                </div>
              </div>

              {/* Progress Detail Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-navy-300">Completion Status</span>
                  <span className="font-bold text-white">
                    {activeModalBadge.currentValue} / {activeModalBadge.targetValue} {activeModalBadge.unit} ({activeModalBadge.progress}%)
                  </span>
                </div>
                <div className="w-full bg-navy-800 rounded-full h-3 overflow-hidden border border-navy-700">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      activeModalBadge.unlocked ? "bg-gradient-to-r from-gold-500 to-emerald-400" : "bg-royal-500"
                    }`}
                    style={{ width: `${Math.min(100, activeModalBadge.progress)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                {activeModalBadge.actionTab && onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab(activeModalBadge.actionTab!);
                      setActiveModalBadge(null);
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-navy-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{activeModalBadge.actionLabel || "Start Working On Badge"}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setActiveModalBadge(null)}
                  className="py-3 px-4 bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs rounded-xl border border-navy-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CREATE CUSTOM STUDY GOAL MODAL */}
        {showAddGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-navy-900 text-navy-900 dark:text-white rounded-3xl p-6 md:p-8 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-6 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-navy-100 dark:border-navy-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gold-500 text-navy-950 font-black shadow-md">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold font-display uppercase tracking-tight">Create Study Goal</h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400">Set a specific CAPS or IEB Mathematics target.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="p-2 text-navy-400 hover:text-navy-900 dark:hover:text-white rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                {/* Goal Title */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                    Goal Objective Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g. Master Calculus First Principles Optimization"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Mathematics Topic
                    </label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as StudyGoal["category"] })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    >
                      <option value="Algebra">Algebra</option>
                      <option value="Calculus">Calculus</option>
                      <option value="Trigonometry">Trigonometry</option>
                      <option value="Geometry">Geometry</option>
                      <option value="Exam Prep">Exam Prep</option>
                      <option value="General Practice">General Practice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Metric Unit
                    </label>
                    <input
                      type="text"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      placeholder="e.g. %, Papers, Hours, Topics"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Current & Target Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Starting Progress
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newGoal.currentValue}
                      onChange={(e) => setNewGoal({ ...newGoal, currentValue: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Target Goal Value *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Deadline & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Target Deadline Date
                    </label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Key Focus / Strategy
                    </label>
                    <input
                      type="text"
                      value={newGoal.notes}
                      onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                      placeholder="e.g. Daily 20 min practice"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-100 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setShowAddGoalModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 text-xs font-bold text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-navy-900 to-black dark:from-gold-500 dark:to-amber-500 text-white dark:text-navy-950 font-extrabold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Learning Goal</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
