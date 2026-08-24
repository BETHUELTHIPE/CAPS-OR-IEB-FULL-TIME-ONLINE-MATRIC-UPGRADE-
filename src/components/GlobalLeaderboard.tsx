import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  GraduationCap, 
  Star,
  Info,
  ChevronRight,
  BookOpen,
  HelpCircle,
  X,
  Target,
  RefreshCw
} from "lucide-react";
import { Profile } from "../types";
import { getFromDB, saveToDB } from "../lib/db";
import { DailyQuizRecord } from "./DailyChallengeQuiz";
import { QuizAttemptResult } from "./SubjectQuizMode";

export interface GlobalLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  school: string;
  province: string;
  grade: string;
  curriculum: "CAPS" | "IEB";
  totalPoints: number;
  dailyChallengePoints: number;
  quizAssessmentPoints: number;
  streakDays: number;
  quizzesCompleted: number;
  dailyChallengesCompleted: number;
  rankChange: "up" | "down" | "same";
  rankChangeAmount?: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  tierBadge: "Matric Legend" | "Code 7 Distinction" | "Calculus Wizard" | "Euclidean Master" | "Algebra Star" | "Trig Expert";
}

// Seed Top 10 South African CAPS & IEB High School Students
const INITIAL_TOP_STUDENTS_SEED: Omit<GlobalLeaderboardEntry, "rank">[] = [
  {
    id: "lb-siyabonga",
    name: "Siyabonga Dlamini",
    school: "Pretoria Boys High School",
    province: "Gauteng",
    grade: "Grade 12 CAPS",
    curriculum: "CAPS",
    totalPoints: 5420,
    dailyChallengePoints: 2150,
    quizAssessmentPoints: 3270,
    streakDays: 24,
    quizzesCompleted: 38,
    dailyChallengesCompleted: 45,
    rankChange: "same",
    tierBadge: "Matric Legend"
  },
  {
    id: "lb-anika",
    name: "Anika van der Merwe",
    school: "Rondebosch Boys' High",
    province: "Western Cape",
    grade: "Grade 12 IEB",
    curriculum: "IEB",
    totalPoints: 5180,
    dailyChallengePoints: 1980,
    quizAssessmentPoints: 3200,
    streakDays: 19,
    quizzesCompleted: 34,
    dailyChallengesCompleted: 41,
    rankChange: "up",
    rankChangeAmount: 1,
    tierBadge: "Code 7 Distinction"
  },
  {
    id: "lb-keagan",
    name: "Keagan Naidoo",
    school: "Westville Boys' High",
    province: "KwaZulu-Natal",
    grade: "Grade 12 CAPS",
    curriculum: "CAPS",
    totalPoints: 4890,
    dailyChallengePoints: 1850,
    quizAssessmentPoints: 3040,
    streakDays: 16,
    quizzesCompleted: 31,
    dailyChallengesCompleted: 37,
    rankChange: "down",
    rankChangeAmount: 1,
    tierBadge: "Calculus Wizard"
  },
  {
    id: "lb-lungile",
    name: "Lungile Mthembu",
    school: "Hilton College",
    province: "KwaZulu-Natal",
    grade: "Grade 11 IEB",
    curriculum: "IEB",
    totalPoints: 4450,
    dailyChallengePoints: 1720,
    quizAssessmentPoints: 2730,
    streakDays: 14,
    quizzesCompleted: 28,
    dailyChallengesCompleted: 33,
    rankChange: "up",
    rankChangeAmount: 2,
    tierBadge: "Euclidean Master"
  },
  {
    id: "lb-chloe",
    name: "Chloë Botha",
    school: "St Mary's DSG Pretoria",
    province: "Gauteng",
    grade: "Grade 12 IEB",
    curriculum: "IEB",
    totalPoints: 4120,
    dailyChallengePoints: 1540,
    quizAssessmentPoints: 2580,
    streakDays: 12,
    quizzesCompleted: 26,
    dailyChallengesCompleted: 30,
    rankChange: "same",
    tierBadge: "Calculus Wizard"
  },
  {
    id: "lb-wandile",
    name: "Wandile Zuma",
    school: "Glenwood High School",
    province: "KwaZulu-Natal",
    grade: "Grade 12 CAPS",
    curriculum: "CAPS",
    totalPoints: 3860,
    dailyChallengePoints: 1420,
    quizAssessmentPoints: 2440,
    streakDays: 11,
    quizzesCompleted: 24,
    dailyChallengesCompleted: 28,
    rankChange: "up",
    rankChangeAmount: 1,
    tierBadge: "Code 7 Distinction"
  },
  {
    id: "lb-lethabo",
    name: "Lethabo Mabena",
    school: "Grey College Bloemfontein",
    province: "Free State",
    grade: "Grade 10 CAPS",
    curriculum: "CAPS",
    totalPoints: 3610,
    dailyChallengePoints: 1350,
    quizAssessmentPoints: 2260,
    streakDays: 9,
    quizzesCompleted: 22,
    dailyChallengesCompleted: 26,
    rankChange: "down",
    rankChangeAmount: 2,
    tierBadge: "Algebra Star"
  },
  {
    id: "lb-liam",
    name: "Liam O'Connor",
    school: "Bishops Diocesan College",
    province: "Western Cape",
    grade: "Grade 12 IEB",
    curriculum: "IEB",
    totalPoints: 3340,
    dailyChallengePoints: 1210,
    quizAssessmentPoints: 2130,
    streakDays: 8,
    quizzesCompleted: 20,
    dailyChallengesCompleted: 23,
    rankChange: "up",
    rankChangeAmount: 1,
    tierBadge: "Trig Expert"
  },
  {
    id: "lb-kelebogile",
    name: "Kelebogile Dlamini",
    school: "Waterkloof High School",
    province: "Gauteng",
    grade: "Matric Upgrade",
    curriculum: "CAPS",
    totalPoints: 3120,
    dailyChallengePoints: 1150,
    quizAssessmentPoints: 1970,
    streakDays: 7,
    quizzesCompleted: 19,
    dailyChallengesCompleted: 21,
    rankChange: "same",
    tierBadge: "Algebra Star"
  },
  {
    id: "lb-branden",
    name: "Branden Khumalo",
    school: "Maritzburg College",
    province: "KwaZulu-Natal",
    grade: "Grade 11 CAPS",
    curriculum: "CAPS",
    totalPoints: 2950,
    dailyChallengePoints: 1080,
    quizAssessmentPoints: 1870,
    streakDays: 6,
    quizzesCompleted: 18,
    dailyChallengesCompleted: 20,
    rankChange: "up",
    rankChangeAmount: 1,
    tierBadge: "Trig Expert"
  }
];

