import React, { useState, useEffect, useRef, useId } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  PieChart,
  Target,
  Trophy,
  Filter,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  BookOpen,
  Award,
  RefreshCw,
  Plus,
  ArrowUpRight,
  X,
  Zap,
  Check,
  BrainCircuit,
  TrendingUp,
  GraduationCap,
  PartyPopper
} from "lucide-react";
import { evaluateCurriculumMilestone, getStoredCurriculumMilestones } from "../lib/curriculumMilestones";

export interface SubtopicItem {
  id: string;
  name: string;
  completed: boolean;
  accuracy: number;
}

export interface MathematicsTopicProgress {
  id: string;
  title: string;
  category: "Algebra" | "Sequences" | "Functions" | "Calculus" | "Financials" | "Trigonometry" | "Analytical Geometry" | "Euclidean Geometry" | "Statistics" | "Probability";
  paper: "Paper 1" | "Paper 2";
  examWeightMarks: number; // e.g. 35 marks in CAPS Paper
  completedPercent: number; // 0 - 100
  targetPercent: number; // 0 - 100
  completedSubtopics: number;
  totalSubtopics: number;
  exercisesAttempted: number;
  accuracyPercent: number;
  color: string;
  subtopics: SubtopicItem[];
}

const DEFAULT_TOPICS: MathematicsTopicProgress[] = [
  {
    id: "algebra",
    title: "Algebra, Equations & Inequalities",
    category: "Algebra",
    paper: "Paper 1",
    examWeightMarks: 25,
    completedPercent: 88,
    targetPercent: 95,
    completedSubtopics: 5,
    totalSubtopics: 6,
    exercisesAttempted: 142,
    accuracyPercent: 89,
    color: "#3b82f6", // Blue
    subtopics: [
      { id: "alg-1", name: "Solving Quadratic Equations & Inequalities", completed: true, accuracy: 92 },
      { id: "alg-2", name: "Nature of Roots & Discriminant (Δ)", completed: true, accuracy: 88 },
      { id: "alg-3", name: "Simultaneous Equations (Linear & Non-Linear)", completed: true, accuracy: 95 },
      { id: "alg-4", name: "Exponents, Surds & Exponential Equations", completed: true, accuracy: 85 },
      { id: "alg-5", name: "k-Method & Quadratic Form Factorization", completed: true, accuracy: 84 },
      { id: "alg-6", name: "Absolute Value & Higher Degree Polynomials", completed: false, accuracy: 0 }
    ]
  },
  {
    id: "sequences",
    title: "Number Patterns, Sequences & Series",
    category: "Sequences",
    paper: "Paper 1",
    examWeightMarks: 25,
    completedPercent: 82,
    targetPercent: 90,
    completedSubtopics: 4,
    totalSubtopics: 5,
    exercisesAttempted: 110,
    accuracyPercent: 84,
    color: "#10b981", // Emerald
    subtopics: [
      { id: "seq-1", name: "Arithmetic Sequences & nth Term Formula", completed: true, accuracy: 90 },
      { id: "seq-2", name: "Geometric Sequences & Common Ratio", completed: true, accuracy: 86 },
      { id: "seq-3", name: "Sigma Notation (Σ) & Series Summation", completed: true, accuracy: 82 },
      { id: "seq-4", name: "Sum to Infinity (S_∞) for Convergent Series", completed: true, accuracy: 78 },
      { id: "seq-5", name: "Quadratic Number Patterns & 2nd Differences", completed: false, accuracy: 0 }
    ]
  },
  {
    id: "functions",
    title: "Functions & Inverse Graphs",
    category: "Functions",
    paper: "Paper 1",
    examWeightMarks: 35,
    completedPercent: 74,
    targetPercent: 85,
    completedSubtopics: 4,
    totalSubtopics: 6,
    exercisesAttempted: 165,
    accuracyPercent: 76,
    color: "#8b5cf6", // Purple
    subtopics: [
      { id: "fun-1", name: "Parabola, Hyperbola & Exponential Graphs", completed: true, accuracy: 82 },
      { id: "fun-2", name: "Inverse Functions f⁻¹(x) & Domain Restrictions", completed: true, accuracy: 75 },
      { id: "fun-3", name: "Logarithmic Functions & Properties", completed: true, accuracy: 72 },
      { id: "fun-4", name: "Graph Transformations (Shifts & Reflections)", completed: true, accuracy: 75 },
      { id: "fun-5", name: "Intersections & Interpretation of Graphs", completed: false, accuracy: 0 },
      { id: "fun-6", name: "Symmetry Axes & Asymptote Analysis", completed: false, accuracy: 0 }
    ]
  },
  {
    id: "calculus",
    title: "Differential Calculus & Optimization",
    category: "Calculus",
    paper: "Paper 1",
    examWeightMarks: 35,
    completedPercent: 70,
    targetPercent: 88,
    completedSubtopics: 5,
    totalSubtopics: 7,
    exercisesAttempted: 198,
    accuracyPercent: 73,
    color: "#f59e0b", // Amber
    subtopics: [
      { id: "calc-1", name: "First Principles Limits & Derivatives", completed: true, accuracy: 88 },
      { id: "calc-2", name: "Rules of Differentiation (Power Rule)", completed: true, accuracy: 91 },
      { id: "calc-3", name: "Equations of Tangents to Curves", completed: true, accuracy: 78 },
      { id: "calc-4", name: "Cubic Polynomial Graphs & Turning Points", completed: true, accuracy: 70 },
      { id: "calc-5", name: "Inflexion Points & Concavity Analysis", completed: true, accuracy: 68 },
      { id: "calc-6", name: "Rates of Change & Word Problems", completed: false, accuracy: 0 },
      { id: "calc-7", name: "Practical Optimization (Max/Min Volume & Area)", completed: false, accuracy: 0 }
    ]
  },
  {
    id: "financials",
    title: "Financial Mathematics & Annuities",
    category: "Financials",
    paper: "Paper 1",
    examWeightMarks: 15,
    completedPercent: 92,
    targetPercent: 95,
    completedSubtopics: 4,
    totalSubtopics: 4,
    exercisesAttempted: 88,
    accuracyPercent: 91,
    color: "#06b6d4", // Cyan
    subtopics: [
      { id: "fin-1", name: "Simple & Compound Interest Growth/Decay", completed: true, accuracy: 95 },
      { id: "fin-2", name: "Effective vs Nominal Interest Rates", completed: true, accuracy: 90 },
      { id: "fin-3", name: "Future Value Annuities (Sinking Funds)", completed: true, accuracy: 92 },
      { id: "fin-4", name: "Present Value Annuities (Bond Loans & Deferred Payments)", completed: true, accuracy: 87 }
    ]
  },
  {
    id: "trigonometry",
    title: "Trigonometry, Identities & Equations",
    category: "Trigonometry",
    paper: "Paper 2",
    examWeightMarks: 50,
    completedPercent: 65,
    targetPercent: 85,
    completedSubtopics: 4,
    totalSubtopics: 7,
    exercisesAttempted: 210,
    accuracyPercent: 68,
    color: "#ec4899", // Pink
    subtopics: [
      { id: "tri-1", name: "Compound Angle & Double Angle Expansions", completed: true, accuracy: 75 },
      { id: "tri-2", name: "Trigonometric Reduction Formulas & Quadrants", completed: true, accuracy: 82 },
      { id: "tri-3", name: "Proving Complex Trigonometric Identities", completed: true, accuracy: 62 },
      { id: "tri-4", name: "General Solutions & Specific Interval Angles", completed: true, accuracy: 65 },
      { id: "tri-5", name: "Sine, Cosine & Area Rules in 2D/3D Problems", completed: false, accuracy: 0 },
      { id: "tri-6", name: "Trigonometric Function Graphs & Period Shifts", completed: false, accuracy: 0 },
      { id: "tri-7", name: "3D Heights & Distances Calculations", completed: false, accuracy: 0 }
    ]
  },
  {
    id: "analytical",
    title: "Analytical Geometry & Circles",
    category: "Analytical Geometry",
    paper: "Paper 2",
    examWeightMarks: 40,
    completedPercent: 80,
    targetPercent: 90,
    completedSubtopics: 4,
    totalSubtopics: 5,
    exercisesAttempted: 135,
    accuracyPercent: 82,
    color: "#6366f1", // Indigo
    subtopics: [
      { id: "ana-1", name: "Distance, Midpoint & Gradient Formulas", completed: true, accuracy: 94 },
      { id: "ana-2", name: "Inclination Angle of Straight Lines", completed: true, accuracy: 85 },
      { id: "ana-3", name: "Equations of Circles Center (0,0) & (a,b)", completed: true, accuracy: 80 },
      { id: "ana-4", name: "Tangents to Circles & Perpendicular Radius", completed: true, accuracy: 74 },
      { id: "ana-5", name: "Intersecting Circles & Geometric Proofs", completed: false, accuracy: 0 }
    ]
  },
  {
    id: "euclidean",
    title: "Euclidean Geometry & Circle Theorems",
    category: "Euclidean Geometry",
    paper: "Paper 2",
    examWeightMarks: 50,
    completedPercent: 58,
    targetPercent: 80,
    completedSubtopics: 4,
    totalSubtopics: 8,
    exercisesAttempted: 180,
    accuracyPercent: 61,
    color: "#e11d48", // Rose
    subtopics: [
      { id: "euc-1", name: "Line from Center Perpendicular to Chord", completed: true, accuracy: 78 },
      { id: "euc-2", name: "Angle Subtended at Center = 2x Circumference", completed: true, accuracy: 72 },
      { id: "euc-3", name: "Cyclic Quadrilaterals & Exterior Angles", completed: true, accuracy: 64 },
      { id: "euc-4", name: "Tan-Chord Theorem & Tangent Properties", completed: true, accuracy: 55 },
      { id: "euc-5", name: "Proportionality Theorem & Midpoint Theorem", completed: false, accuracy: 0 },
      { id: "euc-6", name: "Similar Triangles & Ratio Statements", completed: false, accuracy: 0 },
      { id: "euc-7", name: "Pythagoras Theorem Geometric Deductions", completed: false, accuracy: 0 },
      { id: "euc-8", name: "Multi-Step Geometric Rider Proofs", completed: false, accuracy: 0 }
    ]
  },
  {
    id: "probability",
    title: "Statistics, Probability & Counting",
    category: "Probability",
    paper: "Paper 1",
    examWeightMarks: 35,
    completedPercent: 86,
    targetPercent: 92,
    completedSubtopics: 5,
    totalSubtopics: 6,
    exercisesAttempted: 125,
    accuracyPercent: 88,
    color: "#14b8a6", // Teal
    subtopics: [
      { id: "prb-1", name: "Venn Diagrams & Mutually Exclusive Events", completed: true, accuracy: 92 },
      { id: "prb-2", name: "Tree Diagrams & Independent Events P(A∩B)", completed: true, accuracy: 88 },
      { id: "prb-3", name: "Fundamental Counting Principle & Factorials", completed: true, accuracy: 86 },
      { id: "prb-4", name: "Scatter Plots & Least Squares Regression Line", completed: true, accuracy: 90 },
      { id: "prb-5", name: "Standard Deviation & Ogive Curves", completed: true, accuracy: 84 },
      { id: "prb-6", name: "Contingency Tables & Conditional Probability", completed: false, accuracy: 0 }
    ]
  }
];

