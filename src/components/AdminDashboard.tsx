import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Shield, Users, Calendar, FileText, Video, CreditCard, Megaphone,
  Mail, Settings, Plus, Search, CheckCircle, XCircle, Clock,
  ArrowRight, ExternalLink, Star, Trash2, Edit3, Eye, FileUp, Check,
  AlertTriangle, RefreshCw, BarChart3, TrendingUp, AlertCircle, PlusCircle, Bookmark, Sparkles, ShieldCheck, Download, Award, ShieldAlert,
  Gauge, Play, StopCircle, Globe, History, Zap, Brain, Layers, Coins, Terminal, Activity,
  Tag, Sliders, CheckSquare, Square, FolderEdit, ListChecks, SlidersHorizontal, CheckCircle2
} from "lucide-react";
import { getIntegrityReport, exportIntegrityReportPDF, IntegrityReport } from "../lib/integrity";
import { useForm } from "react-hook-form";
import {
  Profile, Subject, Booking, Payment, HomeworkAssignment,
  HomeworkSubmission, VideoLessonRequest, Announcement, ContactMessage, ActivityLog,
  AttendanceEvent, VideoToSell, ResourceLibraryItem, Subscriber, EmailLog
} from "../types";
import { dbAPI } from "../lib/db";
import { PDFPreviewerModal } from "./PDFPreviewerModal";
import { PDFMetadataModal } from "./PDFMetadataModal";
import { extractPDFMetadata, PDFTechnicalMetadata } from "../services/pdfMetadataService";
import { TutorReportsDashboard } from "./TutorReportsDashboard";
import { OpsDashboard } from "./OpsDashboard";
import { ExecutiveOperationsDashboard } from "./ExecutiveOperationsDashboard";
import { LoadTestingDashboard } from "./LoadTestingDashboard";
import { PerformanceAdvisor } from "./PerformanceAdvisor";
import { IncidentResponseCenter } from "./IncidentResponseCenter";
import { AIOpsOperationsAssistant } from "./AIOpsOperationsAssistant";
import { InfrastructureTopologyMap } from "./InfrastructureTopologyMap";
import { APIPerformanceRanking } from "./APIPerformanceRanking";
import { CostAnalytics } from "./CostAnalytics";
import { SystemLogsDashboard } from "./SystemLogsDashboard";
import { SecurityDashboard } from "./SecurityDashboard";
import { MFASetup } from "./MFASetup";
import { CapacityPlanning } from "./CapacityPlanning";
import { DjangoAdminDashboard } from "./DjangoAdminDashboard";
import { AutomatedTutorMatching } from "./AutomatedTutorMatching";
import { PerformanceAnalytics } from "./PerformanceAnalytics";
import { SystemStatusCard } from "./SystemStatusCard";
import { WeeklySummaryServiceWidget } from "./WeeklySummaryServiceWidget";
import { SystemDocumentation } from "./SystemDocumentation";
import { OperationalHealth } from "./OperationalHealth";
import { SystemAuditLogs } from "./SystemAuditLogs";
import { CentralizedLoggingDashboard } from "./CentralizedLoggingDashboard";
import { VisualLatexToolbar } from "./VisualLatexToolbar";
import { AmarisLogo } from "./AmarisLogo";
import { CreateZoomMeetingModal } from "./CreateZoomMeetingModal";
import { getFileIconAndBadge } from "./HomeworkCenter";
import { AdminGoogleSheetsWidget } from "./AdminGoogleSheetsWidget";
import { FileSpreadsheet } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

const TIME_SLOTS = [
  "08:30 - 09:30",
  "10:00 - 11:00",
  "11:30 - 12:30",
  "13:30 - 14:30",
  "15:00 - 16:00",
  "16:30 - 17:30",
  "18:00 - 19:00"
];

interface AdminDashboardProps {
  user: Profile | null;
}

