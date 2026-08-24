import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Network, 
  Search, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  BookOpen, 
  Award, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight, 
  HelpCircle,
  Video,
  Play,
  Layers,
  Info,
  ShieldCheck,
  Target,
  BrainCircuit,
  X
} from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { Profile } from "../types";

export interface RadialTopicNode {
  id: string;
  title: string;
  category: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Probability" | "Functions" | "Financials" | "Sequences";
  paper: "Paper 1" | "Paper 2" | "Both";
  ringTier: 1 | 2 | 3; // 1 = Core Foundation, 2 = Intermediate Application, 3 = Advanced / Formula
  masteryPercent: number; // 0 - 100
  examWeightMarks: string;
  description: string;
  formulaLatex?: string;
  prerequisites: string[]; // Node IDs required before this topic
  unlockedByCount?: number;
}

export const RADIAL_TOPIC_NODES: RadialTopicNode[] = [
  // --- TIER 1: CORE FOUNDATIONS (RING 1) ---
  {
    id: "alg_equations",
    title: "Algebra & Linear Equations",
    category: "Algebra",
    paper: "Paper 1",
    ringTier: 1,
    masteryPercent: 88,
    examWeightMarks: "25 Marks",
    description: "Fundamental algebraic manipulation, factoring, simultaneous equations, and exponential laws.",
    prerequisites: []
  },
  {
    id: "trig_foundations",
    title: "Trigonometric Ratios & Graphs",
    category: "Trigonometry",
    paper: "Paper 2",
    ringTier: 1,
    masteryPercent: 82,
    examWeightMarks: "20 Marks",
    description: "Basic sin, cos, tan definitions, Cartesian coordinates, and basic trig graphs.",
    formulaLatex: "\\sin^2(\\theta) + \\cos^2(\\theta) = 1",
    prerequisites: []
  },
  {
    id: "analytical_geom_basics",
    title: "Analytical Geometry Basics",
    category: "Geometry",
    paper: "Paper 2",
    ringTier: 1,
    masteryPercent: 78,
    examWeightMarks: "15 Marks",
    description: "Distance formula, midpoint, gradient of parallel and perpendicular lines.",
    formulaLatex: "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}",
    prerequisites: ["alg_equations"]
  },
  {
    id: "number_patterns_basic",
    title: "Arithmetic & Geometric Sequences",
    category: "Sequences",
    paper: "Paper 1",
    ringTier: 1,
    masteryPercent: 85,
    examWeightMarks: "20 Marks",
    description: "Linear and quadratic number patterns, common difference, common ratio formulas.",
    formulaLatex: "T_n = a + (n-1)d",
    prerequisites: ["alg_equations"]
  },
  {
    id: "stats_bivariate",
    title: "Statistics & Ogives",
    category: "Probability",
    paper: "Paper 2",
    ringTier: 1,
    masteryPercent: 91,
    examWeightMarks: "20 Marks",
    description: "Mean, median, box-and-whisker plots, standard deviation, and cumulative frequency curves.",
    prerequisites: []
  },

  // --- TIER 2: INTERMEDIATE TOPICS (RING 2) ---
  {
    id: "quadratic_inequalities",
    title: "Quadratic Equations & Roots",
    category: "Algebra",
    paper: "Paper 1",
    ringTier: 2,
    masteryPercent: 75,
    examWeightMarks: "15 Marks",
    description: "Quadratic formula, nature of roots discriminant Δ, and quadratic inequalities.",
    formulaLatex: "\\Delta = b^2 - 4ac",
    prerequisites: ["alg_equations"]
  },
  {
    id: "functions_parabola_hyperbola",
    title: "Functions & Inverse Graphs",
    category: "Functions",
    paper: "Paper 1",
    ringTier: 2,
    masteryPercent: 80,
    examWeightMarks: "35 Marks",
    description: "Parabolas, hyperbolas, exponential graphs, logarithmic transformations, and inverses f⁻¹(x).",
    formulaLatex: "y = a(x-p)^2 + q",
    prerequisites: ["alg_equations", "quadratic_inequalities"]
  },
  {
    id: "trig_identities_compound",
    title: "Compound & Double Angle Identities",
    category: "Trigonometry",
    paper: "Paper 2",
    ringTier: 2,
    masteryPercent: 68,
    examWeightMarks: "25 Marks",
    description: "Proving trigonometric identities using compound and double angle expansion formulas.",
    formulaLatex: "\\cos(A+B) = \\cos A \\cos B - \\sin A \\sin B",
    prerequisites: ["trig_foundations"]
  },
  {
    id: "trig_sine_cosine_rules",
    title: "Sine, Cosine & Area Rules (2D/3D)",
    category: "Trigonometry",
    paper: "Paper 2",
    ringTier: 2,
    masteryPercent: 74,
    examWeightMarks: "20 Marks",
    description: "Solving non-right angled triangles in 2D plane and 3D space problems.",
    formulaLatex: "a^2 = b^2 + c^2 - 2bc\\cos A",
    prerequisites: ["trig_foundations"]
  },
  {
    id: "euclidean_circles",
    title: "Euclidean Circle Geometry",
    category: "Geometry",
    paper: "Paper 2",
    ringTier: 2,
    masteryPercent: 62,
    examWeightMarks: "30 Marks",
    description: "Subtended arc theorems, cyclic quads, tan-chord theorem, and radii properties.",
    formulaLatex: "\\hat{O}_1 = 2\\hat{C}",
    prerequisites: ["analytical_geom_basics"]
  },
  {
    id: "series_infinity_sum",
    title: "Series Summation & Infinity",
    category: "Sequences",
    paper: "Paper 1",
    ringTier: 2,
    masteryPercent: 82,
    examWeightMarks: "15 Marks",
    description: "Sigma notation sum formulas and convergent geometric series sum to infinity.",
    formulaLatex: "S_\\infty = \\frac{a}{1 - r}",
    prerequisites: ["number_patterns_basic"]
  },
  {
    id: "financial_annuities",
    title: "Financial Annuities & Sinking Funds",
    category: "Financials",
    paper: "Paper 1",
    ringTier: 2,
    masteryPercent: 77,
    examWeightMarks: "15 Marks",
    description: "Future value annuities, present value loan repayments, nominal vs effective interest.",
    formulaLatex: "P = \\frac{x[1 - (1+i)^{-n}]}{i}",
    prerequisites: ["alg_equations", "series_infinity_sum"]
  },
  {
    id: "probability_counting",
    title: "Probability & Fundamental Counting",
    category: "Probability",
    paper: "Paper 2",
    ringTier: 2,
    masteryPercent: 86,
    examWeightMarks: "15 Marks",
    description: "Independent events, tree diagrams, Venn diagrams, and fundamental counting principle permutations.",
    formulaLatex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
    prerequisites: ["stats_bivariate"]
  },

  // --- TIER 3: ADVANCED DERIVATIVES & APPLICATIONS (RING 3) ---
  {
    id: "calculus_limits_first_principles",
    title: "First Principles Differentiation",
    category: "Calculus",
    paper: "Paper 1",
    ringTier: 3,
    masteryPercent: 70,
    examWeightMarks: "15 Marks",
    description: "Limit definition of the derivative from first principles.",
    formulaLatex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}",
    prerequisites: ["functions_parabola_hyperbola", "alg_equations"]
  },
  {
    id: "calculus_cubic_graphs",
    title: "Cubic Polynomials & Optimization",
    category: "Calculus",
    paper: "Paper 1",
    ringTier: 3,
    masteryPercent: 64,
    examWeightMarks: "25 Marks",
    description: "Stationary points, concavity inflection points, cubic sketching, and real-world rate of change optimization.",
    formulaLatex: "\\frac{dy}{dx} = 0 \\quad (Turning\\ Points)",
    prerequisites: ["calculus_limits_first_principles", "functions_parabola_hyperbola"]
  },
  {
    id: "euclidean_proportionality",
    title: "Euclidean Proportionality & Similarity",
    category: "Geometry",
    paper: "Paper 2",
    ringTier: 3,
    masteryPercent: 55,
    examWeightMarks: "20 Marks",
    description: "Midpoint theorem extension, line parallel to triangle side divides sides proportionally, equiangular similarity.",
    formulaLatex: "\\frac{AD}{DB} = \\frac{AE}{EC}",
    prerequisites: ["euclidean_circles", "analytical_geom_basics"]
  },
  {
    id: "circle_analytical_geom",
    title: "Circle Analytical Geometry & Tangents",
    category: "Geometry",
    paper: "Paper 2",
    ringTier: 3,
    masteryPercent: 60,
    examWeightMarks: "20 Marks",
    description: "Equations of circles centered at (a,b), tangent equations perpendicular to radius at point of contact.",
    formulaLatex: "(x-a)^2 + (y-b)^2 = r^2",
    prerequisites: ["analytical_geom_basics", "euclidean_circles"]
  },
  {
    id: "logarithmic_inverses",
    title: "Logarithmic Functions & Modeling",
    category: "Functions",
    paper: "Paper 1",
    ringTier: 3,
    masteryPercent: 69,
    examWeightMarks: "15 Marks",
    description: "Logarithm laws, inverse of exponential graphs y = b^x as y = log_b(x), decay modeling.",
    formulaLatex: "y = \\log_b(x) \\iff x = b^y",
    prerequisites: ["functions_parabola_hyperbola", "quadratic_inequalities"]
  }
];

