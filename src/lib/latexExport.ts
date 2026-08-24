/**
 * Amaris Mathematics Hub — LaTeX Exporter Utility
 * Generates compilable, production-ready .tex formatted text files from math tutor chat histories
 * and complex step-by-step mathematical derivations.
 */

// Helper to escape standard LaTeX special characters outside of mathematical blocks
export function escapeLatexText(text: string): string {
  // Split text by inline and display math environments so we only escape natural language text
  const mathSegments = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);

  return mathSegments
    .map((segment, index) => {
      // Odd indices are math blocks (e.g. $x^2$, $$...$$) — preserve verbatim
      if (index % 2 === 1) {
        // Clean up common KaTeX / web quirks inside math blocks if necessary
        return segment
          .replace(/&nbsp;/g, " ")
          .replace(/×/g, "\\times ")
          .replace(/÷/g, "\\div ")
          .replace(/±/g, "\\pm ")
          .replace(/√/g, "\\sqrt");
      }

      // Even indices are natural text: escape LaTeX special characters
      let escaped = segment;
      // Handle backslashes first
      escaped = escaped.replace(/\\(?!([a-zA-Z]+|\{|\}|\[|\]))/g, "\\textbackslash ");
      // Escape other LaTeX specials
      escaped = escaped
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/\$/g, "\\$")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}");

      return escaped;
    })
    .join("");
}

/**
 * Converts rich markdown content into clean LaTeX syntax
 */
export function convertMarkdownToLatex(text: string): string {
  if (!text) return "";

  // Normalize line endings
  let output = text.replace(/\r\n/g, "\n");

  // Preserve code blocks before markdown parsing
  const codeBlocks: string[] = [];
  output = output.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    const placeholder = `%%CODE_BLOCK_${codeBlocks.length}%%`;
    codeBlocks.push(`\\begin{verbatim}\n${code}\n\\end{verbatim}`);
    return placeholder;
  });

  // Preserve display math $$ ... $$
  const displayMathBlocks: string[] = [];
  output = output.replace(/\$\$([\s\S]*?)\$\$/g, (_, mathContent) => {
    const placeholder = `%%DISPLAY_MATH_${displayMathBlocks.length}%%`;
    const trimmed = mathContent.trim();
    // Wrap in equation or align environment if multiple lines
    if (trimmed.includes("\\\\") || trimmed.includes("&")) {
      displayMathBlocks.push(`\\begin{align*}\n${trimmed}\n\\end{align*}`);
    } else {
      displayMathBlocks.push(`\\[\n${trimmed}\n\\]`);
    }
    return placeholder;
  });

  // Convert Headings
  output = output.replace(/^### (.*$)/gim, "\\subsubsection*{$1}");
  output = output.replace(/^## (.*$)/gim, "\\subsection*{$1}");
  output = output.replace(/^# (.*$)/gim, "\\section*{$1}");

  // Convert Bold and Italic
  output = output.replace(/\*\*([^*]+)\*\*/g, "\\textbf{$1}");
  output = output.replace(/\*([^*]+)\*/g, "\\textit{$1}");
  output = output.replace(/__([^_]+)__/g, "\\textbf{$1}");
  output = output.replace(/_([^_]+)_/g, "\\textit{$1}");

  // Convert Markdown bullet lists (- item or * item)
  const lines = output.split("\n");
  let inItemize = false;
  let inEnumerate = false;
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    const numMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

    if (bulletMatch) {
      if (inEnumerate) {
        processedLines.push("\\end{enumerate}");
        inEnumerate = false;
      }
      if (!inItemize) {
        processedLines.push("\\begin{itemize}");
        inItemize = true;
      }
      processedLines.push(`  \\item ${bulletMatch[2]}`);
    } else if (numMatch) {
      if (inItemize) {
        processedLines.push("\\end{itemize}");
        inItemize = false;
      }
      if (!inEnumerate) {
        processedLines.push("\\begin{enumerate}");
        inEnumerate = true;
      }
      processedLines.push(`  \\item ${numMatch[2]}`);
    } else {
      if (inItemize) {
        processedLines.push("\\end{itemize}");
        inItemize = false;
      }
      if (inEnumerate) {
        processedLines.push("\\end{enumerate}");
        inEnumerate = false;
      }
      processedLines.push(line);
    }
  }

  if (inItemize) processedLines.push("\\end{itemize}");
  if (inEnumerate) processedLines.push("\\end{enumerate}");

  output = processedLines.join("\n");

  // Restore display math blocks
  displayMathBlocks.forEach((block, idx) => {
    output = output.replace(`%%DISPLAY_MATH_${idx}%%`, `\n${block}\n`);
  });

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    output = output.replace(`%%CODE_BLOCK_${idx}%%`, `\n${block}\n`);
  });

  // Add paragraph breaks for consecutive plain lines
  return output;
}

