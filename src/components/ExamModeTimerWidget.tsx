import React, { useState, useEffect, useRef } from "react";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Award, 
  Zap, 
  Clock, 
  HelpCircle, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  X, 
  Sliders, 
  Calculator,
  Flame,
  Check,
  Maximize2
} from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { VisualLatexToolbar } from "./VisualLatexToolbar";
import { dbAPI } from "../lib/db";
import { Profile } from "../types";

export interface ExamTopicPreset {
  id: string;
  paper: "Paper 1" | "Paper 2";
  name: string;
  defaultMarks: number;
  recommendedMins: number; // calculated at ~1.2 min/mark
  capsCode: string;
  description: string;
  keyFormulas: string[];
}

export const EXAM_TOPIC_PRESETS: ExamTopicPreset[] = [
  {
    id: "p1-algebra",
    paper: "Paper 1",
    name: "Algebra, Equations & Inequalities",
    defaultMarks: 25,
    recommendedMins: 30,
    capsCode: "CAPS P1-Q1",
    description: "Quadratic equations, nature of roots, simultaneous equations & exponents/surds.",
    keyFormulas: [
      "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      "\\Delta = b^2 - 4ac",
      "x^a \\cdot x^b = x^{a+b}"
    ]
  },
  {
    id: "p1-sequences",
    paper: "Paper 1",
    name: "Patterns, Sequences & Series",
    defaultMarks: 25,
    recommendedMins: 30,
    capsCode: "CAPS P1-Q2/3",
    description: "Arithmetic & geometric sequences, sigma notation, sum to infinity & quadratic patterns.",
    keyFormulas: [
      "T_n = a + (n-1)d",
      "S_n = \\frac{n}{2}[2a + (n-1)d]",
      "T_n = a r^{n-1}",
      "S_n = \\frac{a(r^n - 1)}{r - 1}",
      "S_{\\infty} = \\frac{a}{1-r} \\quad (|r| < 1)"
    ]
  },
  {
    id: "p1-functions",
    paper: "Paper 1",
    name: "Functions & Inverse Graphs",
    defaultMarks: 35,
    recommendedMins: 42,
    capsCode: "CAPS P1-Q4/5/6",
    description: "Straight line, parabola, hyperbola, exponential functions & inverse graphs f⁻¹.",
    keyFormulas: [
      "f(x) = a(x-p)^2 + q",
      "f(x) = \\frac{a}{x-p} + q",
      "y = a \\cdot b^{x-p} + q",
      "x = -\\frac{b}{2a}"
    ]
  },
  {
    id: "p1-finance",
    paper: "Paper 1",
    name: "Financial Mathematics & Annuities",
    defaultMarks: 15,
    recommendedMins: 18,
    capsCode: "CAPS P1-Q7",
    description: "Simple & compound interest, nominal vs effective rates, sinking funds, present & future value annuities.",
    keyFormulas: [
      "A = P(1+i)^n",
      "A = P(1 - i \\cdot n)",
      "P_v = x \\left[ \\frac{1 - (1+i)^{-n}}{i} \\right]",
      "F_v = x \\left[ \\frac{(1+i)^n - 1}{i} \\right]"
    ]
  },
  {
    id: "p1-calculus",
    paper: "Paper 1",
    name: "Differential Calculus & Optimization",
    defaultMarks: 35,
    recommendedMins: 42,
    capsCode: "CAPS P1-Q8/9/10",
    description: "First principles derivative limit, power rule, cubic functions, tangents & optimization word problems.",
    keyFormulas: [
      "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
      "\\frac{d}{dx}[x^n] = n x^{n-1}",
      "f''(x) = 0 \\implies \\text{Inflexion Point}"
    ]
  },
  {
    id: "p1-probability",
    paper: "Paper 1",
    name: "Probability & Counting Principles",
    defaultMarks: 15,
    recommendedMins: 18,
    capsCode: "CAPS P1-Q11",
    description: "Venn diagrams, tree diagrams, mutually exclusive & independent events, fundamental counting principle.",
    keyFormulas: [
      "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
      "P(A \\cap B) = P(A) \\cdot P(B) \\iff \\text{Independent}",
      "n! \\quad \\text{Factorial Arrangements}"
    ]
  },
  {
    id: "p2-trig",
    paper: "Paper 2",
    name: "Trigonometry & Reduction Formulas",
    defaultMarks: 40,
    recommendedMins: 48,
    capsCode: "CAPS P2-Q5/6/7",
    description: "CAST diagram, reductions, double & compound angles, trig equations, 2D/3D height problems.",
    keyFormulas: [
      "\\sin^2\\theta + \\cos^2\\theta = 1",
      "\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta",
      "\\cos(2\\alpha) = \\cos^2\\alpha - \\sin^2\\alpha",
      "a^2 = b^2 + c^2 - 2bc \\cos A",
      "\\frac{\\sin A}{a} = \\frac{\\sin B}{b}"
    ]
  },
  {
    id: "p2-euclidean",
    paper: "Paper 2",
    name: "Euclidean Geometry & Proportionality",
    defaultMarks: 50,
    recommendedMins: 60,
    capsCode: "CAPS P2-Q8/9/10",
    description: "Circle geometry theorems, cyclic quadrilaterals, tangents, midpoint theorem, equiangular triangles & ratio theorems.",
    keyFormulas: [
      "\\hat{O} = 2 \\hat{A} \\quad (\\text{Angle at centre})",
      "\\hat{A} + \\hat{C} = 180^\\circ \\quad (\\text{Opp angles cyclic quad})",
      "\\frac{AD}{DB} = \\frac{AE}{EC} \\quad (\\text{Prop Theorem})"
    ]
  },
  {
    id: "p2-analytical",
    paper: "Paper 2",
    name: "Analytical Geometry & Circles",
    defaultMarks: 30,
    recommendedMins: 36,
    capsCode: "CAPS P2-Q3/4",
    description: "Distance formula, midpoint, gradient, inclination angle, equation of circle & tangent to circle.",
    keyFormulas: [
      "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}",
      "M\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)",
      "m = \\tan \\theta",
      "(x-a)^2 + (y-b)^2 = r^2"
    ]
  },
  {
    id: "p2-statistics",
    paper: "Paper 2",
    name: "Statistics & Bivariate Data",
    defaultMarks: 20,
    recommendedMins: 24,
    capsCode: "CAPS P2-Q1/2",
    description: "Mean, standard deviation, five-number summary, box plots, ogive curves & least squares regression line y = a + bx.",
    keyFormulas: [
      "\\bar{x} = \\frac{\\sum x}{n}",
      "\\hat{y} = a + bx",
      "r \\quad (\\text{Correlation coefficient})"
    ]
  }
];

