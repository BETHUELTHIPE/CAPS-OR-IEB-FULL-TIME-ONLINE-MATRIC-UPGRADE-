import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  Network, 
  Search, 
  Filter, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Award, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sliders, 
  X, 
  HelpCircle,
  Video,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Target,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LatexRenderer } from "./LatexRenderer";
import { Profile } from "../types";

export interface KnowledgeNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "topic" | "subtopic" | "formula" | "theorem";
  paper: "Paper 1" | "Paper 2" | "Both";
  syllabus: "CAPS" | "IEB" | "Both";
  category: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Probability" | "Functions" | "Financials" | "Sequences";
  mastery: number; // 0 - 100
  description: string;
  formulaText?: string;
  examWeight?: string;
  prerequisites?: string[]; // IDs of required nodes
  completedSubtopicsCount?: number;
  totalSubtopicsCount?: number;
}

export interface KnowledgeLink extends d3.SimulationLinkDatum<KnowledgeNode> {
  source: string | KnowledgeNode;
  target: string | KnowledgeNode;
  type: "belongs_to" | "prerequisite" | "uses_formula" | "cross_domain";
  label?: string;
}

interface KnowledgeGraphProps {
  user?: Profile;
  onSelectTopicForVideo?: (topicTitle: string) => void;
  onAskAITutor?: (query: string) => void;
  onStartPracticeSession?: (topicTitle: string) => void;
}

