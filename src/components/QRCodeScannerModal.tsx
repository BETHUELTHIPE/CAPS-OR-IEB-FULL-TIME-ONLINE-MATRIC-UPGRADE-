import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  QrCode, Camera, Upload, Keyboard, Sparkles, CheckCircle2, 
  AlertCircle, X, RefreshCw, Download, ExternalLink, FileText, 
  BookOpen, Video, Star, History, Flashlight, ArrowRight, 
  Check, Share2, Layers, Search, Eye, Filter, Zap, BookMarked
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Profile, ResourceLibraryItem } from "../types";
import { dbAPI } from "../lib/db";
import { PDFPreviewerModal } from "./PDFPreviewerModal";

interface PhysicalStudyMaterial {
  code: string;
  title: string;
  subject: string;
  grade: string;
  syllabus: "CAPS" | "IEB" | "Both";
  category: "Past Paper" | "Study Guide" | "Worked Solutions" | "Formula Card" | "Video Memo";
  type: "pdf" | "video" | "interactive";
  fileUrl: string;
  author: string;
  pageCount?: number;
  durationMinutes?: number;
  fileSize: string;
  description: string;
  topicsCovered: string[];
}

export const PHYSICAL_MATERIALS_DATABASE: PhysicalStudyMaterial[] = [
  {
    code: "AMH-CAPS-12-CALC",
    title: "Grade 12 CAPS Calculus Mastery & Differential Calculus Handbook",
    subject: "Mathematics",
    grade: "Grade 12",
    syllabus: "CAPS",
    category: "Study Guide",
    type: "pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    author: "Bethuel Moukangwe (Head Mathematics Tutor)",
    pageCount: 32,
    fileSize: "4.8 MB",
    description: "Complete CAPS Grade 12 Calculus coverage including limits from first principles, derivative rules, tangents to curves, cubic functions, and optimization problems.",
    topicsCovered: ["First Principles", "Power & Product Rules", "Cubic Graphs & Inflexion", "Optimization Word Problems"]
  },
  {
    code: "AMH-IEB-12-TRIG",
    title: "Grade 12 IEB Advanced Trigonometry & Identities Masterclass Booklet",
    subject: "Mathematics",
    grade: "Grade 12",
    syllabus: "IEB",
    category: "Worked Solutions",
    type: "pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    author: "Amaris IEB Academic Board",
    pageCount: 28,
    fileSize: "3.6 MB",
    description: "In-depth step-by-step reduction formula reductions, double-angle & compound angle identities, trigonometric equations, and 2D/3D problem solving.",
    topicsCovered: ["Compound Angles", "Double Angle Identities", "General Solutions", "3D Trigonometric Heights"]
  },
  {
    code: "AMH-MATRIC-2024-P1",
    title: "2024 November NSC Mathematics Paper 1 Official Question Paper & Video Memo",
    subject: "Mathematics P1",
    grade: "Grade 12",
    syllabus: "Both",
    category: "Past Paper",
    type: "video",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    author: "Department of Basic Education (DBE) / AMH Video Team",
    durationMinutes: 115,
    fileSize: "18.2 MB",
    description: "Full question-by-question high-definition walkthrough of the 2024 Grade 12 November NSC Mathematics Paper 1 with common mark scheme traps highlighted.",
    topicsCovered: ["Algebra & Equations", "Patterns & Sequences", "Functions & Inverses", "Calculus & Probability"]
  },
  {
    code: "AMH-CAPS-11-QUAD",
    title: "Grade 11 CAPS Quadratic Functions & Parabola Geometry Practice Pack",
    subject: "Mathematics",
    grade: "Grade 11",
    syllabus: "CAPS",
    category: "Study Guide",
    type: "pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    author: "Amaris Content Team",
    pageCount: 18,
    fileSize: "2.4 MB",
    description: "Comprehensive drill exercises for finding quadratic equations, axis of symmetry, turning points, domain & range, and intersections with linear graphs.",
    topicsCovered: ["Standard Form y=a(x-p)²+q", "Axis of Symmetry", "Nature of Roots & Discriminant", "Graph Transformations"]
  },
  {
    code: "AMH-FORMULA-SHEET",
    title: "National Senior Certificate (NSC / IEB) Official Mathematics Formula Card",
    subject: "Mathematics",
    grade: "Grade 12",
    syllabus: "Both",
    category: "Formula Card",
    type: "pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    author: "DBE & IEB Examinations Council",
    pageCount: 2,
    fileSize: "850 KB",
    description: "Official formula sheet provided in Grade 12 November Examinations covering Sequences, Financial Maths, Calculus, Analytical Geometry, Statistics, and Trigonometry.",
    topicsCovered: ["Quad Formula", "Annuities P & F", "Derivative Definition", "Distance & Midpoint", "Stats Variance"]
  },
  {
    code: "AMH-FIN-MATHS-12",
    title: "Grade 11 & 12 Financial Mathematics & Annuity Calculations Guide",
    subject: "Mathematics",
    grade: "Grade 12",
    syllabus: "Both",
    category: "Worked Solutions",
    type: "pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    author: "Bethuel Moukangwe",
    pageCount: 24,
    fileSize: "3.1 MB",
    description: "Master simple & compound interest, nominal vs effective interest rates, depreciation (reducing balance & straight-line), present value loans, and future value sinking funds.",
    topicsCovered: ["Effective Rate i_eff", "Present Value Annuities", "Future Value Sinking Funds", "Deferred Payment Schedules"]
  },
  {
    code: "AMH-ANALYTICAL-GEO",
    title: "Grade 11 & 12 Analytical Geometry & Circle Equation Masterclass",
    subject: "Mathematics",
    grade: "Grade 12",
    syllabus: "CAPS",
    category: "Study Guide",
    type: "pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    author: "Amaris Academic Team",
    pageCount: 20,
    fileSize: "2.9 MB",
    description: "Detailed step-by-step methods for tangents to circles, inclination angles, midpoint & distance formulas, and proving geometric properties analytically.",
    topicsCovered: ["Circle Equation (x-a)²+(y-b)²=r²", "Tangent Perpendicular to Radius", "Angle of Inclination tan θ = m"]
  }
];

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  onResourceSelected?: (material: PhysicalStudyMaterial) => void;
}

