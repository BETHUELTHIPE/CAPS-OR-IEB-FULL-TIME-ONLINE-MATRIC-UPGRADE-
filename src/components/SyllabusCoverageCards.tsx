import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Search, Filter, Sparkles, CheckCircle2, ChevronRight, 
  HelpCircle, AlertTriangle, Lightbulb, FileText, ArrowRight,
  Video, Calculator, Award, Grid, Layers, Compass, Check, X,
  Bookmark, Shield, Zap, Copy, ChevronDown, ChevronUp,
  CheckSquare, Square, Clock, Eye, BarChart2, Target, Percent,
  RotateCcw, TrendingUp, CheckCircle
} from "lucide-react";
import { ALL_SYLLABUS_CARDS, SyllabusCard } from "../data/syllabusCards";
import { LatexRenderer } from "./LatexRenderer";
import { ExponentSurdCalculator } from "./ExponentSurdCalculator";
import { dbAPI } from "../lib/db";
import { evaluateCurriculumMilestone } from "../lib/curriculumMilestones";

interface SyllabusCoverageCardsProps {
  initialSearch?: string;
  initialStrand?: string;
  className?: string;
}

const getStrandTheme = (strand: string) => {
  switch (strand) {
    case "Algebra & Exponents":
      return {
        badge: "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border-amber-400/30",
        border: "border-amber-400/80 dark:border-amber-500/80 ring-1 ring-amber-400/20",
        icon: "text-amber-500",
        bg: "hover:border-amber-400"
      };
    case "Sequences & Series":
      return {
        badge: "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/40 border-indigo-400/30",
        border: "border-indigo-300 dark:border-indigo-800",
        icon: "text-indigo-500",
        bg: "hover:border-indigo-400"
      };
    case "Functions & Inverses":
      return {
        badge: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 border-blue-400/30",
        border: "border-blue-300 dark:border-blue-800",
        icon: "text-blue-500",
        bg: "hover:border-blue-400"
      };
    case "Financial Mathematics":
      return {
        badge: "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 border-emerald-400/30",
        border: "border-emerald-300 dark:border-emerald-800",
        icon: "text-emerald-500",
        bg: "hover:border-emerald-400"
      };
    case "Differential Calculus":
      return {
        badge: "text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/40 border-purple-400/30",
        border: "border-purple-300 dark:border-purple-800",
        icon: "text-purple-500",
        bg: "hover:border-purple-400"
      };
    case "Analytical Geometry":
      return {
        badge: "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40 border-rose-400/30",
        border: "border-rose-300 dark:border-rose-800",
        icon: "text-rose-500",
        bg: "hover:border-rose-400"
      };
    case "Trigonometry":
      return {
        badge: "text-cyan-700 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-950/40 border-cyan-400/30",
        border: "border-cyan-300 dark:border-cyan-800",
        icon: "text-cyan-500",
        bg: "hover:border-cyan-400"
      };
    case "Euclidean Geometry":
      return {
        badge: "text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-950/40 border-teal-400/30",
        border: "border-teal-300 dark:border-teal-800",
        icon: "text-teal-500",
        bg: "hover:border-teal-400"
      };
    case "Statistics":
      return {
        badge: "text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/40 border-orange-400/30",
        border: "border-orange-300 dark:border-orange-800",
        icon: "text-orange-500",
        bg: "hover:border-orange-400"
      };
    case "Probability":
      return {
        badge: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 border-slate-400/30",
        border: "border-slate-300 dark:border-slate-800",
        icon: "text-slate-500",
        bg: "hover:border-slate-400"
      };
    case "AP & Advanced Maths":
      return {
        badge: "text-yellow-700 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-950/40 border-yellow-400/30",
        border: "border-yellow-300 dark:border-yellow-800",
        icon: "text-yellow-500",
        bg: "hover:border-yellow-400"
      };
    default:
      return {
        badge: "text-royal-700 bg-royal-50 dark:text-royal-300 dark:bg-royal-950/40 border-royal-400/30",
        border: "border-navy-150 dark:border-navy-800",
        icon: "text-royal-500",
        bg: "hover:border-royal-400"
      };
  }
};

