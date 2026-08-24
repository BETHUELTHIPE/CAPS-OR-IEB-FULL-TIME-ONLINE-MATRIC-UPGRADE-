import React, { useState, useEffect } from "react";
import { Booking, Profile } from "../types";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { 
  Award, 
  CheckCircle, 
  Clock, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Flame, 
  Sparkles, 
  Compass, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Percent,
  Sliders,
  Target,
  Search,
  Filter,
  Check,
  RotateCcw,
  Zap,
  Star,
  ShieldCheck,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CountUp } from "./CountUp";
import { ExportProgressPDF } from "./ExportProgressPDF";
import { LearningProgressDashboard } from "./LearningProgressDashboard";
import { CourseProgress } from "./CourseProgress";
import { StudentMilestones } from "./StudentMilestones";
import { evaluateCurriculumMilestone } from "../lib/curriculumMilestones";



interface StudentProgressTrackerProps {
  bookings: Booking[];
  user: Profile;
}

interface Subtopic {
  id: string;
  name: string;
  completed: boolean;
}

interface TopicMasteryData {
  id: string;
  title: string;
  paper: "Paper 1" | "Paper 2";
  weight: string;
  difficulty: "Foundational" | "Moderate" | "High Weight" | "Critical Weight";
  subtopics: Subtopic[];
  customMasteryPercent?: number;
}

