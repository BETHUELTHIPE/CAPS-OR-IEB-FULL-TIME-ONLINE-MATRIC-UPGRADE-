import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, CheckCircle, AlertCircle, Search, Filter, RefreshCw, 
  ChevronLeft, ChevronRight, Sparkles, BookMarked, HelpCircle, 
  Award, Layers, Check, Info, Flame, Lightbulb, Play,
  Clock, Calendar, Zap, Activity, Target, Trophy, Volume2, X
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend 
} from "recharts";
import { Profile } from "../types";
import { LatexRenderer } from "./LatexRenderer";

interface FormulaFlashcardsProps {
  user: Profile | null;
}

export interface Flashcard {
  id: string;
  type: "formula" | "terminology";
  title: string;
  topic: "Algebra & Sequences" | "Functions & Graphs" | "Financial Mathematics" | "Trigonometry" | "Analytical Geometry" | "Euclidean Geometry" | "Differential Calculus" | "Probability";
  grade: "Grade 10" | "Grade 11" | "Grade 12" | "All";
  syllabus: "CAPS" | "IEB" | "Both";
  front: string; // The query or concept name
  back: string;  // The actual formula expression or official definition
  examTip: string; // Bethuel's practical exam tip
  example?: string; // Example question/use-case
  tags: string[]; // Mathematical tags for quick filtering
}

export interface CardSchedule {
  cardId: string;
  interval: number; // in days before next review
  repetition: number; // number of consecutive successful repetitions
  easeFactor: number; // easiness factor (defaults to 2.5)
  nextReviewDate: string; // ISO date-time string
  lastReviewDate?: string;
  lastRating?: number;
}

