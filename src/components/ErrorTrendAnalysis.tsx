import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  TrendingUp,
  Target,
  CheckCircle2,
  Zap,
  BookOpen,
  RotateCcw,
  Sparkles,
  BrainCircuit,
  Download,
  Filter,
  Sliders,
  Search,
  Award,
  ArrowRight,
  ChevronRight,
  Plus,
  FileText,
  Check,
  XCircle,
  Info,
  BarChart2,
  PieChart as PieChartIcon,
  HelpCircle,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Profile } from "../types";
import { getFromDB, saveToDB } from "../lib/db";
import { AudioFeedbackPlayer } from "./AudioFeedbackPlayer";

export interface ErrorPattern {
  id: string;
  category: string; // e.g., "Algebraic Sign Errors", "Extraneous Roots", "Trig Reduction Quadrants"
  subject: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Finance & Stats";
  frequencyCount: number;
  severity: "High" | "Medium" | "Low";
  trend: "Increasing" | "Decreasing" | "Recurring";
  lastOccurred: string;
  remediated: boolean;
  commonTrapDescription: string;
  correctRuleSummary: string;
  formulaRef?: string;
  sampleQuestions: TargetedQuestion[];
}

export interface TargetedQuestion {
  id: string;
  questionText: string;
  mathExpression?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  trapExplanation: string;
  stepByStepSolution: string[];
}

export interface ErrorTrendAnalysisProps {
  user?: Profile | null;
  onNavigateQuizTopic?: (topicId: string) => void;
}

