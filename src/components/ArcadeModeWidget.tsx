import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Trophy, 
  Flame, 
  Timer, 
  Heart, 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Award, 
  BarChart2, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ListOrdered,
  BrainCircuit,
  Calendar
} from "lucide-react";
import { Profile, ArcadeScore } from "../types";
import { dbAPI, getFromDB, saveToDB } from "../lib/db";
import { ArcadeTopScorersWidget } from "./ArcadeTopScorersWidget";
import { ArcadeAchievementsWidget } from "./ArcadeAchievementsWidget";
import { SmartQuizSchedulerModal } from "./SmartQuizSchedulerModal";

export interface ArcadeModeWidgetProps {
  user?: Profile | null;
}

export type GameMode = "60s_blitz" | "survival_3_lives" | "algebra_frenzy" | "speed_calc";

interface Question {
  prompt: string;
  answer: number;
  options: number[];
  category: string;
}

// Simple Web Audio API sound synthesizer
const playArcadeSound = (type: "correct" | "wrong" | "combo" | "gameover" | "tick", enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "correct") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "combo") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(160, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "gameover") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === "tick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    // Ignore audio error
  }
};

// Question Generator
const generateQuestion = (mode: GameMode): Question => {
  let prompt = "";
  let answer = 0;
  let category = "Arithmetic";

  if (mode === "speed_calc") {
    category = "Mental Arithmetic";
    const opType = Math.floor(Math.random() * 4);
    if (opType === 0) {
      // Multiplication
      const a = Math.floor(Math.random() * 12) + 2;
      const b = Math.floor(Math.random() * 12) + 2;
      prompt = `${a} × ${b}`;
      answer = a * b;
    } else if (opType === 1) {
      // Squares / Roots
      const a = Math.floor(Math.random() * 15) + 2;
      prompt = `${a}²`;
      answer = a * a;
    } else if (opType === 2) {
      // Percentages
      const pct = (Math.floor(Math.random() * 9) + 1) * 10; // 10%, 20%... 90%
      const val = (Math.floor(Math.random() * 20) + 1) * 10;
      prompt = `${pct}% of ${val}`;
      answer = (pct / 100) * val;
    } else {
      // Division
      const b = Math.floor(Math.random() * 9) + 2;
      const ans = Math.floor(Math.random() * 12) + 2;
      const a = b * ans;
      prompt = `${a} ÷ ${b}`;
      answer = ans;
    }
  } else if (mode === "algebra_frenzy") {
    category = "Algebra & Equations";
    const algType = Math.floor(Math.random() * 4);
    if (algType === 0) {
      // Solve linear equation 2x + b = c
      const x = Math.floor(Math.random() * 10) + 1;
      const m = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 10) + 1;
      const total = m * x + b;
      prompt = `Solve for x: ${m}x + ${b} = ${total}`;
      answer = x;
    } else if (algType === 1) {
      // Exponent rules 2^3 + 2^2
      const base = Math.floor(Math.random() * 3) + 2;
      const exp1 = Math.floor(Math.random() * 3) + 2;
      const exp2 = Math.floor(Math.random() * 2) + 1;
      const ans = Math.pow(base, exp1) + Math.pow(base, exp2);
      prompt = `Evaluate: ${base}^${exp1} + ${base}^${exp2}`;
      answer = ans;
    } else if (algType === 2) {
      // Simplify polynomial value x^2 - 4 when x = a
      const xVal = Math.floor(Math.random() * 6) + 1;
      prompt = `If f(x) = x² - 5, find f(${xVal})`;
      answer = xVal * xVal - 5;
    } else {
      // Difference of squares term
      const a = Math.floor(Math.random() * 8) + 2;
      prompt = `If (x - ${a})(x + ${a}) = x² - k, find k`;
      answer = a * a;
    }
  } else if (mode === "survival_3_lives") {
    category = "Mixed Survival";
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const a = Math.floor(Math.random() * 25) + 10;
      const b = Math.floor(Math.random() * 25) + 10;
      prompt = `${a} + ${b}`;
      answer = a + b;
    } else if (type === 1) {
      const a = Math.floor(Math.random() * 50) + 20;
      const b = Math.floor(Math.random() * 20) + 5;
      prompt = `${a} - ${b}`;
      answer = a - b;
    } else {
      const a = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 8) + 2;
      prompt = `${a} × ${b}`;
      answer = a * b;
    }
  } else {
    // 60s Blitz
    category = "60s Blitz";
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 20) + 5;
      prompt = `${a} + ${b}`;
      answer = a + b;
    } else if (type === 1) {
      const a = Math.floor(Math.random() * 12) + 2;
      const b = Math.floor(Math.random() * 12) + 2;
      prompt = `${a} × ${b}`;
      answer = a * b;
    } else if (type === 2) {
      const a = Math.floor(Math.random() * 40) + 10;
      const b = Math.floor(Math.random() * 15) + 2;
      prompt = `${a} - ${b}`;
      answer = a - b;
    } else {
      const a = Math.floor(Math.random() * 10) + 2;
      prompt = `√${a * a}`;
      answer = a;
    }
  }

  // Generate 3 plausible incorrect options
  const optionSet = new Set<number>();
  optionSet.add(answer);

  const offsets = [-1, 1, -2, 2, -5, 5, -10, 10, -3, 3];
  while (optionSet.size < 4) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const fake = answer + offset;
    if (fake >= 0 || mode === "algebra_frenzy") {
      optionSet.add(fake);
    }
  }

  const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

  return { prompt, answer, options, category };
};

