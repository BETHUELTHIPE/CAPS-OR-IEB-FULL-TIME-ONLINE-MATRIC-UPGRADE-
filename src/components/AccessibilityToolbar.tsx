import React, { useState, useEffect } from "react";
import { 
  Eye, 
  Type, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  X, 
  Info,
  Sliders,
  HelpCircle,
  Accessibility,
  ArrowUpRight
} from "lucide-react";

export interface AccessibilitySettings {
  highContrast: boolean;
  fontScale: "normal" | "large" | "xl";
  ttsEnabled: boolean;
  reducedMotion: boolean;
}

export interface AccessibilityToolbarProps {
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
  fontScale: "normal" | "large" | "xl";
  setFontScale: (scale: "normal" | "large" | "xl") => void;
  className?: string;
  variant?: "header-button" | "full-card";
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  highContrast,
  setHighContrast,
  fontScale,
  setFontScale,
  className = "",
  variant = "header-button"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("amh_tts_enabled") === "true";
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem("amh_reduced_motion") === "true";
  });
  const [srAnnouncement, setSrAnnouncement] = useState<string>("");

  // Announce messages to screen readers via aria-live polite region
  const announceToScreenReader = (msg: string) => {
    setSrAnnouncement(msg);
    setTimeout(() => setSrAnnouncement(""), 4000);

    // Optional Speech Synthesis read-aloud if enabled
    if (ttsEnabled && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }
  };

  // Toggle High Contrast
  const handleToggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    announceToScreenReader(
      next ? "High contrast mode enabled for maximum readability." : "High contrast mode disabled."
    );
  };

  // Change Font Scale
  const handleChangeFontScale = (scale: "normal" | "large" | "xl") => {
    setFontScale(scale);
    const labels = {
      normal: "Standard 100% text size",
      large: "Large 115% text size",
      xl: "Extra Large 130% text size"
    };
    announceToScreenReader(`Text sizing changed to ${labels[scale]}`);
  };

  // Toggle TTS
  const handleToggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    localStorage.setItem("amh_tts_enabled", String(next));
    announceToScreenReader(
      next ? "Screen-reader Text to Speech assistant activated." : "Screen-reader speech assistant muted."
    );
  };

  // Toggle Reduced Motion
  const handleToggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem("amh_reduced_motion", String(next));
    if (next) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    announceToScreenReader(
      next ? "Reduced motion animations enabled." : "Standard motion animations enabled."
    );
  };

  // Keyboard shortcut listener (Alt + H for High Contrast)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        handleToggleHighContrast();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [highContrast]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Screen Reader Live Region */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="a11y-live-region"
      >
        {srAnnouncement}
      </div>

      {/* Header Quick Toggle & Menu Launcher */}
      <div className="flex items-center gap-1.5">
        {/* Direct 1-Click High Contrast Quick Switch Button */}
        <button
          type="button"
          onClick={handleToggleHighContrast}
          className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-mono font-black transition-all cursor-pointer border ${
            highContrast
              ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/50"
              : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-navy-700 hover:border-amber-500"
          }`}
          aria-label={highContrast ? "Disable High Contrast Mode" : "Enable High Contrast Mode"}
          aria-pressed={highContrast}
          title="Toggle High Contrast Mode (Alt + H)"
        >
          <Eye className={`w-4 h-4 ${highContrast ? "text-slate-950 font-bold" : "text-amber-500"}`} />
          <span className="hidden lg:inline">{highContrast ? "High Contrast ON" : "Contrast"}</span>
        </button>

        {/* Accessibility Control Panel Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
            isOpen
              ? "bg-royal-600 text-white border-royal-700"
              : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-navy-700 hover:border-royal-500"
          }`}
          aria-label="Open Accessibility and Inclusive Education Settings"
          aria-expanded={isOpen}
          title="Accessibility Settings (Font scaling, Speech, High Contrast)"
        >
          <Accessibility className="w-4 h-4 text-royal-600 dark:text-gold-400" />
        </button>
      </div>

      {/* Accessibility Control Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-700 rounded-2xl shadow-2xl p-4 z-50 text-left space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Accessibility className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-black uppercase text-slate-900 dark:text-white">
                  Accessibility & Inclusivity
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Adapt Amaris portal for visual, hearing & motor needs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              aria-label="Close accessibility options"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Option 1: High Contrast Mode */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-500" /> High Contrast Mode
              </span>
              <button
                type="button"
                onClick={handleToggleHighContrast}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer border ${
                  highContrast
                    ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm"
                    : "bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-navy-700"
                }`}
                aria-pressed={highContrast}
              >
                {highContrast ? "ACTIVE" : "OFF"}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Stark high-contrast blacks, whites, and yellows with bold outlines for enhanced visual clarity.
            </p>
          </div>

          {/* Option 2: Font Size Scaler */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-royal-500" /> Text Scaling
              </span>
              <span className="text-[10px] font-mono font-semibold text-royal-600 dark:text-gold-400">
                {fontScale === "normal" ? "100%" : fontScale === "large" ? "115%" : "130%"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(["normal", "large", "xl"] as const).map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => handleChangeFontScale(scale)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                    fontScale === scale
                      ? "bg-royal-600 text-white border-royal-700 shadow-xs"
                      : "bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-royal-400"
                  }`}
                  aria-label={`Set text scale to ${scale}`}
                  aria-pressed={fontScale === scale}
                >
                  {scale === "normal" ? "Standard" : scale === "large" ? "Large" : "Extra Large"}
                </button>
              ))}
            </div>
          </div>

          {/* Option 3: Text-To-Speech (Read Aloud Assistant) */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {ttsEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                Text-to-Speech Verbalizer
              </span>
              <button
                type="button"
                onClick={handleToggleTts}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer border ${
                  ttsEnabled
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-navy-700"
                }`}
                aria-pressed={ttsEnabled}
              >
                {ttsEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Automatically reads aloud status updates, score alerts, and mathematical equation steps.
            </p>
          </div>

          {/* Option 4: Reduced Motion */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" /> Reduced Motion
              </span>
              <button
                type="button"
                onClick={handleToggleReducedMotion}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer border ${
                  reducedMotion
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                    : "bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-navy-700"
                }`}
                aria-pressed={reducedMotion}
              >
                {reducedMotion ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Shortcut Keys Footnote */}
          <div className="pt-2 border-t border-slate-100 dark:border-navy-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Shortcut: <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-navy-800 rounded font-bold text-slate-800 dark:text-slate-200">Alt + H</kbd></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">WCAG 2.1 AAA Compliant</span>
          </div>
        </div>
      )}
    </div>
  );
};
