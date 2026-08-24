import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import {
  Award,
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  Lock,
  Zap,
  BookOpen,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  Shield,
  Medal,
  Crown,
  ChevronRight,
  Filter,
  BarChart2,
  Sliders,
  Check,
  Download,
  Plus,
  RotateCcw,
  User,
  ExternalLink,
  Info
} from "lucide-react";
import { Profile } from "../types";
import { getFromDB } from "../lib/db";
import { CountUp } from "./CountUp";
import { ExportProgressPDF } from "./ExportProgressPDF";

export interface VisualReward {
  title: string;
  avatarFrame: string;
  frameStyle: string;
  perkDescription: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  category: "XP Thresholds" | "Complex Modules" | "Subject Aces" | "Quiz Streaks";
  subject?: "Algebra" | "Geometry" | "Trigonometry" | "Calculus" | "Finance & Stats" | "General";
  description: string;
  howToUnlock: string;
  iconType: "algebra_ace" | "geometry_genius" | "trig_titan" | "calculus_master" | "streak_superstar" | "goal_crusher" | "distinction" | "quiz_champion" | "homework_hero" | "formula_maestro" | "crown" | "shield";
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  xpReward: number;
  unlocked: boolean;
  currentValue: number;
  targetValue: number;
  unit: string;
  unlockedDate?: string;
  visualReward: VisualReward;
}

export interface BadgesProps {
  user?: Profile | null;
  onNavigateTab?: (tabName: string) => void;
}