export const ArcadeModeWidget: React.FC<ArcadeModeWidgetProps> = ({ user }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>("60s_blitz");
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Gameplay State
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [livesLeft, setLivesLeft] = useState<number>(3);
  const [velocityPoints, setVelocityPoints] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // Question State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"CORRECT" | "WRONG" | null>(null);
  const [comboPop, setComboPop] = useState<string | null>(null);

  // Leaderboard & History
  const [leaderboard, setLeaderboard] = useState<ArcadeScore[]>([]);
  const [activeTab, setActiveTab] = useState<"GAME" | "LEADERBOARD" | "TROPHIES">("GAME");
  const [showSmartScheduler, setShowSmartScheduler] = useState<boolean>(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const studentId = user?.id || "usr-bethuel";
  const studentName = user ? `${user.first_name} ${user.surname}`.trim() : "Bethuel Thipe";

  // Load Leaderboard
  const loadLeaderboard = () => {
    try {
      const data = dbAPI.getArcadeScores();
      setLeaderboard(data);
    } catch (e) {
      console.error("Error loading arcade scores:", e);
    }
  };

  useEffect(() => {
    loadLeaderboard();

    const handleScoreLogged = () => {
      loadLeaderboard();
    };

    window.addEventListener("arcadeScoreLogged", handleScoreLogged);
    return () => {
      window.removeEventListener("arcadeScoreLogged", handleScoreLogged);
    };
  }, []);

  // Timer Tick Engine
  useEffect(() => {
    if (gameState === "PLAYING" && (selectedMode === "60s_blitz" || selectedMode === "algebra_frenzy" || selectedMode === "speed_calc")) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          if (prev <= 6) {
            playArcadeSound("tick", soundEnabled);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, selectedMode, soundEnabled]);

  // Start Game
  const handleStartGame = (mode: GameMode) => {
    setSelectedMode(mode);
    setGameState("PLAYING");
    setVelocityPoints(0);
    setComboStreak(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setTotalQuestions(0);
    setLivesLeft(3);
    setFeedback(null);
    setComboPop(null);

    if (mode === "60s_blitz" || mode === "speed_calc") {
      setTimeLeft(60);
    } else if (mode === "algebra_frenzy") {
      setTimeLeft(45);
    } else {
      setTimeLeft(999);
    }

    const firstQ = generateQuestion(mode);
    setCurrentQuestion(firstQ);
    questionStartTimeRef.current = Date.now();
  };

  // Handle Answer Select
  const handleAnswer = (option: number) => {
    if (!currentQuestion || feedback !== null) return;

    setSelectedOption(option);
    const responseTimeMs = Date.now() - questionStartTimeRef.current;
    const isCorrect = option === currentQuestion.answer;

    setTotalQuestions((prev) => prev + 1);

    if (isCorrect) {
      // Calculate Velocity Points
      const basePoints = 50;
      // Speed bonus: up to +50 points if answered under 2 seconds
      const speedBonus = Math.max(0, Math.round(50 - (responseTimeMs / 100)));
      // Multiplier: 1 + (combo * 0.2)
      const currentCombo = comboStreak + 1;
      const multiplier = 1 + Math.min(4, currentCombo * 0.2);

      const pointsEarned = Math.round((basePoints + speedBonus) * multiplier);

      setVelocityPoints((prev) => prev + pointsEarned);
      setCorrectCount((prev) => prev + 1);
      setComboStreak(currentCombo);
      setMaxCombo((prev) => Math.max(prev, currentCombo));

      setFeedback("CORRECT");

      if (currentCombo >= 5) {
        playArcadeSound("combo", soundEnabled);
        setComboPop(`${currentCombo}x STREAK! +${pointsEarned} PTS`);
      } else {
        playArcadeSound("correct", soundEnabled);
        setComboPop(`+${pointsEarned} PTS!`);
      }

      setTimeout(() => {
        setComboPop(null);
      }, 1200);

    } else {
      // Incorrect Answer
      playArcadeSound("wrong", soundEnabled);
      setComboStreak(0);
      setFeedback("WRONG");

      if (selectedMode === "survival_3_lives") {
        setLivesLeft((prev) => {
          const nextLives = prev - 1;
          if (nextLives <= 0) {
            setTimeout(() => {
              handleGameOver();
            }, 500);
          }
          return nextLives;
        });
      }
    }

    // Advance to Next Question
    setTimeout(() => {
      setSelectedOption(null);
      setFeedback(null);
      if (gameState === "PLAYING") {
        const nextQ = generateQuestion(selectedMode);
        setCurrentQuestion(nextQ);
        questionStartTimeRef.current = Date.now();
      }
    }, 400);
  };

  // Handle Game Over
  const handleGameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    playArcadeSound("gameover", soundEnabled);
    setGameState("GAMEOVER");

    // Calculate score entry
    const finalAccuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    try {
      dbAPI.addArcadeScore({
        student_id: studentId,
        student_name: studentName,
        velocity_points: velocityPoints,
        correct_count: correctCount,
        total_questions: totalQuestions,
        accuracy_percentage: finalAccuracy,
        max_combo: maxCombo,
        mode: selectedMode
      });
    } catch (e) {
      console.error("Failed to save arcade score:", e);
    }
  };

  // Derived Stats
  const personalBestScore = leaderboard
    .filter((s) => s.student_id === studentId)
    .reduce((max, s) => Math.max(max, s.velocity_points), 0);

  const totalPointsAccumulated = leaderboard
    .filter((s) => s.student_id === studentId)
    .reduce((acc, s) => acc + s.velocity_points, 0);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* ARCADE HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-purple-950 to-navy-900 text-white rounded-3xl p-6 shadow-2xl border border-purple-500/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 uppercase tracking-widest flex items-center gap-1.5 shadow">
              <Zap className="w-3.5 h-3.5 fill-slate-950 animate-pulse" />
              Math Velocity Arcade
            </span>
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              ⚡ Rapid-Fire Challenge
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
            Math Velocity Arcade
          </h2>
          <p className="text-xs text-purple-200 leading-relaxed">
            Race against the clock, solve rapid arithmetic & algebra equations, build combo streaks, and earn <strong className="text-amber-400 font-mono">Velocity Points</strong>!
          </p>
        </div>

        {/* Stats Summary Badge & Sound Toggle */}
        <div className="flex items-center gap-3 z-10 shrink-0 self-end md:self-center">
          <div className="bg-navy-900/80 backdrop-blur border border-purple-500/40 p-3 rounded-2xl flex items-center gap-4 shadow-lg font-mono">
            <div>
              <span className="text-[9px] uppercase text-purple-300 font-bold block">Personal Best</span>
              <span className="text-lg font-black text-amber-400">{personalBestScore} pts</span>
            </div>
            <div className="h-8 w-px bg-purple-500/30" />
            <div>
              <span className="text-[9px] uppercase text-purple-300 font-bold block">Total Velocity</span>
              <span className="text-lg font-black text-emerald-400">{totalPointsAccumulated} pts</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              soundEnabled 
                ? "bg-purple-600/30 border-purple-400 text-purple-200" 
                : "bg-navy-900/80 border-slate-700 text-slate-500"
            }`}
            title={soundEnabled ? "Arcade SFX On" : "Arcade SFX Muted"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* TOP TAB SELECTION (GAME vs LEADERBOARD) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("GAME")}
          className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "GAME"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg scale-105"
              : "bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800"
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Arcade Arena</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LEADERBOARD")}
          className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "LEADERBOARD"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg scale-105"
              : "bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Velocity Leaderboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TROPHIES")}
          className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "TROPHIES"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg scale-105"
              : "bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800"
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Trophy Room</span>
        </button>
      </div>

      {/* TAB 1: ARCADE ARENA */}
      {activeTab === "GAME" && (
        <div>
          {/* GAME STATE 1: IDLE / MODE SELECTOR */}
          {gameState === "IDLE" && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Select Challenge Mode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mode 1: 60s Blitz */}
                <div 
                  onClick={() => handleStartGame("60s_blitz")}
                  className="bg-white dark:bg-navy-900 border-2 border-amber-500/40 hover:border-amber-500 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-2 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-black">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      60s Speed Blitz
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Answer as many arithmetic questions as possible in 60 seconds. High speed = max combo bonus!
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between font-mono text-xs font-black text-amber-500">
                    <span>60 Seconds</span>
                    <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Mode 2: Survival 3 Lives */}
                <div 
                  onClick={() => handleStartGame("survival_3_lives")}
                  className="bg-white dark:bg-navy-900 border-2 border-rose-500/40 hover:border-rose-500 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-2 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-black">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                      3-Lives Survival
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No time limit, but 3 strikes and you're out! How high can you build your streak?
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between font-mono text-xs font-black text-rose-500">
                    <span>3 Lives</span>
                    <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Mode 3: Algebra Frenzy */}
                <div 
                  onClick={() => handleStartGame("algebra_frenzy")}
                  className="bg-white dark:bg-navy-900 border-2 border-purple-500/40 hover:border-purple-500 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-2 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-black">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                      Algebra & Exponents
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      CAPS Grade 10-12 algebraic equations, difference of squares, and exponent laws.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between font-mono text-xs font-black text-purple-400">
                    <span>45 Seconds</span>
                    <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Mode 4: Speed Calc */}
                <div 
                  onClick={() => handleStartGame("speed_calc")}
                  className="bg-white dark:bg-navy-900 border-2 border-emerald-500/40 hover:border-emerald-500 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-2 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-black">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      Mental Arithmetic
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Multiplication tables, square roots, percentages, and quick divisions.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between font-mono text-xs font-black text-emerald-500">
                    <span>60 Seconds</span>
                    <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* EMBEDDED TOP SCORERS PREVIEW WIDGET */}
              <div className="pt-2">
                <ArcadeTopScorersWidget user={user} compactMode={true} onLaunchArcade={() => handleStartGame("60s_blitz")} />
              </div>
            </div>
          )}

          {/* GAME STATE 2: PLAYING */}
          {gameState === "PLAYING" && currentQuestion && (
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-purple-500/40 space-y-6 relative overflow-hidden animate-fadeIn">
              {/* COMBO POPUP ANIMATION OVERLAY */}
              {comboPop && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-bounce">
                  <div className="bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 text-slate-950 px-6 py-3 rounded-2xl font-black font-mono text-lg sm:text-2xl shadow-2xl border-2 border-white tracking-widest uppercase">
                    ⚡ {comboPop}
                  </div>
                </div>
              )}

              {/* LIVE TOP HUD BAR */}
              <div className="flex items-center justify-between gap-4 border-b border-purple-900/60 pb-4 font-mono">
                {/* Time or Lives */}
                {selectedMode === "survival_3_lives" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase mr-1">Lives:</span>
                    {[1, 2, 3].map((heart) => (
                      <Heart
                        key={heart}
                        className={`w-5 h-5 transition-all ${
                          heart <= livesLeft ? "text-rose-500 fill-rose-500 scale-110" : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Timer className={`w-5 h-5 ${timeLeft <= 10 ? "text-rose-500 animate-ping" : "text-amber-400"}`} />
                    <span className={`text-2xl font-black ${timeLeft <= 10 ? "text-rose-500" : "text-amber-400"}`}>
                      {timeLeft}s
                    </span>
                  </div>
                )}

                {/* Combo Streak Counter */}
                <div className="flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 px-3 py-1.5 rounded-xl">
                  <Flame className={`w-4 h-4 ${comboStreak >= 5 ? "text-amber-400 animate-bounce" : "text-purple-300"}`} />
                  <span className="text-xs text-purple-200 font-bold">
                    Streak: <strong className="text-amber-400 text-sm font-black">{comboStreak}x</strong>
                  </span>
                </div>

                {/* Live Velocity Points */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Velocity Points</span>
                  <span className="text-2xl font-black text-amber-400 tracking-wider">
                    {velocityPoints}
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR FOR TIME */}
              {selectedMode !== "survival_3_lives" && (
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft <= 10 ? "bg-rose-500" : "bg-gradient-to-r from-amber-500 to-amber-400"
                    }`}
                    style={{
                      width: `${(timeLeft / (selectedMode === "algebra_frenzy" ? 45 : 60)) * 100}%`
                    }}
                  />
                </div>
              )}

              {/* QUESTION CARD */}
              <div className="py-8 text-center space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/30">
                  {currentQuestion.category}
                </span>

                <h3 className="text-3xl sm:text-5xl font-black font-mono text-white tracking-wide">
                  {currentQuestion.prompt}
                </h3>
              </div>

              {/* OPTIONS GRID */}
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((opt, idx) => {
                  let btnStyle = "bg-slate-900 hover:bg-purple-900/50 border-slate-800 text-white hover:border-purple-500/50";
                  
                  if (selectedOption !== null) {
                    if (opt === currentQuestion.answer) {
                      btnStyle = "bg-emerald-600 border-emerald-400 text-white scale-105";
                    } else if (opt === selectedOption && feedback === "WRONG") {
                      btnStyle = "bg-rose-600 border-rose-400 text-white";
                    } else {
                      btnStyle = "bg-slate-900 opacity-40 border-slate-800 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={feedback !== null}
                      onClick={() => handleAnswer(opt)}
                      className={`p-5 rounded-2xl border-2 font-mono text-xl sm:text-2xl font-black transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* QUIT / GIVE UP */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGameOver}
                  className="text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  End Session Early
                </button>
              </div>
            </div>
          )}

          {/* GAME STATE 3: GAMEOVER RESULTS SCREEN */}
          {gameState === "GAMEOVER" && (
            <div className="bg-white dark:bg-navy-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-gold-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
                <Trophy className="w-8 h-8 fill-current" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">
                  Sprint Complete!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                  Arcade Challenge Summary
                </h3>
              </div>

              {/* HIGHLIGHT SCORE CARD */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 border-2 border-amber-500/40 shadow-xl max-w-md mx-auto space-y-3 font-mono">
                <span className="text-xs uppercase text-slate-400 font-bold block">Velocity Points Earned</span>
                <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-wider">
                  {velocityPoints}
                </span>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Questions</span>
                    <strong className="text-white text-base">{correctCount} / {totalQuestions}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Accuracy</span>
                    <strong className="text-emerald-400 text-base">
                      {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Max Streak</span>
                    <strong className="text-amber-400 text-base">{maxCombo}x</strong>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
                <button
                  type="button"
                  onClick={() => handleStartGame(selectedMode)}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-mono font-black text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again ({selectedMode})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameState("IDLE")}
                  className="px-6 py-3.5 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-2xl border border-slate-200 dark:border-navy-800 transition-colors cursor-pointer"
                >
                  Change Mode
                </button>

                <button
                  type="button"
                  onClick={() => setShowSmartScheduler(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-amber-400/50"
                >
                  <BrainCircuit className="w-4 h-4 text-slate-950 animate-pulse" />
                  <span>AI Schedule Weak Topics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("LEADERBOARD")}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>View Leaderboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEADERBOARD */}
      {activeTab === "LEADERBOARD" && (
        <ArcadeTopScorersWidget user={user} onLaunchArcade={() => setActiveTab("GAME")} />
      )}

      {/* TAB 3: TROPHY ROOM & ACHIEVEMENTS */}
      {activeTab === "TROPHIES" && (
        <ArcadeAchievementsWidget user={user} />
      )}

      {/* SMART QUIZ SCHEDULER MODAL */}
      <SmartQuizSchedulerModal
        user={user}
        isOpen={showSmartScheduler}
        onClose={() => setShowSmartScheduler(false)}
        onApplySchedule={(newSessions) => {
          try {
            const raw = localStorage.getItem("amh_weekly_study_planner");
            const existing = raw ? JSON.parse(raw) : [];
            const updated = [...existing, ...newSessions];
            localStorage.setItem("amh_weekly_study_planner", JSON.stringify(updated));
            window.dispatchEvent(new Event("storage"));
          } catch (e) {
            console.error("Failed to update planner from arcade:", e);
          }
        }}
      />
    </div>
  );
};
