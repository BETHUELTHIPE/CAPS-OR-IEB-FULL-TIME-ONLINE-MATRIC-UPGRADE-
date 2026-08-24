import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Users,
  Target,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronRight,
  Calendar,
  Zap,
  TrendingUp,
  Brain,
  ShieldCheck,
  FileText,
  Download,
  Video,
  Globe,
  Star,
  Check,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  BookOpen
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";
import { getFromDB, saveToDB, generateId, generateBookingReference } from "../lib/db";
import { Profile, Booking } from "../types";

export interface StudentPerformanceGap {
  studentId: string;
  studentName: string;
  grade: string;
  curriculum: "CAPS" | "IEB" | "AP Maths";
  timezone: string;
  preferredSlotTimes: string[];
  overallAvgScore: number;
  weakTopics: {
    topic: string;
    score: number;
    targetScore: number;
    severity: "critical" | "moderate" | "minor";
  }[];
}

export interface TutorExpertProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  avatar: string;
  specializations: string[];
  curriculumExpertise: ("CAPS" | "IEB" | "AP Maths")[];
  gradeSpecialty: string;
  timezone: string;
  availableSlots: string[]; // e.g. ["Mon 16:00", "Wed 18:00", "Fri 15:00"]
  rating: number;
  totalLessonsCompleted: number;
  avgStudentGradeJump: number; // e.g. +18.4%
  isAvailable: boolean;
}

export interface MatchScoreResult {
  tutor: TutorExpertProfile;
  totalScore: number; // 0 - 100
  breakdown: {
    expertiseMatch: number;
    curriculumMatch: number;
    timezoneScheduleMatch: number;
    ratingMatch: number;
  };
  coveredGaps: string[];
  overlappingSlots: string[];
  recommendationReason: string;
}

// DEFAULT STUDENT PERFORMANCE GAP SEEDS
export const DEFAULT_STUDENT_GAPS: StudentPerformanceGap[] = [
  {
    studentId: "usr-sipho",
    studentName: "Sipho Ndlovu",
    grade: "Matric Upgrade",
    curriculum: "CAPS",
    timezone: "CAT (UTC+2) - South Africa",
    preferredSlotTimes: ["Mon 16:00", "Wed 18:00", "Fri 15:00"],
    overallAvgScore: 52,
    weakTopics: [
      { topic: "Differential Calculus", score: 41, targetScore: 75, severity: "critical" },
      { topic: "Trigonometry", score: 48, targetScore: 75, severity: "critical" },
      { topic: "Euclidean Geometry", score: 54, targetScore: 75, severity: "moderate" },
      { topic: "Analytical Geometry", score: 62, targetScore: 75, severity: "minor" },
      { topic: "Algebra & Surds", score: 71, targetScore: 75, severity: "minor" },
      { topic: "Financial Maths", score: 68, targetScore: 75, severity: "minor" }
    ]
  },
  {
    studentId: "usr-lerato",
    studentName: "Lerato Mokoena",
    grade: "Grade 12 IEB",
    curriculum: "IEB",
    timezone: "CAT (UTC+2) - South Africa",
    preferredSlotTimes: ["Tue 15:00", "Thu 16:30", "Sat 10:00"],
    overallAvgScore: 58,
    weakTopics: [
      { topic: "Euclidean Geometry", score: 39, targetScore: 80, severity: "critical" },
      { topic: "Sequences & Series", score: 51, targetScore: 80, severity: "moderate" },
      { topic: "Trigonometry", score: 55, targetScore: 80, severity: "moderate" },
      { topic: "Differential Calculus", score: 68, targetScore: 80, severity: "minor" },
      { topic: "Analytical Geometry", score: 74, targetScore: 80, severity: "minor" }
    ]
  },
  {
    studentId: "usr-anika",
    studentName: "Anika Patel",
    grade: "Grade 11 AP Maths",
    curriculum: "AP Maths",
    timezone: "CAT (UTC+2) - South Africa",
    preferredSlotTimes: ["Mon 18:00", "Wed 16:00", "Sat 11:30"],
    overallAvgScore: 64,
    weakTopics: [
      { topic: "Integration & Limits", score: 44, targetScore: 85, severity: "critical" },
      { topic: "Differential Equations", score: 52, targetScore: 85, severity: "critical" },
      { topic: "Advanced Algebra", score: 70, targetScore: 85, severity: "minor" }
    ]
  },
  {
    studentId: "usr-kagiso",
    studentName: "Kagiso Molefe",
    grade: "Grade 10 CAPS",
    curriculum: "CAPS",
    timezone: "CAT (UTC+2) - South Africa",
    preferredSlotTimes: ["Mon 15:00", "Tue 16:00", "Thu 15:00"],
    overallAvgScore: 46,
    weakTopics: [
      { topic: "Algebra & Surds", score: 38, targetScore: 70, severity: "critical" },
      { topic: "Analytical Geometry", score: 42, targetScore: 70, severity: "critical" },
      { topic: "Trigonometry Basics", score: 49, targetScore: 70, severity: "critical" }
    ]
  }
];

