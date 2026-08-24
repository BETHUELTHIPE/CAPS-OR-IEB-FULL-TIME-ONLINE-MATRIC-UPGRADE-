import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { 
  Printer, 
  X, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Award, 
  HelpCircle,
  CheckCircle2,
  FileCheck,
  Maximize2,
  Minimize2,
  AlignJustify,
  Download,
  Gauge,
  Layout,
  QrCode,
  Type,
  Loader2,
  Scissors,
  Grid,
  Columns,
  Layers,
  ShieldCheck,
  Sliders,
  Info,
  Settings,
  AlertCircle,
  Check
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Profile } from "../types";
import { DownloadWorksheetPDFButton } from "./DownloadWorksheetPDFButton";
import { QRGenerator } from "./QRGenerator";

export interface WorksheetQuestion {
  id: string;
  questionNumber: string;
  topic: string;
  paper: "Paper 1" | "Paper 2";
  totalMarks: number;
  instructionText?: string;
  subQuestions: {
    numberLabel: string;
    statement: string;
    marks: number;
    memoAnswer: string;
    workSpaceLines?: number;
  }[];
}

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksheetTitle?: string;
  subject?: string;
  grade?: string;
  totalMarks?: number;
  timeAllowed?: string;
  studentName?: string;
  user?: Profile | null;
  questions?: WorksheetQuestion[];
  onPrint?: () => void;
}

