import React, { useState, useEffect } from "react";
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
  ChevronRight
} from "lucide-react";
import { Profile } from "../types";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  school: string;
  province: string;
  grade: "Grade 10" | "Grade 11" | "Grade 12";
  curriculum: "CAPS" | "IEB";
  points: number;
  streakDays: number;
  challengesCompleted: number;
  lessonsCompleted: number;
  rankChange: "up" | "down" | "same";
  rankChangeAmount?: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  tierBadge: "Matric Legend" | "Euclidean Master" | "Calculus Wizard" | "Algebra Star" | "Trig Expert";
}

const LEADERBOARD_SEED_DATA: LeaderboardEntry[] = [
  {
    id: "lb-1",
    rank: 1,
    name: "Siyabonga Dlamini",
    school: "Pretoria Boys High",
    province: "Gauteng",
    grade: "Grade 12",
    curriculum: "CAPS",
    points: 4850,
    streakDays: 18,
    challengesCompleted: 42,
    lessonsCompleted: 15,
    rankChange: "same",
    tierBadge: "Matric Legend"
  },
  {
    id: "lb-2",
    rank: 2,
    name: "Anika van der Merwe",
    school: "Rondebosch Boys' High",
    province: "Western Cape",
    grade: "Grade 12",
    curriculum: "IEB",
    points: 4620,
    streakDays: 14,
    challengesCompleted: 39,
    lessonsCompleted: 14,
    rankChange: "up",
    rankChangeAmount: 2,
    tierBadge: "Calculus Wizard"
  },
  {
    id: "lb-3",
    rank: 3,
    name: "Keagan Naidoo",
    school: "Westville Boys' High",
    province: "KwaZulu-Natal",
    grade: "Grade 12",
    curriculum: "CAPS",
    points: 4390,
    streakDays: 12,
    challengesCompleted: 35,
    lessonsCompleted: 12,
    rankChange: "down",
    rankChangeAmount: 1,
    tierBadge: "Euclidean Master"
  },
  {
    id: "lb-4",
    rank: 4,
    name: "Lungile Mthembu",
    school: "Hilton College",
    province: "KwaZulu-Natal",
    grade: "Grade 11",
    curriculum: "IEB",
    points: 3950,
    streakDays: 9,
    challengesCompleted: 30,
    lessonsCompleted: 11,
    rankChange: "up",
    rankChangeAmount: 3,
    tierBadge: "Algebra Star"
  },
  {
    id: "lb-5",
    rank: 5,
    name: "Thabo Mokoena (You)",
    school: "Jeppe High School for Boys",
    province: "Gauteng",
    grade: "Grade 12",
    curriculum: "CAPS",
    points: 3720,
    streakDays: 7,
    challengesCompleted: 28,
    lessonsCompleted: 10,
    rankChange: "up",
    rankChangeAmount: 1,
    isCurrentUser: true,
    tierBadge: "Trig Expert"
  },
  {
    id: "lb-6",
    rank: 6,
    name: "Chloë Botha",
    school: "St Mary's DSG",
    province: "Gauteng",
    grade: "Grade 11",
    curriculum: "IEB",
    points: 3480,
    streakDays: 8,
    challengesCompleted: 25,
    lessonsCompleted: 9,
    rankChange: "down",
    rankChangeAmount: 1,
    tierBadge: "Trig Expert"
  },
  {
    id: "lb-7",
    rank: 7,
    name: "Lethabo Mabena",
    school: "Grey College",
    province: "Free State",
    grade: "Grade 10",
    curriculum: "CAPS",
    points: 3150,
    streakDays: 6,
    challengesCompleted: 22,
    lessonsCompleted: 8,
    rankChange: "same",
    tierBadge: "Algebra Star"
  },
  {
    id: "lb-8",
    rank: 8,
    name: "Liam O'Connor",
    school: "Bishops Diocesan College",
    province: "Western Cape",
    grade: "Grade 12",
    curriculum: "IEB",
    points: 2980,
    streakDays: 5,
    challengesCompleted: 19,
    lessonsCompleted: 7,
    rankChange: "up",
    rankChangeAmount: 2,
    tierBadge: "Calculus Wizard"
  }
];

