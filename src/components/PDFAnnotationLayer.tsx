import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Highlighter, 
  StickyNote, 
  MousePointer, 
  Trash2, 
  X, 
  Plus, 
  Check, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  Download, 
  Copy, 
  Eye, 
  Palette,
  Edit3,
  Pin,
  ListFilter,
  Maximize2,
  Minimize2,
  FileText,
  Layers,
  BookMarked,
  ArrowRight
} from "lucide-react";
import { Flashcard } from "./FormulaFlashcards";

export interface PDFHighlight {
  id: string;
  pageNumber: number;
  textSnippet: string;
  color: string; // hex or color name
  timestamp: string;
  note?: string;
  elementIdx?: number;
}

export interface PDFStickyNote {
  id: string;
  pageNumber: number;
  xPercent: number; // 0 - 100%
  yPercent: number; // 0 - 100%
  content: string;
  color: 'yellow' | 'green' | 'pink' | 'blue' | 'purple';
  author: string;
  timestamp: string;
  isCollapsed?: boolean;
}

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', hex: '#fef08a', bgClass: 'bg-amber-200 text-navy-950 dark:bg-amber-400/50 dark:text-amber-100', borderClass: 'border-amber-400', label: 'Yellow' },
  { id: 'green', hex: '#bbf7d0', bgClass: 'bg-emerald-200 text-navy-950 dark:bg-emerald-400/50 dark:text-emerald-100', borderClass: 'border-emerald-400', label: 'Green' },
  { id: 'pink', hex: '#fbcfe8', bgClass: 'bg-pink-200 text-navy-950 dark:bg-pink-400/50 dark:text-pink-100', borderClass: 'border-pink-400', label: 'Pink' },
  { id: 'blue', hex: '#bfdbfe', bgClass: 'bg-blue-200 text-navy-950 dark:bg-blue-400/50 dark:text-blue-100', borderClass: 'border-blue-400', label: 'Blue' },
  { id: 'orange', hex: '#fed7aa', bgClass: 'bg-orange-200 text-navy-950 dark:bg-orange-400/50 dark:text-orange-100', borderClass: 'border-orange-400', label: 'Orange' },
];

