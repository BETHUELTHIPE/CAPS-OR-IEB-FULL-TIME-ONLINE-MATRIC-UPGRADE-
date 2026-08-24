import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Trophy, 
  Award, 
  Zap, 
  Star, 
  Sparkles, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  ShieldAlert, 
  PartyPopper
} from "lucide-react";
import { ToastItem, AMH_TOAST_EVENT } from "../lib/toast";
import { CelebrationConfetti } from "./CelebrationConfetti";

export const ToastNotificationManager: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        const newToast = customEvent.detail;
        setToasts(prev => [newToast, ...prev.slice(0, 3)]); // Keep max 4 visible toasts
      }
    };

    window.addEventListener(AMH_TOAST_EVENT, handleToastEvent);
    return () => {
      window.removeEventListener(AMH_TOAST_EVENT, handleToastEvent);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAction = (toast: ToastItem) => {
    if (toast.actionTab) {
      // Dispatch custom tab navigation event if listener exists
      window.dispatchEvent(new CustomEvent("amhNavigateTab", { detail: toast.actionTab }));
      
      // Also scroll to element if available
      const targetElem = document.getElementById(`tab-${toast.actionTab}`);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: "smooth" });
      }
    }
    dismissToast(toast.id);
  };

  return (
    <>
      <CelebrationConfetti />
      <aside 
        aria-label="Academic Milestone & Streak Notifications" 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastCard 
              key={toast.id} 
              toast={toast} 
              onDismiss={() => dismissToast(toast.id)} 
              onAction={() => handleAction(toast)}
            />
          ))}
        </AnimatePresence>
      </aside>
    </>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
  onAction: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss, onAction }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 6000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, onDismiss]);

  // Determine styles & icons based on type
  const getStyleProps = () => {
    switch (toast.type) {
      case "curriculum_milestone":
        return {
          cardBg: "bg-gradient-to-br from-navy-950 via-amber-950 to-royal-950 border-2 border-gold-400 shadow-2xl shadow-amber-500/30",
          iconBg: "bg-gradient-to-tr from-amber-500 to-gold-300 text-navy-950 ring-4 ring-gold-400/40",
          icon: <PartyPopper className="w-6 h-6 animate-bounce fill-navy-950 text-navy-950" />,
          badgeBg: "bg-gold-500/20 text-gold-300 border border-gold-500/40 font-black",
          progressBarBg: "bg-gradient-to-r from-amber-400 via-gold-400 to-emerald-400"
        };
      case "streak":
        return {
          cardBg: "bg-gradient-to-br from-navy-950 via-navy-900 to-amber-950 border-2 border-gold-500 shadow-2xl shadow-amber-500/20",
          iconBg: "bg-gradient-to-tr from-amber-600 to-gold-400 text-navy-950 ring-4 ring-gold-500/30",
          icon: <Flame className="w-6 h-6 animate-pulse fill-navy-950 text-navy-950" />,
          badgeBg: "bg-gold-500/20 text-gold-300 border border-gold-500/30",
          progressBarBg: "bg-gradient-to-r from-amber-500 to-gold-400"
        };
      case "distinction":
        return {
          cardBg: "bg-gradient-to-br from-navy-950 via-royal-950 to-emerald-950 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/20",
          iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-400 text-navy-950 ring-4 ring-emerald-400/30",
          icon: <Trophy className="w-6 h-6 text-navy-950 fill-navy-950" />,
          badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
          progressBarBg: "bg-gradient-to-r from-emerald-400 to-teal-300"
        };
      case "milestone":
      case "badge":
        return {
          cardBg: "bg-gradient-to-br from-navy-950 via-royal-950 to-navy-900 border-2 border-royal-400 dark:border-gold-400 shadow-2xl shadow-royal-500/20",
          iconBg: "bg-gradient-to-tr from-royal-500 to-gold-400 text-navy-950 ring-4 ring-gold-400/30",
          icon: <Award className="w-6 h-6 text-navy-950 fill-navy-950" />,
          badgeBg: "bg-royal-500/20 text-gold-300 border border-gold-400/30",
          progressBarBg: "bg-gradient-to-r from-royal-400 to-gold-400"
        };
      default:
        return {
          cardBg: "bg-navy-900 border border-navy-700 text-white shadow-xl",
          iconBg: "bg-royal-600 text-white",
          icon: <Sparkles className="w-6 h-6" />,
          badgeBg: "bg-navy-800 text-navy-200 border border-navy-700",
          progressBarBg: "bg-royal-500"
        };
    }
  };

  const style = getStyleProps();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`relative rounded-2xl overflow-hidden p-4 text-white pointer-events-auto ${style.cardBg}`}
    >
      {/* Decorative Sparkle Background Effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-navy-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title="Dismiss Notification"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3.5 pr-6">
        {/* Animated Icon Avatar */}
        <div className="shrink-0 relative">
          <div className={`p-2.5 rounded-2xl shadow-lg flex items-center justify-center ${style.iconBg}`}>
            {style.icon}
          </div>
          {toast.type === "streak" && (
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-navy-950 font-black text-[9px] px-1 rounded-full border border-amber-200 shadow">
              {toast.streakCount || 7}d
            </span>
          )}
          {toast.type === "curriculum_milestone" && toast.milestonePercent && (
            <span className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-gold-300 text-navy-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-gold-200 shadow-md font-mono animate-pulse">
              {toast.milestonePercent}%
            </span>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badgeBg}`}>
              {toast.milestoneTitle || "Academic Milestone"}
            </span>
            <span className="text-[10px] text-navy-400 font-mono">Just now</span>
          </div>

          <h4 className="text-sm font-black font-display text-white leading-tight mb-1">
            {toast.title}
          </h4>

          <p className="text-xs text-navy-200 dark:text-navy-300 leading-snug mb-2 font-sans">
            {toast.message}
          </p>

          {/* Reward pill if provided */}
          {toast.rewardText && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-[11px] font-mono text-gold-300 font-bold mb-2">
              <PartyPopper className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span>Reward: {toast.rewardText}</span>
            </div>
          )}

          {/* CTA Action button */}
          {toast.actionLabel && (
            <button
              onClick={onAction}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold font-mono text-gold-400 hover:text-gold-300 hover:underline cursor-pointer group"
            >
              <span>{toast.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Timer */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 overflow-hidden">
        <div 
          className={`h-full transition-all duration-75 ease-linear ${style.progressBarBg}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