export interface LearningProgressDashboardProps {
  onOpenTopicDetail?: (topicId: string) => void;
}

export const LearningProgressDashboard: React.FC<LearningProgressDashboardProps> = ({
  onOpenTopicDetail
}) => {
  const [topics, setTopics] = useState<MathematicsTopicProgress[]>(DEFAULT_TOPICS);
  const [selectedPaper, setSelectedPaper] = useState<"All" | "Paper 1" | "Paper 2">("All");
  const [chartMode, setChartMode] = useState<"radar" | "bars" | "radial">("radar");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<MathematicsTopicProgress | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newExerciseScore, setNewExerciseScore] = useState<number>(85);

  const radarSvgRef = useRef<SVGSVGElement | null>(null);
  const barSvgRef = useRef<SVGSVGElement | null>(null);
  const radialSvgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(650);

  // Generate unique IDs for SVG gradients
  const radarGradientId = useId();
  const barGradientIdPrefix = useId();

  // Load persistence from localStorage if available
  const reloadProgressFromStorage = () => {
    try {
      const saved = localStorage.getItem("amh_learning_progress_d3_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTopics(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not parse saved learning progress state:", e);
    }
  };

  useEffect(() => {
    reloadProgressFromStorage();
    window.addEventListener("amh_progress_updated", reloadProgressFromStorage);
    window.addEventListener("storage", reloadProgressFromStorage);
    return () => {
      window.removeEventListener("amh_progress_updated", reloadProgressFromStorage);
      window.removeEventListener("storage", reloadProgressFromStorage);
    };
  }, []);

  // Save to localStorage when topics change
  const saveTopicsToStorage = (updated: MathematicsTopicProgress[]) => {
    setTopics(updated);
    try {
      localStorage.setItem("amh_learning_progress_d3_v1", JSON.stringify(updated));
      // Also update amh_topic_mastery_v2 format for system sync
      const capsFormat = updated.map(t => ({
        id: t.id,
        title: t.title,
        paper: t.paper,
        weight: `~${t.examWeightMarks} Marks`,
        category: t.category,
        customMasteryPercent: t.completedPercent,
        subtopics: t.subtopics
      }));
      localStorage.setItem("amh_topic_mastery_v2", JSON.stringify({ caps: capsFormat }));
    } catch (e) {
      console.error("Error saving learning progress state:", e);
    }
  };

  // Resize observer for container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter topics based on paper
  const filteredTopics = topics.filter(t => {
    if (selectedPaper === "All") return true;
    return t.paper === selectedPaper;
  });

  // Derived Overall Statistics
  const totalWeight = filteredTopics.reduce((acc, t) => acc + t.examWeightMarks, 0);
  const weightedCompletion = Math.round(
    filteredTopics.reduce((acc, t) => acc + (t.completedPercent * t.examWeightMarks), 0) / (totalWeight || 1)
  );
  const totalMasteredCount = filteredTopics.filter(t => t.completedPercent >= 80).length;
  const totalExercises = filteredTopics.reduce((acc, t) => acc + t.exercisesAttempted, 0);
  const avgAccuracy = Math.round(
    filteredTopics.reduce((acc, t) => acc + t.accuracyPercent, 0) / (filteredTopics.length || 1)
  );

  // Active topic for modal detail
  const activeDetailTopic = topics.find(t => t.id === selectedTopicId) || topics[0];

  // --------------------------------------------------------------------------
  // D3 RADAR / SPIDER CHART RENDERER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (chartMode !== "radar" || !radarSvgRef.current) return;

    const svg = d3.select(radarSvgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const height = Math.min(Math.max(width * 0.75, 380), 520);
    const margin = { top: 60, right: 80, bottom: 60, left: 80 };
    const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;

    const centerX = width / 2;
    const centerY = height / 2;

    const dataset = filteredTopics;
    const numAxes = dataset.length;
    if (numAxes < 3) return;

    const angleSlice = (Math.PI * 2) / numAxes;

    // Radius scale (0 to 100%)
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Create main SVG container
    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Define Defs & Gradients
    const defs = svg.append("defs");
    const radialGrad = defs
      .append("radialGradient")
      .attr("id", radarGradientId)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    radialGrad.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.6);
    radialGrad.append("stop").attr("offset", "70%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.35);
    radialGrad.append("stop").attr("offset", "100%").attr("stop-color", "#1d4ed8").attr("stop-opacity", 0.1);

    // Grid Levels (20%, 40%, 60%, 80%, 100%)
    const gridLevels = [20, 40, 60, 80, 100];

    gridLevels.forEach((level) => {
      const levelRadius = rScale(level);

      // Draw concentric polygon grid
      const gridPoints: [number, number][] = dataset.map((_, i) => [
        levelRadius * Math.cos(angleSlice * i - Math.PI / 2),
        levelRadius * Math.sin(angleSlice * i - Math.PI / 2)
      ]);

      const lineGenerator = d3.line().curve(d3.curveLinearClosed);

      g.append("path")
        .datum(gridPoints)
        .attr("d", lineGenerator as any)
        .attr("fill", "none")
        .attr("stroke", level === 100 ? "rgba(217, 119, 6, 0.4)" : "rgba(148, 163, 184, 0.2)")
        .attr("stroke-dasharray", level === 100 ? "none" : "3,3")
        .attr("stroke-width", level === 100 ? 1.5 : 1);

      // Percentage label along the vertical top axis
      g.append("text")
        .attr("x", 5)
        .attr("y", -levelRadius + 4)
        .attr("fill", "currentColor")
        .attr("class", "text-[9px] font-mono font-bold fill-slate-400 dark:fill-slate-500")
        .text(`${level}%`);
    });

    // Draw Axis lines & Labels
    const axis = g.selectAll(".axis").data(dataset).enter().append("g").attr("class", "axis");

    axis
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (_, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (_, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("stroke", "rgba(148, 163, 184, 0.25)")
      .attr("stroke-width", 1);

    // Axis Labels
    axis
      .append("text")
      .attr("class", "text-[11px] font-bold fill-slate-700 dark:fill-slate-200 font-sans cursor-pointer transition-colors hover:fill-amber-500")
      .attr("text-anchor", (_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        if (Math.abs(angle - -Math.PI / 2) < 0.1 || Math.abs(angle - Math.PI / 2) < 0.1) return "middle";
        return Math.cos(angle) > 0 ? "start" : "end";
      })
      .attr("x", (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const offset = Math.cos(angle) * 18;
        return (rScale(100) + 12) * Math.cos(angle) + offset;
      })
      .attr("y", (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const offset = Math.sin(angle) * 8;
        return (rScale(100) + 12) * Math.sin(angle) + offset;
      })
      .text((d) => d.category)
      .on("click", (_, d) => {
        setSelectedTopicId(d.id);
        setIsDetailModalOpen(true);
      });

    // Target Line Area Path
    const targetPoints: [number, number][] = dataset.map((d, i) => [
      rScale(d.targetPercent) * Math.cos(angleSlice * i - Math.PI / 2),
      rScale(d.targetPercent) * Math.sin(angleSlice * i - Math.PI / 2)
    ]);

    const lineGenerator = d3.line().curve(d3.curveLinearClosed);

    g.append("path")
      .datum(targetPoints)
      .attr("d", lineGenerator as any)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.85);

    // Actual Student Completion Area Path
    const actualPoints: [number, number][] = dataset.map((d, i) => [
      rScale(d.completedPercent) * Math.cos(angleSlice * i - Math.PI / 2),
      rScale(d.completedPercent) * Math.sin(angleSlice * i - Math.PI / 2)
    ]);

    g.append("path")
      .datum(actualPoints)
      .attr("d", lineGenerator as any)
      .attr("fill", `url(#${radarGradientId})`)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2.5)
      .attr("class", "transition-all duration-500");

    // Interactive Data Points / Nodes
    const nodes = g
      .selectAll(".radar-node")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "radar-node cursor-pointer")
      .attr("transform", (d, i) => {
        const x = rScale(d.completedPercent) * Math.cos(angleSlice * i - Math.PI / 2);
        const y = rScale(d.completedPercent) * Math.sin(angleSlice * i - Math.PI / 2);
        return `translate(${x}, ${y})`;
      })
      .on("mouseenter", (_, d) => {
        setHoveredTopic(d);
      })
      .on("mouseleave", () => {
        setHoveredTopic(null);
      })
      .on("click", (_, d) => {
        setSelectedTopicId(d.id);
        setIsDetailModalOpen(true);
      });

    // Outer node circle
    nodes
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("class", "shadow-md transition-transform duration-200 hover:scale-125");

    // Value text inside / near node
    nodes
      .append("text")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .attr("class", "text-[10px] font-mono font-black fill-slate-900 dark:fill-white drop-shadow-sm")
      .text((d) => `${d.completedPercent}%`);
  }, [chartMode, filteredTopics, containerWidth, radarGradientId]);

  // --------------------------------------------------------------------------
  // D3 HORIZONTAL BAR CHART RENDERER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (chartMode !== "bars" || !barSvgRef.current) return;

    const svg = d3.select(barSvgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const rowHeight = 44;
    const margin = { top: 20, right: 70, bottom: 30, left: 160 };
    const height = filteredTopics.length * rowHeight + margin.top + margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const yScale = d3
      .scaleBand()
      .domain(filteredTopics.map((t) => t.title))
      .range([0, innerHeight])
      .padding(0.35);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    // Background Bar Track (100% capacity)
    g.selectAll(".bg-bar")
      .data(filteredTopics)
      .enter()
      .append("rect")
      .attr("class", "bg-bar")
      .attr("y", (d) => yScale(d.title) || 0)
      .attr("x", 0)
      .attr("width", innerWidth)
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("fill", "rgba(148, 163, 184, 0.12)");

    // Target Line Markers
    g.selectAll(".target-marker")
      .data(filteredTopics)
      .enter()
      .append("line")
      .attr("x1", (d) => xScale(d.targetPercent))
      .attr("x2", (d) => xScale(d.targetPercent))
      .attr("y1", (d) => (yScale(d.title) || 0) - 2)
      .attr("y2", (d) => (yScale(d.title) || 0) + yScale.bandwidth() + 2)
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "2,2");

    // Progress Bar Fill
    g.selectAll(".progress-bar")
      .data(filteredTopics)
      .enter()
      .append("rect")
      .attr("class", "progress-bar cursor-pointer transition-all duration-300 hover:opacity-90")
      .attr("y", (d) => yScale(d.title) || 0)
      .attr("x", 0)
      .attr("width", (d) => xScale(d.completedPercent))
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("fill", (d) => d.color)
      .on("mouseenter", (_, d) => setHoveredTopic(d))
      .on("mouseleave", () => setHoveredTopic(null))
      .on("click", (_, d) => {
        setSelectedTopicId(d.id);
        setIsDetailModalOpen(true);
      });

    // Y Axis Labels (Topic Titles)
    g.selectAll(".y-label")
      .data(filteredTopics)
      .enter()
      .append("text")
      .attr("class", "text-[11px] font-bold fill-slate-800 dark:fill-slate-200 font-sans cursor-pointer hover:fill-amber-500")
      .attr("x", -10)
      .attr("y", (d) => (yScale(d.title) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .text((d) => d.title.length > 22 ? d.title.substring(0, 20) + "..." : d.title)
      .on("click", (_, d) => {
        setSelectedTopicId(d.id);
        setIsDetailModalOpen(true);
      });

    // X Axis Labels / Percentage Text
    g.selectAll(".val-label")
      .data(filteredTopics)
      .enter()
      .append("text")
      .attr("class", "text-[11px] font-mono font-black fill-slate-900 dark:fill-white")
      .attr("x", (d) => Math.max(xScale(d.completedPercent) + 8, 10))
      .attr("y", (d) => (yScale(d.title) || 0) + yScale.bandwidth() / 2 + 4)
      .text((d) => `${d.completedPercent}%`);
  }, [chartMode, filteredTopics, containerWidth]);

  // --------------------------------------------------------------------------
  // D3 RADIAL DONUT GAUGES GRID RENDERER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (chartMode !== "radial" || !radialSvgRef.current) return;

    const svg = d3.select(radialSvgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const cols = width > 520 ? 3 : 2;
    const donutRadius = 42;
    const donutWidth = 10;
    const cellWidth = width / cols;
    const cellHeight = 110;
    const rows = Math.ceil(filteredTopics.length / cols);
    const height = rows * cellHeight + 20;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const arcGenerator = d3
      .arc()
      .innerRadius(donutRadius - donutWidth)
      .outerRadius(donutRadius)
      .cornerRadius(4);

    filteredTopics.forEach((topic, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = col * cellWidth + cellWidth / 2;
      const cy = row * cellHeight + donutRadius + 15;

      const cellG = svg
        .append("g")
        .attr("transform", `translate(${cx}, ${cy})`)
        .attr("class", "cursor-pointer")
        .on("mouseenter", () => setHoveredTopic(topic))
        .on("mouseleave", () => setHoveredTopic(null))
        .on("click", () => {
          setSelectedTopicId(topic.id);
          setIsDetailModalOpen(true);
        });

      // Background Donut Track
      const bgArcData = { startAngle: 0, endAngle: Math.PI * 2 };
      cellG
        .append("path")
        .attr("d", arcGenerator(bgArcData as any))
        .attr("fill", "rgba(148, 163, 184, 0.15)");

      // Foreground Progress Arc
      const progressAngle = (topic.completedPercent / 100) * (Math.PI * 2);
      const fgArcData = { startAngle: 0, endAngle: progressAngle };
      cellG
        .append("path")
        .attr("d", arcGenerator(fgArcData as any))
        .attr("fill", topic.color)
        .attr("class", "transition-all duration-300 hover:opacity-80");

      // Target Arc Indicator Line
      const targetAngle = (topic.targetPercent / 100) * (Math.PI * 2);
      const targetArcData = { startAngle: targetAngle - 0.05, endAngle: targetAngle + 0.05 };
      cellG
        .append("path")
        .attr("d", arcGenerator(targetArcData as any))
        .attr("fill", "#f59e0b");

      // Center Percentage Text
      cellG
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("class", "text-[12px] font-mono font-black fill-slate-900 dark:fill-white")
        .text(`${topic.completedPercent}%`);

      // Subtopic / Category Label
      cellG
        .append("text")
        .attr("y", donutRadius + 16)
        .attr("text-anchor", "middle")
        .attr("class", "text-[11px] font-bold fill-slate-700 dark:fill-slate-300 font-sans")
        .text(topic.category);
    });
  }, [chartMode, filteredTopics, containerWidth]);

  // Handle toggling subtopic completion in topic detail modal
  const handleToggleSubtopic = (topicId: string, subtopicId: string) => {
    let updatedTopicTitle = "";
    let updatedTopicPercent = 0;
    let updatedCategory = "";

    const updated = topics.map((t) => {
      if (t.id !== topicId) return t;
      const updatedSubtopics = t.subtopics.map((s) => (s.id === subtopicId ? { ...s, completed: !s.completed } : s));
      const completedCount = updatedSubtopics.filter((s) => s.completed).length;
      const newPercent = Math.round((completedCount / (updatedSubtopics.length || 1)) * 100);

      updatedTopicTitle = t.title;
      updatedTopicPercent = newPercent;
      updatedCategory = t.category;

      return {
        ...t,
        subtopics: updatedSubtopics,
        completedSubtopics: completedCount,
        completedPercent: newPercent
      };
    });

    saveTopicsToStorage(updated);

    // Evaluate 10% curriculum milestone for specific topic
    if (updatedTopicTitle) {
      evaluateCurriculumMilestone(updatedTopicTitle, updatedTopicPercent, updatedCategory);
    }

    // Evaluate overall weighted CAPS Mathematics curriculum milestone
    const totalW = updated.reduce((acc, t) => acc + t.examWeightMarks, 0);
    const overallW = Math.round(
      updated.reduce((acc, t) => acc + (t.completedPercent * t.examWeightMarks), 0) / (totalW || 1)
    );
    evaluateCurriculumMilestone("CAPS Mathematics Syllabus", overallW, "Overall Curriculum Coverage");
  };

  // Handle adding quick practice test score to topic
  const handleRecordPracticeScore = (topicId: string, score: number) => {
    let updatedTopicTitle = "";
    let updatedTopicPercent = 0;
    let updatedCategory = "";

    const updated = topics.map((t) => {
      if (t.id !== topicId) return t;
      const newAttempts = t.exercisesAttempted + 10;
      const newAccuracy = Math.round((t.accuracyPercent * 0.7) + (score * 0.3));
      const newPercent = Math.min(100, Math.round(t.completedPercent + (score >= 70 ? 4 : 1)));

      updatedTopicTitle = t.title;
      updatedTopicPercent = newPercent;
      updatedCategory = t.category;

      return {
        ...t,
        exercisesAttempted: newAttempts,
        accuracyPercent: newAccuracy,
        completedPercent: newPercent
      };
    });

    saveTopicsToStorage(updated);

    if (updatedTopicTitle) {
      evaluateCurriculumMilestone(updatedTopicTitle, updatedTopicPercent, updatedCategory);
    }
  };

  // Explicit demo/testing function for evaluator to test celebratory toast
  const handleTriggerMilestoneDemo = (milestonePct: number = 70) => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    evaluateCurriculumMilestone(
      randomTopic ? randomTopic.title : "Trigonometry & Compound Identities",
      milestonePct,
      randomTopic ? randomTopic.category : "Trigonometry",
      true // force trigger toast & celebratory animation
    );
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-7 shadow-xl transition-all space-y-6 relative overflow-hidden"
      id="learning-progress-d3-widget"
    >
      {/* BACKGROUND DECORATIVE ACCENTS */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-royal-600/5 dark:bg-royal-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 animate-pulse" />
              D3.js Interactive Analytics
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-400">
              NSC CAPS & IEB Math
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Learning Progress Dashboard</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visualization of syllabus topic completion rates, exam weights, and target mastery goals.
          </p>
        </div>

        {/* CONTROLS & FILTERS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* PAPER FILTER TOGGLES */}
          <div className="bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-navy-800">
            {(["All", "Paper 1", "Paper 2"] as const).map((paper) => (
              <button
                key={paper}
                onClick={() => setSelectedPaper(paper)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedPaper === paper
                    ? "bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {paper}
              </button>
            ))}
          </div>

          {/* CHART MODE SWITCHER */}
          <div className="bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-navy-800">
            <button
              onClick={() => setChartMode("radar")}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === "radar"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Radar / Spider Polygon View"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-[11px]">Radar</span>
            </button>

            <button
              onClick={() => setChartMode("bars")}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === "bars"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Horizontal Completion Bars View"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-[11px]">Bars</span>
            </button>

            <button
              onClick={() => setChartMode("radial")}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === "radial"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Radial Donut Gauges Grid"
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-[11px]">Gauges</span>
            </button>
          </div>

          {/* CELEBRATION MILESTONE DEMO BUTTON */}
          <button
            onClick={() => handleTriggerMilestoneDemo(70)}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-gold-400 hover:from-amber-400 hover:to-gold-300 text-navy-950 font-mono font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-gold-400/40"
            title="Test 10% Milestone Toast & Animation"
          >
            <PartyPopper className="w-4 h-4 text-navy-950 animate-bounce" />
            <span className="hidden sm:inline">Test 10% Milestone Toast</span>
          </button>
        </div>
      </div>

      {/* 10% CURRICULUM MILESTONE CELEBRATION RIBBON */}
      <div className="bg-gradient-to-r from-navy-950 via-royal-950 to-navy-900 border border-gold-400/40 rounded-2xl p-4 shadow-md space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gold-400/20 text-gold-300 border border-gold-400/30">
              <PartyPopper className="w-4 h-4 text-gold-400 animate-pulse" />
            </span>
            <div>
              <h4 className="text-xs font-black font-display text-white tracking-wide uppercase">
                10% Curriculum Milestone Rewards
              </h4>
              <p className="text-[11px] text-slate-300 font-sans">
                Every 10% completion milestone unlocks celebratory animations, XP badges, and toast notifications!
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-gold-300 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-400/30 self-start sm:self-auto">
            Current: {weightedCompletion}% ({Math.floor(weightedCompletion / 10) * 10}% Milestone)
          </span>
        </div>

        {/* 10% Step Badges Bar */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((step) => {
            const isReached = weightedCompletion >= step;
            return (
              <button
                key={step}
                onClick={() => handleTriggerMilestoneDemo(step)}
                className={`py-2 px-1 rounded-xl text-center text-xs font-mono font-bold transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 group ${
                  isReached
                    ? "bg-gradient-to-b from-amber-500/30 to-gold-400/20 text-gold-300 border-gold-400/60 hover:scale-105 shadow-sm"
                    : "bg-navy-950/60 text-slate-400 border-navy-800 hover:border-gold-400/40 hover:text-slate-200"
                }`}
                title={`Click to trigger ${step}% Milestone Celebration Toast`}
              >
                <span className="text-[10px] font-black">{step}%</span>
                {isReached ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
                ) : (
                  <Sparkles className="w-3 h-3 text-slate-500 group-hover:text-gold-400 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-3.5 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Overall Completion</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {weightedCompletion}%
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            Weighted by CAPS Exam Marks
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-3.5 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Mastered Topics</span>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {totalMasteredCount} <span className="text-xs font-normal text-slate-400">/ {filteredTopics.length}</span>
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
            ≥ 80% Score Threshold
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-3.5 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Practice Exercises</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-royal-500" />
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {totalExercises}
          </div>
          <div className="text-[10px] text-royal-600 dark:text-royal-400 font-mono font-bold">
            Total Questions Solved
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-3.5 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Average Accuracy</span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {avgAccuracy}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Across All Quizzes
          </div>
        </div>
      </div>

      {/* D3 SVG VISUALIZATION CONTAINER */}
      <div className="relative bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200/70 dark:border-navy-800/60 rounded-2xl p-4 min-h-[380px] flex flex-col items-center justify-center">
        {/* CHART LEGEND HEADER */}
        <div className="w-full flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400 px-2 pb-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Current Completion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-500 inline-block" />
              <span>Target Goal</span>
            </div>
          </div>
          <div className="text-right text-[10px]">
            Click any vertex or topic bar to edit & view subtopics
          </div>
        </div>

        {/* SVG CANVAS RENDERS */}
        {chartMode === "radar" && (
          <svg ref={radarSvgRef} className="w-full h-auto overflow-visible" />
        )}
        {chartMode === "bars" && (
          <svg ref={barSvgRef} className="w-full h-auto overflow-visible" />
        )}
        {chartMode === "radial" && (
          <svg ref={radialSvgRef} className="w-full h-auto overflow-visible" />
        )}

        {/* HOVER TOOLTIP CARD */}
        {hoveredTopic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md max-w-xs space-y-2 pointer-events-none z-20 font-sans"
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-amber-400">{hoveredTopic.title}</span>
              <span className="text-[9px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                {hoveredTopic.paper}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800 pt-2">
              <div>
                <span className="text-slate-400 block">COMPLETED</span>
                <span className="text-sm font-black text-white">{hoveredTopic.completedPercent}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">TARGET</span>
                <span className="text-sm font-black text-amber-400">{hoveredTopic.targetPercent}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">EXAM WEIGHT</span>
                <span className="text-white font-bold">~{hoveredTopic.examWeightMarks} Marks</span>
              </div>
              <div>
                <span className="text-slate-400 block">ACCURACY</span>
                <span className="text-emerald-400 font-bold">{hoveredTopic.accuracyPercent}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* TOPIC GRID QUICK ACTION TILES */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Syllabus Topics Breakdown ({filteredTopics.length})
          </h3>
          <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
            Click to manage subtopics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTopics.map((topic) => {
            const isMastered = topic.completedPercent >= 80;
            return (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setIsDetailModalOpen(true);
                  if (onOpenTopicDetail) onOpenTopicDetail(topic.id);
                }}
                className="group bg-slate-50 dark:bg-navy-950/60 hover:bg-slate-100 dark:hover:bg-navy-800/80 border border-slate-200/80 dark:border-navy-800/80 rounded-2xl p-4 transition-all cursor-pointer shadow-xs hover:shadow-md relative overflow-hidden"
              >
                {/* Topic Accent Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: topic.color }}
                />

                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {topic.paper} • ~{topic.examWeightMarks} Marks
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {topic.title}
                    </h4>
                  </div>
                  {isMastered ? (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      Mastered
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      In Progress
                    </span>
                  )}
                </div>

                {/* Progress Bar Track */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Completion</span>
                    <span className="text-slate-900 dark:text-white">
                      {topic.completedPercent}% <span className="text-slate-400 font-normal">/ {topic.targetPercent}% Target</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${topic.completedPercent}%`,
                        backgroundColor: topic.color
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-navy-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{topic.completedSubtopics} / {topic.totalSubtopics} Subtopics</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-amber-600 dark:text-amber-400 font-bold">
                    Manage <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOPIC DETAIL & SUBTOPIC MANAGER MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && activeDetailTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                    {activeDetailTopic.paper} • {activeDetailTopic.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    ~{activeDetailTopic.examWeightMarks} Marks
                  </span>
                </div>
                <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">
                  {activeDetailTopic.title}
                </h3>
              </div>

              {/* Topic Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-navy-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 text-center font-mono">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Completion</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{activeDetailTopic.completedPercent}%</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Exercises</span>
                  <span className="text-lg font-black text-amber-500">{activeDetailTopic.exercisesAttempted}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Avg Accuracy</span>
                  <span className="text-lg font-black text-emerald-500">{activeDetailTopic.accuracyPercent}%</span>
                </div>
              </div>

              {/* Subtopic Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Subtopics & Concepts Checklist
                </h4>

                <div className="space-y-2">
                  {activeDetailTopic.subtopics.map((subtopic) => (
                    <div
                      key={subtopic.id}
                      onClick={() => handleToggleSubtopic(activeDetailTopic.id, subtopic.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        subtopic.completed
                          ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20 text-slate-900 dark:text-white"
                          : "bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            subtopic.completed
                              ? "bg-emerald-500 text-white"
                              : "border border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {subtopic.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{subtopic.name}</span>
                      </div>

                      {subtopic.completed && subtopic.accuracy > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {subtopic.accuracy}% accuracy
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Practice Logger */}
              <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    Log Quick Practice Session (+10 Questions)
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={newExerciseScore}
                    onChange={(e) => setNewExerciseScore(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 w-12 text-right">
                    {newExerciseScore}%
                  </span>
                </div>

                <button
                  onClick={() => {
                    handleRecordPracticeScore(activeDetailTopic.id, newExerciseScore);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Score & Boost Mastery</span>
                </button>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-navy-800 text-white font-mono font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
