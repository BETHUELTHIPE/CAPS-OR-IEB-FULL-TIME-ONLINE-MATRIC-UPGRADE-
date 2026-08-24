import React, { useState, useEffect, useRef } from "react";
import { 
  Target, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle, 
  Award, 
  Clock, 
  BookOpen, 
  HelpCircle, 
  Plus, 
  X, 
  Calculator, 
  Flame, 
  Brain, 
  Headphones, 
  ChevronRight, 
  Zap,
  Eye,
  EyeOff,
  Check
} from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { VisualLatexToolbar } from "./VisualLatexToolbar";
import { EXAM_TOPIC_PRESETS, ExamTopicPreset } from "./ExamModeTimerWidget";
import { dbAPI } from "../lib/db";
import { Profile } from "../types";

export interface DeepFocusMathProblem {
  id: string;
  topicId: string;
  questionNumber: string;
  marks: number;
  questionLatex: string;
  hintLatex: string;
  solutionLatex: string;
}

export const SAMPLE_DEEP_FOCUS_PROBLEMS: DeepFocusMathProblem[] = [
  {
    id: "prob-alg-1",
    topicId: "p1-algebra",
    questionNumber: "CAPS P1 Q1.1",
    marks: 4,
    questionLatex: "\\text{Solve for } x \\text{ (correct to two decimal places): } \\quad 3x^2 - 7x - 5 = 0",
    hintLatex: "\\text{Use the quadratic formula: } x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad \\text{with } a=3, b=-7, c=-5",
    solutionLatex: "x = \\frac{-(-7) \\pm \\sqrt{(-7)^2 - 4(3)(-5)}}{2(3)} = \\frac{7 \\pm \\sqrt{49 + 60}}{6} = \\frac{7 \\pm \\sqrt{109}}{6} \\implies x \\approx 2.91 \\quad \\text{or} \\quad x \\approx -0.58"
  },
  {
    id: "prob-alg-2",
    topicId: "p1-algebra",
    questionNumber: "CAPS P1 Q1.2",
    marks: 6,
    questionLatex: "\\text{Solve for } x \\text{ and } y \\text{ simultaneously: } \\quad 2x - y = 3 \\quad \\text{and} \\quad x^2 + xy - y^2 = 7",
    hintLatex: "\\text{Make } y \\text{ the subject in the linear equation: } y = 2x - 3, \\text{ then substitute into the quadratic equation.}",
    solutionLatex: "y = 2x - 3 \\implies x^2 + x(2x-3) - (2x-3)^2 = 7 \\implies x^2 + 2x^2 - 3x - (4x^2 - 12x + 9) = 7 \\implies -x^2 + 9x - 16 = 0"
  },
  {
    id: "prob-seq-1",
    topicId: "p1-sequences",
    questionNumber: "CAPS P1 Q2.1",
    marks: 4,
    questionLatex: "\\text{Given the geometric series: } 12 + 6 + 3 + \\dots \\quad \\text{Calculate } S_{\\infty} \\text{ (sum to infinity)}.",
    hintLatex: "\\text{First find the common ratio } r = \\frac{T_2}{T_1} = \\frac{6}{12} = \\frac{1}{2}. \\text{ Then use } S_{\\infty} = \\frac{a}{1-r}.",
    solutionLatex: "a = 12, \\quad r = \\frac{1}{2} \\implies S_{\\infty} = \\frac{12}{1 - \\frac{1}{2}} = \\frac{12}{\\frac{1}{2}} = 24"
  },
  {
    id: "prob-calc-1",
    topicId: "p1-calculus",
    questionNumber: "CAPS P1 Q8.1",
    marks: 5,
    questionLatex: "\\text{Determine } f'(x) \\text{ from first principles if } f(x) = -2x^2 + 3.",
    hintLatex: "\\text{Use } f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}. \\text{ Expand } f(x+h) = -2(x+h)^2 + 3 = -2x^2 - 4xh - 2h^2 + 3.",
    solutionLatex: "f'(x) = \\lim_{h \\to 0} \\frac{(-2x^2 - 4xh - 2h^2 + 3) - (-2x^2 + 3)}{h} = \\lim_{h \\to 0} \\frac{-4xh - 2h^2}{h} = \\lim_{h \\to 0} (-4x - 2h) = -4x"
  },
  {
    id: "prob-trig-1",
    topicId: "p2-trig",
    questionNumber: "CAPS P2 Q5.1",
    marks: 6,
    questionLatex: "\\text{Simplify without using a calculator: } \\quad \\frac{\\sin(180^\\circ - \\theta) \\cdot \\cos(90^\\circ + \\theta)}{\\tan(360^\\circ - \\theta) \\cdot \\cos(-\\theta)}",
    hintLatex: "\\sin(180^\\circ-\\theta) = \\sin\\theta, \\quad \\cos(90^\\circ+\\theta) = -\\sin\\theta, \\quad \\tan(360^\\circ-\\theta) = -\\tan\\theta, \\quad \\cos(-\\theta) = \\cos\\theta",
    solutionLatex: "\\frac{(\\sin\\theta)(-\\sin\\theta)}{(-\\tan\\theta)(\\cos\\theta)} = \\frac{-\\sin^2\\theta}{-\\frac{\\sin\\theta}{\\cos\\theta} \\cdot \\cos\\theta} = \\frac{-\\sin^2\\theta}{-\\sin\\theta} = \\sin\\theta"
  },
  {
    id: "prob-euc-1",
    topicId: "p2-euclidean",
    questionNumber: "CAPS P2 Q8.2",
    marks: 5,
    questionLatex: "\\text{In a circle with centre } O, \\text{ chord } AB \\text{ subtends angle } \\hat{AOB} = 110^\\circ \\text{ at the centre. Determine the size of angle } \\hat{ACB} \\text{ on the circumference}.",
    hintLatex: "\\text{Theorem: The angle subtended by an arc at the centre of a circle is twice the angle subtended at the circumference: } \\hat{O} = 2 \\hat{C}.",
    solutionLatex: "\\hat{ACB} = \\frac{1}{2} \\hat{AOB} = \\frac{110^\\circ}{2} = 55^\\circ \\quad (\\text{Angle at centre } = 2 \\times \\text{angle at circumference})"
  }
];