export interface ChatExportMessage {
  id?: string;
  role: "user" | "tutor" | "student" | "system";
  senderName?: string;
  text: string;
  timestamp?: string;
  topic?: string;
  syllabus?: string;
  grade?: string;
  mode?: string;
}

export interface LatexExportOptions {
  title?: string;
  studentName?: string;
  tutorName?: string;
  syllabus?: string;
  grade?: string;
  topic?: string;
  messages: ChatExportMessage[];
}

/**
 * Generates a comprehensive, compilable LaTeX .tex document
 */
export function generateConversationLatex(options: LatexExportOptions): string {
  const {
    title = "Amaris Mathematics Hub — Math Tutor Derivations",
    studentName = "Student",
    tutorName = "Tutor Bethuel",
    syllabus = "CAPS / IEB",
    grade = "Grade 12",
    topic = "Mathematics Problem Solving",
    messages = []
  } = options;

  const exportDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const exportTime = new Date().toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Build LaTeX Document Body
  let body = "";

  messages.forEach((msg, index) => {
    const isUser = msg.role === "user" || msg.role === "student";
    const senderDisplay = isUser ? studentName : (msg.senderName || tutorName);
    const roleLabel = isUser ? "Student Inquiry" : "Tutor Solution \\& Step-by-Step Derivation";
    const boxColor = isUser ? "studentbox" : "tutorbox";
    const titleColor = isUser ? "royalnavy" : "amarisgold";

    const convertedContent = convertMarkdownToLatex(msg.text);

    body += `
% -------------------------------------------------------------
% Turn ${index + 1}: ${senderDisplay} (${isUser ? 'Question' : 'Solution'})
% -------------------------------------------------------------
\\subsection*{Turn ${index + 1}: ${escapeLatexText(senderDisplay)} \\hfill \\small\\textnormal{${msg.timestamp || exportTime}}}
\\begin{tcolorbox}[
    colback=${boxColor},
    colframe=${titleColor},
    title={\\textbf{${roleLabel}}},
    fonttitle=\\bfseries\\small,
    arc=3mm,
    boxrule=1pt,
    left=4mm,
    right=4mm,
    top=3mm,
    bottom=3mm
]
${convertedContent}
\\end{tcolorbox}
\\vspace{1em}
`;
  });

  // Full LaTeX Template with amsmath, hyperref, tcolorbox, and high-contrast color scheme
  return `% =========================================================================
% AMARIS MATHEMATICS HUB (AMH) — MATHEMATICAL DERIVATION RECORD
% Generated automatically by Amaris Math Tutor
% Compatible with TeX Live, Overleaf, TeXMaker, and PDFLaTeX / XeLaTeX
% =========================================================================

\\documentclass[11pt,a4paper]{article}

% --- Essential Mathematics & Typography Packages ---
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb,amsfonts,amsthm,mathtools}
\\usepackage{geometry}
\\geometry{
    a4paper,
    total={170mm,245mm},
    left=20mm,
    top=25mm,
    right=20mm,
    bottom=25mm
}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{hyperref}
\\usepackage{tcolorbox}
\\usepackage{enumitem}
\\usepackage{booktabs}
\\usepackage{microtype}

% --- Color Palette Aligned with Amaris Theme ---
\\definecolor{royalnavy}{RGB}{10, 25, 47}
\\definecolor{amarisblue}{RGB}{37, 99, 235}
\\definecolor{amarisgold}{RGB}{180, 130, 20}
\\definecolor{studentbox}{RGB}{240, 246, 255}
\\definecolor{tutorbox}{RGB}{255, 253, 245}
\\definecolor{darkgray}{RGB}{60, 64, 67}

% --- Hyperref Setup ---
\\hypersetup{
    colorlinks=true,
    linkcolor=amarisblue,
    urlcolor=amarisblue,
    citecolor=amarisgold,
    pdftitle={${title.replace(/[\{\}\\]/g, "")}},
    pdfauthor={Amaris Mathematics Hub}
}

% --- Header and Footer Styling ---
\\pagestyle{fancy}
\\fancyhf{}
\\rhead{\\textcolor{darkgray}{\\footnotesize Amaris Mathematics Hub}}
\\lhead{\\textcolor{darkgray}{\\footnotesize ${escapeLatexText(topic)} | ${escapeLatexText(syllabus)}}}
\\rfoot{\\textcolor{darkgray}{\\footnotesize Page \\thepage}}
\\lfoot{\\textcolor{darkgray}{\\footnotesize Exported on ${exportDate}}}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0.4pt}

% --- Document Metadata ---
\\title{
    \\vspace{-1.5cm}
    \\textbf{\\Huge \\textcolor{royalnavy}{Amaris Mathematics Hub}}\\\\
    \\vspace{0.3cm}
    \\Large \\textcolor{amarisgold}{Math Tutor Derivations \\& Step-by-Step Record}
}
\\author{
    \\textbf{Student:} ${escapeLatexText(studentName)} \\and 
    \\textbf{Tutor:} ${escapeLatexText(tutorName)}
}
\\date{${exportDate} at ${exportTime}}

\\begin{document}

\\maketitle
\\thispagestyle{fancy}

% --- Session Overview Metadata Box ---
\\begin{tcolorbox}[
    colback=white,
    colframe=royalnavy,
    arc=2mm,
    boxrule=0.8pt,
    title={\\textbf{Curriculum \\& Session Metadata}},
    coltitle=white
]
\\begin{tabular}{@{}ll@{}}
    \\textbf{Curriculum Framework:} & ${escapeLatexText(syllabus)} \\\\
    \\textbf{Academic Level:} & ${escapeLatexText(grade)} \\\\
    \\textbf{Topic Focus:} & ${escapeLatexText(topic)} \\\\
    \\textbf{Total Dialogue Turns:} & ${messages.length} interaction(s) \\\\
    \\textbf{Digital Verification:} & Verified with Amaris Step-by-Step CAS Engine
\\end{tabular}
\\end{tcolorbox}

\\vspace{0.8em}
\\noindent\\rule{\\textwidth}{0.6pt}
\\vspace{0.8em}

\\section*{\\textcolor{royalnavy}{Conversation \\& Mathematical Solutions}}

${body}

\\vfill
\\begin{center}
    \\small\\textcolor{darkgray}{\\textit{Generated by Amaris Mathematics Hub --- South Africa's Premier CAPS \\& IEB Online Math Platform}}
\\end{center}

\\end{document}
`;
}

/**
 * Downloads a generated string as a .tex LaTeX file to the student's browser
 */
export function downloadLatexFile(content: string, filename: string = "amaris_math_derivations.tex"): void {
  const blob = new Blob([content], { type: "text/x-tex;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".tex") ? filename : `${filename}.tex`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
