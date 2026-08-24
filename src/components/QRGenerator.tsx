import React, { useState, useRef } from "react";
import { 
  QrCode, Video, Play, Download, Copy, Check, ExternalLink, 
  Sparkles, BookOpen, Clock, ShieldCheck, CheckCircle2, 
  HelpCircle, Eye, Share2, Layers, Award, FileText, ArrowRight,
  RefreshCw, Volume2, Maximize2, X, MessageSquare
} from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

export interface QRGeneratorProps {
  /**
   * Unique identifier or problem code (e.g. "AMH-G12-CALC-Q1", "MATH-IEB-TRIG-03")
   */
  problemId?: string;

  /**
   * Descriptive title of the math problem or worksheet section
   */
  problemTitle?: string;

  /**
   * Academic grade level (e.g. "Grade 12", "Grade 11", "Grade 10")
   */
  grade?: string;

  /**
   * Mathematics topic (e.g. "Differential Calculus", "Analytical Geometry", "Trigonometry")
   */
  topic?: string;

  /**
   * Curriculum standard
   */
  curriculum?: "CAPS" | "IEB" | "Both";

  /**
   * Specific question number or sub-question label (e.g. "Question 1.3", "Question 4")
   */
  questionNumber?: string;

  /**
   * Explicit video or digital solution URL. If omitted, automatically generated via AMH portal routing.
   */
  videoUrl?: string;

  /**
   * Estimated duration of the video walkthrough (e.g. "4:45 mins", "6:20 mins")
   */
  videoDuration?: string;

  /**
   * Name of the explaining tutor
   */
  tutorName?: string;

  /**
   * Marks allocation for the problem (e.g. 5, 8)
   */
  marks?: number;

  /**
   * Key formula hints or step notes for the solution modal
   */
  stepNotes?: string[];

  /**
   * QR Code render size in pixels (default: 80 for badge, 120 for card, 160 for full)
   */
  size?: number;

  /**
   * Visual presentation style
   */
  displayMode?: "badge" | "inline" | "card" | "full" | "minimal";

  /**
   * Error correction level for resilient scanning
   */
  level?: "L" | "M" | "Q" | "H";

  /**
   * Whether to include the Amaris Hub logo / emblem inside the QR center
   */
  includeEmblem?: boolean;

  /**
   * Enable PNG / SVG download button
   */
  allowDownload?: boolean;

  /**
   * Enable copy link button
   */
  allowCopy?: boolean;

  /**
   * Enable direct in-app video playback preview modal
   */
  allowDirectPlay?: boolean;

  /**
   * Additional custom CSS classes
   */
  className?: string;

