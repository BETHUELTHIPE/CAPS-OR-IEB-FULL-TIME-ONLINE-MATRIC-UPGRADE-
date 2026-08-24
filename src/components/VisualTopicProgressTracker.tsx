import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Circle,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  BarChart3,
  Check,
  RotateCcw,
  ShieldCheck,
  Target,
  Award,
  Zap,
  Percent,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Profile } from "../types";
import { CountUp } from "./CountUp";

export interface MathModule {
  id: string;
  title: string;
  description: string;
  weightMarks: number;
  paper: "Paper 1" | "Paper 2";
}

export interface MathTopicProgress {
  id: string;
  name: string;
  category: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Financials" | "Functions" | "Probability";
  paper: "Paper 1" | "Paper 2";
  totalExamWeight: string;
  modules: MathModule[];
}

// CAPS & IEB High School Mathematics Topics & Modules
export const SYLLABUS_TOPICS_DATABASE: MathTopicProgress[] = [
  {
    id: "topic_calculus",
    name: "Differential Calculus & Optimization",
    category: "Calculus",
    paper: "Paper 1",
    totalExamWeight: "~35 Marks",
    modules: [
      { id: "calc_1", title: "Limits & Derivative from First Principles", description: "f'(x) = lim_{h->0} [f(x+h) - f(x)] / h", weightMarks: 5, paper: "Paper 1" },
      { id: "calc_2", title: "Power Rule & Standard Differentiation Rules", description: "d/dx [a x^n] = n a x^{n-1}", weightMarks: 6, paper: "Paper 1" },
      { id: "calc_3", title: "Equations of Tangents to Curves", description: "Finding gradient m = f'(x_1) and straight line equation y - y_1 = m(x - x_1)", weightMarks: 6, paper: "Paper 1" },
      { id: "calc_4", title: "Cubic Polynomials, Sketching & Turning Points", description: "Factor theorem, finding f'(x)=0 stationary points, local min/max & inflection", weightMarks: 10, paper: "Paper 1" },
      { id: "calc_5", title: "Practical Optimization Problems", description: "Minimizing surface area, maximizing volume & distance applications", weightMarks: 8, paper: "Paper 1" }
    ]
  },
  {
    id: "topic_algebra",
    name: "Algebra, Surds & Nature of Roots",
    category: "Algebra",
    paper: "Paper 1",
    totalExamWeight: "~25 Marks",
    modules: [
      { id: "alg_1", title: "Quadratic Equations & Formula", description: "x = [-b ± √(b² - 4ac)] / 2a and factoring polynomial expressions", weightMarks: 6, paper: "Paper 1" },
      { id: "alg_2", title: "Quadratic Inequalities & Number Lines", description: "Solving parabola sign tables and critical values interval notation", weightMarks: 5, paper: "Paper 1" },
      { id: "alg_3", title: "Exponents, Surds & Rationalization", description: "Simplifying exponential laws, surd equations and isolating radicals", weightMarks: 5, paper: "Paper 1" },
      { id: "alg_4", title: "Nature of Roots & Discriminant (Δ)", description: "Analyzing Δ = b² - 4ac for real, non-real, equal, rational or irrational roots", weightMarks: 4, paper: "Paper 1" },
      { id: "alg_5", title: "Simultaneous Equations (Linear & Non-Linear)", description: "Substitution method solving 2-variable system with parabolas & lines", weightMarks: 5, paper: "Paper 1" }
    ]
  },
  {
    id: "topic_trig",
    name: "Trigonometry & Identities",
    category: "Trigonometry",
    paper: "Paper 2",
    totalExamWeight: "~50 Marks",
    modules: [
      { id: "trig_1", title: "Compound & Double Angle Identities", description: "cos(A±B), sin(A±B), sin(2A) and cos(2A) expansion proofs", weightMarks: 10, paper: "Paper 2" },
      { id: "trig_2", title: "Reduction Formulae & Co-functions", description: "180°±θ, 360°±θ, 90°±θ reduction rules in all 4 quadrants", weightMarks: 10, paper: "Paper 2" },
      { id: "trig_3", title: "Trigonometric Equations & General Solutions", description: "Finding reference angles, quadrant solutions and period intervals", weightMarks: 10, paper: "Paper 2" },
      { id: "trig_4", title: "2D & 3D Sine, Cosine & Area Rules", description: "Non-right-angled triangle problem solving in 3D planes", weightMarks: 10, paper: "Paper 2" },
      { id: "trig_5", title: "Trigonometric Graphs & Amplitude Shifts", description: "y = a sin(k x + p) + q transformations, period and asymptotes", weightMarks: 10, paper: "Paper 2" }
    ]
  },
  {
    id: "topic_geometry_analytical",
    name: "Analytical Geometry & Circle Equations",
    category: "Geometry",
    paper: "Paper 2",
    totalExamWeight: "~40 Marks",
    modules: [
      { id: "ag_1", title: "Distance, Gradient & Midpoint Formulae", description: "d = √[(x_2-x_1)² + (y_2-y_1)²], m = Δy/Δx, M((x_1+x_2)/2, (y_1+y_2)/2)", weightMarks: 8, paper: "Paper 2" },
      { id: "ag_2", title: "Inclination Angle of Lines (tan θ = m)", description: "Calculating line inclination angles relative to positive x-axis", weightMarks: 7, paper: "Paper 2" },
      { id: "ag_3", title: "Circle Equations with Center (a,b)", description: "(x - a)² + (y - b)² = r² standard circle equation conversions", weightMarks: 10, paper: "Paper 2" },
      { id: "ag_4", title: "Tangent Lines to Circles", description: "Perpendicular radius property (m_radius × m_tangent = -1)", weightMarks: 8, paper: "Paper 2" },
      { id: "ag_5", title: "Intersection of Circles & Straight Lines", description: "Solving circle and line systems for contact points and chord lengths", weightMarks: 7, paper: "Paper 2" }
    ]
  },
  {
    id: "topic_financials",
    name: "Financial Mathematics & Annuities",
    category: "Financials",
    paper: "Paper 1",
    totalExamWeight: "~15 Marks",
    modules: [
      { id: "fin_1", title: "Simple & Compound Growth / Decay", description: "A = P(1 ± i)^n and straight-line vs reducing-balance depreciation", weightMarks: 3, paper: "Paper 1" },
      { id: "fin_2", title: "Nominal vs Effective Interest Conversion", description: "1 + i_eff = (1 + i^{(m)}/m)^m compounding periods calculation", weightMarks: 3, paper: "Paper 1" },
      { id: "fin_3", title: "Future Value Annuities (F)", description: "F = x [(1 + i)^n - 1] / i investments, savings and sinking funds", weightMarks: 3, paper: "Paper 1" },
      { id: "fin_4", title: "Present Value Loan Amortisation (P)", description: "P = x [1 - (1 + i)^{-n}] / i home bonds, vehicle loans & monthly payments", weightMarks: 3, paper: "Paper 1" },
      { id: "fin_5", title: "Deferred Annuities & Outstanding Balances", description: "Calculating remaining balance after k payments or grace periods", weightMarks: 3, paper: "Paper 1" }
    ]
  },
  {
    id: "topic_functions",
    name: "Functions & Inverse Graphs",
    category: "Functions",
    paper: "Paper 1",
    totalExamWeight: "~35 Marks",
    modules: [
      { id: "fn_1", title: "Parabola Axis of Symmetry & Turning Points", description: "f(x) = a(x - p)² + q, x = -b/2a, axis intercepts", weightMarks: 7, paper: "Paper 1" },
      { id: "fn_2", title: "Hyperbola Asymptotes & Center of Symmetry", description: "f(x) = a/(x - p) + q asymptotes x=p, y=q and symmetry lines y = ±(x - p) + q", weightMarks: 7, paper: "Paper 1" },
      { id: "fn_3", title: "Exponential & Logarithmic Graphs", description: "f(x) = b^x and log_b(x) domain, range, asymptotes and inverse relation", weightMarks: 7, paper: "Paper 1" },
      { id: "fn_4", title: "Inverse Functions f⁻¹(x)", description: "Swapping x and y, reflecting across y = x line, restricting domain for parabolic inverse", weightMarks: 7, paper: "Paper 1" },
      { id: "fn_5", title: "Graph Parameter Transformations", description: "Vertical shifts f(x)+k, horizontal shifts f(x+p), reflections -f(x)", weightMarks: 7, paper: "Paper 1" }
    ]
  },
  {
    id: "topic_euclidean",
    name: "Euclidean Geometry Theorems & Proofs",
    category: "Geometry",
    paper: "Paper 2",
    totalExamWeight: "~50 Marks",
    modules: [
      { id: "euc_1", title: "Circle Theorems 1-4 (Center & Chords)", description: "Perpendicular from center bisects chord; Angle at center = 2× Angle at circumference", weightMarks: 10, paper: "Paper 2" },
      { id: "euc_2", title: "Circle Theorems 5-7 (Cyclic Quads & Tangents)", description: "Opposite angles of cyclic quad supplementary; Tan-chord theorem proofs", weightMarks: 10, paper: "Paper 2" },
      { id: "euc_3", title: "Midpoint Theorem & Ratio Proportionality", description: "Line parallel to one side of triangle divides other two sides proportionally", weightMarks: 10, paper: "Paper 2" },
      { id: "euc_4", title: "Equiangular & Similar Triangles Proofs", description: "Proving triangles similar (AAA) and side ratios a/d = b/e = c/f", weightMarks: 10, paper: "Paper 2" },
      { id: "euc_5", title: "Euclidean Geometry Riders & Problem Solving", description: "Multi-step geometric riders combining multiple theorems and algebra", weightMarks: 10, paper: "Paper 2" }
    ]
  },
  {
    id: "topic_probability",
    name: "Probability & Counting Principles",
    category: "Probability",
    paper: "Paper 1",
    totalExamWeight: "~15 Marks",
    modules: [
      { id: "prob_1", title: "Venn Diagrams & Mutually Exclusive Events", description: "P(A or B) = P(A) + P(B) - P(A and B), complementary probability 1 - P(A)", weightMarks: 3, paper: "Paper 1" },
      { id: "prob_2", title: "Tree Diagrams & Independent Events", description: "P(A and B) = P(A) × P(B) for independent events", weightMarks: 3, paper: "Paper 1" },
      { id: "prob_3", title: "Fundamental Counting Principle", description: "Number of arrangements with n choices, n!", weightMarks: 3, paper: "Paper 1" },
      { id: "prob_4", title: "Permutations with Repetition & Seating", description: "Arranging letters with repeated items or circular arrangements", weightMarks: 3, paper: "Paper 1" },
      { id: "prob_5", title: "Complex Probability Problems", description: "Combining counting principle with probability fractions", weightMarks: 3, paper: "Paper 1" }
    ]
  }
];