export const Badges: React.FC<BadgesProps> = ({ user, onNavigateTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRarity, setSelectedRarity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unlocked" | "In Progress">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalBadge, setActiveModalBadge] = useState<BadgeItem | null>(null);

  // Dynamic state backed by localStorage
  const [userXP, setUserXP] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("amh_user_xp");
      return saved ? parseInt(saved, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  const [equippedTitle, setEquippedTitle] = useState<string>(() => {
    try {
      return localStorage.getItem("amh_equipped_badge_title") || "Algebra Ace";
    } catch {
      return "Algebra Ace";
    }
  });

  const [claimedRewards, setClaimedRewards] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("amh_claimed_rewards_v1");
      return saved ? JSON.parse(saved) : ["badge-alg-ace"];
    } catch {
      return ["badge-alg-ace"];
    }
  });

  // Module completion counters
  const [algebraCompletedCount, setAlgebraCompletedCount] = useState<number>(4);
  const [geometryCompletedCount, setGeometryCompletedCount] = useState<number>(3);
  const [trigCompletedCount, setTrigCompletedCount] = useState<number>(5);
  const [calculusCompletedCount, setCalculusCompletedCount] = useState<number>(2);
  const [financeCompletedCount, setFinanceCompletedCount] = useState<number>(3);
  const [statsCompletedCount, setStatsCompletedCount] = useState<number>(3);
  const [quizStreakDays, setQuizStreakDays] = useState<number>(5);

  // Sync state to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem("amh_user_xp", userXP.toString());
    } catch (e) {
      console.warn("Could not save XP:", e);
    }
  }, [userXP]);

  useEffect(() => {
    try {
      localStorage.setItem("amh_equipped_badge_title", equippedTitle);
    } catch (e) {
      console.warn("Could not save title:", e);
    }
  }, [equippedTitle]);

  useEffect(() => {
    try {
      localStorage.setItem("amh_claimed_rewards_v1", JSON.stringify(claimedRewards));
    } catch (e) {
      console.warn("Could not save claimed rewards:", e);
    }
  }, [claimedRewards]);

  // Load subtopic statistics from db
  useEffect(() => {
    try {
      const rawSubtopics = getFromDB<any>("amh_completed_subtopics_v1");
      const completedSubtopics: string[] = Array.isArray(rawSubtopics) ? rawSubtopics : [];
      
      const alg = completedSubtopics.filter(s => typeof s === "string" && (s.toLowerCase().includes("alg") || s.toLowerCase().includes("exp") || s.toLowerCase().includes("quad"))).length;
      const geo = completedSubtopics.filter(s => typeof s === "string" && (s.toLowerCase().includes("geo") || s.toLowerCase().includes("circle") || s.toLowerCase().includes("euc"))).length;
      const trig = completedSubtopics.filter(s => typeof s === "string" && (s.toLowerCase().includes("trig") || s.toLowerCase().includes("sin") || s.toLowerCase().includes("cos"))).length;
      const calc = completedSubtopics.filter(s => typeof s === "string" && (s.toLowerCase().includes("calc") || s.toLowerCase().includes("deriv") || s.toLowerCase().includes("poly"))).length;

      setAlgebraCompletedCount(prev => Math.max(prev, alg));
      setGeometryCompletedCount(prev => Math.max(prev, geo));
      setTrigCompletedCount(prev => Math.max(prev, trig));
      setCalculusCompletedCount(prev => Math.max(prev, calc));

      const quizHistory = getFromDB<any>("amh_daily_quiz_history_v1") as any;
      if (quizHistory && typeof quizHistory === "object" && typeof quizHistory.streakDays === "number") {
        setQuizStreakDays(Math.max(5, quizHistory.streakDays));
      }
    } catch (e) {
      console.warn("Error loading badge stats:", e);
    }
  }, []);

  // Compute 12 Badges dynamically
  const badgeList: BadgeItem[] = useMemo(() => {
    return [
      // 1. XP THRESHOLD: ALGEBRA ACE
      {
        id: "badge-alg-ace",
        title: "Algebra Ace",
        category: "XP Thresholds",
        subject: "Algebra",
        description: "Reached 500 XP in CAPS Mathematics practice and mastered quadratic equations, surds, and geometric sequence formulas.",
        howToUnlock: "Earn 500 total XP through quizzes, homework, and module completions.",
        iconType: "algebra_ace",
        rarity: "Rare",
        xpReward: 250,
        unlocked: userXP >= 500,
        currentValue: Math.min(500, userXP),
        targetValue: 500,
        unit: "XP",
        unlockedDate: userXP >= 500 ? "2026-07-20" : undefined,
        visualReward: {
          title: "Algebra Ace",
          avatarFrame: "Golden Parabola Aura",
          frameStyle: "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]",
          perkDescription: "Unlocks Algebra Formula Instant-Hint Cards & +5% Streak XP Booster."
        }
      },

      // 2. XP THRESHOLD: GEOMETRY GURU
      {
        id: "badge-geo-guru",
        title: "Geometry Guru",
        category: "XP Thresholds",
        subject: "Geometry",
        description: "Reached 1,000 XP threshold by solving Analytical Circle tangents and Euclidean ratio proportional proofs.",
        howToUnlock: "Earn 1,000 total XP in your student profile dashboard.",
        iconType: "geometry_genius",
        rarity: "Epic",
        xpReward: 350,
        unlocked: userXP >= 1000,
        currentValue: Math.min(1000, userXP),
        targetValue: 1000,
        unit: "XP",
        unlockedDate: userXP >= 1000 ? "2026-07-26" : undefined,
        visualReward: {
          title: "Geometry Guru",
          avatarFrame: "Emerald Euclidean Crest",
          frameStyle: "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]",
          perkDescription: "Unlocks Interactive Euclidean Geometric Proof Diagram Highlighting."
        }
      },

      // 3. XP THRESHOLD: TRIG TITAN
      {
        id: "badge-trig-titan",
        title: "Trig Titan",
        category: "XP Thresholds",
        subject: "Trigonometry",
        description: "Reached 1,500 XP threshold by mastering compound angle expansions and trigonometric graph transformations.",
        howToUnlock: "Earn 1,500 total XP in your student profile dashboard.",
        iconType: "trig_titan",
        rarity: "Epic",
        xpReward: 400,
        unlocked: userXP >= 1500,
        currentValue: Math.min(1500, userXP),
        targetValue: 1500,
        unit: "XP",
        unlockedDate: userXP >= 1500 ? "2026-08-01" : undefined,
        visualReward: {
          title: "Trig Titan",
          avatarFrame: "Cyan Sine-Wave Sparkle",
          frameStyle: "border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.7)]",
          perkDescription: "Unlocks Automatic General Solution Step-by-Step Solver."
        }
      },

      // 4. XP THRESHOLD: CALCULUS CONQUEROR
      {
        id: "badge-calc-conqueror",
        title: "Calculus Conqueror",
        category: "XP Thresholds",
        subject: "Calculus",
        description: "Reached 2,500 XP threshold by conquering first-principles derivative limits and cubic curve optimization.",
        howToUnlock: "Earn 2,500 total XP in your student profile dashboard.",
        iconType: "calculus_master",
        rarity: "Legendary",
        xpReward: 500,
        unlocked: userXP >= 2500,
        currentValue: Math.min(2500, userXP),
        targetValue: 2500,
        unit: "XP",
        unlockedDate: userXP >= 2500 ? "2026-08-04" : undefined,
        visualReward: {
          title: "Calculus Conqueror",
          avatarFrame: "Royal Derivative Diamond",
          frameStyle: "border-royal-400 shadow-[0_0_20px_rgba(99,102,241,0.8)]",
          perkDescription: "Unlocks Express Priority Whiteboard Solution Video Recording Status."
        }
      },

      // 5. XP THRESHOLD: NSC DISTINCTION LEGEND
      {
        id: "badge-distinction-legend",
        title: "NSC Distinction Legend",
        category: "XP Thresholds",
        subject: "General",
        description: "Reached 5,000 XP threshold for elite distinction status across Grade 10-12 CAPS & IEB Mathematics!",
        howToUnlock: "Earn 5,000 total XP in your student profile dashboard.",
        iconType: "crown",
        rarity: "Mythic",
        xpReward: 1000,
        unlocked: userXP >= 5000,
        currentValue: Math.min(5000, userXP),
        targetValue: 5000,
        unit: "XP",
        unlockedDate: userXP >= 5000 ? "2026-08-05" : undefined,
        visualReward: {
          title: "Matric Distinction Legend",
          avatarFrame: "Mythic Gold Crown Legend",
          frameStyle: "border-gold-400 ring-4 ring-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-pulse",
          perkDescription: "Featured on National Student Leaderboard & Official Distinction Diploma PDF."
        }
      },

      // 6. COMPLEX MODULE: SEQUENCES & SERIES SPECIALIST
      {
        id: "badge-mod-seq",
        title: "Sequences & Series Specialist",
        category: "Complex Modules",
        subject: "Algebra",
        description: "Completed 4 complex modules in Arithmetic, Geometric, and Sigma Notation $S_\\infty$ convergence proofs.",
        howToUnlock: "Complete at least 4 complex modules in Algebra & Sequences.",
        iconType: "homework_hero",
        rarity: "Rare",
        xpReward: 300,
        unlocked: algebraCompletedCount >= 4,
        currentValue: Math.min(4, algebraCompletedCount),
        targetValue: 4,
        unit: "modules",
        unlockedDate: algebraCompletedCount >= 4 ? "2026-07-22" : undefined,
        visualReward: {
          title: "Sequences Specialist",
          avatarFrame: "Gold Sigma Ring",
          frameStyle: "border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
          perkDescription: "Unlocks Quadratic & Geometric Sequence Auto-Formula Solver."
        }
      },

      // 7. COMPLEX MODULE: EUCLIDEAN THEOREM TACTICIAN
      {
        id: "badge-mod-euc",
        title: "Euclidean Theorem Tactician",
        category: "Complex Modules",
        subject: "Geometry",
        description: "Completed 4 complex modules in Circle Theorems and Proportionality Ratio proofs.",
        howToUnlock: "Complete at least 4 complex modules in Geometry.",
        iconType: "shield",
        rarity: "Epic",
        xpReward: 350,
        unlocked: geometryCompletedCount >= 4,
        currentValue: Math.min(4, geometryCompletedCount),
        targetValue: 4,
        unit: "modules",
        unlockedDate: geometryCompletedCount >= 4 ? "2026-07-28" : undefined,
        visualReward: {
          title: "Euclidean Tactician",
          avatarFrame: "Sapphire Circle Shield",
          frameStyle: "border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]",
          perkDescription: "Unlocks Step-by-Step Geometry Proof Worksheet Generator."
        }
      },

      // 8. COMPLEX MODULE: TRIGONOMETRIC EQUATIONS MASTER
      {
        id: "badge-mod-trig",
        title: "Trigonometric Equations Master",
        category: "Complex Modules",
        subject: "Trigonometry",
        description: "Completed 4 complex modules in Double-Angle Identities and General Solutions $2\\theta = 180^\\circ \\pm \\alpha$.",
        howToUnlock: "Complete at least 4 complex modules in Trigonometry.",
        iconType: "formula_maestro",
        rarity: "Epic",
        xpReward: 350,
        unlocked: trigCompletedCount >= 4,
        currentValue: Math.min(4, trigCompletedCount),
        targetValue: 4,
        unit: "modules",
        unlockedDate: trigCompletedCount >= 4 ? "2026-07-25" : undefined,
        visualReward: {
          title: "Trig Equations Master",
          avatarFrame: "Amethyst Identity Ring",
          frameStyle: "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)]",
          perkDescription: "Unlocks Reduction Identity Practice Cards Deck."
        }
      },

      // 9. COMPLEX MODULE: DIFFERENTIAL CALCULUS SPECIALIST
      {
        id: "badge-mod-calc",
        title: "Differential Calculus Specialist",
        category: "Complex Modules",
        subject: "Calculus",
        description: "Completed 4 complex modules in First Principles Derivatives and Max/Min Optimization.",
        howToUnlock: "Complete at least 4 complex modules in Calculus.",
        iconType: "calculus_master",
        rarity: "Legendary",
        xpReward: 400,
        unlocked: calculusCompletedCount >= 4,
        currentValue: Math.min(4, calculusCompletedCount),
        targetValue: 4,
        unit: "modules",
        unlockedDate: calculusCompletedCount >= 4 ? "2026-08-02" : undefined,
        visualReward: {
          title: "Calculus Specialist",
          avatarFrame: "Emerald Tangent Crest",
          frameStyle: "border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.7)]",
          perkDescription: "Unlocks Cubic Graph Turning Point Solver."
        }
      },

      // 10. COMPLEX MODULE: FINANCIAL ANNUITIES WIZARD
      {
        id: "badge-mod-fin",
        title: "Financial Annuities Wizard",
        category: "Complex Modules",
        subject: "Finance & Stats",
        description: "Completed 3 complex modules in Sinking Funds, Deferred Present Value Loans, and Effective Interest Rates.",
        howToUnlock: "Complete at least 3 complex modules in Financial Mathematics.",
        iconType: "goal_crusher",
        rarity: "Rare",
        xpReward: 300,
        unlocked: financeCompletedCount >= 3,
        currentValue: Math.min(3, financeCompletedCount),
        targetValue: 3,
        unit: "modules",
        unlockedDate: financeCompletedCount >= 3 ? "2026-07-24" : undefined,
        visualReward: {
          title: "Financial Maths Wizard",
          avatarFrame: "Ruby Annuity Halo",
          frameStyle: "border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]",
          perkDescription: "Unlocks Compound Amortization Calculator Sandbox."
        }
      },

      // 11. COMPLEX MODULE: STATISTICS & PROBABILITY PRODIGY
      {
        id: "badge-mod-stats",
        title: "Statistics & Probability Prodigy",
        category: "Complex Modules",
        subject: "Finance & Stats",
        description: "Completed 3 complex modules in Cumulative Ogive Curves, Standard Deviation, and Venn Probability rules.",
        howToUnlock: "Complete at least 3 complex modules in Statistics.",
        iconType: "quiz_champion",
        rarity: "Rare",
        xpReward: 300,
        unlocked: statsCompletedCount >= 3,
        currentValue: Math.min(3, statsCompletedCount),
        targetValue: 3,
        unit: "modules",
        unlockedDate: statsCompletedCount >= 3 ? "2026-07-23" : undefined,
        visualReward: {
          title: "Stats Prodigy",
          avatarFrame: "Diamond Ogive Crest",
          frameStyle: "border-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]",
          perkDescription: "Unlocks Ogive & Histogram D3 Chart Visualization."
        }
      },

      // 12. QUIZ STREAK: STREAK SUPERSTAR
      {
        id: "badge-streak-superstar",
        title: "Streak Superstar",
        category: "Quiz Streaks",
        subject: "General",
        description: "Maintained a continuous daily Mathematics Quick Quiz practice streak for 5 consecutive days.",
        howToUnlock: "Maintain an active quiz streak of 5 days or more.",
        iconType: "streak_superstar",
        rarity: "Common",
        xpReward: 200,
        unlocked: quizStreakDays >= 5,
        currentValue: Math.min(5, quizStreakDays),
        targetValue: 5,
        unit: "days",
        unlockedDate: quizStreakDays >= 5 ? "2026-07-24" : undefined,
        visualReward: {
          title: "Streak Superstar",
          avatarFrame: "Flame Aura Ring",
          frameStyle: "border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]",
          perkDescription: "Unlocks Daily Practice Fire Badge Icon."
        }
      }
    ];
  }, [
    userXP,
    algebraCompletedCount,
    geometryCompletedCount,
    trigCompletedCount,
    calculusCompletedCount,
    financeCompletedCount,
    statsCompletedCount,
    quizStreakDays
  ]);

  // Filtered Badges
  const filteredBadges = useMemo(() => {
    return badgeList.filter((b) => {
      const matchCategory = selectedCategory === "All" || b.category === selectedCategory;
      const matchRarity = selectedRarity === "All" || b.rarity === selectedRarity;
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Unlocked" && b.unlocked) ||
        (selectedStatus === "In Progress" && !b.unlocked);
      const matchSearch =
        searchQuery === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchRarity && matchStatus && matchSearch;
    });
  }, [badgeList, selectedCategory, selectedRarity, selectedStatus, searchQuery]);

  const unlockedCount = badgeList.filter((b) => b.unlocked).length;
  const totalBadges = badgeList.length;
  const overallPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Equipped badge details
  const currentEquippedBadge = badgeList.find(b => b.visualReward.title === equippedTitle) || badgeList[0];

  // Printable PDF Certificate Generator
  const downloadCertificatePDF = (badge: BadgeItem) => {
    const studentName = user ? `${user.first_name} ${user.surname}` : "Registered Student";
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Dark Navy Outer Frame
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, 297, 210, "F");

    // Gold Double Border
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.rect(12, 12, 273, 186);

    // Gold Header Accent
    doc.setFillColor(234, 179, 8);
    doc.rect(20, 20, 257, 3, "F");

    // Academy Title
    doc.setTextColor(234, 179, 8);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("AMARIS MATHEMATICS HUB", 148.5, 36, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(203, 213, 225);
    doc.setFont("helvetica", "normal");
    doc.text("CAPS & IEB HIGH SCHOOL MATHEMATICS ACADEMY", 148.5, 44, { align: "center" });

    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(0.5);
    doc.line(60, 48, 237, 48);

    // Certificate Subtitle
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text("OFFICIAL DIPLOMA OF VISUAL REWARD ACHIEVEMENT", 148.5, 58, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(203, 213, 225);
    doc.text("This certificate is proudly awarded to", 148.5, 72, { align: "center" });

    // Student Name
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(studentName.toUpperCase(), 148.5, 86, { align: "center" });

    // Recognition details
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text("For reaching distinction performance threshold and unlocking the visual reward badge:", 148.5, 100, { align: "center" });

    // Badge Title
    doc.setFontSize(22);
    doc.setTextColor(234, 179, 8);
    doc.setFont("helvetica", "bold");
    doc.text(`"${badge.title}" (${badge.rarity} Badge)`, 148.5, 114, { align: "center" });

    // Description
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.setFont("helvetica", "italic");
    const splitDesc = doc.splitTextToSize(badge.description, 210);
    doc.text(splitDesc, 148.5, 126, { align: "center" });

    // Equipped Reward Metadata
    doc.setFontSize(11);
    doc.setTextColor(56, 189, 248);
    doc.setFont("helvetica", "bold");
    doc.text(`Unlocked Avatar Frame: ${badge.visualReward.avatarFrame}  |  Title: "${badge.visualReward.title}"`, 148.5, 145, { align: "center" });

    // Verification ID & Date
    const certId = `AMH-CERT-${badge.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = badge.unlockedDate || new Date().toLocaleDateString("en-ZA");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "mono");
    doc.text(`Verification ID: ${certId}  |  Issue Date: ${dateStr}  |  Curriculum: NSC Grade 10-12 CAPS/IEB`, 148.5, 162, { align: "center" });

    // Signatures Line
    doc.setDrawColor(203, 213, 225);
    doc.line(40, 182, 100, 182);
    doc.line(197, 182, 257, 182);

    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text("Bethuel Moukangwe", 70, 188, { align: "center" });
    doc.text("Head Mathematics Tutor & Founder", 70, 192, { align: "center" });

    doc.text("Amaris Education Board", 227, 188, { align: "center" });
    doc.text("Accredited NSC / IEB Portal", 227, 192, { align: "center" });

    doc.save(`${badge.title.replace(/\s+/g, "_")}_Visual_Reward_Certificate.pdf`);
  };

  // Render Icon helper
  const renderBadgeIcon = (iconType: BadgeItem["iconType"], unlocked: boolean) => {
    const baseClass = `w-8 h-8 ${unlocked ? "text-amber-400" : "text-slate-400 dark:text-slate-600"}`;

    switch (iconType) {
      case "algebra_ace":
        return <Trophy className={`${baseClass} text-amber-400`} />;
      case "geometry_genius":
        return <Crown className={`${baseClass} text-emerald-400`} />;
      case "trig_titan":
        return <Sparkles className={`${baseClass} text-cyan-400`} />;
      case "calculus_master":
        return <Medal className={`${baseClass} text-indigo-400`} />;
      case "crown":
        return <Crown className={`${baseClass} text-amber-300 animate-pulse`} />;
      case "shield":
        return <Shield className={`${baseClass} text-blue-400`} />;
      case "streak_superstar":
        return <Flame className={`${baseClass} text-rose-500`} />;
      case "goal_crusher":
        return <Target className={`${baseClass} text-rose-400`} />;
      case "quiz_champion":
        return <Zap className={`${baseClass} text-amber-300`} />;
      case "homework_hero":
        return <BookOpen className={`${baseClass} text-amber-400`} />;
      case "formula_maestro":
        return <Award className={`${baseClass} text-purple-400`} />;
      default:
        return <Award className={baseClass} />;
    }
  };

  // Rarity styling helper
  const getRarityBadgeStyle = (rarity: BadgeItem["rarity"], unlocked: boolean) => {
    if (!unlocked) return "bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-navy-700";

    switch (rarity) {
      case "Common":
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
      case "Rare":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Epic":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Legendary":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Mythic":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-500" />
              Badge Collection & Visual Rewards
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400">
              XP Thresholds & Complex Modules
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            Student Badge Showcase & Title System
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Reach specific XP milestones or complete complex module series to unlock visual avatar frames, badge titles, and printable certificates.
          </p>
        </div>

        {/* EQUIPPED TITLE BADGE & OVERALL UNLOCKED COUNTER */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          {/* EQUIPPED BADGE BANNER */}
          <div className="bg-gradient-to-r from-navy-900 via-royal-950 to-navy-900 text-white border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 shadow-md">
            <div className="relative p-1 rounded-full bg-amber-500/20 border border-amber-400 shrink-0">
              <User className="w-5 h-5 text-amber-400" />
              <span className="absolute -bottom-1 -right-1 text-[10px]">👑</span>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase font-bold text-amber-400">
                Equipped Title
              </div>
              <div className="text-xs font-black font-display text-white flex items-center gap-1">
                <span>{equippedTitle}</span>
              </div>
            </div>
          </div>

          {/* UNLOCKED BADGE COUNTER */}
          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase font-bold text-slate-400">
                Unlocked Rewards
              </div>
              <div className="text-base font-black font-display text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>
                  <CountUp value={unlockedCount} /> / {totalBadges}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-500">
                  ({overallPercent}%)
                </span>
              </div>
            </div>
          </div>

          <ExportProgressPDF user={user} />
        </div>
      </div>

      {/* TOTAL XP & LEVEL PROGRESS BAR HEADER CARD */}
      <div className="bg-gradient-to-r from-royal-900 via-navy-950 to-royal-900 text-white rounded-2xl p-4 sm:p-5 border border-royal-500/30 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">
              Student XP Threshold Engine
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            Current Total XP: <span className="text-amber-400 font-mono text-xl">{userXP} XP</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Next Major XP Threshold: <strong className="text-amber-300">{userXP < 500 ? "500 XP (Algebra Ace)" : userXP < 1000 ? "1,000 XP (Geometry Guru)" : userXP < 1500 ? "1,500 XP (Trig Titan)" : userXP < 2500 ? "2,500 XP (Calculus Conqueror)" : "5,000 XP (NSC Distinction Legend)"}</strong>
          </p>
        </div>

        <div className="z-10 w-full sm:w-64 space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
            <span>XP Progress</span>
            <span>{userXP} / 5000 XP</span>
          </div>
          <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden border border-navy-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-gold-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((userXP / 5000) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/80 dark:bg-navy-950/60 p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {["All", "XP Thresholds", "Complex Modules", "Subject Aces", "Quiz Streaks"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-amber-500 text-white shadow-xs font-black"
                  : "bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:border-amber-500/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search badge title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Unlocked">Unlocked Rewards</option>
            <option value="In Progress">In Progress</option>
          </select>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold cursor-pointer"
          >
            <option value="All">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
            <option value="Mythic">Mythic</option>
          </select>
        </div>
      </div>

      {/* BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const progressPercent = Math.min(100, Math.round((badge.currentValue / badge.targetValue) * 100));
          const isEquipped = equippedTitle === badge.visualReward.title;

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3 }}
              onClick={() => setActiveModalBadge(badge)}
              className={`p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
                badge.unlocked
                  ? "bg-gradient-to-b from-white to-amber-500/5 dark:from-navy-900 dark:to-amber-500/5 border-amber-500/40 shadow-sm hover:border-amber-500"
                  : "bg-slate-50/50 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800/80 opacity-80 hover:opacity-100"
              }`}
            >
              {/* TOP ROW: ICON & RARITY */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs relative ${
                    badge.unlocked
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-slate-200/50 dark:bg-navy-800 border-slate-300 dark:border-navy-700"
                  }`}
                >
                  {badge.unlocked ? (
                    renderBadgeIcon(badge.iconType, true)
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                  )}

                  {isEquipped && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[8px]" title="Equipped Title">
                      ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border uppercase tracking-wider ${getRarityBadgeStyle(
                      badge.rarity,
                      badge.unlocked
                    )}`}
                  >
                    {badge.rarity}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    +{badge.xpReward} XP
                  </span>
                </div>
              </div>

              {/* MIDDLE: TITLE & DESCRIPTION */}
              <div>
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{badge.title}</span>
                    {badge.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                  {badge.description}
                </p>
              </div>

              {/* VISUAL REWARD BADGE CHIP */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-[10px] font-mono text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {badge.visualReward.avatarFrame}
                </span>
                {badge.unlocked ? (
                  <span className="text-emerald-500 font-bold uppercase">Unlocked</span>
                ) : (
                  <span className="text-slate-400 uppercase">Locked</span>
                )}
              </div>

              {/* BOTTOM: PROGRESS BAR OR UNLOCKED DATE */}
              <div className="pt-2 border-t border-slate-100 dark:border-navy-800/80 text-xs font-mono">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Visual Reward Ready
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEquippedTitle(badge.visualReward.title);
                      }}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all ${
                        isEquipped
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : "bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:border-amber-500"
                      }`}
                    >
                      {isEquipped ? "Equipped" : "Equip Title"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      <span>Progress</span>
                      <span>
                        {badge.currentValue} / {badge.targetValue} {badge.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* XP & COMPLEX MODULE TESTING SANDBOX */}
      <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-wider">
              XP & Complex Module Simulation Sandbox
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Simulate earning XP & module completions to test visual reward unlocks in real time!
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setUserXP(prev => prev + 250)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            +250 XP
          </button>

          <button
            onClick={() => setUserXP(prev => prev + 500)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            +500 XP
          </button>

          <button
            onClick={() => setAlgebraCompletedCount(prev => prev + 1)}
            className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs rounded-xl hover:border-amber-500 transition-all cursor-pointer"
          >
            +1 Algebra Module ({algebraCompletedCount})
          </button>

          <button
            onClick={() => setGeometryCompletedCount(prev => prev + 1)}
            className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs rounded-xl hover:border-amber-500 transition-all cursor-pointer"
          >
            +1 Geometry Module ({geometryCompletedCount})
          </button>

          <button
            onClick={() => setTrigCompletedCount(prev => prev + 1)}
            className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs rounded-xl hover:border-amber-500 transition-all cursor-pointer"
          >
            +1 Trig Module ({trigCompletedCount})
          </button>

          <button
            onClick={() => setCalculusCompletedCount(prev => prev + 1)}
            className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs rounded-xl hover:border-amber-500 transition-all cursor-pointer"
          >
            +1 Calculus Module ({calculusCompletedCount})
          </button>

          <button
            onClick={() => {
              setUserXP(1250);
              setAlgebraCompletedCount(4);
              setGeometryCompletedCount(3);
              setTrigCompletedCount(5);
              setCalculusCompletedCount(2);
            }}
            className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sandbox
          </button>
        </div>
      </div>

      {/* BADGE DETAIL & VISUAL REWARD SHOWCASE MODAL */}
      <AnimatePresence>
        {activeModalBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs ${
                      activeModalBadge.unlocked
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-slate-100 dark:bg-navy-800 border-slate-200 dark:border-navy-700"
                    }`}
                  >
                    {renderBadgeIcon(activeModalBadge.iconType, activeModalBadge.unlocked)}
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getRarityBadgeStyle(
                        activeModalBadge.rarity,
                        activeModalBadge.unlocked
                      )}`}
                    >
                      {activeModalBadge.rarity} Visual Reward
                    </span>
                    <h3 className="text-xl font-black font-display text-slate-900 dark:text-white mt-0.5">
                      {activeModalBadge.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalBadge(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 cursor-pointer text-xs font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              {/* AVATAR FRAME VISUAL REWARD SHOWCASE CARD */}
              <div className="bg-gradient-to-r from-navy-950 via-royal-950 to-navy-950 text-white p-4 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Unlocked Visual Reward Preview
                </div>

                <div className="flex items-center gap-4">
                  <div className={`relative p-2 rounded-full border-2 ${activeModalBadge.visualReward.frameStyle} shrink-0`}>
                    <User className="w-10 h-10 text-slate-300" />
                    {activeModalBadge.unlocked && (
                      <span className="absolute -bottom-1 -right-1 text-xs">👑</span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs font-mono text-slate-400 uppercase font-bold">Reward Title</div>
                    <div className="text-sm font-black text-amber-300 font-display">
                      "{activeModalBadge.visualReward.title}"
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      Frame: {activeModalBadge.visualReward.avatarFrame}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic pt-1 border-t border-navy-800">
                  Perk: {activeModalBadge.visualReward.perkDescription}
                </p>
              </div>

              {/* DESCRIPTION & UNLOCK CRITERIA */}
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800 text-slate-700 dark:text-slate-300">
                  <strong className="block text-slate-900 dark:text-white mb-1">Badge Description:</strong>
                  {activeModalBadge.description}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-amber-800 dark:text-amber-300">
                  <strong className="block text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    How to Unlock:
                  </strong>
                  {activeModalBadge.howToUnlock}
                </div>

                <div className="flex justify-between items-center pt-1 text-xs font-mono">
                  <span className="text-slate-400">XP Bonus:</span>
                  <span className="font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    +{activeModalBadge.xpReward} XP
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-wrap justify-between items-center gap-3 border-t border-slate-100 dark:border-navy-800">
                {activeModalBadge.unlocked ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setEquippedTitle(activeModalBadge.visualReward.title);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        equippedTitle === activeModalBadge.visualReward.title
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {equippedTitle === activeModalBadge.visualReward.title ? "Title Equipped" : "Equip Title"}
                    </button>

                    <button
                      onClick={() => downloadCertificatePDF(activeModalBadge)}
                      className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Certificate PDF
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold italic">
                    🔒 Locked (Earn {activeModalBadge.targetValue - activeModalBadge.currentValue} more {activeModalBadge.unit} to unlock)
                  </p>
                )}

                <button
                  onClick={() => setActiveModalBadge(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs transition-colors cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
