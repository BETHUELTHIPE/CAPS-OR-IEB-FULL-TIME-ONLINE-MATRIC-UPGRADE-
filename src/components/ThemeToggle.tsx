import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Sparkles } from "lucide-react";

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  className?: string;
  variant?: "floating-icon" | "switch";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  darkMode, 
  setDarkMode,
  className = "",
  variant = "floating-icon"
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (variant === "floating-icon") {
    return (
      <div className="relative inline-flex items-center">
        <motion.button
          onClick={() => setDarkMode(!darkMode)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.08, rotate: darkMode ? -12 : 12 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`relative p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group shadow-sm hover:shadow-md border ${
            darkMode 
              ? "bg-navy-800/90 hover:bg-navy-750 border-gold-500/30 text-gold-400 hover:border-gold-400 shadow-gold-500/10" 
              : "bg-white/90 hover:bg-royal-50/90 border-royal-200 text-royal-600 hover:border-royal-400 shadow-royal-500/10"
          } ${className}`}
          aria-label={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          id="header-floating-theme-toggle"
        >
          {/* Subtle Ambient Glow Ring */}
          <span 
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm rounded-xl ${
              darkMode ? "bg-gold-400/20" : "bg-royal-500/20"
            }`} 
          />

          {/* Animated Icon Container */}
          <AnimatePresence mode="wait" initial={false}>
            {darkMode ? (
              <motion.div
                key="dark"
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative z-10 flex items-center gap-1.5"
              >
                <Moon className="w-4 h-4 fill-gold-400/20 text-gold-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                <span className="text-[11px] font-bold font-mono text-gold-300 hidden xl:inline">Dark</span>
              </motion.div>
            ) : (
              <motion.div
                key="light"
                initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative z-10 flex items-center gap-1.5"
              >
                <Sun className="w-4 h-4 text-amber-500 fill-amber-400/20 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="text-[11px] font-bold font-mono text-royal-700 hidden xl:inline">Light</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Floating Tooltip Indicator */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-navy-900 dark:bg-navy-800 text-white text-[10px] font-mono font-bold rounded-lg shadow-xl border border-navy-700 whitespace-nowrap pointer-events-none z-50 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span>{darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Classic Switch Pill Variant
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative flex items-center justify-between w-14 h-8 p-1 bg-navy-100 dark:bg-navy-800 rounded-full border border-navy-200/80 dark:border-navy-700/80 cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:border-navy-300 dark:hover:border-navy-600 transition-all duration-300 focus:outline-none select-none group hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      aria-label="Toggle dark mode"
      id="header-theme-toggle-switch"
    >
      <div className="flex items-center justify-center w-6 h-6 z-10">
        <Sun className={`w-3.5 h-3.5 text-amber-500 transition-opacity duration-200 ${darkMode ? "opacity-40" : "opacity-0"}`} />
      </div>

      <div className="flex items-center justify-center w-6 h-6 z-10">
        <Moon className={`w-3.5 h-3.5 text-blue-400 transition-opacity duration-200 ${darkMode ? "opacity-0" : "opacity-40"}`} />
      </div>

      <motion.div
        className="absolute left-1 w-6 h-6 bg-white dark:bg-navy-950 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center border border-navy-150 dark:border-navy-800"
        animate={{
          x: darkMode ? 24 : 0,
          rotate: darkMode ? 360 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 24,
        }}
      >
        {darkMode ? (
          <Moon className="w-3.5 h-3.5 text-gold-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </motion.div>
    </button>
  );
};

