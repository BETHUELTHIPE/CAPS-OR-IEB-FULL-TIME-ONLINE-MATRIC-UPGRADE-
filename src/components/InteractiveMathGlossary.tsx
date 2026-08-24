import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  BookMarked, 
  Sparkles, 
  Check, 
  Copy, 
  Filter, 
  GraduationCap, 
  HelpCircle, 
  FileText, 
  Lightbulb, 
  X,
  ChevronDown,
  BookOpen,
  Calculator,
  Star,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  Sliders,
  Award,
  Info,
  BookmarkCheck,
  Zap,
  BookCheck,
  Layers,
  WifiOff,
  CheckCircle2
} from "lucide-react";
import { cacheGlossaryOffline, useOfflineStatus } from "../lib/serviceWorkerRegistration";
import { LatexRenderer } from "./LatexRenderer";

export interface GlossaryTerm {
  id: string;
  term: string;
  category: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Functions" | "Financial Maths" | "Probability" | "Statistics";
  grade: "Grade 10" | "Grade 11" | "Grade 12" | "All Grades";
  paper: "Paper 1" | "Paper 2";
  syllabus: "CAPS" | "IEB" | "Both";
  definition: string;
  formula?: string;
  example?: string;
  examTip?: string;
  interactiveType?: "discriminant" | "first_principles" | "sum_infinity" | "annuity" | "circle_equation" | "compound_angle" | "inverse_fn" | "regression";
}