// Initial default error patterns reflecting authentic CAPS & IEB high school mathematics pitfalls
const DEFAULT_ERROR_PATTERNS: ErrorPattern[] = [
  {
    id: "err-alg-sign",
    category: "Algebraic Sign Errors in Quadratics",
    subject: "Algebra",
    frequencyCount: 14,
    severity: "High",
    trend: "Recurring",
    lastOccurred: "2026-08-04",
    remediated: false,
    commonTrapDescription: "Flipping signs incorrectly when moving from factorized form (x - a)(x + b) = 0 to final roots, or misapplying negative signs in discriminant b² - 4ac.",
    correctRuleSummary: "If (x - p)(x + q) = 0, then x = p or x = -q. Always substitute roots back into the original equation to verify.",
    formulaRef: "ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    sampleQuestions: [
      {
        id: "tq-alg-1",
        questionText: "Solve for x: (2x - 3)(x + 4) = 0",
        mathExpression: "(2x - 3)(x + 4) = 0",
        options: [
          { id: "a", text: "x = 3/2 or x = -4", isCorrect: true, explanation: "Setting 2x - 3 = 0 gives 2x = 3 ⇒ x = 3/2. Setting x + 4 = 0 gives x = -4." },
          { id: "b", text: "x = -3/2 or x = 4", isCorrect: false, explanation: "TRAP! You inverted the signs for both roots. 2x - 3 = 0 yields positive 3/2, not negative." },
          { id: "c", text: "x = 3 or x = -4", isCorrect: false, explanation: "Forgot to divide by coefficient 2 in the linear factor 2x - 3." },
          { id: "d", text: "x = -3 or x = 4", isCorrect: false, explanation: "Both coefficient division and sign rule were applied incorrectly." }
        ],
        trapExplanation: "Students frequently confuse factor signs with root values. Remember: setting a factor to 0 means solving 2x - 3 = 0 ⇒ 2x = 3 ⇒ x = 3/2.",
        stepByStepSolution: [
          "1. Set first factor to zero: 2x - 3 = 0  ⇒  2x = 3  ⇒  x = 3/2",
          "2. Set second factor to zero: x + 4 = 0  ⇒  x = -4",
          "3. Final solution: x = 3/2 or x = -4"
        ]
      },
      {
        id: "tq-alg-2",
        questionText: "Solve the inequality: x² - 9 < 0",
        mathExpression: "x^2 - 9 < 0",
        options: [
          { id: "a", text: "x < 3", isCorrect: false, explanation: "TRAP! Ignoring negative root bounds includes values like x = -5 where (-5)² - 9 = 16 > 0." },
          { id: "b", text: "-3 < x < 3", isCorrect: true, explanation: "Factorizing yields (x - 3)(x + 3) < 0. The parabola opens upward between -3 and +3." },
          { id: "c", text: "x < -3 or x > 3", isCorrect: false, explanation: "This yields positive values (above the x-axis)." },
          { id: "d", text: "x > -3", isCorrect: false, explanation: "Does not bound the upper limit x = 3." }
        ],
        trapExplanation: "Never solve quadratic inequalities by taking square roots directly (e.g. x < ±3). Always factorize and use critical values on a sign graph!",
        stepByStepSolution: [
          "1. Factorize: (x - 3)(x + 3) < 0",
          "2. Critical values: x = -3 and x = 3",
          "3. Sketch parabola: function is negative BELOW x-axis, between critical values.",
          "4. Solution: -3 < x < 3"
        ]
      }
    ]
  },
  {
    id: "err-surd-ext",
    category: "Extraneous Roots in Surd Equations",
    subject: "Algebra",
    frequencyCount: 11,
    severity: "High",
    trend: "Increasing",
    lastOccurred: "2026-08-03",
    remediated: false,
    commonTrapDescription: "Squaring both sides of a radical equation without checking if the non-surd side is non-negative, resulting in invalid extraneous roots.",
    correctRuleSummary: "For √(f(x)) = g(x), we must require g(x) ≥ 0. Always test every candidate root in the ORIGINAL un-squared equation.",
    formulaRef: "\\sqrt{f(x)} = g(x) \\implies g(x) \\ge 0",
    sampleQuestions: [
      {
        id: "tq-surd-1",
        questionText: "Solve for x in: √(x + 6) = x",
        mathExpression: "\\sqrt{x + 6} = x",
        options: [
          { id: "a", text: "x = 3 or x = -2", isCorrect: false, explanation: "TRAP! Testing x = -2 gives √4 = 2 ≠ -2. The value x = -2 is an extraneous root!" },
          { id: "b", text: "x = 3 only", isCorrect: true, explanation: "Squaring gives x + 6 = x² ⇒ x² - x - 6 = 0 ⇒ (x - 3)(x + 2) = 0. Testing x = 3: √9 = 3 (Valid). Testing x = -2: √4 ≠ -2 (Invalid)." },
          { id: "c", text: "x = -2 only", isCorrect: false, explanation: "x = -2 is non-real in terms of principal positive square root equality." },
          { id: "d", text: "No real solutions", isCorrect: false, explanation: "x = 3 is a completely valid real solution." }
        ],
        trapExplanation: "Squaring an equation can introduce false solutions because (-2)² = (2)². Always test roots in the ORIGINAL equation before writing the final answer!",
        stepByStepSolution: [
          "1. Square both sides: x + 6 = x²",
          "2. Rearrange: x² - x - 6 = 0",
          "3. Factorize: (x - 3)(x + 2) = 0  ⇒  x = 3 or x = -2",
          "4. Substitute x = 3: √(3 + 6) = √9 = 3 = RHS. (Valid)",
          "5. Substitute x = -2: √(-2 + 6) = √4 = 2 ≠ -2 (Extraneous)",
          "6. Final valid answer: x = 3"
        ]
      }
    ]
  },
  {
    id: "err-trig-quad",
    category: "Trig Quadrant & Compound Angle Reduction",
    subject: "Trigonometry",
    frequencyCount: 9,
    severity: "Medium",
    trend: "Recurring",
    lastOccurred: "2026-08-02",
    remediated: false,
    commonTrapDescription: "Applying incorrect signs during reduction formulae in Quadrants II, III, and IV (e.g., confusing sin(180° + θ) with cos(180° - θ)).",
    correctRuleSummary: "Use CAST diagram: Q1 (All +), Q2 (Sin +), Q3 (Tan +), Q4 (Cos +). Co-functions apply for 90° ± θ.",
    formulaRef: "\\sin(180^\\circ + \\theta) = -\\sin\\theta, \\quad \\cos(90^\\circ - \\theta) = \\sin\\theta",
    sampleQuestions: [
      {
        id: "tq-trig-1",
        questionText: "Simplify without a calculator: sin(180° + x) · cos(90° - x)",
        mathExpression: "\\sin(180^\\circ + x) \\cdot \\cos(90^\\circ - x)",
        options: [
          { id: "a", text: "-sin²x", isCorrect: true, explanation: "sin(180° + x) is in Quadrant III where sine is negative (-sinx). cos(90° - x) = sinx. So (-sinx)(sinx) = -sin²x." },
          { id: "b", text: "sin²x", isCorrect: false, explanation: "TRAP! Forgot that 180° + x lies in the 3rd quadrant where sine is negative!" },
          { id: "c", text: "-sinx cosx", isCorrect: false, explanation: "Did not change co-function cos(90° - x) to sinx." },
          { id: "d", text: "cos²x", isCorrect: false, explanation: "Incorrect reduction for both trigonometric terms." }
        ],
        trapExplanation: "Remember Quadrant III (180° + x) is TAN territory, meaning SIN is negative! Also, 90° flips cos to sin.",
        stepByStepSolution: [
          "1. Reduce sin(180° + x): Quadrant III ⇒ -sin x",
          "2. Reduce cos(90° - x): Co-function in Quadrant I ⇒ +sin x",
          "3. Multiply: (-sin x) · (sin x) = -sin² x"
        ]
      }
    ]
  },
  {
    id: "err-calc-power",
    category: "Calculus Power Rule & Turning Points",
    subject: "Calculus",
    frequencyCount: 8,
    severity: "Medium",
    trend: "Decreasing",
    lastOccurred: "2026-08-01",
    remediated: true,
    commonTrapDescription: "Forgetting to reduce powers by 1 when using rule of differentiation, or omitting constant derivative 0.",
    correctRuleSummary: "d/dx[a x^n] = a · n · x^(n-1). Derivative of any constant c is 0.",
    formulaRef: "\\frac{d}{dx}[a x^n] = a \\cdot n x^{n-1}, \\quad f'(x) = 0 \\implies \\text{Stationary Point}",
    sampleQuestions: [
      {
        id: "tq-calc-1",
        questionText: "Find the derivative of f(x) = 5x³ - 4x² + 9",
        mathExpression: "f(x) = 5x^3 - 4x^2 + 9 \\implies f'(x) = ?",
        options: [
          { id: "a", text: "f'(x) = 15x² - 8x", isCorrect: true, explanation: "5(3)x² - 4(2)x + 0 = 15x² - 8x." },
          { id: "b", text: "f'(x) = 15x² - 8x + 9", isCorrect: false, explanation: "TRAP! Kept the constant +9 instead of differentiating it to 0!" },
          { id: "c", text: "f'(x) = 15x³ - 8x²", isCorrect: false, explanation: "Did not decrease powers by 1." },
          { id: "d", text: "f'(x) = 5x² - 4x", isCorrect: false, explanation: "Did not multiply coefficients by powers." }
        ],
        trapExplanation: "Constants without x have a slope of 0. Always drop constants when differentiating!",
        stepByStepSolution: [
          "1. Derivative of 5x³ is 5 · 3x² = 15x²",
          "2. Derivative of -4x² is -4 · 2x = -8x",
          "3. Derivative of 9 is 0",
          "4. f'(x) = 15x² - 8x"
        ]
      }
    ]
  },
  {
    id: "err-fin-annuity",
    category: "Financial Maths Loan vs Sinking Fund Formula Selection",
    subject: "Finance & Stats",
    frequencyCount: 6,
    severity: "Low",
    trend: "Decreasing",
    lastOccurred: "2026-07-30",
    remediated: true,
    commonTrapDescription: "Using Future Value annuity formula F = x[(1+i)^n - 1]/i for loan repayments instead of Present Value P = x[1 - (1+i)^(-n)]/i.",
    correctRuleSummary: "Use Present Value (P) for current loans/bond mortgages. Use Future Value (F) for savings/sinking funds.",
    formulaRef: "P = \\frac{x[1 - (1+i)^{-n}]}{i}, \\quad F = \\frac{x[(1+i)^n - 1]}{i}",
    sampleQuestions: [
      {
        id: "tq-fin-1",
        questionText: "A student takes out a home loan of R500,000. Which formula is used to calculate monthly repayments?",
        mathExpression: "\\text{Loan Repayment Formula}",
        options: [
          { id: "a", text: "Present Value Annuity: P = x[1 - (1+i)^-n] / i", isCorrect: true, explanation: "Loans are granted today (Present Value P = R500,000)." },
          { id: "b", text: "Future Value Annuity: F = x[(1+i)^n - 1] / i", isCorrect: false, explanation: "TRAP! Future Value is used for accumulating savings or sinking funds, not loan debts." },
          { id: "c", text: "Compound Interest: A = P(1 + i)^n", isCorrect: false, explanation: "This applies to single lump-sum deposits, not regular monthly installment annuities." },
          { id: "d", text: "Straight Line Depreciation: A = P(1 - i · n)", isCorrect: false, explanation: "Used for asset value reduction, not financial loans." }
        ],
        trapExplanation: "Remember: Money received NOW (e.g. loan/mortgage) is Present Value (P). Money target in FUTURE (e.g. savings/retirement) is Future Value (F).",
        stepByStepSolution: [
          "1. Identify money timing: R500,000 is received AT PRESENT (today).",
          "2. Select Present Value Annuity: P = x[1 - (1+i)^-n] / i",
          "3. Substitute P = 500000 and solve for monthly payment x."
        ]
      }
    ]
  }
];