  /**
   * Unique HTML ID for automated testing and scripting
   */
  id?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  problemId = "AMH-G12-CALC-Q1",
  problemTitle = "Grade 12 Cubic Polynomials & Stationarity Points",
  grade = "Grade 12",
  topic = "Differential Calculus",
  curriculum = "CAPS",
  questionNumber = "Question 1",
  videoUrl,
  videoDuration = "5:15 mins",
  tutorName = "Bethuel Moukangwe (AMH Lead)",
  marks = 6,
  stepNotes = [
    "Differentiate f(x) using the power rule to determine f'(x) = 3ax² + 2bx + c",
    "Equate derivative to zero f'(x) = 0 to calculate stationary turning coordinates",
    "Compute second derivative f''(x) to test concavity and inflection point x = -b/(3a)",
    "State final coordinates with accuracy and correct method reasoning"
  ],
  size,
  displayMode = "badge",
  level = "H",
  includeEmblem = true,
  allowDownload = true,
  allowCopy = true,
  allowDirectPlay = true,
  className = "",
  id = "amh-qr-generator"
}) => {
  // Generate robust solution URL
  const defaultSize = displayMode === "inline" ? 48 : displayMode === "minimal" ? 64 : displayMode === "card" ? 110 : displayMode === "full" ? 160 : 80;
  const qrSize = size || defaultSize;

  const resolvedSolutionUrl = videoUrl || 
    `https://www.amarismathematics.co.za/solutions?code=${encodeURIComponent(problemId)}&grade=${encodeURIComponent(grade)}&topic=${encodeURIComponent(topic)}&curriculum=${encodeURIComponent(curriculum)}&q=${encodeURIComponent(questionNumber)}`;

  const [copied, setCopied] = useState(false);
  const [isPlayingModalOpen, setIsPlayingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"video" | "steps" | "memo">("video");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Copy solution URL to clipboard
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(resolvedSolutionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  // Download QR code as PNG image
  const handleDownloadPNG = () => {
    try {
      const canvas = canvasRef.current?.querySelector("canvas");
      if (canvas) {
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${problemId.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (e) {
      console.error("Failed to export QR PNG", e);
    }
  };

  // 1. INLINE MODE (super compact for lists or table rows)
  if (displayMode === "inline") {
    return (
      <div id={id} className={`inline-flex items-center gap-2 group ${className}`}>
        <div 
          onClick={() => allowDirectPlay && setIsPlayingModalOpen(true)}
          className="p-1 bg-white border border-slate-300 dark:border-navy-700 rounded-lg shadow-2xs hover:shadow-md transition-all cursor-pointer hover:border-gold-500"
          title={`Scan or click to watch ${problemTitle} video walkthrough (${videoDuration})`}
        >
          <QRCodeSVG
            value={resolvedSolutionUrl}
            size={qrSize}
            level={level}
            bgColor="#FFFFFF"
            fgColor="#0A192F"
          />
        </div>
        <div className="text-[11px] font-mono">
          <span className="font-bold text-navy-900 dark:text-gold-300 block">{problemId}</span>
          <span className="text-slate-500 dark:text-slate-400 text-[10px] flex items-center gap-1">
            <Video className="w-3 h-3 text-emerald-500" /> {videoDuration}
          </span>
        </div>

        {/* Hidden Canvas for PNG export if needed */}
        <div ref={canvasRef} className="hidden">
          <QRCodeCanvas value={resolvedSolutionUrl} size={300} level={level} />
        </div>

        {/* Video Player Modal */}
        {isPlayingModalOpen && renderVideoSolutionModal()}
      </div>
    );
  }

  // 2. MINIMAL MODE (small icon badge)
  if (displayMode === "minimal") {
    return (
      <div id={id} className={`p-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl flex items-center gap-3 ${className}`}>
        <div className="p-1 bg-white border border-slate-300 rounded-lg shrink-0">
          <QRCodeSVG value={resolvedSolutionUrl} size={qrSize} level={level} bgColor="#FFFFFF" fgColor="#0F172A" />
        </div>
        <div className="font-mono text-xs">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Video className="w-3 h-3" /> Video Solution
          </div>
          <div className="font-bold text-navy-900 dark:text-white truncate max-w-[140px]">{problemId}</div>
          <div className="text-[10px] text-slate-500">{videoDuration}</div>
        </div>
        {allowDirectPlay && (
          <button
            onClick={() => setIsPlayingModalOpen(true)}
            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors ml-auto cursor-pointer"
            title="Watch Solution Video"
          >
            <Play className="w-4 h-4 fill-emerald-500" />
          </button>
        )}
        <div ref={canvasRef} className="hidden">
          <QRCodeCanvas value={resolvedSolutionUrl} size={300} level={level} />
        </div>
        {isPlayingModalOpen && renderVideoSolutionModal()}
      </div>
    );
  }

  // 3. BADGE MODE (Official Printable Worksheet Badge — Highly Recommended for Exam Papers)
  if (displayMode === "badge") {
    return (
      <div 
        id={id} 
        className={`worksheet-qr-box p-3.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs print:border-slate-800 print:bg-white ${className}`}
      >
        <div className="flex items-center gap-3.5">
          {/* Printable High-Contrast QR Code */}
          <div className="worksheet-qr-code p-1.5 bg-white border border-slate-400 dark:border-navy-600 rounded-lg shrink-0 shadow-2xs">
            <QRCodeSVG
              value={resolvedSolutionUrl}
              size={qrSize}
              level={level}
              bgColor="#FFFFFF"
              fgColor="#0A192F"
              imageSettings={includeEmblem ? {
                src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F59E0B'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>",
                x: undefined,
                y: undefined,
                height: 16,
                width: 16,
                excavate: true,
              } : undefined}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                <Video className="w-3 h-3" /> Step-by-Step Video Memo
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {videoDuration}
              </span>
            </div>

            <div className="font-black text-navy-900 dark:text-white text-xs">
              {questionNumber ? `${questionNumber} — ` : ""}{problemTitle}
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              Scan with phone camera or click to watch live whiteboard solution ({marks} Marks).
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono select-all">
              Ref ID: <strong className="text-slate-700 dark:text-slate-300">{problemId}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls (Hidden in print) */}
        <div className="flex items-center gap-2 self-end sm:self-center print:hidden">
          {allowCopy && (
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700 transition-all cursor-pointer"
              title="Copy Video Solution Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {allowDownload && (
            <button
              onClick={handleDownloadPNG}
              className="p-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700 transition-all cursor-pointer"
              title="Download QR Code Image for LaTeX or Word"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {allowDirectPlay && (
            <button
              onClick={() => setIsPlayingModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              title="Launch Interactive Solution Walkthrough"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Video</span>
            </button>
          )}
        </div>

        {/* Hidden Canvas for PNG export */}
        <div ref={canvasRef} className="hidden">
          <QRCodeCanvas value={resolvedSolutionUrl} size={350} level={level} />
        </div>

        {/* Video Player Modal */}
        {isPlayingModalOpen && renderVideoSolutionModal()}
      </div>
    );
  }

  // 4. CARD MODE (Rich visual card for student portal / dashboards)
  if (displayMode === "card") {
    return (
      <div 
        id={id}
        className={`bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all space-y-4 font-sans ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/15 text-royal-700 dark:text-royal-300 border border-royal-500/20">
                {curriculum}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                {grade}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {topic}
              </span>
            </div>
            <h4 className="font-bold text-navy-900 dark:text-white text-base font-mono">
              {questionNumber ? `${questionNumber}: ` : ""}{problemTitle}
            </h4>
            <p className="text-xs text-navy-500 dark:text-navy-400 line-clamp-2">
              Step-by-step whiteboard explanation detailing algebraic steps, derivative checks, and common matric exam pitfalls.
            </p>
          </div>

          {/* QR Code */}
          <div className="p-2 bg-white border border-navy-200 dark:border-navy-700 rounded-xl shadow-xs shrink-0">
            <QRCodeSVG
              value={resolvedSolutionUrl}
              size={qrSize}
              level={level}
              bgColor="#FFFFFF"
              fgColor="#0A192F"
            />
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="pt-3 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3 text-navy-500 dark:text-navy-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500" /> {videoDuration}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> {marks} Marks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {allowCopy && (
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}

            {allowDirectPlay && (
              <button
                onClick={() => setIsPlayingModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-royal-600 to-navy-700 hover:from-royal-500 hover:to-navy-600 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-[1.02] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play Solution</span>
              </button>
            )}
          </div>
        </div>

        <div ref={canvasRef} className="hidden">
          <QRCodeCanvas value={resolvedSolutionUrl} size={350} level={level} />
        </div>

        {isPlayingModalOpen && renderVideoSolutionModal()}
      </div>
    );
  }

  // 5. FULL CUSTOMIZER & GENERATOR MODE
  return (
    <div 
      id={id}
      className={`bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-xl space-y-6 font-sans ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-100 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-royal-500/20 to-gold-500/20 text-royal-600 dark:text-gold-400 rounded-2xl border border-royal-500/30">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white font-mono flex items-center gap-2">
              <span>Worksheet QR Solution Generator</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Live Video Memo
              </span>
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Generates high-density vector QR codes for instant student whiteboard video walkthroughs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allowCopy && (
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied URL!" : "Copy URL"}</span>
            </button>
          )}

          {allowDownload && (
            <button
              onClick={handleDownloadPNG}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Visual QR Code Display */}
        <div className="p-6 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-white border-2 border-slate-300 dark:border-navy-700 rounded-2xl shadow-lg">
            <QRCodeSVG
              value={resolvedSolutionUrl}
              size={qrSize}
              level={level}
              bgColor="#FFFFFF"
              fgColor="#0A192F"
              imageSettings={includeEmblem ? {
                src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F59E0B'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              } : undefined}
            />
          </div>
          <div className="text-center space-y-1">
            <div className="text-xs font-mono font-bold text-navy-900 dark:text-white">{problemId}</div>
            <div className="text-[11px] text-navy-500 dark:text-navy-400 font-mono">Scan for Video Solution & Memo</div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="md:col-span-2 space-y-4 font-mono">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-navy-50 dark:bg-navy-800/60 rounded-xl border border-navy-100 dark:border-navy-700/60">
              <span className="text-navy-400 text-[10px] block">TOPIC & CURRICULUM</span>
              <strong className="text-navy-900 dark:text-white">{topic} ({curriculum})</strong>
            </div>
            <div className="p-3 bg-navy-50 dark:bg-navy-800/60 rounded-xl border border-navy-100 dark:border-navy-700/60">
              <span className="text-navy-400 text-[10px] block">GRADE LEVEL</span>
              <strong className="text-navy-900 dark:text-white">{grade}</strong>
            </div>
            <div className="p-3 bg-navy-50 dark:bg-navy-800/60 rounded-xl border border-navy-100 dark:border-navy-700/60">
              <span className="text-navy-400 text-[10px] block">VIDEO DURATION</span>
              <strong className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Video className="w-3 h-3" /> {videoDuration}
              </strong>
            </div>
            <div className="p-3 bg-navy-50 dark:bg-navy-800/60 rounded-xl border border-navy-100 dark:border-navy-700/60">
              <span className="text-navy-400 text-[10px] block">ASSIGNED TUTOR</span>
              <strong className="text-navy-900 dark:text-white truncate block">{tutorName}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-600 dark:text-navy-300 font-sans space-y-1">
            <div className="font-bold text-navy-900 dark:text-white font-mono text-[11px]">Direct Solution URI:</div>
            <div className="text-[11px] font-mono text-royal-600 dark:text-royal-400 break-all select-all">
              {resolvedSolutionUrl}
            </div>
          </div>

          {allowDirectPlay && (
            <button
              onClick={() => setIsPlayingModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-royal-600 to-navy-800 hover:from-royal-500 hover:to-navy-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Interactive Solution Video & Whiteboard</span>
            </button>
          )}
        </div>
      </div>

      <div ref={canvasRef} className="hidden">
        <QRCodeCanvas value={resolvedSolutionUrl} size={400} level={level} />
      </div>

      {isPlayingModalOpen && renderVideoSolutionModal()}
    </div>
  );

  /**
   * Interactive Digital Solution Video Modal
   * Displays when a student scans the QR code or clicks "Watch Video"
   */
  function renderVideoSolutionModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/85 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-navy-100 dark:border-navy-800 flex items-center justify-between gap-4 bg-navy-50/50 dark:bg-navy-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl shadow-xs">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {problemId}
                  </span>
                  <span className="text-[10px] font-mono text-navy-500 dark:text-navy-400">
                    {grade} • {curriculum} • {topic}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-navy-900 dark:text-white font-mono">
                  {problemTitle}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsPlayingModalOpen(false)}
              className="p-2 rounded-xl text-navy-400 hover:text-navy-800 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Tab Navigation */}
          <div className="px-5 pt-3 border-b border-navy-100 dark:border-navy-800 flex items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setActiveTab("video")}
              className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "video"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-navy-200"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Digital Whiteboard Player</span>
            </button>

            <button
              onClick={() => setActiveTab("steps")}
              className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "steps"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-navy-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Step-by-Step Derivation ({stepNotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("memo")}
              className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "memo"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-navy-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Official CAPS/IEB Marking Memo [{marks} Marks]</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {activeTab === "video" && (
              <div className="space-y-4">
                {/* Simulated High-Definition Whiteboard Canvas Video Screen */}
                <div className="relative aspect-video rounded-2xl bg-navy-950 border border-navy-800 overflow-hidden shadow-2xl flex flex-col justify-between p-4 text-white">
                  {/* Overlay Watermark & Tutor Tag */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 bg-navy-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-navy-700/60 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Amaris Master Whiteboard • {tutorName}</span>
                    </div>

                    <div className="bg-amber-500/20 text-gold-300 border border-gold-500/30 px-2.5 py-1 rounded-xl text-xs font-mono font-bold">
                      CAPS / IEB Mathematics
                    </div>
                  </div>

                  {/* Dynamic Whiteboard Animated Graphic / Equation Display */}
                  <div className="my-auto text-center space-y-3 z-10">
                    <div className="inline-block p-4 rounded-2xl bg-navy-900/90 border border-royal-500/40 backdrop-blur-md max-w-lg text-left font-mono">
                      <div className="text-gold-300 text-xs font-bold mb-1">
                        Step {currentStepIndex + 1} of {stepNotes.length}:
                      </div>
                      <div className="text-white text-sm font-semibold leading-relaxed">
                        {stepNotes[currentStepIndex]}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Video Progress Bar & Controls */}
                  <div className="z-10 space-y-2 bg-navy-900/90 backdrop-blur-md p-3 rounded-xl border border-navy-800">
                    <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden cursor-pointer">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all"
                        style={{ width: `${((currentStepIndex + 1) / stepNotes.length) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-1.5 rounded-lg bg-emerald-500 text-navy-950 font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                        >
                          {isPlaying ? <span className="px-1 text-[10px]">PAUSE</span> : <Play className="w-3.5 h-3.5 fill-navy-950" />}
                        </button>
                        <span className="text-slate-400">02:14 / {videoDuration}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Speed:</span>
                        {[0.75, 1, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              playbackSpeed === speed
                                ? "bg-royal-600 text-white"
                                : "bg-navy-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Scrubbing Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stepNotes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                        currentStepIndex === idx
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
                          : "bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-bold">STEP {idx + 1}</div>
                      <div className="truncate text-[11px]">Key Milestone {idx + 1}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "steps" && (
              <div className="space-y-3 font-mono">
                {stepNotes.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-royal-500/15 text-royal-700 dark:text-royal-300 font-bold">
                        Phase 0{idx + 1}: Method Derivation
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        +1 Mark ✓
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-navy-900 dark:text-white leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "memo" && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-navy-900 dark:text-white text-sm">
                      Official Marking Memorandum Guidelines
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                    Total: {marks} MARKS
                  </span>
                </div>

                <div className="space-y-3 text-xs text-navy-800 dark:text-navy-200">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ [M] Method Mark:</span>
                    <span>Correct application of calculus differentiation or geometric formulas.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-royal-600 dark:text-royal-400">✓ [A] Accuracy Mark:</span>
                    <span>Accurate simplification of algebraic factors and stationary point coordinates.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400">✓ [CA] Consistent Accuracy:</span>
                    <span>Carry through markings awarded when candidate follows through from intermediate calculations correctly.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-navy-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Amaris Mathematics Quality Guarantee • Grade 10-12 CAPS/IEB</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-800 dark:text-navy-100 font-bold hover:bg-navy-50 cursor-pointer"
              >
                {copied ? "Link Copied!" : "Copy Solution URL"}
              </button>
              <button
                onClick={() => setIsPlayingModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-navy-900 dark:bg-white text-white dark:text-navy-900 font-bold cursor-pointer hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default QRGenerator;
