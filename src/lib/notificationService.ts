// Amaris Mathematics Hub - Web Push Notification Engine
// Handles 10-minute pre-session alerts for Weekly Study Planner

export interface NotificationSettings {
  enabled: boolean;
  offsetMinutes: number; // default 10
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  autoDismissSecs: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  offsetMinutes: 10,
  soundEnabled: true,
  vibrateEnabled: true,
  autoDismissSecs: 15
};

// Key names for localStorage
export const STORAGE_KEYS = {
  SETTINGS: "amh_push_notification_settings_v1",
  NOTIFIED_LOGS: "amh_notified_sessions_log_v1",
  PLANNER: "amh_weekly_study_planner"
};

/**
 * Check if Web Notifications are supported in the current browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "denied";
  }
}

/**
 * Synthesize a soft dual-tone chime using Web Audio API
 */
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: E5 (659.25 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, now + 0.15);
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn("Audio Context playback error:", e);
  }
}

/**
 * Load user notification settings from localStorage
 */
export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("Error loading notification settings:", e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Save user notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Error saving notification settings:", e);
  }
}

/**
 * Check if a session has already been notified for a specific date
 */
export function isSessionNotified(sessionId: string, dateStr: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED_LOGS);
    if (raw) {
      const logs: Record<string, boolean> = JSON.parse(raw);
      return !!logs[`${sessionId}_${dateStr}`];
    }
  } catch (e) {
    console.error("Error reading notified logs:", e);
  }
  return false;
}

/**
 * Mark a session as notified for a specific date
 */
export function markSessionNotified(sessionId: string, dateStr: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED_LOGS);
    const logs: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    logs[`${sessionId}_${dateStr}`] = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFIED_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error("Error writing notified logs:", e);
  }
}

/**
 * Time Slot mapping to start times
 */
export const TIME_SLOT_START_TIMES: Record<string, { hour: number; minute: number; label: string }> = {
  "slot-0800": { hour: 8, minute: 0, label: "08:00" },
  "slot-1000": { hour: 10, minute: 0, label: "10:00" },
  "slot-1400": { hour: 14, minute: 0, label: "14:00" },
  "slot-1600": { hour: 16, minute: 0, label: "16:00" },
  "slot-1800": { hour: 18, minute: 0, label: "18:00" },
  "slot-2000": { hour: 20, minute: 0, label: "20:00" }
};

/**
 * Map Day Name ("Monday", "Tuesday", etc.) to Date object for the current week
 */
export function getTargetDateForDay(dayName: string, now: Date = new Date()): Date {
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };

  const targetDayNum = dayMap[dayName] ?? 1;
  const currentDayNum = now.getDay();
  
  const diffDays = targetDayNum - currentDayNum;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diffDays);
  return targetDate;
}

export interface UpcomingSessionNotification {
  sessionId: string;
  sessionTitle: string;
  category: string;
  dayAssigned: string;
  timeSlotId: string;
  startTimeLabel: string;
  sessionStartTime: Date;
  notificationTriggerTime: Date;
  minutesUntilSession: number;
  minutesUntilTrigger: number;
  shouldTriggerNow: boolean;
  dateStr: string;
}

/**
 * Parse all scheduled sessions in the planner and calculate trigger times
 */
export function calculateUpcomingNotifications(
  sessions: any[],
  settings: NotificationSettings = loadNotificationSettings(),
  now: Date = new Date()
): UpcomingSessionNotification[] {
  const results: UpcomingSessionNotification[] = [];

  if (!Array.isArray(sessions)) return results;

  const dateStrToday = now.toISOString().split("T")[0];

  for (const session of sessions) {
    if (!session.dayAssigned || !session.timeSlotId) continue;

    const slotInfo = TIME_SLOT_START_TIMES[session.timeSlotId] || { hour: 8, minute: 0, label: "08:00" };
    const targetDate = getTargetDateForDay(session.dayAssigned, now);
    
    // Set exact start time
    targetDate.setHours(slotInfo.hour, slotInfo.minute, 0, 0);

    const sessionStartTime = targetDate;
    const notificationTriggerTime = new Date(sessionStartTime.getTime() - settings.offsetMinutes * 60 * 1000);

    const diffMsSession = sessionStartTime.getTime() - now.getTime();
    const diffMsTrigger = notificationTriggerTime.getTime() - now.getTime();

    const minutesUntilSession = Math.round(diffMsSession / (1000 * 60));
    const minutesUntilTrigger = Math.round(diffMsTrigger / (1000 * 60));

    const dateStr = sessionStartTime.toISOString().split("T")[0];

    // Trigger condition: current time is at or past trigger time, but BEFORE session start time (or within 5 mins past start)
    const shouldTriggerNow =
      settings.enabled &&
      diffMsSession > -5 * 60 * 1000 && // Session not ended yet
      diffMsTrigger <= 0 && // Passed trigger time
      !isSessionNotified(session.id, dateStr);

    results.push({
      sessionId: session.id,
      sessionTitle: session.title,
      category: session.category,
      dayAssigned: session.dayAssigned,
      timeSlotId: session.timeSlotId,
      startTimeLabel: slotInfo.label,
      sessionStartTime,
      notificationTriggerTime,
      minutesUntilSession,
      minutesUntilTrigger,
      shouldTriggerNow,
      dateStr
    });
  }

  // Sort by upcoming trigger time
  return results.sort((a, b) => a.notificationTriggerTime.getTime() - b.notificationTriggerTime.getTime());
}

/**
 * Trigger real Web Push Notification + Audio Chime
 */
export function fireWebPushNotification(
  title: string,
  body: string,
  tag: string = "amh-push-notification",
  onClickUrl?: string
) {
  // Play sound if supported
  playNotificationChime();

  if (isNotificationSupported() && Notification.permission === "granted") {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: "/icon.png",
            badge: "/icon.png",
            tag,
            renotify: true,
            requireInteraction: true,
            data: { url: onClickUrl || window.location.href }
          } as NotificationOptions);
        });
      } else {
        const notif = new Notification(title, {
          body,
          icon: "/icon.png",
          tag,
          requireInteraction: true
        });

        notif.onclick = (e) => {
          e.preventDefault();
          window.focus();
          if (onClickUrl) {
            window.location.href = onClickUrl;
          }
          notif.close();
        };
      }
    } catch (e) {
      console.error("Error delivering Web Push Notification:", e);
    }
  }
}
