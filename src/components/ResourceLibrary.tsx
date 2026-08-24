import React, { useState, useEffect, useRef } from "react";
import { ResourceLibraryItem, Profile } from "../types";
import { dbAPI } from "../lib/db";
import { 
  BookOpen, 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  HelpCircle,
  FileSpreadsheet,
  FileImage,
  RefreshCw,
  Trophy,
  User,
  GraduationCap,
  X,
  AlertCircle,
  Clock,
  Calculator,
  Check,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Share2,
  Link2,
  LayoutGrid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PrintPreviewModal } from "./PrintPreviewModal";
import { PDFPreviewerModal } from "./PDFPreviewerModal";
import { DownloadWorksheetPDFButton } from "./DownloadWorksheetPDFButton";
import { 
  PDFAnnotationToolbar, 
  PDFCanvasAnnotationsOverlay, 
  PDFAnnotationsDrawer, 
  getStoredAnnotations, 
  saveStoredAnnotations, 
  getPDFProgress,
  getAllPDFProgress,
  savePDFProgress,
  PDFReadingProgress,
  PDFHighlight, 
  PDFStickyNote 
} from "./PDFAnnotationLayer";
import { extractPDFMetadata } from "../services/pdfMetadataService";
import { DocumentPage, getDocumentPages, getDocumentOutline } from "../lib/pdfDocumentUtils";

export { getDocumentPages, getDocumentOutline };
export type { DocumentPage };

interface ResourceLibraryProps {
  user: Profile;
}

interface Formula {
  id: string;
  name: string;
  topic: string;
  expression: string;
  description: string;
  grade: "Grade 10" | "Grade 11" | "Grade 12" | "All";
  syllabus: "CAPS" | "IEB" | "Both";
  variables: { name: string; label: string; placeholder: string; defaultValue: string }[];
  calcType?: "quadratic" | "compound" | "distance" | "midpoint" | "arithmetic_series" | "geometric_series";
}

