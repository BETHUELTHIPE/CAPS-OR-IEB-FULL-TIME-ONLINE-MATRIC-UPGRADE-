import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GitCommit, 
  CheckCircle2, 
  Clock, 
  Lock, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Award, 
  Layers, 
  Info, 
  CheckSquare, 
  Square, 
  Zap, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  Compass
} from "lucide-react";
import { Profile } from "../types";
import { getFromDB, saveToDB } from "../lib/db";

export interface SubTopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface RoadmapNode {
  id: string;
  grade: "Grade 10" | "Grade 11" | "Grade 12";
  paper: "Paper 1" | "Paper 2";
  title: string;
  category: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Functions" | "Probability" | "Financial Maths" | "Statistics";
  examWeight: string; // e.g. "25 ± 3 Marks (Paper 1)"
  status: "completed" | "in_progress" | "upcoming" | "locked";
  progressPercent: number;
  description: string;
  keyFormulas: string[];
  subTopics: SubTopic[];
  prerequisites?: string[];
}

const INITIAL_ROADMAP_DATA: RoadmapNode[] = [
  // --- GRADE 12 CAPS/IEB ---
  {
    id: "g12-algebra",
    grade: "Grade 12",
    paper: "Paper 1",
    title: "Algebra, Equations & Inequalities",
    category: "Algebra",
    examWeight: "25 ± 3 Marks",
    status: "completed",
    progressPercent: 100,
    description: "Solving quadratics, surds, exponents, logarithmic equations, and nature of roots.",
    keyFormulas: ["x = [-b ± √(b² - 4ac)] / 2a", "Δ = b² - 4ac", "log_b(xy) = log_b(x) + log_b(y)"],
    subTopics: [
      { id: "sub-g12-alg-1", title: "Completing the square & quadratic formula", completed: true },
      { id: "sub-g12-alg-2", title: "Surd equations & restriction checks", completed: true },
      { id: "sub-g12-alg-3", title: "Exponential & logarithmic equations", completed: true },
      { id: "sub-g12-alg-4", title: "Discriminant Δ & nature of roots", completed: true }
    ]
  },
  {
    id: "g12-patterns",
    grade: "Grade 12",
    paper: "Paper 1",
    title: "Patterns, Sequences & Series",
    category: "Algebra",
    examWeight: "25 ± 3 Marks",
    status: "completed",
    progressPercent: 100,
    description: "Arithmetic, geometric, quadratic sequences, sigma notation, and sum to infinity.",
    keyFormulas: ["T_n = a + (n - 1)d", "S_n = n/2 [2a + (n - 1)d]", "T_n = ar^(n-1)", "S_∞ = a / (1 - r)"],
    subTopics: [
      { id: "sub-g12-seq-1", title: "Arithmetic sequence general term & sum", completed: true },
      { id: "sub-g12-seq-2", title: "Geometric series & sum to infinity |r| < 1", completed: true },
      { id: "sub-g12-seq-3", title: "Quadratic sequence second difference 2a", completed: true },
      { id: "sub-g12-seq-4", title: "Sigma notation Σ manipulation", completed: true }
    ]
  },
  {
    id: "g12-functions",
    grade: "Grade 12",
    paper: "Paper 1",
    title: "Functions & Inverses",
    category: "Functions",
    examWeight: "35 ± 3 Marks",
    status: "completed",
    progressPercent: 100,
    description: "Parabola, hyperbola, exponential, logarithmic inverse functions, and line symmetry y = x.",
    keyFormulas: ["f(x) = a(x - p)² + q", "f(x) = a/(x - p) + q", "f⁻¹(x): swap x & y"],
    subTopics: [
      { id: "sub-g12-fn-1", title: "Definition of function & vertical line test", completed: true },
      { id: "sub-g12-fn-2", title: "Inverse of parabola f(x) = ax² (x ≥ 0)", completed: true },
      { id: "sub-g12-fn-3", title: "Inverse of exponential f(x) = b^x → log_b(x)", completed: true },
      { id: "sub-g12-fn-4", title: "Graph transformations & domain/range", completed: true }
    ]
  },
  {
    id: "g12-calculus",
    grade: "Grade 12",
    paper: "Paper 1",
    title: "Differential Calculus",
    category: "Calculus",
    examWeight: "35 ± 3 Marks",
    status: "in_progress",
    progressPercent: 70,
    description: "Limits, derivatives from first principles, differentiation rules, cubic graphs, tangents & optimization.",
    keyFormulas: ["f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", "d/dx [x^n] = n x^(n-1)", "m_tangent = f'(x_1)"],
    subTopics: [
      { id: "sub-g12-calc-1", title: "First principles derivative definition", completed: true },
      { id: "sub-g12-calc-2", title: "Rules of differentiation", completed: true },
      { id: "sub-g12-calc-3", title: "Cubic polynomial sketching & turning points", completed: false },
      { id: "sub-g12-calc-4", title: "Practical rate of change & optimization problems", completed: false }
    ],
    prerequisites: ["g12-functions"]
  },
  {
    id: "g12-finance",
    grade: "Grade 12",
    paper: "Paper 1",
    title: "Financial Mathematics",
    category: "Financial Maths",
    examWeight: "15 ± 3 Marks",
    status: "upcoming",
    progressPercent: 25,
    description: "Nominal vs effective interest rates, future & present value annuities, sinking funds & deferred loans.",
    keyFormulas: ["F = x [(1 + i)^n - 1] / i", "P = x [1 - (1 + i)^(-n)] / i", "1 + i_eff = (1 + i_nom/m)^m"],
    subTopics: [
      { id: "sub-g12-fin-1", title: "Effective vs nominal interest conversions", completed: true },
      { id: "sub-g12-fin-2", title: "Future value annuities F (savings)", completed: false },
      { id: "sub-g12-fin-3", title: "Present value annuities P (home loans)", completed: false },
      { id: "sub-g12-fin-4", title: "Sinking funds & asset replacement", completed: false }
    ],
    prerequisites: ["g12-patterns"]
  },
  {
    id: "g12-probability",
    grade: "Grade 12",
    paper: "Paper 1",
    title: "Probability & Counting Principle",
    category: "Probability",
    examWeight: "15 ± 3 Marks",
    status: "upcoming",
    progressPercent: 0,
    description: "Addition rule, independent events, tree & Venn diagrams, fundamental counting principle & permutations.",
    keyFormulas: ["P(A or B) = P(A) + P(B) - P(A and B)", "P(A and B) = P(A) · P(B) (Independent)", "n!"],
    subTopics: [
      { id: "sub-g12-prob-1", title: "Mutually exclusive & independent events", completed: false },
      { id: "sub-g12-prob-2", title: "Venn diagrams & contingency tables", completed: false },
      { id: "sub-g12-prob-3", title: "Fundamental counting principle n!", completed: false },
      { id: "sub-g12-prob-4", title: "Permutations with identical items", completed: false }
    ]
  },

  // --- PAPER 2 MODULES ---
  {
    id: "g12-trig-1",
    grade: "Grade 12",
    paper: "Paper 2",
    title: "Trigonometry: Compound & Double Angles",
    category: "Trigonometry",
    examWeight: "40 ± 3 Marks",
    status: "completed",
    progressPercent: 100,
    description: "Compound angle identities sin(α±β), cos(α±β), double angles sin(2α), cos(2α), and trig equations.",
    keyFormulas: ["sin(2α) = 2 sin α cos α", "cos(2α) = cos²α - sin²α", "sin(α ± β) = sin α cos β ± cos α sin β"],
    subTopics: [
      { id: "sub-g12-trig-1", title: "Reduction formulas & co-functions", completed: true },
      { id: "sub-g12-trig-2", title: "Compound angle expansion proofs", completed: true },
      { id: "sub-g12-trig-3", title: "Double angle identities application", completed: true },
      { id: "sub-g12-trig-4", title: "General solutions of trig equations", completed: true }
    ]
  },
  {
    id: "g12-analytical",
    grade: "Grade 12",
    paper: "Paper 2",
    title: "Analytical Geometry",
    category: "Geometry",
    examWeight: "40 ± 3 Marks",
    status: "in_progress",
    progressPercent: 50,
    description: "Distance, midpoint, gradient, inclination angle tan θ = m, equation of circle and tangents.",
    keyFormulas: ["(x - a)² + (y - b)² = r²", "tan θ = m", "m_1 · m_2 = -1 (Perpendicular)"],
    subTopics: [
      { id: "sub-g12-ana-1", title: "Inclination angle of a straight line", completed: true },
      { id: "sub-g12-ana-2", title: "Circle with center (a, b) equation", completed: true },
      { id: "sub-g12-ana-3", title: "Equation of tangent to circle (radius ⊥ tangent)", completed: false },
      { id: "sub-g12-ana-4", title: "Intersection of circle & straight line", completed: false }
    ]
  },
  {
    id: "g12-euclidean",
    grade: "Grade 12",
    paper: "Paper 2",
    title: "Euclidean Geometry & Proportionality",
    category: "Geometry",
    examWeight: "50 ± 3 Marks",
    status: "upcoming",
    progressPercent: 20,
    description: "Grade 11 Circle Theorems revision + Grade 12 Proportionality Theorem & Similar Triangles.",
    keyFormulas: ["Line || to side of Δ divides other sides proportionally", "Equiangular Δs are similar"],
    subTopics: [
      { id: "sub-g12-euc-1", title: "Circle theorems (tan-chord, cyclic quad, center angle)", completed: true },
      { id: "sub-g12-euc-2", title: "Proportionality Theorem proof & riders", completed: false },
      { id: "sub-g12-euc-3", title: "Similar triangles theorem proof & riders", completed: false },
      { id: "sub-g12-euc-4", title: "Pythagoras theorem ratio proofs", completed: false }
    ],
    prerequisites: ["g12-analytical"]
  },
  {
    id: "g12-stats",
    grade: "Grade 12",
    paper: "Paper 2",
    title: "Statistics & Regression",
    category: "Statistics",
    examWeight: "20 ± 3 Marks",
    status: "locked",
    progressPercent: 0,
    description: "Scatter plots, least squares regression line y = A + Bx, correlation coefficient r, and standard deviation.",
    keyFormulas: ["y = A + Bx", "r = correlation coefficient", "σ = standard deviation"],
    subTopics: [
      { id: "sub-g12-stat-1", title: "Scatter plot & bivariate data analysis", completed: false },
      { id: "sub-g12-stat-2", title: "Least squares regression line calculation", completed: false },
      { id: "sub-g12-stat-3", title: "Interpretation of correlation coefficient r", completed: false },
      { id: "sub-g12-stat-4", title: "Standard deviation & outlier identification", completed: false }
    ]
  }
];

