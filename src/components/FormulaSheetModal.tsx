import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Search,
  X,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Sparkles,
  Calculator,
  Download,
  Filter,
  Layers,
  ChevronRight,
  Info,
  Zap,
  HelpCircle,
  Maximize2,
  Minimize2,
  Printer,
  FileText
} from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { Profile } from "../types";

export interface FormulaItem {
  id: string;
  title: string;
  category:
    | "Algebra & Surds"
    | "Sequences & Series"
    | "Financial Maths"
    | "Calculus & Functions"
    | "Analytical Geometry"
    | "Trigonometric Identities"
    | "Sine, Cosine & Area Rules"
    | "Statistics & Regression"
    | "Probability & Counting"
    | "Euclidean Geometry";
  paper: "Paper 1" | "Paper 2" | "Both";
  latex: string;
  description: string;
  variables: { symbol: string; meaning: string }[];
  conditions?: string;
  examTip?: string;
  exampleLatex?: string;
  isIEBSpecific?: boolean;
}

export const FORMULAS_DATA: FormulaItem[] = [
  // --- PAPER 1: ALGEBRA & SURDS ---
  {
    id: "f-quad",
    title: "Quadratic Formula",
    category: "Algebra & Surds",
    paper: "Paper 1",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    description: "Solves second-degree polynomial equations $ax^2 + bx + c = 0$.",
    variables: [
      { symbol: "a", meaning: "Coefficient of $x^2$ ($a \\neq 0$)" },
      { symbol: "b", meaning: "Coefficient of $x$" },
      { symbol: "c", meaning: "Constant term" },
      { symbol: "\\Delta", meaning: "Discriminant $\\Delta = b^2 - 4ac$" }
    ],
    conditions: "Requires $a \\neq 0$. If $\\Delta < 0$, roots are non-real.",
    examTip: "Always show values substituted into the formula before simplifying to secure method marks.",
    exampleLatex: "x^2 - 5x + 6 = 0 \\implies x = \\frac{-(-5) \\pm \\sqrt{(-5)^2 - 4(1)(6)}}{2(1)} = \\frac{5 \\pm 1}{2} \\implies x = 3 \\text{ or } x = 2"
  },
  {
    id: "f-axis-sym",
    title: "Axis of Symmetry (Parabola)",
    category: "Algebra & Surds",
    paper: "Paper 1",
    latex: "x = -\\frac{b}{2a}",
    description: "Finds the $x$-coordinate of the turning point for $f(x) = ax^2 + bx + c$.",
    variables: [
      { symbol: "a", meaning: "Leading coefficient of $x^2$" },
      { symbol: "b", meaning: "Coefficient of $x$" }
    ],
    examTip: "Substitute this $x$-value back into $f(x)$ to obtain the minimum or maximum $y$-value."
  },
  {
    id: "f-surd-prop",
    title: "Surd Multiplication Property",
    category: "Algebra & Surds",
    paper: "Paper 1",
    latex: "\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\cdot b} \\quad \\text{and} \\quad \\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}",
    description: "Simplifies expressions with radical terms without using a calculator.",
    variables: [
      { symbol: "a, b", meaning: "Non-negative real numbers ($a, b \\ge 0$)" }
    ],
    conditions: "$b > 0$ for division."
  },

  // --- PAPER 1: SEQUENCES & SERIES ---
  {
    id: "f-arith-nth",
    title: "Arithmetic Sequence (General Term)",
    category: "Sequences & Series",
    paper: "Paper 1",
    latex: "T_n = a + (n - 1)d",
    description: "Finds the $n$-th term of a sequence with a constant first difference $d = T_2 - T_1$.",
    variables: [
      { symbol: "T_n", meaning: "The $n$-th term value" },
      { symbol: "a", meaning: "First term ($T_1$)" },
      { symbol: "n", meaning: "Term position number ($n \\in \\mathbb{N}$)" },
      { symbol: "d", meaning: "Common difference ($d = T_n - T_{n-1}$)" }
    ],
    examTip: "If asked 'Which term equals 145?', set $T_n = 145$ and solve for integer $n$."
  },
  {
    id: "f-arith-sum",
    title: "Arithmetic Series (Sum Formula)",
    category: "Sequences & Series",
    paper: "Paper 1",
    latex: "S_n = \\frac{n}{2}\\left[2a + (n - 1)d\\right] \\quad \\text{or} \\quad S_n = \\frac{n}{2}(a + l)",
    description: "Calculates the sum of the first $n$ terms of an arithmetic progression.",
    variables: [
      { symbol: "S_n", meaning: "Sum of first $n$ terms" },
      { symbol: "l", meaning: "Last term ($l = T_n$)" },
      { symbol: "a", meaning: "First term" },
      { symbol: "d", meaning: "Common difference" }
    ]
  },
  {
    id: "f-geom-nth",
    title: "Geometric Sequence (General Term)",
    category: "Sequences & Series",
    paper: "Paper 1",
    latex: "T_n = a \\cdot r^{n - 1}",
    description: "Finds the $n$-th term of a sequence with a constant ratio $r = \\frac{T_2}{T_1}$.",
    variables: [
      { symbol: "T_n", meaning: "The $n$-th term" },
      { symbol: "a", meaning: "First term" },
      { symbol: "r", meaning: "Common ratio ($r = \\frac{T_n}{T_{n-1}}$)" }
    ]
  },
  {
    id: "f-geom-sum",
    title: "Geometric Series (Sum Formula)",
    category: "Sequences & Series",
    paper: "Paper 1",
    latex: "S_n = \\frac{a(r^n - 1)}{r - 1} \\quad (r \\neq 1) \\quad \\text{or} \\quad S_n = \\frac{a(1 - r^n)}{1 - r}",
    description: "Calculates the sum of first $n$ terms of a geometric sequence.",
    variables: [
      { symbol: "S_n", meaning: "Sum of $n$ terms" },
      { symbol: "a", meaning: "First term" },
      { symbol: "r", meaning: "Common ratio ($r \\neq 1$)" }
    ]
  },
  {
    id: "f-geom-infinite",
    title: "Sum to Infinity (Convergent Series)",
    category: "Sequences & Series",
    paper: "Paper 1",
    latex: "S_\\infty = \\frac{a}{1 - r} \\quad \\text{where } -1 < r < 1",
    description: "Calculates the limiting sum of an infinite geometric series.",
    variables: [
      { symbol: "S_\\infty", meaning: "Infinite sum value" },
      { symbol: "a", meaning: "First term" },
      { symbol: "r", meaning: "Common ratio" }
    ],
    conditions: "Series converges IF AND ONLY IF $-1 < r < 1$ (i.e. $|r| < 1$).",
    examTip: "State the condition $|r| < 1$ explicitly whenever proving convergence in CAPS Paper 1."
  },
  {
    id: "f-quad-seq",
    title: "Quadratic Sequence (Second Difference)",
    category: "Sequences & Series",
    paper: "Paper 1",
    latex: "T_n = an^2 + bn + c \\implies 2a = d_2, \\quad 3a + b = f_1, \\quad a + b + c = T_1",
    description: "Generates terms for sequence with a constant second difference $d_2$.",
    variables: [
      { symbol: "d_2", meaning: "Constant 2nd difference ($2a = d_2$)" },
      { symbol: "f_1", meaning: "First 1st difference ($3a + b = f_1$)" },
      { symbol: "T_1", meaning: "First sequence term ($a + b + c = T_1$)" }
    ]
  },

  // --- PAPER 1: FINANCIAL MATHS ---
  {
    id: "f-fin-simple-growth",
    title: "Simple Interest / Growth",
    category: "Financial Maths",
    paper: "Paper 1",
    latex: "A = P(1 + i \\cdot n)",
    description: "Calculates total accumulated capital using simple interest growth.",
    variables: [
      { symbol: "A", meaning: "Final accumulated amount" },
      { symbol: "P", meaning: "Initial principal capital" },
      { symbol: "i", meaning: "Interest rate per period ($i = \\frac{r}{100}$)" },
      { symbol: "n", meaning: "Number of years/periods" }
    ]
  },
  {
    id: "f-fin-compound-growth",
    title: "Compound Interest / Inflation",
    category: "Financial Maths",
    paper: "Paper 1",
    latex: "A = P(1 + i)^n",
    description: "Calculates compound growth where interest earns interest each period.",
    variables: [
      { symbol: "A", meaning: "Accumulated future value" },
      { symbol: "P", meaning: "Present principal amount" },
      { symbol: "i", meaning: "Interest rate per compounding interval" },
      { symbol: "n", meaning: "Total compounding periods ($n = \\text{years} \\times \\text{frequency}$)" }
    ]
  },
  {
    id: "f-fin-reducing-balance",
    title: "Reducing Balance Depreciation",
    category: "Financial Maths",
    paper: "Paper 1",
    latex: "A = P(1 - i)^n",
    description: "Calculates book value of assets decaying exponentially over time.",
    variables: [
      { symbol: "A", meaning: "Book value after $n$ periods" },
      { symbol: "P", meaning: "Original purchase price" },
      { symbol: "i", meaning: "Annual depreciation rate" }
    ],
    examTip: "When solving for $n$ in depreciation, use natural logarithms: $n = \\frac{\\log(A/P)}{\\log(1-i)}$."
  },
  {
    id: "f-fin-sinking-fund",
    title: "Future Value Annuity (Sinking Fund / Savings)",
    category: "Financial Maths",
    paper: "Paper 1",
    latex: "F = \\frac{x\\left[(1 + i)^n - 1\\right]}{i}",
    description: "Calculates total accumulated savings from regular equal deposits $x$.",
    variables: [
      { symbol: "F", meaning: "Future accumulated balance" },
      { symbol: "x", meaning: "Regular monthly payment" },
      { symbol: "i", meaning: "Monthly interest rate ($i = \\frac{r}{12}$)" },
      { symbol: "n", meaning: "Total number of monthly payments" }
    ]
  },
  {
    id: "f-fin-present-value",
    title: "Present Value Annuity (Bond / Loan Repayments)",
    category: "Financial Maths",
    paper: "Paper 1",
    latex: "P = \\frac{x\\left[1 - (1 + i)^{-n}\\right]}{i}",
    description: "Calculates home loan or vehicle finance loan balance principal $P$.",
    variables: [
      { symbol: "P", meaning: "Present loan amount borrowed" },
      { symbol: "x", meaning: "Monthly loan repayment" },
      { symbol: "i", meaning: "Monthly interest rate" },
      { symbol: "n", meaning: "Remaining payment installments" }
    ],
    examTip: "If repayment starts 1 month after loan agreement, use standard $n$. If deferred, compound principal first."
  },
  {
    id: "f-fin-nominal-effective",
    title: "Nominal vs Effective Interest Rate Conversion",
    category: "Financial Maths",
    paper: "Paper 1",
    latex: "1 + i_{\\text{eff}} = \\left(1 + \\frac{i^{(m)}}{m}\\right)^m",
    description: "Converts nominal annual compounding rate to effective annual yield.",
    variables: [
      { symbol: "i_{\\text{eff}}", meaning: "Effective annual interest rate" },
      { symbol: "i^{(m)}", meaning: "Nominal rate compounding $m$ times/year" },
      { symbol: "m", meaning: "Compounding frequency (12 = monthly, 4 = quarterly)" }
    ]
  },

  // --- PAPER 1: CALCULUS & FUNCTIONS ---
  {
    id: "f-calc-first-principles",
    title: "First Principles Derivative Limit",
    category: "Calculus & Functions",
    paper: "Paper 1",
    latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
    description: "Defines instantaneous rate of change and gradient function $f'(x)$.",
    variables: [
      { symbol: "f'(x)", meaning: "Gradient function of tangent line at $x$" },
      { symbol: "h", meaning: "Infinitesimal horizontal increment ($h \\to 0$)" }
    ],
    examTip: "Keep the $\\lim_{h \\to 0}$ notation on every line until you evaluate $h = 0$ in the final step!"
  },
  {
    id: "f-calc-power-rule",
    title: "Power Rule Differentiation",
    category: "Calculus & Functions",
    paper: "Paper 1",
    latex: "\\frac{d}{dx}\\left[a \\cdot x^n\\right] = a \\cdot n \\cdot x^{n - 1}",
    description: "Quick rule to differentiate polynomial power functions.",
    variables: [
      { symbol: "n", meaning: "Real exponent power ($n \\in \\mathbb{R}$)" },
      { symbol: "a", meaning: "Constant numerical scalar" }
    ],
    conditions: "Must expand brackets and convert surds to fractional exponents $x^{\\frac{p}{q}}$ before applying rule."
  },
  {
    id: "f-calc-turning-point",
    title: "Cubic Polynomial Turning Points & Inflection",
    category: "Calculus & Functions",
    paper: "Paper 1",
    latex: "f'(x) = 0 \\implies \\text{Local Min/Max}, \\quad f''(x) = 0 \\implies \\text{Point of Inflection}",
    description: "Locates local stationary turning points and inflection concavity changes.",
    variables: [
      { symbol: "f'(x)", meaning: "First derivative (gradient)" },
      { symbol: "f''(x)", meaning: "Second derivative (concavity)" }
    ]
  },

  // --- PAPER 2: ANALYTICAL GEOMETRY ---
  {
    id: "f-ana-distance",
    title: "Distance Between Two Points",
    category: "Analytical Geometry",
    paper: "Paper 2",
    latex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
    description: "Calculates spatial distance between coordinates $A(x_1; y_1)$ and $B(x_2; y_2)$.",
    variables: [
      { symbol: "d", meaning: "Euclidean line segment length" }
    ]
  },
  {
    id: "f-ana-midpoint",
    title: "Midpoint Coordinates Formula",
    category: "Analytical Geometry",
    paper: "Paper 2",
    latex: "M\\left(\\frac{x_1 + x_2}{2} ; \\frac{y_1 + y_2}{2}\\right)",
    description: "Finds center midpoint coordinates bisecting segment $AB$.",
    variables: [
      { symbol: "M", meaning: "Midpoint coordinate point" }
    ]
  },
  {
    id: "f-ana-gradient",
    title: "Gradient & Inclination Angle",
    category: "Analytical Geometry",
    paper: "Paper 2",
    latex: "m = \\frac{y_2 - y_1}{x_2 - x_1} \\quad \\text{and} \\quad \\tan \\theta = m",
    description: "Determines line slope $m$ and inclination angle $\\theta$ relative to positive $x$-axis.",
    variables: [
      { symbol: "m", meaning: "Line gradient ($m_1 \\cdot m_2 = -1$ for perpendicular lines)" },
      { symbol: "\\theta", meaning: "Angle of inclination ($0^\\circ \\le \\theta < 180^\\circ$)" }
    ],
    examTip: "If $m < 0$, $\\tan \\theta$ is negative $\\implies \\theta = 180^\\circ - \\text{ref angle}$."
  },
  {
    id: "f-ana-straight-line",
    title: "Straight Line Equations",
    category: "Analytical Geometry",
    paper: "Paper 2",
    latex: "y - y_1 = m(x - x_1) \\quad \\text{or} \\quad y = mx + c",
    description: "Equation of a straight line given point $(x_1; y_1)$ and gradient $m$.",
    variables: [
      { symbol: "c", meaning: "$y$-intercept coordinate $(0; c)$" }
    ]
  },
  {
    id: "f-ana-circle",
    title: "Circle Equation (Center at $(a; b)$)",
    category: "Analytical Geometry",
    paper: "Paper 2",
    latex: "(x - a)^2 + (y - b)^2 = r^2",
    description: "Standard circle locus equation centered at point $C(a; b)$ with radius $r$.",
    variables: [
      { symbol: "(a; b)", meaning: "Center coordinates of circle" },
      { symbol: "r", meaning: "Radius length ($r > 0$)" }
    ],
    examTip: "Tangent is perpendicular to radius at point of contact $\\implies m_{\\text{tangent}} \\cdot m_{\\text{radius}} = -1$."
  },

  // --- PAPER 2: TRIGONOMETRIC IDENTITIES ---
  {
    id: "f-trig-quotient-pyth",
    title: "Quotient & Square Pythagorean Identities",
    category: "Trigonometric Identities",
    paper: "Paper 2",
    latex: "\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta} \\quad \\text{and} \\quad \\sin^2 \\theta + \\cos^2 \\theta = 1",
    description: "Fundamental fundamental trig identities used in expression simplification and proofs.",
    variables: [
      { symbol: "\\theta", meaning: "Angle variable in degrees or radians" }
    ],
    examTip: "Rearrange $\\sin^2 \\theta = 1 - \\cos^2 \\theta = (1 - \\cos \\theta)(1 + \\cos \\theta)$ for factoring."
  },
  {
    id: "f-trig-compound-sin",
    title: "Sine Compound Angle Identities",
    category: "Trigonometric Identities",
    paper: "Paper 2",
    latex: "\\sin(\\alpha \\pm \\beta) = \\sin \\alpha \\cos \\beta \\pm \\cos \\alpha \\sin \\beta",
    description: "Expands sine of sum or difference of two angles.",
    variables: [
      { symbol: "\\alpha, \\beta", meaning: "Component angle values" }
    ]
  },
  {
    id: "f-trig-compound-cos",
    title: "Cosine Compound Angle Identities",
    category: "Trigonometric Identities",
    paper: "Paper 2",
    latex: "\\cos(\\alpha \\pm \\beta) = \\cos \\alpha \\cos \\beta \\mp \\sin \\alpha \\sin \\beta",
    description: "Expands cosine of sum or difference of two angles. Note the sign flip!",
    variables: [
      { symbol: "\\alpha, \\beta", meaning: "Component angle values" }
    ],
    examTip: "Notice the opposite sign: $\\cos(\\alpha + \\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta$."
  },
  {
    id: "f-trig-double-angle",
    title: "Double Angle Identities",
    category: "Trigonometric Identities",
    paper: "Paper 2",
    latex: "\\sin(2\\alpha) = 2\\sin\\alpha\\cos\\alpha, \\quad \\cos(2\\alpha) = \\cos^2\\alpha - \\sin^2\\alpha = 2\\cos^2\\alpha - 1 = 1 - 2\\sin^2\\alpha",
    description: "Expresses double angles in terms of single angle trig ratios.",
    variables: [
      { symbol: "2\\alpha", meaning: "Double angle value" }
    ],
    examTip: "When proving identities, select the $\\cos(2\\alpha)$ expansion that cancels out constants like $+1$ or $-1$."
  },

  // --- PAPER 2: SINE, COSINE & AREA RULES ---
  {
    id: "f-trig-sine-rule",
    title: "The Sine Rule",
    category: "Sine, Cosine & Area Rules",
    paper: "Paper 2",
    latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} \\quad \\text{or} \\quad \\frac{\\sin A}{a} = \\frac{\\sin B}{b} = \\frac{\\sin C}{c}",
    description: "Solves non-right-angled triangles given side-angle pairs.",
    variables: [
      { symbol: "a, b, c", meaning: "Triangle side lengths" },
      { symbol: "A, B, C", meaning: "Opposite interior angles" }
    ],
    conditions: "Use when you know two sides + non-included angle OR two angles + any side."
  },
  {
    id: "f-trig-cosine-rule",
    title: "The Cosine Rule",
    category: "Sine, Cosine & Area Rules",
    paper: "Paper 2",
    latex: "a^2 = b^2 + c^2 - 2bc \\cos A \\quad \\implies \\quad \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}",
    description: "Calculates third side or interior angle in any non-right triangle.",
    variables: [
      { symbol: "A", meaning: "Angle enclosed between sides $b$ and $c$" }
    ],
    conditions: "Use when given two sides + included angle (SAS) or all three sides (SSS)."
  },
  {
    id: "f-trig-area-rule",
    title: "The Area Rule",
    category: "Sine, Cosine & Area Rules",
    paper: "Paper 2",
    latex: "\\text{Area } \\Delta ABC = \\frac{1}{2} a b \\sin C",
    description: "Calculates triangle area without needing vertical perpendicular height.",
    variables: [
      { symbol: "a, b", meaning: "Two adjacent side lengths" },
      { symbol: "C", meaning: "Included angle between sides $a$ and $b$" }
    ]
  },

  // --- PAPER 2: STATISTICS & REGRESSION ---
  {
    id: "f-stat-mean",
    title: "Arithmetic Mean",
    category: "Statistics & Regression",
    paper: "Paper 2",
    latex: "\\bar{x} = \\frac{\\sum x}{n} \\quad \\text{or} \\quad \\bar{x} = \\frac{\\sum f x}{n}",
    description: "Calculates average central tendency for ungrouped or grouped frequency data.",
    variables: [
      { symbol: "\\bar{x}", meaning: "Sample mean average" },
      { symbol: "\\sum x", meaning: "Sum of all data points" },
      { symbol: "n", meaning: "Total sample size" }
    ]
  },
  {
    id: "f-stat-std-dev",
    title: "Standard Deviation & Variance",
    category: "Statistics & Regression",
    paper: "Paper 2",
    latex: "\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2}{n}} \\quad \\text{and} \\quad \\text{Variance} = \\sigma^2",
    description: "Measures average spread and dispersion of data around the mean.",
    variables: [
      { symbol: "\\sigma", meaning: "Population standard deviation" },
      { symbol: "\\sigma^2", meaning: "Variance" }
    ]
  },
  {
    id: "f-stat-regression",
    title: "Least Squares Regression Line",
    category: "Statistics & Regression",
    paper: "Paper 2",
    latex: "\\hat{y} = a + bx \\quad \\text{where } b = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{\\sum (x - \\bar{x})^2}",
    description: "Best fit trend line equation predicting $y$ for given predictor variable $x$.",
    variables: [
      { symbol: "a", meaning: "$y$-intercept of regression line" },
      { symbol: "b", meaning: "Slope gradient coefficient" },
      { symbol: "r", meaning: "Correlation coefficient ($-1 \\le r \\le 1$)" }
    ]
  },

  // --- PAPER 2: PROBABILITY & COUNTING ---
  {
    id: "f-prob-union",
    title: "Probability Addition Rule (Union)",
    category: "Probability & Counting",
    paper: "Paper 1",
    latex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
    description: "Probability that event $A$ or event $B$ (or both) occur.",
    variables: [
      { symbol: "P(A \\cup B)", meaning: "Probability of $A$ OR $B$" },
      { symbol: "P(A \\cap B)", meaning: "Probability of $A$ AND $B$" }
    ],
    conditions: "For mutually exclusive events, $P(A \\cap B) = 0 \\implies P(A \\cup B) = P(A) + P(B)$."
  },
  {
    id: "f-prob-independent",
    title: "Independent Events Test",
    category: "Probability & Counting",
    paper: "Paper 1",
    latex: "P(A \\cap B) = P(A) \\cdot P(B)",
    description: "Test condition to prove whether two events $A$ and $B$ are statistically independent.",
    variables: [
      { symbol: "P(A \\cap B)", meaning: "Joint probability" }
    ],
    examTip: "To prove independence in exams, calculate $P(A) \\cdot P(B)$ separately and compare to $P(A \\cap B)$."
  },
  {
    id: "f-prob-counting-principle",
    title: "Fundamental Counting Principle & Permutations",
    category: "Probability & Counting",
    paper: "Paper 1",
    latex: "\\text{Total Arrangements} = n_1 \\times n_2 \\times \\dots \\times n_k \\quad \\text{and} \\quad n! = n(n-1)(n-2)\\dots(1)",
    description: "Calculates total possible arrangements of items with or without repetition.",
    variables: [
      { symbol: "n!", meaning: "Factorial product ($0! = 1$)" }
    ]
  },

  // --- PAPER 2: EUCLIDEAN GEOMETRY THEOREMS ---
  {
    id: "f-euc-center-angle",
    title: "Center Angle Theorem",
    category: "Euclidean Geometry",
    paper: "Paper 2",
    latex: "\\angle \\text{ at center} = 2 \\times \\angle \\text{ at circumference}",
    description: "The angle subtended by an arc at the center is double the angle subtended at the circle circumference.",
    variables: [
      { symbol: "O", meaning: "Center of circle" }
    ],
    examTip: "Acceptable CAPS reason: '$\\angle$ at center $= 2 \\times \\angle$ at circumf'."
  },
  {
    id: "f-euc-cyclic-quad",
    title: "Opposite Angles of Cyclic Quad",
    category: "Euclidean Geometry",
    paper: "Paper 2",
    latex: "\\hat{A} + \\hat{C} = 180^\\circ \\quad \\text{and} \\quad \\text{Ext } \\angle = \\text{Opp Int } \\angle",
    description: "Opposite interior angles of a cyclic quadrilateral are supplementary ($180^\\circ$).",
    variables: [],
    examTip: "Acceptable CAPS reason: 'opp $\\angle$s of cyclic quad'."
  },
  {
    id: "f-euc-tan-chord",
    title: "Tan-Chord Theorem",
    category: "Euclidean Geometry",
    paper: "Paper 2",
    latex: "\\angle \\text{ between tangent and chord} = \\angle \\text{ in alternate segment}",
    description: "The angle between a tangent and a chord through the point of contact equals the angle in the alternate segment.",
    variables: [],
    examTip: "Acceptable CAPS reason: 'tan chord theorem'."
  },
  {
    id: "f-euc-proportionality",
    title: "Proportional Intercept Theorem",
    category: "Euclidean Geometry",
    paper: "Paper 2",
    latex: "DE \\parallel BC \\implies \\frac{AD}{DB} = \\frac{AE}{EC} \\quad \\text{and} \\quad \\frac{AD}{AB} = \\frac{AE}{AC}",
    description: "A line drawn parallel to one side of a triangle divides the other two sides proportionally.",
    variables: [
      { symbol: "DE \\parallel BC", meaning: "Parallel line condition" }
    ],
    examTip: "Acceptable CAPS reason: 'line $\\parallel$ to one side of $\\Delta$'."
  }
];