interface VisualTopicProgressTrackerProps {
  user: Profile;
  onOpenResourceLibrary?: () => void;
}

export const VisualTopicProgressTracker: React.FC<VisualTopicProgressTrackerProps> = ({
  user,
  onOpenResourceLibrary
}) => {
  // Storage key linked to specific user profile
  const storageKey = `amh_completed_modules_${user.id || user.email || "default"}`;

  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(() => {
    try {
      // First check user profile directly
      if (user.completed_modules && Array.isArray(user.completed_modules) && user.completed_modules.length > 0) {
        return user.completed_modules;
      }
      // Check localStorage
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading completed modules from profile storage:", e);
    }
    // Default seed for new students (e.g., introductory completed modules)
    return ["calc_1", "calc_2", "alg_1", "alg_2", "alg_3", "trig_1", "trig_2", "ag_1", "fin_1", "fn_1", "prob_1"];
  });

  const [activePaperFilter, setActivePaperFilter] = useState<"all" | "paper1" | "paper2">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>("topic_calculus");

  // Save changes to localStorage and update user profile record in amh_profiles
  const saveCompletedModules = (updatedIds: string[]) => {
    setCompletedModuleIds(updatedIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedIds));

      // Sync back to amh_profiles database
      const savedProfiles = localStorage.getItem("amh_profiles");
      if (savedProfiles) {
        const profiles: Profile[] = JSON.parse(savedProfiles);
        const userIdx = profiles.findIndex(p => p.id === user.id || p.email === user.email);
        if (userIdx !== -1) {
          profiles[userIdx].completed_modules = updatedIds;
          localStorage.setItem("amh_profiles", JSON.stringify(profiles));
        }
      }
    } catch (e) {
      console.error("Failed to persist module progress to user database profile:", e);
    }
  };

  // Toggle single module status
  const handleToggleModule = (moduleId: string) => {
    if (completedModuleIds.includes(moduleId)) {
      saveCompletedModules(completedModuleIds.filter(id => id !== moduleId));
    } else {
      saveCompletedModules([...completedModuleIds, moduleId]);
    }
  };

  // Mark entire topic complete or reset
  const handleToggleAllInTopic = (topic: MathTopicProgress) => {
    const topicModuleIds = topic.modules.map(m => m.id);
    const allCompleted = topicModuleIds.every(id => completedModuleIds.includes(id));

    if (allCompleted) {
      // Remove all modules in this topic
      saveCompletedModules(completedModuleIds.filter(id => !topicModuleIds.includes(id)));
    } else {
      // Add all missing modules in this topic
      const combined = Array.from(new Set([...completedModuleIds, ...topicModuleIds]));
      saveCompletedModules(combined);
    }
  };

  // Calculate stats
  const totalSyllabusModules = SYLLABUS_TOPICS_DATABASE.reduce((acc, t) => acc + t.modules.length, 0);
  const totalCompletedCount = completedModuleIds.length;
  const overallCompletionPercent = Math.round((totalCompletedCount / totalSyllabusModules) * 100);

  // Filter topics based on paper filter and search query
  const filteredTopics = SYLLABUS_TOPICS_DATABASE.filter(t => {
    if (activePaperFilter === "paper1" && t.paper !== "Paper 1") return false;
    if (activePaperFilter === "paper2" && t.paper !== "Paper 2") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const matchModule = t.modules.some(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
      return matchTopic || matchModule;
    }

    return true;
  });

  // Calculate badge level
  const getBadgeStatus = (percent: number) => {
    if (percent >= 80) return { label: "Matric Distinction Master", color: "text-amber-400 bg-amber-500/15 border-amber-400/30", icon: Trophy };
    if (percent >= 60) return { label: "Proficient Upgrade Student", color: "text-royal-400 bg-royal-500/15 border-royal-400/30", icon: Award };
    if (percent >= 40) return { label: "Steady Progress", color: "text-emerald-400 bg-emerald-500/15 border-emerald-400/30", icon: ShieldCheck };
    return { label: "Foundation Building", color: "text-navy-300 bg-navy-800 border-navy-700", icon: Target };
  };

  const badge = getBadgeStatus(overallCompletionPercent);
  const BadgeIcon = badge.icon;

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 text-left relative overflow-hidden" id="visual-topic-progress-tracker">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-royal-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-navy-100 dark:border-navy-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-gold-400 bg-gold-400/15 px-3 py-1 rounded-full border border-gold-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Live Profile Database Tracker
            </span>
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${badge.color}`}>
              <BadgeIcon className="w-3.5 h-3.5" />
              {badge.label}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-royal-600 dark:text-gold-400" />
            Curriculum Topic & Module Progress
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-300 max-w-2xl leading-relaxed">
            Track completed CAPS & IEB module units fetched directly from <strong className="text-navy-800 dark:text-white">{user.first_name}'s</strong> profile database. Tick off sub-modules as you master them!
          </p>
        </div>

        {/* Overall Completion Percentage Ring & Counter */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-navy-900 via-royal-950 to-navy-950 text-white p-4 rounded-2xl border border-navy-800 shadow-lg shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" className="text-navy-800" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={163.36}
                strokeDashoffset={163.36 - (163.36 * overallCompletionPercent) / 100}
                strokeLinecap="round"
                className="text-gold-400 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-black font-mono text-gold-400">
              {overallCompletionPercent}%
            </span>
          </div>

          <div className="space-y-1">
            <span className="block text-[10px] font-mono font-bold text-navy-300 uppercase tracking-wider">Syllabus Completion</span>
            <div className="text-sm font-black font-mono text-white flex items-center gap-1">
              <CountUp value={totalCompletedCount} />
              <span className="text-navy-400 font-normal">/ {totalSyllabusModules} Modules</span>
            </div>
            <span className="block text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-saved to Profile DB
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Paper Filter Tabs */}
        <div className="flex bg-navy-50 dark:bg-navy-950 p-1.5 rounded-2xl border border-navy-200 dark:border-navy-800 text-xs font-mono font-bold">
          {(["all", "paper1", "paper2"] as const).map((paper) => (
            <button
              key={paper}
              onClick={() => setActivePaperFilter(paper)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activePaperFilter === paper
                  ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black shadow"
                  : "text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              {paper === "all" ? "All Topics (P1 & P2)" : paper === "paper1" ? "Paper 1 (Algebra/Calculus)" : "Paper 2 (Geometry/Trig)"}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or module..."
            className="w-full pl-9 pr-4 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
      </div>

      {/* Math Topics Cards List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-8 text-center bg-navy-50 dark:bg-navy-950/50 rounded-2xl border border-dashed border-navy-200 dark:border-navy-800 text-navy-500 text-xs font-mono">
            No math topics match your search or filter query.
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const topicModuleIds = topic.modules.map(m => m.id);
            const completedInTopic = topic.modules.filter(m => completedModuleIds.includes(m.id)).length;
            const topicPercent = Math.round((completedInTopic / topic.modules.length) * 100);
            const isFullyCompleted = topicPercent === 100;
            const isExpanded = expandedTopicId === topic.id;

            return (
              <div
                key={topic.id}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isFullyCompleted
                    ? "bg-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/20"
                    : "bg-navy-50/50 dark:bg-navy-950/60 border-navy-200 dark:border-navy-800"
                }`}
              >
                {/* Topic Card Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-royal-500/10 dark:bg-royal-500/20 text-royal-700 dark:text-royal-300 px-2 py-0.5 rounded border border-royal-500/20">
                        {topic.paper}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-navy-400">
                        {topic.totalExamWeight}
                      </span>
                      {isFullyCompleted && (
                        <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Topic Mastered (100%)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-navy-900 dark:text-white flex items-center gap-2">
                      {topic.name}
                    </h3>
                  </div>

                  {/* Progress Stats & Expansion Controls */}
                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end text-xs font-mono font-black">
                        <span className={isFullyCompleted ? "text-emerald-500" : "text-navy-900 dark:text-gold-400"}>
                          {completedInTopic} / {topic.modules.length} Modules
                        </span>
                        <span className="text-navy-400 font-bold">({topicPercent}%)</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-36 bg-navy-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden mt-1 relative">
                        <div
                          style={{ width: `${topicPercent}%` }}
                          className={`h-full transition-all duration-500 rounded-full ${
                            isFullyCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-royal-600 to-gold-400"
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAllInTopic(topic)}
                      className={`text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isFullyCompleted
                          ? "bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200"
                          : "bg-gold-500/10 border-gold-400/30 text-gold-600 dark:text-gold-400 hover:bg-gold-500/20"
                      }`}
                      title={isFullyCompleted ? "Reset Topic" : "Mark All Modules Complete"}
                    >
                      {isFullyCompleted ? "Reset" : "Complete All"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                      className="p-1.5 rounded-xl bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-200 transition-all cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub-modules List (Expandable) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-navy-200/60 dark:border-navy-800/80 bg-white dark:bg-navy-900/90 p-4 sm:p-5 space-y-3"
                    >
                      <span className="block text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider mb-2">
                        Sub-Module Units & Exam Competencies:
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topic.modules.map((mod) => {
                          const isDone = completedModuleIds.includes(mod.id);

                          return (
                            <div
                              key={mod.id}
                              onClick={() => handleToggleModule(mod.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                isDone
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-navy-900 dark:text-white"
                                  : "bg-navy-50/50 dark:bg-navy-950/40 border-navy-200 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                              }`}
                            >
                              <button
                                type="button"
                                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-navy-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-transparent"
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className={`text-xs font-bold ${isDone ? "line-through text-navy-500 dark:text-navy-400" : "text-navy-900 dark:text-white"}`}>
                                    {mod.title}
                                  </h4>
                                  <span className="text-[9px] font-mono font-bold text-navy-400 bg-navy-100 dark:bg-navy-800 px-1.5 py-0.2 rounded">
                                    ~{mod.weightMarks} Marks
                                  </span>
                                </div>
                                <p className="text-[11px] text-navy-500 dark:text-navy-400 font-mono leading-tight">
                                  {mod.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