const MATH_GLOSSARY_DATABASE: GlossaryTerm[] = [
  // --- CALCULUS (PAPER 1) ---
  {
    id: "term-calc-1",
    term: "Derivative from First Principles",
    category: "Calculus",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "The fundamental definition of the gradient of a curve at a point using the limit of the secant line gradient as h approaches zero.",
    formula: "f'(x) = lim_{h → 0} [f(x + h) - f(x)] / h",
    example: "Find f'(x) for f(x) = 2x²: f'(x) = lim_{h → 0} [2(x+h)² - 2x²]/h = lim_{h → 0} [4xh + 2h²]/h = 4x.",
    examTip: "Always write lim_{h → 0} at every step until you substitute h = 0 to avoid losing a required notation mark.",
    interactiveType: "first_principles"
  },
  {
    id: "term-calc-2",
    term: "Stationary Point (Turning Point)",
    category: "Calculus",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "A point on a curve where the gradient of the tangent is equal to zero (f'(x) = 0). Represents local maximums, minimums, or stationary points of inflection.",
    formula: "f'(x) = 0",
    example: "For f(x) = x³ - 3x: f'(x) = 3x² - 3 = 0 ⇒ x = ±1. Turning points at (1, -2) local min and (-1, 2) local max.",
    examTip: "Use f''(x) to test concavity: f''(x) > 0 is local min; f''(x) < 0 is local max."
  },
  {
    id: "term-calc-3",
    term: "Point of Inflection",
    category: "Calculus",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "A point on a continuous curve where the concavity changes from concave upwards to concave downwards or vice-versa.",
    formula: "f''(x) = 0  and f''(x) changes sign across the point",
    example: "For f(x) = x³ - 3x: f'(x) = 3x² - 3, f''(x) = 6x. Set 6x = 0 ⇒ x = 0. Inflection point at (0, 0).",
    examTip: "For a cubic polynomial f(x) = ax³ + bx² + cx + d, the x-coordinate of the inflection point is x = -b / (3a)."
  },
  {
    id: "term-calc-4",
    term: "Optimization (Calculus Applications)",
    category: "Calculus",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "The mathematical process of finding maximum or minimum physical values for area, volume, cost, profit, or rate of change using derivatives.",
    formula: "Set dV/dx = 0 or dA/dx = 0",
    example: "Maximizing rectangle area A(x) = 100x - 2x²: dA/dx = 100 - 4x = 0 ⇒ x = 25m. Max Area = 1250 m².",
    examTip: "Ensure your final formula has only ONE independent variable before taking the derivative."
  },
  {
    id: "term-calc-5",
    term: "Power Rule Differentiation",
    category: "Calculus",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "A quick rule for finding the derivative of power functions f(x) = a · x^n by multiplying by the exponent and subtracting 1 from the power.",
    formula: "d/dx [a · x^n] = a · n · x^(n - 1)",
    example: "If f(x) = 5x⁴ - 3/x = 5x⁴ - 3x⁻¹, then f'(x) = 20x³ + 3x⁻² = 20x³ + 3/x².",
    examTip: "Before differentiating, rewrite all roots as fractional exponents (e.g., √x = x^(1/2)) and move variables out of denominators."
  },

  // --- ALGEBRA & EQUATIONS (PAPER 1) ---
  {
    id: "term-alg-1",
    term: "Discriminant (Δ) & Nature of Roots",
    category: "Algebra",
    grade: "Grade 11",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "The numerical expression under the square root in the quadratic formula that dictates whether roots are real, non-real, equal, rational, or irrational.",
    formula: "Δ = b² - 4ac",
    example: "For x² - 5x + 6 = 0: Δ = (-5)² - 4(1)(6) = 1. Since Δ > 0 and a perfect square ⇒ 2 real, rational, unequal roots.",
    examTip: "For equal roots, solve Δ = 0. For real roots, solve Δ ≥ 0. For non-real roots, solve Δ < 0.",
    interactiveType: "discriminant"
  },
  {
    id: "term-alg-2",
    term: "Remainder & Factor Theorem",
    category: "Algebra",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "If polynomial P(x) is divided by (ax - b), the remainder is P(b/a). If P(b/a) = 0, then (ax - b) is a factor of P(x).",
    formula: "Remainder R = P(b/a); Factor if P(b/a) = 0",
    example: "For P(x) = x³ - 3x² + 4: P(2) = (2)³ - 3(2)² + 4 = 8 - 12 + 4 = 0 ⇒ (x - 2) is a factor.",
    examTip: "Use the Factor Theorem to find the first rational root x = k when factorizing cubic equations P(x) = 0."
  },
  {
    id: "term-alg-3",
    term: "Sum to Infinity (Geometric Series)",
    category: "Algebra",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "The limiting sum S_∞ of a convergent geometric series where the common ratio r lies strictly between -1 and 1 (|r| < 1).",
    formula: "S_∞ = a / (1 - r),  where -1 < r < 1",
    example: "For 8 + 4 + 2 + ...: a = 8, r = 0.5. S_∞ = 8 / (1 - 0.5) = 16.",
    examTip: "Always state the convergence condition -1 < r < 1 if asked why the sum to infinity exists.",
    interactiveType: "sum_infinity"
  },
  {
    id: "term-alg-4",
    term: "Arithmetic Series General Term & Sum",
    category: "Algebra",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "A sequence where the difference d between consecutive terms is constant. Sum S_n calculates the total of the first n terms.",
    formula: "T_n = a + (n - 1)d  |  S_n = (n/2)[2a + (n - 1)d] = (n/2)[a + L]",
    example: "For 3 + 7 + 11 + ... (a = 3, d = 4): S_10 = (10/2)[2(3) + 9(4)] = 5[6 + 36] = 210.",
    examTip: "Remember that T_n = S_n - S_{n-1} allows you to find any term T_n if given the sum formula S_n."
  },
  {
    id: "term-alg-5",
    term: "Quadratic Sequences & Second Constant Difference",
    category: "Algebra",
    grade: "Grade 11",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "A sequence T_n = an² + bn + c where the first differences form an arithmetic sequence, and the second differences are constant.",
    formula: "2a = 2nd diff  |  3a + b = T₂ - T₁  |  a + b + c = T₁",
    example: "Sequence 2, 7, 14, 23: 1st diffs: 5, 7, 9; 2nd diff = 2 ⇒ 2a = 2 ⇒ a = 1, 3(1)+b = 5 ⇒ b = 2, 1+2+c = 2 ⇒ c = -1. T_n = n² + 2n - 1.",
    examTip: "Always write out row 1 (terms), row 2 (1st diffs), and row 3 (2nd diffs) neatly before solving 2a, 3a+b, a+b+c."
  },

  // --- TRIGONOMETRY (PAPER 2) ---
  {
    id: "term-trig-1",
    term: "Double Angle Identities",
    category: "Trigonometry",
    grade: "Grade 12",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "Trigonometric identities that express functions of double angles 2α in terms of single angle α functions.",
    formula: "sin(2α) = 2 sin α cos α  |  cos(2α) = cos²α - sin²α = 2cos²α - 1 = 1 - 2sin²α",
    example: "Simplify cos(2α) + 1 = (2cos²α - 1) + 1 = 2cos²α.",
    examTip: "Choose the cos(2α) version that cancels out numerical constants when proving trigonometric identities."
  },
  {
    id: "term-trig-2",
    term: "Compound Angle Identities",
    category: "Trigonometry",
    grade: "Grade 12",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "Identities expressing trigonometric functions of the sum or difference of two angles (α ± β).",
    formula: "sin(α ± β) = sin α cos β ± cos α sin β  |  cos(α ± β) = cos α cos β ∓ sin α sin β",
    example: "Calculate cos(75°) without calculator: cos(45° + 30°) = cos 45° cos 30° - sin 45° sin 30° = (√2/2)(√3/2) - (√2/2)(1/2) = (√6 - √2)/4.",
    examTip: "Notice the sign flip in cosine compound formulas: cos(α + β) has a MINUS sign in the expansion.",
    interactiveType: "compound_angle"
  },
  {
    id: "term-trig-3",
    term: "Reduction Formulas & CAST Rule",
    category: "Trigonometry",
    grade: "Grade 11",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "Formulas used to simplify trigonometric ratios of angles greater than 90° into equivalent acute angle functions based on quadrant signs.",
    formula: "sin(180° - θ) = sin θ  |  cos(180° + θ) = -cos θ  |  sin(360° - θ) = -sin θ",
    example: "cos(210°) = cos(180° + 30°) = -cos(30°) = -√3 / 2.",
    examTip: "For co-functions sin(90° - θ) = cos θ and cos(90° - θ) = sin θ. Watch out for negative sign in sin(90° + θ) = cos θ!"
  },
  {
    id: "term-trig-4",
    term: "Sine & Cosine Rules (2D & 3D Trigonometry)",
    category: "Trigonometry",
    grade: "Grade 11",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "Formulas used to calculate missing sides or angles in non-right-angled triangles. Area rule computes triangle area using two sides and the included angle.",
    formula: "Sine: a/sin A = b/sin B  |  Cosine: a² = b² + c² - 2bc cos A  |  Area = ½ ab sin C",
    example: "In ΔABC: b = 5, c = 8, A = 60° ⇒ a² = 25 + 64 - 2(5)(8)cos(60°) = 89 - 40 = 49 ⇒ a = 7.",
    examTip: "Use Cosine Rule when given SAS (two sides and included angle) or SSS (three sides)."
  },

  // --- GEOMETRY (PAPER 2) ---
  {
    id: "term-geo-1",
    term: "Tan-Chord Theorem",
    category: "Geometry",
    grade: "Grade 11",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "The angle between a tangent to a circle and a chord drawn through the point of contact is equal to the angle subtended by the chord in the alternate segment.",
    formula: "∠ (tangent-chord) = ∠ (alternate segment)",
    example: "In circle geometry rider, if ∠TAB = 55° (where AT is tangent), then ∠ACB = 55° (angle in alternate segment).",
    examTip: "Abbreviate reason strictly as: 'tan chord theorem'."
  },
  {
    id: "term-geo-2",
    term: "Proportionality Theorem",
    category: "Geometry",
    grade: "Grade 12",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "A line drawn parallel to one side of a triangle divides the other two sides proportionally.",
    formula: "If DE || BC in ΔABC, then AD / DB = AE / EC",
    example: "In ΔABC with DE || BC: AD = 4, DB = 2, AE = 6 ⇒ EC = (2 × 6) / 4 = 3.",
    examTip: "State the reason strictly as: 'line || to one side of Δ'."
  },
  {
    id: "term-geo-3",
    term: "Analytical Equation of a Circle",
    category: "Geometry",
    grade: "Grade 12",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "The coordinate geometry equation representing all points (x, y) equidistant from the center (a, b) with radius r.",
    formula: "(x - a)² + (y - b)² = r²",
    example: "Circle with center (-2, 3) and radius 5: (x + 2)² + (y - 3)² = 25.",
    examTip: "Remember radius is perpendicular to tangent at point of contact (m_radius × m_tangent = -1).",
    interactiveType: "circle_equation"
  },
  {
    id: "term-geo-4",
    term: "Cyclic Quadrilateral Opposite Angles Theorem",
    category: "Geometry",
    grade: "Grade 11",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "The opposite angles of a cyclic quadrilateral (a four-sided polygon with all four vertices on the circumference of a circle) are supplementary.",
    formula: "∠A + ∠C = 180°  and  ∠B + ∠D = 180°",
    example: "If ABCD is a cyclic quad and ∠A = 105°, then ∠C = 180° - 105° = 75°.",
    examTip: "State the reason as: 'opp angles of cyclic quad'."
  },

  // --- FUNCTIONS & FINANCIAL MATHS (PAPER 1) ---
  {
    id: "term-fn-1",
    term: "Inverse Function f⁻¹(x)",
    category: "Functions",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "A function f⁻¹(x) that reverses the operation of f(x) by interchanging x and y coordinates, reflected across the line y = x.",
    formula: "Swap x and y, then solve for y:  f(x) = y ⇒ x = f(y)",
    example: "Inverse of f(x) = 3x - 6: x = 3y - 6 ⇒ y = (x + 6) / 3 ⇒ f⁻¹(x) = (x + 6)/3.",
    examTip: "For parabolic inverse f(x) = ax², restrict domain (x ≥ 0 or x ≤ 0) so the inverse is a valid function (passes vertical line test).",
    interactiveType: "inverse_fn"
  },
  {
    id: "term-fin-1",
    term: "Present Value Annuity (P) Loan Repayments",
    category: "Financial Maths",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "Formula used to calculate home loan (bond) repayments, vehicle financing, or current lump sum required to fund regular equal withdrawals.",
    formula: "P = x [1 - (1 + i)^(-n)] / i",
    example: "R500,000 bond at 12% p.a. compounded monthly over 20 years: solve for monthly repayment x.",
    examTip: "Ensure n is the total number of payments (years × 12) and i is the monthly interest rate (i_annual / 12).",
    interactiveType: "annuity"
  },
  {
    id: "term-fin-2",
    term: "Future Value Annuity (F) Sinking Funds",
    category: "Financial Maths",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "Formula used to calculate total future accumulated money resulting from regular equal deposits at fixed interest rate intervals.",
    formula: "F = x [(1 + i)^n - 1] / i",
    example: "Saving R1,000 monthly for 5 years at 9% p.a. compounded monthly: F = 1000[(1 + 0.0075)^60 - 1] / 0.0075 = R75,424.",
    examTip: "For sinking fund questions: Sinking Fund = Cost of New Machine - Trade-in Value of Old Machine."
  },
  {
    id: "term-fin-3",
    term: "Nominal vs Effective Interest Rates",
    category: "Financial Maths",
    grade: "Grade 11",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "Effective rate is the actual annual yield earned when compounding occurs more frequently than once per year.",
    formula: "1 + i_eff = (1 + i_nom / m)^m",
    example: "12% p.a. compounded monthly: 1 + i_eff = (1 + 0.12/12)^12 = 1.1268 ⇒ i_eff = 12.68% p.a.",
    examTip: "Effective rate is always HIGHER than the nominal rate due to compounding."
  },

  // --- PROBABILITY & STATISTICS (PAPER 1 & PAPER 2) ---
  {
    id: "term-prob-1",
    term: "Independent Events Test",
    category: "Probability",
    grade: "Grade 11",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "Two events A and B are independent if the occurrence of event A does not affect the probability of event B occurring.",
    formula: "P(A and B) = P(A) × P(B)",
    example: "If P(A) = 0.4 and P(B) = 0.5, and P(A and B) = 0.2, then 0.4 × 0.5 = 0.2 ⇒ A and B are independent.",
    examTip: "Do not confuse independent events [P(A and B) = P(A)·P(B)] with mutually exclusive events [P(A and B) = 0]."
  },
  {
    id: "term-prob-2",
    term: "Fundamental Counting Principle & Permutations",
    category: "Probability",
    grade: "Grade 12",
    paper: "Paper 1",
    syllabus: "Both",
    definition: "The number of ways to arrange n distinct objects in a row is n! (n factorial). If items are grouped together, treat the block as 1 item.",
    formula: "Number of arrangements = n!",
    example: "How many ways can 5 books be arranged on a shelf? 5! = 5 × 4 × 3 × 2 × 1 = 120 ways.",
    examTip: "If repetition is allowed for an n-digit code using 10 digits (0-9): total codes = 10^n."
  },
  {
    id: "term-stat-1",
    term: "Least Squares Regression Line",
    category: "Statistics",
    grade: "Grade 12",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "The linear equation y = A + Bx that minimizes the sum of squared residuals in bivariate scatter plot data.",
    formula: "y = A + Bx  (where B is slope, A is y-intercept)",
    example: "Enter (x, y) stats mode on calculator: STAT → A + Bx to read A, B, and correlation coefficient r.",
    examTip: "If r is close to +1 or -1, there is a strong linear correlation between variables.",
    interactiveType: "regression"
  },
  {
    id: "term-stat-2",
    term: "Five-Number Summary & Box-and-Whisker Plot",
    category: "Statistics",
    grade: "Grade 10",
    paper: "Paper 2",
    syllabus: "Both",
    definition: "A graphical summary of data distribution using Minimum, Lower Quartile (Q1), Median (Q2), Upper Quartile (Q3), and Maximum.",
    formula: "IQR = Q3 - Q1  |  Outliers if < Q1 - 1.5(IQR) or > Q3 + 1.5(IQR)",
    example: "For data: 2, 5, 8, 12, 18, 22, 30: Min=2, Q1=5, Q2=12, Q3=22, Max=30. IQR = 17.",
    examTip: "Skewness: If (Q3 - Q2) > (Q2 - Q1), data is positively skewed (skewed right)."
  }
];

