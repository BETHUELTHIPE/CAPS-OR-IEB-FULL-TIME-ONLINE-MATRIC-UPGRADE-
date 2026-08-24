import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { 
  Eye, 
  CheckCircle2, 
  Award, 
  Calendar, 
  BarChart3, 
  Target, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  BookOpen, 
  Trash2, 
  X, 
  ArrowUpRight,
  TrendingUp,
  FileText,
  Trophy,
  Check,
  Download,
  FileCheck2,
  Timer
} from "lucide-react";
import { Profile, StudentActivity } from "../types";
import { getFromDB, saveToDB, generateId } from "../lib/db";
import { SwipeableCard } from "./SwipeableCard";

export interface RecentActivityWidgetProps {
  user?: Profile | null;
  limit?: number; // Optional limit if embedded in small cards
  showControls?: boolean; // Show search/filter bars
  onNavigateTab?: (tabName: string) => void;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  user,
  limit,
  showControls = true,
  onNavigateTab
}) => {
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // New Activity Form State
  const [newActionType, setNewActionType] = useState<StudentActivity["action_type"]>("viewed_lesson");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newCategory, setNewCategory] = useState<StudentActivity["category"]>("Calculus");
  const [newBadgeName, setNewBadgeName] = useState<string>("");
  const [newScore, setNewScore] = useState<number>(85);

  const studentId = user?.id || "usr-student";

  // Initialize and load activities
  useEffect(() => {
    const loaded = getFromDB<StudentActivity>("amh_student_activities");
    if (loaded && loaded.length > 0) {
      setActivities(loaded);
    } else {
      // Seed default realistic chronological activities
      const now = new Date();
      const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
      const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

      const defaultActivities: StudentActivity[] = [
        {
          id: "act-1",
          student_id: studentId,
          action_type: "earned_badge",
          title: "Earned Badge: Trig Titan 🏆",
          description: "Successfully completed 20 compound angle trigonometry proofs with 100% accuracy.",
          timestamp: hoursAgo(2),
          category: "Trigonometry",
          metadata: { badge_name: "Trig Titan", score: 100 }
        },
        {
          id: "act-2",
          student_id: studentId,
          action_type: "submitted_exercise",
          title: "Submitted Exercise: Calculus Limits & First Principles",
          description: "Uploaded step-by-step scan worksheet: Calculus_Limits_First_Principles.pdf",
          timestamp: hoursAgo(6),
          category: "Calculus",
          metadata: { file_name: "Calculus_Limits_First_Principles.pdf" }
        },
        {
          id: "act-3",
          student_id: studentId,
          action_type: "viewed_lesson",
          title: "Viewed Lesson: Financial Maths Sinking Funds",
          description: "Watched 18-minute interactive whiteboard tutorial with Tutor Bethuel Moukangwe.",
          timestamp: daysAgo(1),
          category: "General Practice",
          metadata: { lesson_id: "vid-1" }
        },
        {
          id: "act-4",
          student_id: studentId,
          action_type: "study_goal_updated",
          title: "Progressed Study Goal: Master Quadratic Sequences",
          description: "Updated topic mastery score to 85% on CAPS Paper 1 Sequences & Series.",
          timestamp: daysAgo(2),
          category: "Algebra",
          metadata: { goal_title: "Master Quadratic Sequences & Series Equations", score: 85 }
        },
        {
          id: "act-[#5]",
          student_id: studentId,
          action_type: "earned_badge",
          title: "Earned Badge: Calculus Conqueror ⚡",
          description: "Achieved 80%+ average in polynomial derivative limit proofs.",
          timestamp: daysAgo(3),
          category: "Calculus",
          metadata: { badge_name: "Calculus Conqueror", score: 82 }
        },
        {
          id: "act-6",
          student_id: studentId,
          action_type: "booked_lesson",
          title: "Booked 1-on-1 Tutoring: Differential Calculus",
          description: "Scheduled live Google Meet session with Bethuel Moukangwe (Sunday 15:00).",
          timestamp: daysAgo(4),
          category: "Calculus"
        },
        {
          id: "act-7",
          student_id: studentId,
          action_type: "completed_exam",
          title: "Completed Mock Exam: CAPS 2024 Trial Paper 1",
          description: "Scored 88% in NSC Paper 1 Algebra & Functions simulation.",
          timestamp: daysAgo(5),
          category: "Exam Prep",
          metadata: { score: 88 }
        },
        {
          id: "act-8",
          student_id: studentId,
          action_type: "viewed_lesson",
          title: "Viewed Lesson: Analytical Geometry Circle Tangents",
          description: "Reviewed collaborative whiteboard notes and distance formula derivations.",
          timestamp: daysAgo(6),
          category: "Geometry"
        }
      ];

      setActivities(defaultActivities);
      saveToDB("amh_student_activities", defaultActivities);
    }
  }, [studentId]);

  // Handle Manual Log Submit
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let defaultDesc = newDescription.trim();
    if (!defaultDesc) {
      if (newActionType === "viewed_lesson") defaultDesc = `Viewed ${newCategory} interactive lesson notes & video recording.`;
      else if (newActionType === "submitted_exercise") defaultDesc = `Submitted completed step-by-step ${newCategory} worksheet solution.`;
      else if (newActionType === "earned_badge") defaultDesc = `Unlocked special milestone badge for ${newCategory} mastery.`;
      else defaultDesc = `Updated learning progress in ${newCategory}.`;
    }

    const activityObj: StudentActivity = {
      id: generateId("act"),
      student_id: studentId,
      action_type: newActionType,
      title: newTitle.trim(),
      description: defaultDesc,
      timestamp: new Date().toISOString(),
      category: newCategory,
      metadata: {
        badge_name: newActionType === "earned_badge" ? (newBadgeName || newTitle) : undefined,
        score: newScore
      }
    };

    const updated = [activityObj, ...activities];
    setActivities(updated);
    saveToDB("amh_student_activities", updated);
    setShowLogModal(false);

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setNewBadgeName("");
  };

  // Delete Activity
  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    saveToDB("amh_student_activities", updated);
  };

  // Filtering Logic
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // Filter by type
      const matchType = 
        activeTypeFilter === "all" ? true :
        activeTypeFilter === "viewed_lesson" ? act.action_type === "viewed_lesson" :
        activeTypeFilter === "submitted_exercise" ? act.action_type === "submitted_exercise" :
        activeTypeFilter === "earned_badge" ? act.action_type === "earned_badge" :
        activeTypeFilter === "bookings_exams" ? (act.action_type === "booked_lesson" || act.action_type === "completed_exam") : true;

      // Filter by category
      const matchCategory = activeCategoryFilter === "All" || act.category === activeCategoryFilter;

      // Filter by Search
      const matchSearch = !searchQuery.trim() || 
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.category && act.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchType && matchCategory && matchSearch;
    });
  }, [activities, activeTypeFilter, activeCategoryFilter, searchQuery]);

  // Display limited count if requested
  const displayedActivities = limit ? filteredActivities.slice(0, limit) : filteredActivities;

  // Metric Summaries
  const totalCount = activities.length;
  const lessonsViewedCount = activities.filter(a => a.action_type === "viewed_lesson").length;
  const exercisesSubmittedCount = activities.filter(a => a.action_type === "submitted_exercise").length;
  const badgesEarnedCount = activities.filter(a => a.action_type === "earned_badge").length;

  const [exportingPDF, setExportingPDF] = useState<boolean>(false);

  // PDF Export Service using jsPDF
  const handleExportPDF = () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 14;

      // 1. BRANDING HEADER
      doc.setFillColor(15, 23, 42); // Navy 900
      doc.rect(margin, y, pageWidth - margin * 2, 28, "F");

      // Gold Top Border Accent
      doc.setFillColor(234, 179, 8); // Gold 500
      doc.rect(margin, y, pageWidth - margin * 2, 2, "F");

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("AMARIS MATHEMATICS HUB", margin + 6, y + 10);

      doc.setTextColor(234, 179, 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("STUDENT RECENT ACTIVITY & PROGRESS REPORT", margin + 6, y + 16);

      doc.setTextColor(203, 213, 225);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Official Academic Record • High School Mathematics (NSC CAPS & IEB)", margin + 6, y + 22);

      y += 34;

      // 2. STUDENT METADATA CARD
      const studentName = user ? `${user.first_name || ''} ${user.surname || ''}`.trim() : "Bethuel Thipe";
      const studentGrade = user?.grade || "Grade 12 NSC";
      const reportDate = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Student: ${studentName}`, margin + 6, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Curriculum: ${studentGrade}`, margin + 6, y + 15);
      doc.text(`Generated Date: ${reportDate}`, margin + 6, y + 21);

      // Summary Stats Block on Right
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Logged Actions: ${filteredActivities.length}`, pageWidth - margin - 60, y + 8);
      doc.text(`Lessons Viewed: ${lessonsViewedCount}`, pageWidth - margin - 60, y + 14);
      doc.text(`Exercises Submitted: ${exercisesSubmittedCount}`, pageWidth - margin - 60, y + 20);
      doc.text(`Badges Earned: ${badgesEarnedCount}`, pageWidth - margin - 60, y + 26);

      y += 34;

      // Filter Banner
      if (activeTypeFilter !== "all" || activeCategoryFilter !== "All" || searchQuery) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Applied Filters — Type: ${activeTypeFilter} | Topic: ${activeCategoryFilter}${searchQuery ? ` | Search: "${searchQuery}"` : ''}`, margin, y);
        y += 6;
      }

      // 3. TABLE TITLE & HEADERS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Activity Logs & Progress History", margin, y);
      y += 5;

      // Table Header Row
      doc.setFillColor(30, 58, 138); // Royal Blue
      doc.rect(margin, y, pageWidth - margin * 2, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("TIMESTAMP", margin + 3, y + 5.5);
      doc.text("ACTION TYPE", margin + 35, y + 5.5);
      doc.text("TOPIC", margin + 72, y + 5.5);
      doc.text("DETAILS & DESCRIPTION", margin + 108, y + 5.5);

      y += 8;

      // Table Rows
      const itemsToPrint = filteredActivities;
      let alternate = false;

      if (itemsToPrint.length === 0) {
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("No recent activities recorded matching current filters.", margin + 5, y + 6);
        y += 10;
      } else {
        itemsToPrint.forEach((act) => {
          if (y > pageHeight - 25) {
            doc.addPage();
            y = 14;

            // Header on new page
            doc.setFillColor(30, 58, 138);
            doc.rect(margin, y, pageWidth - margin * 2, 8, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.text("TIMESTAMP", margin + 3, y + 5.5);
            doc.text("ACTION TYPE", margin + 35, y + 5.5);
            doc.text("TOPIC", margin + 72, y + 5.5);
            doc.text("DETAILS & DESCRIPTION", margin + 108, y + 5.5);

            y += 8;
          }

          if (alternate) {
            doc.setFillColor(248, 250, 252);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          alternate = !alternate;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);

          const fullDetailStr = `${act.title}${act.description ? `: ${act.description}` : ''}${act.metadata?.score !== undefined ? ` (Score: ${act.metadata.score}%)` : ''}${act.metadata?.badge_name ? ` (Badge: ${act.metadata.badge_name})` : ''}`;
          const detailLines = doc.splitTextToSize(fullDetailStr, pageWidth - margin * 2 - 110);
          const rowHeight = Math.max(9, detailLines.length * 4.2 + 3);

          doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
          doc.setDrawColor(241, 245, 249);
          doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

          // Row Content
          doc.setTextColor(15, 23, 42);
          const dateStr = new Date(act.timestamp).toLocaleDateString("en-ZA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
          doc.text(dateStr, margin + 3, y + 5);

          const style = getActivityStyle(act.action_type);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 58, 138);
          doc.text(style.badgeLabel, margin + 35, y + 5);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          doc.text(act.category || "General", margin + 72, y + 5);

          doc.setTextColor(15, 23, 42);
          doc.text(detailLines, margin + 108, y + 5);

          y += rowHeight;
        });
      }

      // Footer
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 14;
      } else {
        y += 6;
      }

      doc.setDrawColor(234, 179, 8);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text("AMARIS MATHEMATICS HUB • LEVEL 7 DISTINCTION ACADEMY", margin, y);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("Head Coach: Bethuel Moukangwe (BSc Maths) | Pretoria West, Gauteng | +27 71 415 6665", margin, y + 4);

      const safeFileName = `Amaris_Activity_Report_${studentName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(safeFileName);

    } catch (err) {
      console.error("Error generating activity report PDF:", err);
    } finally {
      setExportingPDF(false);
    }
  };

  // Icon and Style Helper
  const getActivityStyle = (type: StudentActivity["action_type"]) => {
    switch (type) {
      case "viewed_lesson":
        return {
          icon: Eye,
          bg: "bg-royal-500/10 text-royal-600 dark:text-royal-300 border-royal-500/30",
          pillBg: "bg-royal-500/15 text-royal-700 dark:text-royal-300",
          badgeLabel: "Viewed Lesson"
        };
      case "submitted_exercise":
        return {
          icon: CheckCircle2,
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
          pillBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
          badgeLabel: "Submitted Exercise"
        };
      case "earned_badge":
        return {
          icon: Award,
          bg: "bg-gold-500/15 text-gold-700 dark:text-gold-300 border-gold-500/40",
          pillBg: "bg-gold-500/20 text-gold-800 dark:text-gold-300",
          badgeLabel: "Earned Badge"
        };
      case "booked_lesson":
        return {
          icon: Calendar,
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30",
          pillBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
          badgeLabel: "Booked Lesson"
        };
      case "completed_exam":
        return {
          icon: BarChart3,
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30",
          pillBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
          badgeLabel: "Completed Exam"
        };
      case "study_goal_updated":
        return {
          icon: Target,
          bg: "bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30",
          pillBg: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
          badgeLabel: "Goal Progress"
        };
      case "focus_session":
        return {
          icon: Timer,
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30",
          pillBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
          badgeLabel: "Focus Session"
        };
      default:
        return {
          icon: Clock,
          bg: "bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-700",
          pillBg: "bg-navy-200 dark:bg-navy-800 text-navy-800 dark:text-navy-200",
          badgeLabel: "Activity"
        };
    }
  };

  // Human Time Formatter
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-navy-100 dark:border-navy-800">
        <div className="flex items-start gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-royal-800 text-gold-400 font-black shadow-lg shadow-royal-900/30 shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 uppercase">
                Chronological History
              </span>
              <span className="text-xs font-mono text-navy-400 font-semibold">
                • {activities.length} Actions Recorded
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-navy-900 dark:text-white">
              Recent Activity
            </h2>
            <p className="text-xs md:text-sm text-navy-600 dark:text-navy-300 max-w-2xl leading-relaxed">
              Track your real-time learning journey including viewed lessons, submitted homework exercises, earned badges, and trial exam scores.
            </p>
          </div>
        </div>

        {/* Action Controls & Log Button */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="px-4 py-2.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-900 dark:text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center gap-2 border border-navy-200/60 dark:border-navy-700 disabled:opacity-50"
            title="Export formatted PDF activity and progress report"
          >
            <Download className={`w-4 h-4 text-gold-500 ${exportingPDF ? "animate-bounce" : ""}`} />
            <span>{exportingPDF ? "Generating PDF..." : "Export PDF Report"}</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-navy-900 to-black dark:from-gold-500 dark:to-amber-500 text-white dark:text-navy-950 font-extrabold text-xs rounded-2xl hover:opacity-95 shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Custom Action</span>
          </button>
        </div>
      </div>

      {/* STAT SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-navy-50/80 dark:bg-navy-950/60 p-4 rounded-2xl border border-navy-100 dark:border-navy-850 flex items-center gap-3">
          <div className="p-2.5 bg-royal-500/10 text-royal-600 dark:text-royal-300 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black font-mono text-navy-900 dark:text-white">{lessonsViewedCount}</span>
            <p className="text-[10px] font-mono uppercase text-navy-500 dark:text-navy-400 font-bold">Lessons Viewed</p>
          </div>
        </div>

        <div className="bg-navy-50/80 dark:bg-navy-950/60 p-4 rounded-2xl border border-navy-100 dark:border-navy-850 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black font-mono text-navy-900 dark:text-white">{exercisesSubmittedCount}</span>
            <p className="text-[10px] font-mono uppercase text-navy-500 dark:text-navy-400 font-bold">Exercises Submitted</p>
          </div>
        </div>

        <div className="bg-navy-50/80 dark:bg-navy-950/60 p-4 rounded-2xl border border-navy-100 dark:border-navy-850 flex items-center gap-3">
          <div className="p-2.5 bg-gold-500/10 text-gold-600 dark:text-gold-400 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black font-mono text-navy-900 dark:text-white">{badgesEarnedCount}</span>
            <p className="text-[10px] font-mono uppercase text-navy-500 dark:text-navy-400 font-bold">Badges Earned</p>
          </div>
        </div>

        <div className="bg-navy-50/80 dark:bg-navy-950/60 p-4 rounded-2xl border border-navy-100 dark:border-navy-850 flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black font-mono text-navy-900 dark:text-white">{totalCount}</span>
            <p className="text-[10px] font-mono uppercase text-navy-500 dark:text-navy-400 font-bold">Total Actions</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      {showControls && (
        <div className="space-y-3 bg-navy-50/60 dark:bg-navy-950/40 p-4 rounded-2xl border border-navy-100 dark:border-navy-850">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold focus:outline-none focus:border-gold-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-900 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400 uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Topic:
              </span>
              {["All", "Algebra", "Calculus", "Trigonometry", "Geometry", "Exam Prep"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategoryFilter === cat
                      ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm"
                      : "text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-navy-200/50 dark:border-navy-800/50 scrollbar-none">
            {[
              { id: "all", label: "All Activity" },
              { id: "viewed_lesson", label: "Viewed Lessons" },
              { id: "submitted_exercise", label: "Submitted Exercises" },
              { id: "earned_badge", label: "Earned Badges" },
              { id: "bookings_exams", label: "Bookings & Exams" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTypeFilter === tab.id
                    ? "bg-royal-600 text-white shadow-sm"
                    : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-800 hover:border-royal-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CHRONOLOGICAL ACTIVITY TIMELINE */}
      <div className="space-y-4 relative">
        {/* Vertical Timeline Guide Line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-navy-100 dark:bg-navy-800 hidden sm:block pointer-events-none" />

        <AnimatePresence mode="popLayout">
          {displayedActivities.map((act) => {
            const style = getActivityStyle(act.action_type);
            const IconComp = style.icon;

            const detailContent = (
              <div className="space-y-1">
                <p className="font-semibold text-navy-800 dark:text-navy-100">
                  Category: <span className="text-royal-600 dark:text-gold-400 font-mono">{act.category || "General"}</span>
                </p>
                <p className="text-navy-600 dark:text-navy-300 font-mono text-[11px]">
                  Timestamp: {new Date(act.timestamp).toLocaleString("en-ZA")}
                </p>
                {act.metadata && (
                  <div className="pt-1 flex flex-wrap gap-2">
                    {Object.entries(act.metadata).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-[10px] font-mono text-navy-700 dark:text-navy-300">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );

            return (
              <div key={act.id} className="relative pl-0 sm:pl-12 group">
                {/* Timeline Node Icon (Desktop) */}
                <div className={`absolute left-2.5 top-3.5 -translate-x-1/2 p-2 rounded-full border shadow-sm hidden sm:flex items-center justify-center transition-transform group-hover:scale-110 z-10 ${style.bg}`}>
                  <IconComp className="w-4 h-4" />
                </div>

                {/* Activity Card with Touch Gesture Swipe Support */}
                <SwipeableCard
                  id={act.id}
                  onDismiss={handleDeleteActivity}
                  dismissText="Delete Log"
                  completeText="Details"
                  details={detailContent}
                  showGestureHints
                >
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Mobile Icon Tag */}
                        <div className={`p-1.5 rounded-lg border sm:hidden ${style.bg}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${style.bg}`}>
                          {style.badgeLabel}
                        </span>

                        {act.category && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-navy-500 dark:text-navy-400 bg-navy-100 dark:bg-navy-800 font-semibold">
                            {act.category}
                          </span>
                        )}

                        {act.metadata?.score && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            {act.metadata.score}% Score
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-navy-400">
                        <span>{formatTime(act.timestamp)}</span>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1 text-navy-400 hover:text-red-500 transition-opacity cursor-pointer"
                          title="Delete log entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold font-display text-navy-900 dark:text-white leading-snug">
                      {act.title}
                    </h3>

                    <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                      {act.description}
                    </p>

                    {/* Optional Metadata Pill */}
                    {act.metadata?.file_name && (
                      <div className="pt-1 flex items-center gap-1.5 text-xs font-mono text-royal-600 dark:text-royal-300">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Attached: {act.metadata.file_name}</span>
                      </div>
                    )}

                    {act.metadata?.badge_name && (
                      <div className="pt-1 flex items-center gap-1.5 text-xs font-mono text-gold-600 dark:text-gold-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Unlocked Badge: {act.metadata.badge_name}</span>
                      </div>
                    )}
                  </div>
                </SwipeableCard>
              </div>
            );
          })}
        </AnimatePresence>

        {displayedActivities.length === 0 && (
          <div className="bg-navy-50/50 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-800 rounded-2xl p-8 text-center space-y-3">
            <Clock className="w-10 h-10 text-navy-300 dark:text-navy-600 mx-auto" />
            <h3 className="text-base font-bold text-navy-900 dark:text-white">No activity logs found</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
              Try adjusting your search or category filters, or click "Log Custom Action" to manually record a learning milestone.
            </p>
          </div>
        )}
      </div>

      {/* MANUAL LOG ACTIVITY MODAL */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-navy-900 text-navy-900 dark:text-white rounded-3xl p-6 md:p-8 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-6 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-navy-100 dark:border-navy-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gold-500 text-navy-950 font-black shadow-md">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold font-display uppercase tracking-tight">Log Student Action</h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400">Record a recent study milestone or lesson view.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-2 text-navy-400 hover:text-navy-900 dark:hover:text-white rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="space-y-4">
                {/* Action Type */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                    Action Type *
                  </label>
                  <select
                    value={newActionType}
                    onChange={(e) => setNewActionType(e.target.value as StudentActivity["action_type"])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  >
                    <option value="viewed_lesson">Viewed Lesson</option>
                    <option value="submitted_exercise">Submitted Exercise</option>
                    <option value="earned_badge">Earned Badge</option>
                    <option value="booked_lesson">Booked Lesson</option>
                    <option value="completed_exam">Completed Exam</option>
                    <option value="study_goal_updated">Goal Progress</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                    Action Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Viewed Lesson: Differential Calculus Applications"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Topic Category */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                    Topic / Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as StudentActivity["category"])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  >
                    <option value="Algebra">Algebra</option>
                    <option value="Calculus">Calculus</option>
                    <option value="Trigonometry">Trigonometry</option>
                    <option value="Geometry">Geometry</option>
                    <option value="Exam Prep">Exam Prep</option>
                    <option value="General Practice">General Practice</option>
                  </select>
                </div>

                {/* Optional Badge Name / Score */}
                {newActionType === "earned_badge" && (
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Badge Name
                    </label>
                    <input
                      type="text"
                      value={newBadgeName}
                      onChange={(e) => setNewBadgeName(e.target.value)}
                      placeholder="e.g. Trig Titan 🏆"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                )}

                {(newActionType === "completed_exam" || newActionType === "submitted_exercise") && (
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                      Score / Mark (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-navy-600 dark:text-navy-300 mb-1">
                    Details / Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief details about what you studied or completed..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-100 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 text-xs font-bold text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-navy-900 to-black dark:from-gold-500 dark:to-amber-500 text-white dark:text-navy-950 font-extrabold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Activity Log</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
