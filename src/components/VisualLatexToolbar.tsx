import React, { useState, useRef } from "react";
import { 
  Calculator, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Code, 
  Plus, 
  X, 
  BookOpen, 
  HelpCircle,
  Maximize2,
  Mic,
  MicOff,
  AlertCircle
} from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { LatexMathEditor } from "./LatexMathEditor";

// Helper for Spoken Math Phonetic Formatting
const formatSpokenMath = (text: string): string => {
  let result = text;
  result = result
    .replace(/\bx squared\b/gi, "x²")
    .replace(/\by squared\b/gi, "y²")
    .replace(/\bx cubed\b/gi, "x³")
    .replace(/\bplus or minus\b/gi, "±")
    .replace(/\bsquare root of\b/gi, "√")
    .replace(/\bsquare root\b/gi, "√")
    .replace(/\bdivided by\b/gi, "÷")
    .replace(/\bmultiply by\b/gi, "×")
    .replace(/\bmultiplied by\b/gi, "×")
    .replace(/\bpi\b/gi, "π")
    .replace(/\btheta\b/gi, "θ")
    .replace(/\bdelta\b/gi, "Δ")
    .replace(/\bintegral of\b/gi, "∫")
    .replace(/\bintegral\b/gi, "∫")
    .replace(/\bgreater than or equal to\b/gi, "≥")
    .replace(/\bless than or equal to\b/gi, "≤")
    .replace(/\bnot equal to\b/gi, "≠")
    .replace(/\binfinity\b/gi, "∞")
    .replace(/\balpha\b/gi, "α")
    .replace(/\bbeta\b/gi, "β");
  return result;
};

export interface VisualLatexToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  className?: string;
  showLivePreview?: boolean;
  compact?: boolean;
  onSend?: () => void;
  buttonText?: string;
}

