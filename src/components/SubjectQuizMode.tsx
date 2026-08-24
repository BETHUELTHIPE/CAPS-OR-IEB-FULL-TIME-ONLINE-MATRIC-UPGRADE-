import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  BrainCircuit, 
  BarChart3, 
  AlertTriangle, 
  Lightbulb, 
  Check, 
  Target, 
  Zap, 
  FileText,
  Filter,
  GraduationCap,
  Bookmark,
  Share2,
  Volume2,
  VolumeX
} from "lucide-react";
import { Profile } from "../types";
import { saveToDB, getFromDB } from "../lib/db";
import { triggerDistinctionToast } from "../lib/toast";
import { AudioFeedbackPlayer } from "./AudioFeedbackPlayer";
import { ErrorTrendAnalysis } from "./ErrorTrendAnalysis";

export interface SubjectQuizModeProps {
  user?: Profile | null;
  initialTopic?: string;
  initialSubTab?: "quiz" | "error_trend";
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  topicName: string;
  grade: string; // "Grade 10", "Grade 11", "Grade 12 CAPS / IEB"
  difficulty: "Foundation" | "Intermediate" | "Matric Mastery";
  questionText: string;
  mathExpression?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
  stepByStepSolution: string[];
  knowledgeGapCategory: string; // e.g. "Algebraic Signs", "Domain Restrictions", "Reduction Quadrants"
  formulaUsed?: string;
}

export interface QuizAttemptResult {
  id: string;
  userId: string;
  topicId: string;
  topicName: string;
  grade: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  nscCode: string; // Code 1 - 7
  timeSpentSeconds: number;
  completedAt: string;
  knowledgeGaps: string[];
  questionResults: {
    questionId: string;
    questionText: string;
    selectedOptionId: string;
    isCorrect: boolean;
    correctOptionId: string;
    gapCategory: string;
  }[];
}

