import { useState, useEffect } from "react";
import { Clock, BookOpen, Flame, Award, CheckCircle, GraduationCap } from "lucide-react";

export function MatricCountdown() {
  const [examType, setExamType] = useState<"caps" | "ieb">("caps");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  // Calculate standard South African matric start dates
  const getExamDate = (type: "caps" | "ieb") => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // NSC CAPS usually starts on the 4th Monday of October. For 2026, that is Oct 26.
    // IEB usually starts slightly earlier or around mid-October. Let's use Oct 21 for IEB 2026.
    const day = type === "caps" ? 26 : 21;
    const examDate = new Date(currentYear, 9, day, 9, 0, 0); // 9:00 AM SAST

    // If the exam date for this year has already passed, use next year's date
    if (now.getTime() > examDate.getTime()) {
      return new Date(currentYear + 1, 9, day, 9, 0, 0);
    }
    return examDate;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const targetDate = getExamDate(examType);
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [examType]);

  // Calculate prep year progress percentage starting from June 1st to Exam Date
  const getPrepProgress = () => {
    const now = new Date();
    const targetDate = getExamDate(examType);
    const year = targetDate.getFullYear();
    const startDate = new Date(year, 5, 1); // June 1st of the exam year

    const totalDuration = targetDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();

    if (elapsed < 0) return 0;
    const percent = (elapsed / totalDuration) * 100;
    return Math.min(100, Math.max(0, Math.round(percent * 10) / 10));
  };

  const progressPercent = getPrepProgress();

  // Custom syllabus focus guidelines for South African Matric Exams
  const syllabusFocus = {
    caps: [
      { topic: "Functions & Inverse Graphs", weight: "±35 Marks", focus: "Hyperbolas, parabolas, logs & their reflections" },
      { topic: "Differential Calculus", weight: "±35 Marks", focus: "First principles, derivative rules, cubic graphs & optimization" },
      { topic: "Trigonometry", weight: "±40 Marks", focus: "Reduction formulae, general solutions, identities & 2D/3D sine/cosine rules" },
      { topic: "Analytical Geometry", weight: "±25 Marks", focus: "Equation of tangent to circle, angle of inclination & midpoints" },
      { topic: "Sequences & Series", weight: "±25 Marks", focus: "Arithmetic, geometric, sigma notation & sum to infinity quadratic patterns" },
    ],
    ieb: [
      { topic: "Functions & Logarithms", weight: "±30 Marks", focus: "Log laws, domain & range restriction, composite functions" },
      { topic: "Calculus & Optimization", weight: "±35 Marks", focus: "Cubic curves, rates of change, maximizing volume/area" },
      { topic: "3D Trigonometry & Proofs", weight: "±40 Marks", focus: "Complex sine/cosine applications & compound angle proofs" },
      { topic: "Probability & Venn Diagrams", weight: "±20 Marks", focus: "Independent vs mutually exclusive events, fundamental counting principle" },
      { topic: "Financial Maths & Annuities", weight: "±15 Marks", focus: "Present and future value formulas, deferred payments & sinking funds" },
    ]
  };

  // Timeline-aware study tip builder
  const getStudyAdvice = () => {
    if (timeLeft.isOver) {
      return {
        title: "Exams are underway!",
        message: "Stay calm, read each math question twice, show all your working steps, and secure those distinction marks!",
        status: "active"
      };
    }

    if (timeLeft.days > 90) {
      return {
        title: "Conceptual Building Phase",
        message: "You have plenty of time. Focus on building core theory. Master functions, algebra laws, and basic derivatives. Keep booking your weekly Amaris lessons!",
        status: "good"
      };
    } else if (timeLeft.days > 45) {
      return {
        title: "Intense Past-Papers Era",
        message: "Under 3 months to go! Transition fully into practicing 3-hour past national exam papers. Pinpoint patterns in Paper 1 and Paper 2 questions.",
        status: "warning"
      };
    } else if (timeLeft.days > 15) {
      return {
        title: "Targeted Weak-Spot Polishing",
        message: "Crucial revision window. Focus intensely on topics where you consistently lose marks. Book live whiteboards to clear up specific sticky concepts.",
        status: "danger"
      };
    } else {
      return {
        title: "Final Distinction Countdown!",
        message: "Double down on past papers, keep your sleep schedule consistent, review your personal formula booklet, and approach the board with absolute confidence!",
        status: "critical"
      };
    }
  };

  const advice = getStudyAdvice();

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-sm p-6 space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-850 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gold-500" />
            <h3 className="text-base font-black text-navy-900 dark:text-white uppercase tracking-tight">
              Matric Finals Countdown
            </h3>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Real-time track to the South African National Matric Exams.
          </p>
        </div>

        {/* CAPS vs IEB Selector */}
        <div className="flex bg-navy-100 dark:bg-navy-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setExamType("caps")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              examType === "caps"
                ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm"
                : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            CAPS / NSC
          </button>
          <button
            onClick={() => setExamType("ieb")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              examType === "ieb"
                ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm"
                : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            IEB Syllabus
          </button>
        </div>
      </div>

      {/* Countdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Days */}
        <div className="bg-gradient-to-b from-navy-50 to-navy-100/50 dark:from-navy-950/60 dark:to-navy-900/40 p-4 rounded-xl border border-navy-150 dark:border-navy-850 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-royal-500 to-royal-600" />
          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-navy-900 dark:text-white tracking-tight block">
            {timeLeft.days}
          </span>
          <span className="text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider block mt-1">
            Days
          </span>
        </div>

        {/* Hours */}
        <div className="bg-gradient-to-b from-navy-50 to-navy-100/50 dark:from-navy-950/60 dark:to-navy-900/40 p-4 rounded-xl border border-navy-150 dark:border-navy-850 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-500 to-gold-600" />
          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-navy-900 dark:text-white tracking-tight block">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider block mt-1">
            Hours
          </span>
        </div>

        {/* Minutes */}
        <div className="bg-gradient-to-b from-navy-50 to-navy-100/50 dark:from-navy-950/60 dark:to-navy-900/40 p-4 rounded-xl border border-navy-150 dark:border-navy-850 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-navy-900 dark:text-white tracking-tight block">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider block mt-1">
            Minutes
          </span>
        </div>

        {/* Seconds */}
        <div className="bg-gradient-to-b from-navy-50 to-navy-100/50 dark:from-navy-950/60 dark:to-navy-900/40 p-4 rounded-xl border border-navy-150 dark:border-navy-850 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-red-600" />
          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-royal-600 dark:text-gold-400 tracking-tight block">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider block mt-1">
            Seconds
          </span>
        </div>
      </div>

      {/* Progress towards Exams */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-navy-500 dark:text-navy-400">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-gold-500" />
            Matric Prep Year Progress
          </span>
          <span className="font-extrabold text-navy-900 dark:text-white">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-royal-600 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-navy-400 dark:text-navy-500 font-mono text-right">
          Syllabus Target Date: <b>{getExamDate(examType).toLocaleDateString("en-ZA", { dateStyle: "long" })} @ 09:00 AM SAST</b>
        </p>
      </div>

      {/* Encouragement tip based on remaining timeline */}
      <div className="p-4 bg-gold-50/40 dark:bg-navy-950/40 border border-gold-200/50 dark:border-navy-850 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-gold-600 dark:text-gold-400" />
          <h4 className="text-xs font-black text-navy-900 dark:text-white font-mono uppercase tracking-wide">
            {advice.title}
          </h4>
        </div>
        <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed">
          {advice.message}
        </p>
      </div>

      {/* Syllabus high-yield topics checklist */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 border-b border-navy-100 dark:border-navy-850 pb-2">
          <BookOpen className="w-4 h-4 text-royal-500" />
          <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider font-mono">
            {examType.toUpperCase()} Paper 1 & 2 High-Yield Topics
          </h4>
        </div>

        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {syllabusFocus[examType].map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-3 p-2 bg-navy-50/40 dark:bg-navy-950/10 rounded-lg border border-navy-100/50 dark:border-navy-850/50"
            >
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-navy-900 dark:text-white">
                    {item.topic}
                  </span>
                </div>
                <p className="text-[10px] text-navy-500 dark:text-navy-400 pl-5">
                  {item.focus}
                </p>
              </div>
              <span className="text-[10px] font-mono font-extrabold text-royal-600 dark:text-gold-400 bg-royal-100/40 dark:bg-navy-850 px-2 py-0.5 rounded shrink-0">
                {item.weight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
