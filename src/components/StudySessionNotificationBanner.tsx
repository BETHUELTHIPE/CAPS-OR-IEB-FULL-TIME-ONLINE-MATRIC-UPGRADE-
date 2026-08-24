import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Clock,
  Sparkles,
  Play,
  X,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Calendar,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Check
} from "lucide-react";
import {
  UpcomingSessionNotification,
  fireWebPushNotification,
  playNotificationChime,
  markSessionNotified
} from "../lib/notificationService";

export interface StudySessionNotificationBannerProps {
  notification: UpcomingSessionNotification | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onNavigateToSession?: () => void;
}

export const StudySessionNotificationBanner: React.FC<StudySessionNotificationBannerProps> = ({
  notification,
  onDismiss,
  onSnooze,
  onNavigateToSession
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  useEffect(() => {
    if (!notification) return;

    const updateTimer = () => {
      const now = new Date();
      const diffMs = notification.sessionStartTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeftStr("Session is starting NOW!");
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;

      setTimeLeftStr(`${mins}m ${secs < 10 ? "0" : ""}${secs}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [notification]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-gradient-to-r from-navy-950 via-royal-950 to-navy-900 border-2 border-gold-400/80 rounded-3xl p-4 sm:p-5 shadow-2xl text-white backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Icon Badge */}
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-gold-400 shrink-0 animate-bounce">
            <Bell className="w-6 h-6" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 animate-spin" /> 10-MIN PRE-SESSION ALERT
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/20 text-royal-300 border border-royal-500/30">
                {notification.category}
              </span>
            </div>

            <h4 className="text-sm font-extrabold font-display text-white truncate">
              {notification.sessionTitle}
            </h4>

            <p className="text-xs text-slate-300 font-sans flex items-center gap-1.5">
              <span>Scheduled for <strong className="text-gold-300 font-mono">{notification.startTimeLabel}</strong> ({notification.dayAssigned})</span>
            </p>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-gold-300 border border-amber-500/40 text-xs font-mono font-bold mt-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Starts in: {timeLeftStr}</span>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audio Chime Fired • Desktop Push Sent</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSnooze(5)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Snooze 5m
            </button>

            {onNavigateToSession && (
              <button
                onClick={() => {
                  onNavigateToSession();
                  onDismiss();
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-400 text-navy-950 hover:from-amber-400 hover:to-gold-300 font-extrabold text-xs font-mono shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
