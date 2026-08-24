import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Filter,
  Layers,
  Search,
  ChevronRight,
  BookOpen,
  Award,
  Target,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  HelpCircle,
  BarChart2,
  Zap,
  Check,
  X
} from "lucide-react";
import { Profile } from "../types";

export interface SubTopicMastery {
  id: string;
  name: string;
  paper: "Paper 1" | "Paper 2";
  weightMarks: number;
  masteryScore: number; // 0 - 100
  lastAssessed: string;
  status: "critical" | "attention" | "proficient" | "distinction";
  recommendedAction: string;
}

export interface MathCategoryMastery {
  categoryId: string;
  categoryName: string;
  iconName: string;
  subtopics: SubTopicMastery[];
}

const DEFAULT_HEATMAP_DATA: MathCategoryMastery[] = [
  {
    categoryId: "algebra",
    categoryName: "Algebra & Equations",
    iconName: "Calculator",
    subtopics: [
      { id: "alg-1", name: "Quadratic Equations & Inequalities", paper: "Paper 1", weightMarks: 10, masteryScore: 88, lastAssessed: "2 days ago", status: "distinction", recommendedAction: "Practice non-standard interval inequalities" },
      { id: "alg-2", name: "Nature of Roots & Discriminant (Δ)", paper: "Paper 1", weightMarks: 8, masteryScore: 52, lastAssessed: "Yesterday", status: "attention", recommendedAction: "Review conditions for imaginary & real roots" },
      { id: "alg-3", name: "Simultaneous Equations (Linear/Quadratic)", paper: "Paper 1", weightMarks: 7, masteryScore: 94, lastAssessed: "4 days ago", status: "distinction", recommendedAction: "Maintain speed on algebraic substitution" }
    ]
  },
  {
    categoryId: "functions",
    categoryName: "Functions & Inverses",
    iconName: "TrendingUp",
    subtopics: [
      { id: "func-1", name: "Parabola & Hyperbola Asymptotes", paper: "Paper 1", weightMarks: 12, masteryScore: 78, lastAssessed: "3 days ago", status: "proficient", recommendedAction: "Practice finding domain & range restrictions" },
      { id: "func-2", name: "Exponential & Logarithmic Functions", paper: "Paper 1", weightMarks: 10, masteryScore: 42, lastAssessed: "Yesterday", status: "critical", recommendedAction: "Review log laws & axis intercepts conversion" },
      { id: "func-3", name: "Inverse Graphs f⁻¹(x) & Reflections", paper: "Paper 1", weightMarks: 13, masteryScore: 68, lastAssessed: "5 days ago", status: "proficient", recommendedAction: "Practice line y=x symmetry proofs" }
    ]
  },
  {
    categoryId: "calculus",
    categoryName: "Differential Calculus",
    iconName: "Zap",
    subtopics: [
      { id: "calc-1", name: "First Principles Differentiation", paper: "Paper 1", weightMarks: 6, masteryScore: 85, lastAssessed: "1 day ago", status: "distinction", recommendedAction: "Keep limit expansion notation clear" },
      { id: "calc-2", name: "Cubic Functions & Turning Points", paper: "Paper 1", weightMarks: 15, masteryScore: 60, lastAssessed: "3 days ago", status: "attention", recommendedAction: "Practice points of inflection & concavity" },
      { id: "calc-3", name: "Optimization (Max/Min Word Problems)", paper: "Paper 1", weightMarks: 14, masteryScore: 38, lastAssessed: "Yesterday", status: "critical", recommendedAction: "Work through 3D volume & area optimization riders" }
    ]
  },
  {
    categoryId: "trig",
    categoryName: "Trigonometry & Identities",
    iconName: "Layers",
    subtopics: [
      { id: "trig-1", name: "Compound & Double Angle Identities", paper: "Paper 2", weightMarks: 15, masteryScore: 72, lastAssessed: "2 days ago", status: "proficient", recommendedAction: "Practice cos(2A) triple-choice selection" },
      { id: "trig-2", name: "3D Trigonometry & Sine/Cos Rules", paper: "Paper 2", weightMarks: 12, masteryScore: 45, lastAssessed: "Yesterday", status: "critical", recommendedAction: "Review angle of elevation in inclined planes" },
      { id: "trig-3", name: "Trig General Solution Equations", paper: "Paper 2", weightMarks: 13, masteryScore: 82, lastAssessed: "4 days ago", status: "distinction", recommendedAction: "Drill period k·360° reference angles" }
    ]
  },
  {
    categoryId: "geometry",
    categoryName: "Euclidean Geometry Riders",
    iconName: "Award",
    subtopics: [
      { id: "geom-1", name: "Circle Theorems 1 to 7 (Grade 11)", paper: "Paper 2", weightMarks: 20, masteryScore: 75, lastAssessed: "3 days ago", status: "proficient", recommendedAction: "Review Tan-Chord theorem applications" },
      { id: "geom-2", name: "Proportionality & Similar Triangles", paper: "Paper 2", weightMarks: 18, masteryScore: 48, lastAssessed: "Yesterday", status: "critical", recommendedAction: "Drill equiangular triangle ratio proofs" },
      { id: "geom-3", name: "Concyclic Points & Cyclic Quads", paper: "Paper 2", weightMarks: 12, masteryScore: 64, lastAssessed: "6 days ago", status: "attention", recommendedAction: "Practice exterior angle cyclic quad proofs" }
    ]
  },
  {
    categoryId: "analytical",
    categoryName: "Analytical Geometry",
    iconName: "Target",
    subtopics: [
      { id: "ana-1", name: "Equation of Tangents to Circles", paper: "Paper 2", weightMarks: 15, masteryScore: 86, lastAssessed: "2 days ago", status: "distinction", recommendedAction: "Maintain radius ⊥ tangent perpendicular gradient rule" },
      { id: "ana-2", name: "Angle of Inclination (tan θ = m)", paper: "Paper 2", weightMarks: 10, masteryScore: 90, lastAssessed: "5 days ago", status: "distinction", recommendedAction: "Master obtuse angle inclination conversions" },
      { id: "ana-3", name: "Intersection of Circles & Lines", paper: "Paper 2", weightMarks: 15, masteryScore: 58, lastAssessed: "Yesterday", status: "attention", recommendedAction: "Review completing square to find circle center (a,b)" }
    ]
  }
];

