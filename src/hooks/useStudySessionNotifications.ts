import { useState, useEffect, useCallback } from "react";
import {
  UpcomingSessionNotification,
  calculateUpcomingNotifications,
  fireWebPushNotification,
  markSessionNotified,
  loadNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  STORAGE_KEYS
} from "../lib/notificationService";

export function useStudySessionNotifications() {
  const [activeBannerNotification, setActiveBannerNotification] =
    useState<UpcomingSessionNotification | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());

  const checkNotifications = useCallback(() => {
    try {
      const settings = loadNotificationSettings();
      if (!settings.enabled) return;

      const rawPlanner = localStorage.getItem(STORAGE_KEYS.PLANNER);
      if (!rawPlanner) return;

      const sessions = JSON.parse(rawPlanner);
      if (!Array.isArray(sessions) || sessions.length === 0) return;

      const now = new Date();
      const calculated = calculateUpcomingNotifications(sessions, settings, now);

      // Find any notification that should trigger right now
      const triggerItem = calculated.find((item) => item.shouldTriggerNow);

      if (triggerItem) {
        // Mark as notified in storage
        markSessionNotified(triggerItem.sessionId, triggerItem.dateStr);

        // Fire browser web push notification
        fireWebPushNotification(
          `⏰ 10-Min Session Reminder: ${triggerItem.category}`,
          `Your '${triggerItem.sessionTitle}' session starts in 10 minutes at ${triggerItem.startTimeLabel} (${triggerItem.dayAssigned}). Get your formula sheet ready!`,
          `amh-session-${triggerItem.sessionId}-${triggerItem.dateStr}`
        );

        // Show in-app banner alert
        setActiveBannerNotification(triggerItem);
      }
    } catch (err) {
      console.error("Error during study notification scan:", err);
    }
  }, []);

  // Interval scanner running every 10 seconds
  useEffect(() => {
    checkNotifications(); // Initial check
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  // Handle storage updates when user updates planner
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PLANNER || e.key === STORAGE_KEYS.SETTINGS) {
        checkNotifications();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkNotifications]);

  const dismissBanner = () => {
    setActiveBannerNotification(null);
  };

  const snoozeBanner = (minutes: number = 5) => {
    setActiveBannerNotification(null);
    // Re-trigger banner after snooze minutes
    setTimeout(() => {
      if (activeBannerNotification) {
        setActiveBannerNotification(activeBannerNotification);
        fireWebPushNotification(
          `⏰ Snoozed Reminder: ${activeBannerNotification.category}`,
          `Snooze ended! '${activeBannerNotification.sessionTitle}' is starting shortly.`,
          `amh-snooze-${activeBannerNotification.sessionId}`
        );
      }
    }, minutes * 60 * 1000);
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    return res;
  };

  return {
    activeBannerNotification,
    dismissBanner,
    snoozeBanner,
    permission,
    requestPermission: handleRequestPermission,
    checkNotifications
  };
}