export interface GlobalLeaderboardProps {
  user?: Profile | null;
  onTakeQuiz?: () => void;
  onTakeDailyChallenge?: () => void;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  user,
  onTakeQuiz,
  onTakeDailyChallenge
}) => {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all_time">("all_time");
  const [curriculumFilter, setCurriculumFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showXPModal, setShowXPModal] = useState<boolean>(false);
  const [leaderboardList, setLeaderboardList] = useState<GlobalLeaderboardEntry[]>(() => 
    INITIAL_TOP_STUDENTS_SEED.map((student, idx) => ({
      ...student,
      rank: idx + 1
    }))
  );

  // Calculate live user points from local storage records
  const currentUserStats = useMemo(() => {
    const userId = user?.id || "usr-bethuel";
    
    // Daily Challenge Records
    const dailyRecords = getFromDB<DailyQuizRecord>("amh_daily_quiz_records");
    const userDailyRecords = dailyRecords.filter(r => r.user_id === userId);
    const dailyPoints = userDailyRecords.reduce((sum, r) => sum + (r.points_earned || 0), 0);
    const dailyCount = userDailyRecords.length;

    // Subject Quiz Records
    const quizRecords = getFromDB<QuizAttemptResult>("amh_subject_quiz_history");
    const userQuizRecords = quizRecords.filter(r => r.userId === userId);
    
    let quizPoints = 0;
    userQuizRecords.forEach(attempt => {
      const mult = attempt.difficulty === "Matric Mastery" ? 2.0 : attempt.difficulty === "Intermediate" ? 1.5 : 1.0;
      const baseXP = attempt.correctAnswers * 15 * mult;
      const bonusXP = attempt.scorePercentage >= 80 ? 100 : 0;
      quizPoints += Math.round(baseXP + bonusXP);
    });
    const quizCount = userQuizRecords.length;

    // Calculate current streak from localStorage
    let streakDays = 7;
    try {
      const savedStreak = localStorage.getItem("amh_daily_streak_count");
      if (savedStreak) {
        streakDays = parseInt(savedStreak, 10) || 7;
      }
    } catch (e) {
      console.error(e);
    }

    const totalXP = (dailyPoints > 0 || quizPoints > 0)
      ? dailyPoints + quizPoints + (streakDays * 50)
      : 3250; // default baseline for active student if no quizzes done yet

    let badge: GlobalLeaderboardEntry["tierBadge"] = "Code 7 Distinction";
    if (totalXP >= 5000) badge = "Matric Legend";
    else if (totalXP >= 4000) badge = "Code 7 Distinction";
    else if (totalXP >= 3000) badge = "Calculus Wizard";
    else if (totalXP >= 2000) badge = "Euclidean Master";
    else badge = "Algebra Star";

    return {
      userId,
      dailyPoints: dailyPoints || 1250,
      quizPoints: quizPoints || 2000,
      totalXP,
      dailyCount: dailyCount || 22,
      quizCount: quizCount || 18,
      streakDays,
      badge
    };
  }, [user]);

  // Sync and assemble Top 10 list
  useEffect(() => {
    const userName = user 
      ? `${user.first_name || "Bethuel"} ${user.surname || "Thipe"}`
      : "Bethuel Thipe (You)";

    const userSchool = user?.school || "Pretoria High School";
    const userProvince = user?.province || "Gauteng";
    const userGrade = user?.grade || "Grade 12 CAPS";
    const userCurriculum = userGrade.includes("IEB") ? "IEB" : "CAPS";

    // Build Current User Entry
    const currentUserEntry: Omit<GlobalLeaderboardEntry, "rank"> = {
      id: currentUserStats.userId,
      name: `${userName} (You)`,
      school: userSchool,
      province: userProvince,
      grade: userGrade,
      curriculum: userCurriculum as "CAPS" | "IEB",
      totalPoints: currentUserStats.totalXP,
      dailyChallengePoints: currentUserStats.dailyPoints,
      quizAssessmentPoints: currentUserStats.quizPoints,
      streakDays: currentUserStats.streakDays,
      quizzesCompleted: currentUserStats.quizCount,
      dailyChallengesCompleted: currentUserStats.dailyCount,
      rankChange: "up",
      rankChangeAmount: 2,
      isCurrentUser: true,
      tierBadge: currentUserStats.badge
    };

    // Merge seed top students + current user
    const combined = [...INITIAL_TOP_STUDENTS_SEED];
    
    // Replace existing current user entry or add if missing
    const existingIndex = combined.findIndex(e => e.id === currentUserStats.userId || e.isCurrentUser);
    if (existingIndex !== -1) {
      combined[existingIndex] = currentUserEntry;
    } else {
      combined.push(currentUserEntry);
    }

    // Sort descending by totalPoints
    combined.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign rank 1..N
    const ranked: GlobalLeaderboardEntry[] = combined.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));

    setLeaderboardList(ranked);
  }, [user, currentUserStats]);

  // Timeframe multiplier logic for display
  const timeframeMultiplier = timeframe === "weekly" ? 0.35 : timeframe === "monthly" ? 0.75 : 1.0;

  // Filtered entries
  const filteredLeaderboard = useMemo(() => {
    return leaderboardList
      .map(item => ({
        ...item,
        displayPoints: Math.round(item.totalPoints * timeframeMultiplier)
      }))
      .filter(item => {
        const matchesSearch = 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.province.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCurriculum = 
          curriculumFilter === "All" ||
          (curriculumFilter === "CAPS" && item.curriculum === "CAPS") ||
          (curriculumFilter === "IEB" && item.curriculum === "IEB") ||
          (curriculumFilter === "Grade 12" && item.grade.includes("Grade 12"));

        return matchesSearch && matchesCurriculum;
      })
      .sort((a, b) => b.displayPoints - a.displayPoints)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }, [leaderboardList, searchQuery, curriculumFilter, timeframeMultiplier]);

  // Podium Positions (Top 3)
  const top1 = filteredLeaderboard.find(e => e.rank === 1);
  const top2 = filteredLeaderboard.find(e => e.rank === 2);
  const top3 = filteredLeaderboard.find(e => e.rank === 3);

  // Top 10 list
  const top10List = filteredLeaderboard.slice(0, 10);

  // Current user's relative ranking
  const currentUserRankEntry: GlobalLeaderboardEntry & { displayPoints: number } = useMemo(() => {
    const foundInFiltered = filteredLeaderboard.find(e => e.isCurrentUser);
    if (foundInFiltered) return foundInFiltered;
    
    const foundInAll = leaderboardList.find(e => e.isCurrentUser);
    if (foundInAll) {
      return {
        ...foundInAll,
        displayPoints: Math.round(foundInAll.totalPoints * timeframeMultiplier)
      };
    }
    
    if (filteredLeaderboard.length > 0) return filteredLeaderboard[0];
    if (leaderboardList.length > 0) {
      return {
        ...leaderboardList[0],
        displayPoints: Math.round(leaderboardList[0].totalPoints * timeframeMultiplier)
      };
    }

    return {
      id: "usr-fallback",
      rank: 1,
      name: "Bethuel Thipe (You)",
      school: "Pretoria High School",
      province: "Gauteng",
      grade: "Grade 12 CAPS",
      curriculum: "CAPS",
      totalPoints: 3250,
      displayPoints: Math.round(3250 * timeframeMultiplier),
      dailyChallengePoints: 1250,
      quizAssessmentPoints: 2000,
      streakDays: 7,
      quizzesCompleted: 18,
      dailyChallengesCompleted: 22,
      rankChange: "up",
      isCurrentUser: true,
      tierBadge: "Code 7 Distinction"
    };
  }, [filteredLeaderboard, leaderboardList, timeframeMultiplier]);

  return (
    <section 
      aria-label="Global Student Mathematics Leaderboard"
      className="bg-gradient-to-br from-navy-950 via-navy-900 to-royal-950 border-2 border-navy-800 dark:border-gold-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden space-y-8"
      id="global-leaderboard-component"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-royal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-800 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-gold-500 via-amber-400 to-gold-300 text-navy-950 font-black shadow-xl shrink-0 ring-4 ring-gold-500/20">
            <Trophy className="w-7 h-7 text-navy-950 fill-navy-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold-400/20 text-gold-300 border border-gold-400/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-400 animate-spin" /> CAPS & IEB Academic Competition
              </span>
              <span className="text-[11px] font-mono text-navy-300 font-bold hidden sm:inline">
                • Top 10 National Standings
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight">
              Global Mathematics Leaderboard
            </h2>
            <p className="text-xs text-navy-300 mt-0.5 font-sans">
              Top performing high school students ranked by verified Daily Challenge XP and Subject Quiz mastery points.
            </p>
          </div>
        </div>

        {/* TIMEFRAME TOGGLE & XP GUIDE CTA */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div 
            className="bg-navy-950/90 border border-navy-800 p-1 rounded-2xl flex items-center gap-1 text-xs font-mono font-bold"
            role="tablist"
            aria-label="Leaderboard timeframe selection"
          >
            {[
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" },
              { id: "all_time", label: "All-Time" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={timeframe === tab.id}
                aria-label={`View ${tab.label} Leaderboard Rankings`}
                onClick={() => setTimeframe(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === tab.id
                    ? "bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black shadow-md"
                    : "text-navy-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowXPModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-royal-900/80 hover:bg-royal-800 border border-royal-700/80 text-gold-300 font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow"
            title="Learn how XP points are calculated"
            id="btn-open-xp-guide"
          >
            <Info className="w-4 h-4 text-gold-400 shrink-0" />
            <span>XP Scoring Rules</span>
          </button>
        </div>
      </div>

      {/* PODIUM TOP 3 HIGHLIGHT SECTION */}
      {top1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 relative z-10 items-end">
          
          {/* RANK 2 (SILVER) - Left on Desktop */}
          {top2 && (
            <div className="order-2 md:order-1 bg-gradient-to-b from-navy-900/90 via-slate-900/80 to-navy-950 border-2 border-slate-400/40 rounded-2xl p-5 text-center relative overflow-hidden shadow-lg hover:border-slate-300 transition-all">
              <div className="absolute top-3 right-3 text-slate-400 font-black font-mono text-sm px-2 py-0.5 rounded bg-slate-400/10 border border-slate-400/30">
                #2 SILVER
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-300 text-navy-950 font-black text-xl mx-auto mb-3 flex items-center justify-center ring-4 ring-slate-400/30 shadow-lg">
                <Medal className="w-8 h-8 text-navy-950" />
              </div>
              <h3 className="font-black text-base text-white truncate px-2">{top2.name}</h3>
              <p className="text-[11px] text-slate-300 font-mono truncate">{top2.school}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-400/20 text-slate-200 border border-slate-400/30 text-xs font-mono font-black">
                <Zap className="w-3.5 h-3.5 text-slate-300" />
                <span>{top2.displayPoints.toLocaleString()} XP</span>
              </div>
              <div className="mt-2 text-[10px] text-navy-400 font-mono flex items-center justify-center gap-2">
                <span>🔥 {top2.streakDays}d Streak</span>
                <span>•</span>
                <span>{top2.tierBadge}</span>
              </div>
            </div>
          )}

          {/* RANK 1 (GOLD) - Center Tallest Podium */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/90 via-gold-950/80 to-navy-950 border-2 border-gold-400 rounded-2xl p-6 text-center relative overflow-hidden shadow-2xl shadow-gold-500/10 hover:border-gold-300 transition-all transform md:-translate-y-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-gold-300 to-amber-500 animate-pulse" />
            <div className="absolute top-3 right-3 text-gold-300 font-black font-mono text-xs px-2.5 py-0.5 rounded-full bg-gold-500/20 border border-gold-400/40 uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-gold-400 fill-gold-400" /> #1 CHAMPION
            </div>
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gold-500 to-amber-300 text-navy-950 font-black text-2xl mx-auto mb-3 flex items-center justify-center ring-4 ring-gold-400/50 shadow-2xl relative">
              <Crown className="w-10 h-10 text-navy-950 fill-navy-950" />
              <span className="absolute -bottom-1 bg-navy-950 text-gold-400 font-black text-[10px] px-2 py-0.5 rounded-full border border-gold-400">
                1st Place
              </span>
            </div>

            <h3 className="font-black text-lg text-white truncate px-2">{top1.name}</h3>
            <p className="text-xs text-gold-300 font-mono font-bold truncate">{top1.school} ({top1.province})</p>
            
            <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/50 text-sm font-mono font-black shadow-inner">
              <Trophy className="w-4 h-4 text-gold-400 fill-gold-400" />
              <span>{top1.displayPoints.toLocaleString()} XP</span>
            </div>

            <div className="mt-2.5 text-xs text-navy-200 font-mono flex items-center justify-center gap-2">
              <span className="text-amber-400 font-bold">🔥 {top1.streakDays}-Day Streak</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 text-[10px] font-bold border border-gold-500/20">
                {top1.tierBadge}
              </span>
            </div>
          </div>

          {/* RANK 3 (BRONZE) - Right on Desktop */}
          {top3 && (
            <div className="order-3 bg-gradient-to-b from-navy-900/90 via-amber-950/40 to-navy-950 border-2 border-amber-600/40 rounded-2xl p-5 text-center relative overflow-hidden shadow-lg hover:border-amber-500/60 transition-all">
              <div className="absolute top-3 right-3 text-amber-500 font-black font-mono text-sm px-2 py-0.5 rounded bg-amber-600/10 border border-amber-500/30">
                #3 BRONZE
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-600 text-navy-950 font-black text-xl mx-auto mb-3 flex items-center justify-center ring-4 ring-amber-500/30 shadow-lg">
                <Award className="w-8 h-8 text-navy-950 fill-navy-950" />
              </div>
              <h3 className="font-black text-base text-white truncate px-2">{top3.name}</h3>
              <p className="text-[11px] text-amber-300 font-mono truncate">{top3.school}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-black">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{top3.displayPoints.toLocaleString()} XP</span>
              </div>
              <div className="mt-2 text-[10px] text-navy-400 font-mono flex items-center justify-center gap-2">
                <span>🔥 {top3.streakDays}d Streak</span>
                <span>•</span>
                <span>{top3.tierBadge}</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 relative z-10">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or high school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-navy-950/90 border border-navy-800 rounded-xl text-xs text-white placeholder-navy-500 focus:outline-none focus:border-gold-400 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Curriculum & Grade Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs">
          {[
            { id: "All", label: "All Students" },
            { id: "CAPS", label: "CAPS Only" },
            { id: "IEB", label: "IEB Only" },
            { id: "Grade 12", label: "Grade 12s" }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCurriculumFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                curriculumFilter === cat.id
                  ? "bg-royal-600 text-white border-royal-400 font-black shadow-sm"
                  : "bg-navy-950/60 text-navy-400 border-navy-800 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* LEADERBOARD TOP 10 TABLE */}
      <div className="bg-navy-950/80 border border-navy-800 rounded-2xl overflow-hidden shadow-xl relative z-10">
        <div className="px-5 py-3.5 bg-navy-900/80 border-b border-navy-800 flex items-center justify-between text-xs font-mono font-bold text-navy-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">Rank</span>
            <span>Student & School</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline">Curriculum</span>
            <span className="hidden sm:inline">Streak</span>
            <span className="text-right">Total XP</span>
          </div>
        </div>

        <div className="divide-y divide-navy-850/80">
          {top10List.length > 0 ? (
            top10List.map((student) => {
              const isUser = student.isCurrentUser;
              return (
                <div
                  key={student.id}
                  className={`px-5 py-4 flex items-center justify-between gap-4 transition-all ${
                    isUser
                      ? "bg-gradient-to-r from-gold-500/15 via-royal-900/40 to-gold-500/10 border-l-4 border-l-gold-400 font-bold"
                      : "hover:bg-navy-900/50"
                  }`}
                >
                  {/* Rank & Student Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 shrink-0 text-center flex items-center justify-center font-mono font-black text-sm">
                      {student.rank === 1 ? (
                        <Crown className="w-5 h-5 text-gold-400 fill-gold-400" />
                      ) : student.rank === 2 ? (
                        <Medal className="w-5 h-5 text-slate-300" />
                      ) : student.rank === 3 ? (
                        <Award className="w-5 h-5 text-amber-500" />
                      ) : (
                        <span className="text-navy-400">#{student.rank}</span>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-black truncate ${isUser ? "text-gold-300" : "text-white"}`}>
                          {student.name}
                        </span>
                        {isUser && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-gold-400 text-navy-950 uppercase">
                            YOU
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-900 text-navy-300 border border-navy-800">
                          {student.tierBadge}
                        </span>
                      </div>
                      <p className="text-xs text-navy-400 font-mono truncate">
                        {student.school} • <span className="text-navy-300">{student.province}</span> ({student.grade})
                      </p>
                    </div>
                  </div>

                  {/* Points & Stats */}
                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div className="hidden md:block text-left text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        student.curriculum === "IEB" 
                          ? "bg-purple-950 text-purple-300 border border-purple-800" 
                          : "bg-royal-950 text-royal-300 border border-royal-800"
                      }`}>
                        {student.curriculum}
                      </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{student.streakDays}d</span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black font-mono text-gold-400">
                        {student.displayPoints.toLocaleString()} <span className="text-[10px] text-navy-400">XP</span>
                      </div>
                      <div className="text-[10px] font-mono text-navy-400">
                        {student.quizzesCompleted} Quizzes | {student.dailyChallengesCompleted} Daily
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-navy-400 font-mono text-xs">
              No students found matching search filters.
            </div>
          )}
        </div>
      </div>

      {/* CURRENT USER POSITION SPOTLIGHT FOOTER */}
      <div className="bg-gradient-to-r from-royal-950 via-navy-900 to-amber-950 border-2 border-gold-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gold-400/20 text-gold-300 border border-gold-400/40 font-black shrink-0">
            <Target className="w-5 h-5 text-gold-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono text-gold-300 font-bold uppercase flex items-center gap-1">
              Your Real-Time Leaderboard Position
            </div>
            <p className="text-sm font-black text-white">
              Rank #{currentUserRankEntry?.rank ?? 1} • {(currentUserRankEntry?.displayPoints ?? 0).toLocaleString()} Total Knowledge XP
            </p>
            <p className="text-[11px] text-navy-300 font-mono mt-0.5">
              Keep solving CAPS & IEB daily problems to climb higher in the national standings!
            </p>
          </div>
        </div>

        {/* CTAs to immediately earn points */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {onTakeDailyChallenge && (
            <button
              type="button"
              onClick={onTakeDailyChallenge}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-black text-xs font-mono transition-transform hover:scale-105 shadow cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 fill-navy-950" />
              <span>Daily Challenge (+50 XP)</span>
            </button>
          )}

          {onTakeQuiz && (
            <button
              type="button"
              onClick={onTakeQuiz}
              className="px-3.5 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-black text-xs font-mono transition-transform hover:scale-105 shadow cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-gold-300" />
              <span>Attempt Quiz (+100 XP)</span>
            </button>
          )}
        </div>
      </div>

      {/* XP RULES EXPLANATION MODAL */}
      <AnimatePresence>
        {showXPModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-navy-900 border-2 border-gold-400/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-6 relative"
            >
              <button
                type="button"
                onClick={() => setShowXPModal(false)}
                className="absolute top-4 right-4 p-2 text-navy-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gold-400/20 text-gold-300 border border-gold-400/40">
                  <Sparkles className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display text-white">
                    XP Scoring System Rules
                  </h3>
                  <p className="text-xs text-navy-300 font-mono">
                    How academic competition points are earned at AMH
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-navy-200 font-sans">
                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                  <div className="font-mono font-bold text-gold-400 flex items-center justify-between">
                    <span>🔥 Daily Math Challenge</span>
                    <span>+50 to +100 XP</span>
                  </div>
                  <p className="text-navy-300 leading-relaxed">
                    Complete your daily CAPS or IEB question. Correct answers award 50-100 XP depending on question difficulty level.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                  <div className="font-mono font-bold text-gold-400 flex items-center justify-between">
                    <span>⚡ Subject Quiz Assessments</span>
                    <span>10-20 XP / Correct Q</span>
                  </div>
                  <p className="text-navy-300 leading-relaxed">
                    Attempt topic assessments (Algebra, Calculus, Trig). Foundation difficulty gives 1x, Intermediate 1.5x, and Matric Mastery gives 2.0x multiplier + 100 XP for Code 7 Distinction (80%+).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                  <div className="font-mono font-bold text-gold-400 flex items-center justify-between">
                    <span>👑 Continuous Flame Streak</span>
                    <span>+50 XP / Streak Day</span>
                  </div>
                  <p className="text-navy-300 leading-relaxed">
                    Maintain continuous study days. A 7-day streak unlocks bonus formula cheat sheets and streak multipliers!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowXPModal(false)}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black text-xs rounded-xl shadow cursor-pointer uppercase tracking-wider font-mono"
              >
                Got It, Let's Compete!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