interface SubjectMasteryProps {
  user?: Profile | null;
  onNavigateTab?: (tab: string) => void;
}

export const SubjectMastery: React.FC<SubjectMasteryProps> = ({ user, onNavigateTab }) => {
  const [data, setData] = useState<MathCategoryMastery[]>(() => {
    try {
      const saved = localStorage.getItem("amh_subject_mastery_heatmap");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load saved subject mastery heatmap:", e);
    }
    return DEFAULT_HEATMAP_DATA;
  });

  const [paperFilter, setPaperFilter] = useState<"All" | "Paper 1" | "Paper 2">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Needs Attention" | "High Mastery">("All");
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubTopicMastery | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editScoreValue, setEditScoreValue] = useState<number>(75);

  const saveHeatmapData = (newData: MathCategoryMastery[]) => {
    setData(newData);
    try {
      localStorage.setItem("amh_subject_mastery_heatmap", JSON.stringify(newData));
    } catch (e) {
      console.error("Error saving heatmap data:", e);
    }
  };

  // Helper for status determination
  const getStatusFromScore = (score: number): SubTopicMastery["status"] => {
    if (score >= 85) return "distinction";
    if (score >= 70) return "proficient";
    if (score >= 50) return "attention";
    return "critical";
  };

  // Helper for cell color styling
  const getCellBgColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500 text-white dark:bg-emerald-600 shadow-emerald-500/20";
    if (score >= 70) return "bg-royal-500 text-white dark:bg-royal-600 shadow-royal-500/20";
    if (score >= 50) return "bg-amber-450 text-slate-900 bg-amber-400 font-bold dark:bg-amber-500";
    return "bg-rose-500 text-white dark:bg-rose-600 shadow-rose-500/20 animate-pulse";
  };

  const getStatusBadge = (score: number) => {
    if (score >= 85) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Distinction (≥85%)
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400 border border-royal-500/20">
          Proficient (70-84%)
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Needs Attention (50-69%)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        Critical Focus (&lt;50%)
      </span>
    );
  };

  // Handle score update
  const handleUpdateScore = (subtopicId: string, newScore: number) => {
    const updated = data.map((cat) => ({
      ...cat,
      subtopics: cat.subtopics.map((sub) => {
        if (sub.id !== subtopicId) return sub;
        const newStatus = getStatusFromScore(newScore);
        return {
          ...sub,
          masteryScore: newScore,
          status: newStatus,
          lastAssessed: "Just now"
        };
      })
    }));

    saveHeatmapData(updated);
    if (selectedSubtopic && selectedSubtopic.id === subtopicId) {
      setSelectedSubtopic({
        ...selectedSubtopic,
        masteryScore: newScore,
        status: getStatusFromScore(newScore),
        lastAssessed: "Just now"
      });
    }
    setIsEditingScore(false);
  };

  // Extract all subtopics flat list
  const allSubtopics = data.flatMap((c) => c.subtopics);

  // Filter subtopics
  const filterSubtopic = (sub: SubTopicMastery) => {
    if (paperFilter !== "All" && sub.paper !== paperFilter) return false;
    if (statusFilter === "Needs Attention" && sub.masteryScore >= 70) return false;
    if (statusFilter === "High Mastery" && sub.masteryScore < 70) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!sub.name.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  // Find critical weak areas for "Needs Attention" highlight panel
  const criticalSubtopics = allSubtopics
    .filter((s) => s.masteryScore < 65)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  // Stats
  const avgOverallScore = Math.round(
    allSubtopics.reduce((acc, curr) => acc + curr.masteryScore, 0) / (allSubtopics.length || 1)
  );
  const criticalCount = allSubtopics.filter((s) => s.masteryScore < 50).length;
  const distinctionCount = allSubtopics.filter((s) => s.masteryScore >= 85).length;

  return (
    <div
      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 text-left relative overflow-hidden transition-all"
      id="subject-mastery-heatmap-widget"
    >
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 left-1/3 -translate-y-16 w-80 h-80 bg-rose-500/5 dark:bg-rose-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-y-16 translate-x-16 w-80 h-80 bg-royal-500/5 dark:bg-royal-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              Mathematics Topic Diagnostic Matrix
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400">
              Interactive Sub-topic Heatmap
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-1">
            Subject Mastery
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize performance intensity across CAPS & IEB Mathematics sub-topics. Darker reds signal critical focus areas needing immediate revision.
          </p>
        </div>

        {/* CONTROLS & SEARCH */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sub-topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-royal-500 w-36 sm:w-44 font-sans"
            />
          </div>

          {/* PAPER FILTER */}
          <select
            value={paperFilter}
            onChange={(e) => setPaperFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Papers</option>
            <option value="Paper 1">Paper 1 (Algebra/Calculus)</option>
            <option value="Paper 2">Paper 2 (Trig/Geometry)</option>
          </select>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Scores</option>
            <option value="Needs Attention">Weak Areas (&lt;70%)</option>
            <option value="High Mastery">High Mastery (≥70%)</option>
          </select>
        </div>
      </div>

      {/* QUICK SUMMARY METRICS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* OVERALL MASTERY SCORE */}
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Overall Average Mastery</span>
            <div className="text-2xl font-black font-display text-slate-900 dark:text-white mt-0.5">
              {avgOverallScore}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-royal-500/10 flex items-center justify-center text-royal-600 dark:text-royal-400 font-mono font-bold text-base border border-royal-500/20">
            {avgOverallScore >= 80 ? "A" : avgOverallScore >= 70 ? "B" : "C"}
          </div>
        </div>

        {/* CRITICAL ATTENTION NEEDED */}
        <div className="bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400 uppercase font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Critical Attention Areas
            </span>
            <div className="text-2xl font-black font-display text-rose-600 dark:text-rose-400 mt-0.5">
              {criticalCount} <span className="text-xs font-normal text-rose-500">Sub-topics &lt;50%</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold">
            Needs Review
          </div>
        </div>

        {/* DISTINCTION SUBTOPICS */}
        <div className="bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1">
              <Award className="w-3 h-3" />
              Distinction Level (≥85%)
            </span>
            <div className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 mt-0.5">
              {distinctionCount} <span className="text-xs font-normal text-emerald-500">Mastered</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
            Target Met
          </div>
        </div>
      </div>

      {/* HEATMAP COLOR LEGEND */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-100/70 dark:bg-navy-950/80 p-3 rounded-2xl border border-slate-200/70 dark:border-navy-800 text-xs font-mono">
        <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-royal-500" />
          Heatmap Key:
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">&lt;50% Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">50-69% Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-royal-500 inline-block shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">70-84% Proficient</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">≥85% Distinction</span>
          </div>
        </div>
      </div>

      {/* URGENT REVISION FOCUS PANEL (Surfaces Weakest Subtopics) */}
      {criticalSubtopics.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 font-display flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Priority Diagnostic Action Items (Lowest Mastery)</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-rose-500">
              {criticalSubtopics.length} Areas Needing Remediation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalSubtopics.slice(0, 3).map((sub) => (
              <button
                key={`urgent-${sub.id}`}
                onClick={() => setSelectedSubtopic(sub)}
                className="bg-white dark:bg-navy-900 border border-rose-500/30 hover:border-rose-500 rounded-xl p-3 text-left transition-all space-y-1.5 cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    {sub.paper} • {sub.masteryScore}% Score
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {sub.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {sub.recommendedAction}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HEATMAP MATRIX GRID BY CATEGORY */}
      <div className="space-y-6 pt-2">
        {data.map((cat) => {
          const matchingSubtopics = cat.subtopics.filter(filterSubtopic);
          if (matchingSubtopics.length === 0) return null;

          // Calculate average category score
          const catAvg = Math.round(
            cat.subtopics.reduce((sum, s) => sum + s.masteryScore, 0) / (cat.subtopics.length || 1)
          );

          return (
            <div key={cat.categoryId} className="space-y-3">
              {/* CATEGORY HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-royal-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                    {cat.categoryName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Category Avg:</span>
                  <span className="font-bold text-royal-600 dark:text-royal-400">{catAvg}%</span>
                </div>
              </div>

              {/* SUBTOPIC HEATMAP TILES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchingSubtopics.map((sub) => {
                  const isSelected = selectedSubtopic?.id === sub.id;

                  return (
                    <motion.div
                      key={sub.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedSubtopic(sub)}
                      className={`border rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? "ring-2 ring-royal-500 border-royal-500 bg-royal-500/5 dark:bg-royal-950/40 shadow-md"
                          : "bg-slate-50/70 dark:bg-navy-950/50 border-slate-200/80 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200/70 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                              {sub.paper}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ~{sub.weightMarks} Marks
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {sub.name}
                          </h4>
                        </div>

                        {/* HEATMAP INTENSITY INDICATOR BADGE */}
                        <div
                          className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-mono font-black shadow-xs flex flex-col items-center justify-center ${getCellBgColor(
                            sub.masteryScore
                          )}`}
                        >
                          <span>{sub.masteryScore}%</span>
                        </div>
                      </div>

                      {/* MINI PROGRESS TRACK & LAST ASSESSED */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/40 dark:border-navy-800/60">
                        <div className="w-full bg-slate-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              sub.masteryScore >= 85
                                ? "bg-emerald-500"
                                : sub.masteryScore >= 70
                                ? "bg-royal-500"
                                : sub.masteryScore >= 50
                                ? "bg-amber-400"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${sub.masteryScore}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>Assessed: {sub.lastAssessed}</span>
                          <span className="font-bold text-royal-600 dark:text-royal-400 flex items-center gap-0.5">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED SUBTOPIC DETAIL MODAL / INSPECTOR PANEL */}
      <AnimatePresence>
        {selectedSubtopic && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => {
                  setSelectedSubtopic(null);
                  setIsEditingScore(false);
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400 border border-royal-500/20">
                    {selectedSubtopic.paper}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Exam Weight: ~{selectedSubtopic.weightMarks} Marks
                  </span>
                </div>
                <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">
                  {selectedSubtopic.name}
                </h3>
              </div>

              {/* STATUS & SCORE GAUGES */}
              <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Current Diagnostic Score</span>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    {selectedSubtopic.masteryScore}%
                  </div>
                  <div className="mt-1">{getStatusBadge(selectedSubtopic.masteryScore)}</div>
                </div>

                <div className="text-right space-y-2">
                  <button
                    onClick={() => {
                      setEditScoreValue(selectedSubtopic.masteryScore);
                      setIsEditingScore(!isEditingScore);
                    }}
                    className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Log Test Score</span>
                  </button>
                </div>
              </div>

              {/* INLINE SCORE UPDATE CONTROLLER */}
              {isEditingScore && (
                <div className="bg-royal-500/5 dark:bg-royal-950/40 border border-royal-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    <span>Adjust Diagnostic Mastery Rating:</span>
                    <span className="text-royal-600 dark:text-royal-400 text-sm font-black">{editScoreValue}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editScoreValue}
                    onChange={(e) => setEditScoreValue(Number(e.target.value))}
                    className="w-full accent-royal-600 cursor-pointer"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingScore(false)}
                      className="px-3 py-1.5 text-xs font-mono font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateScore(selectedSubtopic.id, editScoreValue)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Score</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RECOMMENDED REVISION ACTION */}
              <div className="space-y-2 border-t border-slate-200 dark:border-navy-800 pt-4">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase">Recommended Action Plan</h4>
                <div className="p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{selectedSubtopic.recommendedAction}</span>
                </div>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      setSelectedSubtopic(null);
                      onNavigateTab("resources");
                    }}
                    className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold font-mono rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Practice Topic Questions</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
