import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface LatexRendererProps {
  text: string;
  block?: boolean;
  className?: string;
}

const formatLatexMath = (str: string): string => {
  let s = str;
  s = s.replace(/⟹/g, "\\implies ");
  s = s.replace(/→/g, "\\to ");
  s = s.replace(/⇔/g, "\\iff ");
  s = s.replace(/±/g, "\\pm ");
  s = s.replace(/√\(([^)]+)\)/g, "\\sqrt{$1}");
  s = s.replace(/√([0-9a-zA-Z]+)/g, "\\sqrt{$1}");
  s = s.replace(/≠/g, "\\neq ");
  s = s.replace(/≤/g, "\\le ");
  s = s.replace(/≥/g, "\\ge ");
  s = s.replace(/θ/g, "\\theta ");
  s = s.replace(/Δ/g, "\\Delta ");
  s = s.replace(/π/g, "\\pi ");
  s = s.replace(/∞/g, "\\infty ");
  s = s.replace(/°/g, "^\\circ");
  s = s.replace(/•/g, "\\cdot ");
  return s;
};

const hasMathSymbols = (str: string): boolean => {
  const mathRegex = /[=±√²³ⁿθΔπ∞÷×<>≤≥\\]|T_n|S_n|S_∞|f\(x\)|f'\(x\)|P\(|\\sqrt|\\frac|\\implies|\\sin|\\cos|\\tan/;
  return mathRegex.test(str);
};

const preprocessText = (rawText: string): string => {
  if (!rawText) return "";
  if (rawText.includes("$") || rawText.includes("\\(")) {
    return rawText;
  }

  const lines = rawText.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    let prefix = "";
    let content = trimmed;

    if (content.startsWith("•") || content.startsWith("*") || content.startsWith("-")) {
      prefix = "• ";
      content = content.substring(1).trim();
    }

    if (hasMathSymbols(content)) {
      if (content.includes(":") && !content.startsWith("\\")) {
        const parts = content.split(":");
        const label = parts[0].trim();
        const formula = parts.slice(1).join(":").trim();
        if (hasMathSymbols(formula)) {
          return `${prefix}${label}: $${formatLatexMath(formula)}$`;
        }
      }
      return `${prefix}$${formatLatexMath(content)}$`;
    }

    return line;
  });

  return processedLines.join("\n");
};

export const LatexRenderer: React.FC<LatexRendererProps> = ({ text, block = false, className = "" }) => {
  if (!text) return null;

  const preprocessed = preprocessText(text);

  // If block mode is explicitly requested, render as display math
  if (block) {
    let cleanFormula = preprocessed.trim();
    if (cleanFormula.startsWith("$$") && cleanFormula.endsWith("$$")) {
      cleanFormula = cleanFormula.slice(2, -2).trim();
    } else if (cleanFormula.startsWith("$") && cleanFormula.endsWith("$")) {
      cleanFormula = cleanFormula.slice(1, -1).trim();
    }

    cleanFormula = formatLatexMath(cleanFormula);

    try {
      const html = katex.renderToString(cleanFormula, {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
      return (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className={`my-2 py-1.5 px-3 rounded-lg overflow-x-auto text-center font-sans select-all ${className}`}
        />
      );
    } catch (e) {
      return (
        <div className={`text-amber-400 font-mono text-xs p-2 bg-amber-950/20 rounded ${className}`}>
          {text}
        </div>
      );
    }
  }

  // Parse text for inline ($...$) and block ($$...$$) math
  const parts = preprocessed.split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <span className={`inline-block max-w-full align-middle leading-relaxed ${className}`}>
      {parts.map((part, i) => {
        // Handle Block Math ($$ ... $$)
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = formatLatexMath(part.slice(2, -2));
          try {
            const html = katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
              trust: true,
            });
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{ __html: html }}
                aria-label={`Mathematical expression: ${formula}`}
                title={`Mathematical expression: ${formula}`}
                className="block my-3 text-center overflow-x-auto clear-both font-sans"
              />
            );
          } catch (e) {
            return (
              <span key={i} className="text-amber-500 font-mono text-xs">
                {part}
              </span>
            );
          }
        }

        // Handle Inline Math ($ ... $) and Text
        const subParts = part.split(/(\$[\s\S]*?\$)/g);
        return (
          <span key={i}>
            {subParts.map((subPart, j) => {
              if (subPart.startsWith("$") && subPart.endsWith("$")) {
                const formula = formatLatexMath(subPart.slice(1, -1));
                try {
                  const html = katex.renderToString(formula, {
                    displayMode: false,
                    throwOnError: false,
                    trust: true,
                  });
                  return (
                    <span
                      key={j}
                      dangerouslySetInnerHTML={{ __html: html }}
                      aria-label={`Math formula: ${formula}`}
                      title={`Math formula: ${formula}`}
                      className="inline-block px-1 font-sans text-slate-900 dark:text-slate-100"
                    />
                  );
                } catch (e) {
                  return (
                    <span key={j} className="text-amber-500 font-mono text-xs">
                      {subPart}
                    </span>
                  );
                }
              }

              // Render standard text with newline support
              const textLines = subPart.split("\n");
              return (
                <span key={j}>
                  {textLines.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < textLines.length - 1 && <br className="my-1" />}
                    </React.Fragment>
                  ))}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
};
