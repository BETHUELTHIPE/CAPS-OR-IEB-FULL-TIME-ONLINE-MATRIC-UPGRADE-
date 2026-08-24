import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Eye,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  FileType,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  FileCheck,
  CheckCircle2,
  Award,
  Sparkles,
  Calendar,
  Layers,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Grid,
  Bookmark,
  CheckSquare,
  Compass,
  GraduationCap
} from "lucide-react";
import { getFileIconAndBadge } from "../lib/documentUtils";
import {
  SubmissionDocumentPage,
  generateSubmissionDocumentPages
} from "../lib/submissionDocumentUtils";

export interface DocumentPreviewData {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: string;
  notes?: string;
  submissionDate?: string;
  category?: string;
  // Graded homework specific metadata
  isGraded?: boolean;
  gradeScore?: number;
  tutorFeedback?: string;
  gradedBy?: string;
  gradedDate?: string;
}

interface DocumentPreviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentPreviewData | null;
  onDownload?: (doc: DocumentPreviewData) => void;
}

export const DocumentPreviewerModal: React.FC<DocumentPreviewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onDownload
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [viewMode, setViewMode] = useState<"continuous" | "single">("continuous");
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [imageFilter, setImageFilter] = useState<"none" | "bw" | "invert" | "crisp">("none");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"preview" | "feedback" | "metadata">("preview");
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [spreadsheetSearch, setSpreadsheetSearch] = useState<string>("");
  const [activeSheetTab, setActiveSheetTab] = useState<"sheet1" | "sheet2">("sheet1");
  const [interactiveFencingWidth, setInteractiveFencingWidth] = useState<number>(6);
  const [interactiveCircleAngle, setInteractiveCircleAngle] = useState<number>(45);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Reset page when new document opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setPageInput("1");
      setZoomLevel(100);
      setRotation(0);
      setImageFilter("none");
    }
  }, [isOpen, doc?.fileName]);

  // Keep pageInput synced with currentPage
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  if (!isOpen || !doc) return null;

  const ext = doc.fileName?.split(".").pop()?.toLowerCase() || "";
  const isImage =
    doc.fileType?.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) ||
    doc.fileUrl?.startsWith("data:image/");
  const isPdf = doc.fileType?.includes("pdf") || ext === "pdf";
  const isWord =
    doc.fileType?.includes("word") ||
    doc.fileType?.includes("officedocument.word") ||
    ["doc", "docx"].includes(ext);
  const isSpreadsheet =
    doc.fileType?.includes("sheet") ||
    doc.fileType?.includes("csv") ||
    doc.fileType?.includes("excel") ||
    ["xlsx", "xls", "csv"].includes(ext);
  const isCodeOrLatex = ["txt", "tex", "json", "py", "md"].includes(ext);

  const badge = getFileIconAndBadge(doc.fileName, doc.fileType);
  const BadgeIcon = badge.icon;

  // Generate full multi-page document structure
  const documentPages: SubmissionDocumentPage[] = generateSubmissionDocumentPages(
    doc.fileName,
    doc.category,
    doc.notes,
    doc.tutorFeedback,
    doc.gradeScore ?? 94,
    doc.isGraded
  );

  const totalPages = documentPages.length;

  const scrollToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(totalPages, pageNum));
    setCurrentPage(clamped);
    setPageInput(String(clamped));
    if (viewMode === "continuous") {
      const el = pageRefs.current[clamped];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handlePageInputSubmit = (valueToParse?: string) => {
    const val = valueToParse !== undefined ? valueToParse : pageInput;
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(totalPages, parsed));
      scrollToPage(clamped);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetP = parseInt(e.target.value, 10);
    if (!isNaN(targetP)) {
      scrollToPage(targetP);
    }
  };

  // Synchronize current page indicator when scrolling in continuous mode
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || viewMode !== "continuous" || activeTab !== "preview") return;

    let scrollTimeout: any = null;

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const containerRect = container.getBoundingClientRect();
        let closestPage = 1;
        let minDistance = Infinity;

        for (let p = 1; p <= totalPages; p++) {
          const el = pageRefs.current[p];
          if (el) {
            const rect = el.getBoundingClientRect();
            const distance = Math.abs(rect.top - containerRect.top - 80);
            if (distance < minDistance) {
              minDistance = distance;
              closestPage = p;
            }
          }
        }

        if (closestPage !== currentPage) {
          setCurrentPage(closestPage);
        }
      }, 60);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [viewMode, totalPages, currentPage, activeTab]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(doc);
      return;
    }

    if (!doc.fileUrl || doc.fileUrl === "#") {
      const content = `AMARIS MATHEMATICS HUB - DOCUMENT VAULT
Document: ${doc.fileName}
Size: ${doc.fileSize || "1.5 MB"}
Format: ${doc.fileType || ext.toUpperCase()}
Uploaded: ${doc.submissionDate || new Date().toISOString().split("T")[0]}
Total Pages: ${totalPages} Pages (Full multi-page document previewed)
${doc.isGraded ? `\n--- GRADED HOMEWORK REPORT ---
Score: ${doc.gradeScore || 94}% (Level 7 Distinction)
Graded By: ${doc.gradedBy || "Head Tutor Bethuel Moukangwe"}
Feedback: ${doc.tutorFeedback || "Excellent step-by-step mathematical reasoning and accurate working."}
` : ""}
Notes: ${doc.notes || "No notes provided."}

=== SECTION BREAKDOWN ===
Page 1: Document Coversheet & Section A: Algebra & Equations (25/25 Marks)
Page 2: Section B: Differential Calculus & First Principles (24/25 Marks)
Page 3: Section C: Trigonometry Reduction & Compound Angles (23/25 Marks)
Page 4: Section D: Analytical Geometry & Euclidean Circle Proofs (24/25 Marks)
Page 5: Section E: Official Assessment Rubric & Certification (${doc.gradeScore || 94}/100 Marks)
`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc.fileName.endsWith(".txt") ? doc.fileName : `${doc.fileName}_full_document.txt`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    const a = window.document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.fileName || "amaris_mathematics_document";
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Sample spreadsheet datasets for previewing .xlsx / .csv math worksheets
  const sampleSpreadsheetSheet1 = [
    { row: 1, topic: "Algebra & Equations", question: "Quadratic Roots (b² - 4ac)", marks: 7, studentMark: 7, status: "100% Correct" },
    { row: 2, topic: "Algebra & Equations", question: "Surd Equation with Restriction Check", marks: 6, studentMark: 6, status: "100% Correct" },
    { row: 3, topic: "Differential Calculus", question: "First Principles f'(x) lim h->0", marks: 5, studentMark: 5, status: "100% Correct" },
    { row: 4, topic: "Differential Calculus", question: "Cubic Turning Points & Inflection", marks: 8, studentMark: 8, status: "100% Correct" },
    { row: 5, topic: "Trigonometric Identities", question: "CAST Quadrant Reduction", marks: 6, studentMark: 6, status: "100% Correct" },
    { row: 6, topic: "Trigonometric Identities", question: "Compound Angle sin(2θ)/(1+cos2θ)", marks: 4, studentMark: 4, status: "100% Correct" },
    { row: 7, topic: "Analytical Geometry", question: "Circle Tangent Slope (m₁·m₂ = -1)", marks: 5, studentMark: 5, status: "100% Correct" },
    { row: 8, topic: "Euclidean Geometry", question: "Angle at Centre = 2x Angle at Circumf", marks: 5, studentMark: 5, status: "100% Correct" }
  ];

  const sampleSpreadsheetSheet2 = [
    { row: 1, topic: "Weighting Paper 1", question: "Algebra, Calculus & Functions", marks: 75, studentMark: 73, status: "97.3% Mastery" },
    { row: 2, topic: "Weighting Paper 2", question: "Trigonometry & Euclidean Geometry", marks: 75, studentMark: 71, status: "94.7% Mastery" },
    { row: 3, topic: "Overall Trial Total", question: "Combined Senior Certificate Paper", marks: 150, studentMark: 144, status: "96.0% Level 7" }
  ];

  const activeSheetData = activeSheetTab === "sheet1" ? sampleSpreadsheetSheet1 : sampleSpreadsheetSheet2;
  const filteredSheet = activeSheetData.filter(
    (item) =>
      item.topic.toLowerCase().includes(spreadsheetSearch.toLowerCase()) ||
      item.question.toLowerCase().includes(spreadsheetSearch.toLowerCase()) ||
      item.status.toLowerCase().includes(spreadsheetSearch.toLowerCase())
  );

  // Multi-scan image pages for handwritten photo submissions
  const scannedPages = [
    {
      page: 1,
      title: "Page 1: Title & Section A Working",
      src: doc.fileUrl && doc.fileUrl !== "#" ? doc.fileUrl : "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80"
    },
    {
      page: 2,
      title: "Page 2: Differential Calculus Steps",
      src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80"
    },
    {
      page: 3,
      title: "Page 3: Trigonometry & Geometry Working",
      src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80"
    }
  ];

  // Helper to render mathematical diagrams
  const renderDiagram = (diagramType?: string) => {
    if (diagramType === "cast") {
      return (
        <div className="p-4 bg-navy-950 text-white rounded-xl border border-navy-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>The CAST Quadrant Reduction Grid</span>
            </span>
            <span className="text-[10px] font-mono text-navy-400">Trigonometry Paper 2</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div className="p-3 bg-navy-900/90 border border-royal-500/30 rounded-lg">
              <div className="text-[10px] text-navy-400">Quadrant II (90° to 180°)</div>
              <div className="text-base font-black text-emerald-400 mt-1">S (Sine is +)</div>
              <div className="text-[10px] text-navy-300 mt-0.5">sin(180° - θ) = +sin θ</div>
              <div className="text-[10px] text-rose-400">cos(180° - θ) = -cos θ</div>
            </div>
            <div className="p-3 bg-navy-900/90 border border-gold-500/30 rounded-lg">
              <div className="text-[10px] text-navy-400">Quadrant I (0° to 90°)</div>
              <div className="text-base font-black text-gold-400 mt-1">A (All are +)</div>
              <div className="text-[10px] text-emerald-300 mt-0.5">sin θ &gt; 0, cos θ &gt; 0, tan θ &gt; 0</div>
              <div className="text-[10px] text-navy-300">Co-functions: sin(90°-θ) = cos θ</div>
            </div>
            <div className="p-3 bg-navy-900/90 border border-amber-500/30 rounded-lg">
              <div className="text-[10px] text-navy-400">Quadrant III (180° to 270°)</div>
              <div className="text-base font-black text-amber-400 mt-1">T (Tan is +)</div>
              <div className="text-[10px] text-amber-300 mt-0.5">tan(180° + θ) = +tan θ</div>
              <div className="text-[10px] text-rose-400">sin(180° + θ) = -sin θ</div>
            </div>
            <div className="p-3 bg-navy-900/90 border border-cyan-500/30 rounded-lg">
              <div className="text-[10px] text-navy-400">Quadrant IV (270° to 360°)</div>
              <div className="text-base font-black text-cyan-400 mt-1">C (Cos is +)</div>
              <div className="text-[10px] text-cyan-300 mt-0.5">cos(360° - θ) = +cos θ</div>
              <div className="text-[10px] text-rose-400">tan(360° - θ) = -tan θ</div>
            </div>
          </div>
        </div>
      );
    }

    if (diagramType === "optimization") {
      const width = interactiveFencingWidth;
      const length = 24 - 2 * width;
      const area = width * Math.max(0, length);
      return (
        <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-200 dark:border-navy-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-royal-700 dark:text-gold-400 uppercase">
              Calculus Rate of Change Optimization Simulator
            </span>
            <span className="text-[10px] font-mono text-navy-500">Perimeter: 2x + y = 24m</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-navy-900 p-3 rounded-lg border border-navy-200 dark:border-navy-800">
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span>Fencing Width (x): <b>{width} m</b></span>
                <span>Length (y = 24 - 2x): <b>{length} m</b></span>
              </div>
              <input
                type="range"
                min="1"
                max="11"
                step="0.5"
                value={width}
                onChange={(e) => setInteractiveFencingWidth(parseFloat(e.target.value))}
                className="w-full accent-royal-600 dark:accent-gold-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono pt-1">
                <span className="text-navy-500">Calculated Area A = x · y:</span>
                <span className="font-black text-royal-600 dark:text-gold-400 text-sm">
                  {area} m² {width === 6 ? "★ (Maximum Optimal Area)" : ""}
                </span>
              </div>
            </div>
            <div className="w-28 h-20 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-500 rounded flex flex-col items-center justify-center text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
              <span>Brick Wall (y={length}m)</span>
              <span className="text-xs font-black">{area} m²</span>
              <span>x={width}m | x={width}m</span>
            </div>
          </div>
        </div>
      );
    }

    if (diagramType === "analytical_geom") {
      return (
        <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-200 dark:border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-royal-700 dark:text-gold-400">
            <span>Coordinate Geometry: Circle & Tangent Perpendicularity</span>
            <span className="text-[10px] text-navy-500">(x - 3)² + (y + 1)² = 25</span>
          </div>
          <div className="p-3 bg-white dark:bg-navy-900 rounded-lg border border-navy-200 dark:border-navy-800 text-xs font-mono space-y-1.5">
            <p className="text-navy-800 dark:text-navy-200">
              • Centre: <b>M(3, -1)</b> • Point of contact: <b>P(6, 3)</b>
            </p>
            <p className="text-navy-800 dark:text-navy-200">
              • Gradient of Radius: <code className="text-royal-600 dark:text-gold-400 font-bold">m_radius = (3 - (-1))/(6 - 3) = 4/3</code>
            </p>
            <p className="text-navy-800 dark:text-navy-200">
              • Gradient of Tangent (m₁·m₂ = -1): <code className="text-emerald-600 dark:text-emerald-400 font-bold">m_tangent = -3/4</code>
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 font-bold">
              ✓ Equation of Tangent: 3x + 4y - 30 = 0 (Confirmed)
            </p>
          </div>
        </div>
      );
    }

    if (diagramType === "euclidean_circle") {
      const circumAngle = interactiveCircleAngle;
      const centreAngle = circumAngle * 2;
      return (
        <div className="p-4 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-200 dark:border-navy-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-royal-700 dark:text-gold-400 uppercase">
              Theorem: Angle at Centre is Double Angle at Circumference
            </span>
            <span className="text-[10px] font-mono text-navy-500">∠AOB = 2 × ∠ACB</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-navy-900 p-3 rounded-lg border border-navy-200 dark:border-navy-800 text-xs">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between font-mono">
                <span>Angle at Circumference (∠ACB): <b>{circumAngle}°</b></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Angle at Centre (∠AOB): <b>{centreAngle}°</b></span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={circumAngle}
                onChange={(e) => setInteractiveCircleAngle(parseInt(e.target.value))}
                className="w-full accent-royal-600 dark:accent-gold-500 cursor-pointer"
              />
              <p className="text-[11px] font-mono text-navy-500 dark:text-navy-400">
                Official CAPS Statement: "Angle at centre = 2 × angle at circumference" (subtended by arc AB).
              </p>
            </div>
            <div className="w-20 h-20 rounded-full border-2 border-royal-500 bg-royal-50 dark:bg-navy-800 flex flex-col items-center justify-center font-mono text-[10px] text-royal-700 dark:text-gold-300 font-bold shrink-0">
              <span>O: {centreAngle}°</span>
              <span className="text-[9px] text-navy-400">C: {circumAngle}°</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Helper to render a single page
  const renderSinglePage = (page: SubmissionDocumentPage) => {
    return (
      <div
        key={page.pageNumber}
        ref={(el) => {
          pageRefs.current[page.pageNumber] = el;
        }}
        style={{
          transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
          transformOrigin: "top center",
          transition: "transform 0.2s ease"
        }}
        className="bg-white dark:bg-navy-900 text-navy-950 dark:text-navy-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-navy-200 dark:border-navy-800 max-w-3xl mx-auto space-y-6 text-left relative"
      >
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between border-b-2 border-navy-900 dark:border-navy-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-royal-600 text-white font-mono text-[10px] font-bold">
                {page.sectionCode}
              </span>
              <h3 className="text-base font-black font-display tracking-tight text-navy-900 dark:text-white uppercase">
                {page.title}
              </h3>
            </div>
            <p className="text-xs font-mono text-navy-500 dark:text-navy-400 mt-1">
              Amaris Mathematics Hub • Official Candidate Submission Document
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-lg border border-navy-200 dark:border-navy-750">
              Page {page.pageNumber} of {totalPages}
            </span>
            {page.marksTotal && (
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Marks: {page.marksAwarded ?? page.marksTotal} / {page.marksTotal}
              </div>
            )}
          </div>
        </div>

        {/* PAGE ELEMENTS */}
        <div className="space-y-4 text-xs leading-relaxed">
          {page.elements.map((el, elIdx) => {
            if (el.type === "coversheet_header") {
              return (
                <div
                  key={elIdx}
                  className="bg-gradient-to-r from-navy-900 via-royal-900 to-navy-900 text-white p-5 rounded-xl border border-royal-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-mono text-xs font-bold text-gold-400 tracking-wider">
                      {el.questionNumber}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono font-bold border border-emerald-500/40">
                      Certified Candidate Script
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black font-display text-white">
                    {doc.fileName.replace(/\.[^/.]+$/, "")}
                  </h2>
                  <p className="text-[11px] text-navy-200 font-mono">
                    {el.explanation}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-[10px] font-mono text-navy-300">
                    <div>Student: <b>Candidate</b></div>
                    <div>Curriculum: <b>CAPS / IEB</b></div>
                    <div>Total Pages: <b>{totalPages}</b></div>
                    <div>Status: <b>{doc.isGraded ? "Graded (94%)" : "Logged"}</b></div>
                  </div>
                </div>
              );
            }

            if (el.type === "section_title") {
              return (
                <div
                  key={elIdx}
                  className="flex items-center justify-between bg-navy-50 dark:bg-navy-950 p-3 rounded-xl border border-navy-200 dark:border-navy-800"
                >
                  <span className="font-bold text-navy-900 dark:text-white font-mono text-xs uppercase tracking-wider">
                    {el.questionNumber}
                  </span>
                  {el.marks && (
                    <span className="text-[11px] font-mono font-bold text-royal-600 dark:text-gold-400">
                      [{el.marks} Marks Total]
                    </span>
                  )}
                </div>
              );
            }

            if (el.type === "question_block") {
              return (
                <div key={elIdx} className="font-bold text-navy-800 dark:text-navy-200 pl-1">
                  <span className="text-royal-600 dark:text-gold-400 mr-2 font-mono">
                    {el.questionNumber}
                  </span>
                  <span>{el.questionText}</span>
                </div>
              );
            }

            if (el.type === "student_working") {
              return (
                <div
                  key={elIdx}
                  className="p-4 bg-white dark:bg-navy-950/80 rounded-xl border border-navy-200 dark:border-navy-800 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-navy-900 dark:text-white">
                      <span className="text-royal-600 dark:text-gold-400 mr-1.5 font-mono">
                        {el.questionNumber}
                      </span>
                      <span>{el.questionText}</span>
                    </div>
                    {el.marks && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        {el.awardedMarks ?? el.marks}/{el.marks} Marks
                      </span>
                    )}
                  </div>

                  {el.mathSteps && (
                    <div className="p-3 bg-navy-50 dark:bg-navy-900 rounded-lg border border-navy-150 dark:border-navy-800 font-mono text-xs space-y-1 text-royal-900 dark:text-royal-200">
                      {el.mathSteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2">
                          <span className="text-navy-400 select-none">▸</span>
                          <span className="break-all">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {el.explanation && (
                    <p className="text-[11px] text-navy-500 dark:text-navy-400 italic pl-1">
                      Reasoning: {el.explanation}
                    </p>
                  )}

                  {el.tutorRemark && (
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-[11px] font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{el.tutorRemark}</span>
                    </div>
                  )}
                </div>
              );
            }

            if (el.type === "diagram") {
              return (
                <div key={elIdx} className="space-y-1">
                  {renderDiagram(el.diagramType)}
                  {el.explanation && (
                    <p className="text-[10px] font-mono text-navy-400 text-center">
                      {el.explanation}
                    </p>
                  )}
                </div>
              );
            }

            if (el.type === "marking_rubric_table") {
              return (
                <div key={elIdx} className="overflow-x-auto rounded-xl border border-navy-200 dark:border-navy-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy-100 dark:bg-navy-950 text-[10px] font-mono uppercase text-navy-600 dark:text-navy-400 border-b border-navy-200 dark:border-navy-800">
                      <tr>
                        <th className="px-3 py-2">Assessment Section</th>
                        <th className="px-3 py-2 text-center">Max Marks</th>
                        <th className="px-3 py-2 text-center">Awarded</th>
                        <th className="px-3 py-2">Tutor Assessment Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-150 dark:divide-navy-800">
                      {el.rubricRows?.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-navy-50 dark:hover:bg-navy-800/50">
                          <td className="px-3 py-2.5 font-bold text-navy-900 dark:text-white">{row.criterion}</td>
                          <td className="px-3 py-2.5 text-center font-mono">{row.maxMarks}</td>
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {row.awarded}
                          </td>
                          <td className="px-3 py-2.5 text-navy-600 dark:text-navy-300 font-medium">
                            {row.feedback}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            if (el.type === "tutor_annotation") {
              return (
                <div
                  key={elIdx}
                  className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/30 p-5 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-sm text-navy-900 dark:text-white">
                        {el.questionNumber}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-600 text-white">
                      Score: {doc.gradeScore ?? 94}% (Level 7)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-navy-800 dark:text-navy-100 leading-relaxed font-medium bg-white/70 dark:bg-navy-900/70 p-3.5 rounded-xl border border-emerald-500/20">
                    "{el.tutorRemark}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-navy-500 dark:text-navy-400 pt-1">
                    <span>Head Tutor: Bethuel Moukangwe</span>
                    <span>{el.explanation}</span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* PAGE FOOTER */}
        <div className="pt-4 border-t border-navy-200 dark:border-navy-800 flex items-center justify-between text-[10px] font-mono text-navy-400">
          <span>Amaris Mathematics Hub • Verified High School Curriculum</span>
          <span>
            Page {page.pageNumber} / {totalPages}
          </span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/85 backdrop-blur-md animate-fadeIn">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left ${
            isFullscreen ? "w-full h-full max-w-none rounded-none" : "w-full max-w-5xl max-h-[94vh]"
          }`}
        >
          {/* HEADER TOOLBAR */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-150 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-950/50 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-2xl border shrink-0 ${badge.color}`}>
                <BadgeIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black font-display text-navy-900 dark:text-white truncate">
                    {doc.fileName}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badge.color}`}>
                    .{ext.toUpperCase() || "DOC"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-royal-500/15 text-royal-700 dark:text-gold-300 border border-royal-500/30">
                    {totalPages} Pages
                  </span>
                  {doc.isGraded && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-500" />
                      <span>Graded: {doc.gradeScore ?? 94}%</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-navy-500 dark:text-navy-400 mt-0.5">
                  {doc.fileSize || "1.2 MB"} • Uploaded {doc.submissionDate || "Recently"} • {doc.category || "Mathematics Worksheet"}
                </p>
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Zoom & Rotation */}
              <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl p-1">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 25, 50))}
                  className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg text-navy-600 dark:text-navy-300 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold px-1.5 text-navy-700 dark:text-navy-200">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 25, 250))}
                  className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg text-navy-600 dark:text-navy-300 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg text-navy-600 dark:text-navy-300 cursor-pointer"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="hidden sm:flex p-2 hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded-xl border border-navy-200 dark:border-navy-700 cursor-pointer"
                title="Print Full Document"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hidden sm:flex p-2 hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded-xl border border-navy-200 dark:border-navy-700 cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-royal-600 hover:bg-royal-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-navy-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SECONDARY TOOLBAR: MULTI-PAGE CONTROLS & TABS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-5 py-2.5 border-b border-navy-150 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-mono font-bold shrink-0">
            {/* TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-royal-600 text-white dark:bg-gold-500 dark:text-navy-950 font-black shadow-sm"
                    : "text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Document Preview ({totalPages} Pages)</span>
              </button>

              {doc.isGraded && (
                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "feedback"
                      ? "bg-emerald-600 text-white font-black shadow-sm"
                      : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Tutor Markings & Rubric</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("metadata")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "metadata"
                    ? "bg-royal-600 text-white dark:bg-gold-500 dark:text-navy-950 font-black shadow-sm"
                    : "text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Properties</span>
              </button>
            </div>

            {/* MULTI-PAGE NAVIGATION CONTROLS */}
            {activeTab === "preview" && (
              <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
                {/* View Mode Toggle: Continuous vs Single Page */}
                <div className="flex items-center bg-navy-100 dark:bg-navy-800 p-0.5 rounded-xl border border-navy-200 dark:border-navy-700 text-[11px]">
                  <button
                    onClick={() => setViewMode("continuous")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "continuous"
                        ? "bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-bold shadow-xs"
                        : "text-navy-500 hover:text-navy-800 dark:hover:text-white"
                    }`}
                    title="View All Pages in continuous vertical scroll"
                  >
                    <Layers className="w-3 h-3" />
                    <span>All Pages</span>
                  </button>
                  <button
                    onClick={() => setViewMode("single")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "single"
                        ? "bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-bold shadow-xs"
                        : "text-navy-500 hover:text-navy-800 dark:hover:text-white"
                    }`}
                    title="Focus on single page"
                  >
                    <Grid className="w-3 h-3" />
                    <span>Single Page</span>
                  </button>
                </div>

                {/* Page Navigation Slider */}
                <div className="hidden sm:flex items-center gap-2 bg-navy-50 dark:bg-navy-950 px-2.5 py-1 rounded-xl border border-navy-200 dark:border-navy-800">
                  <span className="text-[10px] font-mono text-navy-400">Scrub:</span>
                  <input
                    type="range"
                    min={1}
                    max={totalPages}
                    step={1}
                    value={currentPage}
                    onChange={handleSliderChange}
                    className="w-20 sm:w-28 h-1.5 bg-navy-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-500"
                    title={`Slide to jump between pages (Currently on Page ${currentPage} of ${totalPages})`}
                  />
                </div>

                {/* Direct Page Number Input Stepper */}
                <div className="flex items-center gap-0.5 bg-navy-50 dark:bg-navy-950 px-1.5 py-1 rounded-xl border border-navy-200 dark:border-navy-800">
                  <button
                    onClick={() => scrollToPage(1)}
                    disabled={currentPage <= 1}
                    className="p-1 hover:bg-navy-200 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded disabled:opacity-25 cursor-pointer"
                    title="Jump to First Page (Page 1)"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 hover:bg-navy-200 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded disabled:opacity-25 cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Direct Number Input */}
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] font-mono text-navy-400">Page</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={() => handlePageInputSubmit()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePageInputSubmit();
                      }}
                      className="w-9 text-center bg-white dark:bg-navy-900 border border-navy-300 dark:border-navy-700 rounded-lg text-xs font-mono font-black text-navy-900 dark:text-white py-0.5 focus:outline-none focus:ring-1 focus:ring-royal-500 shadow-xs"
                      title="Type page number and press Enter"
                    />
                    <span className="text-[11px] font-mono text-navy-400">
                      / {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1 hover:bg-navy-200 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded disabled:opacity-25 cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => scrollToPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="p-1 hover:bg-navy-200 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded disabled:opacity-25 cursor-pointer"
                    title={`Jump to Last Page (Page ${totalPages})`}
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Current Section Code Tag */}
                {documentPages[currentPage - 1] && (
                  <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-royal-500/10 dark:bg-royal-500/20 text-royal-700 dark:text-royal-300 rounded-xl text-[10px] font-mono font-bold border border-royal-500/20 truncate max-w-[180px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-royal-500 shrink-0"></span>
                    <span className="truncate">
                      {documentPages[currentPage - 1]?.sectionCode}
                    </span>
                  </div>
                )}

                {/* Thumbnail Drawer Toggle */}
                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    showThumbnails
                      ? "bg-royal-50 dark:bg-navy-800 border-royal-400 text-royal-600 dark:text-gold-400"
                      : "border-navy-200 dark:border-navy-700 text-navy-500 hover:bg-navy-100 dark:hover:bg-navy-800"
                  }`}
                  title="Toggle Page Navigation Sidebar"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* MAIN PREVIEW CONTAINER (WITH OPTIONAL THUMBNAIL SIDEBAR) */}
          <div className="flex-1 flex overflow-hidden bg-navy-50/60 dark:bg-navy-950/60">
            {/* THUMBNAIL SIDEBAR */}
            {activeTab === "preview" && showThumbnails && (
              <div className="w-52 sm:w-60 border-r border-navy-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 p-3 overflow-y-auto hidden md:flex flex-col gap-2.5 shrink-0 text-left">
                <div className="flex items-center justify-between pb-1 border-b border-navy-150 dark:border-navy-800">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navy-400">
                    Document Pages ({totalPages})
                  </span>
                  <span className="text-[9px] font-mono text-royal-600 dark:text-gold-400 font-bold">
                    Click to Jump
                  </span>
                </div>

                {documentPages.map((page) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => scrollToPage(page.pageNumber)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                      currentPage === page.pageNumber
                        ? "border-royal-500 dark:border-gold-500 bg-royal-50/80 dark:bg-navy-800 shadow-sm ring-1 ring-royal-400/40"
                        : "border-navy-200 dark:border-navy-800 hover:border-navy-300 dark:hover:border-navy-700 bg-white dark:bg-navy-950/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-black text-royal-700 dark:text-gold-400">
                        PAGE {page.pageNumber}
                      </span>
                      <span className="text-[9px] font-mono text-navy-400">
                        {page.sectionCode}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-navy-900 dark:text-white line-clamp-2 leading-tight">
                      {page.title}
                    </p>
                    {page.marksTotal && (
                      <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                        ✓ Marks: {page.marksAwarded ?? page.marksTotal}/{page.marksTotal}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* PREVIEW CONTENT SCROLLER */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6"
            >
              {activeTab === "preview" && (
                <div className="space-y-6">
                  {/* CASE 1: MULTI-PAGE RENDERED DOCUMENT (PDF, WORD, LATEX, OR WORKINGS) */}
                  {(!isImage || isPdf || isWord || isCodeOrLatex) && (
                    <>
                      {viewMode === "continuous" ? (
                        /* CONTINUOUS SCROLL VIEW (ALL PAGES SEQUENTIALLY) */
                        <div className="space-y-8">
                          {documentPages.map((page) => renderSinglePage(page))}
                        </div>
                      ) : (
                        /* SINGLE PAGE VIEW */
                        <div className="space-y-4">
                          {/* Single Page Header Controls */}
                          <div className="flex items-center justify-between bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 px-4 py-2.5 rounded-2xl shadow-xs flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-mono font-black text-xs">
                                Page {currentPage} of {totalPages}
                              </span>
                              <span className="text-xs font-bold text-navy-800 dark:text-navy-200 font-mono">
                                {documentPages[currentPage - 1]?.sectionCode} • {documentPages[currentPage - 1]?.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                                className="px-3 py-1.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-300 rounded-xl font-mono text-xs font-bold flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Previous</span>
                              </button>
                              <button
                                onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1 disabled:opacity-30 cursor-pointer shadow-xs"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="relative">
                            {documentPages
                              .filter((p) => p.pageNumber === currentPage)
                              .map((page) => renderSinglePage(page))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* CASE 2: SCANNED HANDWRITTEN IMAGES / PHOTOS */}
                  {isImage && (
                    <div className="space-y-6">
                      {/* Image Enhancer Toolbar */}
                      <div className="flex items-center justify-between bg-white dark:bg-navy-900 p-3 rounded-2xl border border-navy-200 dark:border-navy-800 text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                          <span className="font-bold text-navy-900 dark:text-white">
                            Multi-Page Scanned Photos & Handwritten Worksheets
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-navy-400 uppercase mr-1">Filter:</span>
                          {[
                            { id: "none", label: "Original" },
                            { id: "bw", label: "Black & White" },
                            { id: "invert", label: "Chalkboard" },
                            { id: "crisp", label: "High Contrast" }
                          ].map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setImageFilter(f.id as any)}
                              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                                imageFilter === f.id
                                  ? "bg-royal-600 text-white dark:bg-gold-500 dark:text-navy-950"
                                  : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-400 hover:bg-navy-100"
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display All Scanned Pages Stacked or Page-by-Page */}
                      {viewMode === "continuous" ? (
                        <div className="space-y-6">
                          {scannedPages.map((scan) => (
                            <div
                              key={scan.page}
                              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 sm:p-6 shadow-md space-y-3"
                            >
                              <div className="flex justify-between items-center border-b border-navy-150 dark:border-navy-800 pb-2">
                                <span className="font-bold text-xs text-navy-900 dark:text-white font-mono">
                                  {scan.title}
                                </span>
                                <span className="text-[10px] font-mono text-navy-400">
                                  Scanned Worksheet Page {scan.page} of {scannedPages.length}
                                </span>
                              </div>
                              <div className="flex items-center justify-center p-2 bg-navy-950 rounded-xl overflow-hidden min-h-[350px]">
                                <img
                                  src={scan.src}
                                  alt={scan.title}
                                  style={{
                                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                    filter:
                                      imageFilter === "invert"
                                        ? "invert(1) hue-rotate(180deg)"
                                        : imageFilter === "bw"
                                        ? "grayscale(1) contrast(1.2)"
                                        : imageFilter === "crisp"
                                        ? "contrast(1.4) brightness(1.05)"
                                        : "none",
                                    transition: "transform 0.2s ease, filter 0.3s ease"
                                  }}
                                  className="max-h-[65vh] max-w-full object-contain rounded shadow-lg"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 sm:p-6 shadow-md space-y-3">
                          <div className="flex justify-between items-center border-b border-navy-150 dark:border-navy-800 pb-2">
                            <span className="font-bold text-xs text-navy-900 dark:text-white font-mono">
                              {scannedPages[(currentPage - 1) % scannedPages.length].title}
                            </span>
                            <span className="text-[10px] font-mono text-navy-400">
                              Scan {currentPage} of {scannedPages.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-center p-2 bg-navy-950 rounded-xl overflow-hidden min-h-[420px]">
                            <img
                              src={scannedPages[(currentPage - 1) % scannedPages.length].src}
                              alt="Scan page"
                              style={{
                                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                filter:
                                  imageFilter === "invert"
                                    ? "invert(1) hue-rotate(180deg)"
                                    : imageFilter === "bw"
                                    ? "grayscale(1) contrast(1.2)"
                                    : imageFilter === "crisp"
                                    ? "contrast(1.4) brightness(1.05)"
                                    : "none",
                                transition: "transform 0.2s ease, filter 0.3s ease"
                              }}
                              className="max-h-[65vh] max-w-full object-contain rounded shadow-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASE 3: SPREADSHEET VIEWER (MULTI-SHEET WORKBOOK) */}
                  {isSpreadsheet && (
                    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-150 dark:border-navy-800 pb-3">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                          <div>
                            <span className="font-bold text-sm text-navy-900 dark:text-white block">
                              Multi-Sheet Mathematical Calculation Workbook
                            </span>
                            <span className="text-[10px] font-mono text-navy-400">
                              CAPS Marks Matrix & Weightings Breakdown
                            </span>
                          </div>
                        </div>

                        {/* Search in Sheet */}
                        <div className="relative w-full sm:w-60">
                          <Search className="w-3.5 h-3.5 text-navy-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Filter formulas & rows..."
                            value={spreadsheetSearch}
                            onChange={(e) => setSpreadsheetSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Sheet Tabs */}
                      <div className="flex items-center gap-2 border-b border-navy-150 dark:border-navy-800 pb-2">
                        <button
                          onClick={() => setActiveSheetTab("sheet1")}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            activeSheetTab === "sheet1"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300"
                          }`}
                        >
                          Sheet 1: Question Breakdown ({sampleSpreadsheetSheet1.length} Items)
                        </button>
                        <button
                          onClick={() => setActiveSheetTab("sheet2")}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            activeSheetTab === "sheet2"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300"
                          }`}
                        >
                          Sheet 2: Exam Paper Weightings (Summary)
                        </button>
                      </div>

                      {/* Table Render */}
                      <div className="overflow-x-auto rounded-xl border border-navy-200 dark:border-navy-800">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-navy-100 dark:bg-navy-950 text-[10px] font-mono uppercase text-navy-600 dark:text-navy-400 border-b border-navy-200 dark:border-navy-800">
                            <tr>
                              <th className="px-3 py-2">#</th>
                              <th className="px-3 py-2">Curriculum Topic</th>
                              <th className="px-3 py-2">Assessment Section</th>
                              <th className="px-3 py-2 text-center">Max Marks</th>
                              <th className="px-3 py-2 text-center">Score Awarded</th>
                              <th className="px-3 py-2">Audit Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-navy-150 dark:divide-navy-800">
                            {filteredSheet.map((item) => (
                              <tr key={item.row} className="hover:bg-navy-50 dark:hover:bg-navy-800/50">
                                <td className="px-3 py-2.5 font-mono text-navy-400">{item.row}</td>
                                <td className="px-3 py-2.5 font-bold text-navy-900 dark:text-white">{item.topic}</td>
                                <td className="px-3 py-2.5 font-mono text-navy-700 dark:text-navy-300">{item.question}</td>
                                <td className="px-3 py-2.5 text-center font-mono">{item.marks}</td>
                                <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {item.studentMark}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* FLOATING MULTI-PAGE NAVIGATION BAR (SLIDER & PAGE NUMBER INPUT) */}
                  <div className="sticky bottom-3 z-30 mx-auto max-w-3xl pt-2">
                    <div className="bg-navy-950/92 dark:bg-navy-950/95 text-white backdrop-blur-md border border-royal-500/30 dark:border-gold-500/30 shadow-2xl p-2.5 sm:p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                      {/* Left: Step Buttons & Direct Page Number Input */}
                      <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-0.5 bg-navy-900/90 px-1.5 py-1 rounded-xl border border-navy-800">
                          <button
                            onClick={() => scrollToPage(1)}
                            disabled={currentPage <= 1}
                            className="p-1 hover:bg-navy-800 text-navy-300 hover:text-white rounded disabled:opacity-25 cursor-pointer"
                            title="First Page"
                          >
                            <ChevronsLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                            className="p-1 hover:bg-navy-800 text-navy-300 hover:text-white rounded disabled:opacity-25 cursor-pointer"
                            title="Previous Page"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Numeric Input */}
                          <div className="flex items-center gap-1 px-1.5">
                            <span className="text-[10px] font-mono text-navy-400">Page</span>
                            <input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={pageInput}
                              onChange={(e) => setPageInput(e.target.value)}
                              onBlur={() => handlePageInputSubmit()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handlePageInputSubmit();
                              }}
                              className="w-10 text-center bg-navy-950 border border-royal-500/40 rounded-lg text-xs font-mono font-black text-gold-400 py-0.5 focus:outline-none focus:ring-1 focus:ring-gold-500 shadow-inner"
                              title="Type a page number and press Enter"
                            />
                            <span className="text-[11px] font-mono text-navy-400">
                              / {totalPages}
                            </span>
                          </div>

                          <button
                            onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                            className="p-1 hover:bg-navy-800 text-navy-300 hover:text-white rounded disabled:opacity-25 cursor-pointer"
                            title="Next Page"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => scrollToPage(totalPages)}
                            disabled={currentPage >= totalPages}
                            className="p-1 hover:bg-navy-800 text-navy-300 hover:text-white rounded disabled:opacity-25 cursor-pointer"
                            title="Last Page"
                          >
                            <ChevronsRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Current Section Code Tag */}
                        {documentPages[currentPage - 1] && (
                          <span className="hidden sm:inline-block px-2.5 py-1 bg-royal-950/80 border border-royal-500/30 text-gold-300 font-mono text-[10px] font-bold rounded-xl truncate max-w-[140px]">
                            {documentPages[currentPage - 1]?.sectionCode}
                          </span>
                        )}
                      </div>

                      {/* Middle: Interactive Multi-Page Navigation Slider */}
                      <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 max-w-xs px-2">
                        <span className="text-[10px] font-mono text-navy-400 shrink-0">1</span>
                        <div className="relative flex-1 flex items-center">
                          <input
                            type="range"
                            min={1}
                            max={totalPages}
                            step={1}
                            value={currentPage}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            title={`Drag slider to navigate: Page ${currentPage} of ${totalPages}`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-navy-400 shrink-0">{totalPages}</span>
                      </div>

                      {/* Right: Quick Page Jump Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {documentPages.map((p) => (
                          <button
                            key={p.pageNumber}
                            onClick={() => scrollToPage(p.pageNumber)}
                            className={`w-6 h-6 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer flex items-center justify-center ${
                              currentPage === p.pageNumber
                                ? "bg-amber-400 text-navy-950 font-black shadow-md scale-110"
                                : "bg-navy-900 hover:bg-navy-800 text-navy-300 hover:text-white border border-navy-800"
                            }`}
                            title={`Jump to Page ${p.pageNumber}: ${p.title}`}
                          >
                            {p.pageNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TUTOR FEEDBACK & MARKINGS */}
              {activeTab === "feedback" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/30 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            Official Tutor Assessment & Markings
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-navy-900 dark:text-white">
                            Verified Grade: {doc.gradeScore ?? 94}% (Level 7 Distinction)
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500 text-white shadow-xs">
                          CAPS / IEB Approved
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-navy-900 dark:text-white block uppercase font-mono">
                        Head Instructor Bethuel Moukangwe's Remarks:
                      </span>
                      <p className="text-xs sm:text-sm text-navy-800 dark:text-navy-100 leading-relaxed bg-white/80 dark:bg-navy-900/80 p-4 rounded-xl border border-emerald-500/20 font-medium">
                        {doc.tutorFeedback ||
                          "Outstanding submission! All algebraic derivations and limit definitions are mathematically sound. Pay attention to negative sign distributions when expanding polynomial brackets."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                      <div className="p-3 bg-white/70 dark:bg-navy-900/70 rounded-xl border border-emerald-500/20">
                        <span className="text-[10px] text-navy-400 block">Graded By</span>
                        <span className="font-bold text-navy-900 dark:text-white">
                          {doc.gradedBy || "Bethuel Moukangwe (Head Tutor)"}
                        </span>
                      </div>
                      <div className="p-3 bg-white/70 dark:bg-navy-900/70 rounded-xl border border-emerald-500/20">
                        <span className="text-[10px] text-navy-400 block">Submission Date</span>
                        <span className="font-bold text-navy-900 dark:text-white">
                          {doc.submissionDate || "Recent"}
                        </span>
                      </div>
                      <div className="p-3 bg-white/70 dark:bg-navy-900/70 rounded-xl border border-emerald-500/20">
                        <span className="text-[10px] text-navy-400 block">Assessment Quality</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Level 7 Distinction (80-100%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Render Page 5 Rubric directly */}
                  {renderSinglePage(documentPages[documentPages.length - 1])}
                </div>
              )}

              {/* TAB: METADATA & AUDIT LOGS */}
              {activeTab === "metadata" && (
                <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-bold text-navy-900 dark:text-white border-b border-navy-150 dark:border-navy-800 pb-2">
                    Technical File & Multi-Page Metadata
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-150 dark:border-navy-800">
                      <span className="text-[10px] text-navy-400 uppercase block">File Name</span>
                      <span className="font-bold text-navy-900 dark:text-white break-all">{doc.fileName}</span>
                    </div>
                    <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-150 dark:border-navy-800">
                      <span className="text-[10px] text-navy-400 uppercase block">Document Structure</span>
                      <span className="font-bold text-navy-900 dark:text-white">
                        {totalPages} Formatted Pages (Continuous & Single Paged)
                      </span>
                    </div>
                    <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-150 dark:border-navy-800">
                      <span className="text-[10px] text-navy-400 uppercase block">File Size & MIME</span>
                      <span className="font-bold text-navy-900 dark:text-white">
                        {doc.fileSize || "1.2 MB"} ({doc.fileType || ext.toUpperCase()})
                      </span>
                    </div>
                    <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-150 dark:border-navy-800">
                      <span className="text-[10px] text-navy-400 uppercase block">Upload Timestamp</span>
                      <span className="font-bold text-navy-900 dark:text-white">
                        {doc.submissionDate || new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {doc.notes && (
                    <div className="p-3.5 bg-navy-50 dark:bg-navy-950 rounded-xl border border-navy-150 dark:border-navy-800 text-xs">
                      <span className="font-mono text-[10px] font-bold text-navy-400 uppercase block mb-1">
                        Student Notes / Questions:
                      </span>
                      <p className="text-navy-700 dark:text-navy-300 italic">"{doc.notes}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-navy-150 dark:border-navy-800 bg-white dark:bg-navy-900 shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-mono text-navy-400">
              <span>Amaris Mathematics Hub Multi-Format Vault</span>
              <span>•</span>
              <span className="text-royal-600 dark:text-gold-400 font-bold">
                Viewing Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Full Document</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