// Full seed data mapping the South African CAPS & IEB Grade 10-12 Mathematics Curriculum
export const initialNodes: KnowledgeNode[] = [
  // --- ALGEBRA & EQUATIONS ---
  {
    id: "topic_algebra",
    label: "Algebra & Equations",
    type: "topic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Algebra",
    mastery: 85,
    description: "Core algebraic techniques including quadratic equations, inequalities, exponents, and nature of roots.",
    examWeight: "~25 Marks",
  },
  {
    id: "sub_quadratic_eq",
    label: "Quadratic Formula & Factoring",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Algebra",
    mastery: 90,
    description: "Solving second-degree equations by factorization, completing the square, or quadratic formula.",
    prerequisites: ["topic_algebra"],
  },
  {
    id: "form_quadratic_formula",
    label: "Quadratic Formula",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Algebra",
    mastery: 95,
    description: "Standard formula to derive real or complex roots of ax² + bx + c = 0.",
    formulaText: "x = [-b ± √(b² - 4ac)] / 2a",
    prerequisites: ["sub_quadratic_eq"],
  },
  {
    id: "sub_nature_roots",
    label: "Nature of Roots & Discriminant",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Algebra",
    mastery: 65,
    description: "Analyzing the discriminant Δ to determine whether roots are real, equal, non-real, or rational.",
    prerequisites: ["form_quadratic_formula"],
  },
  {
    id: "form_discriminant",
    label: "Discriminant Formula",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Algebra",
    mastery: 70,
    description: "The value under the square root in the quadratic equation.",
    formulaText: "Δ = b² - 4ac",
    prerequisites: ["sub_nature_roots"],
  },
  {
    id: "sub_inequalities",
    label: "Quadratic Inequalities",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Algebra",
    mastery: 80,
    description: "Solving inequalities using critical values, number lines, and interval notation.",
    prerequisites: ["sub_quadratic_eq"],
  },
  {
    id: "sub_exponents_surds",
    label: "Exponents & Surds",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Algebra",
    mastery: 88,
    description: "Simplifying surds, rationalizing denominators, and solving exponential equations.",
    prerequisites: ["topic_algebra"],
  },

  // --- SEQUENCES & SERIES ---
  {
    id: "topic_sequences",
    label: "Sequences & Series",
    type: "topic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Sequences",
    mastery: 78,
    description: "Arithmetic, geometric, quadratic patterns, and infinite series sum convergence.",
    examWeight: "~25 Marks",
    prerequisites: ["topic_algebra"],
  },
  {
    id: "form_arithmetic_nth",
    label: "Arithmetic n-th Term",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Sequences",
    mastery: 92,
    description: "General term formula for arithmetic sequences with constant common difference d.",
    formulaText: "T_n = a + (n - 1)d",
    prerequisites: ["topic_sequences"],
  },
  {
    id: "form_arithmetic_sum",
    label: "Arithmetic Series Sum",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Sequences",
    mastery: 85,
    description: "Sum of first n terms in an arithmetic series.",
    formulaText: "S_n = n/2 [2a + (n - 1)d]",
    prerequisites: ["form_arithmetic_nth"],
  },
  {
    id: "form_geometric_nth",
    label: "Geometric n-th Term",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Sequences",
    mastery: 80,
    description: "General term formula for geometric sequences with constant common ratio r.",
    formulaText: "T_n = a * r^(n-1)",
    prerequisites: ["topic_sequences"],
  },
  {
    id: "form_sum_to_infinity",
    label: "Sum to Infinity",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Sequences",
    mastery: 72,
    description: "Convergent geometric series sum when -1 < r < 1.",
    formulaText: "S_∞ = a / (1 - r)",
    prerequisites: ["form_geometric_nth"],
  },

  // --- FUNCTIONS & GRAPH INVERSES ---
  {
    id: "topic_functions",
    label: "Functions & Inverses",
    type: "topic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Functions",
    mastery: 82,
    description: "Parabolas, hyperbolas, exponential graphs, logarithmic transformations, and inverses f⁻¹.",
    examWeight: "~35 Marks",
    prerequisites: ["topic_algebra"],
  },
  {
    id: "sub_hyperbola",
    label: "Hyperbola Asymptotes",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Functions",
    mastery: 86,
    description: "Rectangular hyperbola with vertical x = p and horizontal y = q asymptotes.",
    formulaText: "y = a / (x - p) + q",
    prerequisites: ["topic_functions"],
  },
  {
    id: "sub_parabola_turning",
    label: "Parabola Axis of Symmetry",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Functions",
    mastery: 88,
    description: "Turning point x-coordinate for quadratic functions.",
    formulaText: "x = -b / 2a",
    prerequisites: ["topic_functions", "sub_quadratic_eq"],
  },
  {
    id: "sub_logarithmic_inverse",
    label: "Logarithmic Functions & Inverses",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Functions",
    mastery: 68,
    description: "The inverse of exponential function y = b^x is y = log_b(x), reflected across y = x.",
    prerequisites: ["topic_functions", "sub_exponents_surds"],
  },

  // --- DIFFERENTIAL CALCULUS ---
  {
    id: "topic_calculus",
    label: "Differential Calculus",
    type: "topic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Calculus",
    mastery: 75,
    description: "First principles limits, derivative rules, cubic polynomials, tangents, and optimization.",
    examWeight: "~35 Marks",
    prerequisites: ["topic_functions", "topic_algebra"],
  },
  {
    id: "form_first_principles",
    label: "First Principles Derivative",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Calculus",
    mastery: 70,
    description: "Definition of derivative as limit of difference quotient as h approaches zero.",
    formulaText: "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
    prerequisites: ["topic_calculus"],
  },
  {
    id: "form_power_rule",
    label: "Power Rule Differentiation",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Calculus",
    mastery: 92,
    description: "Fast derivative rule for polynomial terms.",
    formulaText: "\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}",
    prerequisites: ["topic_calculus"],
  },
  {
    id: "sub_cubic_polynomials",
    label: "Cubic Graphs & Turning Points",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Calculus",
    mastery: 74,
    description: "Finding stationary points f'(x) = 0 and inflection points f''(x) = 0 for f(x) = ax³ + bx² + cx + d.",
    prerequisites: ["form_power_rule"],
  },
  {
    id: "sub_optimization",
    label: "Calculus Optimization",
    type: "subtopic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Calculus",
    mastery: 62,
    description: "Maximizing volume, surface area, or revenue by setting derivative to zero.",
    prerequisites: ["sub_cubic_polynomials"],
  },

  // --- FINANCIAL MATHEMATICS ---
  {
    id: "topic_financial",
    label: "Financial Mathematics",
    type: "topic",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Financials",
    mastery: 84,
    description: "Compound interest, nominal vs effective rates, sinking funds, annuities, and loan amortization.",
    examWeight: "~15 Marks",
    prerequisites: ["topic_sequences", "sub_exponents_surds"],
  },
  {
    id: "form_future_annuity",
    label: "Future Value Annuity",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Financials",
    mastery: 82,
    description: "Calculating accumulated value of regular periodic investments.",
    formulaText: "F = x * [ ((1 + i)ⁿ - 1) / i ]",
    prerequisites: ["topic_financial"],
  },
  {
    id: "form_present_annuity",
    label: "Present Value Annuity (Loans)",
    type: "formula",
    paper: "Paper 1",
    syllabus: "Both",
    category: "Financials",
    mastery: 79,
    description: "Calculating home loan bond balances and present value repayments.",
    formulaText: "P = x * [ (1 - ((1 + i)⁻ⁿ) / i ]",
    prerequisites: ["topic_financial"],
  },

  // --- TRIGONOMETRY ---
  {
    id: "topic_trigonometry",
    label: "Trigonometry & Identities",
    type: "topic",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Trigonometry",
    mastery: 81,
    description: "Reduction formulas, double angle identities, compound angles, 2D/3D non-right angled triangles.",
    examWeight: "~40 Marks",
    prerequisites: ["topic_functions"],
  },
  {
    id: "form_pythagoras_identity",
    label: "Square Trigonometric Identity",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Trigonometry",
    mastery: 95,
    description: "Fundamental identity relating sine and cosine.",
    formulaText: "sin²(θ) + cos²(θ) = 1",
    prerequisites: ["topic_trigonometry"],
  },
  {
    id: "form_double_angle_sin",
    label: "Sine Double Angle",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Trigonometry",
    mastery: 84,
    description: "Expansion formula for sine of twice an angle.",
    formulaText: "sin(2θ) = 2 * sin(θ) * cos(θ)",
    prerequisites: ["topic_trigonometry"],
  },
  {
    id: "form_double_angle_cos",
    label: "Cosine Double Angle",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Trigonometry",
    mastery: 76,
    description: "Three equivalent forms for cosine double angle.",
    formulaText: "cos(2θ) = cos²(θ) - sin²(θ) = 2cos²(θ) - 1",
    prerequisites: ["form_pythagoras_identity"],
  },
  {
    id: "form_sine_rule",
    label: "Sine Rule (Non-Right Δ)",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Trigonometry",
    mastery: 88,
    description: "Used in 2D/3D triangles when given 2 angles and 1 side, or 2 sides and non-included angle.",
    formulaText: "\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}",
    prerequisites: ["topic_trigonometry"],
  },
  {
    id: "form_cosine_rule",
    label: "Cosine Rule",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Trigonometry",
    mastery: 80,
    description: "Finding unknown side when given 2 sides and included angle (SAS).",
    formulaText: "a² = b² + c² - 2bc * cos(A)",
    prerequisites: ["topic_trigonometry"],
  },

  // --- ANALYTICAL GEOMETRY ---
  {
    id: "topic_analytical",
    label: "Analytical Geometry",
    type: "topic",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 77,
    description: "Distance formula, midpoint, gradient, inclination angle, and circles with tangents.",
    examWeight: "~40 Marks",
    prerequisites: ["topic_algebra"],
  },
  {
    id: "form_distance",
    label: "Distance Formula",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 94,
    description: "Calculates length between two Cartesian coordinates.",
    formulaText: "d = √((x₂ - x₁)² + (y₂ - y₁)²)",
    prerequisites: ["topic_analytical"],
  },
  {
    id: "form_inclination",
    label: "Angle of Inclination",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 73,
    description: "Angle θ formed between line and positive x-axis.",
    formulaText: "tan(θ) = m",
    prerequisites: ["topic_analytical", "topic_trigonometry"],
  },
  {
    id: "form_circle_equation",
    label: "Circle Equation & Tangents",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 66,
    description: "Circle centered at (a, b) with radius r. Tangent is perpendicular to radius.",
    formulaText: "(x - a)² + (y - b)² = r²",
    prerequisites: ["form_distance"],
  },

  // --- EUCLIDEAN GEOMETRY ---
  {
    id: "topic_euclidean",
    label: "Euclidean Geometry",
    type: "topic",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 58,
    description: "Circle geometry theorems, cyclic quadrilaterals, tangents, and similarity/proportionality theorems.",
    examWeight: "~50 Marks",
    prerequisites: ["topic_analytical"],
  },
  {
    id: "thm_tan_chord",
    label: "Tan-Chord Theorem",
    type: "theorem",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 60,
    description: "The angle between a tangent and a chord drawn from point of contact equals angle in alternate segment.",
    prerequisites: ["topic_euclidean"],
  },
  {
    id: "thm_cyclic_quad",
    label: "Opposite Angles Cyclic Quad",
    type: "theorem",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 75,
    description: "Opposite angles of a cyclic quadrilateral add up to 180°.",
    prerequisites: ["topic_euclidean"],
  },
  {
    id: "thm_proportionality",
    label: "Proportional Intercept Theorem",
    type: "theorem",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Geometry",
    mastery: 52,
    description: "A line drawn parallel to one side of a triangle divides the other two sides proportionally.",
    prerequisites: ["topic_euclidean"],
  },

  // --- PROBABILITY & STATISTICS ---
  {
    id: "topic_statistics",
    label: "Statistics & Probability",
    type: "topic",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Probability",
    mastery: 89,
    description: "Ogives, box-and-whisker plots, standard deviation, scatter plots, Venn diagrams, and tree diagrams.",
    examWeight: "~35 Marks",
  },
  {
    id: "form_probability_addition",
    label: "Addition Rule Probability",
    type: "formula",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Probability",
    mastery: 91,
    description: "General addition rule for union of non-mutually exclusive events.",
    formulaText: "P(A or B) = P(A) + P(B) - P(A and B)",
    prerequisites: ["topic_statistics"],
  },
  {
    id: "sub_regression_line",
    label: "Least Squares Regression Line",
    type: "subtopic",
    paper: "Paper 2",
    syllabus: "Both",
    category: "Probability",
    mastery: 86,
    description: "Bivariate statistical analysis y = a + bx and correlation coefficient r.",
    prerequisites: ["topic_statistics"],
  },
];

