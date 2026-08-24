import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Flame, 
  Clock, 
  ChevronRight, 
  Zap, 
  RotateCcw, 
  BookOpen, 
  Lightbulb, 
  Trophy,
  Share2,
  Check
} from "lucide-react";
import { Profile, StudentActivity } from "../types";
import { getFromDB, saveToDB, generateId } from "../lib/db";
import { triggerStreakToast, triggerMilestoneToast } from "../lib/toast";
import { AudioFeedbackPlayer } from "./AudioFeedbackPlayer";

export interface DailyQuizRecord {
  id: string;
  date: string;
  user_id: string;
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  points_earned: number;
  timestamp: string;
}

export interface Question {
  id: string;
  category: "Algebra" | "Trigonometry" | "Calculus" | "Geometry" | "Functions" | "Probability" | "Financial Maths";
  difficulty: "Standard" | "Exam Level" | "Level 7 Challenge";
  title: string;
  questionText: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  hint: string;
  points: number;
  gradeLevel: string;
}

// Curriculum-aligned South African CAPS & IEB Mathematics Questions Pool
const DAILY_QUESTIONS_POOL: Question[] = [
  {
    id: "dq-01",
    category: "Calculus",
    difficulty: "Exam Level",
    title: "Differential Calculus: First Principles",
    questionText: "Find the derivative of f(x) = 3x² - 5x + 2 using first principles, and state f'(x).",
    options: [
      { id: "A", label: "A", text: "f'(x) = 6x - 5" },
      { id: "B", label: "B", text: "f'(x) = 3x - 5" },
      { id: "C", label: "C", text: "f'(x) = 6x² - 5x" },
      { id: "D", label: "D", text: "f'(x) = 6x + 2" }
    ],
    correctOptionId: "A",
    explanation: "Using lim_{h→0} [f(x+h) - f(x)]/h: f(x+h) = 3(x+h)² - 5(x+h) + 2 = 3x² + 6xh + 3h² - 5x - 5h + 2. Subtracting f(x) leaves 6xh + 3h² - 5h. Dividing by h gives 6x + 3h - 5. Taking the limit as h→0 yields f'(x) = 6x - 5.",
    hint: "Expand f(x+h) = 3(x+h)² - 5(x+h) + 2, subtract f(x), factor out h, then take the limit as h→0.",
    points: 50,
    gradeLevel: "Grade 12 CAPS"
  },
  {
    id: "dq-02",
    category: "Trigonometry",
    difficulty: "Level 7 Challenge",
    title: "Trigonometric Reduction & Compound Angles",
    questionText: "Simplify the expression: cos(180° - θ) · tan(360° - θ) + sin(90° + θ)",
    options: [
      { id: "A", label: "A", text: "sin θ + cos θ" },
      { id: "B", label: "B", text: "sin θ" },
      { id: "C", label: "C", text: "cos² θ" },
      { id: "D", label: "D", text: "2 cos θ" }
    ],
    correctOptionId: "B",
    explanation: "cos(180° - θ) = -cos θ (Quadrant 2). tan(360° - θ) = -tan θ (Quadrant 4). Therefore, (-cos θ)(-tan θ) = (-cos θ)(-sin θ / cos θ) = sin θ.",
    hint: "Reduce each angle into its core quadrant form: cos(180°-θ) = -cos θ, tan(360°-θ) = -tan θ.",
    points: 75,
    gradeLevel: "Grade 11/12 NSC"
  },
  {
    id: "dq-03",
    category: "Algebra",
    difficulty: "Standard",
    title: "Quadratic Sequences & General Term T_n",
    questionText: "Given the quadratic sequence: 4 ; 11 ; 22 ; 37 ... Find the general term T_n.",
    options: [
      { id: "A", label: "A", text: "T_n = 2n² + 3n - 1" },
      { id: "B", label: "B", text: "T_n = 2n² + n + 1" },
      { id: "C", label: "C", text: "T_n = n² + 4n - 1" },
      { id: "D", label: "D", text: "T_n = 3n² + 2n - 1" }
    ],
    correctOptionId: "B",
    explanation: "First differences: 7, 11, 15. Second constant difference: 4. So 2a = 4 ⇒ a = 2. 3a + b = 7 ⇒ 3(2) + b = 7 ⇒ b = 1. a + b + c = 4 ⇒ 2 + 1 + c = 4 ⇒ c = 1. Thus, T_n = 2n² + n + 1.",
    hint: "Use 2a = second difference, 3a + b = T_2 - T_1, a + b + c = T_1.",
    points: 50,
    gradeLevel: "Grade 12 NSC"
  },
  {
    id: "dq-04",
    category: "Geometry",
    difficulty: "Exam Level",
    title: "Analytical Geometry: Circle Equation & Center",
    questionText: "A circle has equation x² + y² - 4x + 6y - 12 = 0. What are the coordinates of its center C?",
    options: [
      { id: "A", label: "A", text: "C(-2, 3)" },
      { id: "B", label: "B", text: "C(2, -3)" },
      { id: "C", label: "C", text: "C(4, -6)" },
      { id: "D", label: "D", text: "C(-4, 6)" }
    ],
    correctOptionId: "B",
    explanation: "Complete the square: (x - 2)² - 4 + (y + 3)² - 9 - 12 = 0 ⇒ (x - 2)² + (y + 3)² = 25. Therefore, center C = (2, -3) and radius r = 5.",
    hint: "Group x terms and y terms, complete the square for both to put into (x - a)² + (y - b)² = r² form.",
    points: 60,
    gradeLevel: "Grade 12 CAPS"
  },
  {
    id: "dq-05",
    category: "Functions",
    difficulty: "Level 7 Challenge",
    title: "Exponential Functions & Inverse f⁻¹(x)",
    questionText: "If f(x) = 2^(x - 1) + 3, find the equation of its inverse function f⁻¹(x).",
    options: [
      { id: "A", label: "A", text: "f⁻¹(x) = log₂(x - 3) + 1" },
      { id: "B", label: "B", text: "f⁻¹(x) = log₂(x + 3) - 1" },
      { id: "C", label: "C", text: "f⁻¹(x) = 2^(y - 3) + 1" },
      { id: "D", label: "D", text: "f⁻¹(x) = log₂(x - 1) + 3" }
    ],
    correctOptionId: "A",
    explanation: "Swap x and y: x = 2^(y - 1) + 3 ⇒ x - 3 = 2^(y - 1). Take log base 2 of both sides: log₂(x - 3) = y - 1 ⇒ y = log₂(x - 3) + 1. Hence f⁻¹(x) = log₂(x - 3) + 1.",
    hint: "Swap x and y to get x = 2^(y-1) + 3. Isolate the power, then convert to logarithmic form.",
    points: 75,
    gradeLevel: "Grade 12 IEB/CAPS"
  },
  {
    id: "dq-06",
    category: "Probability",
    difficulty: "Standard",
    title: "Independent & Mutually Exclusive Events",
    questionText: "If P(A) = 0.4 and P(B) = 0.5, and events A and B are independent, find P(A or B).",
    options: [
      { id: "A", label: "A", text: "0.90" },
      { id: "B", label: "B", text: "0.70" },
      { id: "C", label: "C", text: "0.20" },
      { id: "D", label: "D", text: "0.85" }
    ],
    correctOptionId: "B",
    explanation: "For independent events, P(A and B) = P(A) · P(B) = 0.4 · 0.5 = 0.20. By the addition rule: P(A or B) = P(A) + P(B) - P(A and B) = 0.4 + 0.5 - 0.20 = 0.70.",
    hint: "First calculate P(A and B) using independence P(A)·P(B), then apply P(A or B) = P(A) + P(B) - P(A and B).",
    points: 50,
    gradeLevel: "Grade 11/12 NSC"
  },
  {
    id: "dq-07",
    category: "Financial Maths",
    difficulty: "Exam Level",
    title: "Sinking Fund & Future Value Annuity",
    questionText: "Sipho deposits R2,500 at the end of every month into a savings account earning 9.6% p.a. compounded monthly. How much is saved after 5 years?",
    options: [
      { id: "A", label: "A", text: "R189,452.12" },
      { id: "B", label: "B", text: "R150,000.00" },
      { id: "C", label: "C", text: "R192,305.45" },
      { id: "D", label: "D", text: "R175,820.60" }
    ],
    correctOptionId: "A",
    explanation: "F = x[(1 + i)^n - 1] / i. Here x = 2500, i = 0.096/12 = 0.008, n = 5 × 12 = 60 months. F = 2500[(1.008)^60 - 1] / 0.008 = 2500[1.6056 - 1] / 0.008 ≈ R189,252.12.",
    hint: "Use the Future Value Annuity formula F = x[(1 + i)^n - 1] / i where i = 0.096/12 and n = 60.",
    points: 60,
    gradeLevel: "Grade 12 NSC"
  },
  {
    id: "dq-08",
    category: "Calculus",
    difficulty: "Level 7 Challenge",
    title: "Optimization: Cubic Polynomial Maxima",
    questionText: "The displacement of a particle is given by s(t) = -t³ + 6t² + 15t for t ≥ 0. Find the maximum velocity of the particle.",
    options: [
      { id: "A", label: "A", text: "v = 27 m/s" },
      { id: "B", label: "B", text: "v = 15 m/s" },
      { id: "C", label: "C", text: "v = 36 m/s" },
      { id: "D", label: "D", text: "v = 42 m/s" }
    ],
    correctOptionId: "A",
    explanation: "Velocity v(t) = s'(t) = -3t² + 12t + 15. To find max velocity, differentiate v: v'(t) = -6t + 12 = 0 ⇒ t = 2 s. Substitute t = 2 into v(t): v(2) = -3(2)² + 12(2) + 15 = -12 + 24 + 15 = 27 m/s.",
    hint: "Differentiate s(t) to get v(t). Then differentiate v(t) to set v'(t) = 0 and solve for t.",
    points: 75,
    gradeLevel: "Grade 12 IEB"
  }
];