const FLASHCARDS_DATABASE: Flashcard[] = [
  // ALGEBRA & SEQUENCES
  {
    id: "fc-quad",
    type: "formula",
    title: "The Quadratic Formula",
    topic: "Algebra & Sequences",
    grade: "Grade 11",
    syllabus: "Both",
    front: "Solve for x in standard form quadratic equations ax² + bx + c = 0",
    back: "x = [-b ± √(b² - 4ac)] / 2a",
    examTip: "Ensure your equation is in standard form first! Real roots exist only if the discriminant (b² - 4ac) is greater than or equal to zero.",
    example: "Solve x² - 5x + 6 = 0: x = [-(-5) ± √((-5)² - 4(1)(6))] / 2(1) ⇒ x = 3 or x = 2.",
    tags: ["Algebra", "Equations", "Quadratic"]
  },
  {
    id: "fc-disc",
    type: "terminology",
    title: "The Discriminant (Δ)",
    topic: "Algebra & Sequences",
    grade: "Grade 11",
    syllabus: "Both",
    front: "What is the discriminant, and what does its value tell us about the nature of roots?",
    back: "Δ = b² - 4ac\n• Δ < 0: Non-real (complex) roots\n• Δ = 0: Real, rational, and equal roots\n• Δ > 0: Real, unequal roots (rational if Δ is a perfect square, irrational if not)",
    examTip: "Often asked in Paper 1 Question 1 or 2. Proofs involving 'show that roots are real' require proving Δ ≥ 0.",
    example: "Determine nature of roots of 2x² - 4x + 5 = 0: Δ = (-4)² - 4(2)(5) = 16 - 40 = -24. Roots are non-real.",
    tags: ["Algebra", "Discriminant", "Nature of Roots"]
  },
  {
    id: "fc-arith-tn",
    type: "formula",
    title: "Arithmetic General Term",
    topic: "Algebra & Sequences",
    grade: "Grade 12",
    syllabus: "Both",
    front: "Find the general term (T_n) of an Arithmetic sequence with constant difference",
    back: "T_n = a + (n - 1)d",
    examTip: "where 'a' is the first term (T_1) and 'd' is the common difference (d = T_2 - T_1 = T_3 - T_2). Use this to find the term number 'n' when given a specific value.",
    example: "For sequence 3, 8, 13... a=3, d=5. General term: T_n = 3 + (n-1)5 = 5n - 2.",
    tags: ["Algebra", "Sequences", "Arithmetic"]
  },
  {
    id: "fc-arith-sn",
    type: "formula",
    title: "Arithmetic Series Sum",
    topic: "Algebra & Sequences",
    grade: "Grade 12",
    syllabus: "Both",
    front: "Find the sum of the first 'n' terms (S_n) of an Arithmetic series",
    back: "S_n = n/2 [2a + (n - 1)d]    or    S_n = n/2 [a + L]",
    examTip: "Use the 'a + L' shortcut if you know the last term 'L'. S_n represents the cumulative sum, not a single term's value.",
    example: "Sum of first 10 terms of 3, 8, 13... S_10 = 10/2 [2(3) + (10-1)5] = 5 * [6 + 45] = 255.",
    tags: ["Algebra", "Series", "Arithmetic"]
  },
  {
    id: "fc-geom-tn",
    type: "formula",
    title: "Geometric General Term",
    topic: "Algebra & Sequences",
    grade: "Grade 12",
    syllabus: "Both",
    front: "Find the general term (T_n) of a Geometric sequence with constant ratio",
    back: "T_n = a * r^(n-1)",
    examTip: "where 'a' is the first term and 'r' is the common ratio (r = T_2/T_1 = T_3/T_2). Solve for 'n' using logarithms if T_n is given.",
    example: "For sequence 2, 6, 18... a=2, r=3. Find T_5: T_5 = 2 * (3)⁴ = 2 * 81 = 162.",
    tags: ["Algebra", "Sequences", "Geometric"]
  },
  {
    id: "fc-geom-sn",
    type: "formula",
    title: "Geometric Series Sum",
    topic: "Algebra & Sequences",
    grade: "Grade 12",
    syllabus: "Both",
    front: "Find the sum of the first 'n' terms (S_n) of a Geometric series",
    back: "S_n = a(rⁿ - 1) / (r - 1)    (r ≠ 1)",
    examTip: "Be careful with brackets and order of operations in your calculator. If r < 1, you can also write it as a(1 - rⁿ) / (1 - r) to avoid negative numbers.",
    example: "Sum of first 5 terms of 2, 6, 18... S_5 = 2(3⁵ - 1)/(3 - 1) = 2(243 - 1)/2 = 242.",
    tags: ["Algebra", "Series", "Geometric"]
  },
  {
    id: "fc-geom-inf",
    type: "formula",
    title: "Sum to Infinity (Convergent Series)",
    topic: "Algebra & Sequences",
    grade: "Grade 12",
    syllabus: "Both",
    front: "When does an infinite geometric series converge, and what is its sum?",
    back: "S_∞ = a / (1 - r)    only if -1 < r < 1 (or |r| < 1)",
    examTip: "Examiners love asking: 'For which values of x will the series converge?' Set -1 < r < 1 and solve for the unknown variable.",
    example: "Series: 8 + 4 + 2 + 1... a=8, r=0.5. Converges because |0.5| < 1. S_∞ = 8 / (1 - 0.5) = 16.",
    tags: ["Algebra", "Series", "Infinity"]
  },

  // FUNCTIONS & GRAPHS
  {
    id: "fc-func-hyperbola",
    type: "terminology",
    title: "Hyperbola Standard Form",
    topic: "Functions & Graphs",
    grade: "Grade 11",
    syllabus: "Both",
    front: "What is the standard form of a hyperbola and its equations of asymptotes?",
    back: "y = a / (x - p) + q\n• Vertical asymptote: x = p\n• Horizontal asymptote: y = q",
    examTip: "Asymptotes are lines the curve approaches but never touches. Always draw them as dashed lines on your graph and write their equations clearly.",
    example: "For y = 3 / (x - 2) + 1, asymptotes are x = 2 and y = 1. Center of hyperbola is (2; 1).",
    tags: ["Functions", "Hyperbola", "Asymptotes"]
  },
  {
    id: "fc-func-axis-sym",
    type: "formula",
    title: "Parabola Axis of Symmetry",
    topic: "Functions & Graphs",
    grade: "Grade 10",
    syllabus: "Both",
    front: "What is the equation for the axis of symmetry / turning point x-value of a parabola?",
    back: "x = -b / 2a",
    examTip: "Use this x-value and substitute it back into the original quadratic equation f(x) to find the y-value of the turning point. This turning point is either a local maximum or minimum.",
    example: "For f(x) = x² - 4x + 3, axis of symmetry is x = -(-4) / 2(1) = 2. Turning point is (2; f(2)) = (2; -1).",
    tags: ["Functions", "Parabola", "Symmetry"]
  },

  // FINANCIAL MATHEMATICS
  {
    id: "fc-fin-comp",
    type: "formula",
    title: "Compound Interest (Growth)",
    topic: "Financial Mathematics",
    grade: "Grade 11",
    syllabus: "Both",
    front: "Formula for compound growth (accumulated investment / inflation)",
    back: "A = P(1 + i)ⁿ",
    examTip: "If interest is compounded quarterly, divide interest rate 'i' by 4 and multiply years 'n' by 4. For monthly, divide by 12 and multiply by 12.",
    example: "R10,000 invested at 8% p.a. compounded monthly for 3 years: A = 10000 * (1 + 0.08/12)³⁶ = R12,702.37.",
    tags: ["Finance", "Compound Growth", "Investment"]
  },
  {
    id: "fc-fin-depr",
    type: "formula",
    title: "Reducing-Balance Depreciation",
    topic: "Financial Mathematics",
    grade: "Grade 11",
    syllabus: "Both",
    front: "Formula for reducing-balance depreciation (compound decay of book value)",
    back: "A = P(1 - i)ⁿ",
    examTip: "Also known as Reducing Balance depreciation. If they ask for Straight-Line depreciation, use the simple decay formula: A = P(1 - i*n).",
    example: "Car bought for R200,000 depreciates at 15% p.a. on reducing balance. Value in 5 years: A = 200000*(1 - 0.15)⁵ = R88,741.07.",
    tags: ["Finance", "Depreciation", "Decay"]
  },
  {
    id: "fc-fin-fv",
    type: "formula",
    title: "Future Value Annuity",
    topic: "Financial Mathematics",
    grade: "Grade 12",
    syllabus: "Both",
    front: "What is the Future Value annuity formula, and when is it used?",
    back: "F = x * [ ((1 + i)ⁿ - 1) / i ]",
    examTip: "Used for systematic savings, sinking funds, or retirement accumulation where regular payments 'x' are made. Beware of payments made at the end of each period versus start of period.",
    example: "Save R1000 monthly at 10% p.a. compounded monthly for 5 years: F = 1000 * [((1 + 0.10/12)⁶⁰ - 1) / (0.10/12)] = R77,437.07.",
    tags: ["Finance", "Annuities", "Savings"]
  },
  {
    id: "fc-fin-pv",
    type: "formula",
    title: "Present Value Annuity",
    topic: "Financial Mathematics",
    grade: "Grade 12",
    syllabus: "Both",
    front: "What is the Present Value annuity formula, and when is it used?",
    back: "P = x * [ (1 - (1 + i)⁻ⁿ) / i ]",
    examTip: "Used for loans, bond payments, home mortgages, or payouts where a lump sum 'P' is received upfront and repaid via regular payments 'x'. The exponent is NEGATIVE (-n).",
    example: "Repay a R150,000 car loan at 12% p.a. monthly over 5 years. Monthly payment 'x': 150000 = x * [(1 - (1 + 0.01)⁻⁶⁰) / 0.01] ⇒ x = R3,336.67.",
    tags: ["Finance", "Annuities", "Loans"]
  },

  // TRIGONOMETRY
  {
    id: "fc-trig-pythag",
    type: "terminology",
    title: "Pythagorean Identity",
    topic: "Trigonometry",
    grade: "Grade 11",
    syllabus: "Both",
    front: "What is the fundamental square / Pythagorean identity in trigonometry?",
    back: "sin²(θ) + cos²(θ) = 1\n• sin²(θ) = 1 - cos²(θ)\n• cos²(θ) = 1 - sin²(θ)",
    examTip: "Extremely useful in proving complex identities and simplifying expressions. Look for '1 - sin²θ' to convert to 'cos²θ' instantly.",
    example: "Simplify (1 - sin²θ) / cos(θ) ⇒ cos²θ / cosθ = cosθ.",
    tags: ["Trigonometry", "Pythagorean Identity", "Identities"]
  },
  {
    id: "fc-trig-sin2a",
    type: "formula",
    title: "Sine Double Angle Identity",
    topic: "Trigonometry",
    grade: "Grade 12",
    syllabus: "Both",
    front: "What is the expansion of sin(2θ)?",
    back: "sin(2θ) = 2 * sin(θ) * cos(θ)",
    examTip: "Very common in trigonometric equations and proofs. If you see a term like '2sin(15°)cos(15°)', recognize it as sin(30°) and solve without a calculator.",
    example: "Simplify: 2 sin(x) cos(x) = sin(2x).",
    tags: ["Trigonometry", "Double Angle", "Identities"]
  },
  {
    id: "fc-trig-cos2a",
    type: "formula",
    title: "Cosine Double Angle Identities",
    topic: "Trigonometry",
    grade: "Grade 12",
    syllabus: "Both",
    front: "What are the three expansions of cos(2θ)?",
    back: "cos(2θ) = cos²(θ) - sin²(θ)\n= 2cos²(θ) - 1\n= 1 - 2sin²(θ)",
    examTip: "In identity proofs or solving equations, choose the form that helps you cancel out other terms (especially eliminating +1 or -1 in denominators).",
    example: "Solve cos(2x) + cos(x) = 0. Use 2cos²(x) - 1 + cos(x) = 0, which is a quadratic in cos(x).",
    tags: ["Trigonometry", "Double Angle", "Identities"]
  },
  {
    id: "fc-trig-cosine-rule",
    type: "formula",
    title: "The Cosine Rule",
    topic: "Trigonometry",
    grade: "Grade 11",
    syllabus: "Both",
    front: "What is the Cosine Rule for any triangle ABC, and when do we use it?",
    back: "a² = b² + c² - 2bc * cos(A)\n(or cos(A) = (b² + c² - a²) / 2bc)",
    examTip: "Used in 2D and 3D trigonometry for non-right triangles when given:\n1. Two sides and the included angle (SAS)\n2. All three sides (SSS)",
    example: "Triangle ABC has b=5, c=8, angle A=60°. Find a: a² = 5² + 8² - 2(5)(8)*cos(60°) = 25 + 64 - 80(0.5) = 49 ⇒ a = 7.",
    tags: ["Trigonometry", "Cosine Rule", "Triangles"]
  },

  // ANALYTICAL GEOMETRY
  {
    id: "fc-an-dist",
    type: "formula",
    title: "Distance Formula",
    topic: "Analytical Geometry",
    grade: "Grade 10",
    syllabus: "Both",
    front: "Calculate the distance 'd' between coordinates (x₁, y₁) and (x₂, y₂)",
    back: "d = √((x₂ - x₁)² + (y₂ - y₁)²)",
    examTip: "Derived from Pythagoras' Theorem. Leave your answer in surd form if exact coordinates are required, rather than rounding to decimals.",
    example: "Distance between A(1; 2) and B(4; 6): d = √((4-1)² + (6-2)²) = √(3² + 4²) = √25 = 5 units.",
    tags: ["Analytical Geometry", "Distance", "Coordinates"]
  },
  {
    id: "fc-an-grad",
    type: "formula",
    title: "Gradient (Slope) of a Line",
    topic: "Analytical Geometry",
    grade: "Grade 10",
    syllabus: "Both",
    front: "Formula for gradient (m) connecting two points",
    back: "m = (y₂ - y₁) / (x₂ - x₁)",
    examTip: "• Parallel lines have equal gradients (m₁ = m₂).\n• Perpendicular lines have gradients that multiply to -1 (m₁ * m₂ = -1).",
    example: "Gradient of line through A(2; 3) and B(5; 9): m = (9 - 3) / (5 - 2) = 6/3 = 2.",
    tags: ["Analytical Geometry", "Gradient", "Lines"]
  },
  {
    id: "fc-an-incl",
    type: "formula",
    title: "Angle of Inclination",
    topic: "Analytical Geometry",
    grade: "Grade 11",
    syllabus: "Both",
    front: "How do you calculate the angle of inclination (θ) of a line with gradient 'm'?",
    back: "tan(θ) = m\n• If m > 0: θ = shift-tan(m) (acute angle)\n• If m < 0: θ = shift-tan(m) + 180° (obtuse angle)",
    examTip: "The angle of inclination is always measured counterclockwise from the positive x-axis. Never forget to add 180° if the gradient is negative!",
    example: "Find inclination of line with m = -1: tan(θ) = -1 ⇒ θ = -45° + 180° = 135°.",
    tags: ["Analytical Geometry", "Inclination", "Gradient"]
  },
  {
    id: "fc-an-circle",
    type: "formula",
    title: "Equation of a Circle",
    topic: "Analytical Geometry",
    grade: "Grade 12",
    syllabus: "Both",
    front: "What is the standard equation of a circle centered at (a; b) with radius 'r'?",
    back: "(x - a)² + (y - b)² = r²",
    examTip: "If the center is at the origin (0; 0), the equation simplifies to x² + y² = r². You may need to complete the square to get general forms into standard form.",
    example: "Circle center (3; -2) and radius 5: (x - 3)² + (y + 2)² = 25.",
    tags: ["Analytical Geometry", "Circle", "Equations"]
  },

  // EUCLIDEAN GEOMETRY
  {
    id: "fc-eu-center",
    type: "terminology",
    title: "Angle at Center Theorem",
    topic: "Euclidean Geometry",
    grade: "Grade 11",
    syllabus: "Both",
    front: "State the theorem relating the angle at the center of a circle to the angle at the circumference",
    back: "The angle subtended by an arc at the center of a circle is double the angle subtended by the same arc at the circumference.",
    examTip: "NCS Reason Code: (angle at centre = 2 * angle at circum). Watch out for the 'arrowhead' or 'boomerang' shape where the central angle is reflex.",
    example: "If central angle AOB = 110°, the inscribed angle ACB on the circle boundary is 110° / 2 = 55°.",
    tags: ["Euclidean Geometry", "Circle Theorems", "Angles"]
  },
  {
    id: "fc-eu-cyclic",
    type: "terminology",
    title: "Cyclic Quad Opp Angles",
    topic: "Euclidean Geometry",
    grade: "Grade 11",
    syllabus: "Both",
    front: "What is the theorem concerning opposite angles of a cyclic quadrilateral?",
    back: "The opposite angles of a cyclic quadrilateral are supplementary (add up to 180°).",
    examTip: "NCS Reason Code: (opp angles of cyclic quad). Extremely common in multi-step geometry proofs. If you find one angle, you immediately know the opposite.",
    example: "ABCD is a cyclic quad. If angle A = 75°, then opposite angle C = 180° - 75° = 105°.",
    tags: ["Euclidean Geometry", "Circle Theorems", "Quadrilaterals"]
  },
  {
    id: "fc-eu-tan-chord",
    type: "terminology",
    title: "The Tan-Chord Theorem",
    topic: "Euclidean Geometry",
    grade: "Grade 11",
    syllabus: "Both",
    front: "State the Tan-Chord Theorem",
    back: "The angle between a tangent to a circle and a chord drawn through the point of contact is equal to the angle in the alternate segment.",
    examTip: "NCS Reason Code: (tan chord theorem). Look for a triangle 'resting' on a tangent line at one of its vertices. The angle on the outside equals the opposite inside angle.",
    example: "Tangent line meets circle at vertex A of triangle ABC. Angle between tangent and chord AB is 65°. Therefore, angle C = 65°.",
    tags: ["Euclidean Geometry", "Circle Theorems", "Tangents"]
  },

  // DIFFERENTIAL CALCULUS
  {
    id: "fc-calc-first",
    type: "formula",
    title: "Derivative from First Principles",
    topic: "Differential Calculus",
    grade: "Grade 12",
    syllabus: "Both",
    front: "What is the formal definition of a derivative (first principles)?",
    back: "f'(x) = lim[h→0] [ (f(x + h) - f(x)) / h ]",
    examTip: "Guaranteed 5 marks in Paper 1! Never drop the 'lim[h→0]' notation on intermediate steps until you evaluate the limit by substituting h = 0.",
    example: "Differentiate f(x) = x²: f'(x) = lim[h→0] [(x+h)² - x²]/h = lim[h→0] [2xh + h²]/h = lim[h→0] [2x + h] = 2x.",
    tags: ["Calculus", "First Principles", "Derivatives"]
  },

  // PROBABILITY
  {
    id: "fc-prob-add",
    type: "formula",
    title: "Probability Addition Rule",
    topic: "Probability",
    grade: "Grade 10",
    syllabus: "Both",
    front: "What is the probability addition rule for any two events A and B?",
    back: "P(A or B) = P(A) + P(B) - P(A and B)",
    examTip: "• If events are mutually exclusive, P(A and B) = 0.\n• If events are independent, P(A and B) = P(A) * P(B).",
    example: "If P(A) = 0.6, P(B) = 0.5, and P(A and B) = 0.3, then P(A or B) = 0.6 + 0.5 - 0.3 = 0.8.",
    tags: ["Probability", "Addition Rule", "Events"]
  }
];