const QUICK_MATH_SYMBOLS = [
  { label: "Fraction", latex: "\\frac{a}{b}", display: "a/b" },
  { label: "Power", latex: "x^{n}", display: "xⁿ" },
  { label: "Subscript", latex: "x_{n}", display: "xₙ" },
  { label: "Square Root", latex: "\\sqrt{x}", display: "√x" },
  { label: "Quad Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", display: "Quad Form" },
  { label: "Derivative Limit", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", display: "f'(x) Limit" },
  { label: "Sin", latex: "\\sin(\\theta)", display: "sin(θ)" },
  { label: "Cos", latex: "\\cos(\\theta)", display: "cos(θ)" },
  { label: "Tan", latex: "\\tan(\\theta)", display: "tan(θ)" },
  { label: "Integral", latex: "\\int_{a}^{b} f(x) \\, dx", display: "∫ f(x)" },
  { label: "Summation", latex: "\\sum_{k=1}^{n} T_k", display: "∑ Tₖ" },
  { label: "Plus/Minus", latex: "\\pm", display: "±" },
  { label: "Theta", latex: "\\theta", display: "θ" },
  { label: "Delta", latex: "\\Delta", display: "Δ" },
  { label: "Pi", latex: "\\pi", display: "π" },
  { label: "Approx", latex: "\\approx", display: "≈" },
  { label: "Degrees", latex: "^\\circ", display: "°" }
];

export const VisualLatexToolbar: React.FC<VisualLatexToolbarProps> = ({
  value,
  onChange,
  placeholder = "Type message or feedback notes... Use KaTeX formulas like \\frac{a}{b} or $x^2$",
  label,
  rows = 3,
  className = "",
  showLivePreview = true,
  compact = false,
  onSend,
  buttonText
}) => {
  const [showFullEditorModal, setShowFullEditorModal] = useState<boolean>(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(true);
  const [showQuickPalette, setShowQuickPalette] = useState<boolean>(!compact);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Web Speech API State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const toggleSpeechDictation = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    try {
      if (recognitionRef.current) recognitionRef.current.abort();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-ZA";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let finalStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalStr += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (finalStr) {
          const formatted = formatSpokenMath(finalStr);
          if ((formatted.toLowerCase().includes("send question") || formatted.toLowerCase().includes("submit question")) && onSend) {
            const cleanedText = formatted.replace(/send question|submit question/gi, "").trim();
            if (cleanedText) {
              onChange(value ? `${value} ${cleanedText}` : cleanedText);
            }
            recognition.stop();
            setIsListening(false);
            setTimeout(() => onSend(), 300);
          } else {
            onChange(value ? `${value} ${formatted}` : formatted);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission denied.");
        } else if (event.error !== "no-speech") {
          setSpeechError(`Speech error (${event.error})`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      setSpeechError("Could not start speech engine.");
      setIsListening(false);
    }
  };

  const handleInsertSymbol = (latex: string) => {
    if (!textareaRef.current) {
      onChange(value ? `${value} ${latex}` : latex);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insert formatted string with spaces around it
    const formatted = latex.startsWith("\\") || latex.includes("=") ? ` ${latex} ` : latex;
    const nextValue = value.substring(0, start) + formatted + value.substring(end);
    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + formatted.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 40);
  };

  const hasMath = Boolean(
    value && (
      value.includes("\\") || 
      value.includes("$") || 
      value.includes("^") || 
      value.includes("_") || 
      /[=±√θΔπ∫lim]/i.test(value)
    )
  );

  return (
    <div className={`space-y-2 text-left ${className}`}>
      {/* Label and Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label ? (
          <label className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-amber-500" />
            {label}
          </label>
        ) : (
          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Visual Equation Toolbar
          </span>
        )}

        <div className="flex items-center gap-2">
          {/* Voice Speech Dictation Button */}
          <button
            type="button"
            onClick={toggleSpeechDictation}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border ${
              isListening 
                ? "bg-rose-600 text-white border-rose-500 shadow-md animate-pulse" 
                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30"
            }`}
            title={isListening ? "Stop voice dictation" : "Dictate text hands-free (Speech-to-Text)"}
          >
            {isListening ? <MicOff className="w-3 h-3 text-white" /> : <Mic className="w-3 h-3 text-rose-500" />}
            <span>{isListening ? "Listening..." : "Dictate"}</span>
          </button>

          {/* Toggle Quick Symbol Palette */}
          <button
            type="button"
            onClick={() => setShowQuickPalette(!showQuickPalette)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors border ${
              showQuickPalette 
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {showQuickPalette ? "Hide Math Palette" : "+ Math Palette"}
          </button>

          {/* Full Visual Math Editor Launcher */}
          <button
            type="button"
            onClick={() => setShowFullEditorModal(true)}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[10px] font-mono flex items-center gap-1 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            title="Open Full Visual Equation Builder Modal"
          >
            <Calculator className="w-3 h-3" />
            <span>Full Equation Builder</span>
          </button>

          {/* Live Preview Toggle */}
          {hasMath && (
            <button
              type="button"
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="p-1 rounded-lg text-slate-500 hover:text-amber-500 dark:text-slate-400 transition-colors"
              title={isPreviewVisible ? "Hide rendered preview" : "Show rendered preview"}
            >
              {isPreviewVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-mono text-rose-600 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button type="button" onClick={() => setSpeechError(null)} className="p-0.5 hover:bg-rose-200 dark:hover:bg-rose-900 rounded cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Active Listening Feedback Banner */}
      {isListening && (
        <div className="p-2.5 rounded-xl bg-rose-950/90 border-2 border-rose-500/80 text-white text-[11px] space-y-1.5 shadow-md backdrop-blur-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="font-bold text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Dictating Math Hands-Free...
            </span>
            <span className="text-[10px] text-slate-300">Say <code className="bg-black/50 px-1 rounded text-amber-300">"send question"</code> to submit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  style={{ animationDelay: `${bar * 0.15}s` }}
                  className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce"
                />
              ))}
            </div>
            <p className="font-mono text-amber-200 italic text-[11px] truncate">
              {interimTranscript ? `"${interimTranscript}..."` : "Listening..."}
            </p>
          </div>
        </div>
      )}

      {/* Quick Symbol Palette Strip */}
      {showQuickPalette && (
        <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5 transition-all">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Quick Math Notations (Click to insert):</span>
            <span className="text-[9px]">CAPS / IEB Exam Format</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_MATH_SYMBOLS.map((sym) => (
              <button
                key={sym.label}
                type="button"
                onClick={() => handleInsertSymbol(sym.latex)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 hover:bg-amber-500/10 hover:border-amber-500/50 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
                title={`Insert ${sym.label} (${sym.latex})`}
              >
                {sym.display}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && onSend) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={rows}
          placeholder={placeholder}
          className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all resize-y shadow-inner font-sans"
        />

        {onSend && (
          <div className="absolute right-2 bottom-2">
            <button
              type="button"
              onClick={onSend}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-transform hover:scale-105"
            >
              {buttonText || "Send"}
            </button>
          </div>
        )}
      </div>

      {/* Real-time Rendered KaTeX Equation Preview Card */}
      {showLivePreview && hasMath && isPreviewVisible && (
        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 text-xs space-y-1 transition-all animate-fadeIn">
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold uppercase">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-500" /> Live Rendered Math Output:
            </span>
            <span>KaTeX Preview</span>
          </div>
          <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-500/20 text-slate-900 dark:text-slate-100 font-sans leading-relaxed overflow-x-auto select-all">
            <LatexRenderer text={value} />
          </div>
        </div>
      )}

      {/* Full Equation Editor Modal */}
      {showFullEditorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Visual Equation Builder
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Construct complex CAPS / IEB mathematical notations and insert directly into your text
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFullEditorModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LatexMathEditor
              initialFormula={value.includes("$") ? value.replace(/\$/g, "") : value || "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"}
              onSendToTutor={(latex) => {
                onChange(value ? `${value} ${latex}` : latex);
                setShowFullEditorModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
