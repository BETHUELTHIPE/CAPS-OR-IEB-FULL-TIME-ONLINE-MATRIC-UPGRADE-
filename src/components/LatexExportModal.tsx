import React, { useState } from "react";
import { 
  X, Download, Copy, Check, FileCode, Sparkles, BookOpen, 
  ExternalLink, CheckCircle2, Code2, Layers, AlertCircle
} from "lucide-react";
import { generateConversationLatex, downloadLatexFile, ChatExportMessage } from "../lib/latexExport";

export interface LatexExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatExportMessage[];
  studentName?: string;
  tutorName?: string;
  syllabus?: string;
  grade?: string;
  topic?: string;
}

export const LatexExportModal: React.FC<LatexExportModalProps> = ({
  isOpen,
  onClose,
  messages,
  studentName = "Student",
  tutorName = "Tutor Bethuel",
  syllabus = "CAPS",
  grade = "Grade 12",
  topic = "Mathematics"
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "info">("preview");

  if (!isOpen) return null;

  const latexCode = generateConversationLatex({
    title: `Amaris Math - ${topic} Derivations`,
    studentName,
    tutorName,
    syllabus,
    grade,
    topic,
    messages
  });

  const sanitizedFileName = `amaris_${topic.toLowerCase().replace(/[^a-z0-9]/g, "_")}_derivations.tex`;

  const handleDownload = () => {
    downloadLatexFile(latexCode, sanitizedFileName);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy LaTeX:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-navy-900 rounded-2xl shadow-2xl overflow-hidden border border-navy-200 dark:border-navy-800">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-navy-150 dark:border-navy-800 flex items-center justify-between bg-navy-50/60 dark:bg-navy-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-navy-900 dark:text-white text-base md:text-lg">
                  Export Conversation as LaTeX (.tex)
                </h3>
                <span className="text-[10px] font-mono bg-royal-100 text-royal-700 dark:bg-royal-950/60 dark:text-gold-400 font-bold px-2 py-0.5 rounded-full border border-royal-200 dark:border-royal-800">
                  {messages.length} Turns
                </span>
              </div>
              <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">
                Clean digital record formatted with amsmath, tcolorbox & CAPS/IEB derivations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-navy-400 hover:text-navy-700 dark:hover:text-white rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info / Metadata Banner */}
        <div className="px-4 py-2.5 bg-royal-50/50 dark:bg-navy-950/40 border-b border-navy-150 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-navy-400 font-bold uppercase text-[10px]">Topic:</span>
            <span className="px-2 py-0.5 bg-white dark:bg-navy-800 font-bold text-navy-800 dark:text-navy-200 rounded border border-navy-200 dark:border-navy-750">
              {topic}
            </span>
            <span className="text-navy-400 font-bold uppercase text-[10px]">Syllabus:</span>
            <span className="px-2 py-0.5 bg-white dark:bg-navy-800 font-bold text-navy-800 dark:text-navy-200 rounded border border-navy-200 dark:border-navy-750">
              {syllabus} • {grade}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Overleaf & TeX Live Compilable</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-4 pt-3 flex gap-2 border-b border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`pb-2.5 px-3 text-xs font-bold font-mono border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "border-royal-600 text-royal-600 dark:border-gold-400 dark:text-gold-400"
                : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-navy-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>LaTeX Source Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`pb-2.5 px-3 text-xs font-bold font-mono border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "info"
                ? "border-royal-600 text-royal-600 dark:border-gold-400 dark:text-gold-400"
                : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-navy-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Compilation Guide</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-900 dark:bg-slate-950 font-mono text-xs">
          {activeTab === "preview" ? (
            <div className="relative">
              <pre className="text-emerald-400 leading-relaxed overflow-x-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] select-all">
                {latexCode}
              </pre>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-navy-200 space-y-4 font-sans text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  How to Use Your Exported LaTeX File
                </h4>
                <p className="text-navy-300 leading-relaxed">
                  The generated <code className="bg-navy-950 px-1.5 py-0.5 rounded text-gold-400">.tex</code> file is structured with standard AMS-LaTeX packages (<code className="text-emerald-400">amsmath</code>, <code className="text-emerald-400">amssymb</code>, <code className="text-emerald-400">mathtools</code>, and <code className="text-emerald-400">tcolorbox</code>) for clean publication-quality math typesetting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-royal-400" />
                    Option 1: Overleaf (Cloud)
                  </div>
                  <p className="text-[11px] text-navy-400">
                    Open Overleaf, create a New Project &rarr; Upload Project, and upload this <code className="text-gold-400">.tex</code> file or paste the source code.
                  </p>
                </div>

                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-royal-400" />
                    Option 2: Local TeX Distribution
                  </div>
                  <p className="text-[11px] text-navy-400">
                    Compile using <code className="text-emerald-400">pdflatex {sanitizedFileName}</code> or open in TeXShop, TeXStudio, or VS Code with LaTeX Workshop.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-white dark:bg-navy-900 border-t border-navy-150 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-navy-500 dark:text-navy-400">
            Filename: <span className="font-bold text-navy-800 dark:text-navy-200">{sanitizedFileName}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 bg-navy-100 hover:bg-navy-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-800 dark:text-navy-100 font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-navy-200 dark:border-navy-750"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy LaTeX</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs font-mono flex items-center gap-2 shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .tex File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
