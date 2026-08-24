import React, { useState } from "react";
import { Search, X, Copy, Check, Plus, BookOpen, Sparkles, Filter, Bookmark, Info } from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";

export interface FormulaQuickReferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula?: (latexCode: string) => void;
}

export interface FormulaItem {
  id: string;
  name: string;
  category: "algebra" | "trig" | "calculus" | "geometry" | "finance" | "stats";
  categoryLabel: string;
  latex: string;
  description: string;
  paper: "Paper 1" | "Paper 2" | "Both";
}

export const CAPS_FORMULA_DATABASE: FormulaItem[] = [
  // ALGEBRA & SEQUENCES
  {
    id: "quad_formula",
    name: "Quadratic Formula",
    category: "algebra",
    categoryLabel: "Algebra & Equations",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    description: "Roots of any quadratic equation ax² + bx + c = 0.",
    paper: "Paper 1"
  },
  {
    id: "arithmetic_nth",
    name: "Arithmetic Sequence (n-th Term)",
    category: "algebra",
    categoryLabel: "Sequences & Series",
    latex: "T_n = a + (n - 1)d",
    description: "Finding the n-th term with first term a and constant difference d.",
    paper: "Paper 1"
  },
  {
    id: "arithmetic_sum",
    name: "Arithmetic Series (Sum)",
    category: "algebra",
    categoryLabel: "Sequences & Series",
    latex: "S_n = \\frac{n}{2}\\left[2a + (n - 1)d\\right] = \\frac{n}{2}(a + l)",
    description: "Sum of first n terms of an arithmetic progression.",
    paper: "Paper 1"
  },
  {
    id: "geometric_nth",
    name: "Geometric Sequence (n-th Term)",
    category: "algebra",
    categoryLabel: "Sequences & Series",
    latex: "T_n = a \\cdot r^{n-1}",
    description: "Finding the n-th term with common ratio r.",
    paper: "Paper 1"
  },
  {
    id: "geometric_sum",
    name: "Geometric Series (Sum)",
    category: "algebra",
    categoryLabel: "Sequences & Series",
    latex: "S_n = \\frac{a(r^n - 1)}{r - 1} \\quad (r \\neq 1)",
    description: "Sum of first n terms of a geometric progression.",
    paper: "Paper 1"
  },
  {
    id: "geometric_infinity",
    name: "Sum to Infinity (Convergent Series)",
    category: "algebra",
    categoryLabel: "Sequences & Series",
    latex: "S_\\infty = \\frac{a}{1 - r} \\quad (-1 < r < 1)",
    description: "Sum of infinite geometric series where |r| < 1.",
    paper: "Paper 1"
  },

  // DIFFERENTIAL CALCULUS
  {
    id: "first_principles",
    name: "Derivative from First Principles",
    category: "calculus",
    categoryLabel: "Differential Calculus",
    latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
    description: "Definition of the derivative function using limits.",
    paper: "Paper 1"
  },
  {
    id: "power_rule",
    name: "Power Rule Differentiation",
    category: "calculus",
    categoryLabel: "Differential Calculus",
    latex: "\\frac{d}{dx}\\left(a x^n\\right) = a \\cdot n \\cdot x^{n-1}",
    description: "Standard derivative power rule for polynomial terms.",
    paper: "Paper 1"
  },
  {
    id: "turning_point_cubic",
    name: "Cubic Function Turning Points",
    category: "calculus",
    categoryLabel: "Differential Calculus",
    latex: "f'(x) = 0 \\implies 3ax^2 + 2bx + c = 0",
    description: "Stationary points / local extrema of f(x) = ax³ + bx² + cx + d.",
    paper: "Paper 1"
  },

  // TRIGONOMETRY
  {
    id: "trig_identity_pythag",
    name: "Fundamental Square Identity",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\sin^2\\theta + \\cos^2\\theta = 1",
    description: "Pythagorean identity for any angle theta.",
    paper: "Paper 2"
  },
  {
    id: "trig_identity_tan",
    name: "Quotient Identity for Tan",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}",
    description: "Tangent expressed in terms of sine and cosine.",
    paper: "Paper 2"
  },
  {
    id: "trig_double_sin",
    name: "Double Angle: Sine",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\sin(2\\alpha) = 2\\sin\\alpha\\cos\\alpha",
    description: "Double angle identity for sine.",
    paper: "Paper 2"
  },
  {
    id: "trig_double_cos",
    name: "Double Angle: Cosine",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\cos(2\\alpha) = \\cos^2\\alpha - \\sin^2\\alpha = 2\\cos^2\\alpha - 1 = 1 - 2\\sin^2\\alpha",
    description: "Three equivalent forms for double angle cosine.",
    paper: "Paper 2"
  },
  {
    id: "trig_compound_cos",
    name: "Compound Angle: Cosine",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta",
    description: "Cosine of sum or difference of two angles.",
    paper: "Paper 2"
  },
  {
    id: "trig_compound_sin",
    name: "Compound Angle: Sine",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta",
    description: "Sine of sum or difference of two angles.",
    paper: "Paper 2"
  },
  {
    id: "trig_sine_rule",
    name: "Sine Rule (Non-Right Triangle)",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}",
    description: "Relates side lengths and opposite angle sines.",
    paper: "Paper 2"
  },
  {
    id: "trig_cosine_rule",
    name: "Cosine Rule (Non-Right Triangle)",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "a^2 = b^2 + c^2 - 2bc \\cdot \\cos A",
    description: "Finding unknown side when two sides and included angle are known.",
    paper: "Paper 2"
  },
  {
    id: "trig_area_rule",
    name: "Area Rule for Triangles",
    category: "trig",
    categoryLabel: "Trigonometry",
    latex: "\\text{Area} = \\frac{1}{2}ab \\cdot \\sin C",
    description: "Area of any triangle given two sides and included angle.",
    paper: "Paper 2"
  },

  // FINANCIAL MATHEMATICS
  {
    id: "simple_interest",
    name: "Simple Interest / Depreciation",
    category: "finance",
    categoryLabel: "Financial Maths",
    latex: "A = P(1 \\pm i \\cdot n)",
    description: "Straight-line growth or linear depreciation.",
    paper: "Paper 1"
  },
  {
    id: "compound_interest",
    name: "Compound Interest / Reducing Balance",
    category: "finance",
    categoryLabel: "Financial Maths",
    latex: "A = P(1 \\pm i)^n",
    description: "Compound growth or reducing-balance depreciation.",
    paper: "Paper 1"
  },
  {
    id: "present_value_annuity",
    name: "Present Value Annuity (Loans & Mortgages)",
    category: "finance",
    categoryLabel: "Financial Maths",
    latex: "P = \\frac{x\\left[1 - (1 + i)^{-n}\\right]}{i}",
    description: "Outstanding loan balance and monthly repayment installments x.",
    paper: "Paper 1"
  },
  {
    id: "future_value_annuity",
    name: "Future Value Annuity (Sinking Funds)",
    category: "finance",
    categoryLabel: "Financial Maths",
    latex: "F = \\frac{x\\left[(1 + i)^n - 1\\right]}{i}",
    description: "Accumulated savings and sinking fund monthly deposits x.",
    paper: "Paper 1"
  },

  // ANALYTICAL & EUCLIDEAN GEOMETRY
  {
    id: "distance_formula",
    name: "Distance Between Two Points",
    category: "geometry",
    categoryLabel: "Analytical Geometry",
    latex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
    description: "Length of line segment joining (x1, y1) and (x2, y2).",
    paper: "Paper 2"
  },
  {
    id: "midpoint_formula",
    name: "Midpoint Coordinates",
    category: "geometry",
    categoryLabel: "Analytical Geometry",
    latex: "M\\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)",
    description: "Coordinates of midpoint M of line segment AB.",
    paper: "Paper 2"
  },
  {
    id: "gradient_formula",
    name: "Gradient of a Line",
    category: "geometry",
    categoryLabel: "Analytical Geometry",
    latex: "m = \\frac{y_2 - y_1}{x_2 - x_1} = \\tan\\theta",
    description: "Slope of line and angle of inclination theta.",
    paper: "Paper 2"
  },
  {
    id: "circle_equation",
    name: "Equation of a Circle",
    category: "geometry",
    categoryLabel: "Analytical Geometry",
    latex: "(x - a)^2 + (y - b)^2 = r^2",
    description: "Circle with center (a, b) and radius r.",
    paper: "Paper 2"
  },

  // STATISTICS
  {
    id: "stats_mean",
    name: "Mean (Sample Average)",
    category: "stats",
    categoryLabel: "Statistics",
    latex: "\\bar{x} = \\frac{\\sum x}{n}",
    description: "Arithmetic average of sample data points.",
    paper: "Paper 2"
  },
  {
    id: "stats_standard_deviation",
    name: "Standard Deviation",
    category: "stats",
    categoryLabel: "Statistics",
    latex: "\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2}{n}}",
    description: "Measure of data dispersion around the mean.",
    paper: "Paper 2"
  },
  {
    id: "stats_least_squares",
    name: "Linear Regression Line",
    category: "stats",
    categoryLabel: "Statistics",
    latex: "\\hat{y} = a + bx \\quad \\text{where } b = \\frac{n\\sum xy - \\sum x \\sum y}{n\\sum x^2 - (\\sum x)^2}",
    description: "Best fit trend line for scatter plots.",
    paper: "Paper 2"
  }
];

