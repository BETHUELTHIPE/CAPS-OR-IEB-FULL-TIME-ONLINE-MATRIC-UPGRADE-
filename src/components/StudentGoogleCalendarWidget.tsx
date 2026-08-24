import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Calendar, CheckCircle, ExternalLink, RefreshCw, Sparkles, 
  Clock, Video, BookOpen, AlertCircle, Plus, Check, ShieldCheck, Share2
} from "lucide-react";
import { Booking, Profile } from "../types";
import { 
  connectGoogleWorkspace, 
  createGoogleCalendarEvent, 
  syncAllBookingsToGoogleCalendar, 
  generateGoogleCalendarDirectUrl,
  getCachedGoogleAccessToken,
  getCachedGoogleUser
} from "../lib/googleWorkspaceService";

interface StudentGoogleCalendarWidgetProps {
  user: Profile | null;
  bookings: Booking[];
  subjects?: Array<{ id: string; name: string }>;
  className?: string;
}

export const StudentGoogleCalendarWidget: React.FC<StudentGoogleCalendarWidgetProps> = ({
  user,
  bookings,
  subjects = [],
  className = ""
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingSingleId, setSyncingSingleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string; link?: string } | null>(null);
  const [syncedBookingIds, setSyncedBookingIds] = useState<Record<string, string>>({});

  const isConnected = !!getCachedGoogleAccessToken();
  const cachedUser = getCachedGoogleUser();

  const handleConnect = async () => {
    setIsConnecting(true);
    setFeedback(null);
    try {
      const res = await connectGoogleWorkspace();
      setFeedback({
        type: "success",
        message: `Connected Google Calendar as ${res.user.email || user?.email}! You can now 1-click sync all your lessons.`
      });
    } catch (err: any) {
      console.warn("Google Workspace connection prompt:", err);
      setFeedback({
        type: "info",
        message: "You can still add lessons directly to your Google Calendar using the 1-click Google Calendar links!"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncSingleBooking = async (booking: Booking) => {
    setSyncingSingleId(booking.id);
    setFeedback(null);

    const subject = subjects.find(s => s.id === booking.subject_id);
    const subjectName = subject?.name || "NSC Mathematics Tutoring";
    const studentName = user ? `${user.first_name} ${user.surname}` : "Learner";

    // If connected via OAuth, sync directly via API
    if (getCachedGoogleAccessToken()) {
      try {
        const res = await createGoogleCalendarEvent(booking, {
          studentName,
          studentEmail: user?.email,
          subjectName
        });
        setSyncedBookingIds(prev => ({ ...prev, [booking.id]: res.htmlLink }));
        setFeedback({
          type: "success",
          message: `Scheduled on your Google Calendar: "${res.summary}"`,
          link: res.htmlLink
        });
      } catch (err: any) {
        // Fallback to direct calendar URL
        const directUrl = generateGoogleCalendarDirectUrl(booking, subjectName, studentName);
        window.open(directUrl, "_blank", "noopener,noreferrer");
        setFeedback({
          type: "info",
          message: "Opening Google Calendar event creator in a new tab..."
        });
      } finally {
        setSyncingSingleId(null);
      }
    } else {
      // Direct Web Add URL fallback
      const directUrl = generateGoogleCalendarDirectUrl(booking, subjectName, studentName);
      window.open(directUrl, "_blank", "noopener,noreferrer");
      setSyncedBookingIds(prev => ({ ...prev, [booking.id]: directUrl }));
      setFeedback({
        type: "info",
        message: "Opening Google Calendar event window to save your lesson slot..."
      });
      setSyncingSingleId(null);
    }
  };

  const handleSyncAllBookings = async () => {
    if (!bookings.length) {
      setFeedback({ type: "info", message: "You don't have any bookings yet. Book a session to sync!" });
      return;
    }

    if (!getCachedGoogleAccessToken()) {
      // Prompt connect first
      try {
        setIsConnecting(true);
        await connectGoogleWorkspace();
      } catch (e) {
        setIsConnecting(false);
        setFeedback({
          type: "error",
          message: "Google account authorization required to sync all bookings automatically."
        });
        return;
      } finally {
        setIsConnecting(false);
      }
    }

    setSyncingAll(true);
    setFeedback(null);

    const studentName = user ? `${user.first_name} ${user.surname}` : "Learner";

    try {
      const res = await syncAllBookingsToGoogleCalendar(bookings, {
        studentName,
        studentEmail: user?.email
      });

      const newSynced: Record<string, string> = { ...syncedBookingIds };
      res.events.forEach(e => {
        if (e.htmlLink) newSynced[e.bookingId] = e.htmlLink;
      });
      setSyncedBookingIds(newSynced);

      setFeedback({
        type: "success",
        message: `Successfully synchronized ${res.successCount} lesson${res.successCount === 1 ? "" : "s"} directly to your Google Calendar!`
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to batch sync to Google Calendar"
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status !== "cancelled");

  return (
    <div id="student-google-calendar-widget" className={`bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6 ${className}`}>
      
      {/* Header & Connection status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-150 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black font-display text-navy-900 dark:text-white">
                My Google Calendar Sync
              </h3>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  1-Click Ready
                </span>
              )}
            </div>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Synchronize your Amaris tutoring lessons, whiteboard links, and study reminders directly to your Google Calendar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button
              id="connect-google-calendar-btn"
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-3.5 py-2 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-750 text-navy-800 dark:text-navy-200 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              {isConnecting ? "Connecting..." : "Connect Google"}
            </button>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 truncate max-w-[180px]">
              {cachedUser?.email || user?.email}
            </span>
          )}

          <button
            id="sync-all-google-calendar-btn"
            type="button"
            onClick={handleSyncAllBookings}
            disabled={syncingAll || !bookings.length}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? "animate-spin" : ""}`} />
            {syncingAll ? "Syncing..." : "Sync All Lessons"}
          </button>

          <a
            id="open-google-calendar-web-btn"
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:text-blue-600 rounded-xl transition"
            title="Open Google Calendar in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : feedback.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              : "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedback.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>

          {feedback.link && (
            <a
              href={feedback.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline flex items-center gap-1 hover:opacity-80 shrink-0"
            >
              View in Calendar <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </motion.div>
      )}

      {/* Bookings List with Google Calendar Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-navy-800 dark:text-navy-200">
          <span>Your Booked Sessions ({upcomingBookings.length})</span>
          <span className="text-[11px] font-mono text-navy-400 font-normal">All times in SAST (UTC+2)</span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8 bg-navy-50/50 dark:bg-navy-950/50 rounded-2xl border border-dashed border-navy-200 dark:border-navy-800">
            <Calendar className="w-8 h-8 mx-auto text-navy-300 dark:text-navy-700 mb-2" />
            <p className="text-xs font-bold text-navy-700 dark:text-navy-300">No scheduled lessons found yet</p>
            <p className="text-[11px] text-navy-400 mt-0.5">Book a lesson package to start syncing your study timetable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingBookings.map((b) => {
              const sub = subjects.find(s => s.id === b.subject_id);
              const subjectName = sub?.name || "NSC Mathematics";
              const isSynced = !!syncedBookingIds[b.id];
              const isSyncingThis = syncingSingleId === b.id;

              return (
                <div
                  key={b.id}
                  id={`calendar-booking-card-${b.id}`}
                  className="p-4 bg-navy-50/80 dark:bg-navy-950/80 border border-navy-200/80 dark:border-navy-800 rounded-2xl flex flex-col justify-between gap-3 hover:border-blue-400/50 transition group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {b.booking_reference}
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {b.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-navy-900 dark:text-white line-clamp-1">
                      {subjectName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-600 dark:text-navy-300 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {b.lesson_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {b.lesson_time}
                      </span>
                    </div>

                    {b.topics_to_cover && b.topics_to_cover.length > 0 && (
                      <p className="text-[11px] text-navy-500 dark:text-navy-400 line-clamp-1">
                        📌 {b.topics_to_cover.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-navy-200/60 dark:border-navy-800/80 flex items-center justify-between gap-2">
                    {b.meeting_link && (
                      <a
                        href={b.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" /> Join Whiteboard
                      </a>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      {isSynced ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          <Check className="w-3 h-3" /> Synced to Google
                        </span>
                      ) : (
                        <button
                          type="button"
                          id={`add-to-google-cal-${b.id}`}
                          onClick={() => handleSyncSingleBooking(b)}
                          disabled={isSyncingThis}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg shadow-xs transition flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {isSyncingThis ? "Adding..." : "Add to Google Calendar"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