const DEFAULT_QUESTIONS: WorksheetQuestion[] = [
  {
    id: "q1-algebra",
    questionNumber: "QUESTION 1",
    topic: "ALGEBRA, EQUATIONS & EXPONENTS",
    paper: "Paper 1",
    totalMarks: 12,
    instructionText: "Answer ALL parts of this question. Show all necessary algebraic steps.",
    subQuestions: [
      {
        numberLabel: "1.1",
        statement: "Solve for x in the quadratic equation: 2x² - 5x - 3 = 0",
        marks: 3,
        memoAnswer: "(2x + 1)(x - 3) = 0  ⇒  x = -1/2  or  x = 3. [1 mark method, 2 marks final answers]",
        workSpaceLines: 4
      },
      {
        numberLabel: "1.2",
        statement: "Simplify without using a calculator:  (2^(n+2) • 3^(n-1)) / (6^n)",
        marks: 4,
        memoAnswer: "= (2^n • 2² • 3^n • 3⁻¹) / (2^n • 3^n) = 2² • 3⁻¹ = 4/3 or 1,33. [2 marks index rules, 2 marks final answer]",
        workSpaceLines: 5
      },
      {
        numberLabel: "1.3",
        statement: "Solve for x and y simultaneously:\n  y + 2x = 3   and   x² + y² = 9",
        marks: 5,
        memoAnswer: "y = 3 - 2x  ⇒  x² + (3 - 2x)² = 9  ⇒  5x² - 12x = 0  ⇒  x(5x - 12) = 0\n  x = 0 (y = 3)  or  x = 12/5 = 2.4 (y = -1.8). [5 marks total]",
        workSpaceLines: 6
      }
    ]
  },
  {
    id: "q2-calculus",
    questionNumber: "QUESTION 2",
    topic: "DIFFERENTIAL CALCULUS & CUBIC FUNCTIONS",
    paper: "Paper 1",
    totalMarks: 14,
    instructionText: "Use differential calculus rules or first principles where specified.",
    subQuestions: [
      {
        numberLabel: "2.1",
        statement: "Determine f'(x) from first principles if f(x) = 3x² - 2.",
        marks: 5,
        memoAnswer: "f'(x) = lim_{h→0} [3(x+h)² - 2 - (3x² - 2)] / h = lim_{h→0} [6xh + 3h²] / h = lim_{h→0} (6x + 3h) = 6x. [5 marks]",
        workSpaceLines: 6
      },
      {
        numberLabel: "2.2",
        statement: "Determine dy/dx if y = √x + 4 / x²",
        marks: 4,
        memoAnswer: "y = x^(1/2) + 4x⁻²  ⇒  dy/dx = (1/2)x^(-1/2) - 8x⁻³ = 1/(2√x) - 8/x³. [4 marks]",
        workSpaceLines: 4
      },
      {
        numberLabel: "2.3",
        statement: "Given g(x) = x³ - 3x² - 9x + 11. Determine the coordinates of the turning points of g.",
        marks: 5,
        memoAnswer: "g'(x) = 3x² - 6x - 9 = 0  ⇒  3(x - 3)(x + 1) = 0  ⇒  x = 3 (y = -16) or x = -1 (y = 16).\n  Turning Points: (3; -16) Local Min, (-1; 16) Local Max. [5 marks]",
        workSpaceLines: 6
      }
    ]
  },
  {
    id: "q3-trig",
    questionNumber: "QUESTION 3",
    topic: "TRIGONOMETRIC IDENTITIES & REDUCTION",
    paper: "Paper 2",
    totalMarks: 12,
    instructionText: "All angles are given in degrees.",
    subQuestions: [
      {
        numberLabel: "3.1",
        statement: "Simplify the following expression to a single trigonometric ratio:\n  [ sin(180° - θ) • cos(90° + θ) ] / [ tan(180° + θ) • cos(360° - θ) ]",
        marks: 5,
        memoAnswer: "= [ (sin θ)(-sin θ) ] / [ (tan θ)(cos θ) ] = -sin² θ / sin θ = -sin θ. [5 marks]",
        workSpaceLines: 5
      },
      {
        numberLabel: "3.2",
        statement: "Prove the identity:   (sin 2x) / (1 + cos 2x) = tan x",
        marks: 4,
        memoAnswer: "LHS = (2 sin x cos x) / (1 + 2 cos² x - 1) = (2 sin x cos x) / (2 cos² x) = sin x / cos x = tan x = RHS. [4 marks]",
        workSpaceLines: 4
      },
      {
        numberLabel: "3.3",
        statement: "Determine the general solution for:   2 cos² x - sin x - 1 = 0",
        marks: 3,
        memoAnswer: "2(1 - sin² x) - sin x - 1 = 0  ⇒  2 sin² x + sin x - 1 = 0  ⇒  (2 sin x - 1)(sin x + 1) = 0\n  sin x = 0.5  ⇒  x = 30° + k•360° or 150° + k•360°;\n  sin x = -1   ⇒  x = 270° + k•360°, k ∈ ℤ. [3 marks]",
        workSpaceLines: 4
      }
    ]
  },
  {
    id: "q4-geometry",
    questionNumber: "QUESTION 4",
    topic: "ANALYTICAL GEOMETRY & CIRCLES",
    paper: "Paper 2",
    totalMarks: 12,
    instructionText: "Round off final answers to TWO decimal places where necessary.",
    subQuestions: [
      {
        numberLabel: "4.1",
        statement: "Given points A(-2; 4) and B(6; -2). Calculate the distance AB and midpoint M of AB.",
        marks: 4,
        memoAnswer: "AB = √((6 - (-2))² + (-2 - 4)²) = √(64 + 36) = √100 = 10 units.\n  Midpoint M = ( (-2+6)/2 ; (4+(-2))/2 ) = (2; 1). [4 marks]",
        workSpaceLines: 4
      },
      {
        numberLabel: "4.2",
        statement: "Determine the equation of the circle centered at the origin O(0; 0) passing through point A(-2; 4).",
        marks: 3,
        memoAnswer: "r² = (-2)² + (4)² = 4 + 16 = 20  ⇒  Equation: x² + y² = 20. [3 marks]",
        workSpaceLines: 3
      },
      {
        numberLabel: "4.3",
        statement: "Find the gradient of the tangent to the circle at point A(-2; 4).",
        marks: 5,
        memoAnswer: "Gradient radius OA = (4 - 0)/(-2 - 0) = -2.\n  Since Tangent ⊥ Radius, m_tangent = -1 / (-2) = +1/2. [5 marks]",
        workSpaceLines: 5
      }
    ]
  }
];

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  worksheetTitle = "NSC CAPS & IEB Mathematics Trial Worksheet",
  subject = "Mathematics - Paper 1 & Paper 2",
  grade = "Grade 12 CAPS",
  totalMarks = 50,
  timeAllowed = "60 Minutes",
  studentName: studentNameProp,
  user,
  questions = DEFAULT_QUESTIONS,
  onPrint
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showMemo, setShowMemo] = useState<boolean>(false);
  const [showStudentDetails, setShowStudentDetails] = useState<boolean>(true);
  const [includeFormulaSheet, setIncludeFormulaSheet] = useState<boolean>(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced" | "All Levels">("Intermediate");
  const [paperSize, setPaperSize] = useState<"A4" | "US Letter">("A4");
  const [printLayout, setPrintLayout] = useState<"Standard" | "Minimalist">("Standard");
  const [spacingMode, setSpacingMode] = useState<"Standard" | "Compact">("Standard");
  const [fontSize, setFontSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"all" | "single" | "grid">("all");
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(false);
  const [marginPreset, setMarginPreset] = useState<"narrow" | "standard" | "wide">("standard");
  const [workspaceLinesCount, setWorkspaceLinesCount] = useState<number>(4);
  const [pdfHint, setPdfHint] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [pdfDownloadedToast, setPdfDownloadedToast] = useState<boolean>(false);
  const [showQuickSetupGuide, setShowQuickSetupGuide] = useState<boolean>(false);

  if (!isOpen) return null;

  const studentName = studentNameProp || (user ? `${user.first_name} ${user.surname}` : "______________________");
  const schoolName = user?.school || "South African High School";
  const solutionUrl = `https://www.amarismathematics.co.za/portal/solutions?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}&worksheet=${encodeURIComponent(worksheetTitle)}&level=${encodeURIComponent(selectedDifficulty)}`;
  const solutionId = `AMH-SOL-${Math.abs(worksheetTitle.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a|0},0)).toString(16).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Calculate questions distribution across pages based on Standard vs Compact View
  const page1Questions = spacingMode === "Compact" 
    ? questions.slice(0, Math.min(3, questions.length)) 
    : questions.slice(0, 2);
  const page2Questions = spacingMode === "Compact" 
    ? questions.slice(page1Questions.length) 
    : questions.slice(2);

  const totalPages = (page2Questions.length > 0 || showQrCode ? 2 : 1) + (includeFormulaSheet ? 1 : 0) + (showAnswerKey ? 1 : 0);
  const totalWorksheetMarks = questions.reduce((acc, q) => acc + (q.totalMarks || 0), 0);

  const handleTriggerPrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleSavePDF = () => {
    setPdfHint(true);
    setTimeout(() => {
      setPdfHint(false);
    }, 5000);

    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Direct Programmatic PDF Generator with high fidelity layout & clean page breaks
  const handleDownloadProgrammaticPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const isA4 = paperSize === "A4";
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: isA4 ? "a4" : "letter"
      });

      const pageWidth = isA4 ? 210 : 215.9;
      const pageHeight = isA4 ? 297 : 279.4;
      const marginX = 14;
      const contentWidth = pageWidth - (marginX * 2);

      const navyDark = [15, 23, 42]; // #0f172a
      const royalBlue = [30, 58, 138]; // #1e3a8a
      const goldAccent = [217, 119, 6]; // #d97706
      const slateDark = [51, 65, 85]; // #334155
      const textGrey = [71, 85, 105]; // #475569
      const bgLight = [248, 250, 252]; // #f8fafc

      let currentPage = 1;

      const drawHeader = (isFirstPage: boolean) => {
        if (printLayout === "Minimalist") {
          doc.setDrawColor(slateDark[0], slateDark[1], slateDark[2]);
          doc.setLineWidth(0.4);
          doc.line(marginX, 14, pageWidth - marginX, 14);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.text(worksheetTitle.toUpperCase(), marginX, 11);
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
          doc.text(`${grade} | ${subject} | ${currentDate}`, pageWidth - marginX, 11, { align: "right" });
          return;
        }

        if (isFirstPage) {
          // Page 1 Top Navy Banner
          doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.rect(0, 0, pageWidth, 26, "F");

          // Gold Accent Strip
          doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
          doc.rect(0, 26, pageWidth, 1.8, "F");

          // Brand Title
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14.5);
          doc.text("AMARIS MATHEMATICS HUB", marginX, 10.5);

          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(245, 158, 11);
          doc.text("OFFICIAL SOUTH AFRICAN HIGH SCHOOL MATHEMATICS WORKSHEET", marginX, 16.5);

          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(203, 213, 225);
          doc.text("NSC CAPS & IEB Curriculum Standard | www.amarismathematics.co.za", marginX, 22);

          // Header Right Details
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text(grade, pageWidth - marginX, 9.5, { align: "right" });
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(245, 158, 11);
          doc.text(subject, pageWidth - marginX, 15, { align: "right" });
          
          doc.setTextColor(203, 213, 225);
          doc.text(`Date: ${currentDate}`, pageWidth - marginX, 20.5, { align: "right" });
        } else {
          // Running Banner on Subsequent Pages
          doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.rect(0, 0, pageWidth, 11, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text(`AMARIS MATHEMATICS HUB — ${worksheetTitle}`, marginX, 7.5);

          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(245, 158, 11);
          doc.text(`${grade} • ${subject}`, pageWidth - marginX, 7.5, { align: "right" });
        }
      };

      const drawFooter = (pageNum: number, total: number) => {
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
        doc.text("Amaris Mathematics Hub — Official Student Worksheet • CAPS & IEB Academic Standard", marginX, pageHeight - 6);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
        doc.text(`Page ${pageNum} of ${total}`, pageWidth - marginX, pageHeight - 6, { align: "right" });
      };

      // --- PAGE 1 INITIALIZATION ---
      drawHeader(true);
      let currentY = printLayout === "Minimalist" ? 20 : 34;

      // 1. Worksheet Header Parameters Strip
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, currentY, contentWidth, 12, 1.5, 1.5, "FD");

      const colW = contentWidth / 4;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);

      doc.text("TOTAL MARKS:", marginX + 3, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(`${totalMarks} Marks`, marginX + 3, currentY + 9.5);

      doc.setFont("helvetica", "bold");
      doc.text("TIME ALLOWED:", marginX + colW + 3, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(timeAllowed, marginX + colW + 3, currentY + 9.5);

      doc.setFont("helvetica", "bold");
      doc.text("DIFFICULTY:", marginX + (colW * 2) + 3, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(selectedDifficulty.toUpperCase(), marginX + (colW * 2) + 3, currentY + 9.5);

      doc.setFont("helvetica", "bold");
      doc.text("CURRICULUM:", marginX + (colW * 3) + 3, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.text("NSC & IEB Standards", marginX + (colW * 3) + 3, currentY + 9.5);

      currentY += 16;

      // 2. Student Details Box
      if (showStudentDetails) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(marginX, currentY, contentWidth, 16, 1.5, 1.5, "D");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

        doc.text("STUDENT NAME:", marginX + 3, currentY + 6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text(studentName, marginX + 28, currentY + 6);
        doc.line(marginX + 28, currentY + 7, marginX + (contentWidth / 2) - 4, currentY + 7);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text("GRADE & CLASS:", marginX + (contentWidth / 2) + 4, currentY + 6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text(grade, marginX + (contentWidth / 2) + 30, currentY + 6);
        doc.line(marginX + (contentWidth / 2) + 30, currentY + 7, marginX + contentWidth - 4, currentY + 7);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text("HIGH SCHOOL:", marginX + 3, currentY + 12.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text(schoolName, marginX + 28, currentY + 12.5);
        doc.line(marginX + 28, currentY + 13.5, marginX + (contentWidth / 2) - 4, currentY + 13.5);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text("EXAM ID / CODE:", marginX + (contentWidth / 2) + 4, currentY + 12.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text("AMH-WORKSHEET", marginX + (contentWidth / 2) + 30, currentY + 12.5);
        doc.line(marginX + (contentWidth / 2) + 30, currentY + 13.5, marginX + contentWidth - 4, currentY + 13.5);

        currentY += 20;
      }

      // 3. Instructions Callout
      const isCompactPDF = spacingMode === "Compact";
      const instBoxHeight = isCompactPDF ? 8.5 : 11;
      doc.setFillColor(254, 243, 199); // #fef3c7 amber light
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, currentY, contentWidth, instBoxHeight, 1.5, 1.5, "FD");

      doc.setFontSize(isCompactPDF ? 7 : 7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text("GENERAL INSTRUCTIONS:", marginX + 3, currentY + (isCompactPDF ? 3.5 : 4.5));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(isCompactPDF ? 6.2 : 6.8);
      doc.setTextColor(120, 53, 15);
      doc.text("• Answer ALL questions in spaces provided. Show ALL working and mathematical steps.", marginX + 3, currentY + (isCompactPDF ? 6.5 : 8));
      if (!isCompactPDF) {
        doc.text("• An approved, non-programmable scientific calculator may be used. Round off final answers to TWO decimal places where necessary.", marginX + 3, currentY + 11.5);
      }

      currentY += isCompactPDF ? 11 : 15;

      // 4. Questions & Subquestions Render Loop
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const q = questions[qIdx];

        // Check if question header fits or needs page break
        if (currentY + (isCompactPDF ? 16 : 22) > pageHeight - 20) {
          doc.addPage();
          currentPage++;
          drawHeader(false);
          currentY = 16;
        }

        // Question Title Bar
        doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
        const titleBarHeight = isCompactPDF ? 5.5 : 6.5;
        doc.rect(marginX, currentY, contentWidth, titleBarHeight, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(isCompactPDF ? 7.8 : 8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`${q.questionNumber} — ${q.topic.toUpperCase()}`, marginX + 3, currentY + (isCompactPDF ? 3.8 : 4.6));

        doc.setFontSize(isCompactPDF ? 7.2 : 8);
        doc.setTextColor(245, 158, 11);
        doc.text(`[${q.totalMarks} MARKS]`, pageWidth - marginX - 3, currentY + (isCompactPDF ? 3.8 : 4.6), { align: "right" });

        currentY += isCompactPDF ? 7 : 9;

        // Subquestions
        for (let sIdx = 0; sIdx < q.subQuestions.length; sIdx++) {
          const sub = q.subQuestions[sIdx];
          const statementLines = doc.splitTextToSize(sub.statement, contentWidth - 22);
          const memoLines = showMemo ? doc.splitTextToSize(sub.memoAnswer, contentWidth - 20) : [];
          
          const workspaceLines = isCompactPDF ? Math.max(2, (sub.workSpaceLines || 3) - 2) : (sub.workSpaceLines || 3);
          const lineStep = isCompactPDF ? 4.2 : 5.5;

          const linesNeeded = showMemo 
            ? (statementLines.length * (isCompactPDF ? 3.5 : 4)) + (memoLines.length * 3.5) + 10
            : (statementLines.length * (isCompactPDF ? 3.5 : 4)) + (workspaceLines * lineStep) + 5;

          if (currentY + linesNeeded > pageHeight - 18) {
            doc.addPage();
            currentPage++;
            drawHeader(false);
            currentY = 16;
          }

          // Subquestion Label and Statement
          doc.setFont("helvetica", "bold");
          doc.setFontSize(isCompactPDF ? 7.5 : 8);
          doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.text(sub.numberLabel, marginX + 2, currentY + 3.5);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);
          doc.text(statementLines, marginX + 11, currentY + 3.5);

          // Mark Tag
          doc.setFont("helvetica", "bold");
          doc.setFontSize(isCompactPDF ? 7 : 7.5);
          doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
          doc.text(`(${sub.marks})`, pageWidth - marginX - 2, currentY + 3.5, { align: "right" });

          currentY += (statementLines.length * (isCompactPDF ? 3.5 : 4.2)) + (isCompactPDF ? 1.5 : 2);

          if (showMemo) {
            // Render Green Memo Box
            const memoBoxHeight = (memoLines.length * 3.5) + (isCompactPDF ? 5.5 : 7);
            doc.setFillColor(236, 253, 245); // #ecfdf5
            doc.setDrawColor(167, 243, 208);
            doc.setLineWidth(0.2);
            doc.roundedRect(marginX + 6, currentY, contentWidth - 8, memoBoxHeight, 1, 1, "FD");

            doc.setFontSize(isCompactPDF ? 6.5 : 7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(6, 95, 70); // emerald-800
            doc.text("Worked Solution & Marking Guideline:", marginX + 9, currentY + 3.2);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(6, 78, 59);
            doc.text(memoLines, marginX + 9, currentY + 6.5);

            currentY += memoBoxHeight + (isCompactPDF ? 2.5 : 4);
          } else {
            // Render Clean Dashed Workspace Lines
            const count = workspaceLines;
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.2);
            doc.setLineDashPattern([1.5, 1.5], 0);

            for (let l = 0; l < count; l++) {
              currentY += lineStep;
              doc.line(marginX + 8, currentY, pageWidth - marginX - 2, currentY);
            }
            doc.setLineDashPattern([], 0); // reset line pattern
            currentY += isCompactPDF ? 2.5 : 4;
          }
        }

        currentY += isCompactPDF ? 2 : 3;
      }

      // 5. Formula Sheet Attachment Page (if toggled)
      if (includeFormulaSheet) {
        doc.addPage();
        currentPage++;
        drawHeader(false);
        currentY = 16;

        doc.setFillColor(royalBlue[0], royalBlue[1], royalBlue[2]);
        doc.rect(marginX, currentY, contentWidth, 7, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text("INFORMATION SHEET / CORE FORMULA BOOKLET (CAPS & IEB)", marginX + 3, currentY + 5);

        doc.setFontSize(7.5);
        doc.setTextColor(245, 158, 11);
        doc.text("GRADES 10 - 12", pageWidth - marginX - 3, currentY + 5, { align: "right" });

        currentY += 10;

        const fCardW = (contentWidth - 4) / 2;
        const formulas = [
          { title: "1. Algebra & Logarithms", text: "x = (-b ± √(b² - 4ac)) / (2a)\nlog_a(x·y) = log_a(x) + log_a(y)\nlog_a(x/y) = log_a(x) - log_a(y)\nlog_a(x^k) = k·log_a(x)" },
          { title: "2. Sequences & Series", text: "Arithmetic: T_n = a + (n-1)d\nS_n = (n/2)[2a + (n-1)d] = (n/2)(a + l)\nGeometric: T_n = a·r^(n-1)\nS_n = a(r^n - 1)/(r - 1) | S_∞ = a/(1 - r)" },
          { title: "3. Financial Mathematics", text: "Simple: A = P(1 + in) | A = P(1 - in)\nCompound: A = P(1 + i)^n | A = P(1 - i)^n\nFuture Value: F = x[((1 + i)^n - 1) / i]\nPresent Value: P = x[(1 - (1 + i)^(-n)) / i]" },
          { title: "4. Differential Calculus", text: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h\nd/dx[x^n] = n·x^(n-1)\nd/dx[k] = 0\nd/dx[k·f(x)] = k·f'(x)" },
          { title: "5. Analytical Geometry", text: "Distance: d = √((x₂-x₁)² + (y₂-y₁)²)\nMidpoint: M = ((x₁+x₂)/2 ; (y₁+y₂)/2)\nGradient: m = (y₂-y₁)/(x₂-x₁) = tan θ\nCircle: (x-a)² + (y-b)² = r²" },
          { title: "6. Trigonometry & Identities", text: "Sine Rule: a/sin A = b/sin B = c/sin C\nCosine Rule: a² = b² + c² - 2bc cos A\nArea Rule: Area = (1/2)ab sin C\nsin(A±B) = sinA cosB ± cosA sinB" },
          { title: "7. Statistics & Probability", text: "Mean: x̄ = (∑x) / n\nStd Deviation: σ = √(∑(x - x̄)² / n)\nP(A ∪ B) = P(A) + P(B) - P(A ∩ B)\nP(A | B) = P(A ∩ B) / P(B)" }
        ];

        let cardCol = 0;
        let startRowY = currentY;

        formulas.forEach((item, fIdx) => {
          const cardX = marginX + (cardCol * (fCardW + 4));
          const fLines = doc.splitTextToSize(item.text, fCardW - 6);
          const cardH = (fLines.length * 3.6) + 9;

          doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
          doc.setDrawColor(slateDark[0], slateDark[1], slateDark[2]);
          doc.setLineWidth(0.2);
          doc.roundedRect(cardX, currentY, fCardW, cardH, 1, 1, "FD");

          doc.setFontSize(7.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.text(item.title, cardX + 3, currentY + 4.5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
          doc.text(fLines, cardX + 3, currentY + 8);

          if (cardCol === 0) {
            cardCol = 1;
          } else {
            cardCol = 0;
            currentY += cardH + 3.5;
          }
        });

        if (cardCol === 1) {
          currentY += 25;
        }
      }

      // 6. Answer Key Section (if toggled)
      if (showAnswerKey) {
        doc.addPage();
        currentPage++;
        drawHeader(false);
        currentY = 16;

        doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.rect(marginX, currentY, contentWidth, 7, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`OFFICIAL MEMORANDUM & MARKING GUIDELINE — ${worksheetTitle.toUpperCase()}`, marginX + 3, currentY + 5);

        currentY += 10;

        questions.forEach((q) => {
          if (currentY + 20 > pageHeight - 20) {
            doc.addPage();
            currentPage++;
            drawHeader(false);
            currentY = 16;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
          doc.text(`${q.questionNumber} — ${q.topic} [${q.totalMarks} Marks]`, marginX + 2, currentY + 4);
          doc.line(marginX + 2, currentY + 5, pageWidth - marginX - 2, currentY + 5);
          currentY += 8;

          q.subQuestions.forEach((sub) => {
            const ansLines = doc.splitTextToSize(`Ans: ${sub.memoAnswer}`, contentWidth - 14);
            const ansHeight = (ansLines.length * 3.8) + 6;

            if (currentY + ansHeight > pageHeight - 18) {
              doc.addPage();
              currentPage++;
              drawHeader(false);
              currentY = 16;
            }

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.2);
            doc.roundedRect(marginX + 4, currentY, contentWidth - 6, ansHeight, 1, 1, "FD");

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
            doc.text(`${sub.numberLabel} (${sub.marks} marks):`, marginX + 7, currentY + 4);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(6, 78, 59);
            doc.text(ansLines, marginX + 7, currentY + 8);

            currentY += ansHeight + 2.5;
          });

          currentY += 3;
        });
      }

      // 7. QR Verification Badge on last page
      if (showQrCode) {
        if (currentY + 18 > pageHeight - 18) {
          doc.addPage();
          currentPage++;
          drawHeader(false);
          currentY = 16;
        }

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(marginX, currentY, contentWidth, 14, 1.5, 1.5, "FD");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text("VERIFIED AMARIS ACADEMIC DOCUMENT", marginX + 4, currentY + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
        doc.text(`Official Solution Verification Ref: ${solutionId}`, marginX + 4, currentY + 9);
        doc.text(`Scan / Visit online portal for step-by-step video solution walkthrough: ${solutionUrl.slice(0, 75)}...`, marginX + 4, currentY + 12);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
        doc.text("AMH CERTIFIED", pageWidth - marginX - 4, currentY + 8, { align: "right" });
      }

      // 8. Footers Post-processing for accurate total page count
      const totalDocPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalDocPages; p++) {
        doc.setPage(p);
        drawFooter(p, totalDocPages);
      }

      // 9. Save PDF File
      const safeTitle = worksheetTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeGrade = grade.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`AMH_Worksheet_${safeGrade}_${safeTitle}.pdf`);

      setPdfDownloadedToast(true);
      setTimeout(() => setPdfDownloadedToast(false), 4500);
    } catch (err) {
      console.error("Error generating student worksheet PDF:", err);
      alert("Unable to generate PDF automatically. Falling back to browser print dialog.");
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden animate-fadeIn text-navy-900 dark:text-white">
      {/* DYNAMIC @PAGE CSS SIZE RULE FOR PRINT / SAVE AS PDF */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize === "A4" ? "a4 portrait" : "letter portrait"};
            margin: 12mm;
          }
        }
      `}</style>

      {/* --- TOP TOOLBAR HEADER --- */}
      <div className="w-full max-w-6xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                Worksheet Print Preview
              </span>
              <span className="text-xs font-mono text-navy-500 dark:text-navy-400 hidden md:inline">
                {paperSize === "A4" ? "A4 Portrait Format (210mm × 297mm)" : "US Letter Format (8.5in × 11in)"}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-navy-900 dark:text-white mt-0.5 truncate max-w-md">
              {worksheetTitle}
            </h2>
          </div>
        </div>

        {/* Center Interactive Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Spacing Density Mode Toggle: Standard View vs Compact View */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <span className="px-1.5 font-bold text-[10px] text-navy-500 dark:text-navy-400 uppercase flex items-center gap-1 shrink-0">
              <AlignJustify className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Spacing:</span>
            </span>
            {(["Standard", "Compact"] as const).map((mode) => (
              <button
                key={mode}
                id={`btn-spacing-${mode.toLowerCase()}`}
                onClick={() => setSpacingMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  spacingMode === mode
                    ? mode === "Compact"
                      ? "bg-amber-500 text-navy-950 border-amber-400 shadow-sm scale-105"
                      : "bg-navy-800 text-white border-gold-400/50 shadow-sm scale-105"
                    : "border-transparent text-navy-700 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-800"
                }`}
                title={
                  mode === "Compact"
                    ? "Compact View: Tightens CSS padding, gaps, and workspace line heights to fit more questions per page and save paper"
                    : "Standard View: Generous spacing and full workspace lines between questions"
                }
              >
                {mode === "Compact" ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{mode === "Compact" ? "Compact View" : "Standard View"}</span>
              </button>
            ))}
          </div>

          {/* Print Layout Mode Toggle (Standard vs Minimalist Ink Saver) */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <span className="px-1.5 font-bold text-[10px] text-navy-500 dark:text-navy-400 uppercase flex items-center gap-1 shrink-0">
              <Layout className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Print Layout:</span>
            </span>
            {(["Standard", "Minimalist"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPrintLayout(mode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  printLayout === mode
                    ? "bg-navy-800 text-white border-gold-400/50 shadow-sm scale-105"
                    : "border-transparent text-navy-700 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-800"
                }`}
                title={mode === "Minimalist" ? "Minimalist mode: Hides logo and contact info to save printer ink" : "Standard mode: Full branding and contact header"}
              >
                {mode === "Minimalist" ? "Minimalist (Ink-Saver)" : "Standard"}
              </button>
            ))}
          </div>

          {/* Paper Size Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <span className="px-1.5 font-bold text-[10px] text-navy-500 dark:text-navy-400 uppercase flex items-center gap-1 shrink-0">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Paper Size:</span>
            </span>
            <select
              id="select-paper-size"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as "A4" | "US Letter")}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-900 dark:text-white rounded-lg px-2 py-1 text-[11px] font-bold font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
              title="Toggle paper size format between A4 and US Letter"
            >
              <option value="A4">A4 (210×297mm)</option>
              <option value="US Letter">US Letter (8.5×11in)</option>
            </select>
          </div>

          {/* Worksheet Font Size Adjustment Slider (Small, Medium, Large) */}
          <div className="flex items-center gap-1.5 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <span className="px-1.5 font-bold text-[10px] text-navy-500 dark:text-navy-400 uppercase flex items-center gap-1 shrink-0">
              <Type className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Font Size:</span>
            </span>
            <div className="flex items-center gap-1.5 px-1">
              <input
                id="worksheet-font-size-slider"
                type="range"
                min="1"
                max="3"
                step="1"
                value={fontSize === "Small" ? 1 : fontSize === "Medium" ? 2 : 3}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val === 1) setFontSize("Small");
                  else if (val === 2) setFontSize("Medium");
                  else setFontSize("Large");
                }}
                className="w-16 sm:w-20 accent-amber-500 cursor-pointer h-1.5 bg-navy-200 dark:bg-navy-700 rounded-lg"
                title="Adjust worksheet font size (Small, Medium, Large) for visual impairment accessibility"
              />
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                fontSize === "Large"
                  ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                  : fontSize === "Small"
                  ? "bg-slate-200 dark:bg-navy-800 text-navy-700 dark:text-navy-300 border-navy-300 dark:border-navy-700"
                  : "bg-amber-500 text-navy-950 border-amber-400"
              }`}>
                {fontSize}
              </span>
            </div>
          </div>

          {/* Difficulty Level Header Selector Component */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <span className="px-2 font-bold text-[10px] text-navy-500 dark:text-navy-400 uppercase flex items-center gap-1 shrink-0">
              <Gauge className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Header Difficulty:</span>
            </span>
            {(["Beginner", "Intermediate", "Advanced", "All Levels"] as const).map((lvl) => {
              const isSelected = selectedDifficulty === lvl;
              let activeBg = "bg-royal-600 text-white border-royal-400";
              if (lvl === "Beginner") activeBg = "bg-emerald-600 text-white border-emerald-400";
              if (lvl === "Intermediate") activeBg = "bg-amber-600 text-white border-amber-400";
              if (lvl === "Advanced") activeBg = "bg-purple-600 text-white border-purple-400";
              if (lvl === "All Levels") activeBg = "bg-navy-800 text-white border-gold-400/50";

              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? `${activeBg} shadow-sm scale-105`
                      : "border-transparent text-navy-700 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-800"
                  }`}
                  title={`Set printed worksheet header difficulty level to ${lvl}`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* View Mode Selector (All Sheets, Single Page, 2-Page Spread) */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <span className="px-1.5 font-bold text-[10px] text-navy-500 dark:text-navy-400 uppercase flex items-center gap-1 shrink-0">
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">View Mode:</span>
            </span>
            <button
              onClick={() => setViewMode("all")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "all"
                  ? "bg-royal-600 text-white border-royal-400 shadow-sm"
                  : "border-transparent text-navy-700 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-800"
              }`}
              title="View all A4 pages continuous with realistic page break indicators"
            >
              <Layers className="w-3 h-3" />
              <span>All Sheets</span>
            </button>
            <button
              onClick={() => setViewMode("single")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "single"
                  ? "bg-royal-600 text-white border-royal-400 shadow-sm"
                  : "border-transparent text-navy-700 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-800"
              }`}
              title="Focus on single A4 sheet at a time"
            >
              <FileText className="w-3 h-3" />
              <span>Single</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 hidden md:flex ${
                viewMode === "grid"
                  ? "bg-royal-600 text-white border-royal-400 shadow-sm"
                  : "border-transparent text-navy-700 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-800"
              }`}
              title="Side-by-side 2-Page booklet spread"
            >
              <Columns className="w-3 h-3" />
              <span>Spread</span>
            </button>
          </div>

          {/* Margins Preset Selector & Margin Guide Toggle */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <span className="px-1.5 font-bold text-[10px] text-navy-500 dark:text-navy-400 uppercase flex items-center gap-1 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Margins:</span>
            </span>
            <select
              value={marginPreset}
              onChange={(e) => setMarginPreset(e.target.value as "narrow" | "standard" | "wide")}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-900 dark:text-white rounded-lg px-2 py-1 text-[11px] font-bold font-mono cursor-pointer focus:outline-none"
              title="Select print margin padding"
            >
              <option value="narrow">Narrow (10mm)</option>
              <option value="standard">Standard (18mm)</option>
              <option value="wide">Wide (25mm)</option>
            </select>
            <button
              onClick={() => setShowMarginGuides(!showMarginGuides)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                showMarginGuides
                  ? "bg-cyan-600 text-white border-cyan-400 shadow-sm"
                  : "bg-navy-200 dark:bg-navy-800 text-navy-700 dark:text-navy-300 border-navy-300 dark:border-navy-700 hover:border-cyan-500"
              }`}
              title="Show dotted print margin boundary lines on canvas"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Guides: {showMarginGuides ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(40, prev - 15))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-bold text-[11px] min-w-[45px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(150, prev + 15))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-1.5 py-1 rounded-lg hover:bg-white dark:hover:bg-navy-800 text-[10px] font-bold text-amber-600 dark:text-amber-400 cursor-pointer"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
            <button
              onClick={() => setZoomLevel(75)}
              className="px-1.5 py-1 rounded-lg hover:bg-white dark:hover:bg-navy-800 text-[10px] font-bold text-navy-600 dark:text-navy-300 cursor-pointer"
              title="Fit Page (75%)"
            >
              Fit
            </button>
          </div>

          {/* Toggle Answer Key Section Checkbox */}
          <label 
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 select-none ${
              showAnswerKey
                ? "bg-emerald-600 text-white border-emerald-400 shadow-sm"
                : "bg-navy-100 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-emerald-500"
            }`}
            title="Toggle display of an Answer Key section at the end of the printed worksheet"
          >
            <input
              type="checkbox"
              id="toggle-answer-key-checkbox"
              checked={showAnswerKey}
              onChange={(e) => setShowAnswerKey(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
            />
            <span>{showAnswerKey ? "Answer Key: ON" : "Answer Key: OFF"}</span>
          </label>

          {/* Toggle Memo Answers */}
          <button
            onClick={() => setShowMemo(!showMemo)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showMemo
                ? "bg-emerald-500 text-white border-emerald-400 shadow-sm"
                : "bg-navy-100 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-emerald-500"
            }`}
          >
            {showMemo ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>{showMemo ? "Memo Answers: ON" : "Memo Answers: OFF"}</span>
          </button>

          {/* Toggle Student Fill-in Box */}
          <button
            onClick={() => setShowStudentDetails(!showStudentDetails)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 hidden sm:flex ${
              showStudentDetails
                ? "bg-amber-500 text-navy-950 border-amber-400 shadow-sm"
                : "bg-navy-100 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300"
            }`}
          >
            {showStudentDetails ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>Student Box</span>
          </button>

          {/* Toggle Formula Sheet Page */}
          <button
            onClick={() => setIncludeFormulaSheet(!includeFormulaSheet)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              includeFormulaSheet
                ? "bg-royal-600 text-white border-royal-400 shadow-sm"
                : "bg-navy-100 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-royal-500"
            }`}
            title="Toggle CAPS & IEB Core Mathematics Formula Sheet attachment"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{includeFormulaSheet ? "Formula Sheet: ON" : "+ Formula Sheet"}</span>
          </button>

          {/* Toggle QR Code Solution Link */}
          <button
            onClick={() => setShowQrCode(!showQrCode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showQrCode
                ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                : "bg-navy-100 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-purple-500"
            }`}
            title="Toggle unique QR code solution link on the printed worksheet"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQrCode ? "Solution QR: ON" : "Solution QR: OFF"}</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Setup Guide Tooltip Trigger & Popover */}
          <div className="relative">
            <button
              id="btn-quick-setup-guide"
              onClick={() => setShowQuickSetupGuide(!showQuickSetupGuide)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showQuickSetupGuide
                  ? "bg-amber-500 text-navy-950 border-amber-400 shadow-md ring-2 ring-amber-400/40"
                  : "bg-navy-100 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
              }`}
              title="Open Quick Setup printer settings guide (Scale 100%, Disable headers/footers, Enable backgrounds)"
              aria-expanded={showQuickSetupGuide}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Quick Setup</span>
              <span className="inline sm:hidden">Setup</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>

            {/* Quick Setup Guide Tooltip & Popover Panel */}
            {showQuickSetupGuide && (
              <div 
                id="quick-setup-guide-popover"
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[90vw] bg-navy-900 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl z-50 text-white text-xs font-sans animate-fadeIn"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-navy-700/80 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white font-display flex items-center gap-1.5">
                        Quick Setup Guide
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500 text-navy-950 font-bold uppercase">
                          Printer Tips
                        </span>
                      </h4>
                      <p className="text-[10.5px] text-navy-300 font-mono">
                        Optimal browser settings for clean A4 math worksheets
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuickSetupGuide(false)}
                    className="p-1 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
                    title="Close Setup Guide"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Settings Checklist */}
                <div className="space-y-2.5 font-mono text-[11px]">
                  {/* Scale to 100% */}
                  <div className="p-2.5 rounded-xl bg-navy-950/80 border border-amber-500/30 flex items-start gap-2.5">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 text-xs">
                        1. Set Scale to 100%
                      </div>
                      <p className="text-[10px] text-navy-300 font-sans mt-0.5 leading-snug">
                        Do <strong>NOT</strong> choose <em>"Fit to printable area"</em> or <em>"Shrink to fit"</em>. Keeping scale at 100% preserves exact millimeter margins and formula sizes.
                      </p>
                    </div>
                  </div>

                  {/* Disable Headers and Footers */}
                  <div className="p-2.5 rounded-xl bg-navy-950/80 border border-amber-500/30 flex items-start gap-2.5">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 text-xs">
                        2. Disable Headers and Footers
                      </div>
                      <p className="text-[10px] text-navy-300 font-sans mt-0.5 leading-snug">
                        Uncheck <strong>"Headers and footers"</strong> to prevent browser URLs, timestamps, and page titles from printing over the worksheet.
                      </p>
                    </div>
                  </div>

                  {/* Enable Background Graphics */}
                  <div className="p-2.5 rounded-xl bg-navy-950/80 border border-amber-500/30 flex items-start gap-2.5">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 text-xs">
                        3. Enable Background Graphics
                      </div>
                      <p className="text-[10px] text-navy-300 font-sans mt-0.5 leading-snug">
                        Check <strong>"Background graphics"</strong> so colored subject tags, difficulty badges, and formula borders print crisp.
                      </p>
                    </div>
                  </div>

                  {/* Paper Size & Margins */}
                  <div className="p-2.5 rounded-xl bg-navy-950/80 border border-amber-500/30 flex items-start gap-2.5">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 text-xs">
                        4. Paper Size: A4 & Margins: Default
                      </div>
                      <p className="text-[10px] text-navy-300 font-sans mt-0.5 leading-snug">
                        Ensure paper size is set to <strong>A4</strong> (210×297mm) with Margins set to <strong>Default</strong> or <strong>None</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Standard vs Compact View */}
                  <div className="p-2.5 rounded-xl bg-navy-950/80 border border-amber-500/30 flex items-start gap-2.5">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                      <AlignJustify className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 text-xs">
                        5. Standard vs Compact View
                      </div>
                      <p className="text-[10px] text-navy-300 font-sans mt-0.5 leading-snug">
                        Use <strong>Compact View</strong> to compress workspace padding and line gaps, fitting more questions per printed sheet.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Browser Quick Reference Hint */}
                <div className="mt-3 p-2 rounded-lg bg-navy-800/80 border border-navy-700 text-[10px] text-navy-300 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1 font-mono">
                    <Info className="w-3 h-3" />
                    <span>In Chrome / Edge / Safari Print Dialog:</span>
                  </div>
                  <p className="leading-tight">
                    Click <strong>More settings</strong> ➜ Uncheck <em>Headers/Footers</em> ➜ Check <em>Background graphics</em> ➜ Set Scale to <em>100%</em>.
                  </p>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-3.5 pt-2.5 border-t border-navy-700/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setShowQuickSetupGuide(false)}
                    className="px-3 py-1.5 rounded-lg border border-navy-700 text-navy-300 hover:text-white hover:bg-navy-800 text-xs font-mono font-bold cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickSetupGuide(false);
                      handleTriggerPrint();
                    }}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 text-xs font-mono font-black flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Worksheet</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            id="btn-download-worksheet-pdf-top"
            onClick={handleDownloadProgrammaticPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-mono font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            title="Download clean, publication-ready PDF worksheet with proper page breaks directly"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-200" />
                <span>Download as PDF</span>
              </>
            )}
          </button>

          <DownloadWorksheetPDFButton
            id="btn-save-pdf-browser-top"
            targetSelector="#worksheet-printable-area"
            worksheetTitle={worksheetTitle}
            grade={grade}
            subject={subject}
            variant="outline"
            size="md"
            label="Browser Print PDF"
            showHelpTooltip={true}
          />

          <button
            id="btn-close-print-preview-top"
            onClick={onClose}
            className="p-2 rounded-xl border border-navy-200 dark:border-navy-800 text-navy-500 hover:text-navy-900 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
            title="Close Print Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Downloaded Success Toast */}
      {pdfDownloadedToast && (
        <div className="w-full max-w-6xl mt-2 p-3 bg-emerald-600 text-white rounded-xl text-xs font-mono flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>Success! Worksheet PDF downloaded with clean page breaks, math formula sheet & official Amaris seal.</span>
          </div>
          <button
            onClick={() => setPdfDownloadedToast(false)}
            className="text-emerald-100 hover:text-white font-bold text-xs cursor-pointer px-2 py-0.5 rounded hover:bg-emerald-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PDF Save Instruction Hint Banner */}
      {pdfHint && (
        <div className="w-full max-w-6xl mt-2 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Tip:</strong> In the browser print dialog, select <strong>"Save as PDF"</strong> under the Destination option to download your custom worksheet.
            </span>
          </div>
          <button
            onClick={() => setPdfHint(false)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white font-bold text-xs cursor-pointer px-2 py-0.5 rounded hover:bg-emerald-500/20"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* --- LIVE PRINT SPECIFICATION & VALIDATION BANNER --- */}
      <div className="w-full max-w-6xl mt-1 px-3 py-1.5 bg-navy-900/60 border border-navy-800/80 rounded-xl text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-navy-300">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Page Breaks: Verified (Clean Section Separation)</span>
          </span>
          <span className="text-navy-600 dark:text-navy-500">|</span>
          <span className="text-navy-300">
            Paper: <strong className="text-white">{paperSize} ({paperSize === "A4" ? "210 × 297 mm" : "8.5 × 11 in"})</strong>
          </span>
          <span className="text-navy-600 dark:text-navy-500">|</span>
          <span className="text-navy-300">
            Scale: <strong className="text-amber-400">{zoomLevel}%</strong>
          </span>
          <span className="text-navy-600 dark:text-navy-500">|</span>
          <span className="text-navy-300">
            Spacing: <strong className={spacingMode === "Compact" ? "text-amber-400" : "text-white"}>{spacingMode} View</strong>
          </span>
          <span className="text-navy-600 dark:text-navy-500">|</span>
          <span className="text-navy-300">
            Print Margins: <strong className="text-cyan-400">{marginPreset === "narrow" ? "10mm Narrow" : marginPreset === "wide" ? "25mm Wide" : "18mm Standard"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-quick-setup-guide-banner"
            onClick={() => setShowQuickSetupGuide(true)}
            className="flex items-center gap-1 text-[10.5px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
            title="View Recommended Printer Settings Guide (Scale 100%, Disable headers/footers, Backgrounds on)"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Quick Setup Guide</span>
          </button>
          <span className="text-amber-400 font-bold">Total Sheets: {totalPages}</span>
        </div>
      </div>

      {/* --- RENDERED A4 WORKSHEET CANVAS PREVIEW STAGE --- */}
      <div className="flex-1 w-full max-w-6xl my-2 overflow-y-auto overflow-x-auto flex flex-col items-center justify-start p-2 sm:p-4 scrollbar-thin">
        {/* CONTAINER SCALED BY ZOOM LEVEL */}
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out"
          }}
          className={`flex flex-col items-center gap-6 ${viewMode === "grid" ? "md:grid md:grid-cols-2 md:gap-8 md:items-start" : ""}`}
        >
          {/* ================= PAGE 1: EXAM COVER & PART 1 QUESTIONS ================= */}
          {(viewMode === "all" || (viewMode === "single" && activePage === 1) || (viewMode === "grid" && (activePage === 1 || activePage === 2))) && (
            <div
              style={{
                fontSize: fontSize === "Small" ? "11.5px" : fontSize === "Large" ? "15.5px" : "13px"
              }}
              className={`${paperSize === "A4" ? "w-[210mm] min-h-[297mm]" : "w-[215.9mm] min-h-[279.4mm]"} ${
                marginPreset === "narrow" ? "p-[10mm]" : marginPreset === "wide" ? "p-[25mm]" : "p-[18mm]"
              } bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10 rounded-sm font-sans relative flex flex-col justify-between ${
                spacingMode === "Compact" ? "compact-view-worksheet worksheet-compact-mode" : "standard-view-worksheet"
              }`}
            >
              {/* Optional Visual Margin Safety Boundary Overlay */}
              {showMarginGuides && (
                <div
                  className={`absolute pointer-events-none border-2 border-dashed border-cyan-500/70 z-20 ${
                    marginPreset === "narrow" ? "inset-[10mm]" : marginPreset === "wide" ? "inset-[25mm]" : "inset-[18mm]"
                  }`}
                >
                  <div className="absolute -top-3 left-3 bg-cyan-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                    Print Safety Margin ({marginPreset === "narrow" ? "10mm" : marginPreset === "wide" ? "25mm" : "18mm"})
                  </div>
                </div>
              )}

              {/* SHEET 1 CONTENT */}
              <div className={spacingMode === "Compact" ? "space-y-3" : "space-y-5"}>
                {/* PAPER HEADER BANNER */}
                <div className={`border-b-2 border-slate-900 worksheet-header-box ${spacingMode === "Compact" ? "pb-2 space-y-1.5" : "pb-3 space-y-2.5"}`}>
                  {printLayout === "Standard" ? (
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-black text-xl tracking-tight text-slate-900">
                            AMARIS MATHEMATICS HUB
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                            {paperSize}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            CAPS / IEB
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold border uppercase ${
                            selectedDifficulty === "Beginner"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : selectedDifficulty === "Intermediate"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : selectedDifficulty === "Advanced"
                              ? "bg-purple-100 text-purple-900 border-purple-300"
                              : "bg-blue-100 text-blue-900 border-blue-300"
                          }`}>
                            LEVEL: {selectedDifficulty}
                          </span>
                          {spacingMode === "Compact" && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-200 text-navy-950 border border-amber-400 uppercase">
                              COMPACT VIEW
                            </span>
                          )}
                          {fontSize !== "Medium" && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300 uppercase">
                              FONT: {fontSize}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider mt-0.5">
                          Official South African High School Mathematics Worksheet
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono">
                          NSC CAPS & IEB Curriculum Standard | www.amarismathematics.co.za
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs space-y-0.5">
                        <div className="font-bold text-slate-900">{grade}</div>
                        <div className="text-amber-900 font-bold">{subject}</div>
                        <div className="text-[10px] text-slate-600">Date: {currentDate}</div>
                      </div>
                    </div>
                  ) : (
                    /* MINIMALIST INK-SAVER HEADER */
                    <div className="flex justify-between items-center font-mono py-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-tight">
                            {worksheetTitle}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            MINIMALIST (INK-SAVER)
                          </span>
                          {spacingMode === "Compact" && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-200 text-navy-950 border border-amber-400">
                              COMPACT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-slate-800">{grade} • {subject}</span>
                          <span>•</span>
                          <span className="uppercase font-bold">LEVEL: {selectedDifficulty}</span>
                          <span>•</span>
                          <span>FORMAT: {paperSize}</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-700 font-mono">
                        <div>Date: {currentDate}</div>
                      </div>
                    </div>
                  )}

                  {/* WORKSHEET METRICS ROW */}
                  <div className="grid grid-cols-4 gap-2 border-t border-b border-slate-300 py-1 text-center text-xs font-mono">
                    <div className="border-r border-slate-300">
                      <span className="text-slate-500 uppercase text-[8.5px] block">TOTAL MARKS</span>
                      <span className="font-bold text-slate-900 text-xs">{totalMarks} Marks</span>
                    </div>
                    <div className="border-r border-slate-300">
                      <span className="text-slate-500 uppercase text-[8.5px] block">TIME ALLOCATION</span>
                      <span className="font-bold text-slate-900 text-xs">{timeAllowed}</span>
                    </div>
                    <div className="border-r border-slate-300">
                      <span className="text-slate-500 uppercase text-[8.5px] block">DIFFICULTY LEVEL</span>
                      <span className="font-bold text-slate-900 text-xs uppercase">{selectedDifficulty}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[8.5px] block">INSTRUCTIONS</span>
                      <span className="font-bold text-slate-900 text-[10px]">Show ALL Working</span>
                    </div>
                  </div>
                </div>

                {/* OPTIONAL STUDENT DETAILS BOX */}
                {showStudentDetails && (
                  <div className={`border border-slate-400 rounded-md bg-slate-50/70 text-xs font-mono worksheet-student-box ${
                    spacingMode === "Compact" ? "p-2 space-y-1" : "p-3 space-y-1.5"
                  }`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-600 font-bold">STUDENT NAME: </span>
                        <span className="font-bold text-slate-900 border-b border-dotted border-slate-700 pb-0.5 px-2">
                          {studentName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-bold">GRADE & CLASS: </span>
                        <span className="font-bold text-slate-900 border-b border-dotted border-slate-700 pb-0.5 px-2">
                          {grade}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-0.5">
                      <div>
                        <span className="text-slate-600 font-bold">HIGH SCHOOL: </span>
                        <span className="text-slate-800 border-b border-dotted border-slate-700 pb-0.5 px-2">
                          {schoolName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-bold">EXAM NO / ID: </span>
                        <span className="text-slate-800 border-b border-dotted border-slate-700 pb-0.5 px-2">
                          AMH-EXAM
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* GENERAL INSTRUCTIONS BOX */}
                <div className={`bg-amber-50/60 border-l-4 border-amber-600 rounded-r-md text-[10.5px] font-sans text-slate-800 worksheet-instructions-box ${
                  spacingMode === "Compact" ? "p-2 space-y-0.5" : "p-2.5 space-y-1"
                }`}>
                  <span className="font-mono font-bold uppercase text-amber-900 text-[9px] block">
                    INSTRUCTIONS AND INFORMATION:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                    <li>Answer ALL questions in the spaces provided or on clean folio paper.</li>
                    <li>Show ALL calculations, diagrams, and formulas used in determining your answers.</li>
                    {spacingMode !== "Compact" && (
                      <li>An approved non-programmable scientific calculator may be used where applicable.</li>
                    )}
                  </ul>
                </div>

                {/* PAGE 1 QUESTIONS (Supports 2 in Standard, up to 3+ in Compact View) */}
                <div className={spacingMode === "Compact" ? "space-y-2.5 pt-0.5" : "space-y-4 pt-1"}>
                  {page1Questions.map((q) => (
                    <div key={q.id} className={`worksheet-question-card ${spacingMode === "Compact" ? "space-y-1.5" : "space-y-2.5"}`}>
                      <div className="flex justify-between items-center border-b-2 border-slate-800 pb-1 font-serif worksheet-question-header">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-sm font-black text-slate-900 font-mono tracking-tight">
                            {q.questionNumber}
                          </h3>
                          <span className="text-xs font-bold text-amber-900 font-mono">
                            [{q.topic}]
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900 worksheet-marks-tag">
                          [{q.totalMarks} MARKS]
                        </span>
                      </div>

                      {q.instructionText && (
                        <p className="text-[10.5px] italic text-slate-600 font-sans">
                          {q.instructionText}
                        </p>
                      )}

                      <div className={`pl-2 ${spacingMode === "Compact" ? "space-y-1.5" : "space-y-3"}`}>
                        {q.subQuestions.map((sub, sIdx) => (
                          <div key={sIdx} className="worksheet-subquestion space-y-1 text-xs">
                            <div className="flex justify-between items-start font-sans">
                              <div className="flex items-start gap-2 pr-4">
                                <span className="font-mono font-bold text-slate-900 shrink-0">
                                  {sub.numberLabel}
                                </span>
                                <span className="text-slate-900 leading-relaxed font-medium whitespace-pre-line text-[11.5px]">
                                  {sub.statement}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-slate-700 shrink-0 worksheet-marks-tag">
                                ({sub.marks})
                              </span>
                            </div>

                            {showMemo ? (
                              <div className="worksheet-memo-box p-2 rounded bg-emerald-50 border border-emerald-300 text-[10.5px] font-mono text-emerald-950 space-y-0.5">
                                <div className="flex justify-between items-center text-[9px] font-bold text-emerald-800 uppercase">
                                  <span>Memorandum Solution</span>
                                  <span>({sub.marks} Marks)</span>
                                </div>
                                <div className="whitespace-pre-line leading-normal">
                                  {sub.memoAnswer}
                                </div>
                              </div>
                            ) : (
                              <div className={`space-y-1 pl-5 ${spacingMode === "Compact" ? "pt-0.5" : "pt-1"}`}>
                                {Array.from({ 
                                  length: spacingMode === "Compact" 
                                    ? Math.max(2, (sub.workSpaceLines || 3) - 2) 
                                    : (sub.workSpaceLines || 3) 
                                }).map((_, lineIdx) => (
                                  <div
                                    key={lineIdx}
                                    className={`worksheet-workspace-line border-b border-dashed border-slate-300 w-full ${
                                      spacingMode === "Compact" ? "h-3.5" : "h-4.5"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAGE 1 FOOTER */}
              <div className="border-t border-slate-300 pt-2.5 mt-6 flex justify-between items-center text-[9.5px] font-mono text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">Amaris Mathematics Hub</span> — High School Academic Worksheet
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-900">Page 1 of {totalPages}</span> | Directorial Seal of Academic Quality
                </div>
              </div>
            </div>
          )}

          {/* PAGE BREAK DIVIDER (BETWEEN PAGE 1 AND PAGE 2) IN ALL-PAGES VIEW */}
          {viewMode === "all" && (
            <div className="w-full max-w-2xl my-3 flex items-center justify-center gap-3 text-xs font-mono text-amber-500/90 select-none">
              <div className="h-px bg-dashed border-b border-amber-500/40 flex-1" />
              <div className="px-3.5 py-1.5 rounded-full bg-navy-900 border border-amber-500/50 shadow-lg flex items-center gap-2 text-white text-[11px] font-bold">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>PAGE BREAK ({paperSize}) • End of Sheet 1 / Start of Sheet 2</span>
              </div>
              <div className="h-px bg-dashed border-b border-amber-500/40 flex-1" />
            </div>
          )}

          {/* ================= PAGE 2: EXTENDED QUESTIONS & SOLUTION QR ================= */}
          {(viewMode === "all" || (viewMode === "single" && activePage === 2) || (viewMode === "grid" && (activePage === 1 || activePage === 2))) && (
            <div
              style={{
                fontSize: fontSize === "Small" ? "11.5px" : fontSize === "Large" ? "15.5px" : "13px"
              }}
              className={`${paperSize === "A4" ? "w-[210mm] min-h-[297mm]" : "w-[215.9mm] min-h-[279.4mm]"} ${
                marginPreset === "narrow" ? "p-[10mm]" : marginPreset === "wide" ? "p-[25mm]" : "p-[18mm]"
              } bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10 rounded-sm font-sans relative flex flex-col justify-between ${
                spacingMode === "Compact" ? "compact-view-worksheet worksheet-compact-mode" : "standard-view-worksheet"
              }`}
            >
              {/* Optional Visual Margin Safety Boundary Overlay */}
              {showMarginGuides && (
                <div
                  className={`absolute pointer-events-none border-2 border-dashed border-cyan-500/70 z-20 ${
                    marginPreset === "narrow" ? "inset-[10mm]" : marginPreset === "wide" ? "inset-[25mm]" : "inset-[18mm]"
                  }`}
                >
                  <div className="absolute -top-3 left-3 bg-cyan-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                    Print Safety Margin ({marginPreset === "narrow" ? "10mm" : marginPreset === "wide" ? "25mm" : "18mm"})
                  </div>
                </div>
              )}

              {/* SHEET 2 CONTENT */}
              <div className={spacingMode === "Compact" ? "space-y-3" : "space-y-5"}>
                {/* RUNNING HEADER */}
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 font-mono text-xs worksheet-header-box">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 uppercase">AMARIS MATHEMATICS HUB</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-amber-900 font-bold">{worksheetTitle}</span>
                    {spacingMode === "Compact" && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                        Compact
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 font-bold text-[10px]">
                    {grade} — Page 2 of {totalPages}
                  </div>
                </div>

                {/* PAGE 2 QUESTIONS (Remainder of questions) */}
                {page2Questions.length > 0 ? (
                  <div className={spacingMode === "Compact" ? "space-y-2.5 pt-0.5" : "space-y-4 pt-1"}>
                    {page2Questions.map((q) => (
                      <div key={q.id} className={`worksheet-question-card ${spacingMode === "Compact" ? "space-y-1.5" : "space-y-2.5"}`}>
                        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-1 font-serif worksheet-question-header">
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-sm font-black text-slate-900 font-mono tracking-tight">
                              {q.questionNumber}
                            </h3>
                            <span className="text-xs font-bold text-amber-900 font-mono">
                              [{q.topic}]
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-900 worksheet-marks-tag">
                            [{q.totalMarks} MARKS]
                          </span>
                        </div>

                        {q.instructionText && (
                          <p className="text-[10.5px] italic text-slate-600 font-sans">
                            {q.instructionText}
                          </p>
                        )}

                        <div className={`pl-2 ${spacingMode === "Compact" ? "space-y-1.5" : "space-y-3"}`}>
                          {q.subQuestions.map((sub, sIdx) => (
                            <div key={sIdx} className="worksheet-subquestion space-y-1 text-xs">
                              <div className="flex justify-between items-start font-sans">
                                <div className="flex items-start gap-2 pr-4">
                                  <span className="font-mono font-bold text-slate-900 shrink-0">
                                    {sub.numberLabel}
                                  </span>
                                  <span className="text-slate-900 leading-relaxed font-medium whitespace-pre-line text-[11.5px]">
                                    {sub.statement}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-slate-700 shrink-0 worksheet-marks-tag">
                                  ({sub.marks})
                                </span>
                              </div>

                              {showMemo ? (
                                <div className="worksheet-memo-box p-2 rounded bg-emerald-50 border border-emerald-300 text-[10.5px] font-mono text-emerald-950 space-y-0.5">
                                  <div className="flex justify-between items-center text-[9px] font-bold text-emerald-800 uppercase">
                                    <span>Memorandum Solution</span>
                                    <span>({sub.marks} Marks)</span>
                                  </div>
                                  <div className="whitespace-pre-line leading-normal">
                                    {sub.memoAnswer}
                                  </div>
                                </div>
                              ) : (
                                <div className={`space-y-1 pl-5 ${spacingMode === "Compact" ? "pt-0.5" : "pt-1"}`}>
                                  {Array.from({ 
                                    length: spacingMode === "Compact" 
                                      ? Math.max(2, (sub.workSpaceLines || 3) - 2) 
                                      : (sub.workSpaceLines || 3) 
                                  }).map((_, lineIdx) => (
                                    <div
                                      key={lineIdx}
                                      className={`worksheet-workspace-line border-b border-dashed border-slate-300 w-full ${
                                        spacingMode === "Compact" ? "h-3.5" : "h-4.5"
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center space-y-2 my-2">
                    <div className="font-mono font-bold text-slate-800 text-xs">
                      STUDENT SCRATCHPAD & ROUGH WORK
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans max-w-md mx-auto">
                      All worksheet questions fitted compactly onto Sheet 1. Use the workspace below for calculations and geometric drafts.
                    </p>
                    <div className="pt-2 space-y-2 pl-2 pr-2">
                      {Array.from({ length: 6 }).map((_, lineIdx) => (
                        <div key={lineIdx} className="border-b border-dashed border-slate-300 h-5 w-full" />
                      ))}
                    </div>
                  </div>
                )}

                {/* UNIQUE WORKSHEET QR CODE SOLUTION WALKTHROUGH BADGE */}
                {showQrCode && (
                  <div className="mt-4 pt-3 border-t border-slate-300">
                    <QRGenerator
                      id="worksheet-preview-qr-generator"
                      problemId={solutionId}
                      problemTitle={worksheetTitle}
                      grade={grade}
                      topic={subject}
                      curriculum="CAPS"
                      videoUrl={solutionUrl}
                      videoDuration="6:30 mins"
                      tutorName="Bethuel Moukangwe (Head Mathematics Tutor)"
                      marks={totalWorksheetMarks}
                      displayMode="badge"
                      allowDirectPlay={true}
                      allowCopy={true}
                      allowDownload={true}
                    />
                  </div>
                )}
              </div>

              {/* PAGE 2 FOOTER */}
              <div className="border-t border-slate-300 pt-2.5 mt-6 flex justify-between items-center text-[9.5px] font-mono text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">Amaris Mathematics Hub</span> — High School Academic Worksheet
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-900">Page 2 of {totalPages}</span> | Directorial Seal of Academic Quality
                </div>
              </div>
            </div>
          )}

          {/* PAGE BREAK DIVIDER (BEFORE FORMULA SHEET) IN ALL-PAGES VIEW */}
          {viewMode === "all" && includeFormulaSheet && (
            <div className="w-full max-w-2xl my-3 flex items-center justify-center gap-3 text-xs font-mono text-amber-500/90 select-none">
              <div className="h-px bg-dashed border-b border-amber-500/40 flex-1" />
              <div className="px-3.5 py-1.5 rounded-full bg-navy-900 border border-amber-500/50 shadow-lg flex items-center gap-2 text-white text-[11px] font-bold">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>PAGE BREAK ({paperSize}) • Formula Booklet Sheet Attachment</span>
              </div>
              <div className="h-px bg-dashed border-b border-amber-500/40 flex-1" />
            </div>
          )}

          {/* ================= PAGE 3: CAPS & IEB FORMULA BOOKLET ================= */}
          {includeFormulaSheet && (viewMode === "all" || (viewMode === "single" && activePage === 3) || (viewMode === "grid" && activePage >= 3)) && (
            <div
              style={{
                fontSize: fontSize === "Small" ? "11px" : fontSize === "Large" ? "14px" : "12px"
              }}
              className={`${paperSize === "A4" ? "w-[210mm] min-h-[297mm]" : "w-[215.9mm] min-h-[279.4mm]"} ${
                marginPreset === "narrow" ? "p-[10mm]" : marginPreset === "wide" ? "p-[25mm]" : "p-[18mm]"
              } bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10 rounded-sm font-sans relative flex flex-col justify-between`}
            >
              {/* Optional Visual Margin Safety Boundary Overlay */}
              {showMarginGuides && (
                <div
                  className={`absolute pointer-events-none border-2 border-dashed border-cyan-500/70 z-20 ${
                    marginPreset === "narrow" ? "inset-[10mm]" : marginPreset === "wide" ? "inset-[25mm]" : "inset-[18mm]"
                  }`}
                >
                  <div className="absolute -top-3 left-3 bg-cyan-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                    Print Safety Margin ({marginPreset === "narrow" ? "10mm" : marginPreset === "wide" ? "25mm" : "18mm"})
                  </div>
                </div>
              )}

              {/* FORMULA SHEET CONTENT */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2 font-serif">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      INFORMATION SHEET / CORE FORMULA BOOKLET
                    </h3>
                    <p className="text-[9.5px] text-slate-600 font-mono">
                      Official South African CAPS & IEB High School Mathematics Standard (Grades 10–12)
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded uppercase">
                    NSC CAPS & IEB MATHS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-800">
                  {/* Column 1 Formulas */}
                  <div className="space-y-2.5">
                    <div className="border border-slate-300 rounded p-2 bg-slate-50">
                      <div className="font-bold text-slate-900 mb-1 border-b pb-0.5 text-[10.5px]">1. Algebra & Logarithms</div>
                      <div className="font-semibold text-slate-900">x = (-b ± √(b² - 4ac)) / 2a</div>
                      <div className="text-[9.5px] text-slate-700 mt-1">log_a(xy) = log_a x + log_a y</div>
                      <div className="text-[9.5px] text-slate-700">log_a(x/y) = log_a x - log_a y</div>
                      <div className="text-[9.5px] text-slate-700">log_a(x^b) = b • log_a x</div>
                    </div>

                    <div className="border border-slate-300 rounded p-2 bg-slate-50">
                      <div className="font-bold text-slate-900 mb-1 border-b pb-0.5 text-[10.5px]">2. Sequences & Series</div>
                      <div>T_n = a + (n - 1)d</div>
                      <div>S_n = n/2 [2a + (n - 1)d] = n/2 (a + l)</div>
                      <div>T_n = a • r^(n-1)</div>
                      <div>S_n = a(r^n - 1) / (r - 1)  (r ≠ 1)</div>
                      <div>S_∞ = a / (1 - r)  (-1 &lt; r &lt; 1)</div>
                    </div>

                    <div className="border border-slate-300 rounded p-2 bg-slate-50">
                      <div className="font-bold text-slate-900 mb-1 border-b pb-0.5 text-[10.5px]">3. Financial Mathematics</div>
                      <div>A = P(1 + i•n)  |  A = P(1 - i•n)</div>
                      <div>A = P(1 + i)^n  |  A = P(1 - i)^n</div>
                      <div>F = x[(1 + i)^n - 1] / i  (Future Value)</div>
                      <div>P = x[1 - (1 + i)^(-n)] / i  (Present Value)</div>
                      <div>1 + i = (1 + i^(m)/m)^m  (Nominal vs Effective)</div>
                    </div>

                    <div className="border border-slate-300 rounded p-2 bg-slate-50">
                      <div className="font-bold text-slate-900 mb-1 border-b pb-0.5 text-[10.5px]">4. Functions & Calculus</div>
                      <div>{"f'(x) = lim_{h→0} [f(x + h) - f(x)] / h"}</div>
                      <div>d/dx [x^n] = n • x^(n-1)</div>
                      <div>Parabola Symmetry Axis: x = -b / (2a)</div>
                    </div>
                  </div>

                  {/* Column 2 Formulas */}
                  <div className="space-y-2.5">
                    <div className="border border-slate-300 rounded p-2 bg-slate-50">
                      <div className="font-bold text-slate-900 mb-1 border-b pb-0.5 text-[10.5px]">5. Analytical Geometry</div>
                      <div>d = √((x₂ - x₁)² + (y₂ - y₁)²)</div>
                      <div>M = ((x₁ + x₂)/2 ; (y₁ + y₂)/2)</div>
                      <div>y - y₁ = m(x - x₁)  |  m = (y₂ - y₁)/(x₂ - x₁)</div>
                      <div>m = tan θ  (Angle of Inclination)</div>
                      <div>(x - a)² + (y - b)² = r²  (Circle)</div>
                    </div>

                    <div className="border border-slate-300 rounded p-2 bg-slate-50">
                      <div className="font-bold text-slate-900 mb-1 border-b pb-0.5 text-[10.5px]">6. Trigonometry</div>
                      <div>tan θ = sin θ / cos θ  |  sin² θ + cos² θ = 1</div>
                      <div>sin A / a = sin B / b = sin C / c  (Sine Rule)</div>
                      <div>a² = b² + c² - 2bc cos A  (Cosine Rule)</div>
                      <div>Area ΔABC = 1/2 a b sin C  (Area Rule)</div>
                      <div>sin(A ± B) = sin A cos B ± cos A sin B</div>
                      <div>cos(A ± B) = cos A cos B ∓ sin A sin B</div>
                      <div>sin 2A = 2 sin A cos A</div>
                      <div>cos 2A = cos² A - sin² A = 2cos² A - 1 = 1 - 2sin² A</div>
                    </div>

                    <div className="border border-slate-300 rounded p-2 bg-slate-50">
                      <div className="font-bold text-slate-900 mb-1 border-b pb-0.5 text-[10.5px]">7. Statistics & Probability</div>
                      <div>Mean: x̄ = (∑ x) / n  |  Std Dev: σ = √(∑(x - x̄)² / n)</div>
                      <div>P(A ∪ B) = P(A) + P(B) - P(A ∩ B)</div>
                      <div>Independent: P(A ∩ B) = P(A) • P(B)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORMULA SHEET FOOTER */}
              <div className="border-t border-slate-300 pt-2.5 mt-6 flex justify-between items-center text-[9.5px] font-mono text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">Amaris Mathematics Hub</span> — CAPS & IEB Formula Booklet
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-900">Page 3 of {totalPages}</span> | Official Exam Reference Sheet
                </div>
              </div>
            </div>
          )}

          {/* PAGE BREAK DIVIDER (BEFORE ANSWER KEY) IN ALL-PAGES VIEW */}
          {viewMode === "all" && showAnswerKey && (
            <div className="w-full max-w-2xl my-3 flex items-center justify-center gap-3 text-xs font-mono text-amber-500/90 select-none">
              <div className="h-px bg-dashed border-b border-amber-500/40 flex-1" />
              <div className="px-3.5 py-1.5 rounded-full bg-navy-900 border border-amber-500/50 shadow-lg flex items-center gap-2 text-white text-[11px] font-bold">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>PAGE BREAK ({paperSize}) • Marking Memorandum & Answer Key</span>
              </div>
              <div className="h-px bg-dashed border-b border-amber-500/40 flex-1" />
            </div>
          )}

          {/* ================= PAGE 4: ANSWER KEY & MEMORANDUM SECTION ================= */}
          {showAnswerKey && (viewMode === "all" || (viewMode === "single" && activePage === totalPages) || (viewMode === "grid" && activePage >= 3)) && (
            <div
              style={{
                fontSize: fontSize === "Small" ? "11px" : fontSize === "Large" ? "14px" : "12px"
              }}
              className={`${paperSize === "A4" ? "w-[210mm] min-h-[297mm]" : "w-[215.9mm] min-h-[279.4mm]"} ${
                marginPreset === "narrow" ? "p-[10mm]" : marginPreset === "wide" ? "p-[25mm]" : "p-[18mm]"
              } bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10 rounded-sm font-sans relative flex flex-col justify-between`}
            >
              {/* Optional Visual Margin Safety Boundary Overlay */}
              {showMarginGuides && (
                <div
                  className={`absolute pointer-events-none border-2 border-dashed border-cyan-500/70 z-20 ${
                    marginPreset === "narrow" ? "inset-[10mm]" : marginPreset === "wide" ? "inset-[25mm]" : "inset-[18mm]"
                  }`}
                >
                  <div className="absolute -top-3 left-3 bg-cyan-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                    Print Safety Margin ({marginPreset === "narrow" ? "10mm" : marginPreset === "wide" ? "25mm" : "18mm"})
                  </div>
                </div>
              )}

              {/* ANSWER KEY CONTENT */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2 font-serif">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      ANSWER KEY & MEMORANDUM SECTION
                    </h3>
                    <p className="text-[9.5px] text-slate-600 font-mono">
                      Complete Marking Guidelines & Step-by-Step Solutions for {worksheetTitle}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded uppercase">
                    OFFICIAL ANSWER KEY
                  </span>
                </div>

                <div className="space-y-3 font-mono text-[11px] text-slate-900">
                  {questions.map((q) => (
                    <div key={q.id} className="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1.5">
                      <div className="font-bold text-slate-900 flex justify-between border-b border-slate-200 pb-1 text-xs">
                        <span>{q.questionNumber} — {q.topic}</span>
                        <span className="text-slate-600">[{q.totalMarks} MARKS]</span>
                      </div>
                      <div className="space-y-1.5">
                        {q.subQuestions.map((sub, sIdx) => (
                          <div key={sIdx} className="p-2 rounded bg-white border border-slate-200 space-y-1">
                            <div className="flex justify-between items-start font-bold">
                              <span className="text-amber-900">{sub.numberLabel}</span>
                              <span className="text-slate-600">({sub.marks} marks)</span>
                            </div>
                            <div className="text-slate-700 text-[10px]">{sub.statement}</div>
                            <div className="text-emerald-950 font-bold bg-emerald-50 p-1.5 rounded border border-emerald-200 text-[10.5px]">
                              <span className="text-[8.5px] uppercase tracking-wider text-emerald-700 font-semibold block">Memo Answer / Working:</span>
                              {sub.memoAnswer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ANSWER KEY FOOTER */}
              <div className="border-t border-slate-300 pt-2.5 mt-6 flex justify-between items-center text-[9.5px] font-mono text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">Amaris Mathematics Hub</span> — Marking Memorandum
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-900">Page {totalPages} of {totalPages}</span> | Academic Integrity Standard
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- BOTTOM NAVIGATION & ACTION BAR --- */}
      <div className="w-full max-w-6xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 text-xs font-mono">
        {/* Page Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-navy-500 dark:text-navy-400 font-bold mr-1">Sheets:</span>
          {Array.from({ length: totalPages }).map((_, pIdx) => {
            const pageNum = pIdx + 1;
            let label = `Page ${pageNum}`;
            if (pageNum === 1) label = "P1: Exam";
            else if (pageNum === 2) label = "P2: Questions & QR";
            else if (pageNum === 3 && includeFormulaSheet) label = "P3: Formulas";
            else if (showAnswerKey && pageNum === totalPages) label = `P${pageNum}: Answer Key`;

            return (
              <button
                key={pageNum}
                onClick={() => {
                  setActivePage(pageNum);
                  if (viewMode !== "single") setViewMode("single");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  activePage === pageNum
                    ? "bg-amber-500 text-navy-950 border-amber-400 shadow-sm"
                    : "bg-navy-100 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:border-amber-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Previous / Next Carousel Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
            disabled={activePage === 1}
            className="px-3 py-1.5 rounded-xl border border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="font-bold px-2 text-navy-900 dark:text-white">
            Page {activePage} of {totalPages}
          </span>

          <button
            onClick={() => setActivePage((prev) => Math.min(totalPages, prev + 1))}
            disabled={activePage === totalPages}
            className="px-3 py-1.5 rounded-xl border border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-quick-setup-guide-bottom"
            onClick={() => setShowQuickSetupGuide(!showQuickSetupGuide)}
            className="px-3.5 py-2 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold cursor-pointer flex items-center gap-1.5 text-xs transition-all"
            title="Open Quick Setup printer settings recommendations"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Setup</span>
          </button>
          <button
            id="btn-close-print-preview-bottom"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 font-bold cursor-pointer"
          >
            Close
          </button>
          <button
            id="btn-download-worksheet-pdf-bottom"
            onClick={handleDownloadProgrammaticPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-bold cursor-pointer shadow-md flex items-center gap-2 hover:scale-[1.02] transition-all"
            title="Download clean, publication-ready PDF worksheet with proper page breaks directly"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-200" />
                <span>Download PDF</span>
              </>
            )}
          </button>
          <DownloadWorksheetPDFButton
            id="btn-save-pdf-browser-bottom"
            targetSelector="#worksheet-printable-area"
            worksheetTitle={worksheetTitle}
            grade={grade}
            subject={subject}
            variant="outline"
            size="md"
            label="Browser Print PDF"
            showHelpTooltip={false}
          />
          <button
            id="btn-print-now-bottom"
            onClick={handleTriggerPrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-black cursor-pointer shadow-md flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Worksheet</span>
          </button>
        </div>
      </div>

      {/* --- HIDDEN PRINT-ONLY CONTAINER TRIGGERED BY BROWSER PRINT --- */}
      <div 
        id="worksheet-printable-area"
        style={{
          fontSize: fontSize === "Small" ? "11.5px" : fontSize === "Large" ? "15.5px" : "13px"
        }}
        className={`hidden print:block print-only worksheet-print-target w-full bg-white text-black font-sans leading-relaxed text-xs ${
          spacingMode === "Compact" 
            ? "compact-view-worksheet worksheet-compact-mode p-5 space-y-3.5" 
            : "standard-view-worksheet p-8 space-y-6"
        } ${printLayout === "Minimalist" ? "ink-saver-mode" : ""}`}
      >
        {/* PRINT HEADER */}
        <div className="border-b-2 border-slate-900 pb-3 space-y-2 worksheet-header-box print-avoid-break">
          {printLayout === "Standard" ? (
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl font-black font-serif tracking-tight text-slate-900">
                    AMARIS MATHEMATICS HUB
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-slate-400 uppercase">
                    SIZE: {paperSize}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-slate-400 uppercase">
                    DIFFICULTY: {selectedDifficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-slate-400 uppercase">
                    SPACING: {spacingMode}
                  </span>
                  {fontSize !== "Medium" && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-slate-400 uppercase">
                      FONT: {fontSize}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-amber-900 font-mono uppercase tracking-wider mt-0.5">
                  Official South African High School Mathematics Worksheet
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  NSC CAPS & IEB Curriculum Standard | www.amarismathematics.co.za
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold">{grade}</div>
                <div className="text-amber-900 font-bold">{subject}</div>
                <div className="text-[10px] text-slate-600">Date: {currentDate}</div>
              </div>
            </div>
          ) : (
            /* MINIMALIST INK-SAVER PRINT HEADER */
            <div className="flex justify-between items-center font-mono py-1">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  {worksheetTitle}
                </h3>
                <div className="text-[10px] text-slate-700 flex items-center gap-2 mt-0.5">
                  <span>{grade} • {subject}</span>
                  <span>•</span>
                  <span className="uppercase">LEVEL: {selectedDifficulty}</span>
                  <span>•</span>
                  <span>FORMAT: {paperSize}</span>
                  <span>•</span>
                  <span>SPACING: {spacingMode}</span>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-700">
                <div>Date: {currentDate}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 border-t border-slate-300 pt-2 text-center text-xs font-mono">
            <div><strong>TOTAL MARKS:</strong> {totalMarks} Marks</div>
            <div><strong>TIME:</strong> {timeAllowed}</div>
            <div><strong>DIFFICULTY:</strong> {selectedDifficulty.toUpperCase()}</div>
            <div><strong>INSTRUCTIONS:</strong> Show Working</div>
          </div>
        </div>

        {/* PRINT STUDENT BOX */}
        {showStudentDetails && (
          <div className={`worksheet-student-box border border-slate-400 rounded-md bg-slate-50 text-xs font-mono print-avoid-break ${
            spacingMode === "Compact" ? "p-2 space-y-1" : "p-3.5 space-y-2"
          }`}>
            <div className="grid grid-cols-2 gap-4">
              <div>STUDENT NAME: <strong className="border-b border-slate-800 px-2">{studentName}</strong></div>
              <div>GRADE & CLASS: <strong className="border-b border-slate-800 px-2">{grade}</strong></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>HIGH SCHOOL: <span className="border-b border-slate-800 px-2">{schoolName}</span></div>
              <div>EXAM NO / ID: <span className="border-b border-slate-800 px-2">AMH-WORKSHEET</span></div>
            </div>
          </div>
        )}

        {/* PRINT QUESTIONS */}
        <div className={spacingMode === "Compact" ? "space-y-3.5" : "space-y-6"}>
          {questions.map((q) => (
            <div key={q.id} className={`worksheet-question-card print-avoid-break ${spacingMode === "Compact" ? "space-y-1.5" : "space-y-3"}`}>
              <div className="flex justify-between items-center border-b-2 border-slate-800 pb-1 font-serif worksheet-question-header">
                <h3 className="text-sm font-black text-slate-900 font-mono">{q.questionNumber} [{q.topic}]</h3>
                <span className="text-xs font-mono font-bold worksheet-marks-tag">[{q.totalMarks} MARKS]</span>
              </div>
              <div className={`pl-2 ${spacingMode === "Compact" ? "space-y-2" : "space-y-4"}`}>
                {q.subQuestions.map((sub, sIdx) => (
                  <div key={sIdx} className={`worksheet-subquestion print-avoid-break ${spacingMode === "Compact" ? "space-y-1" : "space-y-2"}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold">{sub.numberLabel}</span>
                        <span className="text-slate-900 font-medium whitespace-pre-line">{sub.statement}</span>
                      </div>
                      <span className="font-mono font-bold worksheet-marks-tag">({sub.marks})</span>
                    </div>

                    {showMemo ? (
                      <div className="worksheet-memo-box p-2 rounded bg-emerald-50 border border-emerald-300 text-[11px] font-mono text-emerald-950 my-1">
                        <strong>Memo:</strong> {sub.memoAnswer}
                      </div>
                    ) : (
                      <div className={`pl-6 ${spacingMode === "Compact" ? "space-y-1 pt-0.5" : "space-y-1.5 pt-1"}`}>
                        {Array.from({ 
                          length: spacingMode === "Compact" 
                            ? Math.max(2, (sub.workSpaceLines || 4) - 2) 
                            : (sub.workSpaceLines || 4) 
                        }).map((_, lineIdx) => (
                          <div 
                            key={lineIdx} 
                            className={`worksheet-workspace-line border-b border-dashed border-slate-300 w-full ${
                              spacingMode === "Compact" ? "h-3.5" : "h-5"
                            }`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PRINT FORMULA SHEET */}
        {includeFormulaSheet && (
          <div className="worksheet-formula-sheet pt-8 border-t-2 border-slate-900 space-y-4 print-break-before">
            <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
              <div>
                <div className="text-base font-black text-slate-900 font-serif">
                  INFORMATION SHEET / CORE FORMULA BOOKLET
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  Official South African CAPS & IEB High School Mathematics Standard (Grades 10–12)
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold border border-slate-800 px-2 py-0.5 rounded uppercase">
                NSC CAPS & IEB
              </span>
            </div>

            <div className="worksheet-formula-grid grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-900">
              <div className="worksheet-formula-card space-y-2 border border-slate-400 p-2 rounded">
                <div><strong>1. Algebra & Logs:</strong> x = (-b ± √(b² - 4ac))/2a | log_a(xy) = log_a x + log_a y</div>
                <div><strong>2. Sequences:</strong> T_n = a+(n-1)d | S_n = n/2[2a+(n-1)d] = n/2(a+l)</div>
                <div><strong>Geometric:</strong> T_n = a r^(n-1) | S_n = a(r^n - 1)/(r - 1) | S_∞ = a/(1-r)</div>
                <div><strong>3. Financial:</strong> A = P(1+i)^n | A = P(1-i)^n | F = x[(1+i)^n - 1]/i | P = x[1-(1+i)^(-n)]/i</div>
                <div><strong>4. Calculus:</strong> {"f'(x) = lim_{h→0} [f(x+h) - f(x)]/h"} | d/dx[x^n] = n x^(n-1)</div>
              </div>
              <div className="worksheet-formula-card space-y-2 border border-slate-400 p-2 rounded">
                <div><strong>5. Analytical Geom:</strong> d = √((x₂-x₁)²+(y₂-y₁)²) | M = ((x₁+x₂)/2 ; (y₁+y₂)/2)</div>
                <div><strong>Line/Circle:</strong> y-y₁ = m(x-x₁) | m = tan θ | (x-a)² + (y-b)² = r²</div>
                <div><strong>6. Trig:</strong> sin A/a = sin B/b | a² = b²+c² - 2bc cos A | Area = 1/2 ab sin C</div>
                <div><strong>Trig Identities:</strong> sin(A±B) = sin A cos B ± cos A sin B | sin 2A = 2 sin A cos A</div>
                <div><strong>7. Statistics:</strong> Mean x̄ = (∑x)/n | Std Dev σ = √(∑(x-x̄)²/n) | P(A∪B)=P(A)+P(B)-P(A∩B)</div>
              </div>
            </div>
          </div>
        )}

        {/* PRINT ANSWER KEY SECTION */}
        {showAnswerKey && (
          <div className="worksheet-answer-key pt-8 border-t-2 border-slate-900 space-y-4 print-break-before">
            <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
              <div>
                <div className="text-base font-black text-slate-900 font-serif">
                  ANSWER KEY & MEMORANDUM SECTION
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  Complete Marking Guidelines & Final Solutions for {worksheetTitle}
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold border border-slate-800 px-2 py-0.5 rounded uppercase">
                OFFICIAL MEMORANDUM
              </span>
            </div>

            <div className="space-y-3 font-mono text-[11px] text-slate-900">
              {questions.map((q) => (
                <div key={q.id} className="worksheet-memo-box border border-slate-400 p-2.5 rounded space-y-1.5 print-avoid-break">
                  <div className="font-bold text-slate-900 flex justify-between border-b border-slate-300 pb-0.5 text-xs">
                    <span>{q.questionNumber} — {q.topic}</span>
                    <span className="worksheet-marks-tag">[{q.totalMarks} MARKS]</span>
                  </div>
                  <div className="space-y-1.5">
                    {q.subQuestions.map((sub, sIdx) => (
                      <div key={sIdx} className="p-1.5 rounded bg-slate-50 border border-slate-300">
                        <div className="flex justify-between font-bold text-xs text-slate-900">
                          <span>{sub.numberLabel}</span>
                          <span className="worksheet-marks-tag">({sub.marks} marks)</span>
                        </div>
                        <div className="text-[10px] text-slate-700">{sub.statement}</div>
                        <div className="text-[10.5px] font-bold text-emerald-950 mt-1 bg-white p-1.5 rounded border border-slate-300">
                          <strong>Answer:</strong> {sub.memoAnswer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRINT QR CODE SOLUTION WALKTHROUGH BADGE */}
        {showQrCode && (
          <div className="mt-6 print-avoid-break">
            <QRGenerator
              id="worksheet-print-qr-generator"
              problemId={solutionId}
              problemTitle={worksheetTitle}
              grade={grade}
              topic={subject}
              curriculum="CAPS"
              videoUrl={solutionUrl}
              videoDuration="6:30 mins"
              tutorName="Bethuel Moukangwe (Head Mathematics Tutor)"
              marks={totalWorksheetMarks}
              displayMode="badge"
              allowDirectPlay={false}
              allowCopy={false}
              allowDownload={false}
            />
          </div>
        )}

        {/* PRINT FOOTER */}
        <div className="border-t border-slate-300 pt-3 mt-8 flex justify-between items-center text-[10px] font-mono text-slate-600 print-avoid-break">
          <div>Amaris Mathematics Hub — Official Student Worksheet</div>
          <div>Page 1 of {totalPages} | Directorial Seal of Academic Quality</div>
        </div>
      </div>
    </div>
  );
};