export interface StudentLeaderboardProps {
  user?: Profile | null;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({ user }) => {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all_time">("weekly");
  const [gradeFilter, setGradeFilter] = useState<string>("All Grades");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showXPGuideModal, setShowXPGuideModal] = useState<boolean>(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  // Initialize data with current user profile if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("amh_leaderboard_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeaderboardData(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Default seed
    if (user && (user.first_name || user.surname)) {
      const userName = `${user.first_name || ""} ${user.surname || ""}`.trim() || "Thabo Mokoena";
      const updatedSeed = LEADERBOARD_SEED_DATA.map((entry) => {
        if (entry.isCurrentUser) {
          return {
            ...entry,
            name: `${userName} (You)`,
            grade: (user.grade as any) || "Grade 12",
            school: user.school || "Jeppe High School for Boys",
            province: user.province || "Gauteng"
          };
        }
        return entry;
      });
      setLeaderboardData(updatedSeed);
    } else {
      setLeaderboardData(LEADERBOARD_SEED_DATA);
    }
  }, [user]);

  // Save changes
  const saveLeaderboard = (updated: LeaderboardEntry[]) => {
    setLeaderboardData(updated);
    localStorage.setItem("amh_leaderboard_data", JSON.stringify(updated));
  };

  // Filtered leaderboard
  const filteredData = leaderboardData.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.province.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = gradeFilter === "All Grades" || entry.grade === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  // Podium top 3
  const top1 = filteredData.find((e) => e.rank === 1);
  const top2 = filteredData.find((e) => e.rank === 2);
  const top3 = filteredData.find((e) => e.rank === 3);

  // Current user entry
  const currentUserEntry = leaderboardData.find((e) => e.isCurrentUser) || leaderboardData[4] || leaderboardData[0];

  return (
    <div className="bg-gradient-to-br from-navy-900 via-royal-950 to-navy-950 border border-navy-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 text-navy-950 font-black shadow-lg shrink-0">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold-400/20 text-gold-400 border border-gold-400/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-400" /> CAPS & IEB Student Rankings
              </span>
              <span className="text-[11px] font-mono text-navy-300 font-bold">
                • National Mathematics Leaderboard
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight mt-0.5">
              Matric Student Leaderboard & XP Points
            </h2>
          </div>
        </div>

        {/* TIMEFRAME TABS & XP GUIDE ACTION */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="bg-navy-950/90 border border-navy-800 p-1 rounded-2xl flex items-center gap-1 text-xs font-mono font-bold">
            {[
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" },
              { id: "all_time", label: "All-Time" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeframe(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === tab.id
                    ? "bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black shadow"
                    : "text-navy-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowXPGuideModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-royal-900 hover:bg-royal-800 border border-royal-700 text-gold-300 font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Zap className="w-4 h-4 text-gold-400" />
            <span>How to Earn XP</span>
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 relative z-10 items-end">
        {/* 2ND PLACE PODIUM */}
        {top2 && (
          <div className="bg-navy-950/90 border border-slate-700/60 rounded-3xl p-5 flex flex-col items-center text-center space-y-3 relative overflow-hidden order-2 md:order-1 shadow-xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-400 to-slate-200" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center text-slate-200 font-black text-xl shadow-inner">
                🥈
              </div>
              <span className="absolute -bottom-2 inset-x-0 mx-auto w-6 h-6 rounded-full bg-slate-300 text-navy-950 font-black text-xs flex items-center justify-center shadow">
                2
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider block">
                {top2.province} • {top2.curriculum}
              </span>
              <h3 className="text-sm font-black font-display text-white">{top2.name}</h3>
              <p className="text-[11px] text-navy-400">{top2.school}</p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-black text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-300" /> {top2.points.toLocaleString()} XP
            </div>
          </div>
        )}

        {/* 1ST PLACE GOLD CROWN PODIUM */}
        {top1 && (
          <div className="bg-gradient-to-b from-navy-900 via-royal-950 to-navy-950 border-2 border-gold-400/80 rounded-3xl p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden order-1 md:order-2 shadow-2xl ring-2 ring-gold-400/30 scale-105 z-10">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500" />
            
            <Crown className="w-7 h-7 text-gold-400 animate-bounce -mb-2" />

            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 border-2 border-gold-200 flex items-center justify-center text-navy-950 font-black text-2xl shadow-xl">
                🥇
              </div>
              <span className="absolute -bottom-2 inset-x-0 mx-auto w-7 h-7 rounded-full bg-gold-400 text-navy-950 font-black text-sm flex items-center justify-center shadow-lg border border-gold-200">
                1
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-gold-400/20 text-gold-300 border border-gold-400/30 uppercase tracking-wider inline-block">
                🏆 {top1.tierBadge}
              </span>
              <h3 className="text-base font-black font-display text-white">{top1.name}</h3>
              <p className="text-[11px] text-navy-300">{top1.school} • {top1.province}</p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black text-sm flex items-center gap-1.5 shadow-lg">
              <Zap className="w-4 h-4 fill-navy-950" /> {top1.points.toLocaleString()} XP
            </div>
          </div>
        )}

        {/* 3RD PLACE BRONZE PODIUM */}
        {top3 && (
          <div className="bg-navy-950/90 border border-amber-800/60 rounded-3xl p-5 flex flex-col items-center text-center space-y-3 relative overflow-hidden order-3 shadow-xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-700 to-amber-500" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-600 flex items-center justify-center text-amber-300 font-black text-xl shadow-inner">
                🥉
              </div>
              <span className="absolute -bottom-2 inset-x-0 mx-auto w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow">
                3
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                {top3.province} • {top3.curriculum}
              </span>
              <h3 className="text-sm font-black font-display text-white">{top3.name}</h3>
              <p className="text-[11px] text-navy-400">{top3.school}</p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-xs font-mono font-black text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> {top3.points.toLocaleString()} XP
            </div>
          </div>
        )}
      </div>

      {/* CURRENT USER RANKING CARDS BANNER */}
      {currentUserEntry && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-royal-950 via-navy-900 to-royal-950 border border-gold-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-amber-500 text-navy-950 font-black text-base flex items-center justify-center shadow-md">
              #{currentUserEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-display text-white">
                  Your Current Standing
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {currentUserEntry.tierBadge}
                </span>
              </div>
              <p className="text-[11px] text-navy-300 font-mono">
                {currentUserEntry.points} XP earned • {currentUserEntry.streakDays} Day Streak 🔥
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-navy-400 block">Next Tier: Matric Legend</span>
              <span className="text-xs font-mono font-bold text-gold-400">
                Need {4850 - currentUserEntry.points} XP to reach #1
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH & GRADE FILTERS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, school, or province..."
            className="w-full bg-navy-950 border border-navy-750 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-navy-500 focus:outline-none focus:border-gold-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gold-400" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs font-mono font-bold text-navy-200 focus:outline-none focus:border-gold-400 cursor-pointer"
          >
            <option value="All Grades">All Grades</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>
      </div>

      {/* LEADERBOARD RANKINGS TABLE */}
      <div className="bg-navy-950/90 border border-navy-800 rounded-2xl overflow-hidden relative z-10 shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-navy-200">
            <thead className="bg-navy-900/80 border-b border-navy-800 text-[10px] font-mono font-bold text-navy-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Student & School</th>
                <th className="py-3 px-4">Grade & Curriculum</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-center">Challenges</th>
                <th className="py-3 px-4 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-850/80 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-navy-400 italic">
                    No student rankings match your filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((entry) => {
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        entry.isCurrentUser
                          ? "bg-amber-500/10 border-l-4 border-l-gold-400 font-bold"
                          : "hover:bg-navy-900/60"
                      }`}
                    >
                      {/* Rank # & Trend */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`font-black text-sm ${
                            entry.rank === 1 ? "text-gold-400" : entry.rank === 2 ? "text-slate-300" : entry.rank === 3 ? "text-amber-400" : "text-navy-300"
                          }`}>
                            #{entry.rank}
                          </span>
                          {entry.rankChange === "up" && (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {entry.rankChange === "down" && (
                            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          {entry.rankChange === "same" && (
                            <Minus className="w-3 h-3 text-navy-600" />
                          )}
                        </div>
                      </td>

                      {/* Name & School */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold font-sans ${entry.isCurrentUser ? "text-gold-300" : "text-white"}`}>
                              {entry.name}
                            </span>
                            {entry.isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] bg-gold-400 text-navy-950 font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-navy-400 block font-sans">
                            {entry.school} • {entry.province}
                          </span>
                        </div>
                      </td>

                      {/* Grade & Curriculum */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-navy-850 border border-navy-750 text-navy-300 font-bold">
                          {entry.grade} ({entry.curriculum})
                        </span>
                      </td>

                      {/* Streak Days */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-500/20" /> {entry.streakDays}d
                        </span>
                      </td>

                      {/* Daily Challenges */}
                      <td className="py-3.5 px-4 text-center text-navy-300">
                        {entry.challengesCompleted} Done
                      </td>

                      {/* XP Points */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-gold-400 font-black text-sm">
                          {entry.points.toLocaleString()} XP
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOW TO EARN XP MODAL */}
      <AnimatePresence>
        {showXPGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy-900 border border-navy-750 w-full max-w-lg rounded-3xl p-6 shadow-2xl text-white space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                <h3 className="text-lg font-black font-display text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gold-400" /> How to Earn Leaderboard XP
                </h3>
                <button
                  onClick={() => setShowXPGuideModal(false)}
                  className="p-1.5 rounded-xl bg-navy-800 text-navy-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-sans">
                {[
                  { title: "Complete Daily Challenge Quiz", xp: "+50 XP", desc: "Test your skills with 3 quick daily matric past paper questions." },
                  { title: "Submit Homework Scan / Worksheet", xp: "+100 XP", desc: "Upload clear step-by-step scans of assigned practice exercises." },
                  { title: "Attend Live Tutoring Lesson", xp: "+150 XP", desc: "Participate in booked virtual whiteboard sessions with AMH tutors." },
                  { title: "Score >80% on Trial Mock Exam", xp: "+250 XP", desc: "Excel in comprehensive Paper 1 & Paper 2 trial exams." },
                  { title: "Maintain 7-Day Login Streak", xp: "+100 XP Bonus", desc: "Log into the Amaris Hub continuously each week." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-navy-950 border border-navy-800 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{item.title}</span>
                      <span className="text-[10px] text-navy-400">{item.desc}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-gold-400/20 text-gold-300 border border-gold-400/30 font-mono font-black text-xs shrink-0">
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end">
                <button
                  onClick={() => setShowXPGuideModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-black text-xs hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Got It, Let's Compete!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