export interface ExamModeTimerWidgetProps {
  user?: Profile | null;
  className?: string;
}

export const ExamModeTimerWidget: React.FC<ExamModeTimerWidgetProps> = ({
  user,
  className = ""
}) => {
  // Preset Selection State
  const [examType, setExamType] = useState<"caps" | "ieb">("caps");
  const [selectedPaper, setSelectedPaper] = useState<"All" | "Paper 1" | "Paper 2">("All");
  const [activePreset, setActivePreset] = useState<ExamTopicPreset>(EXAM_TOPIC_PRESETS[0]);
  
  // Custom mode vs preset mode
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>("Calculus & Trig Sprint");
  const [targetMarks, setTargetMarks] = useState<number>(activePreset.defaultMarks);
  const [timerMins, setTimerMins] = useState<number>(activePreset.recommendedMins);

  // Active Timer State
  const [secondsLeft, setSecondsLeft] = useState<number>(activePreset.recommendedMins * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(activePreset.recommendedMins * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // In-session Student Working State
  const [studentWorkingText, setStudentWorkingText] = useState<string>("");
  const [showFormulaSheet, setShowFormulaSheet] = useState<boolean>(false);

  // Post-Session Grading Modal State
  const [showGradingModal, setShowGradingModal] = useState<boolean>(false);
  const [marksAchieved, setMarksAchieved] = useState<number>(Math.round(activePreset.defaultMarks * 0.8));
  const [sessionRating, setSessionRating] = useState<number>(4);
  const [reflectionNotes, setReflectionNotes] = useState<string>("");
  const [isSavingScore, setIsSavingScore] = useState<boolean>(false);
  const [scoreSavedSuccess, setScoreSavedSuccess] = useState<boolean>(false);

  // Web Audio API Chime Synthesizer
  const playAlertSound = (frequency = 880, type: OscillatorType = "sine", duration = 0.4) => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio synthesis unavailable:", e);
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && !isPaused && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            setIsFinished(true);
            playAlertSound(523.25, "sawtooth", 1.2); // Time Up Buzzer sound!
            setShowGradingModal(true);
            return 0;
          }

          // Warning chimes at 5 mins (300s) and 1 min (60s)
          if (prev === 300) {
            playAlertSound(880, "sine", 0.5); // 5 min warning
          } else if (prev === 60) {
            playAlertSound(1046.5, "triangle", 0.6); // 1 min warning
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, secondsLeft]);

  // Sync Timer Preset changes when user selects a preset
  const handleSelectPreset = (preset: ExamTopicPreset) => {
    setActivePreset(preset);
    setIsCustomMode(false);
    setTargetMarks(preset.defaultMarks);
    setTimerMins(preset.recommendedMins);
    const secs = preset.recommendedMins * 60;
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
  };

  // Calculate standard recommended time based on target marks (1.2 mins per mark)
  const handleMarksChange = (marks: number) => {
    const validMarks = Math.max(1, Math.min(150, marks));
    setTargetMarks(validMarks);
    const recommended = Math.ceil(validMarks * 1.2);
    setTimerMins(recommended);
    const secs = recommended * 60;
    setSecondsLeft(secs);
    setTotalSeconds(secs);
  };

  // Timer Action Handlers
  const handleStartTimer = () => {
    if (secondsLeft <= 0) {
      const secs = timerMins * 60;
      setSecondsLeft(secs);
      setTotalSeconds(secs);
    }
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
    playAlertSound(659.25, "sine", 0.3);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      playAlertSound(659.25, "sine", 0.2);
    } else {
      setIsPaused(true);
      playAlertSound(440, "sine", 0.2);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    const secs = timerMins * 60;
    setSecondsLeft(secs);
    setTotalSeconds(secs);
  };

  const handleAdd3Minutes = () => {
    setSecondsLeft((prev) => prev + 180);
    setTotalSeconds((prev) => prev + 180);
    playAlertSound(783.99, "sine", 0.25);
  };

  // Format Time Output: MM:SS or HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress Percentage & Color
  const progressPercent = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isUrgent = secondsLeft <= 300 && secondsLeft > 0; // Last 5 minutes
  const isCritical = secondsLeft <= 60 && secondsLeft > 0; // Last 1 minute

  let ringColor = "stroke-emerald-500 text-emerald-500";
  if (progressPercent <= 20) {
    ringColor = "stroke-rose-500 text-rose-500 animate-pulse";
  } else if (progressPercent <= 50) {
    ringColor = "stroke-amber-500 text-amber-500";
  }

  // Save Session Score to DB & Local Logs
  const handleSaveSessionScore = () => {
    setIsSavingScore(true);
    const studentId = user?.id || "guest_student";
    const percentage = Math.round((marksAchieved / targetMarks) * 100);
    
    // Calculate time spent in minutes
    const timeSpentSecs = totalSeconds - secondsLeft;
    const timeSpentMins = Math.max(1, Math.round(timeSpentSecs / 60));

    const topicTitle = isCustomMode ? customTitle : activePreset.name;

    try {
      dbAPI.addMockExamScore({
        student_id: studentId,
        exam_title: `${examType.toUpperCase()} Exam Sprint: ${topicTitle}`,
        subject_or_topic: isCustomMode ? "Custom Practice" : activePreset.paper,
        score_percentage: percentage,
        exam_date: new Date().toISOString().split("T")[0],
        notes: `Score: ${marksAchieved}/${targetMarks} marks (${percentage}%). ${
          reflectionNotes 
            ? `Self-Assessment (${sessionRating}/5 ★): ${reflectionNotes}` 
            : `Timed Sprint finished in ${timeSpentMins} mins (${(timeSpentMins / targetMarks).toFixed(1)} min/mark).`
        }`
      });

      setScoreSavedSuccess(true);
      setTimeout(() => {
        setIsSavingScore(false);
        setShowGradingModal(false);
        setScoreSavedSuccess(false);
        handleResetTimer();
      }, 1500);
    } catch (e) {
      console.error("Error saving exam score:", e);
      setIsSavingScore(false);
    }
  };

  const filteredPresets = EXAM_TOPIC_PRESETS.filter((p) => {
    if (selectedPaper === "All") return true;
    return p.paper === selectedPaper;
  });

  return (
    <div className={`bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 text-left relative overflow-hidden ${className}`}>
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-royal-600 to-amber-400" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                Exam Mode Timer Simulator
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold tracking-normal">
                  CAPS & IEB Timed Practice
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Train under real South African matric exam time limits (1.2 mins per mark)
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls: Syllabus Selector & Audio Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setExamType("caps")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                examType === "caps"
                  ? "bg-royal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              NSC CAPS
            </button>
            <button
              type="button"
              onClick={() => setExamType("ieb")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                examType === "ieb"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              IEB Final
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isAudioMuted
                ? "bg-slate-100 dark:bg-navy-950 text-slate-400 border-slate-200 dark:border-navy-800"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            }`}
            title={isAudioMuted ? "Unmute Timer Warning Alerts" : "Mute Timer Warning Alerts"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.setItem("amh_focus_mode", "true");
              window.dispatchEvent(new CustomEvent("focusModeToggle", { detail: { active: true } }));
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-mono font-black text-xs rounded-xl shadow-xs transition-transform hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
            title="Enter Deep Focus Mode: Hide all dashboard widgets & notifications"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Deep Focus Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFormulaSheet(!showFormulaSheet)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-royal-500" />
            <span>Formula Sheet</span>
          </button>
        </div>
      </div>

      {/* TOPIC SELECTION GRID OR TIMER RUNNING VIEW */}
      {!isRunning && !isPaused && secondsLeft === totalSeconds ? (
        <div className="space-y-4">
          {/* Paper Filter Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs font-mono font-bold">
              {(["All", "Paper 1", "Paper 2"] as const).map((paper) => (
                <button
                  key={paper}
                  type="button"
                  onClick={() => setSelectedPaper(paper)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedPaper === paper
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {paper === "All" ? "All Topics" : paper}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isCustomMode
                  ? "bg-purple-600 text-white border-purple-700 shadow-xs"
                  : "bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-purple-400"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isCustomMode ? "Use Preset Topic" : "Custom Target Sprint"}</span>
            </button>
          </div>

          {/* CUSTOM SPRINT SETUP vs PRESET CARDS */}
          {isCustomMode ? (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-black uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Custom Exam Session Configuration
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Standard Pace: 1.2 Mins / Mark
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Practice Title / Topic
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Calculus Tangents Sprint"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Target Marks (5 - 150)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    value={targetMarks}
                    onChange={(e) => handleMarksChange(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Allocated Minutes ({timerMins}m)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={timerMins}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value) || 15;
                      setTimerMins(mins);
                      setSecondsLeft(mins * 60);
                      setTotalSeconds(mins * 60);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-purple-800 dark:text-purple-300 font-semibold text-[11px]">
                  Target Pace: <strong className="font-mono">{(timerMins / targetMarks).toFixed(2)} mins/mark</strong>
                </span>
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-royal-600 hover:from-purple-700 hover:to-royal-700 text-white font-mono font-black text-xs rounded-xl shadow-md transition-transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START CUSTOM EXAM SPRINT</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPresets.map((preset) => {
                const isSelected = activePreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500 shadow-md ring-2 ring-amber-500/30"
                        : "bg-slate-50 dark:bg-navy-950/60 border-slate-200 dark:border-navy-800 hover:border-amber-400"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-royal-500/20 text-royal-600 dark:text-gold-400 font-mono font-bold text-[10px]">
                          {preset.paper} • {preset.capsCode}
                        </span>
                        <span className="text-[11px] font-mono font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          {preset.defaultMarks} Marks
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-navy-800/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {preset.recommendedMins} Mins
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        ~1.2m/mark
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Start Selected Preset Bar */}
          {!isCustomMode && activePreset && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="space-y-0.5 text-left">
                <div className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                  Ready to practice selected topic:
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {activePreset.name} ({activePreset.defaultMarks} Marks • {activePreset.recommendedMins} Minutes)
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartTimer}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-mono font-black text-xs rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START TIMED PRACTICE NOW</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ACTIVE TIMED SESSION VIEW */
        <div className="space-y-6">
          {/* Active Session Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                In Progress: {isCustomMode ? customTitle : activePreset.name}
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Target: {targetMarks} Marks | Standard Pace Target: 1.2 Mins/Mark
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAdd3Minutes}
                className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Add 3 minutes extension"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+3 Mins Panic Extension</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGradingModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Finish & Grade</span>
              </button>
            </div>
          </div>

          {/* MAIN CIRCULAR COUNTDOWN RING & BIG DISPLAY */}
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* SVG Circular Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-200 dark:stroke-navy-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`${ringColor} transition-all duration-1000 ease-linear`}
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center Digital Clock Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${
                  isCritical ? "text-rose-600 dark:text-rose-400 animate-pulse" :
                  isUrgent ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
                }`}>
                  {formatTime(secondsLeft)}
                </span>
                
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-1 font-bold">
                  {isPaused ? "⏸️ TIMER PAUSED" : isFinished ? "🔔 TIME EXPIRED!" : "⏱️ COUNTDOWN ACTIVE"}
                </span>

                {/* Live Pace Indicator */}
                <div className="text-[9px] font-mono text-royal-600 dark:text-gold-400 font-bold mt-1">
                  Remaining Pace: {((secondsLeft / 60) / targetMarks).toFixed(1)} m/mark
                </div>
              </div>
            </div>

            {/* TIMER CONTROLS BAR */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePauseResume}
                className={`px-5 py-2.5 rounded-2xl font-mono font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-transform hover:scale-105 ${
                  isPaused
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                }`}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                <span>{isPaused ? "RESUME SESSION" : "PAUSE TIMER"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetTimer}
                className="px-4 py-2.5 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* IN-SESSION STUDENT WORKING & FORMULA TOOLBAR */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-navy-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-royal-500" />
                Live Student Working Scratchpad (LaTeX)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Draft mathematical steps while working
              </span>
            </div>

            <VisualLatexToolbar
              value={studentWorkingText}
              onChange={setStudentWorkingText}
              placeholder="Type your mathematical steps here (e.g. x^2 - 5x + 6 = 0 \implies (x-2)(x-3) = 0)..."
              rows={3}
              showLivePreview={true}
            />
          </div>
        </div>
      )}

      {/* FORMULA SHEET MODAL */}
      {showFormulaSheet && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-royal-500/20 text-royal-600 dark:text-gold-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-black text-slate-900 dark:text-white uppercase">
                    NSC CAPS / IEB Mathematics Official Formula Sheet
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Standard formulas provided during Paper 1 & Paper 2 examinations
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFormulaSheet(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section 1: Algebra & Sequences */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="text-xs font-mono font-bold text-royal-600 dark:text-gold-400 uppercase">
                  1. Algebra & Series
                </h4>
                <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Quadratic Formula:</span>
                    <LatexRenderer text="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Arithmetic Series:</span>
                    <LatexRenderer text="T_n = a + (n-1)d \quad | \quad S_n = \frac{n}{2}[2a + (n-1)d]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Geometric Series:</span>
                    <LatexRenderer text="T_n = a r^{n-1} \quad | \quad S_n = \frac{a(r^n - 1)}{r - 1}" />
                  </div>
                </div>
              </div>

              {/* Section 2: Financial Math */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  2. Financial Mathematics
                </h4>
                <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Compound Interest & Decay:</span>
                    <LatexRenderer text="A = P(1+i)^n \quad | \quad A = P(1-i)^n" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Annuities (Present & Future):</span>
                    <LatexRenderer text="P_v = x \left[ \frac{1 - (1+i)^{-n}}{i} \right] \quad | \quad F_v = x \left[ \frac{(1+i)^n - 1}{i} \right]" />
                  </div>
                </div>
              </div>

              {/* Section 3: Calculus */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
                  3. Differential Calculus
                </h4>
                <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">First Principles Limit:</span>
                    <LatexRenderer text="f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}" />
                  </div>
                </div>
              </div>

              {/* Section 4: Trigonometry */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                  4. Trigonometry Rules
                </h4>
                <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Sine & Cosine Rules:</span>
                    <LatexRenderer text="\frac{\sin A}{a} = \frac{\sin B}{b} \quad | \quad a^2 = b^2 + c^2 - 2bc \cos A" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Compound Angles:</span>
                    <LatexRenderer text="\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POST-SESSION REFLECTION & SCORE GRADING MODAL */}
      {showGradingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-5 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-black text-slate-900 dark:text-white uppercase">
                    Timed Practice Session Reflection
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Grade your working and log your performance to dashboard metrics
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGradingModal(false)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Score Input */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Marks Scored:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {marksAchieved} / {targetMarks} ({Math.round((marksAchieved / targetMarks) * 100)}%)
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={targetMarks}
                  value={marksAchieved}
                  onChange={(e) => setMarksAchieved(parseInt(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Self Rating */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Confidence & Speed Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSessionRating(star)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        star <= sessionRating
                          ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs"
                          : "bg-slate-100 dark:bg-navy-950 text-slate-400 border-slate-200 dark:border-navy-800"
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Self-Reflection / Revision Notes
                </label>
                <textarea
                  rows={3}
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="e.g. Felt fast on first principles calculus, but made a sign error in question 3..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit & Log Button */}
              <button
                type="button"
                onClick={handleSaveSessionScore}
                disabled={isSavingScore || scoreSavedSuccess}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSavingScore ? (
                  <span>LOGGING SCORE...</span>
                ) : scoreSavedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>SCORE SAVED TO DASHBOARD!</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>LOG SESSION TO PERFORMANCE METRICS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
