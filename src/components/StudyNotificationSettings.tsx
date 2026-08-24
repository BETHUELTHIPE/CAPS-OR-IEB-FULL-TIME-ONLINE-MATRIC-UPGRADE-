import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  BellRing,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  ShieldCheck,
  Send,
  Zap,
  Calendar,
  Check,
  ChevronRight,
  RefreshCw,
  Info
} from "lucide-react";
import {
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  fireWebPushNotification,
  calculateUpcomingNotifications,
  UpcomingSessionNotification,
  STORAGE_KEYS
} from "../lib/notificationService";

export interface StudyNotificationSettingsProps {
  onClose?: () => void;
  className?: string;
}

export const StudyNotificationSettings: React.FC<StudyNotificationSettingsProps> = ({
  onClose,
  className = ""
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [testSentMessage, setTestSentMessage] = useState<boolean>(false);
  const [upcomingList, setUpcomingList] = useState<UpcomingSessionNotification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Read scheduled sessions from localStorage and calculate upcoming notifications
  const refreshUpcomingSchedule = () => {
    setIsRefreshing(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLANNER);
      const sessions = raw ? JSON.parse(raw) : [];
      const calculated = calculateUpcomingNotifications(sessions, settings);
      setUpcomingList(calculated);
    } catch (e) {
      console.error("Error reading study planner for notifications:", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  useEffect(() => {
    refreshUpcomingSchedule();
  }, [settings]);

  // Request Notification Permission
  const handleEnablePermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === "granted") {
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
      // Fire instant welcome notification
      fireWebPushNotification(
        "🔔 Push Notifications Enabled!",
        "Amaris Mathematics Hub will notify you 10 minutes before every scheduled study session.",
        "amh-welcome-push"
      );
    }
  };

  // Toggle notification state
  const handleToggleEnabled = (val: boolean) => {
    const updated = { ...settings, enabled: val };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  // Change offset minutes
  const handleOffsetChange = (mins: number) => {
    const updated = { ...settings, offsetMinutes: mins };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  // Fire Test Push Notification
  const handleTestPushNotification = () => {
    setTestSentMessage(true);

    fireWebPushNotification(
      "⏰ TEST 10-MIN SESSION REMINDER",
      "Calculus First Principles & Power Rule Drill starts in 10 minutes at 08:00 (Monday)! Get your worksheet ready.",
      "amh-test-push-notification"
    );

    setTimeout(() => {
      setTestSentMessage(false);
    }, 4000);
  };

  const isSupported = isNotificationSupported();

  return (
    <div className={`bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 ${className}`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-gold-400">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                Pre-Session Push Notifications
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/15 text-royal-600 dark:text-royal-300 border border-royal-500/30">
                10-Min Alerts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Never miss a scheduled Mathematics study session defined in your Weekly Planner.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* PERMISSION STATUS CARD */}
      <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-navy-900/60 border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {permission === "granted" ? (
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : permission === "denied" ? (
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Browser Permission:{" "}
                <span
                  className={
                    permission === "granted"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : permission === "denied"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {permission === "granted"
                    ? "ACTIVE (Granted 🟢)"
                    : permission === "denied"
                    ? "BLOCKED (Denied 🔴)"
                    : "NOT ENABLED (Default 🟡)"}
                </span>
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              {permission === "granted"
                ? "Your browser is fully configured to receive background desktop push notifications 10 minutes before study sessions."
                : permission === "denied"
                ? "Push notifications are blocked by browser settings. Click lock icon in browser address bar to allow notifications."
                : "Grant browser permission so AMH can alert you before your Mathematics sessions start."}
            </p>
          </div>
        </div>

        {permission !== "granted" && isSupported && (
          <button
            onClick={handleEnablePermission}
            className="px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-mono font-bold shadow-md transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Enable Push Notifications</span>
          </button>
        )}
      </div>

      {/* NOTIFICATION TIMING & CONFIGURATION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Timing Offset Box */}
        <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-navy-900/40 border-slate-200 dark:border-navy-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-royal-500" /> Alert Timing Offset
            </span>
            <span className="text-[10px] font-mono font-extrabold text-gold-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Default: 10 Mins
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "5 Mins", value: 5 },
              { label: "10 Mins", value: 10 },
              { label: "15 Mins", value: 15 },
              { label: "At Start", value: 0 }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleOffsetChange(opt.value)}
                className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  settings.offsetMinutes === opt.value
                    ? "bg-royal-600 text-white border-royal-600 shadow-xs"
                    : "bg-white dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-royal-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            AMH triggers browser push alerts {settings.offsetMinutes} minutes before your scheduled slot.
          </p>
        </div>

        {/* Instant Test Push Button */}
        <div className="p-4 rounded-2xl border bg-gradient-to-br from-amber-500/10 to-royal-600/10 border-amber-500/30 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Test Push Notification
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Instant Verification
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans mt-1">
              Click to fire an immediate test 10-minute alert popup with audio chime.
            </p>
          </div>

          <button
            onClick={handleTestPushNotification}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-400 hover:from-amber-400 hover:to-gold-300 text-navy-950 font-extrabold text-xs font-mono shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Test 10-Min Push Notification Now</span>
          </button>

          {testSentMessage && (
            <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 text-center animate-pulse">
              ✓ Test notification & audio chime dispatched! Check your screen top/corner.
            </p>
          )}
        </div>
      </div>

      {/* UPCOMING SCHEDULED ALERT PREVIEW TABLE */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-royal-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Upcoming 10-Min Alert Schedule
            </h4>
          </div>

          <button
            onClick={refreshUpcomingSchedule}
            className="text-[11px] font-mono text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {upcomingList.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-navy-800 text-slate-400 space-y-1">
            <Info className="w-6 h-6 mx-auto text-slate-400 opacity-60" />
            <p className="text-xs font-mono">No active study sessions scheduled in Weekly Planner for the current week.</p>
            <p className="text-[11px] text-slate-500">Add sessions to your Weekly Planner to automatically register 10-minute push alerts.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {upcomingList.map((item) => (
              <div
                key={`${item.sessionId}_${item.dayAssigned}_${item.timeSlotId}`}
                className="p-3 rounded-2xl border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-2 rounded-xl bg-royal-500/10 text-royal-600 dark:text-royal-300 font-mono font-bold shrink-0">
                    {item.startTimeLabel}
                  </span>
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white truncate">
                      {item.sessionTitle}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {item.dayAssigned} • Category: {item.category}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-gold-400 border border-amber-500/30 block">
                    Alert at {item.notificationTriggerTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                    ({settings.offsetMinutes} mins before)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
