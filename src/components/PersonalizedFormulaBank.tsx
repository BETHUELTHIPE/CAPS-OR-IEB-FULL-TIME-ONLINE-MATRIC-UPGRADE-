import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookMarked, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  X, 
  Sigma, 
  HelpCircle, 
  Tag, 
  FileText, 
  Calculator, 
  Info, 
  Share2, 
  Trash2, 
  Zap, 
  Code2, 
  GraduationCap, 
  BrainCircuit, 
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  Star,
  WifiOff,
  Database,
  CheckCircle2
} from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";
import { Profile } from "../types";
import { cacheFormulasOffline, useOfflineStatus } from "../lib/serviceWorkerRegistration";

export interface FormulaItem {
  id: string;
  name: string;
  topic: "Algebra" | "Calculus" | "Trigonometry" | "Financial Maths" | "Analytical Geometry" | "Sequences & Series";
  paper: "Paper 1" | "Paper 2" | "Both";
  formula: string; // Plain text / readable fallback
  latex: string; // LaTeX formatted string
  variables: { symbol: string; description: string }[];
  whenToUse: string;
  isCustom?: boolean;
  notes?: string;
  difficultyRating?: "High" | "Medium" | "Essential";
  tags?: string[]; // Sub-topics & micro-concept tags
}

