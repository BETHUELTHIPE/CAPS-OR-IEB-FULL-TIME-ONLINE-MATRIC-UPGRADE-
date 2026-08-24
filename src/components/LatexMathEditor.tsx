import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Save, 
  Trash2, 
  HelpCircle, 
  Send, 
  Code, 
  Layers, 
  Plus, 
  Download, 
  Share2, 
  FileText, 
  CheckCircle2,
  Eye,
  AlertTriangle,
  Bookmark,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface LatexMathEditorProps {
  initialFormula?: string;
  onSendToTutor?: (latex: string) => void;
  className?: string;
}

interface SavedEquation {
  id: string;
  title: string;
  latex: string;
  category: string;
  createdAt: string;
}

interface SymbolShortcut {
  label: string;
  latex: string;
  display?: string;
  description?: string;
}

interface SymbolCategory {
  name: string;
  icon?: string;
  items: SymbolShortcut[];
}

const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    name: "Algebra & Fractions",
    items: [
      { label: "Fraction", latex: "\\frac{a}{b}", display: "a/b", description: "Numerator / Denominator" },
      { label: "Power / Exponent", latex: "x^{n}", display: "xⁿ", description: "x raised to power n" },
      { label: "Subscript", latex: "x_{n}", display: "xₙ", description: "Subscript index n" },
      { label: "Square Root", latex: "\\sqrt{x}", display: "√x", description: "Square root of x" },
      { label: "N-th Root", latex: "\\sqrt[n]{x}", display: "ⁿ√x", description: "N-th root of x" },
      { label: "Plus-Minus", latex: "\\pm", display: "±", description: "Plus or minus operator" },
      { label: "Multiplication Dot", latex: "\\cdot", display: "·", description: "Centered dot product" },
      { label: "Division", latex: "\\div", display: "÷", description: "Division sign" },
      { label: "Not Equal", latex: "\\neq", display: "≠", description: "Inequality" },
      { label: "Less or Equal", latex: "\\le", display: "≤", description: "Less than or equal" },
      { label: "Greater or Equal", latex: "\\ge", display: "≥", description: "Greater than or equal" },
      { label: "Approximate", latex: "\\approx", display: "≈", description: "Approximately equal" },
    ]
  },
  {
    name: "Calculus & Limits",
    items: [
      { label: "Derivative (Leibniz)", latex: "\\frac{df}{dx}", display: "df/dx", description: "Derivative with respect to x" },
      { label: "Higher Derivative", latex: "\\frac{d^2y}{dx^2}", display: "d²y/dx²", description: "Second derivative" },
      { label: "Limit", latex: "\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", display: "lim h→0", description: "First principles derivative limit" },
      { label: "Indefinite Integral", latex: "\\int f(x) \\, dx", display: "∫ f(x) dx", description: "Indefinite integral" },
      { label: "Definite Integral", latex: "\\int_{a}^{b} f(x) \\, dx", display: "∫ₐᵇ f(x) dx", description: "Definite integral from a to b" },
      { label: "Summation (Sigma)", latex: "\\sum_{k=1}^{n} T_k", display: "∑ Tₖ", description: "Series summation" },
      { label: "Partial Derivative", latex: "\\frac{\\partial f}{\\partial x}", display: "∂f/∂x", description: "Partial derivative" },
      { label: "Infinity", latex: "\\infty", display: "∞", description: "Infinity symbol" },
    ]
  },
  {
    name: "Trigonometry",
    items: [
      { label: "Sine", latex: "\\sin(\\theta)", display: "sin(θ)", description: "Sine function" },
      { label: "Cosine", latex: "\\cos(\\theta)", display: "cos(θ)", description: "Cosine function" },
      { label: "Tangent", latex: "\\tan(\\theta)", display: "tan(θ)", description: "Tangent function" },
      { label: "Trig Identity", latex: "\\sin^2(\\theta) + \\cos^2(\\theta) = 1", display: "sin²θ+cos²θ=1", description: "Pythagorean trig identity" },
      { label: "Double Angle Sin", latex: "\\sin(2\\theta) = 2\\sin(\\theta)\\cos(\\theta)", display: "sin(2θ)", description: "Double angle sine expansion" },
      { label: "Double Angle Cos", latex: "\\cos(2\\theta) = \\cos^2(\\theta) - \\sin^2(\\theta)", display: "cos(2θ)", description: "Double angle cosine expansion" },
      { label: "Inverse Tan", latex: "\\tan^{-1}(m)", display: "tan⁻¹(m)", description: "Angle of inclination formula" },
      { label: "Degree Symbol", latex: "^\\circ", display: "°", description: "Angle degrees" },
    ]
  },
  {
    name: "Sequences & Financial",
    items: [
      { label: "Arithmetic Term", latex: "T_n = a + (n - 1)d", display: "Tₙ=a+(n-1)d", description: "Arithmetic sequence general term" },
      { label: "Arithmetic Sum", latex: "S_n = \\frac{n}{2} [2a + (n - 1)d]", display: "Sₙ sum", description: "Arithmetic series sum formula" },
      { label: "Geometric Term", latex: "T_n = a \\cdot r^{n-1}", display: "Tₙ=a·rⁿ⁻¹", description: "Geometric sequence general term" },
      { label: "Geometric Sum", latex: "S_n = \\frac{a(r^n - 1)}{r - 1}", display: "Sₙ geom", description: "Geometric series sum formula" },
      { label: "Sum to Infinity", latex: "S_\\infty = \\frac{a}{1 - r}", display: "S_∞", description: "Infinite geometric series sum" },
      { label: "Compound Growth", latex: "A = P(1 + i)^n", display: "A=P(1+i)ⁿ", description: "Compound interest growth" },
      { label: "Future Value Annuity", latex: "F = x \\left[ \\frac{(1 + i)^n - 1}{i} \\right]", display: "F Annuity", description: "Sinking fund future value" },
      { label: "Present Value Annuity", latex: "P = x \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right]", display: "P Annuity", description: "Loan repayment present value" },
    ]
  },
  {
    name: "Greek & Matrix & Sets",
    items: [
      { label: "Theta", latex: "\\theta", display: "θ", description: "Angle Theta" },
      { label: "Delta", latex: "\\Delta", display: "Δ", description: "Discriminant or change in value" },
      { label: "Pi", latex: "\\pi", display: "π", description: "Pi constant" },
      { label: "Alpha", latex: "\\alpha", display: "α", description: "Greek Alpha" },
      { label: "Beta", latex: "\\beta", display: "β", description: "Greek Beta" },
      { label: "Matrix 2x2", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", display: "2x2 Matrix", description: "2 by 2 matrix" },
      { label: "Column Vector", latex: "\\begin{pmatrix} x \\\\ y \\end{pmatrix}", display: "Vector", description: "2D column vector" },
      { label: "Element Of", latex: "\\in", display: "∈", description: "Set membership" },
      { label: "Text Block", latex: "\\text{where } x \\in \\mathbb{R}", display: "text{...}", description: "Formatted text inside math" },
    ]
  }
];

