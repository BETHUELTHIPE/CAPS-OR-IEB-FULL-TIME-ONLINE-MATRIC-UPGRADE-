import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Sparkles, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Zap, 
  BookOpen, 
  Clock, 
  Award, 
  Volume2, 
  VolumeX, 
  TrendingUp,
  Plus,
  Target
} from "lucide-react";
import { Profile, StudentActivity } from "../types";
import { getFromDB, saveToDB, generateId, dbAPI } from "../lib/db";

export interface FocusSessionTimerProps {
  user?: Profile | null;
  onSessionCompleted?: (minutesCompleted: number, xpEarned: number) => void;
}

const PRESET_DURATIONS = [
  { label: "25m", minutes: 25, tag: "Classic Pomodoro", desc: "Optimal focus interval for problem solving" },
  { label: "45m", minutes: 45, tag: "Deep Study", desc: "Covers complex CAPS/IEB proof derivations" },
  { label: "60m", minutes: 60, tag: "Exam Trial Drill", desc: "Full paper timed question simulation" },
  { label: "15m", minutes: 15, tag: "Quick Sprint", desc: "Rapid formula review or homework check" }
];

const MATH_TOPICS: ("Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Functions" | "Probability" | "Financial Maths" | "Exam Prep" | "General Practice")[] = [
  "Calculus",
  "Algebra",
  "Trigonometry",
  "Geometry",
  "Functions",
  "Probability",
  "Financial Maths",
  "Exam Prep",
  "General Practice"
];

