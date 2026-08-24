import React, { useState } from "react";
import { Calculator, Sparkles, Check, ArrowRight, RefreshCw, Layers } from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";

export const ExponentSurdCalculator: React.FC = () => {
  // Mode: "fractional" | "surd" | "k_sub"
  const [activeTab, setActiveTab] = useState<"fractional" | "surd" | "k_sub">("fractional");

  // Fractional exponent state: a^(m/n)
  const [base, setBase] = useState<number>(8);
  const [power, setPower] = useState<number>(2);
  const [root, setRoot] = useState<number>(3);

  // Surd rationalizer state: c / (sqrt(a) + b)
  const [numC, setNumC] = useState<number>(6);
  const [surdA, setSurdA] = useState<number>(5);
  const [valB, setValB] = useState<number>(2);

  // Calculate fractional exponent
  const calcFractional = () => {
    if (root === 0) return { error: "Root (n) cannot be zero!" };
    if (base < 0 && root % 2 === 0) return { error: "Even root of a negative number produces non-real roots!" };
    
    const rootVal = Math.pow(Math.abs(base), 1 / root) * (base < 0 ? -1 : 1);
    const finalVal = Math.pow(rootVal, power);
    const powerFirstVal = Math.pow(base, power);

    const isInteger = Number.isInteger(finalVal);
    const formattedResult = isInteger ? finalVal.toString() : finalVal.toFixed(4);

    return {
      error: null,
      latexExpression: `${base}^{\\frac{${power}}{${root}}}`,
      latexRadical: `\\sqrt[${root}]{${base}^{${power}}}`,
      latexRootFirst: `\\left(\\sqrt[${root}]{${base}}\\right)^{${power}}`,
      rootVal: Number.isInteger(rootVal) ? rootVal.toString() : rootVal.toFixed(4),
      powerFirstVal: Number.isInteger(powerFirstVal) ? powerFirstVal.toString() : powerFirstVal.toFixed(4),
      finalVal: formattedResult,
    };
  };

  const fracRes = calcFractional();

  // Calculate surd rationalization
  const calcRationalization = () => {
    if (surdA < 0) return { error: "Radicand under square root must be non-negative!" };
    const denomDiff = surdA - Math.pow(valB, 2);
    if (denomDiff === 0) return { error: "Denominator evaluates to 0!" };

    return {
      error: null,
      originalLatex: `\\frac{${numC}}{\\sqrt{${surdA}} + ${valB}}`,
      conjugateLatex: `\\frac{\\sqrt{${surdA}} - ${valB}}{\\sqrt{${surdA}} - ${valB}}`,
      stepLatex: `\\frac{${numC}(\\sqrt{${surdA}} - ${valB})}{(${surdA} - ${Math.pow(valB, 2)})}`,
      denomDiff,
    };
  };

  const surdRes = calcRationalization();

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-navy-700 space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gold-500/20 text-gold-400 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              Exponents & Surds Interactive Sandbox
              <span className="text-[10px] font-mono bg-gold-400/10 text-gold-400 border border-gold-400/20 px-2 py-0.5 rounded">
                CAPS / IEB Paper 1
              </span>
            </h4>
            <p className="text-[11px] text-navy-300">
              Test fractional exponent transformations, surd rationalization & step-by-step simplification.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("fractional")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === "fractional" ? "bg-royal-600 text-white" : "text-navy-400 hover:text-white"
            }`}
          >
            Fractional Exponent
          </button>
          <button
            onClick={() => setActiveTab("surd")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === "surd" ? "bg-royal-600 text-white" : "text-navy-400 hover:text-white"
            }`}
          >
            Rationalize Surd
          </button>
          <button
            onClick={() => setActiveTab("k_sub")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === "k_sub" ? "bg-royal-600 text-white" : "text-navy-400 hover:text-white"
            }`}
          >
            $k$-Substitution
          </button>
        </div>
      </div>

      {/* TAB 1: FRACTIONAL EXPONENTS */}
      {activeTab === "fractional" && (
        <div className="space-y-4">
          <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 text-center">
            <div className="text-xs text-navy-400 font-mono mb-1 uppercase tracking-wide">Core CAPS Law Formula:</div>
            <LatexRenderer text="a^{\frac{m}{n}} = \sqrt[n]{a^m} = \left(\sqrt[n]{a}\right)^m" block />
          </div>

          {/* INPUT CONTROLS */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">Base ($a$)</label>
              <input
                type="number"
                value={base}
                onChange={(e) => setBase(Number(e.target.value))}
                className="w-full bg-slate-800 border border-navy-700 text-white text-xs font-mono rounded-lg p-2 focus:border-royal-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">Power ($m$)</label>
              <input
                type="number"
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                className="w-full bg-slate-800 border border-navy-700 text-white text-xs font-mono rounded-lg p-2 focus:border-royal-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">Root ($n$)</label>
              <input
                type="number"
                value={root}
                onChange={(e) => setRoot(Number(e.target.value))}
                className="w-full bg-slate-800 border border-navy-700 text-white text-xs font-mono rounded-lg p-2 focus:border-royal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* PRESETS BUTTONS */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="text-navy-400">Quick Test Examples:</span>
            <button
              onClick={() => { setBase(8); setPower(2); setRoot(3); }}
              className="px-2 py-0.5 bg-navy-800 hover:bg-navy-700 rounded text-gold-400 border border-navy-700 cursor-pointer"
            >
              $8^{2/3}$
            </button>
            <button
              onClick={() => { setBase(27); setPower(4); setRoot(3); }}
              className="px-2 py-0.5 bg-navy-800 hover:bg-navy-700 rounded text-gold-400 border border-navy-700 cursor-pointer"
            >
              $27^{4/3}$
            </button>
            <button
              onClick={() => { setBase(16); setPower(-3); setRoot(4); }}
              className="px-2 py-0.5 bg-navy-800 hover:bg-navy-700 rounded text-gold-400 border border-navy-700 cursor-pointer"
            >
              $16^{-3/4}$
            </button>
          </div>

          {/* RESULTS STEP BY STEP */}
          {fracRes.error ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-mono">
              ⚠️ {fracRes.error}
            </div>
          ) : (
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3">
              <div className="text-xs font-mono font-extrabold text-emerald-400 flex items-center justify-between border-b border-navy-800 pb-2">
                <span>Step-by-Step Transformation:</span>
                <span className="text-gold-400 text-sm">{fracRes.latexExpression} = {fracRes.finalVal}</span>
              </div>

              <div className="space-y-2 text-xs font-mono text-navy-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-royal-600/30 text-royal-400 text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Surd Radical Form: <LatexRenderer text={fracRes.latexRadical} /></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-royal-600/30 text-royal-400 text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Evaluate Root First: <LatexRenderer text={fracRes.latexRootFirst} /> = <LatexRenderer text={`(${fracRes.rootVal})^{${power}}`} /></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-400 text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>Final Result = <strong>{fracRes.finalVal}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SURD RATIONALIZATION */}
      {activeTab === "surd" && (
        <div className="space-y-4">
          <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 text-center">
            <div className="text-xs text-navy-400 font-mono mb-1 uppercase tracking-wide">Rationalizing Denominators Strategy:</div>
            <LatexRenderer text="\frac{c}{\sqrt{a} + b} \cdot \frac{\sqrt{a} - b}{\sqrt{a} - b} = \frac{c(\sqrt{a} - b)}{a - b^2}" block />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">Numerator ($c$)</label>
              <input
                type="number"
                value={numC}
                onChange={(e) => setNumC(Number(e.target.value))}
                className="w-full bg-slate-800 border border-navy-700 text-white text-xs font-mono rounded-lg p-2 focus:border-royal-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">Surd Radicand (a)</label>
              <input
                type="number"
                value={surdA}
                onChange={(e) => setSurdA(Number(e.target.value))}
                className="w-full bg-slate-800 border border-navy-700 text-white text-xs font-mono rounded-lg p-2 focus:border-royal-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">Constant ($b$)</label>
              <input
                type="number"
                value={valB}
                onChange={(e) => setValB(Number(e.target.value))}
                className="w-full bg-slate-800 border border-navy-700 text-white text-xs font-mono rounded-lg p-2 focus:border-royal-500 focus:outline-none"
              />
            </div>
          </div>

          {surdRes.error ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-mono">
              ⚠️ {surdRes.error}
            </div>
          ) : (
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3">
              <div className="text-xs font-mono font-extrabold text-emerald-400 border-b border-navy-800 pb-2">
                Conjugate Multiplication Walkthrough:
              </div>
              <div className="space-y-2 text-xs font-mono text-navy-200">
                <div>1. Original Fraction: <LatexRenderer text={surdRes.originalLatex} /></div>
                <div>2. Multiply by Conjugate: <LatexRenderer text={`${surdRes.originalLatex} \\cdot ${surdRes.conjugateLatex}`} /></div>
                <div>3. Expanded Denominator Difference of Squares: <LatexRenderer text={surdRes.stepLatex} /></div>
                <div>4. Denominator evaluates to: <strong>{surdRes.denomDiff}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: K-SUBSTITUTION METHOD */}
      {activeTab === "k_sub" && (
        <div className="space-y-4">
          <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-2">
            <div className="text-xs text-gold-400 font-mono font-bold flex items-center gap-1.5">
              High-Yield CAPS Strategy: Exponential <LatexRenderer text="k" />-Substitution
            </div>
            <div className="text-xs text-navy-300 leading-relaxed space-y-1">
              <div>
                When encountering equations with added exponential terms like <LatexRenderer text="2^{x+2} + 2^x = 40" /> or <LatexRenderer text="3^{2x} - 4 \cdot 3^x + 3 = 0" />, replace <LatexRenderer text="a^x" /> with <LatexRenderer text="k" />!
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-navy-800 space-y-3 font-mono text-xs">
            <div className="text-emerald-400 font-extrabold">Worked High-Yield Exam Example:</div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-navy-700 text-white flex items-center gap-2">
              <strong>Question:</strong> Solve for <LatexRenderer text="x" /> without using a calculator: <LatexRenderer text="2^{x+2} + 2^x = 40" />
            </div>
            <div className="space-y-1.5 text-navy-200 pl-2 border-l-2 border-royal-500">
              <div><strong>Step 1:</strong> Split power using exponential law: <LatexRenderer text="2^x \cdot 2^2 + 2^x = 40" /></div>
              <div><strong>Step 2:</strong> Factor out common exponential term <LatexRenderer text="2^x" />: <LatexRenderer text="2^x(2^2 + 1) = 40" /></div>
              <div><strong>Step 3:</strong> Simplify brackets: <LatexRenderer text="2^x(5) = 40 \implies 2^x = 8" /></div>
              <div><strong>Step 4:</strong> Express RHS as base 2: <LatexRenderer text="2^x = 2^3 \implies x = 3" /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