type AdminTab = 
  | "analytics" 
  | "google_sheets"
  | "users" 
  | "bookings" 
  | "homework" 
  | "videos" 
  | "announcements" 
  | "messages" 
  | "subjects"
  | "attendance"
  | "videosToSell"
  | "resources"
  | "cancelled"
  | "subscribers"
  | "emailLogs"
  | "examDeliveries"
  | "availability"
  | "tutor_matching"
  | "tutor_reports"
  | "monitoring"
  | "executive_ops"
  | "load_testing"
  | "performance_advisor"
  | "incident_response"
  | "aiops_assistant"
  | "infra_topology"
  | "api_performance"
  | "cost_analytics"
  | "system_logs"
  | "security"
  | "mfa_setup"
  | "capacity_planning"
  | "django_admin"
  | "performance_analytics"
  | "system_documentation"
  | "operational_health"
  | "system_audit_logs"
  | "centralized_logging";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  // Databases States
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [videoRequests, setVideoRequests] = useState<VideoLessonRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // New State Hooks
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceEvent[]>([]);
  const [videosToSell, setVideosToSell] = useState<VideoToSell[]>([]);
  const [resourceItems, setResourceItems] = useState<ResourceLibraryItem[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [examDeliveries, setExamDeliveries] = useState<any[]>([]);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  const [weeklyAvailability, setWeeklyAvailability] = useState<{ [day: string]: string[] }>(() => {
    const saved = localStorage.getItem("amh_tutor_availability");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      "Monday": ["08:30 - 09:30", "16:30 - 17:30"],
      "Tuesday": ["11:30 - 12:30"],
      "Wednesday": ["15:00 - 16:00"],
      "Thursday": ["13:30 - 14:30"],
      "Friday": ["18:00 - 19:00"],
      "Saturday": ["08:30 - 09:30", "10:00 - 11:00"],
      "Sunday": ["11:30 - 12:30", "13:30 - 14:30", "15:00 - 16:00"]
    };
  });

  const handleToggleWeeklySlot = (day: string, slot: string) => {
    setWeeklyAvailability(prev => {
      const currentSlots = prev[day] || [];
      let updated: string[];
      let becameAvailable = false;
      if (currentSlots.includes(slot)) {
        updated = currentSlots.filter(s => s !== slot);
        becameAvailable = true;
      } else {
        updated = [...currentSlots, slot];
      }
      const newVal = { ...prev, [day]: updated };
      localStorage.setItem("amh_tutor_availability", JSON.stringify(newVal));

      if (becameAvailable) {
        try {
          dbAPI.addNotification({
            student_id: "all",
            title: "📅 New Tutoring Slot Available!",
            message: `Tutor Bethuel has opened a new weekly slot on ${day}s at ${slot}. Book now to secure your spot!`,
            type: "slot_available",
            metadata: {
              tutor_name: "Bethuel Moukangwe",
              slot_date: day,
              slot_time: slot
            }
          });
        } catch (err) {
          console.error("Error adding notification:", err);
        }
      }
      return newVal;
    });
  };

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Interaction State Modals
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [selectedIntegritySub, setSelectedIntegritySub] = useState<HomeworkSubmission | null>(null);
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [selectedVideoReq, setSelectedVideoReq] = useState<VideoLessonRequest | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoNotes, setVideoNotes] = useState("");
  const [videoDuration, setVideoDuration] = useState(20);

  // Editing subject states
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Forms Hook React Hook Form
  const { register: regAssign, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm<{
    student_id: string;
    title: string;
    description: string;
    subject: string;
    due_date: string;
  }>();

  const { register: regAnnounce, handleSubmit: handleAnnounceSubmit, reset: resetAnnounce } = useForm<{
    title: string;
    content: string;
    category: "General" | "Academic" | "Exam Prep" | "Schedule";
    is_urgent: boolean;
  }>();

  const { register: regSubject, handleSubmit: handleSubjectSubmit, reset: resetSubject, setValue: setSubjectValue } = useForm<{
    name: string;
    description: string;
    grade_level: string;
    price_per_hour: number;
    topics: string;
    is_active: boolean;
  }>();

  // Resource Library Bulk Naming & Re-Tagging States
  const [resSearchQuery, setResSearchQuery] = useState("");
  const [resSyllabusFilter, setResSyllabusFilter] = useState("All");
  const [resGradeFilter, setResGradeFilter] = useState("All");
  const [resTopicFilter, setResTopicFilter] = useState("All");
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  
  // Bulk Renaming & Standardization Config
  const [namingPattern, setNamingPattern] = useState<string>("pattern_standard");
  const [customPatternFormat, setCustomPatternFormat] = useState<string>("{syllabus}_{grade}_{topic}_{title}");
  const [caseFormat, setCaseFormat] = useState<string>("title_case");
  const [customPrefix, setCustomPrefix] = useState<string>("");
  const [customSuffix, setCustomSuffix] = useState<string>("");

  // Bulk Tagging Overrides
  const [bulkSyllabus, setBulkSyllabus] = useState<string>("keep");
  const [bulkGrade, setBulkGrade] = useState<string>("keep");
  const [bulkTopic, setBulkTopic] = useState<string>("keep");

  // Single Item Modals & Toasts
  const [editingResItem, setEditingResItem] = useState<ResourceLibraryItem | null>(null);
  const [previewingResItem, setPreviewingResItem] = useState<ResourceLibraryItem | null>(null);
  const [metadataResItem, setMetadataResItem] = useState<ResourceLibraryItem | null>(null);
  const [activeResMeta, setActiveResMeta] = useState<PDFTechnicalMetadata | null>(null);
  const [isNewResModalOpen, setIsNewResModalOpen] = useState<boolean>(false);
  const [bulkAppliedToast, setBulkAppliedToast] = useState<string | null>(null);

  const { register: regResItem, handleSubmit: handleResItemSubmit, reset: resetResItem, setValue: setResItemValue } = useForm<{
    title: string;
    description: string;
    file_name: string;
    file_size: string;
    syllabus: "CAPS" | "IEB" | "Both";
    grade_level: "Grade 10" | "Grade 11" | "Grade 12" | "Matric Upgrade";
    topic: string;
  }>();

  // Naming pattern proposal generator
  const computeProposedFileName = (
    item: ResourceLibraryItem,
    pattern: string,
    customFormat: string,
    caseStyle: string,
    syllabusOverride: string,
    gradeOverride: string,
    topicOverride: string,
    prefix: string,
    suffix: string
  ): { fileName: string; syllabus: string; grade: string; topic: string } => {
    const finalSyllabus = syllabusOverride !== "keep" ? syllabusOverride : item.syllabus;
    const finalGrade = gradeOverride !== "keep" ? gradeOverride : item.grade_level;
    const finalTopic = topicOverride !== "keep" ? topicOverride : item.topic;

    const cleanTitle = item.title
      .replace(/[^\w\s-]/gi, "")
      .trim();

    let rawName = "";
    if (pattern === "pattern_standard") {
      rawName = `${finalSyllabus}_${finalGrade}_${finalTopic}_${cleanTitle}`;
    } else if (pattern === "pattern_amh") {
      rawName = `AMH_${finalGrade}_${finalTopic}_${cleanTitle}`;
    } else if (pattern === "pattern_solutions") {
      rawName = `${finalGrade}_${finalSyllabus}_${cleanTitle}_Solutions`;
    } else {
      rawName = customFormat
        .replace(/\{syllabus\}/gi, finalSyllabus)
        .replace(/\{grade\}/gi, finalGrade)
        .replace(/\{topic\}/gi, finalTopic)
        .replace(/\{title\}/gi, cleanTitle);
    }

    if (prefix.trim()) rawName = `${prefix.trim()}_${rawName}`;
    if (suffix.trim()) rawName = `${rawName}_${suffix.trim()}`;

    let formatted = rawName;
    if (caseStyle === "lowercase_underscore") {
      formatted = rawName.toLowerCase().replace(/[\s-]+/g, "_");
    } else if (caseStyle === "uppercase_underscore") {
      formatted = rawName.toUpperCase().replace(/[\s-]+/g, "_");
    } else if (caseStyle === "title_case") {
      formatted = rawName
        .replace(/[\s-]+/g, "_")
        .replace(/\b\w/g, char => char.toUpperCase());
    } else if (caseStyle === "title_case_spaced") {
      formatted = rawName.replace(/_+/g, " ").trim();
    } else {
      formatted = rawName.replace(/[\s-]+/g, "_");
    }

    formatted = formatted.replace(/_+/g, "_").replace(/^_|_$/g, "");

    if (!formatted.toLowerCase().endsWith(".pdf")) {
      formatted += ".pdf";
    }

    return {
      fileName: formatted,
      syllabus: finalSyllabus,
      grade: finalGrade,
      topic: finalTopic
    };
  };

  const filteredResourceItems = resourceItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(resSearchQuery.toLowerCase()) ||
      item.file_name.toLowerCase().includes(resSearchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(resSearchQuery.toLowerCase());
    
    const matchesSyllabus = resSyllabusFilter === "All" || item.syllabus === resSyllabusFilter;
    const matchesGrade = resGradeFilter === "All" || item.grade_level === resGradeFilter;
    const matchesTopic = resTopicFilter === "All" || item.topic === resTopicFilter;

    return matchesSearch && matchesSyllabus && matchesGrade && matchesTopic;
  });

  const toggleSelectAllRes = () => {
    if (selectedResIds.length === filteredResourceItems.length && filteredResourceItems.length > 0) {
      setSelectedResIds([]);
    } else {
      setSelectedResIds(filteredResourceItems.map(r => r.id));
    }
  };

  const toggleSelectResId = (id: string) => {
    setSelectedResIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApplyBulkStandardization = () => {
    if (selectedResIds.length === 0) return;

    const updatesList = selectedResIds.map(id => {
      const item = resourceItems.find(r => r.id === id);
      if (!item) return null;

      const proposed = computeProposedFileName(
        item,
        namingPattern,
        customPatternFormat,
        caseFormat,
        bulkSyllabus,
        bulkGrade,
        bulkTopic,
        customPrefix,
        customSuffix
      );

      const changes: Partial<ResourceLibraryItem> = {
        file_name: proposed.fileName,
        syllabus: proposed.syllabus as any,
        grade_level: proposed.grade as any,
        topic: proposed.topic
      };

      extractPDFMetadata({
        id: item.id,
        title: item.title,
        file_name: proposed.fileName,
        syllabus: proposed.syllabus,
        grade_level: proposed.grade,
        topic: proposed.topic
      });

      return { id, changes };
    }).filter(Boolean) as { id: string; changes: Partial<ResourceLibraryItem> }[];

    dbAPI.bulkUpdateResourceItems(updatesList);
    setResourceItems(dbAPI.getResourceLibrary());

    setBulkAppliedToast(`Successfully standardized file naming & re-tagged ${updatesList.length} PDF resources!`);
    setTimeout(() => setBulkAppliedToast(null), 5000);
    setSelectedResIds([]);
  };

  const startEditResourceItem = (item: ResourceLibraryItem) => {
    setEditingResItem(item);
    setResItemValue("title", item.title);
    setResItemValue("description", item.description);
    setResItemValue("file_name", item.file_name);
    setResItemValue("file_size", item.file_size || "2.4 MB");
    setResItemValue("syllabus", item.syllabus as any);
    setResItemValue("grade_level", item.grade_level as any);
    setResItemValue("topic", item.topic);
  };

  const onSaveSingleResItemSubmit = (data: any) => {
    if (!editingResItem) return;
    const updated = dbAPI.updateResourceItem(editingResItem.id, {
      title: data.title,
      description: data.description,
      file_name: data.file_name,
      file_size: data.file_size,
      syllabus: data.syllabus,
      grade_level: data.grade_level,
      topic: data.topic
    });

    extractPDFMetadata({
      id: updated.id,
      title: updated.title,
      file_name: updated.file_name,
      syllabus: updated.syllabus,
      grade_level: updated.grade_level,
      topic: updated.topic
    });

    setResourceItems(dbAPI.getResourceLibrary());
    setEditingResItem(null);
    resetResItem();
  };

  const onAddNewResItemSubmit = (data: any) => {
    const newItem = dbAPI.addResourceItem({
      title: data.title,
      description: data.description,
      file_type: "pdf",
      file_name: data.file_name || `${data.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`,
      file_size: data.file_size || "2.4 MB",
      file_url: "#",
      syllabus: data.syllabus,
      grade_level: data.grade_level,
      topic: data.topic
    });

    extractPDFMetadata({
      id: newItem.id,
      title: newItem.title,
      file_name: newItem.file_name,
      syllabus: newItem.syllabus,
      grade_level: newItem.grade_level,
      topic: newItem.topic
    });

    setResourceItems(dbAPI.getResourceLibrary());
    setIsNewResModalOpen(false);
    resetResItem();
  };

  const handleDeleteResourceItem = (id: string) => {
    if (confirm("Are you sure you want to remove this PDF resource from the library catalog?")) {
      dbAPI.deleteResourceItem(id);
      setResourceItems(dbAPI.getResourceLibrary());
      setSelectedResIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleOpenMetadataModal = (item: ResourceLibraryItem) => {
    const meta = extractPDFMetadata({
      id: item.id,
      title: item.title,
      file_name: item.file_name,
      syllabus: item.syllabus,
      grade_level: item.grade_level,
      topic: item.topic
    });
    setMetadataResItem(item);
    setActiveResMeta(meta);
  };

  // Load Database Records
  const loadRecords = () => {
    setProfiles(dbAPI.getAllProfiles());
    setBookings(dbAPI.getAllBookings());
    setPayments(dbAPI.getAllPayments());
    setAssignments(dbAPI.getAllHomeworkAssignments());
    setSubmissions(dbAPI.getAllHomeworkSubmissions());
    setVideoRequests(dbAPI.getAllVideoRequests());
    setAnnouncements(dbAPI.getAnnouncements());
    setContactMessages(dbAPI.getAllContactMessages());
    setSubjects(dbAPI.getSubjects());
    setLogs(dbAPI.getActivityLogs());
    
    // Fetch new collections
    setAttendanceEvents(dbAPI.getAttendanceEvents());
    setVideosToSell(dbAPI.getVideosToSell());
    setResourceItems(dbAPI.getResourceLibrary());
    setSubscribers(dbAPI.getSubscribers());

    // Fetch email outbox notification logs from backend
    fetch("/api/notifications/logs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEmailLogs(data);
        }
      })
      .catch(err => console.error("Error loading email notification logs:", err));

    // Fetch exam prediction deliveries
    fetch("/api/predictor/deliveries")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExamDeliveries(data);
        }
      })
      .catch(err => console.error("Error loading exam deliveries:", err));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (activeTab === "examDeliveries") {
      const interval = setInterval(() => {
        fetch("/api/predictor/deliveries")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setExamDeliveries(data);
            }
          })
          .catch(err => console.error("Error polling deliveries:", err));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Simulation of Real-Time Activity Log Updates
  useEffect(() => {
    const interval = setInterval(() => {
      const names = ["Naledi", "Thabo", "Kagiso", "Lindiwe", "Sipho", "Mpho", "Sarah", "Jaco", "Zama", "Bandile", "Bethuel"];
      const subjectsList = [
        "Core Mathematics CAPS",
        "IEB AP Mathematics",
        "Calculus Optimization",
        "Analytical Geometry",
        "Trigonometric General Solutions"
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomSubject = subjectsList[Math.floor(Math.random() * subjectsList.length)];

      const activities = [
        {
          action: "Reserved Tutor Slot",
          details: `${randomName} booked a CAPS 1-on-1 whiteboard session on '${randomSubject}'`,
          type: "booking" as const
        },
        {
          action: "EFT Gateway Payment Received",
          details: `Successful PayFast checkout of R1100 received from ${randomName}`,
          type: "payment" as const
        },
        {
          action: "Completed Homework Upload",
          details: `${randomName} handed in limits worksheet proofs`,
          type: "homework" as const
        },
        {
          action: "Filed Video Explanation Inquiry",
          details: `${randomName} requested on-demand tutor solution for '${randomSubject}'`,
          type: "video" as const
        },
        {
          action: "New Contact Message Received",
          details: `IEB Syllabus Upgrade enquiry submitted by ${randomName}`,
          type: "message" as const
        },
        {
          action: "Whiteboard Pipeline Heartbeat",
          details: `Active connection established with Amaris Google Meet servers`,
          type: "system" as const
        }
      ];

      const chosen = activities[Math.floor(Math.random() * activities.length)];
      dbAPI.addActivityLog({
        user_name: randomName,
        action: chosen.action,
        details: chosen.details,
        type: chosen.type
      });

      // Reload logs state without triggering full page reload
      setLogs(dbAPI.getActivityLogs());
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // CALCULATE KPI ANALYTICS
  const totalRevenue = payments
    .filter(p => p.status === "successful")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingBookingsCount = bookings.filter(b => b.status === "pending").length;
  const activeBookingsCount = bookings.filter(b => b.status === "confirmed").length;
  const completedBookingsCount = bookings.filter(b => b.status === "completed").length;

  const pendingVideoRequestsCount = videoRequests.filter(r => r.status === "pending" || r.status === "processing").length;
  const completedVideoRequestsCount = videoRequests.filter(r => r.status === "completed").length;

  const pendingSubmissionsCount = submissions.filter(s => s.status === "pending_review").length;

  // CHARTS DATA CALCULATIONS
  // 1. Group earnings by date
  const earningsMap: { [key: string]: number } = {};
  payments
    .filter(p => p.status === "successful")
    .forEach(p => {
      earningsMap[p.created_at] = (earningsMap[p.created_at] || 0) + p.amount;
    });

  const earningsChartData = Object.keys(earningsMap)
    .sort()
    .map(date => ({
      date: new Date(date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
      amount: earningsMap[date]
    }));

  // Fallback if data is sparse
  const finalEarningsData = earningsChartData.length > 0 ? earningsChartData : [
    { date: "01 Jul", amount: 1100 },
    { date: "03 Jul", amount: 150 },
    { date: "05 Jul", amount: 1250 },
    { date: "07 Jul", amount: 2400 }
  ];

  // 2. Bookings by Status Chart
  const bookingsByStatusData = [
    { name: "Confirmed", value: activeBookingsCount, color: "#10b981" },
    { name: "Pending", value: pendingBookingsCount, color: "#f59e0b" },
    { name: "Completed", value: completedBookingsCount, color: "#3b82f6" },
    { name: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, color: "#ef4444" }
  ].filter(item => item.value > 0);

  const fallbackBookingsData = bookingsByStatusData.length > 0 ? bookingsByStatusData : [
    { name: "Confirmed", value: 3, color: "#10b981" },
    { name: "Pending", value: 1, color: "#f59e0b" },
    { name: "Completed", value: 4, color: "#3b82f6" }
  ];

  // 3. User Grades Distribution Chart
  const gradesMap: { [key: string]: number } = {};
  profiles.forEach(p => {
    gradesMap[p.grade] = (gradesMap[p.grade] || 0) + 1;
  });
  const gradesChartData = Object.keys(gradesMap).map(grade => ({
    name: grade,
    value: gradesMap[grade]
  }));

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

  const [remindingId, setRemindingId] = useState<string | null>(null);

  // ACTIONS HANDLERS
  // Booking Action confirms / completes / cancels
  const handleUpdateBookingStatus = async (id: string, status: "confirmed" | "completed" | "cancelled", meetingLink?: string) => {
    try {
      const updateData: Partial<Booking> = { status };
      if (meetingLink) {
        updateData.meeting_link = meetingLink;
      }
      dbAPI.updateBooking(id, updateData);
      
      // Load current full booking and student details to send email
      const fullBooking = bookings.find(b => b.id === id);
      if (fullBooking) {
        const student = profiles.find(p => p.id === fullBooking.student_id);
        const subject = subjects.find(s => s.id === fullBooking.subject_id);
        if (student) {
          const emailPayload = {
            email: student.email,
            studentName: student.first_name,
            type: status === "confirmed" ? "booking_confirmation" : "schedule_update",
            bookingDetails: {
              booking_reference: fullBooking.booking_reference,
              lesson_date: fullBooking.lesson_date,
              lesson_time: fullBooking.lesson_time,
              subject_name: subject?.name || "Mathematics",
              duration_minutes: fullBooking.duration_minutes,
              platform: fullBooking.platform,
              meeting_link: meetingLink || fullBooking.meeting_link || "",
              topics_to_cover: fullBooking.topics_to_cover || "Syllabus Revision",
              status: status,
              feedback_remarks: ""
            }
          };

          fetch("/api/notifications/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailPayload)
          })
          .then(res => res.json())
          .then(data => {
            console.log("Email dispatch result:", data);
            // Refresh logs
            fetch("/api/notifications/logs")
              .then(res => res.json())
              .then(logs => {
                if (Array.isArray(logs)) setEmailLogs(logs);
              })
              .catch(err => console.error(err));
          })
          .catch(err => console.error("Error sending email notification:", err));
        }
      }

      alert(`Lesson status successfully updated to ${status}!`);
      loadRecords();
    } catch (err) {
      alert("Error: " + err);
    }
  };

  const handleSendEmailReminder = async (id: string) => {
    setRemindingId(id);
    try {
      const fullBooking = bookings.find(b => b.id === id);
      if (!fullBooking) return;
      const student = profiles.find(p => p.id === fullBooking.student_id);
      const subject = subjects.find(s => s.id === fullBooking.subject_id);
      if (!student) return;

      const emailPayload = {
        email: student.email,
        studentName: student.first_name,
        type: "session_reminder",
        bookingDetails: {
          booking_reference: fullBooking.booking_reference,
          lesson_date: fullBooking.lesson_date,
          lesson_time: fullBooking.lesson_time,
          subject_name: subject?.name || "Mathematics",
          duration_minutes: fullBooking.duration_minutes,
          platform: fullBooking.platform,
          meeting_link: fullBooking.meeting_link || "",
          topics_to_cover: fullBooking.topics_to_cover || "General Syllabus Revision",
          status: fullBooking.status,
          feedback_remarks: ""
        }
      };

      const res = await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload)
      });
      const data = await res.json();
      if (data.success || data.log) {
        alert(`Upcoming session email reminder successfully sent via SMTP to ${student.first_name} (${student.email})!`);
        // Refresh email logs
        const logsRes = await fetch("/api/notifications/logs");
        const logs = await logsRes.json();
        if (Array.isArray(logs)) setEmailLogs(logs);
      } else {
        alert("Failed to dispatch email reminder. Ensure SMTP settings are configured.");
      }
    } catch (err: any) {
      alert("Error dispatching email: " + err.message);
    } finally {
      setRemindingId(null);
    }
  };

  // Grade homework solutions
  const handleGradeSubmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      dbAPI.updateHomeworkSubmission(selectedSubmission.id, {
        status: "reviewed",
        tutor_feedback: gradingFeedback
      });
      alert("Homework successfully graded! Feedback dispatched to student's portal.");
      setSelectedSubmission(null);
      setGradingFeedback("");
      loadRecords();
    } catch (err) {
      alert("Error grading submission: " + err);
    }
  };

  // CSV Exporter and Offline Compliance Helpers
  const escapeCSVCell = (val: any) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const downloadBookingsCSV = () => {
    const headers = [
      "Booking ID", 
      "Reference", 
      "Student Name", 
      "Student Email", 
      "Subject Name", 
      "Lesson Date", 
      "Lesson Time Slot", 
      "Duration (min)", 
      "Platform", 
      "Meeting Link", 
      "Rating", 
      "Feedback Remarks", 
      "Status", 
      "Created At"
    ];
    const rows = bookings.map(b => {
      const student = profiles.find(p => p.id === b.student_id);
      const subject = subjects.find(s => s.id === b.subject_id);
      return [
        b.id,
        b.booking_reference,
        student ? `${student.first_name} ${student.surname}` : "Unknown Student",
        student ? student.email : "N/A",
        subject ? subject.name : "Unknown Subject",
        b.lesson_date,
        b.lesson_time,
        b.duration_minutes,
        b.platform,
        b.meeting_link || "",
        b.rating || "Unrated",
        b.feedback_remarks || "",
        b.status,
        b.created_at
      ].map(escapeCSVCell);
    });
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_tutoring_performance_bookings_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Tutoring Performance & Bookings Ledger CSV",
      type: "system"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadPaymentsCSV = () => {
    const headers = [
      "Payment ID", 
      "Booking ID", 
      "Transaction ID", 
      "Student Name", 
      "Student Email", 
      "Subject Name", 
      "Amount (ZAR)", 
      "Payment Method",
      "Payment Status", 
      "Created At"
    ];
    const rows = payments.map(p => {
      const student = profiles.find(prof => prof.id === p.student_id);
      const booking = bookings.find(b => b.id === p.booking_id);
      const subject = booking ? subjects.find(s => s.id === booking.subject_id) : undefined;
      return [
        p.id,
        p.booking_id,
        p.transaction_id,
        student ? `${student.first_name} ${student.surname}` : "Unknown Student",
        student ? student.email : "N/A",
        subject ? subject.name : "Mathematics Package",
        p.amount,
        p.payment_method,
        p.status,
        p.created_at
      ].map(escapeCSVCell);
    });
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_payments_and_revenue_performance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Revenue Payments Audit Trail CSV",
      type: "payment"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadProfilesCSV = () => {
    const headers = [
      "Profile ID", 
      "Role", 
      "First Name", 
      "Surname", 
      "Email", 
      "Phone", 
      "WhatsApp Number",
      "Grade Level", 
      "School Name",
      "Province", 
      "Parent Name", 
      "Parent Phone", 
      "Created At"
    ];
    const rows = profiles.map(p => [
      p.id,
      p.role,
      p.first_name,
      p.surname,
      p.email,
      p.phone || "",
      p.whatsapp_number || "",
      p.grade || "N/A",
      p.school || "N/A",
      p.province || "N/A",
      p.parent_name || "",
      p.parent_phone || "",
      p.created_at || ""
    ].map(escapeCSVCell));
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_academy_profiles_and_demographics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Academy Profiles Demographic Registry CSV",
      type: "auth"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadInfrastructureStatusCSV = () => {
    const headers = [
      "Service Key", 
      "Service Name", 
      "Operational Status", 
      "Live SLA Uptime (%)", 
      "Avg Response Latency (ms)", 
      "Active Sessions", 
      "Telemetry Heartbeat"
    ];
    const rows = [
      ["postgres", "PostgreSQL Database Service", "Nominal", "99.96", "14", "42 connections", "Healthy"],
      ["redis", "Redis Session Storage & Cache", "Nominal", "99.99", "0.8", "4820 active keys", "Healthy"],
      ["s3", "AWS S3 Cloud Object Bucket", "Nominal", "99.95", "48", "24180 static files", "Healthy"],
      ["smtp", "SMTP Nodemailer Mailer Service", "Nominal", "99.90", "120", "Active queue", "Healthy"]
    ].map(row => row.map(escapeCSVCell));
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_infrastructure_system_status_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Cloud Infrastructure System Status SLA CSV",
      type: "system"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadActivityLogsCSV = () => {
    const headers = [
      "Log ID", 
      "Timestamp", 
      "Context User", 
      "Action Performed", 
      "Details/Metadata", 
      "Type"
    ];
    const rows = logs.map(l => [
      l.id,
      l.created_at,
      l.user_name,
      l.action,
      l.details,
      l.type
    ].map(escapeCSVCell));
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_security_and_activity_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Security & Telemetry Activity Pipelines CSV",
      type: "system"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadRevenueGrowthCSV = () => {
    const headers = ["Date", "Earnings (ZAR)"];
    const rows = finalEarningsData.map(d => [
      d.date,
      d.amount
    ].map(escapeCSVCell));
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_analytics_revenue_growth_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Revenue Growth Analytics CSV",
      type: "system"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadLessonAllocationsCSV = () => {
    const headers = ["Lesson Status", "Lessons Count"];
    const rows = fallbackBookingsData.map(d => [
      d.name,
      d.value
    ].map(escapeCSVCell));
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_analytics_lesson_allocations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Tutoring Lesson Allocations Analytics CSV",
      type: "system"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadStudentGradesCSV = () => {
    const data = gradesChartData.length > 0 ? gradesChartData : [
      { name: "Grade 10", value: 4 },
      { name: "Grade 11", value: 7 },
      { name: "Grade 12 CAPS", value: 18 },
      { name: "Matric Upgrade", value: 12 },
      { name: "IEB Syllabus", value: 9 }
    ];
    const headers = ["Grade Level", "Students Enrolled Count"];
    const rows = data.map(d => [
      d.name,
      d.value
    ].map(escapeCSVCell));
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_analytics_grade_distribution_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded Student Grades Distribution Analytics CSV",
      type: "system"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  const downloadPerformanceTestReportsCSV = () => {
    let savedReports: any[] = [];
    const saved = localStorage.getItem("amh_k6_reports");
    if (saved) {
      try {
        savedReports = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    if (savedReports.length === 0) {
      savedReports = [
        {
          id: "rep-1",
          timestamp: "2026-07-20 10:15:22",
          scenarioName: "CAPS/IEB Formula Sandbox Load Test",
          vus: 100,
          duration: 30,
          peakRps: 452,
          avgLatency: 92,
          errorRate: 0.05,
          slaStatus: "PASSED"
        },
        {
          id: "rep-2",
          timestamp: "2026-07-19 16:40:05",
          scenarioName: "AI Matric Trial Simulation Spike",
          vus: 1200,
          duration: 45,
          peakRps: 980,
          avgLatency: 1980,
          errorRate: 1.45,
          slaStatus: "WARNING"
        },
        {
          id: "rep-3",
          timestamp: "2026-07-18 11:22:18",
          scenarioName: "Live Whiteboard Vector Surge",
          vus: 2500,
          duration: 30,
          peakRps: 31200,
          avgLatency: 84,
          errorRate: 0.12,
          slaStatus: "PASSED"
        }
      ];
    }

    const headers = [
      "Report ID",
      "Timestamp",
      "Scenario Name",
      "Virtual Users (VUs)",
      "Duration (s)",
      "Peak RPS",
      "Average Latency (ms)",
      "Error Rate (%)",
      "SLA Status"
    ];

    const rows = savedReports.map(r => [
      r.id,
      r.timestamp,
      r.scenarioName,
      r.vus,
      r.duration,
      r.peakRps,
      r.avgLatency,
      r.errorRate,
      r.slaStatus
    ].map(escapeCSVCell));

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amh_analytics_k6_performance_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dbAPI.addActivityLog({
      user_name: user?.first_name || "Admin",
      action: "Exported CSV",
      details: "Downloaded k6 Performance Load Test Reports CSV",
      type: "system"
    });
    setLogs(dbAPI.getActivityLogs());
  };

  // Assign Homework Assignment
  const onAssignHomework = (data: any) => {
    try {
      dbAPI.addHomeworkAssignment({
        student_id: data.student_id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        due_date: data.due_date
      });
      alert("Homework task successfully dispatched to student!");
      resetAssign();
      loadRecords();
    } catch (err) {
      alert("Error: " + err);
    }
  };

  // Manage Video Request Edit
  const handleUpdateVideoRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideoReq) return;
    try {
      dbAPI.updateVideoRequest(selectedVideoReq.id, {
        status: "completed",
        video_url: videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration_minutes: Number(videoDuration),
        notes: videoNotes
      });
      alert("Whiteboard video response successfully submitted and delivered!");
      setSelectedVideoReq(null);
      setVideoUrl("");
      setVideoNotes("");
      setVideoDuration(20);
      loadRecords();
    } catch (err) {
      alert("Error submitting video response: " + err);
    }
  };

  // Toggle user admin rights
  const handleToggleUserAdmin = (id: string, currentRole: Profile["role"]) => {
    if (id === "usr-bethuel") {
      alert("Cannot revoke permissions for the primary root administrator account.");
      return;
    }
    const newRole = currentRole === "student" ? "tutor" : currentRole === "tutor" ? "admin" : "student";
    if (confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      try {
        dbAPI.updateProfileRole(id, newRole);
        dbAPI.addActivityLog({
          user_name: "Root Admin",
          action: "Changed User Role",
          details: `User ID ${id} changed to role ${newRole}`,
          type: "auth"
        });
        alert(`User role changed to ${newRole.toUpperCase()}.`);
        loadRecords();
      } catch (err) {
        alert("Error: " + err);
      }
    }
  };

  // Publish Announcement
  const onPublishAnnouncementSubmit = (data: any) => {
    try {
      dbAPI.publishAnnouncement({
        title: data.title,
        content: data.content,
        category: data.category,
        is_urgent: data.is_urgent
      });
      dbAPI.addActivityLog({
        user_name: "Admin",
        action: "Published Broadcast",
        details: `Announcement '${data.title}' dispatched to the main notice boards`,
        type: "announcement"
      });
      alert("Academy notice successfully broadcasted!");
      resetAnnounce();
      loadRecords();
    } catch (err) {
      alert("Error: " + err);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    if (confirm("Are you sure you want to withdraw this notice broadcast?")) {
      dbAPI.deleteAnnouncement(id);
      loadRecords();
    }
  };

  // Moderate Testimonial Approval or toggle Message Status
  const handleToggleMessageStatus = (id: string, currentStatus: "new" | "read" | "replied") => {
    try {
      const nextStatus = currentStatus === "new" ? "read" : currentStatus === "read" ? "replied" : "new";
      dbAPI.updateContactMessage(id, nextStatus);
      loadRecords();
    } catch (err) {
      alert("Error updating message status: " + err);
    }
  };

  // Delete Contact Message
  const handleDeleteContactMessage = (id: string) => {
    if (confirm("Permanently archive this message record?")) {
      dbAPI.deleteContactMessage(id);
      loadRecords();
    }
  };

  // Subject Manage Create / Update
  const onSubjectSubmit = (data: any) => {
    try {
      const topicArray = data.topics ? data.topics.split(",").map((t: string) => t.trim()) : [];
      if (editingSubject) {
        dbAPI.updateSubject(editingSubject.id, {
          name: data.name,
          description: data.description,
          grade_level: data.grade_level,
          price_per_hour: Number(data.price_per_hour),
          topics: topicArray,
          is_active: data.is_active === true || data.is_active === "true"
        });
        alert("Curriculum subject updated successfully!");
        setEditingSubject(null);
      } else {
        dbAPI.addSubject({
          name: data.name,
          description: data.description,
          grade_level: data.grade_level,
          price_per_hour: Number(data.price_per_hour),
          topics: topicArray,
          is_active: true
        });
        alert("New subject successfully cataloged!");
      }
      resetSubject();
      loadRecords();
    } catch (err) {
      alert("Error saving subject: " + err);
    }
  };

  const startEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectValue("name", sub.name);
    setSubjectValue("description", sub.description);
    setSubjectValue("grade_level", sub.grade_level);
    setSubjectValue("price_per_hour", sub.price_per_hour);
    setSubjectValue("topics", sub.topics.join(", "));
    setSubjectValue("is_active", sub.is_active);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm("Are you sure you want to delete this curriculum subject from the hub database?")) {
      dbAPI.deleteSubject(id);
      loadRecords();
    }
  };

  const handleRetryDelivery = (deliveryId: string) => {
    fetch("/api/predictor/deliveries/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryId })
    })
    .then(res => res.json())
    .then(data => {
      alert("Celery dispatch retry event successfully scheduled!");
      loadRecords();
    })
    .catch(err => {
      alert("Error scheduling retry: " + err);
    });
  };

  // Filter Helper
  const filteredProfiles = profiles.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(term) ||
      p.surname.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.school.toLowerCase().includes(term) ||
      p.grade.toLowerCase().includes(term)
    );
  });

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-royal-950 text-white rounded-2xl p-6 mb-8 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-royal-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-2 text-left z-10">
          <div className="flex items-center gap-3">
            <AmarisLogo variant="icon" size="sm" />
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-gold-400 bg-gold-400/15 px-2.5 py-0.5 rounded border border-gold-500/20">
                <Shield className="w-3 h-3" /> Root Administrator
              </span>
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2">
            Amaris Control Center
          </h1>
          <p className="text-xs text-navy-200 max-w-xl leading-relaxed font-mono">
            Full-stack console. Welcome, {user?.first_name || "Bethuel"}. Manage curriculum subjects, live bookings, homework grading, announcements, and track real-time portal operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <button
            onClick={() => setActiveTab("google_sheets")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets Sync</span>
          </button>

          <button
            onClick={() => setActiveTab("system_documentation")}
            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <FileText className="w-4 h-4" />
            <span>System Manual (PDF)</span>
          </button>
          
          <button
            onClick={loadRecords}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Database
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR TABS RAIL */}
        <aside className="lg:col-span-3 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-md space-y-1.5">
          <span className="block text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase px-3 tracking-wider mb-2">
            Management Modules
          </span>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Control & Live Analytics
          </button>

          <button
            onClick={() => setActiveTab("google_sheets")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "google_sheets"
                ? "bg-emerald-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Google Sheets Database</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Registered Users</span>
            </div>
            <span className="bg-navy-100 dark:bg-navy-850 text-navy-700 dark:text-navy-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
              {profiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4" />
              <span>Tutoring Bookings</span>
            </div>
            {pendingBookingsCount > 0 && (
              <span className="bg-amber-500 text-navy-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("homework")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "homework"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Homework & Submissions</span>
            </div>
            {pendingSubmissionsCount > 0 && (
              <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingSubmissionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "videos"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4" />
              <span>Video Lessons Desk</span>
            </div>
            {pendingVideoRequestsCount > 0 && (
              <span className="bg-purple-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingVideoRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "announcements"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Academy Broadcasts
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "messages"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4" />
              <span>Contact Messages</span>
            </div>
            {contactMessages.filter(m => m.status === "new").length > 0 && (
              <span className="bg-emerald-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {contactMessages.filter(m => m.status === "new").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("subjects")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "subjects"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            Curriculum Subjects
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "resources"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-gold-400" />
              <span>PDF Resources & Bulk Utility</span>
            </div>
            <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              {resourceItems.length} PDFs
            </span>
          </button>

          <button
            onClick={() => setActiveTab("availability")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "availability"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gold-500" />
              <span>Tutor Availability Grid</span>
            </div>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Live Sync
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tutor_matching")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tutor_matching"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Automated Tutor Matching</span>
            </div>
            <span className="bg-amber-500/15 text-amber-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-amber-500/30">
              AI Algo
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tutor_reports")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tutor_reports"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-gold-500" />
              <span>Tutor Reports Hub</span>
            </div>
            <span className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              AI Synth
            </span>
          </button>

          <button
            onClick={() => setActiveTab("monitoring")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "monitoring"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Executive Operations</span>
            </div>
            <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              AIOps
            </span>
          </button>

          <button
            onClick={() => setActiveTab("operational_health")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "operational_health"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Operational Health</span>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Live Metrics
            </span>
          </button>

          <button
            onClick={() => setActiveTab("system_audit_logs")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "system_audit_logs"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>System Audit Logs</span>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Audit Trail
            </span>
          </button>

          <button
            onClick={() => setActiveTab("centralized_logging")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "centralized_logging"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-royal-500 animate-pulse" />
              <span>Centralized Logging</span>
            </div>
            <span className="bg-royal-500/15 text-royal-600 dark:text-royal-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Error Telemetry
            </span>
          </button>

          <button
            onClick={() => setActiveTab("executive_ops")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "executive_ops"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-gold-500" />
              <span>Executive BI Dashboard</span>
            </div>
            <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Real-Time
            </span>
          </button>

          <button
            onClick={() => setActiveTab("load_testing")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "load_testing"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Gauge className="w-4 h-4 text-royal-500" />
              <span>Load Testing Sandbox</span>
            </div>
            <span className="bg-royal-500/15 text-royal-600 dark:text-royal-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Scale
            </span>
          </button>

          <button
            onClick={() => setActiveTab("performance_analytics")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "performance_analytics"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-royal-500 animate-pulse" />
              <span>k6 Performance Analytics</span>
            </div>
            <span className="bg-royal-500/15 text-royal-600 dark:text-royal-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              SLA
            </span>
          </button>

          <button
            onClick={() => setActiveTab("performance_advisor")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "performance_advisor"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Performance Advisor</span>
            </div>
            <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              AI Fix
            </span>
          </button>

          <button
            onClick={() => setActiveTab("incident_response")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "incident_response"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Incident Response</span>
            </div>
            <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              SRE
            </span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gold-500 animate-pulse" />
              <span>Security Dashboard</span>
            </div>
            <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              SecOps
            </span>
          </button>

          <button
            onClick={() => setActiveTab("mfa_setup")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "mfa_setup"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>MFA Authenticator Setup</span>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              2FA / TOTP
            </span>
          </button>

          <button
            onClick={() => setActiveTab("capacity_planning")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "capacity_planning"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Capacity Planning</span>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Growth
            </span>
          </button>

          <button
            onClick={() => setActiveTab("aiops_assistant")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "aiops_assistant"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>AIOps Assistant</span>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Gemini
            </span>
          </button>

          <button
            onClick={() => setActiveTab("infra_topology")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "infra_topology"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-gold-500" />
              <span>Infra Topology</span>
            </div>
            <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Map
            </span>
          </button>

          <button
            onClick={() => setActiveTab("api_performance")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "api_performance"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-royal-500" />
              <span>API Performance</span>
            </div>
            <span className="bg-royal-500/15 text-royal-600 dark:text-royal-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Rank
            </span>
          </button>

          <button
            onClick={() => setActiveTab("cost_analytics")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "cost_analytics"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>AWS Cost Analytics</span>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Cost
            </span>
          </button>

          <button
            onClick={() => setActiveTab("system_documentation")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "system_documentation"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gold-400" />
              <span>System Manual (PDF)</span>
            </div>
            <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              PDF
            </span>
          </button>

          <button
            id="system-logs-tab-btn"
            onClick={() => setActiveTab("system_logs")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "system_logs"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-gold-400 animate-pulse" />
              <span>System Logs Terminal</span>
            </div>
            <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("emailLogs")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "emailLogs"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-500" />
              <span>Automated Email Outbox</span>
            </div>
            <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded-full">
              {emailLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("examDeliveries")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "examDeliveries"
                ? "bg-royal-600 text-white shadow-md font-extrabold"
                : "text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Exam Dispatch Monitor</span>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-full">
              {examDeliveries.length}
            </span>
          </button>

          <button
            id="django-admin-tab-btn"
            onClick={() => setActiveTab("django_admin")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "django_admin"
                ? "bg-[#124c3e] text-white shadow-md font-extrabold border border-emerald-700"
                : "text-navy-600 dark:text-navy-300 hover:bg-emerald-800/10 dark:hover:bg-emerald-800/5 hover:text-[#124c3e]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Django Admin Console</span>
            </div>
            <span className="bg-emerald-500/20 text-[#124c3e] dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-emerald-500/20">
              Enterprise
            </span>
          </button>
        </aside>

        {/* PRIMARY CONTROL CONTAINER */}
        <main className="lg:col-span-9 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-6 sm:p-8 rounded-2xl shadow-md min-h-[600px]">
          
          {/* ======================= CONTROL & LIVE ANALYTICS ======================= */}
          {activeTab === "analytics" && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white">Control Room Overview</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400">Real-time health, operations tracking, and transaction receipts of Amaris Learning Hub.</p>
              </div>

              {/* LIVE GOOGLE SHEETS SYNC HUB */}
              <AdminGoogleSheetsWidget 
                bookings={bookings} 
                payments={payments} 
                students={profiles} 
              />

              {/* KPI Widgets Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Total Revenue</span>
                  <div className="text-2xl font-black text-navy-900 dark:text-white flex items-baseline gap-1">
                    <span className="text-sm font-bold text-navy-500 dark:text-navy-400">R</span>
                    {totalRevenue}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500 block">EFT Receipts</span>
                </div>

                <div className="bg-royal-600/10 dark:bg-royal-600/5 border border-royal-600/20 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[9px] font-mono font-black text-royal-600 dark:text-royal-400 uppercase tracking-wider block">Lessons Completed</span>
                  <div className="text-2xl font-black text-navy-900 dark:text-white">
                    {completedBookingsCount} <span className="text-xs font-mono text-navy-400">/ {bookings.length} total</span>
                  </div>
                  <span className="text-[10px] font-mono text-royal-600 block">{activeBookingsCount} active sessions</span>
                </div>

                <div className="bg-purple-600/10 dark:bg-purple-600/5 border border-purple-600/20 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[9px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Video Solves</span>
                  <div className="text-2xl font-black text-navy-900 dark:text-white">
                    {completedVideoRequestsCount} <span className="text-xs font-mono text-navy-400">/ {videoRequests.length}</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-600 block">{pendingVideoRequestsCount} pending video files</span>
                </div>

                <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[9px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-wider block">Total Students</span>
                  <div className="text-2xl font-black text-navy-900 dark:text-white">
                    {profiles.filter(p => p.role === "student").length}
                  </div>
                  <span className="text-[10px] font-mono text-amber-600 block">Enrolled Matric Upgrades</span>
                </div>
              </div>

              {/* Graphical Insights using Recharts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Growth chart */}
                <div className="border border-navy-100 dark:border-navy-800 rounded-2xl p-4 bg-white dark:bg-navy-900/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">Earnings Over Time (ZAR)</h3>
                    </div>
                    <button
                      onClick={downloadRevenueGrowthCSV}
                      className="p-1 px-1.5 hover:bg-navy-50 dark:hover:bg-navy-800 rounded-lg text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer border border-emerald-500/10"
                      title="Download Revenue Growth CSV"
                    >
                      <Download className="w-3 h-3" />
                      CSV
                    </button>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={finalEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-navy-400" />
                        <YAxis tick={{ fontSize: 10 }} className="text-navy-400" />
                        <Tooltip contentStyle={{ fontSize: 11, background: "#0f172a", border: "none", color: "#fff", borderRadius: 8 }} />
                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Earnings (R)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bookings status distribution */}
                <div className="border border-navy-100 dark:border-navy-800 rounded-2xl p-4 bg-white dark:bg-navy-900/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-royal-500" />
                      <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">Tutoring Lesson Allocations</h3>
                    </div>
                    <button
                      onClick={downloadLessonAllocationsCSV}
                      className="p-1 px-1.5 hover:bg-navy-50 dark:hover:bg-navy-800 rounded-lg text-royal-600 hover:text-royal-700 dark:text-royal-400 transition-colors flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer border border-royal-500/10"
                      title="Download Allocation Stats CSV"
                    >
                      <Download className="w-3 h-3" />
                      CSV
                    </button>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fallbackBookingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11, background: "#0f172a", border: "none", color: "#fff", borderRadius: 8 }} />
                        <Bar dataKey="value" name="Lessons Booked">
                          {fallbackBookingsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* CSV Exporter / Offline Analysis Deck */}
              <div className="bg-slate-50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-800/80 rounded-2xl p-6 text-left space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3 gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-500 animate-pulse" />
                      Offline Analytics & Status CSV Export Center
                    </h3>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed">
                      Export academy performance metrics, financial ledger audits, user cohorts, and cloud infrastructure telemetry for localized compliance analysis.
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-mono font-black px-2 py-0.5 rounded border border-emerald-500/15 whitespace-nowrap self-start sm:self-center">
                    COMPLIANCE MODULE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <button
                    onClick={downloadBookingsCSV}
                    className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-royal-400 text-left group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-royal-600 dark:text-royal-400 uppercase tracking-wider block">Tutoring Lessons</span>
                      <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Performance & Bookings</p>
                    </div>
                    <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-royal-500 transition-colors">
                      <Download className="w-3 h-3 text-royal-500" /> {bookings.length} lessons registered
                    </span>
                  </button>

                  <button
                    onClick={downloadPaymentsCSV}
                    className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-emerald-400 text-left group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Financial Audit</span>
                      <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Revenue & PayFast Receipts</p>
                    </div>
                    <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                      <Download className="w-3 h-3 text-emerald-500" /> R{totalRevenue} cumulative
                    </span>
                  </button>

                  <button
                    onClick={downloadProfilesCSV}
                    className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-amber-400 text-left group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-wider block">User Directories</span>
                      <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Demographics & Syllabus</p>
                    </div>
                    <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                      <Download className="w-3 h-3 text-amber-500" /> {profiles.length} accounts mapped
                    </span>
                  </button>

                  <button
                    onClick={downloadInfrastructureStatusCSV}
                    className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-purple-400 text-left group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">System Status</span>
                      <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Infrastructure SLA Health</p>
                    </div>
                    <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-purple-500 transition-colors">
                      <Download className="w-3 h-3 text-purple-500" /> Uptime 99.96% active
                    </span>
                  </button>

                  <button
                    onClick={downloadActivityLogsCSV}
                    className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-slate-400 text-left group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Telemetry Pipelines</span>
                      <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Security & SRE Audit Logs</p>
                    </div>
                    <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-slate-500 transition-colors">
                      <Download className="w-3 h-3 text-slate-500" /> {logs.length} telemetry entries
                    </span>
                  </button>
                </div>

                <div className="space-y-2 pt-4 border-t border-navy-100 dark:border-navy-800">
                  <h4 className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block mb-2">Visual & Performance Analytics Extractions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={downloadRevenueGrowthCSV}
                      className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-emerald-400 text-left group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Revenue Growth</span>
                        <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Daily Earnings Curve</p>
                      </div>
                      <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                        <Download className="w-3 h-3 text-emerald-500" /> Export chart vectors
                      </span>
                    </button>

                    <button
                      onClick={downloadLessonAllocationsCSV}
                      className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-royal-400 text-left group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black text-royal-600 dark:text-royal-400 uppercase tracking-wider block">Lesson Allocations</span>
                        <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Status Distributions</p>
                      </div>
                      <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-royal-500 transition-colors">
                        <Download className="w-3 h-3 text-royal-500" /> Export status matrices
                      </span>
                    </button>

                    <button
                      onClick={downloadStudentGradesCSV}
                      className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-amber-400 text-left group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-wider block">Grade Cohorts</span>
                        <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Grade Level Spread</p>
                      </div>
                      <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                        <Download className="w-3 h-3 text-amber-500" /> Export cohort metrics
                      </span>
                    </button>

                    <button
                      onClick={downloadPerformanceTestReportsCSV}
                      className="flex flex-col justify-between p-3.5 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-xl transition-all shadow-sm cursor-pointer hover:border-purple-400 text-left group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">k6 SRE Benchmarks</span>
                        <p className="text-[11px] font-bold text-navy-800 dark:text-navy-200">Load Testing Reports</p>
                      </div>
                      <span className="text-[9px] font-mono text-navy-500 mt-3 flex items-center gap-1 group-hover:text-purple-500 transition-colors">
                        <Download className="w-3 h-3 text-purple-500" /> Export SLA reports
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Infrastructure Status & Activity Pipeline Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Dynamic Real-Time activity logs ticker */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-850 pb-2">
                    <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      Real-time Activity Pipeline Ticker
                    </h3>
                    <span className="text-[10px] text-navy-400 font-mono">
                      Ingress polling healthy (every 12s updates)
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-2xl space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                    {logs.length === 0 ? (
                      <div className="text-slate-600 italic text-center py-10">
                        No live telemetry logs registered. Trigger simulator...
                      </div>
                    ) : (
                      logs.map((log) => {
                        let tagColor = "text-slate-400 bg-slate-800/50";
                        if (log.type === "auth") tagColor = "text-blue-400 bg-blue-950/40 border border-blue-900/30";
                        else if (log.type === "booking") tagColor = "text-purple-400 bg-purple-950/40 border border-purple-900/30";
                        else if (log.type === "payment") tagColor = "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30";
                        else if (log.type === "homework") tagColor = "text-amber-400 bg-amber-950/40 border border-amber-900/30";
                        else if (log.type === "video") tagColor = "text-pink-400 bg-pink-950/40 border border-pink-900/30";
                        else if (log.type === "system") tagColor = "text-slate-300 bg-slate-900/50 border border-slate-800";

                        return (
                          <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 bg-slate-900/40 border border-slate-900/80 rounded-xl leading-relaxed text-slate-300">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                              <span className="text-[9px] font-semibold text-slate-600 font-mono">
                                {new Date(log.created_at).toLocaleTimeString("en-ZA", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded-md ${tagColor}`}>
                                {log.action}
                              </span>
                              <span className="text-[11px] font-bold text-slate-100">{log.details}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono self-end sm:self-center">
                              By: {log.user_name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Infrastructure System Status Card */}
                <div className="lg:col-span-5">
                  <SystemStatusCard />
                </div>

              </div>
            </div>
          )}

          {/* ======================= GOOGLE SHEETS LIVE DATABASE SYNC ======================= */}
          {activeTab === "google_sheets" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  Google Sheets Live Enterprise Database & Analytics
                </h2>
                <p className="text-xs text-navy-500 dark:text-navy-400">
                  Full 4-tab synchronization: Student Bookings, PayFast/EFT Transactions, Student Registry, and Executive KPI Analytics.
                </p>
              </div>

              <AdminGoogleSheetsWidget 
                bookings={bookings} 
                payments={payments} 
                students={profiles} 
              />
            </div>
          )}

          {/* ======================= SYSTEM DOCUMENTATION MANUAL ======================= */}
          {activeTab === "system_documentation" && (
            <div className="animate-fadeIn">
              <SystemDocumentation user={user} />
            </div>
          )}

          {/* ======================= USER ACCOUNTS PORTAL ======================= */}
          {activeTab === "users" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white">Registered Academy Profiles</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400">View registered students and control user permissions or access grades.</p>
              </div>

              {/* Search rail */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, high school grade or province..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-50/50 dark:bg-navy-950/30 border border-navy-150 dark:border-navy-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-royal-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-navy-100 dark:border-navy-850 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-navy-50 dark:bg-navy-950/60 font-mono uppercase text-[9px] tracking-wider text-navy-500 dark:text-navy-400 border-b border-navy-100 dark:border-navy-850">
                    <tr>
                      <th className="p-4 font-black">Full Name</th>
                      <th className="p-4 font-black">Email & Contact</th>
                      <th className="p-4 font-black">Grade / Syllabus</th>
                      <th className="p-4 font-black">School & Province</th>
                      <th className="p-4 font-black">Parent Details</th>
                      <th className="p-4 font-black text-center">Admin Rights</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100 dark:divide-navy-850">
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-950/10 transition-colors">
                        <td className="p-4 font-bold text-navy-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 rounded-full flex items-center justify-center font-bold text-[10px]">
                              {p.first_name.charAt(0)}{p.surname.charAt(0)}
                            </div>
                            <div>
                              <p>{p.first_name} {p.surname}</p>
                              <span className="text-[9px] text-navy-400 font-mono">{p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-mono">{p.email}</p>
                          <p className="text-navy-500">{p.phone}</p>
                        </td>
                        <td className="p-4 font-semibold text-royal-600 dark:text-gold-400">
                          {p.grade}
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{p.school}</p>
                          <p className="text-navy-400 text-[10px]">{p.province}</p>
                        </td>
                        <td className="p-4 text-navy-500">
                          {p.parent_name ? (
                            <>
                              <p className="font-bold text-navy-700 dark:text-navy-300">{p.parent_name}</p>
                              <p className="text-[10px] font-mono">{p.parent_phone}</p>
                            </>
                          ) : (
                            <span className="italic text-navy-300">Not recorded</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleUserAdmin(p.id, p.role)}
                            className={`px-3 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase transition-all ${
                              p.role === "admin"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                : p.role === "tutor"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-royal-600 hover:text-white"
                            }`}
                          >
                            {p.role === "admin" ? "REVOKE TO STUDENT" : p.role === "tutor" ? "MAKE ADMIN" : "MAKE TUTOR"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProfiles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-navy-400 italic">
                          No profiles matching search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================= TUTORING BOOKINGS ======================= */}
          {activeTab === "bookings" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white"> Tutoring Lesson Bookings</h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400">View student bookings, update statuses, or assign whiteboard links.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setIsZoomModalOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-blue-200" />
                    <span>Create Zoom Meeting</span>
                  </button>

                  {/* Status selector filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-navy-50 dark:bg-navy-850 px-3 py-1.5 border border-navy-150 dark:border-navy-800 text-xs text-navy-800 dark:text-white rounded-lg focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {filteredBookings.map((bk) => {
                  const student = profiles.find(p => p.id === bk.student_id);
                  const subject = subjects.find(s => s.id === bk.subject_id);

                  return (
                    <div
                      key={bk.id}
                      className="border border-navy-150 dark:border-navy-850 rounded-xl p-5 space-y-4 hover:border-royal-500 transition-colors bg-navy-50/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-850 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-black bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 px-2 py-0.5 rounded">
                              Ref: {bk.booking_reference}
                            </span>
                            <span className="text-[10px] text-navy-400">Booked: {bk.created_at}</span>
                          </div>
                          <h4 className="text-xs font-mono font-black text-navy-800 dark:text-white">
                            Student: <span className="text-royal-600 dark:text-gold-400">{student?.first_name} {student?.surname}</span> | Grade: {student?.grade}
                          </h4>
                        </div>

                        <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded ${
                          bk.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                          bk.status === "confirmed" ? "bg-royal-500/10 text-royal-600" :
                          bk.status === "pending" ? "bg-amber-500/10 text-amber-600 animate-pulse" : "bg-red-500/10 text-red-500"
                        }`}>
                          {bk.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed text-navy-600 dark:text-navy-300">
                        <div className="space-y-1">
                          <p><b>Subject Class:</b> {subject?.name || "Mathematics Grade 12"}</p>
                          <p><b>Date & Hour:</b> {bk.lesson_date} at <b>{bk.lesson_time} SAST</b> ({bk.duration_minutes} Mins)</p>
                          <p><b>Whiteboard Platform:</b> {bk.platform}</p>
                          {bk.notes && <p className="italic text-[11px] text-navy-400 mt-1">"Student notes: {bk.notes}"</p>}
                        </div>

                        <div className="space-y-3 sm:text-right flex flex-col sm:items-end justify-between">
                          <div className="space-y-1">
                            {bk.meeting_link ? (
                              <p className="font-mono text-[10px] break-all select-all flex items-center gap-1">
                                <ExternalLink className="w-3 h-3 text-royal-500 inline" />
                                {bk.meeting_link}
                              </p>
                            ) : (
                              <span className="italic text-[10px] text-red-400 block">Virtual Whiteboard Link Not Assigned</span>
                            )}
                          </div>

                          {/* Interactive control updates */}
                          <div className="flex gap-2 flex-wrap">
                            {bk.status === "pending" && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, "confirmed", `https://meet.google.com/amh-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`)}
                                className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-bold text-[10px] rounded-md transition-colors"
                              >
                                Accept & Generate Link
                              </button>
                            )}

                            {bk.status === "confirmed" && (
                              <button
                                onClick={() => handleSendEmailReminder(bk.id)}
                                disabled={remindingId === bk.id}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-navy-100 text-navy-950 font-black text-[10px] rounded-md transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{remindingId === bk.id ? "Reminding..." : "Send SMTP Reminder"}</span>
                              </button>
                            )}

                            {bk.status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, "completed")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-md transition-colors"
                              >
                                Mark as Completed
                              </button>
                            )}

                            {bk.status !== "cancelled" && bk.status !== "completed" && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, "cancelled")}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-[10px] rounded-md transition-colors"
                              >
                                Cancel Slot
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {bk.status === "completed" && bk.rating && (
                        <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> Checked Review Feedbacks
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-500">
                              {Array.from({ length: bk.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="italic text-navy-500">"{bk.feedback_remarks}"</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredBookings.length === 0 && (
                  <p className="text-xs text-navy-400 italic py-10 text-center">No bookings listed under filter '{statusFilter}'</p>
                )}
              </div>
            </div>
          )}

          {/* ======================= HOMEWORK CENTER ======================= */}
          {activeTab === "homework" && (
            <div className="space-y-8 text-left animate-fadeIn">
              {/* Dispatch Assignment Block */}
              <div className="border border-navy-100 dark:border-navy-850 p-6 rounded-2xl bg-navy-50/10">
                <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PlusCircle className="w-4.5 h-4.5 text-royal-600" />
                  Dispatch Custom Homework Task
                </h3>

                <form onSubmit={handleAssignSubmit(onAssignHomework)} className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Target Student</label>
                    <select
                      {...regAssign("student_id", { required: true })}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                    >
                      <option value="">-- Select Student --</option>
                      {profiles.filter(p => p.role === "student").map(p => (
                        <option key={p.id} value={p.id}>{p.first_name} {p.surname} ({p.grade})</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Category Subject</label>
                    <select
                      {...regAssign("subject", { required: true })}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                    >
                      <option value="Core Mathematics (Grade 10-12 CAPS)">Core Mathematics (CAPS)</option>
                      <option value="IEB Advanced Programme Mathematics">IEB AP Mathematics</option>
                      <option value="IEB Independent School Mathematics">IEB Core Mathematics</option>
                      <option value="TVET Technical Mathematics Upgrade">TVET Math Upgrade</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Submission Due Date</label>
                    <input
                      type="date"
                      {...regAssign("due_date", { required: true })}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-12 space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Calculus optimization and graph sketch derivatives proofs"
                      {...regAssign("title", { required: true })}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-12 space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Brief Description / Problem Coordinates</label>
                    <textarea
                      rows={3}
                      placeholder="Input the exercise study coordinates, worksheets pages numbers, or proofs first principles equations..."
                      {...regAssign("description", { required: true })}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-12 pt-2 text-right">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Dispatch & Assign Homework
                    </button>
                  </div>
                </form>
              </div>

              {/* View Submissions grading board */}
              <div className="space-y-4">
                <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider border-b border-navy-100 dark:border-navy-850 pb-2 flex items-center gap-2">
                  <Bookmark className="w-4.5 h-4.5 text-royal-600" />
                  Grading Desk Submissions ({submissions.length})
                </h3>

                <div className="space-y-4">
                  {[...submissions]
                    .sort((a, b) => {
                      const timeA = new Date(a.created_at || "").getTime() || 0;
                      const timeB = new Date(b.created_at || "").getTime() || 0;
                      if (timeB !== timeA) return timeB - timeA;
                      return b.id.localeCompare(a.id, undefined, { numeric: true });
                    })
                    .map((sub, sIdx) => {
                    const student = profiles.find(p => p.id === sub.student_id);
                    const assignment = assignments.find(a => a.id === sub.assignment_id);

                    return (
                      <div
                        key={sub.id}
                        className={`border rounded-xl p-5 space-y-4 bg-white dark:bg-navy-950 ${
                          sIdx === 0
                            ? "border-royal-400/50 dark:border-royal-500/30 ring-1 ring-royal-500/10 shadow-sm"
                            : "border-navy-150 dark:border-navy-850"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-navy-100 dark:border-navy-850 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              {sIdx === 0 && (
                                <span className="text-[9px] font-mono bg-royal-600 text-white px-2 py-0.5 rounded font-black uppercase">
                                  Latest Submission
                                </span>
                              )}
                              <span className="text-[9px] font-mono bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 px-2 py-0.5 rounded font-black">
                                ID: {sub.id}
                              </span>
                            </div>
                            <h4 className="text-xs font-mono font-black text-navy-900 dark:text-white mt-1">
                              Student: {student?.first_name} {student?.surname} | Handed in: {sub.created_at}
                            </h4>
                          </div>

                          <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded uppercase ${
                            sub.status === "reviewed" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : "text-amber-600 bg-amber-50 dark:bg-amber-950/20 animate-pulse"
                          }`}>
                            {sub.status === "reviewed" ? "Graded & Reviewed" : "Needs Grading"}
                          </span>
                        </div>

                        <div className="text-xs space-y-2">
                          <p><b>Original Assignment:</b> {assignment?.title || "Caps Calculus Problem Set"}</p>
                          <div className="flex items-center justify-between gap-3 p-2.5 bg-navy-50 dark:bg-navy-900 rounded-xl border border-navy-150 dark:border-navy-800 flex-wrap">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const b = getFileIconAndBadge(sub.file_name, sub.file_type);
                                const BIcon = b.icon;
                                return (
                                  <div className={`p-1.5 rounded-lg border ${b.color}`}>
                                    <BIcon className="w-4 h-4" />
                                  </div>
                                );
                              })()}
                              <div>
                                <p className="font-mono text-xs font-bold text-navy-900 dark:text-white">
                                  {sub.file_name} <span className="text-[10px] text-navy-400 font-normal">({sub.file_size})</span>
                                </p>
                                <span className="text-[9px] font-mono text-navy-400">Multi-format Document Submission</span>
                              </div>
                            </div>

                            {sub.file_url && sub.file_url !== "#" && (
                              <a
                                href={sub.file_url}
                                download={sub.file_name}
                                className="px-3 py-1 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 text-royal-600 dark:text-gold-400 font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                              >
                                Download Doc
                              </a>
                            )}
                          </div>
                          {sub.notes && <p className="italic text-navy-400">"Student notes: {sub.notes}"</p>}
                        </div>

                        {/* Academic Integrity indicator in tutor desk */}
                        {student && ((() => {
                          const hw = assignment || {
                            title: "Maths Worksheet Solution",
                            subject: "Mathematics CAPS Grade 12"
                          } as HomeworkAssignment;
                          const report = getIntegrityReport(sub, student, hw);
                          return (
                            <div className="flex items-center justify-between gap-4 p-2 bg-slate-50 dark:bg-navy-950/45 rounded-lg border border-slate-100 dark:border-navy-850/60 text-[11px] font-mono mt-2">
                              <span className="flex items-center gap-1.5 text-navy-500">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-gold-500" />
                                Integrity Score: <b className="text-emerald-600 dark:text-emerald-400">{report.overallScore}%</b> ({report.riskLevel} Risk)
                              </span>
                              <button
                                onClick={() => setSelectedIntegritySub(sub)}
                                className="px-2.5 py-0.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 text-royal-600 dark:text-gold-400 font-bold rounded hover:bg-navy-50 text-[10px] transition-colors cursor-pointer"
                              >
                                View Integrity report
                              </button>
                            </div>
                          );
                        })())}

                        {sub.status === "pending_review" ? (
                          <div className="border-t border-navy-100 dark:border-navy-850 pt-4">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-[10px] rounded-lg transition-transform uppercase tracking-wider"
                            >
                              Grade & Submit Tutor Feedback
                            </button>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 text-xs text-navy-600 dark:text-navy-300">
                            <p className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Check className="w-4 h-4" /> Tutor Feedback Delivered:
                            </p>
                            <p className="italic mt-1">"{sub.tutor_feedback}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {submissions.length === 0 && (
                    <p className="text-xs text-navy-400 italic text-center py-10">No student submissions received yet.</p>
                  )}
                </div>
              </div>

              {/* Grading submission modal */}
              {selectedSubmission && (
                <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="absolute top-4 right-4 text-navy-400 hover:text-navy-600 dark:hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>

                    <h3 className="text-sm font-black font-display text-navy-900 dark:text-white uppercase mb-4">
                      Grade Solutions submission
                    </h3>

                    <form onSubmit={handleGradeSubmissionSubmit} className="space-y-4 text-xs">
                      <div className="bg-navy-50 dark:bg-navy-950 p-3 rounded-lg">
                        <p className="font-bold">File: {selectedSubmission.file_name}</p>
                        <p className="text-navy-500 mt-0.5">Student Remarks: "{selectedSubmission.notes || 'None'}"</p>
                      </div>

                      <div className="space-y-1.5">
                        <VisualLatexToolbar
                          label="Tutor Feedback & Working Corrections"
                          value={gradingFeedback}
                          onChange={setGradingFeedback}
                          placeholder="Write corrections here. Provide CAPS level 7 coaching directives (e.g. \frac{df}{dx} = 2x - 3)..."
                          rows={4}
                          showLivePreview={true}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(null)}
                          className="px-4 py-2 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-700 dark:text-navy-300 font-bold hover:bg-navy-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                        >
                          Grade & Despatch
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= VIDEO LESSONS DESK ======================= */}
          {activeTab === "videos" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white">Matric video explanations Desk</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">View on-demand whiteboard video requested coordinates, record solutions and assign play URLs.</p>
              </div>

              <div className="space-y-4">
                {videoRequests.map((req) => {
                  const student = profiles.find(p => p.id === req.student_id);

                  return (
                    <div
                      key={req.id}
                      className="border border-navy-150 dark:border-navy-850 rounded-xl p-5 space-y-4 bg-navy-50/10"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-navy-100 dark:border-navy-850 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-bold">
                              On-Demand Video Request
                            </span>
                            <span className="text-[10px] text-navy-400 font-mono">{req.created_at}</span>
                          </div>
                          <h4 className="text-xs font-mono font-black text-navy-900 dark:text-white mt-1.5">
                            Student: {student?.first_name} {student?.surname} ({student?.grade})
                          </h4>
                        </div>

                        <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded uppercase ${
                          req.status === "completed" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : "text-amber-600 bg-amber-50 dark:bg-amber-950/20 animate-pulse"
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="text-xs leading-relaxed space-y-2">
                        <p><b>Chapter Concept:</b> {req.chapter_title} ({req.subject})</p>
                        <p><b>Description coordinates:</b> {req.description}</p>
                        <p><b>Receipt checklist:</b> <span className="text-emerald-600 font-bold">Paid R{req.price} (EFT Approved)</span></p>
                        {req.document_names && req.document_names.length > 0 && (
                          <p className="text-navy-500 font-mono text-[10px]">Attached sheet: <span className="underline cursor-pointer">{req.document_names[0]}</span></p>
                        )}
                      </div>

                      {req.status !== "completed" ? (
                        <div className="border-t border-navy-100 dark:border-navy-850 pt-4">
                          <button
                            onClick={() => setSelectedVideoReq(req)}
                            className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider"
                          >
                            Upload Whiteboard recorded explanation
                          </button>
                        </div>
                      ) : (
                        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-xs">
                          <p className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-4 h-4" /> Video Response dispatched:
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-navy-500 select-all">Embed URL: {req.video_url}</p>
                          {req.notes && <p className="italic text-navy-400 mt-1">"Notes: {req.notes}"</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Record Solve Modal */}
              {selectedVideoReq && (
                <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleIn">
                    <button
                      onClick={() => setSelectedVideoReq(null)}
                      className="absolute top-4 right-4 text-navy-400 hover:text-navy-600 dark:hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>

                    <h3 className="text-sm font-black font-display text-navy-900 dark:text-white uppercase mb-4">
                      Upload Video Lesson Response
                    </h3>

                    <form onSubmit={handleUpdateVideoRequestSubmit} className="space-y-4 text-xs text-left">
                      <div className="bg-navy-50 dark:bg-navy-950 p-3 rounded-lg leading-relaxed">
                        <p className="font-bold">Chapter: {selectedVideoReq.chapter_title}</p>
                        <p className="text-navy-500">Student requested: "{selectedVideoReq.description}"</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">YouTube / Vimeo Embed URL</label>
                        <input
                          type="url"
                          required
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                          className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Recorded Duration (Minutes)</label>
                          <input
                            type="number"
                            required
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5 font-mono text-[10px] text-navy-400 self-center pt-4">
                          * Video play link will display immediately on the student's learning cockpit.
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Whiteboard feedback Notes</label>
                        <textarea
                          rows={3}
                          value={videoNotes}
                          onChange={(e) => setVideoNotes(e.target.value)}
                          placeholder="e.g. Assigned to Head Tutor Bethuel. First principles limit breakdown explained clearly..."
                          className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedVideoReq(null)}
                          className="px-4 py-2 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-700 dark:text-navy-300 font-bold hover:bg-navy-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl"
                        >
                          Dispatch Video Solve
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= ACADEMY BROADCASTS ======================= */}
          {activeTab === "announcements" && (
            <div className="space-y-8 text-left animate-fadeIn">
              {/* Write Announcement Notice */}
              <div className="border border-navy-100 dark:border-navy-850 p-6 rounded-2xl bg-navy-50/10">
                <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Megaphone className="w-4.5 h-4.5 text-gold-500" />
                  Publish Noticeboard Broadcast
                </h3>

                <form onSubmit={handleAnnounceSubmit(onPublishAnnouncementSubmit)} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Notice Category</label>
                      <select
                        {...regAnnounce("category", { required: true })}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                      >
                        <option value="General">General Notice</option>
                        <option value="Academic">Academic / Syllabus</option>
                        <option value="Exam Prep">Exam Workshop Prep</option>
                        <option value="Schedule">Timetable Updates</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6 font-mono text-[10px] text-navy-600 dark:text-navy-300">
                      <input
                        type="checkbox"
                        id="is_urgent"
                        {...regAnnounce("is_urgent")}
                        className="rounded bg-white dark:bg-navy-950 border-navy-200 dark:border-navy-850 focus:outline-none"
                      />
                      <label htmlFor="is_urgent" className="font-bold text-red-500 uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Mark as Urgent Alert
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Notice Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Trial Examination Workshop series scheduled for Saturday"
                      {...regAnnounce("title", { required: true })}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Notice Content / Instructions</label>
                    <textarea
                      rows={4}
                      placeholder="Input the announcement bulletin here..."
                      {...regAnnounce("content", { required: true })}
                      className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                    />
                  </div>

                  <div className="text-right">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Publish Broadcast Notice
                    </button>
                  </div>
                </form>
              </div>

              {/* Notices List */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">Active Broadcast Archives ({announcements.length})</h3>

                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-xl border text-xs flex justify-between gap-4 items-start ${
                        ann.is_urgent
                          ? "bg-red-50/20 dark:bg-red-950/5 border-red-200 dark:border-red-900/40"
                          : "bg-white dark:bg-navy-950 border-navy-150 dark:border-navy-850"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono text-navy-400">{ann.created_at}</span>
                          <span className={`text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                            ann.category === "Exam Prep" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                            ann.category === "Academic" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                            ann.category === "Schedule" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                            "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}>
                            {ann.category}
                          </span>
                          {ann.is_urgent && (
                            <span className="text-[8px] font-black uppercase font-mono bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse">
                              Urgent Alert
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-navy-900 dark:text-white text-sm">{ann.title}</h4>
                        <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed max-w-3xl">{ann.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-navy-400 hover:text-red-500 p-1 rounded hover:bg-navy-550/10 transition-colors cursor-pointer"
                        title="Withdraw notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================= CONTACT MESSAGES ======================= */}
          {activeTab === "messages" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white">Inbound Contact Messages</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">Moderate curriculum pricing enquiries or CAPS registration followups submitted by the public.</p>
              </div>

              <div className="space-y-4">
                {contactMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`border rounded-xl p-5 space-y-4 ${
                      msg.status === "new"
                        ? "border-emerald-200 dark:border-emerald-900/30 bg-emerald-500/5"
                        : "border-navy-150 dark:border-navy-850 bg-white dark:bg-navy-950"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-navy-100 dark:border-navy-850 pb-2">
                      <div>
                        <span className={`text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                          msg.status === "new" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                          msg.status === "read" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                          "bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-300"
                        }`}>
                          {msg.status === "new" ? "Unread Inquiry" : msg.status === "read" ? "Reviewed" : "Responded"}
                        </span>
                        <h4 className="text-xs font-mono font-black text-navy-900 dark:text-white mt-1.5">
                          From: {msg.name} ({msg.email})
                        </h4>
                      </div>

                      <div className="flex gap-1.5 self-start sm:self-center">
                        <button
                          onClick={() => handleToggleMessageStatus(msg.id, msg.status)}
                          className="px-2.5 py-1 bg-white dark:bg-navy-850 border border-navy-200 dark:border-navy-700 text-[10px] font-bold rounded-md hover:bg-navy-50"
                        >
                          Toggle State
                        </button>
                        <button
                          onClick={() => handleDeleteContactMessage(msg.id)}
                          className="text-navy-400 hover:text-red-500 p-1.5 rounded hover:bg-navy-50 dark:hover:bg-navy-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs leading-relaxed text-navy-600 dark:text-navy-300 space-y-1.5">
                      <p><b>Subject Heading:</b> "{msg.subject}"</p>
                      <p className="bg-white dark:bg-navy-900 p-3 rounded-lg border border-navy-100 dark:border-navy-850 italic">
                        "{msg.message}"
                      </p>
                      <p className="font-mono text-[10px] text-navy-400">Phone Hotline: <b>{msg.phone || 'None provided'}</b> | Received on {msg.created_at}</p>
                    </div>
                  </div>
                ))}
                {contactMessages.length === 0 && (
                  <p className="text-xs text-navy-400 italic text-center py-10">No public messages filed.</p>
                )}
              </div>
            </div>
          )}

          {/* ======================= CURRICULUM SUBJECTS ======================= */}
          {activeTab === "subjects" && (
            <div className="space-y-8 text-left animate-fadeIn">
              {/* Add Subject Block */}
              <div className="border border-navy-100 dark:border-navy-850 p-6 rounded-2xl bg-navy-50/10">
                <h3 className="text-sm font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-royal-600" />
                  {editingSubject ? "Edit Curriculum Subject" : "Catalog New Curriculum Subject"}
                </h3>

                <form onSubmit={handleSubjectSubmit(onSubjectSubmit)} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-5 space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Core Mathematics CAPS"
                        {...regSubject("name", { required: true })}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-4 space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Grade level / Syllabus</label>
                      <select
                        {...regSubject("grade_level", { required: true })}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                      >
                        <option value="High School">High School (Grade 10-11)</option>
                        <option value="Matric Upgrade">Matric Upgrade (Grade 12 CAPS)</option>
                        <option value="IEB Syllabus">IEB Curriculum (Core Math)</option>
                        <option value="Advanced Mathematics">IEB AP Mathematics</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Hourly Rate (ZAR)</label>
                      <input
                        type="number"
                        placeholder="150"
                        {...regSubject("price_per_hour", { required: true })}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-12 space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Curriculum Topics (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Differential Calculus, Trigonometry Identities, Algebra, Financial Math"
                        {...regSubject("topics", { required: true })}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-12 space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">Brief Curriculum Description</label>
                      <textarea
                        rows={2}
                        placeholder="Describe what CAPS or IEB exam parameters this course addresses..."
                        {...regSubject("description", { required: true })}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-xl text-navy-900 dark:text-white"
                      />
                    </div>

                    {editingSubject && (
                      <div className="sm:col-span-4 flex items-center gap-2 font-mono text-[10px]">
                        <input
                          type="checkbox"
                          id="is_active"
                          {...regSubject("is_active")}
                        />
                        <label htmlFor="is_active" className="cursor-pointer">Toggle Active Status</label>
                      </div>
                    )}
                  </div>

                  <div className="text-right flex gap-2 justify-end">
                    {editingSubject && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubject(null);
                          resetSubject();
                        }}
                        className="px-4 py-2 border border-navy-200 dark:border-navy-700 rounded-xl font-bold text-navy-700 dark:text-navy-300"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      {editingSubject ? "Update Subject" : "Catalog Subject"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Subjects List */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">Active Curriculum Catalog</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="border border-navy-150 dark:border-navy-850 p-4 rounded-xl space-y-3 bg-white dark:bg-navy-950/40 hover:border-royal-500 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[8px] font-mono text-navy-400 uppercase">{sub.grade_level}</span>
                          <h4 className="font-extrabold text-navy-900 dark:text-white text-sm mt-0.5">{sub.name}</h4>
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                          R{sub.price_per_hour}/hr
                        </span>
                      </div>

                      <p className="text-[11px] text-navy-500 dark:text-navy-400 line-clamp-2">{sub.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {sub.topics.map((t, idx) => (
                          <span key={idx} className="text-[8px] bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-navy-300 font-mono px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t border-navy-100 dark:border-navy-850 pt-2 text-[10px]">
                        <span className={`font-bold font-mono ${sub.is_active !== false ? "text-emerald-500" : "text-red-400"}`}>
                          {sub.is_active !== false ? "● Active in portal" : "● Hidden / Disabled"}
                        </span>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => startEditSubject(sub)}
                            className="text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-bold"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="text-red-500 hover:underline flex items-center gap-1 font-bold"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================= PDF RESOURCE LIBRARY & BULK RE-NAMER ======================= */}
          {activeTab === "resources" && (
            <div className="space-y-6 text-left animate-fadeIn">
              {/* Toast Notification */}
              {bulkAppliedToast && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-700 dark:text-emerald-300 flex items-center gap-3 font-semibold text-sm shadow-md animate-bounce">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{bulkAppliedToast}</span>
                </div>
              )}

              {/* Header Title & Description */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-850 pb-4 pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                      Standardization Utility
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-royal-500/10 text-royal-600 dark:text-royal-400">
                      CAPS / IEB Vault
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-navy-900 dark:text-white mt-1">
                    PDF Resource Catalog & Bulk Utility
                  </h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400 max-w-2xl mt-0.5">
                    Batch standardize document file names, re-tag syllabus exam levels, and update technical PDF metadata across all high school learning materials.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsNewResModalOpen(true)}
                    className="px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Upload / Catalog PDF Resource
                  </button>
                </div>
              </div>

              {/* Top Summary Metrics Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-royal-500/10 text-royal-600 dark:text-royal-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-navy-500 dark:text-navy-400 font-medium">Total Catalog Resources</div>
                    <div className="text-xl font-black text-navy-900 dark:text-white">{resourceItems.length} PDFs</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-navy-500 dark:text-navy-400 font-medium">Selected for Bulk Action</div>
                    <div className="text-xl font-black text-gold-600 dark:text-gold-400">{selectedResIds.length} Selected</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-navy-500 dark:text-navy-400 font-medium">CAPS vs IEB Ratio</div>
                    <div className="text-base font-black text-navy-900 dark:text-white">
                      {resourceItems.filter(r => r.syllabus === "CAPS").length} CAPS / {resourceItems.filter(r => r.syllabus === "IEB").length} IEB
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-navy-500 dark:text-navy-400 font-medium">Standardized Naming</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {Math.round((resourceItems.filter(r => r.file_name.includes("_")).length / (resourceItems.length || 1)) * 100)}% Compliant
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================= BATCH RENAMING & RE-TAGGING RULE ENGINE ======================= */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-900 via-navy-900 to-royal-950 text-white shadow-xl border border-royal-500/30 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-500/30">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        Bulk Standardization & Re-Tagging Engine
                      </h3>
                      <p className="text-xs text-navy-200">
                        Configure batch naming patterns, casing, tag overrides, and prefix/suffix rules for selected items.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAllRes}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                    >
                      {selectedResIds.length === filteredResourceItems.length && filteredResourceItems.length > 0 ? (
                        <>
                          <Square className="w-3.5 h-3.5 text-gold-400" />
                          <span>Deselect All ({filteredResourceItems.length})</span>
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3.5 h-3.5 text-gold-400" />
                          <span>Select All Filtered ({filteredResourceItems.length})</span>
                        </>
                      )}
                    </button>
                    {selectedResIds.length > 0 && (
                      <button
                        onClick={() => setSelectedResIds([])}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold rounded-lg transition-all cursor-pointer border border-red-500/30"
                      >
                        Reset ({selectedResIds.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* 3-Column Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Naming Convention Pattern */}
                  <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <label className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderEdit className="w-3.5 h-3.5" /> 1. Standard Naming Pattern
                    </label>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-navy-200 block">Preset Format:</label>
                      <select
                        value={namingPattern}
                        onChange={e => setNamingPattern(e.target.value)}
                        className="w-full bg-navy-950 border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="pattern_standard">[Syllabus]_[Grade]_[Topic]_[Title].pdf</option>
                        <option value="pattern_amh">AMH_[Grade]_[Topic]_[Title].pdf</option>
                        <option value="pattern_solutions">[Grade]_[Syllabus]_[Title]_(Solutions).pdf</option>
                        <option value="pattern_custom">Custom Tag Format Placeholder</option>
                      </select>
                    </div>

                    {namingPattern === "pattern_custom" && (
                      <div className="space-y-1">
                        <label className="text-[11px] text-navy-300">Custom Tags (e.g. &#123;syllabus&#125;_&#123;grade&#125;_&#123;title&#125;):</label>
                        <input
                          type="text"
                          value={customPatternFormat}
                          onChange={e => setCustomPatternFormat(e.target.value)}
                          className="w-full bg-navy-950 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-gold-300 font-mono focus:outline-none focus:border-gold-400"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-navy-200 block">Letter Case Format:</label>
                      <select
                        value={caseFormat}
                        onChange={e => setCaseFormat(e.target.value)}
                        className="w-full bg-navy-950 border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="title_case">Title_Case_With_Underscores.pdf</option>
                        <option value="lowercase_underscore">lowercase_with_underscores.pdf</option>
                        <option value="uppercase_underscore">UPPERCASE_WITH_UNDERSCORES.pdf</option>
                        <option value="title_case_spaced">Title Case Spaced With Spaces.pdf</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-navy-300 block">Prefix (Optional):</label>
                        <input
                          type="text"
                          placeholder="e.g. AMH-2026"
                          value={customPrefix}
                          onChange={e => setCustomPrefix(e.target.value)}
                          className="w-full bg-navy-950 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-navy-300 block">Suffix (Optional):</label>
                        <input
                          type="text"
                          placeholder="e.g. Final"
                          value={customSuffix}
                          onChange={e => setCustomSuffix(e.target.value)}
                          className="w-full bg-navy-950 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Bulk Tagging Overrides */}
                  <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <label className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> 2. Bulk Tagging Overrides
                    </label>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-navy-200 block">Syllabus Tag:</label>
                      <select
                        value={bulkSyllabus}
                        onChange={e => setBulkSyllabus(e.target.value)}
                        className="w-full bg-navy-950 border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="keep">Keep Existing Syllabus</option>
                        <option value="CAPS">CAPS (DBE National Senior Cert)</option>
                        <option value="IEB">IEB (Independent Examinations Board)</option>
                        <option value="Both">Both (CAPS & IEB Combined)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-navy-200 block">Grade Level Tag:</label>
                      <select
                        value={bulkGrade}
                        onChange={e => setBulkGrade(e.target.value)}
                        className="w-full bg-navy-950 border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="keep">Keep Existing Grade Level</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="Matric Upgrade">Matric Upgrade</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-navy-200 block">Topic / Domain Tag:</label>
                      <select
                        value={bulkTopic}
                        onChange={e => setBulkTopic(e.target.value)}
                        className="w-full bg-navy-950 border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-gold-400"
                      >
                        <option value="keep">Keep Existing Topic</option>
                        <option value="Algebra & Sequences">Algebra & Sequences</option>
                        <option value="Differential Calculus">Differential Calculus</option>
                        <option value="Trigonometry">Trigonometry</option>
                        <option value="Functions & Graphs">Functions & Graphs</option>
                        <option value="Analytical Geometry">Analytical Geometry</option>
                        <option value="Euclidean Geometry">Euclidean Geometry</option>
                        <option value="Statistics">Statistics & Data Handling</option>
                        <option value="Financial Math">Financial Mathematics</option>
                        <option value="Exam Papers & Memos">Exam Papers & Memos</option>
                      </select>
                    </div>
                  </div>

                  {/* Column 3: Batch Action Execute */}
                  <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 3. Batch Action Execution
                      </label>
                      <p className="text-xs text-navy-200 mt-1.5">
                        Applies standard file names, updates metadata hashes, and re-indexes all selected files in the catalog.
                      </p>

                      <div className="mt-4 p-3 bg-navy-950/80 rounded-xl border border-white/10 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-navy-300">Files Selected:</span>
                          <span className="font-bold text-gold-400">{selectedResIds.length} of {resourceItems.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-navy-300">Technical SHA-256 Hashes:</span>
                          <span className="font-bold text-emerald-400">Auto-recalculated</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-navy-300">Outbox Activity Log:</span>
                          <span className="font-bold text-royal-300">Audited</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleApplyBulkStandardization}
                      disabled={selectedResIds.length === 0}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                        selectedResIds.length > 0
                          ? "bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-black shadow-gold-500/20 active:scale-98"
                          : "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Apply Standardization ({selectedResIds.length} Files)
                    </button>
                  </div>
                </div>

                {/* Live Preview Table of Selected Files */}
                {selectedResIds.length > 0 && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gold-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4" /> Live Standardized Naming Preview ({selectedResIds.length} Items)
                      </span>
                      <span className="text-[11px] text-navy-300 font-mono">
                        Targeting {selectedResIds.length} PDF files
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto rounded-xl border border-white/15 bg-navy-950/90 text-left">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-white/10 text-navy-200 font-bold uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="p-2.5">Original Resource Title</th>
                            <th className="p-2.5">Current File Name</th>
                            <th className="p-2.5 text-gold-400">Proposed Standardized File Name</th>
                            <th className="p-2.5">Proposed Tags</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 font-mono text-[11px]">
                          {selectedResIds.map(id => {
                            const item = resourceItems.find(r => r.id === id);
                            if (!item) return null;
                            const proposed = computeProposedFileName(
                              item,
                              namingPattern,
                              customPatternFormat,
                              caseFormat,
                              bulkSyllabus,
                              bulkGrade,
                              bulkTopic,
                              customPrefix,
                              customSuffix
                            );
                            return (
                              <tr key={id} className="hover:bg-white/5 transition-colors">
                                <td className="p-2.5 font-sans font-medium text-white max-w-[180px] truncate">{item.title}</td>
                                <td className="p-2.5 text-navy-300 max-w-[180px] truncate">{item.file_name}</td>
                                <td className="p-2.5 text-gold-300 font-bold max-w-[240px] truncate">{proposed.fileName}</td>
                                <td className="p-2.5 font-sans">
                                  <div className="flex items-center gap-1">
                                    <span className="bg-royal-500/30 text-royal-200 px-1.5 py-0.5 rounded text-[9px] font-bold">{proposed.syllabus}</span>
                                    <span className="bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded text-[9px] font-bold">{proposed.grade}</span>
                                    <span className="bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold truncate max-w-[100px]">{proposed.topic}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Controls & Search */}
              <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search titles, file names, topics..."
                    value={resSearchQuery}
                    onChange={e => setResSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-medium text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select
                    value={resSyllabusFilter}
                    onChange={e => setResSyllabusFilter(e.target.value)}
                    className="px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-700 dark:text-navy-300 focus:outline-none"
                  >
                    <option value="All">All Syllabi</option>
                    <option value="CAPS">CAPS</option>
                    <option value="IEB">IEB</option>
                    <option value="Both">Both</option>
                  </select>

                  <select
                    value={resGradeFilter}
                    onChange={e => setResGradeFilter(e.target.value)}
                    className="px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-700 dark:text-navy-300 focus:outline-none"
                  >
                    <option value="All">All Grades</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Matric Upgrade">Matric Upgrade</option>
                  </select>

                  <span className="text-xs text-navy-400 font-bold ml-auto sm:ml-2">
                    Showing {filteredResourceItems.length} of {resourceItems.length} PDFs
                  </span>
                </div>
              </div>

              {/* Master PDF Resources Table */}
              <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy-50 dark:bg-navy-850 text-navy-600 dark:text-navy-300 font-bold uppercase text-[10px] tracking-wider border-b border-navy-100 dark:border-navy-800">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedResIds.length === filteredResourceItems.length && filteredResourceItems.length > 0}
                            onChange={toggleSelectAllRes}
                            className="rounded text-royal-600 focus:ring-royal-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">Document Details</th>
                        <th className="p-3">File Name</th>
                        <th className="p-3">Syllabus</th>
                        <th className="p-3">Grade</th>
                        <th className="p-3">Topic</th>
                        <th className="p-3 text-center">Prints / Views</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100 dark:divide-navy-800 font-medium">
                      {filteredResourceItems.map(item => {
                        const isSelected = selectedResIds.includes(item.id);
                        const isStandardized = item.file_name.includes("_") && item.file_name.endsWith(".pdf");
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-navy-50/50 dark:hover:bg-navy-850/50 transition-colors ${
                              isSelected ? "bg-royal-500/5 dark:bg-royal-500/10" : ""
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectResId(item.id)}
                                className="rounded text-royal-600 focus:ring-royal-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 max-w-xs">
                              <div className="flex items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-navy-900 dark:text-white line-clamp-1">{item.title}</div>
                                  <div className="text-[11px] text-navy-400 line-clamp-1 mt-0.5">{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-[11px] max-w-[200px]">
                              <div className="text-navy-800 dark:text-navy-200 truncate">{item.file_name}</div>
                              <div className="mt-0.5">
                                {isStandardized ? (
                                  <span className="text-[9px] font-bold font-sans text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                    ✓ Standard Name
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold font-sans text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                                    ! Non-Standard
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                item.syllabus === "IEB" 
                                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-300"
                                  : item.syllabus === "CAPS"
                                  ? "bg-royal-500/15 text-royal-600 dark:text-royal-300"
                                  : "bg-gold-500/15 text-gold-600 dark:text-gold-300"
                              }`}>
                                {item.syllabus}
                              </span>
                            </td>
                            <td className="p-3 text-navy-700 dark:text-navy-300 font-semibold">{item.grade_level}</td>
                            <td className="p-3 text-navy-700 dark:text-navy-300 max-w-[140px] truncate">{item.topic}</td>
                            <td className="p-3 text-center text-navy-500 dark:text-navy-400 font-bold">{item.print_count || 0}</td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenMetadataModal(item)}
                                title="View PDF Technical Metadata"
                                className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-800 text-royal-600 dark:text-gold-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setPreviewingResItem(item)}
                                title="Preview PDF Document"
                                className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => startEditResourceItem(item)}
                                title="Edit Document Metadata"
                                className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-800 text-royal-600 dark:text-royal-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResourceItem(item.id)}
                                title="Delete Document"
                                className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Single Item Quick Edit Modal */}
              {editingResItem && (
                <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
                    <div className="p-4 bg-royal-600 text-white flex justify-between items-center">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-gold-400" /> Edit Resource Metadata & File Name
                      </h3>
                      <button onClick={() => setEditingResItem(null)} className="text-white/80 hover:text-white cursor-pointer">
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleResItemSubmit(onSaveSingleResItemSubmit)} className="p-5 space-y-4 text-left">
                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Document Title</label>
                        <input
                          type="text"
                          {...regResItem("title", { required: true })}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Standardized File Name</label>
                        <input
                          type="text"
                          {...regResItem("file_name", { required: true })}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-mono text-gold-600 dark:text-gold-400 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Syllabus</label>
                          <select
                            {...regResItem("syllabus")}
                            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                          >
                            <option value="CAPS">CAPS</option>
                            <option value="IEB">IEB</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Grade Level</label>
                          <select
                            {...regResItem("grade_level")}
                            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                          >
                            <option value="Grade 10">Grade 10</option>
                            <option value="Grade 11">Grade 11</option>
                            <option value="Grade 12">Grade 12</option>
                            <option value="Matric Upgrade">Matric Upgrade</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Topic / Curriculum Area</label>
                        <input
                          type="text"
                          {...regResItem("topic", { required: true })}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Description</label>
                        <textarea
                          rows={3}
                          {...regResItem("description")}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-medium text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingResItem(null)}
                          className="px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add New Resource Modal */}
              {isNewResModalOpen && (
                <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
                    <div className="p-4 bg-royal-600 text-white flex justify-between items-center">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4 text-gold-400" /> Catalog New PDF Resource
                      </h3>
                      <button onClick={() => setIsNewResModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleResItemSubmit(onAddNewResItemSubmit)} className="p-5 space-y-4 text-left">
                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Document Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Grade 12 Analytical Geometry Circles Handbook"
                          {...regResItem("title", { required: true })}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Standardized File Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="Leave blank to auto-generate standard filename"
                          {...regResItem("file_name")}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-mono text-gold-600 dark:text-gold-400 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Syllabus</label>
                          <select
                            {...regResItem("syllabus")}
                            defaultValue="CAPS"
                            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                          >
                            <option value="CAPS">CAPS</option>
                            <option value="IEB">IEB</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Grade Level</label>
                          <select
                            {...regResItem("grade_level")}
                            defaultValue="Grade 12"
                            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                          >
                            <option value="Grade 10">Grade 10</option>
                            <option value="Grade 11">Grade 11</option>
                            <option value="Grade 12">Grade 12</option>
                            <option value="Matric Upgrade">Matric Upgrade</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Topic / Curriculum Area</label>
                        <input
                          type="text"
                          placeholder="e.g. Differential Calculus"
                          {...regResItem("topic", { required: true })}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Description</label>
                        <textarea
                          rows={3}
                          placeholder="Brief summary of worksheet or exam paper contents..."
                          {...regResItem("description")}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-medium text-navy-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsNewResModalOpen(false)}
                          className="px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Catalog Resource
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* PDF Preview Modal */}
              <PDFPreviewerModal
                isOpen={!!previewingResItem}
                onClose={() => setPreviewingResItem(null)}
                item={previewingResItem}
              />

              {/* PDF Technical Metadata Modal */}
              <PDFMetadataModal
                isOpen={!!metadataResItem}
                onClose={() => setMetadataResItem(null)}
                metadata={activeResMeta}
              />
            </div>
          )}

          {/* ======================= AUTOMATED EMAIL OUTBOX LOGS ======================= */}
          {activeTab === "emailLogs" && (
            <div className="space-y-6 text-left animate-fadeIn">
              {/* WEEKLY SUMMARY SERVICE MANAGEMENT WIDGET */}
              <WeeklySummaryServiceWidget user={user} />

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-navy-100 dark:border-navy-850 pb-4 pt-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white">All System Notification Outbox</h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    Audit trail of all system-generated email confirmations and schedule updates dispatched to students.
                  </p>
                </div>
                <button
                  onClick={() => {
                    fetch("/api/notifications/logs")
                      .then(res => res.json())
                      .then(data => {
                        if (Array.isArray(data)) setEmailLogs(data);
                      })
                      .catch(err => console.error(err));
                  }}
                  className="px-4 py-2 text-xs font-bold bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-700 dark:text-navy-300 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Outbox
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-navy-50/50 dark:bg-navy-950/40 p-4 rounded-xl border border-navy-150 dark:border-navy-850">
                  <div className="text-[10px] font-mono font-bold text-navy-500 uppercase">Total Outbox</div>
                  <div className="text-xl font-black text-navy-900 dark:text-white mt-1">
                    {emailLogs.length} <span className="text-xs font-normal text-navy-400">mails</span>
                  </div>
                </div>
                <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/15">
                  <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase">Live Delivered</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {emailLogs.filter(l => l.status === "sent").length} <span className="text-xs font-normal text-emerald-500">SMTP</span>
                  </div>
                </div>
                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/15">
                  <div className="text-[10px] font-mono font-bold text-amber-600 uppercase">Simulated Sandbox</div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {emailLogs.filter(l => l.status === "simulated").length} <span className="text-xs font-normal text-amber-500">Local</span>
                  </div>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-4">
                {emailLogs.map((log) => {
                  const isExpanded = expandedEmailId === log.id;
                  return (
                    <div
                      key={log.id}
                      className="border border-navy-150 dark:border-navy-850 rounded-xl bg-white dark:bg-navy-950/40 hover:border-royal-400/50 transition-colors overflow-hidden"
                    >
                      {/* Summary Row */}
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                              log.trigger_type === "booking_confirmation"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                            }`}>
                              {log.trigger_type === "booking_confirmation" ? "Booking Confirmation" : "Schedule Update"}
                            </span>

                            <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                              log.status === "sent"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : log.status === "simulated"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                log.status === "sent" ? "bg-emerald-500" : log.status === "simulated" ? "bg-amber-500" : "bg-red-500"
                              }`} />
                              {log.status === "sent" ? "Dispatched (Real SMTP)" : log.status === "simulated" ? "Simulated Sandboxed" : "Failed Delivery"}
                            </span>

                            <span className="text-[10px] text-navy-400 font-mono">
                              Ref: <b>{log.booking_reference}</b>
                            </span>
                          </div>

                          <h3 className="font-extrabold text-navy-900 dark:text-white text-sm">
                            {log.subject}
                          </h3>

                          <div className="text-[11px] text-navy-500 dark:text-navy-400">
                            Recipient: <span className="font-semibold text-navy-700 dark:text-navy-300">{log.recipient_name}</span> 
                            {" "}(<span className="font-mono">{log.recipient_email}</span>) 
                            <span className="mx-2">•</span> 
                            Sent on {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedEmailId(isExpanded ? null : log.id)}
                          className="px-3.5 py-1.5 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-800 text-[10px] font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer text-navy-700 dark:text-navy-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-royal-600" />
                          {isExpanded ? "Hide Email Payload" : "View Rendered Email"}
                        </button>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="border-t border-navy-150 dark:border-navy-850 bg-navy-50/20 dark:bg-navy-950/20 p-5 space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-navy-400">
                            <span>Bento-Grid HTML Payload Visualizer</span>
                            {log.status === "simulated" && (
                              <span className="text-amber-500">Note: Recipient address matches simulated profile</span>
                            )}
                          </div>

                          {/* Render HTML safely inside simulated screen */}
                          <div className="border border-navy-200 dark:border-navy-850 rounded-xl bg-white p-4 max-h-[450px] overflow-y-auto">
                            <div 
                              dangerouslySetInnerHTML={{ __html: log.body_html }} 
                              className="email-html-view text-left text-navy-950"
                            />
                          </div>

                          {/* Text version backup */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-mono font-bold text-navy-400 uppercase">Plain Text Output:</div>
                            <pre className="text-[11px] font-mono bg-navy-50 dark:bg-navy-900/60 p-4 rounded-xl border border-navy-100 dark:border-navy-850 text-navy-700 dark:text-navy-300 whitespace-pre-wrap leading-relaxed">
                              {log.body_text}
                            </pre>
                          </div>

                          {log.error_message && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl p-3 text-[11px] font-mono">
                              <b>Nodemailer Dispatch Error:</b> {log.error_message}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {emailLogs.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-navy-200 dark:border-navy-800 rounded-2xl">
                    <Mail className="w-10 h-10 text-navy-300 dark:text-navy-700 mx-auto mb-2.5" />
                    <p className="text-xs text-navy-400 italic">No automated notification emails logged yet.</p>
                    <p className="text-[10px] text-navy-500 font-mono mt-1">Book or update tutoring classes to trigger emails.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= TUTOR WEEKLY AVAILABILITY GRID ======================= */}
          {activeTab === "availability" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-navy-100 dark:border-navy-850 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-navy-900 dark:text-white">Tutor Weekly Availability Grid</h2>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    Define your weekly general schedule here. Mark slots as <strong className="text-emerald-600">Free</strong> (available for booking) or <strong className="text-red-500">Busy</strong> (locked/unavailable). Student bookings will automatically sync and block conflicts.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (confirm("Reset weekly availability to standard Amaris Hub hours?")) {
                        const defaultSchedule = {
                          "Monday": ["08:30 - 09:30", "16:30 - 17:30"],
                          "Tuesday": ["11:30 - 12:30"],
                          "Wednesday": ["15:00 - 16:00"],
                          "Thursday": ["13:30 - 14:30"],
                          "Friday": ["18:00 - 19:00"],
                          "Saturday": ["08:30 - 09:30", "10:00 - 11:00"],
                          "Sunday": ["11:30 - 12:30", "13:30 - 14:30", "15:00 - 16:00"]
                        };
                        setWeeklyAvailability(defaultSchedule);
                        localStorage.setItem("amh_tutor_availability", JSON.stringify(defaultSchedule));
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-mono font-black bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-300 rounded-xl border border-navy-250 dark:border-navy-700 transition-all uppercase cursor-pointer"
                  >
                    Reset Template
                  </button>
                  <button
                    onClick={() => {
                      const cleared = {
                        "Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []
                      };
                      setWeeklyAvailability(cleared);
                      localStorage.setItem("amh_tutor_availability", JSON.stringify(cleared));
                      alert("All slots successfully set to Free! Active students can now reserve any hour of the day.");
                    }}
                    className="px-3 py-1.5 text-[10px] font-mono font-black bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 transition-all uppercase cursor-pointer"
                  >
                    Mark All Free
                  </button>
                </div>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                  const busySlots = weeklyAvailability[day] || [];
                  return (
                    <div 
                      key={day} 
                      className="bg-navy-50/25 dark:bg-navy-950/25 border border-navy-150 dark:border-navy-850 rounded-xl p-3 space-y-3"
                    >
                      <div className="border-b border-navy-100 dark:border-navy-850 pb-1.5 text-center">
                        <span className="text-xs font-black text-navy-800 dark:text-white block">{day}</span>
                        <span className="text-[9px] font-mono text-navy-500 block">
                          {TIME_SLOTS.length - busySlots.length} / {TIME_SLOTS.length} Free
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {TIME_SLOTS.map((slot) => {
                          const isBusy = busySlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleToggleWeeklySlot(day, slot)}
                              className={`w-full p-2 rounded-lg border text-left transition-all relative overflow-hidden group cursor-pointer text-[11px] ${
                                isBusy 
                                  ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-700 dark:text-red-400" 
                                  : "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              }`}
                            >
                              <div className="flex justify-between items-center relative z-10">
                                <div className="space-y-0.5">
                                  <span className="text-[9.5px] font-mono font-bold block">{slot}</span>
                                  <span className="text-[8.5px] font-black uppercase tracking-wider block">
                                    {isBusy ? "Busy" : "Free"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Booking system sync status indicator */}
              <div className="bg-royal-500/10 border border-royal-500/20 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-royal-500/20 rounded-lg text-royal-600 dark:text-gold-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 text-xs text-navy-600 dark:text-navy-300">
                  <h4 className="font-bold text-navy-900 dark:text-white">Active Synchronisation Status: Online</h4>
                  <p>When students load the Booking Wizard, slots marked <b>Busy</b> or containing existing reserved sessions are dynamically disabled to prevent double bookings.</p>
                </div>
              </div>
            </div>
          )}

          {/* ======================= AUTOMATED TUTOR-STUDENT MATCHING ENGINE ======================= */}
          {activeTab === "tutor_matching" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <AutomatedTutorMatching />
            </div>
          )}

          {/* ======================= TUTOR REPORTS HUB ======================= */}
          {activeTab === "tutor_reports" && user && (
            <div className="space-y-6 text-left animate-fadeIn">
              <TutorReportsDashboard user={user} />
            </div>
          )}

          {/* ======================= MONITORING & OPS HUB ======================= */}
          {activeTab === "monitoring" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <OpsDashboard />
            </div>
          )}

          {/* ======================= EXECUTIVE OPERATIONS BI DASHBOARD ======================= */}
          {activeTab === "executive_ops" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <ExecutiveOperationsDashboard />
            </div>
          )}

          {/* ======================= LOAD TESTING INTERFACE ======================= */}
          {activeTab === "load_testing" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <LoadTestingDashboard />
            </div>
          )}

          {/* ======================= k6 PERFORMANCE ANALYTICS ======================= */}
          {activeTab === "performance_analytics" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <PerformanceAnalytics />
            </div>
          )}

          {/* ======================= PERFORMANCE ADVISOR INTERFACE ======================= */}
          {activeTab === "performance_advisor" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <PerformanceAdvisor />
            </div>
          )}

          {/* ======================= INCIDENT RESPONSE CENTER ======================= */}
          {activeTab === "incident_response" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <IncidentResponseCenter />
            </div>
          )}

          {/* ======================= SECURITY & WAF DASHBOARD ======================= */}
          {activeTab === "security" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <SecurityDashboard />
            </div>
          )}

          {/* ======================= FIREBASE MFA AUTHENTICATOR SETUP ======================= */}
          {activeTab === "mfa_setup" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <MFASetup user={user} />
            </div>
          )}

          {/* ======================= CAPACITY PLANNING & RESOURCE FORECASTER ======================= */}
          {activeTab === "capacity_planning" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <CapacityPlanning />
            </div>
          )}

          {/* ======================= AIOPS OPERATIONS ASSISTANT ======================= */}
          {activeTab === "aiops_assistant" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <AIOpsOperationsAssistant />
            </div>
          )}

          {/* ======================= INFRASTRUCTURE TOPOLOGY MAP ======================= */}
          {activeTab === "infra_topology" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <InfrastructureTopologyMap />
            </div>
          )}

          {/* ======================= API PERFORMANCE RANKING ======================= */}
          {activeTab === "api_performance" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <APIPerformanceRanking />
            </div>
          )}

          {/* ======================= AWS OPERATIONAL COST ANALYTICS ======================= */}
          {activeTab === "cost_analytics" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <CostAnalytics />
            </div>
          )}

          {/* ======================= SYSTEM LOGS TERMINAL ======================= */}
          {activeTab === "system_logs" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <SystemLogsDashboard />
            </div>
          )}

          {/* ======================= DJANGO ENTERPRISE ADMIN CONTROL CENTRE ======================= */}
          {activeTab === "django_admin" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <DjangoAdminDashboard />
            </div>
          )}

          {/* ======================= EXAM DISPATCH MONITOR ======================= */}
          {activeTab === "examDeliveries" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-navy-900 dark:text-white">Exam Dispatch Monitor</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400">
                  Real-time status tracking for final exam prediction multi-channel dispatches (AWS SES & Meta WhatsApp Cloud).
                </p>
              </div>

              {/* Operations Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[9px] font-mono font-black text-navy-400 uppercase tracking-wider block">Total Dispatches</span>
                  <div className="text-2xl font-black text-navy-900 dark:text-white">{examDeliveries.length}</div>
                  <span className="text-[10px] text-navy-500 block">All student runs</span>
                </div>

                <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-1">
                  <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Success Dispatches</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {examDeliveries.filter(d => d.email_status === "sent" || d.whatsapp_status === "sent" || d.email_status === "simulated" || d.whatsapp_status === "simulated").length}
                  </div>
                  <span className="text-[10px] text-emerald-500 block">SES or WhatsApp Active</span>
                </div>

                <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                  <span className="text-[9px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Failed (With Retries)</span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {examDeliveries.filter(d => d.whatsapp_status === "failed").length}
                  </div>
                  <span className="text-[10px] text-amber-500 block">Automatic Celery Tasks</span>
                </div>

                <div className="bg-royal-600/10 dark:bg-royal-600/5 border border-royal-600/20 rounded-2xl p-4 space-y-1">
                  <span className="text-[9px] font-mono font-black text-royal-600 dark:text-royal-400 uppercase tracking-wider block">AWS Storage Node</span>
                  <div className="text-sm font-black text-navy-900 dark:text-white pt-1">AWS S3 BUCKET</div>
                  <span className="text-[10px] text-emerald-500 block">HMAC-SHA256 Active</span>
                </div>
              </div>

              {/* Dispatch Grid List */}
              <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
                  <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase font-mono">
                    Auditable Dispatch Log
                  </h3>
                  <span className="text-xs text-navy-500 font-mono">
                    Updated live: <span className="text-emerald-500 font-bold">ONLINE</span>
                  </span>
                </div>

                {examDeliveries.length === 0 ? (
                  <div className="py-16 text-center text-navy-400 font-mono space-y-2">
                    <AlertCircle className="w-10 h-10 mx-auto text-navy-300 opacity-60" />
                    <p className="text-sm">No exam delivery records currently logged.</p>
                    <p className="text-xs text-navy-500">Predicted exams will log here automatically once requested by students.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {examDeliveries.map((d) => (
                      <div key={d.id} className="border border-navy-150 dark:border-navy-800 p-4 rounded-xl bg-navy-50/30 dark:bg-navy-950/20 space-y-3.5">
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-navy-100 dark:border-navy-800/50 pb-2 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-navy-900 dark:text-white">
                              {d.student_name}
                            </span>
                            <span className="text-[10px] bg-royal-100 dark:bg-royal-900/60 text-royal-700 dark:text-royal-300 px-2 py-0.5 rounded font-black uppercase">
                              ID: {d.student_id.substring(0, 8)}
                            </span>
                          </div>
                          <span className="text-navy-500 font-semibold">
                            {new Date(d.created_at || d.sent_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* S3 File Specs */}
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest font-mono">Secure S3 Object</h4>
                            <div className="text-xs font-bold text-navy-800 dark:text-white font-mono truncate">{d.year} CAPS Paper {d.paper_type.toUpperCase()}</div>
                            <div className="text-[10px] text-navy-500 font-mono">Signature: <span className="text-emerald-500 font-bold">{d.id.substring(0, 10).toUpperCase()}</span></div>
                            <a 
                              href={d.pdf_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10.5px] text-royal-600 hover:underline font-bold flex items-center gap-1 font-mono pt-1"
                            >
                              Open Watermarked PDF ↗
                            </a>
                          </div>

                          {/* Email Dispatch Info */}
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest font-mono">AWS SES Email Node</h4>
                            <div className="text-xs text-navy-800 dark:text-white font-mono break-all">{d.email_address}</div>
                            <div>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                                d.email_status === "sent" ? "bg-green-500/10 border-green-500/20 text-green-600" :
                                d.email_status === "simulated" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                d.email_status === "failed" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 animate-pulse"
                              }`}>
                                {d.email_status === "sent" ? "SES Sent" :
                                 d.email_status === "simulated" ? "Simulated Sent" :
                                 d.email_status === "failed" ? "SES Failed" :
                                 "Enqueued..."}
                              </span>
                            </div>
                          </div>

                          {/* WhatsApp Dispatch Info */}
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest font-mono">Meta WhatsApp Cloud</h4>
                            <div className="text-xs text-navy-800 dark:text-white font-mono">{d.whatsapp_number}</div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                                d.whatsapp_status === "sent" || d.whatsapp_status === "simulated" ? "bg-green-500/10 border-green-500/20 text-green-600" :
                                d.whatsapp_status === "failed" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 animate-pulse"
                              }`}>
                                {d.whatsapp_status === "sent" || d.whatsapp_status === "simulated" ? "Dispatched" :
                                 d.whatsapp_status === "failed" ? "Temporary Fail" :
                                 "Enqueued..."}
                              </span>
                              {d.whatsapp_status === "failed" && (
                                <span className="text-[9px] text-red-500 font-mono font-semibold">
                                  Attempt #{d.retry_count || 1}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions line */}
                        <div className="pt-2 border-t border-navy-100 dark:border-navy-800/40 flex justify-between items-center">
                          <div className="text-[10px] text-navy-400 font-mono">
                            Auto Retry Count: <span className="font-bold">{d.retry_count || 0}</span> / 3 Max
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRetryDelivery(d.id)}
                              className="px-3 py-1 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                            >
                              Force Retry Dispatch
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= OPERATIONAL HEALTH MONITORING ======================= */}
          {activeTab === "operational_health" && (
            <OperationalHealth />
          )}

          {/* ======================= SYSTEM AUDIT LOGS ======================= */}
          {activeTab === "system_audit_logs" && (
            <SystemAuditLogs user={user} />
          )}

          {/* ======================= CENTRALIZED LOGGING SERVICE ======================= */}
          {activeTab === "centralized_logging" && (
            <CentralizedLoggingDashboard user={user} />
          )}
      {/* ======================= ACADEMIC INTEGRITY MODAL ======================= */}
      {selectedIntegritySub && (() => {
        const student = (dbAPI.getAllProfiles() as Profile[]).find(p => p.id === selectedIntegritySub.student_id) || {
          first_name: "Student",
          surname: "Candidate",
          grade: "Grade 12 CAPS"
        } as Profile;
        const hw = assignments.find(a => a.id === selectedIntegritySub.assignment_id) || {
          title: "Maths Worksheet Solution",
          subject: "Mathematics CAPS Grade 12"
        } as HomeworkAssignment;
        const report = getIntegrityReport(selectedIntegritySub, student, hw);

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
                <XCircle className="w-5 h-5" />
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

        </main>

        {/* Create Zoom Meeting Modal */}
        <CreateZoomMeetingModal
          isOpen={isZoomModalOpen}
          onClose={() => {
            setIsZoomModalOpen(false);
            loadRecords();
          }}
          currentUser={user}
        />
      </div>
    </div>
  );
};