export interface CurriculumRoadmapProps {
  user?: Profile | null;
  onSelectTopicForPractice?: (categoryName: string) => void;
}

export const CurriculumRoadmap: React.FC<CurriculumRoadmapProps> = ({ user, onSelectTopicForPractice }) => {
  const [activeGrade, setActiveGrade] = useState<"Grade 10" | "Grade 11" | "Grade 12">(
    (user?.grade as any) || "Grade 12"
  );
  const [selectedPaper, setSelectedPaper] = useState<"All" | "Paper 1" | "Paper 2">("All");
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>(INITIAL_ROADMAP_DATA);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [viewStyle, setViewStyle] = useState<"graph" | "timeline">("graph");

  // Load subtopic completed state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("amh_curriculum_subskills");
      const savedSubtopicState: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      if (Object.keys(savedSubtopicState).length > 0) {
        setRoadmapNodes(prevNodes => 
          prevNodes.map(node => {
            const updatedSubtopics = node.subTopics.map(sub => ({
              ...sub,
              completed: savedSubtopicState[sub.id] !== undefined ? savedSubtopicState[sub.id] : sub.completed
            }));

            const completedCount = updatedSubtopics.filter(s => s.completed).length;
            const newPercent = Math.round((completedCount / updatedSubtopics.length) * 100);
            
            let newStatus: RoadmapNode["status"] = node.status;
            if (newPercent === 100) newStatus = "completed";
            else if (newPercent > 0) newStatus = "in_progress";

            return {
              ...node,
              subTopics: updatedSubtopics,
              progressPercent: newPercent,
              status: newStatus
            };
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter nodes by active grade and paper
  const filteredNodes = roadmapNodes.filter(node => {
    if (node.grade !== activeGrade) return false;
    if (selectedPaper !== "All" && node.paper !== selectedPaper) return false;
    return true;
  });

  // Calculate Overall Syllabus Completion %
  const totalSubtopics = filteredNodes.reduce((acc, curr) => acc + curr.subTopics.length, 0);
  const completedSubtopics = filteredNodes.reduce((acc, curr) => acc + curr.subTopics.filter(s => s.completed).length, 0);
  const overallMasteryPercent = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

  // Toggle Subtopic Completion
  const handleToggleSubtopic = (nodeId: string, subtopicId: string) => {
    let savedSubtopicState: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem("amh_curriculum_subskills");
      if (raw) savedSubtopicState = JSON.parse(raw);
    } catch (e) {}
    
    setRoadmapNodes(prevNodes => {
      const updated = prevNodes.map(node => {
        if (node.id !== nodeId) return node;

        const newSubtopics = node.subTopics.map(sub => {
          if (sub.id !== subtopicId) return sub;
          const nextVal = !sub.completed;
          savedSubtopicState[sub.id] = nextVal;
          return { ...sub, completed: nextVal };
        });

        const completedCount = newSubtopics.filter(s => s.completed).length;
        const newPercent = Math.round((completedCount / newSubtopics.length) * 100);

        let newStatus: RoadmapNode["status"] = node.status;
        if (newPercent === 100) newStatus = "completed";
        else if (newPercent > 0) newStatus = "in_progress";
        else if (newStatus === "completed") newStatus = "upcoming";

        return {
          ...node,
          subTopics: newSubtopics,
          progressPercent: newPercent,
          status: newStatus
        };
      });

      localStorage.setItem("amh_curriculum_subskills", JSON.stringify(savedSubtopicState));

      // Keep selectedNode synced if drawer open
      if (selectedNode && selectedNode.id === nodeId) {
        const matchingNode = updated.find(n => n.id === nodeId);
        if (matchingNode) setSelectedNode(matchingNode);
      }

      return updated;
    });
  };

  // Helper styling for status
  const getNodeStatusBadge = (status: RoadmapNode["status"]) => {
    switch (status) {
      case "completed":
        return {
          label: "Mastered",
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2,
          nodeRing: "border-emerald-500 shadow-emerald-500/20 bg-emerald-950/80"
        };
      case "in_progress":
        return {
          label: "Active Focus",
          bg: "bg-gold-500/20 text-gold-300 border-gold-500/40 animate-pulse",
          icon: Zap,
          nodeRing: "border-gold-400 shadow-gold-500/30 bg-navy-900 ring-2 ring-gold-400/40"
        };
      case "upcoming":
        return {
          label: "Upcoming Module",
          bg: "bg-royal-500/20 text-royal-300 border-royal-500/40",
          icon: Compass,
          nodeRing: "border-royal-500 shadow-royal-500/10 bg-navy-950"
        };
      case "locked":
        return {
          label: "Locked (Prerequisites)",
          bg: "bg-navy-800 text-navy-400 border-navy-700",
          icon: Lock,
          nodeRing: "border-navy-800 bg-navy-950 opacity-60"
        };
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-950 border border-navy-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-navy-900 text-gold-400 font-black shadow-lg border border-royal-500/30 shrink-0">
            <GitCommit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-royal-400/20 text-royal-300 border border-royal-400/30 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-gold-400" /> Syllabus Roadmap
              </span>
              <span className="text-[11px] font-mono text-navy-300 font-bold">
                • South African NSC CAPS & IEB Curriculum
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight mt-0.5">
              Curriculum Progression & Module Roadmap
            </h2>
          </div>
        </div>

        {/* GRADE & PAPER CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Grade Selector Pills */}
          <div className="p-1 rounded-2xl bg-navy-950/90 border border-navy-800 flex items-center gap-1">
            {(["Grade 10", "Grade 11", "Grade 12"] as const).map((grade) => (
              <button
                key={grade}
                onClick={() => setActiveGrade(grade)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeGrade === grade
                    ? "bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black shadow-md"
                    : "text-navy-300 hover:text-white hover:bg-navy-850"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          {/* Paper Selector */}
          <div className="p-1 rounded-2xl bg-navy-950/90 border border-navy-800 flex items-center gap-1">
            {(["All", "Paper 1", "Paper 2"] as const).map((paper) => (
              <button
                key={paper}
                onClick={() => setSelectedPaper(paper)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedPaper === paper
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-400 hover:text-white"
                }`}
              >
                {paper}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="p-1 rounded-2xl bg-navy-950/90 border border-navy-800 flex items-center gap-1">
            <button
              onClick={() => setViewStyle("graph")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewStyle === "graph" ? "bg-navy-800 text-gold-400" : "text-navy-400 hover:text-white"
              }`}
              title="Connected Node Graph View"
            >
              <GitCommit className="w-3.5 h-3.5" /> Graph
            </button>
            <button
              onClick={() => setViewStyle("timeline")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewStyle === "timeline" ? "bg-navy-800 text-gold-400" : "text-navy-400 hover:text-white"
              }`}
              title="Sequential Timeline View"
            >
              <Layers className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>
        </div>
      </div>

      {/* OVERALL GRADE MASTERY PROGRESS BAR */}
      <div className="bg-navy-950/80 p-5 rounded-2xl border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-navy-300">
              {activeGrade} Overall Syllabus Completion
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-gold-500/20 text-gold-400 border border-gold-500/30">
              {completedSubtopics} / {totalSubtopics} Sub-skills Mastered
            </span>
          </div>
          <p className="text-xs text-navy-400 font-sans">
            Complete module sub-topics to unlock Level 7 Distinction status for matric finals.
          </p>
        </div>

        {/* Big Progress Bar */}
        <div className="flex items-center gap-4 md:w-80 shrink-0">
          <div className="flex-1 h-3 rounded-full bg-navy-850 overflow-hidden border border-navy-750 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-royal-500 via-gold-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${overallMasteryPercent}%` }}
            />
          </div>
          <span className="text-lg font-black font-mono text-gold-400 shrink-0">
            {overallMasteryPercent}%
          </span>
        </div>
      </div>

      {/* ROADMAP CANVAS / NODE GRAPH */}
      {viewStyle === "graph" ? (
        <div className="bg-navy-950/90 border border-navy-800/80 rounded-3xl p-6 md:p-8 relative z-10 space-y-8 overflow-x-auto min-h-[420px] flex flex-col justify-center">
          <div className="text-center space-y-1 mb-2">
            <span className="text-xs font-mono font-bold text-navy-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Interactive Learning Pathway
            </span>
            <p className="text-xs text-navy-300">Click any module node to open step-by-step subtopic proofs & formulas.</p>
          </div>

          {/* CONNECTED NODES FLOW GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
            {filteredNodes.map((node, index) => {
              const badgeInfo = getNodeStatusBadge(node.status);
              const BadgeIcon = badgeInfo.icon;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedNode(node)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${badgeInfo.nodeRing} hover:scale-[1.02] hover:shadow-2xl`}
                >
                  {/* Top Paper & Weight Ribbon */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-royal-900/80 text-royal-300 border border-royal-700">
                      {node.paper}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gold-400">
                      {node.examWeight}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-mono uppercase text-navy-400 font-bold block">
                      {node.category}
                    </span>
                    <h3 className="text-sm font-black font-display text-white leading-snug group-hover:text-gold-300 transition-colors">
                      {node.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-navy-300 line-clamp-2 leading-relaxed mb-4 font-sans">
                    {node.description}
                  </p>

                  {/* Progress Bar & Status Pill */}
                  <div className="space-y-2 pt-3 border-t border-navy-800/80">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${badgeInfo.bg}`}>
                        <BadgeIcon className="w-3 h-3" /> {badgeInfo.label}
                      </span>
                      <span className="font-extrabold text-navy-200">
                        {node.progressPercent}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          node.status === "completed"
                            ? "bg-emerald-400"
                            : node.status === "in_progress"
                            ? "bg-gold-400"
                            : "bg-royal-500"
                        }`}
                        style={{ width: `${node.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="absolute top-3 right-3 text-navy-600 group-hover:text-gold-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SEQUENTIAL TIMELINE VIEW */
        <div className="bg-navy-950/90 border border-navy-800/80 rounded-3xl p-6 md:p-8 relative z-10 space-y-6">
          <div className="relative border-l-2 border-navy-800 ml-4 md:ml-6 space-y-8 pl-6 md:pl-8">
            {filteredNodes.map((node, index) => {
              const badgeInfo = getNodeStatusBadge(node.status);
              const BadgeIcon = badgeInfo.icon;

              return (
                <div key={node.id} className="relative group">
                  {/* Circle Node Dot on Line */}
                  <div
                    className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110 ${
                      node.status === "completed"
                        ? "bg-emerald-500 border-emerald-400 text-navy-950"
                        : node.status === "in_progress"
                        ? "bg-gold-400 border-amber-300 text-navy-950 ring-4 ring-gold-400/20"
                        : "bg-navy-900 border-navy-700 text-navy-400"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Content Box */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 hover:border-navy-700 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-royal-900/80 text-royal-300 border border-royal-700">
                          {node.paper}
                        </span>
                        <span className="text-xs font-mono font-bold text-navy-400">
                          {node.category}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1 ${badgeInfo.bg}`}>
                        <BadgeIcon className="w-3 h-3" /> {badgeInfo.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black font-display text-white group-hover:text-gold-300 transition-colors">
                        {node.title}
                      </h3>
                      <p className="text-xs text-navy-300 font-sans mt-1 leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-navy-300 pt-2 border-t border-navy-800/60">
                      <span>Exam Weighting: <strong className="text-gold-400">{node.examWeight}</strong></span>
                      <span className="text-gold-400 font-bold flex items-center gap-1">
                        View Proofs & Formulas <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NODE DETAILS DRAWER MODAL */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-navy-900 border border-navy-750 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-navy-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-royal-900 text-royal-300 border border-royal-700">
                      {selectedNode.grade} • {selectedNode.paper}
                    </span>
                    <span className="text-xs font-mono font-bold text-gold-400">
                      {selectedNode.examWeight}
                    </span>
                  </div>
                  <h3 className="text-xl font-black font-display text-white">
                    {selectedNode.title}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 rounded-xl bg-navy-800 text-navy-400 hover:text-white cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-navy-200 leading-relaxed font-sans">
                {selectedNode.description}
              </p>

              {/* Formulas Box */}
              {selectedNode.keyFormulas.length > 0 && (
                <div className="p-4 rounded-2xl bg-navy-950/90 border border-navy-800 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-gold-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Key CAPS/IEB Formula Sheet Reference
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.keyFormulas.map((formula, idx) => (
                      <code
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 font-mono text-xs text-amber-300 font-semibold"
                      >
                        {formula}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Topics Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-navy-300 uppercase">
                  <span>Syllabus Sub-Topics Mastery Checklist</span>
                  <span className="text-gold-400">
                    {selectedNode.subTopics.filter(s => s.completed).length} / {selectedNode.subTopics.length} Done
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedNode.subTopics.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleToggleSubtopic(selectedNode.id, sub.id)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer text-xs md:text-sm font-semibold ${
                        sub.completed
                          ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                          : "bg-navy-950/60 border-navy-800 text-navy-300 hover:bg-navy-850"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {sub.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-navy-500 shrink-0" />
                        )}
                        <span className={sub.completed ? "line-through opacity-80" : ""}>
                          {sub.title}
                        </span>
                      </span>

                      {sub.completed && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Mastered
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-navy-800">
                {onSelectTopicForPractice && (
                  <button
                    onClick={() => {
                      onSelectTopicForPractice(selectedNode.category);
                      setSelectedNode(null);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black text-xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Practice {selectedNode.category} Exercises</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-navy-800 text-white font-bold text-xs hover:bg-navy-750 transition-colors cursor-pointer"
                >
                  Close Roadmap Node
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