interface TopicDependencyRadialGraphProps {
  user?: Profile | null;
  onSelectTopicForPractice?: (topicTitle: string) => void;
  onSelectTopicForVideo?: (topicTitle: string) => void;
  onAskAITutor?: (query: string) => void;
}

export const TopicDependencyRadialGraph: React.FC<TopicDependencyRadialGraphProps> = ({
  user,
  onSelectTopicForPractice,
  onSelectTopicForVideo,
  onAskAITutor
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("calculus_cubic_graphs");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [paperFilter, setPaperFilter] = useState<"All" | "Paper 1" | "Paper 2">("All");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showOnlyPrerequisites, setShowOnlyPrerequisites] = useState<boolean>(false);

  // Active Node Object
  const selectedNode = useMemo(() => {
    return RADIAL_TOPIC_NODES.find((n) => n.id === selectedNodeId) || RADIAL_TOPIC_NODES[0];
  }, [selectedNodeId]);

  // Nodes filtered by category / paper / search
  const filteredNodes = useMemo(() => {
    return RADIAL_TOPIC_NODES.filter((node) => {
      const matchSearch = searchQuery === "" || 
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        node.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "All" || node.category === categoryFilter;
      const matchPaper = paperFilter === "All" || node.paper === paperFilter || node.paper === "Both";
      return matchSearch && matchCategory && matchPaper;
    });
  }, [searchQuery, categoryFilter, paperFilter]);

  // Compute prerequisite nodes for currently selected node
  const prerequisiteNodes = useMemo(() => {
    return RADIAL_TOPIC_NODES.filter((n) => selectedNode.prerequisites.includes(n.id));
  }, [selectedNode]);

  // Compute downstream nodes that unlock when this selected node is completed
  const dependentNodes = useMemo(() => {
    return RADIAL_TOPIC_NODES.filter((n) => n.prerequisites.includes(selectedNode.id));
  }, [selectedNode]);

  // Calculate Prerequisite Readiness Index
  const prerequisiteReadiness = useMemo(() => {
    if (prerequisiteNodes.length === 0) {
      return { isReady: true, averageMastery: 100, weakest: null };
    }
    const totalMastery = prerequisiteNodes.reduce((acc, n) => acc + n.masteryPercent, 0);
    const averageMastery = Math.round(totalMastery / prerequisiteNodes.length);
    const weakest = [...prerequisiteNodes].sort((a, b) => a.masteryPercent - b.masteryPercent)[0];
    const isReady = averageMastery >= 70 && weakest.masteryPercent >= 60;
    return { isReady, averageMastery, weakest };
  }, [prerequisiteNodes]);

  // Polar layout position calculation for SVG rendering
  // Center is (400, 400) in SVG coordinate space
  const SVG_CENTER_X = 400;
  const SVG_CENTER_Y = 400;

  // Ring radii
  const RING_RADII = {
    0: 0,   // Core Hub
    1: 130, // Ring 1 Core
    2: 240, // Ring 2 Intermediate
    3: 340  // Ring 3 Advanced
  };

  // Assign polar coordinates to each node
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; angle: number; r: number }>();
    
    // Group nodes by ring tier
    const tier1 = RADIAL_TOPIC_NODES.filter((n) => n.ringTier === 1);
    const tier2 = RADIAL_TOPIC_NODES.filter((n) => n.ringTier === 2);
    const tier3 = RADIAL_TOPIC_NODES.filter((n) => n.ringTier === 3);

    const positionRing = (nodes: RadialTopicNode[], radius: number, startAngleOffset: number = 0) => {
      const step = (Math.PI * 2) / (nodes.length || 1);
      nodes.forEach((node, idx) => {
        const angle = startAngleOffset + idx * step - Math.PI / 2;
        const x = SVG_CENTER_X + radius * Math.cos(angle);
        const y = SVG_CENTER_Y + radius * Math.sin(angle);
        map.set(node.id, { x, y, angle, r: radius });
      });
    };

    positionRing(tier1, RING_RADII[1], 0);
    positionRing(tier2, RING_RADII[2], Math.PI / 12);
    positionRing(tier3, RING_RADII[3], Math.PI / 8);

    return map;
  }, []);

  // Category Color Palette
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Algebra":
        return { stroke: "#f59e0b", fill: "#fbbf24", bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400" };
      case "Calculus":
        return { stroke: "#3b82f6", fill: "#60a5fa", bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-400" };
      case "Trigonometry":
        return { stroke: "#ec4899", fill: "#f472b6", bg: "bg-pink-500/10", border: "border-pink-500/40", text: "text-pink-400" };
      case "Geometry":
        return { stroke: "#10b981", fill: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400" };
      case "Functions":
        return { stroke: "#8b5cf6", fill: "#a78bfa", bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-400" };
      case "Sequences":
        return { stroke: "#06b6d4", fill: "#22d3ee", bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-400" };
      case "Financials":
        return { stroke: "#eab308", fill: "#fde047", bg: "bg-yellow-500/10", border: "border-yellow-500/40", text: "text-yellow-400" };
      default:
        return { stroke: "#64748b", fill: "#94a3b8", bg: "bg-slate-500/10", border: "border-slate-500/40", text: "text-slate-400" };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-gold-400 text-navy-950 shadow-md">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
              Topic Dependency Radial Graph
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              CAPS & IEB Math
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Click any node in the concentric radial rings to reveal prerequisite foundations, downstream unlocks, and mastery readiness.
          </p>
        </div>

        {/* View Controls & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowOnlyPrerequisites(!showOnlyPrerequisites)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              showOnlyPrerequisites
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-amber-400/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{showOnlyPrerequisites ? "Show All Connections" : "Focus Prerequisites"}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topic or theorem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition-all font-sans cursor-pointer"
        >
          <option value="All">All Categories (Algebra, Trig, Calculus, etc.)</option>
          <option value="Algebra">Algebra & Equations</option>
          <option value="Calculus">Differential Calculus</option>
          <option value="Trigonometry">Trigonometry</option>
          <option value="Geometry">Euclidean & Analytical Geometry</option>
          <option value="Functions">Functions & Inverses</option>
          <option value="Sequences">Sequences & Series</option>
          <option value="Financials">Financial Mathematics</option>
          <option value="Probability">Statistics & Probability</option>
        </select>

        {/* Paper Filter */}
        <div className="flex items-center justify-between gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
          <button
            onClick={() => setPaperFilter("All")}
            className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
              paperFilter === "All" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            All Papers
          </button>
          <button
            onClick={() => setPaperFilter("Paper 1")}
            className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
              paperFilter === "Paper 1" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Paper 1
          </button>
          <button
            onClick={() => setPaperFilter("Paper 2")}
            className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
              paperFilter === "Paper 2" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Paper 2
          </button>
        </div>
      </div>

      {/* Main Visual Workspace Grid: Graph SVG (Left/Top) + Prerequisite Inspector Panel (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SVG Radial Graph Canvas (8 cols on large screens) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800/80 rounded-2xl p-2 sm:p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] sm:min-h-[560px]">
          
          {/* Ring Hierarchy Legend Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[11px] font-mono text-slate-300 space-y-1 z-10 shadow-lg">
            <div className="font-bold text-amber-400 uppercase text-[10px] tracking-wider mb-1">
              Concentric Rings
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300" />
              <span>Ring 1: Core Foundations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 border border-blue-300" />
              <span>Ring 2: Intermediate Topics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 border border-purple-300" />
              <span>Ring 3: Advanced Applications</span>
            </div>
          </div>

          {/* SVG Viewport */}
          <div className="w-full h-full flex items-center justify-center overflow-auto py-2">
            <svg
              viewBox="0 0 800 800"
              className="w-full max-w-[700px] h-auto transition-transform duration-300 ease-out select-none"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                {/* Radial Gradient Background */}
                <radialGradient id="ringBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                </radialGradient>
              </defs>

              {/* Background Circular Grid Rings */}
              <circle cx={SVG_CENTER_X} cy={SVG_CENTER_Y} r={RING_RADII[3]} fill="url(#ringBg)" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx={SVG_CENTER_X} cy={SVG_CENTER_Y} r={RING_RADII[2]} fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx={SVG_CENTER_X} cy={SVG_CENTER_Y} r={RING_RADII[1]} fill="none" stroke="#475569" strokeWidth="2" />

              {/* Ring Labels */}
              <text x={SVG_CENTER_X} y={SVG_CENTER_Y - RING_RADII[1] + 16} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                TIER 1 FOUNDATIONS
              </text>
              <text x={SVG_CENTER_X} y={SVG_CENTER_Y - RING_RADII[2] + 16} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                TIER 2 INTERMEDIATE
              </text>
              <text x={SVG_CENTER_X} y={SVG_CENTER_Y - RING_RADII[3] + 16} fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle">
                TIER 3 ADVANCED
              </text>

              {/* Central Hub Node */}
              <g className="cursor-pointer">
                <circle
                  cx={SVG_CENTER_X}
                  cy={SVG_CENTER_Y}
                  r="32"
                  fill="#0f172a"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  filter="url(#glow)"
                />
                <circle cx={SVG_CENTER_X} cy={SVG_CENTER_Y} r="24" fill="#1e293b" />
                <text
                  x={SVG_CENTER_X}
                  y={SVG_CENTER_Y - 4}
                  fill="#f59e0b"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  CAPS / IEB
                </text>
                <text
                  x={SVG_CENTER_X}
                  y={SVG_CENTER_Y + 9}
                  fill="#cbd5e1"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  MATH HUB
                </text>
              </g>

              {/* Dependency Connection Lines (Prerequisites & Downstream) */}
              {RADIAL_TOPIC_NODES.map((targetNode) => {
                const targetPos = nodePositions.get(targetNode.id);
                if (!targetPos) return null;

                return targetNode.prerequisites.map((prereqId) => {
                  const sourcePos = nodePositions.get(prereqId);
                  if (!sourcePos) return null;

                  const isSelectedPath =
                    selectedNode.id === targetNode.id && selectedNode.prerequisites.includes(prereqId);
                  const isUnlockingPath =
                    selectedNode.id === prereqId && targetNode.prerequisites.includes(selectedNode.id);

                  const isHighlighted = isSelectedPath || isUnlockingPath;
                  const isHovered = hoveredNodeId === targetNode.id || hoveredNodeId === prereqId;

                  if (showOnlyPrerequisites && !isHighlighted && selectedNode.id !== targetNode.id) {
                    return null;
                  }

                  // Calculate curved quadratic bezier path
                  const midX = (sourcePos.x + targetPos.x) / 2 + (targetPos.y - sourcePos.y) * 0.15;
                  const midY = (sourcePos.y + targetPos.y) / 2 - (targetPos.x - sourcePos.x) * 0.15;
                  const pathData = `M ${sourcePos.x} ${sourcePos.y} Q ${midX} ${midY} ${targetPos.x} ${targetPos.y}`;

                  return (
                    <g key={`link-${prereqId}-${targetNode.id}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={
                          isSelectedPath
                            ? "#f59e0b" // Gold Prerequisite path
                            : isUnlockingPath
                            ? "#3b82f6" // Blue Downstream path
                            : isHovered
                            ? "#94a3b8"
                            : "#334155"
                        }
                        strokeWidth={isHighlighted ? 3 : isHovered ? 2 : 1.2}
                        strokeDasharray={isSelectedPath ? "none" : isUnlockingPath ? "5 3" : "none"}
                        opacity={isHighlighted ? 1 : isHovered ? 0.8 : 0.35}
                      />
                      {/* Animated Flow Dot along highlighted prerequisite lines */}
                      {isSelectedPath && (
                        <circle r="4" fill="#fbbf24">
                          <animateMotion path={pathData} dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  );
                });
              })}

              {/* Nodes Rendering */}
              {filteredNodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;

                const isSelected = selectedNode.id === node.id;
                const isPrereq = selectedNode.prerequisites.includes(node.id);
                const isDependent = node.prerequisites.includes(selectedNode.id);
                const isHovered = hoveredNodeId === node.id;

                const catColor = getCategoryColor(node.category);
                const isMastered = node.masteryPercent >= 75;

                const radius = isSelected ? 22 : isHovered ? 20 : 16;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    {/* Ring Highlight Pulse for Selected Node */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 8}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        opacity="0.8"
                        className="animate-ping"
                      />
                    )}

                    {/* Prerequisite Glow Ring */}
                    {isPrereq && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 5}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Downstream Unlock Ring */}
                    {isDependent && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 5}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={isSelected ? "#020617" : "#0f172a"}
                      stroke={
                        isSelected
                          ? "#f59e0b"
                          : isPrereq
                          ? "#fbbf24"
                          : isDependent
                          ? "#60a5fa"
                          : catColor.stroke
                      }
                      strokeWidth={isSelected ? 3.5 : isPrereq || isDependent ? 2.5 : 2}
                      filter={isSelected ? "url(#glow)" : undefined}
                    />

                    {/* Mastery Fill Meter Arc or Mini Percent Text */}
                    <text
                      x={pos.x}
                      y={pos.y + 3}
                      fill={isSelected ? "#f59e0b" : "#ffffff"}
                      fontSize={isSelected ? "11" : "9"}
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.masteryPercent}%
                    </text>

                    {/* Node Title Label (Positioned radial outward) */}
                    <text
                      x={pos.x + (pos.x >= SVG_CENTER_X ? 20 : -20)}
                      y={pos.y + 4}
                      fill={isSelected ? "#f59e0b" : isPrereq ? "#fde047" : isDependent ? "#93c5fd" : "#e2e8f0"}
                      fontSize={isSelected ? "11" : "9.5"}
                      fontWeight={isSelected || isPrereq || isDependent ? "bold" : "normal"}
                      fontFamily="sans-serif"
                      textAnchor={pos.x >= SVG_CENTER_X ? "start" : "end"}
                      className="pointer-events-none drop-shadow-md"
                    >
                      {node.title.length > 22 ? `${node.title.slice(0, 20)}...` : node.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Prerequisite Inspector & Action Center (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Selected Node Card */}
          <div className="bg-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black border ${getCategoryColor(selectedNode.category).bg} ${getCategoryColor(selectedNode.category).border} ${getCategoryColor(selectedNode.category).text}`}>
                    {selectedNode.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedNode.paper}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {selectedNode.examWeightMarks}
                  </span>
                </div>
                <h3 className="text-xl font-black font-display text-white mt-1.5 leading-snug">
                  {selectedNode.title}
                </h3>
              </div>

              {/* Mastery Gauge Badge */}
              <div className="text-right shrink-0">
                <div className="text-2xl font-black font-mono text-amber-400">
                  {selectedNode.masteryPercent}%
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Mastery Level
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-800/80 pt-3">
              {selectedNode.description}
            </p>

            {/* Formula latex rendering if present */}
            {selectedNode.formulaLatex && (
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                  Core CAPS/IEB Formula Reference
                </span>
                <div className="text-sm font-mono text-white pt-1">
                  <LatexRenderer text={selectedNode.formulaLatex} />
                </div>
              </div>
            )}

            {/* PREREQUISITE READINESS INDEX ALERT */}
            <div className={`rounded-xl p-3 border text-xs font-sans space-y-1.5 ${
              prerequisiteReadiness.isReady
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                : "bg-amber-950/40 border-amber-500/50 text-amber-200"
            }`}>
              <div className="flex items-center gap-2 font-bold font-mono">
                {prerequisiteReadiness.isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  {prerequisiteReadiness.isReady
                    ? "Prerequisites Solid! Ready for Mastery"
                    : "Prerequisite Learning Gap Warning"}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed">
                {prerequisiteReadiness.isReady
                  ? `Your average prerequisite mastery is ${prerequisiteReadiness.averageMastery}%. You possess the required foundational skills for ${selectedNode.title}.`
                  : `Master prerequisite topic "${prerequisiteReadiness.weakest?.title}" (Current: ${prerequisiteReadiness.weakest?.masteryPercent}%) first to avoid conceptual difficulty.`}
              </p>
            </div>

            {/* PREREQUISITE TOPICS LIST */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  Prerequisite Foundations ({prerequisiteNodes.length})
                </span>
                <span className="text-[10px] text-slate-400">Required BEFORE this topic</span>
              </div>

              {prerequisiteNodes.length === 0 ? (
                <div className="p-3 bg-slate-900/60 rounded-xl text-center text-xs text-slate-400 font-sans italic border border-slate-800">
                  This is a foundational entry-level topic with no prerequisites!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {prerequisiteNodes.map((pNode) => (
                    <div
                      key={pNode.id}
                      onClick={() => setSelectedNodeId(pNode.id)}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${pNode.masteryPercent >= 70 ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <span className="text-xs font-bold font-sans text-slate-200 group-hover:text-amber-300">
                          {pNode.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className={pNode.masteryPercent >= 70 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {pNode.masteryPercent}%
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DOWNSTREAM UNLOCK TOPICS LIST */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Unlocked Downstream Topics ({dependentNodes.length})
                </span>
                <span className="text-[10px] text-slate-400">Unlocked AFTER mastering this</span>
              </div>

              {dependentNodes.length === 0 ? (
                <div className="p-2.5 bg-slate-900/60 rounded-xl text-center text-xs text-slate-400 font-sans italic border border-slate-800">
                  This is a terminal mastery topic in the Grade 12 CAPS/IEB syllabus!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {dependentNodes.map((dNode) => (
                    <div
                      key={dNode.id}
                      onClick={() => setSelectedNodeId(dNode.id)}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-400/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-xs font-bold font-sans text-slate-200 group-hover:text-blue-300">
                          {dNode.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs text-blue-400 font-bold">
                        <span>{dNode.masteryPercent}%</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK ACTIONS BUTTON BAR */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (onSelectTopicForPractice) {
                    onSelectTopicForPractice(selectedNode.title);
                  } else if (onAskAITutor) {
                    onAskAITutor(`Generate 3 exam-style practice questions on CAPS/IEB topic: ${selectedNode.title}`);
                  }
                }}
                className="px-3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Practice Topic</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onAskAITutor) {
                    onAskAITutor(`Explain the step-by-step mathematical dependency chain for ${selectedNode.title}. What prerequisite concepts must I master first?`);
                  }
                }}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI Tutor</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