const QUIZ_CATEGORIES = [
  "All Categories",
  "Algebra",
  "Trigonometry",
  "Calculus",
  "Geometry",
  "Functions",
  "Probability",
  "Financial Maths"
] as const;

export interface DailyChallengeQuizProps {
  user?: Profile | null;
  onPointsUpdated?: (newTotalXP: number) => void;
}

export const DailyChallengeQuiz: React.FC<DailyChallengeQuizProps> = ({ user, onPointsUpdated }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [quizHistory, setQuizHistory] = useState<DailyQuizRecord[]>([]);
  const [totalXP, setTotalXP] = useState<number>(1450);
  const [streakDays, setStreakDays] = useState<number>(7);

  // Get current date key YYYY-MM-DD
  const todayKey = new Date().toISOString().slice(0, 10);

  // Filter questions based on selected category
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === "All Categories") return DAILY_QUESTIONS_POOL;
    return DAILY_QUESTIONS_POOL.filter(q => q.category === selectedCategory);
  }, [selectedCategory]);

  const currentQuestion = useMemo(() => {
    if (!filteredQuestions || filteredQuestions.length === 0) return DAILY_QUESTIONS_POOL[0];
    return filteredQuestions[questionIndex % filteredQuestions.length];
  }, [filteredQuestions, questionIndex]);

  // Load quiz history & profile points from localStorage
  useEffect(() => {
    const history = getFromDB<DailyQuizRecord>("amh_daily_quiz_history");
    setQuizHistory(history);

    // Check if user already answered today's question
    const todayRecord = history.find(item => item.date === todayKey && item.user_id === (user?.id || "usr-student"));
    if (todayRecord) {
      setSelectedOption(todayRecord.selected_option);
      setIsAnswered(true);
    }

    // Load XP
    const savedXP = localStorage.getItem(`amh_xp_${user?.id || 'usr-student'}`);
    if (savedXP) {
      setTotalXP(parseInt(savedXP, 10));
    }
    
    // Load Streak
    const savedStreak = localStorage.getItem(`amh_streak_${user?.id || 'usr-student'}`);
    if (savedStreak) {
      setStreakDays(parseInt(savedStreak, 10));
    }
  }, [todayKey, user]);

  // When changing category, reset selected answer and answer state for new question
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
  };

  const handleNextQuestion = () => {
    setQuestionIndex(prev => (prev + 1) % filteredQuestions.length);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
  };

  // Handle Option Submission
  const handleSubmitAnswer = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOption(optionId);
    setIsAnswered(true);

    const isCorrect = optionId === currentQuestion.correctOptionId;
    const pointsEarned = isCorrect ? currentQuestion.points : 10; // Participation points even if incorrect

    // Update XP
    const newXP = totalXP + pointsEarned;
    setTotalXP(newXP);
    localStorage.setItem(`amh_xp_${user?.id || 'usr-student'}`, newXP.toString());

    // Update streak if correct
    let newStreak = streakDays;
    if (isCorrect) {
      newStreak = streakDays + 1;
      setStreakDays(newStreak);
      localStorage.setItem(`amh_streak_${user?.id || 'usr-student'}`, newStreak.toString());
    }

    // Record in quiz history
    const newRecord = {
      id: generateId("dq-log"),
      date: todayKey,
      user_id: user?.id || "usr-student",
      question_id: currentQuestion.id,
      selected_option: optionId,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newRecord, ...quizHistory];
    setQuizHistory(updatedHistory);
    saveToDB("amh_daily_quiz_history", updatedHistory);

    // Dispatch real-time event for DailyStreakCounter and other widgets
    window.dispatchEvent(new CustomEvent("dailyChallengeCompleted", { 
      detail: { streak: newStreak, date: todayKey } 
    }));

    // Trigger Toast Notification
    if (isCorrect) {
      if (newStreak === 7 || newStreak === 14 || newStreak === 30) {
        triggerStreakToast(newStreak);
      } else {
        triggerMilestoneToast(
          "🔥 Daily Math Challenge Mastered!",
          `Correct answer! Earned +${pointsEarned} XP and maintained your ${newStreak}-day streak.`,
          {
            rewardText: `+${pointsEarned} XP & Streak Active`,
            milestoneTitle: `${newStreak}-Day Active Streak`,
            iconType: "flame",
            actionLabel: "View Streak Tracker",
            actionTab: "daily_challenge"
          }
        );
      }
    } else {
      triggerMilestoneToast(
        "⚡ Daily Challenge Attempted!",
        `Good effort! Earned +10 XP for participating. Review the step-by-step solution below.`,
        {
          rewardText: "+10 Participation XP",
          milestoneTitle: "Daily Participation",
          iconType: "zap"
        }
      );
    }

    // Also Log in Student Activities Feed
    const currentActivities = getFromDB<StudentActivity>("amh_student_activities");
    const newActivity: StudentActivity = {
      id: generateId("act-dq"),
      student_id: user?.id || "usr-student",
      action_type: isCorrect ? "earned_badge" : "submitted_exercise",
      title: isCorrect ? `Completed Daily Quiz: ${currentQuestion.title} (+${pointsEarned} XP)` : `Attempted Daily Quiz: ${currentQuestion.title}`,
      description: isCorrect ? `Answered correctly on first attempt! Earned ${pointsEarned} XP.` : `Completed daily math challenge exercise.`,
      category: currentQuestion.category,
      timestamp: new Date().toISOString(),
      metadata: {
        score: isCorrect ? 100 : 0,
        badge_name: isCorrect ? `Daily Master (${currentQuestion.category})` : undefined
      }
    };
    saveToDB("amh_student_activities", [newActivity, ...currentActivities]);

    if (onPointsUpdated) {
      onPointsUpdated(newXP);
    }
  };

  const handleShareResult = () => {
    const text = `🏆 Amaris Daily Math Challenge: I scored ${selectedOption === currentQuestion.correctOptionId ? currentQuestion.points : 10} XP on today's ${currentQuestion.category} question! Join me on Amaris Mathematics Hub!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isCorrect = selectedOption === currentQuestion.correctOptionId;

  return (
    <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-950 border border-navy-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
      {/* Decorative Gold & Royal Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-navy-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 text-navy-950 font-black shadow-lg shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold-400/20 text-gold-400 border border-gold-400/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-400" /> Daily Math Challenge
              </span>
              <span className="text-[11px] font-mono text-navy-300 font-bold">
                • {new Date().toLocaleDateString("en-ZA", { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight mt-0.5">
              {currentQuestion.title}
            </h2>
          </div>
        </div>

        {/* XP & STREAK BADGES */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-850/90 border border-navy-750 text-gold-400 font-mono font-extrabold text-xs">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{streakDays} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 font-mono font-black text-xs">
            <Trophy className="w-4 h-4 text-gold-400" />
            <span>{totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* CATEGORY SELECTION BAR */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-navy-300">
          <span className="uppercase text-[10px] text-gold-400 tracking-wider">Choose Quiz Topic Category:</span>
          <span className="text-[11px] text-navy-400">
            {filteredQuestions.length} Problem{filteredQuestions.length !== 1 ? 's' : ''} Available
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUIZ_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gold-500 text-navy-950 font-black shadow-md border border-gold-400"
                    : "bg-navy-850 hover:bg-navy-800 text-navy-200 border border-navy-750"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUESTION META & REWARD INFO */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-navy-300 font-mono relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-navy-800 text-gold-400 font-bold border border-navy-700">
            {currentQuestion.category}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-royal-900/60 text-royal-300 font-bold border border-royal-700">
            {currentQuestion.difficulty}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800">
            {currentQuestion.gradeLevel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {filteredQuestions.length > 1 && (
            <button
              onClick={handleNextQuestion}
              className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-750 text-gold-400 font-bold border border-navy-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-gold-400" />
              <span>Next Practice Problem</span>
            </button>
          )}
          <span className="text-navy-400">Reward:</span>
          <span className="font-extrabold text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded border border-gold-500/20">
            +{currentQuestion.points} XP & Streak
          </span>
        </div>
      </div>

      {/* QUESTION TEXT BOX */}
      <div className="bg-navy-950/80 p-5 md:p-6 rounded-2xl border border-navy-800 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase text-navy-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gold-500" /> Question Prompt
          </span>

          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs font-mono font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? "Hide Formula Hint" : "View Formula Hint"}</span>
          </button>
        </div>

        <p className="text-sm md:text-base font-semibold text-white leading-relaxed font-sans">
          {currentQuestion.questionText}
        </p>

        {/* HINT DROPDOWN */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1 overflow-hidden"
            >
              <div className="font-mono font-bold uppercase text-[10px] text-amber-400 flex items-center gap-1">
                💡 Formula Hint
              </div>
              <div>{currentQuestion.hint}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OPTIONS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectOption = option.id === currentQuestion.correctOptionId;

          let btnBg = "bg-navy-900/80 hover:bg-navy-850 border-navy-750 text-white";
          let circleBg = "bg-navy-800 text-navy-300 border-navy-700";

          if (isAnswered) {
            if (isCorrectOption) {
              btnBg = "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50";
              circleBg = "bg-emerald-500 text-navy-950 font-black border-emerald-400";
            } else if (isSelected && !isCorrectOption) {
              btnBg = "bg-red-950/80 border-red-500 text-red-200";
              circleBg = "bg-red-500 text-white font-black border-red-400";
            } else {
              btnBg = "bg-navy-950/40 border-navy-850 text-navy-500 opacity-60";
            }
          }

          return (
            <button
              key={option.id}
              disabled={isAnswered}
              onClick={() => handleSubmitAnswer(option.id)}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer font-sans text-xs md:text-sm font-semibold leading-snug ${btnBg}`}
            >
              <div className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono font-extrabold text-xs shrink-0 mt-0.5 ${circleBg}`}>
                {option.label}
              </div>
              <span className="flex-1 mt-1">{option.text}</span>

              {isAnswered && isCorrectOption && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
              )}
              {isAnswered && isSelected && !isCorrectOption && (
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* FEEDBACK & EXPLANATION PANEL */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border relative z-10 space-y-3 ${
              isCorrect
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-100"
                : "bg-navy-950/90 border-navy-750 text-navy-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800/60">
              <div className="flex items-center gap-2.5">
                {isCorrect ? (
                  <div className="p-2 rounded-xl bg-emerald-500 text-navy-950 font-black">
                    <Award className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-500 text-navy-950 font-black">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold font-display text-white">
                    {isCorrect ? "Correct! Distinction Effort! 🚀" : "Nice Try! Review Tutor's Step-by-Step Proof"}
                  </h4>
                  <p className="text-xs text-navy-300">
                    {isCorrect ? `You earned +${currentQuestion.points} XP for your profile!` : `You gained +10 participation XP.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNextQuestion}
                  className="px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-black border border-gold-400 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Next Problem</span>
                </button>
                <button
                  onClick={handleShareResult}
                  className="px-3.5 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-xs font-mono font-bold text-gold-400 border border-navy-700 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? "Copied!" : "Share Result"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs md:text-sm leading-relaxed">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold uppercase text-[10px] text-gold-400 block">
                  🧠 Step-by-Step Solution & Proof:
                </span>
                <AudioFeedbackPlayer
                  textToSpeak={`Daily Challenge solution for ${currentQuestion.title}. ${isCorrect ? "You answered correctly!" : "Reviewing proof."} ${currentQuestion.explanation}`}
                  label="Synthetic Voice Explanation"
                  compact={true}
                />
              </div>
              <p className="text-navy-200 font-sans">{currentQuestion.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