const DEFAULT_FORMULAS: FormulaItem[] = [
  {
    id: "f-quad",
    name: "Quadratic Formula",
    topic: "Algebra",
    paper: "Paper 1",
    formula: "x = [-b ± √(b² - 4ac)] / 2a",
    latex: "$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
    variables: [
      { symbol: "a, b, c", description: "Coefficients of quadratic equation ax² + bx + c = 0" },
      { symbol: "x", description: "Roots / x-intercepts of the parabola" }
    ],
    whenToUse: "Used to solve quadratic equations that cannot be factored easily or to find x-intercepts of parabolas.",
    difficultyRating: "Essential",
    tags: ["Algebra", "Quadratics", "Roots", "Paper 1"]
  },
  {
    id: "f-disc",
    name: "Discriminant (Nature of Roots)",
    topic: "Algebra",
    paper: "Paper 1",
    formula: "Δ = b² - 4ac",
    latex: "$$\\Delta = b^2 - 4ac$$",
    variables: [
      { symbol: "Δ > 0", description: "Real, unequal roots (two distinct x-intercepts)" },
      { symbol: "Δ = 0", description: "Real, equal roots (turning point touches x-axis)" },
      { symbol: "Δ < 0", description: "Non-real / imaginary roots (no x-intercepts)" },
      { symbol: "Δ = perfect square", description: "Rational roots" }
    ],
    whenToUse: "Determine the nature of roots without solving the equation, or finding k for equal/real roots.",
    difficultyRating: "High",
    tags: ["Algebra", "Discriminant", "Nature of Roots", "Paper 1"]
  },
  {
    id: "f-calc-first-princ",
    name: "Derivative from First Principles",
    topic: "Calculus",
    paper: "Paper 1",
    formula: "f'(x) = lim(h→0) [f(x + h) - f(x)] / h",
    latex: "$$f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$",
    variables: [
      { symbol: "f'(x)", description: "Gradient function / instantaneous rate of change" },
      { symbol: "h", description: "Infinitesimal distance between two points on curve" }
    ],
    whenToUse: "Mandatory 5-6 mark question in CAPS Paper 1 when asked to find the derivative 'from first principles'.",
    difficultyRating: "High",
    tags: ["Calculus", "First Principles", "Limits", "Derivatives", "Paper 1"]
  },
  {
    id: "f-calc-tangent",
    name: "Equation of Tangent Line",
    topic: "Calculus",
    paper: "Paper 1",
    formula: "y - y₁ = m(x - x₁) where m = f'(x₁)",
    latex: "$$y - y_1 = m(x - x_1) \\quad \\text{where } m = f'(x_1)$$",
    variables: [
      { symbol: "m", description: "Gradient of tangent obtained by substituting x₁ into f'(x)" },
      { symbol: "(x₁, y₁)", description: "Point of contact on the curve f(x)" }
    ],
    whenToUse: "Calculating straight line equations tangent to cubic or quadratic functions at a specific x-value.",
    difficultyRating: "Medium",
    tags: ["Calculus", "Tangents", "Gradients", "Derivatives", "Paper 1"]
  },
  {
    id: "f-trig-comp-sin",
    name: "Sine Compound Angle Identity",
    topic: "Trigonometry",
    paper: "Paper 2",
    formula: "sin(α ± β) = sin(α)cos(β) ± cos(α)sin(β)",
    latex: "$$\\sin(\\alpha \\pm \\beta) = \\sin(\\alpha)\\cos(\\beta) \\pm \\cos(\\alpha)\\sin(\\beta)$$",
    variables: [
      { symbol: "α, β", description: "Angles measured in degrees or radians" }
    ],
    whenToUse: "Simplifying non-special angles like sin(75°) = sin(45° + 30°) or proving trigonometric identities.",
    difficultyRating: "High",
    tags: ["Trigonometry", "Compound Angles", "Identities", "Paper 2"]
  },
  {
    id: "f-trig-dbl-cos",
    name: "Cosine Double Angle Identity",
    topic: "Trigonometry",
    paper: "Paper 2",
    formula: "cos(2θ) = cos²(θ) - sin²(θ) = 2cos²(θ) - 1 = 1 - 2sin²(θ)",
    latex: "$$\\cos(2\\theta) = \\cos^2(\\theta) - \\sin^2(\\theta) = 2\\cos^2(\\theta) - 1 = 1 - 2\\sin^2(\\theta)$$",
    variables: [
      { symbol: "θ", description: "Single angle parameter" }
    ],
    whenToUse: "Essential for solving trig equations and proving 3D or 2D trigonometry general solutions.",
    difficultyRating: "High",
    tags: ["Trigonometry", "Double Angles", "Identities", "Paper 2"]
  },
  {
    id: "f-trig-cosine-rule",
    name: "Cosine Rule (Non-Right Triangle)",
    topic: "Trigonometry",
    paper: "Paper 2",
    formula: "a² = b² + c² - 2bc · cos(A)",
    latex: "$$a^2 = b^2 + c^2 - 2bc \\cos(A)$$",
    variables: [
      { symbol: "a, b, c", description: "Sides opposite angles A, B, C respectively" },
      { symbol: "A", description: "Included angle between sides b and c" }
    ],
    whenToUse: "Finding third side when given 2 sides and included angle (SAS) or finding angle given 3 sides (SSS).",
    difficultyRating: "Medium",
    tags: ["Trigonometry", "Cosine Rule", "Non-Right Triangles", "Paper 2"]
  },
  {
    id: "f-fin-pv",
    name: "Present Value Annuity (Loans & Mortgages)",
    topic: "Financial Maths",
    paper: "Paper 1",
    formula: "P = x · [1 - (1 + i)⁻ⁿ] / i",
    latex: "$$P = \\frac{x \\left[ 1 - (1 + i)^{-n} \\right]}{i}$$",
    variables: [
      { symbol: "P", description: "Present loan amount borrowed today" },
      { symbol: "x", description: "Monthly repayment installment" },
      { symbol: "i", description: "Interest rate per compounding period (r / 12)" },
      { symbol: "n", description: "Total number of monthly payments" }
    ],
    whenToUse: "Calculating home loan repayments, car financing, or maximum affordable loan amounts.",
    difficultyRating: "High",
    tags: ["Financial Maths", "Annuities", "Loans", "Present Value", "Paper 1"]
  },
  {
    id: "f-fin-fv",
    name: "Future Value Annuity (Sinking Fund / Savings)",
    topic: "Financial Maths",
    paper: "Paper 1",
    formula: "F = x · [(1 + i)ⁿ - 1] / i",
    latex: "$$F = \\frac{x \\left[ (1 + i)^n - 1 \\right]}{i}$$",
    variables: [
      { symbol: "F", description: "Accumulated total payout at end of investment" },
      { symbol: "x", description: "Regular monthly contribution" },
      { symbol: "n", description: "Number of monthly payments made" }
    ],
    whenToUse: "Planning sinking funds to replace equipment, retirement savings, or recurring investments.",
    difficultyRating: "Medium",
    tags: ["Financial Maths", "Annuities", "Sinking Fund", "Future Value", "Paper 1"]
  },
  {
    id: "f-geo-inclination",
    name: "Angle of Inclination",
    topic: "Analytical Geometry",
    paper: "Paper 2",
    formula: "tan(θ) = m (where 0° ≤ θ < 180°)",
    latex: "$$\\tan(\\theta) = m \\quad (0^\\circ \\le \\theta < 180^\\circ)$$",
    variables: [
      { symbol: "θ", description: "Angle line makes with positive x-axis (counter-clockwise)" },
      { symbol: "m", description: "Gradient of the straight line" }
    ],
    whenToUse: "If m > 0, θ is acute. If m < 0, θ = 180° - reference angle (obtuse inclination).",
    difficultyRating: "High",
    tags: ["Analytical Geometry", "Inclination", "Gradients", "Paper 2"]
  },
  {
    id: "f-seq-sum-infinity",
    name: "Sum to Infinity (Convergent Geometric)",
    topic: "Sequences & Series",
    paper: "Paper 1",
    formula: "S_∞ = a / (1 - r)  [where -1 < r < 1]",
    latex: "$$S_\\infty = \\frac{a}{1 - r} \\quad \\text{for } |r| < 1$$",
    variables: [
      { symbol: "a", description: "First term of geometric sequence" },
      { symbol: "r", description: "Common ratio (must be strictly between -1 and 1 for convergence)" }
    ],
    whenToUse: "Finding maximum bound of infinite geometric series, recurring decimals, or bouncing ball problems.",
    difficultyRating: "Medium",
    tags: ["Sequences & Series", "Geometric", "Convergence", "Paper 1"]
  }
];