export interface DeepFocusWorkspaceProps {
  user?: Profile | null;
  onExitFocusMode: () => void;
}

export const DeepFocusWorkspace: React.FC<DeepFocusWorkspaceProps> = ({
  user,
  onExitFocusMode
}) => {
  // Preset & Active Problem Selection
  const [activePreset, setActivePreset] = useState<ExamTopicPreset>(EXAM_TOPIC_PRESETS[0]);
  const [activeProblem, setActiveProblem] = useState<DeepFocusMathProblem>(SAMPLE_DEEP_FOCUS_PROBLEMS[0]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Student Scratchpad Text
  const [scratchpadText, setScratchpadText] = useState<string>("");

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState<number>(activePreset.recommendedMins * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(activePreset.recommendedMins * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Ambient Audio Mode: "none" | "rain" | "focus_tone"
  const [ambientAudio, setAmbientAudio] = useState<"none" | "rain" | "focus_tone">("none");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<any>(null);

  // Formula Sheet Drawer
  const [showFormulaSheet, setShowFormulaSheet] = useState<boolean>(false);

  // Grading Modal
  const [showGradingModal, setShowGradingModal] = useState<boolean>(false);
  const [marksAchieved, setMarksAchieved] = useState<number>(activeProblem.marks);
  const [reflectionNotes, setReflectionNotes] = useState<string>("");
  const [isSavingScore, setIsSavingScore] = useState<boolean>(false);
  const [scoreSavedSuccess, setScoreSavedSuccess] = useState<boolean>(false);

  // Sync Active Problem when topic preset changes
  useEffect(() => {
    const matchingProb = SAMPLE_DEEP_FOCUS_PROBLEMS.find((p) => p.topicId === activePreset.id) || SAMPLE_DEEP_FOCUS_PROBLEMS[0];
    setActiveProblem(matchingProb);
    setShowHint(false);
    setShowSolution(false);
    setMarksAchieved(matchingProb.marks);
    
    // Reset timer to recommended time
    const secs = activePreset.recommendedMins * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
  }, [activePreset]);

  // Web Audio Synth for Ambient Sound generator
  useEffect(() => {
    // Stop any running ambient audio
    if (ambientNodeRef.current) {
      try {
        ambientNodeRef.current.stop();
        ambientNodeRef.current.disconnect();
      } catch (e) {}
      ambientNodeRef.current = null;
    }

    if (ambientAudio === "none") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (ambientAudio === "focus_tone") {
        // 432Hz Calm Alpha Binaural Focus Tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        ambientNodeRef.current = osc;
      } else if (ambientAudio === "rain") {
        // Pink / Soft Rain Noise Generator
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer loop
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.015;
          b6 = white * 0.115926;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        whiteNoise.connect(gain);
        gain.connect(ctx.destination);
        whiteNoise.start();
        ambientNodeRef.current = whiteNoise;
      }
    } catch (e) {
      console.warn("Ambient audio error:", e);
    }

    return () => {
      if (ambientNodeRef.current) {
        try {
          ambientNodeRef.current.stop();
          ambientNodeRef.current.disconnect();
        } catch (e) {}
        ambientNodeRef.current = null;
      }
    };
  }, [ambientAudio]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && !isPaused && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            setIsFinished(true);
            setShowGradingModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, secondsLeft]);

  // Format Time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const progressPercent = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  // Handle Log Score
  const handleSaveScore = () => {
    setIsSavingScore(true);
    const studentId = user?.id || "guest_student";
    const percentage = Math.round((marksAchieved / activeProblem.marks) * 100);
    const focusedMins = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    const focusedSecs = Math.max(10, totalSeconds - secondsLeft);

    try {
      dbAPI.addMockExamScore({
        student_id: studentId,
        exam_title: `Deep Focus Sprint: ${activeProblem.questionNumber}`,
        subject_or_topic: activePreset.paper,
        score_percentage: percentage,
        exam_date: new Date().toISOString().split("T")[0],
        notes: `Deep Focus solved ${marksAchieved}/${activeProblem.marks} marks. ${reflectionNotes}`
      });

      dbAPI.addDeepFocusSession({
        student_id: studentId,
        topic_name: `${activePreset.name} (${activeProblem.questionNumber})`,
        paper_category: activePreset.paper,
        duration_minutes: focusedMins,
        actual_seconds_focused: focusedSecs,
        marks_achieved: marksAchieved,
        total_marks: activeProblem.marks,
        score_percentage: percentage,
        ambient_audio_used: ambientAudio,
        notes: reflectionNotes || `Completed Deep Focus sprint for ${activeProblem.questionNumber}.`
      });

      setScoreSavedSuccess(true);
      setTimeout(() => {
        setIsSavingScore(false);
        setShowGradingModal(false);
        setScoreSavedSuccess(false);
      }, 1200);
    } catch (e) {
      console.error("Error saving deep focus score:", e);
      setIsSavingScore(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* STICKY DEEP FOCUS CONTROL BAR */}
      <div className="bg-gradient-to-r from-navy-950 via-royal-950 to-navy-950 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold shrink-0">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Deep Focus Active • Zero Distractions
              </span>
              <span className="text-[10px] font-mono text-navy-300 hidden sm:inline">
                [Esc to exit]
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black font-display tracking-tight mt-0.5">
              {activePreset.name} ({activeProblem.questionNumber})
            </h2>
          </div>
        </div>

        {/* Ambient Concentration Audio Selector & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Audio Background Selector */}
          <div className="flex items-center gap-1 bg-navy-900 border border-navy-700 p-1 rounded-2xl text-xs font-mono font-bold">
            <span className="px-2 text-[10px] text-navy-400 uppercase flex items-center gap-1">
              <Headphones className="w-3 h-3 text-amber-400" /> Audio:
            </span>
            <button
              type="button"
              onClick={() => setAmbientAudio("none")}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                ambientAudio === "none" ? "bg-navy-700 text-white font-black" : "text-navy-300 hover:text-white"
              }`}
            >
              Mute
            </button>
            <button
              type="button"
              onClick={() => setAmbientAudio("focus_tone")}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                ambientAudio === "focus_tone" ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-navy-300 hover:text-white"
              }`}
            >
              432Hz Focus
            </button>
            <button
              type="button"
              onClick={() => setAmbientAudio("rain")}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                ambientAudio === "rain" ? "bg-royal-600 text-white font-black shadow-xs" : "text-navy-300 hover:text-white"
              }`}
            >
              Soft Rain
            </button>
          </div>

          <button
            type="button"
            onClick={onExitFocusMode}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs rounded-2xl border border-rose-500/50 shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Deep Focus (Esc)</span>
          </button>
        </div>
      </div>

      {/* TOPIC PRESET SELECTOR STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs font-bold">
        <span className="text-slate-400 shrink-0 text-[11px] uppercase">Select Topic:</span>
        {EXAM_TOPIC_PRESETS.map((preset) => {
          const isSelected = activePreset.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActivePreset(preset)}
              className={`px-3 py-1.5 rounded-2xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md"
                  : "bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-amber-400"
              }`}
            >
              {preset.paper}: {preset.name.split("&")[0]}
            </button>
          );
        })}
      </div>

      {/* TWO-COLUMN WORKSPACE: PROBLEM + SCRATCHPAD (LEFT) vs TIMER & FORMULA SHEET (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE MATH QUESTION & LATEX SCRATCHPAD (LG: 7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Question Card */}
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-royal-500/20 text-royal-600 dark:text-gold-400 font-mono font-black text-xs rounded-xl">
                  {activeProblem.questionNumber}
                </span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {activeProblem.marks} Marks
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                    showHint
                      ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs"
                      : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-800 hover:border-amber-400"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? "Hide Hint" : "Show Hint"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSolution(!showSolution)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                    showSolution
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-800 hover:border-emerald-500"
                  }`}
                >
                  {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSolution ? "Hide Solution" : "Show Solution"}</span>
                </button>
              </div>
            </div>

            {/* Rendered Question LaTeX */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-sm font-sans text-slate-900 dark:text-white leading-relaxed">
              <LatexRenderer text={activeProblem.questionLatex} />
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-1 animate-fadeIn">
                <span className="font-mono font-bold uppercase text-[10px] block">Step-by-Step Hint:</span>
                <LatexRenderer text={activeProblem.hintLatex} />
              </div>
            )}

            {/* Worked Solution Box */}
            {showSolution && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-300 space-y-1 animate-fadeIn">
                <span className="font-mono font-bold uppercase text-[10px] block text-emerald-600 dark:text-emerald-400">
                  Official Marking Solution:
                </span>
                <LatexRenderer text={activeProblem.solutionLatex} />
              </div>
            )}
          </div>

          {/* Interactive Student Working Scratchpad */}
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-royal-500" />
                Your Math Solution Working Canvas (LaTeX)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Write line-by-line working steps
              </span>
            </div>

            <VisualLatexToolbar
              value={scratchpadText}
              onChange={setScratchpadText}
              placeholder="Draft your line-by-line mathematical solution here (e.g. 3x^2 - 7x - 5 = 0 \implies x = \frac{-(-7) \pm \sqrt{49 - 4(3)(-5)}}{6})..."
              rows={5}
              showLivePreview={true}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-CONTRAST TIMER & FORMULA QUICK ACCESS (LG: 5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Timer Card */}
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="flex items-center justify-between w-full border-b border-slate-100 dark:border-navy-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-500" />
                Exam Sprint Countdown
              </span>

              <button
                type="button"
                onClick={() => setShowFormulaSheet(!showFormulaSheet)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-royal-500" />
                <span>Formulas</span>
              </button>
            </div>

            {/* Circular Timer Ring */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-200 dark:stroke-navy-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-amber-500 text-amber-500 transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-slate-900 dark:text-white">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-1 font-bold">
                  {isPaused ? "⏸️ PAUSED" : isFinished ? "🔔 TIME UP!" : "⏱️ COUNTDOWN ACTIVE"}
                </span>
                <span className="text-[10px] font-mono text-royal-600 dark:text-gold-400 font-bold mt-1">
                  Target: {activeProblem.marks} Marks
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isPaused) {
                    setIsPaused(false);
                  } else if (isRunning) {
                    setIsPaused(true);
                  } else {
                    setIsRunning(true);
                  }
                }}
                className={`px-5 py-2.5 rounded-2xl font-mono font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-transform hover:scale-105 ${
                  isPaused || !isRunning
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                }`}
              >
                {isPaused || !isRunning ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                <span>{isPaused ? "RESUME" : isRunning ? "PAUSE" : "START SPRINT"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setIsPaused(false);
                  const secs = activePreset.recommendedMins * 60;
                  setSecondsLeft(secs);
                  setTotalSeconds(secs);
                }}
                className="px-3.5 py-2.5 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs font-mono font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowGradingModal(true)}
                className="px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Grade</span>
              </button>
            </div>
          </div>

          {/* Quick Key Formulas Card for Selected Topic */}
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-mono font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-gold-400" />
              {activePreset.name} Key Formulas
            </h4>

            <div className="space-y-2">
              {activePreset.keyFormulas.map((f, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs">
                  <LatexRenderer text={f} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FORMULA SHEET MODAL */}
      {showFormulaSheet && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="text-base font-mono font-black text-slate-900 dark:text-white uppercase">
                CAPS / IEB Official Formula Reference
              </h3>
              <button
                type="button"
                onClick={() => setShowFormulaSheet(false)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePreset.keyFormulas.map((f, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs">
                  <LatexRenderer text={f} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {showGradingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="text-base font-mono font-black text-slate-900 dark:text-white uppercase">
                Grade Deep Focus Session
              </h3>
              <button
                type="button"
                onClick={() => setShowGradingModal(false)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Marks Achieved ({marksAchieved} / {activeProblem.marks}):
                </label>
                <input
                  type="range"
                  min={0}
                  max={activeProblem.marks}
                  value={marksAchieved}
                  onChange={(e) => setMarksAchieved(parseInt(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Reflection Notes:
                </label>
                <textarea
                  rows={2}
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="Notes on step-by-step working..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveScore}
                disabled={isSavingScore || scoreSavedSuccess}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {scoreSavedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>SCORE SAVED!</span>
                  </>
                ) : (
                  <span>LOG SCORE TO DASHBOARD</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