export const initialLinks: KnowledgeLink[] = [
  // Belongs to linkages
  { source: "sub_quadratic_eq", target: "topic_algebra", type: "belongs_to" },
  { source: "form_quadratic_formula", target: "sub_quadratic_eq", type: "uses_formula" },
  { source: "sub_nature_roots", target: "form_quadratic_formula", type: "prerequisite" },
  { source: "form_discriminant", target: "sub_nature_roots", type: "uses_formula" },
  { source: "sub_inequalities", target: "sub_quadratic_eq", type: "prerequisite" },
  { source: "sub_exponents_surds", target: "topic_algebra", type: "belongs_to" },

  { source: "topic_sequences", target: "topic_algebra", type: "prerequisite" },
  { source: "form_arithmetic_nth", target: "topic_sequences", type: "uses_formula" },
  { source: "form_arithmetic_sum", target: "form_arithmetic_nth", type: "belongs_to" },
  { source: "form_geometric_nth", target: "topic_sequences", type: "uses_formula" },
  { source: "form_sum_to_infinity", target: "form_geometric_nth", type: "prerequisite" },

  { source: "topic_functions", target: "topic_algebra", type: "prerequisite" },
  { source: "sub_hyperbola", target: "topic_functions", type: "belongs_to" },
  { source: "sub_parabola_turning", target: "topic_functions", type: "belongs_to" },
  { source: "sub_parabola_turning", target: "sub_quadratic_eq", type: "cross_domain" },
  { source: "sub_logarithmic_inverse", target: "topic_functions", type: "belongs_to" },
  { source: "sub_logarithmic_inverse", target: "sub_exponents_surds", type: "cross_domain" },

  { source: "topic_calculus", target: "topic_functions", type: "prerequisite" },
  { source: "form_first_principles", target: "topic_calculus", type: "uses_formula" },
  { source: "form_power_rule", target: "topic_calculus", type: "uses_formula" },
  { source: "sub_cubic_polynomials", target: "form_power_rule", type: "prerequisite" },
  { source: "sub_optimization", target: "sub_cubic_polynomials", type: "prerequisite" },

  { source: "topic_financial", target: "topic_sequences", type: "cross_domain" },
  { source: "form_future_annuity", target: "topic_financial", type: "uses_formula" },
  { source: "form_present_annuity", target: "topic_financial", type: "uses_formula" },

  { source: "topic_trigonometry", target: "topic_functions", type: "cross_domain" },
  { source: "form_pythagoras_identity", target: "topic_trigonometry", type: "uses_formula" },
  { source: "form_double_angle_sin", target: "topic_trigonometry", type: "uses_formula" },
  { source: "form_double_angle_cos", target: "form_pythagoras_identity", type: "uses_formula" },
  { source: "form_sine_rule", target: "topic_trigonometry", type: "uses_formula" },
  { source: "form_cosine_rule", target: "topic_trigonometry", type: "uses_formula" },

  { source: "topic_analytical", target: "topic_algebra", type: "prerequisite" },
  { source: "form_distance", target: "topic_analytical", type: "uses_formula" },
  { source: "form_inclination", target: "topic_analytical", type: "uses_formula" },
  { source: "form_inclination", target: "topic_trigonometry", type: "cross_domain" },
  { source: "form_circle_equation", target: "form_distance", type: "prerequisite" },

  { source: "topic_euclidean", target: "topic_analytical", type: "cross_domain" },
  { source: "thm_tan_chord", target: "topic_euclidean", type: "belongs_to" },
  { source: "thm_cyclic_quad", target: "topic_euclidean", type: "belongs_to" },
  { source: "thm_proportionality", target: "topic_euclidean", type: "belongs_to" },

  { source: "form_probability_addition", target: "topic_statistics", type: "uses_formula" },
  { source: "sub_regression_line", target: "topic_statistics", type: "belongs_to" },
];

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  user,
  onSelectTopicForVideo,
  onAskAITutor,
  onStartPracticeSession
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [nodes, setNodes] = useState<KnowledgeNode[]>(() => {
    const saved = localStorage.getItem("amh_knowledge_nodes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load knowledge nodes cache", e);
      }
    }
    return initialNodes;
  });

  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch mastery percentage data from backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchMasteryFromAPI() {
      try {
        const res = await fetch("/api/mastery");
        if (res.ok) {
          const data = await res.json();
          if (data.topics && Array.isArray(data.topics) && isMounted) {
            const masteryMap = new Map<string, number>();
            data.topics.forEach((t: { id: string; mastery: number }) => {
              masteryMap.set(t.id, t.mastery);
            });

            setNodes(prev =>
              prev.map(node => ({
                ...node,
                mastery: masteryMap.has(node.id) ? masteryMap.get(node.id)! : node.mastery
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Could not fetch mastery percentage from backend API, using cached data:", err);
      }
    }

    fetchMasteryFromAPI();

    return () => {
      isMounted = false;
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [paperFilter, setPaperFilter] = useState<"All" | "Paper 1" | "Paper 2">("All");
  const [syllabusFilter, setSyllabusFilter] = useState<"All" | "CAPS" | "IEB">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "topic" | "subtopic" | "formula" | "theorem">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [layoutPreset, setLayoutPreset] = useState<"force" | "compact" | "concentric">("force");

  // Related Subtopics & Prerequisite Concepts for Hovered Node
  const hoveredSubtopics = useMemo(() => {
    if (!hoveredNode) return [];

    const connectedIds = new Set<string>();
    initialLinks.forEach(link => {
      const sId = typeof link.source === "object" ? (link.source as KnowledgeNode).id : link.source;
      const tId = typeof link.target === "object" ? (link.target as KnowledgeNode).id : link.target;
      if (sId === hoveredNode.id) connectedIds.add(tId);
      if (tId === hoveredNode.id) connectedIds.add(sId);
    });

    nodes.forEach(n => {
      if (n.prerequisites?.includes(hoveredNode.id)) connectedIds.add(n.id);
    });

    const matches = nodes.filter(n => connectedIds.has(n.id) && n.id !== hoveredNode.id);
    if (matches.length === 0) {
      return nodes.filter(n => n.category === hoveredNode.category && n.id !== hoveredNode.id).slice(0, 3);
    }
    return matches.slice(0, 4);
  }, [hoveredNode, nodes]);

  // Initiate Practice Session Action
  const handleInitiatePractice = (node: KnowledgeNode) => {
    if (onStartPracticeSession) {
      onStartPracticeSession(node.label);
    } else if (onAskAITutor) {
      onAskAITutor(`Initiate an interactive CAPS/IEB practice session for topic: "${node.label}". Generate 3 exam-style questions ranging from standard to distinction level with step-by-step guidance.`);
    } else {
      setSelectedNode(node);
    }
  };

  // Request Video Action
  const handleRequestVideo = (node: KnowledgeNode) => {
    if (onSelectTopicForVideo) {
      onSelectTopicForVideo(node.label);
    } else {
      setSelectedNode(node);
    }
  };

  // Calculate Tooltip Position to keep within container bounds
  const tooltipStyle = useMemo(() => {
    if (!tooltipPos || !containerRef.current) return {};
    const containerWidth = containerRef.current.clientWidth || 800;
    const containerHeight = containerRef.current.clientHeight || 600;
    const tooltipWidth = 320;
    const tooltipHeight = 280;

    let left = tooltipPos.x + 15;
    let top = tooltipPos.y + 15;

    if (left + tooltipWidth > containerWidth - 15) {
      left = tooltipPos.x - tooltipWidth - 15;
    }
    if (left < 10) left = 10;

    if (top + tooltipHeight > containerHeight - 15) {
      top = tooltipPos.y - tooltipHeight - 15;
    }
    if (top < 10) top = 10;

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${tooltipWidth}px`,
    };
  }, [tooltipPos]);

  // Save changes to node mastery
  useEffect(() => {
    localStorage.setItem("amh_knowledge_nodes", JSON.stringify(nodes));
  }, [nodes]);

  // Derived filtered nodes and links
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchQuery === "" || 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.formulaText && node.formulaText.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPaper = paperFilter === "All" || node.paper === "Both" || node.paper === paperFilter;
      const matchesSyllabus = syllabusFilter === "All" || node.syllabus === "Both" || node.syllabus === syllabusFilter;
      const matchesType = typeFilter === "All" || node.type === typeFilter;
      const matchesCategory = categoryFilter === "All" || node.category === categoryFilter;

      return matchesSearch && matchesPaper && matchesSyllabus && matchesType && matchesCategory;
    });
  }, [nodes, searchQuery, paperFilter, syllabusFilter, typeFilter, categoryFilter]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredLinks = useMemo(() => {
    return initialLinks.filter(link => {
      const sourceId = typeof link.source === "object" ? (link.source as KnowledgeNode).id : link.source;
      const targetId = typeof link.target === "object" ? (link.target as KnowledgeNode).id : link.target;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });
  }, [filteredNodeIds]);

  // Graph Summary Metrics
  const totalNodesCount = filteredNodes.length;
  const masteredCount = filteredNodes.filter(n => n.mastery >= 80).length;
  const competentCount = filteredNodes.filter(n => n.mastery >= 60 && n.mastery < 80).length;
  const needsFocusCount = filteredNodes.filter(n => n.mastery < 60).length;
  const overallAvgMastery = Math.round(
    filteredNodes.reduce((acc, curr) => acc + curr.mastery, 0) / (totalNodesCount || 1)
  );

  // Zoom Ref
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // D3 Render Loop
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = Math.max(containerRef.current.clientHeight || 600, 550);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Setup defs for glowing markers and arrowheads
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow markers
    defs.append("marker")
      .attr("id", "arrow-prerequisite")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#eab308"); // gold

    defs.append("marker")
      .attr("id", "arrow-belongs")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#38bdf8"); // cyan/sky

    // Master container for zoom
    const g = svg.append("g").attr("class", "graph-container");

    // Enable Zooming & Panning
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Deep clone nodes and links so D3 simulation doesn't mutate React state directly
    const nodesCopy: KnowledgeNode[] = JSON.parse(JSON.stringify(filteredNodes));
    const linksCopy: KnowledgeLink[] = JSON.parse(JSON.stringify(filteredLinks));

    // Force distance tuning
    const linkDistance = layoutPreset === "compact" ? 70 : 120;
    const chargeStrength = layoutPreset === "compact" ? -180 : -320;

    // Simulation initialization
    const simulation = d3.forceSimulation<KnowledgeNode>(nodesCopy)
      .force("link", d3.forceLink<KnowledgeNode, KnowledgeLink>(linksCopy)
        .id((d) => d.id)
        .distance(linkDistance)
      )
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => {
        if (d.type === "topic") return 36;
        if (d.type === "subtopic") return 26;
        return 20;
      }));

    // Render Link Lines
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linksCopy)
      .enter()
      .append("line")
      .attr("stroke", (d) => {
        if (d.type === "prerequisite") return "rgba(234, 179, 8, 0.4)"; // gold
        if (d.type === "cross_domain") return "rgba(168, 85, 247, 0.4)"; // purple
        return "rgba(56, 189, 248, 0.25)"; // sky blue
      })
      .attr("stroke-width", (d) => (d.type === "prerequisite" ? 2 : 1.5))
      .attr("stroke-dasharray", (d) => (d.type === "cross_domain" ? "4,4" : "none"))
      .attr("marker-end", (d) => {
        if (d.type === "prerequisite") return "url(#arrow-prerequisite)";
        return "url(#arrow-belongs)";
      });

    // Node colors by mastery level
    const getNodeColor = (mastery: number) => {
      if (mastery >= 80) return "#10b981"; // Emerald
      if (mastery >= 60) return "#f59e0b"; // Gold / Amber
      return "#f43f5e"; // Rose / Red
    };

    const getNodeRadius = (type: string) => {
      if (type === "topic") return 22;
      if (type === "subtopic") return 15;
      return 11;
    };

    // Render Node Group
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(nodesCopy)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        // Find original node from state
        const orig = nodes.find(n => n.id === d.id);
        if (orig) setSelectedNode(orig);
      })
      .on("pointerenter", (event, d) => {
        if (mouseLeaveTimeoutRef.current) {
          clearTimeout(mouseLeaveTimeoutRef.current);
          mouseLeaveTimeoutRef.current = null;
        }
        const orig = nodes.find(n => n.id === d.id) || d;
        setHoveredNode(orig);
        if (containerRef.current) {
          const [x, y] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x, y });
        }
      })
      .on("pointermove", (event) => {
        if (containerRef.current) {
          const [x, y] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x, y });
        }
      })
      .on("pointerleave", () => {
        mouseLeaveTimeoutRef.current = setTimeout(() => {
          setHoveredNode(null);
          setTooltipPos(null);
        }, 300);
      })
      .call(
        d3.drag<SVGGElement, KnowledgeNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Outer Ring / Glow
    node.append("circle")
      .attr("r", (d) => getNodeRadius(d.type) + 4)
      .attr("fill", "none")
      .attr("stroke", (d) => getNodeColor(d.mastery))
      .attr("stroke-width", (d) => (d.type === "topic" ? 3 : 1.5))
      .attr("opacity", 0.6)
      .attr("filter", (d) => (d.mastery >= 80 ? "url(#glow)" : "none"));

    // Node Core Circle
    node.append("circle")
      .attr("r", (d) => getNodeRadius(d.type))
      .attr("fill", (d) => {
        if (d.type === "topic") return "#0f172a"; // dark navy center
        return getNodeColor(d.mastery);
      })
      .attr("stroke", (d) => getNodeColor(d.mastery))
      .attr("stroke-width", 2);

    // Topic Icon / Symbol inside
    node.append("text")
      .text((d) => {
        if (d.type === "topic") return "★";
        if (d.type === "formula") return "f(x)";
        if (d.type === "theorem") return "Δ";
        return "•";
      })
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", (d) => (d.type === "topic" ? "#f59e0b" : "#ffffff"))
      .attr("font-size", (d) => (d.type === "topic" ? "12px" : "9px"))
      .attr("font-weight", "bold")
      .attr("pointer-events", "none");

    // Node Labels
    node.append("text")
      .text((d) => d.label)
      .attr("x", (d) => getNodeRadius(d.type) + 8)
      .attr("y", 4)
      .attr("fill", "#f8fafc")
      .attr("font-size", (d) => (d.type === "topic" ? "12px" : "10px"))
      .attr("font-weight", (d) => (d.type === "topic" ? "700" : "500"))
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)");

    // Mastery % Badge
    node.append("text")
      .text((d) => `${d.mastery}%`)
      .attr("x", (d) => getNodeRadius(d.type) + 8)
      .attr("y", 16)
      .attr("fill", (d) => getNodeColor(d.mastery))
      .attr("font-size", "9px")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-weight", "700")
      .attr("pointer-events", "none");

    // Simulation Tick Updates
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup simulation on unmount
    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, layoutPreset]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Node Mastery Update Handler
  const handleUpdateMastery = (nodeId: string, newScore: number) => {
    const updated = nodes.map(n => n.id === nodeId ? { ...n, mastery: newScore } : n);
    setNodes(updated);
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, mastery: newScore });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Network className="w-3.5 h-3.5" />
              CAPS / IEB Knowledge Graph
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-3">
              Mathematics Competency Knowledge Map
            </h2>
            <p className="text-sm text-navy-200 max-w-2xl leading-relaxed">
              Explore interconnected mathematical formulas, theorems, and core exam topics as a dynamic force-directed graph. Track prerequisite pathways and identify target revision areas.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center shrink-0">
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-navy-300 uppercase block">Total Nodes</span>
              <span className="text-lg font-black text-white">{totalNodesCount}</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
              <span className="text-[10px] text-emerald-400 uppercase block">Mastered (≥80%)</span>
              <span className="text-lg font-black text-emerald-400">{masteredCount}</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-400 uppercase block">Competent</span>
              <span className="text-lg font-black text-amber-400">{competentCount}</span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
              <span className="text-[10px] text-rose-400 uppercase block">Needs Focus</span>
              <span className="text-lg font-black text-rose-400">{needsFocusCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Toolbar & Controls */}
      <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search topic, theorem, or formula (e.g. Quadratic, Sine Rule)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-sans bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 text-navy-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Paper Filters */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-900 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono font-bold">
            {(["All", "Paper 1", "Paper 2"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPaperFilter(p)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  paperFilter === p
                    ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm"
                    : "text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-900 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono font-bold">
            {(["All", "topic", "formula", "theorem"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 rounded-lg transition-all capitalize ${
                  typeFilter === t
                    ? "bg-navy-800 text-white shadow-sm"
                    : "text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                {t === "topic" ? "Topics" : t === "formula" ? "Formulas" : t === "theorem" ? "Theorems" : "All Nodes"}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-navy-500">Domain:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-800 dark:text-navy-200 focus:outline-none"
            >
              <option value="All">All Domains</option>
              <option value="Algebra">Algebra</option>
              <option value="Calculus">Calculus</option>
              <option value="Trigonometry">Trigonometry</option>
              <option value="Geometry">Geometry</option>
              <option value="Probability">Probability</option>
              <option value="Functions">Functions</option>
              <option value="Financials">Financials</option>
              <option value="Sequences">Sequences</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas & Side Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* D3 Graph Canvas Box */}
        <div 
          ref={containerRef}
          className="lg:col-span-8 bg-navy-950 border border-navy-800 rounded-2xl h-[600px] relative overflow-hidden shadow-2xl flex flex-col justify-between"
        >
          {/* Zoom & Canvas Tool Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-navy-900/90 border border-navy-700 p-1.5 rounded-xl backdrop-blur-md shadow-lg">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-2 text-white/80 hover:text-gold-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-2 text-white/80 hover:text-gold-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset View"
              className="p-2 text-white/80 hover:text-gold-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Layout Preset Buttons */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-navy-900/90 border border-navy-700 p-1.5 rounded-xl backdrop-blur-md text-[10px] font-mono font-bold text-white/70">
            <span className="px-1 text-gold-400 uppercase">Layout:</span>
            <button
              onClick={() => setLayoutPreset("force")}
              className={`px-2 py-1 rounded-lg ${layoutPreset === "force" ? "bg-gold-500 text-navy-950 font-black" : "hover:bg-white/10"}`}
            >
              Spacious
            </button>
            <button
              onClick={() => setLayoutPreset("compact")}
              className={`px-2 py-1 rounded-lg ${layoutPreset === "compact" ? "bg-gold-500 text-navy-950 font-black" : "hover:bg-white/10"}`}
            >
              Compact
            </button>
          </div>

          {/* SVG D3 Container */}
          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* Interactive Floating Hover Tooltip Card */}
          <AnimatePresence>
            {hoveredNode && tooltipPos && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={tooltipStyle}
                onPointerEnter={() => {
                  if (mouseLeaveTimeoutRef.current) {
                    clearTimeout(mouseLeaveTimeoutRef.current);
                    mouseLeaveTimeoutRef.current = null;
                  }
                }}
                onPointerLeave={() => {
                  setHoveredNode(null);
                  setTooltipPos(null);
                }}
                className="absolute z-30 bg-navy-900/95 dark:bg-navy-950/95 text-white border border-navy-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto space-y-3"
              >
                {/* Header Info */}
                <div className="flex items-start justify-between gap-2 border-b border-navy-800 pb-2.5">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30 uppercase">
                        {hoveredNode.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-royal-500/20 text-royal-300 border border-royal-500/30">
                        {hoveredNode.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-navy-300 bg-white/5">
                        {hoveredNode.paper}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold font-display leading-tight text-white">
                      {hoveredNode.label}
                    </h4>
                  </div>

                  {/* Mastery Badge */}
                  <div className="text-right shrink-0">
                    <span className={`text-base font-black font-mono block ${
                      hoveredNode.mastery >= 80 ? "text-emerald-400" : hoveredNode.mastery >= 60 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {hoveredNode.mastery}%
                    </span>
                    <span className="text-[9px] font-mono text-navy-300 block uppercase">Mastery</span>
                  </div>
                </div>

                {/* Progress Bar & Description */}
                <div className="space-y-1.5">
                  <div className="w-full bg-navy-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        hoveredNode.mastery >= 80 ? "bg-emerald-500" : hoveredNode.mastery >= 60 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${hoveredNode.mastery}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-navy-300 line-clamp-2 leading-relaxed">
                    {hoveredNode.description}
                  </p>
                </div>

                {/* Specific Subtopics & Prerequisite Concepts */}
                {hoveredSubtopics.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-navy-800/80">
                    <span className="text-[9px] font-mono font-bold text-navy-400 uppercase tracking-wider block">
                      Subtopics & Concepts ({hoveredSubtopics.length}):
                    </span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {hoveredSubtopics.map(sub => (
                        <div 
                          key={sub.id} 
                          className="flex items-center justify-between text-[10px] bg-white/5 hover:bg-white/10 p-1.5 rounded-lg border border-white/5 transition-colors"
                        >
                          <span className="font-medium text-navy-200 truncate max-w-[180px]">
                            {sub.label}
                          </span>
                          <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[9px] ${
                            sub.mastery >= 80 ? "bg-emerald-500/20 text-emerald-400" : sub.mastery >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                          }`}>
                            {sub.mastery}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Link / CTA: Initiate Practice Session */}
                <div className="pt-2 border-t border-navy-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleInitiatePractice(hoveredNode)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-white group-hover:scale-110 transition-transform" />
                    <span>Initiate Practice Session</span>
                  </button>

                  <button
                    onClick={() => handleRequestVideo(hoveredNode)}
                    title="Request Tutor Video"
                    className="p-2 bg-royal-500/20 hover:bg-royal-500/30 text-royal-300 border border-royal-500/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas Bottom Legend */}
          <div className="bg-navy-900/90 border-t border-navy-800 p-3 z-10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/80 backdrop-blur-md">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
                Mastered (≥80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500/50" />
                Competent (60-79%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50" />
                Needs Focus (&lt;60%)
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-white/50">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-gold-400 inline-block" /> Prerequisite
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-sky-400 inline-block" /> Component
              </span>
            </div>
          </div>
        </div>

        {/* Node Detail Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-2xl p-5 shadow-xl space-y-5 relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="absolute top-4 right-4 text-navy-400 hover:text-navy-600 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Node Title & Badges */}
                <div className="space-y-2 pr-6">
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold">
                    <span className="px-2 py-0.5 rounded bg-royal-100 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300 border border-royal-300 dark:border-royal-800 uppercase">
                      {selectedNode.type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300 border border-gold-300 dark:border-gold-800 uppercase">
                      {selectedNode.paper}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
                      {selectedNode.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold font-display tracking-tight text-navy-900 dark:text-white">
                    {selectedNode.label}
                  </h3>
                </div>

                {/* Mastery Level Gauge & Interactive Slider */}
                <div className="bg-navy-50 dark:bg-navy-900 p-4 rounded-xl border border-navy-150 dark:border-navy-800 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className="text-navy-600 dark:text-navy-300 uppercase tracking-wider">Current Mastery:</span>
                    <span className={`text-base ${
                      selectedNode.mastery >= 80 ? "text-emerald-500" : selectedNode.mastery >= 60 ? "text-amber-500" : "text-rose-500"
                    }`}>
                      {selectedNode.mastery}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-navy-200 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        selectedNode.mastery >= 80 ? "bg-emerald-500" : selectedNode.mastery >= 60 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${selectedNode.mastery}%` }}
                    />
                  </div>

                  {/* Slider to adjust mastery score directly */}
                  <div className="pt-2 space-y-1">
                    <label className="text-[10px] font-mono text-navy-500 dark:text-navy-400 block">
                      Update your self-assessment score:
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={selectedNode.mastery}
                      onChange={(e) => handleUpdateMastery(selectedNode.id, parseInt(e.target.value))}
                      className="w-full accent-gold-500 cursor-pointer h-1.5 bg-navy-200 dark:bg-navy-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-navy-400 uppercase block">Concept Summary</span>
                  <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* LaTeX Formula Rendering if present */}
                {selectedNode.formulaText && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-navy-400 uppercase block">Formula TeX Specification</span>
                    <div className="bg-navy-900 border border-navy-700 p-3 rounded-xl text-white font-mono text-xs overflow-x-auto">
                      <LatexRenderer text={`$$${selectedNode.formulaText}$$`} block={true} />
                    </div>
                  </div>
                )}

                {/* Prerequisites list */}
                {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-navy-400 uppercase block">Prerequisite Nodes</span>
                    <div className="space-y-1">
                      {selectedNode.prerequisites.map(reqId => {
                        const reqNode = nodes.find(n => n.id === reqId);
                        if (!reqNode) return null;
                        return (
                          <button
                            key={reqId}
                            onClick={() => setSelectedNode(reqNode)}
                            className="w-full text-left p-2 rounded-lg bg-navy-50 dark:bg-navy-900 hover:bg-gold-500/10 border border-navy-150 dark:border-navy-800 flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="font-semibold text-navy-800 dark:text-navy-200">{reqNode.label}</span>
                            <span className="text-[10px] font-mono font-bold text-gold-500 flex items-center gap-1">
                              {reqNode.mastery}% <ChevronRight className="w-3 h-3" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action CTA buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => onAskAITutor && onAskAITutor(`Explain the concepts, common matric exam traps, and step-by-step problem-solving methods for: ${selectedNode.label}`)}
                    className="w-full py-2.5 px-4 bg-royal-600 hover:bg-royal-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    Ask AI Tutor About This Node
                  </button>

                  <button
                    onClick={() => onSelectTopicForVideo && onSelectTopicForVideo(selectedNode.label)}
                    className="w-full py-2.5 px-4 bg-navy-100 dark:bg-navy-900 hover:bg-navy-200 dark:hover:bg-navy-800 text-navy-800 dark:text-navy-200 font-semibold text-xs rounded-xl border border-navy-200 dark:border-navy-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <Video className="w-4 h-4 text-royal-500" />
                    Request Tutor Video Walkthrough
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto">
                  <Network className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-navy-900 dark:text-white">
                  Select Any Node to Inspect
                </h4>
                <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                  Click on any topic, subtopic, or formula node inside the knowledge graph to view LaTeX formulas, prerequisite dependencies, and custom mastery updates.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