export const StudentProgressTracker: React.FC<StudentProgressTrackerProps> = ({ bookings, user }) => {
  const [syllabusType, setSyllabusType] = useState<"caps" | "ieb">(() => {
    const gradeLower = (user.grade || "").toLowerCase();
    return gradeLower.includes("ieb") ? "ieb" : "caps";
  });

  const [viewMode, setViewMode] = useState<"bars" | "graph">("bars");
  const [topicFilter, setTopicFilter] = useState<"all" | "paper1" | "paper2" | "distinction" | "focus">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Initial seed structures for CAPS and IEB Mathematics Topics
  const capsTopicSeeds: TopicMasteryData[] = [
    {
      id: "caps_algebra",
      title: "Algebra & Nature of Roots",
      paper: "Paper 1",
      weight: "~25 Marks",
      difficulty: "Foundational",
      subtopics: [
        { id: "ca1", name: "Quadratic Equations & Formula", completed: true },
        { id: "ca2", name: "Inequalities & Interval Notation", completed: true },
        { id: "ca3", name: "Exponents & Surds Rationalization", completed: true },
        { id: "ca4", name: "Nature of Roots & Discriminant (Δ)", completed: false },
        { id: "ca5", name: "Simultaneous Equations", completed: true }
      ]
    },
    {
      id: "caps_patterns",
      title: "Number Patterns, Sequences & Series",
      paper: "Paper 1",
      weight: "~25 Marks",
      difficulty: "Moderate",
      subtopics: [
        { id: "cp1", name: "Arithmetic Sequences & Sum Formula", completed: true },
        { id: "cp2", name: "Geometric Sequences & Series", completed: true },
        { id: "cp3", name: "Sum to Infinity Convergence (|r| < 1)", completed: true },
        { id: "cp4", name: "Quadratic Patterns & 2nd Differences", completed: true },
        { id: "cp5", name: "Sigma Notation (Σ) Calculations", completed: false }
      ]
    },
    {
      id: "caps_functions",
      title: "Functions & Inverse Graphs",
      paper: "Paper 1",
      weight: "~35 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "cf1", name: "Parabola Vertex & Axis Symmetry", completed: true },
        { id: "cf2", name: "Hyperbola Asymptotes (p & q shifts)", completed: true },
        { id: "cf3", name: "Exponential & Logarithmic Graphs", completed: false },
        { id: "cf4", name: "Inverse Functions (f⁻¹) & Reflection y=x", completed: false },
        { id: "cf5", name: "Graph Parameter Transformations", completed: true }
      ]
    },
    {
      id: "caps_finance",
      title: "Financial Mathematics & Annuities",
      paper: "Paper 1",
      weight: "~15 Marks",
      difficulty: "Moderate",
      subtopics: [
        { id: "cm1", name: "Simple & Compound Decay / Growth", completed: true },
        { id: "cm2", name: "Nominal vs Effective Interest Rates", completed: true },
        { id: "cm3", name: "Present Value Annuities (Loans)", completed: false },
        { id: "cm4", name: "Future Value Annuities (Sinking Funds)", completed: false },
        { id: "cm5", name: "Deferred Payments & Balance Outstanding", completed: false }
      ]
    },
    {
      id: "caps_calculus",
      title: "Differential Calculus & Optimization",
      paper: "Paper 1",
      weight: "~35 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "cc1", name: "Limits & Functional Continuity", completed: true },
        { id: "cc2", name: "Derivative from First Principles", completed: true },
        { id: "cc3", name: "Power Rule & Differentiation Laws", completed: true },
        { id: "cc4", name: "Cubic Graphs & Turning Points", completed: true },
        { id: "cc5", name: "Optimization & Rates of Change", completed: false }
      ]
    },
    {
      id: "caps_probability",
      title: "Probability & Counting Principles",
      paper: "Paper 1",
      weight: "~15 Marks",
      difficulty: "Moderate",
      subtopics: [
        { id: "cb1", name: "Venn Diagrams & Set Operations", completed: true },
        { id: "cb2", name: "Contingency Tables & Independence", completed: true },
        { id: "cb3", name: "Fundamental Counting Principle", completed: false },
        { id: "cb4", name: "Permutations & Repetitions", completed: false }
      ]
    },
    {
      id: "caps_analytical",
      title: "Analytical Geometry & Circles",
      paper: "Paper 2",
      weight: "~40 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "cg1", name: "Distance, Midpoint & Gradient Formulas", completed: true },
        { id: "cg2", name: "Inclination Angle (m = tan θ)", completed: true },
        { id: "cg3", name: "Equation of Circle (x-a)²+(y-b)²=r²", completed: true },
        { id: "cg4", name: "Tangent to Circle Proof (m₁ · m₂ = -1)", completed: false },
        { id: "cg5", name: "Intersection of Circles & Loci", completed: false }
      ]
    },
    {
      id: "caps_trig",
      title: "Trigonometry & 3D Proofs",
      paper: "Paper 2",
      weight: "~40 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "ct1", name: "Reduction Formulas & Identities", completed: true },
        { id: "ct2", name: "Double & Compound Angle Expansions", completed: true },
        { id: "ct3", name: "General & Specific Equations", completed: true },
        { id: "ct4", name: "2D Sine, Cosine & Area Rules", completed: true },
        { id: "ct5", name: "3D Spatial Trigonometric Modeling", completed: false }
      ]
    },
    {
      id: "caps_euclidean",
      title: "Euclidean Geometry & Circle Theorems",
      paper: "Paper 2",
      weight: "~50 Marks",
      difficulty: "Critical Weight",
      subtopics: [
        { id: "ce1", name: "Circle Theorems 1-4 (Angles & Chords)", completed: true },
        { id: "ce2", name: "Circle Theorems 5-7 (Cyclic Quads & Tangents)", completed: true },
        { id: "ce3", name: "Proportionality Theorem in Triangles", completed: true },
        { id: "ce4", name: "Equiangular & Similar Triangle Theorems", completed: false },
        { id: "ce5", name: "Deductive Geometric Proof Riders", completed: false }
      ]
    },
    {
      id: "caps_statistics",
      title: "Statistics & Data Handling",
      paper: "Paper 2",
      weight: "~20 Marks",
      difficulty: "Foundational",
      subtopics: [
        { id: "cs1", name: "Ogives & Cumulative Frequency Curves", completed: true },
        { id: "cs2", name: "Box-and-Whisker Plots & 5-Number Summary", completed: true },
        { id: "cs3", name: "Standard Deviation & Variance", completed: true },
        { id: "cs4", name: "Least-Squares Regression Line (y = a + bx)", completed: true },
        { id: "cs5", name: "Outlier Analysis & Correlation (r)", completed: true }
      ]
    }
  ];

  const iebTopicSeeds: TopicMasteryData[] = [
    {
      id: "ieb_algebra",
      title: "Algebra, Polynomials & Complex Numbers",
      paper: "Paper 1",
      weight: "~20 Marks",
      difficulty: "Foundational",
      subtopics: [
        { id: "ia1", name: "Quadratic Equations & Discriminants", completed: true },
        { id: "ia2", name: "Remainder & Factor Theorems", completed: true },
        { id: "ia3", name: "Complex Numbers Fundamentals", completed: true },
        { id: "ia4", name: "Simultaneous Equations", completed: true }
      ]
    },
    {
      id: "ieb_sequences",
      title: "Sequences & Convergence Proofs",
      paper: "Paper 1",
      weight: "~25 Marks",
      difficulty: "Moderate",
      subtopics: [
        { id: "is1", name: "Arithmetic & Geometric Series", completed: true },
        { id: "is2", name: "Sigma Notation & Infinite Series", completed: true },
        { id: "is3", name: "Convergence Rigorous Proofs", completed: false },
        { id: "is4", name: "Hybrid Sequence Problems", completed: true }
      ]
    },
    {
      id: "ieb_modeling",
      title: "Functions & Parametric Modeling",
      paper: "Paper 1",
      weight: "~35 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "im1", name: "Inverse & Logarithmic Models", completed: true },
        { id: "im2", name: "Function Composition & Domain/Range", completed: true },
        { id: "im3", name: "Parameter Graphing", completed: false },
        { id: "im4", name: "Asymptote Analysis", completed: true }
      ]
    },
    {
      id: "ieb_finance",
      title: "Financial Annuities & Loans",
      paper: "Paper 1",
      weight: "~15 Marks",
      difficulty: "Moderate",
      subtopics: [
        { id: "if1", name: "Present & Future Value Annuities", completed: true },
        { id: "if2", name: "Deferred Annuities & Loan Balances", completed: false },
        { id: "if3", name: "Inflation & Sinking Fund Modeling", completed: false }
      ]
    },
    {
      id: "ieb_calculus",
      title: "Calculus, Limits & Optimization",
      paper: "Paper 1",
      weight: "~35 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "ic1", name: "Limits & First Principles", completed: true },
        { id: "ic2", name: "Algebraic Differentiation Laws", completed: true },
        { id: "ic3", name: "Cubic Functions & Turning Points", completed: true },
        { id: "ic4", name: "Rates of Change & Practical Optimization", completed: false }
      ]
    },
    {
      id: "ieb_probability",
      title: "Probability, Permutations & Bayes",
      paper: "Paper 1",
      weight: "~15 Marks",
      difficulty: "Moderate",
      subtopics: [
        { id: "ip1", name: "Venn Diagrams & Probability Trees", completed: true },
        { id: "ip2", name: "Permutations & Combinations (nCr / nPr)", completed: true },
        { id: "ip3", name: "Bayes' Theorem & Conditional Prob", completed: false }
      ]
    },
    {
      id: "ieb_analytical",
      title: "Analytical Geometry & Circle Loci",
      paper: "Paper 2",
      weight: "~40 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "ig1", name: "Distance, Midpoint & Inclination", completed: true },
        { id: "ig2", name: "Equations of Tangents to Circles", completed: true },
        { id: "ig3", name: "Circle Loci & Geometric Intersections", completed: false }
      ]
    },
    {
      id: "ieb_trig",
      title: "Trigonometric Proofs & 3D Modeling",
      paper: "Paper 2",
      weight: "~40 Marks",
      difficulty: "High Weight",
      subtopics: [
        { id: "it1", name: "Compound & Double Angle Identities", completed: true },
        { id: "it2", name: "General Solutions & Equations", completed: true },
        { id: "it3", name: "3D Modeling & Spatial Proofs", completed: false }
      ]
    },
    {
      id: "ieb_geometry",
      title: "Euclidean Geometry & Proportion Proofs",
      paper: "Paper 2",
      weight: "~50 Marks",
      difficulty: "Critical Weight",
      subtopics: [
        { id: "ie1", name: "Circle Theorems 1-7", completed: true },
        { id: "ie2", name: "Proportionality Theorem & Midpoint Proofs", completed: true },
        { id: "ie3", name: "Triangle Similarity Riders & Formal Proofs", completed: false }
      ]
    },
    {
      id: "ieb_statistics",
      title: "Bivariate Statistics & Regression",
      paper: "Paper 2",
      weight: "~20 Marks",
      difficulty: "Foundational",
      subtopics: [
        { id: "is1_stat", name: "Least-Squares Regression Line", completed: true },
        { id: "is2_stat", name: "Correlation Coefficient (r) & Outliers", completed: true },
        { id: "is3_stat", name: "Box Plots & Variance Analysis", completed: true }
      ]
    }
  ];

  // Load and manage Topic Mastery persistent state
  const [topicMasteryData, setTopicMasteryData] = useState<Record<string, TopicMasteryData[]>>(() => {
    const saved = localStorage.getItem("amh_topic_mastery_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      caps: capsTopicSeeds,
      ieb: iebTopicSeeds
    };
  });

  const saveTopicMasteryState = (newState: Record<string, TopicMasteryData[]>) => {
    setTopicMasteryData(newState);
    localStorage.setItem("amh_topic_mastery_v2", JSON.stringify(newState));
  };

  // Sync mastery percentages from backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchBackendMastery() {
      try {
        const res = await fetch("/api/mastery");
        if (res.ok) {
          const data = await res.json();
          if (data.topics && Array.isArray(data.topics) && isMounted) {
            const apiMap = new Map<string, number>();
            data.topics.forEach((t: { id: string; label: string; mastery: number }) => {
              apiMap.set(t.id, t.mastery);
              apiMap.set(t.label.toLowerCase(), t.mastery);
            });

            // Update seeds if user hasn't explicitly set local custom overrides
            const saved = localStorage.getItem("amh_topic_mastery_v2");
            if (!saved) {
              setTopicMasteryData(prev => {
                const updatedCaps = prev.caps.map(topic => {
                  const apiMastery = apiMap.get(topic.id) ?? apiMap.get(topic.title.toLowerCase());
                  if (typeof apiMastery === "number") {
                    return { ...topic, customMasteryPercent: apiMastery };
                  }
                  return topic;
                });
                const updatedIeb = prev.ieb.map(topic => {
                  const apiMastery = apiMap.get(topic.id) ?? apiMap.get(topic.title.toLowerCase());
                  if (typeof apiMastery === "number") {
                    return { ...topic, customMasteryPercent: apiMastery };
                  }
                  return topic;
                });
                return { caps: updatedCaps, ieb: updatedIeb };
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/mastery in StudentProgressTracker:", err);
      }
    }
    fetchBackendMastery();
    return () => { isMounted = false; };
  }, []);

  const currentTopicsList = topicMasteryData[syllabusType] || (syllabusType === "ieb" ? iebTopicSeeds : capsTopicSeeds);

  // Helper to calculate mastery percentage for a topic
  const getTopicMasteryPercent = (topic: TopicMasteryData) => {
    if (typeof topic.customMasteryPercent === "number") {
      return Math.min(100, Math.max(0, topic.customMasteryPercent));
    }
    if (!topic.subtopics || topic.subtopics.length === 0) return 0;
    const completedCount = topic.subtopics.filter(s => s.completed).length;
    return Math.round((completedCount / topic.subtopics.length) * 100);
  };

  // Toggle subtopic completion
  const handleToggleSubtopic = (topicId: string, subtopicId: string) => {
    let updatedTitle = "";
    let updatedPercent = 0;

    const updatedList = currentTopicsList.map((t) => {
      if (t.id !== topicId) return t;
      const updatedSubtopics = t.subtopics.map(s => s.id === subtopicId ? { ...s, completed: !s.completed } : s);
      // Remove manual override when clicking individual subtopics so percentage reflects exact checkmarks
      const { customMasteryPercent, ...rest } = t;
      const doneCount = updatedSubtopics.filter(s => s.completed).length;
      updatedPercent = Math.round((doneCount / (updatedSubtopics.length || 1)) * 100);
      updatedTitle = t.title;

      return {
        ...rest,
        subtopics: updatedSubtopics
      };
    });

    saveTopicMasteryState({
      ...topicMasteryData,
      [syllabusType]: updatedList
    });

    if (updatedTitle) {
      evaluateCurriculumMilestone(updatedTitle, updatedPercent, `${syllabusType.toUpperCase()} Mathematics`);
    }
  };

  // Set topic mastery percentage via slider or direct input
  const handleSetCustomMastery = (topicId: string, percent: number) => {
    let updatedTitle = "";

    const updatedList = currentTopicsList.map((t) => {
      if (t.id !== topicId) return t;
      // Also update subtopic completed states to match percentage roughly
      const subLength = t.subtopics.length;
      const targetCount = Math.round((percent / 100) * subLength);
      const updatedSubtopics = t.subtopics.map((s, idx) => ({
        ...s,
        completed: idx < targetCount
      }));

      updatedTitle = t.title;

      return {
        ...t,
        subtopics: updatedSubtopics,
        customMasteryPercent: percent
      };
    });

    saveTopicMasteryState({
      ...topicMasteryData,
      [syllabusType]: updatedList
    });

    if (updatedTitle) {
      evaluateCurriculumMilestone(updatedTitle, percent, `${syllabusType.toUpperCase()} Mathematics`);
    }
  };

  // Reset all topics in current syllabus to default
  const handleResetTopics = () => {
    const defaultList = syllabusType === "ieb" ? iebTopicSeeds : capsTopicSeeds;
    saveTopicMasteryState({
      ...topicMasteryData,
      [syllabusType]: defaultList
    });
  };

  // Mark all topics as 100% mastered
  const handleMarkAllTopicsMastered = () => {
    const updatedList = currentTopicsList.map((t) => ({
      ...t,
      subtopics: t.subtopics.map(s => ({ ...s, completed: true })),
      customMasteryPercent: 100
    }));
    saveTopicMasteryState({
      ...topicMasteryData,
      [syllabusType]: updatedList
    });
  };

  // Filter topics based on user selection & search query
  const filteredTopics = currentTopicsList.filter((topic) => {
    const mastery = getTopicMasteryPercent(topic);
    
    // Paper/Category Filter
    if (topicFilter === "paper1" && topic.paper !== "Paper 1") return false;
    if (topicFilter === "paper2" && topic.paper !== "Paper 2") return false;
    if (topicFilter === "distinction" && mastery < 80) return false;
    if (topicFilter === "focus" && mastery >= 60) return false;

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = topic.title.toLowerCase().includes(q);
      const matchSubtopics = topic.subtopics.some(s => s.name.toLowerCase().includes(q));
      const matchPaper = topic.paper.toLowerCase().includes(q);
      return matchTitle || matchSubtopics || matchPaper;
    }

    return true;
  });

  // Calculate overall summary metrics across current topics
  const totalTopicsCount = currentTopicsList.length;
  const overallMasterySum = currentTopicsList.reduce((sum, t) => sum + getTopicMasteryPercent(t), 0);
  const overallAverageMastery = totalTopicsCount > 0 ? Math.round(overallMasterySum / totalTopicsCount) : 0;

  const paper1Topics = currentTopicsList.filter(t => t.paper === "Paper 1");
  const paper1Average = paper1Topics.length > 0 
    ? Math.round(paper1Topics.reduce((s, t) => s + getTopicMasteryPercent(t), 0) / paper1Topics.length) 
    : 0;

  const paper2Topics = currentTopicsList.filter(t => t.paper === "Paper 2");
  const paper2Average = paper2Topics.length > 0 
    ? Math.round(paper2Topics.reduce((s, t) => s + getTopicMasteryPercent(t), 0) / paper2Topics.length) 
    : 0;

  const distinctionReadyCount = currentTopicsList.filter(t => getTopicMasteryPercent(t) >= 80).length;
  const needsFocusCount = currentTopicsList.filter(t => getTopicMasteryPercent(t) < 60).length;

  // Completed Whiteboard lessons calculation
  const completedLessons = bookings.filter(b => b.status === "completed");
  const completedCount = completedLessons.length;
  
  // Lesson Milestones Configuration
  const lessonMilestones = [
    { count: 1, label: "First Victory", reward: "Launch Badge", desc: "First whiteboard completed!" },
    { count: 5, label: "Calculus Scholar", reward: "Silver Scholar", desc: "5 lessons completed. Solidifying theory!" },
    { count: 10, label: "Trig Specialist", reward: "Gold Specialist", desc: "10 lessons. Excellent high-yield mastery!" },
    { count: 15, label: "Distinction Master", reward: "Elite Distinction", desc: "15+ lessons. Primed for distinction performance!" }
  ];

  // Dynamic status based on lessons completed
  const getActiveLevel = (count: number) => {
    if (count >= 15) return { name: "Distinction Master", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    if (count >= 10) return { name: "Trig Specialist", color: "text-royal-500 bg-royal-500/10 border-royal-500/20" };
    if (count >= 5) return { name: "Calculus Scholar", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    if (count >= 1) return { name: "Active Novice", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
    return { name: "Curriculum Initiate", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" };
  };

  const activeLevel = getActiveLevel(completedCount);
  const nextMilestone = lessonMilestones.find(m => completedCount < m.count) || lessonMilestones[lessonMilestones.length - 1];
  const previousMilestoneCount = lessonMilestones.reduce((acc, m) => (completedCount >= m.count ? m.count : acc), 0);
  const milestoneRange = nextMilestone.count - previousMilestoneCount;
  const progressInCurrentMilestone = completedCount - previousMilestoneCount;
  
  const lessonsProgressPercent = completedCount >= 15 
    ? 100 
    : Math.min(100, Math.round((progressInCurrentMilestone / milestoneRange) * 100));

  // Current date anchor for exams calculation
  const currentDate = new Date("2026-07-21T08:00:00-07:00");

  const examMilestonesData = {
    caps: [
      { id: "m1", title: "Half-Year Baseline Mock Exams", date: "2026-06-15", description: "Assess fundamental Paper 1 Algebra & Paper 2 Statistics concepts.", status: "completed", weight: "Syllabus Baseline" },
      { id: "m2", title: "Preparatory trials revision series", date: "2026-08-15", description: "Intense whiteboard review of Functions and 3D Trigonometry.", status: "current", weight: "Intense Revision" },
      { id: "m3", title: "Trial examinations papers", date: "2026-09-01", description: "Official 3-hour trial run under rigorous exam conditions.", status: "upcoming", weight: "Practice Trials" },
      { id: "m4", title: "NSC Final examination Paper 1", date: "2026-10-26", description: "Algebra, Calculus, Sequences, Series & Probability focus (150 Marks).", status: "upcoming", weight: "Paper 1 Finals" },
      { id: "m5", title: "NSC Final examination Paper 2", date: "2026-11-02", description: "Trigonometry, Analytical Geometry & Circle Theorems focus (150 Marks).", status: "upcoming", weight: "Paper 2 Finals" }
    ],
    ieb: [
      { id: "m1", title: "Syllabus audit & diagnostic check", date: "2026-06-15", description: "Audit Logarithms and compound interest fundamentals.", status: "completed", weight: "Syllabus Baseline" },
      { id: "m2", title: "Winter school distinction boot camp", date: "2026-08-10", description: "Conquering limits, optimization modeling & 3D trigonometry.", status: "current", weight: "Distinction Boot Camp" },
      { id: "m3", title: "IEB Trial examinations portfolio", date: "2026-09-01", description: "A comprehensive assessment of all Grade 12 core curriculum modules.", status: "upcoming", weight: "IEB Trials" },
      { id: "m4", title: "IEB Final Mathematics Paper 1", date: "2026-10-21", description: "Algebraic equations, functions and derivative optimization (150 Marks).", status: "upcoming", weight: "Paper 1 Finals" },
      { id: "m5", title: "IEB Final Mathematics Paper 2", date: "2026-11-02", description: "Financial annuities, Coordinate geometry & 3D proofs (150 Marks).", status: "upcoming", weight: "Paper 2 Finals" }
    ]
  };

  const examMilestones = examMilestonesData[syllabusType];

  const getDynamicMilestones = () => {
    return examMilestones.map((m) => {
      const mDate = new Date(m.date);
      let status: "completed" | "current" | "upcoming" = "upcoming";
      if (mDate < currentDate) {
        status = "completed";
      } else {
        const firstUpcoming = examMilestones.find(item => new Date(item.date) >= currentDate);
        if (firstUpcoming && firstUpcoming.id === m.id) {
          status = "current";
        }
      }
      return { ...m, status };
    });
  };

  const processedMilestones = getDynamicMilestones();

  const getTimelineProgressPercent = () => {
    const startDate = new Date("2026-06-01");
    const endDate = new Date("2026-11-02");
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  };

  const timelineProgressPercent = getTimelineProgressPercent();

  const getDaysRemaining = (dateStr: string) => {
    const mDate = new Date(dateStr);
    const diffTime = mDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Color helper for topic mastery percentages
  const getMasteryColorTheme = (percent: number) => {
    if (percent >= 80) {
      return {
        bg: "bg-gradient-to-r from-emerald-500 to-amber-500",
        badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        label: "Distinction Ready 🏆",
        text: "text-emerald-600 dark:text-emerald-400"
      };
    }
    if (percent >= 65) {
      return {
        bg: "bg-gradient-to-r from-royal-600 to-royal-500",
        badgeBg: "bg-royal-500/10 dark:bg-royal-500/20 text-royal-700 dark:text-royal-300 border-royal-500/30",
        label: "Solid Progress 📈",
        text: "text-royal-600 dark:text-royal-400"
      };
    }
    if (percent >= 45) {
      return {
        bg: "bg-gradient-to-r from-amber-500 to-amber-600",
        badgeBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30",
        label: "Developing ⚡",
        text: "text-amber-600 dark:text-amber-400"
      };
    }
    return {
      bg: "bg-gradient-to-r from-red-500 to-red-600",
      badgeBg: "bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
      label: "Needs Focus ⚠️",
      text: "text-red-600 dark:text-red-400"
    };
  };

  return (
    <div 
      id="student-progress-tracker-container"
      className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-sm p-5 sm:p-6 space-y-6 text-left relative overflow-hidden"
    >
      {/* Enrolled Subjects Course Progress Circular Tracker */}
      <CourseProgress user={user} />

      {/* Student Milestones Module Badges Award Section */}
      <StudentMilestones user={user} />

      {/* Interactive D3 Learning Progress Dashboard */}
      <LearningProgressDashboard />

      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
        <TrendingUp className="w-48 h-48 text-royal-500 dark:text-gold-400" />
      </div>

      {/* Header section with title and syllabus selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-850 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-navy-900 dark:text-white uppercase tracking-tight">
              Visual Progress & Mathematics Topics Mastery Index
            </h3>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Monitor real-time mastery percentages across core Paper 1 and Paper 2 South African mathematics domains.
          </p>
        </div>

        {/* Action Controls: Syllabus Selector & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF Button */}
          <ExportProgressPDF user={user} />

          {/* View Mode Toggle */}
          <div className="flex bg-navy-50 dark:bg-navy-950 p-1 rounded-xl border border-navy-100 dark:border-navy-800">
            <button
              id="progress-view-bars"
              onClick={() => setViewMode("bars")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "bars"
                  ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm border border-navy-100 dark:border-navy-800"
                  : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Mastery Index</span>
            </button>

            <button
              id="progress-view-graph"
              onClick={() => setViewMode("graph")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "graph"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                  : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Knowledge Graph (D3)</span>
            </button>
          </div>

          {/* CAPS vs IEB Selector */}
          <div className="flex bg-navy-50 dark:bg-navy-950 p-1 rounded-xl border border-navy-100 dark:border-navy-800">
            <button
              id="progress-syllabus-caps"
              onClick={() => setSyllabusType("caps")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                syllabusType === "caps"
                  ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm border border-navy-100 dark:border-navy-800"
                  : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              NSC / CAPS
            </button>
            <button
              id="progress-syllabus-ieb"
              onClick={() => setSyllabusType("ieb")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                syllabusType === "ieb"
                  ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm border border-navy-100 dark:border-navy-800"
                  : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              IEB
            </button>
          </div>
        </div>
      </div>

      {viewMode === "graph" ? (
        <div className="pt-2">
          <KnowledgeGraph user={user} />
        </div>
      ) : (
        <>

      {/* ========================================================= */}
      /* SECTION 1: MASTER MATHEMATICS TOPICS MASTERY PROGRESS BARS */
      {/* ========================================================= */}
      <div id="mathematics-topics-mastery-section" className="space-y-5">
        
        {/* Overall Curriculum Mastery Overview Banner */}
        <div className="bg-gradient-to-r from-navy-900 via-royal-950 to-navy-900 border border-royal-500/30 rounded-2xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-gold-400 uppercase tracking-widest bg-gold-400/10 px-2.5 py-0.5 rounded border border-gold-400/20 inline-block">
                {syllabusType === "ieb" ? "IEB MATHEMATICS MASTERY INDEX" : "NSC CAPS MATHEMATICS MASTERY INDEX"}
              </span>
              <h4 className="text-xl font-extrabold font-display tracking-tight text-white">
                Overall Mathematics Competency: <span className="text-gold-400 font-black"><CountUp value={overallAverageMastery} suffix="%" /></span>
              </h4>
              <p className="text-xs text-navy-200">
                Calculated across {totalTopicsCount} core examination topics in Paper 1 and Paper 2.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto text-center font-mono">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                <span className="text-[9px] text-white/50 uppercase block">Paper 1 Avg</span>
                <span className="text-base font-extrabold text-royal-400"><CountUp value={paper1Average} suffix="%" /></span>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                <span className="text-[9px] text-white/50 uppercase block">Paper 2 Avg</span>
                <span className="text-base font-extrabold text-amber-400"><CountUp value={paper2Average} suffix="%" /></span>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                <span className="text-[9px] text-emerald-400/80 uppercase block">Distinction Ready</span>
                <span className="text-base font-extrabold text-emerald-400"><CountUp value={distinctionReadyCount} /> / {totalTopicsCount}</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                <span className="text-[9px] text-red-400/80 uppercase block">Needs Focus</span>
                <span className="text-base font-extrabold text-red-400"><CountUp value={needsFocusCount} /> Topics</span>
              </div>
            </div>
          </div>

          {/* Master Visual Progress Bar */}
          <div className="space-y-1.5 relative z-10 pt-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-white/70">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-gold-400" />
                Current Average: <b className="text-white"><CountUp value={overallAverageMastery} suffix="%" /></b>
              </span>
              <span className="flex items-center gap-1 text-gold-400 font-bold">
                <Target className="w-3 h-3" />
                Matric Distinction Benchmark: 80%+
              </span>
            </div>

            <div className="w-full h-3.5 bg-navy-950/80 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
              {/* Goal Marker Line at 80% */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-gold-400 z-20 shadow-[0_0_8px_#eab308]"
                style={{ left: "80%" }}
                title="80% Distinction Goal Target"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallAverageMastery}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-royal-500 via-amber-500 to-emerald-400 rounded-full shadow-inner"
              />
            </div>

            <div className="flex justify-between text-[8px] font-mono text-white/40 pt-0.5">
              <span>0% (Foundation)</span>
              <span>25%</span>
              <span>50% (Pass)</span>
              <span>75% (Merit)</span>
              <span className="text-gold-400 font-bold">80% (Distinction)</span>
              <span>100% (Mastery)</span>
            </div>
          </div>
        </div>

        {/* Search, Filter Tabs & Bulk Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-navy-50/50 dark:bg-navy-950/40 p-3 rounded-xl border border-navy-100 dark:border-navy-850">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setTopicFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                topicFilter === "all"
                  ? "bg-royal-600 text-white shadow-sm"
                  : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              All Topics ({totalTopicsCount})
            </button>
            <button
              onClick={() => setTopicFilter("paper1")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                topicFilter === "paper1"
                  ? "bg-royal-600 text-white shadow-sm"
                  : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              Paper 1 ({paper1Topics.length})
            </button>
            <button
              onClick={() => setTopicFilter("paper2")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                topicFilter === "paper2"
                  ? "bg-royal-600 text-white shadow-sm"
                  : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              Paper 2 ({paper2Topics.length})
            </button>
            <button
              onClick={() => setTopicFilter("distinction")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                topicFilter === "distinction"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-navy-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-navy-800"
              }`}
            >
              Distinction Ready ({distinctionReadyCount})
            </button>
            <button
              onClick={() => setTopicFilter("focus")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                topicFilter === "focus"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white dark:bg-navy-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-navy-800"
              }`}
            >
              Needs Focus ({needsFocusCount})
            </button>
          </div>

          {/* Search Box & Quick Reset */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input 
                type="text"
                placeholder="Search topic or theorem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:border-royal-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={handleMarkAllTopicsMastered}
              title="Mark all topics 100% Mastered"
              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 transition-all cursor-pointer shrink-0 text-xs font-mono font-bold flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">100% Mastered</span>
            </button>

            <button
              onClick={handleResetTopics}
              title="Reset progress to default baseline"
              className="p-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-600 dark:text-navy-300 rounded-lg transition-all cursor-pointer shrink-0 text-xs font-mono font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

        </div>

        {/* INDIVIDUAL TOPIC MASTERY PROGRESS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-navy-50/50 dark:bg-navy-950/20 rounded-2xl border border-dashed border-navy-200 dark:border-navy-800 space-y-2">
              <Search className="w-8 h-8 text-navy-400 mx-auto" />
              <p className="text-xs font-mono font-bold text-navy-600 dark:text-navy-300">
                No mathematics topics match your search or filter criteria.
              </p>
              <button 
                onClick={() => { setTopicFilter("all"); setSearchQuery(""); }}
                className="text-xs font-bold text-royal-600 dark:text-gold-400 underline cursor-pointer"
              >
                Clear filters and view all topics
              </button>
            </div>
          ) : (
            filteredTopics.map((topic, idx) => {
              const percent = getTopicMasteryPercent(topic);
              const theme = getMasteryColorTheme(percent);
              const completedSubCount = topic.subtopics.filter(s => s.completed).length;

              return (
                <motion.div 
                  key={topic.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 sm:p-5 space-y-4 hover:border-royal-500/40 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header line: Title, Paper, Weight, Mastery Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-royal-100/50 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 border border-royal-200/40">
                            {topic.paper}
                          </span>
                          <span className="text-[9px] font-mono text-navy-400 font-bold uppercase">
                            {topic.weight}
                          </span>
                          <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                            topic.difficulty === "Critical Weight"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                              : topic.difficulty === "High Weight"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                : "bg-navy-50 text-navy-500 dark:bg-navy-900 dark:text-navy-400"
                          }`}>
                            {topic.difficulty}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white leading-tight font-display pt-0.5">
                          {topic.title}
                        </h4>
                      </div>

                      {/* Mastery Percentage Pill Badge */}
                      <div className={`px-2.5 py-1 rounded-xl border text-right shrink-0 ${theme.badgeBg}`}>
                        <span className="text-sm font-black font-mono block leading-none"><CountUp value={percent} suffix="%" /></span>
                        <span className="text-[8px] font-mono uppercase block font-bold leading-none pt-0.5">{theme.label}</span>
                      </div>
                    </div>

                    {/* TOPIC MASTERY VISUAL PROGRESS BAR */}
                    <div className="space-y-1.5 bg-navy-50/50 dark:bg-navy-900/40 p-3 rounded-xl border border-navy-100/80 dark:border-navy-850">
                      <div className="flex justify-between items-center text-[10px] font-mono text-navy-500 dark:text-navy-400">
                        <span>Topic Mastery Level</span>
                        <span className="font-bold text-navy-800 dark:text-navy-200">
                          <CountUp value={completedSubCount} /> / {topic.subtopics.length} Subtopics Mastered
                        </span>
                      </div>

                      <div className="w-full h-3 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden p-0.5 border border-navy-200/60 dark:border-navy-750 relative">
                        {/* 80% Distinction Marker Line */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                          style={{ left: "80%" }}
                          title="80% Distinction Threshold"
                        />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${theme.bg}`}
                        />
                      </div>

                      {/* Interactive Slider to Adjust Topic Mastery Percentage Directly */}
                      <div className="pt-2 border-t border-navy-100 dark:border-navy-800 flex items-center gap-3">
                        <Sliders className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                        <span className="text-[9px] font-mono text-navy-400 uppercase shrink-0">Adjust Mastery:</span>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={percent}
                          onChange={(e) => handleSetCustomMastery(topic.id, Number(e.target.value))}
                          className="w-full accent-royal-600 dark:accent-gold-400 h-1.5 bg-navy-100 dark:bg-navy-800 rounded-lg cursor-pointer"
                        />
                        <span className="text-[10px] font-mono font-bold text-royal-600 dark:text-gold-400 shrink-0 w-8 text-right">
                          <CountUp value={percent} suffix="%" />
                        </span>
                      </div>
                    </div>

                    {/* SUBTOPICS CHECKLIST BREAKDOWN */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono font-bold uppercase text-navy-400 block">
                        Core Syllabus Subtopics Checklist:
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {topic.subtopics.map((subtopic) => (
                          <label
                            key={subtopic.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSubtopic(topic.id, subtopic.id);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all select-none ${
                              subtopic.completed
                                ? "bg-emerald-500/5 border-emerald-500/20 text-navy-900 dark:text-white"
                                : "bg-navy-50/30 dark:bg-navy-900/20 border-navy-100 dark:border-navy-850 text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-900"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                              subtopic.completed
                                ? "bg-emerald-500 border-emerald-600 text-white"
                                : "border-navy-300 dark:border-navy-700 bg-white dark:bg-navy-900"
                            }`}>
                              {subtopic.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={`text-[11px] leading-tight ${subtopic.completed ? "font-semibold text-emerald-800 dark:text-emerald-300" : ""}`}>
                              {subtopic.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preset Mastery Buttons Footer */}
                  <div className="flex items-center justify-between border-t border-navy-100 dark:border-navy-850 pt-3 text-[9px] font-mono">
                    <span className="text-navy-400">Presets:</span>
                    <div className="flex gap-1">
                      {[30, 50, 75, 90, 100].map((pVal) => (
                        <button
                          key={pVal}
                          onClick={() => handleSetCustomMastery(topic.id, pVal)}
                          className={`px-1.5 py-0.5 rounded border font-bold transition-all cursor-pointer ${
                            percent === pVal
                              ? "bg-royal-600 text-white border-royal-600"
                              : "bg-navy-50 dark:bg-navy-900 text-navy-600 dark:text-navy-400 border-navy-200 dark:border-navy-800 hover:bg-navy-100 dark:hover:bg-navy-800"
                          }`}
                        >
                          {pVal}%
                        </button>
                      ))}
                    </div>
                  </div>

                </motion.div>
              );
            })
          )}
        </div>

      </div>

      {/* ========================================================= */}
      /* SECTION 2: WHITEBOARD MILESTONES & UPCOMING EXAM TIMELINE */
      {/* ========================================================= */}
      <div className="border-t border-navy-100 dark:border-navy-850 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: Completed Whiteboards Progress */}
          <div id="lessons-progress-panel" className="space-y-5 bg-navy-50/30 dark:bg-navy-950/20 p-4 rounded-xl border border-navy-100 dark:border-navy-850">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-royal-500" />
                <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                  Whiteboard Lesson Milestones
                </h4>
              </div>
              <span className={`text-[10px] font-mono font-black border px-2 py-0.5 rounded ${activeLevel.color}`}>
                {activeLevel.name}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <span className="text-[10px] text-navy-400 uppercase font-mono block">Lessons Completed</span>
                  <span className="text-2xl font-black text-royal-600 dark:text-gold-400 leading-none">
                    <CountUp value={completedCount} /> <span className="text-xs font-normal text-navy-500 dark:text-navy-400">whiteboards</span>
                  </span>
                </div>
                
                {completedCount < 15 ? (
                  <div className="text-right font-mono text-[10px] text-navy-500">
                    Next Milestone: <b className="text-navy-800 dark:text-navy-200">{nextMilestone.label}</b> ({completedCount}/{nextMilestone.count})
                  </div>
                ) : (
                  <div className="text-right font-mono text-[10px] text-amber-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <b>Max Milestone Unlocked!</b>
                  </div>
                )}
              </div>

              {/* Custom Lesson Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden p-0.5 border border-navy-200 dark:border-navy-750">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${lessonsProgressPercent}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-royal-500 via-royal-600 to-gold-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-navy-400">
                  <span>Level progress: <CountUp value={lessonsProgressPercent} suffix="%" /></span>
                  <span>Goal: 15 Whiteboards</span>
                </div>
              </div>
            </div>

            {/* List of Milestones / Badges */}
            <div className="space-y-2 pt-2 border-t border-navy-100 dark:border-navy-850">
              <span className="text-[9px] font-mono font-bold uppercase text-navy-400 block mb-1">Badge achievements ledger</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lessonMilestones.map((milestone) => {
                  const isUnlocked = completedCount >= milestone.count;
                  return (
                    <motion.div 
                      key={milestone.count}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                        isUnlocked 
                          ? "bg-white dark:bg-navy-950 border-emerald-500/30 text-navy-900 dark:text-white"
                          : "bg-navy-50/50 dark:bg-navy-950/5 border-navy-150 dark:border-navy-850 opacity-60"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${isUnlocked ? "bg-emerald-500/10 text-emerald-500" : "bg-navy-100 dark:bg-navy-800 text-navy-400"}`}>
                        {isUnlocked ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold leading-none">{milestone.label}</span>
                          <span className="text-[8px] font-mono text-navy-400">({milestone.count} lessons)</span>
                        </div>
                        <p className="text-[10px] text-navy-500 dark:text-navy-400 font-mono leading-none">{milestone.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Upcoming Exam Milestones */}
          <div id="exams-progress-panel" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-gold-500" />
                <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                  Upcoming Exam Milestones
                </h4>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-navy-500">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Timeline: <b><CountUp value={timelineProgressPercent} suffix="%" /> Elapsed</b></span>
              </div>
            </div>

            {/* Timeline Overall Progress Bar */}
            <div className="space-y-1 bg-navy-50/10 dark:bg-navy-950/10 p-3 rounded-lg border border-navy-100 dark:border-navy-850">
              <div className="w-full h-1.5 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold-500 to-royal-600"
                  style={{ width: `${timelineProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-navy-400">
                <span>June 1 (Prep Start)</span>
                <span>Nov 2 (Exam End)</span>
              </div>
            </div>

            {/* Vertical Milestone Step Timeline */}
            <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
              {processedMilestones.map((milestone, idx) => {
                const daysLeft = getDaysRemaining(milestone.date);
                
                return (
                  <motion.div 
                    key={milestone.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`relative p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      milestone.status === "completed"
                        ? "bg-emerald-50/10 dark:bg-emerald-950/5 border-emerald-500/20"
                        : milestone.status === "current"
                          ? "bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20"
                          : "bg-white dark:bg-navy-950 border-navy-150 dark:border-navy-850"
                    }`}
                  >
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-extrabold ${
                        milestone.status === "completed"
                          ? "bg-emerald-500 text-white"
                          : milestone.status === "current"
                            ? "bg-amber-500 text-navy-950 animate-pulse"
                            : "bg-navy-100 dark:bg-navy-800 text-navy-500 dark:text-navy-400"
                      }`}>
                        {idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 text-left space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-navy-900 dark:text-white leading-tight">
                          {milestone.title}
                        </span>
                        <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          milestone.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : milestone.status === "current"
                              ? "bg-amber-500 text-navy-950 font-bold"
                              : "bg-navy-50 text-navy-500 dark:bg-navy-900 dark:text-navy-400"
                        }`}>
                          {milestone.weight}
                        </span>
                      </div>

                      <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-relaxed font-mono">
                        {milestone.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-navy-100/50 dark:border-navy-850/50 text-[9px] font-mono text-navy-400">
                        <span>Date: <b>{new Date(milestone.date).toLocaleDateString("en-ZA", { dateStyle: "medium" })}</b></span>
                        {milestone.status === "completed" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Passed</span>
                        ) : daysLeft > 0 ? (
                          <span className={milestone.status === "current" ? "text-amber-600 dark:text-amber-400 font-bold" : "text-navy-600 dark:text-navy-300 font-bold"}>
                            <CountUp value={daysLeft} /> days remaining
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold">Today!</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Footer warning helper */}
      <div className="flex items-start gap-2 bg-royal-50/30 dark:bg-navy-950/20 p-3 rounded-xl border border-royal-100/30 dark:border-navy-850 text-left">
        <AlertCircle className="w-4 h-4 text-royal-600 dark:text-gold-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-navy-600 dark:text-navy-400 leading-relaxed">
          <b>Need assistance reaching your goals?</b> Reach out to lead mathematical coach <b>Bethuel Moukangwe</b> or use the <b>Ask Tutor Bethuel</b> AI assistant on your sidebar to clarify exam topics, clear study roadmaps, and book premium whiteboard rooms.
        </p>
      </div>
      </>
      )}

    </div>
  );
};

