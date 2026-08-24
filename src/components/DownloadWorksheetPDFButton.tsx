import React, { useState } from "react";
import { Download, Printer, CheckCircle2, HelpCircle, FileText, Sparkles, Loader2 } from "lucide-react";

export interface DownloadWorksheetPDFButtonProps {
  /**
   * DOM selector or element ID of the worksheet container to print/save.
   * e.g., '#worksheet-printable-area', '.worksheet-print-target', 'worksheet-container'
   */
  targetSelector?: string;

  /**
   * Title of the worksheet to name the downloaded PDF file.
   * Used to dynamically set document.title prior to window.print().
   */
  worksheetTitle?: string;

  /**
   * Academic grade (e.g. "Grade 12", "Grade 11")
   */
  grade?: string;

  /**
   * Subject title (e.g. "Mathematics Paper 1", "Technical Maths")
   */
  subject?: string;

  /**
   * Visual styling variant of the button
   */
  variant?: "primary" | "amber" | "emerald" | "outline" | "secondary" | "compact" | "icon-only";

  /**
   * Button size sizing
   */
  size?: "sm" | "md" | "lg";

  /**
   * Custom label text (defaults to "Download as PDF")
   */
  label?: string;

  /**
   * Custom secondary sublabel / badge text
   */
  sublabel?: string;

  /**
   * Show helper tooltip or dialog explaining browser "Save as PDF" destination options
   */
  showHelpTooltip?: boolean;

  /**
   * Custom additional CSS classes
   */
  className?: string;

  /**
   * Unique HTML ID for testing and scripting
   */
  id?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Optional callback triggered before the print dialog opens
   */
  onBeforePrint?: () => void;

  /**
   * Optional callback triggered after the print action
   */
  onAfterPrint?: () => void;
}

export const DownloadWorksheetPDFButton: React.FC<DownloadWorksheetPDFButtonProps> = ({
  targetSelector = "#worksheet-printable-area",
  worksheetTitle = "AMH_Mathematics_Worksheet",
  grade = "Grade 12",
  subject = "Mathematics",
  variant = "emerald",
  size = "md",
  label = "Download as PDF",
  sublabel,
  showHelpTooltip = true,
  className = "",
  id = "btn-download-worksheet-pdf",
  disabled = false,
  onBeforePrint,
  onAfterPrint,
}) => {
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [justDownloaded, setJustDownloaded] = useState<boolean>(false);

  const cleanFileTitle = `AMH_${grade.replace(/\s+/g, "_")}_${subject.replace(/\s+/g, "_")}_${worksheetTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const handleTriggerPrintPDF = () => {
    if (disabled || isPreparing) return;

    try {
      setIsPreparing(true);
      if (onBeforePrint) onBeforePrint();

      // Find the target worksheet element if specific selector provided
      let targetEl: HTMLElement | null = null;
      if (targetSelector.startsWith("#") || targetSelector.startsWith(".")) {
        targetEl = document.querySelector<HTMLElement>(targetSelector);
      } else {
        targetEl = document.getElementById(targetSelector);
      }

      // If specific target element exists, ensure print isolation classes are present
      if (targetEl) {
        targetEl.classList.add("print-only", "worksheet-print-target");
      }

      // Save original page title to restore after print
      const originalTitle = document.title;
      document.title = cleanFileTitle;

      // Small delay to ensure render tree and CSS @media print are ready
      setTimeout(() => {
        // Trigger browser native print dialog configured with print stylesheets
        window.print();

        // Restore document title and reset preparation state
        document.title = originalTitle;
        setIsPreparing(false);
        setJustDownloaded(true);

        if (onAfterPrint) onAfterPrint();

        setTimeout(() => {
          setJustDownloaded(false);
        }, 4000);
      }, 150);
    } catch (err) {
      console.error("Error triggering worksheet PDF print dialog:", err);
      setIsPreparing(false);
      window.print();
    }
  };

  // Base styling classes
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-xs gap-2",
    lg: "px-5 py-2.5 text-sm gap-2.5"
  }[size];

  const variantClasses = {
    primary: "bg-gradient-to-r from-royal-600 to-navy-700 hover:from-royal-500 hover:to-navy-600 text-white shadow-md hover:shadow-lg border border-royal-400/30",
    emerald: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md hover:shadow-lg border border-emerald-400/30",
    amber: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-black shadow-md hover:shadow-lg border border-amber-300/40",
    outline: "bg-white/80 dark:bg-navy-900/80 hover:bg-white dark:hover:bg-navy-800 text-navy-800 dark:text-navy-100 border border-navy-300 dark:border-navy-700 shadow-xs",
    secondary: "bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-100 border border-navy-200 dark:border-navy-700",
    compact: "px-2 py-1 text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
    "icon-only": "p-2 rounded-xl bg-navy-100 dark:bg-navy-800 hover:bg-emerald-600 hover:text-white text-navy-700 dark:text-navy-200 border border-navy-200 dark:border-navy-700"
  }[variant];

  if (variant === "icon-only") {
    return (
      <div className="relative inline-flex items-center">
        <button
          id={id}
          type="button"
          onClick={handleTriggerPrintPDF}
          disabled={disabled || isPreparing}
          className={`cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
          title={`Download ${worksheetTitle} as PDF`}
        >
          {isPreparing ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          ) : justDownloaded ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        id={id}
        type="button"
        onClick={handleTriggerPrintPDF}
        disabled={disabled || isPreparing}
        className={`rounded-xl font-mono font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        title={`Trigger browser print dialog to save ${worksheetTitle} as PDF`}
      >
        {isPreparing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
            <span>Preparing PDF...</span>
          </>
        ) : justDownloaded ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>PDF Ready!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {sublabel && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90 font-normal">
                {sublabel}
              </span>
            )}
          </>
        )}
      </button>

      {/* Optional PDF Print Guidance Info Button */}
      {showHelpTooltip && (
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="p-1.5 text-navy-400 hover:text-navy-700 dark:hover:text-gold-300 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
          title="How to save as high-quality PDF from the print dialog"
          aria-label="PDF Instructions"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick Modal Instructions for Perfect PDF Output */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-2xl p-5 max-w-md w-full shadow-2xl text-left space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900 dark:text-white font-mono">
                    Save Worksheet as PDF
                  </h4>
                  <p className="text-[11px] text-navy-500 dark:text-navy-400">
                    High-quality vector formatting for CAPS & IEB papers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-navy-400 hover:text-navy-600 dark:hover:text-white text-xs font-mono font-bold px-2 py-1 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-navy-700 dark:text-navy-200 font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-navy-900 dark:text-white">Destination:</strong> Choose <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong> in the browser dialog.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-royal-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-navy-900 dark:text-white">Paper & Margins:</strong> Select <strong>A4</strong> with <strong>Default / None</strong> margins.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-navy-950 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-navy-900 dark:text-white">Options:</strong> Enable <strong>"Background graphics"</strong> to preserve diagram borders, equation boxes, and high-contrast styling.
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
                  handleTriggerPrintPDF();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open Print Dialog Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadWorksheetPDFButton;
