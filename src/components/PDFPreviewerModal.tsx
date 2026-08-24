import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight, 
  BookOpen, 
  FileText, 
  Sparkles,
  FileCheck,
  Check,
  Info,
  Share2,
  Link2
} from "lucide-react";
import { ResourceLibraryItem } from "../types";
import { getDocumentPages, getDocumentOutline, DocumentPage } from "../lib/pdfDocumentUtils";
import { 
  extractPDFMetadata, 
  PDFTechnicalMetadata 
} from "../services/pdfMetadataService";
import { PDFMetadataModal } from "./PDFMetadataModal";
import { 
  PDFAnnotationToolbar, 
  PDFCanvasAnnotationsOverlay, 
  PDFAnnotationsDrawer, 
  getStoredAnnotations, 
  saveStoredAnnotations, 
  getPDFProgress,
  savePDFProgress,
  PDFHighlight, 
  PDFStickyNote 
} from "./PDFAnnotationLayer";

export interface PDFPreviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ResourceLibraryItem | null;
  onDownloadFile?: (item: ResourceLibraryItem) => void;
  onExportPDF?: (item: ResourceLibraryItem) => void;
}

export const PDFPreviewerModal: React.FC<PDFPreviewerModalProps> = ({
  isOpen,
  onClose,
  item,
  onDownloadFile,
  onExportPDF
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activePage, setActivePage] = useState<number>(1); // Default to Page 1
  const [rotation, setRotation] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"firstPage" | "allPages">("firstPage");
  const [pageInputValue, setPageInputValue] = useState<string>("1");

  // Keep pageInputValue synchronized with activePage
  useEffect(() => {
    setPageInputValue(String(activePage));
  }, [activePage]);

  // Annotation Layer States
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<'pointer' | 'highlighter' | 'sticky'>('pointer');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>('#fef08a');
  const [stickyColor, setStickyColor] = useState<PDFStickyNote['color']>('yellow');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [highlights, setHighlights] = useState<PDFHighlight[]>([]);
  const [stickyNotes, setStickyNotes] = useState<PDFStickyNote[]>([]);

  // Technical Metadata State
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState<boolean>(false);
  const [pdfMeta, setPdfMeta] = useState<PDFTechnicalMetadata | null>(null);

  // Copy Share Link State
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  const handleCopyShareLink = () => {
    if (!item) return;
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

    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  // Extract PDF Technical Metadata when document opens
  useEffect(() => {
    if (isOpen && item) {
      const extracted = extractPDFMetadata(item);
      setPdfMeta(extracted);
    }
  }, [isOpen, item]);

  // Load stored annotations when item changes or modal opens
  useEffect(() => {
    if (isOpen && item) {
      const stored = getStoredAnnotations(item.id);
      setHighlights(stored.highlights || []);
      setStickyNotes(stored.stickyNotes || []);
    }
  }, [isOpen, item]);

  // Annotation Handlers
  const handleAddStickyNote = (newNote: PDFStickyNote) => {
    const updated = [...stickyNotes, newNote];
    setStickyNotes(updated);
    if (item) saveStoredAnnotations(item.id, highlights, updated);
  };

  const handleUpdateStickyNote = (noteId: string, content: string) => {
    const updated = stickyNotes.map(n => n.id === noteId ? { ...n, content } : n);
    setStickyNotes(updated);
    if (item) saveStoredAnnotations(item.id, highlights, updated);
  };

  const handleDeleteStickyNote = (noteId: string) => {
    const updated = stickyNotes.filter(n => n.id !== noteId);
    setStickyNotes(updated);
    if (item) saveStoredAnnotations(item.id, highlights, updated);
  };

  const handleToggleCollapseStickyNote = (noteId: string) => {
    const updated = stickyNotes.map(n => n.id === noteId ? { ...n, isCollapsed: !n.isCollapsed } : n);
    setStickyNotes(updated);
    if (item) saveStoredAnnotations(item.id, highlights, updated);
  };

  const handleAddHighlight = (newHl: PDFHighlight) => {
    const updated = [...highlights, newHl];
    setHighlights(updated);
    if (item) saveStoredAnnotations(item.id, updated, stickyNotes);
  };

  const handleDeleteHighlight = (hlId: string) => {
    const updated = highlights.filter(h => h.id !== hlId);
    setHighlights(updated);
    if (item) saveStoredAnnotations(item.id, updated, stickyNotes);
  };

  const handleClearAllAnnotations = () => {
    setHighlights([]);
    setStickyNotes([]);
    if (item) saveStoredAnnotations(item.id, [], []);
  };

  // Restore reading progress & state when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setZoomLevel(100);
      setRotation(0);
      setSearchQuery("");

      const savedProgress = getPDFProgress(item.id);
      if (savedProgress && savedProgress.lastReadPage > 1) {
        setActivePage(savedProgress.lastReadPage);
        setActiveTab("allPages");
      } else {
        setActivePage(1);
        setActiveTab("firstPage");
      }
    }
  }, [isOpen, item]);

  // Track & Save Reading Progress in LocalStorage
  useEffect(() => {
    if (isOpen && item) {
      const pageNum = activeTab === "firstPage" ? 1 : activePage;
      const pages = getDocumentPages(item.id, item.title);
      savePDFProgress(item.id, pageNum, pages.length);
    }
  }, [isOpen, item, activePage, activeTab]);

  // Handle ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const documentPages = getDocumentPages(item.id, item.title);
  const totalPages = documentPages.length;
  const currentPageIndex = activeTab === "firstPage" ? 0 : Math.min(Math.max(1, activePage), totalPages) - 1;
  const currentPageData: DocumentPage = documentPages[currentPageIndex] || documentPages[0];

  const highlightText = (text: string, search: string) => {
    if (!search) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-300 dark:bg-amber-400 text-navy-950 px-0.5 rounded font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const countMatches = (pages: DocumentPage[], query: string): number => {
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

  const matchesCount = countMatches(documentPages, searchQuery);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-navy-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`bg-white dark:bg-navy-950 flex flex-col overflow-hidden shadow-2xl relative border border-navy-200 dark:border-navy-800 ${
            isFullscreen 
              ? "fixed inset-0 w-screen h-screen rounded-none z-[101]" 
              : "w-full max-w-5xl h-[88vh] rounded-3xl"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER BAR */}
          <div className="p-3 sm:p-4 bg-navy-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-navy-800">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-navy-950 rounded-xl font-black shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    First Page PDF Previewer
                  </span>
                  <span className="text-[9px] font-mono text-navy-300 hidden sm:inline">
                    (No Full Download Required)
                  </span>
                </div>
                <h3 className="text-sm font-black text-white truncate max-w-xs sm:max-w-md mt-0.5">
                  {item.title}
                </h3>
              </div>
            </div>

            {/* Middle Mode Switcher (First Page vs Full Document) */}
            <div className="flex items-center gap-1 bg-navy-950/80 p-1 rounded-xl border border-navy-800">
              <button
                onClick={() => {
                  setActiveTab("firstPage");
                  setActivePage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "firstPage"
                    ? "bg-amber-500 text-navy-950 font-black shadow-sm"
                    : "text-navy-300 hover:text-white hover:bg-navy-850"
                }`}
                title="View the first page preview directly without full download"
              >
                Page 1 Preview
              </button>
              <button
                onClick={() => setActiveTab("allPages")}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "allPages"
                    ? "bg-amber-500 text-navy-950 font-black shadow-sm"
                    : "text-navy-300 hover:text-white hover:bg-navy-850"
                }`}
                title="Browse all pages of this document"
              >
                Full Document ({totalPages} Pgs)
              </button>
            </div>

            {/* Right Action & Close Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={handleCopyShareLink}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    copiedShareLink
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                      : "bg-royal-500/20 hover:bg-royal-500/30 text-royal-200 border-royal-500/40"
                  }`}
                  title="Copy direct share URL for this resource"
                >
                  {copiedShareLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-gold-400" />
                      <span className="hidden sm:inline">Share Link</span>
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {copiedShareLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.9 }}
                      className="absolute top-full right-0 mt-2 z-50 px-3 py-1.5 bg-navy-950 text-gold-300 text-[10px] font-mono font-bold rounded-xl shadow-2xl border border-gold-500/40 flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Share link copied to clipboard!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMetadataModalOpen(true)}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
                title="View Technical PDF Metadata (Author, Creation Date, Page Count, Software)"
              >
                <Info className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Technical Meta</span>
              </button>
              <button
                onClick={() => setIsFullscreen(prev => !prev)}
                className="p-2 hover:bg-navy-800 text-navy-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-navy-800 text-navy-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Close PDF Previewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SUB-TOOLBAR (Controls: Zoom, Page Nav, Search, Export) */}
          <div className="p-2.5 sm:p-3 bg-navy-50/70 dark:bg-navy-900/40 border-b border-navy-150 dark:border-navy-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
            
            {/* Page Navigation & Indicator */}
            <div className="flex items-center gap-2">
              {activeTab === "allPages" ? (
                <div className="flex items-center gap-1 bg-white dark:bg-navy-950 px-2 py-1 rounded-xl border border-navy-200 dark:border-navy-800">
                  <button
                    disabled={activePage <= 1}
                    onClick={() => setActivePage(1)}
                    className="p-1 hover:bg-navy-100 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Jump to Page 1"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={activePage <= 1}
                    onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
                    className="p-1 hover:bg-navy-100 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] font-mono text-navy-400">Page</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageInputValue}
                      onChange={(e) => setPageInputValue(e.target.value)}
                      onBlur={() => {
                        const parsed = parseInt(pageInputValue, 10);
                        if (!isNaN(parsed)) {
                          setActivePage(Math.max(1, Math.min(totalPages, parsed)));
                        } else {
                          setPageInputValue(String(activePage));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const parsed = parseInt(pageInputValue, 10);
                          if (!isNaN(parsed)) {
                            setActivePage(Math.max(1, Math.min(totalPages, parsed)));
                          }
                        }
                      }}
                      className="w-8 text-center bg-navy-50 dark:bg-navy-900 border border-navy-300 dark:border-navy-700 rounded text-xs font-mono font-bold text-navy-900 dark:text-white py-0.5"
                    />
                    <span className="text-[11px] font-mono text-navy-400">/ {totalPages}</span>
                  </div>

                  <button
                    disabled={activePage >= totalPages}
                    onClick={() => setActivePage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1 hover:bg-navy-100 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={activePage >= totalPages}
                    onClick={() => setActivePage(totalPages)}
                    className="p-1 hover:bg-navy-100 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title={`Jump to Page ${totalPages}`}
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Range Slider */}
                  <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-navy-200 dark:border-navy-800">
                    <input
                      type="range"
                      min={1}
                      max={totalPages}
                      value={activePage}
                      onChange={(e) => setActivePage(Number(e.target.value))}
                      className="w-20 h-1.5 bg-navy-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-500"
                      title="Slide to change page"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-gold-400 rounded-xl text-xs font-mono font-bold">
                  <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Displaying Page 1 of {totalPages} (Direct Preview)</span>
                </div>
              )}

              {/* Syllabus / Grade Metadata tags */}
              <div className="hidden md:flex items-center gap-1.5 text-[9px] font-mono font-bold">
                <span className="px-2 py-0.5 bg-royal-100 text-royal-800 dark:bg-royal-950/60 dark:text-royal-300 rounded">
                  {item.syllabus} Curriculum
                </span>
                <span className="px-2 py-0.5 bg-navy-100 text-navy-700 dark:bg-navy-900 dark:text-navy-400 rounded">
                  {item.grade_level}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded">
                  {item.topic}
                </span>
              </div>
            </div>

            {/* Middle Controls (Search text within Page 1) */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search text in page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 sm:w-44 pl-7 pr-6 py-1 bg-white dark:bg-navy-950 text-xs text-navy-900 dark:text-white rounded-xl border border-navy-200 dark:border-navy-800 focus:outline-none focus:border-royal-500 font-mono"
              />
              <Eye className="w-3.5 h-3.5 text-navy-400 absolute left-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-navy-400 hover:text-navy-600 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {searchQuery && (
                <span className="ml-2 text-[10px] font-mono font-bold text-amber-600 dark:text-gold-400 shrink-0">
                  {matchesCount} match{matchesCount === 1 ? "" : "es"}
                </span>
              )}
            </div>

            {/* Right Controls (Zoom, Rotate, Save/Export PDF, Annotations Toolbar) */}
            <div className="flex flex-wrap items-center gap-2">
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
              <div className="flex items-center bg-white dark:bg-navy-950 rounded-xl border border-navy-200 dark:border-navy-800 px-1">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(60, prev - 20))}
                  className="p-1 hover:bg-navy-100 dark:hover:bg-navy-900 text-navy-700 dark:text-navy-300 rounded transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-navy-800 dark:text-navy-200 px-2 min-w-[40px] text-center select-none">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(180, prev + 20))}
                  className="p-1 hover:bg-navy-100 dark:hover:bg-navy-900 text-navy-700 dark:text-navy-300 rounded transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotation */}
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-1.5 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-900 transition-colors cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Export / Download Buttons */}
              {onExportPDF && (
                <button
                  onClick={() => onExportPDF(item)}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Download clean exportable PDF using print-friendly styles"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
              )}

              {onDownloadFile && (
                <button
                  onClick={() => onDownloadFile(item)}
                  className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white dark:bg-gold-500 dark:hover:bg-gold-600 dark:text-navy-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Download raw document file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Get Raw File</span>
                </button>
              )}
            </div>
          </div>

          {/* DOCUMENT CANVAS STAGE */}
          <div className="flex-1 overflow-auto bg-[#f1f3f5] dark:bg-navy-900 p-4 sm:p-8 flex justify-center items-start select-text relative">
            
            <div
              ref={canvasContainerRef}
              className="w-full max-w-[700px] bg-white dark:bg-navy-950 rounded-xl p-6 sm:p-10 shadow-2xl border border-navy-200/60 dark:border-navy-800 transition-all origin-top duration-200 text-left relative"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                minHeight: "950px"
              }}
            >
              {/* PDF Canvas Annotations Interactive Overlay */}
              <PDFCanvasAnnotationsOverlay
                containerRef={canvasContainerRef}
                activeTool={activeTool}
                selectedColor={selectedHighlightColor}
                stickyColor={stickyColor}
                pageNumber={currentPageData.page_number}
                stickyNotes={stickyNotes}
                onAddStickyNote={handleAddStickyNote}
                onUpdateStickyNote={handleUpdateStickyNote}
                onDeleteStickyNote={handleDeleteStickyNote}
                onToggleCollapseStickyNote={handleToggleCollapseStickyNote}
                highlights={highlights}
                onAddHighlight={handleAddHighlight}
                onDeleteHighlight={handleDeleteHighlight}
              />

              {/* Document Header Stamp */}
              <div className="border-b-2 border-navy-900 dark:border-gold-400/40 pb-4 mb-6 space-y-2">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-navy-400 uppercase tracking-widest">
                  <span>AMARIS MATHEMATICS HUB • OFFICIAL STUDY RESOURCE</span>
                  <span>{item.file_size} | {item.file_type.toUpperCase()}</span>
                </div>

                <h1 className="text-base font-black font-sans text-navy-900 dark:text-white uppercase tracking-tight leading-snug">
                  {item.title}
                </h1>

                <p className="text-xs text-navy-600 dark:text-navy-300 font-sans leading-relaxed italic">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[9px]">
                  <span className="px-2 py-0.5 bg-navy-100 text-navy-800 dark:bg-navy-900 dark:text-navy-300 rounded font-bold">
                    Syllabus: {item.syllabus}
                  </span>
                  <span className="px-2 py-0.5 bg-royal-100 text-royal-800 dark:bg-royal-950/60 dark:text-royal-300 rounded font-bold">
                    Grade: {item.grade_level}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded font-bold">
                    Topic: {item.topic}
                  </span>
                  <button
                    onClick={() => setIsMetadataModalOpen(true)}
                    className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-gold-400 font-bold rounded flex items-center gap-1 transition-colors cursor-pointer border border-amber-500/20"
                    title="View Technical PDF Metadata"
                  >
                    <Info className="w-3 h-3 text-amber-500" />
                    <span>Author: {pdfMeta?.author || "Bethuel Thipe (CAPS)"}</span>
                  </button>
                  <span className="ml-auto text-amber-600 dark:text-gold-400 font-black">
                    Page 1 Preview
                  </span>
                </div>
              </div>

              {/* Page Section Title */}
              <div className="flex items-center justify-between border-b border-dashed border-navy-200 dark:border-navy-850 pb-1.5 mb-4">
                <span className="text-[9px] font-mono text-royal-600 dark:text-gold-400 font-black uppercase tracking-wider">
                  {currentPageData.title}
                </span>
                <span className="text-[9px] font-mono text-navy-400 font-bold uppercase">
                  Page {currentPageData.page_number} of {totalPages}
                </span>
              </div>

              {/* Page Elements Rendering */}
              <div className="space-y-4">
                {currentPageData.elements.map((el, idx) => {
                  switch (el.type) {
                    case "section_header":
                      return (
                        <h3 key={idx} className="text-xs font-black font-mono text-royal-600 dark:text-gold-400 mt-5 mb-2 border-b border-navy-150 dark:border-navy-850 pb-1 uppercase tracking-wider">
                          {highlightText(el.content || "", searchQuery)}
                        </h3>
                      );
                    case "text":
                      return (
                        <p key={idx} className="text-xs text-navy-800 dark:text-navy-200 leading-relaxed font-sans whitespace-pre-line mb-3">
                          {highlightText(el.content || "", searchQuery)}
                        </p>
                      );
                    case "equation":
                      return (
                        <div key={idx} className="my-4 p-4 bg-navy-950 dark:bg-black border border-navy-800 rounded-xl space-y-2 text-center shadow-inner">
                          {el.equations?.map((eq, i) => (
                            <div key={i} className="font-mono text-xs font-bold text-amber-400 dark:text-gold-400 leading-relaxed select-all">
                              {highlightText(eq, searchQuery)}
                            </div>
                          ))}
                        </div>
                      );
                    case "tutor_note":
                      return (
                        <div key={idx} className="my-4 p-4 bg-amber-500/10 dark:bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl text-xs leading-relaxed text-navy-800 dark:text-navy-200 font-mono italic relative">
                          <div className="flex items-center gap-1.5 mb-1 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 not-italic">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Tutor Bethuel's Key Exam Remark</span>
                          </div>
                          {highlightText(el.content || "", searchQuery)}
                        </div>
                      );
                    case "section_header":
                    default:
                      return null;
                  }
                })}
              </div>

              {/* Watermark Notice */}
              <div className="mt-12 pt-4 border-t border-navy-150 dark:border-navy-850 flex items-center justify-between text-[9px] font-mono text-navy-400">
                <span>Amaris Mathematics Hub • Page 1 Verified Preview</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-3 h-3" /> Certified CAPS / IEB Output
                </span>
              </div>
            </div>

          </div>

          {/* ANNOTATIONS SIDE DRAWER */}
          <PDFAnnotationsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            documentTitle={item.title}
            currentPageNumber={currentPageData.page_number}
            highlights={highlights}
            stickyNotes={stickyNotes}
            onDeleteHighlight={handleDeleteHighlight}
            onDeleteStickyNote={handleDeleteStickyNote}
            onClearAll={handleClearAllAnnotations}
          />

          {/* FOOTER BAR */}
          <div className="p-3 bg-navy-900 text-white border-t border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-navy-300 text-[11px]">
                Previewing Page 1 of {totalPages} • Click Export PDF or Get Raw File for complete material
              </span>
            </div>

            <div className="flex items-center gap-3">
              {onExportPDF && (
                <button
                  onClick={() => onExportPDF(item)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download Full PDF</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-navy-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
          {/* Technical Metadata Modal */}
          <PDFMetadataModal
            isOpen={isMetadataModalOpen}
            onClose={() => setIsMetadataModalOpen(false)}
            metadata={pdfMeta}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