export const FormulaQuickReferenceDrawer: React.FC<FormulaQuickReferenceDrawerProps> = ({
  isOpen,
  onClose,
  onInsertFormula
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "All Formulas" },
    { id: "algebra", label: "Algebra & Sequences" },
    { id: "calculus", label: "Calculus" },
    { id: "trig", label: "Trigonometry" },
    { id: "geometry", label: "Geometry" },
    { id: "finance", label: "Financial Maths" },
    { id: "stats", label: "Statistics" }
  ];

  const filteredFormulas = CAPS_FORMULA_DATABASE.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latex.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyLatex = (item: FormulaItem) => {
    navigator.clipboard.writeText(item.latex);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity animate-fadeIn">
      <div className="w-full max-w-lg h-full bg-white dark:bg-navy-950 shadow-2xl border-l border-navy-200 dark:border-navy-800 flex flex-col text-left">
        {/* DRAWER HEADER */}
        <div className="p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-gold-500 to-amber-600 text-navy-950 rounded-xl font-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-display tracking-wide uppercase">
                  Formula Quick-Reference
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  KaTeX CAPS / IEB
                </span>
              </div>
              <p className="text-[11px] text-navy-300 font-mono mt-0.5">
                Search & copy high-school math formulas directly into your AI prompt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH BAR & CATEGORY PILLS */}
        <div className="p-4 bg-navy-50/70 dark:bg-navy-900/60 border-b border-navy-150 dark:border-navy-800 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formula name, keyword or LaTeX code (e.g., 'sine rule', 'S_n', 'P(1+i)')..."
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-navy-400 hover:text-navy-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-royal-600 text-white shadow-xs"
                    : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FORMULA LIST BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {filteredFormulas.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-navy-50/50 dark:bg-navy-900/30 rounded-2xl border border-dashed border-navy-200 dark:border-navy-800">
              <BookOpen className="w-8 h-8 text-navy-400 mx-auto opacity-50" />
              <p className="text-xs font-bold text-navy-700 dark:text-navy-300">
                No formulas matched "{searchQuery}"
              </p>
              <p className="text-[11px] text-navy-500">
                Try searching for broader terms like "quadratic", "sine", "derivative" or clear your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-3 py-1.5 bg-royal-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredFormulas.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-800 hover:border-gold-500 transition-all shadow-xs space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-navy-950 dark:text-white font-display">
                          {item.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                          {item.paper}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-royal-600 dark:text-gold-400 font-bold block mt-0.5">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Copy LaTeX Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyLatex(item)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                          isCopied
                            ? "bg-emerald-500 text-navy-950 border-emerald-400 font-black"
                            : "bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 border-navy-200 dark:border-navy-700 hover:bg-navy-100"
                        }`}
                        title="Copy LaTeX formula string to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy LaTeX</span>
                          </>
                        )}
                      </button>

                      {/* Insert into Prompt Button */}
                      {onInsertFormula && (
                        <button
                          type="button"
                          onClick={() => {
                            onInsertFormula(item.latex);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-xs"
                          title="Insert formula directly into question box"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Insert</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* KATEX RENDERED FORMULA DISPLAY BOX */}
                  <div className="p-3 bg-navy-950 text-white rounded-xl border border-navy-800 text-center overflow-x-auto my-2">
                    <LatexRenderer text={`$$ ${item.latex} $$`} />
                  </div>

                  {/* DESCRIPTION & LATEX RAW CODE */}
                  <div className="flex items-center justify-between text-[11px] text-navy-500 dark:text-navy-400 pt-1 border-t border-navy-100 dark:border-navy-850">
                    <p className="line-clamp-1 flex-1 pr-2">{item.description}</p>
                    <code className="text-[10px] font-mono text-amber-500 dark:text-gold-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                      {item.latex}
                    </code>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER HELPER */}
        <div className="p-3 bg-navy-50 dark:bg-navy-900 border-t border-navy-150 dark:border-navy-800 text-center text-[10px] text-navy-500 dark:text-navy-400 font-mono">
          💡 Click <span className="font-bold text-amber-600 dark:text-gold-400">Insert</span> to paste formula code into the Ask Tutor box or <span className="font-bold text-amber-600 dark:text-gold-400">Copy LaTeX</span> for custom rendering.
        </div>
      </div>
    </div>
  );
};
