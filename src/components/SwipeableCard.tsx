import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "motion/react";
import { Trash2, CheckCircle2, ChevronDown, ChevronUp, GripHorizontal, Sparkles } from "lucide-react";

export interface SwipeableCardProps {
  id: string;
  children: React.ReactNode;
  details?: React.ReactNode;
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
  dismissText?: string;
  completeText?: string;
  allowExpand?: boolean;
  className?: string;
  showGestureHints?: boolean;
}

/**
 * Mobile-First Framer Motion Swipeable Card with touch gestures:
 * - Drag Left: Trigger dismiss / deletion with red feedback indicator
 * - Drag Right: Trigger completion / action with green feedback indicator
 * - Tap / Expand button: Toggle detailed insight drawer with smooth height animation
 */
export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  id,
  children,
  details,
  onDismiss,
  onComplete,
  dismissText = "Dismiss",
  completeText = "Complete",
  allowExpand = true,
  className = "",
  showGestureHints = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Motion values for smooth drag mechanics & background opacity
  const x = useMotionValue(0);
  
  // Transform drag offset to indicator background opacity and scale
  const leftBgOpacity = useTransform(x, [-120, -30, 0], [1, 0.4, 0]);
  const rightBgOpacity = useTransform(x, [0, 30, 120], [0, 0.4, 1]);
  const leftIconScale = useTransform(x, [-120, -50, 0], [1.2, 0.9, 0.5]);
  const rightIconScale = useTransform(x, [0, 50, 120], [0.5, 0.9, 1.2]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Threshold check for swipe left (Dismiss)
    if (offset < -90 || velocity < -400) {
      if (onDismiss) {
        setIsDismissed(true);
        setTimeout(() => {
          onDismiss(id);
        }, 300);
      }
    } 
    // Threshold check for swipe right (Complete / Action)
    else if (offset > 90 || velocity > 400) {
      if (onComplete) {
        onComplete(id);
      } else if (allowExpand && details) {
        setIsExpanded(prev => !prev);
      }
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative rounded-2xl overflow-hidden select-none touch-pan-y ${className}`}
    >
      {/* BACKGROUND SWIPE ACTION INDICATORS */}
      {/* Left Swipe Indicator (Red Deletion / Dismissal) */}
      <motion.div
        style={{ opacity: leftBgOpacity }}
        className="absolute inset-0 bg-red-500/90 dark:bg-red-600/90 text-white flex items-center justify-end px-6 font-bold text-xs gap-2 z-0 rounded-2xl"
      >
        <span className="font-mono uppercase tracking-wider">{dismissText}</span>
        <motion.div style={{ scale: leftIconScale }}>
          <Trash2 className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Right Swipe Indicator (Green Completion / Action) */}
      <motion.div
        style={{ opacity: rightBgOpacity }}
        className="absolute inset-0 bg-emerald-500/90 dark:bg-emerald-600/90 text-white flex items-center justify-start px-6 font-bold text-xs gap-2 z-0 rounded-2xl"
      >
        <motion.div style={{ scale: rightIconScale }}>
          <CheckCircle2 className="w-5 h-5" />
        </motion.div>
        <span className="font-mono uppercase tracking-wider">{completeText}</span>
      </motion.div>

      {/* DRAGGABLE FOREGROUND CARD CONTENT */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: onDismiss ? -120 : 0, right: onComplete ? 120 : (allowExpand && details ? 80 : 0) }}
        dragElastic={0.25}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.99, cursor: "grabbing" }}
        className="relative z-10 bg-white dark:bg-navy-950/90 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-grab"
      >
        {/* Touch Handle & Hint Indicator */}
        {showGestureHints && (
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-navy-500 pb-2 mb-2 border-b border-slate-100 dark:border-navy-850">
            <div className="flex items-center gap-1.5">
              <GripHorizontal className="w-3.5 h-3.5 text-royal-500 dark:text-gold-400" />
              <span className="hidden sm:inline">Swipe card left/right for quick actions</span>
              <span className="sm:hidden">Swipe to interact</span>
            </div>
            {details && allowExpand && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 hover:bg-royal-50 dark:hover:bg-navy-700 text-royal-600 dark:text-gold-400 font-bold transition-colors cursor-pointer"
              >
                <span>{isExpanded ? "Collapse" : "Details"}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}

        {/* Card Main Body */}
        <div>{children}</div>

        {/* Expandable Details Drawer */}
        <AnimatePresence>
          {isExpanded && details && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-100 dark:border-navy-850 pt-3"
            >
              <div className="p-3.5 bg-slate-50/80 dark:bg-navy-900/80 rounded-xl border border-slate-200/60 dark:border-navy-800 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-royal-600 dark:text-gold-400 font-mono text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Detailed Mathematical Insight</span>
                </div>
                {details}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
