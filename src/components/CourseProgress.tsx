import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  TrendingUp,
  BarChart3,
  Layers,
  Search,
  RotateCcw,
  Check,
  Plus,
  Award,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Percent,
  ShieldCheck,
  Circle,
  Zap,
  Filter,
  AlertCircle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Profile } from "../types";

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  paper: "Paper 1" | "Paper 2" | "Both";
  estimatedHours: number;
}

export interface EnrolledSubjectCourse {
  id: string;
  code: string;
  name: string;
  gradeLevel: string;
  curriculum: "NSC CAPS" | "IEB" | "TVET Upgrade";
  category: "Core Mathematics" | "AP Mathematics" | "Technical Math";
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  targetGoalPercent: number;
  lastStudied: string;
  modules: CourseModule[];
}

// Default High School CAPS & IEB Enrolled Mathematics Courses
export const DEFAULT_ENROLLED_COURSES: EnrolledSubjectCourse[] = [
  {
    id: "course-g12-caps-math",
    code: "MATH-G12-CAPS",
    name: "Grade 12 CAPS NSC Mathematics",
    gradeLevel: "Grade 12",
    curriculum: "NSC CAPS",
    category: "Core Mathematics",
    accentColor: "#3b82f6",
    gradientFrom: "#3b82f6",
    gradientTo: "#1d4ed8",
    targetGoalPercent: 85,
    lastStudied: "2 hours ago",
    modules: [
      { id: "mod_g12_1", title: "Differential Calculus & First Principles", description: "Limits, derivative definition f'(x), power rules & gradient equations", paper: "Paper 1", estimatedHours: 8 },
      { id: "mod_g12_2", title: "Cubic Polynomials & Optimization", description: "Factor theorem, turning points, sketching curves & practical min/max problems", paper: "Paper 1", estimatedHours: 10 },
      { id: "mod_g12_3", title: "Algebra, Equations & Nature of Roots", description: "Quadratic formula, inequalities, surds & discriminant Δ = b² - 4ac", paper: "Paper 1", estimatedHours: 6 },
      { id: "mod_g12_4", title: "Number Patterns, Sequences & Series", description: "Arithmetic, geometric & quadratic series summation formulae", paper: "Paper 1", estimatedHours: 7 },
      { id: "mod_g12_5", title: "Functions, Asymptotes & Inverse Graphs", description: "Parabola, hyperbola, exponential graphs & reflection across y = x", paper: "Paper 1", estimatedHours: 9 },
      { id: "mod_g12_6", title: "Financial Mathematics & Annuities", description: "Future & present value amortisation loans, sinking funds & interest conversions", paper: "Paper 1", estimatedHours: 6 },
      { id: "mod_g12_7", title: "Trigonometric Compound & Double Angles", description: "cos(A±B), sin(A±B), tan(A±B) proofs & general solutions", paper: "Paper 2", estimatedHours: 10 },
      { id: "mod_g12_8", title: "2D & 3D Trigonometry Problem Solving", description: "Non-right-angled triangles in multi-planar geometric figures", paper: "Paper 2", estimatedHours: 7 },
      { id: "mod_g12_9", title: "Analytical Geometry & Circle Equations", description: "(x - a)² + (y - b)² = r², tangent lines & inclination angles", paper: "Paper 2", estimatedHours: 9 },
      { id: "mod_g12_10", title: "Euclidean Geometry Circle Theorems", description: "Theorems 1 to 7, tan-chord theorem & cyclic quad proofs", paper: "Paper 2", estimatedHours: 12 },
      { id: "mod_g12_11", title: "Probability & Fundamental Counting Principle", description: "Venn diagrams, tree diagrams, n! permutations & combinations", paper: "Paper 1", estimatedHours: 5 }
    ]
  },
  {
    id: "course-g11-pure-math",
    code: "MATH-G11-CAPS",
    name: "Grade 11 Pure Mathematics Foundation",
    gradeLevel: "Grade 11",
    curriculum: "NSC CAPS",
    category: "Core Mathematics",
    accentColor: "#10b981",
    gradientFrom: "#10b981",
    gradientTo: "#047857",
    targetGoalPercent: 80,
    lastStudied: "Yesterday",
    modules: [
      { id: "mod_g11_1", title: "Exponents, Surds & Exponential Equations", description: "Exponent laws, simplifying radicals & rational exponent equations", paper: "Paper 1", estimatedHours: 6 },
      { id: "mod_g11_2", title: "Quadratic Equations, Inequalities & Systems", description: "Completing the square, sign tables & 2-variable simultaneous equations", paper: "Paper 1", estimatedHours: 7 },
      { id: "mod_g11_3", title: "Quadratic Number Patterns", description: "T_n = a n² + b n + c constant second differences", paper: "Paper 1", estimatedHours: 5 },
      { id: "mod_g11_4", title: "Parabola, Hyperbola & Exponential Functions", description: "Vertical & horizontal shifts, domain, range & line of symmetry equations", paper: "Paper 1", estimatedHours: 8 },
      { id: "mod_g11_5", title: "Sine, Cosine & Area Rules in 2D", description: "a/sin A = b/sin B = c/sin C and Area = ½ a b sin C", paper: "Paper 2", estimatedHours: 8 },
      { id: "mod_g11_6", title: "Analytical Gradient, Distance & Inclination", description: "Distance formula, midpoint, parallel/perpendicular lines & tan θ = m", paper: "Paper 2", estimatedHours: 6 },
      { id: "mod_g11_7", title: "Circle Theorems 1 to 7 Proofs", description: "Perpendicular chord bisector, angle at center, angles in same segment", paper: "Paper 2", estimatedHours: 10 }
    ]
  },
  {
    id: "course-ieb-ap-math",
    code: "APMATH-IEB",
    name: "IEB Advanced Programme Mathematics",
    gradeLevel: "Grade 12",
    curriculum: "IEB",
    category: "AP Mathematics",
    accentColor: "#8b5cf6",
    gradientFrom: "#8b5cf6",
    gradientTo: "#6d28d9",
    targetGoalPercent: 75,
    lastStudied: "3 days ago",
    modules: [
      { id: "mod_ap_1", title: "Advanced Calculus, L'Hôpital's Rule & Infinite Limits", description: "Evaluating 0/0 indeterminate forms & limit proofs", paper: "Paper 1", estimatedHours: 9 },
      { id: "mod_ap_2", title: "Integration Techniques & Area Under Curves", description: "Antiderivatives, substitution method & definite integral areas", paper: "Paper 1", estimatedHours: 11 },
      { id: "mod_ap_3", title: "Complex Numbers & De Moivre's Theorem", description: "z = a + b i, polar form r cis θ, Argand diagrams & roots of unity", paper: "Paper 1", estimatedHours: 8 },
      { id: "mod_ap_4", title: "Matrix Algebra & Linear Systems", description: "Determinants, matrix multiplication & solving 3x3 linear equations", paper: "Both", estimatedHours: 8 },
      { id: "mod_ap_5", title: "Continuous Financial Annuities & Differential Models", description: "Differential equations in continuous growth & financial modeling", paper: "Paper 1", estimatedHours: 7 }
    ]
  },
  {
    id: "course-g10-core-math",
    code: "MATH-G10-CAPS",
    name: "Grade 10 Mathematics Foundations",
    gradeLevel: "Grade 10",
    curriculum: "NSC CAPS",
    category: "Core Mathematics",
    accentColor: "#f59e0b",
    gradientFrom: "#f59e0b",
    gradientTo: "#b45309",
    targetGoalPercent: 90,
    lastStudied: "4 days ago",
    modules: [
      { id: "mod_g10_1", title: "Algebraic Factoring & Expressions", description: "Difference of squares, trinomial factoring & grouping terms", paper: "Paper 1", estimatedHours: 5 },
      { id: "mod_g10_2", title: "Linear & Quadratic Equations", description: "Solving linear equations, literal equations & basic quadratic roots", paper: "Paper 1", estimatedHours: 5 },
      { id: "mod_g10_3", title: "Basic Functions & Straight Line Graphs", description: "y = m x + c, gradient calculations & axis intercepts", paper: "Paper 1", estimatedHours: 6 },
      { id: "mod_g10_4", title: "Right-Angled Triangle Trigonometry", description: "SOH CAH TOA definitions, special angles 30°, 45°, 60°", paper: "Paper 2", estimatedHours: 6 },
      { id: "mod_g10_5", title: "Analytical Geometry Basics", description: "Distance between points & midpoint coordinates in Cartesian plane", paper: "Paper 2", estimatedHours: 5 }
    ]
  }
];