// REGISTERED TUTORS EXPERT DATABASE
export const REGISTERED_TUTORS: TutorExpertProfile[] = [
  {
    id: "usr-bethuel",
    name: "Bethuel",
    surname: "Moukangwe",
    email: "bethuelmoukangwe8@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    specializations: ["Differential Calculus", "Integration & Limits", "Analytical Geometry", "Algebra & Surds"],
    curriculumExpertise: ["CAPS", "IEB", "AP Maths"],
    gradeSpecialty: "Grade 11 - 12 & Matric Upgrade",
    timezone: "CAT (UTC+2) - South Africa",
    availableSlots: ["Mon 16:00", "Mon 18:00", "Wed 18:00", "Thu 16:30", "Fri 15:00", "Sat 10:00"],
    rating: 5.0,
    totalLessonsCompleted: 342,
    avgStudentGradeJump: 21.5,
    isAvailable: true
  },
  {
    id: "usr-naledi",
    name: "Naledi",
    surname: "Nkosi",
    email: "naledi.n@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    specializations: ["Trigonometry", "Euclidean Geometry", "Algebra & Surds", "Financial Maths"],
    curriculumExpertise: ["CAPS", "IEB"],
    gradeSpecialty: "Grade 10 - 12 CAPS/IEB",
    timezone: "CAT (UTC+2) - South Africa",
    availableSlots: ["Mon 15:00", "Tue 15:00", "Wed 18:00", "Thu 15:00", "Sat 10:00"],
    rating: 4.9,
    totalLessonsCompleted: 218,
    avgStudentGradeJump: 18.2,
    isAvailable: true
  },
  {
    id: "usr-thabo",
    name: "Thabo",
    surname: "Mokoena",
    email: "thabo.m@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    specializations: ["Integration & Limits", "Differential Equations", "Sequences & Series", "AP Maths"],
    curriculumExpertise: ["IEB", "AP Maths"],
    gradeSpecialty: "Grade 11 - 12 IEB & AP Maths",
    timezone: "CAT (UTC+2) - South Africa",
    availableSlots: ["Mon 18:00", "Wed 16:00", "Thu 16:30", "Fri 15:00", "Sat 11:30"],
    rating: 4.95,
    totalLessonsCompleted: 184,
    avgStudentGradeJump: 19.8,
    isAvailable: true
  },
  {
    id: "usr-sarah",
    name: "Dr. Sarah",
    surname: "Jenkins",
    email: "sarah.j@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    specializations: ["Euclidean Geometry", "Analytical Geometry", "Trigonometry Basics", "Statistics & Probability"],
    curriculumExpertise: ["CAPS"],
    gradeSpecialty: "Grade 10 - 11 CAPS Foundation",
    timezone: "CAT (UTC+2) - South Africa",
    availableSlots: ["Mon 15:00", "Tue 16:00", "Thu 15:00", "Fri 15:00"],
    rating: 4.85,
    totalLessonsCompleted: 140,
    avgStudentGradeJump: 16.4,
    isAvailable: true
  }
];