export interface PersonalizedFormulaBankProps {
  user?: Profile | null;
}

export const PersonalizedFormulaBank: React.FC<PersonalizedFormulaBankProps> = ({ user }) => {
  const [formulas, setFormulas] = useState<FormulaItem[]>([]);
  const [difficultIds, setDifficultIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"difficult_only" | "all_syllabus">("difficult_only");
  const [useLatex, setUseLatex] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>(null);
  
  // Tag Management System State
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<"ANY" | "ALL">("ANY");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [formulaCustomTagMap, setFormulaCustomTagMap] = useState<Record<string, string[]>>({});
  const [showTagManagerModal, setShowTagManagerModal] = useState<boolean>(false);
  const [editingFormulaForTags, setEditingFormulaForTags] = useState<FormulaItem | null>(null);
  const [newTagNameInput, setNewTagNameInput] = useState<string>("");
  const [customTagsInput, setCustomTagsInput] = useState<string>("");

  // Offline & Service Worker Caching state
  const isOffline = useOfflineStatus();
  const [isCachedOffline, setIsCachedOffline] = useState<boolean>(false);

  // New Custom Formula Form state
  const [customName, setCustomName] = useState("");
  const [customTopic, setCustomTopic] = useState<FormulaItem["topic"]>("Algebra");
  const [customPaper, setCustomPaper] = useState<FormulaItem["paper"]>("Paper 1");
  const [customFormulaText, setCustomFormulaText] = useState("");
  const [customLatex, setCustomLatex] = useState("");
  const [customWhenToUse, setCustomWhenToUse] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // Load from localStorage & sync to ServiceWorker Workbox Cache
  useEffect(() => {
    try {
      // Saved difficult list
      const savedDifficult = localStorage.getItem("amh_difficult_formula_ids");
      if (savedDifficult) {
        setDifficultIds(JSON.parse(savedDifficult));
      } else {
        // Default difficult set
        const defaultDifficult = ["f-calc-first-princ", "f-trig-comp-sin", "f-fin-pv", "f-geo-inclination"];
        setDifficultIds(defaultDifficult);
        localStorage.setItem("amh_difficult_formula_ids", JSON.stringify(defaultDifficult));
      }

      // Custom formulas
      const savedCustom = localStorage.getItem("amh_custom_formulas");
      let customList: FormulaItem[] = [];
      if (savedCustom) {
        customList = JSON.parse(savedCustom);
      }

      const allList = [...DEFAULT_FORMULAS, ...customList];
      setFormulas(allList);

      // Custom Tag Mappings & Custom Tags
      const savedCustomTags = localStorage.getItem("amh_custom_formula_tags");
      if (savedCustomTags) {
        setCustomTags(JSON.parse(savedCustomTags));
      }
      const savedTagMap = localStorage.getItem("amh_formula_custom_tag_map");
      if (savedTagMap) {
        setFormulaCustomTagMap(JSON.parse(savedTagMap));
      }

      // Store in Workbox Service Worker Cache
      cacheFormulasOffline(allList).then(ok => setIsCachedOffline(ok));
    } catch (e) {
      console.error(e);
      setFormulas(DEFAULT_FORMULAS);
    }
  }, []);

  // Sync to SW Cache whenever formulas list updates
  useEffect(() => {
    if (formulas.length > 0) {
      cacheFormulasOffline(formulas).then(ok => setIsCachedOffline(ok));
    }
  }, [formulas]);

  // Helper: Get effective tags for a formula
  const getEffectiveFormulaTags = (formula: FormulaItem): string[] => {
    const customAssigned = formulaCustomTagMap[formula.id];
    if (customAssigned && customAssigned.length > 0) {
      return customAssigned;
    }
    if (formula.tags && formula.tags.length > 0) {
      return formula.tags;
    }
    return [formula.topic, formula.paper];
  };

  // Compute all available unique tags
  const allAvailableTags = React.useMemo(() => {
    const set = new Set<string>();
    // High-level sub-topic tags
    ["Calculus", "Trigonometry", "Algebra", "Financial Maths", "Analytical Geometry", "Sequences & Series", "Quadratics", "First Principles", "Compound Angles", "Double Angles", "Annuities", "Inclination", "Derivatives", "Identities", "Paper 1", "Paper 2"].forEach(t => set.add(t));
    
    formulas.forEach(f => {
      getEffectiveFormulaTags(f).forEach(t => set.add(t));
    });
    customTags.forEach(t => set.add(t));
    return Array.from(set);
  }, [formulas, formulaCustomTagMap, customTags]);

  // Get formula count for a tag
  const getTagCount = (tag: string): number => {
    return formulas.filter(f => {
      const isDifficult = difficultIds.includes(f.id);
      if (viewMode === "difficult_only" && !isDifficult) return false;
      return getEffectiveFormulaTags(f).includes(tag);
    }).length;
  };

  // Toggle tag selection for filtering
  const toggleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear all selected tag filters
  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Assign or unassign a tag to a specific formula
  const toggleFormulaTagAssignment = (formulaId: string, tag: string) => {
    const currentFormula = formulas.find(f => f.id === formulaId);
    if (!currentFormula) return;
    const currentTags = getEffectiveFormulaTags(currentFormula);
    let updatedTags: string[];

    if (currentTags.includes(tag)) {
      updatedTags = currentTags.filter(t => t !== tag);
    } else {
      updatedTags = [...currentTags, tag];
    }

    const updatedMap = {
      ...formulaCustomTagMap,
      [formulaId]: updatedTags
    };

    setFormulaCustomTagMap(updatedMap);
    localStorage.setItem("amh_formula_custom_tag_map", JSON.stringify(updatedMap));

    if (editingFormulaForTags && editingFormulaForTags.id === formulaId) {
      setEditingFormulaForTags({
        ...editingFormulaForTags,
        tags: updatedTags
      });
    }
  };

  // Add new global tag
  const handleAddNewGlobalTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTagNameInput.trim().replace(/^#/, "");
    if (!cleanTag) return;

    if (!customTags.includes(cleanTag) && !allAvailableTags.includes(cleanTag)) {
      const updatedCustom = [...customTags, cleanTag];
      setCustomTags(updatedCustom);
      localStorage.setItem("amh_custom_formula_tags", JSON.stringify(updatedCustom));
    }

    setNewTagNameInput("");
  };

  // Delete a custom tag
  const handleDeleteCustomTag = (tagToDelete: string) => {
    const updatedCustom = customTags.filter(t => t !== tagToDelete);
    setCustomTags(updatedCustom);
    localStorage.setItem("amh_custom_formula_tags", JSON.stringify(updatedCustom));
    setSelectedTags(selectedTags.filter(t => t !== tagToDelete));
  };

  // Toggle difficult mark
  const toggleDifficult = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (difficultIds.includes(id)) {
      updated = difficultIds.filter(item => item !== id);
    } else {
      updated = [...difficultIds, id];
    }
    setDifficultIds(updated);
    localStorage.setItem("amh_difficult_formula_ids", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  // Add custom formula
  const handleCreateCustomFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customFormulaText) return;

    const initialTags = customTagsInput
      ? customTagsInput.split(",").map(t => t.trim().replace(/^#/, "")).filter(Boolean)
      : [customTopic, customPaper];

    const newFormula: FormulaItem = {
      id: `custom-f-${Date.now()}`,
      name: customName,
      topic: customTopic,
      paper: customPaper,
      formula: customFormulaText,
      latex: customLatex ? `$$${customLatex}$$` : `$$${customFormulaText}$$`,
      variables: [{ symbol: "Notes", description: customNotes || "Custom student formula" }],
      whenToUse: customWhenToUse || "Custom student formula added for study review.",
      isCustom: true,
      notes: customNotes,
      difficultyRating: "High",
      tags: initialTags
    };

    const updatedFormulas = [...formulas, newFormula];
    setFormulas(updatedFormulas);

    // Save custom list
    const customOnly = updatedFormulas.filter(f => f.isCustom);
    localStorage.setItem("amh_custom_formulas", JSON.stringify(customOnly));

    // Automatically mark new custom formula as difficult
    const updatedDifficult = [...difficultIds, newFormula.id];
    setDifficultIds(updatedDifficult);
    localStorage.setItem("amh_difficult_formula_ids", JSON.stringify(updatedDifficult));

    // Reset form
    setCustomName("");
    setCustomFormulaText("");
    setCustomLatex("");
    setCustomWhenToUse("");
    setCustomNotes("");
    setCustomTagsInput("");
    setShowAddModal(false);
  };

  // Delete custom formula
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFormulas = formulas.filter(f => f.id !== id);
    setFormulas(updatedFormulas);

    const customOnly = updatedFormulas.filter(f => f.isCustom);
    localStorage.setItem("amh_custom_formulas", JSON.stringify(customOnly));

    const updatedDifficult = difficultIds.filter(item => item !== id);
    setDifficultIds(updatedDifficult);
    localStorage.setItem("amh_difficult_formula_ids", JSON.stringify(updatedDifficult));
  };

  // Filter formulas
  const displayedFormulas = formulas.filter(f => {
    const isDifficult = difficultIds.includes(f.id);
    if (viewMode === "difficult_only" && !isDifficult) return false;

    if (selectedTopic !== "All Topics" && f.topic !== selectedTopic) return false;

    const formulaTags = getEffectiveFormulaTags(f);

    // Tag filtering
    if (selectedTags.length > 0) {
      if (tagFilterMode === "ALL") {
        const matchesAll = selectedTags.every(t => formulaTags.includes(t));
        if (!matchesAll) return false;
      } else {
        const matchesAny = selectedTags.some(t => formulaTags.includes(t));
        if (!matchesAny) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches = 
        f.name.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.whenToUse.toLowerCase().includes(q) ||
        formulaTags.some(t => t.toLowerCase().includes(q));
      if (!matches) return false;
    }

    return true;
  });

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl text-navy-900 dark:text-white relative overflow-hidden space-y-6">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-royal-500/5 dark:bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-150 dark:border-navy-800 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-navy-900 text-gold-400 font-black shadow-lg shrink-0 border border-royal-500/30">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> High-Yield CAPS & IEB Formulas
              </span>
              <span className="text-[11px] font-mono text-navy-500 dark:text-navy-400 font-bold flex items-center gap-1.5">
                • {difficultIds.length} Saved
                {isOffline ? (
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-amber-500" /> Offline Mode (Workbox Cached)
                  </span>
                ) : isCachedOffline ? (
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1" title="Workbox Service Worker cached all formulas for offline access">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Workbox Offline Ready
                  </span>
                ) : null}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight mt-0.5">
              Personalized Difficult Formula Bank
            </h2>
          </div>
        </div>

        {/* LATEX TOGGLE & ADD FORMULA BUTTON */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* LaTeX Renderer Toggle */}
          <button
            onClick={() => setUseLatex(!useLatex)}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              useLatex
                ? "bg-royal-50 dark:bg-royal-950/80 border-royal-400 text-royal-700 dark:text-gold-400"
                : "bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300"
            }`}
            title="Toggle math equations between LaTeX formatted view and standard plain text"
          >
            <Code2 className="w-4 h-4 text-royal-600 dark:text-gold-400" />
            <span>LaTeX Math Render: </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${useLatex ? "bg-amber-400 text-navy-950" : "bg-navy-300 dark:bg-navy-700 text-navy-800 dark:text-navy-200"}`}>
              {useLatex ? "ON (KaTeX)" : "OFF (Plain)"}
            </span>
          </button>

          {/* Add Custom Formula Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-royal-600 to-navy-900 hover:from-royal-700 hover:to-navy-950 text-white font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md border border-royal-500/30"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Custom Formula</span>
          </button>
        </div>
      </div>

      {/* FILTER & MODE CONTROL BAR */}
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* VIEW MODE TABS */}
          <div className="bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1.5 rounded-2xl flex items-center gap-1 text-xs font-mono font-bold w-fit">
            <button
              onClick={() => setViewMode("difficult_only")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === "difficult_only"
                  ? "bg-amber-500 text-navy-950 font-black shadow-md"
                  : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>My Difficult Formulas ({difficultIds.length})</span>
            </button>

            <button
              onClick={() => setViewMode("all_syllabus")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === "all_syllabus"
                  ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black shadow-md"
                  : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              <Sigma className="w-4 h-4" />
              <span>All CAPS / IEB Syllabus ({formulas.length})</span>
            </button>
          </div>

          {/* SEARCH BAR & TOPIC DROPDOWN & MANAGE TAGS BUTTON */}
          <div className="flex items-center gap-3 flex-1 max-w-xl flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formula, tag, variable..."
                className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl pl-10 pr-4 py-2 text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:border-royal-500 dark:focus:border-gold-400"
              />
            </div>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-xs font-mono font-bold text-navy-700 dark:text-navy-200 focus:outline-none focus:border-royal-500 dark:focus:border-gold-400 cursor-pointer shrink-0"
            >
              <option value="All Topics">All Topics</option>
              <option value="Algebra">Algebra</option>
              <option value="Calculus">Calculus</option>
              <option value="Trigonometry">Trigonometry</option>
              <option value="Financial Maths">Financial Maths</option>
              <option value="Analytical Geometry">Analytical Geometry</option>
              <option value="Sequences & Series">Sequences & Series</option>
            </select>

            {/* Manage Tags Modal Button */}
            <button
              onClick={() => setShowTagManagerModal(true)}
              className="px-3.5 py-2 rounded-xl bg-royal-500/10 dark:bg-royal-500/20 text-royal-700 dark:text-gold-400 border border-royal-400/30 text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5 hover:bg-royal-500/20 shrink-0"
              title="Open Tag Management System"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Manage Tags</span>
            </button>
          </div>
        </div>

        {/* SUB-TOPICS & TAG MANAGEMENT FILTER BAR */}
        <div className="p-3.5 rounded-2xl bg-navy-50/80 dark:bg-navy-950/80 border border-navy-200 dark:border-navy-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <span className="font-bold font-mono text-navy-800 dark:text-navy-200">
                Sub-Topic & Concept Tag Filters:
              </span>
              {selectedTags.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400 text-navy-950">
                  {selectedTags.length} Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Match Mode Toggle */}
              {selectedTags.length > 1 && (
                <button
                  onClick={() => setTagFilterMode(tagFilterMode === "ANY" ? "ALL" : "ANY")}
                  className="px-2.5 py-1 rounded-lg bg-navy-200 dark:bg-navy-800 text-[10px] font-mono font-bold text-navy-700 dark:text-navy-300 border border-navy-300 dark:border-navy-700 cursor-pointer"
                  title="Toggle between matching ANY selected tag or ALL selected tags simultaneously"
                >
                  Mode: <span className="font-black text-royal-600 dark:text-gold-400">{tagFilterMode === "ANY" ? "MATCH ANY" : "MATCH ALL"}</span>
                </button>
              )}

              {selectedTags.length > 0 && (
                <button
                  onClick={clearTagFilters}
                  className="text-[11px] font-mono font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear Tag Filters
                </button>
              )}
            </div>
          </div>

          {/* TAG CHIPS WRAPPER */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            {allAvailableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const count = getTagCount(tag);

              return (
                <button
                  key={tag}
                  onClick={() => toggleSelectTag(tag)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-royal-600 to-navy-900 text-gold-300 border-gold-400 shadow-sm"
                      : "bg-white dark:bg-navy-900 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-750 hover:border-royal-400 hover:text-royal-600 dark:hover:text-gold-300"
                  }`}
                >
                  <span>#{tag}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                      isSelected ? "bg-gold-400 text-navy-950 font-black" : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FORMULA CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {displayedFormulas.length === 0 ? (
          <div className="col-span-full py-12 px-6 text-center bg-navy-50 dark:bg-navy-950 border border-dashed border-navy-200 dark:border-navy-800 rounded-3xl space-y-3">
            <BookMarked className="w-10 h-10 text-navy-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">
                {viewMode === "difficult_only" ? "No difficult formulas saved yet" : "No formulas found matching filter"}
              </h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 max-w-md mx-auto">
                {viewMode === "difficult_only" 
                  ? "Switch to 'All CAPS / IEB Syllabus' view and click the star icon on any formula to mark it as difficult for quick exam revision."
                  : "Try clearing your tag filters, search query, or topic dropdown."}
              </p>
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={clearTagFilters}
                className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reset Tag Filters ({selectedTags.length})
              </button>
            )}
            {viewMode === "difficult_only" && (
              <button
                onClick={() => setViewMode("all_syllabus")}
                className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer ml-2"
              >
                Browse All Syllabus Formulas
              </button>
            )}
          </div>
        ) : (
          displayedFormulas.map((f) => {
            const isSaved = difficultIds.includes(f.id);
            const isExpanded = expandedFormulaId === f.id;
            const formulaTags = getEffectiveFormulaTags(f);

            return (
              <div
                key={f.id}
                className={`p-5 rounded-2xl border transition-all relative group flex flex-col justify-between space-y-4 ${
                  isSaved
                    ? "bg-gradient-to-br from-amber-500/5 via-white to-royal-50/20 dark:from-amber-500/10 dark:via-navy-900 dark:to-royal-950/40 border-amber-400/60 dark:border-amber-500/40 shadow-md"
                    : "bg-white dark:bg-navy-950 border-navy-200 dark:border-navy-800 hover:border-navy-300 dark:hover:border-navy-700"
                }`}
              >
                {/* TOP HEADER OF CARD */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-gold-400 border border-royal-200 dark:border-royal-800">
                        {f.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
                        {f.paper}
                      </span>
                      {f.isCustom && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                          Custom
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black font-display text-navy-900 dark:text-white leading-tight">
                      {f.name}
                    </h3>

                    {/* FORMULA SUB-TOPIC TAG PILLS ON CARD */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {formulaTags.map(tag => {
                        const isTagSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleSelectTag(tag)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                              isTagSelected
                                ? "bg-amber-400 text-navy-950 font-black shadow-xs"
                                : "bg-navy-100 dark:bg-navy-900 text-navy-600 dark:text-navy-400 hover:bg-royal-500/20 hover:text-royal-600 dark:hover:text-gold-400 border border-navy-200/60 dark:border-navy-800"
                            }`}
                            title={`Filter formulas by tag #${tag}`}
                          >
                            #{tag}
                          </button>
                        );
                      })}

                      {/* Edit Tags Button for this Card */}
                      <button
                        onClick={() => setEditingFormulaForTags(f)}
                        className="px-1.5 py-0.5 rounded-lg text-[10px] font-mono text-navy-400 hover:text-royal-600 dark:hover:text-gold-400 hover:bg-navy-100 dark:hover:bg-navy-800 flex items-center gap-0.5 cursor-pointer"
                        title="Add/Edit tags for this formula"
                      >
                        <Tag className="w-3 h-3" />
                        <span>+ Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* Bookmark / Star Toggle Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {f.isCustom && (
                      <button
                        onClick={(e) => handleDeleteCustom(f.id, e)}
                        className="p-1.5 rounded-lg text-navy-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete custom formula"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => toggleDifficult(f.id, e)}
                      className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-bold ${
                        isSaved
                          ? "bg-amber-400 text-navy-950 shadow-md ring-2 ring-amber-300 dark:ring-amber-500/50"
                          : "bg-navy-100 dark:bg-navy-800 text-navy-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-navy-750"
                      }`}
                      title={isSaved ? "Saved as Difficult (Click to unmark)" : "Mark as Difficult Formula"}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? "fill-navy-950" : ""}`} />
                      <span className="hidden sm:inline">{isSaved ? "Saved" : "Mark Difficult"}</span>
                    </button>
                  </div>
                </div>

                {/* FORMULA DISPLAY BOX */}
                <div className="p-4 rounded-xl bg-navy-900 dark:bg-navy-950 border border-navy-800 text-white font-mono text-center shadow-inner relative overflow-x-auto min-h-[70px] flex items-center justify-center">
                  {useLatex ? (
                    <div className="text-gold-300 font-sans w-full">
                      <LatexRenderer text={f.latex || f.formula} block />
                    </div>
                  ) : (
                    <span className="text-sm md:text-base font-bold text-amber-300 tracking-wide">
                      {f.formula}
                    </span>
                  )}
                </div>

                {/* EXAM APPLICATION TIP */}
                <div className="text-xs text-navy-600 dark:text-navy-300 font-sans space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-royal-600 dark:text-gold-400 text-[11px]">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>CAPS Exam Application Tip:</span>
                  </div>
                  <p className="pl-5 text-[11px] leading-relaxed italic text-navy-600 dark:text-navy-400">
                    "{f.whenToUse}"
                  </p>
                </div>

                {/* EXPANDABLE VARIABLE BREAKDOWN */}
                <div>
                  <button
                    onClick={() => setExpandedFormulaId(isExpanded ? null : f.id)}
                    className="w-full py-1.5 text-[11px] font-mono font-bold text-navy-500 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white flex items-center justify-between border-t border-navy-100 dark:border-navy-800/80 cursor-pointer pt-2"
                  >
                    <span>{isExpanded ? "Hide Variable Breakdown" : "View Variable Definitions"}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 space-y-1.5 overflow-hidden"
                      >
                        {f.variables.map((v, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-navy-50 dark:bg-navy-900 border border-navy-150 dark:border-navy-800 text-[11px] flex items-start gap-2">
                            <span className="font-mono font-black text-royal-600 dark:text-gold-400 shrink-0 bg-white dark:bg-navy-800 px-1.5 py-0.5 rounded border border-navy-200 dark:border-navy-700">
                              {v.symbol}
                            </span>
                            <span className="text-navy-600 dark:text-navy-300 font-sans">
                              {v.description}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD CUSTOM FORMULA MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 w-full max-w-lg rounded-3xl p-6 shadow-2xl text-navy-900 dark:text-white space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy-150 dark:border-navy-800">
                <h3 className="text-lg font-black font-display flex items-center gap-2">
                  <Plus className="w-5 h-5 text-gold-400" /> Save Custom Difficult Formula
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-xl bg-navy-100 dark:bg-navy-800 text-navy-500 hover:text-navy-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomFormula} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-bold text-navy-700 dark:text-navy-300">
                    Formula Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Derivative Limit or Hyperbola Asymptote"
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-navy-700 dark:text-navy-300">
                      Topic Category
                    </label>
                    <select
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value as any)}
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 cursor-pointer"
                    >
                      <option value="Algebra">Algebra</option>
                      <option value="Calculus">Calculus</option>
                      <option value="Trigonometry">Trigonometry</option>
                      <option value="Financial Maths">Financial Maths</option>
                      <option value="Analytical Geometry">Analytical Geometry</option>
                      <option value="Sequences & Series">Sequences & Series</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-navy-700 dark:text-navy-300">
                      Exam Paper
                    </label>
                    <select
                      value={customPaper}
                      onChange={(e) => setCustomPaper(e.target.value as any)}
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 cursor-pointer"
                    >
                      <option value="Paper 1">Paper 1</option>
                      <option value="Paper 2">Paper 2</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-navy-700 dark:text-navy-300">
                    Formula Expression (Plain Text) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customFormulaText}
                    onChange={(e) => setCustomFormulaText(e.target.value)}
                    placeholder="e.g. y = a(x - p)² + q"
                    className="w-full font-mono bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-navy-700 dark:text-navy-300 flex items-center justify-between">
                    <span>LaTeX Expression (Optional)</span>
                    <span className="text-[10px] text-navy-400 font-mono">e.g. y = a(x - p)^2 + q</span>
                  </label>
                  <input
                    type="text"
                    value={customLatex}
                    onChange={(e) => setCustomLatex(e.target.value)}
                    placeholder="e.g. y = a(x - p)^2 + q"
                    className="w-full font-mono bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-navy-700 dark:text-navy-300">
                    When to use this formula in exams / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={customWhenToUse}
                    onChange={(e) => setCustomWhenToUse(e.target.value)}
                    placeholder="e.g. Remember to switch signs for horizontal shift 'p' when sketching hyperbola."
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-navy-700 dark:text-navy-300 flex items-center justify-between">
                    <span>Sub-Topic Tags (Comma-separated)</span>
                    <span className="text-[10px] text-navy-400 font-mono">e.g. Calculus, Limits, IEB</span>
                  </label>
                  <input
                    type="text"
                    value={customTagsInput}
                    onChange={(e) => setCustomTagsInput(e.target.value)}
                    placeholder="e.g. Calculus, First Principles, IEB"
                    className="w-full font-mono bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="pt-3 border-t border-navy-150 dark:border-navy-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 text-xs font-mono font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-royal-600 to-navy-900 hover:from-royal-700 hover:to-navy-950 text-white font-black text-xs cursor-pointer shadow-lg"
                  >
                    Save to Bank
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL TAG MANAGER MODAL */}
      <AnimatePresence>
        {showTagManagerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 w-full max-w-xl rounded-3xl p-6 shadow-2xl text-navy-900 dark:text-white space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy-150 dark:border-navy-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-gold-400 border border-royal-200 dark:border-royal-800">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-display leading-tight">
                      Sub-Topic Tag Management System
                    </h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400">
                      Organize, filter, and create custom concept tags across formulas.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowTagManagerModal(false)}
                  className="p-1.5 rounded-xl bg-navy-100 dark:bg-navy-800 text-navy-500 hover:text-navy-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* CREATE NEW CUSTOM TAG FORM */}
              <form onSubmit={handleAddNewGlobalTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTagNameInput}
                  onChange={(e) => setNewTagNameInput(e.target.value)}
                  placeholder="Create new custom tag (e.g. Integration, IEB, Matrix)..."
                  className="flex-1 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4 text-gold-400" />
                  <span>Add Tag</span>
                </button>
              </form>

              {/* ALL AVAILABLE TAGS LIST */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-navy-600 dark:text-navy-400 flex items-center justify-between">
                  <span>Available Formula Sub-Topics & Custom Tags ({allAvailableTags.length}):</span>
                  <span>Click tag to filter</span>
                </div>

                <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5">
                  {allAvailableTags.map((tag) => {
                    const count = getTagCount(tag);
                    const isCustom = customTags.includes(tag);
                    const isSelected = selectedTags.includes(tag);

                    return (
                      <div
                        key={tag}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? "bg-royal-50 dark:bg-royal-950/80 border-royal-400 text-royal-900 dark:text-gold-300"
                            : "bg-navy-50 dark:bg-navy-950 border-navy-200 dark:border-navy-800 text-navy-800 dark:text-navy-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              toggleSelectTag(tag);
                              setShowTagManagerModal(false);
                            }}
                            className="font-mono font-bold hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            <span>#{tag}</span>
                            {isCustom && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300">
                                Custom Tag
                              </span>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-navy-500 dark:text-navy-400">
                            {count} {count === 1 ? "formula" : "formulas"}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleSelectTag(tag)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                              isSelected
                                ? "bg-amber-400 text-navy-950"
                                : "bg-navy-200 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-royal-600 hover:text-white"
                            }`}
                          >
                            {isSelected ? "Filter Active" : "+ Filter"}
                          </button>

                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomTag(tag)}
                              className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="Delete custom tag"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-navy-150 dark:border-navy-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTagManagerModal(false)}
                  className="px-5 py-2 rounded-xl bg-navy-900 dark:bg-navy-800 text-white font-mono font-bold text-xs cursor-pointer"
                >
                  Close Tag Manager
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT TAGS FOR SPECIFIC FORMULA MODAL */}
      <AnimatePresence>
        {editingFormulaForTags && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 w-full max-w-lg rounded-3xl p-6 shadow-2xl text-navy-900 dark:text-white space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-navy-150 dark:border-navy-800">
                <div>
                  <h3 className="text-base font-black font-display flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gold-400" /> Manage Formula Tags
                  </h3>
                  <p className="text-xs font-mono text-royal-600 dark:text-gold-400 font-bold mt-0.5">
                    {editingFormulaForTags.name}
                  </p>
                </div>

                <button
                  onClick={() => setEditingFormulaForTags(null)}
                  className="p-1.5 rounded-xl bg-navy-100 dark:bg-navy-800 text-navy-500 hover:text-navy-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-navy-700 dark:text-navy-300">
                  Select sub-topics & tags to assign to this formula:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                  {allAvailableTags.map((tag) => {
                    const assignedTags = getEffectiveFormulaTags(editingFormulaForTags);
                    const isAssigned = assignedTags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFormulaTagAssignment(editingFormulaForTags.id, tag)}
                        className={`p-2 rounded-xl text-xs font-mono font-bold border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isAssigned
                            ? "bg-royal-600 text-white border-royal-500 shadow-xs"
                            : "bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-800 hover:border-royal-400"
                        }`}
                      >
                        <span className="truncate">#{tag}</span>
                        {isAssigned && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-navy-150 dark:border-navy-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditingFormulaForTags(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-royal-600 to-navy-900 hover:from-royal-700 hover:to-navy-950 text-white font-mono font-bold text-xs cursor-pointer shadow-lg"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