// Comprehensive CAPS & IEB Mathematics Questions Database categorized by Difficulty
const SUBJECT_QUIZ_DATABASE: Record<string, { topicName: string; grade: string; icon: string; questions: QuizQuestion[] }> = {
  algebra: {
    topicName: "Algebra, Equations & Surds",
    grade: "Grade 10-12 CAPS/IEB",
    icon: "Calculator",
    questions: [
      {
        id: "alg-f1",
        topicId: "algebra",
        topicName: "Algebra, Equations & Surds",
        grade: "Grade 10-11",
        difficulty: "Foundation",
        questionText: "Solve for x by factorisation: x² - 5x + 6 = 0",
        mathExpression: "x^2 - 5x + 6 = 0",
        options: [
          { id: "a", text: "x = 2 or x = 3", isCorrect: true, explanation: "Factorising gives (x - 2)(x - 3) = 0, so x = 2 or x = 3." },
          { id: "b", text: "x = -2 or x = -3", isCorrect: false, explanation: "Sign error when solving from factors (x - 2)(x - 3) = 0." },
          { id: "c", text: "x = 1 or x = 6", isCorrect: false, explanation: "Factors (-1)(-6) = +6, but -1 + -6 = -7 ≠ -5." },
          { id: "d", text: "x = -1 or x = 6", isCorrect: false, explanation: "Product of -1 and 6 is -6, not +6." }
        ],
        hint: "Find two numbers that multiply to +6 and add up to -5.",
        stepByStepSolution: [
          "1. Factorise x² - 5x + 6 into (x - 2)(x - 3) = 0",
          "2. Set each factor to zero: x - 2 = 0 or x - 3 = 0",
          "3. Solve: x = 2 or x = 3"
        ],
        knowledgeGapCategory: "Quadratic Factorisation",
        formulaUsed: "(x - p)(x - q) = 0 \\implies x = p \\text{ or } x = q"
      },
      {
        id: "alg-i1",
        topicId: "algebra",
        topicName: "Algebra, Equations & Surds",
        grade: "Grade 11",
        difficulty: "Intermediate",
        questionText: "Solve the non-linear inequality: (x - 3)(x + 1) ≤ 0",
        mathExpression: "(x - 3)(x + 1) \\le 0",
        options: [
          { id: "a", text: "x ≤ -1 or x ≥ 3", isCorrect: false, explanation: "This gives positive values for the expression, not negative or zero." },
          { id: "b", text: "-1 ≤ x ≤ 3", isCorrect: true, explanation: "The parabolic function y = (x-3)(x+1) opens upwards with roots at x = -1 and x = 3. It is ≤ 0 between the roots." },
          { id: "c", text: "x ≤ 3", isCorrect: false, explanation: "This includes x < -1 where the parabola is actually positive." },
          { id: "d", text: "-1 < x < 3", isCorrect: false, explanation: "The inequality includes ≤ 0, so boundary endpoints [-1, 3] must be included." }
        ],
        hint: "Sketch a quick parabola with x-intercepts at -1 and 3, or use a sign table.",
        stepByStepSolution: [
          "1. Critical values are x = -1 and x = 3.",
          "2. The parabola y = (x - 3)(x + 1) opens upward.",
          "3. The expression is negative below the x-axis, i.e., between x = -1 and x = 3.",
          "4. Since inequality is ≤ 0, include endpoints: -1 ≤ x ≤ 3."
        ],
        knowledgeGapCategory: "Quadratic Inequalities & Interval Notation",
        formulaUsed: "(x - x_1)(x - x_2) \\le 0 \\implies x_1 \\le x \\le x_2"
      },
      {
        id: "alg-m1",
        topicId: "algebra",
        topicName: "Algebra, Equations & Surds",
        grade: "Grade 11-12",
        difficulty: "Matric Mastery",
        questionText: "Solve for x in the surd equation: √(2x + 5) - x = 1",
        mathExpression: "\\sqrt{2x + 5} = x + 1",
        options: [
          { id: "a", text: "x = 2 or x = -2", isCorrect: false, explanation: "x = -2 is an extraneous solution because √(2(-2)+5) = √1 = 1, but -2 + 1 = -1 ≠ 1." },
          { id: "b", text: "x = 2 only", isCorrect: true, explanation: "Isolating the surd gives √(2x+5) = x+1. Squaring both sides: 2x+5 = x²+2x+1 ⇒ x² = 4 ⇒ x = ±2. Checking constraints shows x = 2 is valid." },
          { id: "c", text: "x = 4", isCorrect: false, explanation: "Plugging x = 4 yields √(13) - 4 ≠ 1." },
          { id: "d", text: "No real solution", isCorrect: false, explanation: "There is a valid real solution x = 2." }
        ],
        hint: "Isolate the square root term on one side before squaring both sides, and ALWAYS test for extraneous roots!",
        stepByStepSolution: [
          "1. Isolate surd: √(2x + 5) = x + 1",
          "2. Square both sides: 2x + 5 = (x + 1)² = x² + 2x + 1",
          "3. Simplify: x² = 4  ⇒  x = 2 or x = -2",
          "4. Check validity: Left side for x = -2 gives √1 = 1, Right side gives -2 + 1 = -1 (Invalid!).",
          "5. Valid answer: x = 2"
        ],
        knowledgeGapCategory: "Extranous Roots & Surd Restrictions",
        formulaUsed: "\\sqrt{f(x)} = g(x) \\implies f(x) = [g(x)]^2 \\text{ where } g(x) \\ge 0"
      },
      {
        id: "alg-m2",
        topicId: "algebra",
        topicName: "Algebra, Equations & Surds",
        grade: "Grade 11-12",
        difficulty: "Matric Mastery",
        questionText: "Determine the nature of the roots for 2x² - 4x + 5 = 0 without solving.",
        mathExpression: "\\Delta = b^2 - 4ac",
        options: [
          { id: "a", text: "Real, rational, and unequal", isCorrect: false, explanation: "Discriminant Δ is negative, so roots cannot be real." },
          { id: "b", text: "Non-real (imaginary) roots", isCorrect: true, explanation: "Δ = (-4)² - 4(2)(5) = 16 - 40 = -24 < 0. Since Δ < 0, roots are non-real." },
          { id: "c", text: "Real, equal roots", isCorrect: false, explanation: "Real equal roots require Δ = 0." },
          { id: "d", text: "Real, irrational, and unequal", isCorrect: false, explanation: "Δ < 0 indicates complex/non-real roots." }
        ],
        hint: "Calculate the quadratic discriminant Δ = b² - 4ac.",
        stepByStepSolution: [
          "1. Identify coefficients: a = 2, b = -4, c = 5",
          "2. Δ = b² - 4ac = (-4)² - 4(2)(5)",
          "3. Δ = 16 - 40 = -24",
          "4. Since Δ < 0, the equation has two non-real (complex conjugate) roots."
        ],
        knowledgeGapCategory: "Discriminant & Nature of Roots",
        formulaUsed: "\\Delta = b^2 - 4ac"
      }
    ]
  },
  calculus: {
    topicName: "Differential Calculus & Cubic Functions",
    grade: "Grade 12 CAPS/IEB",
    icon: "TrendingUp",
    questions: [
      {
        id: "calc-f1",
        topicId: "calculus",
        topicName: "Differential Calculus",
        grade: "Grade 12",
        difficulty: "Foundation",
        questionText: "Differentiate f(x) = 4x³ - 5x² + 7x - 9 using rule of differentiation.",
        mathExpression: "\\frac{d}{dx}[x^n] = n x^{n-1}",
        options: [
          { id: "a", text: "f'(x) = 12x² - 10x + 7", isCorrect: true, explanation: "Multiply by power and reduce power by 1: 4(3)x² - 5(2)x + 7(1) - 0 = 12x² - 10x + 7." },
          { id: "b", text: "f'(x) = 12x³ - 10x² + 7x", isCorrect: false, explanation: "Powers were not reduced by 1 during differentiation." },
          { id: "c", text: "f'(x) = 4x² - 5x + 7", isCorrect: false, explanation: "Coefficients were not multiplied by original powers." },
          { id: "d", text: "f'(x) = 12x² - 10x", isCorrect: false, explanation: "Omitted derivative of linear term 7x." }
        ],
        hint: "Apply power rule d/dx[a x^n] = a · n · x^(n-1) to each term.",
        stepByStepSolution: [
          "1. d/dx [4x³] = 12x²",
          "2. d/dx [-5x²] = -10x",
          "3. d/dx [7x] = 7",
          "4. d/dx [-9] = 0",
          "5. Combine: f'(x) = 12x² - 10x + 7"
        ],
        knowledgeGapCategory: "Power Rule Differentiation",
        formulaUsed: "\\frac{d}{dx}[x^n] = n x^{n-1}"
      },
      {
        id: "calc-i1",
        topicId: "calculus",
        topicName: "Differential Calculus",
        grade: "Grade 12",
        difficulty: "Intermediate",
        questionText: "Find the x-coordinates of the stationary points of f(x) = x³ - 3x² - 9x + 5.",
        mathExpression: "f'(x) = 0",
        options: [
          { id: "a", text: "x = 3 and x = -1", isCorrect: true, explanation: "f'(x) = 3x² - 6x - 9 = 0 ⇒ 3(x² - 2x - 3) = 0 ⇒ 3(x-3)(x+1) = 0 ⇒ x = 3 or x = -1." },
          { id: "b", text: "x = -3 and x = 1", isCorrect: false, explanation: "Sign error during factorization of x² - 2x - 3." },
          { id: "c", text: "x = 1 and x = 3", isCorrect: false, explanation: "Incorrect factors used." },
          { id: "d", text: "x = 0 only", isCorrect: false, explanation: "Stationary points occur where derivative equals 0, not where x = 0." }
        ],
        hint: "Differentiate f(x) to get f'(x), set f'(x) = 0, and factorise the quadratic derivative.",
        stepByStepSolution: [
          "1. f'(x) = 3x² - 6x - 9",
          "2. Set f'(x) = 0: 3x² - 6x - 9 = 0",
          "3. Divide by 3: x² - 2x - 3 = 0",
          "4. Factorise: (x - 3)(x + 1) = 0",
          "5. Therefore, x = 3 or x = -1."
        ],
        knowledgeGapCategory: "Stationary Points & Quadratic Factorisation",
        formulaUsed: "f'(x) = 0 \\implies \\text{Stationary Points}"
      },
      {
        id: "calc-m1",
        topicId: "calculus",
        topicName: "Differential Calculus",
        grade: "Grade 12",
        difficulty: "Matric Mastery",
        questionText: "Find the derivative f'(x) from first principles if f(x) = 3x²",
        mathExpression: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        options: [
          { id: "a", text: "f'(x) = 3x", isCorrect: false, explanation: "Incorrect power reduction coefficient." },
          { id: "b", text: "f'(x) = 6x", isCorrect: true, explanation: "f(x+h) = 3(x+h)² = 3(x²+2xh+h²). Difference = 6xh + 3h². Divide by h: 6x + 3h. Limit as h→0 gives 6x." },
          { id: "c", text: "f'(x) = 6x + 3", isCorrect: false, explanation: "Did not evaluate limit as h → 0 for the term 3h." },
          { id: "d", text: "f'(x) = 6x²", isCorrect: false, explanation: "Incorrect power rule application." }
        ],
        hint: "Expand f(x+h) = 3(x+h)² completely, factor out h from the numerator, cancel with denominator h, and evaluate lim h→0.",
        stepByStepSolution: [
          "1. f(x+h) = 3(x+h)² = 3(x² + 2xh + h²) = 3x² + 6xh + 3h²",
          "2. f(x+h) - f(x) = (3x² + 6xh + 3h²) - 3x² = 6xh + 3h²",
          "3. [f(x+h) - f(x)] / h = h(6x + 3h) / h = 6x + 3h",
          "4. Take limit as h → 0: f'(x) = 6x + 3(0) = 6x."
        ],
        knowledgeGapCategory: "First Principles Limits Expansion",
        formulaUsed: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
      }
    ]
  },
  trigonometry: {
    topicName: "Trigonometry & Reduction Formulas",
    grade: "Grade 11-12 CAPS/IEB",
    icon: "Target",
    questions: [
      {
        id: "trig-f1",
        topicId: "trigonometry",
        topicName: "Trigonometry",
        grade: "Grade 10-11",
        difficulty: "Foundation",
        questionText: "Simplify using quotient identity: sin θ / cos θ",
        mathExpression: "\\frac{\\sin \\theta}{\\cos \\theta}",
        options: [
          { id: "a", text: "tan θ", isCorrect: true, explanation: "By identity, tan θ = sin θ / cos θ." },
          { id: "b", text: "cot θ", isCorrect: false, explanation: "cot θ is cos θ / sin θ." },
          { id: "c", text: "1", isCorrect: false, explanation: "sin²θ + cos²θ = 1, but sinθ/cosθ = tanθ." },
          { id: "d", text: "sec θ", isCorrect: false, explanation: "sec θ = 1 / cos θ." }
        ],
        hint: "Recall basic trigonometric quotient identity.",
        stepByStepSolution: [
          "1. Apply quotient identity: tan θ = sin θ / cos θ."
        ],
        knowledgeGapCategory: "Trigonometric Quotients",
        formulaUsed: "\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}"
      },
      {
        id: "trig-i1",
        topicId: "trigonometry",
        topicName: "Trigonometry",
        grade: "Grade 11",
        difficulty: "Intermediate",
        questionText: "Simplify completely: sin(180° - θ) · cos(90° + θ) / tan(180° + θ)",
        mathExpression: "\\frac{\\sin(180^\\circ - \\theta) \\cdot \\cos(90^\\circ + \\theta)}{\\tan(180^\\circ + \\theta)}",
        options: [
          { id: "a", text: "-sin²θ · cosθ", isCorrect: false, explanation: "Check reduction of cos(90°+θ) = -sinθ and tan(180°+θ) = tanθ = sinθ/cosθ." },
          { id: "b", text: "-sinθ · cosθ", isCorrect: true, explanation: "sin(180°-θ)=sinθ, cos(90°+θ)=-sinθ, tan(180°+θ)=tanθ. Expression becomes (sinθ·(-sinθ))/tanθ = -sin²θ / (sinθ/cosθ) = -sinθ·cosθ." },
          { id: "c", text: "cos²θ", isCorrect: false, explanation: "Missed the negative sign in Quadrant II co-function reduction." },
          { id: "d", text: "1", isCorrect: false, explanation: "Terms do not cancel out to 1." }
        ],
        hint: "Use CAST diagram: Quadrant II sin is +, cos(90°+θ) becomes -sinθ, Quadrant III tan is +.",
        stepByStepSolution: [
          "1. sin(180° - θ) = sinθ (Quadrant II)",
          "2. cos(90° + θ) = -sinθ (Co-function in Quadrant II)",
          "3. tan(180° + θ) = tanθ = sinθ / cosθ (Quadrant III)",
          "4. Numerator = sinθ × (-sinθ) = -sin²θ",
          "5. Expression = -sin²θ / (sinθ / cosθ) = -sin²θ × (cosθ / sinθ) = -sinθ cosθ"
        ],
        knowledgeGapCategory: "Co-functions & CAST Quadrant Reductions",
        formulaUsed: "\\cos(90^\\circ + \\theta) = -\\sin\\theta, \\quad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}"
      },
      {
        id: "trig-m1",
        topicId: "trigonometry",
        topicName: "Trigonometry",
        grade: "Grade 12",
        difficulty: "Matric Mastery",
        questionText: "Solve for θ ∈ [0°, 360°] if 2 cos² θ - cos θ - 1 = 0",
        mathExpression: "2 \\cos^2 \\theta - \\cos \\theta - 1 = 0",
        options: [
          { id: "a", text: "θ = 0°, 120°, 240°, 360°", isCorrect: true, explanation: "(2 cos θ + 1)(cos θ - 1) = 0 ⇒ cos θ = 1 (θ = 0°, 360°) or cos θ = -1/2 (θ = 120°, 240°)." },
          { id: "b", text: "θ = 60°, 300°", isCorrect: false, explanation: "θ = 60°, 300° corresponds to cos θ = +1/2, not -1/2." },
          { id: "c", text: "θ = 90°, 270°", isCorrect: false, explanation: "θ = 90°, 270° corresponds to cos θ = 0." },
          { id: "d", text: "θ = 180° only", isCorrect: false, explanation: "cos 180° = -1, which gives 2(-1)² - (-1) - 1 = 2 + 1 - 1 = 2 ≠ 0." }
        ],
        hint: "Let u = cos θ. Solve quadratic 2u² - u - 1 = 0 for u, then find reference angles in appropriate CAST quadrants.",
        stepByStepSolution: [
          "1. Factorise quadratic: (2 cos θ + 1)(cos θ - 1) = 0",
          "2. Case 1: cos θ = 1  ⇒  θ = 0° or θ = 360°",
          "3. Case 2: cos θ = -1/2 (Negative in Quad II and III)",
          "4. Ref angle = 60°. Quad II: 180° - 60° = 120°. Quad III: 180° + 60° = 240°.",
          "5. Combine: θ = 0°, 120°, 240°, 360°"
        ],
        knowledgeGapCategory: "Quadratic Trig Equations & CAST Quadrants",
        formulaUsed: "\\cos\\theta = k \\implies \\theta = 360^\\circ - \\theta_{\\text{ref}}"
      }
    ]
  },
  geometry: {
    topicName: "Euclidean & Analytical Geometry",
    grade: "Grade 11-12 CAPS/IEB",
    icon: "GraduationCap",
    questions: [
      {
        id: "geom-f1",
        topicId: "geometry",
        topicName: "Analytical Geometry",
        grade: "Grade 10",
        difficulty: "Foundation",
        questionText: "Calculate the distance between points A(1, 2) and B(4, 6).",
        mathExpression: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
        options: [
          { id: "a", text: "d = 5 units", isCorrect: true, explanation: "d = √((4-1)² + (6-2)²) = √(3² + 4²) = √(9 + 16) = √25 = 5 units." },
          { id: "b", text: "d = 7 units", isCorrect: false, explanation: "Added coordinates instead of taking distance formula square root." },
          { id: "c", text: "d = √7 units", isCorrect: false, explanation: "Arithmetic error in squaring coordinate differences." },
          { id: "d", text: "d = 25 units", isCorrect: false, explanation: "Forgot to take square root of 25." }
        ],
        hint: "Use distance formula d = √((x₂ - x₁)² + (y₂ - y₁)²).",
        stepByStepSolution: [
          "1. x₂ - x₁ = 4 - 1 = 3",
          "2. y₂ - y₁ = 6 - 2 = 4",
          "3. d = √(3² + 4²) = √(9 + 16) = √25 = 5 units"
        ],
        knowledgeGapCategory: "Distance Formula",
        formulaUsed: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}"
      },
      {
        id: "geom-i1",
        topicId: "geometry",
        topicName: "Analytical Geometry",
        grade: "Grade 11",
        difficulty: "Intermediate",
        questionText: "Find the gradient of a line perpendicular to y = -2x + 7.",
        mathExpression: "m_1 \\times m_2 = -1",
        options: [
          { id: "a", text: "m = 1/2", isCorrect: true, explanation: "For perpendicular lines m₁ × m₂ = -1. Since m₁ = -2, m₂ = -1 / (-2) = +1/2." },
          { id: "b", text: "m = -2", isCorrect: false, explanation: "This is the gradient of a parallel line, not perpendicular." },
          { id: "c", text: "m = 2", isCorrect: false, explanation: "Forgot to invert the fraction." },
          { id: "d", text: "m = -1/2", isCorrect: false, explanation: "Forgot to change the negative sign to positive." }
        ],
        hint: "Perpendicular gradients are negative reciprocals: m₂ = -1 / m₁.",
        stepByStepSolution: [
          "1. Original gradient m₁ = -2",
          "2. Perpendicular condition: m₁ × m₂ = -1",
          "3. m₂ = -1 / (-2) = 1/2"
        ],
        knowledgeGapCategory: "Perpendicular Line Gradients",
        formulaUsed: "m_1 \\cdot m_2 = -1 \\implies m_2 = -\\frac{1}{m_1}"
      },
      {
        id: "geom-m1",
        topicId: "geometry",
        topicName: "Analytical Geometry",
        grade: "Grade 12",
        difficulty: "Matric Mastery",
        questionText: "Find the equation of a circle centered at (2, -3) passing through the point (5, 1).",
        mathExpression: "(x - a)^2 + (y - b)^2 = r^2",
        options: [
          { id: "a", text: "(x - 2)² + (y + 3)² = 25", isCorrect: true, explanation: "r² = (5-2)² + (1-(-3))² = 3² + 4² = 25. Standard circle equation: (x-2)² + (y+3)² = 25." },
          { id: "b", text: "(x + 2)² + (y - 3)² = 25", isCorrect: false, explanation: "Reversed the signs of the center coordinates (a, b)." },
          { id: "c", text: "(x - 2)² + (y + 3)² = 5", isCorrect: false, explanation: "Forgot that the right hand side must be r², not r." },
          { id: "d", text: "(x - 5)² + (y - 1)² = 25", isCorrect: false, explanation: "Used the passing point instead of center coordinates." }
        ],
        hint: "Calculate radius squared r² using distance formula r² = (x₂-x₁)² + (y₂-y₁)², then plug into (x-a)² + (y-b)² = r².",
        stepByStepSolution: [
          "1. Center (a, b) = (2, -3)",
          "2. Radius squared r² = (5 - 2)² + (1 - (-3))² = 3² + 4² = 9 + 16 = 25",
          "3. Substitute into formula: (x - 2)² + (y - (-3))² = 25",
          "4. Simplify: (x - 2)² + (y + 3)² = 25"
        ],
        knowledgeGapCategory: "Circle Center Coordinates & Radius Squared",
        formulaUsed: "(x - a)^2 + (y - b)^2 = r^2"
      }
    ]
  },
  sequences: {
    topicName: "Sequences, Series & Financial Math",
    grade: "Grade 12 CAPS/IEB",
    icon: "FileText",
    questions: [
      {
        id: "seq-f1",
        topicId: "sequences",
        topicName: "Sequences & Series",
        grade: "Grade 10-11",
        difficulty: "Foundation",
        questionText: "Find the 10th term T₁₀ of the arithmetic sequence: 3, 7, 11, 15, ...",
        mathExpression: "T_n = a + (n - 1)d",
        options: [
          { id: "a", text: "T₁₀ = 39", isCorrect: true, explanation: "First term a = 3, common difference d = 7 - 3 = 4. T₁₀ = 3 + (10 - 1)(4) = 3 + 36 = 39." },
          { id: "b", text: "T₁₀ = 43", isCorrect: false, explanation: "Used n instead of (n - 1)." },
          { id: "c", text: "T₁₀ = 40", isCorrect: false, explanation: "Arithmetic mistake in multiplication 9 × 4." },
          { id: "d", text: "T₁₀ = 35", isCorrect: false, explanation: "Subtracted first term instead of adding." }
        ],
        hint: "Use arithmetic term formula T_n = a + (n - 1)d with a = 3 and d = 4.",
        stepByStepSolution: [
          "1. First term a = 3",
          "2. Common difference d = 7 - 3 = 4",
          "3. T₁₀ = 3 + (10 - 1)(4) = 3 + (9)(4) = 3 + 36 = 39"
        ],
        knowledgeGapCategory: "Arithmetic Term Formula",
        formulaUsed: "T_n = a + (n - 1)d"
      },
      {
        id: "seq-i1",
        topicId: "sequences",
        topicName: "Sequences & Series",
        grade: "Grade 12",
        difficulty: "Intermediate",
        questionText: "Calculate the sum to infinity for the geometric series: 12 + 4 + 4/3 + 4/9 + ...",
        mathExpression: "S_\\infty = \\frac{a}{1 - r}",
        options: [
          { id: "a", text: "S_∞ = 18", isCorrect: true, explanation: "First term a = 12, common ratio r = 4/12 = 1/3. S_∞ = 12 / (1 - 1/3) = 12 / (2/3) = 18." },
          { id: "b", text: "S_∞ = 16", isCorrect: false, explanation: "Fraction arithmetic mistake when dividing by 2/3." },
          { id: "c", text: "S_∞ = 24", isCorrect: false, explanation: "Used r = 1/2 instead of 1/3." },
          { id: "d", text: "Does not converge", isCorrect: false, explanation: "Since |r| = 1/3 < 1, the series converges." }
        ],
        hint: "Identify first term 'a' and common ratio 'r = T₂ / T₁'. Ensure |r| < 1.",
        stepByStepSolution: [
          "1. First term a = 12",
          "2. Common ratio r = T₂ / T₁ = 4 / 12 = 1/3",
          "3. Check convergence: |1/3| < 1 (Converges)",
          "4. Apply formula: S_∞ = a / (1 - r) = 12 / (1 - 1/3) = 12 / (2/3)",
          "5. Simplify: 12 × 3/2 = 18"
        ],
        knowledgeGapCategory: "Geometric Infinite Convergent Sums",
        formulaUsed: "S_\\infty = \\frac{a}{1 - r} \\quad (|r| < 1)"
      },
      {
        id: "seq-m1",
        topicId: "sequences",
        topicName: "Sequences & Series",
        grade: "Grade 12",
        difficulty: "Matric Mastery",
        questionText: "For what values of x does the geometric series (x - 2) + (x - 2)² + (x - 2)³ + ... converge?",
        mathExpression: "|r| < 1",
        options: [
          { id: "a", text: "1 < x < 3", isCorrect: true, explanation: "Common ratio r = x - 2. Convergence condition |r| < 1 ⇒ |-1 < x - 2 < 1| ⇒ 1 < x < 3." },
          { id: "b", text: "x < 3", isCorrect: false, explanation: "Omitted the lower bound for convergence x > 1." },
          { id: "c", text: "-1 < x < 1", isCorrect: false, explanation: "Forgot to shift by +2 for x - 2." },
          { id: "d", text: "0 < x < 2", isCorrect: false, explanation: "Shifted incorrectly." }
        ],
        hint: "The common ratio is r = x - 2. Apply convergence inequality -1 < r < 1 and solve for x.",
        stepByStepSolution: [
          "1. Common ratio r = T₂ / T₁ = (x - 2)² / (x - 2) = x - 2",
          "2. Series converges if |r| < 1",
          "3. -1 < x - 2 < 1",
          "4. Add 2 to all sides: -1 + 2 < x < 1 + 2  ⇒  1 < x < 3"
        ],
        knowledgeGapCategory: "Convergence Intervals for Geometric Series",
        formulaUsed: "|r| < 1 \\implies -1 < r < 1"
      }
    ]
  }
};