interface CourseProgressProps {
  user?: Profile | null;
  onNavigateTab?: (tab: string) => void;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ user, onNavigateTab }) => {
  // Storage key linked to specific user
  const userId = user?.id || user?.email || "default_student";
  const storageKey = `amh_completed_course_modules_${userId}`;

  // Initial default completed modules seed
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(() => {
    try {
      if (user?.completed_modules && Array.isArray(user.completed_modules) && user.completed_modules.length > 0) {
        return user.completed_modules;
      }
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not parse completed course modules:", e);
    }
    // Default initial completed modules for immediate visual output
    return [
      "mod_g12_1", "mod_g12_3", "mod_g12_4", "mod_g12_7", "mod_g12_9",
      "mod_g11_1", "mod_g11_2", "mod_g11_3", "mod_g11_5",
      "mod_ap_1", "mod_ap_3",
      "mod_g10_1", "mod_g10_2", "mod_g10_3", "mod_g10_4"
    ];
  });

  const [courses, setCourses] = useState<EnrolledSubjectCourse[]>(DEFAULT_ENROLLED_COURSES);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>("course-g12-caps-math");
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState<string | null>(null);

  // Save changes to localStorage and sync profile
  const saveCompletedModules = (updatedIds: string[]) => {
    setCompletedModuleIds(updatedIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedIds));

      // Also persist to amh_profiles
      const profilesStr = localStorage.getItem("amh_profiles");
      if (profilesStr) {
        const profiles: Profile[] = JSON.parse(profilesStr);
        const userIdx = profiles.findIndex((p) => p.id === userId || p.email === user?.email);
        if (userIdx !== -1) {
          profiles[userIdx].completed_modules = updatedIds;
          localStorage.setItem("amh_profiles", JSON.stringify(profiles));
        }
      }
    } catch (e) {
      console.error("Error saving completed modules:", e);
    }
  };

  const handleToggleModule = (moduleId: string) => {
    let updated: string[];
    if (completedModuleIds.includes(moduleId)) {
      updated = completedModuleIds.filter((id) => id !== moduleId);
    } else {
      updated = [...completedModuleIds, moduleId];
    }
    saveCompletedModules(updated);
  };

  const handleMarkAllCourseModules = (course: EnrolledSubjectCourse, complete: boolean) => {
    const courseModuleIds = course.modules.map((m) => m.id);
    let updated: string[];
    if (complete) {
      // Add all missing module ids
      const newIds = courseModuleIds.filter((id) => !completedModuleIds.includes(id));
      updated = [...completedModuleIds, ...newIds];
    } else {
      // Remove all course module ids
      updated = completedModuleIds.filter((id) => !courseModuleIds.includes(id));
    }
    saveCompletedModules(updated);
  };

  // Helper calculation for course completion percentage
  const getCourseProgress = (course: EnrolledSubjectCourse) => {
    if (!course.modules || course.modules.length === 0) return { percent: 0, completedCount: 0, totalCount: 0 };
    const completedCount = course.modules.filter((m) => completedModuleIds.includes(m.id)).length;
    const totalCount = course.modules.length;
    const percent = Math.round((completedCount / totalCount) * 100);
    return { percent, completedCount, totalCount };
  };

  // Filtered courses
  const filteredCourses = courses.filter((course) => {
    if (selectedCurriculum !== "All" && course.curriculum !== selectedCurriculum) return false;
    if (selectedGrade !== "All" && course.gradeLevel !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = course.name.toLowerCase().includes(q);
      const matchCode = course.code.toLowerCase().includes(q);
      const matchModule = course.modules.some((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchModule) return false;
    }
    return true;
  });

  // Overall aggregate completion statistics
  const totalEnrolledCourses = courses.length;
  const totalAllModules = courses.reduce((acc, c) => acc + c.modules.length, 0);
  const totalCompletedAllModules = courses.reduce(
    (acc, c) => acc + c.modules.filter((m) => completedModuleIds.includes(m.id)).length,
    0
  );
  const overallAggregatePercent = Math.round((totalCompletedAllModules / (totalAllModules || 1)) * 100);
  const highDistinctionCoursesCount = courses.filter((c) => getCourseProgress(c).percent >= 80).length;

  return (
    <div
      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-7 shadow-xl transition-all space-y-6 text-left relative overflow-hidden"
      id="course-progress-dashboard-widget"
    >
      {/* BACKGROUND DECORATIVE AMBIENT GLOW */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-royal-600/5 dark:bg-royal-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400 border border-royal-500/20 uppercase flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-royal-500 animate-pulse" />
              Student Academic Cockpit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Circular Progress Tracker
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Course Progress</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-100 dark:bg-navy-800 px-2.5 py-0.5 rounded-full">
              {totalCompletedAllModules} / {totalAllModules} Modules Mastered
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor circular completion indicators for each enrolled subject, calculated dynamically based on completed core modules.
          </p>
        </div>

        {/* CONTROLS & SEARCH */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search course or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-royal-500 w-36 sm:w-48 font-sans"
            />
          </div>

          {/* Curriculum Filter */}
          <select
            value={selectedCurriculum}
            onChange={(e) => setSelectedCurriculum(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Curriculums</option>
            <option value="NSC CAPS">NSC CAPS</option>
            <option value="IEB">IEB AP Math</option>
          </select>

          {/* Grade Filter */}
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

          {/* Enroll Button */}
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-navy-950 text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Subject</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY STATS GRID INCLUDING MAIN AGGREGATE CIRCULAR GAUGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OVERALL AGGREGATE CIRCULAR PROGRESS GAUGE */}
        <div className="bg-gradient-to-br from-royal-950/40 via-navy-900/60 to-navy-950 border border-royal-500/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="relative shrink-0 w-20 h-20 flex items-center justify-center">
            {/* Circular SVG Ring */}
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
                stroke="url(#aggregateCourseGrad)"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) * (1 - overallAggregatePercent / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="aggregateCourseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-black font-mono text-white leading-none">
                {overallAggregatePercent}%
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400 mt-0.5">Average</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-black">Overall Course Status</span>
            <h4 className="text-sm font-extrabold text-white leading-tight">Matric Syllabus Readiness</h4>
            <p className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {highDistinctionCoursesCount} of {totalEnrolledCourses} Distinction Ready
            </p>
          </div>
        </div>

        {/* ENROLLED SUBJECTS STAT CARD */}
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-royal-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
              {totalEnrolledCourses} <span className="text-xs font-normal text-slate-400">Subjects</span>
            </div>
            <div className="text-[10px] text-royal-600 dark:text-royal-400 font-mono font-bold">
              NSC CAPS & IEB Curriculum
            </div>
          </div>
        </div>

        {/* TOTAL MODULES MASTERED STAT CARD */}
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Completed Modules</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
              {totalCompletedAllModules} <span className="text-xs font-normal text-slate-400">/ {totalAllModules}</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {Math.round((totalCompletedAllModules / (totalAllModules || 1)) * 100)}% Modules Checked Off
            </div>
          </div>
        </div>

        {/* DISTINCTION TARGET STAT CARD */}
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Distinction Goal (≥80%)</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
              {highDistinctionCoursesCount} <span className="text-xs font-normal text-slate-400">Courses</span>
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
              Target Level 7 Symbol Mastery
            </div>
          </div>
        </div>
      </div>

      {/* ENROLLED SUBJECTS GRID WITH CIRCULAR PROGRESS BARS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-royal-500" />
            <span>Enrolled Subjects & Circular Module Progress</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing {filteredCourses.length} of {courses.length} courses
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-300 dark:border-navy-800 rounded-2xl space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No enrolled subjects match your selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCourses.map((course) => {
              const { percent, completedCount, totalCount } = getCourseProgress(course);
              const isExpanded = expandedCourseId === course.id;

              // SVG Circle parameters
              const radius = 38;
              const circumference = 2 * Math.PI * radius;
              const strokeOffset = circumference * (1 - percent / 100);
              const gradId = `courseGrad-${course.id}`;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-2xl p-5 transition-all space-y-4 relative overflow-hidden bg-slate-50/70 dark:bg-navy-950/50 ${
                    isExpanded
                      ? "border-royal-400 dark:border-navy-700 shadow-md ring-1 ring-royal-400/20"
                      : "border-slate-200 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                  }`}
                >
                  {/* TOP CARD CONTENT WITH CIRCULAR PROGRESS BAR */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-royal-500/10 text-royal-600 dark:text-royal-400 border border-royal-500/20">
                          {course.code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200/60 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                          {course.curriculum}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {course.gradeLevel}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 dark:text-white truncate font-display">
                        {course.name}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {completedCount}/{totalCount} Modules Done
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Studied {course.lastStudied}
                        </span>
                      </div>
                    </div>

                    {/* CIRCULAR PROGRESS BAR SVG COMPONENT */}
                    <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                        {/* Background Track Ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-slate-200 dark:text-navy-800"
                          fill="transparent"
                        />
                        {/* Animated Progress Ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          stroke={`url(#${gradId})`}
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                        <defs>
                          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={course.gradientFrom} />
                            <stop offset="100%" stopColor={course.gradientTo} />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-black font-mono text-slate-900 dark:text-white leading-none">
                          {percent}%
                        </span>
                        <span className="text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-400 mt-0.5">
                          Progress
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HORIZONTAL METRIC BAR */}
                  <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Category</span>
                      <p className="font-black text-slate-900 dark:text-white">{course.category}</p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Target Goal</span>
                      <p className="font-black text-amber-600 dark:text-amber-400">{course.targetGoalPercent}% Target</p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          percent >= 80
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : percent >= 50
                            ? "bg-royal-500/10 text-royal-600 border border-royal-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {percent >= 80 ? "Level 7 (Distinction)" : percent >= 50 ? "On Track" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  {/* EXPAND MODULES TOGGLE & ACTIONS */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className="text-xs font-bold font-mono text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{isExpanded ? "Hide Course Modules" : `View Enrolled Modules (${completedCount}/${totalCount})`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkAllCourseModules(course, false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Reset module checkmarks for this course"
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

                  {/* EXPANDABLE MODULES CHECKLIST */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-200 dark:border-navy-800/80 pt-4 space-y-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          <span>Course Modules Checklist:</span>
                          <button
                            onClick={() => handleMarkAllCourseModules(course, true)}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            Mark All Completed
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                          {course.modules.map((mod) => {
                            const isDone = completedModuleIds.includes(mod.id);
                            return (
                              <button
                                key={mod.id}
                                onClick={() => handleToggleModule(mod.id)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                  isDone
                                    ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-slate-900 dark:text-white"
                                    : "bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                      isDone
                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                                        : "border-slate-300 dark:border-navy-700"
                                    }`}
                                  >
                                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <div className="min-w-0">
                                    <div className={`truncate ${isDone ? "font-bold text-slate-900 dark:text-white line-through opacity-85" : "font-semibold text-slate-800 dark:text-slate-200"}`}>
                                      {mod.title}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                      {mod.description}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400">
                                    {mod.paper}
                                  </span>
                                  <span className="font-bold text-slate-400">
                                    ~{mod.estimatedHours}h
                                  </span>
                                </div>
                              </button>
                            );
                          })}
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

      {/* ENROLL SUBJECT MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 shadow-2xl space-y-4 text-left relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gold-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">Enroll New Subject Course</h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Select additional CAPS or IEB Mathematics subjects to add to your student dashboard cockpit:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setEnrollSuccessMsg("Successfully enrolled in CAPS Grade 12 Paper 1 Intensive Course!");
                  setTimeout(() => {
                    setShowEnrollModal(false);
                    setEnrollSuccessMsg(null);
                  }, 1500);
                }}
                className="w-full p-3 border border-slate-200 dark:border-navy-800 rounded-xl hover:border-royal-500 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">Grade 12 Paper 1 Intensive Algebra & Calculus</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">11 Core Modules • 85 Target Goal</div>
                </div>
                <span className="text-xs font-mono font-bold text-royal-600 dark:text-gold-400">+ Add</span>
              </button>

              <button
                onClick={() => {
                  setEnrollSuccessMsg("Successfully enrolled in CAPS Grade 12 Paper 2 Geometry Masterclass!");
                  setTimeout(() => {
                    setShowEnrollModal(false);
                    setEnrollSuccessMsg(null);
                  }, 1500);
                }}
                className="w-full p-3 border border-slate-200 dark:border-navy-800 rounded-xl hover:border-royal-500 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">Grade 12 Paper 2 Geometry & Trigonometry</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">9 Core Modules • 80 Target Goal</div>
                </div>
                <span className="text-xs font-mono font-bold text-royal-600 dark:text-gold-400">+ Add</span>
              </button>

              <button
                onClick={() => {
                  setEnrollSuccessMsg("Successfully enrolled in TVET N3 Technical Mathematics!");
                  setTimeout(() => {
                    setShowEnrollModal(false);
                    setEnrollSuccessMsg(null);
                  }, 1500);
                }}
                className="w-full p-3 border border-slate-200 dark:border-navy-800 rounded-xl hover:border-royal-500 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">TVET N3 Technical Mathematics Upgrade</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">8 Core Modules • 75 Target Goal</div>
                </div>
                <span className="text-xs font-mono font-bold text-royal-600 dark:text-gold-400">+ Add</span>
              </button>
            </div>

            {enrollSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold rounded-xl border border-emerald-500/20 text-center">
                {enrollSuccessMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
