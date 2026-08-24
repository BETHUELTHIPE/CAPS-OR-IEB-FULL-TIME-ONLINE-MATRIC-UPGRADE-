import React, { useRef } from "react";
import { X, Printer, Download, Sparkles, CheckCircle2, Copy, BookOpen, Award, FileText } from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { AmarisLogo } from "./AmarisLogo";

export interface ReasoningPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasoningText: string;
  question?: string;
  topic?: string;
  syllabus?: string;
  grade?: string;
  studentName?: string;
}

export const ReasoningPdfExportModal: React.FC<ReasoningPdfExportModalProps> = ({
  isOpen,
  onClose,
  reasoningText,
  question,
  topic = "Mathematics",
  syllabus = "CAPS",
  grade = "Grade 12",
  studentName = "Student"
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(reasoningText);
    alert("Reasoning text copied to clipboard!");
  };

  const formattedDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      {/* PRINT-SPECIFIC CSS RULES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-math-document, #printable-math-document * {
            visibility: visible !important;
          }
          #printable-math-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .katex {
            font-size: 1.1em !important;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-navy-900 rounded-2xl shadow-2xl overflow-hidden border border-navy-200 dark:border-navy-800 animate-fadeIn">
        {/* MODAL HEADER BAR (NO PRINT) */}
        <div className="no-print p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gold-500 to-amber-600 rounded-xl text-navy-950 font-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-display tracking-wide flex items-center gap-2">
                Print-Ready Math Reasoning PDF Document
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  KaTeX Formatted
                </span>
              </h3>
              <p className="text-[11px] text-navy-300 font-mono">
                Preview your formatted CAPS/IEB solution before saving or printing as PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-navy-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy Text</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-4 py-1.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 rounded-xl text-xs font-black flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-100 dark:bg-navy-950">
          <div
            id="printable-math-document"
            ref={printRef}
            className="max-w-3xl mx-auto bg-white text-navy-900 p-8 md:p-12 rounded-2xl shadow-xl border border-navy-150 space-y-6 text-left"
          >
            {/* DOCUMENT BRANDING HEADER */}
            <div className="flex items-start justify-between border-b-2 border-navy-900 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AmarisLogo className="w-8 h-8 text-royal-700" />
                  <span className="text-xl font-black text-navy-950 tracking-tight font-display">
                    AMARIS MATHEMATICS HUB
                  </span>
                </div>
                <p className="text-xs text-navy-600 font-mono uppercase tracking-wider font-bold">
                  Official CAPS & IEB Curriculum Step-by-Step AI Solution
                </p>
                <p className="text-[11px] text-navy-500 font-sans">
                  www.amarismaths.co.za • Tutor Bethuel AI Reasoning Engine
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block bg-royal-900 text-gold-400 text-xs font-mono font-black px-3 py-1 rounded-md uppercase tracking-wider">
                  {syllabus} • {grade}
                </span>
                <p className="text-[10px] text-navy-500 font-mono mt-1">
                  Generated: {formattedDate}
                </p>
              </div>
            </div>

            {/* METADATA STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy-50 p-3.5 rounded-xl border border-navy-150 text-xs">
              <div>
                <span className="block text-[10px] font-mono text-navy-500 uppercase font-bold">Student Name</span>
                <span className="font-bold text-navy-900 truncate block">{studentName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-navy-500 uppercase font-bold">Topic Focus</span>
                <span className="font-bold text-royal-700 truncate block">{topic}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-navy-500 uppercase font-bold">Engine</span>
                <span className="font-bold text-amber-700 truncate block">Gemini 3.6 Flash</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-navy-500 uppercase font-bold">Method Verification</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> CAPS Standard
                </span>
              </div>
            </div>

            {/* ORIGINAL QUESTION STATEMENT */}
            {question && (
              <div className="p-4 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider font-mono">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Question Statement / Problem Prompt</span>
                </div>
                <div className="text-sm font-sans font-medium text-navy-900 leading-relaxed pl-1">
                  <LatexRenderer text={question} />
                </div>
              </div>
            )}

            {/* STEP-BY-STEP REASONING SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-navy-200 pb-2">
                <h2 className="text-base font-black text-navy-950 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Step-by-Step Mathematical Reasoning & Method Marks
                </h2>
                <span className="text-[11px] font-mono text-navy-500 italic">KaTeX Formatted</span>
              </div>

              {/* KATEX RENDERED SOLUTION CONTENT */}
              <div className="prose prose-sm max-w-none text-navy-950 font-sans leading-relaxed space-y-3 bg-white p-2">
                <LatexRenderer text={reasoningText} />
              </div>
            </div>

            {/* CERTIFICATE / FOOTER SEAL */}
            <div className="pt-6 border-t-2 border-navy-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-navy-500">
              <div className="space-y-0.5">
                <p className="font-bold text-navy-900 font-mono">
                  Amaris Mathematics Hub • Step-by-Step AI Reasoning Export
                </p>
                <p className="text-[11px] text-navy-500">
                  Calculations aligned with NSC CAPS / IEB Marking Guidelines.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block font-serif font-bold text-royal-900 text-sm italic">Bethuel Thipe</span>
                  <span className="block text-[10px] font-mono text-navy-400">Head Tutor & Content Creator</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-black text-xs">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS BAR */}
        <div className="no-print p-4 bg-white dark:bg-navy-900 border-t border-navy-150 dark:border-navy-800 flex items-center justify-between text-xs">
          <span className="text-navy-500 font-mono">
            💡 Press <code className="bg-navy-100 dark:bg-navy-800 px-1.5 py-0.5 rounded font-bold">Ctrl + P</code> or click Download / Print PDF to save as PDF.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 text-navy-800 dark:text-navy-200 rounded-xl font-bold cursor-pointer"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-5 py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-black rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