export interface FormulaSheetModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: Profile | null;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({
  isOpen = false,
  onClose,
  user
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(isOpen);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPaper, setSelectedPaper] = useState<"All" | "Paper 1" | "Paper 2">("All");
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>(null);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);
  const [isHighContrastCheatSheet, setIsHighContrastCheatSheet] = useState<boolean>(false);

  // Sync external isOpen prop
  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("amh_formula_sheet_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading formula favorites:", e);
    }
  }, []);

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((item) => item !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    try {
      localStorage.setItem("amh_formula_sheet_favorites", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving formula favorites:", e);
    }
  };

  const handleCopyLatex = (formula: FormulaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formula.latex);
    setCopiedFormulaId(formula.id);
    setTimeout(() => setCopiedFormulaId(null), 2500);
  };

  const categories = useMemo(() => {
    const list = Array.from(new Set(FORMULAS_DATA.map((f) => f.category)));
    return ["All", ...list];
  }, []);

  const filteredFormulas = useMemo(() => {
    return FORMULAS_DATA.filter((item) => {
      // Paper filter
      if (selectedPaper === "Paper 1" && item.paper === "Paper 2") return false;
      if (selectedPaper === "Paper 2" && item.paper === "Paper 1") return false;

      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(item.id)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesLatex = item.latex.toLowerCase().includes(q);
        const matchesVars = item.variables.some(
          (v) => v.symbol.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
        );
        return matchesTitle || matchesCat || matchesDesc || matchesLatex || matchesVars;
      }

      return true;
    });
  }, [selectedPaper, selectedCategory, showOnlyFavorites, favorites, searchQuery]);

  const handleClose = () => {
    setModalOpen(false);
    if (onClose) onClose();
  };

  const handlePrintFormulaSheet = () => {
    window.print();
  };

  if (!modalOpen) {
    return (
      <button
        onClick={() => setModalOpen(true)}
        className="px-3.5 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-mono font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-md border border-royal-500/30"
        title="Open Printable CAPS & IEB Mathematics Formula Booklet"
      >
        <BookOpen className="w-4 h-4 text-gold-400" />
        <span>Formula Sheet</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white flex flex-col my-auto max-h-[92vh] overflow-hidden transition-all duration-300 ${
          isFullWidth ? "w-full h-[95vh]" : "w-full max-w-5xl"
        }`}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-navy-950 via-royal-950 to-navy-900 text-white border-b border-slate-200 dark:border-navy-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-md shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold-500/20 text-gold-300 border border-gold-500/30 uppercase tracking-wider">
                  NSC CAPS & IEB VERIFIED
                </span>
                <span className="text-xs font-mono text-slate-300 hidden sm:inline">
                  • KaTeX Rendered
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-0.5">
                Mathematics Formula Sheet Booklet
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHighContrastCheatSheet(!isHighContrastCheatSheet)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                isHighContrastCheatSheet
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md"
                  : "bg-navy-850 hover:bg-navy-800 text-slate-300 border-navy-700"
              }`}
              title="Toggle High-Contrast Printable PDF Mode"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isHighContrastCheatSheet ? "High-Contrast PDF: ON" : "High-Contrast PDF Mode"}</span>
            </button>
            <button
              onClick={handlePrintFormulaSheet}
              className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              title="Print / Save Formula Sheet as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}
              className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition-colors cursor-pointer hidden sm:block"
              title={isFullWidth ? "Standard Modal Width" : "Expand Full Screen"}
            >
              {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-navy-850 hover:bg-rose-600 text-slate-300 hover:text-white border border-navy-700 transition-colors cursor-pointer"
              title="Close Formula Sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="p-4 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formula title, variable, calculus, trig, or quadratic..."
                className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-royal-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-mono"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Paper Filter Pills */}
            <div className="flex items-center gap-1 bg-white dark:bg-navy-900 p-1 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs font-mono font-bold shrink-0 w-full sm:w-auto">
              {(["All", "Paper 1", "Paper 2"] as const).map((paper) => (
                <button
                  key={paper}
                  onClick={() => setSelectedPaper(paper)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedPaper === paper
                      ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {paper}
                </button>
              ))}
            </div>

            {/* Bookmarked Filter Toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto ${
                showOnlyFavorites
                  ? "bg-amber-500 text-navy-950 border-amber-400 shadow-xs"
                  : "bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-amber-400"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-navy-950" : ""}`} />
              <span>Bookmarked ({favorites.length})</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 dark:bg-navy-800 text-white border-slate-900 dark:border-navy-700 shadow-xs"
                    : "bg-white dark:bg-navy-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-800 hover:border-slate-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FORMULAS GRID CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Showing {filteredFormulas.length} of {FORMULAS_DATA.length} verified formulas</span>
            <span className="hidden sm:inline">Click formula to expand variables & exam advice</span>
          </div>

          {filteredFormulas.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-dashed border-slate-200 dark:border-navy-800">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No formulas matched your criteria</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for broader keywords like "Trig", "Calculus", "Series", or switch paper filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedPaper("All");
                  setShowOnlyFavorites(false);
                }}
                className="px-4 py-2 bg-royal-600 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFormulas.map((formula) => {
                const isFavorite = favorites.includes(formula.id);
                const isExpanded = expandedFormulaId === formula.id;
                const isCopied = copiedFormulaId === formula.id;

                return (
                  <div
                    key={formula.id}
                    onClick={() => setExpandedFormulaId(isExpanded ? null : formula.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                      isHighContrastCheatSheet
                        ? "bg-white text-black border-2 border-black shadow-none ring-0"
                        : isExpanded
                        ? "bg-slate-50 dark:bg-navy-950 border-amber-500/50 ring-2 ring-amber-500/20 shadow-md"
                        : "bg-white dark:bg-navy-950/70 border-slate-200 dark:border-navy-800 hover:border-amber-400/60"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isHighContrastCheatSheet
                              ? "bg-black text-white border border-black"
                              : "bg-royal-500/15 text-royal-600 dark:text-royal-300 border border-royal-500/30"
                          }`}>
                            {formula.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isHighContrastCheatSheet
                              ? "bg-slate-200 text-black border border-slate-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}>
                            {formula.paper}
                          </span>
                          {formula.isIEBSpecific && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                              IEB Focus
                            </span>
                          )}
                        </div>
                        <h3 className={`text-base font-extrabold font-display mt-1 ${
                          isHighContrastCheatSheet ? "text-black font-black" : "text-slate-900 dark:text-white"
                        }`}>
                          {formula.title}
                        </h3>
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleCopyLatex(formula, e)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Copy LaTeX code to clipboard"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleToggleFavorite(formula.id, e)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-850 hover:bg-amber-500/20 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title={isFavorite ? "Remove from bookmarks" : "Add to bookmarks"}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isFavorite ? "fill-amber-500 text-amber-500" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* KaTeX Rendered Formula Box */}
                    <div className={`p-3.5 rounded-xl font-bold overflow-x-auto my-1 text-center text-sm md:text-base ${
                      isHighContrastCheatSheet
                        ? "bg-slate-100 text-black border-2 border-black"
                        : "bg-slate-900 dark:bg-navy-900 text-amber-300 border border-slate-800 dark:border-navy-800"
                    }`}>
                      <LatexRenderer text={formula.latex.includes("$") ? formula.latex : `$${formula.latex}$`} block />
                    </div>

                    {/* Description */}
                    <div className={`text-xs font-sans leading-relaxed ${
                      isHighContrastCheatSheet ? "text-black font-medium" : "text-slate-600 dark:text-slate-300"
                    }`}>
                      <LatexRenderer text={formula.description} />
                    </div>

                    {/* Expanded Content View */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-3 border-t border-slate-200 dark:border-navy-800 space-y-3 overflow-hidden text-xs"
                        >
                          {/* Variables breakdown */}
                          {formula.variables && formula.variables.length > 0 && (
                            <div className="space-y-1.5 bg-slate-100/70 dark:bg-navy-900/80 p-3 rounded-xl border border-slate-200 dark:border-navy-800">
                              <span className="text-[10px] font-mono font-bold text-royal-600 dark:text-royal-300 uppercase tracking-wider block">
                                Symbol & Variables Breakdown
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700 dark:text-slate-300">
                                {formula.variables.map((v, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5">
                                    <span className="font-mono text-amber-600 dark:text-gold-400 font-bold shrink-0">
                                      <LatexRenderer text={`$${v.symbol}$:`} />
                                    </span>
                                    <span>
                                      <LatexRenderer text={v.meaning} />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Conditions & Constraints */}
                          {formula.conditions && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-0.5">
                              <span className="text-[10px] font-mono font-bold uppercase block">
                                Domain & Conditions:
                              </span>
                              <LatexRenderer text={formula.conditions} />
                            </div>
                          )}

                          {/* Worked Example */}
                          {formula.exampleLatex && (
                            <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono space-y-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                                Quick Worked Example:
                              </span>
                              <LatexRenderer text={`$${formula.exampleLatex}$`} block />
                            </div>
                          )}

                          {/* Exam Tip */}
                          {formula.examTip && (
                            <div className="p-2.5 rounded-xl bg-royal-500/10 border border-royal-500/20 text-royal-800 dark:text-royal-300 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[10px] font-mono uppercase block text-gold-500">
                                  CAPS & IEB Marker Advice:
                                </span>
                                <span>{formula.examTip}</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand Footer Indicator */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>{isExpanded ? "Click to collapse" : "Click for variable details"}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 shrink-0 flex items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Amaris Mathematics Hub — Official CAPS & IEB Examination Booklet</span>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Sheet
          </button>
        </div>
      </motion.div>
    </div>
  );
};