export const STICKY_COLORS: Record<PDFStickyNote['color'], { bg: string; header: string; text: string; border: string }> = {
  yellow: { bg: 'bg-amber-50 dark:bg-amber-950/95', header: 'bg-amber-300 dark:bg-amber-500 text-amber-950', text: 'text-amber-950 dark:text-amber-100', border: 'border-amber-300 dark:border-amber-700' },
  green: { bg: 'bg-emerald-50 dark:bg-emerald-950/95', header: 'bg-emerald-300 dark:bg-emerald-500 text-emerald-950', text: 'text-emerald-950 dark:text-emerald-100', border: 'border-emerald-300 dark:border-emerald-700' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/95', header: 'bg-pink-300 dark:bg-pink-500 text-pink-950', text: 'text-pink-950 dark:text-pink-100', border: 'border-pink-300 dark:border-pink-700' },
  blue: { bg: 'bg-sky-50 dark:bg-sky-950/95', header: 'bg-sky-300 dark:bg-sky-500 text-sky-950', text: 'text-sky-950 dark:text-sky-100', border: 'border-sky-300 dark:border-sky-700' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/95', header: 'bg-purple-300 dark:bg-purple-500 text-purple-950', text: 'text-purple-950 dark:text-purple-100', border: 'border-purple-300 dark:border-purple-700' },
};

export const getStoredAnnotations = (documentId: string): { highlights: PDFHighlight[]; stickyNotes: PDFStickyNote[] } => {
  try {
    const data = localStorage.getItem(`amh_pdf_annotations_${documentId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load PDF annotations:", e);
  }
  return { highlights: [], stickyNotes: [] };
};

export const saveStoredAnnotations = (documentId: string, highlights: PDFHighlight[], stickyNotes: PDFStickyNote[]) => {
  try {
    localStorage.setItem(`amh_pdf_annotations_${documentId}`, JSON.stringify({ highlights, stickyNotes }));
  } catch (e) {
    console.error("Failed to save PDF annotations:", e);
  }
};

export interface PDFReadingProgress {
  docId: string;
  lastReadPage: number;
  maxPageRead: number;
  totalPages: number;
  percentage: number;
  updatedAt: string;
}

export const getPDFProgress = (docId: string): PDFReadingProgress | null => {
  try {
    const raw = localStorage.getItem("amh_pdf_reading_progress");
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[docId] || null;
  } catch (e) {
    return null;
  }
};

export const getAllPDFProgress = (): Record<string, PDFReadingProgress> => {
  try {
    const raw = localStorage.getItem("amh_pdf_reading_progress");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const savePDFProgress = (docId: string, pageNumber: number, totalPages: number): PDFReadingProgress => {
  try {
    const raw = localStorage.getItem("amh_pdf_reading_progress");
    const all = raw ? JSON.parse(raw) : {};
    const existing = all[docId] || { maxPageRead: 1 };
    
    const maxPage = Math.max(existing.maxPageRead || 1, pageNumber);
    const validTotal = Math.max(1, totalPages);
    const percentage = Math.min(100, Math.round((maxPage / validTotal) * 100));

    const progress: PDFReadingProgress = {
      docId,
      lastReadPage: pageNumber,
      maxPageRead: maxPage,
      totalPages: validTotal,
      percentage,
      updatedAt: new Date().toISOString()
    };

    all[docId] = progress;
    localStorage.setItem("amh_pdf_reading_progress", JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("amh_pdf_progress_updated", { detail: { docId, progress } }));
    return progress;
  } catch (e) {
    return {
      docId,
      lastReadPage: pageNumber,
      maxPageRead: pageNumber,
      totalPages: totalPages || 1,
      percentage: Math.round((pageNumber / (totalPages || 1)) * 100),
      updatedAt: new Date().toISOString()
    };
  }
};

export const saveCustomFlashcard = (cardData: Omit<Flashcard, 'id'>): Flashcard => {
  const newCard: Flashcard = {
    ...cardData,
    id: `fc-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  };
  try {
    const existing = localStorage.getItem("amaris_custom_flashcards");
    const cards: Flashcard[] = existing ? JSON.parse(existing) : [];
    cards.unshift(newCard);
    localStorage.setItem("amaris_custom_flashcards", JSON.stringify(cards));
  } catch (e) {
    console.error("Failed to save custom flashcard:", e);
  }
  return newCard;
};

export interface GenerateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: 'highlight' | 'sticky' | 'batch';
  sourceItem?: PDFHighlight | PDFStickyNote | null;
  allHighlights?: PDFHighlight[];
  allStickyNotes?: PDFStickyNote[];
  documentTitle: string;
  onFlashcardCreated?: (card: Flashcard) => void;
}

export const GenerateFlashcardModal: React.FC<GenerateFlashcardModalProps> = ({
  isOpen,
  onClose,
  sourceType,
  sourceItem,
  allHighlights = [],
  allStickyNotes = [],
  documentTitle,
  onFlashcardCreated
}) => {
  const [title, setTitle] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [topic, setTopic] = useState<Flashcard['topic']>("Algebra & Sequences");
  const [grade, setGrade] = useState<Flashcard['grade']>("Grade 12");
  const [syllabus, setSyllabus] = useState<Flashcard['syllabus']>("Both");
  const [cardType, setCardType] = useState<Flashcard['type']>("formula");
  const [examTip, setExamTip] = useState("");
  const [isToastShowing, setIsToastShowing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Batch selection state
  const [selectedHighlightIds, setSelectedHighlightIds] = useState<string[]>([]);
  const [selectedStickyIds, setSelectedStickyIds] = useState<string[]>([]);

  // Pre-fill state whenever modal opens or item changes
  useEffect(() => {
    if (!isOpen) return;

    if (sourceType === 'batch') {
      setSelectedHighlightIds(allHighlights.map(h => h.id));
      setSelectedStickyIds(allStickyNotes.map(s => s.id));
      setTitle(`Deck from ${documentTitle}`);
      setFront(`Review concepts from ${documentTitle}`);
      setBack(`Contains ${allHighlights.length} highlights and ${allStickyNotes.length} sticky notes.`);
      setExamTip(`Generated from PDF reading session of ${documentTitle}`);
    } else if (sourceItem) {
      const pageNum = sourceItem.pageNumber;
      if ('textSnippet' in sourceItem) {
        // Highlight
        const snippet = sourceItem.textSnippet;
        setTitle(`Highlight - Page ${pageNum}`);
        setFront(`What key concept or formula is highlighted on Page ${pageNum} of ${documentTitle}?`);
        setBack(snippet);
        setExamTip(`Referenced from ${documentTitle} (Page ${pageNum}).`);
      } else {
        // Sticky Note
        const content = sourceItem.content || "Sticky Note";
        setTitle(`Note - Page ${pageNum}`);
        setFront(`Study note from Page ${pageNum} (${documentTitle}):`);
        setBack(content);
        setExamTip(`Created during PDF review on Page ${pageNum}.`);
      }
    }
  }, [isOpen, sourceType, sourceItem, documentTitle, allHighlights, allStickyNotes]);

  if (!isOpen) return null;

  // AI Auto-Format Q&A Helper
  const handleAutoFormatQA = () => {
    if (sourceType === 'batch') return;
    
    const contentText = back.trim();
    if (!contentText) return;

    // Detect if content has equality sign or formulas
    if (contentText.includes("=") || contentText.includes("+") || contentText.includes("-") || contentText.includes("√") || contentText.includes("sin") || contentText.includes("cos") || contentText.includes("tan")) {
      setCardType("formula");
      setFront(`State or solve the formula / expression extracted from ${documentTitle}:`);
    } else {
      setCardType("terminology");
      setFront(`Define or explain the key term / statement from Page ${sourceItem?.pageNumber || 1} of ${documentTitle}:`);
    }

    setExamTip(`✨ AI Formatted Q&A • High-yield CAPS/IEB exam review card from ${documentTitle}`);
    setToastMessage("✨ Auto-formatted into a high-yield Q&A flashcard!");
    setIsToastShowing(true);
    setTimeout(() => setIsToastShowing(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === 'batch') {
      // Create flashcards for all selected highlights & sticky notes
      let count = 0;
      allHighlights.filter(h => selectedHighlightIds.includes(h.id)).forEach(h => {
        const card: Omit<Flashcard, 'id'> = {
          type: "terminology",
          title: `Highlight (Pg ${h.pageNumber}) - ${documentTitle.substring(0, 20)}`,
          topic,
          grade,
          syllabus,
          front: `What key rule is highlighted on Page ${h.pageNumber} of ${documentTitle}?`,
          back: h.textSnippet,
          examTip: `Extracted from PDF annotation on Page ${h.pageNumber}`,
          tags: ["PDF Annotation", "High-Yield", documentTitle.substring(0, 15)]
        };
        const saved = saveCustomFlashcard(card);
        if (onFlashcardCreated) onFlashcardCreated(saved);
        count++;
      });

      allStickyNotes.filter(s => selectedStickyIds.includes(s.id)).forEach(s => {
        const card: Omit<Flashcard, 'id'> = {
          type: "formula",
          title: `Sticky Note (Pg ${s.pageNumber}) - ${documentTitle.substring(0, 20)}`,
          topic,
          grade,
          syllabus,
          front: `Sticky note prompt (Page ${s.pageNumber}):`,
          back: s.content || "(Empty Note)",
          examTip: `Created during study session on Page ${s.pageNumber}`,
          tags: ["PDF Sticky Note", "Revision", documentTitle.substring(0, 15)]
        };
        const saved = saveCustomFlashcard(card);
        if (onFlashcardCreated) onFlashcardCreated(saved);
        count++;
      });

      setToastMessage(`🎉 Generated ${count} digital flashcards added to your Study Deck!`);
      setIsToastShowing(true);
      setTimeout(() => {
        setIsToastShowing(false);
        onClose();
      }, 1500);
      return;
    }

    // Single card save
    if (!front.trim() || !back.trim()) {
      alert("Please ensure both Front (Question) and Back (Answer) fields are filled.");
      return;
    }

    const cardData: Omit<Flashcard, 'id'> = {
      type: cardType,
      title: title.trim() || `PDF Note - ${documentTitle}`,
      topic,
      grade,
      syllabus,
      front: front.trim(),
      back: back.trim(),
      examTip: examTip.trim() || `Generated from ${documentTitle}`,
      tags: ["PDF Annotation", "Study Notes", documentTitle.substring(0, 15)]
    };

    const createdCard = saveCustomFlashcard(cardData);
    if (onFlashcardCreated) onFlashcardCreated(createdCard);

    setToastMessage("🎉 Flashcard generated and saved to your Digital Study Deck!");
    setIsToastShowing(true);
    setTimeout(() => {
      setIsToastShowing(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white dark:bg-navy-950 rounded-2xl shadow-2xl border border-navy-200 dark:border-navy-800 overflow-hidden text-left my-8"
      >
        {/* Header */}
        <div className="p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-navy-950 rounded-xl shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                {sourceType === 'batch' ? 'Batch Generate Digital Flashcards' : 'Generate Digital Flashcard'}
              </h3>
              <p className="text-[10px] font-mono text-amber-400">
                Amaris Mathematics Hub • PDF Study Layer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification Banner */}
        <AnimatePresence>
          {isToastShowing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500 text-navy-950 px-4 py-2 font-mono text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner"
            >
              <Check className="w-4 h-4 font-black" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">

          {sourceType === 'batch' ? (
            /* BATCH GENERATION SELECTION LIST */
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs font-mono space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-amber-500" />
                  <span>Document Source: {documentTitle}</span>
                </div>
                <p className="text-navy-600 dark:text-navy-300">
                  Select annotations below to convert into digital study cards for revision in your Flashcard Deck.
                </p>
              </div>

              {/* Selection Highlights List */}
              {allHighlights.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-black uppercase text-royal-600 dark:text-royal-400">
                    <span className="flex items-center gap-1">
                      <Highlighter className="w-3.5 h-3.5" /> Highlights ({allHighlights.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedHighlightIds.length === allHighlights.length) {
                          setSelectedHighlightIds([]);
                        } else {
                          setSelectedHighlightIds(allHighlights.map(h => h.id));
                        }
                      }}
                      className="text-[10px] text-navy-500 dark:text-navy-400 hover:underline cursor-pointer"
                    >
                      {selectedHighlightIds.length === allHighlights.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 border border-navy-150 dark:border-navy-850 rounded-xl">
                    {allHighlights.map(h => {
                      const isSelected = selectedHighlightIds.includes(h.id);
                      return (
                        <label
                          key={h.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/10 border-amber-500/40 text-navy-900 dark:text-white' 
                              : 'bg-navy-50/50 dark:bg-navy-900/30 border-transparent text-navy-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedHighlightIds(prev => [...prev, h.id]);
                              } else {
                                setSelectedHighlightIds(prev => prev.filter(id => id !== h.id));
                              }
                            }}
                            className="mt-0.5 rounded border-navy-300 text-amber-500 focus:ring-amber-400"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-gold-400 block">
                              Page {h.pageNumber}
                            </span>
                            <p className="truncate text-xs">"{h.textSnippet}"</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selection Sticky Notes List */}
              {allStickyNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-black uppercase text-amber-600 dark:text-gold-400">
                    <span className="flex items-center gap-1">
                      <StickyNote className="w-3.5 h-3.5" /> Sticky Notes ({allStickyNotes.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedStickyIds.length === allStickyNotes.length) {
                          setSelectedStickyIds([]);
                        } else {
                          setSelectedStickyIds(allStickyNotes.map(s => s.id));
                        }
                      }}
                      className="text-[10px] text-navy-500 dark:text-navy-400 hover:underline cursor-pointer"
                    >
                      {selectedStickyIds.length === allStickyNotes.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 border border-navy-150 dark:border-navy-850 rounded-xl">
                    {allStickyNotes.map(s => {
                      const isSelected = selectedStickyIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/10 border-amber-500/40 text-navy-900 dark:text-white' 
                              : 'bg-navy-50/50 dark:bg-navy-900/30 border-transparent text-navy-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStickyIds(prev => [...prev, s.id]);
                              } else {
                                setSelectedStickyIds(prev => prev.filter(id => id !== s.id));
                              }
                            }}
                            className="mt-0.5 rounded border-navy-300 text-amber-500 focus:ring-amber-400"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-gold-400 block">
                              Page {s.pageNumber}
                            </span>
                            <p className="truncate text-xs">{s.content || "(Blank note)"}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shared Metadata Options */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                    Topic Category
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Flashcard['topic'])}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Algebra & Sequences">Algebra & Sequences</option>
                    <option value="Functions & Graphs">Functions & Graphs</option>
                    <option value="Financial Mathematics">Financial Mathematics</option>
                    <option value="Trigonometry">Trigonometry</option>
                    <option value="Analytical Geometry">Analytical Geometry</option>
                    <option value="Euclidean Geometry">Euclidean Geometry</option>
                    <option value="Differential Calculus">Differential Calculus</option>
                    <option value="Probability">Probability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as Flashcard['grade'])}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="All">All Grades</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* SINGLE CARD EDIT FORM */
            <>
              {/* Quick AI Format helper bar */}
              <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono">
                <span className="text-navy-800 dark:text-gold-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Source: Page {sourceItem?.pageNumber || 1} Annotation
                </span>
                <button
                  type="button"
                  onClick={handleAutoFormatQA}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-navy-950 font-black rounded-lg text-[11px] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  title="Auto-format highlighted text into clear Question & Answer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Format Q&A</span>
                </button>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                    Card Title / Concept Name
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quadratic Formula Rule"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                    Card Type
                  </label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as Flashcard['type'])}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="formula">Formula</option>
                    <option value="terminology">Terminology</option>
                  </select>
                </div>
              </div>

              {/* Front Side (Question / Concept Prompt) */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                  Front Side (Question / Concept Prompt)
                </label>
                <textarea
                  required
                  rows={2}
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="e.g. What is the derivative limit formula from first principles?"
                  className="w-full p-2.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Back Side (Answer / Formula / Rule Definition) */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                  Back Side (Answer / Formula Expression)
                </label>
                <textarea
                  required
                  rows={3}
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="e.g. f'(x) = lim[h->0] (f(x+h) - f(x)) / h"
                  className="w-full p-2.5 text-xs font-mono bg-amber-50/50 dark:bg-navy-900/90 border border-amber-300 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Topic & Grade Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                    Topic Category
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Flashcard['topic'])}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Algebra & Sequences">Algebra & Sequences</option>
                    <option value="Functions & Graphs">Functions & Graphs</option>
                    <option value="Financial Mathematics">Financial Mathematics</option>
                    <option value="Trigonometry">Trigonometry</option>
                    <option value="Analytical Geometry">Analytical Geometry</option>
                    <option value="Euclidean Geometry">Euclidean Geometry</option>
                    <option value="Differential Calculus">Differential Calculus</option>
                    <option value="Probability">Probability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as Flashcard['grade'])}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="All">All Grades</option>
                  </select>
                </div>
              </div>

              {/* Practical Exam Tip */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                  Practical Exam Tip (Optional)
                </label>
                <input
                  type="text"
                  value={examTip}
                  onChange={(e) => setExamTip(e.target.value)}
                  placeholder="e.g. Remember to simplify sign before taking square root!"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-navy-150 dark:border-navy-850 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-navy-100 dark:bg-navy-900 text-navy-700 dark:text-navy-300 hover:bg-navy-200 font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sourceType === 'batch' && selectedHighlightIds.length === 0 && selectedStickyIds.length === 0}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-navy-950 font-black font-mono text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Layers className="w-4 h-4 font-black" />
              <span>
                {sourceType === 'batch' 
                  ? `Generate ${selectedHighlightIds.length + selectedStickyIds.length} Flashcard(s)`
                  : "Save Flashcard to Study Deck"
                }
              </span>
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export const PDFAnnotationToolbar: React.FC<{
  activeTool: 'pointer' | 'highlighter' | 'sticky';
  onToolChange: (tool: 'pointer' | 'highlighter' | 'sticky') => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  stickyColor: PDFStickyNote['color'];
  onStickyColorChange: (color: PDFStickyNote['color']) => void;
  totalAnnotations: number;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
}> = ({
  activeTool,
  onToolChange,
  selectedColor,
  onColorChange,
  stickyColor,
  onStickyColorChange,
  totalAnnotations,
  onToggleDrawer,
  isDrawerOpen
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-white dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800 shadow-sm font-mono text-xs">
      {/* Tool Buttons */}
      <button
        onClick={() => onToolChange('pointer')}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
          activeTool === 'pointer'
            ? 'bg-navy-900 text-white dark:bg-royal-600 font-black shadow-sm'
            : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-900'
        }`}
        title="Pointer mode: Scroll and interact normally"
      >
        <MousePointer className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Pointer</span>
      </button>

      <button
        onClick={() => onToolChange('highlighter')}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
          activeTool === 'highlighter'
            ? 'bg-amber-500 text-navy-950 font-black shadow-sm'
            : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-900'
        }`}
        title="Text Highlighter tool: Click or select text to highlight"
      >
        <Highlighter className="w-3.5 h-3.5 text-amber-500 font-bold" />
        <span className="hidden sm:inline">Highlight</span>
      </button>

      <button
        onClick={() => onToolChange('sticky')}
        className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
          activeTool === 'sticky'
            ? 'bg-gold-500 text-navy-950 font-black shadow-sm'
            : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-900'
        }`}
        title="Sticky Note tool: Click anywhere on document canvas to add sticky note"
      >
        <StickyNote className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Sticky Note</span>
      </button>

      {/* Color Selectors depending on active tool */}
      {activeTool === 'highlighter' && (
        <div className="flex items-center gap-1 pl-1 border-l border-navy-200 dark:border-navy-800">
          {HIGHLIGHT_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => onColorChange(c.hex)}
              className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                selectedColor === c.hex ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Highlight color: ${c.label}`}
            />
          ))}
        </div>
      )}

      {activeTool === 'sticky' && (
        <div className="flex items-center gap-1 pl-1 border-l border-navy-200 dark:border-navy-800">
          {(['yellow', 'green', 'pink', 'blue', 'purple'] as PDFStickyNote['color'][]).map(c => (
            <button
              key={c}
              onClick={() => onStickyColorChange(c)}
              className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                stickyColor === c ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'
              } ${STICKY_COLORS[c].header}`}
              title={`Sticky Note color: ${c}`}
            />
          ))}
        </div>
      )}

      {/* Drawer Toggle Button */}
      <div className="pl-1 border-l border-navy-200 dark:border-navy-800">
        <button
          onClick={onToggleDrawer}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold relative ${
            isDrawerOpen
              ? 'bg-amber-500/20 text-amber-600 dark:text-gold-400 border border-amber-500/30'
              : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-900'
          }`}
          title="Toggle Annotations & Sticky Notes Drawer"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Notes</span>
          {totalAnnotations > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-navy-950 font-black rounded-full text-[9px]">
              {totalAnnotations}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export const PDFCanvasAnnotationsOverlay: React.FC<{
  containerRef: React.RefObject<HTMLDivElement>;
  activeTool: 'pointer' | 'highlighter' | 'sticky';
  selectedColor: string;
  stickyColor: PDFStickyNote['color'];
  pageNumber: number;
  stickyNotes: PDFStickyNote[];
  onAddStickyNote: (note: PDFStickyNote) => void;
  onUpdateStickyNote: (noteId: string, content: string) => void;
  onDeleteStickyNote: (noteId: string) => void;
  onToggleCollapseStickyNote: (noteId: string) => void;
  highlights: PDFHighlight[];
  onAddHighlight: (highlight: PDFHighlight) => void;
  onDeleteHighlight: (highlightId: string) => void;
}> = ({
  containerRef,
  activeTool,
  selectedColor,
  stickyColor,
  pageNumber,
  stickyNotes,
  onAddStickyNote,
  onUpdateStickyNote,
  onDeleteStickyNote,
  onToggleCollapseStickyNote,
  highlights,
  onAddHighlight,
  onDeleteHighlight
}) => {
  const [selectedTextPopover, setSelectedTextPopover] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Filter sticky notes for current page
  const pageStickyNotes = stickyNotes.filter(n => n.pageNumber === pageNumber);

  // Handle click on canvas container
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'sticky' || !containerRef.current) return;
    
    // Ensure user didn't click inside an existing sticky note card
    if ((e.target as HTMLElement).closest('.sticky-note-card')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = Math.min(Math.max(5, ((e.clientX - rect.left) / rect.width) * 100), 85);
    const yPercent = Math.min(Math.max(5, ((e.clientY - rect.top) / rect.height) * 100), 90);

    const newNote: PDFStickyNote = {
      id: `sticky_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber,
      xPercent,
      yPercent,
      content: "",
      color: stickyColor,
      author: "Student",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCollapsed: false
    };

    onAddStickyNote(newNote);
  };

  // Handle Text Selection Popup
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const text = selection.toString().trim();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // Ensure selection is inside document canvas
        if (
          rect.top >= containerRect.top &&
          rect.left >= containerRect.left &&
          rect.bottom <= containerRect.bottom &&
          rect.right <= containerRect.right
        ) {
          setSelectedTextPopover({
            text,
            x: rect.left - containerRect.left + (rect.width / 2),
            y: rect.top - containerRect.top - 36
          });
          return;
        }
      }
      setSelectedTextPopover(null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [containerRef]);

  const handleApplyHighlightFromPopover = (colorHex: string) => {
    if (!selectedTextPopover) return;
    const newHighlight: PDFHighlight = {
      id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber,
      textSnippet: selectedTextPopover.text,
      color: colorHex,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onAddHighlight(newHighlight);
    setSelectedTextPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div 
      className={`absolute inset-0 pointer-events-auto ${
        activeTool === 'sticky' ? 'cursor-crosshair' : activeTool === 'highlighter' ? 'cursor-text' : ''
      }`}
      onClick={handleCanvasClick}
    >
      {/* Floating Selection Highlight Popover */}
      {selectedTextPopover && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          className="absolute z-50 transform -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-navy-950 text-white rounded-xl shadow-2xl border border-amber-500/40 font-mono text-xs"
          style={{ top: `${selectedTextPopover.y}px`, left: `${selectedTextPopover.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-bold text-amber-400 pl-1 flex items-center gap-1">
            <Highlighter className="w-3 h-3 text-amber-500" />
            Highlight:
          </span>
          {HIGHLIGHT_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => handleApplyHighlightFromPopover(c.hex)}
              className="w-4 h-4 rounded-full border border-white/20 transition-transform hover:scale-125 cursor-pointer"
              style={{ backgroundColor: c.hex }}
              title={`Highlight with ${c.label}`}
            />
          ))}
          <button
            onClick={() => setSelectedTextPopover(null)}
            className="p-0.5 text-navy-400 hover:text-white rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Render Sticky Notes Overlay */}
      {pageStickyNotes.map(note => {
        const theme = STICKY_COLORS[note.color] || STICKY_COLORS.yellow;
        return (
          <div
            key={note.id}
            className="sticky-note-card absolute z-30 transition-all font-sans select-none"
            style={{ left: `${note.xPercent}%`, top: `${note.yPercent}%` }}
            onClick={(e) => e.stopPropagation()}
          >
            {note.isCollapsed ? (
              <motion.button
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                onClick={() => onToggleCollapseStickyNote(note.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-lg border font-mono text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${theme.header} ${theme.border}`}
                title="Click to expand sticky note"
              >
                <Pin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">
                  {note.content.trim() ? note.content.substring(0, 18) + "..." : "Sticky Note"}
                </span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`w-64 p-3 rounded-2xl shadow-2xl border ${theme.bg} ${theme.border} flex flex-col gap-2`}
              >
                {/* Header */}
                <div className={`p-1.5 -mx-3 -mt-3 rounded-t-2xl flex items-center justify-between font-mono text-[10px] font-black ${theme.header}`}>
                  <div className="flex items-center gap-1.5 pl-1">
                    <Pin className="w-3 h-3" />
                    <span>Sticky Note ({note.timestamp})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleCollapseStickyNote(note.id)}
                      className="p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
                      title="Collapse note"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteStickyNote(note.id)}
                      className="p-1 hover:bg-black/10 rounded transition-colors cursor-pointer text-red-950"
                      title="Delete note"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Content Input */}
                <textarea
                  autoFocus
                  placeholder="Type sticky note reminder or concept breakdown..."
                  value={note.content}
                  onChange={(e) => onUpdateStickyNote(note.id, e.target.value)}
                  className={`w-full min-h-[80px] p-2 text-xs font-mono bg-transparent border-0 focus:outline-none resize-none leading-relaxed ${theme.text}`}
                />

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-1.5 text-[9px] font-mono text-navy-500 dark:text-navy-300">
                  <span>Pg {note.pageNumber} • {note.author}</span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const PDFAnnotationsDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  currentPageNumber: number;
  highlights: PDFHighlight[];
  stickyNotes: PDFStickyNote[];
  onDeleteHighlight: (id: string) => void;
  onDeleteStickyNote: (id: string) => void;
  onClearAll: () => void;
}> = ({
  isOpen,
  onClose,
  documentTitle,
  currentPageNumber,
  highlights,
  stickyNotes,
  onDeleteHighlight,
  onDeleteStickyNote,
  onClearAll
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'page'>('all');
  const [copied, setCopied] = useState(false);
  
  // Flashcard Generation Modal State
  const [flashcardModal, setFlashcardModal] = useState<{
    isOpen: boolean;
    sourceType: 'highlight' | 'sticky' | 'batch';
    sourceItem?: PDFHighlight | PDFStickyNote | null;
  }>({ isOpen: false, sourceType: 'highlight', sourceItem: null });

  if (!isOpen) return null;

  const filteredHighlights = filterMode === 'page' ? highlights.filter(h => h.pageNumber === currentPageNumber) : highlights;
  const filteredStickyNotes = filterMode === 'page' ? stickyNotes.filter(s => s.pageNumber === currentPageNumber) : stickyNotes;

  const totalCount = highlights.length + stickyNotes.length;

  const handleCopyNotes = () => {
    let summary = `AMARIS MATHEMATICS HUB • PDF STUDY NOTES & ANNOTATIONS\n`;
    summary += `Document: ${documentTitle}\n`;
    summary += `Exported: ${new Date().toLocaleString()}\n\n`;

    if (stickyNotes.length > 0) {
      summary += `--- STICKY NOTES (${stickyNotes.length}) ---\n`;
      stickyNotes.forEach((s, idx) => {
        summary += `${idx + 1}. [Page ${s.pageNumber}] ${s.content || "(Empty Note)"} (${s.timestamp})\n`;
      });
      summary += `\n`;
    }

    if (highlights.length > 0) {
      summary += `--- HIGHLIGHTED TEXT SNIPPETS (${highlights.length}) ---\n`;
      highlights.forEach((h, idx) => {
        summary += `${idx + 1}. [Page ${h.pageNumber}] "${h.textSnippet}"\n`;
      });
    }

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-navy-950 z-[120] border-l border-navy-200 dark:border-navy-800 shadow-2xl flex flex-col font-sans"
      >
        {/* Header */}
        <div className="p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 text-navy-950 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Annotations & Notes ({totalCount})
              </h4>
              <p className="text-[10px] font-mono text-navy-300 truncate max-w-[180px]">
                {documentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-navy-800 text-navy-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs & Quick Actions */}
        <div className="p-3 bg-navy-50/70 dark:bg-navy-900/40 border-b border-navy-150 dark:border-navy-850 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 bg-white dark:bg-navy-950 p-1 rounded-xl border border-navy-200 dark:border-navy-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-navy-950 font-black'
                  : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-900'
              }`}
            >
              All Pages
            </button>
            <button
              onClick={() => setFilterMode('page')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === 'page'
                  ? 'bg-amber-500 text-navy-950 font-black'
                  : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-900'
              }`}
            >
              Page {currentPageNumber}
            </button>
          </div>

          {totalCount > 0 && (
            <button
              onClick={handleCopyNotes}
              className="px-2.5 py-1 bg-royal-600 hover:bg-royal-700 text-white rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Copy all annotations to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>

        {/* Batch Generate Flashcards Trigger Bar */}
        {totalCount > 0 && (
          <div className="p-2.5 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-gold-500/10 border-b border-amber-500/20 px-4">
            <button
              onClick={() => setFlashcardModal({ isOpen: true, sourceType: 'batch', sourceItem: null })}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-navy-950 font-black font-mono text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 font-black text-navy-950" />
              <span>Generate Flashcards from Notes</span>
            </button>
          </div>
        )}

        {/* Annotation List Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {totalCount === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                <StickyNote className="w-6 h-6" />
              </div>
              <h5 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
                No Annotations Yet
              </h5>
              <p className="text-xs text-navy-500 dark:text-navy-400 font-mono leading-relaxed">
                Use the top toolbar to highlight key text passages or click anywhere on the document canvas to drop sticky notes.
              </p>
            </div>
          ) : (
            <>
              {/* Sticky Notes Section */}
              {filteredStickyNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase text-amber-600 dark:text-gold-400">
                    <span className="flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Sticky Notes ({filteredStickyNotes.length})
                    </span>
                  </div>
                  {filteredStickyNotes.map((s) => {
                    const theme = STICKY_COLORS[s.color] || STICKY_COLORS.yellow;
                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border ${theme.bg} ${theme.border} space-y-2 text-left shadow-sm`}
                      >
                        <div className="flex items-center justify-between font-mono text-[9px] font-bold">
                          <span className={`px-2 py-0.5 rounded font-black ${theme.header}`}>
                            Page {s.pageNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-navy-400">{s.timestamp}</span>
                            <button
                              onClick={() => onDeleteStickyNote(s.id)}
                              className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                              title="Delete sticky note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className={`text-xs font-mono leading-relaxed whitespace-pre-wrap ${theme.text}`}>
                          {s.content || "(Blank sticky note)"}
                        </p>
                        <div className="pt-1.5 border-t border-black/10 dark:border-white/10 flex items-center justify-end">
                          <button
                            onClick={() => setFlashcardModal({ isOpen: true, sourceType: 'sticky', sourceItem: s })}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Generate Flashcard from this Sticky Note"
                          >
                            <Layers className="w-3 h-3 text-amber-500" />
                            <span>Convert to Flashcard</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Highlights Section */}
              {filteredHighlights.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-navy-150 dark:border-navy-850">
                  <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase text-royal-600 dark:text-royal-400">
                    <span className="flex items-center gap-1">
                      <Highlighter className="w-3 h-3" /> Text Highlights ({filteredHighlights.length})
                    </span>
                  </div>
                  {filteredHighlights.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 bg-navy-50 dark:bg-navy-900/60 rounded-xl border border-navy-200 dark:border-navy-800 space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between font-mono text-[9px]">
                        <span className="px-2 py-0.5 bg-navy-200 dark:bg-navy-800 text-navy-800 dark:text-navy-200 font-black rounded">
                          Page {h.pageNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: h.color }}
                          />
                          <button
                            onClick={() => onDeleteHighlight(h.id)}
                            className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                            title="Delete highlight"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <blockquote
                        className="p-2 rounded-lg text-xs font-mono leading-relaxed border-l-2 border-amber-500 text-navy-900 dark:text-white"
                        style={{ backgroundColor: `${h.color}30` }}
                      >
                        "{h.textSnippet}"
                      </blockquote>
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          onClick={() => setFlashcardModal({ isOpen: true, sourceType: 'highlight', sourceItem: h })}
                          className="px-2 py-1 bg-royal-500/15 hover:bg-royal-500/25 text-royal-700 dark:text-royal-300 font-mono text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Generate Flashcard from this Highlight snippet"
                        >
                          <Layers className="w-3 h-3 text-royal-500" />
                          <span>Convert to Flashcard</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <div className="p-3 bg-navy-900 border-t border-navy-800 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs font-mono text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>

      {/* Generate Flashcard Modal */}
      <GenerateFlashcardModal
        isOpen={flashcardModal.isOpen}
        onClose={() => setFlashcardModal(prev => ({ ...prev, isOpen: false }))}
        sourceType={flashcardModal.sourceType}
        sourceItem={flashcardModal.sourceItem}
        allHighlights={highlights}
        allStickyNotes={stickyNotes}
        documentTitle={documentTitle}
      />
    </>
  );
};
