import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Plus,
  Search,
  Filter,
  ChevronRight,
  RefreshCw,
  Award,
  GraduationCap,
  Check,
  RotateCcw,
  Play,
  BarChart3,
  Layers,
  FileText,
  AlertCircle
} from "lucide-react";
import { Profile } from "../types";

export interface SubjectTopic {
  id: string;
  name: string;
  completed: boolean;
  paper: "Paper 1" | "Paper 2" | "Both";
  weightMarks: number;
}

export interface RegisteredSubjectProgress {
  id: string;
  code: string;
  name: string;
  gradeLevel: string;
  curriculum: "NSC CAPS" | "IEB" | "TVET / Upgrade";
  color: string;
  gradientFrom: string;
  gradientTo: string;
  topics: SubjectTopic[];
  targetCompletion: number;
  lastStudied: string;
}

const DEFAULT_REGISTERED_SUBJECTS: RegisteredSubjectProgress[] = [
  {
    id: "sub-g12-caps-math",
    code: "MATH-G12-CAPS",
    name: "Grade 12 CAPS NSC Mathematics",
    gradeLevel: "Grade 12",
    curriculum: "NSC CAPS",
    color: "#3b82f6",
    gradientFrom: "#3b82f6",
    gradientTo: "#1d4ed8",
    targetCompletion: 90,
    lastStudied: "2 hours ago",
    topics: [
      { id: "g12-1", name: "Algebra, Equations & Inequalities", completed: true, paper: "Paper 1", weightMarks: 25 },
      { id: "g12-2", name: "Number Patterns, Sequences & Series", completed: true, paper: "Paper 1", weightMarks: 25 },
      { id: "g12-3", name: "Functions & Inverse Graphs", completed: true, paper: "Paper 1", weightMarks: 35 },
      { id: "g12-4", name: "Financial Mathematics & Annuities", completed: true, paper: "Paper 1", weightMarks: 15 },
      { id: "g12-5", name: "Differential Calculus & Optimization", completed: true, paper: "Paper 1", weightMarks: 35 },
      { id: "g12-6", name: "Probability & Counting Principles", completed: true, paper: "Paper 1", weightMarks: 15 },
      { id: "g12-7", name: "Trigonometric Reduction & Identities", completed: true, paper: "Paper 2", weightMarks: 40 },
      { id: "g12-8", name: "3D Trigonometry Problems", completed: false, paper: "Paper 2", weightMarks: 10 },
      { id: "g12-9", name: "Analytical Geometry & Circles", completed: true, paper: "Paper 2", weightMarks: 40 },
      { id: "g12-10", name: "Euclidean Geometry Theorems & Proofs", completed: false, paper: "Paper 2", weightMarks: 50 },
      { id: "g12-11", name: "Statistics & Bivariate Data", completed: true, paper: "Paper 2", weightMarks: 20 }
    ]
  },
  {
    id: "sub-g11-pure-math",
    code: "MATH-G11-CAPS",
    name: "Grade 11 Pure Mathematics Foundation",
    gradeLevel: "Grade 11",
    curriculum: "NSC CAPS",
    color: "#10b981",
    gradientFrom: "#10b981",
    gradientTo: "#047857",
    targetCompletion: 85,
    lastStudied: "Yesterday",
    topics: [
      { id: "g11-1", name: "Exponents, Surds & Quadratic Equations", completed: true, paper: "Paper 1", weightMarks: 25 },
      { id: "g11-2", name: "Quadratic Number Patterns", completed: true, paper: "Paper 1", weightMarks: 25 },
      { id: "g11-3", name: "Parabola, Hyperbola & Exponential Graphs", completed: true, paper: "Paper 1", weightMarks: 45 },
      { id: "g11-4", name: "Simple & Compound Decay / Growth", completed: true, paper: "Paper 1", weightMarks: 15 },
      { id: "g11-5", name: "Venn Diagrams & Mutually Exclusive Events", completed: true, paper: "Paper 1", weightMarks: 20 },
      { id: "g11-6", name: "Sine, Cosine & Area Rules in 2D", completed: false, paper: "Paper 2", weightMarks: 50 },
      { id: "g11-7", name: "Gradient & Inclination Angle Geometry", completed: true, paper: "Paper 2", weightMarks: 30 },
      { id: "g11-8", name: "Circle Theorems 1 to 7", completed: false, paper: "Paper 2", weightMarks: 50 }
    ]
  },
  {
    id: "sub-ieb-ap-math",
    code: "APMATH-IEB",
    name: "IEB Advanced Programme Mathematics",
    gradeLevel: "Grade 12",
    curriculum: "IEB",
    color: "#8b5cf6",
    gradientFrom: "#8b5cf6",
    gradientTo: "#6d28d9",
    targetCompletion: 80,
    lastStudied: "3 days ago",
    topics: [
      { id: "ap-1", name: "Advanced Calculus & Limits to Infinity", completed: true, paper: "Paper 1", weightMarks: 40 },
      { id: "ap-2", name: "Integration & Area Under Curves", completed: false, paper: "Paper 1", weightMarks: 40 },
      { id: "ap-3", name: "Complex Numbers & Argand Diagrams", completed: true, paper: "Paper 1", weightMarks: 35 },
      { id: "ap-4", name: "Matrix Algebra & Linear Transformations", completed: true, paper: "Both", weightMarks: 35 },
      { id: "ap-5", name: "Financial Mathematics & Continuous Compounding", completed: false, paper: "Paper 1", weightMarks: 25 }
    ]
  },
  {
    id: "sub-g10-foundations",
    code: "MATH-G10-CAPS",
    name: "Grade 10 Mathematics Core Revision",
    gradeLevel: "Grade 10",
    curriculum: "NSC CAPS",
    color: "#f59e0b",
    gradientFrom: "#f59e0b",
    gradientTo: "#b45309",
    targetCompletion: 95,
    lastStudied: "4 days ago",
    topics: [
      { id: "g10-1", name: "Algebraic Expressions & Factoring", completed: true, paper: "Paper 1", weightMarks: 30 },
      { id: "g10-2", name: "Linear & Quadratic Equations", completed: true, paper: "Paper 1", weightMarks: 30 },
      { id: "g10-3", name: "Linear Functions & Parabola Intro", completed: true, paper: "Paper 1", weightMarks: 30 },
      { id: "g10-4", name: "Right-Angled Triangle Trigonometry", completed: true, paper: "Paper 2", weightMarks: 40 },
      { id: "g10-5", name: "Analytical Geometry Basics (Distance & Midpoint)", completed: true, paper: "Paper 2", weightMarks: 30 }
    ]
  }
];

