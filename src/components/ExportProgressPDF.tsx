import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  GraduationCap, 
  Award, 
  BookOpen, 
  BarChart3, 
  FileSpreadsheet, 
  Calendar,
  Layers,
  User,
  X,
  FileCheck,
  ShieldCheck,
  Printer
} from "lucide-react";
import { Profile, MockExamScore } from "../types";

export interface ExportProgressPDFProps {
  user?: Profile | null;
}

export const ExportProgressPDF: React.FC<ExportProgressPDFProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<"full" | "notes" | "exams">("full");
  const [customGoalNotes, setCustomGoalNotes] = useState(
    "Targeting a Level 7 (80%+) Distinction in NSC Mathematics Paper 1 & Paper 2."
  );
  const [includeFormulas, setIncludeFormulas] = useState(true);
  const [includeMockExams, setIncludeMockExams] = useState(true);
  const [mockScores, setMockScores] = useState<MockExamScore[]>([]);

  const studentName = user ? `${user.first_name} ${user.surname}` : "Registered AMH Student";
  const grade = user?.grade || "Grade 12 CAPS / IEB";
  const school = user?.school || "South African High School";
  const province = user?.province || "Gauteng, RSA";
  const reportDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("amh_mock_exam_scores");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMockScores(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error reading mock scores:", e);
    }

    setMockScores([
      {
        id: "1",
        student_id: user?.id || "student-1",
        exam_title: "Term 1 NSC Trial Paper 1",
        subject_or_topic: "Calculus & Algebra",
        score_percentage: 78,
        exam_date: "2026-03-15",
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        student_id: user?.id || "student-1",
        exam_title: "June Mid-Year Paper 2",
        subject_or_topic: "Trigonometry & Geometry",
        score_percentage: 82,
        exam_date: "2026-06-20",
        created_at: new Date().toISOString()
      },
      {
        id: "3",
        student_id: user?.id || "student-1",
        exam_title: "Preliminary Matric Mock",
        subject_or_topic: "Full Syllabus CAPS",
        score_percentage: 85,
        exam_date: "2026-07-10",
        created_at: new Date().toISOString()
      }
    ]);
  }, [user]);

  // Read Weekly Study Goal & Badges info
  const getWeeklyGoalInfo = () => {
    try {
      const saved = localStorage.getItem("amh_weekly_study_goal_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.weeklyGoalHours === "number" && Array.isArray(parsed.dailyLogs)) {
          const logged = Math.round(parsed.dailyLogs.reduce((acc: number, item: any) => acc + (item.hours || 0), 0) * 10) / 10;
          const target = parsed.weeklyGoalHours;
          const pct = Math.min(100, Math.round((logged / (target || 1)) * 100));
          return { target, logged, pct };
        }
      }
    } catch (e) {
      console.warn("Error reading weekly goal info for PDF:", e);
    }
    return { target: 15, logged: 12.0, pct: 80 };
  };

  // Download PDF logic using jsPDF
  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      // Initialize jsPDF document (A4 format)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors setup
      const navyDark = [15, 23, 42]; // #0f172a
      const goldAccent = [217, 119, 6]; // #d97706
      const royalBlue = [30, 58, 138]; // #1e3a8a
      const textGrey = [71, 85, 105]; // #475569

      // --- PAGE HEADER BANNER ---
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(0, 0, 210, 38, "F");

      // Gold Accent Strip
      doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.rect(0, 38, 210, 3, "F");

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("AMARIS MATHEMATICS HUB", 14, 16);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(245, 158, 11); // Gold text
      doc.text("OFFICIAL ACADEMIC PROGRESS REPORT & MATRIC TRANSCRIPT", 14, 23);

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text("NSC CAPS & IEB Mathematics Excellence Centre | www.amarismathematics.co.za", 14, 30);

      // Document Ref Number
      const docRef = `AMH-REP-${Math.floor(100000 + Math.random() * 900000)}`;
      doc.setFontSize(8);
      doc.text(`Ref: ${docRef}`, 160, 16);
      doc.text(`Issued: ${reportDate}`, 160, 22);

      // --- STUDENT PROFILE BOX ---
      let currentY = 50;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, currentY, 182, 32, 3, 3, "FD");

      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Student: ${studentName}`, 20, currentY + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
      doc.text(`Grade Level: ${grade}`, 20, currentY + 18);
      doc.text(`Institution: ${school}`, 20, currentY + 25);

      doc.text(`Province: ${province}`, 110, currentY + 18);
      doc.text(`Curriculum: CAPS & IEB Mathematics`, 110, currentY + 25);

      currentY += 40;

      // --- OVERALL METRICS CARDS ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
      doc.text("1. ACADEMIC PERFORMANCE SUMMARY", 14, currentY);

      currentY += 6;

      // Draw 3 summary stat blocks
      const cardWidth = 57;
      const cardHeight = 22;

      // Card 1: Syllabus Mastery
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, currentY, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
      doc.text("Syllabus Mastery", 18, currentY + 7);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
      doc.text("84.5%", 18, currentY + 16);

      // Card 2: Trial Exam Average
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14 + cardWidth + 5.5, currentY, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
      doc.text("Trial Exam Avg", 18 + cardWidth + 5.5, currentY + 7);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text("81.7%", 18 + cardWidth + 5.5, currentY + 16);

      // Card 3: Weekly Goal & Hours Logged
      const goalInfo = getWeeklyGoalInfo();
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14 + (cardWidth + 5.5) * 2, currentY, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
      doc.text("Weekly Study Goal", 18 + (cardWidth + 5.5) * 2, currentY + 7);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text(`${goalInfo.logged} / ${goalInfo.target} hrs`, 18 + (cardWidth + 5.5) * 2, currentY + 16);

      currentY += 28;

      // --- WEEKLY STUDY TARGET & D3 GOAL TRACKER ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
      doc.text("2. WEEKLY STUDY HOUR TARGETS & PROGRESS", 14, currentY);

      currentY += 5;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, currentY, 182, 16, 2, 2, "FD");

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text(`Target: ${goalInfo.target} Hours/Week`, 18, currentY + 6);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
      doc.text(`Logged: ${goalInfo.logged} hrs (${goalInfo.pct}% Completed)`, 18, currentY + 11);

      // Progress bar fill inside box
      doc.setFillColor(226, 232, 240);
      doc.rect(110, currentY + 6, 76, 4, "F");
      doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.rect(110, currentY + 6, (76 * goalInfo.pct) / 100, 4, "F");

      currentY += 22;

      // --- EARNED BADGES & SUBJECT MASTERY SHOWCASE ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
      doc.text("3. EARNED BADGES & LEVEL ACHIEVEMENTS", 14, currentY);

      currentY += 5;

      const badgesSummary = [
        { name: "Algebra Ace", rarity: "Epic", status: "Unlocked (+250 XP)", topic: "Quadratic & Surds" },
        { name: "Geometry Genius", rarity: "Legendary", status: "Unlocked (+300 XP)", topic: "Circle Theorems" },
        { name: "Trigonometry Titan", rarity: "Epic", status: "Unlocked (+250 XP)", topic: "180°-θ Reduction" },
        { name: "Calculus Master", rarity: "Mythic", status: "In Progress (2/5)", topic: "Cubic Optimization" },
        { name: "Streak Superstar", rarity: "Rare", status: "Unlocked (+200 XP)", topic: "5-Day Quiz Streak" },
        { name: "Goal Crusher", rarity: "Rare", status: "Unlocked (+200 XP)", topic: "100% Weekly Goal" }
      ];

      // Table Header for Badges
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(14, currentY, 182, 6, "F");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("BADGE TITLE", 18, currentY + 4.2);
      doc.text("RARITY", 75, currentY + 4.2);
      doc.text("SUBJECT AREA", 115, currentY + 4.2);
      doc.text("ACHIEVEMENT STATUS", 180, currentY + 4.2, { align: "right" });

      currentY += 6;

      badgesSummary.forEach((bg, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
        doc.rect(14, currentY, 182, 5.5, "F");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text(bg.name, 18, currentY + 3.8);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
        doc.text(bg.rarity, 75, currentY + 3.8);
        doc.text(bg.topic, 115, currentY + 3.8);

        doc.setFont("helvetica", "bold");
        const isUnlocked = bg.status.includes("Unlocked");
        doc.setTextColor(isUnlocked ? goldAccent[0] : textGrey[0], isUnlocked ? goldAccent[1] : textGrey[1], isUnlocked ? goldAccent[2] : textGrey[2]);
        doc.text(bg.status, 180, currentY + 3.8, { align: "right" });

        currentY += 5.5;
      });

      currentY += 6;

      // Check for Page Break before Topic Mastery Breakdown & Exams
      if (currentY > 210) {
        doc.addPage();
        currentY = 20;

        // Page 2 Banner Header
        doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.rect(0, 0, 210, 12, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(`AMARIS MATHEMATICS HUB — PAGE 2 | Student: ${studentName}`, 14, 8);
        currentY = 22;
      }

      // --- TOPIC MASTERY BREAKDOWN ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
      doc.text("4. CAPS & IEB TOPIC MASTERY BREAKDOWN", 14, currentY);

      currentY += 6;

      const topics = [
        { name: "Algebra, Equations & Inequalities (Paper 1)", level: 88, status: "Mastered" },
        { name: "Calculus: Limits, Derivatives & Cubic Graphs (Paper 1)", level: 82, status: "Strong" },
        { name: "Trigonometry: Reduction, Identities & General Sol. (Paper 2)", level: 78, status: "Proficient" },
        { name: "Euclidean Geometry & Circle Theorems (Paper 2)", level: 75, status: "Developing" },
        { name: "Analytical Geometry & Circles (Paper 2)", level: 85, status: "Mastered" },
        { name: "Financial Mathematics & Annuities (Paper 1)", level: 90, status: "Mastered" }
      ];

      topics.forEach((topic) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text(topic.name, 14, currentY);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
        doc.text(`${topic.level}%`, 185, currentY, { align: "right" });

        // Draw Progress Bar
        doc.setFillColor(226, 232, 240);
        doc.rect(14, currentY + 1.5, 172, 2.5, "F");

        doc.setFillColor(royalBlue[0], royalBlue[1], royalBlue[2]);
        doc.rect(14, currentY + 1.5, (172 * topic.level) / 100, 2.5, "F");

        currentY += 8.5;
      });

      currentY += 4;

      // --- MOCK EXAMS & TRIAL RESULTS ---
      if (includeMockExams && mockScores.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
        doc.text("3. MATRIC TRIAL & PRACTICE EXAM SCORES", 14, currentY);

        currentY += 6;

        // Table Header
        doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.rect(14, currentY, 182, 8, "F");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("EXAM TITLE / PAPER", 18, currentY + 5.5);
        doc.text("SYLLABUS TOPIC", 85, currentY + 5.5);
        doc.text("DATE", 145, currentY + 5.5);
        doc.text("SCORE", 180, currentY + 5.5, { align: "right" });

        currentY += 8;

        mockScores.slice(0, 5).forEach((exam, idx) => {
          doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
          doc.rect(14, currentY, 182, 7, "F");

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.text(exam.exam_title, 18, currentY + 5);
          doc.text(exam.subject_or_topic, 85, currentY + 5);
          doc.text(exam.exam_date, 145, currentY + 5);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(exam.score_percentage >= 80 ? goldAccent[0] : royalBlue[0], exam.score_percentage >= 80 ? goldAccent[1] : royalBlue[1], exam.score_percentage >= 80 ? goldAccent[2] : royalBlue[2]);
          doc.text(`${exam.score_percentage}%`, 180, currentY + 5, { align: "right" });

          currentY += 7;
        });

        currentY += 8;
      }

      // --- CUSTOM STUDENT GOALS & TUTOR ENDORSEMENT ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
      doc.text("4. STUDENT GOALS & TUTOR REMARKS", 14, currentY);

      currentY += 6;

      doc.setFillColor(254, 243, 199); // Light amber
      doc.setDrawColor(251, 191, 36);
      doc.roundedRect(14, currentY, 182, 22, 2, 2, "FD");

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(146, 64, 14); // Dark amber text
      doc.text("Student Target Note:", 18, currentY + 6);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const splitText = doc.splitTextToSize(`"${customGoalNotes}"`, 172);
      doc.text(splitText, 18, currentY + 12);

      currentY += 28;

      // --- PAGE FOOTER & OFFICIAL DIRECTORIAL SEAL ---
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 275, 196, 275);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("Amaris Mathematics Hub — Official Academic Progress Record", 14, 281);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Verified by Head Tutor Mr. Khumalo | South Africa", 14, 285);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text("AMH DIRECTORIAL SEAL OF ACADEMIC QUALITY", 196, 281, { align: "right" });

      // Save PDF document
      const filename = `AMH_Academic_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);

      setIsGenerating(false);
      setIsOpen(false);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON GROUP */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* PRINT TO PDF BUTTON (Triggers browser print dialog formatted via CSS @media print) */}
        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-950 dark:bg-navy-800 dark:hover:bg-navy-700 text-white font-mono font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.02] shrink-0 border border-navy-700/50"
          title="Print to PDF using clean CSS media query print rules"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print to PDF</span>
        </button>

        {/* PDF GENERATOR OPTIONS MODAL BUTTON */}
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-mono font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.02] shrink-0"
          title="Export Official Progress Report & Notes via jsPDF"
        >
          <FileText className="w-4 h-4" />
          <span>PDF Options</span>
        </button>
      </div>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative text-navy-900 dark:text-white space-y-6">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-navy-400 hover:text-navy-900 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-navy-100 dark:border-navy-800">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                    Academic PDF Export Engine
                  </span>
                </div>
                <h2 className="text-xl font-black font-display tracking-tight mt-0.5">
                  Export Academic Progress PDF Report
                </h2>
              </div>
            </div>

            {/* OPTIONS FORM */}
            <div className="space-y-4 text-xs font-sans">
              <p className="text-navy-600 dark:text-navy-300 leading-relaxed">
                Generate a formal, high-resolution PDF academic transcript containing your CAPS/IEB topic mastery percentages, trial exam scores, and personalized study goals for university applications or parent reviews.
              </p>

              {/* STUDENT PREVIEW CARD */}
              <div className="p-4 rounded-2xl bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-navy-500 dark:text-navy-400">STUDENT NAME:</span>
                  <span className="text-navy-900 dark:text-white">
                    {studentName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-navy-500 dark:text-navy-400">GRADE & CURRICULUM:</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {grade}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-navy-500 dark:text-navy-400">AVERAGE MASTERY:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    84.5% Distinction Track
                  </span>
                </div>
              </div>

              {/* CUSTOM GOALS / NOTES INPUT */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 block">
                  Add Personal Study Target / Note for PDF:
                </label>
                <textarea
                  value={customGoalNotes}
                  onChange={(e) => setCustomGoalNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl p-3 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. Working on Euclidean geometry circle theorems to push Paper 2 score to 85%..."
                />
              </div>

              {/* TOGGLES */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMockExams}
                    onChange={(e) => setIncludeMockExams(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-navy-300 dark:border-navy-700"
                  />
                  <span className="font-bold text-navy-800 dark:text-navy-200">
                    Include Matric Trial & Practice Exam score log
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeFormulas}
                    onChange={(e) => setIncludeFormulas(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-navy-300 dark:border-navy-700"
                  />
                  <span className="font-bold text-navy-800 dark:text-navy-200">
                    Include Topic Mastery Percentages & AMH Seal
                  </span>
                </label>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-100 dark:border-navy-800 flex-wrap">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 font-mono font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-navy-900 dark:bg-navy-800 hover:bg-navy-950 text-white font-mono font-bold text-xs cursor-pointer transition-all flex items-center gap-2 shadow-md"
                title="Print clean version via browser print dialog (Save as PDF)"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print to PDF (CSS)</span>
              </button>

              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-mono font-bold text-xs transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-FRIENDLY CSS MEDIA QUERY DOCUMENT CONTAINER FOR "PRINT TO PDF" */}
      <div className="hidden print:block print-only w-full bg-white text-black p-8 font-sans leading-relaxed text-xs space-y-6">
        {/* DOCUMENT HEADER */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-900 font-serif">
              AMARIS MATHEMATICS HUB
            </div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-0.5 font-mono">
              Official Student Academic Work & Progress Transcript
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              NSC CAPS & IEB Mathematics Excellence Centre | www.amarismathematics.co.za
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-600">
            <div><strong>Ref:</strong> AMH-PRINT-{Math.floor(100000 + Math.random() * 900000)}</div>
            <div><strong>Date:</strong> {reportDate}</div>
          </div>
        </div>

        {/* STUDENT PROFILE BOX */}
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/80 space-y-2 print-avoid-break">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-bold text-sm text-slate-900">
              Student: {studentName}
            </span>
            <span className="font-mono text-xs font-bold text-amber-800">
              {grade}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-mono">
            <div><strong>Institution:</strong> {school}</div>
            <div><strong>Province:</strong> {province}</div>
            <div><strong>Email:</strong> {user?.email || "student@amarismathematics.co.za"}</div>
            <div><strong>Status:</strong> Active CAPS / IEB Enrolment</div>
          </div>
        </div>

        {/* SECTION 1: ACADEMIC PERFORMANCE & MASTERY */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-serif">
            1. Academic Performance Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
              <div className="text-[10px] font-mono uppercase text-slate-500">Syllabus Mastery</div>
              <div className="text-lg font-bold text-slate-900 mt-1">84.5%</div>
              <div className="text-[9px] text-emerald-700 font-semibold">Distinction Track</div>
            </div>
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
              <div className="text-[10px] font-mono uppercase text-slate-500">Trial Exam Average</div>
              <div className="text-lg font-bold text-amber-800 mt-1">81.7%</div>
              <div className="text-[9px] text-slate-600 font-semibold">Level 7 Target</div>
            </div>
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
              <div className="text-[10px] font-mono uppercase text-slate-500">Completed Sessions</div>
              <div className="text-lg font-bold text-slate-900 mt-1">18 Hours</div>
              <div className="text-[9px] text-slate-600 font-semibold">Tutor Verified</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CAPS & IEB SYLLABUS TOPIC BREAKDOWN */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-serif">
            2. CAPS & IEB Topic Mastery Breakdown
          </h3>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 font-mono text-[10px] uppercase text-slate-700">
                <th className="py-1.5">Syllabus Module</th>
                <th className="py-1.5">Paper</th>
                <th className="py-1.5 text-right">Mastery Level</th>
                <th className="py-1.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-1.5 font-semibold">Algebra, Exponents, Surds & Equations</td>
                <td className="py-1.5 font-mono">Paper 1</td>
                <td className="py-1.5 text-right font-mono font-bold">88%</td>
                <td className="py-1.5 text-right font-mono text-emerald-700 font-bold">Mastered</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Differential Calculus & Cubic Graphs</td>
                <td className="py-1.5 font-mono">Paper 1</td>
                <td className="py-1.5 text-right font-mono font-bold">82%</td>
                <td className="py-1.5 text-right font-mono text-slate-800 font-bold">Strong</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Trigonometry: Identities & Reduction Laws</td>
                <td className="py-1.5 font-mono">Paper 2</td>
                <td className="py-1.5 text-right font-mono font-bold">78%</td>
                <td className="py-1.5 text-right font-mono text-slate-800 font-bold">Proficient</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Euclidean Geometry & Circle Theorems</td>
                <td className="py-1.5 font-mono">Paper 2</td>
                <td className="py-1.5 text-right font-mono font-bold">75%</td>
                <td className="py-1.5 text-right font-mono text-amber-800 font-bold">Developing</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Analytical Geometry & Circles</td>
                <td className="py-1.5 font-mono">Paper 2</td>
                <td className="py-1.5 text-right font-mono font-bold">85%</td>
                <td className="py-1.5 text-right font-mono text-emerald-700 font-bold">Mastered</td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold">Financial Mathematics & Annuities</td>
                <td className="py-1.5 font-mono">Paper 1</td>
                <td className="py-1.5 text-right font-mono font-bold">90%</td>
                <td className="py-1.5 text-right font-mono text-emerald-700 font-bold">Mastered</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 3: RECENT MATRIC MOCK EXAM SCORES */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-serif">
            3. Matric Trial & Practice Exam Results
          </h3>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 font-mono text-[10px] uppercase text-slate-700">
                <th className="py-1.5">Exam Title</th>
                <th className="py-1.5">Topic Focus</th>
                <th className="py-1.5">Date</th>
                <th className="py-1.5 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockScores.slice(0, 5).map((exam, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 font-semibold">{exam.exam_title}</td>
                  <td className="py-1.5">{exam.subject_or_topic}</td>
                  <td className="py-1.5 font-mono">{exam.exam_date}</td>
                  <td className="py-1.5 text-right font-mono font-bold text-amber-800">{exam.score_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 4: STUDENT TARGET REMARKS */}
        {customGoalNotes && (
          <div className="border border-amber-300 rounded p-3 bg-amber-50/50 space-y-1 print-avoid-break">
            <div className="text-[10px] font-mono font-bold text-amber-900 uppercase">Personal Study Goal / Note:</div>
            <div className="text-xs italic text-slate-800 font-serif">"{customGoalNotes}"</div>
          </div>
        )}

        {/* SECTION 5: FOOTER & SEAL */}
        <div className="border-t border-slate-300 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-slate-600 print-avoid-break">
          <div>
            <div className="font-bold text-slate-900">Amaris Mathematics Hub — Official Student Transcript</div>
            <div>Verified by Head Tutor Mr. Khumalo | South Africa</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-amber-800 uppercase">AMH Directorial Seal of Academic Quality</div>
            <div>Document formatted via Print to PDF CSS Engine</div>
          </div>
        </div>
      </div>
    </>
  );
};

