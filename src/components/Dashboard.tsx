import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { 
  LayoutDashboard, Calendar, FileText, Video, CreditCard, User, 
  Clock, CheckCircle, AlertCircle, Plus, Upload, Trash2, 
  ExternalLink, Search, Sparkles, MessageSquare, Save, X, Play,
  Download, Star, Bell, Megaphone, Send, Bot, Smartphone, Settings, Code, Terminal, Check, Printer, BookOpen, Users, UserCheck, BookMarked,
  Target, TrendingUp, Award, ShieldCheck, Maximize2, Minimize2, Server
} from "lucide-react";
import { getIntegrityReport, exportIntegrityReportPDF, IntegrityReport } from "../lib/integrity";
import { useForm } from "react-hook-form";
import { Profile, Subject, LessonPackage, Booking, Payment, HomeworkAssignment, HomeworkSubmission, VideoLessonRequest, Announcement, MockExamScore, AMHNotification } from "../types";
import { dbAuth, dbAPI, generateId } from "../lib/db";
import { BookingWizard } from "./BookingWizard";
import { MatricCountdown } from "./MatricCountdown";
import { ExamModeTimerWidget } from "./ExamModeTimerWidget";
import { StudentProgressTracker } from "./StudentProgressTracker";
import { StudentProgressDashboard } from "./StudentProgressDashboard";
import { ResourceLibrary } from "./ResourceLibrary";
import { StudyGroup } from "./StudyGroup";
import { MockPerformanceDashboard } from "./MockPerformanceDashboard";
import { AIPredictor } from "./AIPredictor";
import { TutorReportsDashboard } from "./TutorReportsDashboard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, AreaChart, Area, ReferenceLine } from "recharts";
import { FormulaFlashcards } from "./FormulaFlashcards";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { StudentAchievements } from "./StudentAchievements";
import { Badges } from "./Badges";
import { OverviewTopicMastery } from "./OverviewTopicMastery";
import { OverviewAchievementsCard } from "./OverviewAchievementsCard";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { WeeklySummaryServiceWidget } from "./WeeklySummaryServiceWidget";
import { WeeklyInsightsGenerator } from "./WeeklyInsightsGenerator";
import { DailyChallengeQuiz } from "./DailyChallengeQuiz";
import { DailyStreakCounter } from "./DailyStreakCounter";
import { StudentRankSystem } from "./StudentRankSystem";
import { FocusSessionTimer } from "./FocusSessionTimer";
import { CurriculumRoadmap } from "./CurriculumRoadmap";
import { WeeklyStudyPlanner } from "./WeeklyStudyPlanner";
import { AmarisLogo } from "./AmarisLogo";
import { WeeklyStudyGoalRing } from "./WeeklyStudyGoalRing";
import { InteractiveMathGlossary } from "./InteractiveMathGlossary";
import { StudyStreakCalendar } from "./StudyStreakCalendar";
import { StudentLeaderboard } from "./StudentLeaderboard";
import { GlobalLeaderboard } from "./GlobalLeaderboard";
import { PersonalizedFormulaBank } from "./PersonalizedFormulaBank";
import { FormulaSheetModal } from "./FormulaSheetModal";
import { PostSessionFeedbackModal } from "./PostSessionFeedbackModal";
import { VoiceMemosRecorder } from "./VoiceMemosRecorder";
import { ExportProgressPDF } from "./ExportProgressPDF";
import { PrintPreviewModal } from "./PrintPreviewModal";
import { TopicImprovementChart } from "./TopicImprovementChart";
import { StudentImprovementVisualizer } from "./StudentImprovementVisualizer";
import { HomeworkCenter } from "./HomeworkCenter";
import { SubjectQuizMode } from "./SubjectQuizMode";
import { AskTutor } from "./AskTutor";
import { DirectTutorMessaging } from "./DirectTutorMessaging";
import { LatexMathEditor } from "./LatexMathEditor";
import { VisualLatexToolbar } from "./VisualLatexToolbar";
import { DeepFocusWorkspace } from "./DeepFocusWorkspace";
import { AmbientSoundscapeSettings } from "./AmbientSoundscapeSettings";
import { LofiSoundscapePlayerBar } from "./LofiSoundscapePlayerBar";
import { FocusHistoryWidget } from "./FocusHistoryWidget";
import { SessionReviewCards } from "./SessionReviewCards";
import { ArcadeModeWidget } from "./ArcadeModeWidget";
import { ArcadeTopScorersWidget } from "./ArcadeTopScorersWidget";
import { LearningProgressDashboard } from "./LearningProgressDashboard";
import { LearningProgress } from "./LearningProgress";
import { CourseProgress } from "./CourseProgress";
import { StudentMilestones } from "./StudentMilestones";
import { SubjectMastery } from "./SubjectMastery";
import { VisualTopicProgressTracker } from "./VisualTopicProgressTracker";
import { CountUp } from "./CountUp";
import { DashboardOverviewSkeleton } from "./DashboardSkeleton";
import { Layers, Network, Trophy, Activity, BrainCircuit, Calculator, Gamepad2, Zap } from "lucide-react";
import { useStudySessionNotifications } from "../hooks/useStudySessionNotifications";
import { StudySessionNotificationBanner } from "./StudySessionNotificationBanner";
import { LiveTutorChatSidebar } from "./LiveTutorChatSidebar";
import { AutomatedStudyScheduleGenerator } from "./AutomatedStudyScheduleGenerator";
import { TestRunnerDashboard } from "./TestRunnerDashboard";
import { OperationalExcellenceHub } from "./OperationalExcellenceHub";
import { MFASetup } from "./MFASetup";
import { QRCodeScannerModal } from "./QRCodeScannerModal";
import { ErrorTrendAnalysis } from "./ErrorTrendAnalysis";
import { TutorProfile } from "./TutorProfile";
import { StudentGoogleCalendarWidget } from "./StudentGoogleCalendarWidget";
import { generateGoogleCalendarDirectUrl, recordAndLogAttendance } from "../lib/googleWorkspaceService";
import { QrCode, Camera } from "lucide-react";

interface DashboardProps {
  user: Profile | null;
  onProfileUpdate: (updated: Profile) => void;
}

type TabType = "overview" | "notifications" | "lessons" | "homework" | "resources" | "study_group" | "videos" | "payments" | "profile" | "tutor_profile" | "announcements" | "ai_tutor" | "direct_tutor_chat" | "whatsapp_automation" | "tutors" | "performance" | "exam_predictor" | "tutor_reports" | "flashcards" | "knowledge_graph" | "achievements" | "progress_tracker" | "recent_activity" | "formula_library" | "subject_quiz" | "error_trend_analysis" | "global_leaderboard" | "math_glossary" | "latex_editor" | "focus_history" | "arcade_mode" | "session_review" | "study_schedule" | "test_runner" | "ops_excellence";