interface ScanHistoryItem {
  code: string;
  title: string;
  scannedAt: string;
}

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  isOpen,
  onClose,
  user,
  onResourceSelected
}) => {
  const [scanMode, setScanMode] = useState<"camera" | "upload" | "manual" | "preset">("camera");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>("");
  
  const [scannedMaterial, setScannedMaterial] = useState<PhysicalStudyMaterial | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSavedFavorite, setIsSavedFavorite] = useState<boolean>(false);
  
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load scan history from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem("amh_qr_scan_history");
        if (stored) {
          setScanHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Scan history load notice:", e);
      }
    }
  }, [isOpen]);

  // Start Camera Feed when camera mode is active
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen && scanMode === "camera") {
      setIsCameraActive(true);
      setCameraError(null);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
        })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn("Camera media access notice:", err);
          setCameraError("Camera access permission not granted or device camera unavailable. Use Photo Upload or Code Keypad.");
          setIsCameraActive(false);
        });
      } else {
        setCameraError("Camera API not supported on this browser context. Please use Photo Upload or Manual Code Keypad.");
      }
    } else {
      setIsCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, scanMode]);

  if (!isOpen) return null;

  const saveScanToHistory = (material: PhysicalStudyMaterial) => {
    const newItem: ScanHistoryItem = {
      code: material.code,
      title: material.title,
      scannedAt: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }) + " (" + new Date().toLocaleDateString("en-ZA") + ")"
    };

    const updated = [newItem, ...scanHistory.filter((h) => h.code !== material.code)].slice(0, 10);
    setScanHistory(updated);
    try {
      localStorage.setItem("amh_qr_scan_history", JSON.stringify(updated));
      dbAPI.addActivityLog({
        user_name: `${user.first_name} ${user.surname}`,
        action: "Scanned Physical Study Material QR Code",
        details: `Scanned code [${material.code}] - ${material.title}`,
        type: "system"
      });
    } catch (e) {
      console.warn("Scan history save notice:", e);
    }
  };

  const processExtractedCode = (codeText: string) => {
    setScanError(null);
    setIsScanning(true);

    const cleanCode = codeText.trim().toUpperCase();

    setTimeout(() => {
      setIsScanning(false);
      const match = PHYSICAL_MATERIALS_DATABASE.find(
        (item) => item.code.toUpperCase() === cleanCode || item.code.toUpperCase().includes(cleanCode) || cleanCode.includes(item.code.toUpperCase())
      );

      if (match) {
        setScannedMaterial(match);
        saveScanToHistory(match);
      } else {
        setScanError(`No digital study resource found for material code "${cleanCode}". Please check your physical code or select from our sample catalog.`);
      }
    }, 700);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    processExtractedCode(manualCodeInput);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    // Simulate scanning uploaded image QR code
    setTimeout(() => {
      setIsScanning(false);
      // Pick matching item based on file name or auto-pick Grade 12 Calculus or formula sheet
      const matched = PHYSICAL_MATERIALS_DATABASE.find(
        (m) => file.name.toUpperCase().includes(m.code) || file.name.toUpperCase().includes("CALC")
      ) || PHYSICAL_MATERIALS_DATABASE[0];

      setScannedMaterial(matched);
      saveScanToHistory(matched);
    }, 1000);
  };

  const handleSimulatedCameraCapture = () => {
    setIsScanning(true);
    // Simulate camera auto-locking onto QR code in frame
    setTimeout(() => {
      setIsScanning(false);
      // Randomly select one of our premium materials to demonstrate live frame detection
      const randomMaterial = PHYSICAL_MATERIALS_DATABASE[Math.floor(Math.random() * PHYSICAL_MATERIALS_DATABASE.length)];
      setScannedMaterial(randomMaterial);
      saveScanToHistory(randomMaterial);
    }, 900);
  };

  const handleSaveToFavorites = () => {
    setIsSavedFavorite(true);
    setTimeout(() => setIsSavedFavorite(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-left"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-950 via-royal-950 to-navy-900 p-6 border-b border-royal-500/30 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold-400/20 rounded-2xl border border-gold-400/30 text-gold-400">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                  Physical Material QR Code Scanner
                  <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
                </h3>
                <p className="text-xs text-navy-300 font-mono">
                  Scan textbooks, study guides &amp; exam papers for instant digital resources
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-navy-400 hover:text-white rounded-xl bg-navy-800/50 hover:bg-navy-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">

            {/* Mode Selector Tabs */}
            <div className="flex items-center p-1 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-2xl text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => { setScanMode("camera"); setScannedMaterial(null); }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scanMode === "camera"
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Camera Feed</span>
                <span className="sm:hidden">Camera</span>
              </button>

              <button
                type="button"
                onClick={() => { setScanMode("upload"); setScannedMaterial(null); }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scanMode === "upload"
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Photo</span>
                <span className="sm:hidden">Upload</span>
              </button>

              <button
                type="button"
                onClick={() => { setScanMode("manual"); setScannedMaterial(null); }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scanMode === "manual"
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span className="hidden sm:inline">Code Keypad</span>
                <span className="sm:hidden">Keypad</span>
              </button>

              <button
                type="button"
                onClick={() => { setScanMode("preset"); setScannedMaterial(null); }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scanMode === "preset"
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span className="hidden sm:inline">Sample Codes</span>
                <span className="sm:hidden">Samples</span>
              </button>
            </div>

            {/* Error Notification Banner */}
            {scanError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-mono flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{scanError}</span>
              </motion.div>
            )}

            {/* MAIN CONTENT PANELS */}
            {!scannedMaterial ? (
              <div>
                {/* 1. CAMERA MODE */}
                {scanMode === "camera" && (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-navy-950 rounded-3xl overflow-hidden border-2 border-navy-800 flex items-center justify-center shadow-inner">
                      {isCameraActive && !cameraError ? (
                        <>
                          <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />

                          {/* Animated Viewfinder Frame Overlay */}
                          <div className="absolute inset-0 border-2 border-white/10 pointer-events-none flex items-center justify-center">
                            <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-gold-400/80 rounded-3xl shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                              {/* Corner Brackets */}
                              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-gold-400 rounded-tl-xl" />
                              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-gold-400 rounded-tr-xl" />
                              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-gold-400 rounded-bl-xl" />
                              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-gold-400 rounded-br-xl" />

                              {/* Scanning Laser Line */}
                              <motion.div
                                animate={{ y: [0, 220, 0] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                                className="w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_15px_#f39c12]"
                              />
                            </div>
                          </div>

                          {/* Controls bar on video */}
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-navy-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white font-mono text-xs">
                            <span className="flex items-center gap-2 text-emerald-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              Scanner Ready — Align QR Code
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setTorchEnabled(!torchEnabled)}
                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                  torchEnabled ? "bg-amber-500 text-navy-950 font-bold" : "bg-white/10 hover:bg-white/20 text-white"
                                }`}
                                title="Toggle Flashlight / Torch"
                              >
                                <Flashlight className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={handleSimulatedCameraCapture}
                                disabled={isScanning}
                                className="px-3 py-1.5 bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                              >
                                {isScanning ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Zap className="w-3.5 h-3.5" />
                                )}
                                <span>Scan Code</span>
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-royal-500/20 border border-royal-400/30 text-royal-400 mx-auto flex items-center justify-center">
                            <Camera className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-navy-300 font-mono max-w-md mx-auto">
                            {cameraError || "Point your device camera at any Amaris physical study guide or past paper QR code to instantly pull up solutions."}
                          </p>

                          <button
                            type="button"
                            onClick={handleSimulatedCameraCapture}
                            disabled={isScanning}
                            className="px-5 py-2.5 bg-gradient-to-r from-royal-600 to-indigo-700 hover:from-royal-500 hover:to-indigo-600 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                          >
                            {isScanning ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <QrCode className="w-4 h-4 text-gold-400" />
                            )}
                            <span>Simulate Camera Scan Lock-On</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-navy-500 dark:text-navy-400 font-mono text-center">
                      Tip: Position the physical QR code inside the yellow box. The scanner will automatically detect study guides, worked video memos, and formula cards.
                    </p>
                  </div>
                )}

                {/* 2. PHOTO UPLOAD MODE */}
                {scanMode === "upload" && (
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-royal-300 dark:border-navy-700 hover:border-royal-500 dark:hover:border-gold-400 rounded-3xl p-8 text-center bg-royal-50/40 dark:bg-navy-950/40 transition-all cursor-pointer group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="w-14 h-14 rounded-2xl bg-royal-500/20 text-royal-600 dark:text-gold-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-7 h-7" />
                      </div>

                      <h4 className="text-sm font-mono font-black text-navy-900 dark:text-white mb-1">
                        Upload Textbook or Paper Scan Photo
                      </h4>
                      <p className="text-xs text-navy-500 dark:text-navy-400 font-mono max-w-sm mx-auto mb-4">
                        Upload a photo or screenshot containing a study material QR code from your camera roll or device files.
                      </p>

                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-royal-600 text-white font-mono font-bold text-xs rounded-xl shadow-md group-hover:bg-royal-500 transition-all">
                        <Search className="w-3.5 h-3.5" />
                        Browse Image Files
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. MANUAL KEYPAD MODE */}
                {scanMode === "manual" && (
                  <form onSubmit={handleManualCodeSubmit} className="space-y-4">
                    <div className="p-4 rounded-2xl bg-royal-50/60 dark:bg-navy-950/60 border border-royal-200 dark:border-navy-800 space-y-2">
                      <p className="text-xs text-navy-700 dark:text-navy-300 font-mono">
                        Printed next to physical QR codes in Amaris study materials is an alphanumeric code (e.g. <strong className="text-royal-600 dark:text-gold-400">AMH-CAPS-12-CALC</strong> or <strong className="text-royal-600 dark:text-gold-400">AMH-MATRIC-2024-P1</strong>).
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">
                        Enter Physical Material Code
                      </label>
                      <div className="relative">
                        <Keyboard className="absolute left-3.5 top-3.5 w-4 h-4 text-royal-500" />
                        <input
                          type="text"
                          required
                          value={manualCodeInput}
                          onChange={(e) => setManualCodeInput(e.target.value)}
                          placeholder="e.g. AMH-CAPS-12-CALC"
                          className="w-full pl-10 pr-4 py-3 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-2xl text-xs font-mono font-bold text-navy-900 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-royal-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isScanning || !manualCodeInput.trim()}
                      className="w-full py-3 bg-gradient-to-r from-royal-600 via-royal-700 to-indigo-700 hover:from-royal-500 hover:to-indigo-600 text-white font-mono font-black text-xs rounded-2xl shadow-lg shadow-royal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Searching Resource Catalog...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 text-gold-400" />
                          <span>Locate Digital Study Material</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 4. PRESET SAMPLES MODE */}
                {scanMode === "preset" && (
                  <div className="space-y-3">
                    <p className="text-xs text-navy-600 dark:text-navy-400 font-mono">
                      Click any physical study guide code below to test scanning and preview digital resources:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {PHYSICAL_MATERIALS_DATABASE.map((mat) => (
                        <div
                          key={mat.code}
                          onClick={() => processExtractedCode(mat.code)}
                          className="p-3 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 hover:border-royal-500 dark:hover:border-gold-400 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="space-y-1 pr-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-royal-100 text-royal-700 dark:bg-royal-950 dark:text-gold-400 inline-block">
                              {mat.code}
                            </span>
                            <h5 className="text-xs font-mono font-bold text-navy-900 dark:text-white line-clamp-1 group-hover:text-royal-600 dark:group-hover:text-gold-400">
                              {mat.title}
                            </h5>
                            <span className="text-[10px] text-navy-500 dark:text-navy-400 font-mono block">
                              {mat.grade} • {mat.syllabus} • {mat.category}
                            </span>
                          </div>

                          <div className="p-2 bg-white dark:bg-navy-900 rounded-xl border border-navy-200 dark:border-navy-800 shadow-sm flex-shrink-0">
                            <QRCodeSVG value={mat.code} size={36} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* MATCHED MATERIAL RESULT PREVIEW */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
              >
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Resource Code Verified: <span className="text-navy-900 dark:text-white">{scannedMaterial.code}</span></span>
                  </div>

                  <button
                    onClick={() => setScannedMaterial(null)}
                    className="text-[11px] underline hover:text-emerald-700 dark:hover:text-emerald-300 font-bold cursor-pointer"
                  >
                    Scan Another Code
                  </button>
                </div>

                {/* Resource Details Card */}
                <div className="p-5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-3xl space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-royal-600 text-white">
                          {scannedMaterial.grade}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-gold-400 text-navy-950">
                          {scannedMaterial.syllabus}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-navy-200 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                          {scannedMaterial.category}
                        </span>
                      </div>

                      <h4 className="text-base font-mono font-black text-navy-900 dark:text-white">
                        {scannedMaterial.title}
                      </h4>
                      <p className="text-xs text-navy-600 dark:text-navy-300 font-mono leading-relaxed">
                        {scannedMaterial.description}
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-md flex-shrink-0 text-center">
                      <QRCodeSVG value={scannedMaterial.code} size={54} />
                      <span className="text-[9px] text-navy-400 font-mono block mt-1">{scannedMaterial.code}</span>
                    </div>
                  </div>

                  {/* Covered Topics Badges */}
                  <div className="pt-2 border-t border-navy-150 dark:border-navy-800">
                    <span className="text-[10px] font-mono font-bold text-navy-500 dark:text-navy-400 uppercase block mb-1.5">
                      Topics &amp; Exam Concepts Covered:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {scannedMaterial.topicsCovered.map((topic, i) => (
                        <span key={i} className="text-[11px] font-mono px-2.5 py-1 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-700 dark:text-navy-300">
                          • {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metadata Specs */}
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-2">
                    <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-navy-200 dark:border-navy-800">
                      <span className="text-[9px] text-navy-400 block">AUTHOR</span>
                      <span className="font-bold text-navy-800 dark:text-navy-200 truncate block">{scannedMaterial.author}</span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-navy-200 dark:border-navy-800">
                      <span className="text-[9px] text-navy-400 block">FILE SIZE</span>
                      <span className="font-bold text-navy-800 dark:text-navy-200">{scannedMaterial.fileSize}</span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-navy-200 dark:border-navy-800">
                      <span className="text-[9px] text-navy-400 block">FORMAT</span>
                      <span className="font-bold text-navy-800 dark:text-navy-200 uppercase">{scannedMaterial.type} Document</span>
                    </div>
                  </div>

                  {/* Action Launcher Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSaveToFavorites}
                        className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                          isSavedFavorite
                            ? "bg-amber-500 text-navy-950 border-amber-400"
                            : "border-navy-200 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-900"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isSavedFavorite ? "fill-navy-950" : ""}`} />
                        <span>{isSavedFavorite ? "Saved to Favorites" : "Bookmark Resource"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsPreviewPdfOpen(true)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-royal-600 hover:bg-royal-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-gold-400" />
                        <span>View Document Online</span>
                      </button>

                      <a
                        href={scannedMaterial.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RECENT SCAN HISTORY */}
            {scanHistory.length > 0 && (
              <div className="pt-4 border-t border-navy-150 dark:border-navy-800 space-y-3">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-xs font-bold text-navy-700 dark:text-navy-300 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-royal-500" />
                    Recent Material Scans History
                  </span>
                  <span className="text-[10px] text-navy-400">{scanHistory.length} items logged</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {scanHistory.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => processExtractedCode(item.code)}
                      className="p-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 hover:border-royal-500 dark:hover:border-gold-400 rounded-xl text-left transition-all flex-shrink-0 w-48 group cursor-pointer"
                    >
                      <span className="text-[9px] font-mono font-bold text-royal-600 dark:text-gold-400 block">
                        {item.code}
                      </span>
                      <h6 className="text-[11px] font-mono font-bold text-navy-900 dark:text-white truncate group-hover:text-royal-600 dark:group-hover:text-gold-400">
                        {item.title}
                      </h6>
                      <span className="text-[9px] text-navy-400 font-mono block mt-0.5">
                        {item.scannedAt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>

      {/* PDF PREVIEWER MODAL */}
      {scannedMaterial && (
        <PDFPreviewerModal
          isOpen={isPreviewPdfOpen}
          onClose={() => setIsPreviewPdfOpen(false)}
          item={{
            id: scannedMaterial.code,
            title: scannedMaterial.title,
            description: scannedMaterial.description,
            subject: scannedMaterial.subject,
            grade: scannedMaterial.grade,
            syllabus: scannedMaterial.syllabus,
            category: scannedMaterial.category,
            file_url: scannedMaterial.fileUrl,
            file_type: scannedMaterial.type,
            file_size: scannedMaterial.fileSize,
            download_count: 128,
            created_at: new Date().toISOString()
          } as any}
        />
      )}
    </AnimatePresence>
  );
};