export const SyllabusCoverageCards: React.FC<SyllabusCoverageCardsProps> = ({
  initialSearch = "",
  initialStrand = "All",
  className = ""
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [selectedPaper, setSelectedPaper] = useState<string>("All");
  const [selectedSyllabus, setSelectedSyllabus] = useState<string>("All");
  const [selectedStrand, setSelectedStrand] = useState<string>(initialStrand);
  const [viewMode, setViewMode] = useState<"grid" | "paper">("grid");
  const [statusFilter, setStatusFilter] = useState<"All" | "In Progress" | "Completed" | "Unstarted">("All");
  const [showStrandBreakdown, setShowStrandBreakdown] = useState<boolean>(false);

  // Completed subtopics state (stores keys as `${card.id}::${subIndex}`)
  const [completedSubtopics, setCompletedSubtopics] = useState<string[]>(() => {
    return dbAPI.getCompletedSubtopics();
  });

  // Mastered syllabus topics state
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("amh_mastered_syllabus_cards");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("amh_mastered_syllabus_cards", JSON.stringify(masteredIds));
    } catch (e) {
      console.error("Failed to save mastered topics:", e);
    }
  }, [masteredIds]);

  // Subtopic toggle handler
  const handleToggleSubtopic = (card: SyllabusCard, subIndex: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const subKey = `${card.id}::${subIndex}`;
    const next = dbAPI.toggleCompletedSubtopic(subKey);
    setCompletedSubtopics(next);

    // Sync card level mastery
    const allSubKeys = card.subtopics.map((_, idx) => `${card.id}::${idx}`);
    const isAllDone = allSubKeys.every((k) => next.includes(k));

    if (isAllDone && !masteredIds.includes(card.id)) {
      setMasteredIds((prev) => [...prev, card.id]);
    } else if (!isAllDone && masteredIds.includes(card.id)) {
      setMasteredIds((prev) => prev.filter((id) => id !== card.id));
    }
  };

  // Toggle all subtopics for a card
  const handleToggleAllCardSubtopics = (card: SyllabusCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const allSubKeys = card.subtopics.map((_, idx) => `${card.id}::${idx}`);
    const isAllDone = allSubKeys.every((k) => completedSubtopics.includes(k));

    let next: string[];
    if (isAllDone) {
      next = completedSubtopics.filter((k) => !allSubKeys.includes(k));
      setMasteredIds((prev) => prev.filter((id) => id !== card.id));
    } else {
      const keysToAdd = allSubKeys.filter((k) => !completedSubtopics.includes(k));
      next = [...completedSubtopics, ...keysToAdd];
      if (!masteredIds.includes(card.id)) {
        setMasteredIds((prev) => [...prev, card.id]);
      }
    }
    dbAPI.setCompletedSubtopics(next);
    setCompletedSubtopics(next);
  };

  // Toggle card mastery (and sync all its subtopics)
  const toggleMastered = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const card = ALL_SYLLABUS_CARDS.find((c) => c.id === cardId);
    const isCurrentlyMastered = masteredIds.includes(cardId);

    setMasteredIds((prev) =>
      isCurrentlyMastered ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );

    if (card) {
      const allSubKeys = card.subtopics.map((_, idx) => `${card.id}::${idx}`);
      let next: string[];
      if (isCurrentlyMastered) {
        next = completedSubtopics.filter((k) => !allSubKeys.includes(k));
      } else {
        const keysToAdd = allSubKeys.filter((k) => !completedSubtopics.includes(k));
        next = [...completedSubtopics, ...keysToAdd];
      }
      dbAPI.setCompletedSubtopics(next);
      setCompletedSubtopics(next);
    }
  };

  // Overall Subtopic Mastery Metrics
  const overallSubtopicStats = useMemo(() => {
    const totalSubtopics = ALL_SYLLABUS_CARDS.reduce((acc, card) => acc + card.subtopics.length, 0);
    const completedCount = ALL_SYLLABUS_CARDS.reduce((acc, card) => {
      const doneInCard = card.subtopics.filter((_, idx) => completedSubtopics.includes(`${card.id}::${idx}`)).length;
      return acc + doneInCard;
    }, 0);
    const percent = totalSubtopics > 0 ? Math.round((completedCount / totalSubtopics) * 100) : 0;
    return { totalSubtopics, completedCount, percent };
  }, [completedSubtopics]);

  // Evaluate 10% curriculum milestones when overall subtopic progress updates
  useEffect(() => {
    if (overallSubtopicStats.percent > 0) {
      evaluateCurriculumMilestone(
        "Mathematics Syllabus Coverage",
        overallSubtopicStats.percent,
        "Total Subtopics Completed"
      );
    }
  }, [overallSubtopicStats.percent]);

  // Strand-by-strand subtopic progress metrics
  const strandMetrics = useMemo(() => {
    const strandMap: Record<string, { total: number; completed: number; cardsCount: number }> = {};

    ALL_SYLLABUS_CARDS.forEach((card) => {
      if (!strandMap[card.strand]) {
        strandMap[card.strand] = { total: 0, completed: 0, cardsCount: 0 };
      }
      strandMap[card.strand].cardsCount += 1;
      strandMap[card.strand].total += card.subtopics.length;

      card.subtopics.forEach((_, idx) => {
        if (completedSubtopics.includes(`${card.id}::${idx}`)) {
          strandMap[card.strand].completed += 1;
        }
      });
    });

    return strandMap;
  }, [completedSubtopics]);

  // Selected card for deep dive modal
  const [activeCard, setActiveCard] = useState<SyllabusCard | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  // Available Filter Options
  const strands = [
    "All",
    "Algebra & Exponents",
    "Sequences & Series",
    "Functions & Inverses",
    "Financial Mathematics",
    "Differential Calculus",
    "Analytical Geometry",
    "Trigonometry",
    "Euclidean Geometry",
    "Statistics",
    "Probability",
    "AP & Advanced Maths"
  ];

  const grades = ["All Grades", "Grade 10", "Grade 11", "Grade 12", "Matric Upgrade"];
  const papers = ["All", "Paper 1", "Paper 2"];
  const syllabi = ["All", "CAPS", "IEB"];

  // Filtering Logic
  const filteredCards = useMemo(() => {
    return ALL_SYLLABUS_CARDS.filter((card) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || (
        card.title.toLowerCase().includes(searchLower) ||
        card.strand.toLowerCase().includes(searchLower) ||
        card.subtopics.some(s => s.toLowerCase().includes(searchLower)) ||
        card.examTip.toLowerCase().includes(searchLower) ||
        card.keyFormulae.some(f => f.toLowerCase().includes(searchLower))
      );

      const matchesGrade = selectedGrade === "All Grades" || 
        card.grade === selectedGrade || 
        card.grade === "All Grades" ||
        (selectedGrade === "Matric Upgrade" && (card.grade === "Grade 12" || card.grade === "Matric Upgrade"));

      const matchesPaper = selectedPaper === "All" || card.paper === selectedPaper || card.paper === "Both";
      const matchesSyllabus = selectedSyllabus === "All" || card.syllabus === selectedSyllabus || card.syllabus === "Both";
      const matchesStrand = selectedStrand === "All" || card.strand === selectedStrand;

      // Status filter based on completed subtopics
      const cardCompletedCount = card.subtopics.filter((_, idx) => completedSubtopics.includes(`${card.id}::${idx}`)).length;
      let matchesStatus = true;
      if (statusFilter === "Completed") {
        matchesStatus = cardCompletedCount === card.subtopics.length && card.subtopics.length > 0;
      } else if (statusFilter === "In Progress") {
        matchesStatus = cardCompletedCount > 0 && cardCompletedCount < card.subtopics.length;
      } else if (statusFilter === "Unstarted") {
        matchesStatus = cardCompletedCount === 0;
      }

      return matchesSearch && matchesGrade && matchesPaper && matchesSyllabus && matchesStrand && matchesStatus;
    });
  }, [searchQuery, selectedGrade, selectedPaper, selectedSyllabus, selectedStrand, statusFilter, completedSubtopics]);

  // Grouped by paper for Paper view mode
  const paper1Cards = useMemo(() => filteredCards.filter(c => c.paper === "Paper 1" || c.paper === "Both"), [filteredCards]);
  const paper2Cards = useMemo(() => filteredCards.filter(c => c.paper === "Paper 2" || c.paper === "Both"), [filteredCards]);

  const handleOpenModal = (card: SyllabusCard) => {
    setActiveCard(card);
    setShowSolution(false);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* SECTION HEADER & SUMMARY METRICS */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" />
                Comprehensive Curriculum Coverage
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                100% NSC CAPS & IEB Compliant
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              Syllabus Coverage Cards
            </h2>
            <p className="text-xs sm:text-sm text-navy-200 max-w-2xl leading-relaxed">
              Explore every chapter in South African High School Mathematics. Each card breaks down subtopics, key formulae, Bethuel's practical exam strategy, and high-yield question patterns with clean, standard mathematical notation.
            </p>
          </div>

          {/* QUICK SUMMARY BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-shrink-0">
            <div className="bg-navy-800/80 border border-navy-700/60 rounded-xl p-3 text-center">
              <div className="text-xl font-black font-mono text-gold-400">{ALL_SYLLABUS_CARDS.length}</div>
              <div className="text-[10px] text-navy-300 font-medium">Syllabus Chapters</div>
            </div>
            <div className="bg-navy-800/80 border border-navy-700/60 rounded-xl p-3 text-center">
              <div className="text-xl font-black font-mono text-royal-400">{overallSubtopicStats.percent}%</div>
              <div className="text-[10px] text-navy-300 font-medium">Subtopic Progress</div>
            </div>
            <div className="bg-navy-800/80 border border-navy-700/60 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <div className="text-xl font-black font-mono text-emerald-400">
                {overallSubtopicStats.completedCount}/{overallSubtopicStats.totalSubtopics}
              </div>
              <div className="text-[10px] text-navy-300 font-medium">Subtopics Completed</div>
            </div>
          </div>
        </div>

        {/* SUBTOPIC PROGRESS OVERVIEW BANNER */}
        <div className="bg-navy-950/90 border border-navy-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-mono">Subtopic Progress Tracker</h3>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {overallSubtopicStats.percent}% Mastered
                  </span>
                </div>
                <p className="text-xs text-navy-300">
                  {overallSubtopicStats.completedCount} of {overallSubtopicStats.totalSubtopics} total syllabus subtopics completed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* STATUS FILTERS */}
              {(["All", "In Progress", "Completed", "Unstarted"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    statusFilter === status
                      ? "bg-gold-400 text-navy-950 shadow-sm font-black"
                      : "bg-navy-800/80 text-navy-300 hover:text-white hover:bg-navy-800"
                  }`}
                >
                  {status}
                </button>
              ))}

              <button
                onClick={() => setShowStrandBreakdown(!showStrandBreakdown)}
                className="px-2.5 py-1 bg-navy-800 hover:bg-navy-750 text-gold-400 rounded-lg text-xs font-mono font-bold border border-navy-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{showStrandBreakdown ? "Hide Strand Stats" : "Strand Breakdown"}</span>
              </button>
            </div>
          </div>

          {/* MAIN PROGRESS BAR */}
          <div className="space-y-1">
            <div className="w-full h-3 bg-navy-900 rounded-full overflow-hidden border border-navy-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-gold-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${overallSubtopicStats.percent}%` }}
              />
            </div>
          </div>

          {/* EXPANDABLE STRAND PROGRESS BREAKDOWN GRID */}
          {showStrandBreakdown && (
            <div className="pt-3 border-t border-navy-850 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(strandMetrics).map(([strand, data]) => {
                const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div
                    key={strand}
                    onClick={() => setSelectedStrand(strand === selectedStrand ? "All" : strand)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedStrand === strand
                        ? "bg-royal-950/80 border-gold-400/80 ring-1 ring-gold-400/20"
                        : "bg-navy-900/60 border-navy-800 hover:border-navy-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span className="truncate pr-2 font-mono text-[11px]">{strand}</span>
                      <span className={`font-mono text-[11px] ${pct === 100 ? "text-emerald-400" : pct > 0 ? "text-gold-400" : "text-navy-400"}`}>
                        {data.completed}/{data.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct === 100 ? "bg-emerald-400" : pct > 0 ? "bg-gold-400" : "bg-navy-800"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="pt-4 border-t border-navy-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* SEARCH INPUT */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equations, subtopics, or theorems..."
              className="w-full bg-navy-950/80 border border-navy-700/80 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* FILTER DROPDOWNS */}
          <div className="md:col-span-5 grid grid-cols-3 gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-navy-950/80 border border-navy-700/80 rounded-xl px-2.5 py-2.5 text-xs text-navy-200 focus:outline-none focus:border-gold-400"
            >
              {grades.map((g) => (
                <option key={g} value={g} className="bg-navy-900 text-white">{g}</option>
              ))}
            </select>

            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(e.target.value)}
              className="bg-navy-950/80 border border-navy-700/80 rounded-xl px-2.5 py-2.5 text-xs text-navy-200 focus:outline-none focus:border-gold-400"
            >
              {papers.map((p) => (
                <option key={p} value={p} className="bg-navy-900 text-white">{p === "All" ? "All Papers" : p}</option>
              ))}
            </select>

            <select
              value={selectedSyllabus}
              onChange={(e) => setSelectedSyllabus(e.target.value)}
              className="bg-navy-950/80 border border-navy-700/80 rounded-xl px-2.5 py-2.5 text-xs text-navy-200 focus:outline-none focus:border-gold-400"
            >
              {syllabi.map((s) => (
                <option key={s} value={s} className="bg-navy-900 text-white">{s === "All" ? "CAPS & IEB" : s}</option>
              ))}
            </select>
          </div>

          {/* VIEW MODE TOGGLE BUTTONS */}
          <div className="md:col-span-2 flex items-center justify-end gap-1 bg-navy-950/80 p-1 rounded-xl border border-navy-700/80">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-gold-400 text-navy-950 font-black shadow-sm"
                  : "text-navy-300 hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode("paper")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                viewMode === "paper"
                  ? "bg-gold-400 text-navy-950 font-black shadow-sm"
                  : "text-navy-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Paper</span>
            </button>
          </div>
        </div>

        {/* STRAND SCROLLABLE PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          {strands.map((strand) => (
            <button
              key={strand}
              onClick={() => setSelectedStrand(strand)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 border ${
                selectedStrand === strand
                  ? "bg-royal-600 text-white border-royal-500 shadow-sm"
                  : "bg-navy-800/60 text-navy-300 hover:bg-navy-800 hover:text-white border-navy-700/60"
              }`}
            >
              {strand}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER RESULTS METRICS BAR */}
      <div className="flex items-center justify-between text-xs text-navy-500 dark:text-navy-400 px-1">
        <div>
          Showing <strong>{filteredCards.length}</strong> of <strong>{ALL_SYLLABUS_CARDS.length}</strong> chapter cards
        </div>
        {(searchQuery || selectedGrade !== "All Grades" || selectedPaper !== "All" || selectedSyllabus !== "All" || selectedStrand !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGrade("All Grades");
              setSelectedPaper("All");
              setSelectedSyllabus("All");
              setSelectedStrand("All");
            }}
            className="text-royal-600 dark:text-gold-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      {filteredCards.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-12 text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-navy-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
              No matching syllabus cards found
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 max-w-md mx-auto">
              Try adjusting your search query or switching your grade, paper, or mathematical strand filter.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGrade("All Grades");
              setSelectedPaper("All");
              setSelectedSyllabus("All");
              setSelectedStrand("All");
            }}
            className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            Clear All Search Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <SyllabusCardItem
              key={card.id}
              card={card}
              onOpenModal={handleOpenModal}
              isMastered={masteredIds.includes(card.id)}
              onToggleMastered={(e) => toggleMastered(card.id, e)}
              completedSubtopics={completedSubtopics}
              onToggleSubtopic={handleToggleSubtopic}
              onToggleAllCardSubtopics={handleToggleAllCardSubtopics}
            />
          ))}
        </div>
      ) : (
        /* PAPER 1 VS PAPER 2 VIEW MODE */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PAPER 1 COLUMN */}
          <div className="space-y-4 bg-navy-50/50 dark:bg-navy-950/40 p-5 rounded-3xl border border-navy-150 dark:border-navy-800">
            <div className="flex items-center justify-between bg-royal-600 text-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gold-400" />
                <div>
                  <h3 className="text-sm font-extrabold">Paper 1: Algebra, Functions & Calculus</h3>
                  <p className="text-[10px] text-royal-200">Total 150 Marks • 3 Hours Duration</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-royal-500 text-white px-2.5 py-1 rounded-full">
                {paper1Cards.length} Cards
              </span>
            </div>

            <div className="space-y-4">
              {paper1Cards.map((card) => (
                <SyllabusCardItem
                  key={card.id}
                  card={card}
                  onOpenModal={handleOpenModal}
                  compact
                  isMastered={masteredIds.includes(card.id)}
                  onToggleMastered={(e) => toggleMastered(card.id, e)}
                  completedSubtopics={completedSubtopics}
                  onToggleSubtopic={handleToggleSubtopic}
                  onToggleAllCardSubtopics={handleToggleAllCardSubtopics}
                />
              ))}
            </div>
          </div>

          {/* PAPER 2 COLUMN */}
          <div className="space-y-4 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 rounded-3xl border border-emerald-500/20">
            <div className="flex items-center justify-between bg-emerald-700 text-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="text-sm font-extrabold">Paper 2: Geometry, Trig & Statistics</h3>
                  <p className="text-[10px] text-emerald-200">Total 150 Marks • 3 Hours Duration</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                {paper2Cards.length} Cards
              </span>
            </div>

            <div className="space-y-4">
              {paper2Cards.map((card) => (
                <SyllabusCardItem
                  key={card.id}
                  card={card}
                  onOpenModal={handleOpenModal}
                  compact
                  isMastered={masteredIds.includes(card.id)}
                  onToggleMastered={(e) => toggleMastered(card.id, e)}
                  completedSubtopics={completedSubtopics}
                  onToggleSubtopic={handleToggleSubtopic}
                  onToggleAllCardSubtopics={handleToggleAllCardSubtopics}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEEP DIVE MODAL DRAWER */}
      <AnimatePresence>
        {activeCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* MODAL HEADER BANNER */}
              <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 text-white p-6 sm:p-8 rounded-t-3xl relative">
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <button
                    onClick={(e) => toggleMastered(activeCard.id, e)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      masteredIds.includes(activeCard.id)
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "bg-navy-800/80 text-navy-300 hover:text-white border border-navy-700"
                    }`}
                  >
                    {masteredIds.includes(activeCard.id) ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Topic Mastered</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-navy-400" />
                        <span>Mark Mastered</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveCard(null)}
                    className="p-2 bg-navy-800/80 hover:bg-navy-700 text-navy-300 hover:text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 pr-28">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-gold-400 bg-gold-400/10 px-2.5 py-0.5 rounded border border-gold-400/20">
                      {activeCard.strand}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-white bg-royal-600 px-2.5 py-0.5 rounded">
                      {activeCard.paper}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-navy-200 bg-navy-800 px-2.5 py-0.5 rounded">
                      {activeCard.grade}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      ⚡ {activeCard.examWeightage}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                    {activeCard.title}
                  </h2>
                </div>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* SUBTOPICS LIST */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xs font-mono font-black uppercase text-navy-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Chapter Subtopics & Core Concepts:
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-500/20">
                        {activeCard.subtopics.filter((_, idx) => completedSubtopics.includes(`${activeCard.id}::${idx}`)).length} / {activeCard.subtopics.length} Completed
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleAllCardSubtopics(activeCard, e)}
                        className="text-xs font-mono font-bold text-royal-600 dark:text-gold-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-navy-50 dark:bg-navy-950/60 p-4 rounded-2xl border border-navy-100 dark:border-navy-800">
                    {activeCard.subtopics.map((sub, i) => {
                      const isSubDone = completedSubtopics.includes(`${activeCard.id}::${i}`);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => handleToggleSubtopic(activeCard, i, e)}
                          className={`w-full text-left flex items-start gap-2 text-xs p-2.5 rounded-xl transition-all cursor-pointer ${
                            isSubDone 
                              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-500/30" 
                              : "text-navy-700 dark:text-navy-200 hover:bg-navy-100/60 dark:hover:bg-navy-900"
                          }`}
                        >
                          {isSubDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-navy-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={isSubDone ? "line-through opacity-90" : ""}>
                            <LatexRenderer text={sub} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* KEY FORMULAE */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-black uppercase text-navy-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-royal-500" />
                    Essential Exam Formulae & Equations:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCard.keyFormulae.map((form, i) => (
                      <div key={i} className="bg-slate-900 text-white p-3.5 rounded-xl border border-navy-700 flex flex-col items-center justify-center text-center relative group">
                        <LatexRenderer text={form} block />
                      </div>
                    ))}
                  </div>
                </div>

                {/* EMBEDDED INTERACTIVE EXPONENTS & SURDS CALCULATOR FOR ALGEBRA & EXPONENTS CARDS */}
                {(activeCard.id === "syl-exp-surds" || activeCard.strand === "Algebra & Exponents") && (
                  <div className="pt-2">
                    <ExponentSurdCalculator />
                  </div>
                )}

                {/* TUTOR EXAM TIP */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    Tutor Bethuel's Practical Exam Strategy:
                  </div>
                  <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed pl-6">
                    <LatexRenderer text={activeCard.examTip} />
                  </p>
                </div>

                {/* COMMON PITFALLS */}
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    Common Pitfall / Mark Loss Warning:
                  </div>
                  <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed pl-6">
                    <LatexRenderer text={activeCard.commonMistakes} />
                  </p>
                </div>

                {/* SAMPLE QUESTION & SOLUTION WORKED WALKTHROUGH */}
                <div className="border border-navy-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 bg-white dark:bg-navy-900">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-black uppercase text-navy-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gold-500" />
                      Sample Exam Question:
                    </span>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="px-3 py-1 bg-royal-50 dark:bg-navy-800 text-royal-700 dark:text-gold-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-royal-100 dark:hover:bg-navy-700 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showSolution ? "Hide Worked Solution" : "View Step-by-Step Solution"}
                    </button>
                  </div>

                  <div className="text-xs font-medium text-navy-800 dark:text-navy-100 bg-navy-50 dark:bg-navy-950 p-3.5 rounded-xl">
                    <LatexRenderer text={activeCard.sampleQuestion} />
                  </div>

                  {showSolution && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2"
                    >
                      <div className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                        Step-by-Step Worked Solution:
                      </div>
                      <div className="text-xs text-navy-800 dark:text-navy-200 leading-relaxed">
                        <LatexRenderer text={activeCard.sampleSolution} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* ACTION CTAs */}
                <div className="pt-4 border-t border-navy-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[10px] text-navy-400 font-mono">
                    Estimated Chapter Study Time: <strong>{activeCard.estimatedStudyTime}</strong>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setActiveCard(null);
                        navigate(`/book?topic=${encodeURIComponent(activeCard.title)}`);
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                    >
                      Book 1-on-1 Class
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveCard(null);
                        navigate(`/video-requests?topic=${encodeURIComponent(activeCard.title)}`);
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-slate-950 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Request Video (R150)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// COMPONENT: INDIVIDUAL SYLLABUS CARD ITEM
interface SyllabusCardItemProps {
  card: SyllabusCard;
  onOpenModal: (card: SyllabusCard) => void;
  compact?: boolean;
  isMastered?: boolean;
  onToggleMastered?: (e: React.MouseEvent) => void;
  completedSubtopics: string[];
  onToggleSubtopic: (card: SyllabusCard, subIndex: number, e?: React.MouseEvent) => void;
  onToggleAllCardSubtopics: (card: SyllabusCard, e?: React.MouseEvent) => void;
}

const SyllabusCardItem: React.FC<SyllabusCardItemProps> = ({
  card,
  onOpenModal,
  compact,
  isMastered,
  onToggleMastered,
  completedSubtopics,
  onToggleSubtopic,
  onToggleAllCardSubtopics
}) => {
  const [activeFormulaIndex, setActiveFormulaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [subtopicsExpanded, setSubtopicsExpanded] = useState(false);

  const isExponentsCard = card.id === "syl-exp-surds";
  const theme = getStrandTheme(card.strand);

  const completedCount = card.subtopics.filter((_, idx) => completedSubtopics.includes(`${card.id}::${idx}`)).length;
  const cardPercent = card.subtopics.length > 0 ? Math.round((completedCount / card.subtopics.length) * 100) : 0;

  const handleCopyFormula = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.keyFormulae[activeFormulaIndex]) {
      navigator.clipboard.writeText(card.keyFormulae[activeFormulaIndex]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayedSubtopics = subtopicsExpanded
    ? card.subtopics
    : card.subtopics.slice(0, 3);

  return (
    <div
      className={`bg-white dark:bg-navy-900 border rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group relative ${
        isExponentsCard
          ? "border-amber-400/80 dark:border-amber-500/80 ring-1 ring-amber-400/30"
          : isMastered || cardPercent === 100
          ? "border-emerald-500/60 dark:border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10"
          : `${theme.border} ${theme.bg}`
      }`}
    >
      {/* FEATURED / HIGHLIGHT BANNER FOR EXPONENTS & SURDS */}
      {isExponentsCard && (
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-gold-500 text-navy-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-navy-950" />
          Featured High-Yield Chapter
        </div>
      )}

      <div className="space-y-4">
        {/* TOP BADGES & MASTERY CHECKBOX */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${theme.badge}`}>
              {card.strand}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-white bg-royal-600 px-2 py-0.5 rounded">
              {card.paper}
            </span>
            <span className="text-[10px] font-mono font-bold text-navy-500 dark:text-navy-400 bg-navy-100 dark:bg-navy-800 px-2 py-0.5 rounded">
              {card.grade}
            </span>
          </div>

          {onToggleMastered && (
            <button
              onClick={onToggleMastered}
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                isMastered || cardPercent === 100
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "text-navy-400 hover:text-navy-700 dark:hover:text-navy-200"
              }`}
              title={isMastered ? "Mark as uncompleted" : "Mark chapter as mastered"}
            >
              {isMastered || cardPercent === 100 ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mastered</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Mastered?</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* CARD TITLE & EXAM WEIGHTAGE */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors flex items-center gap-2">
            <Bookmark className={`w-4 h-4 flex-shrink-0 ${theme.icon}`} />
            {card.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-500" />
              {card.examWeightage}
            </span>
            <span className="text-[10px] font-mono text-navy-400">
              • {card.difficulty}
            </span>
          </div>
        </div>

        {/* CARD SUBTOPIC PROGRESS METER & CHECKBOXES */}
        <div className="space-y-2 pt-2 border-t border-navy-100 dark:border-navy-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase text-navy-500 dark:text-navy-400 font-bold flex items-center gap-1">
              <Target className="w-3 h-3 text-royal-500" />
              Subtopics ({completedCount}/{card.subtopics.length}):
            </span>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                cardPercent === 100 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" : "text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/20"
              }`}>
                {cardPercent}%
              </span>

              <button
                type="button"
                onClick={(e) => onToggleAllCardSubtopics(card, e)}
                className="text-[10px] font-mono font-bold text-royal-600 dark:text-gold-400 hover:underline cursor-pointer"
                title={completedCount === card.subtopics.length ? "Uncheck all subtopics" : "Mark all subtopics complete"}
              >
                {completedCount === card.subtopics.length ? "Clear" : "Select All"}
              </button>
            </div>
          </div>

          {/* SUBTOPICS PROGRESS BAR */}
          <div className="w-full h-1.5 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${cardPercent === 100 ? "bg-emerald-500" : "bg-gold-400"}`}
              style={{ width: `${cardPercent}%` }}
            />
          </div>

          <div className="space-y-1 pt-1">
            {displayedSubtopics.map((sub, i) => {
              const isDone = completedSubtopics.includes(`${card.id}::${i}`);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => onToggleSubtopic(card, i, e)}
                  className={`w-full text-left flex items-start gap-2 text-xs p-1.5 rounded-lg transition-all cursor-pointer group/sub ${
                    isDone 
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-500/20" 
                      : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-850"
                  }`}
                >
                  {isDone ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-navy-400 dark:text-navy-600 group-hover/sub:text-royal-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={isDone ? "line-through opacity-90" : ""}>
                    <LatexRenderer text={sub} className={subtopicsExpanded ? "text-xs" : "line-clamp-1"} />
                  </span>
                </button>
              );
            })}

            {card.subtopics.length > 3 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSubtopicsExpanded(!subtopicsExpanded);
                }}
                className="text-[10px] font-mono font-bold text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                {subtopicsExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>+{card.subtopics.length - 3} more subtopics included...</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* FORMULA PREVIEW BLOCK WITH FORMULA CAROUSEL & COPY */}
        {card.keyFormulae.length > 0 && (
          <div className="bg-navy-950 text-white p-3 rounded-xl border border-navy-800 space-y-2 relative group/form">
            <div className="flex items-center justify-between text-[10px] font-mono text-navy-400 border-b border-navy-850 pb-1">
              <span>Formula {activeFormulaIndex + 1} of {card.keyFormulae.length}</span>
              <button
                type="button"
                onClick={handleCopyFormula}
                className="text-navy-400 hover:text-gold-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy LaTeX formula"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div className="py-1 flex items-center justify-center text-center overflow-x-auto min-h-[44px]">
              <LatexRenderer text={card.keyFormulae[activeFormulaIndex]} block />
            </div>

            {/* FORMULA SWITCHER DOTS */}
            {card.keyFormulae.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-1">
                {card.keyFormulae.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFormulaIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeFormulaIndex
                        ? "bg-gold-400 w-4"
                        : "bg-navy-700 hover:bg-navy-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CARD FOOTER */}
      <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-navy-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-navy-400" />
          Est: {card.estimatedStudyTime}
        </span>

        <button
          onClick={() => onOpenModal(card)}
          className={`px-3.5 py-1.5 font-extrabold text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
            isExponentsCard
              ? "bg-amber-500 hover:bg-amber-400 text-navy-950 font-black"
              : "bg-royal-50 dark:bg-navy-800 hover:bg-royal-600 hover:text-white dark:hover:bg-gold-400 dark:hover:text-slate-950 text-royal-700 dark:text-gold-400"
          }`}
        >
          <span>View Deep Dive</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