export const FocusSessionTimer: React.FC<FocusSessionTimerProps> = ({ user, onSessionCompleted }) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<typeof MATH_TOPICS[number]>("Calculus");
  const [notes, setNotes] = useState<string>("");
  
  // Timer State
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);
  const [totalFocusMinutesToday, setTotalFocusMinutesToday] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Total duration in seconds for progress calculation
  const totalSeconds = selectedMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  // Sync timer when preset or custom duration changes (if not actively running)
  useEffect(() => {
    if (!isRunning && !sessionFinished) {
      setSecondsLeft(selectedMinutes * 60);
    }
  }, [selectedMinutes]);

  // Load existing session metrics from localStorage on mount
  useEffect(() => {
    const activities = getFromDB<StudentActivity>("amh_student_activities");
    const todayStr = new Date().toISOString().slice(0, 10);
    
    const focusActivities = activities.filter(a => 
      a.action_type === "focus_session" && 
      a.timestamp.startsWith(todayStr)
    );

    setCompletedSessionsCount(focusActivities.length);
    const totalMins = focusActivities.reduce((acc, curr) => {
      const durationMatch = curr.description?.match(/(\d+)\s*m/i);
      return acc + (durationMatch ? parseInt(durationMatch[1], 10) : 25);
    }, 0);
    setTotalFocusMinutesToday(totalMins);
  }, [sessionFinished]);

  // Countdown timer engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setSessionFinished(true);
            triggerCompletion(selectedMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedMinutes]);

  // Play Web Audio Chime on Session Finish
  const playFinishChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playTone(523.25, 0, 0.4);   // C5
      playTone(659.25, 0.25, 0.4); // E5
      playTone(783.99, 0.5, 0.6);  // G5
      playTone(1046.50, 0.75, 0.9); // C6
    } catch (e) {
      console.log("Audio Context play chime prevented:", e);
    }
  };

  // Log Focus Session to Recent Activity Feed
  const triggerCompletion = (mins: number) => {
    playFinishChime();
    
    const xpEarned = Math.max(10, Math.floor(mins * 2)); // 2 XP per minute

    // Create Student Activity entry
    const currentActivities = getFromDB<StudentActivity>("amh_student_activities");
    const newActivity: StudentActivity = {
      id: generateId("act-focus"),
      student_id: user?.id || "usr-student",
      action_type: "focus_session",
      title: `Completed ${mins}m Deep Focus Session: ${selectedTopic}`,
      description: `Completed ${mins} minutes of focused study on ${selectedTopic}.${notes ? ` Notes: "${notes}"` : ''} (+${xpEarned} XP)`,
      category: selectedTopic,
      timestamp: new Date().toISOString(),
      metadata: {
        score: 100,
        badge_name: mins >= 45 ? "Deep Work Scholar" : "Focus Champion"
      }
    };

    const updatedActivities = [newActivity, ...currentActivities];
    saveToDB("amh_student_activities", updatedActivities);

    // Also log to Deep Focus session logger table
    try {
      dbAPI.addDeepFocusSession({
        student_id: user?.id || "usr-student",
        topic_name: selectedTopic,
        paper_category: "CAPS/IEB Focus",
        duration_minutes: mins,
        actual_seconds_focused: mins * 60,
        score_percentage: 100,
        ambient_audio_used: soundEnabled ? "focus_tone" : "none",
        notes: notes || `Completed ${mins}m focus timer sprint on ${selectedTopic}.`
      });
    } catch (e) {
      console.error("Error logging focus session:", e);
    }

    // Update localStorage XP
    const currentXP = parseInt(localStorage.getItem(`amh_xp_${user?.id || 'usr-student'}`) || "1450", 10);
    const newXP = currentXP + xpEarned;
    localStorage.setItem(`amh_xp_${user?.id || 'usr-student'}`, newXP.toString());

    // Dispatch Storage Event to refresh components listening to recent activity
    window.dispatchEvent(new Event("storage"));

    if (onSessionCompleted) {
      onSessionCompleted(mins, xpEarned);
    }
  };

  // Controls
  const handleToggleTimer = () => {
    if (sessionFinished) {
      handleResetTimer();
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSessionFinished(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setSessionFinished(false);
    setSelectedMinutes(mins);
    setCustomMinutes("");
    setSecondsLeft(mins * 60);
  };

  const handleCustomDurationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customMinutes, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      handleSelectPreset(parsed);
    }
  };

  // Format MM:SS
  const formatTimeMinutesSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-950 border border-navy-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-navy-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-gold-600 text-navy-950 font-black shadow-lg shrink-0">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400/20 text-amber-400 border border-amber-400/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Pomodoro Focus Zone
              </span>
              <span className="text-[11px] font-mono text-navy-300 font-bold">
                • Integrated Activity Tracker
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight mt-0.5">
              Deep Work & Focus Timer
            </h2>
          </div>
        </div>

        {/* METRICS BADGES */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-850/90 border border-navy-750 text-amber-400 font-mono font-extrabold text-xs">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{totalFocusMinutesToday} mins Focused Today</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-xs">
            <Trophy className="w-4 h-4 text-gold-400" />
            <span>{completedSessionsCount} Sessions Logged</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-700 text-navy-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Audio chime enabled" : "Audio chime muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-navy-500" />}
          </button>
        </div>
      </div>

      {/* TOPIC & PRESET CONFIGURATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Topic Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-navy-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Select Study Topic
          </label>
          <select
            value={selectedTopic}
            disabled={isRunning}
            onChange={(e) => setSelectedTopic(e.target.value as any)}
            className="w-full bg-navy-950/90 border border-navy-750 rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-white focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {MATH_TOPICS.map((topic) => (
              <option key={topic} value={topic} className="bg-navy-900 text-white">
                {topic} Focus Session
              </option>
            ))}
          </select>
        </div>

        {/* Notes Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-navy-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" /> Session Goal / Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            disabled={isRunning}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Solving 2024 November Paper 1 Question 7..."
            className="w-full bg-navy-950/90 border border-navy-750 rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-white placeholder-navy-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-60"
          />
        </div>
      </div>

      {/* PRESETS BUTTONS */}
      <div className="space-y-2 relative z-10">
        <span className="text-xs font-mono font-bold text-navy-300 uppercase tracking-wider block">
          Preset Intervals
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_DURATIONS.map((preset) => {
            const isSelected = selectedMinutes === preset.minutes && !customMinutes;
            return (
              <button
                key={preset.label}
                disabled={isRunning}
                onClick={() => handleSelectPreset(preset.minutes)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/30"
                    : "bg-navy-950/60 border-navy-800 text-navy-300 hover:bg-navy-850 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black font-mono text-amber-400">{preset.label}</span>
                  <Clock className="w-4 h-4 text-navy-500" />
                </div>
                <div className="text-xs font-bold text-white mt-1">{preset.tag}</div>
                <div className="text-[10px] text-navy-400 line-clamp-1 mt-0.5">{preset.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TIMER DISPLAY & PROGRESS RING */}
      <div className="bg-navy-950/90 border border-navy-800 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 relative z-10 shadow-inner">
        {/* Circular Progress Ring */}
        <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-navy-850 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-amber-400 stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* TIMER TIME TEXT INSIDE RING */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {formatTimeMinutesSeconds(secondsLeft)}
            </span>

            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
              {isRunning ? (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ) : sessionFinished ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-navy-400" />
              )}
              {isRunning ? "Deep Focus Active" : sessionFinished ? "Session Completed!" : "Ready to Start"}
            </span>

            <span className="text-[11px] font-mono text-navy-400">
              {selectedTopic} • +{Math.max(10, selectedMinutes * 2)} XP
            </span>
          </div>
        </div>

        {/* TIMER CONTROL BUTTONS */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleTimer}
            className={`px-8 py-4 rounded-2xl font-black text-sm md:text-base font-display flex items-center gap-2.5 transition-all cursor-pointer shadow-xl ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-400 text-navy-950 ring-4 ring-amber-500/20"
                : sessionFinished
                ? "bg-emerald-500 hover:bg-emerald-400 text-navy-950 ring-4 ring-emerald-500/20"
                : "bg-gradient-to-r from-amber-400 to-gold-500 text-navy-950 hover:brightness-110 shadow-gold-500/20"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : sessionFinished ? (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Next Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start {selectedMinutes}m Focus Session</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetTimer}
            disabled={!isRunning && secondsLeft === selectedMinutes * 60}
            className="p-4 rounded-2xl bg-navy-850 hover:bg-navy-800 border border-navy-750 text-navy-300 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SESSION FINISHED SUCCESS BANNER */}
      <AnimatePresence>
        {sessionFinished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500 text-navy-950 font-black shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold font-display text-white">
                  Focus Session Complete! Logged to Recent Activity 🎉
                </h4>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Great work! {selectedMinutes} minutes focused on {selectedTopic}. Earned +{Math.max(10, selectedMinutes * 2)} XP and logged to your activity feed.
                </p>
              </div>
            </div>

            <button
              onClick={handleResetTimer}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-black text-xs transition-colors cursor-pointer shrink-0"
            >
              Start Another Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
