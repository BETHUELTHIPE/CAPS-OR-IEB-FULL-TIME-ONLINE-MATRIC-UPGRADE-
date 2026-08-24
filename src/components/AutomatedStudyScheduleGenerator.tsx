import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Brain,
  Award,
  Download,
  Plus,
  Trash2,
  ChevronRight,
  Filter,
  BarChart3,
  Flame,
  Printer,
  X,
  Check
} from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { Profile } from "../types";

export interface AutomatedStudyScheduleGeneratorProps {
  user?: Profile | null;
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}

export interface TopicMasteryItem {
  id: string;
  name: string;
  category: "algebra" | "calculus" | "trig" | "geometry" | "finance" | "stats";
  paper: "Paper 1" | "Paper 2";
  masteryScore: number; // 0 - 100
  isWeak: boolean;
  formulaLatex: string;
}

export interface DailyStudySession {
  dayNumber: number;
  dateStr: string;
  topicId: string;
  topicName: string;
  paper: "Paper 1" | "Paper 2";
  durationMinutes: number; // 30
  formulaLatex: string;
  focusArea: string;
  conceptReview10m: string;
  pastPaperPractice15m: string;
  activeRecallQuiz5m: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface SavedSchedule {
  id: string;
  examDate: string;
  createdAt: string;
  targetPaper: "all" | "paper1" | "paper2";
  totalDays: number;
  weakTopicIds: string[];
  sessions: DailyStudySession[];
}

const DEFAULT_MASTERY_TOPICS: TopicMasteryItem[] = [
  {
    id: "diff_calc_tp",
    name: "Differential Calculus: Turning Points & Optimization",
    category: "calculus",
    paper: "Paper 1",
    masteryScore: 42,
    isWeak: true,
    formulaLatex: "f'(x) = 0 \\implies 3ax^2 + 2bx + c = 0"
  },
  {
    id: "first_principles",
    name: "Calculus: First Principles Derivatives",
    category: "calculus",
    paper: "Paper 1",
    masteryScore: 58,
    isWeak: true,
    formulaLatex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
  },
  {
    id: "trig_reduction",
    name: "Trigonometric Reduction & Compound Angles",
    category: "trig",
    paper: "Paper 2",
    masteryScore: 35,
    isWeak: true,
    formulaLatex: "\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta"
  },
  {
    id: "trig_rules",
    name: "Trig 2D/3D Sine, Cosine & Area Rules",
    category: "trig",
    paper: "Paper 2",
    masteryScore: 48,
    isWeak: true,
    formulaLatex: "a^2 = b^2 + c^2 - 2bc \\cdot \\cos A"
  },
  {
    id: "euc_geom_circles",
    name: "Euclidean Geometry: Circle Theorems & Proofs",
    category: "geometry",
    paper: "Paper 2",
    masteryScore: 30,
    isWeak: true,
    formulaLatex: "\\angle \\text{ at center} = 2 \\times \\angle \\text{ at circumference}"
  },
  {
    id: "finance_annuities",
    name: "Financial Maths: Present & Future Value Annuities",
    category: "finance",
    paper: "Paper 1",
    masteryScore: 52,
    isWeak: true,
    formulaLatex: "P = \\frac{x\\left[1 - (1+i)^{-n}\\right]}{i}"
  },
  {
    id: "seq_series_convergent",
    name: "Sequences: Geometric Sum to Infinity",
    category: "algebra",
    paper: "Paper 1",
    masteryScore: 65,
    isWeak: false,
    formulaLatex: "S_\\infty = \\frac{a}{1 - r} \\quad (|r| < 1)"
  },
  {
    id: "anal_geom_circles",
    name: "Analytical Geometry: Equations of Tangents to Circles",
    category: "geometry",
    paper: "Paper 2",
    masteryScore: 45,
    isWeak: true,
    formulaLatex: "(x - a)^2 + (y - b)^2 = r^2"
  },
  {
    id: "stats_regression",
    name: "Statistics: Least Squares Regression & Correlation",
    category: "stats",
    paper: "Paper 2",
    masteryScore: 78,
    isWeak: false,
    formulaLatex: "\\hat{y} = a + bx"
  },
  {
    id: "quad_inequalities",
    name: "Algebra: Quadratic Inequalities & Surds",
    category: "algebra",
    paper: "Paper 1",
    masteryScore: 50,
    isWeak: true,
    formulaLatex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
  }
];

export const AutomatedStudyScheduleGenerator: React.FC<AutomatedStudyScheduleGeneratorProps> = ({
  user,
  isOpen = true,
  onClose,
  embedded = false
}) => {
  // 1. Inputs state
  const defaultExamDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 21); // Default 3 weeks from today
    return d.toISOString().split("T")[0];
  };

  const [examDate, setExamDate] = useState<string>(defaultExamDate());
  const [targetPaper, setTargetPaper] = useState<"all" | "paper1" | "paper2">("all");
  const [topics, setTopics] = useState<TopicMasteryItem[]>(DEFAULT_MASTERY_TOPICS);
  const [currentSchedule, setCurrentSchedule] = useState<SavedSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<"all" | "pending" | "completed">("all");
  const [copiedLink, setCopiedLink] = useState(false);

  // Load existing saved schedule from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("amh_automated_study_schedule");
      if (saved) {
        const parsed: SavedSchedule = JSON.parse(saved);
        setCurrentSchedule(parsed);
      }
    } catch (e) {
      console.warn("Could not load saved study schedule", e);
    }
  }, []);

  // Save active schedule to localStorage whenever changed
  const persistSchedule = (schedule: SavedSchedule | null) => {
    setCurrentSchedule(schedule);
    if (schedule) {
      localStorage.setItem("amh_automated_study_schedule", JSON.stringify(schedule));
    } else {
      localStorage.removeItem("amh_automated_study_schedule");
    }
  };

  // Toggle weak status for topic in selection
  const toggleTopicWeakness = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isWeak: !t.isWeak } : t))
    );
  };

  // Calculate days remaining from today until exam
  const calculateDaysRemaining = (targetDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(targetDateStr);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Automated Schedule Generator Engine
  const generateSchedule = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const totalDays = calculateDaysRemaining(examDate);
      const weakTopics = topics.filter(
        (t) =>
          t.isWeak &&
          (targetPaper === "all" ||
            (targetPaper === "paper1" && t.paper === "Paper 1") ||
            (targetPaper === "paper2" && t.paper === "Paper 2"))
      );

      // Fallback if no topics selected
      const activeTopicsPool = weakTopics.length > 0 ? weakTopics : topics;

      const sessions: DailyStudySession[] = [];
      const startDate = new Date();

      for (let i = 0; i < totalDays; i++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(sessionDate.getDate() + i + 1);
        const dateFormatted = sessionDate.toLocaleDateString("en-ZA", {
          weekday: "short",
          month: "short",
          day: "numeric"
        });

        // Interleaved topic picking
        const topic = activeTopicsPool[i % activeTopicsPool.length];

        // Specific sub-task breakdowns for 30 minutes
        let conceptText = "Review key formula definitions and variable restrictions.";
        let pastPaperText = "Solve 2 standard NSC CAPS past exam questions (2021-2023).";
        let quizText = "Complete 3 rapid active recall formula check questions.";

        if (topic.category === "calculus") {
          conceptText = "Review f'(x) slope interpretation and cubic stationary points (f'(x) = 0).";
          pastPaperText = "Solve 1 optimization word problem & 1 cubic sketch interpretation.";
          quizText = "Recall power rule derivative formula & stationary point conditions.";
        } else if (topic.category === "trig") {
          conceptText = "Review reduction quadrant signs (180°±θ, 360°-θ) and compound expansions.";
          pastPaperText = "Solve 2 identity proof questions from recent IEB/NSC papers.";
          quizText = "Test yourself on sin(2α) and cos(2α) three expansion forms.";
        } else if (topic.category === "geometry") {
          conceptText = "Re-read circle theorem statements (e.g. angle in alternate segment).";
          pastPaperText = "Construct step-by-step geometric proofs with formal statement-reason columns.";
          quizText = "State 3 circle theorem reasons from memory without looking at notes.";
        } else if (topic.category === "finance") {
          conceptText = "Identify whether loan problem requires Present Value P or Future Value F annuity.";
          pastPaperText = "Calculate deferred payment periods and monthly installment x values.";
          quizText = "Verify effective vs nominal interest rate conversion formula i = (1+i/m)^m - 1.";
        }

        sessions.push({
          dayNumber: i + 1,
          dateStr: dateFormatted,
          topicId: topic.id,
          topicName: topic.name,
          paper: topic.paper,
          durationMinutes: 30,
          formulaLatex: topic.formulaLatex,
          focusArea: `${topic.paper}: ${topic.name}`,
          conceptReview10m: conceptText,
          pastPaperPractice15m: pastPaperText,
          activeRecallQuiz5m: quizText,
          completed: false
        });
      }

      const newSchedule: SavedSchedule = {
        id: `sched_${Date.now()}`,
        examDate,
        createdAt: new Date().toISOString(),
        targetPaper,
        totalDays,
        weakTopicIds: activeTopicsPool.map((t) => t.id),
        sessions
      };

      persistSchedule(newSchedule);
      setIsGenerating(false);
    }, 600);
  };

  // Toggle session completion status
  const toggleSessionComplete = (dayNumber: number) => {
    if (!currentSchedule) return;

    const updatedSessions = currentSchedule.sessions.map((s) => {
      if (s.dayNumber === dayNumber) {
        return {
          ...s,
          completed: !s.completed,
          completedAt: !s.completed ? new Date().toISOString() : undefined
        };
      }
      return s;
    });

    persistSchedule({
      ...currentSchedule,
      sessions: updatedSessions
    });
  };

  // Handle printing or PDF export
  const handlePrintSchedule = () => {
    window.print();
  };

  // Calculate statistics
  const completedCount = currentSchedule?.sessions.filter((s) => s.completed).length || 0;
  const totalCount = currentSchedule?.sessions.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalMinutesStudied = completedCount * 30;

  const filteredSessions = currentSchedule?.sessions.filter((s) => {
    if (selectedDayFilter === "pending") return !s.completed;
    if (selectedDayFilter === "completed") return s.completed;
    return true;
  }) || [];

  const daysRemaining = calculateDaysRemaining(examDate);

  const content = (
    <div className="space-y-6 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-navy-900 text-white rounded-3xl border border-navy-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-royal-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-gold-500 to-amber-600 text-navy-950 rounded-2xl font-black shadow-lg">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-display tracking-tight text-white uppercase">
                Automated 30-Min Study Schedule Generator
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                CAPS / IEB Mastery
              </span>
            </div>
            <p className="text-xs text-navy-300 font-mono mt-0.5">
              Input your target exam date & weak topics to generate an interleaved daily 30-minute revision roadmap
            </p>
          </div>
        </div>

        {currentSchedule && (
          <div className="flex items-center gap-2 shrink-0 z-10">
            <button
              type="button"
              onClick={handlePrintSchedule}
              className="px-3 py-2 bg-navy-800 hover:bg-navy-750 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-navy-700 transition-colors cursor-pointer"
              title="Print or save schedule as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>Print Plan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset current study schedule and create a new one?")) {
                  persistSchedule(null);
                }
              }}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Plan</span>
            </button>
          </div>
        )}
      </div>

      {/* SETUP FORM & WEAK TOPIC SELECTOR (SHOW IF NO SCHEDULE OR RECALIBRATING) */}
      {!currentSchedule ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STEP 1: EXAM DATE & CURRICULUM PAPER */}
          <div className="lg:col-span-1 p-5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-navy-150 dark:border-navy-800 pb-3">
              <Calendar className="w-5 h-5 text-gold-500" />
              <h3 className="text-xs font-black font-display uppercase text-navy-950 dark:text-white tracking-wider">
                1. Exam Details & Target Date
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-navy-700 dark:text-navy-300 mb-1">
                  Target Mathematics Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full p-3 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-bold text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] font-mono text-royal-600 dark:text-gold-400 mt-1 block">
                  ⏳ {daysRemaining} Days remaining until exam
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-navy-700 dark:text-navy-300 mb-1">
                  Paper Focus Alignment
                </label>
                <select
                  value={targetPaper}
                  onChange={(e: any) => setTargetPaper(e.target.value)}
                  className="w-full p-3 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-bold text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Both Papers (Paper 1 & Paper 2 Balanced)</option>
                  <option value="paper1">Paper 1 Only (Algebra, Calculus, Finance, Sequences)</option>
                  <option value="paper2">Paper 2 Only (Trig, Geometry, Stats, Analytical)</option>
                </select>
              </div>

              <div className="p-3 bg-royal-50 dark:bg-royal-950/40 border border-royal-200 dark:border-royal-800/50 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-royal-700 dark:text-royal-300 uppercase block">
                  ⚡ Daily Schedule Format
                </span>
                <p className="text-[11px] text-navy-600 dark:text-navy-300 leading-tight">
                  Each day assigns a dedicated <strong>30-Minute Revision Module</strong>: 10m Concept & Formula, 15m Past Exam Problem, 5m Active Recall.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: SELECT WEAK TOPICS FROM MASTERY PATH */}
          <div className="lg:col-span-2 p-5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  <h3 className="text-xs font-black font-display uppercase text-navy-950 dark:text-white tracking-wider">
                    2. Select Priority / Weak Topics (Mastery Path)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-navy-500 font-bold">
                  {topics.filter((t) => t.isWeak).length} / {topics.length} Selected
                </span>
              </div>

              <p className="text-xs text-navy-500 dark:text-navy-400 my-3">
                Topics flagged as weak (below 60% mastery) are prioritized in the daily revision schedule. Toggle topics to tailor your study plan:
              </p>

              {/* TOPIC MASTERY SELECTION GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopicWeakness(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      t.isWeak
                        ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-navy-950 dark:text-white font-bold"
                        : "bg-navy-50 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-600 dark:text-navy-400 hover:border-navy-300"
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-navy-200 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                          {t.paper}
                        </span>
                        <span className="text-xs font-bold line-clamp-1">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-navy-500">Mastery: {t.masteryScore}%</span>
                        <div className="w-12 bg-navy-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              t.masteryScore < 50
                                ? "bg-rose-500"
                                : t.masteryScore < 70
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${t.masteryScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {t.isWeak ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                      ) : (
                        <Circle className="w-4 h-4 text-navy-300" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <div className="pt-4 border-t border-navy-150 dark:border-navy-800">
              <button
                type="button"
                onClick={generateSchedule}
                disabled={isGenerating}
                className="w-full py-3.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? "Synthesizing 30-Min Daily Revision Plan..." : "Generate Automated 30-Min Study Schedule"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* GENERATED ACTIVE STUDY SCHEDULE VIEW */
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-navy-500 block uppercase font-bold">
                  Exam Countdown
                </span>
                <span className="text-lg font-black font-display text-navy-950 dark:text-white">
                  {daysRemaining} Days
                </span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-navy-500 block uppercase font-bold">
                  Progress
                </span>
                <span className="text-lg font-black font-display text-navy-950 dark:text-white">
                  {completedCount} / {totalCount} ({progressPercent}%)
                </span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-royal-500/10 text-royal-600 dark:text-gold-400 rounded-xl font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-navy-500 block uppercase font-bold">
                  Time Studied
                </span>
                <span className="text-lg font-black font-display text-navy-950 dark:text-white">
                  {totalMinutesStudied} Mins
                </span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-navy-500 block uppercase font-bold">
                  Revision Pace
                </span>
                <span className="text-lg font-black font-display text-navy-950 dark:text-white">
                  30m / Day
                </span>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-navy-700 dark:text-navy-200">
                Overall Study Plan Completion
              </span>
              <span className="text-gold-600 dark:text-gold-400">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-navy-100 dark:bg-navy-800 h-3 rounded-full overflow-hidden p-0.5 border border-navy-200 dark:border-navy-750">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* FILTER TABS & SCHEDULE LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedDayFilter === "all"
                      ? "bg-royal-600 text-white"
                      : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-800"
                  }`}
                >
                  All Days ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter("pending")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedDayFilter === "pending"
                      ? "bg-royal-600 text-white"
                      : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-800"
                  }`}
                >
                  Pending ({totalCount - completedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter("completed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedDayFilter === "completed"
                      ? "bg-royal-600 text-white"
                      : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-800"
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>

              <span className="text-[11px] font-mono text-navy-400 shrink-0">
                Showing {filteredSessions.length} sessions
              </span>
            </div>

            {/* DAILY SESSIONS CARD LIST */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.dayNumber}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    session.completed
                      ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-navy-900 dark:text-white"
                      : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 hover:border-gold-500/50 shadow-xs"
                  }`}
                >
                  {/* Session Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSessionComplete(session.dayNumber)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          session.completed
                            ? "text-emerald-500"
                            : "text-navy-300 dark:text-navy-700 hover:text-amber-500"
                        }`}
                        title={session.completed ? "Mark as pending" : "Mark as completed"}
                      >
                        {session.completed ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                            Day {session.dayNumber} • {session.dateStr}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-royal-600/10 text-royal-600 dark:text-gold-400 border border-royal-500/20">
                            {session.paper}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 30 Mins
                          </span>
                        </div>
                        <h4 className={`text-xs font-black font-display mt-1 ${session.completed ? "line-through text-navy-500" : "text-navy-950 dark:text-white"}`}>
                          {session.topicName}
                        </h4>
                      </div>
                    </div>

                    {session.completed && (
                      <span className="px-2.5 py-1 bg-emerald-500 text-navy-950 text-[10px] font-mono font-black rounded-lg uppercase">
                        Done ✓
                      </span>
                    )}
                  </div>

                  {/* 30-MINUTE BREAKDOWN TIMELINE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-2 border-t border-navy-100 dark:border-navy-850">
                    <div className="p-2.5 bg-navy-50 dark:bg-navy-950 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold text-royal-600 dark:text-gold-400 block uppercase">
                        ⏱️ 10m Concept & Formula
                      </span>
                      <p className="text-[11px] text-navy-700 dark:text-navy-300">
                        {session.conceptReview10m}
                      </p>
                    </div>

                    <div className="p-2.5 bg-navy-50 dark:bg-navy-950 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 block uppercase">
                        ✍️ 15m Past Paper Exam Question
                      </span>
                      <p className="text-[11px] text-navy-700 dark:text-navy-300">
                        {session.pastPaperPractice15m}
                      </p>
                    </div>

                    <div className="p-2.5 bg-navy-50 dark:bg-navy-950 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                        🧠 5m Active Recall Drill
                      </span>
                      <p className="text-[11px] text-navy-700 dark:text-navy-300">
                        {session.activeRecallQuiz5m}
                      </p>
                    </div>
                  </div>

                  {/* KATEX FORMULA PREVIEW */}
                  {session.formulaLatex && (
                    <div className="p-2.5 bg-navy-950 text-white rounded-xl border border-navy-800 text-center text-xs overflow-x-auto">
                      <LatexRenderer text={`$$ ${session.formulaLatex} $$`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-navy-950 shadow-2xl rounded-3xl border border-navy-200 dark:border-navy-800 flex flex-col overflow-hidden text-left">
        {/* MODAL HEADER */}
        <div className="p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-navy-950 font-black rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider">
                Automated 30-Min Study Schedule Generator
              </h3>
              <p className="text-[11px] font-mono text-navy-300">
                CAPS & IEB High School Mathematics Exam Preparation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {content}
        </div>
      </div>
    </div>
  );
};