export const SubjectQuizMode: React.FC<SubjectQuizModeProps> = ({ user, initialTopic, initialSubTab = "quiz" }) => {
  const userId = user?.id || "usr-student";

  // Navigation SubTab State
  const [activeSubTab, setActiveSubTab] = useState<"quiz" | "error_trend">(initialSubTab);

  // State Management
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || "algebra");
  const [customTopicInput, setCustomTopicInput] = useState<string>("");
  const [useCustomTopic, setUseCustomTopic] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("Grade 12 CAPS / IEB");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Foundation" | "Intermediate" | "Matric Mastery">("Intermediate");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timerMode, setTimerMode] = useState<boolean>(true);
  const [audioResponseEnabled, setAudioResponseEnabled] = useState<boolean>(true);

  // AI Generation States
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [aiQuizSource, setAiQuizSource] = useState<string | null>(null);

  // Active Quiz States
  const [quizState, setQuizState] = useState<"SELECT" | "IN_PROGRESS" | "RESULT">("SELECT");
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [showHint, setShowHint] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [pastAttempts, setPastAttempts] = useState<QuizAttemptResult[]>([]);

  // Load past quiz attempts
  useEffect(() => {
    const history = getFromDB<QuizAttemptResult>("amh_subject_quiz_history");
    setPastAttempts(history.filter(item => item.userId === userId));
  }, [userId]);

  // Timer loop when quiz is active
  useEffect(() => {
    let interval: any = null;
    if (quizState === "IN_PROGRESS") {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [quizState]);

  // Start AI Generated Quiz via Gemini API
  const handleGenerateAIQuiz = async () => {
    setIsGeneratingAI(true);
    setAiErrorMsg(null);
    const activeTopicName = useCustomTopic && customTopicInput.trim() 
      ? customTopicInput.trim() 
      : (SUBJECT_QUIZ_DATABASE[selectedTopic]?.topicName || "Algebra, Equations & Surds");

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeTopicName,
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          questionCount
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setCurrentQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowHint(false);
        setElapsedSeconds(0);
        setAiQuizSource(data.source || "gemini");
        setQuizState("IN_PROGRESS");
      } else {
        throw new Error("Invalid response format from quiz generator.");
      }
    } catch (err: any) {
      console.error("Failed to generate AI quiz:", err);
      setAiErrorMsg("Notice: Using CAPS standard database fallback.");
      handleStartQuiz();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Start static preset quiz handler
  const handleStartQuiz = () => {
    setAiQuizSource("preset");
    const topicData = SUBJECT_QUIZ_DATABASE[selectedTopic];
    if (!topicData || topicData.questions.length === 0) return;

    // Filter questions by difficulty level
    let filtered = topicData.questions.filter(q => q.difficulty === selectedDifficulty);
    
    // Fallback to all questions if specific difficulty tier has fewer than required questions
    if (filtered.length === 0) {
      filtered = topicData.questions;
    }

    // Pick questions up to questionCount
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    setCurrentQuestions(selected);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowHint(false);
    setElapsedSeconds(0);
    setQuizState("IN_PROGRESS");
  };

  // Option select handler
  const handleOptionSelect = (optionId: string) => {
    const currentQ = currentQuestions[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  // Submit quiz and calculate instant score assessment
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    const knowledgeGapsSet = new Set<string>();

    const questionResults = currentQuestions.map(q => {
      const selectedOptionId = userAnswers[q.id] || "";
      const correctOpt = q.options.find(o => o.isCorrect);
      const isCorrect = selectedOptionId === correctOpt?.id;

      if (isCorrect) {
        correctCount++;
      } else {
        knowledgeGapsSet.add(q.knowledgeGapCategory);
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        selectedOptionId,
        isCorrect,
        correctOptionId: correctOpt?.id || "",
        gapCategory: q.knowledgeGapCategory
      };
    });

    const total = currentQuestions.length;
    const scorePercentage = Math.round((correctCount / total) * 100);

    // Determine CAPS NSC Rating Code
    let nscCode = "Code 1 (0-29% - Not Achieved)";
    if (scorePercentage >= 80) nscCode = "Code 7 (80-100% - Outstanding Distinction)";
    else if (scorePercentage >= 70) nscCode = "Code 6 (70-79% - Meritorious)";
    else if (scorePercentage >= 60) nscCode = "Code 5 (60-69% - Substantial)";
    else if (scorePercentage >= 50) nscCode = "Code 4 (50-59% - Moderate Pass)";
    else if (scorePercentage >= 40) nscCode = "Code 3 (40-49% - Elementary)";
    else if (scorePercentage >= 30) nscCode = "Code 2 (30-39% - Elementary Pass)";

    const attemptResult: QuizAttemptResult = {
      id: `quiz-attempt-${Date.now()}`,
      userId,
      topicId: selectedTopic,
      topicName: SUBJECT_QUIZ_DATABASE[selectedTopic]?.topicName || "Mathematics",
      grade: selectedGrade,
      difficulty: selectedDifficulty,
      totalQuestions: total,
      correctAnswers: correctCount,
      scorePercentage,
      nscCode,
      timeSpentSeconds: elapsedSeconds,
      completedAt: new Date().toISOString(),
      knowledgeGaps: Array.from(knowledgeGapsSet),
      questionResults
    };

    // Save to local storage
    const existing = getFromDB<QuizAttemptResult>("amh_subject_quiz_history");
    const updated = [attemptResult, ...existing];
    saveToDB("amh_subject_quiz_history", updated);
    setPastAttempts(updated.filter(item => item.userId === userId));

    // Trigger Toast Alert for Academic Milestone / Distinction
    triggerDistinctionToast(
      scorePercentage,
      SUBJECT_QUIZ_DATABASE[selectedTopic]?.topicName || "Mathematics",
      selectedDifficulty
    );

    setQuizState("RESULT");
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="w-full max-w-6xl mx-auto py-4 space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-navy-900 via-royal-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 border border-navy-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30 uppercase tracking-widest flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-gold-400" />
                CAPS & IEB Instant Quiz Assessment
              </span>
              <span className="text-[10px] font-mono text-navy-300">
                Grade 10 - 12 Mathematics
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Subject Practice & Knowledge Gap Diagnostics
            </h1>
            <p className="text-xs text-navy-200 mt-1.5 max-w-2xl leading-relaxed">
              Test your proficiency across core matric math topics with instant automatic scoring, step-by-step CAPS solutions, and diagnostic feedback on specific knowledge gaps.
            </p>
          </div>

          {quizState !== "SELECT" && activeSubTab === "quiz" && (
            <button
              onClick={() => setQuizState("SELECT")}
              className="px-4 py-2.5 bg-navy-800 hover:bg-navy-750 text-navy-200 hover:text-white font-mono text-xs font-bold rounded-xl border border-navy-700 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Subject / Config</span>
            </button>
          )}
        </div>

        {/* SUB-TAB NAV BUTTONS */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-navy-800/80 font-mono text-xs font-bold relative z-10">
          <button
            onClick={() => setActiveSubTab("quiz")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "quiz"
                ? "bg-amber-500 text-navy-950 font-black shadow-md"
                : "bg-navy-800/80 text-navy-200 hover:bg-navy-750 border border-navy-700"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Interactive Quiz Assessment</span>
          </button>

          <button
            onClick={() => setActiveSubTab("error_trend")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "error_trend"
                ? "bg-amber-500 text-navy-950 font-black shadow-md"
                : "bg-navy-800/80 text-navy-200 hover:bg-navy-750 border border-navy-700"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Error Trend Analysis & Targeted Practice</span>
          </button>
        </div>
      </div>

      {/* RENDER ERROR TREND ANALYSIS SUB-TAB */}
      {activeSubTab === "error_trend" ? (
        <ErrorTrendAnalysis
          user={user}
          onNavigateQuizTopic={(tId) => {
            setSelectedTopic(tId);
            setActiveSubTab("quiz");
            setQuizState("SELECT");
          }}
        />
      ) : (
        <>
          {/* QUIZ CONFIG & SELECTION SCREEN */}
      {quizState === "SELECT" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* TOPICS SELECTION CARDS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-extrabold font-display text-navy-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Select Mathematics Topic
                </h2>

                <button
                  type="button"
                  onClick={() => setUseCustomTopic(!useCustomTopic)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    useCustomTopic 
                      ? "bg-gold-500/15 border-gold-400 text-gold-400 dark:text-gold-300"
                      : "bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:text-navy-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>{useCustomTopic ? "Using Custom AI Topic" : "Enter Custom Topic"}</span>
                </button>
              </div>

              {/* CUSTOM TOPIC INPUT */}
              {useCustomTopic ? (
                <div className="p-4 bg-gradient-to-r from-royal-900/10 via-navy-900/20 to-royal-900/10 border border-gold-400/30 rounded-2xl space-y-2 mb-4">
                  <label className="block text-xs font-mono font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Specify Any CAPS / IEB Topic for AI Generation:
                  </label>
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    placeholder="e.g. Calculus Optimization, Trigonometric Reduction, Financial Annuities, Circle Geometry..."
                    className="w-full px-4 py-3 rounded-xl border border-navy-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-mono font-bold text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                  <p className="text-[10px] text-navy-400 font-mono">
                    Gemini AI will craft customized questions tailored specifically to this topic!
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SUBJECT_QUIZ_DATABASE).map(([key, topic]) => {
                  const isSelected = !useCustomTopic && selectedTopic === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setUseCustomTopic(false);
                        setSelectedTopic(key);
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-royal-50 dark:bg-navy-850 border-royal-500 dark:border-gold-400 ring-2 ring-royal-500/20 dark:ring-gold-400/20 shadow-md"
                          : "bg-navy-50/50 dark:bg-navy-950/40 border-navy-200 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-royal-600 dark:text-gold-400 px-2 py-0.5 rounded bg-royal-100 dark:bg-navy-800">
                            {topic.grade}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                          )}
                        </div>

                        <h3 className="text-sm font-black font-display text-navy-900 dark:text-white mt-1">
                          {topic.topicName}
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-navy-300 mt-1">
                          {topic.questions.length} Exam-standard practice questions
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-navy-150 dark:border-navy-800/80 flex items-center justify-between text-[11px] font-mono text-navy-600 dark:text-navy-400">
                        <span>CAPS Paper 1 & 2</span>
                        <span className="font-bold text-royal-600 dark:text-gold-400 flex items-center gap-1">
                          Instant Score <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUIZ SETTINGS & DIFFICULTY */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-base font-extrabold font-display text-navy-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                Assessment Configuration
              </h2>

              {/* DIFFICULTY LEVEL SELECTOR */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300">
                  Question Difficulty Level (CAPS Cognitive Taxonomy)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "Foundation",
                      label: "Foundation",
                      subtext: "Level 1-2: Core Knowledge & Concepts",
                      badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20",
                      badgeTag: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                    },
                    {
                      id: "Intermediate",
                      label: "Intermediate",
                      subtext: "Level 3: Routine Procedures & Application",
                      badgeBg: "bg-royal-50 dark:bg-navy-850 border-royal-500 dark:border-gold-400 text-royal-900 dark:text-gold-300 ring-2 ring-royal-500/20",
                      badgeTag: "bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400"
                    },
                    {
                      id: "Matric Mastery",
                      label: "Matric Mastery",
                      subtext: "Level 4: Exam Standard & Complex Problem Solving",
                      badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20",
                      badgeTag: "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                    }
                  ].map((level) => {
                    const isSelected = selectedDifficulty === level.id;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setSelectedDifficulty(level.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? `${level.badgeBg} shadow-sm`
                            : "bg-navy-50/50 dark:bg-navy-950/40 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-royal-300 dark:hover:border-navy-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black font-display flex items-center gap-1.5">
                              {level.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-gold-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-tight">
                            {level.subtext}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300 mb-2">
                    Target Grade / Syllabus
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-750 bg-white dark:bg-navy-800 text-xs text-navy-900 dark:text-white focus:ring-2 focus:ring-royal-500 font-mono font-bold"
                  >
                    <option value="Grade 12 CAPS / IEB">Grade 12 CAPS / IEB</option>
                    <option value="Grade 11 CAPS">Grade 11 CAPS</option>
                    <option value="Grade 10 CAPS">Grade 10 CAPS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300 mb-2">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-navy-100 dark:bg-navy-800 rounded-xl">
                    {[3, 5, 10].map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          questionCount === count
                            ? "bg-royal-600 text-white dark:bg-gold-500 dark:text-navy-950 shadow"
                            : "text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white"
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300 mb-2">
                    Timer Mode
                  </label>
                  <button
                    type="button"
                    onClick={() => setTimerMode(!timerMode)}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                      timerMode
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-navy-50 dark:bg-navy-800 border-navy-200 dark:border-navy-750 text-navy-600 dark:text-navy-400"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {timerMode ? "Timed Simulator" : "Untimed Mode"}
                    </span>
                    <span className="text-[10px] uppercase">{timerMode ? "ON" : "OFF"}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300 mb-2">
                    Synthetic Voice AI Feedback
                  </label>
                  <button
                    type="button"
                    id="btn-toggle-audio-response"
                    onClick={() => setAudioResponseEnabled(!audioResponseEnabled)}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                      audioResponseEnabled
                        ? "bg-royal-50 dark:bg-navy-800 border-royal-300 dark:border-gold-500/50 text-royal-700 dark:text-gold-400"
                        : "bg-navy-50 dark:bg-navy-800 border-navy-200 dark:border-navy-750 text-navy-600 dark:text-navy-400"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {audioResponseEnabled ? <Volume2 className="w-4 h-4 text-gold-500" /> : <VolumeX className="w-4 h-4 text-navy-400" />}
                      {audioResponseEnabled ? "Audio Response ON" : "Audio Response OFF"}
                    </span>
                    <span className="text-[10px] uppercase font-black">{audioResponseEnabled ? "ACTIVE" : "OFF"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 space-y-3">
                {aiErrorMsg && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{aiErrorMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateAIQuiz}
                  disabled={isGeneratingAI}
                  className="w-full py-4 bg-gradient-to-r from-royal-600 via-royal-700 to-navy-900 dark:from-gold-500 dark:to-amber-500 text-white dark:text-navy-950 font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                  id="btn-generate-ai-quiz"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Generating CAPS Quiz with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-gold-300 dark:text-navy-950 fill-current" />
                      <span>Generate Practice Quiz (Gemini AI)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStartQuiz}
                  disabled={isGeneratingAI}
                  className="w-full py-2.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-200 font-mono text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-start-preset-quiz"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Or Start Preset Database Quiz ({selectedDifficulty})</span>
                </button>
              </div>
            </div>
          </div>

          {/* PAST QUIZ HISTORY & PERFORMANCE DIAGNOSTICS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold font-display text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                Recent Diagnostic Logs
              </h2>

              {pastAttempts.length === 0 ? (
                <div className="p-6 text-center bg-navy-50 dark:bg-navy-850/50 rounded-2xl border border-dashed border-navy-200 dark:border-navy-800">
                  <GraduationCap className="w-8 h-8 text-navy-400 mx-auto mb-2" />
                  <p className="text-xs font-mono font-bold text-navy-600 dark:text-navy-300">
                    No completed quizzes yet
                  </p>
                  <p className="text-[11px] text-navy-400 mt-1">
                    Take your first topic quiz to generate an automated knowledge gap breakdown!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {pastAttempts.slice(0, 5).map(attempt => (
                    <div
                      key={attempt.id}
                      className="p-3.5 rounded-2xl border border-navy-150 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-850/60 font-mono text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900 dark:text-white">
                          {attempt.topicName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          attempt.scorePercentage >= 70
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}>
                          {attempt.scorePercentage}% Score
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-navy-500 dark:text-navy-400">
                        <span className="px-2 py-0.5 rounded bg-navy-200/60 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-[10px] font-bold">
                          {attempt.difficulty || "Intermediate"}
                        </span>
                        <span>{attempt.correctAnswers}/{attempt.totalQuestions} Correct</span>
                        <span>{Math.round(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s</span>
                      </div>

                      {attempt.knowledgeGaps.length > 0 && (
                        <div className="pt-1.5 border-t border-navy-200 dark:border-navy-800">
                          <span className="text-[9px] font-bold uppercase text-rose-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Knowledge Gap Identified:
                          </span>
                          <span className="text-[10px] text-navy-600 dark:text-navy-300 block truncate">
                            {attempt.knowledgeGaps.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* IN PROGRESS QUIZ SCREEN */}
      {quizState === "IN_PROGRESS" && currentQuestion && (
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          
          {/* QUIZ STATUS BAR */}
          <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 font-bold">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </span>
              <span className={`px-2.5 py-1 rounded-xl font-extrabold text-[10px] ${
                selectedDifficulty === "Foundation"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : selectedDifficulty === "Intermediate"
                  ? "bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 border border-royal-300 dark:border-navy-700"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              }`}>
                {selectedDifficulty} Level
              </span>
              <span className="text-navy-500 dark:text-navy-400 hidden sm:inline">
                {SUBJECT_QUIZ_DATABASE[selectedTopic]?.topicName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {timerMode && (
                <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4 animate-spin" />
                  {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                </span>
              )}

              <button
                onClick={() => setShowHint(!showHint)}
                className="px-3 py-1 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? "Hide Hint" : "Hint"}</span>
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-2 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-royal-600 dark:bg-gold-400 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>

          {/* QUESTION PROMPT */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2.5 rounded-2xl bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 font-mono font-black shrink-0">
                Q{currentQuestionIndex + 1}
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-navy-900 dark:text-white leading-snug">
                  {currentQuestion.questionText}
                </h3>
                {currentQuestion.mathExpression && (
                  <div className="mt-3 p-3.5 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 font-mono text-sm text-royal-700 dark:text-gold-300 font-bold">
                    {currentQuestion.mathExpression}
                  </div>
                )}
              </div>
            </div>

            {/* HINT EXPANDABLE BOX */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-mono space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <Lightbulb className="w-4 h-4" /> CAPS Tutor Hint:
                    </span>
                    <AudioFeedbackPlayer
                      textToSpeak={`Hint for question ${currentQuestionIndex + 1}: ${currentQuestion.hint}`}
                      compact={true}
                    />
                  </div>
                  <p>{currentQuestion.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MULTIPLE CHOICE OPTIONS */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = userAnswers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-royal-50 dark:bg-navy-850 border-royal-600 dark:border-gold-400 ring-2 ring-royal-500/20 dark:ring-gold-400/20 shadow-sm"
                        : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 uppercase ${
                        isSelected
                          ? "bg-royal-600 text-white dark:bg-gold-400 dark:text-navy-950"
                          : "bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300"
                      }`}>
                        {opt.id}
                      </span>
                      <span className="text-sm font-semibold text-navy-900 dark:text-navy-100">
                        {opt.text}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-royal-600 dark:border-gold-400 bg-royal-600 dark:bg-gold-400 text-white dark:text-navy-950"
                        : "border-navy-300 dark:border-navy-700"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUIZ NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-4 border-t border-navy-150 dark:border-navy-800">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-750 text-xs font-mono font-bold text-navy-700 dark:text-navy-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-50 dark:hover:bg-navy-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex < currentQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-5 py-2.5 bg-royal-600 dark:bg-gold-400 text-white dark:text-navy-950 font-mono text-xs font-bold rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={answeredCount === 0}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono text-xs font-black rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                id="btn-submit-subject-quiz"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit & View Diagnostic Score</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUIZ RESULT & KNOWLEDGE GAP ASSESSMENT SCREEN */}
      {quizState === "RESULT" && pastAttempts.length > 0 && (
        <div className="space-y-6">
          
          {/* SCORE ASSESSMENT OVERVIEW CARD */}
          <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-900 border-2 border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="text-center md:text-left space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30 uppercase tracking-widest inline-block">
                  Assessment Complete
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                  {pastAttempts[0].topicName}
                </h2>
                <p className="text-xs text-navy-200 font-mono">
                  Difficulty: <span className="font-bold text-gold-300">{pastAttempts[0].difficulty || "Intermediate"}</span> | Syllabus Level: {pastAttempts[0].grade} | Time Spent: {Math.floor(pastAttempts[0].timeSpentSeconds / 60)}m {pastAttempts[0].timeSpentSeconds % 60}s
                </p>
              </div>

              {/* SCORE BADGE CIRCLE */}
              <div className="flex flex-col items-center justify-center p-6 bg-navy-850/90 rounded-3xl border border-navy-700 shadow-2xl shrink-0">
                <div className="text-4xl font-black font-mono text-gold-400">
                  {pastAttempts[0].scorePercentage}%
                </div>
                <div className="text-xs font-mono font-bold text-navy-200 mt-1">
                  {pastAttempts[0].correctAnswers} / {pastAttempts[0].totalQuestions} Correct
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  {pastAttempts[0].nscCode}
                </div>
              </div>

            </div>

            {/* KNOWLEDGE GAPS IDENTIFIED SUMMARY */}
            {pastAttempts[0].knowledgeGaps.length > 0 ? (
              <div className="mt-6 pt-5 border-t border-navy-800 bg-rose-950/30 p-4 rounded-2xl border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Identified Knowledge Gaps to Review:
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pastAttempts[0].knowledgeGaps.map((gap, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-500/40 text-xs font-mono font-bold"
                    >
                      • {gap}
                    </span>
                  ))}
                </div>

                {audioResponseEnabled && (
                  <AudioFeedbackPlayer
                    textToSpeak={`Quiz assessment complete for ${pastAttempts[0].topicName}. You scored ${pastAttempts[0].scorePercentage} percent. Identified knowledge gaps: ${pastAttempts[0].knowledgeGaps.join(", ")}.`}
                    label="Overall Assessment Voice Feedback"
                    autoPlay={true}
                  />
                )}
              </div>
            ) : (
              <div className="mt-6 pt-5 border-t border-navy-800 bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xs font-mono font-bold text-emerald-300">
                    Outstanding Mastery! No Knowledge Gaps Detected.
                  </h3>
                  <p className="text-[11px] text-navy-300 font-mono mt-0.5">
                    You answered all questions correctly in this assessment session.
                  </p>
                </div>
                {audioResponseEnabled && (
                  <AudioFeedbackPlayer
                    textToSpeak={`Outstanding mastery! You scored ${pastAttempts[0].scorePercentage} percent with zero knowledge gaps in ${pastAttempts[0].topicName}.`}
                    compact={true}
                    autoPlay={true}
                  />
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStartQuiz}
                className="px-5 py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs font-mono rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={() => setQuizState("SELECT")}
                className="px-5 py-3 bg-navy-800 hover:bg-navy-750 text-white font-mono text-xs font-bold rounded-2xl border border-navy-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Try Another Topic</span>
              </button>
            </div>
          </div>

          {/* DETAILED QUESTION-BY-QUESTION SOLUTIONS & EXPLANATIONS */}
          <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold font-display text-navy-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Detailed Solutions & Incorrect Answer Explanations
            </h3>

            <div className="space-y-6">
              {currentQuestions.map((q, idx) => {
                const userSelectedOptId = userAnswers[q.id];
                const correctOpt = q.options.find(o => o.isCorrect);
                const isCorrect = userSelectedOptId === correctOpt?.id;
                const incorrectExplanation = q.options.find(o => o.id === userSelectedOptId)?.explanation;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border ${
                      isCorrect
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                          isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                        }`}>
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                          {q.questionText}
                        </h4>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
                      }`}>
                        {isCorrect ? "Correct" : "Knowledge Gap"}
                      </span>
                    </div>

                    {/* STEP BY STEP WORKED CAPS SOLUTION */}
                    <div className="mt-3 p-4 bg-white dark:bg-navy-950 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-royal-600 dark:text-gold-400 block uppercase">
                          Step-by-Step Worked Solution:
                        </span>
                        <AudioFeedbackPlayer
                          textToSpeak={`Question ${idx + 1} Worked Solution. ${q.stepByStepSolution.join(". ")}`}
                          label="Listen to Solution"
                          compact={true}
                        />
                      </div>
                      {q.stepByStepSolution.map((step, sIdx) => (
                        <div key={sIdx} className="text-navy-700 dark:text-navy-300">
                          {step}
                        </div>
                      ))}
                    </div>

                    {/* EXPLANATION IF INCORRECT */}
                    {!isCorrect && (
                      <div className="mt-3 p-3.5 bg-rose-100/60 dark:bg-rose-900/30 rounded-xl text-xs font-mono text-rose-900 dark:text-rose-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-700 dark:text-rose-400">
                            Why your selected answer was incorrect:
                          </span>
                        </div>
                        <p className="mt-0.5">
                          {incorrectExplanation || "Selected option was incorrect."}
                        </p>
                        
                        <AudioFeedbackPlayer
                          textToSpeak={`Math Error Breakdown for Question ${idx + 1}. Question: ${q.questionText}. Why your selected option was incorrect: ${incorrectExplanation || "Selected option was incorrect."} Correct answer solution: ${q.stepByStepSolution.join(". ")}`}
                          label="Synthetic Voice Error Analysis"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
        </>
      )}

    </div>
  );
};