export const FormulaFlashcards: React.FC<FormulaFlashcardsProps> = ({ user }) => {
  // Load custom user-created flashcards (e.g. from PDF annotations / notes)
  const [customCards, setCustomCards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem("amaris_custom_flashcards");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Re-sync custom flashcards if localStorage updates
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem("amaris_custom_flashcards");
        setCustomCards(saved ? JSON.parse(saved) : []);
      } catch (e) {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const allFlashcards = [...FLASHCARDS_DATABASE, ...customCards];

  // Mastery tracking states
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("amaris_mastered_flashcards");
    return saved ? JSON.parse(saved) : [];
  });
  const [needPracticeIds, setNeedPracticeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("amaris_practice_flashcards");
    return saved ? JSON.parse(saved) : [];
  });

  // Detailed Spaced Repetition schedules
  const [schedules, setSchedules] = useState<Record<string, CardSchedule>>(() => {
    const saved = localStorage.getItem("amaris_flashcard_schedules");
    return saved ? JSON.parse(saved) : {};
  });

  // Simulated Days Offset for active memory decay simulations
  const [simulatedDaysOffset, setSimulatedDaysOffset] = useState<number>(() => {
    const saved = localStorage.getItem("amaris_flashcard_time_offset");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Daily Goal setting
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem("amaris_flashcard_daily_goal");
    return saved ? parseInt(saved, 10) : 5;
  });

  // Unique reviewed cards by date tracking (date string -> card ID list)
  const [reviewsByDate, setReviewsByDate] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("amaris_flashcard_reviews_by_date");
    return saved ? JSON.parse(saved) : {};
  });

  interface HistoryRecord {
    date: string;
    fullDate: string;
    mastered: number;
    practice: number;
    unreviewed: number;
  }

  // Flashcard progress history state over time
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem("amaris_flashcard_progress_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fall back to seed
      }
    }
    
    // Generate beautiful initial history if none exists (simulated 10 days leading to today)
    const list: HistoryRecord[] = [];
    const total = allFlashcards.length;
    // Get initial lengths (fallback since they might not be initialized yet but we can read from localStorage directly or default to realistic South African CAPS math starter levels)
    const savedM = localStorage.getItem("amaris_mastered_flashcards");
    const savedP = localStorage.getItem("amaris_practice_flashcards");
    const initMCount = savedM ? JSON.parse(savedM).length : 0;
    const initPCount = savedP ? JSON.parse(savedP).length : 0;

    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + simulatedDaysOffset - (9 - i));
      const dateStr = d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
      const fullDateStr = d.toISOString().split("T")[0];
      
      const factor = i / 9;
      // Beautiful study curve
      const masteredVal = Math.round(initMCount * (0.15 + 0.85 * factor * factor));
      const practiceVal = Math.round(initPCount * (0.5 + 0.5 * factor) + (9 - i) * 0.4);
      
      list.push({
        date: dateStr,
        fullDate: fullDateStr,
        mastered: Math.min(total, masteredVal),
        practice: Math.min(total, Math.round(practiceVal)),
        unreviewed: Math.max(0, total - masteredVal - Math.round(practiceVal))
      });
    }
    return list;
  });

  // Sync history with localStorage
  useEffect(() => {
    localStorage.setItem("amaris_flashcard_progress_history", JSON.stringify(history));
  }, [history]);

  // Record stats inside the history logs when metrics change
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + simulatedDaysOffset);
    const todayStr = d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
    const todayFullStr = d.toISOString().split("T")[0];

    const currentMastered = masteredIds.length;
    const currentPractice = needPracticeIds.length;
    const total = allFlashcards.length;
    const currentUnreviewed = Math.max(0, total - currentMastered - currentPractice);

    setHistory(prev => {
      const existsIndex = prev.findIndex(item => item.fullDate === todayFullStr);
      if (existsIndex >= 0) {
        const existing = prev[existsIndex];
        if (
          existing.mastered === currentMastered &&
          existing.practice === currentPractice &&
          existing.unreviewed === currentUnreviewed
        ) {
          return prev;
        }
        const updated = [...prev];
        updated[existsIndex] = {
          ...updated[existsIndex],
          mastered: currentMastered,
          practice: currentPractice,
          unreviewed: currentUnreviewed
        };
        return updated;
      } else {
        const newEntry = {
          date: todayStr,
          fullDate: todayFullStr,
          mastered: currentMastered,
          practice: currentPractice,
          unreviewed: currentUnreviewed
        };
        const nextHistory = [...prev, newEntry];
        if (nextHistory.length > 20) {
          return nextHistory.slice(nextHistory.length - 20);
        }
        return nextHistory;
      }
    });
  }, [masteredIds.length, needPracticeIds.length, simulatedDaysOffset]);

  // Filters & layout states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [selectedSyllabus, setSelectedSyllabus] = useState<string>("All");
  const [masteryFilter, setMasteryFilter] = useState<"all" | "mastered" | "practice" | "unreviewed" | "due">("all");
  const [viewMode, setViewMode] = useState<"slideshow" | "grid">("slideshow");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isFocusMode, setIsFocusMode] = useState(false);

  // AI Quiz states
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [activeQuizIndex, setActiveQuizIndex] = useState<number>(-1); // -1 means inactive
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizShowExplanation, setQuizShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Slideshow active card index
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("amaris_mastered_flashcards", JSON.stringify(masteredIds));
  }, [masteredIds]);

  useEffect(() => {
    localStorage.setItem("amaris_practice_flashcards", JSON.stringify(needPracticeIds));
  }, [needPracticeIds]);

  useEffect(() => {
    localStorage.setItem("amaris_flashcard_schedules", JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem("amaris_flashcard_time_offset", simulatedDaysOffset.toString());
  }, [simulatedDaysOffset]);

  useEffect(() => {
    localStorage.setItem("amaris_flashcard_daily_goal", dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("amaris_flashcard_reviews_by_date", JSON.stringify(reviewsByDate));
  }, [reviewsByDate]);

  // Topic categorizations
  const topics = [
    "All",
    "Algebra & Sequences",
    "Functions & Graphs",
    "Financial Mathematics",
    "Trigonometry",
    "Analytical Geometry",
    "Euclidean Geometry",
    "Differential Calculus",
    "Probability"
  ];

  // Helper to resolve current active date with fast-forward time offset
  const getCurrentDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + simulatedDaysOffset);
    return d;
  };

  // Generate dynamic unique list of mathematical tags sorted alphabetically
  const allAvailableTags = ["All", ...Array.from(new Set(allFlashcards.flatMap(c => c.tags)))].sort();

  // Calculate study streak of consecutive days meeting the dailyGoal
  const getStudyStreak = (): number => {
    let streak = 0;
    const checkDate = getCurrentDate();
    const todayStr = checkDate.toISOString().split("T")[0];
    const todayReviewed = reviewsByDate[todayStr] || [];
    const todayReached = todayReviewed.length >= dailyGoal;

    if (!todayReached) {
      // If today is not reached, check yesterday to keep the streak alive
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split("T")[0];
      const yesterdayReviewed = reviewsByDate[yesterdayStr] || [];
      const yesterdayReached = yesterdayReviewed.length >= dailyGoal;
      if (!yesterdayReached) {
        return 0; // Streak is broken
      }
      streak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevStr = checkDate.toISOString().split("T")[0];
        const prevReviewed = reviewsByDate[prevStr] || [];
        if (prevReviewed.length >= dailyGoal) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      // Today is reached
      streak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevStr = checkDate.toISOString().split("T")[0];
        const prevReviewed = reviewsByDate[prevStr] || [];
        if (prevReviewed.length >= dailyGoal) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  // Text-To-Speech Pronunciation Reader using Web Speech API
  const handleSpeakText = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // prevent card flip inside slideshow view
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // cancel any active speech utterance

    // Replace mathematical notation/symbols for natural reading flow
    const readable = text
      .replace(/\\Delta/g, "Delta")
      .replace(/x\^2|x²/g, "x squared")
      .replace(/ax\^2|ax²/g, "a x squared")
      .replace(/bx/g, "b x")
      .replace(/±/g, "plus or minus")
      .replace(/\\sqrt/g, "square root of")
      .replace(/≠/g, "not equal to")
      .replace(/T_n/g, "T n general term")
      .replace(/S_n/g, "S n sum of terms")
      .replace(/a\^n/g, "a to the power of n")
      .replace(/\n/g, " ... ");

    const utterance = new SpeechSynthesisUtterance(readable);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize English voices
    const targetVoice = voices.find(v => v.lang.includes("en-ZA")) || 
                        voices.find(v => v.lang.includes("en-GB")) || 
                        voices.find(v => v.lang.includes("en-US")) || 
                        voices.find(v => v.lang.includes("en"));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    utterance.rate = 0.95; // slightly slower for educational comprehensibility
    window.speechSynthesis.speak(utterance);
  };

  // Compile active quiz based on tags from user's "Need Practice" flashcards using Gemini API
  const handleGenerateQuiz = async () => {
    const practiceCards = allFlashcards.filter(c => needPracticeIds.includes(c.id));
    const practiceTags = Array.from(new Set(practiceCards.flatMap(c => c.tags)));

    setIsGeneratingQuiz(true);
    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tags: practiceTags })
      });

      const data = await response.json();
      if (data.quiz && Array.isArray(data.quiz)) {
        setQuizQuestions(data.quiz);
        setActiveQuizIndex(0);
        setQuizScore(0);
        setQuizSelectedOption(null);
        setQuizShowExplanation(false);
        setQuizCompleted(false);
      } else {
        alert("Failed to compile quiz questions. Please try again.");
      }
    } catch (error) {
      console.error("AI Quiz compiler failure:", error);
      alert("Error contacting the AI Quiz compiler server. Please try again.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Helper to determine accurate due statuses based on spaced repetition timelines
  const getCardStatusInfo = (cardId: string) => {
    const isMastered = masteredIds.includes(cardId);
    const isPractice = needPracticeIds.includes(cardId);
    const schedule = schedules[cardId];

    if (!schedule) {
      if (isPractice) {
        return { label: "Needs Practice", color: "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/10", isDue: true, daysLeft: 0, schedule: null };
      }
      if (isMastered) {
        return { label: "Mastered", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10", isDue: false, daysLeft: 14, schedule: null };
      }
      return { label: "New / Unreviewed", color: "bg-navy-50 text-navy-500 dark:bg-navy-900 dark:text-navy-400 border border-navy-150 dark:border-navy-800", isDue: true, daysLeft: 0, schedule: null };
    }

    const now = getCurrentDate();
    const nextDue = new Date(schedule.nextReviewDate);
    
    // Day calculation
    const diffTime = nextDue.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isDue = diffDays <= 0;

    let label = "";
    let color = "";

    if (isDue) {
      label = `Due Now (${Math.abs(diffDays)}d overdue)`;
      if (diffDays === 0) label = "Due Today";
      color = "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20";
    } else {
      label = `Review in ${diffDays}d`;
      color = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";
    }

    return { label, color, isDue, daysLeft: diffDays, schedule };
  };

  // SM-2 Spaced Repetition Engine
  const applyRating = (cardId: string, rating: number) => {
    const currentSchedule = schedules[cardId] || {
      cardId,
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      nextReviewDate: getCurrentDate().toISOString()
    };

    let { interval, repetition, easeFactor } = currentSchedule;

    // 1: Forgot/Needs Practice, 2: Hard, 3: Good, 4: Easy/Perfected
    if (rating === 1) {
      repetition = 0;
      interval = 1; // Repeat tomorrow
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 2) {
      repetition += 1;
      if (repetition === 1) interval = 1;
      else if (repetition === 2) interval = 2;
      else interval = Math.round(interval * easeFactor * 0.85);
      easeFactor = Math.max(1.3, easeFactor - 0.1);
    } else if (rating === 3) {
      repetition += 1;
      if (repetition === 1) interval = 1;
      else if (repetition === 2) interval = 3;
      else interval = Math.round(interval * easeFactor);
    } else if (rating === 4) {
      repetition += 1;
      if (repetition === 1) interval = 2;
      else if (repetition === 2) interval = 5;
      else interval = Math.round(interval * easeFactor * 1.35);
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    }

    interval = Math.max(1, interval);

    const nextDue = getCurrentDate();
    nextDue.setDate(nextDue.getDate() + interval);

    const newSchedule: CardSchedule = {
      cardId,
      interval,
      repetition,
      easeFactor: parseFloat(easeFactor.toFixed(2)),
      nextReviewDate: nextDue.toISOString(),
      lastReviewDate: getCurrentDate().toISOString(),
      lastRating: rating
    };

    setSchedules(prev => ({
      ...prev,
      [cardId]: newSchedule
    }));

    // Align indices in tag lists for backwards compatibility and easy visual markers
    if (rating === 1) {
      setNeedPracticeIds(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
      setMasteredIds(prev => prev.filter(id => id !== cardId));
    } else if (rating === 4) {
      setMasteredIds(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
      setNeedPracticeIds(prev => prev.filter(id => id !== cardId));
    } else {
      setMasteredIds(prev => prev.filter(id => id !== cardId));
      setNeedPracticeIds(prev => prev.filter(id => id !== cardId));
    }

    // Track daily goal progress
    const reviewDate = getCurrentDate();
    const todayFullStr = reviewDate.toISOString().split("T")[0];
    setReviewsByDate(prev => {
      const todayReviews = prev[todayFullStr] || [];
      if (!todayReviews.includes(cardId)) {
        return {
          ...prev,
          [todayFullStr]: [...todayReviews, cardId]
        };
      }
      return prev;
    });

    // Auto flip and advance after a brief rating preview
    if (viewMode === "slideshow") {
      setTimeout(() => {
        setIsFlipped(false);
        setTimeout(() => {
          setCurrentCardIndex(prev => {
            if (prev < filteredCards.length - 1) return prev + 1;
            return prev;
          });
        }, 200);
      }, 550);
    }
  };

  // Filtering cards using search query, syllabus, tags, and new due intervals
  const filteredCards = allFlashcards.filter(card => {
    const matchesSearch = 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTopic = selectedTopic === "All" || card.topic === selectedTopic;
    const matchesGrade = selectedGrade === "All" || card.grade === selectedGrade || card.grade === "All";
    const matchesSyllabus = selectedSyllabus === "All" || card.syllabus === selectedSyllabus || card.syllabus === "Both";
    const matchesTag = selectedTag === "All" || card.tags.includes(selectedTag);

    const isMastered = masteredIds.includes(card.id);
    const isPractice = needPracticeIds.includes(card.id);
    const statusInfo = getCardStatusInfo(card.id);

    const matchesMastery = 
      masteryFilter === "all" ||
      (masteryFilter === "mastered" && isMastered) ||
      (masteryFilter === "practice" && isPractice) ||
      (masteryFilter === "unreviewed" && !isMastered && !isPractice) ||
      (masteryFilter === "due" && statusInfo.isDue);

    return matchesSearch && matchesTopic && matchesGrade && matchesSyllabus && matchesMastery && matchesTag;
  });

  // Ensure current slideshow index is valid if filtered list changes
  useEffect(() => {
    if (currentCardIndex >= filteredCards.length) {
      setCurrentCardIndex(Math.max(0, filteredCards.length - 1));
    }
    setIsFlipped(false);
  }, [filteredCards.length]);

  const toggleMastery = (cardId: string) => {
    if (masteredIds.includes(cardId)) {
      setMasteredIds(prev => prev.filter(id => id !== cardId));
      setSchedules(prev => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
    } else {
      applyRating(cardId, 4); // Standard Mastered = rating 4
    }
  };

  const toggleNeedPractice = (cardId: string) => {
    if (needPracticeIds.includes(cardId)) {
      setNeedPracticeIds(prev => prev.filter(id => id !== cardId));
      setSchedules(prev => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
    } else {
      applyRating(cardId, 1); // Needs Practice = rating 1
    }
  };

  const resetAllProgress = () => {
    if (window.confirm("Are you sure you want to reset your flashcard mastery progress? This will revert all cards back to 'New' and clear simulated dates.")) {
      setMasteredIds([]);
      setNeedPracticeIds([]);
      setSchedules({});
      setSimulatedDaysOffset(0);
      setReviewsByDate({});

      // Reseed history curves with zeros (rebuilding baseline starting from 10 days ago)
      const emptyHistory: HistoryRecord[] = [];
      const total = FLASHCARDS_DATABASE.length;
      for (let i = 0; i < 10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (9 - i));
        const dateStr = d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
        const fullDateStr = d.toISOString().split("T")[0];
        emptyHistory.push({
          date: dateStr,
          fullDate: fullDateStr,
          mastered: 0,
          practice: 0,
          unreviewed: total
        });
      }
      setHistory(emptyHistory);
    }
  };

  // Calculations for dashboard including spaced-repetition metrics
  const totalCards = FLASHCARDS_DATABASE.length;
  const totalMasteredCount = masteredIds.length;
  const totalPracticeCount = needPracticeIds.length;
  const totalUnreviewedCount = totalCards - totalMasteredCount - totalPracticeCount;
  
  // Calculate true due cards
  const totalDueCount = FLASHCARDS_DATABASE.filter(c => getCardStatusInfo(c.id).isDue).length;
  const masteryPercentage = Math.round((totalMasteredCount / totalCards) * 100) || 0;

  // Daily goal calculation variables
  const activeDateFullStr = getCurrentDate().toISOString().split("T")[0];
  const cardsReviewedToday = reviewsByDate[activeDateFullStr] || [];
  const todayReviewedCount = cardsReviewedToday.length;
  const goalProgressPercentage = Math.min(100, Math.round((todayReviewedCount / dailyGoal) * 100));
  const isGoalReached = todayReviewedCount >= dailyGoal;

  const currentCard = filteredCards[currentCardIndex];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-royal-600 dark:text-gold-400" />
            <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
              Interactive NSC CAPS & IEB Formula Deck
            </h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Train your active recall on vital formulas and high-yield math theorems. Flip cards, rate recall with SM-2, and build a personalized revision deck.
          </p>
        </div>

        <button
          onClick={resetAllProgress}
          className="px-3.5 py-1.5 text-xs font-mono font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-red-200/50 dark:border-red-800/30 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset progress
        </button>
      </div>

      {/* Daily Goal and Time Machine Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Machine */}
        <div className="bg-gradient-to-br from-navy-900 to-royal-950 border border-gold-400/20 rounded-2xl p-4 text-white flex flex-col justify-between gap-4 shadow-sm text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400 animate-pulse" />
              <span className="text-[10px] font-mono font-black text-gold-400 uppercase tracking-widest block">
                Active Memory Decay & SM-2 Scheduling Simulator
              </span>
            </div>
            <h3 className="text-sm font-bold tracking-tight">
              Active Study Date: <span className="text-gold-400 font-mono">{getCurrentDate().toLocaleDateString("en-ZA", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              {simulatedDaysOffset > 0 && <span className="ml-2 text-xs text-emerald-400 font-mono font-bold">(+{simulatedDaysOffset} days simulated)</span>}
            </h3>
            <p className="text-[11px] text-navy-200 leading-tight">
              Use the time machine to simulate the passage of days. Mastered formulas will naturally decay and reappear in your due revision list!
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto mt-2">
            <button
              onClick={() => setSimulatedDaysOffset(prev => prev + 1)}
              className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border border-white/5 flex items-center justify-center gap-1"
              title="Fast-forward 1 day"
            >
              <Zap className="w-3.5 h-3.5 text-gold-400" />
              +1 Day
            </button>
            <button
              onClick={() => setSimulatedDaysOffset(prev => prev + 3)}
              className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border border-white/5 flex items-center justify-center gap-1"
              title="Fast-forward 3 days"
            >
              +3 Days
            </button>
            <button
              onClick={() => setSimulatedDaysOffset(prev => prev + 7)}
              className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border border-white/5 flex items-center justify-center gap-1"
              title="Fast-forward 1 week"
            >
              +7 Days
            </button>
            {simulatedDaysOffset > 0 && (
              <button
                onClick={() => setSimulatedDaysOffset(0)}
                className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-xs font-mono font-bold text-red-300 rounded-xl transition-all cursor-pointer border border-red-500/20 flex items-center justify-center gap-1"
                title="Reset simulated time offset"
              >
                Real Time
              </button>
            )}
          </div>
        </div>

        {/* Daily Study Goal */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-4 text-left">
          <div className="space-y-1.5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-royal-600 dark:text-gold-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest block">
                    Daily Recall Goal
                  </span>
                </div>
                <h3 className="text-sm font-bold text-navy-900 dark:text-white tracking-tight">
                  Milestone: {todayReviewedCount} / {dailyGoal} Flashcards
                </h3>
              </div>
              
              {/* Daily Goal Setter */}
              <div className="flex items-center gap-1 bg-navy-50 dark:bg-navy-900 px-2.5 py-1 rounded-xl border border-navy-100 dark:border-navy-800">
                <button
                  onClick={() => setDailyGoal(prev => Math.max(1, prev - 1))}
                  className="w-5 h-5 flex items-center justify-center text-xs font-bold text-navy-500 dark:text-navy-400 hover:bg-navy-200/50 dark:hover:bg-navy-800 rounded transition-all cursor-pointer"
                  title="Decrease goal"
                >
                  -
                </button>
                <span className="text-xs font-mono font-bold text-navy-800 dark:text-white px-1" title="Set your daily target">
                  {dailyGoal}
                </span>
                <button
                  onClick={() => setDailyGoal(prev => Math.min(50, prev + 1))}
                  className="w-5 h-5 flex items-center justify-center text-xs font-bold text-navy-500 dark:text-navy-400 hover:bg-navy-200/50 dark:hover:bg-navy-800 rounded transition-all cursor-pointer"
                  title="Increase goal"
                >
                  +
                </button>
              </div>
            </div>

            {/* Motivational Banner / Achievement Info */}
            <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-tight">
              {isGoalReached ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-gold-500" />
                  CAPS Goal Completed! Outstanding memory muscle training today!
                </span>
              ) : (
                <span>
                  Complete <b>{Math.max(0, dailyGoal - todayReviewedCount)}</b> more reviews to secure your South African CAPS math achievement today.
                </span>
              )}
            </p>
          </div>

          {/* Completion Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-navy-400 dark:text-navy-500 uppercase">Review Progress</span>
              <span className={`font-black ${isGoalReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-royal-600 dark:text-gold-400'}`}>
                {goalProgressPercentage}%
              </span>
            </div>
            
            <div className="relative w-full bg-navy-100 dark:bg-navy-850 h-3.5 rounded-full overflow-hidden p-[2px]">
              <motion.div 
                className={`h-full rounded-full bg-gradient-to-r ${
                  isGoalReached 
                    ? "from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                    : "from-royal-500 to-sky-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${goalProgressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Study Streak Tracker */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
              <span className="text-[10px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-widest block">
                Study Streak Tracker
              </span>
            </div>
            <h3 className="text-sm font-bold text-navy-900 dark:text-white tracking-tight">
              Current Streak: <span className="text-amber-500 font-mono text-base font-black">{getStudyStreak()} Days</span>
            </h3>
            <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-tight">
              {getStudyStreak() > 0 ? (
                <span>Awesome commitment! Finish your daily recall target to extend your South African math streak.</span>
              ) : (
                <span>Complete your daily goal of {dailyGoal} cards to launch a new revision streak!</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-navy-100 dark:border-navy-850/60">
            {/* Display last 5 days checkboxes/flames to indicate streak history */}
            <div className="flex gap-2 w-full justify-around">
              {[4, 3, 2, 1, 0].map(offset => {
                const checkDate = getCurrentDate();
                checkDate.setDate(checkDate.getDate() - offset);
                const dateStr = checkDate.toISOString().split("T")[0];
                const reviewed = reviewsByDate[dateStr] || [];
                const reached = reviewed.length >= dailyGoal;
                const label = checkDate.toLocaleDateString("en-ZA", { weekday: "short" });
                const isToday = offset === 0;

                return (
                  <div key={offset} className="flex flex-col items-center gap-1">
                    <span className={`text-[9px] font-mono font-bold ${isToday ? "text-royal-600 dark:text-gold-400 font-black" : "text-navy-400"}`}>
                      {label}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      reached
                        ? "bg-amber-500 border-amber-500 text-navy-950 font-bold"
                        : isToday
                          ? "bg-navy-50 dark:bg-navy-900 border-dashed border-navy-300 dark:border-navy-700 text-navy-300"
                          : "bg-navy-50/50 dark:bg-navy-900/40 border-navy-150 dark:border-navy-850 text-navy-200"
                    }`}>
                      {reached ? (
                        <Flame className="w-4 h-4 fill-current text-amber-950" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Stats Dashboard Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Circular Mastery Visual */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-4 rounded-2xl shadow-sm flex items-center gap-4 col-span-2">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-navy-100 dark:stroke-navy-800 fill-none"
                strokeWidth="5"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-emerald-500 fill-none transition-all duration-500"
                strokeWidth="5"
                strokeDasharray={175}
                strokeDashoffset={175 - (175 * masteryPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-mono font-black text-navy-900 dark:text-white">
              {masteryPercentage}%
            </span>
          </div>

          <div className="space-y-1 flex-1 text-left">
            <h4 className="text-xs font-black font-mono text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-gold-500" />
              Syllabus Perfected Score
            </h4>
            <div className="text-sm font-black text-navy-900 dark:text-white">
              {totalMasteredCount} / {totalCards} Formulas Perfected!
            </div>
            <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-tight">
              {masteryPercentage === 100 
                ? "Incredible work! You have conquered the entire curriculum formula deck!" 
                : masteryPercentage >= 70 
                ? "Looking sharp! Aim to master the remaining formulas before trials." 
                : "Continuous active recall builds long-term neural connections. Keep training!"}
            </p>
          </div>
        </div>

        {/* Due Now Card with red warning alert */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-4 rounded-2xl shadow-sm flex flex-col justify-center space-y-1.5 col-span-1 text-left">
          <span className="text-[10px] font-mono font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-rose-500" />
            ⏰ Due for Review
          </span>
          <div className="text-xl font-black text-navy-900 dark:text-white flex items-baseline gap-1">
            {totalDueCount}
            <span className="text-xs text-navy-400 font-normal">cards</span>
          </div>
          <div className="w-full bg-navy-100 dark:bg-navy-850 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full" 
              style={{ width: `${(totalDueCount / totalCards) * 100}%` }} 
            />
          </div>
        </div>

        {/* Practice Cards */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-4 rounded-2xl shadow-sm flex flex-col justify-center space-y-1.5 col-span-1 text-left">
          <span className="text-[10px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            🚨 Needs Practice
          </span>
          <div className="text-xl font-black text-navy-900 dark:text-white flex items-baseline gap-1">
            {totalPracticeCount}
            <span className="text-xs text-navy-400 font-normal">cards</span>
          </div>
          <div className="w-full bg-navy-100 dark:bg-navy-850 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full" 
              style={{ width: `${(totalPracticeCount / totalCards) * 100}%` }} 
            />
          </div>
        </div>

        {/* Unreviewed Cards */}
        <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-4 rounded-2xl shadow-sm flex flex-col justify-center space-y-1.5 col-span-1 text-left">
          <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">
            💤 Unreviewed
          </span>
          <div className="text-xl font-black text-navy-900 dark:text-white flex items-baseline gap-1">
            {totalUnreviewedCount}
            <span className="text-xs text-navy-400 font-normal">cards</span>
          </div>
          <div className="w-full bg-navy-100 dark:bg-navy-850 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-navy-300 dark:bg-navy-700 h-full" 
              style={{ width: `${(totalUnreviewedCount / totalCards) * 100}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Flashcard Progress Over Time Chart */}
      <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 p-5 rounded-2xl shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-navy-50 dark:border-navy-900 pb-3">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest block">
              Performance Trend Analyzer
            </span>
            <h3 className="text-base font-black text-navy-900 dark:text-white uppercase tracking-tight flex items-center gap-2 font-sans">
              <Activity className="w-4.5 h-4.5 text-royal-600 dark:text-gold-400 animate-pulse" />
              Active Recall learning curve
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-tight">
              A real-time trend line tracking <b>Mastered</b> versus <b>Need Practice</b> formulas across simulated and real-world revision days.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-mono font-black uppercase border border-emerald-500/15">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Mastered: {totalMasteredCount}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-gold-400 rounded-xl text-[10px] font-mono font-black uppercase border border-amber-500/15">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Practice: {totalPracticeCount}
            </span>
          </div>
        </div>

        <div className="w-full h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMastered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPractice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                tickLine={false}
                axisLine={false}
                domain={[0, Math.max(10, totalCards)]}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#fff"
                }}
                labelStyle={{ fontWeight: "bold", color: "#fbbf24", fontFamily: "JetBrains Mono" }}
                itemStyle={{ fontFamily: "Inter, sans-serif" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', paddingTop: '10px' }}
              />
              <Line 
                name="Mastered Formulas"
                type="monotone" 
                dataKey="mastered" 
                stroke="#10b981" 
                strokeWidth={3.5} 
                dot={{ r: 4, stroke: "#10b981", strokeWidth: 1, fill: "#fff" }} 
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }} 
              />
              <Line 
                name="Needs Practice"
                type="monotone" 
                dataKey="practice" 
                stroke="#f59e0b" 
                strokeWidth={2.5} 
                strokeDasharray="4 4"
                dot={{ r: 3, stroke: "#f59e0b", strokeWidth: 1, fill: "#fff" }} 
                activeDot={{ r: 5, stroke: "#f59e0b", strokeWidth: 2, fill: "#fff" }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Controls & Filter Panel */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-850 p-4 rounded-2xl shadow-sm space-y-4">
        
        {/* Search & Layout Toggles */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 text-left">
            <input
              type="text"
              placeholder="Search concepts, equations, variables, chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-navy-50 dark:bg-navy-950 text-xs text-navy-900 dark:text-white rounded-xl border border-navy-150 dark:border-navy-850 focus:outline-none focus:border-royal-500 font-sans"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-navy-400" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-navy-400 hover:text-navy-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-150 dark:border-navy-850 self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewMode("slideshow")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "slideshow" 
                  ? "bg-white dark:bg-navy-800 text-royal-700 dark:text-gold-400 shadow-sm" 
                  : "text-navy-500 hover:text-navy-900 dark:hover:text-navy-200"
              }`}
            >
              🎴 Focused Slide
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid" 
                  ? "bg-white dark:bg-navy-800 text-royal-700 dark:text-gold-400 shadow-sm" 
                  : "text-navy-500 hover:text-navy-900 dark:hover:text-navy-200"
              }`}
            >
              🎛️ Gallery Grid ({filteredCards.length})
            </button>
          </div>
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-navy-100/60 dark:border-navy-850/60">
          
          <div className="space-y-1 text-left">
            <label className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Math Chapter</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
            >
              {topics.map(t => (
                <option key={t} value={t}>{t === "All" ? "All Chapters" : t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Grade Level</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
            >
              <option value="All">Grades 10 - 12</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Syllabus Format</label>
            <select
              value={selectedSyllabus}
              onChange={(e) => setSelectedSyllabus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Curriculums</option>
              <option value="CAPS">NSC CAPS Focus</option>
              <option value="IEB">IEB Focus</option>
              <option value="Both">Joint Syllabus</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Review Status</label>
            <select
              value={masteryFilter}
              onChange={(e) => setMasteryFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Cards</option>
              <option value="due">⏰ Due for Review</option>
              <option value="mastered">✅ Mastered</option>
              <option value="practice">🚨 Needs Practice</option>
              <option value="unreviewed">💤 Unreviewed Only</option>
            </select>
          </div>

        </div>

        {/* Interactive Tag Badges cloud */}
        <div className="pt-2 border-t border-navy-100/60 dark:border-navy-850/60 flex flex-wrap gap-1.5 items-center">
          <span className="text-[9px] font-mono font-black text-navy-400 uppercase mr-1">Filter Tags:</span>
          {allAvailableTags.map(tag => {
            const isActive = selectedTag === tag;
            const count = FLASHCARDS_DATABASE.filter(c => tag === "All" ? true : c.tags.includes(tag)).length;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1 border ${
                  isActive
                    ? "bg-royal-600 dark:bg-gold-500 border-royal-600 dark:border-gold-500 text-white dark:text-navy-950 font-black shadow-sm"
                    : "bg-navy-50 dark:bg-navy-900/40 border-navy-150 dark:border-navy-850 text-navy-600 dark:text-navy-400 hover:border-royal-500/55 dark:hover:border-gold-500/55"
                }`}
              >
                {tag === "All" ? "🏷️ All Tags" : `#${tag}`}
                <span className={`text-[9px] font-mono px-1 rounded-full ${
                  isActive ? "bg-white/20 text-white dark:text-navy-900" : "bg-navy-200/50 dark:bg-navy-800 text-navy-500 dark:text-navy-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* AI Quiz compilation sandbox trigger box */}
        <div className="bg-gradient-to-r from-navy-50 to-royal-50/30 dark:from-navy-900/40 dark:to-navy-950/20 rounded-xl p-3 border border-royal-500/10 dark:border-gold-400/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-royal-600 dark:text-gold-400 animate-pulse" />
              <span className="text-[10px] font-black font-mono text-royal-700 dark:text-gold-400 uppercase tracking-wider">
                Bethuel's AI Revision Sandbox
              </span>
            </div>
            <p className="text-[11px] text-navy-600 dark:text-navy-300">
              {needPracticeIds.length > 0 ? (
                <span>You have <b>{needPracticeIds.length}</b> practice cards flagged with tags (<b>{Array.from(new Set(FLASHCARDS_DATABASE.filter(c => needPracticeIds.includes(c.id)).flatMap(c => c.tags))).join(", ")}</b>).</span>
              ) : (
                <span>No practice cards flagged. Tag cards as "Practice" to feed Bethuel's AI compilation sandbox!</span>
              )}
            </p>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 w-full sm:w-auto justify-center ${
              isGeneratingQuiz
                ? "bg-navy-200 text-navy-500 border-navy-200 cursor-not-allowed"
                : "bg-royal-600 dark:bg-gold-500 border-royal-600 dark:border-gold-500 text-white dark:text-navy-950 hover:opacity-90 font-extrabold"
            }`}
          >
            {isGeneratingQuiz ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {needPracticeIds.length > 0 ? "Generate AI Practice Quiz" : "Generate Standard Math Quiz"}
              </>
            )}
          </button>
        </div>

      </div>

      {/* MAIN LAYOUT CONDITIONAL */}
      {activeQuizIndex !== -1 ? (
        <div className="bg-white dark:bg-navy-950 border-2 border-royal-500/20 dark:border-gold-500/20 rounded-3xl p-6 shadow-xl space-y-6 max-w-2xl mx-auto relative overflow-hidden text-left">
          
          {/* Decorative South African Gold/Navy accent strip */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-royal-600 via-gold-400 to-royal-800" />
          
          {/* Header row */}
          <div className="flex justify-between items-center pb-4 border-b border-navy-100 dark:border-navy-850">
            <div className="space-y-0.5 text-left">
              <span className="text-[10px] font-mono font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest block">
                NSC CAPS & IEB AI REVISION SANDBOX
              </span>
              <h3 className="text-base font-black text-navy-900 dark:text-white uppercase tracking-tight">
                Bethuel's AI Practice Quiz
              </h3>
            </div>
            
            <button
              onClick={() => setActiveQuizIndex(-1)}
              className="p-1.5 hover:bg-navy-50 dark:hover:bg-navy-900 text-navy-400 hover:text-navy-600 rounded-xl transition-all cursor-pointer"
              title="Close Quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!quizCompleted ? (
            // Active Question view
            <div className="space-y-5">
              {/* Question progress and current score */}
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-navy-500">
                  Question <b className="text-navy-900 dark:text-white">{activeQuizIndex + 1}</b> of <b>{quizQuestions.length}</b>
                </span>
                <span className="text-royal-600 dark:text-gold-400 font-bold">
                  Score: {quizScore} / {activeQuizIndex}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-navy-100 dark:bg-navy-850 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-royal-600 dark:bg-gold-500 h-full transition-all duration-300" 
                  style={{ width: `${((activeQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question text card */}
              <div className="bg-navy-950 text-white p-5 rounded-2xl border border-gold-400/20 shadow-inner text-left space-y-1.5">
                <span className="text-[9px] font-mono font-black text-gold-400 uppercase tracking-widest block">The Math Question:</span>
                <p className="text-sm sm:text-base font-bold leading-relaxed">
                  <LatexRenderer text={quizQuestions[activeQuizIndex].question} />
                </p>
              </div>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-3 text-left">
                {quizQuestions[activeQuizIndex].options.map((option: string) => {
                  const isSelected = quizSelectedOption === option;
                  const isSubmitted = quizShowExplanation;
                  const optionLabel = option.trim().substring(0, 1); // A, B, C or D
                  const isCorrect = option === quizQuestions[activeQuizIndex].correctAnswer;
                  
                  let optionStyle = "bg-navy-50 dark:bg-navy-900 border-navy-150 dark:border-navy-850 text-navy-800 dark:text-navy-200 hover:border-royal-500/50";
                  if (isSelected && !isSubmitted) {
                    optionStyle = "bg-royal-50/55 dark:bg-royal-950/20 border-royal-600 dark:border-gold-500 text-royal-700 dark:text-gold-400 font-bold";
                  } else if (isSubmitted) {
                    if (isCorrect) {
                      optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                    } else if (isSelected) {
                      optionStyle = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 font-bold";
                    } else {
                      optionStyle = "opacity-50 border-navy-100 dark:border-navy-900 text-navy-400";
                    }
                  }

                  return (
                    <button
                      key={option}
                      disabled={isSubmitted}
                      onClick={() => setQuizSelectedOption(option)}
                      className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer text-left flex items-start gap-3 ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isSelected && !isSubmitted
                          ? "bg-royal-600 dark:bg-gold-500 text-white"
                          : isSubmitted && isCorrect
                            ? "bg-emerald-505 bg-emerald-500 text-white"
                            : isSubmitted && isSelected
                              ? "bg-red-500 text-white"
                              : "bg-navy-200/50 dark:bg-navy-800 text-navy-500"
                      }`}>
                        {optionLabel}
                      </span>
                      <span className="leading-snug pt-0.5">
                        <LatexRenderer text={option.substring(3)} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action and feedback footer */}
              <div className="pt-4 border-t border-navy-100 dark:border-navy-850 flex flex-col gap-4">
                {quizShowExplanation && (
                  <div className="bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-2xl text-left space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                      <Lightbulb className="w-4.5 h-4.5" />
                      <span className="text-xs font-black font-mono uppercase tracking-wider">Bethuel's Math Memo Resolution:</span>
                    </div>
                    <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed">
                      <LatexRenderer text={quizQuestions[activeQuizIndex].explanation} />
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  {!quizShowExplanation ? (
                    <button
                      disabled={!quizSelectedOption}
                      onClick={() => {
                        setQuizShowExplanation(true);
                        const correctOption = quizQuestions[activeQuizIndex].correctAnswer;
                        if (quizSelectedOption === correctOption) {
                          setQuizScore(prev => prev + 1);
                        }
                      }}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        quizSelectedOption
                          ? "bg-royal-600 dark:bg-gold-500 border-royal-600 dark:border-gold-500 text-white dark:text-navy-950 hover:opacity-95 cursor-pointer"
                          : "bg-navy-100 text-navy-400 border-navy-200 cursor-not-allowed"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (activeQuizIndex < quizQuestions.length - 1) {
                          setActiveQuizIndex(prev => prev + 1);
                          setQuizSelectedOption(null);
                          setQuizShowExplanation(false);
                        } else {
                          setQuizCompleted(true);
                        }
                      }}
                      className="px-5 py-2 bg-royal-600 dark:bg-gold-500 border-royal-600 dark:border-gold-500 text-white dark:text-navy-950 hover:opacity-95 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>{activeQuizIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Quiz completed view
            <div className="space-y-6 text-center py-4 animate-fadeIn">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-2">
                <Trophy className="w-12 h-12" />
              </div>
              
              <div className="space-y-1.5 text-center">
                <h3 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
                  Quiz Completed!
                </h3>
                <p className="text-xs text-navy-500 dark:text-navy-400 max-w-md mx-auto">
                  Outstanding revision work today! Continuous testing is the ultimate strategy to secure your NSC Paper 1 & Paper 2 grade distinctions.
                </p>
              </div>

              {/* Score Display Card */}
              <div className="bg-navy-50 dark:bg-navy-900/60 p-6 rounded-2xl border border-navy-150 dark:border-navy-850 max-w-sm mx-auto space-y-1 text-center">
                <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider block">Your Revision Score:</span>
                <h4 className="text-4xl font-mono font-black text-royal-600 dark:text-gold-400">
                  {Math.round((quizScore / quizQuestions.length) * 100)}%
                </h4>
                <p className="text-xs font-mono text-navy-600 dark:text-navy-300 pt-1">
                  Correct answers: <b>{quizScore}</b> out of <b>{quizQuestions.length}</b>
                </p>
              </div>

              {/* Printable PDF container block */}
              <div className="pt-4 border-t border-navy-100 dark:border-navy-850 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 hover:bg-navy-100 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  📥 Export Results (PDF)
                </button>
                <button
                  onClick={handleGenerateQuiz}
                  className="px-4 py-2 bg-royal-600 dark:bg-gold-500 border-royal-600 dark:border-gold-500 text-white dark:text-navy-950 hover:opacity-95 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                  Retake Quiz
                </button>
                <button
                  onClick={() => {
                    setActiveQuizIndex(-1);
                    setQuizQuestions([]);
                    setQuizCompleted(false);
                  }}
                  className="px-4 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 hover:bg-navy-100 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Back to Flashcards
                </button>
              </div>

              {/* PRINT ONLY LAYOUT CONTAINER */}
              <div className="hidden print:block text-left p-8 space-y-6 text-black bg-white" style={{ fontFamily: "serif" }}>
                <div className="text-center space-y-2 border-b-2 border-black pb-4">
                  <h1 className="text-2xl font-black tracking-tight uppercase">AMARIS MATHEMATICS HUB</h1>
                  <h2 className="text-md font-bold tracking-tight">NSC CAPS / IEB AI Revision Performance Memo</h2>
                  <div className="text-[10px] font-mono text-gray-600 flex justify-center gap-6 pt-1">
                    <span><b>Student Account:</b> {user ? `${user.first_name} ${user.surname}` : "Active CAPS Student"} ({user?.grade || "Grade 12"})</span>
                    <span><b>Report Date:</b> {getCurrentDate().toLocaleDateString("en-ZA", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono font-black tracking-wider block uppercase text-gray-500">Revision Assessment Score:</span>
                  <div className="text-4xl font-bold">{Math.round((quizScore / quizQuestions.length) * 100)}%</div>
                  <div className="text-xs">Correct answers: {quizScore} / {quizQuestions.length} multiple-choice problems</div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold border-b border-gray-300 pb-1 uppercase">Detailed Solution Manual:</h3>
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-2 pb-4 border-b border-dashed border-gray-200">
                      <div className="text-xs font-bold">
                        Question {idx + 1}: <LatexRenderer text={q.question} />
                      </div>
                      <div className="text-xs text-gray-700 pl-4">
                        <b>Options:</b>
                        <ul className="list-disc pl-5 space-y-1 pt-1">
                          {q.options.map((opt: string) => (
                            <li key={opt} className={opt === q.correctAnswer ? "font-bold text-black" : ""}>
                              <LatexRenderer text={opt} /> {opt === q.correctAnswer && "✓ (Correct Answer)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                        <b>Resolution Explanation:</b> <LatexRenderer text={q.explanation} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 text-center text-[10px] text-gray-500 border-t border-gray-200">
                  Amaris Mathematics Hub — South Africa's Premium Math Revision Portal
                </div>
              </div>

            </div>
          )}

        </div>
      ) : filteredCards.length > 0 ? (
        viewMode === "slideshow" ? (
          /* SLIDESHOW REVIEW FOCUS VIEW */
          <div className="flex flex-col items-center max-w-xl mx-auto space-y-6 w-full text-left">
            
            {/* TOOLBAR FOR QUICK ACTIONS */}
            <div className="flex justify-between items-center w-full bg-navy-50 dark:bg-navy-900/60 p-2.5 rounded-2xl border border-navy-150 dark:border-navy-850/80 select-none">
              <span className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider pl-1">Slide recall assistant:</span>
              <button
                onClick={() => setIsFocusMode(true)}
                className="px-3 py-1 rounded-xl bg-white dark:bg-navy-800 hover:bg-navy-50 text-royal-600 dark:text-gold-400 border border-navy-200 dark:border-navy-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Enter cinematic Focus Mode"
              >
                👁️ Focus Mode
              </button>
            </div>

            {/* CARD CONTAINER WITH 3D PERSPECTIVE */}
            <div className="w-full h-[360px] relative select-none" style={{ perspective: "1000px" }}>
              
              {/* Animated Inner card wrapper */}
              <motion.div
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
                className="w-full h-full cursor-pointer relative"
              >
                
                {/* FRONT SIDE */}
                <div 
                  style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                  className="absolute inset-0 bg-gradient-to-br from-navy-900 to-royal-950 border-2 border-gold-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between text-white"
                >
                  {/* Top tags info */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-mono font-black text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {currentCard.topic}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {currentCard.tags.map(tag => (
                          <span key={tag} className="text-[8.5px] font-mono bg-white/5 border border-white/10 text-navy-300 px-1.5 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mastery Indicators & TTS Audio */}
                    <div className="flex flex-col items-end gap-1.5 text-right">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleSpeakText(`${currentCard.title}. ${currentCard.front}`, e)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                          title="Pronounce mathematical terminology"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-gold-400" />
                        </button>
                        <span className={`text-[8.5px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase ${getCardStatusInfo(currentCard.id).color}`}>
                          {getCardStatusInfo(currentCard.id).label}
                        </span>
                      </div>
                      {schedules[currentCard.id] && (
                        <span className="text-[7.5px] font-mono text-white/50 block">
                          Interval: {schedules[currentCard.id].interval}d | Streak: {schedules[currentCard.id].repetition}x
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Question / Concept Name */}
                  <div className="space-y-3 py-4 text-center">
                    <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest block">
                      {currentCard.type === "formula" ? "FORMULA CHALLENGE" : "MATHEMATICAL TERMINOLOGY"}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold font-display leading-snug tracking-tight text-white px-2">
                      {currentCard.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-navy-200 leading-relaxed max-w-sm mx-auto pt-2">
                      <LatexRenderer text={currentCard.front} />
                    </p>
                  </div>

                  {/* Bottom hint helper */}
                  <div className="flex items-center justify-between text-[9px] text-white/50 border-t border-white/10 pt-3">
                    <span className="flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-gold-400" />
                      Tap card to flip over
                    </span>
                    <span className="font-mono">
                      Card {currentCardIndex + 1} of {filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div 
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", transformStyle: "preserve-3d" }}
                  className="absolute inset-0 bg-white dark:bg-navy-950 border-2 border-navy-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between text-navy-900 dark:text-white"
                >
                  {/* Top Category and Action Indicator */}
                  <div className="flex justify-between items-start border-b border-navy-100 dark:border-navy-850 pb-2">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[10px] font-mono font-black text-royal-600 dark:text-gold-400 uppercase tracking-wider">
                        REVISION MEMO ANSWER
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {currentCard.tags.map(tag => (
                          <span key={tag} className="text-[8.5px] font-mono bg-navy-50 dark:bg-navy-900 border border-navy-150 dark:border-navy-800 text-navy-500 dark:text-navy-400 px-1.5 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleSpeakText(`${currentCard.title}. The answer is: ${currentCard.back}`, e)}
                        className="p-1.5 rounded-lg bg-navy-100 dark:bg-navy-900 hover:bg-navy-200/50 text-royal-600 dark:text-gold-400 transition-all cursor-pointer"
                        title="Pronounce mathematical answer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[8px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400 px-2 py-0.5 rounded">
                        Answer Back
                      </span>
                    </div>
                  </div>

                  {/* Formula / Answer Area */}
                  <div className="space-y-4 py-4 text-center">
                    <div className="p-4 bg-navy-950 text-gold-400 rounded-2xl text-sm sm:text-base font-semibold shadow-inner tracking-wide leading-relaxed max-h-[120px] overflow-auto flex flex-col items-center justify-center">
                      <LatexRenderer text={currentCard.back} />
                    </div>

                    {/* Example usage if present */}
                    {currentCard.example && (
                      <div className="text-left bg-navy-50 dark:bg-navy-900 p-2.5 rounded-xl border border-navy-150 dark:border-navy-800/80">
                        <span className="text-[9px] font-mono font-black text-navy-500 uppercase block tracking-wider mb-0.5">Quick Example Walkthrough</span>
                        <p className="text-[10.5px] text-navy-600 dark:text-navy-300 leading-snug">
                          <LatexRenderer text={currentCard.example} />
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bethuel's Coach Tip footer block */}
                  <div className="bg-amber-500/10 border-l-4 border-amber-500 p-2.5 rounded-r-xl text-left">
                    <div className="text-[9px] font-black font-mono text-amber-700 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>Bethuel's Exam Blueprint Memo:</span>
                    </div>
                    <p className="text-[10px] text-navy-700 dark:text-navy-300 italic leading-snug pt-0.5">
                      "<LatexRenderer text={currentCard.examTip} />"
                    </p>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* ACTIVE RECALL RATING PANEL */}
            <div className="w-full">
              {isFlipped ? (
                <div className="space-y-2 text-center w-full select-none">
                  <span className="text-[10px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest block">
                    HOW WELL DID YOU RECALL THIS FORMULA?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 1);
                      }}
                      className="p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-200/50 dark:border-red-800/30 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5"
                    >
                      <Flame className="w-4 h-4 text-red-500" />
                      <span className="text-[11px] font-black uppercase">Hard</span>
                      <span className="text-[8.5px] font-mono opacity-80">1d interval</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 2);
                      }}
                      className="p-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-600 dark:text-gold-400 rounded-xl border border-amber-200/50 dark:border-amber-800/30 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5"
                    >
                      <Activity className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px] font-black uppercase">Medium</span>
                      <span className="text-[8.5px] font-mono opacity-80">3d interval</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 3);
                      }}
                      className="p-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-200/50 dark:border-sky-800/30 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5"
                    >
                      <Check className="w-4 h-4 text-sky-500" />
                      <span className="text-[11px] font-black uppercase">Good</span>
                      <span className="text-[8.5px] font-mono opacity-80">SM-2 standard</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 4);
                      }}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5"
                    >
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] font-black uppercase">Easy</span>
                      <span className="text-[8.5px] font-mono opacity-80">7d+ interval</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3.5 bg-royal-600 hover:bg-royal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 select-none"
                >
                  <Play className="w-4 h-4" />
                  Show Answer & Rate Recall
                </button>
              )}
            </div>

            {/* SLIDESHOW NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between w-full border-t border-navy-100 dark:border-navy-800 pt-4 px-2 select-none">
              
              <button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  setIsFlipped(false);
                }}
                className="p-2.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-800 dark:text-white rounded-xl border border-navy-200 dark:border-navy-700 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Card
              </button>

              <span className="text-xs font-mono text-navy-400 font-bold">
                Card {currentCardIndex + 1} of {filteredCards.length}
              </span>

              <button
                disabled={currentCardIndex === filteredCards.length - 1}
                onClick={() => {
                  setCurrentCardIndex(prev => Math.min(filteredCards.length - 1, prev + 1));
                  setIsFlipped(false);
                }}
                className="p-2.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-800 dark:text-white rounded-xl border border-navy-200 dark:border-navy-700 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                Next Card
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        ) : (
          /* DECK GALLERY GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <AnimatePresence mode="popLayout">
              {filteredCards.map((card) => {
                const isMastered = masteredIds.includes(card.id);
                const isPractice = needPracticeIds.includes(card.id);
                
                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white dark:bg-navy-950 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md text-left relative ${
                      isMastered 
                        ? "border-emerald-500/30 bg-gradient-to-br from-white to-emerald-500/[0.01] dark:from-navy-950 dark:to-emerald-500/[0.01]" 
                        : isPractice
                        ? "border-amber-500/30 bg-gradient-to-br from-white to-amber-500/[0.01] dark:from-navy-950 dark:to-amber-500/[0.01]"
                        : "border-navy-150 dark:border-navy-850"
                    }`}
                  >
                    {/* Top tags bar */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-[8px] font-mono font-black text-royal-600 dark:text-gold-400 bg-royal-100/40 dark:bg-royal-950/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {card.topic}
                        </span>
                        
                        {/* Spaced repetition memory decay status indicators */}
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded ${getCardStatusInfo(card.id).color}`}>
                            {getCardStatusInfo(card.id).label}
                          </span>
                          {schedules[card.id] && (
                            <span className="text-[7.5px] font-mono text-navy-400 dark:text-navy-500 block leading-none">
                              EF: {schedules[card.id].easeFactor} | Streak: {schedules[card.id].repetition}x
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-black text-navy-950 dark:text-white pt-1">
                        {card.title}
                      </h4>
                      <p className="text-[11px] font-mono text-navy-400">
                        {card.grade} • {card.syllabus === "Both" ? "CAPS & IEB" : card.syllabus}
                      </p>
                    </div>

                    {/* Brief Question Preview */}
                    <div className="py-1">
                      <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">Query / Challenge:</span>
                      <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed"><LatexRenderer text={card.front} /></p>
                    </div>

                    {/* Mini Equation reveal space */}
                    <div className="bg-navy-50 dark:bg-navy-900/60 p-3 rounded-xl border border-navy-100 dark:border-navy-850/60 text-center text-xs font-bold text-royal-600 dark:text-gold-400 min-h-[48px] flex items-center justify-center">
                      <LatexRenderer text={card.back.split("\n")[0] + (card.back.includes("\n") ? " ..." : "")} />
                    </div>

                    {/* Quick action checklist buttons */}
                    <div className="border-t border-navy-100 dark:border-navy-850 pt-3 flex justify-between items-center">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => toggleNeedPractice(card.id)}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isPractice
                              ? "bg-amber-500 border-amber-500 text-navy-950 font-extrabold"
                              : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 text-amber-700 dark:text-amber-400 hover:bg-amber-500/5"
                          }`}
                          title="Flag for revision practice"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          Practice
                        </button>

                        <button
                          onClick={() => toggleMastery(card.id)}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isMastered
                              ? "bg-emerald-600 border-emerald-600 text-white font-extrabold"
                              : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5"
                          }`}
                          title="Mark as mastered"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mastered
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          // Trigger focused slideshow mode for this specific card
                          const indexInFiltered = filteredCards.findIndex(c => c.id === card.id);
                          if (indexInFiltered !== -1) {
                            setCurrentCardIndex(indexInFiltered);
                            setViewMode("slideshow");
                            setIsFlipped(true); // show back instantly
                          }
                        }}
                        className="text-[10px] font-mono text-royal-600 dark:text-gold-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        Full Screen & Tips
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

          </div>
        )
      ) : (
        /* NO CARDS FOUND */
        <div className="text-center py-12 bg-white dark:bg-navy-950 border border-dashed border-navy-200 dark:border-navy-800 rounded-3xl space-y-3">
          <Layers className="w-12 h-12 text-navy-400 mx-auto" />
          <h3 className="text-sm font-extrabold text-navy-900 dark:text-white">No Matching Flashcards</h3>
          <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
            Try adjusting your search terms, grade levels, or syllabus focus to load other math equations.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTopic("All");
              setSelectedGrade("All");
              setSelectedSyllabus("All");
              setMasteryFilter("all");
            }}
            className="px-3.5 py-1.5 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Study Tip Banner */}
      <div className="bg-gradient-to-r from-royal-600/5 to-gold-500/5 border border-royal-100 dark:border-navy-800 rounded-2xl p-4 flex gap-3.5 items-start text-left">
        <Sparkles className="w-5 h-5 text-gold-500 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-black font-mono text-royal-700 dark:text-gold-400 uppercase tracking-wider">
            Amaris Scientific Study Tip: Active Recall & Leitner Progressions
          </h4>
          <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed font-sans">
            Don't just passively read formula sheets! Forcing your brain to retrieve the formula (Active Recall) and testing yourself on what you struggle with (Spaced Repetition) is scientifically proven to double your retention rate. Try revising your <b>"Need Practice"</b> cards daily before attempting exam past papers.
          </p>
        </div>
      </div>

      {/* FOCUS MODE CINEMATIC OVERLAY */}
      {isFocusMode && filteredCards.length > 0 && (
        <div className="fixed inset-0 z-50 bg-navy-950/98 flex flex-col items-center justify-center p-4 overflow-y-auto animate-fadeIn select-none">
          {/* Exit Focus Mode Button */}
          <button
            onClick={() => setIsFocusMode(false)}
            className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold font-mono transition-all border border-white/10 flex items-center gap-2 cursor-pointer z-50 shadow-md"
          >
            <X className="w-4 h-4 text-gold-400" />
            <span>Exit Focus Mode</span>
          </button>

          {/* Centered card and review rating controls */}
          <div className="w-full max-w-md space-y-6">
            
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-black text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                AMARIS HIGH-INTENSITY FOCUS CHAMBER
              </span>
              <p className="text-xs text-navy-300 leading-none pt-1">
                Distractions muted. Focus purely on formula recall.
              </p>
            </div>

            {/* CARD CONTAINER WITH 3D PERSPECTIVE */}
            <div className="w-full h-[360px] relative" style={{ perspective: "1000px" }}>
              <motion.div
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
                className="w-full h-full cursor-pointer relative"
              >
                {/* FRONT SIDE */}
                <div 
                  style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                  className="absolute inset-0 bg-gradient-to-br from-navy-900 to-royal-950 border-2 border-gold-400/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between text-white text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-black text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {currentCard.topic}
                      </span>
                      <div className="flex gap-1">
                        {currentCard.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-mono bg-white/5 border border-white/10 text-navy-300 px-1 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleSpeakText(`${currentCard.title}. ${currentCard.front}`, e)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
                      title="Pronounce Terminology"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gold-400" />
                    </button>
                  </div>

                  <div className="space-y-2 py-4 text-center">
                    <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-widest block">
                      {currentCard.type === "formula" ? "FORMULA CHALLENGE" : "MATHEMATICAL TERMINOLOGY"}
                    </span>
                    <h3 className="text-lg font-extrabold font-display leading-snug tracking-tight text-white">
                      {currentCard.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-navy-200 leading-relaxed max-w-sm mx-auto pt-2">
                      <LatexRenderer text={currentCard.front} />
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-white/40 border-t border-white/10 pt-3">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-gold-400" />
                      Tap card to flip over
                    </span>
                    <span className="font-mono">
                      Card {currentCardIndex + 1} of {filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div 
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", transformStyle: "preserve-3d" }}
                  className="absolute inset-0 bg-white dark:bg-navy-950 border-2 border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between text-navy-900 dark:text-white"
                >
                  <div className="flex justify-between items-start border-b border-navy-100 dark:border-navy-850 pb-2">
                    <div className="flex flex-col items-start gap-1 text-left">
                      <span className="text-[10px] font-mono font-black text-royal-600 dark:text-gold-400 uppercase tracking-wider">
                        REVISION MEMO ANSWER
                      </span>
                      <div className="flex gap-1">
                        {currentCard.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-mono bg-navy-100 dark:bg-navy-900 border border-navy-150 text-navy-500 dark:text-navy-400 px-1 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleSpeakText(`${currentCard.title}. The answer is: ${currentCard.back}`, e)}
                      className="p-1.5 rounded-lg bg-navy-100 dark:bg-navy-900 hover:bg-navy-200/50 text-royal-600 dark:text-gold-400 transition-all cursor-pointer z-10"
                      title="Pronounce Answer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 py-2 text-center">
                    <div className="p-4 bg-navy-950 text-gold-400 rounded-2xl text-sm font-semibold shadow-inner tracking-wide leading-relaxed max-h-[110px] overflow-auto flex flex-col items-center justify-center">
                      <LatexRenderer text={currentCard.back} />
                    </div>

                    {currentCard.example && (
                      <div className="text-left bg-navy-50 dark:bg-navy-900 p-2 rounded-xl border border-navy-150 dark:border-navy-800/80">
                        <span className="text-[8px] font-mono font-black text-navy-500 uppercase block tracking-wider mb-0.5">Quick Walkthrough</span>
                        <p className="text-[10px] text-navy-600 dark:text-navy-300 leading-snug">
                          <LatexRenderer text={currentCard.example} />
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-500/10 border-l-4 border-amber-500 p-2 rounded-r-xl text-left">
                    <p className="text-[9.5px] text-navy-700 dark:text-navy-300 italic leading-snug">
                      "<LatexRenderer text={currentCard.examTip} />"
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RATINGS FOR RECALL */}
            <div className="w-full">
              {isFlipped ? (
                <div className="space-y-2 text-center w-full">
                  <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                    HOW WELL DID YOU RECALL THIS FORMULA?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 1);
                      }}
                      className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/20 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5 animate-fadeIn"
                    >
                      <Flame className="w-4 h-4 text-red-400" />
                      <span className="text-[10px] font-black uppercase">Hard</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 2);
                      }}
                      className="p-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/20 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5 animate-fadeIn"
                    >
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-black uppercase">Medium</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 3);
                      }}
                      className="p-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-xl border border-sky-500/20 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5 animate-fadeIn"
                    >
                      <Check className="w-4 h-4 text-sky-400" />
                      <span className="text-[10px] font-black uppercase">Good</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRating(currentCard.id, 4);
                      }}
                      className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl border border-emerald-500/20 transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-0.5 animate-fadeIn"
                    >
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase">Easy</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3.5 bg-gold-500 text-navy-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Show Answer & Rate Recall
                </button>
              )}
            </div>

            {/* NEXT / PREVIOUS NAVIGATION */}
            <div className="flex items-center justify-between w-full border-t border-white/10 pt-4 px-1 select-none">
              <button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  setIsFlipped(false);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <span className="text-xs font-mono text-white/50">
                Card {currentCardIndex + 1} of {filteredCards.length}
              </span>

              <button
                disabled={currentCardIndex === filteredCards.length - 1}
                onClick={() => {
                  setCurrentCardIndex(prev => Math.min(filteredCards.length - 1, prev + 1));
                  setIsFlipped(false);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