export const Dashboard: React.FC<DashboardProps> = ({ user, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Web Push Notification Hook for 10-Min Study Session Alerts
  const { activeBannerNotification, dismissBanner, snoozeBanner } = useStudySessionNotifications();

  // Focus Mode State (Hides sidebar and navigation menu for clean full-screen distraction-free workspace)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    return localStorage.getItem("amh_focus_mode") === "true";
  });

  // Live Tutor Chat Sidebar state
  const [isLiveTutorChatOpen, setIsLiveTutorChatOpen] = useState(false);
  
  // Physical Material QR Code Scanner Modal state
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const toggleFocusMode = () => {
    const nextMode = !isFocusMode;
    setIsFocusMode(nextMode);
    localStorage.setItem("amh_focus_mode", String(nextMode));
    window.dispatchEvent(new CustomEvent("focusModeToggle", { detail: { active: nextMode } }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        toggleFocusMode();
      }
    };

    const handleNavigateTab = (e: Event) => {
      const tab = (e as CustomEvent<string>).detail;
      if (tab) {
        if (tab === "daily_challenge") {
          setActiveTab("overview");
          setTimeout(() => {
            document.getElementById("daily-streak-widget")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else if (tab === "subject_quiz" || tab === "achievements" || tab === "performance" || tab === "formula_library" || tab === "resources" || tab === "global_leaderboard" || tab === "leaderboard" || tab === "math_glossary" || tab === "glossary" || tab === "latex_editor" || tab === "latex") {
          setActiveTab(tab === "leaderboard" ? "global_leaderboard" : tab === "glossary" ? "math_glossary" : tab === "latex" ? "latex_editor" : (tab as TabType));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("amhNavigateTab", handleNavigateTab);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("amhNavigateTab", handleNavigateTab);
    };
  }, [isFocusMode]);
  
  // Database & Skeleton Screen Loading States
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  // Trigger skeleton screen loading transition on tab switches
  useEffect(() => {
    setIsFetchingData(true);
    const timer = setTimeout(() => {
      setIsFetchingData(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Database States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [packages, setPackages] = useState<LessonPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [videoRequests, setVideoRequests] = useState<VideoLessonRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tutors, setTutors] = useState<Profile[]>([]);
  const [mockScores, setMockScores] = useState<MockExamScore[]>([]);
  const [notifications, setNotifications] = useState<AMHNotification[]>([]);
  const [toastNotification, setToastNotification] = useState<AMHNotification | null>(null);
  const [showQuickQuizForm, setShowQuickQuizForm] = useState(false);
  const [quickQuizTitle, setQuickQuizTitle] = useState("");
  const [quickQuizTopic, setQuickQuizTopic] = useState("");
  const [quickQuizScore, setQuickQuizScore] = useState<number>(75);
  const [quickQuizDate, setQuickQuizDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [quickQuizNotes, setQuickQuizNotes] = useState("");
  const [onlyReadyTutors, setOnlyReadyTutors] = useState<boolean>(false);
  const [joiningTutorSession, setJoiningTutorSession] = useState<Profile | null>(null);
  const [notifFilter, setNotifFilter] = useState<"all" | "video_uploaded" | "slot_available" | "system">("all");
  
  // Live Boardroom Simulation states
  const [boardroomMessages, setBoardroomMessages] = useState<{ id: string; sender: "student" | "tutor"; text: string; time: string }[]>([]);
  const [boardroomInput, setBoardroomInput] = useState("");
  const [boardroomTutorTyping, setBoardroomTutorTyping] = useState(false);
  const [boardroomElapsed, setBoardroomElapsed] = useState(0);
  const [penColor, setPenColor] = useState("#eab308"); // gold default
  const [boardroomBgColor, setBoardroomBgColor] = useState("#0f172a"); // default to dark slate
  const [penWidth, setPenWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Whiteboard history states (Undo / Redo)
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const pushCanvasState = (canvas: HTMLCanvasElement) => {
    const state = canvas.toDataURL();
    setUndoStack(prev => {
      const newStack = [...prev, state];
      if (newStack.length > 25) {
        newStack.shift(); // limit size to prevent performance degradation
      }
      return newStack;
    });
    setRedoStack([]); // Clear redo stack on any new canvas operation
  };

  // Whiteboard Ruler states
  const [showRuler, setShowRuler] = useState(false);
  const [rulerX, setRulerX] = useState(400); // center (800x500)
  const [rulerY, setRulerY] = useState(250);
  const [rulerAngle, setRulerAngle] = useState(0); // in degrees
  const [rulerWidth, setRulerWidth] = useState(380); // width in px
  const [rulerMode, setRulerMode] = useState<"free" | "line">("free"); // "free" or "line" for straight-lines
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [lineCurrent, setLineCurrent] = useState<{ x: number; y: number } | null>(null);

  // Boardroom PDF/Memo Presenter States
  const [boardroomPresenterOpen, setBoardroomPresenterOpen] = useState(false);
  const [boardroomPresenterSyllabus, setBoardroomPresenterSyllabus] = useState<"CAPS" | "IEB">("IEB");
  const [boardroomPresenterYear, setBoardroomPresenterYear] = useState<number>(2025);
  const [boardroomPresenterPaperType, setBoardroomPresenterPaperType] = useState<"p1" | "p1_memo" | "p2" | "p2_memo">("p1");
  const [boardroomPresenterTab, setBoardroomPresenterTab] = useState<"past_papers" | "guides">("past_papers");
  const [boardroomPresenterSelectedOtherId, setBoardroomPresenterSelectedOtherId] = useState<string | null>(null);

  // Session Goals state with local storage persistence
  const [sessionGoals, setSessionGoals] = useState<Array<{ id: string; text: string; completed: boolean; targetDate: string }>>(() => {
    const saved = localStorage.getItem("amaris_session_goals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: "g1", text: "Master Trigonometric identities and compound angle proofs", completed: false, targetDate: "2026-07-15" },
      { id: "g2", text: "Complete Calculus Optimization Assignment with 80%+", completed: true, targetDate: "2026-07-08" },
      { id: "g3", text: "Attempt CAPS 2024 Mathematics Paper 1 past exam paper", completed: false, targetDate: "2026-07-20" },
      { id: "g4", text: "Review vertical projectile motion formulas & diagrams", completed: false, targetDate: "2026-07-25" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("amaris_session_goals", JSON.stringify(sessionGoals));
  }, [sessionGoals]);

  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");

  // Wizard / Modals state
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
  const [bookingScheduleFilter, setBookingScheduleFilter] = useState<"all" | "confirmed" | "completed">("all");
  const [videoWizardOpen, setVideoWizardOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  
  // File upload simulation state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [homeworkNotes, setHomeworkNotes] = useState("");
  const [activeUploadHwId, setActiveUploadHwId] = useState<string | null>(null);
  const [selectedIntegritySub, setSelectedIntegritySub] = useState<HomeworkSubmission | null>(null);

  // Profile Edit Form Hook
  const { register: regProfile, handleSubmit: handleProfileSubmit, setValue: setProfileValue, watch: watchProfile } = useForm<Partial<Profile>>();
  const emailSessionReminders = watchProfile("email_session_reminders") !== false;
  const emailBlogPosts = watchProfile("email_blog_posts") !== false;

  // Booking Wizard Form Hook
  const { register: regBooking, handleSubmit: handleBookingSubmit, watch: watchBooking, reset: resetBooking } = useForm<{
    subject_id: string;
    package_id: string;
    lesson_date: string;
    lesson_time: string;
    topics: string;
    notes: string;
  }>();

  // Video Request Wizard Form Hook
  const { register: regVideo, handleSubmit: handleVideoSubmit, reset: resetVideo } = useForm<{
    subject: string;
    chapter_title: string;
    description: string;
  }>();

  // Feedback Modal states
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackRemarks, setFeedbackRemarks] = useState("");

  // Inline post-tutoring feedback states
  const [inlineFeedbackRating, setInlineFeedbackRating] = useState(5);
  const [inlineFeedbackRemarks, setInlineFeedbackRemarks] = useState("");
  const [dismissedFeedbackIds, setDismissedFeedbackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("amh_dismissed_feedback_ids");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleDismissFeedback = (bookingId: string) => {
    setDismissedFeedbackIds(prev => {
      const next = prev.includes(bookingId) ? prev : [...prev, bookingId];
      localStorage.setItem("amh_dismissed_feedback_ids", JSON.stringify(next));
      return next;
    });
  };

  const isSessionTimePassed = (lessonDate: string, lessonTime: string) => {
    try {
      const [year, month, day] = lessonDate.split("-").map(Number);
      const [hour, minute] = lessonTime.split(":").map(Number);
      const lessonDateTime = new Date(year, month - 1, day, hour, minute);
      return new Date() > lessonDateTime;
    } catch (err) {
      return false;
    }
  };

  // Auto-open feedback modal when a booked session concludes and is unrated
  useEffect(() => {
    if (!bookings || bookings.length === 0 || feedbackBooking) return;
    
    // Find the first booking that has concluded, has no rating, and hasn't been dismissed
    const concludedUnrated = bookings.find(b => 
      (b.status === "confirmed" || b.status === "completed") &&
      isSessionTimePassed(b.lesson_date, b.lesson_time) &&
      !b.rating &&
      !dismissedFeedbackIds.includes(b.id)
    );

    if (concludedUnrated) {
      setFeedbackBooking(concludedUnrated);
      setFeedbackRating(5);
      setFeedbackRemarks("");
    }
  }, [bookings, dismissedFeedbackIds, feedbackBooking]);

  const handleInlineFeedbackSubmit = (bookingId: string) => {
    try {
      dbAPI.completeBooking(bookingId, inlineFeedbackRating, inlineFeedbackRemarks);
      alert("Thank you for your valuable feedback! Head tutor Bethuel and the Amaris team have been notified.");
      handleDismissFeedback(bookingId);
      setInlineFeedbackRating(5);
      setInlineFeedbackRemarks("");
      loadRecords(); // Refresh bookings and charts
    } catch (err) {
      alert("Error saving feedback: " + err);
    }
  };

  const onSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackBooking) return;
    try {
      dbAPI.completeBooking(feedbackBooking.id, feedbackRating, feedbackRemarks);
      alert("Thank you for your valuable feedback! Head tutor Bethuel and the Amaris team have been notified.");
      handleDismissFeedback(feedbackBooking.id);
      setFeedbackBooking(null);
      setFeedbackRating(5);
      setFeedbackRemarks("");
      loadRecords(); // Refresh bookings to display completed status & rating stars
    } catch (err) {
      alert("Error saving feedback: " + err);
    }
  };

  // Tutor Bethuel AI Chat state
  const [chatMessages, setChatMessages] = useState<{ id: string; role: "user" | "tutor"; text: string; timestamp: string }[]>([
    {
      id: "msg-welcome",
      role: "tutor",
      text: `Ayo, ${user?.first_name || "Student"}! I'm Tutor Bethuel, your AI Mathematics assistant. 🎓 Let's make this upgrade year your absolute best! \n\nWhether you want to know how our live whiteboard sessions work, need help with packages and PayFast billing, or want advice on conquering CAPS functions or calculus concepts, I'm here for you and your parents.\n\nWhat math challenges are we tackling today?`,
      timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // WhatsApp Auto-Responder Simulation States
  const [whatsappActive, setWhatsappActive] = useState(true);
  const [whatsappVoice, setWhatsappVoice] = useState<"warm" | "formal" | "technical">("warm");
  const [whatsappDelay, setWhatsappDelay] = useState(2);
  const [whatsappCustomWelcome, setWhatsappCustomWelcome] = useState("Hi! Welcome to Amaris Mathematics Hub. 🎓 Tutor Bethuel here. How can we help you upgrade your mathematics marks today?");
  
  const [whatsappMessages, setWhatsappMessages] = useState<{ id: string; sender: "client" | "bethuel"; text: string; time: string; status?: "sent" | "delivered" | "read" }[]>([
    {
      id: "wa-1",
      sender: "client",
      text: "Hi, I am looking for a matric upgrade tutor in Pretoria. What are your rates?",
      time: "08:14"
    },
    {
      id: "wa-2",
      sender: "bethuel",
      text: "*Ayo! Tutor Bethuel here.* 🎓 \n\nGreat choice on upgrading! We serve Grade 10-12 and second-chance Matric Upgrade candidates. Our live whiteboard sessions are R350/hour, but we have amazing packages:\n\n* *4 Lessons*: R1,200\n* *8 Lessons*: R2,200 (Most popular!)\n* *Unlimited Monthly Support*: R3,800\n\nAll packages include homework grading & diagnostic parent feedback. Are you looking to upgrade core maths or physical sciences?",
      time: "08:15",
      status: "read"
    },
    {
      id: "wa-3",
      sender: "client",
      text: "Core maths, yes. Can we start this week?",
      time: "08:17"
    }
  ]);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappLogs, setWhatsappLogs] = useState<{ id: string; event: string; type: "info" | "api" | "webhook"; time: string }[]>([
    { id: "log-1", event: "WhatsApp Auto-Reply engine initialized", type: "info", time: "08:14:02" },
    { id: "log-2", event: "Incoming Webhook payload from +27 82 455 1290", type: "webhook", time: "08:14:15" },
    { id: "log-3", event: "Gemini 3.5 Flash inference: Voice=Warm & Energetic", type: "api", time: "08:15:00" },
    { id: "log-4", event: "Auto-reply sent successfully via Twilio/Meta", type: "info", time: "08:15:02" }
  ]);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);

  const handleSendWhatsappMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!whatsappInput.trim() || whatsappLoading) return;

    const userMsg = whatsappInput.trim();
    setWhatsappInput("");

    const userMsgId = "wa-user-" + Date.now();
    const timeStr = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

    // 1. Add user message
    setWhatsappMessages(prev => [
      ...prev,
      { id: userMsgId, sender: "client", text: userMsg, time: timeStr }
    ]);

    // 2. Add log of incoming webhook
    const logId1 = "log-" + Date.now();
    const timeLog1 = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setWhatsappLogs(prev => [
      ...prev,
      { id: logId1, event: `Webhook notification received from simulated client`, type: "webhook", time: timeLog1 }
    ]);

    if (!whatsappActive) {
      // Automation is inactive, so no auto reply!
      const logIdInactive = "log-inactive-" + Date.now();
      setWhatsappLogs(prev => [
        ...prev,
        { id: logIdInactive, event: "Auto-Reply engine is INACTIVE. No response triggered.", type: "info", time: timeLog1 }
      ]);
      return;
    }

    setWhatsappLoading(true);

    // Simulate delay
    setTimeout(async () => {
      try {
        const logIdApi = "log-api-" + Date.now();
        const timeLogApi = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setWhatsappLogs(prev => [
          ...prev,
          { id: logIdApi, event: `Triggered Gemini AI inference with Voice style: ${whatsappVoice}`, type: "api", time: timeLogApi }
        ]);

        // Map messages history for API
        const apiHistory = whatsappMessages.map(m => ({
          role: m.sender === "client" ? "user" : "model",
          content: m.text
        }));

        const response = await fetch("/api/ai/whatsapp-auto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg,
            history: apiHistory,
            voice: whatsappVoice,
            customWelcome: whatsappCustomWelcome
          })
        });

        const data = await response.json();
        const tutorReply = data.text || "I am here to help!";

        const replyId = "wa-reply-" + Date.now();
        const replyTimeStr = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

        // Add tutor reply
        setWhatsappMessages(prev => [
          ...prev,
          { id: replyId, sender: "bethuel", text: tutorReply, time: replyTimeStr, status: "read" }
        ]);

        // Add success log
        const logIdSuccess = "log-success-" + Date.now();
        setWhatsappLogs(prev => [
          ...prev,
          { id: logIdSuccess, event: "WhatsApp reply successfully routed through webhook integration", type: "info", time: replyTimeStr + ":00" }
        ]);

      } catch (err) {
        console.error("WhatsApp simulation error:", err);
      } finally {
        setWhatsappLoading(false);
      }
    }, whatsappDelay * 1000);
  };

  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    
    const userMsgId = "msg-" + Date.now();
    const timestampStr = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

    // Append user message
    setChatMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: userMsg, timestamp: timestampStr }
    ]);

    setChatLoading(true);

    try {
      // Map history correctly for the API
      // To match Gemini roles, we send user -> "user", tutor -> "model"
      const apiHistory = chatMessages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.text
      }));

      const res = await fetch("/api/ai/tutor-bethuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: apiHistory,
          studentName: `${user.first_name} ${user.surname}`
        })
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: "msg-" + Date.now() + "-reply",
            role: "tutor",
            text: data.text,
            timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error(data.error || "Failed to communicate with Tutor Bethuel");
      }
    } catch (err: any) {
      console.error("Chat Error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: "msg-" + Date.now() + "-err",
          role: "tutor",
          text: `*Ayo! I experienced a temporary network connection glitch. Let's try sending that again!* \n\n(Error: ${err.message || "Tutor offline"})`,
          timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Load and refresh dashboard records
  const loadRecords = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSubjects(dbAPI.getSubjects());
    setPackages(dbAPI.getPackages());
    setBookings(dbAPI.getBookings(user.id));
    setPayments(dbAPI.getPayments(user.id));
    setAssignments(dbAPI.getHomeworkAssignments(user.id));
    setSubmissions(dbAPI.getHomeworkSubmissions(user.id));
    setVideoRequests(dbAPI.getVideoRequests(user.id));
    setAnnouncements(dbAPI.getAnnouncements());
    setTutors(dbAPI.getTutors());
    setMockScores(dbAPI.getMockExamScores(user.id));
    setNotifications(dbAPI.getNotifications(user.id));

    // Populate profile form values
    setProfileValue("first_name", user.first_name);
    setProfileValue("surname", user.surname);
    setProfileValue("phone", user.phone);
    setProfileValue("whatsapp_number", user.whatsapp_number);
    setProfileValue("province", user.province);
    setProfileValue("school", user.school);
    setProfileValue("grade", user.grade);
    setProfileValue("parent_name", user.parent_name);
    setProfileValue("parent_phone", user.parent_phone);
    setProfileValue("email_session_reminders", user.email_session_reminders !== false);
    setProfileValue("email_blog_posts", user.email_blog_posts !== false);
  };

  // Real-time notifications listener and automatic toast trigger
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const checkForNewNotifications = () => {
      try {
        const dbNotifs = dbAPI.getNotifications(user.id);
        
        setNotifications(prev => {
          // If state is empty, just load initial
          if (prev.length === 0) {
            return dbNotifs;
          }

          // Check for notifications that exist in dbNotifs but not in our current state list
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifs = dbNotifs.filter(n => !existingIds.has(n.id));

          if (newNotifs.length > 0 && isMounted) {
            // Find the first unread new notification
            const latestUnread = newNotifs.find(n => !n.is_read);
            if (latestUnread) {
              setToastNotification(latestUnread);
              // Play a subtle notification chime or sound effect (using Web Audio API to satisfy high polish!)
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                // standard chime sound: high C followed by higher E
                osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.6);
                
                setTimeout(() => {
                  const osc2 = audioCtx.createOscillator();
                  const gain2 = audioCtx.createGain();
                  osc2.connect(gain2);
                  gain2.connect(audioCtx.destination);
                  osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
                  gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
                  gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                  osc2.start(audioCtx.currentTime);
                  osc2.stop(audioCtx.currentTime + 0.6);
                }, 120);
              } catch (soundErr) {
                // Audio context block is common on browser start, ignore gracefully
              }

              // Auto dismiss
              setTimeout(() => {
                if (isMounted) setToastNotification(null);
              }, 6000);
            }
          }
          return dbNotifs;
        });
      } catch (e) {
        console.error("Error polling notifications:", e);
      }
    };

    const interval = setInterval(checkForNewNotifications, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Boardroom timer and simulated dialogue
  useEffect(() => {
    if (!joiningTutorSession) {
      setBoardroomElapsed(0);
      setBoardroomMessages([]);
      return;
    }

    // Initialize drawing board when modal is open
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Clear and style background
          ctx.fillStyle = boardroomBgColor; // dynamic slate/chalkboard/white board background
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw coordinates grid
          const isLightBoard = boardroomBgColor === "#ffffff" || boardroomBgColor === "#fafaf9";
          ctx.strokeStyle = isLightBoard ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1;
          for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
          for (let j = 0; j < canvas.height; j += 40) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
          }

          // Pre-draw elegant parabola
          ctx.strokeStyle = "#3b82f6"; // royal blue graph axes
          ctx.lineWidth = 2;
          ctx.beginPath(); // Y-Axis
          ctx.moveTo(180, 50);
          ctx.lineTo(180, 270);
          ctx.stroke();
          ctx.beginPath(); // X-Axis
          ctx.moveTo(40, 200);
          ctx.lineTo(360, 200);
          ctx.stroke();

          // Parabola curve
          ctx.strokeStyle = "#eab308"; // gold graph line
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(100, 80);
          ctx.quadraticCurveTo(180, 320, 260, 80);
          ctx.stroke();

          // Label math
          ctx.fillStyle = "#10b981"; // green text
          ctx.font = "bold 11px font-mono";
          ctx.fillText("y = x² - 4x + 3", 220, 100);
          
          ctx.fillStyle = "#94a3b8"; // label axes
          ctx.fillText("Y", 188, 65);
          ctx.fillText("X", 345, 195);
          ctx.fillText("(0, 3)", 188, 125);
          ctx.fillText("V (2, -1)", 185, 250);

          // Push initial board to history stack
          const initialState = canvas.toDataURL();
          setUndoStack([initialState]);
          setRedoStack([]);
        }
      }
    }, 100);

    // Seed system log
    const initialTime = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
    setBoardroomMessages([
      { id: "sys-1", sender: "tutor", text: `🔴 Live Boardroom Connected with Tutor ${joiningTutorSession.first_name}. Class whiteboard is active!`, time: initialTime }
    ]);

    // Timer elapsed
    const interval = setInterval(() => {
      setBoardroomElapsed(prev => prev + 1);
    }, 1000);

    // Tutor dialogue timeline
    const tutorMsg1 = setTimeout(() => {
      setBoardroomTutorTyping(true);
    }, 1200);

    const tutorMsg1Deliver = setTimeout(() => {
      setBoardroomTutorTyping(false);
      setBoardroomMessages(prev => [
        ...prev,
        {
          id: "tutor-msg-1",
          sender: "tutor",
          text: `Ayo, ${user?.first_name || "Student"}! Tutor ${joiningTutorSession.first_name} here. Welcome to our live interactive board! 🎓 \n\nI see you are working on Grade 12 Calculus and Functions. I've sketched up a standard quadratic parabola on our shared board. Let's find its turning point coordinates.`,
          time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 3500);

    const tutorMsg2 = setTimeout(() => {
      setBoardroomTutorTyping(true);
    }, 6000);

    const tutorMsg2Deliver = setTimeout(() => {
      setBoardroomTutorTyping(false);
      setBoardroomMessages(prev => [
        ...prev,
        {
          id: "tutor-msg-2",
          sender: "tutor",
          text: `To find the X-coordinate of the turning point (Vertex V) for f(x) = ax² + bx + c, do you remember our handy CAPS formula: x = -b / (2a)? Let me know if that sounds familiar!`,
          time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 9000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      clearTimeout(tutorMsg1);
      clearTimeout(tutorMsg1Deliver);
      clearTimeout(tutorMsg2);
      clearTimeout(tutorMsg2Deliver);
    };
  }, [joiningTutorSession]);

  // Drawing helpers
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (rulerMode === "line") {
      setLineStart({ x, y });
      setLineCurrent({ x, y });
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = isEraser ? boardroomBgColor : penColor; // background whiteboard color is dynamic
      ctx.lineWidth = penWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (rulerMode === "line") {
      setLineCurrent({ x, y });
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      if (rulerMode === "line" && lineStart && lineCurrent) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.beginPath();
            ctx.moveTo(lineStart.x, lineStart.y);
            ctx.lineTo(lineCurrent.x, lineCurrent.y);
            ctx.strokeStyle = isEraser ? boardroomBgColor : penColor;
            ctx.lineWidth = penWidth;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        }
      }
      // Save canvas state after finishing drawing
      const canvas = canvasRef.current;
      if (canvas) {
        pushCanvasState(canvas);
      }
    }
    setLineStart(null);
    setLineCurrent(null);
    setIsDrawing(false);
  };

  const drawRulerLine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rad = (rulerAngle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    
    // Perpendicular vector for the top edge offset (18px above center)
    const px = -Math.sin(rad);
    const py = Math.cos(rad);
    const offset = -18;

    const startX = rulerX - (rulerWidth / 2) * dx + offset * px;
    const startY = rulerY - (rulerWidth / 2) * dy + offset * py;
    const endX = rulerX + (rulerWidth / 2) * dx + offset * px;
    const endY = rulerY + (rulerWidth / 2) * dy + offset * py;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = isEraser ? boardroomBgColor : penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Save state after ruler drawing
    pushCanvasState(canvas);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = boardroomBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw coordinates grid
    const isLightBoard = boardroomBgColor === "#ffffff" || boardroomBgColor === "#fafaf9";
    ctx.strokeStyle = isLightBoard ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    // Save state after clearing canvas
    pushCanvasState(canvas);
  };

  const changeBoardroomBgColor = (newColor: string) => {
    setBoardroomBgColor(newColor);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = newColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const isLightBoard = newColor === "#ffffff" || newColor === "#fafaf9";
    ctx.strokeStyle = isLightBoard ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    if (isLightBoard && (penColor === "#ffffff" || penColor === "#fafaf9")) {
      setPenColor("#0f172a");
    } else if (!isLightBoard && penColor === "#0f172a") {
      setPenColor("#ffffff");
    }

    // Save state after boardroom background change
    pushCanvasState(canvas);

    let bgName = "Slate Blue";
    if (newColor === "#0f172a") bgName = "Slate Blue";
    else if (newColor === "#000000") bgName = "Midnight";
    else if (newColor === "#064e3b") bgName = "Chalkboard";
    else if (newColor === "#ffffff") bgName = "Whiteboard";
    else if (newColor === "#fafaf9") bgName = "Soft Stone";

    setBoardroomMessages(prev => [
      ...prev,
      {
        id: "sys-bg-" + Date.now(),
        sender: "tutor",
        text: `[Board Theme] Whiteboard background changed to ${bgName}.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (undoStack.length <= 1) return; // Keep at least the initial state

    const currentState = undoStack[undoStack.length - 1];
    const prevState = undoStack[undoStack.length - 2];

    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentState]);

    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, nextState]);

    const img = new Image();
    img.src = nextState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const plotGraphOnWhiteboard = (syllabus: "CAPS" | "IEB", year: number, paperType: "p1" | "p1_memo" | "p2" | "p2_memo") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear board first
    ctx.fillStyle = boardroomBgColor; // dynamic slate board background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 25; // 25 pixels per unit

    // 1. Draw Grid Lines
    const isLight = boardroomBgColor === "#ffffff" || boardroomBgColor === "#fafaf9";
    ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.05)" : "#1e293b"; // slate-800 grid lines
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Horizontal grid lines
    for (let y = scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Axes
    ctx.strokeStyle = "#64748b"; // slate-500 axis line
    ctx.lineWidth = 2.5;
    
    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Arrowheads for X-Axis
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(width - 8, centerY - 5);
    ctx.lineTo(width, centerY);
    ctx.lineTo(width - 8, centerY + 5);
    ctx.fill();

    // Arrowheads for Y-Axis
    ctx.beginPath();
    ctx.moveTo(centerX - 5, 8);
    ctx.lineTo(centerX, 0);
    ctx.lineTo(centerX + 5, 8);
    ctx.fill();

    // 3. Axis Labels
    ctx.fillStyle = isLight ? "#334155" : "#94a3b8";
    ctx.font = "bold 10px monospace";
    ctx.fillText("X", width - 15, centerY + 18);
    ctx.fillText("Y", centerX + 10, 15);
    ctx.fillText("0", centerX - 12, centerY + 14);

    // Minor axis numbers
    ctx.fillText("5", centerX + 5 * scale - 3, centerY + 14);
    ctx.fillText("-5", centerX - 5 * scale - 6, centerY + 14);
    ctx.fillText("5", centerX + 6, centerY - 5 * scale + 3);
    ctx.fillText("-5", centerX + 6, centerY + 5 * scale + 3);

    // 4. Plot curves based on question type
    const isPaper1 = paperType.startsWith("p1");

    if (isPaper1) {
      // Paper 1: Logarithmic & Exponential Curves
      // Let's draw f(x) = 3^x in gold
      ctx.strokeStyle = "#eab308"; // gold
      ctx.lineWidth = 3;
      ctx.beginPath();
      let first = true;
      for (let px = 0; px < width; px++) {
        const xVal = (px - centerX) / scale;
        const yVal = Math.pow(3, xVal);
        const py = centerY - yVal * scale;
        if (py >= 0 && py <= height) {
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = "#eab308";
      ctx.fillText("f(x) = 3^x", centerX + 2 * scale, centerY - 7 * scale);

      // Let's draw f^-1(x) = log_3(x) in blue
      ctx.strokeStyle = "#3b82f6"; // blue
      ctx.beginPath();
      first = true;
      for (let px = centerX + 1; px < width; px++) {
        const xVal = (px - centerX) / scale;
        if (xVal > 0) {
          const yVal = Math.log(xVal) / Math.log(3);
          const py = centerY - yVal * scale;
          if (py >= 0 && py <= height) {
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = "#3b82f6";
      ctx.fillText("f^-1(x) = log_3(x)", centerX + 4 * scale, centerY - 1.5 * scale);

      // Let's draw symmetry line y = x in white dashed
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX - 8 * scale, centerY + 8 * scale);
      ctx.lineTo(centerX + 8 * scale, centerY - 8 * scale);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Plot y-intercept for f (0;1) and x-intercept for f^-1 (1;0)
      ctx.fillStyle = "#ef4444"; // red dot
      ctx.beginPath();
      ctx.arc(centerX, centerY - 1 * scale, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText("(0; 1)", centerX + 6, centerY - 1 * scale - 6);

      ctx.beginPath();
      ctx.arc(centerX + 1 * scale, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText("(1; 0)", centerX + 1 * scale + 6, centerY - 6);

    } else {
      // Paper 2: Circle Geometry and Tangent Line
      const radiusPx = 5 * scale;
      const cX = centerX + 2 * scale;
      const cY = centerY + 1 * scale; // coordinates are inverted in canvas y-axis

      ctx.strokeStyle = "#10b981"; // green circle
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cX, cY, radiusPx, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.fillText("(x-2)² + (y+1)² = 25", cX + 2.5 * scale, cY - 2.5 * scale);

      // Center point C(2; -1)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cX, cY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText("C(2; -1)", cX + 8, cY - 4);

      // Point A(5; 3)
      const aX = centerX + 5 * scale;
      const aY = centerY - 3 * scale;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(aX, aY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText("A(5; 3)", aX + 8, aY - 4);

      // Draw Radius CA (dashed red)
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(aX, aY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Draw Tangent line: y = -3/4 x + 27/4 => in pixels
      ctx.strokeStyle = "#eab308"; // gold tangent
      ctx.lineWidth = 3;
      ctx.beginPath();
      let first = true;
      for (let px = 0; px < width; px++) {
        const xVal = (px - centerX) / scale;
        const yVal = -0.75 * xVal + 6.75;
        const py = centerY - yVal * scale;
        if (py >= 0 && py <= height) {
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = "#eab308";
      ctx.fillText("Tangent: y = -¾x + 6¾", centerX + 3 * scale, centerY - 6 * scale);
    }

    // Push system message to chat indicating boardroom graph sync
    setBoardroomMessages(prev => [
      ...prev,
      {
        id: `sys-plot-${Date.now()}`,
        sender: "tutor",
        text: `[Interactive Sync] Projection active! I've loaded the ${syllabus} ${year} ${paperType.toUpperCase().replace("_", " ")} mathematical geometry models onto the board. We can work through this simultaneously.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendBoardroomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardroomInput.trim() || !joiningTutorSession) return;

    const text = boardroomInput.trim();
    setBoardroomInput("");

    const newMsg = {
      id: "stud-" + Date.now(),
      sender: "student" as const,
      text: text,
      time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
    };

    setBoardroomMessages(prev => [...prev, newMsg]);

    // Simulated responsive dialog logic from tutor
    setBoardroomTutorTyping(true);
    setTimeout(() => {
      setBoardroomTutorTyping(false);
      
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes("yes") || lower.includes("know") || lower.includes("familiar") || lower.includes("remember")) {
        reply = `Awesome! Spot on. So looking at our equation: f(x) = x² - 4x + 3. Here, a = 1 and b = -4. \n\nCalculate x = -b / (2a) on your rough pad. What value do you get for x?`;
      } else if (lower.includes("no") || lower.includes("forget") || lower.includes("explain") || lower.includes("how")) {
        reply = `No worries at all, that's exactly why we are upgrading! The formula is x = -b / (2a). \n\nFor f(x) = x² - 4x + 3, our values are a = 1 and b = -4. Let's substitute: x = -(-4) / (2 * 1) = 4 / 2 = 2. \n\nTry drawing a dot on the vertex coordinates V(2, -1) on our board!`;
      } else if (lower.includes("2") || lower.includes("two")) {
        reply = `Exactly! 100% correct! x = 2 is the turning point's x-coordinate. \n\nNow, to find the corresponding Y-coordinate, we substitute x = 2 back into our original equation: y = (2)² - 4(2) + 3. What do you get for y?`;
      } else if (lower.includes("-1") || lower.includes("minus one") || lower.includes("negative one")) {
        reply = `Genius level upgrade! y = -1. So our Vertex is V(2, -1). \n\nYou can see I labeled V(2, -1) at the bottom of the parabola curves. You did amazing there! Let's clear the whiteboard and practice finding a derivative using first principles?`;
      } else {
        reply = `Excellent! Let's continue working on this step by step. Try sketching your calculations on the whiteboard and we'll check it! Amaris whiteboard classrooms are fully interactive!`;
      }

      setBoardroomMessages(prev => [
        ...prev,
        {
          id: "tutor-reply-" + Date.now(),
          sender: "tutor",
          text: reply,
          time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 2000);
  };

  // Export Tutoring Session History & Progress Report as PDF
  const handleExportPDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // COLOR PALETTE (Amaris Navy & Gold Accent)
      const navyDark = [15, 23, 42]; // #0f172a
      const goldAccent = [234, 179, 8]; // #eab308
      const slateText = [71, 85, 105]; // #475569
      const borderSlate = [226, 232, 240]; // #e2e8f0
      const rowAltBg = [248, 250, 252]; // #f8fafc

      // ==========================================
      // PAGE 1: COVER & EXECUTIVE PORTFOLIO
      // ==========================================

      // 1. TOP HEADER BANNER
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, 10, 190, 26, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("AMARIS MATHEMATICS HUB", 15, 20);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text("OFFICIAL PROGRESS REPORT & TUTORING HISTORY PORTFOLIO", 15, 26);
      doc.text("GRADE 10-12 & SECOND-CHANCE MATRIC SPECIALISTS", 15, 31);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("STUDENT COCKPIT", 150, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const todayStr = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
      doc.text(`Generated: ${todayStr}`, 150, 26);
      doc.text("Status: Active Upgrade", 150, 31);

      let y = 44;

      // 2. STUDENT & SPONSOR PROFILE CARD
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(10, y, 190, 42, "F");
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.rect(10, y, 190, 42, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("STUDENT PORTFOLIO PROFILE", 15, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text(`Full Name: ${user.first_name} ${user.surname}`, 15, y + 15);
      doc.text(`Email Address: ${user.email}`, 15, y + 22);
      doc.text(`WhatsApp No: ${user.whatsapp_number || "Not specified"}`, 15, y + 29);
      doc.text(`School/Institution: ${user.school || "Second-Chance Matric Candidate"}`, 15, y + 36);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("PARENT / SPONSOR SPONSORSHIP", 110, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text(`Parent/Sponsor: ${user.parent_name || "N/A"}`, 110, y + 15);
      doc.text(`Parent Mobile: ${user.parent_phone || "N/A"}`, 110, y + 22);
      doc.text(`Curriculum/Grade: ${user.grade || "Grade 12 (CAPS)"}`, 110, y + 29);
      doc.text(`Region/Province: ${user.province || "Gauteng, SA"}`, 110, y + 36);

      y += 50;

      // 3. EXECUTIVE STATS METRICS (BENTO GRID)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("EXECUTIVE PORTAL ENGAGEMENT METRICS", 10, y);

      y += 4;
      const completedCount = bookings.filter(b => b.status === "completed").length;
      const pendingCount = bookings.filter(b => b.status === "confirmed" || b.status === "pending").length;
      const solvedHw = submissions.length;
      const totalHw = assignments.length;
      const completedHours = bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + (b.duration_minutes || 60), 0) / 60;

      // Card 1
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(10, y, 44, 20, "F");
      doc.rect(10, y, 44, 20, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235); // Royal Blue
      doc.text(`${completedHours} Hours`, 15, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("Whiteboards Done", 15, y + 15);

      // Card 2
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(58, y, 44, 20, "F");
      doc.rect(58, y, 44, 20, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text(`${completedCount} / ${bookings.length}`, 63, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("Lessons Completed", 63, y + 15);

      // Card 3
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(106, y, 44, 20, "F");
      doc.rect(106, y, 44, 20, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74); // Green
      doc.text(`${solvedHw} / ${totalHw}`, 111, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("Homework Solved", 111, y + 15);

      // Card 4
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(154, y, 46, 20, "F");
      doc.rect(154, y, 46, 20, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(147, 51, 234); // Purple
      doc.text(`${videoRequests.length} Solved`, 159, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text("On-Demand Videos", 159, y + 15);

      y += 28;

      // 4. TUTORING SESSION HISTORY TABLE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("1. DIGITAL WHITEBOARD TUTORING LESSON HISTORY", 10, y);

      y += 4;
      // Header row
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, y, 190, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text("REF CODE", 13, y + 5);
      doc.text("SUBJECT / MODULE", 38, y + 5);
      doc.text("DATE & SCHEDULED TIME", 95, y + 5);
      doc.text("DURATION", 142, y + 5);
      doc.text("STATUS", 165, y + 5);
      doc.text("FEEDBACK RATING", 182, y + 5);

      y += 7;

      if (bookings.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(slateText[0], slateText[1], slateText[2]);
        doc.text("No active or completed tutoring whiteboard slots recorded in the portal.", 15, y + 6);
        y += 12;
      } else {
        bookings.forEach((bk, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
            doc.rect(10, y, 190, 7, "F");
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);

          // Ref
          doc.text(bk.booking_reference, 13, y + 5);

          // Subject
          const subjName = subjects.find(s => s.id === bk.subject_id)?.name || "Mathematics";
          doc.text(subjName, 38, y + 5);

          // Date & Time
          doc.text(`${bk.lesson_date} @ ${bk.lesson_time} SAST`, 95, y + 5);

          // Duration
          doc.text(`${bk.duration_minutes || 60} Minutes`, 142, y + 5);

          // Status
          if (bk.status === "completed") {
            doc.setTextColor(22, 163, 74); // Green
          } else if (bk.status === "confirmed") {
            doc.setTextColor(37, 99, 235); // Blue
          } else {
            doc.setTextColor(194, 65, 12); // Orange/Yellow
          }
          doc.setFont("helvetica", "bold");
          doc.text(bk.status.toUpperCase(), 165, y + 5);

          // Rating
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          if (bk.rating) {
            doc.text(`${"★".repeat(bk.rating)} (${bk.rating}/5)`, 182, y + 5);
          } else {
            doc.text("Awaiting Review", 182, y + 5);
          }

          y += 7;

          // Page safety checking
          if (y > 275 && idx < bookings.length - 1) {
            doc.addPage();
            y = 20;

            // Re-draw header
            doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
            doc.rect(10, y, 190, 7, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(255, 255, 255);
            doc.text("REF CODE", 13, y + 5);
            doc.text("SUBJECT / MODULE", 38, y + 5);
            doc.text("DATE & SCHEDULED TIME", 95, y + 5);
            doc.text("DURATION", 142, y + 5);
            doc.text("STATUS", 165, y + 5);
            doc.text("FEEDBACK RATING", 182, y + 5);
            y += 7;
          }
        });
      }

      // Footer of Page 1
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.line(10, 282, 200, 282);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Amaris Hub Student Cockpit Portal • Pretoria, South Africa", 15, 288);
      doc.text("Page 1 of 2", 180, 288);


      // ==========================================
      // PAGE 2: HOMEWORK & TUTOR DIAGNOSTIC REMARKS
      // ==========================================
      doc.addPage();
      y = 15;

      // 1. TOP HEADER BANNER (Page 2)
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, y, 190, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("ACADEMIC DIAGNOSTICS & CURRICULUM CHECKLIST", 15, y + 9);

      y += 24;

      // 2. ASSIGNMENTS TABLE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("2. HOMEWORK ASSIGNMENTS & DISCIPLINE LEDGER", 10, y);

      y += 4;
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, y, 190, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text("ASSIGNMENT TITLE & TOPIC", 13, y + 5);
      doc.text("SUBJECT", 75, y + 5);
      doc.text("DUE DATE", 108, y + 5);
      doc.text("STATUS", 136, y + 5);
      doc.text("TUTOR EVALUATION & FEEDBACK", 156, y + 5);

      y += 7;

      if (assignments.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(slateText[0], slateText[1], slateText[2]);
        doc.text("No assignments allocated to this student account yet.", 15, y + 6);
        y += 12;
      } else {
        assignments.forEach((hw, idx) => {
          const submission = submissions.find(sub => sub.assignment_id === hw.id);
          
          if (idx % 2 === 0) {
            doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
            doc.rect(10, y, 190, 15, "F");
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          doc.text(hw.title, 13, y + 5);

          doc.setFont("helvetica", "normal");
          doc.text(hw.subject, 75, y + 5);
          doc.text(hw.due_date, 108, y + 5);

          // Status & colors
          let statusText = "ASSIGNED";
          doc.setTextColor(194, 65, 12); // Orange default

          if (submission) {
            if (submission.status === "reviewed") {
              statusText = "GRADED";
              doc.setTextColor(22, 163, 74); // Green
            } else {
              statusText = "SUBMITTED";
              doc.setTextColor(37, 99, 235); // Blue
            }
          } else {
            doc.setTextColor(220, 38, 38); // Red
          }
          doc.setFont("helvetica", "bold");
          doc.text(statusText, 136, y + 5);

          // Feedback remarks
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          const feedbackVal = submission?.tutor_feedback 
            ? submission.tutor_feedback 
            : submission 
              ? "File uploaded. Awaiting diagnostic feedback score." 
              : "No solution file submitted yet.";
          
          const splitFeedback = doc.splitTextToSize(feedbackVal, 44);
          doc.text(splitFeedback, 156, y + 5);

          y += 15;

          // Page safety
          if (y > 200 && idx < assignments.length - 1) {
            doc.addPage();
            y = 20;

            // Re-draw headers
            doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
            doc.rect(10, y, 190, 7, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(255, 255, 255);
            doc.text("ASSIGNMENT TITLE & TOPIC", 13, y + 5);
            doc.text("SUBJECT", 75, y + 5);
            doc.text("DUE DATE", 108, y + 5);
            doc.text("STATUS", 136, y + 5);
            doc.text("TUTOR EVALUATION & FEEDBACK", 156, y + 5);
            y += 7;
          }
        });
      }

      y += 10;

      // 3. TUTOR REMARKS & ADVICE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("3. DIAGNOSTIC ACADEMIC STANDING & ADVOCACY REPORT", 10, y);

      y += 4;

      doc.setFillColor(254, 243, 199); // Light Warm Amber
      doc.rect(10, y, 190, 48, "F");
      doc.setDrawColor(252, 211, 77); // Amber Border
      doc.rect(10, y, 190, 48, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9); // Deep Amber Text
      doc.text("HEAD TUTOR BETHUEL MOUKANGWE - DIAGNOSTIC ADVICE:", 14, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);

      const adviceText = `Dear ${user.first_name} and parents/sponsors, thank you for choosing Amaris Hub as your mathematical upgrade partner. Based on our live 1-on-1 whiteboard sessions, you demonstrate robust foundational algebra and mathematical modeling skills. However, to guarantee an excellent Level 7 (80%+) distinction in your national CAPS/IEB NSC exams, we recommend intensifying practice on: (a) Circle Geometry theorems and justifications, (b) Calculus Limits from first principles, and (c) Financial annuities and sinking fund calculations. Continual submission of weekly homework and watching our custom whiteboard step-by-step video requests will solidify your exam-room performance. Your upgrade year is a golden doorway to your university and career ambitions. Keep working with standard-setting dedication!`;

      const splitAdvice = doc.splitTextToSize(adviceText, 182);
      doc.text(splitAdvice, 14, y + 14);

      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9);
      doc.text("Bethuel Moukangwe • University of South Africa (UNISA) Graduate & Lead Mathematical Coach", 14, y + 43);

      // Footer of Page 2
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.line(10, 282, 200, 282);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Amaris Mathematics Hub • Pretoria, Gauteng • Official WhatsApp: +27 (0) 72 388 4802", 15, 288);
      doc.text("Page 2 of 2", 180, 288);

      // SAVE THE FILE
      doc.save(`Amaris_Academic_Report_${user.first_name}_${user.surname}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("There was an error generating your PDF: " + error);
    }
  };

  // Export Class Planner and Booked Sessions as PDF
  const handleExportClassPlannerPDF = () => {
    try {
      const doc = new jsPDF();
      
      // COLOR PALETTE (Amaris Navy & Gold Accent)
      const navyDark = [15, 23, 42]; // #0f172a
      const goldAccent = [234, 179, 8]; // #eab308
      const slateText = [71, 85, 105]; // #475569
      const borderSlate = [226, 232, 240]; // #e2e8f0
      const rowAltBg = [248, 250, 252]; // #f8fafc

      // ==========================================
      // COVER & DETAILED SCHEDULING PORTFOLIO
      // ==========================================

      // 1. TOP HEADER BANNER
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, 10, 190, 26, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text("AMARIS MATHEMATICS HUB", 15, 20);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text("STUDENT BOOKED CLASS PLANNER & TIMETABLE SCHEDULING", 15, 26);
      doc.text("GRADE 10-12 & SECOND-CHANCE MATRIC SPECIALISTS", 15, 31);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("CLASS PLANNER", 145, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const todayStr = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
      doc.text(`Generated: ${todayStr}`, 145, 26);
      doc.text("Status: Active Booking Portfolio", 145, 31);

      let y = 44;

      // 2. STUDENT & SPONSOR PROFILE CARD
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(10, y, 190, 36, "F");
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.rect(10, y, 190, 36, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("STUDENT SCHEDULING IDENTITY", 15, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text(`Full Name: ${user.first_name} ${user.surname}`, 15, y + 14);
      doc.text(`Email Address: ${user.email}`, 15, y + 21);
      doc.text(`WhatsApp No: ${user.whatsapp_number || "Not specified"}`, 15, y + 28);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("CURRICULUM & BOOKINGS SUMMARY", 110, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text(`Curriculum/Grade: ${user.grade || "Grade 12 (CAPS)"}`, 110, y + 14);
      doc.text(`Total Booked Classes: ${bookings.length} Sessions`, 110, y + 21);
      const upcomingSessions = bookings.filter(b => b.status !== "completed");
      doc.text(`Upcoming Scheduled: ${upcomingSessions.length} Active Sessions`, 110, y + 28);

      y += 44;

      // 3. BOOKED CLASS PLANNER & SESSION HISTORY
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("BOOKED CLASS TIMETABLE & ACTIVE PLANNED SCHEDULE", 10, y);

      y += 5;

      // Draw table headers
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, y, 190, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("REF / DATE", 13, y + 5);
      doc.text("SUBJECT NAME", 48, y + 5);
      doc.text("TIME & DURATION", 98, y + 5);
      doc.text("PLATFORM / STATUS", 143, y + 5);
      doc.text("MEETING LINK", 175, y + 5);

      y += 8;

      if (bookings.length === 0) {
        doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
        doc.rect(10, y, 190, 15, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(slateText[0], slateText[1], slateText[2]);
        doc.text("No active classes booked or planned in this session history.", 15, y + 9);
        y += 15;
      } else {
        bookings.forEach((bk, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
            doc.rect(10, y, 190, 14, "F");
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(10, y, 190, 14, "F");
          }
          doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
          doc.line(10, y + 14, 200, y + 14);

          // REF / DATE
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          doc.text(bk.booking_reference, 13, y + 5);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.text(bk.lesson_date, 13, y + 10);

          // SUBJECT NAME
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          const subjName = getSubjectName(bk.subject_id);
          const splitSubj = doc.splitTextToSize(subjName, 46);
          doc.text(splitSubj, 48, y + 5);

          // TIME & DURATION
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.text(`${bk.lesson_time} SAST`, 98, y + 5);
          doc.setTextColor(slateText[0], slateText[1], slateText[2]);
          doc.text(`${bk.duration_minutes} Mins (${getPackageName(bk.package_id)})`, 98, y + 10);

          // PLATFORM / STATUS
          doc.setFont("helvetica", "bold");
          const statusText = (bk.status || "CONFIRMED").toUpperCase();
          if (statusText === "COMPLETED") {
            doc.setTextColor(22, 163, 74); // Green
          } else {
            doc.setTextColor(37, 99, 235); // Blue
          }
          doc.text(statusText, 143, y + 5);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(bk.platform || "Google Meet", 143, y + 10);

          // MEETING LINK
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(37, 99, 235);
          const meetLink = bk.meeting_link || "Link not generated yet";
          const splitMeet = doc.splitTextToSize(meetLink, 23);
          doc.text(splitMeet, 175, y + 5);

          y += 14;

          // Page protection safety
          if (y > 260 && idx < bookings.length - 1) {
            doc.addPage();
            y = 20;

            // Re-draw headers on new page
            doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
            doc.rect(10, y, 190, 8, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text("REF / DATE", 13, y + 5);
            doc.text("SUBJECT NAME", 48, y + 5);
            doc.text("TIME & DURATION", 98, y + 5);
            doc.text("PLATFORM / STATUS", 143, y + 5);
            doc.text("MEETING LINK", 175, y + 5);
            y += 8;
          }
        });
      }

      y += 10;

      // Ensure footer doesn't overlap
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      // 4. IMPORTANT STUDENT INSTRUCTIONS & HOUSE RULES
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("AMARIS STUDENT HOUSE RULES & LESSON INSTRUCTIONS", 10, y);

      y += 4;

      doc.setFillColor(239, 246, 255); // Soft Light Blue
      doc.rect(10, y, 190, 38, "F");
      doc.setDrawColor(191, 219, 254); // Light Blue border
      doc.rect(10, y, 190, 38, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 58, 138); // Deep Blue text
      doc.text("KEY INSTRUCTIONS FOR STUDENTS:", 14, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      const instructionsLines = [
        "1. Attendance: Please click your Google Meet or active board link at least 5 minutes before your scheduled class.",
        "2. Cancellations & Rescheduling: Cancellations must be made 24 hours prior to avoid forfeiture of class package credits.",
        "3. Preparation: Ensure you have your textbook, past papers, calculator, and a working internet connection with microphone.",
        "4. WhatsApp Support: You can send immediate maths help queries directly to your lead coach Bethuel via WhatsApp."
      ];

      instructionsLines.forEach((line, lIdx) => {
        doc.text(line, 14, y + 13 + (lIdx * 5));
      });

      // Page footer line
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.line(10, 282, 200, 282);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Amaris Mathematics Hub • Pretoria, Gauteng • Official WhatsApp: +27 (0) 72 388 4802", 15, 288);
      doc.text("Class Planner & Schedule Report Summary", 145, 288);

      // SAVE THE FILE
      doc.save(`Amaris_Class_Planner_${user.first_name}_${user.surname}.pdf`);
    } catch (error) {
      console.error("PDF class planner generation failed:", error);
      alert("There was an error generating your Class Planner PDF: " + error);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  if (!user) return null;

  // Group completed lessons per week for Learning Activity graph
  const getWeeklyActivityData = () => {
    const weeksList: { start: Date; end: Date; label: string; completed: number }[] = [];
    const refDate = new Date(2026, 6, 8); // July 8, 2026
    
    // Find Monday of the current week
    const day = refDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    // Generate last 6 weeks (from 5 weeks ago to this week)
    for (let i = 5; i >= 0; i--) {
      const wStart = new Date(monday);
      wStart.setDate(monday.getDate() - i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);
      wEnd.setHours(23, 59, 59, 999);
      
      const label = `Wk of ${wStart.toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}`;
      
      weeksList.push({
        start: wStart,
        end: wEnd,
        label,
        completed: 0
      });
    }

    // Populate actual completed bookings
    bookings.forEach((b) => {
      if (b.status === "completed" && b.lesson_date) {
        const bDate = new Date(b.lesson_date);
        for (const wk of weeksList) {
          if (bDate >= wk.start && bDate <= wk.end) {
            wk.completed += 1;
            break;
          }
        }
      }
    });

    // Check if there are any completed bookings at all
    const totalCompleted = weeksList.reduce((sum, wk) => sum + wk.completed, 0);
    if (totalCompleted === 0) {
      // Seed nice looking illustrative learning curve if student hasn't completed lessons yet
      weeksList[0].completed = 1;
      weeksList[1].completed = 2;
      weeksList[2].completed = 1;
      weeksList[3].completed = 3;
      weeksList[4].completed = 2;
      weeksList[5].completed = 0;
    }

    return weeksList.map((wk) => ({
      week: wk.label,
      "Completed Lessons": wk.completed
    }));
  };

  // Filter and sort quiz/test scores from the last 30 days
  const getLastMonthScores = () => {
    const today = new Date("2026-07-12T06:30:00-07:00");
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return mockScores
      .filter((score) => {
        const scoreDate = new Date(score.exam_date);
        return scoreDate >= thirtyDaysAgo && scoreDate <= today;
      })
      .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())
      .map(score => ({
        ...score,
        // formatted date for XAxis
        formattedDate: new Date(score.exam_date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
        // Key for recharts data y-value
        "Score %": score.score_percentage
      }));
  };

  // Log a quick quiz score directly from overview
  const handleQuickQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuizTitle.trim()) {
      alert("Please specify a quiz or test title.");
      return;
    }
    if (!quickQuizTopic) {
      alert("Please select a relevant mathematics topic.");
      return;
    }

    try {
      dbAPI.addMockExamScore({
        student_id: user?.id || "",
        exam_title: quickQuizTitle.trim(),
        subject_or_topic: quickQuizTopic,
        score_percentage: Number(quickQuizScore),
        exam_date: quickQuizDate,
        notes: quickQuizNotes.trim() || undefined
      });

      // Reload
      loadRecords();
      
      // Reset form states
      setQuickQuizTitle("");
      setQuickQuizTopic("");
      setQuickQuizScore(75);
      setQuickQuizNotes("");
      setShowQuickQuizForm(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to log score.");
    }
  };

  // PROFILE SAVE HANDLER
  const onProfileSave = (data: Partial<Profile>) => {
    try {
      const updated = dbAuth.updateProfile(data);
      onProfileUpdate(updated);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile: " + err);
    }
  };

  // BOOKING WIZARD SUBMIT
  const onBookingWizardSubmit = (data: any) => {
    try {
      const topicArray = data.topics ? data.topics.split(",").map((t: string) => t.trim()) : ["Curriculum Upgrade Focus"];
      dbAPI.createBooking({
        student_id: user.id,
        subject_id: data.subject_id,
        package_id: data.package_id,
        lesson_date: data.lesson_date,
        lesson_time: data.lesson_time,
        duration_minutes: 60,
        platform: "Google Meet",
        topics_to_cover: topicArray,
        notes: data.notes
      });
      alert("Lesson successfully booked! Payment receipt generated.");
      setBookingWizardOpen(false);
      resetBooking();
      loadRecords();
    } catch (err) {
      alert("Error booking: " + err);
    }
  };

  // VIDEO REQUEST SUBMIT
  const onVideoRequestSubmit = (data: any) => {
    try {
      dbAPI.createVideoRequest({
        student_id: user.id,
        subject: data.subject,
        chapter_title: data.chapter_title,
        description: data.description,
        document_urls: ["#"],
        document_names: ["Attached_Problem_Statement.jpg"],
        price: 150
      });
      alert("On-demand video request filed! Our tutors will review and record your solutions shortly.");
      setVideoWizardOpen(false);
      resetVideo();
      loadRecords();
    } catch (err) {
      alert("Error submitting request: " + err);
    }
  };

  // HOMEWORK FILE SELECT
  const handleHwFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // SUBMIT HOMEWORK FILE (Simulated progress counter & image base64 conversion)
  const uploadHomeworkFile = async (assignmentId: string) => {
    if (!selectedFile) {
      alert("Please select a file to upload first!");
      return;
    }
    
    setUploadProgress(10);

    let fileUrl = "#";
    if (selectedFile.type.startsWith("image/")) {
      try {
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "#");
          reader.onerror = () => resolve("#");
          reader.readAsDataURL(selectedFile);
        });
      } catch (err) {
        fileUrl = "#";
      }
    }

    const fileToSubmit = selectedFile;
    const notesToSubmit = homeworkNotes;

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Save submission to database
            dbAPI.submitHomework({
              assignment_id: assignmentId,
              student_id: user.id,
              file_url: fileUrl,
              file_name: fileToSubmit.name,
              file_type: fileToSubmit.type,
              file_size: (fileToSubmit.size / (1024 * 1024)).toFixed(1) + " MB",
              notes: notesToSubmit,
              tutor_feedback: ""
            });

            setSelectedFile(null);
            setUploadProgress(null);
            setHomeworkNotes("");
            setActiveUploadHwId(null);
            loadRecords();
            alert("Homework uploaded successfully! Instructor Bethuel has been notified to grade your submission.");
          }, 800);
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  // DELETE SUBMISSION
  const handleDeleteSubmission = (subId: string, assignId: string) => {
    if (confirm("Are you sure you want to withdraw this homework submission?")) {
      dbAPI.deleteSubmission(subId, assignId);
      loadRecords();
      alert("Submission withdrawn successfully.");
    }
  };

  const handleMarkHwComplete = (assignmentId: string) => {
    dbAPI.updateHomeworkAssignmentStatus(assignmentId, "completed");
    loadRecords();
  };

  const handleMarkHwAssigned = (assignmentId: string) => {
    dbAPI.updateHomeworkAssignmentStatus(assignmentId, "assigned");
    loadRecords();
  };

  // DOWNLOAD CALENDAR SCHEDULE ICS HANDLER
  const handleDownloadScheduleICS = () => {
    const activeBookings = bookings.filter(b => b.status === "confirmed" || b.status === "pending");

    if (activeBookings.length === 0) {
      alert("You have no upcoming tutoring sessions to download.");
      return;
    }

    const formatICSDateLocal = (dateStr: string, timeStr: string, minutesToAdd = 0) => {
      try {
        const [year, month, day] = dateStr.split("-").map(Number);
        const [hour, minute] = timeStr.split(":").map(Number);
        const date = new Date(year, month - 1, day, hour, minute);
        if (minutesToAdd > 0) {
          date.setMinutes(date.getMinutes() + minutesToAdd);
        }
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const h = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        const s = String(date.getSeconds()).padStart(2, "0");
        return `${y}${m}${d}T${h}${min}${s}`;
      } catch (e) {
        return dateStr.replace(/-/g, "") + "T" + timeStr.replace(/:/g, "") + "00";
      }
    };

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Amaris Mathematics Hub//Tutoring Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    activeBookings.forEach(bk => {
      const subjectName = getSubjectName(bk.subject_id);
      const startStr = formatICSDateLocal(bk.lesson_date, bk.lesson_time);
      const endStr = formatICSDateLocal(bk.lesson_date, bk.lesson_time, bk.duration_minutes || 60);
      const topicsStr = bk.topics_to_cover.join(", ");
      
      const escapeText = (str: string) => {
        return str
          .replace(/\\/g, "\\\\")
          .replace(/;/g, "\\;")
          .replace(/,/g, "\\,")
          .replace(/\n/g, "\\n");
      };

      const summary = `Tutoring: ${subjectName}`;
      const description = `Tutoring session with Amaris Mathematics Hub.\\n\\nReference: ${bk.booking_reference}\\nPlatform: ${bk.platform}\\nTopics: ${topicsStr}\\nNotes: ${bk.notes || 'None'}\\n\\nJoin meeting: ${bk.meeting_link || 'TBA'}`;
      const location = bk.platform === "Google Meet" && bk.meeting_link ? bk.meeting_link : bk.platform;

      icsContent.push("BEGIN:VEVENT");
      icsContent.push(`UID:${bk.id}@amarismathshub.co.za`);
      icsContent.push(`DTSTAMP:${startStr}Z`);
      icsContent.push(`DTSTART:${startStr}`);
      icsContent.push(`DTEND:${endStr}`);
      icsContent.push(`SUMMARY:${escapeText(summary)}`);
      icsContent.push(`DESCRIPTION:${escapeText(description)}`);
      icsContent.push(`LOCATION:${escapeText(location)}`);
      icsContent.push("STATUS:CONFIRMED");
      icsContent.push("END:VEVENT");
    });

    icsContent.push("END:VCALENDAR");

    const icsString = icsContent.join("\r\n");
    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Amaris_Maths_Schedule_${user?.first_name || "Student"}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingleBookingICS = (bk: Booking) => {
    const formatICSDateLocal = (dateStr: string, timeStr: string, minutesToAdd = 0) => {
      try {
        const [year, month, day] = dateStr.split("-").map(Number);
        const [hour, minute] = timeStr.split(":").map(Number);
        const date = new Date(year, month - 1, day, hour, minute);
        if (minutesToAdd > 0) {
          date.setMinutes(date.getMinutes() + minutesToAdd);
        }
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const h = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        const s = String(date.getSeconds()).padStart(2, "0");
        return `${y}${m}${d}T${h}${min}${s}`;
      } catch (e) {
        return dateStr.replace(/-/g, "") + "T" + timeStr.replace(/:/g, "") + "00";
      }
    };

    const subjectName = getSubjectName(bk.subject_id);
    const startStr = formatICSDateLocal(bk.lesson_date, bk.lesson_time);
    const endStr = formatICSDateLocal(bk.lesson_date, bk.lesson_time, bk.duration_minutes || 60);
    const topicsStr = bk.topics_to_cover.join(", ");
    
    const escapeText = (str: string) => {
      return str
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
    };

    const summary = `Tutoring: ${subjectName}`;
    const description = `Tutoring session with Amaris Mathematics Hub.\\n\\nReference: ${bk.booking_reference}\\nPlatform: ${bk.platform}\\nTopics: ${topicsStr}\\nNotes: ${bk.notes || 'None'}\\n\\nJoin meeting: ${bk.meeting_link || 'TBA'}`;
    const location = bk.platform === "Google Meet" && bk.meeting_link ? bk.meeting_link : bk.platform;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Amaris Mathematics Hub//Tutoring Session//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${bk.id}@amarismathshub.co.za`,
      `DTSTAMP:${startStr}Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `LOCATION:${escapeText(location)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    const icsString = icsContent.join("\r\n");
    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Amaris_Maths_Lesson_${bk.booking_reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get matching subject name helper
  const getSubjectName = (subId: string) => {
    return subjects.find(s => s.id === subId)?.name || "Mathematics";
  };

  // Student Attendance Check-in Toast State
  const [attendanceToast, setAttendanceToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    status: "on_time" | "late" | "present";
    sheetsSynced: boolean;
  } | null>(null);

  // Handle student session join & real-time attendance logging to Google Sheets
  const handleJoinSessionWithAttendance = async (
    bk: Booking, 
    platformOverride?: "Google Meet" | "Zoom Whiteboard" | "Interactive Classroom"
  ) => {
    const meetUrl = bk.meeting_link || "https://meet.google.com";
    
    // Open meeting window immediately so pop-up blockers don't block it
    const newWindow = window.open(meetUrl, "_blank", "noopener,noreferrer");

    try {
      const subjectTitle = getSubjectName(bk.subject_id);
      const { record, sheetsSynced } = await recordAndLogAttendance(bk, user, {
        platform: platformOverride || (bk.platform === "Zoom" ? "Zoom Whiteboard" : "Google Meet"),
        subjectName: subjectTitle,
        calendarEventId: bk.calendar_event_id,
        calendarEventLink: bk.calendar_event_link
      });

      // Update local state bookings
      if (user) {
        setBookings(dbAPI.getBookings(user.id));
      }

      setAttendanceToast({
        show: true,
        title: `Attendance Checked-In: ${record.status === "on_time" ? "On-Time" : record.status === "late" ? "Late Arrival" : "Present"}`,
        message: `Your attendance for "${subjectTitle}" is recorded and logged to Google Sheets for Admin analytics.`,
        status: record.status as any,
        sheetsSynced: sheetsSynced
      });

      setTimeout(() => {
        setAttendanceToast(null);
      }, 5000);
    } catch (err) {
      console.warn("Attendance log notification error:", err);
    }
  };

  // Get matching package name helper
  const getPackageName = (pkgId: string) => {
    return packages.find(p => p.id === pkgId)?.name || "Single Lesson Package";
  };

  // Goal management utility functions
  const handleToggleGoal = (id: string) => {
    setSessionGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleDeleteGoal = (id: string) => {
    setSessionGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = {
      id: "goal-" + Date.now(),
      text: newGoalText.trim(),
      completed: false,
      targetDate: newGoalDate || new Date().toISOString().split("T")[0]
    };
    setSessionGoals(prev => [...prev, newGoal]);
    setNewGoalText("");
    setNewGoalDate("");
  };

  // Export Upcoming Schedule and Session Goals as a downloadable PDF study plan
  const handleExportStudyPlanPDF = () => {
    if (!user) return;
    try {
      const doc = new jsPDF();
      
      // COLOR PALETTE (Amaris Navy & Gold Accent)
      const navyDark = [15, 23, 42]; // #0f172a
      const goldAccent = [234, 179, 8]; // #eab308
      const slateText = [71, 85, 105]; // #475569
      const borderSlate = [226, 232, 240]; // #e2e8f0
      const rowAltBg = [248, 250, 252]; // #f8fafc
      const greenAccent = [16, 185, 129]; // #10b981
      const amberAccent = [245, 158, 11]; // #f59e0b

      // ==========================================
      // COVER & HEADER BANNER
      // ==========================================
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, 10, 190, 28, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("AMARIS MATHEMATICS HUB", 15, 20);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text("OFFLINE REINFORCEMENT & STUDY PLANNER FOR GRADE 10-12 CAPS / IEB", 15, 26);
      doc.text("CURRICULUM UPGRADERS, TRIAL EXAMS & MATRIC FINAL ROADMAP", 15, 31);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("STUDY PLAN", 145, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const todayStr = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
      doc.text(`Generated: ${todayStr}`, 145, 26);
      doc.text("Type: Personal Study Plan", 145, 31);

      let y = 46;

      // ==========================================
      // STUDENT PROFILE INFORMATION CARD
      // ==========================================
      doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
      doc.rect(10, y, 190, 32, "F");
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.rect(10, y, 190, 32, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("STUDENT IDENTITY", 15, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      doc.text(`Full Name: ${user.first_name} ${user.surname}`, 15, y + 14);
      doc.text(`Email Address: ${user.email}`, 15, y + 21);
      doc.text(`Grade/Curriculum: ${user.grade || "Grade 12 (CAPS)"}`, 15, y + 27);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("STUDY PROGRESS INDICATORS", 110, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      const completedSessions = bookings.filter(b => b.status === "completed").length;
      const upcomingSessions = bookings.filter(b => b.status !== "completed");
      const activeGoalsCount = sessionGoals.length;
      const completedGoalsCount = sessionGoals.filter(g => g.completed).length;

      doc.text(`Completed Lessons: ${completedSessions} Sessions`, 110, y + 14);
      doc.text(`Upcoming Scheduled: ${upcomingSessions.length} Lessons`, 110, y + 21);
      doc.text(`Session Study Goals: ${completedGoalsCount} of ${activeGoalsCount} Mastered`, 110, y + 27);

      y += 40;

      // ==========================================
      // SECTION A: UPCOMING TUTORING & CLASS SCHEDULE
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("UPCOMING WHITEBOARD TUTORING CLASSES", 10, y);

      y += 5;

      // Table headers
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, y, 190, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("DATE & TIME", 13, y + 5);
      doc.text("MATHEMATICAL TOPIC / COVERAGE", 65, y + 5);
      doc.text("DURATION", 135, y + 5);
      doc.text("PLATFORM LINK", 160, y + 5);

      y += 8;

      if (upcomingSessions.length === 0) {
        doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
        doc.rect(10, y, 190, 12, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(slateText[0], slateText[1], slateText[2]);
        doc.text("No upcoming scheduled whiteboard sessions. Book a slot to sync your live calendar.", 15, y + 8);
        y += 12;
      } else {
        upcomingSessions.slice(0, 5).forEach((bk, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
            doc.rect(10, y, 190, 11, "F");
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(10, y, 190, 11, "F");
          }
          doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
          doc.line(10, y + 11, 200, y + 11);

          // DATE & TIME
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          doc.text(`${bk.lesson_date} @ ${bk.lesson_time}`, 13, y + 7);

          // TOPIC / SUBJECT
          doc.setFont("helvetica", "normal");
          const subjName = getSubjectName(bk.subject_id);
          const topicsCombined = bk.topics_to_cover.join(", ");
          const textToShow = `${subjName} - ${topicsCombined}`;
          const splitText = doc.splitTextToSize(textToShow, 65);
          doc.text(splitText, 65, y + 7);

          // DURATION
          doc.text(`${bk.duration_minutes} Mins`, 135, y + 7);

          // MEETING LINK
          doc.setTextColor(29, 78, 216); // Blue color for link
          doc.text("Join Google Meet Link", 160, y + 7);
          doc.setTextColor(slateText[0], slateText[1], slateText[2]);

          y += 11;
        });
      }

      y += 12;

      // ==========================================
      // SECTION B: PERSONAL STUDY & SESSION GOALS
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text("ACTIVE STUDY GOALS & REINFORCEMENT CHECKLIST", 10, y);

      y += 5;

      // Table headers
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, y, 190, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("STATUS", 13, y + 5);
      doc.text("GOAL REQUIREMENT / DESCRIPTION", 45, y + 5);
      doc.text("TARGET COMPLETION DATE", 145, y + 5);

      y += 8;

      if (sessionGoals.length === 0) {
        doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
        doc.rect(10, y, 190, 12, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(slateText[0], slateText[1], slateText[2]);
        doc.text("No academic goals defined yet. Set goals on your Student dashboard to map out your study path.", 15, y + 8);
        y += 12;
      } else {
        sessionGoals.forEach((goal, idx) => {
          // Auto-page breaks if y exceeds page limits
          if (y > 260) {
            doc.addPage();
            y = 20;
            // Redraw table headers on new page
            doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
            doc.rect(10, y, 190, 8, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text("STATUS", 13, y + 5);
            doc.text("GOAL REQUIREMENT / DESCRIPTION", 45, y + 5);
            doc.text("TARGET COMPLETION DATE", 145, y + 5);
            y += 8;
          }

          if (idx % 2 === 0) {
            doc.setFillColor(rowAltBg[0], rowAltBg[1], rowAltBg[2]);
            doc.rect(10, y, 190, 11, "F");
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(10, y, 190, 11, "F");
          }
          doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
          doc.line(10, y + 11, 200, y + 11);

          // STATUS indicator
          if (goal.completed) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
            doc.text("[ MASTERED ]", 13, y + 7);
          } else {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(amberAccent[0], amberAccent[1], amberAccent[2]);
            doc.text("[ PENDING ]", 13, y + 7);
          }

          // GOAL TEXT
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          const splitGoal = doc.splitTextToSize(goal.text, 95);
          doc.text(splitGoal, 45, y + 7);

          // TARGET DATE
          doc.setFont("helvetica", "bold");
          doc.text(goal.targetDate, 145, y + 7);

          y += 11;
        });
      }

      y += 12;

      // ==========================================
      // SECTION C: OFFLINE PREPARATION GUIDE
      // ==========================================
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(10, y, 190, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("AMARIS OFFLINE STUDY METHODOLOGY & STUDY PLAN", 13, y + 5);

      y += 8;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.rect(10, y, 190, 34, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);

      const tips = [
        "1. First-Principles Formula Proofs: Always practice deriving formula booklet formulas from first principles.",
        "2. Past Paper Repetition: Solve at least 3 CAPS/IEB exam question papers (2015-2025) before your trials/finals.",
        "3. Active Boardroom Tutoring: Draw, plot, and write directly on the Amaris Digital Whiteboard with Tutor Bethuel.",
        "4. Immediate Feedback Loops: Upload your homework and worksheet solutions to clear concepts and correct marks."
      ];

      tips.forEach((tip, tIdx) => {
        doc.text(tip, 14, y + 8 + (tIdx * 6));
      });

      // Page footer line
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.line(10, 282, 200, 282);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Amaris Mathematics Hub • Pretoria, Gauteng • Official WhatsApp: +27 (0) 72 388 4802", 15, 288);
      doc.text("Downloadable Personal Study Plan & Study Goals Booklet", 130, 288);

      // SAVE THE FILE
      doc.save(`Amaris_Study_Plan_${user.first_name}_${user.surname}.pdf`);
    } catch (error) {
      console.error("PDF Study Plan generation failed:", error);
      alert("There was an error generating your Study Plan PDF: " + error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 10-Min Pre-Session Web Push Notification Banner */}
      {!isFocusMode && (
        <StudySessionNotificationBanner
          notification={activeBannerNotification}
          onDismiss={dismissBanner}
          onSnooze={snoozeBanner}
          onNavigateToSession={() => setActiveTab("resources")}
        />
      )}
      
      {/* Focus Mode Sticky Banner vs Normal Welcome Hero Banner */}
      {isFocusMode ? (
        <div className="bg-gradient-to-r from-navy-900 via-royal-950 to-navy-900 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-5 mb-6 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold shrink-0">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Distraction-Free Workspace Active
                </span>
                <span className="text-[10px] font-mono text-navy-300 hidden sm:inline">
                  [Press Esc to Exit]
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight mt-0.5">
                Math Problem Solving Focus Workspace
              </h2>
            </div>
          </div>

          {/* Quick Focus Mode Navigation Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 font-mono text-xs font-bold scrollbar-none">
            {[
              { id: "overview", label: "Overview" },
              { id: "flashcards", label: "Flashcards" },
              { id: "resources", label: "Resources" },
              { id: "ai_tutor", label: "AI Tutor" },
              { id: "study_group", label: "Study Group" },
              { id: "homework", label: "Homework" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === item.id
                    ? "bg-amber-500 text-navy-950 border-amber-400 font-black shadow-md"
                    : "bg-navy-800/80 text-navy-200 border-navy-700 hover:bg-navy-750"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleFocusMode}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs rounded-xl border border-rose-500/50 shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            id="btn-exit-focus-mode"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Focus Mode (Esc)</span>
          </button>
        </div>
      ) : (
        /* Welcome Hero Banner */
        <div className="bg-gradient-to-r from-navy-900 via-royal-850 to-navy-950 text-white rounded-2xl p-6 sm:p-7 mb-8 border border-navy-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle Ambient Background Highlight */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 text-left pr-0 md:pr-36">
            <div className="flex items-center gap-3">
              <AmarisLogo variant="icon" size="sm" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-gold-400 bg-gold-400/15 px-2.5 py-0.5 rounded-full border border-gold-400/30">
                  Active Upgrade Student
                </span>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Ayo, {user.first_name} {user.surname}!
            </h1>
            <p className="text-xs text-navy-200 max-w-xl leading-relaxed">
              Welcome to your Amaris Hub student cockpit. Here you can reserve live 1-on-1 whiteboards, upload math homework worksheets, read tutor feedback, and request on-demand video explanations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
            <button 
              onClick={() => setBookingWizardOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 font-extrabold text-xs rounded-xl shadow hover:shadow-lg transition-transform hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Book Live Lesson
            </button>
          </div>

          {/* Floating 'Deep Focus' Mode Toggle Button in Top-Right Corner of Dashboard Header */}
          <button
            type="button"
            onClick={toggleFocusMode}
            className="md:absolute md:top-5 md:right-6 bg-gradient-to-r from-amber-500 via-amber-400 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-slate-950 font-mono font-black text-xs px-4 py-2.5 rounded-2xl border-2 border-amber-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer z-20 shrink-0 group"
            title="Trigger Deep Focus distraction-free view"
            id="btn-deep-focus-header-toggle"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>Deep Focus Mode</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION RAIL (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="lg:col-span-3 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="block text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider">Portal Navigation</span>
              <button
                onClick={toggleFocusMode}
                className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                title="Enter Focus Mode"
              >
                <Maximize2 className="w-3 h-3" /> Focus
              </button>
            </div>
          
          <button 
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview Cockpit
          </button>

          <button 
            onClick={() => setActiveTab("recent_activity")}
            id="nav-tab-recent-activity"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "recent_activity" 
                ? "bg-gradient-to-r from-royal-50 to-gold-500/5 dark:from-navy-850 dark:to-gold-400/5 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm border border-royal-100 dark:border-gold-400/20" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-gold-500" />
              <span>Recent Activity</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-500/10 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Log</span>
          </button>

          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "notifications" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className={`w-4 h-4 ${notifications.filter(n => !n.is_read).length > 0 ? "text-amber-500" : ""}`} />
              <span>Notification Center</span>
            </div>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("lessons")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "lessons" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Live Lessons ({bookings.length})
          </button>

          <button 
            onClick={() => setActiveTab("tutors")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tutors" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Tutor Profiles</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
              {tutors.filter(t => t.is_available).length} Ready
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("homework")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "homework" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Homework Center ({assignments.length})
          </button>

          <button 
            onClick={() => setActiveTab("resources")}
            id="nav-tab-resources"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "resources" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4" />
              <span>Resource Library</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 px-1.5 py-0.5 rounded">PDFs</span>
          </button>

          <button 
            onClick={() => setActiveTab("math_glossary")}
            id="nav-tab-math-glossary"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "math_glossary" 
                ? "bg-gradient-to-r from-amber-500/15 via-gold-500/10 to-royal-900/10 text-gold-600 dark:text-gold-400 font-extrabold shadow-sm border border-gold-500/30" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookMarked className="w-4 h-4 text-gold-500" />
              <span>Mathematics Glossary</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-500/20 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/30">CAPS/IEB</span>
          </button>

          <button 
            onClick={() => setActiveTab("study_schedule")}
            id="nav-tab-study-schedule"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "study_schedule" 
                ? "bg-gradient-to-r from-gold-500/20 via-amber-500/15 to-royal-900/10 text-gold-600 dark:text-gold-400 font-extrabold shadow-sm border border-gold-500/40" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" />
              <span>30-Min Exam Schedule</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-500/20 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/30">30m Plan</span>
          </button>

          <button 
            onClick={() => setActiveTab("test_runner")}
            id="nav-tab-test-runner"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "test_runner" 
                ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-royal-900/10 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm border border-emerald-500/40" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>QA & Test Automation</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">CI/CD</span>
          </button>

          {(user?.role === "admin" || user?.role === "tutor") && (
            <button 
              onClick={() => setActiveTab("ops_excellence")}
              id="nav-tab-ops-excellence"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ops_excellence" 
                  ? "bg-gradient-to-r from-royal-500/20 via-indigo-500/15 to-navy-900/10 text-royal-600 dark:text-gold-400 font-extrabold shadow-sm border border-gold-500/40" 
                  : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-gold-500" />
                <span>Operational Health</span>
              </div>
              <span className="text-[9px] font-mono font-black bg-gold-500/20 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/30">ADMIN</span>
            </button>
          )}

          <button 
            onClick={() => setActiveTab("study_group")}
            id="nav-tab-study-group"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "study_group" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-royal-500 dark:text-gold-400" />
              <span>Peer Study Rooms</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">Live</span>
          </button>

          <button 
            onClick={() => setActiveTab("videos")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "videos" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <Video className="w-4 h-4" />
            Video requests ({videoRequests.length})
          </button>

          <button 
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "payments" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payments Ledger ({payments.length})
          </button>

          <button 
            onClick={() => setActiveTab("announcements")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "announcements" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </div>
            {announcements.length > 0 && (
              <span className="bg-amber-500 text-navy-950 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                {announcements.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("progress_tracker")}
            id="nav-tab-progress-tracker"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "progress_tracker" 
                ? "bg-gradient-to-r from-amber-500/10 to-gold-500/10 text-amber-600 dark:text-gold-400 font-extrabold shadow-sm border border-amber-500/20" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Syllabus & Topic Mastery</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-gold-400 px-1.5 py-0.5 rounded uppercase tracking-wider">CAPS/IEB</span>
          </button>

          <button 
            onClick={() => setActiveTab("knowledge_graph")}
            id="nav-tab-knowledge-graph"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "knowledge_graph" 
                ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm border border-emerald-500/20" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Network className="w-4 h-4 text-emerald-500" />
              <span>D3 Knowledge Graph</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">CAPS/IEB</span>
          </button>

          <button 
            onClick={() => setActiveTab("achievements")}
            id="nav-tab-achievements"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "achievements" 
                ? "bg-gradient-to-r from-gold-500/10 to-amber-500/10 text-gold-600 dark:text-gold-400 font-extrabold shadow-sm border border-gold-500/20" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-gold-500" />
              <span>Badges & Achievements</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-500/10 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Earned</span>
          </button>

          <button 
            onClick={() => setActiveTab("global_leaderboard")}
            id="nav-tab-global-leaderboard"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "global_leaderboard" 
                ? "bg-gradient-to-r from-gold-500/15 via-amber-500/10 to-royal-900/10 text-gold-600 dark:text-gold-400 font-extrabold shadow-sm border border-gold-500/30" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-gold-500" />
              <span>Global Leaderboard</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-500/20 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/30">Top 10</span>
          </button>

          <button 
            onClick={() => setActiveTab("performance")}
            id="nav-tab-performance"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "performance" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <span>Mock Performance</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 px-1.5 py-0.5 rounded">80%+</span>
          </button>

          <button 
            onClick={() => setActiveTab("exam_predictor")}
            id="nav-tab-exam-predictor"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "exam_predictor" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <span>AI Exam Predictor</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-400/10 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Predictor</span>
          </button>

          <button 
            onClick={() => setActiveTab("tutor_reports")}
            id="nav-tab-tutor-reports"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tutor_reports" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <span>Tutor Progress Reports</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-400/10 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Reports</span>
          </button>

          <button 
            onClick={() => setActiveTab("ai_tutor")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ai_tutor" 
                ? "bg-gradient-to-r from-royal-50 to-amber-500/5 dark:from-navy-850 dark:to-gold-400/5 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm border border-royal-100 dark:border-gold-400/20" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Ask Tutor Bethuel</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">AI</span>
          </button>

          <button 
            onClick={() => setActiveTab("direct_tutor_chat")}
            id="nav-tab-direct-tutor-chat"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "direct_tutor_chat" 
                ? "bg-gradient-to-r from-royal-50 to-emerald-500/5 dark:from-navy-850 dark:to-emerald-400/5 text-royal-700 dark:text-emerald-400 font-extrabold shadow-sm border border-royal-100 dark:border-emerald-400/20" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Direct Tutor Messaging</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">1-on-1</span>
          </button>

          <button 
            onClick={() => setActiveTab("whatsapp_automation")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "whatsapp_automation" 
                ? "bg-gradient-to-r from-royal-50 to-emerald-500/5 dark:from-navy-850 dark:to-emerald-400/5 text-royal-700 dark:text-emerald-400 font-extrabold shadow-sm border border-royal-100 dark:border-emerald-400/20" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp Auto-Bot</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Auto</span>
          </button>

          <button 
            onClick={() => setIsQrScannerOpen(true)}
            id="nav-tab-qr-scanner"
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-gradient-to-r from-gold-400/15 via-amber-500/10 to-gold-400/15 hover:from-gold-400/25 hover:to-amber-500/25 text-navy-950 dark:text-gold-400 border border-gold-400/30 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-4 h-4 text-gold-500" />
              <span>Scan Study Material QR</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-400 text-navy-950 px-1.5 py-0.5 rounded uppercase tracking-wider">Scanner</span>
          </button>

          <button 
            onClick={() => setActiveTab("subject_quiz")}
            id="nav-tab-subject-quiz"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "subject_quiz" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <span>Subject Quiz Mode</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Exam Quiz</span>
          </button>

          <button 
            onClick={() => setActiveTab("formula_library")}
            id="nav-tab-formula-library"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "formula_library" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookMarked className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <span>Formula Library</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-amber-400/10 text-amber-600 dark:text-gold-400 px-1.5 py-0.5 rounded uppercase tracking-wider">CAPS/IEB</span>
          </button>

          <button 
            onClick={() => setActiveTab("latex_editor")}
            id="nav-tab-latex-editor"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "latex_editor" 
                ? "bg-gradient-to-r from-amber-500/10 via-gold-500/10 to-blue-500/10 text-amber-600 dark:text-gold-400 font-extrabold shadow-sm border border-amber-500/30" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>LaTeX Math Editor</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">KaTeX</span>
          </button>

          <button 
            onClick={() => setActiveTab("flashcards")}
            id="nav-tab-flashcards"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "flashcards" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <span>Formula Flashcards</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-gold-400/10 text-gold-600 dark:text-gold-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Revision</span>
          </button>

          <button 
            onClick={() => setActiveTab("focus_history")}
            id="nav-tab-focus-history"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "focus_history" 
                ? "bg-gradient-to-r from-amber-500/15 via-gold-500/15 to-royal-500/15 text-amber-600 dark:text-gold-400 font-extrabold shadow-sm border border-amber-500/30" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Focus History</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Deep Focus</span>
          </button>

          <button 
            onClick={() => setActiveTab("session_review")}
            id="nav-tab-session-review"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "session_review" 
                ? "bg-gradient-to-r from-amber-500/15 via-gold-500/15 to-royal-500/15 text-amber-600 dark:text-gold-400 font-extrabold shadow-sm border border-amber-500/30" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Session Review Cards</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Print Cards</span>
          </button>

          <button 
            onClick={() => setActiveTab("arcade_mode")}
            id="nav-tab-arcade-mode"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "arcade_mode" 
                ? "bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-purple-500/20 text-purple-600 dark:text-amber-400 font-extrabold shadow-sm border border-purple-500/30" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>Arcade Mode</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-purple-500/15 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-wider">Velocity</span>
          </button>

          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile" 
                ? "bg-royal-50 dark:bg-navy-850 text-royal-700 dark:text-gold-400 font-extrabold shadow-sm" 
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <User className="w-4 h-4" />
            Profile Manager
          </button>
        </aside>
        )}

        {/* PRIMARY PANEL CONTENT AREA */}
        <main className={`${isFocusMode ? "lg:col-span-12 w-full" : "lg:col-span-9"} bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-6 sm:p-8 rounded-2xl shadow-sm min-h-[500px] transition-all`}>
          
          {isFetchingData ? (
            <DashboardOverviewSkeleton />
          ) : (
            <>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            isFocusMode ? (
              <DeepFocusWorkspace user={user} onExitFocusMode={toggleFocusMode} />
            ) : (
              <div className="space-y-8 animate-fadeIn text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white">Active Cockpit Overview</h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400">A quick glance of your pending mathematics modules, upcoming sessions, and recent logs.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsPrintPreviewOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-navy-800 to-royal-900 border border-gold-400/30 hover:border-gold-400 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                    title="Preview generated math worksheet layout before sending to printer"
                  >
                    <Printer className="w-3.5 h-3.5 text-gold-400" />
                    <span>Worksheet Print Preview</span>
                  </button>
                  <ExportProgressPDF user={user} />
                </div>
              </div>

              {/* DAILY STREAK COUNTER RETENTION ENGINE */}
              <DailyStreakCounter user={user} />

              {/* WEEKLY INSIGHTS AI GENERATOR (AGREGATES QUIZ, POMODORO FOCUS & MODULE PROGRESS FROM FIRESTORE) */}
              <WeeklyInsightsGenerator user={user} onNavigateTab={(tab) => setActiveTab(tab as TabType)} />

              {/* DAILY CHALLENGE QUIZ WIDGET */}
              <DailyChallengeQuiz user={user} />

              {/* STUDENT RANK & BADGES SYSTEM BASED ON DAILY MATH CHALLENGES */}
              <StudentRankSystem user={user} />

              {/* STUDENT BADGES & ACHIEVEMENTS SHOWCASE */}
              <Badges user={user} onNavigateTab={(tab) => setActiveTab(tab as TabType)} />

              {/* POMODORO FOCUS SESSION TIMER */}
              <FocusSessionTimer user={user} />

              {/* DEEP FOCUS SESSION LOGGER & HISTORY WIDGET */}
              <FocusHistoryWidget user={user} onStartFocusSession={toggleFocusMode} onOpenSessionReview={() => setActiveTab("session_review")} />

              {/* ARCADE MODE TOP SCORERS & VELOCITY LEADERBOARD WIDGET */}
              <ArcadeTopScorersWidget user={user} onLaunchArcade={() => setActiveTab("arcade_mode")} />

              {/* CURRICULUM SYLLABUS ROADMAP VISUALIZATION */}
              <CurriculumRoadmap 
                user={user} 
                onSelectTopicForPractice={() => setActiveTab("resources")} 
              />

              {/* WEEKLY STUDY HOUR GOALS & D3 PROGRESS RING CHART */}
              <WeeklyStudyGoalRing user={user} />

              {/* WEEKLY DRAG & DROP STUDY PLANNER */}
              <WeeklyStudyPlanner user={user} />

              {/* INTERACTIVE MATH GLOSSARY & FORMULA FINDER */}
              <InteractiveMathGlossary />

              {/* RICH-TEXT LATEX MATH FORMULA EDITOR */}
              <LatexMathEditor 
                onSendToTutor={(latex) => {
                  setActiveTab("ai_tutor");
                }}
              />

              {/* PERSONALIZED DIFFICULT FORMULA BANK */}
              <div className="flex justify-end mb-2">
                <FormulaSheetModal user={user} />
              </div>
              <PersonalizedFormulaBank user={user} />

              {/* RECHARTS STUDENT IMPROVEMENT & TRAJECTORY VISUALIZER */}
              <StudentImprovementVisualizer 
                user={user} 
                onNavigateTab={(tab) => setActiveTab(tab as TabType)} 
              />

              {/* RECHARTS TOPIC IMPROVEMENT & SCORE TRAJECTORY CHART */}
              <TopicImprovementChart user={user} />

              {/* VOICE MEMOS & AUDIO REMINDERS RECORDER */}
              <VoiceMemosRecorder user={user} />

              {/* MONTHLY STUDY STREAK HEATMAP CALENDAR */}
              <StudyStreakCalendar user={user} />

              {/* NATIONAL CAPS / IEB GLOBAL STUDENT LEADERBOARD */}
              <GlobalLeaderboard 
                user={user} 
                onTakeQuiz={() => setActiveTab("subject_quiz")}
                onTakeDailyChallenge={() => {
                  setActiveTab("overview");
                  setTimeout(() => {
                    document.getElementById("daily-streak-widget")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              />

              {/* ENROLLED SUBJECTS COURSE PROGRESS CIRCULAR TRACKER */}
              <CourseProgress
                user={user}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              />

              {/* STUDENT MILESTONES & MODULE BADGES AWARD SECTION */}
              <StudentMilestones
                user={user}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              />

              {/* REGISTERED MATHEMATICS SUBJECTS LEARNING PROGRESS CIRCULAR VISUALIZER */}
              <LearningProgress 
                user={user} 
                onNavigateTab={(tab) => setActiveTab(tab as TabType)} 
              />

              {/* SUBJECT MASTERY HEATMAP MATRIX COMPONENT */}
              <SubjectMastery
                user={user}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              />

              {/* D3.JS INTERACTIVE LEARNING PROGRESS DASHBOARD WIDGET */}
              <LearningProgressDashboard 
                onOpenTopicDetail={() => setActiveTab("progress_tracker")}
              />

              {/* VISUAL TOPIC & MODULE PROGRESS TRACKER (FETCED FROM USER PROFILE DATABASE) */}
              <VisualTopicProgressTracker 
                user={user} 
                onOpenResourceLibrary={() => setActiveTab("resources")} 
              />

              {/* Dynamic Syllabus Topic Mastery Progress Section */}
              <OverviewTopicMastery
                onOpenTracker={() => setActiveTab("progress_tracker")}
                onOpenKnowledgeGraph={() => setActiveTab("knowledge_graph")}
              />

              {/* Student Achievements & Motivation Highlights */}
              <OverviewAchievementsCard
                onViewAllBadges={() => setActiveTab("achievements")}
              />

              {/* Post-Tutoring Session Feedback Form */}
              {bookings.filter(b => (b.status === "completed" || (b.status === "confirmed" && isSessionTimePassed(b.lesson_date, b.lesson_time))) && !b.rating && !dismissedFeedbackIds.includes(b.id)).length > 0 && (
                (() => {
                  const pendingFeedbackBk = bookings.find(b => (b.status === "completed" || (b.status === "confirmed" && isSessionTimePassed(b.lesson_date, b.lesson_time))) && !b.rating && !dismissedFeedbackIds.includes(b.id));
                  if (!pendingFeedbackBk) return null;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden"
                      id={`feedback-card-${pendingFeedbackBk.id}`}
                    >
                      {/* Background accent */}
                      <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <Sparkles className="w-48 h-48 text-amber-500" />
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/20 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Post-Lesson Feedback Pending
                            </span>
                            <h3 className="text-sm font-black text-navy-900 dark:text-white mt-1.5 leading-tight">
                              Rate Your Tutoring Session with Bethuel Moukangwe
                            </h3>
                            <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1">
                              Your lesson on <strong className="text-navy-700 dark:text-navy-300 font-bold">{pendingFeedbackBk.lesson_date} ({pendingFeedbackBk.lesson_time} SAST)</strong> is marked complete! Help us sustain standard-setting matric excellence.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDismissFeedback(pendingFeedbackBk.id)}
                          className="p-1 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-lg text-navy-400 transition-colors cursor-pointer"
                          title="Skip Feedback"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      <div className="bg-white dark:bg-navy-950 p-4 rounded-xl border border-navy-150 dark:border-navy-850 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-navy-900 dark:text-white">
                              {getSubjectName(pendingFeedbackBk.subject_id)}
                            </p>
                            <p className="text-[10px] text-navy-400 dark:text-navy-400 font-mono">
                              Booking Ref: <span className="font-bold text-royal-600 dark:text-gold-400">{pendingFeedbackBk.booking_reference}</span> | Duration: {pendingFeedbackBk.duration_minutes} Minutes
                            </p>
                          </div>

                          {/* Star rating selector */}
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setInlineFeedbackRating(star)}
                                className="p-0.5 cursor-pointer transition-transform hover:scale-115"
                                title={`Rate ${star} Star${star > 1 ? "s" : ""}`}
                              >
                                <Star 
                                  className={`w-6.5 h-6.5 transition-colors ${
                                    star <= inlineFeedbackRating 
                                      ? "text-amber-500 fill-current" 
                                      : "text-navy-200 dark:text-navy-700 hover:text-amber-400"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-[10px] font-mono font-black text-navy-700 dark:text-navy-300 ml-1.5 bg-navy-50 dark:bg-navy-900 px-2.5 py-0.5 rounded border border-navy-100 dark:border-navy-800">
                              {inlineFeedbackRating === 5 ? "Excellent! (5/5)" :
                               inlineFeedbackRating === 4 ? "Great (4/5)" :
                               inlineFeedbackRating === 3 ? "Good (3/5)" :
                               inlineFeedbackRating === 2 ? "Below Avg (2/5)" : "Needs Work (1/5)"}
                            </span>
                          </div>
                        </div>

                        {/* Comment input & submit with Visual LaTeX Toolbar */}
                        <div className="space-y-2">
                          <VisualLatexToolbar
                            label="What doubts did Bethuel clarify or how can we improve?"
                            value={inlineFeedbackRemarks}
                            onChange={setInlineFeedbackRemarks}
                            placeholder="e.g. Bethuel explained tangent calculus proofs (\frac{df}{dx} = 2x) incredibly well! Feel much more confident."
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDismissFeedback(pendingFeedbackBk.id)}
                              className="px-3 py-2 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-850 text-navy-600 dark:text-navy-400 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              Skip
                            </button>
                            <button
                              onClick={() => handleInlineFeedbackSubmit(pendingFeedbackBk.id)}
                              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-black rounded-xl text-xs transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                            >
                              Submit Feedback & Rate
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()
              )}

              {/* Stats bento rows */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-navy-50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-100 dark:border-navy-850 space-y-1">
                  <span className="text-[10px] font-mono text-navy-400 uppercase block">Reserved Lessons</span>
                  <div className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-royal-500" />
                    <span>{bookings.length} Hours Tutored</span>
                  </div>
                </div>

                <div className="bg-navy-50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-100 dark:border-navy-850 space-y-1">
                  <span className="text-[10px] font-mono text-navy-400 uppercase block">Homework Handed In</span>
                  <div className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <span>{submissions.length} / {assignments.length} Solved</span>
                  </div>
                </div>

                <div className="bg-navy-50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-100 dark:border-navy-850 space-y-1">
                  <span className="text-[10px] font-mono text-navy-400 uppercase block">Custom Video Requests</span>
                  <div className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-500" />
                    <span>{videoRequests.length} Video Explanations</span>
                  </div>
                </div>
              </div>

              {/* Visual Progress & Milestones Tracker */}
              <StudentProgressTracker bookings={bookings} user={user} />

              {/* Dynamic Matric Exam Countdown Widget */}
              <MatricCountdown />

              {/* Exam Mode Timer Simulator Widget */}
              <ExamModeTimerWidget user={user} />

              {/* Dual-Graph Visualizations Panel (Learning Activity & Quiz Performance) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Activity completed lessons per week chart */}
                <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1 text-left">
                        <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-royal-500" />
                          Learning Activity Graph
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-navy-400">Weekly breakdown of completed whiteboard tutoring sessions</p>
                      </div>
                      <div className="flex items-center gap-4 bg-navy-50 dark:bg-navy-950 px-3.5 py-1.5 rounded-xl border border-navy-100 dark:border-navy-850 self-start sm:self-auto">
                        <div className="text-left font-mono">
                          <span className="text-[10px] text-navy-400 uppercase block">Completed Sessions</span>
                          <span className="text-sm font-black text-royal-600 dark:text-gold-400">
                            {bookings.filter(b => b.status === "completed").length} Lessons
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-64 sm:h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getWeeklyActivityData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800" />
                          <XAxis dataKey="week" tick={{ fontSize: 10 }} className="text-navy-400 font-mono" />
                          <YAxis tick={{ fontSize: 10 }} className="text-navy-400 font-mono" allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ fontSize: 11, background: "#0f172a", border: "none", color: "#fff", borderRadius: 8 }}
                            cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                          />
                          <Bar dataKey="Completed Lessons" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                            {getWeeklyActivityData().map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index === 5 ? "#eab308" : "#2563eb"} 
                                className="transition-all hover:opacity-80"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Quiz & Assessment Scores (Last Month) */}
                <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          Quiz & Assessment Progress
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-navy-400">Diagnostic trial & class quiz scores over the last month</p>
                      </div>
                      
                      <button
                        onClick={() => setShowQuickQuizForm(!showQuickQuizForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-mono text-xs font-bold rounded-lg shadow-sm transition-all self-start sm:self-auto"
                      >
                        {showQuickQuizForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {showQuickQuizForm ? "Close Form" : "Log Score"}
                      </button>
                    </div>

                    {/* Quick Quiz Log Form */}
                    {showQuickQuizForm && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleQuickQuizSubmit}
                        className="mb-6 p-4 bg-navy-50 dark:bg-navy-950/60 rounded-xl border border-navy-100 dark:border-navy-850 space-y-3"
                      >
                        <h4 className="text-xs font-bold font-mono text-navy-800 dark:text-navy-200 uppercase tracking-wider">
                          Quick Log New Quiz Score
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-navy-500 dark:text-navy-400 mb-1 font-mono">
                              Quiz / Assessment Title *
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Limits Pop Quiz, Trig Test"
                              value={quickQuizTitle}
                              onChange={(e) => setQuickQuizTitle(e.target.value)}
                              className="w-full text-xs bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase text-navy-500 dark:text-navy-400 mb-1 font-mono">
                              Curriculum Module Topic *
                            </label>
                            <select
                              required
                              value={quickQuizTopic}
                              onChange={(e) => setQuickQuizTopic(e.target.value)}
                              className="w-full text-xs bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2 py-1.5 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                            >
                              <option value="">-- Choose Module --</option>
                              <option value="Algebra & Nature of Roots">Algebra & Nature of Roots</option>
                              <option value="Number Patterns & Series">Number Patterns & Series</option>
                              <option value="Functions & Graphs">Functions & Graphs</option>
                              <option value="Financial Mathematics">Financial Mathematics</option>
                              <option value="Differential Calculus">Differential Calculus</option>
                              <option value="Probability & Counting">Probability & Counting</option>
                              <option value="Analytical Geometry">Analytical Geometry</option>
                              <option value="Trigonometry & Geometry">Trigonometry & Euclidean Proofs</option>
                              <option value="Statistics & Data Handling">Statistics & Data Handling</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-black uppercase text-navy-500 dark:text-navy-400 mb-1 font-mono flex justify-between">
                              <span>Mark Secured:</span>
                              <span className="text-royal-600 dark:text-gold-400 font-bold">{quickQuizScore}%</span>
                            </label>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={quickQuizScore}
                              onChange={(e) => setQuickQuizScore(Number(e.target.value))}
                              className="w-full h-1 bg-navy-250 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-450"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase text-navy-500 dark:text-navy-400 mb-1 font-mono">
                              Test Date
                            </label>
                            <input 
                              type="date" 
                              required
                              value={quickQuizDate}
                              onChange={(e) => setQuickQuizDate(e.target.value)}
                              className="w-full text-xs bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2 py-1 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-navy-500 dark:text-navy-400 mb-1 font-mono">
                            Short Notes / Remarks (Optional)
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. Mastered reduction rules, lost marks on general solution step"
                            value={quickQuizNotes}
                            onChange={(e) => setQuickQuizNotes(e.target.value)}
                            className="w-full text-xs bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowQuickQuizForm(false)}
                            className="px-3 py-1 text-navy-500 dark:text-navy-400 text-xs font-bold rounded-md hover:bg-navy-100 dark:hover:bg-navy-900 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                          >
                            Save Score
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {/* Chart Area */}
                    {getLastMonthScores().length > 0 ? (
                      <div className="h-64 sm:h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getLastMonthScores()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800" />
                            <XAxis 
                              dataKey="formattedDate" 
                              tick={{ fontSize: 10 }} 
                              className="text-navy-400 font-mono" 
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              tick={{ fontSize: 10 }} 
                              className="text-navy-400 font-mono" 
                              ticks={[0, 20, 40, 60, 80, 100]}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload as MockExamScore;
                                  return (
                                    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-xl max-w-xs space-y-1 text-left">
                                      <div className="text-[10px] text-navy-400 font-mono font-bold uppercase tracking-wider">{data.exam_date}</div>
                                      <div className="text-xs font-black text-white">{data.exam_title}</div>
                                      <div className="text-[11px] font-mono font-medium text-emerald-400">
                                        Score: {data.score_percentage}% 
                                        {data.score_percentage >= 80 ? " (Distinction Level 7 🏆)" : data.score_percentage >= 50 ? " (Passed ⚡)" : " (Requires Practice)"}
                                      </div>
                                      <div className="text-[10px] text-slate-300 font-mono italic">Topic: {data.subject_or_topic}</div>
                                      {data.notes && <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 mt-1">{data.notes}</div>}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <ReferenceLine 
                              y={80} 
                              stroke="#eab308" 
                              strokeDasharray="4 4" 
                              label={{ value: 'Distinction (80%)', fill: '#eab308', fontSize: 9, position: 'insideBottomRight', offset: 5 }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Score %" 
                              stroke="#10b981" 
                              strokeWidth={2.5}
                              fillOpacity={1} 
                              fill="url(#scoreColor)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 sm:h-72 border border-dashed border-navy-200 dark:border-navy-800 rounded-xl p-6 text-center bg-navy-50/25 dark:bg-navy-950/10">
                        <Award className="w-10 h-10 text-navy-400 dark:text-navy-500 mb-2.5 animate-pulse" />
                        <h4 className="text-xs font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider">No Quiz Scores Recorded in Last Month</h4>
                        <p className="text-[11px] text-navy-500 dark:text-navy-400 max-w-xs mt-1">
                          Log your class quizzes, baseline marks, or test achievements over the last month to render your progress line.
                        </p>
                        <button
                          onClick={() => setShowQuickQuizForm(true)}
                          className="mt-4 px-3.5 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-mono text-[10px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Log Your First Score
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Upcoming Live Class Indicator */}
              <div className="border border-royal-200 dark:border-navy-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-royal-600 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>Next Live Whiteboard Session</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                    Confirmed Slot
                  </span>
                </div>
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-royal-50/25 dark:bg-navy-950/20">
                  {bookings.length > 0 ? (
                    <>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-navy-900 dark:text-white">{getSubjectName(bookings[0].subject_id)}</h4>
                        <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">
                          Date: {bookings[0].lesson_date} @ {bookings[0].lesson_time} ({bookings[0].duration_minutes} Mins)
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {bookings[0].topics_to_cover.map((t, idx) => (
                            <span key={idx} className="text-[9px] bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center w-full sm:w-auto">
                        <a 
                          href={bookings[0].meeting_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Join Google Meet Room
                        </a>
                        <button
                          onClick={handleDownloadScheduleICS}
                          className="px-4 py-2 bg-white dark:bg-navy-850 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors hover:bg-navy-50 dark:hover:bg-navy-750 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Download Calendar (.ics)
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 w-full space-y-2">
                      <AlertCircle className="w-8 h-8 text-navy-400 mx-auto" />
                      <p className="text-xs text-navy-500 dark:text-navy-400">No upcoming live classes scheduled. Click "Book Live Lesson" above to secure your slot!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Goals & Study Plan Center */}
              <div className="border border-navy-150 dark:border-navy-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-navy-900/40 space-y-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-100 dark:border-navy-850">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500 animate-pulse" />
                      Session Goals & Study Plan Center
                    </h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400">Define your targeted academic goals and export your complete schedule offline.</p>
                  </div>
                  
                  <button
                    onClick={handleExportStudyPlanPDF}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 text-xs font-black rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                    title="Export study goals & schedule as a printable PDF study plan"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Study Plan</span>
                  </button>
                </div>

                {/* Info Alert Banner about Offline Reference */}
                <div className="p-4 bg-royal-50/45 dark:bg-navy-950/25 border border-royal-100 dark:border-navy-800 rounded-xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-royal-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-navy-900 dark:text-white">Printable Study Companion</h4>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed">
                      Taking your preparation offline reduces digital fatigue. Set your upcoming weekly targets, check off modules as you master them with Coach Bethuel, and keep your physical study timetable updated.
                    </p>
                  </div>
                </div>

                {/* Goals Checklist List */}
                <div className="space-y-2.5">
                  {sessionGoals.length > 0 ? (
                    sessionGoals.map(goal => (
                      <div 
                        key={goal.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          goal.completed 
                            ? "bg-emerald-500/5 border-emerald-500/20 text-navy-500 dark:text-navy-400" 
                            : "bg-navy-50/50 dark:bg-navy-950/20 border-navy-100 dark:border-navy-800 text-navy-900 dark:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleGoal(goal.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                              goal.completed 
                                ? "bg-emerald-500 border-emerald-600 text-white" 
                                : "border-navy-300 dark:border-navy-700 hover:border-royal-500 bg-white dark:bg-navy-900"
                            }`}
                            title={goal.completed ? "Mark as pending" : "Mark as mastered"}
                          >
                            {goal.completed && <Check className="w-3.5 h-3.5 font-bold" />}
                          </button>
                          
                          <div className="space-y-0.5">
                            <span className={`text-xs font-medium block leading-tight ${goal.completed ? "line-through text-navy-400 dark:text-navy-500" : ""}`}>
                              {goal.text}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider block">
                              Target Date: {goal.targetDate} {goal.completed && " • (Mastered)"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 hover:bg-red-500/10 text-navy-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete study goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-navy-150 dark:border-navy-800 rounded-xl space-y-1">
                      <p className="text-xs text-navy-400 italic">No custom session goals set yet.</p>
                      <p className="text-[10px] text-navy-400">Map out your study route by writing your first mathematical goal below!</p>
                    </div>
                  )}
                </div>

                {/* Form to Add New Goal */}
                <form onSubmit={handleAddGoal} className="pt-2 border-t border-navy-100 dark:border-navy-850">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex-1">
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Master NSC Euclidean Geometry Theorems & proofs..."
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 dark:placeholder-navy-500 focus:outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="w-36 shrink-0 relative">
                        <input 
                          type="date"
                          required
                          value={newGoalDate}
                          onChange={(e) => setNewGoalDate(e.target.value)}
                          className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                          title="Target Completion Date"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-navy-900 hover:bg-navy-800 dark:bg-navy-800 dark:hover:bg-navy-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Goal</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Daily Homework Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-royal-500" />
                      Daily Homework
                    </h3>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400">
                      View your daily mathematical assignments, submit steps for grading, or mark them completed.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("homework")}
                    className="text-[10px] text-royal-600 dark:text-gold-400 font-bold hover:underline self-start sm:self-center cursor-pointer"
                  >
                    View Homework Center
                  </button>
                </div>

                <div className="space-y-2.5">
                  {assignments.length > 0 ? (
                    [...assignments]
                      .sort((a, b) => {
                        const subA = submissions.find((s) => s.assignment_id === a.id);
                        const subB = submissions.find((s) => s.assignment_id === b.id);
                        const timeA = Math.max(
                          new Date(a.created_at || "").getTime() || 0,
                          subA ? new Date(subA.created_at || "").getTime() || 0 : 0
                        );
                        const timeB = Math.max(
                          new Date(b.created_at || "").getTime() || 0,
                          subB ? new Date(subB.created_at || "").getTime() || 0 : 0
                        );
                        if (timeB !== timeA) return timeB - timeA;
                        return b.id.localeCompare(a.id, undefined, { numeric: true });
                      })
                      .map((hw, idx) => {
                      return (
                        <div 
                          key={hw.id} 
                          className={`p-4 bg-white dark:bg-navy-950 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                            idx === 0
                              ? "border-royal-400/60 dark:border-royal-500/40 ring-1 ring-royal-500/10 shadow-sm"
                              : hw.status === "completed" 
                              ? "border-emerald-500/30 bg-emerald-500/5" 
                              : hw.status === "graded"
                              ? "border-emerald-500/20"
                              : hw.status === "submitted"
                              ? "border-amber-500/20"
                              : "border-navy-150 dark:border-navy-850"
                          }`}
                        >
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              {idx === 0 && (
                                <span className="text-[9px] font-mono font-black bg-royal-600 text-white px-2 py-0.5 rounded uppercase">
                                  Latest Task
                                </span>
                              )}
                              <h4 className="text-xs font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  hw.status === "graded" ? "bg-emerald-500" :
                                  hw.status === "completed" ? "bg-blue-500" :
                                  hw.status === "submitted" ? "bg-amber-500" : "bg-red-500"
                                }`} />
                                <span className={hw.status === "completed" ? "line-through text-navy-400 dark:text-navy-500" : ""}>
                                  {hw.title}
                                </span>
                                {hw.status === "completed" && (
                                  <span className="text-[9px] font-mono font-bold text-blue-500 uppercase tracking-wide bg-blue-500/10 px-1.5 py-0.5 rounded">
                                    Done
                                  </span>
                                )}
                              </h4>
                            </div>
                            <p className={`text-[10px] ${hw.status === "completed" ? "text-navy-400 line-through" : "text-navy-500 dark:text-navy-400"}`}>
                              {hw.description}
                            </p>
                            <p className="text-[9px] font-mono text-navy-400 mt-1">
                              Due Date: <b className="text-navy-700 dark:text-navy-300">{hw.due_date}</b> | Subject: {hw.subject}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                            {hw.status === "assigned" ? (
                              <>
                                <button
                                  onClick={() => handleMarkHwComplete(hw.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Mark homework as complete"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Mark Complete</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveUploadHwId(hw.id);
                                    setActiveTab("homework");
                                  }}
                                  className="px-2.5 py-1.5 bg-royal-600 hover:bg-royal-700 text-white text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Upload Working</span>
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded ${
                                  hw.status === "completed" ? "text-blue-600 bg-blue-50 dark:bg-blue-950/20" :
                                  hw.status === "submitted" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" :
                                  "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                                }`}>
                                  {hw.status === "completed" ? "Completed" :
                                   hw.status === "submitted" ? "Pending Grading" : "Graded & Reviewed"}
                                </span>
                                
                                {hw.status === "completed" && (
                                  <button
                                    onClick={() => handleMarkHwAssigned(hw.id)}
                                    className="text-[10px] text-navy-400 hover:text-red-500 font-bold font-mono transition-colors cursor-pointer"
                                    title="Undo completion"
                                  >
                                    Undo
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 border border-dashed border-navy-150 dark:border-navy-850 rounded-xl">
                      <p className="text-xs text-navy-400 italic">No assigned homework found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Academy Broadcasts */}
              <div className="space-y-3 pt-4 border-t border-navy-100 dark:border-navy-850">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-gold-500 animate-pulse" />
                    Latest Academy Broadcasts
                  </h3>
                  <button 
                    onClick={() => setActiveTab("announcements")}
                    className="text-[10px] text-royal-600 dark:text-gold-400 font-bold hover:underline"
                  >
                    View All ({announcements.length})
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcements.slice(0, 2).map(ann => (
                    <div 
                      key={ann.id}
                      onClick={() => setActiveTab("announcements")}
                      className={`p-4 rounded-xl border text-xs text-left cursor-pointer hover:border-royal-400 dark:hover:border-gold-500 transition-all ${
                        ann.is_urgent 
                          ? "bg-red-50/20 dark:bg-red-950/5 border-red-200 dark:border-red-900/40" 
                          : "bg-white dark:bg-navy-950 border-navy-150 dark:border-navy-850"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                          ann.category === "Exam Prep" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                          ann.category === "Academic" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                          ann.category === "Schedule" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}>
                          {ann.category}
                        </span>
                        <span className="text-[9px] text-navy-400 font-mono">{ann.created_at}</span>
                      </div>
                      <h4 className="font-extrabold text-navy-900 dark:text-white line-clamp-1">{ann.title}</h4>
                      <p className="text-[11px] text-navy-500 dark:text-navy-400 line-clamp-2 mt-1 leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-xs text-navy-400 italic md:col-span-2">No announcements published yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Activity Chronological History Widget */}
              <RecentActivityWidget user={user} onNavigateTab={(tab) => setActiveTab(tab as TabType)} />

            </div>
            )
          )}

          {/* RECENT ACTIVITY DEDICATED TAB */}
          {activeTab === "recent_activity" && (
            <div className="animate-fadeIn">
              <RecentActivityWidget user={user} onNavigateTab={(tab) => setActiveTab(tab as TabType)} />
            </div>
          )}

          {/* FOCUS HISTORY DEDICATED TAB */}
          {activeTab === "focus_history" && (
            <div className="animate-fadeIn">
              <FocusHistoryWidget user={user} onStartFocusSession={toggleFocusMode} />
            </div>
          )}

          {/* ARCADE MODE DEDICATED TAB */}
          {activeTab === "arcade_mode" && (
            <div className="animate-fadeIn">
              <ArcadeModeWidget user={user} />
            </div>
          )}

          {/* NOTIFICATION CENTER TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fadeIn text-left animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-800 pb-4">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5.5 h-5.5 text-royal-600 dark:text-gold-400" />
                    Amaris Notification Command Center
                  </h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    Real-time alerts for newly uploaded custom whiteboard recorded videos and vacant tutoring time slots.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      dbAPI.markAllNotificationsAsRead(user.id);
                      loadRecords();
                    }}
                    className="px-3.5 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-mono font-black rounded-lg text-[10px] transition-colors cursor-pointer"
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete all notifications?")) {
                        localStorage.setItem("amh_notifications", JSON.stringify([]));
                        loadRecords();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-300 font-mono font-black border border-navy-200 dark:border-navy-700 rounded-lg text-[10px] transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* SIMULATION DESK PANEL */}
              <div className="bg-gradient-to-r from-royal-600/10 via-amber-500/5 to-transparent border border-royal-200/50 dark:border-navy-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" />
                  <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">
                    Interactive Tutor Simulation Desk (Test Real-Time Alerts)
                  </h3>
                </div>
                <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-normal">
                  Since there is no external server hosting, you can use this simulation desk to act as a Tutor. Clicking any button below instantly dispatches a background notification, triggering the real-time slide-in toast alert and audio chime!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      const titles = [
                        "Differential Calculus First Principles Proof",
                        "Trigonometric Double-Angle Identities Solution",
                        "Quadratic Formula CAPS derivation breakdown",
                        "Euclidean Circle Geometry Theorem 4 Proof"
                      ];
                      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
                      dbAPI.addNotification({
                        student_id: user.id,
                        title: "🎥 Whiteboard Video Solution Uploaded!",
                        message: `Tutor Bethuel has successfully recorded and uploaded your requested video explanation for '${randomTitle}'. Click Watch now!`,
                        type: "video_uploaded",
                        metadata: {
                          video_title: randomTitle,
                          tutor_name: "Bethuel Moukangwe"
                        }
                      });
                      loadRecords();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 text-navy-850 dark:text-navy-200 rounded-xl font-bold font-mono text-[10px] transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>🎥 Upload video</span>
                  </button>

                  <button
                    onClick={() => {
                      const days = ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"];
                      const times = ["10:00 - 11:00", "15:00 - 16:00", "18:00 - 19:00"];
                      const tutorsList = ["Bethuel Moukangwe", "Thabo Mokoena", "Naledi Dlamini"];
                      const randDay = days[Math.floor(Math.random() * days.length)];
                      const randTime = times[Math.floor(Math.random() * times.length)];
                      const randTutor = tutorsList[Math.floor(Math.random() * tutorsList.length)];
                      
                      dbAPI.addNotification({
                        student_id: "all",
                        title: "📅 New Tutoring Slot Available!",
                        message: `Tutor ${randTutor} has opened a new live virtual boardroom slot on ${randDay}s at ${randTime}. Click to secure!`,
                        type: "slot_available",
                        metadata: {
                          tutor_name: randTutor,
                          slot_date: randDay,
                          slot_time: randTime
                        }
                      });
                      loadRecords();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 text-navy-850 dark:text-navy-200 rounded-xl font-bold font-mono text-[10px] transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>📅 Open tutor slot</span>
                  </button>

                  <button
                    onClick={() => {
                      dbAPI.addNotification({
                        student_id: user.id,
                        title: "⚙️ System: Mid-Year Exam Timetable Released",
                        message: "The National Senior Certificate (NSC) final exam schedule is now published. Please coordinate with Tutor Bethuel to refine your Study Booster Plan.",
                        type: "system"
                      });
                      loadRecords();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 text-navy-850 dark:text-navy-200 rounded-xl font-bold font-mono text-[10px] transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>⚙️ System notice</span>
                  </button>
                </div>
              </div>

              {/* NOTIFICATION FILTER SWITCHER */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {(["all", "video_uploaded", "slot_available", "system"] as const).map((type) => {
                  const label = type === "all" ? "All alerts" :
                                type === "video_uploaded" ? "Video explanations" :
                                type === "slot_available" ? "Tutoring availability" : "System notices";
                  const count = type === "all" 
                    ? notifications.length 
                    : notifications.filter(n => n.type === type).length;
                  const isActive = notifFilter === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setNotifFilter(type)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-navy-900 dark:bg-gold-500 border-navy-900 dark:border-gold-500 text-white dark:text-navy-950 font-black"
                          : "bg-white dark:bg-navy-950 border-navy-150 dark:border-navy-850 text-navy-600 dark:text-navy-300 hover:border-navy-300"
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${isActive ? "bg-white/20 text-white" : "bg-navy-50 dark:bg-navy-800 text-navy-400"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* LIST OF NOTIFICATIONS */}
              <div className="space-y-3">
                {notifications
                  .filter(n => notifFilter === "all" || n.type === notifFilter)
                  .map((notif) => {
                    let cardBorder = "border-navy-150 dark:border-navy-800";
                    let accentBar = "bg-navy-400";
                    let iconBg = "bg-navy-50 dark:bg-navy-950 border-navy-200";
                    let iconColor = "text-navy-600";
                    let iconElem = <Bell className="w-4 h-4" />;

                    if (notif.type === "video_uploaded") {
                      cardBorder = "border-purple-200 dark:border-purple-950/40";
                      accentBar = "bg-purple-500";
                      iconBg = "bg-purple-500/10 border-purple-200 dark:border-purple-950/50";
                      iconColor = "text-purple-600 dark:text-purple-400";
                      iconElem = <Video className="w-4 h-4" />;
                    } else if (notif.type === "slot_available") {
                      cardBorder = "border-emerald-200 dark:border-emerald-950/40";
                      accentBar = "bg-emerald-500";
                      iconBg = "bg-emerald-500/10 border-emerald-200 dark:border-emerald-950/50";
                      iconColor = "text-emerald-600 dark:text-emerald-400";
                      iconElem = <Calendar className="w-4 h-4" />;
                    } else if (notif.type === "system") {
                      cardBorder = "border-amber-200 dark:border-amber-950/40";
                      accentBar = "bg-amber-500";
                      iconBg = "bg-amber-500/10 border-amber-200 dark:border-amber-950/50";
                      iconColor = "text-amber-600 dark:text-amber-400";
                      iconElem = <Settings className="w-4 h-4" />;
                    }

                    return (
                      <div
                        key={notif.id}
                        className={`bg-white dark:bg-navy-950/40 rounded-xl border ${cardBorder} p-4 sm:p-5 flex gap-4 transition-all hover:scale-[1.005] hover:shadow-sm relative overflow-hidden text-left ${
                          !notif.is_read ? "ring-1 ring-royal-600/10 dark:ring-gold-500/10" : ""
                        }`}
                      >
                        {/* Status bar */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${accentBar}`} />

                        {/* Icon */}
                        <div className={`p-2.5 border rounded-xl h-fit ${iconBg} ${iconColor}`}>
                          {iconElem}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                            <span className="text-[10px] font-mono font-bold text-navy-400">
                              {new Date(notif.created_at).toLocaleString("en-US", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {!notif.is_read ? (
                                <span className="text-[9px] font-sans font-extrabold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse uppercase">
                                  New
                                </span>
                              ) : (
                                <span className="text-[9px] font-sans font-bold bg-navy-100 dark:bg-navy-800 text-navy-500 px-2 py-0.5 rounded-full uppercase">
                                  Read
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-sm font-black text-navy-900 dark:text-white leading-tight">
                            {notif.title}
                          </h3>
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Actions row */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-navy-50 dark:border-navy-850 mt-3">
                            <div className="flex gap-2">
                              {notif.type === "video_uploaded" && (
                                <button
                                  onClick={() => {
                                    dbAPI.markNotificationAsRead(notif.id);
                                    loadRecords();
                                    setActiveTab("videos");
                                  }}
                                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-mono font-black rounded-lg text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Watch Whiteboard Video</span>
                                </button>
                              )}
                              {notif.type === "slot_available" && (
                                <button
                                  onClick={() => {
                                    dbAPI.markNotificationAsRead(notif.id);
                                    loadRecords();
                                    setBookingWizardOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black rounded-lg text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Open Booking Wizard</span>
                                </button>
                              )}
                              {notif.type === "system" && !notif.is_read && (
                                <button
                                  onClick={() => {
                                    dbAPI.markNotificationAsRead(notif.id);
                                    loadRecords();
                                  }}
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-navy-950 font-mono font-black rounded-lg text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Acknowledge Notice</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const savedNotifs = localStorage.getItem("amh_notifications");
                                  if (savedNotifs) {
                                    const parsed = JSON.parse(savedNotifs) as AMHNotification[];
                                    const idx = parsed.findIndex(n => n.id === notif.id);
                                    if (idx !== -1) {
                                      parsed[idx].is_read = !parsed[idx].is_read;
                                      localStorage.setItem("amh_notifications", JSON.stringify(parsed));
                                    }
                                  }
                                  loadRecords();
                                }}
                                className="text-[10px] font-mono font-bold text-navy-500 hover:text-royal-600 dark:hover:text-gold-400 transition-colors cursor-pointer"
                              >
                                {notif.is_read ? "Mark Unread" : "Mark as Read"}
                              </button>
                              <span className="text-navy-200 dark:text-navy-800">|</span>
                              <button
                                onClick={() => {
                                  dbAPI.deleteNotification(notif.id);
                                  loadRecords();
                                }}
                                className="text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Delete Notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {notifications.filter(n => notifFilter === "all" || n.type === notifFilter).length === 0 && (
                  <div className="py-12 border-2 border-dashed border-navy-150 dark:border-navy-850 rounded-2xl text-center space-y-4 max-w-md mx-auto">
                    <div className="p-4 bg-navy-50 dark:bg-navy-950 border border-navy-100 dark:border-navy-900 rounded-full w-fit mx-auto text-navy-300">
                      <Bell className="w-10 h-10 opacity-40 animate-pulse" />
                    </div>
                    <div className="space-y-1 px-4">
                      <h3 className="text-sm font-black text-navy-800 dark:text-white">
                        All Quiet Here!
                      </h3>
                      <p className="text-xs text-navy-500 dark:text-navy-400 leading-normal">
                        There are no notifications matching your filter. Use the <b>Tutor Simulation Desk</b> above to instantly trigger alert events!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* AUTOMATED WEEKLY SUMMARY SMTP SERVICE */}
              <div className="pt-6 border-t border-navy-150 dark:border-navy-800">
                <WeeklySummaryServiceWidget user={user} />
              </div>
            </div>
          )}

          {/* LESSONS LIST & WIZARD TAB */}
          {activeTab === "lessons" && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900/20 via-royal-900/10 to-transparent p-5 rounded-2xl border border-blue-500/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                        Zoom Live Whiteboard Bookings
                        <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                          Zoom Only
                        </span>
                      </h2>
                      <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">
                        View confirmed schedules, join virtual board links, and schedule new classes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {bookings.length > 0 && (
                    <>
                      <button 
                        onClick={handleExportPDFReport}
                        className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
                        title="Export tutoring history & progress report to PDF"
                        id="btn-export-pdf-lessons"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Export PDF Report
                      </button>
                      <button 
                        onClick={handleExportClassPlannerPDF}
                        className="px-3 py-1.5 bg-royal-100 hover:bg-royal-200 text-royal-900 dark:text-royal-100 dark:bg-royal-950/40 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
                        title="Print or download complete book class planner & booked sessions schedule"
                        id="btn-print-class-planner"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Class Planner
                      </button>
                      <button 
                        onClick={handleDownloadScheduleICS}
                        className="px-3 py-1.5 bg-white dark:bg-navy-800 hover:bg-navy-50 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-200 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-navy-200 dark:border-navy-700 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Schedule (.ics)
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setBookingWizardOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-royal-600 hover:from-blue-500 hover:to-royal-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule New Class (Zoom)
                  </button>
                </div>
              </div>

              {/* STUDENT GOOGLE CALENDAR SYNC HUB */}
              <StudentGoogleCalendarWidget 
                user={user} 
                bookings={bookings} 
                subjects={subjects} 
              />

              {/* Schedule Filter Tabs */}
              <div className="flex items-center justify-between gap-3 border-b border-navy-150 dark:border-navy-800 pb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBookingScheduleFilter("all")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      bookingScheduleFilter === "all"
                        ? "bg-royal-600 text-white shadow-sm"
                        : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700"
                    }`}
                  >
                    All Classes ({bookings.length})
                  </button>
                  <button
                    onClick={() => setBookingScheduleFilter("confirmed")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      bookingScheduleFilter === "confirmed"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Confirmed Schedules ({bookings.filter(b => b.status === "confirmed").length})
                  </button>
                  <button
                    onClick={() => setBookingScheduleFilter("completed")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      bookingScheduleFilter === "completed"
                        ? "bg-slate-700 text-white shadow-sm"
                        : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700"
                    }`}
                  >
                    Completed ({bookings.filter(b => b.status === "completed").length})
                  </button>
                </div>
                <div className="text-[11px] font-mono text-navy-400">
                  Showing {
                    bookings.filter(b => bookingScheduleFilter === "all" ? true : b.status === bookingScheduleFilter).length
                  } sessions
                </div>
              </div>

              {bookings.filter(b => bookingScheduleFilter === "all" ? true : b.status === bookingScheduleFilter).length > 0 ? (
                <div className="space-y-4">
                  {bookings
                    .filter(b => bookingScheduleFilter === "all" ? true : b.status === bookingScheduleFilter)
                    .map((bk) => (
                    <div 
                      key={bk.id}
                      className="border border-navy-150 dark:border-navy-800 bg-white dark:bg-navy-900/60 rounded-2xl overflow-hidden p-5 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 hover:border-blue-400/50 dark:hover:border-blue-500/30 transition-all shadow-sm"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-black bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 px-2.5 py-0.5 rounded">
                            {bk.booking_reference}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Zoom Live Whiteboard
                          </span>
                          <span className="text-[9px] font-mono text-navy-400">
                            Booked on {bk.created_at}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                            {getSubjectName(bk.subject_id)}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-navy-600 dark:text-navy-300 font-mono mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-royal-600 dark:text-gold-400 font-bold">
                              <Calendar className="w-3.5 h-3.5" />
                              {bk.lesson_date} @ {bk.lesson_time} SAST
                            </span>
                            <span className="flex items-center gap-1 text-navy-400">
                              <Clock className="w-3.5 h-3.5" />
                              {bk.duration_minutes} Minutes
                            </span>
                            <span className="text-navy-400">
                              Package: <b>{getPackageName(bk.package_id)}</b>
                            </span>
                          </div>
                        </div>

                        {bk.topics_to_cover && bk.topics_to_cover.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-navy-400 font-bold">Topics:</span>
                            {bk.topics_to_cover.map((t, idx) => (
                              <span key={idx} className="text-[10px] bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 px-2 py-0.5 rounded-md font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {bk.notes && (
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 italic bg-navy-50 dark:bg-navy-950/40 px-3 py-1.5 rounded-lg border border-navy-100 dark:border-navy-850">
                            "{bk.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col lg:items-end gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-navy-100 dark:border-navy-800">
                        <div className="flex items-center gap-2">
                          {bk.status === "completed" && bk.rating && (
                            <div className="flex items-center gap-0.5 text-amber-500 mr-1.5" title={`${bk.rating} Star rating submitted`}>
                              {Array.from({ length: bk.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                          )}
                          <span className={`text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 ${
                            bk.status === "completed" 
                              ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-500/30" 
                              : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30"
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            {bk.status}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <a
                            href={generateGoogleCalendarDirectUrl(bk, getSubjectName(bk.subject_id), user ? `${user.first_name} ${user.surname}` : "Student")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Add to Google Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            Google Cal
                          </a>

                          <button
                            onClick={() => handleDownloadSingleBookingICS(bk)}
                            className="px-3 py-1.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Add to calendar"
                          >
                            <Download className="w-3.5 h-3.5" />
                            iCal
                          </button>
                          
                          {bk.status !== "completed" && (
                            <button
                              onClick={() => setFeedbackBooking(bk)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Complete
                            </button>
                          )}

                          {bk.status !== "completed" && bk.meeting_link && (
                            <a 
                              href={bk.meeting_link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                            >
                              <Video className="w-4 h-4" />
                              Join Zoom Whiteboard
                              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                            </a>
                          )}
                        </div>

                        {bk.status === "completed" && bk.feedback_remarks && (
                          <span className="text-[10px] text-navy-400 dark:text-navy-500 italic max-w-[240px] truncate block text-right mt-1">
                            "{bk.feedback_remarks}"
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-navy-200 dark:border-navy-800 rounded-2xl space-y-4 bg-navy-50/50 dark:bg-navy-950/20">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                    <Video className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-navy-900 dark:text-white">No bookings match this filter</h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400">
                      {bookingScheduleFilter === "confirmed"
                        ? "You have no upcoming confirmed classes. Book a new 1-on-1 Zoom lesson to get started!"
                        : "No active bookings found in this category."}
                    </p>
                  </div>
                  <button
                    onClick={() => setBookingWizardOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule New Class
                  </button>
                </div>
              )}

            </div>
          )}

          {/* HOMEWORK CENTER PANEL */}
          {activeTab === "homework" && (
            <HomeworkCenter 
              user={user} 
              onNavigateTab={(tab) => setActiveTab(tab as TabType)} 
            />
          )}

          {/* RESOURCE LIBRARY PANEL */}
          {activeTab === "resources" && (
            <ResourceLibrary user={user} />
          )}

          {/* MATHEMATICS GLOSSARY & FORMULA SOLVERS */}
          {activeTab === "math_glossary" && (
            <InteractiveMathGlossary />
          )}

          {/* REALTIME LATEX MATH EDITOR */}
          {activeTab === "latex_editor" && (
            <div className="space-y-6 animate-fadeIn">
              <LatexMathEditor 
                onSendToTutor={(latex) => {
                  setActiveTab("ai_tutor");
                }} 
              />
            </div>
          )}

          {/* SUBJECT QUIZ MODE SECTION */}
          {activeTab === "subject_quiz" && (
            <SubjectQuizMode user={user} />
          )}

          {/* ERROR TREND ANALYSIS SECTION */}
          {activeTab === "error_trend_analysis" && (
            <ErrorTrendAnalysis user={user} />
          )}

          {/* FORMULA LIBRARY SECTION */}
          {activeTab === "formula_library" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-navy-800">
                <div>
                  <h3 className="text-base font-bold text-white">CAPS & IEB Official Formula Booklet</h3>
                  <p className="text-xs text-slate-300">Quickly launch the searchable, KaTeX-rendered formula modal during practice.</p>
                </div>
                <FormulaSheetModal user={user} />
              </div>
              <PersonalizedFormulaBank user={user} />
            </div>
          )}

          {/* FORMULA FLASHCARDS DECK */}
          {activeTab === "flashcards" && (
            <FormulaFlashcards user={user} />
          )}

          {/* PEER STUDY GROUP ROOMS */}
          {activeTab === "study_group" && (
            <StudyGroup user={user} />
          )}

          {/* VIDEO REQUESTS PANEL */}
          {activeTab === "videos" && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white">On-Demand video explanations</h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400">Can't attend a live session? Submit worksheets or equations and get private step-by-step video tutorials recorded by our tutors.</p>
                </div>
                <button 
                  onClick={() => navigate("/video-requests?open=true")}
                  className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Video Request (R150 - R250/hr)
                </button>
              </div>

              {videoRequests.length > 0 ? (
                <div className="space-y-6">
                  {videoRequests.map((req) => (
                    <div 
                      key={req.id}
                      className="border border-navy-150 dark:border-navy-800 rounded-xl p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex justify-between items-start gap-4 flex-wrap border-b border-navy-100 dark:border-navy-850 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                              req.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {req.status === "completed" ? "Tutorial Complete" : "Tutor Recording Solutions"}
                            </span>
                            {req.delivery_type === "express" ? (
                              <span className="text-[9px] font-mono font-black px-2.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 uppercase tracking-wider">
                                ⚡ Express (4h)
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-black px-2.5 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 uppercase tracking-wider">
                                🕒 Standard (24h)
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-navy-400">Submitted {req.created_at}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white">{req.chapter_title}</h3>
                          <p className="text-xs text-navy-500 dark:text-navy-400">{req.description}</p>
                        </div>
                        <div className="text-right text-xs font-mono font-bold text-navy-900 dark:text-white">
                          R{req.price} ZAR
                        </div>
                      </div>

                      {/* Video Player Embed if complete */}
                      {req.status === "completed" && req.video_url && (
                        <div className="space-y-4">
                          <div className="bg-navy-950 aspect-video rounded-xl border border-navy-850 overflow-hidden relative group">
                            {/* Youtube video player iframe */}
                            <iframe 
                              src={req.video_url} 
                              title={req.chapter_title}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>

                          {req.notes && (
                            <div className="bg-royal-50 dark:bg-navy-950 p-4 rounded-xl border border-royal-200 dark:border-navy-850 text-xs">
                              <p className="font-bold text-royal-700 dark:text-gold-400 mb-1 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                Tutor Notes:
                              </p>
                              <p className="text-navy-600 dark:text-navy-300 italic">"{req.notes}"</p>
                            </div>
                          )}
                        </div>
                      )}

                      {req.status === "pending" && (
                        <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex items-center gap-3 text-xs text-amber-700 dark:text-amber-400 font-sans font-medium">
                          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
                          <span>We have received your worksheet request. Head tutor Bethuel Moukangwe is preparing the formula outline and recording your video now. Expected delivery within 24 hours.</span>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-navy-200 dark:border-navy-800 rounded-2xl space-y-3">
                  <Video className="w-12 h-12 text-navy-400 mx-auto" />
                  <p className="text-xs text-navy-500 dark:text-navy-400">You haven't requested any custom math videos yet.</p>
                </div>
              )}

            </div>
          )}

          {/* PAYMENTS HISTORIC TAB */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white">Transaction History</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">Download receipts, view PayFast confirmations, and monitor active package balances.</p>
              </div>

              {payments.length > 0 ? (
                <div className="border border-navy-150 dark:border-navy-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left text-navy-500 dark:text-navy-400 divide-y divide-navy-150 dark:divide-navy-800">
                    <thead className="bg-navy-50 dark:bg-navy-950/80 font-mono text-[9px] font-black text-navy-600 dark:text-navy-300 uppercase">
                      <tr>
                        <th className="px-4 py-3">Receipt date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Transaction ID</th>
                        <th className="px-4 py-3">Gateway</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Amount (ZAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-150 dark:divide-navy-800 bg-white dark:bg-navy-900 font-mono text-[11px]">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-850/20">
                          <td className="px-4 py-3 whitespace-nowrap">{p.created_at}</td>
                          <td className="px-4 py-3 font-bold font-sans text-navy-900 dark:text-white">
                            {p.booking_id.startsWith("bk-") ? "Live Package Booking" : "Video request solutions"}
                          </td>
                          <td className="px-4 py-3">{p.transaction_id}</td>
                          <td className="px-4 py-3">{p.payment_method}</td>
                          <td className="px-4 py-3">
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-navy-900 dark:text-white">R{p.amount}.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-navy-200 dark:border-navy-800 rounded-2xl">
                  <CreditCard className="w-12 h-12 text-navy-400 mx-auto mb-3" />
                  <p className="text-xs text-navy-500 dark:text-navy-400">No payment records located.</p>
                </div>
              )}

            </div>
          )}

          {/* AUTOMATED 30-MIN STUDY SCHEDULE TAB */}
          {activeTab === "study_schedule" && (
            <AutomatedStudyScheduleGenerator user={user} embedded={true} />
          )}

          {/* QA & AUTOMATED TESTING COMMAND CENTER TAB */}
          {activeTab === "test_runner" && (
            <TestRunnerDashboard user={user} embedded={true} />
          )}

          {/* TUTORS & AVAILABILITY STATUS TAB */}
          {activeTab === "tutors" && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                    <span>Amaris Mathematics Coaching Team</span>
                  </h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    Interact with our expert South African math tutors. View real-time availability for on-demand whiteboard tutoring.
                  </p>
                </div>

                {/* Real-time tutor availability toggling filter & Tutor Profile Button */}
                <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTab("tutor_profile")}
                    className="px-3.5 py-2 bg-gradient-to-r from-royal-600 to-navy-900 hover:from-royal-700 hover:to-navy-950 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-gold-400" />
                    <span>Manage Tutor Profile & Photo</span>
                  </button>

                  <div className="flex items-center gap-3 bg-navy-50 dark:bg-navy-950 px-4 py-2 rounded-xl border border-navy-150 dark:border-navy-800">
                    <label htmlFor="ready-only-toggle" className="text-xs font-bold text-navy-700 dark:text-navy-200 cursor-pointer select-none">
                      Available For Immediate Sessions Only
                    </label>
                    <button
                      id="ready-only-toggle"
                      type="button"
                      onClick={() => setOnlyReadyTutors(!onlyReadyTutors)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        onlyReadyTutors ? "bg-emerald-500" : "bg-navy-200 dark:bg-navy-850"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          onlyReadyTutors ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tutors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutors
                  .filter(tutor => !onlyReadyTutors || tutor.is_available)
                  .map(tutor => {
                    const isCurrentUser = user && (user.id === tutor.id || user.email.toLowerCase() === tutor.email.toLowerCase());
                    return (
                      <div
                        key={tutor.id}
                        className={`bg-white dark:bg-navy-900 border rounded-2xl p-6 relative flex flex-col justify-between transition-all hover:shadow-md ${
                          tutor.is_available 
                            ? "border-emerald-500/40 dark:border-emerald-400/30 shadow-emerald-500/5 shadow-md bg-gradient-to-br from-white to-emerald-500/[0.01] dark:from-navy-900 dark:to-emerald-400/[0.01]" 
                            : "border-navy-150 dark:border-navy-800 animate-fadeIn"
                        }`}
                      >
                        {/* Status Ribbon/Badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          {tutor.is_available ? (
                            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Ready Now
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 bg-navy-100 dark:bg-navy-800 text-navy-500 dark:text-navy-400 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                              <span className="h-1.5 w-1.5 bg-navy-400 rounded-full" />
                              Offline / Busy
                            </span>
                          )}
                        </div>

                        {/* Top Info Section */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            {/* Avatar placeholder with initials */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black font-display text-white relative ${
                              tutor.is_available 
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-emerald-500/10" 
                                : "bg-gradient-to-br from-navy-400 to-navy-500"
                            }`}>
                              {tutor.first_name[0]}{tutor.surname[0]}
                              {tutor.is_available && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-navy-900" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-extrabold text-navy-950 dark:text-white text-sm">
                                Tutor {tutor.first_name} {tutor.surname} {isCurrentUser && "(You)"}
                              </h3>
                              <p className="text-[11px] font-mono font-bold text-royal-600 dark:text-gold-400">
                                {tutor.specialization || "General Mathematics Specialist"}
                              </p>
                              <p className="text-[10px] text-navy-400 font-mono">
                                Covers: {tutor.grade || "Grade 10-12 CAPS & IEB"}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed italic">
                            "{tutor.bio || "Dedicated professional math tutor at Amaris Mathematics Hub, here to help students score distinction marks."}"
                          </p>
                        </div>

                        {/* Bottom Actions Section */}
                        <div className="mt-6 pt-4 border-t border-navy-100 dark:border-navy-800 space-y-4">
                          {/* If the current user IS this tutor, allow toggling their availability directly */}
                          {isCurrentUser ? (
                            <div className="flex items-center justify-between bg-royal-50/50 dark:bg-navy-950/40 p-3 rounded-xl border border-royal-500/10">
                              <div className="space-y-0.5">
                                <span className="block text-[10px] font-mono font-black uppercase text-royal-700 dark:text-gold-400">
                                  Your Availability Status
                                </span>
                                <span className="text-[10px] text-navy-500 dark:text-navy-400">
                                  Toggling this updates your live cockpit card.
                                </span>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedTutor = dbAPI.updateTutorAvailability(tutor.id, !tutor.is_available);
                                  // Refresh tutors list
                                  setTutors(dbAPI.getTutors());
                                  // Call onProfileUpdate to let App know we changed user state
                                  onProfileUpdate(updatedTutor);
                                }}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  tutor.is_available ? "bg-emerald-500" : "bg-navy-200 dark:bg-navy-850"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    tutor.is_available ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-4 w-full">
                              {tutor.is_available ? (
                                <div className="flex items-center gap-2 w-full">
                                  <button
                                    onClick={() => setJoiningTutorSession(tutor)}
                                    className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-[11px] rounded-xl shadow-sm hover:shadow transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
                                    Launch Boardroom Now
                                  </button>
                                  <a
                                    href={`https://wa.me/${tutor.phone.replace(/[^0-9]/g, '') || "27714156665"}?text=Hi%20Tutor%20${tutor.first_name},%20I'm%20logged%20in%20on%20the%20Amaris%20Cockpit%20and%20see%20you%20are%20ready%20for%20an%20immediate%20whiteboard%20session!`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all flex items-center justify-center"
                                    title="Send WhatsApp text directly to tutor"
                                  >
                                    <MessageSquare className="w-4.5 h-4.5" />
                                  </a>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setBookingWizardOpen(true)}
                                  className="w-full py-2 bg-navy-50 hover:bg-navy-100 dark:bg-navy-950 dark:hover:bg-navy-900 border border-navy-150 dark:border-navy-800 text-navy-700 dark:text-navy-300 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  Schedule Tutoring Session
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {tutors.filter(tutor => !onlyReadyTutors || tutor.is_available).length === 0 && (
                <div className="text-center py-16 border border-dashed border-navy-200 dark:border-navy-800 rounded-2xl bg-navy-50/30 dark:bg-navy-950/20">
                  <UserCheck className="w-12 h-12 text-navy-400 mx-auto mb-4" />
                  <h4 className="text-sm font-extrabold text-navy-900 dark:text-white mb-1">No Active Tutors Found</h4>
                  <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
                    {onlyReadyTutors 
                      ? "None of our math tutors are currently ready for immediate whiteboard classes. Try toggling off the 'Available Only' filter or schedule a future slot!" 
                      : "There are no tutors registered matching this filter criteria."}
                  </p>
                  {onlyReadyTutors && (
                    <button
                      onClick={() => setOnlyReadyTutors(false)}
                      className="mt-4 px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-[11px] font-black rounded-lg transition-all cursor-pointer"
                    >
                      Show All Tutors
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PROFILE EDIT TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white">Profile settings</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">Modify school, parent contact info, and regional WhatsApp preferences.</p>
              </div>

              {/* TUTOR PROFILE QUICK ACCESS BANNER */}
              <div className="bg-gradient-to-r from-royal-950 via-navy-900 to-navy-950 p-5 rounded-2xl border border-royal-700/50 text-white flex justify-between items-center flex-wrap gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <h3 className="text-sm font-black font-display text-white">Tutor Profile & Teaching Philosophy</h3>
                  </div>
                  <p className="text-xs text-navy-200">
                    Take a live camera picture for your profile avatar and write your teaching philosophy & qualifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("tutor_profile")}
                  className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-navy-950 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-transform hover:scale-[1.02]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Edit Tutor Profile & Camera</span>
                </button>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-6 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">First Name</label>
                    <input 
                      type="text" 
                      {...regProfile("first_name", { required: true })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Surname</label>
                    <input 
                      type="text" 
                      {...regProfile("surname", { required: true })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">WhatsApp phone number</label>
                    <input 
                      type="text" 
                      {...regProfile("whatsapp_number", { required: true })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">General Mobile</label>
                    <input 
                      type="text" 
                      {...regProfile("phone", { required: true })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">School / Institution</label>
                    <input 
                      type="text" 
                      {...regProfile("school")}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Grade Level</label>
                    <input 
                      type="text" 
                      {...regProfile("grade")}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy-100 dark:border-navy-800">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Parent / Sponsor Name</label>
                    <input 
                      type="text" 
                      {...regProfile("parent_name")}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Parent Mobile Contact</label>
                    <input 
                      type="text" 
                      {...regProfile("parent_phone")}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* EMAIL NOTIFICATION SETTINGS PANEL */}
                <div className="pt-6 border-t border-navy-100 dark:border-navy-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                    <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-wide font-mono">
                      ✉️ Email Notification Preferences
                    </h3>
                  </div>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    Opt-in or opt-out of automated email communications sent from the Amaris Mathematics Hub system to <span className="font-extrabold text-navy-700 dark:text-navy-300">{user?.email}</span>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reminders Toggle Option */}
                    <div className="bg-navy-50/50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-150 dark:border-navy-850 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="block font-black text-navy-900 dark:text-white text-xs">
                          Upcoming Session Reminders
                        </span>
                        <span className="block text-[11px] text-navy-500 dark:text-navy-400 leading-normal">
                          Get automatic email notifications 24 hours and 1 hour prior to your live lessons so you never miss a study slot.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileValue("email_session_reminders", !emailSessionReminders)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          emailSessionReminders ? "bg-emerald-500" : "bg-navy-200 dark:bg-navy-850"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            emailSessionReminders ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Blog Posts Toggle Option */}
                    <div className="bg-navy-50/50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-150 dark:border-navy-850 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="block font-black text-navy-900 dark:text-white text-xs">
                          Math Insights Blog Alerts
                        </span>
                        <span className="block text-[11px] text-navy-500 dark:text-navy-400 leading-normal">
                          Get notified immediately whenever Tutor Bethuel and the team publish fresh CAPS study notes, formula briefs, and exam reviews.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileValue("email_blog_posts", !emailBlogPosts)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          emailBlogPosts ? "bg-emerald-500" : "bg-navy-200 dark:bg-navy-850"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            emailBlogPosts ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Updated Profile
                </button>

              </form>

              {/* MULTI-FACTOR AUTHENTICATION (MFA / TOTP) SETTINGS */}
              <div className="pt-6 border-t border-navy-100 dark:border-navy-800">
                <MFASetup user={user} />
              </div>
            </div>
          )}

          {/* TUTOR PROFILE & TEACHING PHILOSOPHY TAB */}
          {activeTab === "tutor_profile" && (
            <TutorProfile user={user} onProfileUpdate={onProfileUpdate} />
          )}

          {/* SYLLABUS & TOPIC MASTERY & FIREBASE PROGRESS DASHBOARD TAB */}
          {activeTab === "progress_tracker" && user && (
            <div className="space-y-8 animate-fadeIn">
              <StudentProgressDashboard user={user} />
              <StudentProgressTracker bookings={bookings} user={user} />
            </div>
          )}

          {/* D3 KNOWLEDGE GRAPH TAB */}
          {activeTab === "knowledge_graph" && (
            <KnowledgeGraph 
              user={user} 
              onSelectTopicForVideo={() => setActiveTab("videos")} 
              onAskAITutor={() => setActiveTab("ai_tutor")} 
            />
          )}

          {/* STUDENT ACHIEVEMENTS TAB */}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              <StudentMilestones 
                user={user} 
                onNavigateTab={(tab) => setActiveTab(tab as TabType)} 
              />
              <Badges user={user} onNavigateTab={(tab) => setActiveTab(tab as TabType)} />
              <StudentAchievements 
                user={user} 
                onNavigateTab={(tab) => setActiveTab(tab as TabType)} 
              />
            </div>
          )}

          {/* GLOBAL LEADERBOARD TAB */}
          {activeTab === "global_leaderboard" && (
            <GlobalLeaderboard 
              user={user} 
              onTakeQuiz={() => setActiveTab("subject_quiz")}
              onTakeDailyChallenge={() => {
                setActiveTab("overview");
                setTimeout(() => {
                  document.getElementById("daily-streak-widget")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            />
          )}

          {/* MOCK PERFORMANCE TRACKER TAB */}
          {activeTab === "performance" && user && (
            <MockPerformanceDashboard user={user} />
          )}

          {/* AI EXAM PREDICTOR TAB */}
          {activeTab === "exam_predictor" && user && (
            <AIPredictor user={user} />
          )}

          {/* TUTOR REPORTS TAB */}
          {activeTab === "tutor_reports" && user && (
            <TutorReportsDashboard user={user} />
          )}

          {/* DEEP FOCUS HISTORY TAB */}
          {activeTab === "focus_history" && (
            <FocusHistoryWidget user={user} onStartFocusSession={toggleFocusMode} onOpenSessionReview={() => setActiveTab("session_review")} />
          )}

          {/* SESSION REVIEW CARDS TAB */}
          {activeTab === "session_review" && (
            <SessionReviewCards user={user} onBackToFocus={() => setActiveTab("focus_history")} />
          )}

          {/* ARCADE MODE TAB */}
          {activeTab === "arcade_mode" && (
            <div className="space-y-6">
              <ArcadeModeWidget user={user} />
              <ArcadeTopScorersWidget user={user} onLaunchArcade={() => {}} />
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === "announcements" && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-navy-100 dark:border-navy-800">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-gold-500 animate-bounce" />
                    Amaris Learning Announcements
                  </h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">
                    Keep up to date with South African CAPS exam dates, trial revision workshops, and key academy briefs.
                  </p>
                </div>
              </div>

              {/* Admin Publish Form */}
              {user.role === "admin" && (
                <div className="p-6 bg-navy-50 dark:bg-navy-950/40 rounded-2xl border border-navy-150 dark:border-navy-850 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-navy-100 dark:border-navy-800/80">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    <h3 className="text-sm font-black text-navy-900 dark:text-gold-400 uppercase tracking-wide font-mono">
                      📣 Head Tutor Desk: Publish New Broadcast
                    </h3>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const title = (form.elements.namedItem("annTitle") as HTMLInputElement).value;
                      const category = (form.elements.namedItem("annCategory") as HTMLSelectElement).value as any;
                      const content = (form.elements.namedItem("annContent") as HTMLTextAreaElement).value;
                      const is_urgent = (form.elements.namedItem("annUrgent") as HTMLInputElement).checked;

                      if (!title || !content) {
                        alert("Title and content are required.");
                        return;
                      }

                      try {
                        dbAPI.publishAnnouncement({ title, category, content, is_urgent });
                        alert("Broadcast published successfully to all student dashboards!");
                        form.reset();
                        loadRecords();
                      } catch (err) {
                        alert("Error publishing announcement: " + err);
                      }
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">
                          Announcement Title
                        </label>
                        <input
                          name="annTitle"
                          type="text"
                          required
                          placeholder="e.g. Matric Mathematics CAPS Trial Schedule"
                          className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">
                          Category
                        </label>
                        <select
                          name="annCategory"
                          className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                        >
                          <option value="General">General Broadcast</option>
                          <option value="Academic">Academic Curriculum</option>
                          <option value="Exam Prep">CAPS / IEB Exam Prep</option>
                          <option value="Schedule">Schedule Adjustments</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">
                        Broadcast Body Content
                      </label>
                      <textarea
                        name="annContent"
                        required
                        rows={4}
                        placeholder="Detail the exam workshop times, Google Meet access parameters, or specific revision chapters..."
                        className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="annUrgent"
                        name="annUrgent"
                        type="checkbox"
                        className="h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500"
                      />
                      <label htmlFor="annUrgent" className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 cursor-pointer select-none">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Mark as Urgent / High Priority Alert
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-black rounded-lg cursor-pointer transition-transform hover:scale-[1.02] shadow"
                      >
                        Publish Broadcast Now
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Announcements List */}
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-navy-200 dark:border-navy-800 rounded-2xl">
                    <Megaphone className="w-12 h-12 text-navy-400 mx-auto mb-3" />
                    <p className="text-xs text-navy-500 dark:text-navy-400">No broadcasts published yet.</p>
                  </div>
                ) : (
                  announcements.map((ann) => {
                    const categoryColors = {
                      "General": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                      "Academic": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                      "Exam Prep": "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
                      "Schedule": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }[ann.category] || "bg-navy-100 text-navy-800";

                    return (
                      <div 
                        key={ann.id}
                        className={`p-5 sm:p-6 rounded-2xl border transition-all text-xs text-left relative ${
                          ann.is_urgent 
                            ? "bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/60 shadow-sm" 
                            : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-800 shadow-sm hover:shadow"
                        }`}
                      >
                        {/* Urgent Alert Header */}
                        {ann.is_urgent && (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase font-mono tracking-wider mb-2 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Urgent High-Priority Alert
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide font-mono ${categoryColors}`}>
                              {ann.category}
                            </span>
                            <span className="text-[10px] text-navy-400 font-mono">
                              Published {ann.created_at}
                            </span>
                          </div>

                          {user.role === "admin" && (
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this broadcast?")) {
                                  dbAPI.deleteAnnouncement(ann.id);
                                  loadRecords();
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-500/10 transition-colors self-end sm:self-auto cursor-pointer"
                              title="Delete Announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white leading-tight mb-2">
                          {ann.title}
                        </h3>

                        <p className="text-navy-600 dark:text-navy-300 leading-relaxed font-sans text-xs whitespace-pre-line">
                          {ann.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ASK TUTOR BETHUEL TAB */}
          {activeTab === "ai_tutor" && (
            <AskTutor user={user} />
          )}

          {/* DIRECT 1-ON-1 TUTOR MESSAGING */}
          {activeTab === "direct_tutor_chat" && (
            <DirectTutorMessaging user={user} />
          )}

          {/* WHATSAPP AUTOMATION COCKPIT */}
          {activeTab === "whatsapp_automation" && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-navy-150 dark:border-navy-800">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-500 animate-pulse" />
                    WhatsApp Auto-Responder Engine
                  </h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">
                    Turn your website context and mathematics curriculum information into an active auto-reply bot representing Tutor Bethuel on WhatsApp.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400">
                    Engine Status:
                  </span>
                  <button 
                    onClick={() => {
                      setWhatsappActive(!whatsappActive);
                      const tStr = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                      setWhatsappLogs(prev => [
                        ...prev,
                        { 
                          id: "log-" + Date.now(), 
                          event: `WhatsApp Automation Engine toggled ${!whatsappActive ? "ON" : "OFF"} manually`, 
                          type: "info", 
                          time: tStr 
                        }
                      ]);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
                      whatsappActive 
                        ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10" 
                        : "bg-navy-100 hover:bg-navy-200 dark:bg-navy-800 dark:hover:bg-navy-750 border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-400"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${whatsappActive ? "bg-white animate-ping" : "bg-navy-400"}`} />
                    {whatsappActive ? "Active Auto-Reply" : "Paused"}
                  </button>
                </div>
              </div>

              {/* Stats Bento Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-850 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-wider">Total Auto-Replies</span>
                  <p className="text-xl sm:text-2xl font-black font-mono text-navy-900 dark:text-white">
                    {whatsappMessages.filter(m => m.sender === "bethuel").length + 48}
                  </p>
                </div>

                <div className="p-4 bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-850 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-wider">API Integration</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase">ONLINE (Live Webhook)</span>
                  </div>
                </div>

                <div className="p-4 bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-850 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-wider">Knowledge Grounding</span>
                  <p className="text-xs font-bold text-navy-800 dark:text-navy-200 flex items-center gap-1 pt-1">
                    <CheckCircle className="w-4 h-4 text-royal-500" />
                    Full Website Database
                  </p>
                </div>

                <div className="p-4 bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-850 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-wider">Average Delay</span>
                  <p className="text-xl sm:text-2xl font-black font-mono text-royal-600 dark:text-gold-400">
                    {whatsappDelay}s <span className="text-xs text-navy-400 font-sans font-normal">(simulated)</span>
                  </p>
                </div>
              </div>

              {/* Main Split Layout: Configurations vs Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Configurations panel (col-span 6) */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Persona Configuration Card */}
                  <div className="p-5 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl space-y-4">
                    <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Settings className="w-4 h-4 text-royal-500" />
                      Personality & Auto-Reply Rules
                    </h3>

                    {/* Voice Select */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                        AI Tutor Voice Tuning
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "warm", name: "Warm Coach", desc: "Friendly, high-energy South African slang" },
                          { id: "formal", name: "Formal Director", desc: "Structured, professional academy leader" },
                          { id: "technical", name: "Technical Expert", desc: "Rigorous step-by-step mathematical theorems" }
                        ].map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setWhatsappVoice(v.id as any);
                              const tStr = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                              setWhatsappLogs(prev => [
                                ...prev,
                                { id: "log-" + Date.now(), event: `Personality changed to ${v.name}`, type: "info", time: tStr }
                              ]);
                            }}
                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                              whatsappVoice === v.id 
                                ? "bg-royal-50/50 dark:bg-navy-850 border-royal-400 text-royal-800 dark:text-gold-400 ring-2 ring-royal-400/20" 
                                : "bg-navy-50/20 dark:bg-navy-950/10 border-navy-150 dark:border-navy-800 text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-850/50"
                            }`}
                          >
                            <span className="text-xs font-black">{v.name}</span>
                            <span className="text-[9px] leading-tight text-navy-400 font-sans">{v.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delay slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                          Replying Delay / Latency
                        </label>
                        <span className="text-[10px] font-mono font-black text-royal-600 dark:text-gold-400">{whatsappDelay} Seconds</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={whatsappDelay} 
                        onChange={(e) => setWhatsappDelay(Number(e.target.value))}
                        className="w-full h-1.5 bg-navy-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-royal-500 dark:accent-gold-400"
                      />
                      <p className="text-[9px] text-navy-400 font-sans">Simulates realistic typing duration before triggering the webhook auto-reply.</p>
                    </div>

                    {/* Custom Greeting Welcome */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                        Default WhatsApp Greeting Message Preset
                      </label>
                      <textarea
                        value={whatsappCustomWelcome}
                        onChange={(e) => setWhatsappCustomWelcome(e.target.value)}
                        rows={2}
                        className="w-full p-3 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
                        placeholder="Customize greeting..."
                      />
                      <p className="text-[9px] text-navy-400">Triggered dynamically if the user types standard greeting prompts (e.g. 'hi', 'hello', 'yo').</p>
                    </div>

                  </div>

                  {/* System Event Logs Terminal */}
                  <div className="p-5 bg-navy-950 text-emerald-400 border border-navy-850 rounded-2xl space-y-3 font-mono">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
                        Live Webhook Transactions Terminal
                      </h3>
                      <button 
                        onClick={() => setWhatsappLogs([])}
                        className="text-[9px] hover:text-white bg-navy-900 border border-navy-800 px-2 py-0.5 rounded transition-all cursor-pointer"
                      >
                        Clear Terminal
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[10px] h-[160px] overflow-y-auto scrollbar-thin text-left leading-normal text-emerald-400">
                      {whatsappLogs.length === 0 ? (
                        <p className="text-navy-500 italic">Terminal is listening for incoming Webhook signals...</p>
                      ) : (
                        whatsappLogs.map((log) => (
                          <div key={log.id} className="flex gap-2 items-start hover:bg-white/5 p-0.5 rounded transition-colors">
                            <span className="text-navy-500 shrink-0 select-none">[{log.time}]</span>
                            <span className={`font-black shrink-0 uppercase select-none ${
                              log.type === "webhook" ? "text-amber-400" :
                              log.type === "api" ? "text-purple-400" : "text-emerald-500"
                            }`}>
                              {log.type}:
                            </span>
                            <span className="text-white font-sans">{log.event}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Side: Smartphone WhatsApp Simulator (col-span 6) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="max-w-[340px] mx-auto bg-navy-950 border-[10px] border-navy-900 rounded-[38px] shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col justify-between">
                    
                    {/* Top Speaker Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-28 bg-navy-900 rounded-b-xl z-20 flex items-center justify-center">
                      <span className="h-1 w-8 bg-neutral-700 rounded-full" />
                    </div>

                    {/* WhatsApp Simulator Header */}
                    <div className="bg-emerald-800 text-white px-4 pt-5 pb-3 flex items-center justify-between border-b border-emerald-900 relative z-10 select-none shadow">
                      <div className="flex items-center gap-2.5 mt-1 text-left">
                        {/* Profile Pic */}
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-emerald-950 flex-shrink-0 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" 
                            alt="Bethuel" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black leading-tight flex items-center gap-1">
                            Tutor Bethuel
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          </h4>
                          <p className="text-[8px] font-mono opacity-80 text-white">
                            {whatsappLoading ? "typing..." : "Online Auto-Bot"}
                          </p>
                        </div>
                      </div>

                      <span className="text-[8px] font-mono font-black bg-emerald-900 text-emerald-200 border border-emerald-700 px-1.5 py-0.5 rounded tracking-wide uppercase">
                        AI Reply
                      </span>
                    </div>

                    {/* Chat Messages Body (Simulated Green Chat Screen) */}
                    <div 
                      className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col min-h-[300px]" 
                      style={{ 
                        backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                        backgroundColor: "#efeae2"
                      }}
                    >
                      {/* Sub-header safety warning */}
                      <div className="mx-auto bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 p-1.5 rounded-lg max-w-[260px] text-center shadow-sm select-none">
                        <p className="text-[8px] text-amber-800 dark:text-amber-300 font-sans leading-tight">
                          🔒 Messages are end-to-end simulated. Responses generate in real-time based on Amaris website databases.
                        </p>
                      </div>

                      {whatsappMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] p-2.5 rounded-xl text-[11px] leading-relaxed relative flex flex-col text-left shadow-sm ${
                            msg.sender === "client"
                              ? "bg-emerald-100 text-neutral-800 rounded-tr-none ml-auto"
                              : "bg-white text-neutral-800 rounded-tl-none mr-auto border border-neutral-200"
                          }`}
                        >
                          {/* Message Body with clean bold support */}
                          <div className="whitespace-pre-wrap leading-normal font-sans break-words">
                            {msg.text.split("\n").map((line, lIdx) => {
                              // Support simplistic WhatsApp bolding: *text* -> <b>text</b>
                              let formatted = line;
                              const boldRegex = /\*(.*?)\*/g;
                              let match;
                              const parts: React.ReactNode[] = [];
                              let lastIndex = 0;

                              while ((match = boldRegex.exec(line)) !== null) {
                                if (match.index > lastIndex) {
                                  parts.push(line.substring(lastIndex, match.index));
                                }
                                parts.push(<strong key={match.index} className="font-extrabold">{match[1]}</strong>);
                                lastIndex = boldRegex.lastIndex;
                              }
                              
                              if (lastIndex < line.length) {
                                parts.push(line.substring(lastIndex));
                              }

                              return (
                                <p key={lIdx} className="mb-1 last:mb-0">
                                  {parts.length > 0 ? parts : line}
                                </p>
                              );
                            })}
                          </div>

                          {/* Time & Tick */}
                          <div className="flex items-center gap-1 justify-end mt-1 text-[8px] text-neutral-400 self-end font-mono select-none">
                            <span>{msg.time}</span>
                            {msg.sender === "client" && (
                              <span className="text-blue-500 font-bold">✓✓</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {whatsappLoading && (
                        <div className="bg-white p-2.5 rounded-xl rounded-tl-none text-[11px] mr-auto border border-neutral-200 shadow-sm flex items-center gap-1.5 select-none">
                          <span className="h-1.5 w-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 bg-neutral-500 rounded-full animate-bounce" />
                        </div>
                      )}
                    </div>

                    {/* Quick Action Suggestion Chips inside phone */}
                    <div className="bg-neutral-100 border-t border-neutral-200 p-2 space-y-1 select-none">
                      <p className="text-[8px] font-mono font-bold text-neutral-400 text-left uppercase pl-1">Quick Prompts</p>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {[
                          "What are your pricing packages?",
                          "Tell me about Tutor Bethuel",
                          "How do custom video solutions work?"
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={whatsappLoading}
                            onClick={() => {
                              setWhatsappInput(chip);
                            }}
                            className="shrink-0 bg-white hover:bg-neutral-50 text-neutral-700 text-[9px] px-2.5 py-1 rounded-full border border-neutral-300 font-bold transition-all"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* WhatsApp Message Input Bar */}
                    <form 
                      onSubmit={handleSendWhatsappMessage} 
                      className="bg-neutral-100 px-3 py-2 border-t border-neutral-200 flex items-center gap-2 select-none"
                    >
                      <input
                        type="text"
                        value={whatsappInput}
                        onChange={(e) => setWhatsappInput(e.target.value)}
                        placeholder="Type WhatsApp message..."
                        disabled={whatsappLoading}
                        className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-full text-[11px] text-neutral-800 focus:outline-none focus:border-emerald-600 disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={!whatsappInput.trim() || whatsappLoading}
                        className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shrink-0 shadow transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    </form>

                  </div>
                </div>

              </div>

              {/* Advanced Real Webhook Integration Guides */}
              <div className="p-6 bg-navy-50/20 dark:bg-navy-950/10 border border-navy-150 dark:border-navy-850 rounded-2xl space-y-4 text-left animate-fadeIn">
                <button
                  onClick={() => setShowWebhookConfig(!showWebhookConfig)}
                  className="w-full flex items-center justify-between font-black font-mono text-xs uppercase tracking-wider text-navy-800 dark:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-royal-500 animate-pulse" />
                    Real WhatsApp Webhook Deployment Guide (Twilio & Meta)
                  </span>
                  <span className="text-[10px] bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 px-2 py-0.5 rounded font-mono font-bold lowercase">
                    {showWebhookConfig ? "hide config" : "show config"}
                  </span>
                </button>

                {showWebhookConfig && (
                  <div className="space-y-6 pt-4 border-t border-navy-100 dark:border-navy-850 animate-fadeIn">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-navy-600 dark:text-navy-300">
                      
                      {/* Meta Cloud API Guide */}
                      <div className="space-y-3 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded uppercase">Method A</span>
                          <h4 className="font-extrabold text-navy-900 dark:text-white">Meta WhatsApp Cloud API</h4>
                        </div>
                        <ol className="list-decimal pl-4 space-y-2 text-[11px]">
                          <li>Create a Meta Developer App & register your phone number inside your Meta Business manager.</li>
                          <li>Navigate to the **Webhooks** product section, set the Callback URL to:
                            <div className="bg-navy-950 text-white p-2 rounded-lg font-mono text-[9px] select-all my-1 border border-navy-800 break-all">
                              https://amarismaths.co.za/api/whatsapp/webhook
                            </div>
                          </li>
                          <li>Set the **Verify Token** matching your environment variable (default: <code className="font-mono bg-navy-100 dark:bg-navy-800 px-1 rounded text-red-500">amaris_token_2026</code>).</li>
                          <li>Subscribe to <code className="font-mono">messages</code> under WhatsApp Webhook Fields. Meta will verify the URL immediately!</li>
                        </ol>
                      </div>

                      {/* Twilio WhatsApp Sandbox Guide */}
                      <div className="space-y-3 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-black text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded uppercase">Method B</span>
                          <h4 className="font-extrabold text-navy-900 dark:text-white">Twilio WhatsApp Sandbox Setup</h4>
                        </div>
                        <ol className="list-decimal pl-4 space-y-2 text-[11px]">
                          <li>Log in to your **Twilio Console**, go to **Develop &gt; Messaging &gt; Try It Out &gt; Send a WhatsApp Message**.</li>
                          <li>Send the sandbox join code from your phone to connect your account.</li>
                          <li>Navigate to the **Sandbox Settings** tab, and enter the webhook URL:
                            <div className="bg-navy-950 text-white p-2 rounded-lg font-mono text-[9px] select-all my-1 border border-navy-800 break-all">
                              https://amarismaths.co.za/api/whatsapp/webhook
                            </div>
                          </li>
                          <li>Set the HTTP method to **POST**, click save. Twilio will route incoming chats to Gemini instantly!</li>
                        </ol>
                      </div>

                    </div>

                    {/* Sample Code Snippet */}
                    <div className="space-y-2 text-xs">
                      <h4 className="font-extrabold text-navy-900 dark:text-white flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-emerald-500" />
                        Complete Node.js / Express Webhook Middleware Implementation
                      </h4>
                      <div className="bg-navy-950 text-emerald-300 p-4 rounded-xl border border-navy-850 font-mono text-[10px] leading-relaxed overflow-x-auto text-left max-h-[220px]">
                        <pre>{`// This code is already running live on your server!
app.post("/api/whatsapp/webhook", async (req, res) => {
  const incomingMessage = req.body.Body || req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
  const senderPhone = req.body.From || req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;

  if (!incomingMessage) return res.sendStatus(400);

  // Trigger Gemini model inference with full contextual grounding of Amaris Maths Hub
  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: incomingMessage }] }],
    config: { systemInstruction: "..." }
  });

  const replyText = response.text || "";

  // Output Twilio TwiML or Meta Cloud API payload
  if (req.body.Body) {
    res.set("Content-Type", "text/xml");
    return res.status(200).send(\`<?xml version="1.0" encoding="UTF-8"?><Response><Message>\${replyText}</Message></Response>\`);
  } else {
    return res.status(200).json({ status: "success", reply: replyText });
  }
});`}</pre>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

            {activeTab === "ops_excellence" && (
              <OperationalExcellenceHub user={user} />
            )}

            </>
          )}
        </main>
      </div>

      {/* BOOKING WIZARD MODAL DIALOG */}
      <BookingWizard 
        isOpen={bookingWizardOpen} 
        onClose={() => setBookingWizardOpen(false)} 
        user={user} 
        onSuccess={loadRecords}
      />

      {/* POST-SESSION FEEDBACK MODAL DIALOG */}
      <PostSessionFeedbackModal
        isOpen={Boolean(feedbackBooking)}
        onClose={() => {
          if (feedbackBooking) handleDismissFeedback(feedbackBooking.id);
          setFeedbackBooking(null);
        }}
        booking={feedbackBooking}
        user={user}
        onSubmitted={loadRecords}
      />

      {/* LIVE BOARDROOM WHITEBOARD SIMULATION MODAL */}
      {joiningTutorSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-2xl text-white">
            
            {/* Boardroom Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                    Live Boardroom: Tutor {joiningTutorSession.first_name} {joiningTutorSession.surname}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Classroom Reference: <span className="text-gold-400 select-all">AMARIS-ROOM-{joiningTutorSession.id.toUpperCase()}</span>
                  </p>
                </div>
              </div>

              {/* Timer and Close button */}
              <div className="flex items-center gap-3">
                {/* PDF Exam Paper/Memo Presenter Toggle */}
                <button
                  onClick={() => setBoardroomPresenterOpen(!boardroomPresenterOpen)}
                  type="button"
                  className={`px-3.5 py-2 rounded-xl border text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    boardroomPresenterOpen 
                      ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow-md hover:bg-amber-600"
                      : "bg-slate-800 border-slate-700 text-amber-400 hover:text-white hover:bg-slate-750"
                  }`}
                  title="Choose CAPS/IEB, select any year from 2015-2025, or memo to view alongside board"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{boardroomPresenterOpen ? "Close Library Paper" : "Open Library Paper"}</span>
                </button>

                <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono text-[10px]">
                  <Clock className="w-3.5 h-3.5 text-royal-400" />
                  <span>Elapsed: {Math.floor(boardroomElapsed / 60)}:{(boardroomElapsed % 60).toString().padStart(2, "0")}</span>
                </div>
                
                <button
                  onClick={() => setJoiningTutorSession(null)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Leave Class</span>
                </button>
              </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-900">
              
              {/* Optional Column: Library PDF/Memo Presenter */}
              {boardroomPresenterOpen && (
                <div className="w-full lg:w-[420px] shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col overflow-hidden animate-fadeIn">
                  {/* Presenter Tabs */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>AMARIS RESOURCE PRESENTER</span>
                    </span>
                    <button
                      onClick={() => setBoardroomPresenterOpen(false)}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs font-mono font-black"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Filter Subheader */}
                  <div className="p-3 bg-slate-900/40 border-b border-slate-800 space-y-3">
                    {/* Tab Selection */}
                    <div className="flex rounded-lg bg-slate-950 p-1">
                      <button
                        onClick={() => setBoardroomPresenterTab("past_papers")}
                        className={`flex-1 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          boardroomPresenterTab === "past_papers"
                            ? "bg-slate-850 text-amber-400"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Past Exams (2015-2025)
                      </button>
                      <button
                        onClick={() => setBoardroomPresenterTab("guides")}
                        className={`flex-1 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          boardroomPresenterTab === "guides"
                            ? "bg-slate-850 text-amber-400"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Formula Sheets & Guides
                      </button>
                    </div>

                    {boardroomPresenterTab === "past_papers" ? (
                      <div className="space-y-2">
                        {/* Syllabus & Year selection */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* CAPS or IEB Select */}
                          <div>
                            <label className="block text-[8px] font-mono text-slate-500 uppercase mb-1">Curriculum</label>
                            <div className="flex rounded-md bg-slate-950 p-0.5 border border-slate-800">
                              {(["CAPS", "IEB"] as const).map(syll => (
                                <button
                                  key={syll}
                                  type="button"
                                  onClick={() => setBoardroomPresenterSyllabus(syll)}
                                  className={`flex-1 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                                    boardroomPresenterSyllabus === syll
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "text-slate-400 hover:text-white border border-transparent"
                                  }`}
                                >
                                  {syll}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Year Select dropdown */}
                          <div>
                            <label className="block text-[8px] font-mono text-slate-500 uppercase mb-1">Exam Year</label>
                            <select
                              value={boardroomPresenterYear}
                              onChange={e => setBoardroomPresenterYear(parseInt(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                            >
                              {Array.from({ length: 11 }).map((_, idx) => {
                                const yr = 2025 - idx;
                                return <option key={yr} value={yr}>{yr}</option>;
                              })}
                            </select>
                          </div>
                        </div>

                        {/* Paper Code and Type Buttons */}
                        <div>
                          <label className="block text-[8px] font-mono text-slate-500 uppercase mb-1">Select Paper or Memo Type</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: "p1", label: "P1 Exam" },
                              { id: "p1_memo", label: "P1 Memo" },
                              { id: "p2", label: "P2 Exam" },
                              { id: "p2_memo", label: "P2 Memo" }
                            ].map(pType => (
                              <button
                                key={pType.id}
                                type="button"
                                onClick={() => setBoardroomPresenterPaperType(pType.id as any)}
                                className={`py-1 text-[9px] font-mono rounded-md border text-center transition-all cursor-pointer ${
                                  boardroomPresenterPaperType === pType.id
                                    ? "bg-amber-500 text-slate-950 font-black border-amber-500 shadow-sm"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {pType.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="block text-[8px] font-mono text-slate-500 uppercase mb-1">Select Reference Guide</label>
                        <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                          {[
                            { id: "res-1", title: "NSC/CAPS Core Math Formula Sheet", file: "NSC_CAPS_Maths_Formula_Sheet_Verified.pdf" },
                            { id: "res-2", title: "Trig Proof Identities & Reduction Rules", file: "Trig_Identities_General_Rules.pdf" },
                            { id: "res-3", title: "Calculus Optimization Mastery Pack", file: "Calculus_Optimization_Grade12_Upgrade.pdf" }
                          ].map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setBoardroomPresenterSelectedOtherId(item.id)}
                              className={`w-full px-2.5 py-1.5 text-left rounded-md border text-[9px] font-mono flex items-center justify-between transition-all cursor-pointer ${
                                boardroomPresenterSelectedOtherId === item.id
                                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                  : "bg-slate-950 border-slate-800/60 text-slate-400 hover:text-white"
                              }`}
                            >
                              <span className="truncate pr-2">📄 {item.title}</span>
                              <span className="text-[7px] text-slate-500 shrink-0">{item.file}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Simulated Viewer Canvas */}
                  <div className="flex-1 overflow-y-auto p-4 bg-slate-900/30 flex flex-col items-center">
                    {/* Simulated Paper Document Page */}
                    <div className="w-full bg-stone-50 text-slate-900 rounded-lg p-5 shadow-2xl border border-stone-200 flex flex-col min-h-[460px] relative font-sans leading-relaxed text-[11px] max-w-[360px] animate-fadeIn select-text selection:bg-amber-200">
                      
                      {/* Top Ribbon */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-amber-500 rounded-t-lg" />

                      {boardroomPresenterTab === "past_papers" ? (
                        <>
                          {/* Official National Header */}
                          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 font-serif">
                            <h4 className="text-[10px] tracking-widest font-bold text-slate-800 uppercase">
                              {boardroomPresenterSyllabus === "IEB" 
                                ? "Independent Examinations Board (IEB)" 
                                : "Department of Basic Education (DBE)"}
                            </h4>
                            <p className="text-[8px] text-slate-500 font-sans tracking-wide mt-0.5">
                              REPUBLIC OF SOUTH AFRICA
                            </p>
                            <div className="h-[1px] bg-slate-300 my-1.5" />
                            <h3 className="text-xs font-black tracking-normal text-slate-900">
                              NATIONAL SENIOR CERTIFICATE EXAMINATIONS
                            </h3>
                            <div className="flex justify-between items-center text-[8px] font-sans text-slate-600 px-1 mt-1">
                              <span>SUBJECT: MATHEMATICS</span>
                              <span className="font-bold">YEAR: {boardroomPresenterYear}</span>
                              <span>GRADE 12</span>
                            </div>
                          </div>

                          {/* Paper metadata block */}
                          <div className="bg-slate-100 p-2 rounded-md mb-4 border border-slate-200 text-[9px] text-slate-700 font-mono flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900">
                                {boardroomPresenterPaperType.startsWith("p1") ? "PAPER 1" : "PAPER 2"}
                              </span> 
                              <span> ({boardroomPresenterPaperType.endsWith("memo") ? "MARKING MEMORANDUM" : "EXAMINATION PAPER"})</span>
                            </div>
                            <span className="text-royal-600 font-bold bg-royal-50 px-1.5 py-0.5 rounded border border-royal-200">
                              {boardroomPresenterSyllabus}
                            </span>
                          </div>

                          {/* Interactive content rendering */}
                          <div className="flex-1 space-y-4">
                            {/* Question Details based on Paper choices */}
                            {boardroomPresenterPaperType === "p1" && (
                              <div className="space-y-3">
                                <div className="border-l-2 border-amber-500 pl-2">
                                  <p className="font-extrabold text-slate-900">QUESTION 3 [14 MARKS] (Algebraic Inverse Properties)</p>
                                  <p className="text-slate-500 text-[9px] italic">Suggested time: 10 minutes</p>
                                </div>
                                <p className="text-slate-800 font-medium">
                                  Given: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold font-semibold">f(x) = 3<sup>x</sup></span>
                                </p>
                                <div className="space-y-2.5 pl-3">
                                  <p>
                                    <span className="font-bold">3.1</span> Write down the equation of <span className="font-mono font-bold">f<sup>-1</sup>(x)</span> in the form <span className="font-mono italic font-semibold">y = ...</span> <span className="text-slate-500 font-bold ml-1">[2]</span>
                                  </p>
                                  <p>
                                    <span className="font-bold">3.2</span> Project the sketches of <span className="font-mono font-semibold">f</span> and <span className="font-mono font-semibold">f<sup>-1</sup></span> on the board using the <span className="text-amber-600 font-bold font-mono">Interactive whiteboard projection tool</span> below. <span className="text-slate-500 font-bold ml-1">[4]</span>
                                  </p>
                                  <p>
                                    <span className="font-bold">3.3</span> Show algebraically or graphically why the lines of symmetry of these curves is represented by <span className="font-mono font-bold font-semibold">y = x</span>. <span className="text-slate-500 font-bold ml-1">[8]</span>
                                  </p>
                                </div>
                              </div>
                            )}

                            {boardroomPresenterPaperType === "p1_memo" && (
                              <div className="space-y-3">
                                <div className="border-l-2 border-emerald-500 pl-2">
                                  <p className="font-extrabold text-emerald-800 uppercase text-[10px]">MARKING GUIDELINES / MEMORANDUM</p>
                                  <p className="font-bold text-slate-900">QUESTION 3 SOLUTIONS</p>
                                </div>
                                <div className="space-y-3 font-mono text-[9.5px] text-slate-800 divide-y divide-slate-100">
                                  <div className="pt-2">
                                    <p className="font-bold text-slate-900 mb-1">3.1 Solution:</p>
                                    <p>f(x) = 3<sup>x</sup> &rArr; swap variables for inverse:</p>
                                    <p className="font-bold text-royal-600 pl-2">x = 3<sup>y</sup> &rArr; y = log<sub>3</sub>(x)</p>
                                    <p className="text-slate-500 text-[8px] mt-1">&bull; Interchange variables [1 mark]<br/>&bull; Express in log form [1 mark]</p>
                                  </div>
                                  <div className="pt-3">
                                    <p className="font-bold text-slate-900 mb-1">3.2 Graph Plotting:</p>
                                    <p>Curve f(x) passes through (0; 1) with horizontal asymptote y = 0.</p>
                                    <p>Curve f<sup>-1</sup>(x) passes through (1; 0) with vertical asymptote x = 0.</p>
                                    <p className="text-slate-500 text-[8px] mt-1">&bull; Shape of exponential [1 mark]<br/>&bull; Shape of log [1 mark]<br/>&bull; Correct intercepts [2 marks]</p>
                                  </div>
                                  <div className="pt-3">
                                    <p className="font-bold text-slate-900 mb-1">3.3 Reflection Proof:</p>
                                    <p>For any point (a; b) on curve f, the point (b; a) must exist on f<sup>-1</sup>. This represents a reflection across line y = x.</p>
                                    <p className="text-slate-500 text-[8px] mt-1">&bull; Definition of reflection [3 marks]<br/>&bull; Formal coordinate map [5 marks]</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {boardroomPresenterPaperType === "p2" && (
                              <div className="space-y-3">
                                <div className="border-l-2 border-amber-500 pl-2">
                                  <p className="font-extrabold text-slate-900">QUESTION 5 [18 MARKS] (Circle Coordinate Geometry)</p>
                                  <p className="text-slate-500 text-[9px] italic">Suggested time: 14 minutes</p>
                                </div>
                                <p className="text-slate-800">
                                  A circle with center <span className="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold font-semibold">C(2; -1)</span> passes through the coordinate point <span className="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold font-semibold">A(5; 3)</span>.
                                </p>
                                <div className="space-y-2.5 pl-3">
                                  <p>
                                    <span className="font-bold">5.1</span> Calculate the length of the radius <span className="font-mono font-semibold font-bold">CA</span>, and write down the equation of the circle in general form. <span className="text-slate-500 font-bold ml-1">[4]</span>
                                  </p>
                                  <p>
                                    <span className="font-bold">5.2</span> Determine the gradient of the radius line segment <span className="font-mono font-semibold font-bold">CA</span>. <span className="text-slate-500 font-bold ml-1">[3]</span>
                                  </p>
                                  <p>
                                    <span className="font-bold">5.3</span> Hence, find the equation of the tangent to the circle at point <span className="font-mono font-semibold font-bold">A</span>. <span className="text-slate-500 font-bold ml-1">[11]</span>
                                  </p>
                                </div>
                              </div>
                            )}

                            {boardroomPresenterPaperType === "p2_memo" && (
                              <div className="space-y-3">
                                <div className="border-l-2 border-emerald-500 pl-2">
                                  <p className="font-extrabold text-emerald-800 uppercase text-[10px]">MARKING GUIDELINES / MEMORANDUM</p>
                                  <p className="font-bold text-slate-900">QUESTION 5 SOLUTIONS</p>
                                </div>
                                <div className="space-y-3 font-mono text-[9.5px] text-slate-800 divide-y divide-slate-100">
                                  <div className="pt-2">
                                    <p className="font-bold text-slate-900 mb-1">5.1 Solution:</p>
                                    <p>r<sup>2</sup> = (x<sub>2</sub> - x<sub>1</sub>)<sup>2</sup> + (y<sub>2</sub> - y<sub>1</sub>)<sup>2</sup></p>
                                    <p>r<sup>2</sup> = (5 - 2)<sup>2</sup> + (3 - (-1))<sup>2</sup> = 3<sup>2</sup> + 4<sup>2</sup> = 25 &rArr; radius = 5</p>
                                    <p className="font-bold text-emerald-700">Circle Eq: (x - 2)<sup>2</sup> + (y + 1)<sup>2</sup> = 25</p>
                                    <p className="text-slate-500 text-[8px] mt-1">&bull; Apply distance formula [2 marks]<br/>&bull; Correct general equation [2 marks]</p>
                                  </div>
                                  <div className="pt-3">
                                    <p className="font-bold text-slate-900 mb-1">5.2 Gradient CA:</p>
                                    <p>m<sub>CA</sub> = (y<sub>A</sub> - y<sub>C</sub>) / (x<sub>A</sub> - x<sub>C</sub>)</p>
                                    <p>m<sub>CA</sub> = (3 - (-1)) / (5 - 2) = <span className="font-bold text-royal-600">4 / 3</span></p>
                                    <p className="text-slate-500 text-[8px] mt-1">&bull; Slope calculation setup [1 mark]<br/>&bull; Correct fraction [2 marks]</p>
                                  </div>
                                  <div className="pt-3">
                                    <p className="font-bold text-slate-900 mb-1">5.3 Tangent Equation:</p>
                                    <p>Tangent line &perp; radius segment CA &rArr; m<sub>tangent</sub> &times; m<sub>CA</sub> = -1</p>
                                    <p>m<sub>tangent</sub> = -3 / 4. Point A(5; 3):</p>
                                    <p>y - y<sub>1</sub> = m(x - x<sub>1</sub>) &rArr; y - 3 = -¾(x - 5)</p>
                                    <p className="font-bold text-royal-600">y = -¾x + 27/4</p>
                                    <p className="text-slate-500 text-[8px] mt-1">&bull; Perpendicular slope logic [3 marks]<br/>&bull; Equation derivation and simplification [8 marks]</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="border-t border-slate-200 pt-3 mt-4 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                            <span>Page 2 of 11</span>
                            <span>SA NSC-IEB MAT-P{boardroomPresenterPaperType.startsWith("p1") ? "1" : "2"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Supplemental study sheet view */}
                          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                            <h4 className="text-[10px] tracking-widest font-black text-slate-800 uppercase">
                              AMARIS ACADEMY SUPPLEMENTARY
                            </h4>
                            <p className="text-[8px] text-slate-500 font-mono mt-0.5">
                              OFFICIAL LIBRARY REFERENCE MATERIAL
                            </p>
                          </div>

                          {boardroomPresenterSelectedOtherId === "res-1" || !boardroomPresenterSelectedOtherId ? (
                            <div className="flex-1 space-y-3">
                              <h3 className="font-extrabold text-xs text-slate-900">National Core Mathematics Formula Booklet</h3>
                              <div className="bg-slate-100 p-2.5 rounded border border-slate-200 text-[9px] font-mono text-slate-700 space-y-2">
                                <p className="font-black text-slate-800 border-b border-slate-200 pb-1">ALGEBRAIC FORMULAS:</p>
                                <p>Quadratic Formula: x = [-b &plusmn; &radic;(b² - 4ac)] / 2a</p>
                                <p>Logarithm Def: y = log<sub>a</sub>(x) &hArr; x = a<sup>y</sup></p>
                                <p className="font-black text-slate-800 border-b border-slate-200 pb-1 pt-1">SERIES & SEQUENCES:</p>
                                <p>Arithmetic Term: T<sub>n</sub> = a + (n-1)d</p>
                                <p>Geometric Sum: S<sub>n</sub> = a(1 - r<sup>n</sup>)/(1 - r)</p>
                                <p>Convergent Infinite: S<sub>&infin;</sub> = a / (1 - r) ; |r| &lt; 1</p>
                              </div>
                            </div>
                          ) : boardroomPresenterSelectedOtherId === "res-2" ? (
                            <div className="flex-1 space-y-3">
                              <h3 className="font-extrabold text-xs text-slate-900">Trigonometric Reduction & Identities Quick Guide</h3>
                              <div className="bg-slate-100 p-2.5 rounded border border-slate-200 text-[9px] font-mono text-slate-700 space-y-2">
                                <p className="font-black text-slate-800 border-b border-slate-200 pb-1">COMPOUND ANGLE EXPANSIONS:</p>
                                <p>cos(A &plusmn; B) = cos A cos B &mp; sin A cos B</p>
                                <p>sin(A &plusmn; B) = sin A cos B &plusmn; cos A sin B</p>
                                <p className="font-black text-slate-800 border-b border-slate-200 pb-1 pt-1">REDUCTION QUADRANTS:</p>
                                <p>sin(180&deg; - &theta;) = sin &theta; | cos(180&deg; - &theta;) = -cos &theta;</p>
                                <p>sin(180&deg; + &theta;) = -sin &theta; | cos(180&deg; + &theta;) = -cos &theta;</p>
                                <p>sin(360&deg; - &theta;) = -sin &theta; | cos(360&deg; - &theta;) = cos &theta;</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 space-y-3">
                              <h3 className="font-extrabold text-xs text-slate-900">Differential Calculus Optimization Mastery Pack</h3>
                              <div className="bg-slate-100 p-2.5 rounded border border-slate-200 text-[9px] font-mono text-slate-700 space-y-2">
                                <p className="font-black text-slate-800 border-b border-slate-200 pb-1">FIRST PRINCIPLES DERIVATIVE:</p>
                                <p>f'(x) = lim<sub>h&rarr;0</sub> [f(x+h) - f(x)] / h</p>
                                <p className="font-black text-slate-800 border-b border-slate-200 pb-1 pt-1">OPTIMIZATION RULES:</p>
                                <p>1. Find equation of the quantity to be optimized (e.g. Volume V in terms of single variable r).</p>
                                <p>2. Calculate derivative: dV/dr</p>
                                <p>3. Set derivative to zero (dV/dr = 0) and solve for r.</p>
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="border-t border-slate-200 pt-3 mt-4 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                            <span>Page 1 of 1</span>
                            <span>SA AMARIS-REFERENCE-GUIDE-12</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Active Projection Footer Actions */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
                    {boardroomPresenterTab === "past_papers" && (
                      <button
                        onClick={() => plotGraphOnWhiteboard(boardroomPresenterSyllabus, boardroomPresenterYear, boardroomPresenterPaperType)}
                        type="button"
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 select-none"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Plot Dynamic Models onto Whiteboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const contentText = boardroomPresenterTab === "past_papers" 
                          ? `Reference Paper Request: Please review ${boardroomPresenterSyllabus} ${boardroomPresenterYear} ${boardroomPresenterPaperType.toUpperCase().replace("_", " ")} currently open on the presentation panel. Let's solve Question 3 together!` 
                          : `Reference Material Help: Please help me review the supplementary guide "${boardroomPresenterSelectedOtherId === "res-1" ? "Formula Sheet" : boardroomPresenterSelectedOtherId === "res-2" ? "Trig identities" : "Calculus Optimization"}" on the panel.`;
                        setBoardroomMessages(prev => [
                          ...prev,
                          {
                            id: "stud-paper-" + Date.now(),
                            sender: "student",
                            text: contentText,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        ]);
                        // trigger tutor response script
                        setBoardroomTutorTyping(true);
                        setTimeout(() => {
                          setBoardroomTutorTyping(false);
                          setBoardroomMessages(prev => [
                            ...prev,
                            {
                              id: "tutor-paper-ans-" + Date.now(),
                              sender: "tutor",
                              text: boardroomPresenterTab === "past_papers" 
                                ? `Excellent pick! The ${boardroomPresenterSyllabus} ${boardroomPresenterYear} ${boardroomPresenterPaperType.toUpperCase().replace("_", " ")} is fantastic for practice. Let me outline the exact core formula definitions on the whiteboard grid so you can see where the marking rubric allocates key marks. What is your initial attempt at simplifying the algebraic expressions?` 
                                : `Of course! Let's break down this reference material step-by-step. Let me draft a quick proof example right on the board. Let's focus on those trig compounds/reductions first.`,
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                        }, 1800);
                      }}
                      type="button"
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg text-[10px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700 select-none"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-300" />
                      <span>Send Page Reference to Room Chat</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Left Column: Interactive Whiteboard */}
              <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-4 overflow-hidden border-r border-slate-800">
                {/* Whiteboard Toolbar */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Whiteboard Tools:</span>
                    
                    {/* Pen Color select */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { hex: "#eab308", name: "Gold" },
                        { hex: "#ef4444", name: "Red" },
                        { hex: "#3b82f6", name: "Blue" },
                        { hex: "#10b981", name: "Green" },
                        { hex: "#ffffff", name: "White" },
                        { hex: "#0f172a", name: "Dark Slate" }
                      ].map(color => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => {
                            setPenColor(color.hex);
                            setIsEraser(false);
                          }}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            penColor === color.hex && !isEraser 
                              ? "border-amber-400 ring-2 ring-amber-400/20 scale-110" 
                              : "border-slate-700 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name} Pen`}
                        />
                      ))}
                    </div>

                    <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                    {/* Eraser */}
                    <button
                      onClick={() => setIsEraser(!isEraser)}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                        isEraser 
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow-sm" 
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Eraser
                    </button>

                    {/* Undo / Redo Actions */}
                    <button
                      onClick={handleUndo}
                      disabled={undoStack.length <= 1}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                        undoStack.length <= 1
                          ? "border-slate-800/45 text-slate-600 cursor-not-allowed opacity-55"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="Undo last action"
                    >
                      ↩️ Undo
                    </button>

                    <button
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                        redoStack.length === 0
                          ? "border-slate-800/45 text-slate-600 cursor-not-allowed opacity-55"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="Redo next action"
                    >
                      ↪️ Redo
                    </button>

                    <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                    {/* Ruler Drawing Mode Toggle */}
                    <button
                      onClick={() => {
                        setRulerMode(rulerMode === "free" ? "line" : "free");
                        setIsEraser(false);
                      }}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        rulerMode === "line"
                          ? "bg-royal-500 border-royal-500 text-white font-black shadow-sm"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="Toggle straight lines instead of freehand curves"
                    >
                      <span>📏 {rulerMode === "line" ? "Straight Line" : "Freehand"}</span>
                    </button>

                    {/* Virtual Ruler Overlay Toggle */}
                    <button
                      onClick={() => setShowRuler(!showRuler)}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        showRuler
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow-sm"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="Show floating geometric measurement ruler"
                    >
                      <span>📐 Ruler: {showRuler ? "ON" : "OFF"}</span>
                    </button>

                    <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                    {/* Board Theme Selection */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Board:</span>
                      {[
                        { hex: "#0f172a", name: "Slate Blue" },
                        { hex: "#000000", name: "Midnight" },
                        { hex: "#064e3b", name: "Chalkboard" },
                        { hex: "#ffffff", name: "Whiteboard" },
                        { hex: "#fafaf9", name: "Soft Stone" }
                      ].map(bg => (
                        <button
                          key={bg.hex}
                          type="button"
                          onClick={() => changeBoardroomBgColor(bg.hex)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                            boardroomBgColor === bg.hex ? "border-amber-400 ring-2 ring-amber-400/20 scale-110" : "border-slate-800 hover:scale-105"
                          }`}
                          style={{ backgroundColor: bg.hex }}
                          title={`${bg.name} Background`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Brush Size Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Brush: {penWidth}px</span>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={penWidth}
                        onChange={e => setPenWidth(parseInt(e.target.value))}
                        className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                      />
                    </div>

                    <div className="h-4 w-[1px] bg-slate-800" />

                    {/* Clear Board */}
                    <button
                      onClick={clearCanvas}
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-400 font-mono text-[10px] transition-all cursor-pointer"
                    >
                      Clear Board
                    </button>
                  </div>
                </div>

                {/* Whiteboard Canvas Area */}
                <div className="flex-1 relative border border-slate-800 rounded-xl overflow-hidden cursor-crosshair" style={{ backgroundColor: boardroomBgColor }}>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full block"
                    style={{ backgroundColor: boardroomBgColor }}
                  />

                  {/* Straight Line Preview Overlay */}
                  {rulerMode === "line" && lineStart && lineCurrent && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      <line
                        x1={`${(lineStart.x / 800) * 100}%`}
                        y1={`${(lineStart.y / 500) * 100}%`}
                        x2={`${(lineCurrent.x / 800) * 100}%`}
                        y2={`${(lineCurrent.y / 500) * 100}%`}
                        stroke={isEraser ? boardroomBgColor : penColor}
                        strokeWidth={penWidth}
                        strokeDasharray="4 4"
                      />
                    </svg>
                  )}

                  {/* Physical Ruler Visual Overlay */}
                  {showRuler && (
                    <div
                      style={{
                        left: `${(rulerX / 800) * 100}%`,
                        top: `${(rulerY / 500) * 100}%`,
                        width: `${(rulerWidth / 800) * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${rulerAngle}deg)`,
                      }}
                      className="absolute h-11 bg-amber-500/15 border border-amber-500/40 rounded shadow-lg flex flex-col justify-between pointer-events-none z-10 transition-all overflow-hidden select-none"
                    >
                      {/* Ruler Ticks */}
                      <div className="w-full h-3 flex justify-between px-2 items-start border-b border-amber-500/30">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="w-[1px] h-2 bg-amber-500/60" />
                            {i % 2 === 0 && (
                              <span className="text-[6px] text-amber-400 font-mono scale-90 -translate-y-1">
                                {i}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Center label */}
                      <div className="flex items-center justify-center gap-1.5 text-[8px] font-mono text-amber-400/80 uppercase tracking-widest font-black">
                        <span>📐 AMARIS GEOMETRY RULER</span>
                        <span className="text-[7px] text-amber-500">({rulerAngle}°)</span>
                      </div>

                      {/* Bottom Ticks */}
                      <div className="w-full h-1.5 flex justify-between px-2 items-end">
                        {Array.from({ length: 31 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-[1px] bg-amber-500/40 ${
                              i % 5 === 0 ? "h-1.5 bg-amber-500/70" : "h-1"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ruler Floating Precision Controls Dashboard */}
                  {showRuler && (
                    <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl z-20 w-64 space-y-3 pointer-events-auto animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          📐 Ruler Controls
                        </span>
                        <button 
                          onClick={() => setShowRuler(false)}
                          className="text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-[10px] font-mono">
                        {/* Rotation Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Angle:</span>
                            <span className="text-amber-400 font-bold">{rulerAngle}°</span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={rulerAngle}
                            onChange={e => setRulerAngle(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                          {/* Preset Angles */}
                          <div className="flex justify-between gap-1 pt-1">
                            {[0, 30, 45, 60, 90].map(angle => (
                              <button
                                key={angle}
                                onClick={() => setRulerAngle(angle)}
                                className={`px-1.5 py-0.5 rounded text-[9px] bg-slate-800 hover:bg-slate-700 transition-colors border ${
                                  rulerAngle === angle ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400"
                                }`}
                              >
                                {angle}°
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Y Position */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Vertical Pos:</span>
                            <span>{rulerY}px</span>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="460"
                            value={rulerY}
                            onChange={e => setRulerY(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>

                        {/* X Position */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Horizontal Pos:</span>
                            <span>{rulerX}px</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="750"
                            value={rulerX}
                            onChange={e => setRulerX(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>

                        {/* Ruler Width */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Ruler Length:</span>
                            <span>{rulerWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min="200"
                            max="600"
                            value={rulerWidth}
                            onChange={e => setRulerWidth(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                          <button
                            onClick={drawRulerLine}
                            type="button"
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            ✏️ Draw Line Along Ruler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
                    ✏️ {rulerMode === "line" ? "Click and Drag to draw perfectly straight lines" : "Left click + Drag to write mathematical formulas on the whiteboard"}
                  </div>
                </div>
              </div>

              {/* Right Column: Chat and Tutor Info */}
              <div className={`w-full ${boardroomPresenterOpen ? "lg:w-80" : "lg:w-96"} flex flex-col bg-slate-950 overflow-hidden`}>
                {/* Tutor Card in Chat */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3 animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs">
                    {joiningTutorSession.first_name[0]}{joiningTutorSession.surname[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Tutor {joiningTutorSession.first_name}</h4>
                    <p className="text-[10px] font-mono text-emerald-400">Active Math Specialist</p>
                  </div>
                </div>

                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {boardroomMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col text-xs max-w-[85%] ${
                        msg.sender === "student" ? "ml-auto items-end" : "items-start"
                      }`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap text-left ${
                          msg.sender === "student"
                            ? "bg-royal-600 text-white rounded-tr-none animate-fadeIn"
                            : msg.id.startsWith("sys")
                            ? "bg-slate-900/80 text-emerald-400 font-mono border border-emerald-500/10 text-[10px] w-full max-w-full"
                            : "bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800 animate-fadeIn"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}

                  {/* Tutor is typing indicator */}
                  {boardroomTutorTyping && (
                    <div className="flex flex-col items-start max-w-[85%] animate-fadeIn">
                      <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1">Tutor is sketching response...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendBoardroomChat} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask tutor a question or type 'yes' / 'no'..."
                    value={boardroomInput}
                    onChange={e => setBoardroomInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-royal-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================= ACADEMIC INTEGRITY MODAL ======================= */}
      {selectedIntegritySub && user && (() => {
        const hw = assignments.find(a => a.id === selectedIntegritySub.assignment_id) || {
          title: "Maths Worksheet Solution",
          subject: "Mathematics CAPS Grade 12"
        } as HomeworkAssignment;
        const report = getIntegrityReport(selectedIntegritySub, user, hw);

        return (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setSelectedIntegritySub(null)}
                className="absolute top-5 right-5 text-navy-400 hover:text-navy-600 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-navy-50 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                {/* Header branding */}
                <div className="flex items-center gap-3 border-b border-navy-100 dark:border-navy-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-royal-100 dark:bg-navy-950 flex items-center justify-center text-royal-600 dark:text-gold-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-display text-navy-900 dark:text-white leading-tight uppercase tracking-tight">
                      Academic Integrity & Authentication Report
                    </h3>
                    <p className="text-[10px] text-navy-500 dark:text-navy-400 font-mono">
                      REPORT ID: <span className="text-royal-600 dark:text-gold-400 font-bold">{report.id}</span> • VERIFIED VIA AMARIS AI GUARD
                    </p>
                  </div>
                </div>

                {/* Info & stats grids */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Metadata list */}
                  <div className="bg-navy-50/50 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-850 rounded-xl p-4 space-y-2 text-xs">
                    <h4 className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">Candidate Details</h4>
                    <p className="text-navy-800 dark:text-navy-200">Candidate: <b>{report.studentName}</b></p>
                    <p className="text-navy-800 dark:text-navy-200">Syllabus / Grade: <span className="font-mono text-xs">{report.grade}</span></p>
                    <p className="text-navy-800 dark:text-navy-200">Target Assignment: {report.assignmentTitle}</p>
                    <p className="text-[10px] text-navy-400 font-mono break-all">Hash: {report.sha256Hash}</p>
                  </div>

                  {/* Overall score indicators */}
                  <div className="bg-navy-50/50 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-850 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider mb-2">Overall Standing</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{report.overallScore}%</span>
                        <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400">Authentic</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-navy-100 dark:border-navy-800/60 flex justify-between items-center text-xs">
                      <span className="text-navy-500 dark:text-navy-400 font-medium">Risk Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase ${
                        report.riskLevel === "Low" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                        report.riskLevel === "Medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                        "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                      }`}>
                        {report.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual score bars for different vectors */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider border-b border-navy-100 dark:border-navy-850 pb-2">
                    Detailed Risk Vector Analysis
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Vector 1 */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-navy-50/30 dark:bg-navy-950/20 border border-navy-100/50 dark:border-navy-800/40">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-bold text-navy-700 dark:text-navy-300">Handwriting Match Rate</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{report.handwritingMatch}%</span>
                      </div>
                      <div className="w-full bg-navy-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${report.handwritingMatch}%` }} />
                      </div>
                      <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-tight italic">"{report.handwritingStatus}"</p>
                    </div>

                    {/* Vector 2 */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-navy-50/30 dark:bg-navy-950/20 border border-navy-100/50 dark:border-navy-800/40">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-bold text-navy-700 dark:text-navy-300">Step Logic Coherence</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{report.logicCoherence}%</span>
                      </div>
                      <div className="w-full bg-navy-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${report.logicCoherence}%` }} />
                      </div>
                      <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-tight italic">"{report.logicStatus}"</p>
                    </div>

                    {/* Vector 3 */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-navy-50/30 dark:bg-navy-950/20 border border-navy-100/50 dark:border-navy-800/40">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-bold text-navy-700 dark:text-navy-300">AI Generation Probability</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{report.aiProbability}%</span>
                      </div>
                      <div className="w-full bg-navy-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-royal-600 h-full transition-all duration-500" style={{ width: `${report.aiProbability}%` }} />
                      </div>
                      <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-tight italic">"{report.aiStatus}"</p>
                    </div>

                    {/* Vector 4 */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-navy-50/30 dark:bg-navy-950/20 border border-navy-100/50 dark:border-navy-800/40">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-bold text-navy-700 dark:text-navy-300">Plagiarism Match Index</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{report.plagiarismIndex}%</span>
                      </div>
                      <div className="w-full bg-navy-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-royal-600 h-full transition-all duration-500" style={{ width: `${report.plagiarismIndex}%` }} />
                      </div>
                      <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-tight italic">"{report.plagiarismStatus}"</p>
                    </div>
                  </div>
                </div>

                {/* Structured Findings List */}
                <div className="space-y-3 bg-navy-50/30 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-850 rounded-xl p-4">
                  <h4 className="text-xs font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider">
                    Detailed Verification Findings
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {report.findings.map((finding, idx) => (
                      <li key={idx} className="flex gap-2 text-navy-600 dark:text-navy-300 font-medium">
                        <span className="text-royal-600 dark:text-gold-400">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-between border-t border-navy-100 dark:border-navy-800">
                  <p className="text-[9px] text-navy-400 font-mono leading-relaxed max-w-sm">
                    This automated SBA verification is sealed. Sharing or altering this document voids the official AMARIS certificate validation hash.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIntegritySub(null)}
                      className="px-4 py-2 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-850"
                    >
                      Close Report
                    </button>
                    <button
                      type="button"
                      onClick={() => exportIntegrityReportPDF(report)}
                      className="px-5 py-2 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Slide-in Toast Notification Popup */}
      {toastNotification && (
        <motion.div 
          initial={{ opacity: 0, x: 100, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-24 right-6 z-50 max-w-sm w-[90vw] sm:w-80 bg-navy-950/95 backdrop-blur border border-gold-400/40 text-white rounded-2xl shadow-2xl p-4 flex gap-3 text-left"
          style={{ boxShadow: "0 15px 30px -5px rgba(251, 191, 36, 0.2)" }}
        >
          <div className="p-2 bg-gold-400/10 border border-gold-400/20 rounded-xl h-fit text-gold-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start gap-2">
              <span className="text-[9px] font-mono font-black text-gold-400 uppercase tracking-widest">
                New Alert!
              </span>
              <button 
                onClick={() => setToastNotification(null)}
                className="text-navy-400 hover:text-white transition-colors p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-xs font-black text-white leading-tight">
              {toastNotification.title}
            </h3>
            <p className="text-[10px] text-navy-300 leading-snug line-clamp-2">
              {toastNotification.message}
            </p>
            <div className="flex gap-1.5 pt-1">
              <button 
                onClick={() => {
                  dbAPI.markNotificationAsRead(toastNotification.id);
                  setToastNotification(null);
                  loadRecords();
                  setActiveTab("notifications");
                }}
                className="px-2.5 py-1 bg-royal-600 hover:bg-royal-700 text-white text-[9px] font-mono font-black rounded-md transition-colors cursor-pointer"
              >
                View
              </button>
              <button 
                onClick={() => {
                  dbAPI.markNotificationAsRead(toastNotification.id);
                  setToastNotification(null);
                  loadRecords();
                }}
                className="px-2.5 py-1 bg-navy-800 hover:bg-navy-750 text-navy-300 hover:text-white text-[9px] font-mono font-bold rounded-md transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* PRINT PREVIEW MODAL */}
      <PrintPreviewModal 
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        studentName={`${user.first_name} ${user.surname}`}
        grade={user.grade || "Grade 12"}
      />

      {/* Floating Live Tutor Chat FAB */}
      <motion.button
        type="button"
        onClick={() => setIsLiveTutorChatOpen(true)}
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-52 z-40 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2 group transition-shadow duration-300 border border-gold-400/40 cursor-pointer"
        id="live-tutor-chat-fab"
        title="Open Live Tutor Chat Sidebar"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping border border-navy-900" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-[11px] font-black font-mono tracking-wider uppercase whitespace-nowrap">
          Live Tutor Chat
        </span>
      </motion.button>

      {/* Floating WhatsApp FAB */}
      <motion.a
        href="https://wa.me/27714156665?text=Hi%20Amaris%20Learning%20Hub%2C%20I%20have%20a%20question%20about%20my%20lessons%20or%20homework."
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2 group transition-shadow duration-300 border border-emerald-500/20"
        id="whatsapp-dashboard-fab"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-[11px] font-black font-mono tracking-wider uppercase whitespace-nowrap">
          Chat via WhatsApp
        </span>
      </motion.a>

      {/* Firebase Realtime Live Tutor Chat Sidebar */}
      <LiveTutorChatSidebar
        user={user}
        isOpen={isLiveTutorChatOpen}
        onClose={() => setIsLiveTutorChatOpen(false)}
      />

      {/* Physical Material QR Code Scanner Modal */}
      {user && (
        <QRCodeScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          user={user}
        />
      )}

    </div>
  );
};
