import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { 
  TrendingUp, Plus, Trash2, Award, Sparkles, Calendar, 
  Activity, AlertCircle, CheckCircle2, ChevronRight, Info, LineChart, Download,
  BarChart2, FileText
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ReferenceLine
} from "recharts";
import { MockExamScore, Profile } from "../types";
import { dbAPI } from "../lib/db";
import { StudentProgressAnalytics } from "./StudentProgressAnalytics";
import { StudentPerformanceDashboard } from "./StudentPerformanceDashboard";
import { StudentImprovementVisualizer } from "./StudentImprovementVisualizer";

interface MockPerformanceDashboardProps {
  user: Profile;
}

export const MockPerformanceDashboard: React.FC<MockPerformanceDashboardProps> = ({ user }) => {
  const [scores, setScores] = useState<MockExamScore[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [percentage, setPercentage] = useState<number>(70);
  const [examDate, setExamDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [subTab, setSubTab] = useState<"performance_dashboard" | "visualizer" | "ledger" | "analytics">("performance_dashboard");

  // Load scores
  const loadScores = () => {
    try {
      const data = dbAPI.getMockExamScores(user.id);
      // Sort scores chronologically by exam_date for the line graph
      const sorted = [...data].sort((a, b) => {
        return new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
      });
      setScores(sorted);
    } catch (err) {
      console.error("Failed to load mock scores:", err);
    }
  };

  useEffect(() => {
    loadScores();
  }, [user.id]);

  // Handle score submission
  const handleAddScore = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!examTitle.trim()) {
      setErrorMessage("Please enter an exam or test title.");
      return;
    }
    if (!topic.trim()) {
      setErrorMessage("Please specify the main mathematical topic.");
      return;
    }
    if (percentage < 0 || percentage > 100 || isNaN(percentage)) {
      setErrorMessage("Percentage mark must be between 0 and 100.");
      return;
    }
    if (!examDate) {
      setErrorMessage("Please select a valid test date.");
      return;
    }

    try {
      dbAPI.addMockExamScore({
        student_id: user.id,
        exam_title: examTitle.trim(),
        subject_or_topic: topic.trim(),
        score_percentage: percentage,
        exam_date: examDate,
        notes: notes.trim() || undefined
      });

      setSuccessMessage("Mock score logged successfully!");
      setExamTitle("");
      setTopic("");
      setPercentage(70);
      setNotes("");
      setIsFormOpen(false);
      loadScores();

      // Clear success alert after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add score.");
    }
  };

  // Handle score deletion
  const handleDeleteScore = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the score for "${title}"?`)) {
      try {
        dbAPI.deleteMockExamScore(id);
        loadScores();
        setSuccessMessage("Score record removed.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to delete score.");
      }
    }
  };

  // Export Quiz History & Academic Progress Report as a downloadable PDF
  const handleExportPerformanceReportPDF = () => {
    if (!user) return;
    try {
      const doc = new jsPDF();
      
      // COLOR PALETTE (Amaris Navy & Gold Accent)
      const navyDark = [15, 23, 42]; // #0f172a
      const goldAccent = [234, 179, 8]; // #eab308
      const slateText = [71, 85, 105]; // #475569
      const borderSlate = [226, 232, 240]; // #e2e8f0
      const rowAltBg = [248, 250, 252]; // #f8fafc
      const greenAccent = [16, 185, 129]; // #10b981
      
      // ==========================================
      // COVER & HEADER BANNER
      // ==========================================
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, 10, 190, 28, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("AMARIS MATHEMATICS HUB", 15, 20);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text("OFFLINE ACADEMIC PROGRESS REPORT & MARKS LEDGER", 15, 26);
      doc.text("GRADE 10-12 CAPS / IEB CURRICULUM UPGRADES & ASSESSMENT AUDIT", 15, 31);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("PROGRESS REPORT", 140, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const todayStr = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
      doc.text(`Date Generated: ${todayStr}`, 140, 26);
      doc.text("Status: Audited & Complete", 140, 31);

      let y = 46;

      // ==========================================
      // STUDENT PROFILE INFORMATION CARD
      // ==========================================
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(10, y, 190, 32, "F");
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.rect(10, y, 190, 32, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("STUDENT IDENTITY PROFILE", 15, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text(`Full Name: ${user.first_name} ${user.surname}`, 15, y + 14);
      doc.text(`Email Address: ${user.email}`, 15, y + 21);
      doc.text(`Grade/Curriculum: ${user.grade || "Grade 12 (CAPS)"}`, 15, y + 27);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("KEY STATISTICAL AGGREGATES", 110, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text(`Average Mark: ${avgScore}% (${currentLevelInfo.code})`, 110, y + 14);
      doc.text(`Highest Assessment Record: ${highestScoreObj ? `${highestScoreObj.score_percentage}%` : "N/A"}`, 110, y + 21);
      doc.text(`Improvement Rate: ${improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`} since baseline`, 110, y + 27);

      y += 40;

      // ==========================================
      // SECTION A: SCORE CARD SUMMARY
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("ACADEMIC PERFORMANCE SUMMARY", 10, y);

      y += 5;

      // Draw standard bento cards in PDF
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(10, y, 44, 20, "F");
      doc.rect(58, y, 44, 20, "F");
      doc.rect(106, y, 44, 20, "F");
      doc.rect(154, y, 46, 20, "F");

      doc.rect(10, y, 44, 20, "S");
      doc.rect(58, y, 44, 20, "S");
      doc.rect(106, y, 44, 20, "S");
      doc.rect(154, y, 46, 20, "S");

      // Card 1: Avg
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("AVERAGE MARK", 13, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text(`${avgScore}%`, 13, y + 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text(currentLevelInfo.code, 13, y + 17);

      // Card 2: Personal Record
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("PERSONAL RECORD", 61, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
      doc.text(highestScoreObj ? `${highestScoreObj.score_percentage}%` : "0%", 61, y + 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("Highest Mark Logged", 61, y + 17);

      // Card 3: Improvement
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("IMPROVEMENT RATE", 109, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(improvementRate >= 0 ? greenAccent[0] : 239, improvementRate >= 0 ? greenAccent[1] : 68, improvementRate >= 0 ? greenAccent[2] : 68);
      doc.text(`${improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`}`, 109, y + 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("Baseline comparison", 109, y + 17);

      // Card 4: Distinction Gap
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("DISTINCTION GAP", 157, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text(avgScore >= 80 ? "Unlocked!" : `${80 - avgScore}%`, 157, y + 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text(avgScore >= 80 ? "Level 7 Distinction" : "Target: 80% boundary", 157, y + 17);

      y += 28;

      // ==========================================
      // SECTION B: QUIZ AND ASSESSMENT JOURNAL LEDGER
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("ACADEMIC ASSESSMENT LOG LEDGER", 10, y);

      y += 5;

      // Table headers function to handle multiple pages
      const drawTableHeaders = (currentY: number) => {
        doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.rect(10, currentY, 190, 8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text("TEST DATE", 13, currentY + 5.5);
        doc.text("ASSESSMENT TITLE & TOPIC", 40, currentY + 5.5);
        doc.text("MARK %", 140, currentY + 5.5);
        doc.text("CAPS LEVEL DESCRIPTOR", 160, currentY + 5.5);
      };

      drawTableHeaders(y);
      y += 8;

      if (scores.length === 0) {
        doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
        doc.rect(10, y, 190, 12, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(slateText[0], slateText[1], slateText[2]);
        doc.text("No quiz or exam scores logged yet. Add your school marks to generate logs.", 15, y + 8);
        y += 12;
      } else {
        scores.forEach((score, idx) => {
          // Page boundary check
          if (y > 260) {
            doc.addPage();
            y = 20;
            drawTableHeaders(y);
            y += 8;
          }

          if (idx % 2 === 0) {
            doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
            doc.rect(10, y, 190, 11, "F");
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(10, y, 190, 11, "F");
          }
          doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
          doc.line(10, y + 11, 200, y + 11);

          // Date
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(slateText[0], slateText[1], slateText[2]);
          doc.text(score.exam_date, 13, y + 7);

          // Title & Topic combined
          doc.setFont("helvetica", "bold");
          doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
          const shortTitle = score.exam_title.length > 32 ? score.exam_title.substring(0, 32) + "..." : score.exam_title;
          doc.text(shortTitle, 40, y + 5);
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(6.5);
          doc.setTextColor(slateText[0], slateText[1], slateText[2]);
          const topicStr = `Topic: ${score.subject_or_topic} ${score.notes ? `| "${score.notes.substring(0, 48)}${score.notes.length > 48 ? '...' : ''}"` : ''}`;
          doc.text(topicStr, 40, y + 9);

          // Score
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.text(`${score.score_percentage}%`, 140, y + 7);

          // Level Descriptor
          const lvl = getSADescriptor(score.score_percentage);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.text(`${lvl.code}: ${lvl.label.split(" (")[0]}`, 160, y + 7);

          y += 11;
        });
      }

      y += 12;

      // ==========================================
      // SECTION C: STRATEGIC ACTION PLAN BY TUTOR BETHUEL
      // ==========================================
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("TUTOR BETHUEL'S STRATEGIC ASSESSMENT & STUDY PLAN", 10, y);

      y += 5;

      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(10, y, 190, 34, "F");
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.rect(10, y, 190, 34, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("MATHEMATICS UPGRADE GUIDANCE & ROADMAP FOR DISTRICT DISTINCTION:", 14, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      
      let guidanceText = "";
      if (avgScore >= 80) {
        guidanceText = "Incredible job! You are scoring at Level 7 distinction level. To consolidate your A-grade, practice advanced 3D Trigonometry double angle proofs and first principles Calculus limits under strict exam timing. Ensure you study the South African CAPS/IEB marking guidelines to avoid notation errors that cost minor marks.";
      } else if (avgScore >= 60) {
        guidanceText = "Well done! You are demonstrating solid mathematical achievement (Level 5-6). To push above the 80% boundary, schedule focused whiteboard sessions on Trigonometry identity solutions and complex Analytical Geometry circles. Eliminating arithmetic slips will unlock your CAPS/IEB distinction!";
      } else {
        guidanceText = "You are working through critical CAPS modules. To rapidly upgrade your average mark, focus tutoring sessions on early algebraic marks: Quadratic formula nature of roots, standard Arithmetic/Geometric series formula applications, and basic differential calculus rules. Consistent revision will unlock Level 5+!";
      }

      const splitGuidance = doc.splitTextToSize(guidanceText, 182);
      doc.text(splitGuidance, 14, y + 13);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("Bethuel Moukangwe", 14, y + 27);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("Founder & Master Tutor, Amaris Mathematics Hub", 14, y + 30);

      // Save PDF
      doc.save(`Amaris_Maths_Progress_Report_${user.first_name}_${user.surname}.pdf`);
      setSuccessMessage("Progress report exported to PDF successfully!");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to export PDF report.");
    }
  };

  // South African CAPS/IEB Level descriptor helper
  const getSADescriptor = (percent: number) => {
    if (percent >= 80) return { level: 7, code: "Level 7", label: "Outstanding (Distinction)", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    if (percent >= 70) return { level: 6, code: "Level 6", label: "Meritorious Achievement", color: "text-royal-500 bg-royal-500/10 border-royal-500/20" };
    if (percent >= 60) return { level: 5, code: "Level 5", label: "Substantial Achievement", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    if (percent >= 50) return { level: 4, code: "Level 4", label: "Adequate Achievement", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
    if (percent >= 40) return { level: 3, code: "Level 3", label: "Moderate Achievement", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" };
    if (percent >= 30) return { level: 2, code: "Level 2", label: "Elementary Achievement", color: "text-red-500 bg-red-500/10 border-red-500/20" };
    return { level: 1, code: "Level 1", label: "Not Achieved", color: "text-red-600 bg-red-600/10 border-red-600/20" };
  };

  // Performance calculations
  const totalTests = scores.length;
  const avgScore = totalTests > 0 
    ? Math.round(scores.reduce((sum, s) => sum + s.score_percentage, 0) / totalTests) 
    : 0;

  const highestScoreObj = totalTests > 0 
    ? scores.reduce((max, s) => s.score_percentage > max.score_percentage ? s : max, scores[0])
    : null;

  // Calculate improvement rate (last test score minus first test score)
  const improvementRate = totalTests >= 2 
    ? scores[scores.length - 1].score_percentage - scores[0].score_percentage
    : 0;

  const currentLevelInfo = getSADescriptor(avgScore);

  return (
    <div id="mock-exam-performance-container" className="space-y-6 text-left">
      {/* Upper header block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-850 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-royal-600 dark:text-gold-400" />
            <h3 className="text-base font-black text-navy-900 dark:text-white uppercase tracking-tight">
              Mock Exam & Control Test Performance Trends
            </h3>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Plot your mock test results, track your average CAPS/IEB level, and visualize your road to an 80%+ Level 7 distinction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            id="btn-export-performance-pdf"
            onClick={handleExportPerformanceReportPDF}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-black text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download complete academic quiz history and progress report as PDF"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>

          <button
            id="btn-print-performance-pdf"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-900 dark:text-white font-black text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-navy-700"
            title="Print complete academic quiz history and progress report using high-fidelity browser layout styles"
          >
            <FileText className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>

          <button
            id="btn-toggle-score-form"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2.5 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isFormOpen ? "Close Panel" : "Log New Score"}
          </button>
        </div>
      </div>

      {/* Sub Tab Selection Bar */}
      <div className="flex border-b border-navy-150 dark:border-navy-800 gap-6">
        <button
          onClick={() => setSubTab("performance_dashboard")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            subTab === "performance_dashboard"
              ? "border-royal-600 text-royal-600 dark:border-gold-400 dark:text-gold-400 font-black"
              : "border-transparent text-navy-500 hover:text-navy-700"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-gold-500" />
          <span>Performance & Study Hours</span>
        </button>
        <button
          onClick={() => setSubTab("visualizer")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            subTab === "visualizer"
              ? "border-royal-600 text-royal-600 dark:border-gold-400 dark:text-gold-400 font-black"
              : "border-transparent text-navy-500 hover:text-navy-700"
          }`}
        >
          <LineChart className="w-4 h-4 text-emerald-500" />
          <span>Improvement Trajectory & Modules</span>
        </button>
        <button
          onClick={() => setSubTab("ledger")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            subTab === "ledger"
              ? "border-royal-600 text-royal-600 dark:border-gold-400 dark:text-gold-400 font-black"
              : "border-transparent text-navy-500 hover:text-navy-700"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Marks Ledger & Curve</span>
        </button>
        <button
          onClick={() => setSubTab("analytics")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            subTab === "analytics"
              ? "border-royal-600 text-royal-600 dark:border-gold-400 dark:text-gold-400 font-black"
              : "border-transparent text-navy-500 hover:text-navy-700"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Progress Analytics</span>
        </button>
      </div>

      {subTab === "performance_dashboard" ? (
        <StudentPerformanceDashboard user={user} />
      ) : subTab === "visualizer" ? (
        <StudentImprovementVisualizer user={user} />
      ) : subTab === "analytics" ? (
        <StudentProgressAnalytics user={user} />
      ) : (
        <>
          {/* Alert Messaging */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Slide down scorecard input form */}
          {isFormOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-navy-50/50 dark:bg-navy-950/20 p-5 rounded-2xl border border-navy-150 dark:border-navy-850 space-y-4"
            >
              <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-royal-500" />
                Add a New Mock Exam or Test Score
              </h4>

              <form onSubmit={handleAddScore} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Exam Title */}
                <div className="sm:col-span-4 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Test / Assessment Title
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. June Mid-Year Paper 2"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 placeholder-navy-300 dark:placeholder-navy-600"
                  />
                </div>

                {/* Topic Area */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Main Chapter/Section Focus
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  >
                    <option value="">Select Topic...</option>
                    <option value="Algebra & Equations">Algebra & Equations</option>
                    <option value="Sequences & Series">Sequences & Series</option>
                    <option value="Functions & Inverse Graphs">Functions & Inverse Graphs</option>
                    <option value="Differential Calculus">Differential Calculus</option>
                    <option value="Trigonometry (Proofs & 3D)">Trigonometry (Proofs & 3D)</option>
                    <option value="Analytical Geometry">Analytical Geometry</option>
                    <option value="Euclidean Geometry">Euclidean Geometry</option>
                    <option value="Probability & Stats">Probability & Stats</option>
                    <option value="Physical Sciences Core">Physical Sciences Core</option>
                    <option value="Other Math Control Test">Other Math Control Test</option>
                  </select>
                </div>

                {/* Score Percentage Slider */}
                <div className="sm:col-span-3 space-y-1">
                  <div className="flex justify-between">
                    <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                      Mark Percentage
                    </label>
                    <span className="text-xs font-black text-royal-600 dark:text-gold-400 font-mono">{percentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={percentage}
                      onChange={(e) => setPercentage(Number(e.target.value))}
                      className="w-full accent-royal-500 dark:accent-gold-500 cursor-pointer h-1.5 bg-navy-200 dark:bg-navy-850 rounded-lg appearance-none"
                    />
                  </div>
                </div>

                {/* Exam Date */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Date Completed
                  </label>
                  <input 
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-10 space-y-1">
                  <label className="block text-[10px] font-mono font-black text-navy-400 uppercase">
                    Tutor Feedback, Hard Questions, or Review Notes (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Mastered general solutions but lost 4 marks on the 3D compound sine angle diagram."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 placeholder-navy-300 dark:placeholder-navy-600"
                  />
                </div>

                {/* Action Buttons */}
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer h-[36px]"
                  >
                    Log Mark
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* KPI Stats cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Average score card */}
            <div className="bg-navy-50/50 dark:bg-navy-950/30 p-4 rounded-xl border border-navy-100 dark:border-navy-850 space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-navy-400 uppercase block">Average Mark</span>
                <div className="text-3xl font-black text-royal-600 dark:text-gold-400 leading-none mt-1">
                  {avgScore}%
                </div>
              </div>
              {totalTests > 0 && (
                <div className={`text-[9px] font-mono font-black px-2 py-1 rounded border mt-2 text-center truncate ${currentLevelInfo.color}`}>
                  {currentLevelInfo.code}: {currentLevelInfo.label}
                </div>
              )}
            </div>

            {/* Highest score card */}
            <div className="bg-navy-50/50 dark:bg-navy-950/30 p-4 rounded-xl border border-navy-100 dark:border-navy-850 space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-navy-400 uppercase block">Personal Record</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1">
                  {highestScoreObj ? `${highestScoreObj.score_percentage}%` : "0%"}
                </div>
              </div>
              <div className="text-[10px] text-navy-500 dark:text-navy-400 font-mono truncate mt-2 border-t border-navy-100/50 dark:border-navy-850/50 pt-1.5">
                {highestScoreObj ? highestScoreObj.exam_title : "No exams logged"}
              </div>
            </div>

            {/* Progress Tracker / Improvement Rate */}
            <div className="bg-navy-50/50 dark:bg-navy-950/30 p-4 rounded-xl border border-navy-100 dark:border-navy-850 space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-navy-400 uppercase block">Improvement Rate</span>
                <div className={`text-2xl font-black leading-none mt-1 ${improvementRate > 0 ? "text-emerald-600" : improvementRate < 0 ? "text-red-500" : "text-navy-500"}`}>
                  {improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`}
                </div>
              </div>
              <div className="text-[10px] text-navy-500 dark:text-navy-400 font-mono mt-2 border-t border-navy-100/50 dark:border-navy-850/50 pt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-royal-500" />
                <span>Since baseline test</span>
              </div>
            </div>

            {/* Target Milestone Indicator */}
            <div className="bg-navy-50/50 dark:bg-navy-950/30 p-4 rounded-xl border border-navy-100 dark:border-navy-850 space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-navy-400 uppercase block">Distinction Gap</span>
                <div className="text-2xl font-black text-navy-800 dark:text-white leading-none mt-1">
                  {avgScore >= 80 ? "Unlocked 🎓" : `${80 - avgScore}%`}
                </div>
              </div>
              <div className="text-[10px] text-navy-500 dark:text-navy-400 font-mono mt-2 border-t border-navy-100/50 dark:border-navy-850/50 pt-1.5">
                {avgScore >= 80 ? "Level 7 Distinction Achieved!" : "Need to reach 80% boundary"}
              </div>
            </div>
          </div>

          {/* Main Recharts Graphic Chart block */}
          <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-royal-500" />
                  Upgrade Academic Learning Curve
                </h3>
                <p className="text-xs text-navy-500 dark:text-navy-400">Chronological view of mock results and progress with an 80% reference ceiling line</p>
              </div>
              
              <div className="flex flex-wrap gap-3 text-[10px] font-mono text-navy-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-royal-500" /> Your Trend
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Distinction Target (80%)
                </span>
              </div>
            </div>

            {scores.length > 0 ? (
              <div className="h-72 sm:h-80 w-full" id="mock-recharts-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scores} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800" />
                    <XAxis 
                      dataKey="exam_date" 
                      tick={{ fontSize: 9 }} 
                      className="text-navy-400 font-mono"
                      tickFormatter={(val) => {
                        try {
                          const d = new Date(val);
                          return d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
                        } catch (e) {
                          return val;
                        }
                      }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 9 }} 
                      className="text-navy-400 font-mono" 
                      allowDecimals={false}
                      ticks={[0, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as MockExamScore;
                          const level = getSADescriptor(data.score_percentage);
                          return (
                            <div className="bg-navy-900/95 dark:bg-navy-950/95 border border-navy-700 p-3 rounded-xl shadow-lg space-y-1 max-w-[240px] text-left">
                              <p className="text-[9px] text-navy-400 font-mono font-bold uppercase">{data.exam_date}</p>
                              <p className="text-xs font-black text-white">{data.exam_title}</p>
                              <div className="flex items-center gap-1.5 py-1">
                                <span className="text-lg font-black text-gold-400">{data.score_percentage}%</span>
                                <span className={`text-[8px] font-mono font-black border px-1.5 py-0.5 rounded ${level.color}`}>
                                  {level.code}
                                </span>
                              </div>
                              <p className="text-[10px] text-navy-300 font-mono"><strong className="text-navy-400">Chapter:</strong> {data.subject_or_topic}</p>
                              {data.notes && (
                                <p className="text-[9px] text-navy-400 font-mono italic border-t border-navy-800 pt-1.5 mt-1 leading-normal">
                                  "{data.notes}"
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* 80% boundary level 7 line */}
                    <ReferenceLine 
                      y={80} 
                      stroke="#f59e0b" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{ 
                        value: "Level 7 distinction (80%)", 
                        position: "top", 
                        fill: "#f59e0b", 
                        fontSize: 9, 
                        fontWeight: "bold",
                        fontFamily: "monospace" 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score_percentage" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#scoreColorGrad)"
                      dot={{ r: 5, strokeWidth: 1.5, stroke: "#3b82f6", fill: "#ffffff" }}
                      activeDot={{ r: 7, strokeWidth: 2, stroke: "#3b82f6", fill: "#f59e0b" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-navy-200 dark:border-navy-800 rounded-xl space-y-3">
                <LineChart className="w-10 h-10 text-navy-300 dark:text-navy-700 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-navy-800 dark:text-white">No Mock Exam Scores Logged Yet</p>
                  <p className="text-xs text-navy-500 dark:text-navy-400 max-w-md mx-auto">
                    Log your baseline school marks, class quizzes, or past exam exercises to generate your interactive performance trend chart.
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Log First Score
                </button>
              </div>
            )}
          </div>

          {/* Detailed records breakdown table */}
          <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-navy-100 dark:border-navy-850 gap-4">
              <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                Academic Assessment Log Ledger
              </h4>
              <div className="flex items-center gap-3 no-print">
                <span className="text-[10px] font-mono text-navy-400">Total assessments: {totalTests}</span>
                {scores.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPerformanceReportPDF}
                      className="text-[10px] font-mono text-royal-500 dark:text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Download report PDF"
                    >
                      <Download className="w-3 h-3" /> Download PDF
                    </button>
                    <span className="text-navy-300">|</span>
                    <button
                      onClick={() => window.print()}
                      className="text-[10px] font-mono text-royal-500 dark:text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Print report PDF using browser layout"
                    >
                      <FileText className="w-3 h-3" /> Print PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {scores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-navy-100 dark:border-navy-850 text-[10px] font-mono text-navy-400 uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Assessment Title</th>
                      <th className="py-2.5 px-3">Subject / Module</th>
                      <th className="py-2.5 px-3 text-center">Score %</th>
                      <th className="py-2.5 px-3">CAPS Achievement Level</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100/50 dark:divide-navy-850/50 text-xs">
                    {scores.map((score) => {
                      const level = getSADescriptor(score.score_percentage);
                      return (
                        <tr key={score.id} className="hover:bg-navy-50/30 dark:hover:bg-navy-950/10">
                          <td className="py-3 px-3 font-mono text-[10px] text-navy-400 whitespace-nowrap">
                            {score.exam_date}
                          </td>
                          <td className="py-3 px-3 font-bold text-navy-900 dark:text-white">
                            <div>
                              <p>{score.exam_title}</p>
                              {score.notes && (
                                <p className="text-[10px] text-navy-400 font-mono italic font-normal mt-0.5">
                                  "{score.notes}"
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-navy-600 dark:text-navy-300 font-mono">
                            {score.subject_or_topic}
                          </td>
                          <td className="py-3 px-3 text-center font-black text-royal-600 dark:text-gold-400 font-mono">
                            {score.score_percentage}%
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block text-[10px] font-mono font-black border px-2 py-0.5 rounded ${level.color}`}>
                              {level.code}: {level.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteScore(score.id, score.exam_title)}
                              className="p-1.5 hover:bg-red-500/10 text-navy-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete score"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-navy-400 italic text-xs">
                No score records logged yet.
              </div>
            )}
          </div>

          {/* Motivational advice / guidelines footer block */}
          <div className="flex items-start gap-3 bg-royal-50/30 dark:bg-navy-950/20 p-4 rounded-xl border border-royal-100/30 dark:border-navy-850">
            <Info className="w-5 h-5 text-royal-600 dark:text-gold-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-navy-900 dark:text-white uppercase font-mono tracking-wide">Tutor Bethuel's Mark Improvement Advice</h5>
              <p className="text-[11px] text-navy-600 dark:text-navy-400 leading-relaxed">
                In South Africa's Grade 12 CAPS and IEB final examinations, scoring a <b>Level 7 (80%+)</b> places you in the elite bracket, significantly increasing your chances of getting university admission for high-demand STEM fields (Medicine, Engineering, Computer Science, Actuarial Science).
              </p>
              <p className="text-[11px] text-navy-600 dark:text-navy-400 leading-relaxed pt-1">
                If your curve is currently fluctuating around Level 4 (50%) or Level 5 (60%), focus your whiteboard sessions on high-yielding paper segments: <b>Differential Calculus (35 Marks)</b>, <b>Trigonometry proofs (40 Marks)</b>, and <b>Euclidean Theorem applications (40 Marks)</b>. Continuous revision will accelerate your upgrade!
              </p>
            </div>
          </div>
        </>
      )}

      {/* HIGH-FIDELITY PRINT-ONLY PERFORMANCE REPORT */}
      {scores.length > 0 && (
        <div className="hidden print:block print-only w-full bg-white text-black p-8 font-sans leading-relaxed text-xs">
          {/* Header branding */}
          <div className="border-b-4 border-yellow-500 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black tracking-wide uppercase text-navy-900 font-display">AMARIS MATHEMATICS HUB</h1>
              <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase mt-1">
                OFFLINE ACADEMIC PROGRESS REPORT & MARKS LEDGER
              </p>
            </div>
            <div className="text-right font-mono text-[9px] text-gray-500">
              <p>Generated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p>Status: Audited & Complete</p>
            </div>
          </div>

          {/* Student Identity Profile */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 font-sans">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2 font-mono">STUDENT IDENTITY PROFILE</h3>
              <p><strong className="text-gray-700">Full Name:</strong> {user.first_name} {user.surname}</p>
              <p><strong className="text-gray-700">Email Address:</strong> {user.email}</p>
              <p><strong className="text-gray-700">Grade/Curriculum:</strong> {user.grade || "Grade 12 (CAPS)"}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2 font-mono">KEY STATISTICAL AGGREGATES</h3>
              <p><strong className="text-gray-700">Average Mark:</strong> {avgScore}% ({currentLevelInfo.code}: {currentLevelInfo.label})</p>
              <p><strong className="text-gray-700">Highest Assessment:</strong> {highestScoreObj ? `${highestScoreObj.score_percentage}%` : "N/A"}</p>
              <p><strong className="text-gray-700">Improvement Rate:</strong> {improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`} since baseline</p>
            </div>
          </div>

          {/* Aggregates Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6 text-center font-sans">
            <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg">
              <p className="text-[8px] font-bold text-gray-500 font-mono uppercase">Average Mark</p>
              <p className="text-lg font-black text-navy-900">{avgScore}%</p>
              <p className="text-[7px] text-gray-500 font-mono uppercase">{currentLevelInfo.code}</p>
            </div>
            <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg">
              <p className="text-[8px] font-bold text-gray-500 font-mono uppercase">Personal Record</p>
              <p className="text-lg font-black text-emerald-600">{highestScoreObj ? `${highestScoreObj.score_percentage}%` : "0%"}</p>
              <p className="text-[7px] text-gray-500 font-mono uppercase">Highest Mark</p>
            </div>
            <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg">
              <p className="text-[8px] font-bold text-gray-500 font-mono uppercase">Improvement</p>
              <p className="text-lg font-black text-blue-600">{improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`}</p>
              <p className="text-[7px] text-gray-500 font-mono uppercase">Since Baseline</p>
            </div>
            <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg">
              <p className="text-[8px] font-bold text-gray-500 font-mono uppercase">Distinction Gap</p>
              <p className="text-lg font-black text-navy-900">{avgScore >= 80 ? "Unlocked" : `${80 - avgScore}%`}</p>
              <p className="text-[7px] text-gray-500 font-mono uppercase">{avgScore >= 80 ? "Level 7 distinction" : "Target: 80%"}</p>
            </div>
          </div>

          {/* Records Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3 font-mono">ACADEMIC ASSESSMENT LOG LEDGER</h3>
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-[9px] font-mono text-gray-700 uppercase">
                  <th className="py-2 px-3 border border-gray-200">Date</th>
                  <th className="py-2 px-3 border border-gray-200">Assessment Title</th>
                  <th className="py-2 px-3 border border-gray-200">Subject / Module</th>
                  <th className="py-2 px-3 border border-gray-200 text-center">Score %</th>
                  <th className="py-2 px-3 border border-gray-200">CAPS Achievement Level</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score) => {
                  const level = getSADescriptor(score.score_percentage);
                  return (
                    <tr key={score.id} className="text-[10px]">
                      <td className="py-2 px-3 border border-gray-200 font-mono">{score.exam_date}</td>
                      <td className="py-2 px-3 border border-gray-200 font-bold">
                        {score.exam_title}
                        {score.notes && <p className="text-[8px] text-gray-500 font-mono font-normal italic">"{score.notes}"</p>}
                      </td>
                      <td className="py-2 px-3 border border-gray-200 font-mono">{score.subject_or_topic}</td>
                      <td className="py-2 px-3 border border-gray-200 text-center font-bold font-mono">{score.score_percentage}%</td>
                      <td className="py-2 px-3 border border-gray-200">
                        <span className="font-mono">{level.code}: {level.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer remarks */}
          <div className="pt-8 border-t border-gray-200 flex justify-between text-[9px] text-gray-500 font-mono">
            <div>
              <p className="font-bold text-gray-700">Tutor Bethuel Thipe Moukangwe</p>
              <p>Amaris Mathematics Hub System Integrity Engine</p>
            </div>
            <div className="text-right">
              <p>Contact: bethuelmoukangwe8@gmail.com</p>
              <p>Hotline: +27 71 415 6665</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