export interface InteractiveMathGlossaryProps {
  onSelectFormulaForSandbox?: (formula: string) => void;
}

export const InteractiveMathGlossary: React.FC<InteractiveMathGlossaryProps> = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [selectedPaper, setSelectedPaper] = useState<string>("All Papers");
  const [selectedSyllabus, setSelectedSyllabus] = useState<string>("All");
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);
  const [copiedTipId, setCopiedTipId] = useState<string | null>(null);
  const [expandedTermId, setExpandedTermId] = useState<string | null>("term-calc-1");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Offline & Service Worker Caching state
  const isOffline = useOfflineStatus();
  const [isCachedOffline, setIsCachedOffline] = useState<boolean>(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("amh_glossary_favorites");
      return saved ? JSON.parse(saved) : ["term-calc-1", "term-alg-1"];
    } catch {
      return ["term-calc-1", "term-alg-1"];
    }
  });

  // Pre-cache all glossary terms into Workbox Service Worker Cache on mount
  useEffect(() => {
    cacheGlossaryOffline(MATH_GLOSSARY_DATABASE).then(ok => setIsCachedOffline(ok));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("amh_glossary_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter dictionary terms
  const filteredTerms = MATH_GLOSSARY_DATABASE.filter((item) => {
    const matchesSearch = 
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.formula && item.formula.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.example && item.example.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesGrade = selectedGrade === "All Grades" || item.grade === selectedGrade;
    const matchesPaper = selectedPaper === "All Papers" || item.paper === selectedPaper;
    const matchesSyllabus = selectedSyllabus === "All" || item.syllabus === "Both" || item.syllabus === selectedSyllabus;
    const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id);

    return matchesSearch && matchesCategory && matchesGrade && matchesPaper && matchesSyllabus && matchesFavorites;
  });

  const handleCopyFormula = (id: string, formulaStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formulaStr);
    setCopiedFormulaId(id);
    setTimeout(() => setCopiedFormulaId(null), 2000);
  };

  const handleCopyExamTip = (id: string, tipStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tipStr);
    setCopiedTipId(id);
    setTimeout(() => setCopiedTipId(null), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-950 border border-navy-800 rounded-3xl p-5 md:p-8 shadow-2xl text-white relative overflow-hidden space-y-6 text-left">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-navy-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-navy-900 text-gold-400 font-black shadow-lg border border-royal-500/30 shrink-0">
            <BookMarked className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold-400/20 text-gold-400 border border-gold-400/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-400" /> CAPS & IEB Curriculum Dictionary
              </span>
              <span className="text-[11px] font-mono text-navy-300 font-bold hidden sm:inline-block">
                • Interactive Exam Terminology & Simulators
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight mt-1">
              Mathematics Glossary & Formula Solvers
            </h2>
          </div>
        </div>

        {/* METRIC BADGE & FAVORITES TOGGLE */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showFavoritesOnly
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-navy-950/80 text-navy-300 hover:text-white border-navy-800"
            }`}
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? "text-amber-400 fill-amber-400" : "text-navy-400"}`} />
            <span>Starred Terms ({favorites.length})</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-950/90 border border-navy-800 text-xs font-mono font-bold text-navy-300">
            <BookOpen className="w-4 h-4 text-gold-400" />
            <span>{MATH_GLOSSARY_DATABASE.length} Concepts Indexed</span>
            {isOffline ? (
              <span className="ml-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <WifiOff className="w-3 h-3 text-amber-400" /> Offline Mode
              </span>
            ) : isCachedOffline ? (
              <span className="ml-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1" title="Workbox Service Worker cached glossary terms for offline access">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Workbox Offline Ready
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* SEARCH BAR & FILTER CONTROLS */}
      <div className="space-y-3.5 relative z-10">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-gold-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search math terms, formulas, theorems (e.g. 'Derivative', 'Tan-Chord', 'Discriminant', 'Annuity')..."
            className="w-full bg-navy-950/90 border border-navy-750 rounded-2xl pl-12 pr-10 py-3.5 text-xs md:text-sm font-semibold text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
          {["All", "Calculus", "Algebra", "Trigonometry", "Geometry", "Functions", "Financial Maths", "Probability", "Statistics"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black shadow-md"
                  : "bg-navy-950/80 text-navy-300 hover:bg-navy-850 hover:text-white border border-navy-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          {/* Grade Selector */}
          <div className="flex items-center gap-2 bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-navy-300">
            <GraduationCap className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-transparent text-navy-100 focus:outline-none w-full cursor-pointer"
            >
              <option value="All Grades" className="bg-navy-950 text-white">All Grades</option>
              <option value="Grade 10" className="bg-navy-950 text-white">Grade 10</option>
              <option value="Grade 11" className="bg-navy-950 text-white">Grade 11</option>
              <option value="Grade 12" className="bg-navy-950 text-white">Grade 12</option>
            </select>
          </div>

          {/* Paper Selector */}
          <div className="flex items-center gap-2 bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-navy-300">
            <FileText className="w-3.5 h-3.5 text-royal-400 shrink-0" />
            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(e.target.value)}
              className="bg-transparent text-navy-100 focus:outline-none w-full cursor-pointer"
            >
              <option value="All Papers" className="bg-navy-950 text-white">All Papers</option>
              <option value="Paper 1" className="bg-navy-950 text-white">Paper 1 (Algebra/Calc)</option>
              <option value="Paper 2" className="bg-navy-950 text-white">Paper 2 (Trig/Geom)</option>
            </select>
          </div>

          {/* Syllabus Board Selector */}
          <div className="flex items-center gap-2 bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-navy-300">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedSyllabus}
              onChange={(e) => setSelectedSyllabus(e.target.value)}
              className="bg-transparent text-navy-100 focus:outline-none w-full cursor-pointer"
            >
              <option value="All" className="bg-navy-950 text-white">CAPS & IEB</option>
              <option value="CAPS" className="bg-navy-950 text-white">CAPS Only</option>
              <option value="IEB" className="bg-navy-950 text-white">IEB Only</option>
            </select>
          </div>

          {/* Active Filter Clear */}
          {(selectedCategory !== "All" || selectedGrade !== "All Grades" || selectedPaper !== "All Papers" || selectedSyllabus !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedGrade("All Grades");
                setSelectedPaper("All Papers");
                setSelectedSyllabus("All");
                setSearchQuery("");
                setShowFavoritesOnly(false);
              }}
              className="px-3 py-1.5 bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-mono font-bold text-gold-400 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* GLOSSARY DICTIONARY RESULTS ACCORDION LIST */}
      <div className="space-y-3 relative z-10">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12 px-4 bg-navy-950/80 border border-navy-800 rounded-3xl space-y-2">
            <HelpCircle className="w-10 h-10 text-navy-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No concept matches found</h4>
            <p className="text-xs text-navy-400 max-w-sm mx-auto">
              Try adjusting your search query or reset filter selections to browse CAPS & IEB mathematics definitions.
            </p>
          </div>
        ) : (
          filteredTerms.map((item) => {
            const isExpanded = expandedTermId === item.id;
            const isCopied = copiedFormulaId === item.id;
            const isTipCopied = copiedTipId === item.id;
            const isFav = favorites.includes(item.id);

            return (
              <div
                key={item.id}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isExpanded
                    ? "bg-navy-900/90 border-gold-400/40 shadow-xl ring-1 ring-gold-400/20"
                    : "bg-navy-950/70 border-navy-800 hover:border-navy-700"
                }`}
              >
                {/* Term Header Trigger */}
                <div
                  onClick={() => setExpandedTermId(isExpanded ? null : item.id)}
                  className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-navy-400 hover:text-amber-400 border border-navy-750 transition-colors cursor-pointer shrink-0"
                      title={isFav ? "Remove from starred" : "Star this formula"}
                    >
                      <Star className={`w-4 h-4 ${isFav ? "text-amber-400 fill-amber-400" : ""}`} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-royal-900 text-royal-300 border border-royal-700">
                          {item.grade} • {item.paper}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.category}
                        </span>
                        {item.interactiveType && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Calculator className="w-2.5 h-2.5 text-emerald-400" /> Interactive Solver
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm md:text-base font-black font-display text-white mt-1">
                        {item.term}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-gold-400 font-bold hidden sm:inline-block">
                      {isExpanded ? "Hide Details" : "View Definition & Formula"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform ${isExpanded ? "rotate-180 text-gold-400" : ""}`} />
                  </div>
                </div>

                {/* Expanded Concept Details Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-5 md:px-5 border-t border-navy-800/80 space-y-4 pt-4"
                    >
                      {/* Definition */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-navy-400 uppercase tracking-wider block">
                          Official Definition & Core Concept
                        </span>
                        <div className="text-xs md:text-sm text-navy-200 leading-relaxed font-sans">
                          <LatexRenderer text={item.definition} />
                        </div>
                      </div>

                      {/* Formula Box */}
                      {item.formula && (
                        <div className="p-3.5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-wider block">
                              CAPS / IEB Exam Formula Reference (KaTeX Rendered)
                            </span>
                            <button
                              onClick={(e) => handleCopyFormula(item.id, item.formula!, e)}
                              className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-mono font-bold text-navy-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                              title="Copy formula to clipboard"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Formula</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800 text-amber-300 font-bold overflow-x-auto text-sm">
                            <LatexRenderer text={item.formula.includes("$") ? item.formula : `$${item.formula}$`} block />
                          </div>
                        </div>
                      )}

                      {/* INTERACTIVE SOLVER WIDGET FOR SPECIFIC TERMS */}
                      {item.interactiveType && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-navy-950 via-royal-950 to-navy-900 border border-royal-700/60 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold-400 uppercase tracking-wider">
                            <Zap className="w-4 h-4 text-gold-400 animate-pulse" />
                            <span>Interactive Concept Simulator</span>
                          </div>

                          {item.interactiveType === "discriminant" && <DiscriminantSimulator />}
                          {item.interactiveType === "first_principles" && <FirstPrinciplesSimulator />}
                          {item.interactiveType === "sum_infinity" && <SumInfinitySimulator />}
                          {item.interactiveType === "annuity" && <AnnuitySimulator />}
                          {item.interactiveType === "circle_equation" && <CircleEquationSimulator />}
                          {item.interactiveType === "compound_angle" && <CompoundAngleSimulator />}
                          {item.interactiveType === "inverse_fn" && <InverseFnSimulator />}
                          {item.interactiveType === "regression" && <RegressionSimulator />}
                        </div>
                      )}

                      {/* Worked Example */}
                      {item.example && (
                        <div className="p-3.5 rounded-2xl bg-royal-950/60 border border-royal-800/60 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-royal-300 uppercase tracking-wider flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-gold-400" /> Worked Exam Example
                          </span>
                          <div className="text-xs text-navy-200 leading-relaxed font-mono">
                            <LatexRenderer text={item.example} />
                          </div>
                        </div>
                      )}

                      {/* Exam Tip */}
                      {item.examTip && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start justify-between gap-3 text-xs text-amber-200">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-mono text-amber-400 uppercase text-[10px] tracking-wider block">
                                Matric Marker Exam Tip
                              </strong>
                              <LatexRenderer text={item.examTip} />
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleCopyExamTip(item.id, item.examTip!, e)}
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors shrink-0 cursor-pointer"
                            title="Copy exam tip"
                          >
                            {isTipCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
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

// ==========================================
// INTERACTIVE SIMULATOR COMPONENTS
// ==========================================

// 1. Discriminant Calculator
const DiscriminantSimulator: React.FC = () => {
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-5);
  const [c, setC] = useState<number>(6);

  const delta = b * b - 4 * a * c;

  let nature = "";
  if (a === 0) {
    nature = "Not a quadratic equation (a = 0)";
  } else if (delta < 0) {
    nature = "Δ < 0 ⇒ 2 Non-real (Complex) roots";
  } else if (delta === 0) {
    nature = "Δ = 0 ⇒ 2 Real, Equal, Rational roots";
  } else {
    const isPerfSquare = Number.isInteger(Math.sqrt(delta));
    if (isPerfSquare) {
      nature = "Δ > 0 and perfect square ⇒ 2 Real, Rational, Unequal roots";
    } else {
      nature = "Δ > 0 and NOT a perfect square ⇒ 2 Real, Irrational, Unequal roots";
    }
  }

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">a coefficient</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">b coefficient</label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">c constant</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <div className="flex justify-between items-center text-amber-300">
          <span>Equation: {a}x² {b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0</span>
          <span className="font-bold text-gold-400">Δ = b² - 4ac = ({b})² - 4({a})({c}) = {delta}</span>
        </div>
        <p className="text-emerald-400 font-bold">{nature}</p>
      </div>
    </div>
  );
};

// 2. First Principles Simulator
const FirstPrinciplesSimulator: React.FC = () => {
  const [a, setA] = useState<number>(2);
  const [xVal, setXVal] = useState<number>(3);

  const derivativeAtX = 2 * a * xVal;

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Function f(x) = a·x² (Set a)</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Evaluate Gradient at x =</label>
          <input
            type="number"
            value={xVal}
            onChange={(e) => setXVal(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <p className="text-navy-300">f(x + h) = {a}(x + h)² = {a}(x² + 2xh + h²)</p>
        <p className="text-navy-300">f(x + h) - f(x) = {2*a}xh + {a}h² = h({2*a}x + {a}h)</p>
        <p className="text-gold-400 font-bold">f'(x) = lim_{`{h→0}`} [{2*a}x + {a}h] = {2*a}x</p>
        <p className="text-emerald-400 font-bold">Tangent gradient at x = {xVal}: f'({xVal}) = {derivativeAtX}</p>
      </div>
    </div>
  );
};

// 3. Sum to Infinity Simulator
const SumInfinitySimulator: React.FC = () => {
  const [a, setA] = useState<number>(8);
  const [r, setR] = useState<number>(0.5);

  const isConvergent = Math.abs(r) < 1;
  const sumInf = isConvergent ? a / (1 - r) : null;

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">First Term (a)</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Common Ratio (r)</label>
          <input
            type="number"
            step="0.1"
            value={r}
            onChange={(e) => setR(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <p className="text-navy-300">Sequence preview: {a}, {a*r}, {a*r*r}, {a*r*r*r}, ...</p>
        {isConvergent ? (
          <p className="text-emerald-400 font-bold">
            Convergent (|{r}| &lt; 1) ⇒ S_∞ = a / (1 - r) = {a} / (1 - {r}) = {sumInf?.toFixed(4)}
          </p>
        ) : (
          <p className="text-rose-400 font-bold">
            Divergent (|{r}| ≥ 1) ⇒ Sum to infinity DOES NOT EXIST.
          </p>
        )}
      </div>
    </div>
  );
};

// 4. Annuity Calculator
const AnnuitySimulator: React.FC = () => {
  const [monthlyX, setMonthlyX] = useState<number>(5000);
  const [rateAnn, setRateAnn] = useState<number>(11);
  const [years, setYears] = useState<number>(20);

  const i = rateAnn / 100 / 12;
  const n = years * 12;
  const p = i > 0 ? monthlyX * (1 - Math.pow(1 + i, -n)) / i : 0;
  const totalRepaid = monthlyX * n;
  const totalInterest = totalRepaid - p;

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Monthly Payment (x)</label>
          <input
            type="number"
            value={monthlyX}
            onChange={(e) => setMonthlyX(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Annual Rate %</label>
          <input
            type="number"
            step="0.5"
            value={rateAnn}
            onChange={(e) => setRateAnn(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Term (Years)</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold"
          />
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <p className="text-gold-400 font-bold">
          Maximum Home Loan Principal (P) = R{Math.round(p).toLocaleString()} ZAR
        </p>
        <p className="text-navy-300">
          Total Repaid over {n} months: R{Math.round(totalRepaid).toLocaleString()} | Total Bank Interest: R{Math.round(totalInterest).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// 5. Circle Equation Simulator
const CircleEquationSimulator: React.FC = () => {
  const [a, setA] = useState<number>(-2);
  const [b, setB] = useState<number>(3);
  const [r, setR] = useState<number>(5);
  const [px, setPx] = useState<number>(1);
  const [py, setPy] = useState<number>(7);

  const distSq = (px - a) * (px - a) + (py - b) * (py - b);
  const rSq = r * r;

  let loc = "";
  if (distSq === rSq) loc = "ON the circle circumference";
  else if (distSq < rSq) loc = "INSIDE the circle";
  else loc = "OUTSIDE the circle";

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-5 gap-1.5">
        <div>
          <label className="text-[9px] text-navy-400 uppercase block">Center a</label>
          <input type="number" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-1 py-1 text-white text-center font-bold" />
        </div>
        <div>
          <label className="text-[9px] text-navy-400 uppercase block">Center b</label>
          <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-1 py-1 text-white text-center font-bold" />
        </div>
        <div>
          <label className="text-[9px] text-navy-400 uppercase block">Radius r</label>
          <input type="number" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-1 py-1 text-white text-center font-bold" />
        </div>
        <div>
          <label className="text-[9px] text-navy-400 uppercase block">Test x</label>
          <input type="number" value={px} onChange={(e) => setPx(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-1 py-1 text-white text-center font-bold" />
        </div>
        <div>
          <label className="text-[9px] text-navy-400 uppercase block">Test y</label>
          <input type="number" value={py} onChange={(e) => setPy(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-1 py-1 text-white text-center font-bold" />
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <p className="text-amber-300">
          Circle: (x {a >= 0 ? `- ${a}` : `+ ${Math.abs(a)}`})² + (y {b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`})² = {rSq}
        </p>
        <p className="text-gold-400 font-bold">
          Point ({px}, {py}) distance squared = ({px} - ({a}))² + ({py} - ({b}))² = {distSq}
        </p>
        <p className="text-emerald-400 font-bold">Point ({px}, {py}) is {loc}</p>
      </div>
    </div>
  );
};

// 6. Compound Angle Simulator
const CompoundAngleSimulator: React.FC = () => {
  const [alpha, setAlpha] = useState<number>(45);
  const [beta, setBeta] = useState<number>(30);

  const radA = (alpha * Math.PI) / 180;
  const radB = (beta * Math.PI) / 180;

  const cosSum = Math.cos(radA + radB);
  const cosExp = Math.cos(radA) * Math.cos(radB) - Math.sin(radA) * Math.sin(radB);

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Angle α (deg)</label>
          <input type="number" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold" />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Angle β (deg)</label>
          <input type="number" value={beta} onChange={(e) => setBeta(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold" />
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <p className="text-gold-400 font-bold">
          cos({alpha}° + {beta}°) = cos({alpha} + {beta}°) = {cosSum.toFixed(4)}
        </p>
        <p className="text-emerald-400 font-bold">
          cos({alpha}°)cos({beta}°) - sin({alpha}°)sin({beta}°) = {cosExp.toFixed(4)} ✓ Identity verified!
        </p>
      </div>
    </div>
  );
};

// 7. Inverse Function Simulator
const InverseFnSimulator: React.FC = () => {
  const [m, setM] = useState<number>(3);
  const [c, setC] = useState<number>(-6);
  const [xVal, setXVal] = useState<number>(4);

  const fx = m * xVal + c;
  const invFx = m !== 0 ? (xVal - c) / m : 0;

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Gradient m</label>
          <input type="number" value={m} onChange={(e) => setM(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold" />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">y-intercept c</label>
          <input type="number" value={c} onChange={(e) => setC(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold" />
        </div>
        <div>
          <label className="text-[10px] text-navy-400 uppercase block">Evaluate x =</label>
          <input type="number" value={xVal} onChange={(e) => setXVal(Number(e.target.value))} className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-center font-bold" />
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <p className="text-amber-300">f(x) = {m}x {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} ⇒ f({xVal}) = {fx}</p>
        <p className="text-gold-400 font-bold">Inverse: f⁻¹(x) = (x {c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`}) / {m}</p>
        <p className="text-emerald-400 font-bold">Symmetry Check: f⁻¹({fx}) = ({fx} {c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`}) / {m} = {xVal}</p>
      </div>
    </div>
  );
};

// 8. Regression Line Simulator
const RegressionSimulator: React.FC = () => {
  const [x1, setX1] = useState<number>(10);
  const [y1, setY1] = useState<number>(45);
  const [x2, setX2] = useState<number>(20);
  const [y2, setY2] = useState<number>(65);
  const [x3, setX3] = useState<number>(30);
  const [y3, setY3] = useState<number>(85);

  const meanX = (x1 + x2 + x3) / 3;
  const meanY = (y1 + y2 + y3) / 3;

  const num = (x1 - meanX)*(y1 - meanY) + (x2 - meanX)*(y2 - meanY) + (x3 - meanX)*(y3 - meanY);
  const den = Math.pow(x1 - meanX, 2) + Math.pow(x2 - meanX, 2) + Math.pow(x3 - meanX, 2);

  const B = den !== 0 ? num / den : 0;
  const A = meanY - B * meanX;

  return (
    <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-3 text-xs font-mono">
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <span className="text-[9px] text-navy-400 uppercase block">Point 1 (x1, y1)</span>
          <div className="flex gap-1">
            <input type="number" value={x1} onChange={(e) => setX1(Number(e.target.value))} className="w-1/2 bg-navy-900 border border-navy-700 rounded p-1 text-white text-center font-bold" />
            <input type="number" value={y1} onChange={(e) => setY1(Number(e.target.value))} className="w-1/2 bg-navy-900 border border-navy-700 rounded p-1 text-white text-center font-bold" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] text-navy-400 uppercase block">Point 2 (x2, y2)</span>
          <div className="flex gap-1">
            <input type="number" value={x2} onChange={(e) => setX2(Number(e.target.value))} className="w-1/2 bg-navy-900 border border-navy-700 rounded p-1 text-white text-center font-bold" />
            <input type="number" value={y2} onChange={(e) => setY2(Number(e.target.value))} className="w-1/2 bg-navy-900 border border-navy-700 rounded p-1 text-white text-center font-bold" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] text-navy-400 uppercase block">Point 3 (x3, y3)</span>
          <div className="flex gap-1">
            <input type="number" value={x3} onChange={(e) => setX3(Number(e.target.value))} className="w-1/2 bg-navy-900 border border-navy-700 rounded p-1 text-white text-center font-bold" />
            <input type="number" value={y3} onChange={(e) => setY3(Number(e.target.value))} className="w-1/2 bg-navy-900 border border-navy-700 rounded p-1 text-white text-center font-bold" />
          </div>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-750 space-y-1">
        <p className="text-gold-400 font-bold">
          Least Squares Line: y = A + Bx ⇒ y = {A.toFixed(2)} + {B.toFixed(2)}x
        </p>
        <p className="text-emerald-400 font-bold">
          Predict y for x = 25: y = {A.toFixed(2)} + {B.toFixed(2)}(25) = {(A + B * 25).toFixed(2)}
        </p>
      </div>
    </div>
  );
};