interface LearningProgressProps {
  user?: Profile | null;
  onNavigateTab?: (tab: string) => void;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ user, onNavigateTab }) => {
  const [subjects, setSubjects] = useState<RegisteredSubjectProgress[]>(() => {
    try {
      const saved = localStorage.getItem("amh_registered_subjects_progress");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load saved subjects progress:", e);
    }
    return DEFAULT_REGISTERED_SUBJECTS;
  });

  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>("sub-g12-caps-math");

  // Save to localStorage when subjects update
  const saveSubjects = (newSubjects: RegisteredSubjectProgress[]) => {
    setSubjects(newSubjects);
    try {
      localStorage.setItem("amh_registered_subjects_progress", JSON.stringify(newSubjects));
    } catch (e) {
      console.error("Error saving registered subjects progress:", e);
    }
  };

  const handleToggleTopic = (subjectId: string, topicId: string) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const updatedTopics = sub.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t));
      return {
        ...sub,
        topics: updatedTopics
      };
    });
    saveSubjects(updated);
  };

  const handleResetSubjectProgress = (subjectId: string) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const resetTopics = sub.topics.map((t) => ({ ...t, completed: false }));
      return {
        ...sub,
        topics: resetTopics
      };
    });
    saveSubjects(updated);
  };

  const handleMarkAllTopicsCompleted = (subjectId: string) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const allCompleted = sub.topics.map((t) => ({ ...t, completed: true }));
      return {
        ...sub,
        topics: allCompleted
      };
    });
    saveSubjects(updated);
  };

  // Helper to calculate subject completion percentage
  const getSubjectCompletion = (sub: RegisteredSubjectProgress): number => {
    if (!sub.topics || sub.topics.length === 0) return 0;
    const completedCount = sub.topics.filter((t) => t.completed).length;
    return Math.round((completedCount / sub.topics.length) * 100);
  };

  // Helper to calculate total weighted completion
  const getSubjectWeightedCompletion = (sub: RegisteredSubjectProgress): number => {
    if (!sub.topics || sub.topics.length === 0) return 0;
    const totalWeight = sub.topics.reduce((sum, t) => sum + t.weightMarks, 0);
    const completedWeight = sub.topics.filter((t) => t.completed).reduce((sum, t) => sum + t.weightMarks, 0);
    return Math.round((completedWeight / (totalWeight || 1)) * 100);
  };

  // Filtered list of subjects
  const filteredSubjects = subjects.filter((sub) => {
    if (selectedCurriculum !== "All" && sub.curriculum !== selectedCurriculum) return false;
    if (selectedGrade !== "All" && sub.gradeLevel !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = sub.name.toLowerCase().includes(q);
      const matchCode = sub.code.toLowerCase().includes(q);
      const matchTopic = sub.topics.some((t) => t.name.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchTopic) return false;
    }
    return true;
  });

  // Calculate overall summary stats across registered subjects
  const totalRegistered = subjects.length;
  const overallAvgCompletion = Math.round(
    subjects.reduce((sum, sub) => sum + getSubjectCompletion(sub), 0) / (totalRegistered || 1)
  );
  const totalCompletedTopics = subjects.reduce(
    (sum, sub) => sum + sub.topics.filter((t) => t.completed).length,
    0
  );
  const totalTopicsCount = subjects.reduce((sum, sub) => sum + sub.topics.length, 0);
  const highMasteryCount = subjects.filter((sub) => getSubjectCompletion(sub) >= 80).length;

  return (
    <div
      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-7 shadow-xl transition-all space-y-6 text-left relative overflow-hidden"
      id="learning-progress-circular-component"
    >
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-royal-600/5 dark:bg-royal-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400 border border-royal-500/20 uppercase flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-royal-500 animate-pulse" />
              Registered Subjects Progress
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Circular Progress Visualizer
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-1">
            Learning Progress
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time syllabus completion rates and topic mastery for your registered Mathematics subjects.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SEARCH BOX */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-royal-500 w-36 sm:w-48 font-sans"
            />
          </div>

          {/* CURRICULUM FILTER */}
          <select
            value={selectedCurriculum}
            onChange={(e) => setSelectedCurriculum(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Curriculums</option>
            <option value="NSC CAPS">NSC CAPS</option>
            <option value="IEB">IEB AP Math</option>
          </select>

          {/* GRADE FILTER */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Grades</option>
            <option value="Grade 12">Grade 12</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 10">Grade 10</option>
          </select>
        </div>
      </div>

      {/* TOP SUMMARY STATS GRID INCLUDING OVERALL CIRCULAR GAUGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OVERALL CIRCULAR PROGRESS CARD */}
        <div className="bg-gradient-to-br from-royal-950/40 via-navy-900/60 to-navy-950 border border-royal-500/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="relative shrink-0 w-20 h-20 flex items-center justify-center">
            {/* SVG CIRCULAR PROGRESS BAR */}
            <svg className="w-20 h-20 transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-200 dark:text-navy-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#overallGrad)"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) * (1 - overallAvgCompletion / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="overallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-black font-mono text-white leading-none">
                {overallAvgCompletion}%
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400 mt-0.5">Average</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-black">Overall Completion</span>
            <h4 className="text-sm font-extrabold text-white leading-tight">Mathematics Hub Readiness</h4>
            <p className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {highMasteryCount} of {totalRegistered} High Mastery
            </p>
          </div>
        </div>

        {/* REGISTERED SUBJECTS COUNTER CARD */}
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Registered Subjects</span>
            <BookOpen className="w-4 h-4 text-royal-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
              {totalRegistered} <span className="text-xs font-normal text-slate-400">Courses</span>
            </div>
            <div className="text-[10px] text-royal-600 dark:text-royal-400 font-mono font-bold">
              CAPS & IEB Mathematics
            </div>
          </div>
        </div>

        {/* TOPICS COMPLETED STAT CARD */}
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Syllabus Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
              {totalCompletedTopics} <span className="text-xs font-normal text-slate-400">/ {totalTopicsCount}</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {Math.round((totalCompletedTopics / (totalTopicsCount || 1)) * 100)}% Topics Mastered
            </div>
          </div>
        </div>

        {/* DISTINCTION THRESHOLD STAT CARD */}
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Distinction Readiness</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
              {highMasteryCount} <span className="text-xs font-normal text-slate-400">Subjects</span>
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
              Score Target ≥ 80% Threshold
            </div>
          </div>
        </div>
      </div>

      {/* REGISTERED MATHEMATICS SUBJECTS CARDS WITH CIRCULAR PROGRESS BARS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-royal-500" />
            <span>Registered Mathematics Subjects</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-300 dark:border-navy-800 rounded-2xl space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No subjects match your selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSubjects.map((sub) => {
              const completion = getSubjectCompletion(sub);
              const weightedComp = getSubjectWeightedCompletion(sub);
              const isExpanded = expandedSubjectId === sub.id;
              const completedCount = sub.topics.filter((t) => t.completed).length;
              const totalTopics = sub.topics.length;

              // Radius and Circumference for Circular Bar
              const radius = 36;
              const circumference = 2 * Math.PI * radius;
              const strokeOffset = circumference * (1 - completion / 100);

              const gradientId = `subGrad-${sub.id}`;

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-2xl p-5 transition-all space-y-4 relative overflow-hidden bg-slate-50/70 dark:bg-navy-950/50 ${
                    isExpanded
                      ? "border-royal-400 dark:border-navy-700 shadow-md ring-1 ring-royal-400/20"
                      : "border-slate-200 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                  }`}
                >
                  {/* TOP CARD CONTENT WITH CIRCULAR PROGRESS GAUGE */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-royal-500/10 text-royal-600 dark:text-royal-400 border border-royal-500/20">
                          {sub.code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200/60 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                          {sub.curriculum}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {sub.gradeLevel}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 dark:text-white truncate font-display">
                        {sub.name}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {completedCount}/{totalTopics} Topics Done
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Studied {sub.lastStudied}
                        </span>
                      </div>
                    </div>

                    {/* CIRCULAR PROGRESS BAR COMPONENT */}
                    <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                        {/* Background Ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-slate-200 dark:text-navy-800"
                          fill="transparent"
                        />
                        {/* Foreground Animated Ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          stroke={`url(#${gradientId})`}
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                        <defs>
                          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={sub.gradientFrom} />
                            <stop offset="100%" stopColor={sub.gradientTo} />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-black font-mono text-slate-900 dark:text-white leading-none">
                          {completion}%
                        </span>
                        <span className="text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-400 mt-0.5">
                          Rate
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HORIZONTAL MINI METRIC BAR */}
                  <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">CAPS Exam Weight</span>
                      <p className="font-black text-slate-900 dark:text-white">{weightedComp}% Coverage</p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Target Goal</span>
                      <p className="font-black text-amber-600 dark:text-amber-400">{sub.targetCompletion}% Goal</p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          completion >= 80
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : completion >= 50
                            ? "bg-royal-500/10 text-royal-600 border border-royal-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {completion >= 80 ? "Distinction" : completion >= 50 ? "Proficient" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  {/* ACTION CONTROLS & EXPAND TOPICS TOGGLE */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                      className="text-xs font-bold font-mono text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{isExpanded ? "Hide Syllabus Topics" : `View Syllabus Topics (${completedCount}/${totalTopics})`}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetSubjectProgress(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Reset all topic checks for this subject"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab("resources")}
                          className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <span>Practice</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDABLE SYLLABUS TOPICS CHECKLIST */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-200 dark:border-navy-800/80 pt-4 space-y-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          <span>Sub-topic Syllabus Breakdown:</span>
                          <button
                            onClick={() => handleMarkAllTopicsCompleted(sub.id)}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            Mark All Done
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {sub.topics.map((tp) => (
                            <button
                              key={tp.id}
                              onClick={() => handleToggleTopic(sub.id, tp.id)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                tp.completed
                                  ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-slate-900 dark:text-white"
                                  : "bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                                    tp.completed
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : "border-slate-300 dark:border-navy-700"
                                  }`}
                                >
                                  {tp.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className={`truncate ${tp.completed ? "font-bold line-through opacity-85" : "font-medium"}`}>
                                  {tp.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400">
                                  {tp.paper}
                                </span>
                                <span className="font-bold text-slate-500 dark:text-slate-400">
                                  ~{tp.weightMarks} Marks
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