const FORMULAS_DATABASE: Formula[] = [
  {
    id: "f-quad",
    name: "Quadratic Formula",
    topic: "Algebra & Sequences",
    expression: "x = (-b ± √(b² - 4ac)) / 2a",
    description: "Determines the roots of a quadratic equation ax² + bx + c = 0. Real solutions exist only if discriminant b² - 4ac ≥ 0.",
    grade: "Grade 11",
    syllabus: "Both",
    variables: [
      { name: "a", label: "Coefficient a", placeholder: "e.g. 1", defaultValue: "1" },
      { name: "b", label: "Coefficient b", placeholder: "e.g. -5", defaultValue: "-5" },
      { name: "c", label: "Coefficient c", placeholder: "e.g. 6", defaultValue: "6" }
    ],
    calcType: "quadratic"
  },
  {
    id: "f-arith-tn",
    name: "Arithmetic General Term",
    topic: "Algebra & Sequences",
    expression: "T_n = a + (n - 1)d",
    description: "Finds the specific value of any term in an arithmetic progression with first term 'a' and constant difference 'd'.",
    grade: "Grade 12",
    syllabus: "Both",
    variables: [
      { name: "a", label: "First Term (a)", placeholder: "e.g. 3", defaultValue: "3" },
      { name: "d", label: "Common Difference (d)", placeholder: "e.g. 5", defaultValue: "5" },
      { name: "n", label: "Term Number (n)", placeholder: "e.g. 10", defaultValue: "10" }
    ],
    calcType: "arithmetic_series"
  },
  {
    id: "f-geom-tn",
    name: "Geometric General Term",
    topic: "Algebra & Sequences",
    expression: "T_n = a * r^(n-1)",
    description: "Finds the value of any term in a geometric sequence with first term 'a' and constant ratio 'r'.",
    grade: "Grade 12",
    syllabus: "Both",
    variables: [
      { name: "a", label: "First Term (a)", placeholder: "e.g. 2", defaultValue: "2" },
      { name: "r", label: "Common Ratio (r)", placeholder: "e.g. 3", defaultValue: "3" },
      { name: "n", label: "Term Number (n)", placeholder: "e.g. 5", defaultValue: "5" }
    ],
    calcType: "geometric_series"
  },
  {
    id: "f-dist",
    name: "Distance Between Two Points",
    topic: "Analytical Geometry",
    expression: "d = √((x₂ - x₁)² + (y₂ - y₁)²)",
    description: "Calculates the exact straight-line distance 'd' between coordinates (x₁, y₁) and (x₂, y₂).",
    grade: "Grade 10",
    syllabus: "Both",
    variables: [
      { name: "x1", label: "x₁ coordinate", placeholder: "e.g. 1", defaultValue: "1" },
      { name: "y1", label: "y₁ coordinate", placeholder: "e.g. 2", defaultValue: "2" },
      { name: "x2", label: "x₂ coordinate", placeholder: "e.g. 4", defaultValue: "4" },
      { name: "y2", label: "y₂ coordinate", placeholder: "e.g. 6", defaultValue: "6" }
    ],
    calcType: "distance"
  },
  {
    id: "f-mid",
    name: "Midpoint of Segment",
    topic: "Analytical Geometry",
    expression: "M = ((x₁ + x₂)/2 ; (y₁ + y₂)/2)",
    description: "Calculates the exact middle coordinates between points A(x₁, y₁) and B(x₂, y₂).",
    grade: "Grade 10",
    syllabus: "Both",
    variables: [
      { name: "x1", label: "x₁ coordinate", placeholder: "e.g. -2", defaultValue: "-2" },
      { name: "y1", label: "y₁ coordinate", placeholder: "e.g. 4", defaultValue: "4" },
      { name: "x2", label: "x₂ coordinate", placeholder: "e.g. 6", defaultValue: "6" },
      { name: "y2", label: "y₂ coordinate", placeholder: "e.g. 8", defaultValue: "8" }
    ],
    calcType: "midpoint"
  },
  {
    id: "f-grad",
    name: "Gradient (Slope) of a Line",
    topic: "Analytical Geometry",
    expression: "m = (y₂ - y₁) / (x₂ - x₁)",
    description: "Computes the average rate of change or slope 'm' connecting two Cartesian coordinate points.",
    grade: "Grade 10",
    syllabus: "Both",
    variables: [
      { name: "x1", label: "x₁ coordinate", placeholder: "e.g. 2", defaultValue: "2" },
      { name: "y1", label: "y₁ coordinate", placeholder: "e.g. 3", defaultValue: "3" },
      { name: "x2", label: "x₂ coordinate", placeholder: "e.g. 5", defaultValue: "5" },
      { name: "y2", label: "y₂ coordinate", placeholder: "e.g. 9", defaultValue: "9" }
    ]
  },
  {
    id: "f-comp-int",
    name: "Compound Interest (Growth)",
    topic: "Financial Mathematics",
    expression: "A = P(1 + i)ⁿ",
    description: "Calculates accumulated amount 'A' when principal 'P' gains compounding interest rate 'i' over 'n' compounding intervals.",
    grade: "Grade 11",
    syllabus: "Both",
    variables: [
      { name: "P", label: "Principal (P)", placeholder: "e.g. 5000", defaultValue: "5000" },
      { name: "i", label: "Interest Rate % (i)", placeholder: "e.g. 8.5", defaultValue: "8.5" },
      { name: "n", label: "Compounding Periods / Years (n)", placeholder: "e.g. 5", defaultValue: "5" }
    ],
    calcType: "compound"
  },
  {
    id: "f-simple-int",
    name: "Simple Interest (Growth)",
    topic: "Financial Mathematics",
    expression: "A = P(1 + i * n)",
    description: "Computes the linear accumulation on investment or simple interest loans.",
    grade: "Grade 10",
    syllabus: "Both",
    variables: [
      { name: "P", label: "Principal (P)", placeholder: "e.g. 1000", defaultValue: "1000" },
      { name: "i", label: "Interest Rate % (i)", placeholder: "e.g. 12", defaultValue: "12" },
      { name: "n", label: "Years (n)", placeholder: "e.g. 3", defaultValue: "3" }
    ]
  },
  {
    id: "f-trig-sin-double",
    name: "Sine Double Angle Identity",
    topic: "Trigonometry",
    expression: "sin(2θ) = 2 * sin(θ) * cos(θ)",
    description: "Crucial identity used in CAPS/IEB trigonometric proofs, general solutions, and calculus integrations.",
    grade: "Grade 12",
    syllabus: "Both",
    variables: []
  },
  {
    id: "f-trig-cos-double",
    name: "Cosine Double Angle Identity",
    topic: "Trigonometry",
    expression: "cos(2θ) = cos²(θ) - sin²(θ) = 2cos²(θ) - 1 = 1 - 2sin²(θ)",
    description: "Expands the cosine double angle into three alternative forms based on the standard Pythagorean identity.",
    grade: "Grade 12",
    syllabus: "Both",
    variables: []
  },
  {
    id: "f-trig-area",
    name: "Area Rule for Triangles",
    topic: "Trigonometry",
    expression: "Area = 0.5 * a * b * sin(C)",
    description: "Determines the area of any non-right-angled triangle given two sides and the included angle.",
    grade: "Grade 11",
    syllabus: "Both",
    variables: []
  },
  {
    id: "f-calc-first",
    name: "Derivative from First Principles",
    topic: "Differential Calculus",
    expression: "f'(x) = lim[h→0] (f(x+h) - f(x)) / h",
    description: "The formal limit definition calculating the instantaneous gradient or slope of f(x) at any given x-point.",
    grade: "Grade 12",
    syllabus: "Both",
    variables: []
  },
  {
    id: "f-prob-add",
    name: "Probability Addition Rule",
    topic: "Probability",
    expression: "P(A or B) = P(A) + P(B) - P(A and B)",
    description: "Determines the probability of the union of two events. For mutually exclusive events, P(A and B) = 0.",
    grade: "Grade 10",
    syllabus: "Both",
    variables: []
  },
  {
    id: "f-calc-power",
    name: "Calculus Power Rule",
    topic: "Differential Calculus",
    expression: "d/dx [xⁿ] = n * x^(n-1)",
    description: "The fundamental power rule for calculating derivative functions of polynomial terms quickly.",
    grade: "Grade 12",
    syllabus: "Both",
    variables: []
  },
  {
    id: "f-trig-sine-rule",
    name: "Trigonometric Sine Rule",
    topic: "Trigonometry",
    expression: "a / sin(A) = b / sin(B) = c / sin(C)",
    description: "Connects the ratios of side lengths to the sines of their opposite angles in non-right triangles.",
    grade: "Grade 11",
    syllabus: "Both",
    variables: []
  },
  {
    id: "f-trig-cosine-rule",
    name: "Trigonometric Cosine Rule",
    topic: "Trigonometry",
    expression: "a² = b² + c² - 2bc * cos(A)",
    description: "An extension of Pythagoras' theorem used to calculate unknown side lengths or interior angles.",
    grade: "Grade 11",
    syllabus: "Both",
    variables: []
  }
];

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"papers" | "formulas">("papers");
  const [resources, setResources] = useState<ResourceLibraryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSyllabus, setSelectedSyllabus] = useState<"All" | "CAPS" | "IEB" | "Both">("All");
  const [selectedGrade, setSelectedGrade] = useState<"All" | "Grade 10" | "Grade 11" | "Grade 12">("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [resourceViewMode, setResourceViewMode] = useState<"grid" | "list">("grid");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [successDownloadId, setSuccessDownloadId] = useState<string | null>(null);

  // Tutor upload form state
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<"pdf" | "word" | "image">("pdf");
  const [newSyllabus, setNewSyllabus] = useState<"CAPS" | "IEB" | "Both">("CAPS");
  const [newGrade, setNewGrade] = useState<"Grade 10" | "Grade 11" | "Grade 12">("Grade 12");
  const [newTopic, setNewTopic] = useState("Functions & Graphs");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Interactive Formula Sheet state
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [selectedFormulaTopic, setSelectedFormulaTopic] = useState<string>("All");
  const [formulaSearchQuery, setFormulaSearchQuery] = useState<string>("");
  const [activeFormulaCalcId, setActiveFormulaCalcId] = useState<string | null>(null);

  // Variables for calculation panel
  const [calcInputs, setCalcInputs] = useState<Record<string, string>>({});
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [calcSteps, setCalcSteps] = useState<string[]>([]);

  // Document and Image Preview Modal States
  const [previewItem, setPreviewItem] = useState<ResourceLibraryItem | null>(null);
  const [lightweightPreviewItem, setLightweightPreviewItem] = useState<ResourceLibraryItem | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewRotation, setPreviewRotation] = useState<number>(0);
  const [previewSearch, setPreviewSearch] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedOutlineSection, setSelectedOutlineSection] = useState<string>("");
  const [selectedPrintItem, setSelectedPrintItem] = useState<ResourceLibraryItem | null>(null);
  
  // Annotation Layer States for ResourceLibrary Main Previewer
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<'pointer' | 'highlighter' | 'sticky'>('pointer');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>('#fef08a');
  const [stickyColor, setStickyColor] = useState<PDFStickyNote['color']>('yellow');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [highlights, setHighlights] = useState<PDFHighlight[]>([]);
  const [stickyNotes, setStickyNotes] = useState<PDFStickyNote[]>([]);

  // PDF Reading Progress Tracking State
  const [pdfProgressMap, setPdfProgressMap] = useState<Record<string, PDFReadingProgress>>(() => getAllPDFProgress());

  // Copy Share Link State & Tooltip Handler
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const handleCopyShareLink = (item: ResourceLibraryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const shareToken = btoa(`amh-doc-${item.id}-${Date.now()}`).slice(0, 14);
    const shareUrl = `${baseUrl}?resourceId=${encodeURIComponent(item.id)}&st=${shareToken}#resource-${item.id}`;

    try {
      navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopiedShareId(item.id);
    setTimeout(() => {
      setCopiedShareId((prev) => (prev === item.id ? null : prev));
    }, 2500);
  };

  // Deep Link Handling for shared URLs (?resourceId=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetResourceId = params.get("resourceId");
    if (targetResourceId && resources.length > 0) {
      const targetItem = resources.find(r => r.id === targetResourceId);
      if (targetItem) {
        setTimeout(() => {
          const cardEl = document.getElementById(`resource-card-${targetResourceId}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
            cardEl.classList.add("ring-4", "ring-gold-400/80", "transition-all", "duration-500");
            setTimeout(() => cardEl.classList.remove("ring-4", "ring-gold-400/80"), 3500);
          }
        }, 500);
      }
    }
  }, [resources]);

  useEffect(() => {
    const handleProgressUpdate = () => {
      setPdfProgressMap(getAllPDFProgress());
    };
    window.addEventListener("storage", handleProgressUpdate);
    window.addEventListener("amh_pdf_progress_updated", handleProgressUpdate);
    return () => {
      window.removeEventListener("storage", handleProgressUpdate);
      window.removeEventListener("amh_pdf_progress_updated", handleProgressUpdate);
    };
  }, []);

  // Track progress when embedded previewer is active
  useEffect(() => {
    if (previewItem) {
      const docPages = getDocumentPages(previewItem.id, previewItem.title);
      savePDFProgress(previewItem.id, previewPage, docPages.length);
    }
  }, [previewItem, previewPage]);

  // Load annotations when previewItem opens
  useEffect(() => {
    if (previewItem) {
      const stored = getStoredAnnotations(previewItem.id);
      setHighlights(stored.highlights || []);
      setStickyNotes(stored.stickyNotes || []);
    }
  }, [previewItem]);

  const handleAddStickyNote = (newNote: PDFStickyNote) => {
    const updated = [...stickyNotes, newNote];
    setStickyNotes(updated);
    if (previewItem) saveStoredAnnotations(previewItem.id, highlights, updated);
  };

  const handleUpdateStickyNote = (noteId: string, content: string) => {
    const updated = stickyNotes.map(n => n.id === noteId ? { ...n, content } : n);
    setStickyNotes(updated);
    if (previewItem) saveStoredAnnotations(previewItem.id, highlights, updated);
  };

  const handleDeleteStickyNote = (noteId: string) => {
    const updated = stickyNotes.filter(n => n.id !== noteId);
    setStickyNotes(updated);
    if (previewItem) saveStoredAnnotations(previewItem.id, highlights, updated);
  };

  const handleToggleCollapseStickyNote = (noteId: string) => {
    const updated = stickyNotes.map(n => n.id === noteId ? { ...n, isCollapsed: !n.isCollapsed } : n);
    setStickyNotes(updated);
    if (previewItem) saveStoredAnnotations(previewItem.id, highlights, updated);
  };

  const handleAddHighlight = (newHl: PDFHighlight) => {
    const updated = [...highlights, newHl];
    setHighlights(updated);
    if (previewItem) saveStoredAnnotations(previewItem.id, updated, stickyNotes);
  };

  const handleDeleteHighlight = (hlId: string) => {
    const updated = highlights.filter(h => h.id !== hlId);
    setHighlights(updated);
    if (previewItem) saveStoredAnnotations(previewItem.id, updated, stickyNotes);
  };

  const handleClearAllAnnotations = () => {
    setHighlights([]);
    setStickyNotes([]);
    if (previewItem) saveStoredAnnotations(previewItem.id, [], []);
  };
  
  // Interactive diagram math variables
  const [trigAngle, setTrigAngle] = useState<number>(45);
  const [optWidth, setOptWidth] = useState<number>(12); // optimization width
  const [circleTheoremAngle, setCircleTheoremAngle] = useState<number>(55); // circle angle
  const [geomXCoordinate, setGeomXCoordinate] = useState<number>(4); // analytical coordinate

  // Available standard topics for categorization
  const topicsList = [
    "All Topics",
    "Algebra & Sequences",
    "Functions & Graphs",
    "Trigonometry",
    "Analytical Geometry",
    "Differential Calculus",
    "Euclidean Geometry",
    "Probability",
    "Financial Mathematics",
    "Statistics"
  ];

  // Load resources from localStorage database
  const loadResources = () => {
    const list = dbAPI.getResourceLibrary();
    setResources(list);
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter items
  const filteredResources = resources.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.file_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSyllabus = 
      selectedSyllabus === "All" || 
      item.syllabus === selectedSyllabus || 
      item.syllabus === "Both" ||
      selectedSyllabus === "Both";

    const matchesGrade = 
      selectedGrade === "All" || 
      item.grade_level === selectedGrade || 
      item.grade_level === "All";

    const matchesTopic = 
      selectedTopic === "All" || 
      selectedTopic === "All Topics" ||
      item.topic === selectedTopic ||
      item.topic === "All Topics";

    return matchesSearch && matchesSyllabus && matchesGrade && matchesTopic;
  });

  // Interactive diagrams rendering handlers for document previews
  const renderCASTDiagram = () => {
    const rad = (trigAngle * Math.PI) / 180;
    const lineX = 100 + 60 * Math.cos(rad);
    const lineY = 100 - 60 * Math.sin(rad);
    const quadInfo = getQuadrantInfo(trigAngle);

    return (
      <div className="w-full max-w-md space-y-4 font-mono text-[10px]">
        <div className="text-center pb-2 border-b border-navy-100 dark:border-navy-800">
          <span className="text-[11px] font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest block">
            Interactive CAST Circle Diagram
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* SVG Circle */}
          <div className="relative bg-white dark:bg-navy-950 p-2 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm shrink-0">
            <svg width="200" height="200" className="overflow-visible">
              {/* Grid axes */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2" />
              
              {/* Main circle */}
              <circle cx="100" cy="100" r="70" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.3" />
              
              {/* Angle arc */}
              {trigAngle > 0 && (
                <path
                  d={`M 125 100 A 25 25 0 ${trigAngle > 180 ? 1 : 0} 0 ${100 + 25 * Math.cos(rad)} ${100 - 25 * Math.sin(rad)}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
              )}
              
              {/* Rotating line vector */}
              <line x1="100" y1="100" x2={lineX} y2={lineY} stroke="#f59e0b" strokeWidth="2.5" />
              
              {/* Origin point */}
              <circle cx="100" cy="100" r="4" fill="#3b82f6" />
              <circle cx={lineX} cy={lineY} r="4" fill="#f59e0b" />
              
              {/* Quadrant labels */}
              <text x="145" y="55" fill={quadInfo.quad === "I" ? "#f59e0b" : "#475569"} className="font-bold text-xs" textAnchor="middle">
                I: A
              </text>
              <text x="55" y="55" fill={quadInfo.quad === "II" ? "#f59e0b" : "#475569"} className="font-bold text-xs" textAnchor="middle">
                II: S
              </text>
              <text x="55" y="145" fill={quadInfo.quad === "III" ? "#f59e0b" : "#475569"} className="font-bold text-xs" textAnchor="middle">
                III: T
              </text>
              <text x="145" y="145" fill={quadInfo.quad === "IV" ? "#f59e0b" : "#475569"} className="font-bold text-xs" textAnchor="middle">
                IV: C
              </text>
            </svg>
            <div className="absolute top-2 right-2 text-[9px] bg-navy-50 dark:bg-navy-900 border border-navy-100 dark:border-navy-800 px-1.5 py-0.5 rounded font-bold text-navy-500">
              θ = {trigAngle}°
            </div>
          </div>

          {/* Controls and calculations details */}
          <div className="flex-1 space-y-3.5 w-full text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-navy-400 block uppercase tracking-wider">
                Drag to Adjust Angle (0° to 360°)
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={trigAngle}
                onChange={(e) => setTrigAngle(parseInt(e.target.value))}
                className="w-full h-1.5 bg-navy-100 dark:bg-navy-850 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-400"
              />
            </div>

            <div className="p-3 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Active Quadrant:</span>
                <span className="font-black text-royal-600 dark:text-gold-400 text-xs">
                  Quadrant {quadInfo.quad} ({quadInfo.label})
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Reference Angle:</span>
                <span className="font-bold text-navy-800 dark:text-navy-200">
                  {quadInfo.reduced}
                </span>
              </div>

              <div className="pt-2 border-t border-navy-100 dark:border-navy-800 space-y-1 text-center">
                <span className="text-[8px] font-black text-navy-400 block uppercase tracking-wider">
                  Syllabus Reduction Formulas
                </span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {quadInfo.formulas.map((form, fIdx) => (
                    <div key={fIdx} className="p-1.5 bg-navy-50 dark:bg-navy-900 rounded text-[9px] font-bold text-navy-700 dark:text-navy-300">
                      {form}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptimizationDiagram = () => {
    const x = Math.min(Math.max(1, optWidth), 11);
    const y = 24 - 2 * x;
    const area = x * y;
    
    // Dimension scaling factors for drawing
    const rectWidth = y * 6;
    const rectHeight = x * 6;
    const startX = 100 - rectWidth / 2;

    return (
      <div className="w-full max-w-md space-y-4 font-mono text-[10px]">
        <div className="text-center pb-2 border-b border-navy-100 dark:border-navy-800">
          <span className="text-[11px] font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest block">
            Practical Boundary Calculus Simulator
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Rectangular field simulation */}
          <div className="bg-white dark:bg-navy-950 p-3 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm flex flex-col items-center h-44 justify-center relative overflow-hidden shrink-0">
            <span className="absolute top-1 left-2 text-[8px] text-navy-400 font-bold uppercase tracking-wide">
              Visual Pasture Layout
            </span>
            <svg width="200" height="150" className="overflow-visible">
              {/* River/Brick Wall */}
              <line x1="10" y1="30" x2="190" y2="30" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              <text x="100" y="20" fill="#475569" className="text-[8px] font-bold" textAnchor="middle">
                🧱 BRICK BOUNDARY WALL (NO FENCING)
              </text>
              
              {/* Fenced Rectangle */}
              <rect
                x={startX}
                y="30"
                width={rectWidth}
                height={rectHeight}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="#3b82f6"
                fillOpacity="0.1"
                strokeDasharray="1"
              />
              
              {/* Left Width label */}
              <text x={startX - 15} y={30 + rectHeight / 2 + 3} fill="#1e3a8a" className="font-bold text-[9px]">
                x = {x}m
              </text>
              {/* Right Width label */}
              <text x={startX + rectWidth + 5} y={30 + rectHeight / 2 + 3} fill="#1e3a8a" className="font-bold text-[9px]">
                x = {x}m
              </text>
              {/* Bottom Length label */}
              <text x="100" y={30 + rectHeight + 15} fill="#1e3a8a" className="font-bold text-[9px]" textAnchor="middle">
                y = {y}m  (24 - 2x)
              </text>
              
              {/* Area Indicator */}
              <text x="100" y={30 + rectHeight / 2 + 4} fill="#d97706" className="font-black text-[10px]" textAnchor="middle">
                Area = {area}m²
              </text>
            </svg>
          </div>

          {/* Parabolic Graph & controls */}
          <div className="bg-white dark:bg-navy-950 p-3 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm flex flex-col justify-between h-44">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-navy-400 block uppercase tracking-wider text-left">
                Fencing Width (x): {x}m
              </span>
              <input
                type="range"
                min="1"
                max="11"
                value={x}
                onChange={(e) => setOptWidth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-navy-100 dark:bg-navy-850 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-400"
              />
            </div>

            {/* Parabolic plot of area */}
            <div className="flex items-center gap-3 pt-2">
              <svg width="80" height="50" className="overflow-visible stroke-navy-300 dark:stroke-navy-800 shrink-0">
                {/* Axes */}
                <line x1="0" y1="45" x2="75" y2="45" strokeWidth="1" />
                <line x1="5" y1="0" x2="5" y2="48" strokeWidth="1" />
                
                {/* Parabola path */}
                <path
                  d="M 5 45 Q 40 5, 75 45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
                
                {/* Current point indicator */}
                {(() => {
                  const dotX = 5 + (x / 12) * 70;
                  const dotY = 45 - (area / 72) * 40;
                  return (
                    <circle cx={dotX} cy={dotY} r="3.5" fill="#f59e0b" className="animate-pulse" />
                  );
                })()}
              </svg>
              <div className="flex-1 space-y-1 text-left">
                <span className="text-[8px] text-navy-400 uppercase font-bold block">Calculus Analytics</span>
                <span className="text-[10px] text-navy-800 dark:text-navy-200 block font-bold leading-tight">
                  Area function:<br/>
                  <span className="text-royal-600 dark:text-gold-400">A(x) = 24x - 2x²</span>
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-black">
                  {x === 6 ? "⭐ OPTIMAL WIDTH (A'(x) = 0)" : `Slope A'(x) = ${24 - 4 * x}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticalGeomDiagram = () => {
    const xc = Math.min(Math.max(0, geomXCoordinate), 10);
    
    // Fixed Points A(2,2), B(8,6)
    const xa = 2, ya = 2;
    const xb = 8, yb = 6;
    const yc = 4;
    
    // Map coordinates to SVG coordinates
    const scaleX = (x: number) => 30 + x * 15;
    const scaleY = (y: number) => 130 - y * 15;
    
    const pxA = { x: scaleX(xa), y: scaleY(ya) };
    const pxB = { x: scaleX(xb), y: scaleY(yb) };
    const pxC = { x: scaleX(xc), y: scaleY(yc) };
    
    // Calculations
    const distAC = Math.sqrt(Math.pow(xc - xa, 2) + Math.pow(yc - ya, 2));
    const slopeAB = (yb - ya) / (xb - xa); // 2/3 ≈ 0.67
    const slopeAC = xc === xa ? Infinity : (yc - ya) / (xc - xa);
    const perpendicularCheck = Math.abs(slopeAB * slopeAC + 1) < 0.05;

    return (
      <div className="w-full max-w-md space-y-4 font-mono text-[10px]">
        <div className="text-center pb-2 border-b border-navy-100 dark:border-navy-800">
          <span className="text-[11px] font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest block">
            Analytical Geometry Vector Simulator
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Coordinate Grid SVG */}
          <div className="relative bg-white dark:bg-navy-950 p-2 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm shrink-0">
            <svg width="200" height="150" className="overflow-visible">
              {/* Draw Grid Lines */}
              {[2, 4, 6, 8, 10].map(val => (
                <g key={val}>
                  <line x1={scaleX(val)} y1="10" x2={scaleX(val)} y2="135" stroke="#e2e8f0" strokeWidth="0.5" />
                  <text x={scaleX(val)} y="145" fill="#94a3b8" className="text-[7px]" textAnchor="middle">{val}</text>
                  
                  <line x1="25" y1={scaleY(val)} x2="190" y2={scaleY(val)} stroke="#e2e8f0" strokeWidth="0.5" />
                  <text x="18" y={scaleY(val) + 2} fill="#94a3b8" className="text-[7px]" textAnchor="end">{val}</text>
                </g>
              ))}
              
              {/* Coordinate Axes */}
              <line x1="25" y1="130" x2="190" y2="130" stroke="#475569" strokeWidth="1.5" />
              <line x1="30" y1="10" x2="30" y2="135" stroke="#475569" strokeWidth="1.5" />
              
              {/* Line AB (Fixed) */}
              <line x1={pxA.x} y1={pxA.y} x2={pxB.x} y2={pxB.y} stroke="#1d4ed8" strokeWidth="2" />
              {/* Line AC (Dynamic) */}
              <line x1={pxA.x} y1={pxA.y} x2={pxC.x} y2={pxC.y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3" />
              
              {/* Points */}
              <circle cx={pxA.x} cy={pxA.y} r="4" fill="#1d4ed8" />
              <text x={pxA.x - 10} y={pxA.y - 5} fill="#1d4ed8" className="font-bold text-[8px]">A(2,2)</text>
              
              <circle cx={pxB.x} cy={pxB.y} r="4" fill="#1d4ed8" />
              <text x={pxB.x + 8} y={pxB.y + 3} fill="#1d4ed8" className="font-bold text-[8px]">B(8,6)</text>
              
              <circle cx={pxC.x} cy={pxC.y} r="4.5" fill="#f59e0b" />
              <text x={pxC.x + 8} y={pxC.y - 3} fill="#f59e0b" className="font-black text-[8px]">C({xc},4)</text>
            </svg>
          </div>

          {/* Controls and Stats */}
          <div className="flex-1 space-y-3.5 w-full text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-navy-400 block uppercase tracking-wider">
                Adjust Coordinate X_C: {xc}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={xc}
                onChange={(e) => setGeomXCoordinate(parseInt(e.target.value))}
                className="w-full h-1.5 bg-navy-100 dark:bg-navy-850 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-400"
              />
            </div>

            <div className="p-3 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Slope of Segment AB:</span>
                <span className="font-bold text-navy-800 dark:text-navy-200">m_AB = 0.67</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Slope of Segment AC:</span>
                <span className="font-bold text-royal-600 dark:text-gold-400 text-xs">
                  m_AC = {slopeAC === Infinity ? "Undefined (Vertical)" : slopeAC.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-navy-500">Segment AC Length:</span>
                <span className="font-bold text-navy-800 dark:text-navy-200">
                  d_AC = {distAC.toFixed(2)} units
                </span>
              </div>

              <div className="pt-2 border-t border-navy-100 dark:border-navy-800 text-center">
                <span className="text-[9px] font-black block uppercase tracking-wider">
                  {perpendicularCheck ? "🎉 PERPENDICULAR CHECK SUCCESS!" : "Slopes multiplier: m_AB × m_AC"}
                </span>
                <span className={`text-[10px] font-bold block pt-0.5 ${perpendicularCheck ? "text-emerald-500" : "text-navy-400"}`}>
                  {xc === 2 ? "Lines are Parallel" : `0.67 × ${slopeAC.toFixed(2)} = ${(0.67 * slopeAC).toFixed(2)}`}
                </span>
                <span className="text-[7.5px] text-navy-400 block italic leading-tight pt-1">
                  For perpendicular lines: m_AB · m_AC = -1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEuclideanCircleDiagram = () => {
    const angleC = Math.min(Math.max(30, circleTheoremAngle), 150);
    
    const r = 50;
    const ox = 100, oy = 75;
    
    const radA = (210 * Math.PI) / 180;
    const radB = (330 * Math.PI) / 180;
    const radC = (angleC * Math.PI) / 180;
    
    const ax = ox + r * Math.cos(radA);
    const ay = oy - r * Math.sin(radA);
    
    const bx = ox + r * Math.cos(radB);
    const by = oy - r * Math.sin(radB);
    
    const cx = ox + r * Math.cos(radC);
    const cy = oy - r * Math.sin(radC);

    return (
      <div className="w-full max-w-md space-y-4 font-mono text-[10px]">
        <div className="text-center pb-2 border-b border-navy-100 dark:border-navy-800">
          <span className="text-[11px] font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest block">
            Euclidean Interactive Theorem Simulator
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Circle SVG */}
          <div className="relative bg-white dark:bg-navy-950 p-2 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm shrink-0">
            <svg width="200" height="150" className="overflow-visible">
              <circle cx={ox} cy={oy} r={r} stroke="#475569" strokeWidth="1.5" fill="none" />
              
              <line x1={ox} y1={oy} x2={ax} y2={ay} stroke="#1d4ed8" strokeWidth="1.5" />
              <line x1={ox} y1={oy} x2={bx} y2={by} stroke="#1d4ed8" strokeWidth="1.5" />
              
              <line x1={ax} y1={ay} x2={cx} y2={cy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2" />
              <line x1={bx} y1={by} x2={cx} y2={cy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2" />
              
              <circle cx={ox} cy={oy} r="3" fill="#1d4ed8" />
              <text x={ox - 10} y={oy - 5} fill="#1d4ed8" className="font-bold text-[8px]">O</text>
              
              <circle cx={ax} cy={ay} r="3" fill="#1d4ed8" />
              <text x={ax - 10} y={ay + 10} fill="#1d4ed8" className="font-bold text-[8px]">A</text>
              
              <circle cx={bx} cy={by} r="3" fill="#1d4ed8" />
              <text x={bx + 8} y={by + 10} fill="#1d4ed8" className="font-bold text-[8px]">B</text>
              
              <circle cx={cx} cy={cy} r="4" fill="#f59e0b" />
              <text x={cx + 8} y={cy - 5} fill="#f59e0b" className="font-black text-[8px]">C</text>
            </svg>
          </div>

          {/* Controls and calculations details */}
          <div className="flex-1 space-y-3.5 w-full text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-navy-400 block uppercase tracking-wider">
                Drag Point C along circle: {angleC}°
              </label>
              <input
                type="range"
                min="30"
                max="150"
                value={angleC}
                onChange={(e) => setCircleTheoremAngle(parseInt(e.target.value))}
                className="w-full h-1.5 bg-navy-100 dark:bg-navy-850 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-400"
              />
            </div>

            <div className="p-3 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Angle at Center (AOB):</span>
                <span className="font-bold text-royal-600 dark:text-gold-400 text-xs">120°</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Angle at Boundary (ACB):</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">60°</span>
              </div>

              <div className="pt-2 border-t border-navy-100 dark:border-navy-800 text-center">
                <span className="text-[9px] font-black text-navy-500 block uppercase tracking-wider">
                  Theorem Verification Proof
                </span>
                <span className="text-[9.5px] font-bold text-navy-600 dark:text-navy-300 block pt-0.5">
                  Angle AOB = 2 × Angle ACB
                </span>
                <span className="text-[10px] text-emerald-500 font-bold block pt-0.5">
                  120° = 2 × 60° (Verified!)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGenericDiagram = () => {
    return (
      <div className="w-full max-w-sm flex flex-col items-center p-4">
        <div className="w-12 h-12 bg-gradient-to-br from-royal-600 to-navy-900 dark:from-gold-500 dark:to-gold-600 rounded-xl flex items-center justify-center text-white dark:text-navy-950 font-bold text-xl font-sans mb-3 shadow-md">
          A
         </div>
        <span className="text-xs font-black font-sans text-navy-900 dark:text-white uppercase tracking-wider">
          Amaris Certified Revision Study Aid
        </span>
        <span className="text-[9px] text-navy-400 font-mono mt-1">
          PRETORIA • GAUTENG • SOUTH AFRICA
        </span>
      </div>
    );
  };

  const renderDiagram = (type: string | undefined) => {
    switch (type) {
      case "cast":
        return renderCASTDiagram();
      case "optimization":
        return renderOptimizationDiagram();
      case "analytical_geom":
        return renderAnalyticalGeomDiagram();
      case "euclidean_circle":
        return renderEuclideanCircleDiagram();
      default:
        return renderGenericDiagram();
    }
  };

  // Filter items
  const handlePreviewFile = (item: ResourceLibraryItem, initialPage?: number) => {
    setPreviewItem(item);
    setPreviewZoom(100);
    const saved = getPDFProgress(item.id);
    setPreviewPage(initialPage || saved?.lastReadPage || 1);
    setPreviewRotation(0);
    setPreviewSearch("");
    setIsFullscreen(false);
    setSelectedOutlineSection("");
  };

  // Handle PDF export using existing print-friendly CSS styles
  const handleExportPDF = (item?: ResourceLibraryItem | null) => {
    const target = item || previewItem || filteredResources[0] || resources[0];
    if (!target) return;

    setSelectedPrintItem(target);
    dbAPI.incrementResourcePrint(target.id);

    setTimeout(() => {
      window.print();
      loadResources();
    }, 100);
  };

  // Handle direct file download
  const handleDownloadFile = (item: ResourceLibraryItem) => {
    setDownloadingId(item.id);
    
    // Simulate real high-speed download progress
    setTimeout(() => {
      // Increment counter in DB
      dbAPI.incrementResourcePrint(item.id);
      
      // Create a genuine text/pdf template blob for actual student download
      const content = `===================================================================
AMARIS MATHEMATICS HUB - OFFICIAL MATRIC UPGRADE LEARNING PORTAL
===================================================================
DOCUMENT REFERENCE: ${item.id.toUpperCase()}
TITLE: ${item.title}
FILE: ${item.file_name}
SIZE: ${item.file_size}
CURRICULUM: ${item.syllabus || "CAPS / IEB"}
GRADE: ${item.grade_level || "Grade 12 / High School"}
TOPIC: ${item.topic || "Core Mathematics"}
CREATED AT: ${item.created_at}

-------------------------------------------------------------------
This certified study guide / past examination memo is provided
specifically for school-upgrade and second-chance candidates.

For professional live collaborative whiteboard tutoring with tutor
Bethuel Moukangwe (bethuelmoukangwe8@gmail.com), please visit:
https://ais-dev-mfbratrmytizrgy4yyqtay-29194979652.europe-west2.run.app

© 2026 Amaris Learning Academy. Pretoria, Gauteng. All rights reserved.
===================================================================
`;

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.file_name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Reset states
      setDownloadingId(null);
      setSuccessDownloadId(item.id);
      loadResources(); // Refresh downloads count in UI

      setTimeout(() => {
        setSuccessDownloadId(null);
      }, 3000);
    }, 1000);
  };

  // Handle simulated upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedUploadFile(file);
      setNewFileName(file.name);
      
      // Guess file type
      if (file.type.includes("pdf")) {
        setNewFileType("pdf");
      } else if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        setNewFileType("word");
      } else if (file.type.includes("image")) {
        setNewFileType("image");
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert("Please provide a resource title and description!");
      return;
    }

    const calculatedFileName = newFileName.trim() || "Calculus_Syllabus_Guide.pdf";
    const calculatedSize = selectedUploadFile 
      ? (selectedUploadFile.size / (1024 * 1024)).toFixed(1) + " MB" 
      : "1.2 MB";

    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Save to DB
            const newItem = dbAPI.addResourceItem({
              title: newTitle,
              description: newDesc,
              file_type: newFileType,
              file_name: calculatedFileName,
              file_size: calculatedSize,
              file_url: "#",
              syllabus: newSyllabus,
              grade_level: newGrade,
              topic: newTopic
            });

            // Extract and store technical metadata from uploaded file
            extractPDFMetadata(newItem, selectedUploadFile);

            // Log activity
            dbAPI.addActivityLog({
              user_name: `${user.first_name} ${user.surname} (${user.role})`,
              action: "Uploaded Study Material",
              details: `Uploaded '${newTitle}' categorized under ${newGrade} - ${newSyllabus} (${newTopic})`,
              type: "homework"
            });

            // Reset upload form
            setNewTitle("");
            setNewDesc("");
            setNewFileName("");
            setSelectedUploadFile(null);
            setUploadProgress(null);
            setIsUploadOpen(false);
            loadResources();
            alert("Success! Your resource has been successfully indexed in the Student Library.");
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Formula calculator runner
  const handleCalculateFormula = (calcType: string, inputs: Record<string, string>) => {
    try {
      const steps: string[] = [];
      let result = "";

      if (calcType === "quadratic") {
        const a = parseFloat(inputs["a"] || "1");
        const b = parseFloat(inputs["b"] || "-5");
        const c = parseFloat(inputs["c"] || "6");

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
          throw new Error("Please enter valid numeric coefficients");
        }

        if (a === 0) {
          steps.push("Since a = 0, this is a linear equation: bx + c = 0");
          steps.push(`Solving ${b}x + ${c} = 0`);
          const x = -c / b;
          steps.push(`x = -(${c}) / ${b}`);
          result = `x = ${x.toFixed(4)}`;
        } else {
          steps.push(`Standard Form: ${a}x² + (${b})x + (${c}) = 0`);
          const d = b * b - 4 * a * c;
          steps.push(`Discriminant (Δ) = b² - 4ac`);
          steps.push(`Δ = (${b})² - 4(${a})(${c})`);
          steps.push(`Δ = ${b * b} - ${4 * a * c} = ${d}`);

          let natureOfRoots = "";
          if (d < 0) {
            natureOfRoots = "Non-real (complex) roots";
          } else if (d === 0) {
            natureOfRoots = "Real, rational, and equal roots";
          } else {
            const isPerfectSquare = Math.sqrt(d) % 1 === 0;
            natureOfRoots = `Real, unequal, and ${isPerfectSquare ? "rational" : "irrational"} roots`;
          }
          steps.push(`Nature of Roots: ${natureOfRoots}`);

          if (d < 0) {
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-d) / (2 * a);
            steps.push(`x = [-b ± i√(-Δ)] / 2a`);
            steps.push(`x = [ -(${b}) ± i√(${Math.abs(d)}) ] / 2(${a})`);
            result = `x₁ = ${realPart.toFixed(3)} + ${imagPart.toFixed(3)}i, x₂ = ${realPart.toFixed(3)} - ${imagPart.toFixed(3)}i`;
          } else {
            steps.push(`x = [-b ± √Δ] / 2a`);
            steps.push(`x = [ -(${b}) ± √(${d}) ] / 2(${a})`);
            const x1 = (-b + Math.sqrt(d)) / (2 * a);
            const x2 = (-b - Math.sqrt(d)) / (2 * a);
            steps.push(`x₁ = (${-b} + ${Math.sqrt(d).toFixed(4)}) / ${2 * a} = ${x1.toFixed(4)}`);
            steps.push(`x₂ = (${-b} - ${Math.sqrt(d).toFixed(4)}) / ${2 * a} = ${x2.toFixed(4)}`);
            result = `x₁ = ${x1.toFixed(4)}  or  x₂ = ${x2.toFixed(4)}`;
          }
        }
      } else if (calcType === "compound") {
        const P = parseFloat(inputs["P"] || "5000");
        const i = parseFloat(inputs["i"] || "8.5");
        const n = parseFloat(inputs["n"] || "5");

        if (isNaN(P) || isNaN(i) || isNaN(n)) {
          throw new Error("Please enter valid numeric investment values");
        }

        const iDec = i / 100;
        steps.push(`Formula: A = P(1 + i)ⁿ`);
        steps.push(`Principal (P) = R ${P.toLocaleString()}`);
        steps.push(`Interest rate (i) = ${i}% = ${iDec}`);
        steps.push(`Duration (n) = ${n} periods`);
        steps.push(`A = ${P} * (1 + ${iDec})^${n}`);
        
        const base = 1 + iDec;
        const multiplier = Math.pow(base, n);
        steps.push(`A = ${P} * (${base.toFixed(4)})^${n}`);
        steps.push(`A = ${P} * ${multiplier.toFixed(6)}`);
        
        const A = P * multiplier;
        const interestEarned = A - P;
        steps.push(`Accumulated Amount = R ${A.toFixed(2)}`);
        steps.push(`Interest Earned = R ${interestEarned.toFixed(2)}`);
        result = `A = R ${A.toFixed(2)} (Earned R ${interestEarned.toFixed(2)} interest)`;
      } else if (calcType === "distance") {
        const x1 = parseFloat(inputs["x1"] || "1");
        const y1 = parseFloat(inputs["y1"] || "2");
        const x2 = parseFloat(inputs["x2"] || "4");
        const y2 = parseFloat(inputs["y2"] || "6");

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          throw new Error("Please enter valid numeric coordinates");
        }

        steps.push(`Formula: d = √((x₂ - x₁)² + (y₂ - y₁)²)`);
        steps.push(`Points: A(${x1}; ${y1}) and B(${x2}; ${y2})`);
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        steps.push(`Δx = x₂ - x₁ = ${x2} - ${x1} = ${dx}`);
        steps.push(`Δy = y₂ - y₁ = ${y2} - ${y1} = ${dy}`);
        steps.push(`d = √((Δx)² + (Δy)²)`);
        steps.push(`d = √(${dx}² + ${dy}²)`);
        
        const dx2 = dx * dx;
        const dy2 = dy * dy;
        const sumOfSquares = dx2 + dy2;
        steps.push(`d = √(${dx2} + ${dy2})`);
        steps.push(`d = √(${sumOfSquares})`);
        
        const d = Math.sqrt(sumOfSquares);
        result = `d = ${d.toFixed(4)} units`;
      } else if (calcType === "midpoint") {
        const x1 = parseFloat(inputs["x1"] || "-2");
        const y1 = parseFloat(inputs["y1"] || "4");
        const x2 = parseFloat(inputs["x2"] || "6");
        const y2 = parseFloat(inputs["y2"] || "8");

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          throw new Error("Please enter valid numeric coordinates");
        }

        steps.push(`Formula: M(x; y) = ((x₁ + x₂)/2 ; (y₁ + y₂)/2)`);
        steps.push(`Points: A(${x1}; ${y1}) and B(${x2}; ${y2})`);
        
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        steps.push(`x_mid = (${x1} + ${x2}) / 2 = ${midX}`);
        steps.push(`y_mid = (${y1} + ${y2}) / 2 = ${midY}`);
        
        result = `M = (${midX}; ${midY})`;
      } else if (calcType === "arithmetic_series") {
        const a = parseFloat(inputs["a"] || "3");
        const d = parseFloat(inputs["d"] || "5");
        const n = parseFloat(inputs["n"] || "10");

        if (isNaN(a) || isNaN(d) || isNaN(n)) {
          throw new Error("Please enter valid numeric series terms");
        }

        if (n <= 0 || !Number.isInteger(n)) {
          throw new Error("Term number (n) must be a positive integer");
        }

        steps.push(`Formula: T_n = a + (n - 1)d`);
        steps.push(`First Term (a) = ${a}`);
        steps.push(`Common Difference (d) = ${d}`);
        steps.push(`Term Position (n) = ${n}`);
        steps.push(`T_${n} = ${a} + (${n} - 1)*${d}`);
        
        const tn = a + (n - 1) * d;
        steps.push(`T_${n} = ${a} + (${n - 1})*${d}`);
        steps.push(`T_${n} = ${a} + ${(n - 1) * d} = ${tn}`);

        // Sum
        steps.push(`Sum Formula: S_n = (n/2) * [2a + (n-1)d]`);
        steps.push(`S_${n} = (${n}/2) * [2(${a}) + (${n}-1)*${d}]`);
        const sn = (n / 2) * (2 * a + (n - 1) * d);
        steps.push(`S_${n} = ${n / 2} * [${2 * a} + ${(n - 1) * d}]`);
        steps.push(`S_${n} = ${n / 2} * [${2 * a + (n - 1) * d}] = ${sn}`);

        result = `T_${n} = ${tn}  |  Sum S_${n} = ${sn}`;
      } else if (calcType === "geometric_series") {
        const a = parseFloat(inputs["a"] || "2");
        const r = parseFloat(inputs["r"] || "3");
        const n = parseFloat(inputs["n"] || "5");

        if (isNaN(a) || isNaN(r) || isNaN(n)) {
          throw new Error("Please enter valid numeric sequence factors");
        }

        if (n <= 0 || !Number.isInteger(n)) {
          throw new Error("Term number (n) must be a positive integer");
        }

        steps.push(`Formula: T_n = a * r^(n-1)`);
        steps.push(`First Term (a) = ${a}`);
        steps.push(`Common Ratio (r) = ${r}`);
        steps.push(`Term Position (n) = ${n}`);
        
        const tn = a * Math.pow(r, n - 1);
        steps.push(`T_${n} = ${a} * (${r})^(${n} - 1)`);
        steps.push(`T_${n} = ${a} * (${r})^${n - 1}`);
        steps.push(`T_${n} = ${a} * ${Math.pow(r, n - 1)} = ${tn}`);

        // Sum
        steps.push(`Sum Formula: S_n = a(rⁿ - 1) / (r - 1)`);
        const sn = r === 1 ? a * n : (a * (Math.pow(r, n) - 1)) / (r - 1);
        if (r === 1) {
          steps.push(`Since r = 1, S_${n} = a * n = ${a} * ${n} = ${sn}`);
        } else {
          steps.push(`S_${n} = ${a} * ((${r})^${n} - 1) / (${r} - 1)`);
          steps.push(`S_${n} = ${a} * (${Math.pow(r, n)} - 1) / ${r - 1}`);
          steps.push(`S_${n} = ${a} * ${Math.pow(r, n) - 1} / ${r - 1} = ${sn}`);
        }

        // Infinite sum check
        if (Math.abs(r) < 1) {
          const sinf = a / (1 - r);
          steps.push(`Sum to Infinity (S_∞) is convergent since |r| = |${r}| < 1`);
          steps.push(`S_∞ = a / (1 - r) = ${a} / (1 - ${r}) = ${sinf.toFixed(4)}`);
        } else {
          steps.push(`Sum to Infinity (S_∞) is divergent since |r| = |${r}| ≥ 1`);
        }

        result = `T_${n} = ${tn}  |  Sum S_${n} = ${sn}`;
      }

      setCalcSteps(steps);
      setCalcResult(result);
    } catch (err: any) {
      setCalcResult(`Error: ${err.message}`);
      setCalcSteps([]);
    }
  };

  // Pre-fill inputs when activeFormulaCalcId changes
  useEffect(() => {
    if (activeFormulaCalcId) {
      const formula = FORMULAS_DATABASE.find(f => f.id === activeFormulaCalcId);
      if (formula) {
        const initialInputs: Record<string, string> = {};
        formula.variables.forEach(v => {
          initialInputs[v.name] = v.defaultValue;
        });
        setCalcInputs(initialInputs);
        handleCalculateFormula(formula.calcType || "", initialInputs);
      }
    } else {
      setCalcInputs({});
      setCalcResult(null);
      setCalcSteps([]);
    }
  }, [activeFormulaCalcId]);

  const isTutorOrAdmin = user.role === "admin" || user.role === "tutor";

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Header section with upload button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-royal-600 dark:text-gold-400" />
            <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
              Matric Resource & Past Paper Library
            </h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Download high-quality study notes, handwritten equation guides, and official CAPS & IEB exam questions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Layout View Switcher Toggle */}
          <div className="flex items-center bg-navy-100 dark:bg-navy-900 p-1 rounded-xl border border-navy-200 dark:border-navy-800 shrink-0">
            <button
              id="btn-view-mode-grid"
              onClick={() => setResourceViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                resourceViewMode === "grid"
                  ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 shadow-xs font-black"
                  : "text-navy-500 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
              title="Standard Grid card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              id="btn-view-mode-list"
              onClick={() => setResourceViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                resourceViewMode === "list"
                  ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 shadow-xs font-black"
                  : "text-navy-500 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
              title="Compact List view for easier scanning of large file lists"
            >
              <List className="w-3.5 h-3.5" />
              <span>Compact List</span>
            </button>
          </div>

          <button
            id="btn-trigger-print-preview"
            onClick={() => setIsPrintPreviewOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-navy-800 to-royal-900 border border-gold-400/30 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            title="Preview rendered math worksheet layout before sending to printer"
          >
            <Maximize2 className="w-4 h-4 text-gold-400" />
            <span>Print Preview</span>
          </button>

          <DownloadWorksheetPDFButton
            id="btn-download-lesson-pdf"
            targetSelector="#resource-printable-area"
            worksheetTitle={selectedPrintItem?.title || previewItem?.title || "AMH_Study_Resource"}
            grade={selectedPrintItem?.grade_level || previewItem?.grade_level || "Grade 12"}
            subject={selectedPrintItem?.syllabus || previewItem?.syllabus || "Mathematics"}
            variant="emerald"
            size="md"
            label="Download as PDF"
            onBeforePrint={() => {
              const target = previewItem || filteredResources[0] || resources[0];
              if (target) {
                setSelectedPrintItem(target);
                dbAPI.incrementResourcePrint(target.id);
              }
            }}
            onAfterPrint={() => loadResources()}
          />

          <button
            id="btn-trigger-formula-sheet"
            onClick={() => setIsFormulaOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            title="Interactive Formula Sheet & Math Calculator Sandbox"
          >
            <Calculator className="w-4 h-4" />
            <span>Quick Formula Sheet</span>
          </button>

          {isTutorOrAdmin && (
            <button
              id="btn-trigger-upload-library"
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-750 hover:to-royal-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Study Material</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab switcher segmented control */}
      <div className="flex border-b border-navy-100 dark:border-navy-800 gap-6">
        <button
          onClick={() => {
            setActiveTab("papers");
            setActiveFormulaCalcId(null);
          }}
          type="button"
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 relative cursor-pointer ${
            activeTab === "papers"
              ? "border-amber-500 text-amber-500 font-black"
              : "border-transparent text-navy-400 hover:text-navy-950 dark:hover:text-white"
          }`}
        >
          📚 Study Guides & Past Papers
        </button>
        <button
          id="btn-formula-tab-trigger"
          onClick={() => {
            setActiveTab("formulas");
            setActiveFormulaCalcId(null);
          }}
          type="button"
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 relative cursor-pointer ${
            activeTab === "formulas"
              ? "border-amber-500 text-amber-500 font-black"
              : "border-transparent text-navy-400 hover:text-navy-950 dark:hover:text-white"
          }`}
        >
          🧮 Quick Formula Reference Grid
        </button>
      </div>

      {/* Grid with Search / Filters and Bookshelf */}
      {activeTab === "papers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FILTERS PANEL */}
        <aside className="lg:col-span-3 space-y-4 bg-navy-50/50 dark:bg-navy-950/25 p-4 rounded-xl border border-navy-100 dark:border-navy-850">
          <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-2">
            <span className="text-[10px] font-mono font-black uppercase text-navy-600 dark:text-navy-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Resource Filter Cockpit
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSyllabus("All");
                setSelectedGrade("All");
                setSelectedTopic("All");
              }}
              className="text-[9px] font-mono text-royal-600 dark:text-gold-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          {/* Search bar input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-navy-400" />
              <input
                id="library-search-input"
                type="text"
                placeholder="e.g. Calculus, Memo 2025"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:border-royal-500"
              />
            </div>
          </div>

          {/* Syllabus Switch */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase">Syllabus Path</label>
            <div className="flex flex-col gap-1.5">
              {["All", "CAPS", "IEB", "Both"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSyllabus(s as any)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedSyllabus === s
                      ? "bg-royal-600 text-white font-extrabold"
                      : "bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-850"
                  }`}
                >
                  <span>{s === "Both" ? "Universal Guides" : s === "All" ? "All Syllabi" : `${s} Curriculum`}</span>
                  {selectedSyllabus === s && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Grade selection */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase">Grade Level</label>
            <div className="flex flex-wrap gap-1.5">
              {["All", "Grade 10", "Grade 11", "Grade 12"].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 text-center cursor-pointer ${
                    selectedGrade === g
                      ? "bg-amber-500 text-navy-950 font-black"
                      : "bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-850"
                  }`}
                >
                  {g === "All" ? "All Grades" : g}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Select List */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase">Mathematics Chapter</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
            >
              {topicsList.map(t => (
                <option key={t} value={t}>{t === "All Topics" ? "All Chapters" : t}</option>
              ))}
            </select>
          </div>

        </aside>

        {/* BOOKSHELF / RESULTS GRID */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* IEB QUICK YEAR SELECTION DECK */}
          <div className="bg-gradient-to-r from-amber-500/5 to-royal-500/5 dark:from-amber-400/[0.02] dark:to-royal-400/[0.02] border border-amber-500/10 dark:border-amber-400/10 rounded-2xl p-4 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  IEB Past Papers Quick-Launch (2015 - 2025)
                </span>
                <p className="text-[11px] text-navy-500 dark:text-navy-400">
                  Select a year below to instantly filter all IEB core math exam papers and official marking memorandums.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSyllabus("IEB");
                  setSelectedGrade("Grade 12");
                  setSearchQuery("");
                }}
                className="text-[10px] font-mono bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-800 dark:text-gold-400 px-2.5 py-1 rounded-lg transition-all cursor-pointer self-start sm:self-auto"
              >
                Show All IEB Papers
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((year) => {
                const isSelected = selectedSyllabus === "IEB" && searchQuery === year.toString();
                return (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedSyllabus("IEB");
                      setSelectedGrade("Grade 12");
                      setSearchQuery(year.toString());
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? "bg-amber-500 text-navy-950 border-amber-500 font-black shadow-sm"
                        : "bg-white hover:bg-navy-50 dark:bg-navy-900 dark:hover:bg-navy-850 border-navy-150 dark:border-navy-800 text-navy-700 dark:text-navy-300"
                    }`}
                  >
                    <span>{year}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-navy-400 px-1">
            <span>Found {filteredResources.length} matching resources</span>
            <div className="flex items-center gap-3">
              <span>Sorted by recent additions</span>
              <div className="flex items-center bg-navy-100 dark:bg-navy-900 p-0.5 rounded-lg border border-navy-200 dark:border-navy-800">
                <button
                  onClick={() => setResourceViewMode("grid")}
                  className={`p-1 rounded text-xs transition-all cursor-pointer ${
                    resourceViewMode === "grid"
                      ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 shadow-xs font-bold"
                      : "text-navy-400 hover:text-navy-900 dark:hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setResourceViewMode("list")}
                  className={`p-1 rounded text-xs transition-all cursor-pointer ${
                    resourceViewMode === "list"
                      ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 shadow-xs font-bold"
                      : "text-navy-400 hover:text-navy-900 dark:hover:text-white"
                  }`}
                  title="Compact List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {filteredResources.length > 0 ? (
            resourceViewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredResources.map((item) => {
                const isDownloading = downloadingId === item.id;
                const isSuccess = successDownloadId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    id={`resource-card-${item.id}`}
                    layout
                    className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 hover:border-royal-400/40 dark:hover:border-gold-500/30 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      {/* Meta Tags bar */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                          item.syllabus === "CAPS" ? "bg-royal-100 text-royal-800 dark:bg-royal-950/60 dark:text-royal-300" :
                          item.syllabus === "IEB" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                          "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                        }`}>
                          {item.syllabus === "Both" ? "CAPS & IEB" : item.syllabus || "Syllabus"}
                        </span>

                        <span className="text-[8px] font-mono font-black uppercase bg-navy-50 text-navy-600 dark:bg-navy-900 dark:text-navy-400 px-1.5 py-0.5 rounded">
                          {item.grade_level === "All" ? "Grades 10-12" : item.grade_level || "Grade 12"}
                        </span>

                        <span className="text-[8px] font-mono font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded ml-auto">
                          {item.topic || "Algebra"}
                        </span>
                      </div>

                      {/* Title & description */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-navy-900 dark:text-white leading-snug group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed font-sans line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* PDF Reading Progress Tracker */}
                      {(() => {
                        const progress = pdfProgressMap[item.id] || getPDFProgress(item.id);
                        const docPages = getDocumentPages(item.id, item.title);
                        const totalP = docPages.length;
                        const pct = progress ? progress.percentage : 0;
                        const maxRead = progress ? progress.maxPageRead : 0;
                        const lastPage = progress ? progress.lastReadPage : 1;

                        return (
                          <div className="pt-2 border-t border-navy-100/60 dark:border-navy-850/60 space-y-1.5 font-mono text-[10px]">
                            <div className="flex items-center justify-between text-navy-600 dark:text-navy-300">
                              <span className="flex items-center gap-1 font-bold">
                                {pct === 100 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 100% Read
                                  </span>
                                ) : pct > 0 ? (
                                  <span className="text-amber-700 dark:text-gold-400 font-black flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                    {pct}% Complete ({maxRead}/{totalP} pgs)
                                  </span>
                                ) : (
                                  <span className="text-navy-400 italic">
                                    Unread • {totalP} Pages
                                  </span>
                                )}
                              </span>

                              {progress && lastPage > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewFile(item, lastPage);
                                  }}
                                  className="text-[9.5px] font-black text-royal-600 dark:text-gold-400 hover:text-royal-700 dark:hover:text-gold-300 hover:underline flex items-center gap-0.5 cursor-pointer bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/20"
                                  title={`Resume reading from Page ${lastPage}`}
                                >
                                  <span>Resume Pg {lastPage}</span>
                                  <ChevronRight className="w-3 h-3 text-amber-500" />
                                </button>
                              )}
                            </div>

                            {/* Progress bar visual fill */}
                            <div className="w-full h-1.5 bg-navy-100 dark:bg-navy-850 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  pct === 100
                                    ? "bg-emerald-500"
                                    : pct > 0
                                    ? "bg-gradient-to-r from-amber-500 to-gold-400"
                                    : "bg-transparent"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Download Controls & metadata */}
                    <div className="border-t border-navy-100/60 dark:border-navy-850/60 pt-3 flex items-center justify-between gap-4 mt-auto">
                      <div className="flex items-center gap-2">
                        {item.file_type === "pdf" ? (
                          <div className="p-2 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                        ) : item.file_type === "word" ? (
                          <div className="p-2 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            <FileImage className="w-4 h-4" />
                          </div>
                        )}
                        <div className="text-left font-mono">
                          <span className="text-[10px] text-navy-800 dark:text-navy-200 block font-bold truncate max-w-[130px]" title={item.file_name}>
                            {item.file_name}
                          </span>
                          <span className="text-[8px] text-navy-400 block">
                            {item.file_size} | {item.print_count || 0} Downloads
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Copy Share Link Button with Animated Tooltip */}
                        <div className="relative">
                          <button
                            id={`btn-share-link-${item.id}`}
                            onClick={(e) => handleCopyShareLink(item, e)}
                            className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                              copiedShareId === item.id
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-md scale-105"
                                : "bg-royal-500/10 hover:bg-royal-500/20 text-royal-700 dark:text-gold-400 border-royal-500/30"
                            }`}
                            title="Copy unique temporary share URL to clipboard"
                          >
                            {copiedShareId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                                <span className="hidden sm:inline">Share Link</span>
                              </>
                            )}
                          </button>

                          {/* Tooltip confirmation popup */}
                          <AnimatePresence>
                            {copiedShareId === item.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 px-3 py-1.5 bg-navy-950 text-white dark:bg-gold-400 dark:text-navy-950 text-[10px] font-mono font-bold rounded-xl shadow-xl border border-navy-700 dark:border-gold-300 flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-navy-900" />
                                <span>Share link copied to clipboard!</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-950 dark:border-t-gold-400" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={() => setLightweightPreviewItem(item)}
                          className="px-2.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-gold-400 rounded-xl text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="View 1st page preview directly in a modal without full download"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-500" />
                          <span>1st Page Preview</span>
                        </button>

                        <button
                          onClick={() => handlePreviewFile(item)}
                          className="px-2.5 py-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-900 dark:hover:bg-navy-850 text-navy-800 dark:text-navy-200 rounded-xl text-xs font-bold border border-navy-200 dark:border-navy-800 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Full interactive document preview"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                          <span className="hidden xl:inline">Full</span>
                        </button>

                        <button
                          id={`btn-export-pdf-${item.id}`}
                          onClick={() => handleExportPDF(item)}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Download clean exportable PDF of this lesson content using print-friendly styles"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">Download PDF</span>
                        </button>

                        <button
                          onClick={() => handleDownloadFile(item)}
                          disabled={isDownloading}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSuccess
                              ? "bg-emerald-500 text-white font-bold"
                              : isDownloading
                                ? "bg-navy-100 dark:bg-navy-800 text-navy-400 cursor-wait"
                                : "bg-royal-600 hover:bg-royal-700 text-white dark:bg-gold-500 dark:hover:bg-gold-600 dark:text-navy-950 border border-royal-200/40 dark:border-gold-500/10"
                          }`}
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Saved</span>
                            </>
                          ) : isDownloading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Downloading</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Get File</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
            ) : (
            /* COMPACT LIST VIEW */
            <div className="space-y-2">
              {filteredResources.map((item) => {
                const isDownloading = downloadingId === item.id;
                const isSuccess = successDownloadId === item.id;
                const progress = pdfProgressMap[item.id] || getPDFProgress(item.id);
                const docPages = getDocumentPages(item.id, item.title);
                const totalP = docPages.length;
                const pct = progress ? progress.percentage : 0;
                const lastPage = progress ? progress.lastReadPage : 1;

                return (
                  <motion.div
                    key={item.id}
                    id={`resource-card-${item.id}`}
                    layout
                    className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 hover:border-royal-400/40 dark:hover:border-gold-500/30 rounded-xl p-3 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-left group"
                  >
                    {/* Left details & icon */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {item.file_type === "pdf" ? (
                          <div className="p-2 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                        ) : item.file_type === "word" ? (
                          <div className="p-2 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            <FileImage className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                            item.syllabus === "CAPS" ? "bg-royal-100 text-royal-800 dark:bg-royal-950/60 dark:text-royal-300" :
                            item.syllabus === "IEB" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                            "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                          }`}>
                            {item.syllabus === "Both" ? "CAPS & IEB" : item.syllabus || "Syllabus"}
                          </span>
                          <span className="text-[8px] font-mono font-black uppercase bg-navy-50 text-navy-600 dark:bg-navy-900 dark:text-navy-400 px-1.5 py-0.5 rounded">
                            {item.grade_level === "All" ? "Grades 10-12" : item.grade_level || "Grade 12"}
                          </span>
                          <span className="text-[8px] font-mono font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                            {item.topic || "Algebra"}
                          </span>

                          {pct > 0 && (
                            <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                              pct === 100 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                            }`}>
                              {pct === 100 ? "100% Read" : `${pct}% Read`}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-black text-navy-900 dark:text-white leading-snug group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors truncate">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-3 text-[10px] text-navy-500 dark:text-navy-400 font-mono">
                          <span className="truncate max-w-[180px]">{item.file_name}</span>
                          <span>•</span>
                          <span>{item.file_size}</span>
                          <span>•</span>
                          <span>{item.print_count || 0} downloads</span>
                        </div>
                      </div>
                    </div>

                    {/* Right compact actions */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <div className="relative">
                        <button
                          id={`btn-share-link-list-${item.id}`}
                          onClick={(e) => handleCopyShareLink(item, e)}
                          className={`p-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            copiedShareId === item.id
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-royal-500/10 hover:bg-royal-500/20 text-royal-700 dark:text-gold-400 border-royal-500/30"
                          }`}
                          title="Share Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <AnimatePresence>
                          {copiedShareId === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute bottom-full right-0 mb-1 z-30 px-2 py-1 bg-navy-950 text-white text-[9px] font-mono font-bold rounded-md shadow-md"
                            >
                              Copied!
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={() => setLightweightPreviewItem(item)}
                        className="px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-gold-400 rounded-lg text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                        title="1st Page Preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px] hidden sm:inline">1st Page</span>
                      </button>

                      <button
                        onClick={() => handlePreviewFile(item)}
                        className="px-2 py-1.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-900 dark:hover:bg-navy-850 text-navy-800 dark:text-navy-200 rounded-lg text-xs font-bold border border-navy-200 dark:border-navy-800 transition-all flex items-center gap-1 cursor-pointer"
                        title="Full Preview"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                        <span className="text-[11px] hidden sm:inline">Preview</span>
                      </button>

                      <button
                        id={`btn-export-pdf-list-${item.id}`}
                        onClick={() => handleExportPDF(item)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </button>

                      <button
                        onClick={() => handleDownloadFile(item)}
                        disabled={isDownloading}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isSuccess
                            ? "bg-emerald-500 text-white"
                            : isDownloading
                              ? "bg-navy-100 dark:bg-navy-800 text-navy-400 cursor-wait"
                              : "bg-royal-600 hover:bg-royal-700 text-white dark:bg-gold-500 dark:hover:bg-gold-600 dark:text-navy-950"
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : isDownloading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px]">{isSuccess ? "Saved" : isDownloading ? "..." : "Get File"}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-navy-200 dark:border-navy-800 rounded-2xl space-y-4">
              <BookOpen className="w-12 h-12 text-navy-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-navy-900 dark:text-white">No Matching Guides Found</h4>
                <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
                  Adjust your grade, topic selection, or syllabus filters to browse other math papers.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSyllabus("All");
                  setSelectedGrade("All");
                  setSelectedTopic("All");
                }}
                className="px-4 py-2 bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 text-xs font-bold rounded-lg cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>

      </div>
      )}

      {/* Grid layout for common math formulas with search & filter */}
      {activeTab === "formulas" && (
        <div className="space-y-6">
          {/* Formula Search & Filters bar */}
          <div className="p-5 bg-navy-50/50 dark:bg-navy-900/40 border border-navy-150 dark:border-navy-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="Search formulas (e.g., Quadratic, Sine, Power rule)..."
                value={formulaSearchQuery}
                onChange={(e) => setFormulaSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Topic & Syllabus Selects */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <span className="text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase">Topic:</span>
              <select
                value={selectedFormulaTopic}
                onChange={(e) => {
                  setSelectedFormulaTopic(e.target.value);
                  setActiveFormulaCalcId(null);
                }}
                className="px-3 py-1.5 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
              >
                {["All", "Algebra & Sequences", "Trigonometry", "Analytical Geometry", "Differential Calculus", "Financial Mathematics", "Probability"].map(t => (
                  <option key={t} value={t}>{t === "All" ? "All Topics" : t}</option>
                ))}
              </select>

              <span className="text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase">Syllabus:</span>
              <select
                value={selectedSyllabus}
                onChange={(e) => setSelectedSyllabus(e.target.value as any)}
                className="px-3 py-1.5 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Syllabi</option>
                <option value="CAPS">CAPS</option>
                <option value="IEB">IEB</option>
              </select>
            </div>
          </div>

          {/* Formulas Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Cards Column */}
            <div className={`${activeFormulaCalcId ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FORMULAS_DATABASE.filter(f => {
                  const matchesTopic = selectedFormulaTopic === "All" || f.topic === selectedFormulaTopic;
                  const matchesSyllabus = selectedSyllabus === "All" || f.syllabus === "Both" || f.syllabus === selectedSyllabus;
                  const matchesSearch = f.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) || 
                                       f.description.toLowerCase().includes(formulaSearchQuery.toLowerCase()) || 
                                       f.expression.toLowerCase().includes(formulaSearchQuery.toLowerCase());
                  return matchesTopic && matchesSyllabus && matchesSearch;
                }).map((formula) => {
                  const isSelected = activeFormulaCalcId === formula.id;
                  return (
                    <div
                      key={formula.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/5 border-amber-500/45 ring-1 ring-amber-500/20 shadow-md"
                          : "bg-white dark:bg-navy-950 border-navy-150 dark:border-navy-850 hover:border-navy-200 dark:hover:border-navy-800 hover:shadow-sm"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[8px] font-mono font-black uppercase bg-navy-100 text-navy-700 dark:bg-navy-900 dark:text-navy-400 px-1.5 py-0.5 rounded">
                            {formula.topic} • {formula.grade}
                          </span>
                          <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                            formula.syllabus === "CAPS" ? "bg-royal-100 text-royal-800 dark:bg-royal-950/60 dark:text-royal-300" :
                            formula.syllabus === "IEB" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                            "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                          }`}>
                            {formula.syllabus === "Both" ? "CAPS & IEB" : formula.syllabus}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-navy-900 dark:text-white tracking-tight">{formula.name}</h4>

                        <div className="p-3 bg-slate-900 dark:bg-black rounded-xl text-center font-mono text-xs font-bold text-amber-400 overflow-x-auto leading-relaxed border border-navy-800/80">
                          {formula.expression}
                        </div>

                        <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed font-sans line-clamp-3">
                          {formula.description}
                        </p>
                      </div>

                      {formula.calcType && (
                        <div className="pt-3 border-t border-navy-100/60 dark:border-navy-850/60 mt-4">
                          <button
                            onClick={() => setActiveFormulaCalcId(isSelected ? null : formula.id)}
                            className={`w-full py-2 rounded-xl text-[10px] font-black font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-amber-500 text-navy-950 border-amber-500"
                                : "bg-royal-50 hover:bg-royal-100 dark:bg-navy-900 hover:dark:bg-navy-850 text-royal-600 dark:text-gold-400 border-royal-200/40 dark:border-gold-500/10"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isSelected ? "Active Calculator Sandbox" : "Try Live Calculator Solver"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Solver Column */}
            {activeFormulaCalcId && (() => {
              const formula = FORMULAS_DATABASE.find(f => f.id === activeFormulaCalcId);
              if (!formula) return null;
              return (
                <div className="lg:col-span-5 bg-navy-50/50 dark:bg-navy-900/30 border border-navy-150 dark:border-navy-800/80 rounded-2xl p-5 space-y-5 animate-fadeIn self-start">
                  <div className="flex items-center justify-between pb-3 border-b border-navy-150 dark:border-navy-800">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider">
                        Live Sandbox: {formula.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveFormulaCalcId(null)}
                      className="text-[10px] font-mono text-navy-400 hover:text-navy-600 dark:hover:text-white cursor-pointer"
                    >
                      Close Solver
                    </button>
                  </div>

                  {/* Substitution Inputs */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono font-black uppercase text-navy-400 block tracking-widest">
                      STEP 1: INPUT VALUES
                    </span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {formula.variables.map((variable) => (
                        <div key={variable.name} className="space-y-1">
                          <label className="block text-[10px] font-mono text-navy-500 dark:text-navy-400">
                            {variable.label} ({variable.name})
                          </label>
                          <input
                            type="text"
                            placeholder={variable.placeholder}
                            value={calcInputs[variable.name] || ""}
                            onChange={(e) => {
                              const updated = { ...calcInputs, [variable.name]: e.target.value };
                              setCalcInputs(updated);
                              handleCalculateFormula(formula.calcType || "", updated);
                            }}
                            className="w-full px-3 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-xs text-navy-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formula calculations steps logs */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-mono font-black uppercase text-navy-400 block tracking-widest">
                      STEP 2: SUBSTITUTION STEPS
                    </span>
                    
                    <div className="p-3.5 bg-navy-900 dark:bg-black rounded-xl border border-navy-850 font-mono text-[10px] text-navy-300 space-y-2.5 leading-relaxed overflow-x-auto max-h-48 overflow-y-auto w-full">
                      {calcSteps.length > 0 ? (
                        calcSteps.map((step, idx) => (
                          <div key={idx} className="flex gap-2 text-left">
                            <span className="text-amber-500 shrink-0">[{idx + 1}]</span>
                            <span>{step}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-navy-500">No steps calculated. Enter variables above.</div>
                      )}
                    </div>
                  </div>

                  {/* Final computed result */}
                  <div className="p-4 bg-amber-500/10 dark:bg-amber-500/[0.03] border border-amber-500/20 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-mono font-black uppercase text-amber-600 dark:text-gold-400 block tracking-widest">
                      STEP 3: COMPUTED OUTCOME
                    </span>
                    <div className="font-mono text-xs font-black text-navy-950 dark:text-white leading-relaxed break-words">
                      {calcResult || "Awaiting dynamic inputs..."}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TUTOR RESOURCE UPLOAD MODAL / DRAWER */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-white dark:bg-navy-900 h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                
                {/* Modal Title Banner */}
                <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                    <h3 className="text-base font-black text-navy-900 dark:text-white uppercase tracking-tight">
                      Upload Math Resource Index
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="p-1 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-lg text-navy-400 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form id="upload-resource-form" onSubmit={handleUploadSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">Resource Title</label>
                    <input
                      id="upload-title-input"
                      type="text"
                      required
                      placeholder="e.g. Grade 12 Sequences & Series Formula Workbook"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">Resource Description</label>
                    <textarea
                      id="upload-desc-input"
                      required
                      rows={3}
                      placeholder="Explain to students what study advantages this document provides, key equations addressed, and how it aligns with Trial or Final NSC preps."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Drag-and-drop / File Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">Select Material File (Simulated PDF/DOCX)</label>
                    <div className="border-2 border-dashed border-navy-200 dark:border-navy-800 rounded-xl p-5 text-center bg-navy-50/20 dark:bg-navy-950/25 space-y-2 hover:bg-navy-50/50 dark:hover:bg-navy-950/40 transition-colors relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                      />
                      <Download className="w-8 h-8 text-navy-400 mx-auto" />
                      {selectedUploadFile ? (
                        <div className="text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold block">✓ File attached:</span>
                          <span className="text-navy-900 dark:text-white font-mono">{selectedUploadFile.name}</span>
                          <span className="text-navy-400 block text-[10px]">({(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs text-navy-700 dark:text-navy-300 font-extrabold">Drag & Drop study sheets here or click to browse</p>
                          <p className="text-[10px] text-navy-400">PDF, Word, or image formats up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">Syllabus Path</label>
                      <select
                        value={newSyllabus}
                        onChange={(e) => setNewSyllabus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white"
                      >
                        <option value="CAPS">NSC / CAPS</option>
                        <option value="IEB">IEB</option>
                        <option value="Both">Both (Universal)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">Target Grade</label>
                      <select
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value as any)}
                        className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white"
                      >
                        <option value="Grade 12">Grade 12 / NSC Upgrade</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 10">Grade 10</option>
                      </select>
                    </div>

                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">Mathematics Topic</label>
                    <select
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white"
                    >
                      {topicsList.slice(1).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {uploadProgress !== null && (
                    <div className="space-y-1 bg-navy-50 dark:bg-navy-950 p-3 rounded-lg border border-navy-150 dark:border-navy-850">
                      <div className="flex justify-between text-[10px] font-mono text-navy-400">
                        <span>Uploading files and indexing catalog...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-navy-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-royal-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 justify-end border-t border-navy-100 dark:border-navy-850 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-4 py-2 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 rounded-xl text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadProgress !== null}
                      className="px-5 py-2 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white font-black rounded-xl text-xs cursor-pointer"
                    >
                      Publish to Library
                    </button>
                  </div>

                </form>

              </div>

              {/* Helper disclaimer */}
              <div className="flex items-start gap-2 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs mt-6">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-navy-600 dark:text-navy-400 font-mono leading-relaxed">
                  <b>TUTOR NOTE:</b> All published study materials instantly sync with core student dashboards in real-time, categorised dynamically under matching syllabus profiles. Ensure all answers and past paper layouts align perfectly with CAPS Department of Education / IEB standard-setting marking directives.
                </p>
              </div>

            </motion.div>
          </div>
        )}

        {isFormulaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500 rounded-xl text-navy-950">
                      <Calculator className="w-5 h-5 font-black" />
                    </div>
                    <div>
                      <h3 className="text-base font-black font-mono uppercase tracking-wider text-white">
                        CAPS / IEB Interactive Formula Sheet
                      </h3>
                      <p className="text-[11px] text-navy-300">
                        Quick-reference handbook with dynamic equation solvers & study guidelines.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsFormulaOpen(false);
                    setActiveFormulaCalcId(null);
                  }}
                  className="p-2 hover:bg-navy-800 text-navy-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-navigation search and filters */}
              <div className="p-4 bg-navy-50/50 dark:bg-navy-900/40 border-b border-navy-100 dark:border-navy-850 shrink-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-5 relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-navy-400" />
                  <input
                    type="text"
                    placeholder="Search formula names or descriptions..."
                    value={formulaSearchQuery}
                    onChange={(e) => setFormulaSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                
                <div className="md:col-span-7 flex flex-wrap gap-1.5 justify-end">
                  {["All", "Algebra & Sequences", "Trigonometry", "Analytical Geometry", "Differential Calculus", "Financial Mathematics", "Probability"].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedFormulaTopic(topic);
                        setActiveFormulaCalcId(null);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                        selectedFormulaTopic === topic
                          ? "bg-amber-500 text-navy-950 border-amber-500"
                          : "bg-white hover:bg-navy-50 dark:bg-navy-900 dark:hover:bg-navy-850 border-navy-150 dark:border-navy-800 text-navy-600 dark:text-navy-400"
                      }`}
                    >
                      {topic === "All" ? "All Chapters" : topic.replace(" Mathematics", "").replace(" & Sequences", "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formula Sheet Grid & Interactive Sandbox Side-by-Side */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                
                {/* List of Formulas */}
                <div className={`space-y-4 ${activeFormulaCalcId ? "lg:col-span-6" : "lg:col-span-12"}`}>
                  <h4 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-1 flex items-center justify-between">
                    <span>Syllabus Equations</span>
                    <span className="text-[10px] lowercase italic font-normal text-navy-400">Click Try Live Sandbox to solve equations</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {FORMULAS_DATABASE.filter(f => {
                      const matchesTopic = selectedFormulaTopic === "All" || f.topic === selectedFormulaTopic;
                      const matchesSearch = f.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) || 
                                           f.description.toLowerCase().includes(formulaSearchQuery.toLowerCase()) || 
                                           f.expression.toLowerCase().includes(formulaSearchQuery.toLowerCase());
                      return matchesTopic && matchesSearch;
                    }).map((formula) => {
                      const isSelected = activeFormulaCalcId === formula.id;
                      return (
                        <div
                          key={formula.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isSelected
                              ? "bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/20"
                              : "bg-navy-50/20 dark:bg-navy-950/20 border-navy-150 dark:border-navy-850 hover:border-navy-200 dark:hover:border-navy-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[9px] font-mono font-black uppercase bg-navy-100 text-navy-700 dark:bg-navy-900 dark:text-navy-400 px-1.5 py-0.5 rounded">
                              {formula.topic} • {formula.grade}
                            </span>
                            
                            {formula.calcType && (
                              <button
                                onClick={() => setActiveFormulaCalcId(isSelected ? null : formula.id)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border ${
                                  isSelected
                                    ? "bg-amber-500 text-navy-950 border-amber-500"
                                    : "bg-navy-900 text-white dark:bg-navy-800 hover:bg-navy-800 dark:hover:bg-navy-700 border-transparent"
                                }`}
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{isSelected ? "Active Solver" : "Try Live Sandbox"}</span>
                              </button>
                            )}
                          </div>

                          <h5 className="text-xs font-black text-navy-900 dark:text-white mb-1.5">{formula.name}</h5>
                          
                          <div className="p-3 bg-navy-900 dark:bg-black rounded-xl text-center font-mono text-sm font-bold text-amber-400 overflow-x-auto leading-relaxed border border-navy-800 mb-2">
                            {formula.expression}
                          </div>

                          <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed">
                            {formula.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Sandbox Interactive Calculator Panel */}
                {activeFormulaCalcId && (() => {
                  const formula = FORMULAS_DATABASE.find(f => f.id === activeFormulaCalcId);
                  if (!formula) return null;
                  return (
                    <div className="lg:col-span-6 bg-navy-50/50 dark:bg-navy-900/30 border border-navy-150 dark:border-navy-800/80 rounded-2xl p-5 space-y-5 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-navy-150 dark:border-navy-800">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider">
                            Live Solver: {formula.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => setActiveFormulaCalcId(null)}
                          className="text-[10px] font-mono text-navy-400 hover:text-navy-600 dark:hover:text-white cursor-pointer"
                        >
                          Close Solver
                        </button>
                      </div>

                      {/* Substitution Inputs */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono font-black uppercase text-navy-400 block tracking-widest">
                          STEP 1: INPUT REPLACEMENT VALUES
                        </span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {formula.variables.map((variable) => (
                            <div key={variable.name} className="space-y-1">
                              <label className="block text-[10px] font-mono text-navy-500 dark:text-navy-400">
                                {variable.label} ({variable.name})
                              </label>
                              <input
                                type="text"
                                placeholder={variable.placeholder}
                                value={calcInputs[variable.name] || ""}
                                onChange={(e) => {
                                  const updated = { ...calcInputs, [variable.name]: e.target.value };
                                  setCalcInputs(updated);
                                  handleCalculateFormula(formula.calcType || "", updated);
                                }}
                                className="w-full px-3 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-xs text-navy-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Formula calculations steps logs */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-mono font-black uppercase text-navy-400 block tracking-widest">
                          STEP 2: ARITHMETIC SUBSTITUTION STEPS
                        </span>
                        
                        <div className="p-3.5 bg-navy-900 dark:bg-black rounded-xl border border-navy-850 font-mono text-[10px] text-navy-300 space-y-2.5 leading-relaxed overflow-x-auto max-h-48 overflow-y-auto w-full">
                          {calcSteps.length > 0 ? (
                            calcSteps.map((step, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="text-amber-500 shrink-0">[{idx + 1}]</span>
                                <span>{step}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-navy-500 italic">Awaiting valid substitution inputs...</p>
                          )}
                        </div>
                      </div>

                      {/* Final Answer panel */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-black uppercase text-navy-400 block tracking-widest">
                          STEP 3: RESOLVED OUTPUT VALUE
                        </span>
                        
                        <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3">
                          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div className="text-right w-full">
                            <span className="text-[8px] font-mono font-black text-emerald-600 dark:text-emerald-400 block uppercase tracking-widest">
                              FINAL ANSWER
                            </span>
                            <span className="text-xs font-black font-mono text-navy-900 dark:text-white leading-tight block">
                              {calcResult || "Calculating..."}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Tips */}
                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-navy-500 dark:text-navy-400 leading-relaxed font-mono">
                        💡 <b>Tip:</b> Change variables above. Watch how the substitution values change in step 2. Practice copying this structure onto physical writing pads to gain speed for final NSC/IEB trials and exam assessments.
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Footer */}
              <div className="p-4 bg-navy-50 dark:bg-navy-900/60 border-t border-navy-100 dark:border-navy-850 text-center shrink-0">
                <p className="text-[10px] text-navy-400 font-mono">
                  Official Amaris Study Aids • Pretoria, Gauteng • Dynamic equation solving is powered by the local math engine sandbox.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`bg-white dark:bg-navy-950 flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-navy-200 dark:border-navy-800 ${
                isFullscreen 
                  ? "fixed inset-0 w-screen h-screen rounded-none z-[101]" 
                  : "w-full max-w-6xl h-[85vh] rounded-2xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* LEFT SIDEBAR - OUTLINE (Hidden on Fullscreen or on Mobile) */}
              {!isFullscreen && (
                <div className="w-64 border-r border-navy-100 dark:border-navy-850 bg-navy-50/50 dark:bg-navy-900/10 p-4 space-y-4 overflow-y-auto hidden lg:flex flex-col shrink-0">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest block text-left">
                      RESOURCE METADATA
                    </span>
                    <h3 className="text-xs font-black text-navy-900 dark:text-white line-clamp-2 text-left">
                      {previewItem.title}
                    </h3>
                    <p className="text-[10px] text-navy-500 font-sans leading-relaxed text-left">
                      {previewItem.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-navy-100 dark:border-navy-850/80 space-y-3">
                    <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest block text-left">
                      DOCUMENT OUTLINE
                    </span>
                    
                    <div className="space-y-1">
                      {getDocumentOutline(previewItem.id).map((sec) => {
                        const isSelected = selectedOutlineSection === sec.id || previewPage === sec.page;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => {
                              setSelectedOutlineSection(sec.id);
                              setPreviewPage(sec.page);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${
                              isSelected
                                ? "bg-royal-600 text-white shadow-sm"
                                : "hover:bg-navy-100/60 dark:hover:bg-navy-900/60 text-navy-800 dark:text-navy-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-navy-400"}`} />
                            <span className="truncate flex-1">{sec.title}</span>
                            <span className={`text-[9px] font-mono ${isSelected ? "text-royal-100" : "text-navy-400"}`}>
                              p.{sec.page}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-navy-100 dark:border-navy-850/80 space-y-2">
                    <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest block text-left">
                      FILE INFORMATION
                    </span>
                    <div className="bg-white dark:bg-navy-900/40 p-2.5 rounded-xl border border-navy-100 dark:border-navy-800 space-y-1 text-[10px] font-mono text-navy-600 dark:text-navy-300 text-left">
                      <div className="truncate">Size: {previewItem.file_size}</div>
                      <div>Type: {previewItem.file_type.toUpperCase()} File</div>
                      <div className="truncate">Name: {previewItem.file_name}</div>
                      <div>Prints: {previewItem.print_count || 0}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 flex flex-col min-w-0 bg-navy-50/20 dark:bg-navy-950/20">
                {/* TOOLBAR */}
                <div className="p-3 sm:p-4 bg-white dark:bg-navy-950 border-b border-navy-100 dark:border-navy-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  {/* Left Controls - Close and Title */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPreviewItem(null)}
                      className="p-2 hover:bg-navy-100 dark:hover:bg-navy-900 text-navy-700 dark:text-navy-300 rounded-xl transition-all cursor-pointer"
                      title="Close Preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="hidden sm:block text-left">
                      <span className="text-[9px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-widest block leading-none">
                        AMARIS PORTAL PREVIEW
                      </span>
                      <h4 className="text-xs font-black text-navy-900 dark:text-white truncate max-w-[150px] md:max-w-[200px] mt-0.5">
                        {previewItem.title}
                      </h4>
                    </div>
                  </div>

                  {/* Middle Controls - Page Selector */}
                  {(() => {
                    const pages = getDocumentPages(previewItem.id, previewItem.title);
                    const totalPages = pages.length;
                    return (
                      <div className="flex items-center gap-1 bg-navy-50 dark:bg-navy-900 px-2.5 py-1 rounded-xl border border-navy-150 dark:border-navy-850">
                        <button
                          disabled={previewPage <= 1}
                          onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))}
                          className="p-1 hover:bg-white dark:hover:bg-navy-850 text-navy-600 dark:text-navy-400 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-navy-800 dark:text-navy-200 px-1.5 shrink-0">
                          p. {previewPage} / {totalPages}
                        </span>
                        <button
                          disabled={previewPage >= totalPages}
                          onClick={() => setPreviewPage(prev => Math.min(totalPages, prev + 1))}
                          className="p-1 hover:bg-white dark:hover:bg-navy-850 text-navy-600 dark:text-navy-400 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })()}

                  {/* Right Controls - Zoom, Rotate, Search, Fullscreen, and Get File */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Search inside Document */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search text..."
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="w-24 sm:w-36 pl-7 pr-5 py-1.5 bg-navy-50 dark:bg-navy-900 text-[10px] text-navy-900 dark:text-white rounded-xl border border-navy-150 dark:border-navy-850 focus:outline-none focus:border-royal-500 font-mono"
                      />
                      <span className="absolute left-2.5 top-2.5 text-navy-400">
                        <Eye className="w-3 h-3" />
                      </span>
                      {previewSearch && (
                        <button
                          onClick={() => setPreviewSearch("")}
                          className="absolute right-2 top-2.5 text-navy-400 hover:text-navy-600"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                      
                      {/* Search Matches Count */}
                      {previewSearch && (
                        <div className="absolute top-full mt-1 left-0 bg-navy-900 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow z-[105]">
                          {getSearchMatchesCount(getDocumentPages(previewItem.id, previewItem.title), previewSearch)} MATCHES
                        </div>
                      )}
                    </div>

                    {/* PDF Annotation Layer Toolbar */}
                    <PDFAnnotationToolbar
                      activeTool={activeTool}
                      onToolChange={setActiveTool}
                      selectedColor={selectedHighlightColor}
                      onColorChange={setSelectedHighlightColor}
                      stickyColor={stickyColor}
                      onStickyColorChange={setStickyColor}
                      totalAnnotations={highlights.length + stickyNotes.length}
                      onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
                      isDrawerOpen={isDrawerOpen}
                    />

                    {/* Zoom */}
                    <div className="flex items-center bg-navy-50 dark:bg-navy-900 rounded-xl border border-navy-150 dark:border-navy-850 px-1">
                      <button
                        onClick={() => setPreviewZoom(prev => Math.max(50, prev - 25))}
                        className="p-1.5 hover:bg-white dark:hover:bg-navy-850 text-navy-600 dark:text-navy-400 rounded-lg transition-all cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <span className="text-[9px] font-mono font-bold text-navy-700 dark:text-navy-300 w-10 text-center select-none">
                        {previewZoom}%
                      </span>
                      <button
                        onClick={() => setPreviewZoom(prev => Math.min(200, prev + 25))}
                        className="p-1.5 hover:bg-white dark:hover:bg-navy-850 text-navy-600 dark:text-navy-400 rounded-lg transition-all cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Rotation */}
                    <button
                      onClick={() => setPreviewRotation(prev => (prev + 90) % 360)}
                      className="p-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-900 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 border border-navy-150 dark:border-navy-850 rounded-xl transition-all cursor-pointer"
                      title="Rotate Document 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                      onClick={() => setIsFullscreen(prev => !prev)}
                      className="p-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-900 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 border border-navy-150 dark:border-navy-850 rounded-xl transition-all cursor-pointer"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Direct Download Action Button */}
                    <button
                      id="btn-preview-export-pdf"
                      onClick={() => handleExportPDF(previewItem)}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black rounded-xl text-[11px] flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                      title="Download clean exportable PDF using print-friendly styles"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Download as PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadFile(previewItem!)}
                      className="px-3 py-2 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white dark:from-gold-500 dark:to-gold-600 dark:text-navy-950 font-black rounded-xl text-[11px] flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Download Raw</span>
                    </button>
                  </div>
                </div>

                {/* PHYSICAL PAPER CANVAS SCREEN */}
                <div className="flex-1 overflow-auto bg-[#f4f4f6] dark:bg-navy-900 p-6 md:p-10 flex justify-center items-start relative select-text">
                  <div 
                    ref={previewCanvasRef}
                    className="w-full max-w-[720px] bg-white dark:bg-navy-950 rounded-xl p-8 sm:p-12 shadow-2xl border border-navy-200/50 dark:border-navy-800 transition-all origin-top duration-200 relative"
                    style={{ 
                      transform: `rotate(${previewRotation}deg) scale(${previewZoom / 100})`,
                      transformOrigin: 'top center',
                      minHeight: '1018px' // A4 Proportion Ratio (1:1.414)
                    }}
                  >
                    {/* PDF Canvas Annotations Interactive Overlay */}
                    <PDFCanvasAnnotationsOverlay
                      containerRef={previewCanvasRef}
                      activeTool={activeTool}
                      selectedColor={selectedHighlightColor}
                      stickyColor={stickyColor}
                      pageNumber={previewPage}
                      stickyNotes={stickyNotes}
                      onAddStickyNote={handleAddStickyNote}
                      onUpdateStickyNote={handleUpdateStickyNote}
                      onDeleteStickyNote={handleDeleteStickyNote}
                      onToggleCollapseStickyNote={handleToggleCollapseStickyNote}
                      highlights={highlights}
                      onAddHighlight={handleAddHighlight}
                      onDeleteHighlight={handleDeleteHighlight}
                    />

                    {/* Document Page Header */}
                    <div className="border-b border-navy-150 dark:border-navy-850 pb-4 mb-6 text-center">
                      <span className="text-[9px] font-mono font-black text-amber-600 dark:text-gold-400 tracking-widest block uppercase">
                        AMARIS PORTAL REVISION SERVICES • PREVENT DUPLICATES
                      </span>
                      <h1 className="text-sm font-black font-sans text-navy-900 dark:text-white mt-1 leading-tight uppercase tracking-tight">
                        {previewItem.title}
                      </h1>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-navy-100 dark:bg-navy-850 text-navy-700 dark:text-navy-300 rounded font-mono text-[8px] font-bold">
                          {previewItem.syllabus} Syllabus
                        </span>
                        <span className="px-2 py-0.5 bg-royal-100/40 dark:bg-royal-950/20 text-royal-700 dark:text-royal-300 rounded font-mono text-[8px] font-bold">
                          {previewItem.grade_level}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 rounded font-mono text-[8px] font-bold">
                          {previewItem.topic}
                        </span>
                      </div>
                    </div>

                    {/* Page Content Rendering */}
                    {(() => {
                      const pages = getDocumentPages(previewItem.id, previewItem.title);
                      const activePageIndex = Math.min(Math.max(1, previewPage), pages.length) - 1;
                      const activePage = pages[activePageIndex] || pages[0];

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-dashed border-navy-100 dark:border-navy-850 pb-1 mb-2">
                            <span className="text-[8px] font-mono text-navy-400 font-bold uppercase tracking-wider">
                              {activePage.title}
                            </span>
                            <span className="text-[8px] font-mono text-navy-400 font-bold uppercase">
                              Page {activePage.page_number} of {pages.length}
                            </span>
                          </div>

                          {activePage.elements.map((el, idx) => {
                            switch (el.type) {
                              case "section_header":
                                return (
                                  <h3 key={idx} className="text-xs font-black font-mono text-royal-600 dark:text-gold-400 mt-6 mb-3 border-b border-navy-100 dark:border-navy-850 pb-1 uppercase tracking-wider text-left">
                                    {highlightText(el.content || "", previewSearch)}
                                  </h3>
                                );
                              case "text":
                                return (
                                  <p key={idx} className="text-[11px] text-navy-700 dark:text-navy-300 leading-relaxed font-sans whitespace-pre-line mb-4 text-left">
                                    {highlightText(el.content || "", previewSearch)}
                                  </p>
                                );
                              case "equation":
                                return (
                                  <div key={idx} className="my-4 p-4 bg-navy-950 dark:bg-black border border-navy-800 rounded-xl space-y-2.5 text-center shadow-inner">
                                    {el.equations?.map((eq, i) => (
                                      <div key={i} className="font-mono text-xs font-bold text-amber-400 dark:text-gold-400 select-all leading-relaxed">
                                        {highlightText(eq, previewSearch)}
                                      </div>
                                    ))}
                                  </div>
                                );
                              case "tutor_note":
                                return (
                                  <div key={idx} className="my-4 p-4 bg-amber-500/10 dark:bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl text-[10.5px] leading-relaxed text-navy-800 dark:text-navy-200 font-mono italic relative text-left">
                                    <div className="absolute top-2.5 right-3.5 flex items-center gap-1.5 select-none">
                                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                                      <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-wider">Bethuel's Memo Tag</span>
                                    </div>
                                    {highlightText(el.content || "", previewSearch)}
                                  </div>
                                );
                              case "svg_diagram":
                                return (
                                  <div key={idx} className="my-6 p-4 bg-navy-50/60 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800 rounded-xl flex flex-col items-center justify-center text-center">
                                    {renderDiagram(el.diagram_type)}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })}
                        </div>
                      );
                    })()}

                    {/* Official Stamp Footer */}
                    <div className="mt-12 pt-6 border-t border-navy-150 dark:border-navy-850 flex items-center justify-between text-[9px] font-mono text-navy-400">
                      <span>Amaris Mathematics Hub • Official CAPS Handout</span>
                      <span>Security Stamp: Verified Amaris PDF</span>
                    </div>
                  </div>
                </div>

                {/* ANNOTATIONS SIDE DRAWER */}
                <PDFAnnotationsDrawer
                  isOpen={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  documentTitle={previewItem.title}
                  currentPageNumber={previewPage}
                  highlights={highlights}
                  stickyNotes={stickyNotes}
                  onDeleteHighlight={handleDeleteHighlight}
                  onDeleteStickyNote={handleDeleteStickyNote}
                  onClearAll={handleClearAllAnnotations}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTWEIGHT FIRST PAGE PDF PREVIEWER MODAL */}
      <PDFPreviewerModal
        isOpen={!!lightweightPreviewItem}
        onClose={() => setLightweightPreviewItem(null)}
        item={lightweightPreviewItem}
        onDownloadFile={handleDownloadFile}
        onExportPDF={handleExportPDF}
      />

      {/* WORKSHEET PRINT PREVIEW MODAL */}
      <PrintPreviewModal 
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        studentName={user ? `${user.first_name} ${user.surname}` : "Grade 12 CAPS Student"}
        grade={user ? user.grade || "Grade 12" : "Grade 12"}
      />

      {/* PRINT-ONLY CONTAINER FOR LESSON CONTENT PDF EXPORT */}
      {(() => {
        const itemToPrint = selectedPrintItem || previewItem || filteredResources[0] || resources[0];
        if (!itemToPrint) return null;

        const pages = getDocumentPages(itemToPrint.id, itemToPrint.title);

        return (
          <div 
            id="resource-printable-area"
            className="hidden print:block print-only worksheet-print-target w-full bg-white text-black p-8 font-serif leading-relaxed text-sm"
          >
            {/* Document Header */}
            <div className="text-center space-y-2 border-b-2 border-black pb-4 mb-6">
              <div className="text-[10px] font-mono font-black tracking-widest text-gray-700 uppercase">
                AMARIS MATHEMATICS HUB • OFFICIAL LESSON STUDY MATERIAL
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black font-sans">
                {itemToPrint.title}
              </h1>
              <p className="text-xs italic text-gray-800">
                {itemToPrint.description}
              </p>
              <div className="flex justify-center gap-6 text-[10px] font-mono text-gray-700 pt-2 border-t border-gray-300 mt-2">
                <span><b>Syllabus:</b> {itemToPrint.syllabus || "CAPS & IEB"}</span>
                <span><b>Grade:</b> {itemToPrint.grade_level || "Grade 12"}</span>
                <span><b>Topic:</b> {itemToPrint.topic || "Core Mathematics"}</span>
                <span><b>Student:</b> {user ? `${user.first_name} ${user.surname}` : "Registered AMH Student"}</span>
                <span><b>Export Date:</b> {new Date().toLocaleDateString("en-ZA", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Pages & Lesson Elements */}
            {pages.map((page, pIdx) => (
              <div key={pIdx} className={`space-y-4 ${pIdx > 0 ? "print-force-page-break pt-6" : ""}`}>
                <div className="flex items-center justify-between border-b border-black pb-1 mb-4 font-mono text-xs font-bold uppercase">
                  <span>{page.title || `Section ${page.page_number}`}</span>
                  <span>Page {page.page_number} of {pages.length}</span>
                </div>

                {page.elements.map((el, elIdx) => (
                  <div key={elIdx} className="print-avoid-break space-y-2 my-3">
                    {el.type === "section_header" && (
                      <h3 className="text-sm font-black uppercase border-b border-gray-400 pb-1 mt-4 text-black font-sans">
                        {el.content}
                      </h3>
                    )}
                    {el.type === "text" && (
                      <p className="text-xs text-gray-900 leading-relaxed font-serif whitespace-pre-line my-2">
                        {el.content}
                      </p>
                    )}
                    {el.type === "equation" && (
                      <div className="my-3 p-4 bg-gray-50 border border-black rounded-lg space-y-2 text-center font-mono">
                        {el.equations?.map((eq, eqIdx) => (
                          <div key={eqIdx} className="text-xs font-bold text-black leading-snug">
                            {eq}
                          </div>
                        ))}
                      </div>
                    )}
                    {el.type === "tutor_note" && (
                      <div className="my-3 p-4 bg-gray-100 border-l-4 border-black text-xs font-mono italic text-gray-900">
                        <span className="font-bold uppercase not-italic block mb-1">Bethuel's Tutor Note:</span>
                        {el.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Official Footer Stamp */}
            <div className="mt-12 pt-4 border-t border-black flex justify-between items-center text-[10px] font-mono text-gray-600 print-avoid-break">
              <span>Amaris Mathematics Hub • Certified CAPS/IEB Lesson Material</span>
              <span>Pretoria West, Gauteng • Official Student PDF Export</span>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

// Stateless rendering helpers for preview search
const highlightText = (text: string, search: string) => {
  if (!search) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-amber-300 text-navy-950 px-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

const getSearchMatchesCount = (pages: DocumentPage[], query: string): number => {
  if (!query) return 0;
  let count = 0;
  pages.forEach(p => {
    p.elements.forEach(el => {
      if (el.content && el.content.toLowerCase().includes(query.toLowerCase())) {
        const matches = el.content.toLowerCase().match(new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').toLowerCase(), 'g'));
        if (matches) count += matches.length;
      }
      if (el.equations) {
        el.equations.forEach(eq => {
          if (eq.toLowerCase().includes(query.toLowerCase())) {
            const matches = eq.toLowerCase().match(new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').toLowerCase(), 'g'));
            if (matches) count += matches.length;
          }
        });
      }
    });
  });
  return count;
};

const getQuadrantInfo = (angle: number) => {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized >= 0 && normalized < 90) {
    return { quad: "I", label: "All Positive", formulas: ["sin(θ) > 0", "cos(θ) > 0", "tan(θ) > 0"], reduced: `θ = ${normalized}°` };
  } else if (normalized >= 90 && normalized < 180) {
    return { quad: "II", label: "Sine Positive (S)", formulas: ["sin(180°-θ) = sin(θ)", "cos(180°-θ) = -cos(θ)"], reduced: `180° - θ = ${180 - normalized}°` };
  } else if (normalized >= 180 && normalized < 270) {
    return { quad: "III", label: "Tangent Positive (T)", formulas: ["sin(180°+θ) = -sin(θ)", "tan(180°+θ) = tan(θ)"], reduced: `θ - 180° = ${normalized - 180}°` };
  } else {
    return { quad: "IV", label: "Cosine Positive (C)", formulas: ["sin(360°-θ) = -sin(θ)", "cos(360°-θ) = cos(θ)"], reduced: `360° - θ = ${360 - normalized}°` };
  }
};

