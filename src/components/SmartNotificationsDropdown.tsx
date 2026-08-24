import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Trophy, 
  Award, 
  Sparkles, 
  X, 
  ChevronRight, 
  Calendar, 
  FileText, 
  ExternalLink,
  Flame,
  Check,
  Zap,
  BookOpen
} from "lucide-react";
import { Profile } from "../types";

export interface SmartNotification {
  id: string;
  type: "quiz" | "feedback" | "milestone" | "session";
  title: string;
  message: string;
  timestamp: string; // ISO or relative
  read: boolean;
  dueDate?: string;
  tutorName?: string;
  actionUrl?: string;
  badgeLabel?: string;
}

const DEFAULT_SMART_NOTIFICATIONS: SmartNotification[] = [
  {
    id: "notif-quiz-1",
    type: "quiz",
    title: "Upcoming Quiz Due Date",
    message: "CAPS Grade 12 Calculus Weekly Practice Quiz is due tomorrow at 23:59 SAST.",
    timestamp: "2 hours ago",
    read: false,
    dueDate: "Tomorrow, 23:59 SAST",
    actionUrl: "/dashboard",
    badgeLabel: "Quiz Due Soon"
  },
  {
    id: "notif-feedback-1",
    type: "feedback",
    title: "New Feedback from Tutor Mr. Khumalo",
    message: "Your Paper 1 First Principles homework scan has been reviewed. 'Great step-by-step work! Check line 4 for negative bracket distribution.'",
    timestamp: "4 hours ago",
    read: false,
    tutorName: "Mr. Khumalo",
    actionUrl: "/dashboard",
    badgeLabel: "Homework Grade: 90%"
  },
  {
    id: "notif-milestone-1",
    type: "milestone",
    title: "Milestone Achievement Unlocked!",
    message: "Congratulations! You earned the 'Calculus Wizard' badge by completing 5 consecutive derivative drills with >85% accuracy.",
    timestamp: "1 day ago",
    read: false,
    actionUrl: "/dashboard",
    badgeLabel: "🏆 Level Up"
  },
  {
    id: "notif-milestone-2",
    type: "milestone",
    title: "7-Day Study Streak Reached 🔥",
    message: "You've logged into Amaris Mathematics Hub for 7 consecutive days! Keep the momentum going for trial exam prep.",
    timestamp: "2 days ago",
    read: true,
    actionUrl: "/dashboard",
    badgeLabel: "🔥 7-Day Streak"
  },
  {
    id: "notif-quiz-2",
    type: "quiz",
    title: "Trigonometry Identities Drill Due",
    message: "Grade 11 Paper 2 Double Angle Reduction Formula quiz due in 3 days.",
    timestamp: "2 days ago",
    read: true,
    dueDate: "In 3 Days",
    actionUrl: "/dashboard",
    badgeLabel: "Trig Drill"
  }
];

export interface SmartNotificationsDropdownProps {
  user: Profile | null;
}

export const SmartNotificationsDropdown: React.FC<SmartNotificationsDropdownProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "quiz" | "feedback" | "milestone">("all");

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("amh_smart_notifications");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setNotifications(DEFAULT_SMART_NOTIFICATIONS);
  }, []);

  // Save changes
  const saveNotifications = (updated: SmartNotification[]) => {
    setNotifications(updated);
    localStorage.setItem("amh_smart_notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  // Mark single as read
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  // Delete notification
  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  // Simulate receiving a test notification
  const handleAddTestNotification = () => {
    const newNotif: SmartNotification = {
      id: `notif-test-${Date.now()}`,
      type: "feedback",
      title: "New Feedback from Tutor Sarah",
      message: "Tutor Sarah commented on your Video Request: 'Excellent explanation of tangent perpendicular to radius in Euclidean Geometry!'",
      timestamp: "Just now",
      read: false,
      tutorName: "Tutor Sarah",
      actionUrl: "/dashboard",
      badgeLabel: "Video Approved"
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    return n.type === activeTab;
  });

  // Icon switcher for types
  const getTypeIcon = (type: SmartNotification["type"]) => {
    switch (type) {
      case "quiz":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "feedback":
        return <MessageSquare className="w-4 h-4 text-royal-500 dark:text-gold-400" />;
      case "milestone":
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      case "session":
        return <Bell className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-850 rounded-xl transition-all relative cursor-pointer group"
        title="Smart Notifications (Quiz due dates, tutor feedback & milestones)"
        aria-label="Smart Notifications"
      >
        <Bell className={`w-5 h-5 transition-transform group-hover:scale-110 ${unreadCount > 0 ? "text-amber-500 animate-bounce" : ""}`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-mono font-black rounded-full ring-2 ring-white dark:ring-navy-900 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 rounded-3xl shadow-2xl z-50 text-left overflow-hidden text-navy-900 dark:text-white"
          >
            {/* DROPDOWN HEADER */}
            <div className="p-4 bg-gradient-to-r from-navy-900 to-royal-950 text-white flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-gold-400 rounded-xl border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-display text-white">Smart Notifications</h3>
                  <p className="text-[10px] text-navy-300 font-mono">Quizzes, Tutor Feedback & Milestones</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-mono font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-navy-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CATEGORY FILTER TABS */}
            <div className="flex items-center justify-between px-3 py-2 bg-navy-50 dark:bg-navy-950 border-b border-navy-150 dark:border-navy-800 text-[11px] font-mono overflow-x-auto">
              {[
                { id: "all", label: `All (${notifications.length})` },
                { id: "quiz", label: "Quizzes" },
                { id: "feedback", label: "Tutor Feedback" },
                { id: "milestone", label: "Milestones" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950"
                      : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* NOTIFICATION LIST */}
            <div className="max-h-80 overflow-y-auto divide-y divide-navy-100 dark:divide-navy-800">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-navy-400 space-y-2">
                  <Bell className="w-8 h-8 text-navy-300 dark:text-navy-600 mx-auto" />
                  <p className="text-xs font-bold">No notifications in this tab</p>
                  <p className="text-[10px]">Upcoming due dates and tutor updates will appear here.</p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id)}
                    className={`p-4 transition-colors cursor-pointer relative group flex items-start gap-3 ${
                      !n.read 
                        ? "bg-royal-50/70 dark:bg-royal-950/30 font-semibold" 
                        : "hover:bg-navy-50 dark:hover:bg-navy-850/60"
                    }`}
                  >
                    {/* Unread Indicator Bar */}
                    {!n.read && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                    )}

                    {/* Icon Avatar */}
                    <div className="p-2 rounded-xl bg-navy-100 dark:bg-navy-800 shrink-0 mt-0.5">
                      {getTypeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-navy-900 dark:text-white leading-snug">
                          {n.title}
                        </span>
                        {n.badgeLabel && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 shrink-0">
                            {n.badgeLabel}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed font-sans">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-navy-400 pt-1">
                        <span>{n.timestamp}</span>
                        {!n.read && (
                          <span className="text-amber-500 font-bold">Unread</span>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteNotification(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-navy-400 hover:text-rose-500 p-1 rounded"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* DROPDOWN FOOTER ACTIONS */}
            <div className="p-3 bg-navy-50 dark:bg-navy-950 border-t border-navy-150 dark:border-navy-800 flex items-center justify-between text-xs">
              <button
                onClick={handleAddTestNotification}
                className="text-[10px] font-mono font-bold text-royal-600 dark:text-gold-400 hover:underline cursor-pointer"
              >
                + Test Tutor Feedback Alert
              </button>

              <span className="text-[10px] text-navy-400 font-mono">
                AMH Smart Alerts Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
