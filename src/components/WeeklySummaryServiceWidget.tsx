import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Award, 
  RefreshCw, 
  Eye, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  X,
  FileText,
  Zap,
  Sliders,
  Play,
  Pause,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { Profile } from "../types";

export interface WeeklySummaryServiceWidgetProps {
  user?: Profile | null;
}

interface CronStatusData {
  enabled: boolean;
  schedule: string;
  timezone: string;
  lastRun: string | null;
  totalDispatched: number;
  activeStudentsCount: number;
  nextScheduledEstimate: string;
  transportMethod: string;
}

export const WeeklySummaryServiceWidget: React.FC<WeeklySummaryServiceWidgetProps> = ({ user }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cronStatus, setCronStatus] = useState<CronStatusData | null>(null);
  const [loadingCron, setLoadingCron] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<boolean>(false);
  const [selectedSchedulePreset, setSelectedSchedulePreset] = useState<string>("0 18 * * 0");
  const [customCronInput, setCustomCronInput] = useState<string>("0 18 * * 0");

  const [testEmail, setTestEmail] = useState<string>(user?.email || "bethuelmoukangwe8@gmail.com");
  const [testName, setTestName] = useState<string>(user ? `${user.first_name} ${user.surname}` : "Bethuel Moukangwe");
  const [testHoursStudied, setTestHoursStudied] = useState<number>(14.5);
  const [sendingSingle, setSendingSingle] = useState<boolean>(false);
  const [sendingBulk, setSendingBulk] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [selectedLogPreview, setSelectedLogPreview] = useState<any | null>(null);

  // Load email logs from server
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Error loading notification logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cron status
  const fetchCronStatus = async () => {
    setLoadingCron(true);
    try {
      const res = await fetch("/api/notifications/cron-status");
      if (res.ok) {
        const data = await res.json();
        setCronStatus(data);
        setSelectedSchedulePreset(data.schedule);
        setCustomCronInput(data.schedule);
      }
    } catch (err) {
      console.error("Error loading cron status:", err);
    } finally {
      setLoadingCron(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchCronStatus();
  }, []);

  // Update cron configuration
  const handleSaveCronConfig = async (newEnabled?: boolean) => {
    try {
      const scheduleToUse = selectedSchedulePreset === "custom" ? customCronInput : selectedSchedulePreset;
      const res = await fetch("/api/notifications/cron-configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule: scheduleToUse,
          enabled: newEnabled !== undefined ? newEnabled : cronStatus?.enabled
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: `Background Cron job updated successfully! Schedule: "${scheduleToUse}" (Active: ${newEnabled !== undefined ? newEnabled : cronStatus?.enabled})`
        });
        setEditingSchedule(false);
        fetchCronStatus();
      } else {
        throw new Error(data.error || "Failed to update cron configuration");
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to configure cron schedule"
      });
    }
  };

  // Dispatch single student weekly summary email
  const handleSendSingleSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testName) return;

    setSendingSingle(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/notifications/weekly-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id || "usr-student",
          studentName: testName,
          email: testEmail,
          grade: user?.grade || "Grade 12 NSC",
          totalHoursStudied: Number(testHoursStudied) || 14.5,
          overallMasteryScore: 84,
          newResourcesAdded: [
            { title: "Grade 12 CAPS Differential Calculus Optimization Worksheet 2026", category: "Calculus", type: "PDF Worksheet", dateAdded: "2026-07-28" },
            { title: "Compound Angle Reduction Formulas Summary Sheet", category: "Trigonometry", type: "Formula Sheet", dateAdded: "2026-07-29" },
            { title: "Grade 12 IEB Paper 1 Trial Mock Solutions", category: "Exams", type: "Worked Solution", dateAdded: "2026-07-30" }
          ],
          upcomingBookings: [
            { booking_reference: "AMH-BOOK-8821", lesson_date: "2026-08-02", lesson_time: "14:00 SAST", subject_name: "Grade 12 Calculus & Derivatives", platform: "Google Meet", meeting_link: "https://meet.google.com/amh-math-room1" },
            { booking_reference: "AMH-BOOK-8825", lesson_date: "2026-08-05", lesson_time: "16:30 SAST", subject_name: "Grade 12 Trigonometry Proofs", platform: "Google Meet", meeting_link: "https://meet.google.com/amh-math-room1" }
          ],
          studyGoals: [
            { title: "Quadratic Sequences & Series Equations", progress: 85, category: "Algebra", targetMastery: 90, milestoneDeadline: "Next Week" },
            { title: "Differential Calculus Limits & First Principles", progress: 90, category: "Calculus", targetMastery: 95, milestoneDeadline: "Sunday" },
            { title: "Compound Angle Trigonometric Identities", progress: 78, category: "Trigonometry", targetMastery: 85, milestoneDeadline: "Next Week" },
            { title: "Circle Equations & Tangents Slopes", progress: 68, category: "Geometry", targetMastery: 80, milestoneDeadline: "Upcoming" }
          ],
          newBadges: [
            { title: "Trig Titan 🏆", description: "Completed 20 compound angle proofs with 100% accuracy", category: "Trigonometry", xp: 250, rarity: "Rare", unlockedAt: new Date().toISOString() },
            { title: "7-Day Study Streak ⚡", description: "Logged into Amaris Hub for 7 consecutive days", category: "Streaks", xp: 150, rarity: "Common", unlockedAt: new Date().toISOString() }
          ],
          streakDays: 7,
          totalXP: 1450,
          recentActivitiesCount: 8,
          tutorCoachingTip: "Mastering first-principles limits and trigonometric reductions requires active problem solving. Keep uploading your step-by-step scans to the homework center!"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: `Weekly summary email successfully dispatched to ${testEmail}! (${data.log?.status === "sent" ? "Delivered via Real SMTP" : "Simulated Sandbox Delivery Logged"})`
        });
        fetchLogs();
      } else {
        throw new Error(data.error || "Failed to dispatch email");
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Email dispatch failed. Please verify SMTP setup."
      });
    } finally {
      setSendingSingle(false);
    }
  };

  // Trigger bulk weekly summary email for all students
  const handleTriggerBulkSummaries = async () => {
    setSendingBulk(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/notifications/trigger-all-weekly-summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: `Automated node-cron weekly batch executed successfully for ${data.count} registered students!`
        });
        fetchLogs();
        fetchCronStatus();
      } else {
        throw new Error(data.error || "Failed to trigger bulk weekly summaries");
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to trigger bulk weekly summaries"
      });
    } finally {
      setSendingBulk(false);
    }
  };

  // Filter logs specifically for weekly summary trigger
  const weeklyLogs = logs.filter(l => l.trigger_type === "weekly_summary");

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-navy-100 dark:border-navy-800">
        <div className="flex items-start gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-navy-900 to-black dark:from-gold-500 dark:to-amber-500 text-gold-400 dark:text-navy-950 font-black shadow-lg shrink-0">
            <Mail className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${
                cronStatus?.enabled
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}>
                <Zap className="w-3 h-3" />
                {cronStatus?.enabled ? "Automated Background Cron (Active)" : "Background Cron (Paused)"}
              </span>
              <span className="text-xs font-mono text-navy-500 dark:text-navy-400 font-bold">
                • {cronStatus?.schedule === "0 18 * * 0" ? "Sundays @ 18:00 SAST" : `Cron: ${cronStatus?.schedule || "0 18 * * 0"}`}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
                Timezone: Africa/Johannesburg
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-navy-900 dark:text-white">
              Weekly Progress & Badges Summary Background Job
            </h2>
            <p className="text-xs md:text-sm text-navy-600 dark:text-navy-300 max-w-2xl leading-relaxed">
              Scheduled background service using <strong className="text-navy-900 dark:text-white">node-cron</strong> &amp; <strong className="text-navy-900 dark:text-white">Nodemailer SMTP</strong> that emails comprehensive digests to students detailing their mastery progression, new badges earned, upcoming module goals, and tutoring slots.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-800 dark:text-navy-200 font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-royal-600 dark:text-gold-400" />
            <span>Preview Email Template</span>
          </button>

          <button
            onClick={handleTriggerBulkSummaries}
            disabled={sendingBulk}
            className="px-4 py-2.5 bg-gradient-to-r from-royal-600 to-royal-800 text-white font-extrabold text-xs rounded-2xl hover:opacity-95 shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${sendingBulk ? "animate-spin" : ""}`} />
            <span>{sendingBulk ? "Running Cron Batch..." : "Run Cron Batch Now"}</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK STATUS BANNER */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-navy-400 hover:text-navy-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* CRON SCHEDULER & SETTINGS CARD */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-navy-900 to-royal-950 text-white border border-navy-800 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500 text-navy-950 font-black">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold font-display text-sm md:text-base text-white">
                  Node-Cron Background Job Schedule
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  cronStatus?.enabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-red-500/20 text-red-300 border border-red-400/30"
                }`}>
                  {cronStatus?.enabled ? "Active" : "Paused"}
                </span>
              </div>
              <p className="text-xs text-navy-300">
                Pattern: <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-gold-400">{cronStatus?.schedule || "0 18 * * 0"}</code> • Timezone: <strong>{cronStatus?.timezone || "Africa/Johannesburg"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveCronConfig(!cronStatus?.enabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                cronStatus?.enabled
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30"
                  : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30"
              }`}
            >
              {cronStatus?.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{cronStatus?.enabled ? "Pause Job" : "Resume Job"}</span>
            </button>

            <button
              onClick={() => setEditingSchedule(!editingSchedule)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            >
              <Sliders className="w-3.5 h-3.5 text-gold-400" />
              <span>{editingSchedule ? "Cancel" : "Change Frequency"}</span>
            </button>
          </div>
        </div>

        {/* EDIT SCHEDULE CONTROLS */}
        <AnimatePresence>
          {editingSchedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-navy-750 flex flex-col md:flex-row items-start md:items-center gap-3 overflow-hidden"
            >
              <div className="flex-1 w-full space-y-1">
                <label className="text-[11px] font-mono uppercase text-navy-300 font-bold">Select Schedule Preset</label>
                <select
                  value={selectedSchedulePreset}
                  onChange={(e) => setSelectedSchedulePreset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-xs font-semibold text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="0 18 * * 0">Every Sunday at 18:00 SAST (Recommended)</option>
                  <option value="0 8 * * 0">Every Sunday at 08:00 SAST</option>
                  <option value="0 17 * * 5">Every Friday at 17:00 SAST</option>
                  <option value="*/10 * * * *">Every 10 Minutes (Testing / Verification)</option>
                  <option value="custom">Custom Cron Expression...</option>
                </select>
              </div>

              {selectedSchedulePreset === "custom" && (
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[11px] font-mono uppercase text-navy-300 font-bold">Custom Cron String (5 Fields)</label>
                  <input
                    type="text"
                    value={customCronInput}
                    onChange={(e) => setCustomCronInput(e.target.value)}
                    placeholder="e.g. 0 18 * * 0"
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-xs font-mono text-gold-400 focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}

              <div className="pt-5 flex items-center gap-2">
                <button
                  onClick={() => handleSaveCronConfig()}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold text-xs transition-all cursor-pointer shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GRID: MANUAL TEST DISPATCH & METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MANUAL DISPATCH FORM */}
        <div className="lg:col-span-2 bg-navy-50/80 dark:bg-navy-950/60 p-6 rounded-3xl border border-navy-100 dark:border-navy-850 space-y-4">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-gold-500" />
            <h3 className="text-base font-bold font-display text-navy-900 dark:text-white">
              Send Instant Weekly Digest (Test Dispatch)
            </h3>
          </div>
          <p className="text-xs text-navy-600 dark:text-navy-400">
            Dispatch a real-time weekly summary email to verify SMTP delivery and check formatting for mastery goals and earned badges.
          </p>

          <form onSubmit={handleSendSingleSummary} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. Bethuel Thipe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                Recipient Email Address *
              </label>
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="e.g. bethuelmoukangwe8@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono font-bold uppercase text-navy-500 dark:text-navy-400 mb-1">
                Total Study Hours Tracked *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={testHoursStudied}
                onChange={(e) => setTestHoursStudied(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 14.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={sendingSingle}
                className="px-5 py-2.5 bg-gradient-to-r from-navy-900 to-black dark:from-gold-500 dark:to-amber-500 text-white dark:text-navy-950 font-extrabold text-xs rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingSingle ? "Sending Email..." : "Send Weekly Summary Email"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* METRICS & CONFIG CARD */}
        <div className="bg-navy-50/80 dark:bg-navy-950/60 p-6 rounded-3xl border border-navy-100 dark:border-navy-850 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-navy-500 dark:text-navy-400 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Service Status & Delivery</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-navy-200/50 dark:border-navy-800">
                <span className="text-navy-600 dark:text-navy-400">Background Engine</span>
                <span className="font-mono font-bold text-navy-900 dark:text-white">node-cron 3.0+</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-navy-200/50 dark:border-navy-800">
                <span className="text-navy-600 dark:text-navy-400">Transport Method</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{cronStatus?.transportMethod || "Nodemailer SMTP"}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-navy-200/50 dark:border-navy-800">
                <span className="text-navy-600 dark:text-navy-400">Total Outbox Logs</span>
                <span className="font-mono font-bold text-navy-900 dark:text-white">{weeklyLogs.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-navy-600 dark:text-navy-400">Active Students</span>
                <span className="font-mono font-bold text-navy-900 dark:text-white">{cronStatus?.activeStudentsCount || 3} Registered</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-700 dark:text-gold-300 font-semibold leading-relaxed flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-500 shrink-0" />
            <span>Emails compile progress metrics, badges, and upcoming goals from student records in real time.</span>
          </div>
        </div>
      </div>

      {/* DISPATCH HISTORY OUTBOX LOGS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black font-mono uppercase tracking-wider text-navy-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-royal-600 dark:text-royal-300" />
            <span>Weekly Summary Email Outbox ({weeklyLogs.length})</span>
          </h3>

          <button
            onClick={fetchLogs}
            className="text-xs font-mono font-bold text-royal-600 dark:text-royal-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Outbox
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-navy-150 dark:border-navy-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-400 font-mono font-bold uppercase text-[10px] border-b border-navy-150 dark:border-navy-800">
              <tr>
                <th className="p-3.5">Recipient</th>
                <th className="p-3.5">Subject Line</th>
                <th className="p-3.5">Delivery Status</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60 font-medium">
              {weeklyLogs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-950/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-navy-900 dark:text-white">{log.recipient_name}</div>
                    <div className="text-[11px] font-mono text-navy-500 dark:text-navy-400">{log.recipient_email}</div>
                  </td>
                  <td className="p-3.5 max-w-xs truncate text-navy-700 dark:text-navy-300">
                    {log.subject}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      log.status === "sent"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : log.status === "failed"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}>
                      {log.status === "sent" ? "Delivered (SMTP)" : log.status === "failed" ? "Failed" : "Simulated"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-navy-500 dark:text-navy-400 text-[11px]">
                    {new Date(log.created_at).toLocaleString("en-ZA")}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedLogPreview(log);
                        setShowPreviewModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 hover:bg-royal-600 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      View Body
                    </button>
                  </td>
                </tr>
              ))}

              {weeklyLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-navy-500 dark:text-navy-400">
                    No weekly summary emails recorded in outbox yet. Click "Send Weekly Summary Email" above to trigger a test dispatch!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-navy-900 text-navy-900 dark:text-white rounded-3xl p-6 md:p-8 border border-navy-200 dark:border-navy-700 shadow-2xl flex flex-col overflow-hidden text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-navy-100 dark:border-navy-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gold-500 text-navy-950 font-black">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold font-display">
                      {selectedLogPreview ? "Outbox Log Email Preview" : "Weekly Summary Email Template Preview"}
                    </h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400">
                      High-contrast responsive Navy & Gold HTML template sent to students.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedLogPreview(null);
                  }}
                  className="p-2 text-navy-400 hover:text-navy-900 dark:hover:text-white rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* HTML PREVIEW CONTAINER */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-100 rounded-2xl border border-navy-200">
                {selectedLogPreview ? (
                  <div 
                    className="bg-white rounded-xl shadow p-2"
                    dangerouslySetInnerHTML={{ __html: selectedLogPreview.body_html }} 
                  />
                ) : (
                  <div className="bg-white max-w-md mx-auto rounded-xl shadow overflow-hidden border border-slate-200 text-slate-800 font-sans">
                    <div className="bg-slate-900 p-6 text-center border-b-4 border-amber-500">
                      <h2 className="text-white text-lg font-black tracking-tight">AMARIS MATHEMATICS HUB</h2>
                      <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mt-1">Weekly Student Digest & Milestone Progress</p>
                    </div>

                    <div className="p-6 space-y-4 text-xs leading-relaxed">
                      <p className="text-sm font-bold text-slate-900">Ayo, {testName}! 🚀</p>
                      <p className="text-slate-600">Here is your automated weekly learning breakdown for <strong>Grade 12 NSC</strong>. Every completed exercise and step-by-step problem solved brings you closer to your Level 7 distinction!</p>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="font-mono font-extrabold text-xs text-slate-900">{testHoursStudied} Hrs</div>
                          <div className="text-[8px] font-bold uppercase text-slate-500">Studied</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="font-mono font-extrabold text-xs text-slate-900">7 Days</div>
                          <div className="text-[8px] font-bold uppercase text-slate-500">Streak</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="font-mono font-extrabold text-xs text-slate-900">1450 XP</div>
                          <div className="text-[8px] font-bold uppercase text-slate-500">Total XP</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="font-mono font-extrabold text-xs text-slate-900">84%</div>
                          <div className="text-[8px] font-bold uppercase text-slate-500">Mastery</div>
                        </div>
                      </div>

                      <div className="font-bold uppercase text-slate-900 text-[11px] border-b-2 border-amber-500 pb-1 pt-2 flex items-center justify-between">
                        <span>🎯 Upcoming Module Goals & Topic Mastery</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-slate-900">Differential Calculus Limits</span>
                            <span className="text-amber-600 font-mono">90% / 95%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-900 to-amber-500 h-full w-[90%]"></div>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 text-right">🎯 Target Milestone: <strong>Sunday</strong></div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-slate-900">Quadratic Sequences & Series</span>
                            <span className="text-amber-600 font-mono">85% / 90%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-900 to-amber-500 h-full w-[85%]"></div>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 text-right">🎯 Target Milestone: <strong>Next Week</strong></div>
                        </div>
                      </div>

                      <div className="font-bold uppercase text-slate-900 text-[11px] border-b-2 border-amber-500 pb-1 pt-2">
                        🏆 Badges Earned & Milestones
                      </div>

                      <div className="space-y-2">
                        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">🏆</span>
                            <div>
                              <div className="font-bold text-amber-900">Trig Titan 🏆</div>
                              <div className="text-[10px] text-slate-600">Completed 20 compound angle proofs with 100% accuracy</div>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">+250 XP</span>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">⚡</span>
                            <div>
                              <div className="font-bold text-amber-900">7-Day Study Streak ⚡</div>
                              <div className="text-[10px] text-slate-600">Logged into Amaris Hub for 7 consecutive days</div>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">+150 XP</span>
                        </div>
                      </div>

                      <div className="font-bold uppercase text-slate-900 text-[11px] border-b-2 border-amber-500 pb-1 pt-2">
                        📅 Upcoming Booked Tutoring Sessions
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[9px]">Ref: AMH-BOOK-8821</span>
                            <span className="font-bold text-amber-600">📅 2026-08-02 @ 14:00 SAST</span>
                          </div>
                          <div className="font-bold text-slate-900">Grade 12 Calculus & Derivatives</div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                            <span>Platform: <strong>Google Meet</strong></span>
                            <span className="text-blue-600 font-bold">Join Meeting Room ↗</span>
                          </div>
                        </div>
                      </div>

                      <div className="font-bold uppercase text-slate-900 text-[11px] border-b-2 border-amber-500 pb-1 pt-2">
                        📚 New Mathematical Resources Added This Week
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                          <div>
                            <div className="font-bold text-slate-900">Grade 12 CAPS Differential Calculus Optimization</div>
                            <div className="text-[9px] text-slate-500">PDF Worksheet • Added 2026-07-28</div>
                          </div>
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">Calculus</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-[11px]">
                        <div className="font-bold text-emerald-800 uppercase">💡 Tutor Bethuel's Coaching Tip For The Week</div>
                        <div className="text-emerald-900 italic mt-0.5">
                          "Mastering first-principles limits and trigonometric reductions requires active problem solving. Keep uploading your step-by-step scans to the homework center!"
                        </div>
                      </div>

                      <div className="text-center pt-2">
                        <span className="inline-block bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-lg uppercase tracking-wider text-[11px]">
                          Open Student Cockpit
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end border-t border-navy-100 dark:border-navy-800 shrink-0">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedLogPreview(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 font-extrabold text-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