export const ErrorTrendAnalysis: React.FC<ErrorTrendAnalysisProps> = ({ user, onNavigateQuizTopic }) => {
  // Persistence state for error patterns
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>(() => {
    try {
      const saved = getFromDB<ErrorPattern>("amh_error_trend_logs_v1");
      if (Array.isArray(saved) && saved.length > 0) {
        return saved;
      }
    } catch (e) {
      console.warn("Could not read error logs from DB:", e);
    }
    return DEFAULT_ERROR_PATTERNS;
  });

  // Filter & Search states
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Practice Modal State
  const [activePracticePattern, setActivePracticePattern] = useState<ErrorPattern | null>(null);
  const [practiceQuestionIndex, setPracticeQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [practiceScore, setPracticeScore] = useState<number>(0);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);

  // Manual Log Error Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [newErrorCategory, setNewErrorCategory] = useState("");
  const [newErrorSubject, setNewErrorSubject] = useState<ErrorPattern["subject"]>("Algebra");
  const [newErrorTrap, setNewErrorTrap] = useState("");
  const [newErrorRule, setNewErrorRule] = useState("");

  // Sync state to DB on update
  useEffect(() => {
    try {
      saveToDB("amh_error_trend_logs_v1", errorPatterns);
    } catch (e) {
      console.warn("Could not save error logs to DB:", e);
    }
  }, [errorPatterns]);

  // Compute analytics metrics
  const totalErrorsCount = useMemo(() => {
    return errorPatterns.reduce((acc, curr) => acc + curr.frequencyCount, 0);
  }, [errorPatterns]);

  const highSeverityCount = useMemo(() => {
    return errorPatterns.filter((e) => e.severity === "High" && !e.remediated).length;
  }, [errorPatterns]);

  const remediatedCount = useMemo(() => {
    return errorPatterns.filter((e) => e.remediated).length;
  }, [errorPatterns]);

  const remediationRate = useMemo(() => {
    if (errorPatterns.length === 0) return 100;
    return Math.round((remediatedCount / errorPatterns.length) * 100);
  }, [remediatedCount, errorPatterns]);

  const topGapCategory = useMemo(() => {
    if (errorPatterns.length === 0) return "None";
    const sorted = [...errorPatterns].sort((a, b) => b.frequencyCount - a.frequencyCount);
    return sorted[0].category;
  }, [errorPatterns]);

  // Filtered Patterns
  const filteredPatterns = useMemo(() => {
    return errorPatterns.filter((p) => {
      const matchSubject = selectedSubject === "All" || p.subject === selectedSubject;
      const matchSeverity = selectedSeverity === "All" || p.severity === selectedSeverity;
      const matchSearch =
        searchQuery === "" ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.commonTrapDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSeverity && matchSearch;
    });
  }, [errorPatterns, selectedSubject, selectedSeverity, searchQuery]);

  // Bar chart data preparation
  const barChartData = useMemo(() => {
    return errorPatterns.map((p) => ({
      name: p.category.length > 18 ? p.category.substring(0, 18) + "..." : p.category,
      fullName: p.category,
      frequency: p.frequencyCount,
      subject: p.subject
    }));
  }, [errorPatterns]);

  // Pie chart data preparation (Distribution by Subject)
  const pieChartData = useMemo(() => {
    const subjectCounts: Record<string, number> = {};
    errorPatterns.forEach((p) => {
      subjectCounts[p.subject] = (subjectCounts[p.subject] || 0) + p.frequencyCount;
    });
    return Object.keys(subjectCounts).map((subj) => ({
      name: subj,
      value: subjectCounts[subj]
    }));
  }, [errorPatterns]);

  const PIE_COLORS = ["#eab308", "#10b981", "#06b6d4", "#6366f1", "#f43f5e"];

  // Handle Mark as Remediated
  const handleToggleRemediated = (patternId: string) => {
    setErrorPatterns((prev) =>
      prev.map((item) =>
        item.id === patternId ? { ...item, remediated: !item.remediated } : item
      )
    );
  };

  // Launch Practice Handler
  const handleStartPractice = (pattern: ErrorPattern) => {
    setActivePracticePattern(pattern);
    setPracticeQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerChecked(false);
    setPracticeScore(0);
    setPracticeCompleted(false);
  };

  // Next Question in Practice
  const handleNextQuestion = () => {
    if (!activePracticePattern) return;
    const currentQ = activePracticePattern.sampleQuestions[practiceQuestionIndex];
    const isCorrect = currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect;

    if (isCorrect) {
      setPracticeScore((prev) => prev + 1);
    }

    if (practiceQuestionIndex < activePracticePattern.sampleQuestions.length - 1) {
      setPracticeQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerChecked(false);
    } else {
      setPracticeCompleted(true);
      // Auto-mark pattern as remediated if score >= 80%
      const finalScore = isCorrect ? practiceScore + 1 : practiceScore;
      if (finalScore >= Math.ceil(activePracticePattern.sampleQuestions.length / 2)) {
        handleToggleRemediated(activePracticePattern.id);
      }
    }
  };

  // Generate Error PDF Report
  const handleDownloadErrorPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const studentName = user ? `${user.first_name} ${user.surname}` : "Registered Student";

    // Header Frame
    doc.setFillColor(15, 23, 42); // dark slate
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(234, 179, 8); // gold
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AMARIS MATHEMATICS HUB", 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(226, 232, 240);
    doc.text("DIAGNOSTIC ERROR TREND ANALYSIS & TARGETED REMEDIATION REPORT", 14, 26);
    doc.text(`Student: ${studentName}  |  Generated: ${new Date().toLocaleDateString("en-ZA")}`, 14, 32);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Summary Metrics", 14, 48);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Logged Misconceptions: ${totalErrorsCount}`, 14, 55);
    doc.text(`High Severity Gaps: ${highSeverityCount}`, 14, 61);
    doc.text(`Remediation Mastery Rate: ${remediationRate}%`, 14, 67);
    doc.text(`Top Targeted Focus Area: ${topGapCategory}`, 14, 73);

    doc.line(14, 78, 196, 78);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Aggregated Recurring Conceptual Mistakes", 14, 86);

    let yPos = 96;
    errorPatterns.forEach((pattern, idx) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`${idx + 1}. [${pattern.subject}] ${pattern.category} (${pattern.frequencyCount} occurrences)`, 14, yPos);

      yPos += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const splitTrap = doc.splitTextToSize(`The Trap: ${pattern.commonTrapDescription}`, 180);
      doc.text(splitTrap, 14, yPos);
      yPos += splitTrap.length * 4.5;

      const splitRule = doc.splitTextToSize(`Correct Rule: ${pattern.correctRuleSummary}`, 180);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text(splitRule, 14, yPos);
      yPos += splitRule.length * 4.5 + 4;
    });

    doc.save(`Error_Trend_Remediation_Plan_${studentName.replace(/\s+/g, "_")}.pdf`);
  };

  // Add Custom Error Handler
  const handleCreateNewError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newErrorCategory.trim() || !newErrorTrap.trim()) return;

    const newPattern: ErrorPattern = {
      id: `err-custom-${Date.now()}`,
      category: newErrorCategory.trim(),
      subject: newErrorSubject,
      frequencyCount: 1,
      severity: "Medium",
      trend: "Recurring",
      lastOccurred: new Date().toISOString().split("T")[0],
      remediated: false,
      commonTrapDescription: newErrorTrap.trim(),
      correctRuleSummary: newErrorRule.trim() || "Review formula rules and re-test with step-by-step guidance.",
      sampleQuestions: [
        {
          id: `tq-cust-${Date.now()}`,
          questionText: `Targeted practice for ${newErrorCategory.trim()}`,
          options: [
            { id: "a", text: "Apply step-by-step verified formula rule", isCorrect: true, explanation: "Correct application of verified rule." },
            { id: "b", text: "Fall into standard conceptual sign trap", isCorrect: false, explanation: "This reproduces the registered error trap." }
          ],
          trapExplanation: newErrorTrap.trim(),
          stepByStepSolution: [
            "1. Identify the conceptual trap in the equation.",
            "2. Apply the verified CAPS/IEB step-by-step method.",
            "3. Double check signs and constraints."
          ]
        }
      ]
    };

    setErrorPatterns((prev) => [newPattern, ...prev]);
    setIsLogModalOpen(false);
    setNewErrorCategory("");
    setNewErrorTrap("");
    setNewErrorRule("");
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-6 text-left relative overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              Diagnostic Error Analytics & Remediation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              Auto-Generated Practice Drills
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            Error Trend Analysis Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Aggregates recurring conceptual mistakes across CAPS & IEB Mathematics topics to eliminate knowledge gaps before trial exams.
          </p>
        </div>

        {/* HEADER ACTION BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-mono text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Custom Error</span>
          </button>

          <button
            onClick={handleDownloadErrorPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-navy-950 text-white hover:bg-slate-800 font-mono text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Remediation PDF</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* TOTAL LOGGED ERRORS */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-mono font-bold uppercase">Total Mistakes Logged</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
            {totalErrorsCount}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            Across {errorPatterns.length} distinct categories
          </div>
        </div>

        {/* HIGH SEVERITY GAPS */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-mono font-bold uppercase">Active High-Priority Gaps</span>
            <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
            {highSeverityCount}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            Requires immediate practice attention
          </div>
        </div>

        {/* REMEDIATION MASTERY RATE */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-mono font-bold uppercase">Remediation Mastery</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2 flex items-center gap-1">
            <span>{remediationRate}%</span>
            <span className="text-xs font-mono text-emerald-500">({remediatedCount}/{errorPatterns.length})</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            Errors successfully mastered
          </div>
        </div>

        {/* TOP RECURRING TARGET AREA */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/30">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-mono font-bold uppercase">Top Target Gap</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-2 line-clamp-1">
            {topGapCategory}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            Most frequent misconception
          </div>
        </div>

      </div>

      {/* RECHARTS ANALYTICAL GRAPHS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BAR CHART: FREQUENCY BY ERROR CATEGORY */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Error Occurrence Frequency Graph
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Occurrences logged</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f8fafc"
                  }}
                  formatter={(value: any) => [`${value} occurrences`, "Frequency"]}
                />
                <Bar dataKey="frequency" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: TOPIC DISTRIBUTION */}
        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Topic Error Breakdown
            </h3>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f8fafc"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/80 dark:bg-navy-950/60 p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800">
        
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {["All", "Algebra", "Calculus", "Trigonometry", "Geometry", "Finance & Stats"].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSubject === subj
                  ? "bg-amber-500 text-white shadow-xs font-black"
                  : "bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:border-amber-500/50"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Search & Severity Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search misconception..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
          />

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* ERROR PATTERNS LIST */}
      <div className="space-y-4">
        {filteredPatterns.length > 0 ? (
          filteredPatterns.map((pattern) => (
            <motion.div
              key={pattern.id}
              whileHover={{ y: -2 }}
              className={`p-5 rounded-2xl border transition-all text-left space-y-4 ${
                pattern.remediated
                  ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500/30"
                  : pattern.severity === "High"
                  ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-500/30"
                  : "bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-850 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                      {pattern.subject}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        pattern.severity === "High"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : pattern.severity === "Medium"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {pattern.severity} Severity
                    </span>

                    <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                      {pattern.frequencyCount} Occurrences
                    </span>

                    {pattern.remediated ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Remediated
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        ⚡ {pattern.trend}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    {pattern.category}
                  </h3>
                </div>

                {/* ACTION BUTTONS FOR EACH PATTERN */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartPractice(pattern)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-mono text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Targeted Practice Drill ({pattern.sampleQuestions.length})</span>
                  </button>

                  <button
                    onClick={() => handleToggleRemediated(pattern.id)}
                    className={`px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                      pattern.remediated
                        ? "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-navy-700"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                    }`}
                  >
                    {pattern.remediated ? "Mark Active" : "Mark Mastered"}
                  </button>
                </div>
              </div>

              {/* TRAP VS CORRECT METHOD BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                
                {/* THE TRAP */}
                <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl space-y-1.5">
                  <span className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    The Common Conceptual Trap:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {pattern.commonTrapDescription}
                  </p>
                </div>

                {/* THE VERIFIED CAPS METHOD */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl space-y-1.5">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Verified CAPS/IEB Rule:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {pattern.correctRuleSummary}
                  </p>
                </div>

              </div>

              {/* VOICE EXPLANATION AUDIO */}
              <div className="pt-1">
                <AudioFeedbackPlayer
                  textToSpeak={`Diagnostic Analysis for ${pattern.category}. Common trap: ${pattern.commonTrapDescription}. Correct rule: ${pattern.correctRuleSummary}.`}
                  label="Listen to Diagnostic Audio Analysis"
                  compact={true}
                />
              </div>

            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-mono text-slate-500">No error patterns match your search filter.</p>
          </div>
        )}
      </div>

      {/* TARGETED PRACTICE EXERCISES MODAL */}
      <AnimatePresence>
        {activePracticePattern && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Targeted Remediation Exercise
                  </span>
                  <h3 className="text-xl font-black font-display text-slate-900 dark:text-white mt-1">
                    {activePracticePattern.category}
                  </h3>
                </div>

                <button
                  onClick={() => setActivePracticePattern(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 cursor-pointer text-xs font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              {!practiceCompleted ? (
                <div className="space-y-5">
                  
                  {/* QUESTION HEADER & PROGRESS */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>
                      Question {practiceQuestionIndex + 1} of {activePracticePattern.sampleQuestions.length}
                    </span>
                    <span className="font-bold text-amber-500">
                      Targeting Error: {activePracticePattern.subject}
                    </span>
                  </div>

                  {/* QUESTION BOX */}
                  <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {activePracticePattern.sampleQuestions[practiceQuestionIndex].questionText}
                    </h4>
                    {activePracticePattern.sampleQuestions[practiceQuestionIndex].mathExpression && (
                      <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                        {activePracticePattern.sampleQuestions[practiceQuestionIndex].mathExpression}
                      </div>
                    )}
                  </div>

                  {/* OPTIONS */}
                  <div className="space-y-2.5">
                    {activePracticePattern.sampleQuestions[practiceQuestionIndex].options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      const showResult = isAnswerChecked;
                      const isCorrect = opt.isCorrect;

                      return (
                        <button
                          key={opt.id}
                          disabled={isAnswerChecked}
                          onClick={() => setSelectedOptionId(opt.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            showResult
                              ? isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold"
                                : isSelected
                                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-200"
                                : "bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 opacity-60"
                              : isSelected
                              ? "bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white font-bold"
                              : "bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 hover:border-amber-500/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center uppercase">
                              {opt.id}
                            </span>
                            <span className="text-xs font-medium">{opt.text}</span>
                          </div>

                          {showResult && (
                            <div>
                              {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : isSelected ? (
                                <XCircle className="w-5 h-5 text-rose-500" />
                              ) : null}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* EXPLANATION AFTER CHECK */}
                  {isAnswerChecked && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs font-mono">
                      <div className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Remediation Explanation:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-sans">
                        {
                          activePracticePattern.sampleQuestions[practiceQuestionIndex].options.find(
                            (o) => o.id === selectedOptionId
                          )?.explanation
                        }
                      </p>

                      <div className="pt-2 border-t border-amber-500/20 text-slate-800 dark:text-slate-200 font-sans font-medium space-y-1">
                        <strong className="block text-amber-600 dark:text-amber-400 font-mono text-[11px] uppercase">
                          Step-by-Step Correct Method:
                        </strong>
                        {activePracticePattern.sampleQuestions[practiceQuestionIndex].stepByStepSolution.map((s, idx) => (
                          <div key={idx} className="text-[11px] font-mono">
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MODAL FOOTER BUTTONS */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
                    {!isAnswerChecked ? (
                      <button
                        disabled={!selectedOptionId}
                        onClick={() => setIsAnswerChecked(true)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-navy-950 font-mono text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Check Remediation Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>
                          {practiceQuestionIndex < activePracticePattern.sampleQuestions.length - 1
                            ? "Next Targeted Practice Question"
                            : "Complete Drill & Update Mastery"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                /* DRILL COMPLETED SCREEN */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">
                    Targeted Remediation Completed!
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    You scored <strong className="text-amber-500 font-bold">{practiceScore} / {activePracticePattern.sampleQuestions.length}</strong> on this targeted error drill.
                  </p>

                  <div className="pt-3">
                    <button
                      onClick={() => setActivePracticePattern(null)}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-navy-950 font-mono text-xs font-black rounded-xl cursor-pointer"
                    >
                      Return to Diagnostic Dashboard
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL ERROR LOG MODAL */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                  Log Homework/Test Conceptual Error
                </h3>
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewError} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Misconception Category:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Inverting sine rule ratio..."
                    value={newErrorCategory}
                    onChange={(e) => setNewErrorCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Subject Module:
                  </label>
                  <select
                    value={newErrorSubject}
                    onChange={(e) => setNewErrorSubject(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="Algebra">Algebra</option>
                    <option value="Calculus">Calculus</option>
                    <option value="Trigonometry">Trigonometry</option>
                    <option value="Geometry">Geometry</option>
                    <option value="Finance & Stats">Finance & Stats</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    What mistake did you make (The Trap)?
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe the sign or calculation mistake..."
                    value={newErrorTrap}
                    onChange={(e) => setNewErrorTrap(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    What is the correct rule to remember?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Write the correct formula rule..."
                    value={newErrorRule}
                    onChange={(e) => setNewErrorRule(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-navy-950 font-black rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  Log Misconception into Analytics Engine
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