const PRESET_EQUATIONS = [
  {
    title: "Quadratic Formula (CAPS/IEB)",
    category: "Algebra",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
  },
  {
    title: "Distance Between Two Points",
    category: "Analytical Geometry",
    latex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}"
  },
  {
    title: "Sine Rule (Non-right Triangles)",
    category: "Trigonometry",
    latex: "\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}"
  },
  {
    title: "Cosine Rule",
    category: "Trigonometry",
    latex: "a^2 = b^2 + c^2 - 2bc \\cos(A)"
  },
  {
    title: "Derivative from First Principles",
    category: "Calculus",
    latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
  },
  {
    title: "Circle Equation (Center a, b)",
    category: "Analytical Geometry",
    latex: "(x - a)^2 + (y - b)^2 = r^2"
  },
  {
    title: "Standard Normal Distribution Z-Score",
    category: "Statistics",
    latex: "z = \\frac{x - \\mu}{\\sigma}"
  },
  {
    title: "Compound Probability Union",
    category: "Probability",
    latex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)"
  }
];

export const LatexMathEditor: React.FC<LatexMathEditorProps> = ({
  initialFormula = "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  onSendToTutor,
  className = ""
}) => {
  const [latexInput, setLatexInput] = useState<string>(initialFormula);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<boolean>(true); // true = $$ block $$, false = $ inline $
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("Algebra & Fractions");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [savedTitle, setSavedTitle] = useState<string>("");
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  // Saved equations list in localStorage
  const [savedEquations, setSavedEquations] = useState<SavedEquation[]>(() => {
    try {
      const stored = localStorage.getItem("amh_saved_latex_equations");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "eq-1",
        title: "Quadratic Equation Solution",
        latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        category: "Algebra",
        createdAt: "2026-07-20"
      },
      {
        id: "eq-2",
        title: "Derivative First Principles Limit",
        latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        category: "Calculus",
        createdAt: "2026-07-22"
      }
    ];
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);

  // Re-render KaTeX whenever latexInput or displayMode changes
  useEffect(() => {
    if (!latexInput.trim()) {
      setRenderedHtml("<span class='text-gray-400 italic'>Type LaTeX or click symbols above to render...</span>");
      setRenderError(null);
      return;
    }

    try {
      const html = katex.renderToString(latexInput, {
        displayMode: displayMode,
        throwOnError: true,
        trust: true
      });
      setRenderedHtml(html);
      setRenderError(null);
    } catch (err: any) {
      // Gentle error fallback using KaTeX throwOnError: false rendering so partial latex still renders
      try {
        const fallbackHtml = katex.renderToString(latexInput, {
          displayMode: displayMode,
          throwOnError: false,
          trust: true
        });
        setRenderedHtml(fallbackHtml);
        setRenderError(err?.message || "LaTeX syntax warning");
      } catch (e: any) {
        setRenderError("Invalid LaTeX command structure.");
      }
    }
  }, [latexInput, displayMode]);

  // Save equations array to localStorage
  const saveSavedEquations = (list: SavedEquation[]) => {
    setSavedEquations(list);
    try {
      localStorage.setItem("amh_saved_latex_equations", JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const handleInsertLatex = (shortcutLatex: string) => {
    if (!textareaRef.current) {
      setLatexInput(prev => prev + " " + shortcutLatex);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText = latexInput.substring(0, start) + shortcutLatex + latexInput.substring(end);
    setLatexInput(newText);

    // Reposition cursor inside/after inserted shortcut
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + shortcutLatex.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleCopyLatex = () => {
    const formattedToCopy = displayMode ? `$$${latexInput}$$` : `$${latexInput}$`;
    navigator.clipboard.writeText(formattedToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRawLatex = () => {
    navigator.clipboard.writeText(latexInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setLatexInput("");
    setRenderError(null);
  };

  const handleSaveEquation = () => {
    if (!savedTitle.trim() || !latexInput.trim()) return;
    const newEq: SavedEquation = {
      id: "eq-" + Date.now(),
      title: savedTitle.trim(),
      latex: latexInput.trim(),
      category: activeCategory || "General",
      createdAt: new Date().toISOString().split("T")[0]
    };
    const updated = [newEq, ...savedEquations];
    saveSavedEquations(updated);
    setSavedTitle("");
    setShowSaveModal(false);
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedEquations.filter(eq => eq.id !== id);
    saveSavedEquations(updated);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-sm md:text-base";
      case "md": return "text-base md:text-lg";
      case "lg": return "text-xl md:text-2xl";
      case "xl": return "text-2xl md:text-3xl";
      default: return "text-xl md:text-2xl";
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all ${isFullscreen ? "fixed inset-0 z-50 rounded-none border-none p-4 md:p-6 bg-slate-950 overflow-y-auto" : ""} ${className}`}>
      {/* Editor Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg tracking-tight text-slate-100">Interactive LaTeX Math Editor</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                KaTeX Realtime
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Type or insert mathematical expressions with instant formatted visual previews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Display mode toggle */}
          <button
            onClick={() => setDisplayMode(!displayMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
              displayMode 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
            title="Toggle between Display Block ($$) and Inline ($) mode"
          >
            <Code className="w-3.5 h-3.5" />
            {displayMode ? "Display Block Mode ($$)" : "Inline Mode ($)"}
          </button>

          {/* Guide toggle */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
              showGuide
                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            LaTeX Guide
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* LaTeX Cheat Sheet Guide Dropdown */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-850 bg-slate-900 border-b border-slate-800 p-4 text-xs text-slate-300 overflow-hidden"
          >
            <div className="max-w-5xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-sm">
                  <BookOpen className="w-4 h-4" /> CAPS & IEB Quick LaTeX Syntax Reference
                </span>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Close Guide
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-amber-300 font-sans font-bold block mb-1">Fractions & Powers</span>
                  <div><code className="text-blue-400">\frac&#123;a&#125;&#123;b&#125;</code> &rarr; <span className="text-white">Fractions</span></div>
                  <div><code className="text-blue-400">x^&#123;2&#125;</code> &rarr; <span className="text-white">x squared</span></div>
                  <div><code className="text-blue-400">x_&#123;1&#125;</code> &rarr; <span className="text-white">Subscript 1</span></div>
                  <div><code className="text-blue-400">\sqrt&#123;x&#125;</code> &rarr; <span className="text-white">Square root</span></div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-amber-300 font-sans font-bold block mb-1">Calculus & Limits</span>
                  <div><code className="text-blue-400">\lim_&#123;x \to 0&#125;</code> &rarr; <span className="text-white">Limit</span></div>
                  <div><code className="text-blue-400">\int_&#123;a&#125;^&#123;b&#125;</code> &rarr; <span className="text-white">Definite Integral</span></div>
                  <div><code className="text-blue-400">\frac&#123;dy&#125;&#123;dx&#125;</code> &rarr; <span className="text-white">Derivative</span></div>
                  <div><code className="text-blue-400">\sum_&#123;i=1&#125;^&#123;n&#125;</code> &rarr; <span className="text-white">Sigma Sum</span></div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-amber-300 font-sans font-bold block mb-1">Trig & Greek</span>
                  <div><code className="text-blue-400">\sin(\theta)</code> &rarr; <span className="text-white">Sine theta</span></div>
                  <div><code className="text-blue-400">\theta, \pi, \Delta</code> &rarr; <span className="text-white">Greek Letters</span></div>
                  <div><code className="text-blue-400">\pm, \cdot, \approx</code> &rarr; <span className="text-white">±, ·, ≈</span></div>
                  <div><code className="text-blue-400">\text&#123;where &#125;</code> &rarr; <span className="text-white">Normal text</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body Layout */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Real-time Formatted KaTeX Preview Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              Live Formatted Preview
            </label>

            {/* Font size selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-[10px] text-slate-500 px-1.5 font-medium">Text Size:</span>
              {(["sm", "md", "lg", "xl"] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                    fontSize === size
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Formatted Output Container */}
          <div 
            ref={renderRef}
            className="min-h-[120px] max-h-[300px] overflow-y-auto overflow-x-auto p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-all shadow-inner relative group"
          >
            {renderError && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-md text-[11px] font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{renderError}</span>
              </div>
            )}

            <div 
              className={`w-full text-center transition-all select-all font-sans ${getFontSizeClass()}`}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>

        {/* Quick Symbol Toolbar Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              Quick Insert Symbol Palette
            </span>
            <span className="text-[11px] text-slate-500">
              Click any symbol button below to insert into editor cursor position
            </span>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
            {SYMBOL_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeCategory === cat.name
                    ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Category Symbol Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
            {SYMBOL_CATEGORIES.find(c => c.name === activeCategory)?.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleInsertLatex(item.latex)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500/10 hover:border-amber-500/50 dark:hover:bg-amber-950/30 border border-slate-200/80 dark:border-slate-700/80 transition-all flex flex-col items-center justify-center text-center group relative shadow-sm"
                title={item.description || item.label}
              >
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.display || item.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full group-hover:text-slate-700 dark:group-hover:text-slate-300">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* LaTeX Raw Source Code Input Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-500" />
              LaTeX Code Input
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                title="Clear code"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              placeholder="Type your LaTeX math expression here, e.g. \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              rows={4}
              className="w-full p-4 rounded-xl bg-slate-900 text-amber-300 font-mono text-sm md:text-base border-2 border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-y shadow-inner"
            />
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy LaTeX Code */}
            <button
              onClick={handleCopyLatex}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Formatted Math!" : "Copy Formatted ($$)"}
            </button>

            <button
              onClick={handleCopyRawLatex}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs md:text-sm flex items-center gap-1.5 transition-all border border-slate-300 dark:border-slate-700"
            >
              <Code className="w-3.5 h-3.5" />
              Copy Raw Code
            </button>

            {/* Save Equation to Library */}
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs md:text-sm flex items-center gap-1.5 transition-all border border-slate-300 dark:border-slate-700"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              Save Equation
            </button>
          </div>

          {/* Send to Tutor Action */}
          {onSendToTutor && (
            <button
              onClick={() => onSendToTutor(displayMode ? `$$${latexInput}$$` : `$${latexInput}$`)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
              Send to Ask Tutor
            </button>
          )}
        </div>

        {/* CAPS / IEB Preset Formulas Accordion */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Standard CAPS & IEB Exam Presets
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {PRESET_EQUATIONS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setLatexInput(preset.latex)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200 dark:border-slate-700/80 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                  {preset.latex}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Equations Library List */}
        {savedEquations.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-emerald-500" />
              Saved Custom Equations ({savedEquations.length})
            </span>

            <div className="space-y-2">
              {savedEquations.map((eq) => (
                <div 
                  key={eq.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="space-y-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{eq.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        {eq.category}
                      </span>
                    </div>
                    <code className="text-xs text-amber-600 dark:text-amber-400 font-mono block">
                      {eq.latex}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLatexInput(eq.latex)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-colors"
                    >
                      Load into Editor
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(eq.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete saved equation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Equation Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                Save Equation to Library
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Equation Title
                  </label>
                  <input
                    type="text"
                    value={savedTitle}
                    onChange={(e) => setSavedTitle(e.target.value)}
                    placeholder="e.g. Sinking Fund Formula"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Preview LaTeX Code
                  </label>
                  <code className="block p-3 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs break-all">
                    {latexInput}
                  </code>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEquation}
                  disabled={!savedTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save to Library
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
