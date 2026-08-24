import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, BookOpen, 
  Download, User, Calendar, Award, FileText, Loader2, RefreshCw, PlusCircle, ArrowRight
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine 
} from "recharts";
import { getFromDB, saveToDB } from "../lib/db";
import { Profile, TutorReport, Booking, HomeworkSubmission, MockExamScore, ActivityLog } from "../types";
import { jsPDF } from "jspdf";

interface TutorReportsDashboardProps {
  user: Profile;
}

export const TutorReportsDashboard: React.FC<TutorReportsDashboardProps> = ({ user }) => {
  // DB States
  const [reports, setReports] = useState<TutorReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TutorReport | null>(null);
  
  // Admin Generator States
  const [students, setStudents] = useState<Profile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>("2026-07-01");
  const [periodEnd, setPeriodEnd] = useState<string>("2026-07-17");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Chart and statistics data state
  const [studentMockScores, setStudentMockScores] = useState<MockExamScore[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalLessons: 0,
    homeworkCompletion: 0,
    mockAvg: 0
  });

  const isTutorOrAdmin = user.role === "admin" || user.role === "tutor";

  useEffect(() => {
    loadReportsAndStudents();
  }, [user]);

  useEffect(() => {
    if (selectedReport) {
      loadStudentStatsAndScores(selectedReport.student_id);
    }
  }, [selectedReport]);

  const loadReportsAndStudents = () => {
    // Load reports
    const allReports = getFromDB<TutorReport>("amh_tutor_reports");
    let filteredReports = allReports;
    
    if (!isTutorOrAdmin) {
      // Students can only see their own reports
      filteredReports = allReports.filter(r => r.student_id === user.id);
    }
    
    // Sort reports by created_at descending
    filteredReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setReports(filteredReports);
    if (filteredReports.length > 0) {
      setSelectedReport(filteredReports[0]);
    } else {
      setSelectedReport(null);
    }

    // Load students for generator dropdown
    if (isTutorOrAdmin) {
      const allProfiles = getFromDB<Profile>("amh_profiles");
      const studentProfiles = allProfiles.filter(p => p.role === "student");
      setStudents(studentProfiles);
      if (studentProfiles.length > 0) {
        setSelectedStudentId(studentProfiles[0].id);
      }
    }
  };

  const loadStudentStatsAndScores = (studentId: string) => {
    // Get mock scores
    const allScores = getFromDB<MockExamScore>("amh_mock_exam_scores");
    const studentScores = allScores
      .filter(s => s.student_id === studentId)
      .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
    setStudentMockScores(studentScores);

    // Get bookings (completed)
    const allBookings = getFromDB<Booking>("amh_bookings");
    const studentBookings = allBookings.filter(
      b => b.student_id === studentId && b.status === "completed"
    );

    // Get homework submissions
    const allSubmissions = getFromDB<HomeworkSubmission>("amh_homework_submissions");
    const studentSubmissions = allSubmissions.filter(s => s.student_id === studentId);
    
    const assignedHomeworkCount = getFromDB<any>("amh_homework_assignments").filter(
      (a: any) => a.student_id === studentId
    ).length;

    const hwCompletionRate = assignedHomeworkCount > 0 
      ? Math.round((studentSubmissions.length / assignedHomeworkCount) * 100) 
      : 100;

    const mockAvgVal = studentScores.length > 0
      ? Math.round(studentScores.reduce((sum, s) => sum + s.score_percentage, 0) / studentScores.length)
      : 75;

    setOverallStats({
      totalLessons: studentBookings.length,
      homeworkCompletion: Math.min(100, hwCompletionRate),
      mockAvg: mockAvgVal
    });
  };

  // Call Express Backend API to generate AI progress report via Gemini
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const targetStudent = students.find(s => s.id === selectedStudentId);
      if (!targetStudent) {
        throw new Error("Please select a valid student registry.");
      }

      // Query real logs in localStorage to supply context to Gemini
      const allBookings = getFromDB<Booking>("amh_bookings").filter(
        b => b.student_id === selectedStudentId && 
             b.lesson_date >= periodStart && 
             b.lesson_date <= periodEnd
      );

      const allHomeworks = getFromDB<any>("amh_homework_assignments").filter(
        (h: any) => h.student_id === selectedStudentId &&
             h.created_at >= periodStart &&
             h.created_at <= periodEnd
      );

      const allSubmissions = getFromDB<HomeworkSubmission>("amh_homework_submissions").filter(
        s => s.student_id === selectedStudentId && 
             s.created_at >= periodStart && 
             s.created_at <= periodEnd
      );

      const combinedHomeworks = allHomeworks.map((h: any) => {
        const sub = allSubmissions.find(s => s.assignment_id === h.id);
        return {
          title: h.title,
          status: h.status,
          tutor_feedback: sub ? sub.tutor_feedback : "No submission reviewed yet"
        };
      });

      const allScores = getFromDB<MockExamScore>("amh_mock_exam_scores").filter(
        s => s.student_id === selectedStudentId && 
             s.exam_date >= periodStart && 
             s.exam_date <= periodEnd
      );

      // Call API
      const response = await fetch("/api/ai/generate-tutor-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: `${targetStudent.first_name} ${targetStudent.surname}`,
          grade: targetStudent.grade,
          lessons: allBookings,
          homeworks: combinedHomeworks,
          mockScores: allScores,
          tutorName: `${user.first_name} ${user.surname}`
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const reportData = await response.json();

      // Store in DB
      const currentReports = getFromDB<TutorReport>("amh_tutor_reports");
      const newReport: TutorReport = {
        id: `rep-${Date.now()}`,
        student_id: targetStudent.id,
        student_name: `${targetStudent.first_name} ${targetStudent.surname}`,
        tutor_id: user.id,
        tutor_name: `${user.first_name} ${user.surname}`,
        created_at: new Date().toISOString().split("T")[0],
        period_start: periodStart,
        period_end: periodEnd,
        overall_progress_score: reportData.overall_progress_score || 75,
        summary_text: reportData.summary_text,
        key_challenges: reportData.key_challenges || [],
        suggested_revision_topics: reportData.suggested_revision_topics || [],
        mastered_concepts: reportData.mastered_concepts || [],
        lessons_covered_count: allBookings.filter(b => b.status === "completed").length || 1,
        homework_completion_rate: allHomeworks.length > 0 
          ? Math.round((allSubmissions.length / allHomeworks.length) * 100) 
          : 100,
        average_mock_score: allScores.length > 0
          ? Math.round(allScores.reduce((acc, cur) => acc + cur.score_percentage, 0) / allScores.length)
          : 75
      };

      currentReports.push(newReport);
      saveToDB("amh_tutor_reports", currentReports);

      // Add to Activity Logs
      const logs = getFromDB<ActivityLog>("amh_activity_logs");
      logs.push({
        id: `act-${Date.now()}`,
        user_name: `${user.first_name} ${user.surname}`,
        action: "Generated Tutor Report",
        details: `Created AI-summarized progress insights for ${targetStudent.first_name} ${targetStudent.surname}`,
        created_at: new Date().toISOString(),
        type: "system"
      });
      saveToDB("amh_activity_logs", logs);

      // Reload
      loadReportsAndStudents();
      setSelectedReport(newReport);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Export current report as a highly branded, professional PDF using jsPDF
  const handleExportPDF = () => {
    if (!selectedReport) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Draw header branding bars (Navy & Gold)
    doc.setFillColor(15, 23, 42); // Navy
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFillColor(234, 179, 8); // Gold
    doc.rect(0, 40, pageWidth, 4, "F");

    // Title & Logo
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AMARIS MATHEMATICS HUB", 15, 18);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(234, 179, 8); // Gold text
    doc.text("PORTAL DIAGNOSTIC ACADEMIC PERFORMANCE REPORT", 15, 26);

    // Standard high-school watermarking
    doc.setFontSize(36);
    doc.setTextColor(240, 240, 240);
    doc.saveGraphicsState();
    doc.setGState(doc.GState({ opacity: 0.15 }));
    doc.text("AMARIS ACADEMY OFFICIAL", 30, pageHeight / 2 - 20, { angle: 45 });
    doc.restoreGraphicsState();

    // Student & Report Meta Data Block
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Navy
    
    // Grid box background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, 52, pageWidth - 24, 38, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(12, 52, pageWidth - 24, 38, 3, 3, "D");

    doc.setFont("Helvetica", "bold");
    doc.text("Student Name:", 18, 60);
    doc.text("Assigned Tutor:", 18, 66);
    doc.text("Date Generated:", 18, 72);
    doc.text("Reporting Period:", 18, 78);

    doc.text("Overall Progress Score:", 115, 60);
    doc.text("Lessons Conducted:", 115, 66);
    doc.text("Homework Completion:", 115, 72);
    doc.text("Mock Exam Average:", 115, 78);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(selectedReport.student_name, 50, 60);
    doc.text(selectedReport.tutor_name, 50, 66);
    doc.text(selectedReport.created_at, 50, 72);
    doc.text(`${selectedReport.period_start} to ${selectedReport.period_end}`, 50, 78);

    // Format Overall score with level indicator
    const levelStr = selectedReport.overall_progress_score >= 80 ? "Level 7 (Outstanding Achievement)" :
                     selectedReport.overall_progress_score >= 70 ? "Level 6 (Meritorious)" :
                     selectedReport.overall_progress_score >= 60 ? "Level 5 (Substantial)" : "Level 4 (Adequate)";

    doc.text(`${selectedReport.overall_progress_score}% - ${levelStr}`, 160, 60);
    doc.text(`${selectedReport.lessons_covered_count} active sessions`, 160, 66);
    doc.text(`${selectedReport.homework_completion_rate}%`, 160, 72);
    doc.text(`${selectedReport.average_mock_score}%`, 160, 78);

    // AI-Summarized Insights (Summary Card)
    doc.setFillColor(240, 249, 255); // soft light blue
    doc.roundedRect(12, 98, pageWidth - 24, 36, 3, 3, "F");
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(12, 98, pageWidth - 24, 36, 3, 3, "D");

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(3, 105, 161); // sky blue text
    doc.text("AI-SUMMARIZED PERFORMANCE INSIGHTS", 18, 106);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42); // dark charcoal

    const splitSummary = doc.splitTextToSize(selectedReport.summary_text, pageWidth - 36);
    doc.text(splitSummary, 18, 114);

    // Challenges identified
    let startY = 142;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(185, 28, 28); // crimson text
    doc.text("KEY MATHEMATICAL CHALLENGES IDENTIFIED", 15, startY);
    
    startY += 6;
    selectedReport.key_challenges.forEach((challenge, idx) => {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      doc.text(`${idx + 1}.`, 15, startY);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const splitText = doc.splitTextToSize(challenge, pageWidth - 32);
      doc.text(splitText, 22, startY);
      startY += (splitText.length * 5) + 2;
    });

    // Revision Plan
    startY += 6;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(202, 138, 4); // gold-dark text
    doc.text("RECOMMENDED STRATEGIC REVISION TOPICS", 15, startY);

    startY += 6;
    selectedReport.suggested_revision_topics.forEach((topic, idx) => {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(202, 138, 4);
      doc.text(`${idx + 1}.`, 15, startY);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const splitText = doc.splitTextToSize(topic, pageWidth - 32);
      doc.text(splitText, 22, startY);
      startY += (splitText.length * 5) + 2;
    });

    // Mastered concepts (green card)
    startY += 6;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(22, 101, 52); // green text
    doc.text("CONSOLIDATED & MASTERED MATHEMATICAL CONCEPTS", 15, startY);

    startY += 6;
    selectedReport.mastered_concepts.forEach((concept, idx) => {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(22, 101, 52);
      doc.text("✓", 15, startY);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const splitText = doc.splitTextToSize(concept, pageWidth - 32);
      doc.text(splitText, 22, startY);
      startY += (splitText.length * 5) + 2;
    });

    // Signatures and footers
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Signed:", 15, pageHeight - 24);
    doc.setFont("Helvetica", "normal");
    doc.text("Head Tutor Bethuel Moukangwe (BSc)", 15, pageHeight - 20);
    doc.text("Amaris Mathematics Hub System Integrity Engine", 15, pageHeight - 16);

    doc.text("For any queries, contact bethuelmoukangwe8@gmail.com or +27 71 415 6665", 115, pageHeight - 16);

    // Save
    doc.save(`AMH_Tutor_Report_${selectedReport.student_name.replace(/\s+/g, "_")}_${selectedReport.created_at}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Header section with branding and actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 text-[10px] uppercase font-bold tracking-wider rounded-md font-mono border border-yellow-200 dark:border-yellow-850">
              Diagnostic Hub
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider rounded-md font-mono border border-emerald-200 dark:border-emerald-850 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
              Powered by Gemini 3.5
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight font-sans">
            Tutor <span className="text-yellow-500 dark:text-yellow-400 font-medium font-sans">Reports</span> Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Access 1-on-1 session analytics, key challenges, and revision items generated from step-by-step whiteboard evaluations.
          </p>
        </div>

        {selectedReport && (
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-navy-900 to-navy-950 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-navy-950 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer border border-navy-800 dark:border-yellow-400"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-900 dark:text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow hover:shadow-md transition-all cursor-pointer border border-slate-200 dark:border-navy-700"
              title="Print complete student progress report using high-fidelity browser layout styles"
            >
              <FileText className="w-4 h-4" />
              Print Report (PDF)
            </motion.button>
          </div>
        )}
      </div>

      {/* Tutor / Teacher Generator Workspace Block */}
      {isTutorOrAdmin && (
        <div className="bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 text-white border border-navy-850 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-yellow-500/10 to-transparent -mr-20 -mt-20 blur-2xl rounded-full" />
          
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold font-sans tracking-tight text-white uppercase">
              Tutor Synthesis Workspace (Generate AI Progress Report)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative z-10">
            <div className="space-y-1">
              <label className="text-[10px] text-yellow-400 uppercase font-extrabold tracking-wider font-mono">
                Select Active Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-navy-850 border border-navy-750 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-sans"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.first_name} {st.surname} ({st.grade})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider font-mono">
                Evaluation Period Start
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full bg-navy-850 border border-navy-750 p-2 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider font-mono">
                Evaluation Period End
              </label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full bg-navy-850 border border-navy-750 p-2 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || students.length === 0}
              className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 disabled:from-navy-800 disabled:to-navy-800 disabled:text-slate-500 text-navy-950 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-yellow-300 shadow-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-navy-950 animate-pulse" />
                  Generate AI Report
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {generationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-950/50 border border-red-800/80 rounded-xl p-3.5 text-xs text-red-300 mt-4 text-left font-mono"
              >
                Error synthesizing feedback logs: {generationError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Timeline navigation of reports (Left sidebar) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-extrabold font-mono text-navy-900 dark:text-slate-300 flex items-center gap-1.5 border-b border-navy-100 dark:border-navy-800 pb-2">
            <Calendar className="w-4 h-4 text-yellow-500" />
            Academic Progress Timeline
          </h3>

          {reports.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl text-center bg-slate-50/50 dark:bg-navy-950/20 text-slate-400 dark:text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-mono">No progress summaries archived yet.</p>
              {isTutorOrAdmin && (
                <p className="text-[10px] mt-1 text-yellow-500">
                  Select a student above to synthesize an official AI report.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {reports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                return (
                  <motion.div
                    key={report.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-navy-900 border-navy-900 text-white shadow-md dark:bg-navy-800 dark:border-yellow-400"
                        : "bg-white dark:bg-navy-900 border-slate-150 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? "text-yellow-400" : "text-navy-900 dark:text-white"}`}>
                          {report.student_name}
                        </p>
                        <span className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                          {report.created_at} (Tutor: {report.tutor_name.split(" ")[0]})
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-extrabold font-mono flex items-center justify-center ${
                        report.overall_progress_score >= 80 
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400"
                          : report.overall_progress_score >= 70
                          ? "bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-400"
                          : "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400"
                      }`}>
                        {report.overall_progress_score}%
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                        {report.lessons_covered_count} active whiteboards
                      </span>
                      <span className={`text-[10px] font-mono flex items-center gap-0.5 ${isSelected ? "text-yellow-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed diagnostic summary view (Right workspace) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!selectedReport ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-navy-900 border border-slate-150 dark:border-navy-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 h-full flex flex-col justify-center items-center"
              >
                <Sparkles className="w-12 h-12 text-slate-300 dark:text-navy-850 mb-3 animate-pulse" />
                <h4 className="text-base font-bold text-navy-900 dark:text-white mb-1">
                  Report Diagnostic Workspace Ready
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Select an academic milestone report from the timeline or generate a new one to evaluate mathematical metrics.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Visual scorecard block */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Overall score circle badge */}
                  <div className="bg-white dark:bg-navy-900 border border-slate-150 dark:border-navy-800 rounded-2xl p-4 text-center md:col-span-1 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider font-mono mb-1.5">
                      Progress Score
                    </span>
                    <div className="relative w-20 h-20 flex items-center justify-center mb-1">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-slate-100 dark:stroke-navy-850 fill-transparent"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-yellow-500 dark:stroke-yellow-400 fill-transparent"
                          strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - selectedReport.overall_progress_score / 100)}
                        />
                      </svg>
                      <span className="absolute text-xl font-black text-navy-900 dark:text-white font-mono">
                        {selectedReport.overall_progress_score}%
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-yellow-600 dark:text-yellow-400 font-extrabold uppercase">
                      {selectedReport.overall_progress_score >= 80 ? "Level 7 distinction" : "On Track"}
                    </span>
                  </div>

                  {/* Sub stats */}
                  <div className="bg-white dark:bg-navy-900 border border-slate-150 dark:border-navy-800 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                    <Award className="w-6 h-6 text-emerald-500 mb-1" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider font-mono">
                      Active Lessons
                    </span>
                    <span className="text-xl font-extrabold text-navy-900 dark:text-white font-mono mt-1">
                      {selectedReport.lessons_covered_count}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      Whiteboards covered
                    </span>
                  </div>

                  <div className="bg-white dark:bg-navy-900 border border-slate-150 dark:border-navy-800 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                    <CheckCircle2 className="w-6 h-6 text-royal-blue-500 text-blue-500 mb-1" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider font-mono">
                      Homework Rate
                    </span>
                    <span className="text-xl font-extrabold text-navy-900 dark:text-white font-mono mt-1">
                      {selectedReport.homework_completion_rate}%
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      Worksheets uploaded
                    </span>
                  </div>

                  <div className="bg-white dark:bg-navy-900 border border-slate-150 dark:border-navy-800 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                    <TrendingUp className="w-6 h-6 text-yellow-500 mb-1" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider font-mono">
                      Mock Trial Avg
                    </span>
                    <span className="text-xl font-extrabold text-navy-900 dark:text-white font-mono mt-1">
                      {selectedReport.average_mock_score}%
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      CAPS / IEB standard
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary Block */}
                <div className="bg-slate-50 dark:bg-navy-950/40 border border-slate-150 dark:border-navy-850 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3.5">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <h4 className="text-xs font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                      AI Diagnostic Summary Insights
                    </h4>
                  </div>
                  <blockquote className="border-l-4 border-yellow-500 pl-4 text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed text-left">
                    "{selectedReport.summary_text}"
                  </blockquote>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-150 dark:border-navy-850 pt-2.5">
                    <span>Target: Grade 10-12 CAPS & IEB Matric Mastery</span>
                    <span>Synthesized: {selectedReport.created_at}</span>
                  </div>
                </div>

                {/* Detailed insights (Bento grid: key challenges vs revision topics) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Challenges */}
                  <div className="bg-white dark:bg-navy-900 border border-red-100 dark:border-red-950/40 rounded-2xl p-5 shadow-sm text-left">
                    <div className="flex items-center gap-2 mb-4 border-b border-red-50 dark:border-red-950/40 pb-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h4 className="text-xs font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider font-mono">
                        Key Challenges Identified
                      </h4>
                    </div>
                    <ul className="space-y-3.5">
                      {selectedReport.key_challenges.map((challenge, idx) => (
                        <li key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-red-500 font-mono">{idx + 1}.</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Revision Topics */}
                  <div className="bg-white dark:bg-navy-900 border border-yellow-100 dark:border-yellow-950/40 rounded-2xl p-5 shadow-sm text-left">
                    <div className="flex items-center gap-2 mb-4 border-b border-yellow-50 dark:border-yellow-950/40 pb-2.5">
                      <BookOpen className="w-5 h-5 text-yellow-500" />
                      <h4 className="text-xs font-extrabold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider font-mono">
                        Suggested Revision Topics
                      </h4>
                    </div>
                    <ul className="space-y-3.5">
                      {selectedReport.suggested_revision_topics.map((topic, idx) => (
                        <li key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-yellow-500 font-mono">{idx + 1}.</span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mastered concepts to celebrate student wins */}
                <div className="bg-white dark:bg-navy-900 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 mb-4 border-b border-emerald-50 dark:border-emerald-950/40 pb-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse" />
                    <h4 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                      Consolidated & Mastered Concepts
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedReport.mastered_concepts.map((concept, idx) => (
                      <div key={idx} className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/40 rounded-xl flex gap-2.5 items-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {concept}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Trial Mock Exam scores trend chart */}
                {studentMockScores.length > 0 && (
                  <div className="bg-white dark:bg-navy-900 border border-slate-150 dark:border-navy-800 rounded-2xl p-5 text-left">
                    <h4 className="text-xs font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                      Mock Exam Scoring Trend Projections
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={studentMockScores}>
                          <defs>
                            <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="exam_date" stroke="#94a3b8" fontSize={10} />
                          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#0f172a", 
                              border: "1px solid #334155", 
                              borderRadius: "8px",
                              color: "#fff"
                            }} 
                          />
                          <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Level 7 Benchmark (80%)", fill: "#10b981", fontSize: 9, position: "top" }} />
                          <Area 
                            type="monotone" 
                            dataKey="score_percentage" 
                            stroke="#eab308" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#scoreColor)" 
                            name="Score %"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* HIGH-FIDELITY PRINT-ONLY TUTOR REPORT */}
      {selectedReport && (
        <div className="hidden print:block print-only w-full bg-white text-black p-8 font-sans leading-relaxed text-xs">
          {/* Header branding */}
          <div className="border-b-4 border-yellow-500 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black tracking-wide uppercase text-navy-900 font-display">AMARIS MATHEMATICS HUB</h1>
              <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase mt-1">
                PORTAL DIAGNOSTIC ACADEMIC PERFORMANCE REPORT
              </p>
            </div>
            <div className="text-right font-mono text-[9px] text-gray-500">
              <p>Generated: {selectedReport.created_at}</p>
              <p>Status: Official Diagnostic Audit</p>
            </div>
          </div>

          {/* Student Profile Identity Card */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 font-sans">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2 font-mono">STUDENT IDENTITY PROFILE</h3>
              <p><strong className="text-gray-700">Full Name:</strong> {selectedReport.student_name}</p>
              <p><strong className="text-gray-700">Assigned Tutor:</strong> {selectedReport.tutor_name}</p>
              <p><strong className="text-gray-700">Reporting Period:</strong> {selectedReport.period_start} to {selectedReport.period_end}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2 font-mono">KEY STATISTICAL AGGREGATES</h3>
              <p><strong className="text-gray-700">Overall Progress Score:</strong> {selectedReport.overall_progress_score}%</p>
              <p><strong className="text-gray-700">Lessons Conducted:</strong> {selectedReport.lessons_covered_count} active sessions</p>
              <p><strong className="text-gray-700">Homework Completion:</strong> {selectedReport.homework_completion_rate}%</p>
              <p><strong className="text-gray-700">Mock Exam Average:</strong> {selectedReport.average_mock_score}%</p>
            </div>
          </div>

          {/* AI Executive Summary Block */}
          <div className="border-l-4 border-yellow-500 pl-4 mb-6 italic text-gray-800 text-sm bg-yellow-50/50 p-4 rounded-r-xl">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider font-mono text-yellow-700 mb-1 not-italic">
              AI-SUMMARIZED PERFORMANCE INSIGHTS
            </h4>
            "{selectedReport.summary_text}"
          </div>

          {/* Bento grid: key challenges vs revision topics */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Key Challenges */}
            <div className="border border-red-200 bg-red-50/30 p-4 rounded-xl">
              <h4 className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider font-mono mb-2 pb-1 border-b border-red-100">
                Key Challenges Identified
              </h4>
              <ul className="space-y-2">
                {selectedReport.key_challenges.map((challenge, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-bold text-red-500 font-mono">{idx + 1}.</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Revision Topics */}
            <div className="border border-yellow-200 bg-yellow-50/30 p-4 rounded-xl">
              <h4 className="text-[10px] font-extrabold text-yellow-700 uppercase tracking-wider font-mono mb-2 pb-1 border-b border-yellow-100">
                Suggested Revision Topics
              </h4>
              <ul className="space-y-2">
                {selectedReport.suggested_revision_topics.map((topic, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-bold text-yellow-600 font-mono">{idx + 1}.</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mastered concepts to celebrate student wins */}
          <div className="border border-emerald-200 bg-emerald-50/20 p-4 rounded-xl mb-6">
            <h4 className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider font-mono mb-2 pb-1 border-b border-emerald-100">
              Consolidated & Mastered Concepts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedReport.mastered_concepts.map((concept, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{concept}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures and footers */}
          <div className="pt-8 border-t border-gray-200 flex justify-between text-[10px] text-gray-500 font-mono">
            <div>
              <p className="font-bold text-gray-700">Signed:</p>
              <p className="mt-2 text-gray-800">Head Tutor Bethuel Moukangwe (BSc)</p>
              <p>Amaris Mathematics Hub System Integrity Engine</p>
            </div>
            <div className="text-right">
              <p>For any queries, contact bethuelmoukangwe8@gmail.com</p>
              <p>Hotline: +27 71 415 6665</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