export const AutomatedTutorMatching: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("usr-sipho");
  const [weightExpertise, setWeightExpertise] = useState<number>(40);
  const [weightCurriculum, setWeightCurriculum] = useState<number>(25);
  const [weightSchedule, setWeightSchedule] = useState<number>(20);
  const [weightRating, setWeightRating] = useState<number>(15);

  const [matchedResults, setMatchedResults] = useState<MatchScoreResult[]>([]);
  const [selectedPairForBooking, setSelectedPairForBooking] = useState<{
    tutor: TutorExpertProfile;
    slot: string;
  } | null>(null);

  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const activeStudent =
    DEFAULT_STUDENT_GAPS.find((s) => s.studentId === selectedStudentId) || DEFAULT_STUDENT_GAPS[0];

  // Algorithmic Calculation Function
  const calculateMatches = () => {
    const totalWeights = weightExpertise + weightCurriculum + weightSchedule + weightRating;
    const normExp = weightExpertise / totalWeights;
    const normCurr = weightCurriculum / totalWeights;
    const normSched = weightSchedule / totalWeights;
    const normRat = weightRating / totalWeights;

    const criticalWeakTopics = activeStudent.weakTopics.map((w) => w.topic);

    const calculated: MatchScoreResult[] = REGISTERED_TUTORS.map((tutor) => {
      // 1. Expertise Match Sub-score (0 - 100)
      let expertiseScore = 0;
      const coveredGapsList: string[] = [];

      criticalWeakTopics.forEach((weakTopic) => {
        const matchesTopic = tutor.specializations.some((spec) =>
          spec.toLowerCase().includes(weakTopic.toLowerCase()) ||
          weakTopic.toLowerCase().includes(spec.toLowerCase())
        );
        if (matchesTopic) {
          expertiseScore += 100 / criticalWeakTopics.length;
          coveredGapsList.push(`Solves ${weakTopic} Gap`);
        }
      });
      expertiseScore = Math.min(100, Math.round(expertiseScore));

      // 2. Curriculum Match Sub-score (0 - 100)
      const curriculumMatchScore = tutor.curriculumExpertise.includes(activeStudent.curriculum) ? 100 : 50;

      // 3. Timezone & Schedule Overlap Sub-score (0 - 100)
      const overlappingSlots = tutor.availableSlots.filter((slot) =>
        activeStudent.preferredSlotTimes.includes(slot)
      );
      let scheduleMatchScore = 0;
      if (overlappingSlots.length >= 3) scheduleMatchScore = 100;
      else if (overlappingSlots.length === 2) scheduleMatchScore = 80;
      else if (overlappingSlots.length === 1) scheduleMatchScore = 60;
      else scheduleMatchScore = 20;

      // 4. Rating Match Sub-score (0 - 100)
      const ratingScore = Math.round((tutor.rating / 5.0) * 100);

      // Weighted Total Score Calculation
      const totalScore = Math.round(
        expertiseScore * normExp +
        curriculumMatchScore * normCurr +
        scheduleMatchScore * normSched +
        ratingScore * normRat
      );

      // Generate AI Reasoning summary
      let recommendationReason = "";
      if (totalScore >= 90) {
        recommendationReason = `Optimal Pairing! ${tutor.name} covers ${coveredGapsList.length} of ${activeStudent.studentName}'s critical gaps with ${overlappingSlots.length} overlapping study slots.`;
      } else if (totalScore >= 75) {
        recommendationReason = `Strong Match. Excellent ${tutor.curriculumExpertise.join("/")} alignment with solid topic mastery.`;
      } else {
        recommendationReason = `Partial Match. Covers selected foundations but has limited schedule overlap.`;
      }

      return {
        tutor,
        totalScore,
        breakdown: {
          expertiseMatch: expertiseScore,
          curriculumMatch: curriculumMatchScore,
          timezoneScheduleMatch: scheduleMatchScore,
          ratingMatch: ratingScore
        },
        coveredGaps: coveredGapsList,
        overlappingSlots,
        recommendationReason
      };
    });

    // Sort descending by total score
    calculated.sort((a, b) => b.totalScore - a.totalScore);
    setMatchedResults(calculated);
  };

  useEffect(() => {
    calculateMatches();
  }, [selectedStudentId, weightExpertise, weightCurriculum, weightSchedule, weightRating]);

  // Handle Assign & Book Pairing
  const handleConfirmPairing = () => {
    if (!selectedPairForBooking) return;

    const newBooking: Booking = {
      id: generateId(),
      student_id: activeStudent.studentId,
      subject_id: "subj-maths-paper1",
      package_id: "pkg-1on1-intensive",
      booking_reference: generateBookingReference(),
      lesson_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      lesson_time: selectedPairForBooking.slot,
      duration_minutes: 60,
      platform: "Google Meet",
      topics_to_cover: activeStudent.weakTopics.map(w => w.topic),
      notes: `Automated Tutor Match with ${selectedPairForBooking.tutor.name} ${selectedPairForBooking.tutor.surname}`,
      status: "confirmed",
      meeting_link: `https://meet.google.com/amh-math-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };

    try {
      const existingBookings = getFromDB<Booking>("amh_bookings");
      saveToDB("amh_bookings", [...existingBookings, newBooking]);

      setBookingSuccessMsg(
        `✓ Pairing Confirmed! Scheduled 1-on-1 session with ${selectedPairForBooking.tutor.name} on ${selectedPairForBooking.slot}. Meeting link: ${newBooking.meeting_link}`
      );
      setSelectedPairForBooking(null);

      setTimeout(() => setBookingSuccessMsg(null), 6000);
    } catch (err) {
      console.error("Error confirming tutor pairing booking:", err);
    }
  };

  // Prepare Recharts Radar Data for Student Weak Topics
  const radarData = activeStudent.weakTopics.map((w) => ({
    subject: w.topic.replace("Differential ", "").replace(" & Surds", ""),
    StudentScore: w.score,
    TargetScore: w.targetScore
  }));

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-950 via-royal-950 to-navy-900 border-2 border-gold-400/40 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Brain className="w-64 h-64 text-gold-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-500/20 text-gold-400 border border-amber-500/40">
                <Sparkles className="w-5 h-5 animate-spin" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Automated Tutor-Student Matching Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans">
              Algorithmic pairing matrix evaluating student performance gaps, curriculum alignment, tutor topic mastery, and timezone schedule overlap.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-2xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> CAT (UTC+2) Sync Active
            </span>
          </div>
        </div>
      </div>

      {bookingSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-between"
        >
          <span>{bookingSuccessMsg}</span>
          <button onClick={() => setBookingSuccessMsg(null)} className="text-emerald-500">✕</button>
        </motion.div>
      )}

      {/* STUDENT SELECTOR & GAP ANALYZER ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Student Profile & Gap Summary */}
        <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-royal-500" /> Select Target Student
            </span>
            <span className="text-[10px] font-mono font-bold text-gold-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              4 Enrolled Gap Profiles
            </span>
          </div>

          {/* Student Selector Buttons */}
          <div className="space-y-2">
            {DEFAULT_STUDENT_GAPS.map((std) => {
              const isSelected = std.studentId === selectedStudentId;
              return (
                <div
                  key={std.studentId}
                  onClick={() => setSelectedStudentId(std.studentId)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-royal-600 text-white border-royal-500 shadow-md ring-2 ring-royal-400/40"
                      : "bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white border-slate-200 dark:border-navy-800 hover:border-royal-400"
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate">{std.studentName}</h4>
                    <p className={`text-[10px] font-mono ${isSelected ? "text-royal-100" : "text-slate-500 dark:text-slate-400"}`}>
                      {std.grade} ({std.curriculum}) • Avg: {std.overallAvgScore}%
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {std.weakTopics.length} Weak Topics
                  </span>
                </div>
              );
            })}
          </div>

          {/* Student Info Details */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Timezone:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{activeStudent.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Preferred Study Hours:</span>
              <span className="font-bold text-amber-600 dark:text-gold-400">
                {activeStudent.preferredSlotTimes.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Radar Performance Gap Chart */}
        <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" /> Gap Analysis Breakdown
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Score vs Target (75%)
            </span>
          </div>

          {/* Recharts Radar */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" opacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 9 }} />
                <Radar name="Student Score" dataKey="StudentScore" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                <Radar name="Target Score" dataKey="TargetScore" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weak Topics List */}
          <div className="space-y-1.5 pt-2">
            {activeStudent.weakTopics.map((w) => (
              <div
                key={w.topic}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200">{w.topic}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-rose-500 font-bold">{w.score}%</span>
                  <span className="text-slate-400">/ {w.targetScore}%</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    w.severity === "critical"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {w.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Matching Weights Configuration Sliders */}
        <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" /> Algorithm Weight Tuning
            </span>
            <button
              onClick={calculateMatches}
              className="text-[10px] font-mono text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Slider 1: Topic Expertise */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300">Subject Gap Expertise</span>
              <span className="font-bold text-royal-600 dark:text-gold-400">{weightExpertise}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={weightExpertise}
              onChange={(e) => setWeightExpertise(Number(e.target.value))}
              className="w-full accent-royal-600 cursor-pointer"
            />
          </div>

          {/* Slider 2: Curriculum Fit */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300">Curriculum Fit (CAPS/IEB)</span>
              <span className="font-bold text-royal-600 dark:text-gold-400">{weightCurriculum}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={weightCurriculum}
              onChange={(e) => setWeightCurriculum(Number(e.target.value))}
              className="w-full accent-royal-600 cursor-pointer"
            />
          </div>

          {/* Slider 3: Timezone & Schedule Overlap */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300">Schedule & Timezone Overlap</span>
              <span className="font-bold text-royal-600 dark:text-gold-400">{weightSchedule}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={weightSchedule}
              onChange={(e) => setWeightSchedule(Number(e.target.value))}
              className="w-full accent-royal-600 cursor-pointer"
            />
          </div>

          {/* Slider 4: Rating & Track Record */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300">Tutor Rating & Impact</span>
              <span className="font-bold text-royal-600 dark:text-gold-400">{weightRating}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={weightRating}
              onChange={(e) => setWeightRating(Number(e.target.value))}
              className="w-full accent-royal-600 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-gold-300 font-sans">
            💡 Total Weighting Matrix: {weightExpertise + weightCurriculum + weightSchedule + weightRating}% (Normalized dynamically by the algorithm).
          </div>
        </div>
      </div>

      {/* MATCHED TUTORS RECOMMENDATIONS LIST */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
              Algorithmic Tutor Match Recommendations for {activeStudent.studentName}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-royal-500/15 text-royal-600 dark:text-royal-300 border border-royal-500/30">
            {matchedResults.length} Tutors Evaluated
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedResults.map((result, idx) => {
            const { tutor, totalScore, breakdown, coveredGaps, overlappingSlots, recommendationReason } = result;
            const isTopRank = idx === 0;

            return (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
                  isTopRank
                    ? "bg-gradient-to-br from-white via-royal-50/50 to-amber-50/30 dark:from-navy-950 dark:via-navy-900 dark:to-navy-850 border-amber-500/60 ring-2 ring-amber-500/30 shadow-2xl"
                    : "bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 shadow-xl"
                }`}
              >
                {/* Rank Badge */}
                {isTopRank && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-gold-400 text-navy-950 font-black text-[10px] font-mono tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> #1 OPTIMAL MATCH
                  </div>
                )}

                {/* Tutor Header Info */}
                <div className="flex items-start gap-3">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-navy-700 shrink-0 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {tutor.name} {tutor.surname}
                      </h4>
                      <span className="text-xs font-mono font-bold text-gold-500 flex items-center gap-0.5">
                        ★ {tutor.rating}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
                      {tutor.gradeSpecialty} • {tutor.totalLessonsCompleted} Lessons
                    </p>

                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Avg Student Grade Gain: +{tutor.avgStudentGradeJump}%
                    </p>
                  </div>
                </div>

                {/* Overall Score Progress Bar */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Algorithmic Match Rate</span>
                    <span
                      className={`font-black text-sm ${
                        totalScore >= 90
                          ? "text-emerald-600 dark:text-emerald-400"
                          : totalScore >= 75
                          ? "text-royal-600 dark:text-gold-400"
                          : "text-amber-500"
                      }`}
                    >
                      {totalScore}% Match
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        totalScore >= 90
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : totalScore >= 75
                          ? "bg-gradient-to-r from-royal-600 to-gold-400"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${totalScore}%` }}
                    />
                  </div>

                  {/* Breakdown Sub-scores */}
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-slate-400 pt-1 text-center">
                    <div>
                      <span className="block font-bold text-slate-700 dark:text-slate-300">{breakdown.expertiseMatch}%</span>
                      <span>Topic Gap</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 dark:text-slate-300">{breakdown.curriculumMatch}%</span>
                      <span>Curriculum</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 dark:text-slate-300">{breakdown.timezoneScheduleMatch}%</span>
                      <span>Schedule</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 dark:text-slate-300">{breakdown.ratingMatch}%</span>
                      <span>Rating</span>
                    </div>
                  </div>
                </div>

                {/* Covered Gaps Badges */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                    Gaps Solved:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {coveredGaps.length === 0 ? (
                      <span className="text-[10px] font-mono text-slate-400">No direct topic overlap</span>
                    ) : (
                      coveredGaps.map((gap) => (
                        <span
                          key={gap}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-500" /> {gap}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Overlapping Schedule Slots */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                    Overlapping Free Time Slots:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {overlappingSlots.length === 0 ? (
                      <span className="text-[10px] font-mono text-amber-500">No direct slot overlap</span>
                    ) : (
                      overlappingSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedPairForBooking({ tutor, slot })}
                          className="px-2 py-1 rounded-xl text-[10px] font-mono font-bold bg-royal-500/10 hover:bg-royal-500/20 text-royal-700 dark:text-gold-300 border border-royal-500/30 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3 text-gold-400" /> {slot}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Reasoning text */}
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans italic bg-slate-50 dark:bg-navy-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-navy-800">
                  "{recommendationReason}"
                </p>

                {/* Action Button */}
                <button
                  onClick={() =>
                    setSelectedPairForBooking({
                      tutor,
                      slot: overlappingSlots[0] || tutor.availableSlots[0] || "Mon 16:00"
                    })
                  }
                  className="w-full py-2.5 rounded-2xl bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Pair {activeStudent.studentName} with {tutor.name}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PAIRING MODAL OVERLAY */}
      {selectedPairForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                  Confirm Algorithmic Pairing
                </h3>
              </div>
              <button
                onClick={() => setSelectedPairForBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <span className="text-slate-400">Target Student:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {activeStudent.studentName} ({activeStudent.grade})
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <span className="text-slate-400">Assigned Tutor:</span>
                <p className="font-bold text-gold-400 text-sm">
                  {selectedPairForBooking.tutor.name} {selectedPairForBooking.tutor.surname} ({selectedPairForBooking.tutor.gradeSpecialty})
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <span className="text-slate-400">Selected Time Slot:</span>
                <p className="font-bold text-emerald-400 text-sm">
                  {selectedPairForBooking.slot} (CAT UTC+2)
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedPairForBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPairing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-navy-950 font-black text-xs font-mono shadow-lg hover:from-emerald-400 hover:to-teal-300 transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Generate Meeting Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
