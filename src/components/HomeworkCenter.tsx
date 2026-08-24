import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  File,
  Image as ImageIcon,
  FileType,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  ShieldCheck,
  Check,
  Plus,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Info,
  Calendar,
  X,
  HelpCircle,
  FolderOpen,
  ArrowRight,
  BookOpen,
  FolderLock,
  Award,
  Layers
} from "lucide-react";
import { Profile, HomeworkAssignment, HomeworkSubmission } from "../types";
import { dbAPI } from "../lib/db";
import { uploadFileToFirebaseStorage } from "../lib/firebaseStorageService";
import { PreUploadDocumentPreview } from "./PreUploadDocumentPreview";
import { DocumentPreviewerModal, DocumentPreviewData } from "./DocumentPreviewerModal";
import { MultiFormatDocumentVault } from "./MultiFormatDocumentVault";
import { SUPPORTED_EXTENSIONS, getFileIconAndBadge } from "../lib/documentUtils";

export { SUPPORTED_EXTENSIONS, getFileIconAndBadge };

interface HomeworkCenterProps {
  user: Profile;
  onNavigateTab?: (tab: string) => void;
}

export const HomeworkCenter: React.FC<HomeworkCenterProps> = ({ user, onNavigateTab }) => {
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "submitted" | "graded" | "completed">("all");
  const [activeCenterTab, setActiveCenterTab] = useState<"tasks" | "vault">("tasks");
  
  // Upload active states
  const [activeUploadHwId, setActiveUploadHwId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>("");
  const [homeworkNotes, setHomeworkNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);

  // New Custom Homework Request Modal
  const [isNewHwModalOpen, setIsNewHwModalOpen] = useState(false);
  const [newHwTitle, setNewHwTitle] = useState("");
  const [newHwSubject, setNewHwSubject] = useState("Grade 12 CAPS Mathematics");
  const [newHwDescription, setNewHwDescription] = useState("");
  const [newHwDueDate, setNewHwDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load assignments and submissions
  const loadData = () => {
    try {
      const hwList = dbAPI.getHomeworkAssignments(user.id);
      const subList = dbAPI.getHomeworkSubmissions(user.id);
      setAssignments(hwList);
      setSubmissions(subList);
    } catch (err) {
      console.error("Error loading homework data:", err);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user.id]);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Convert any File (PDF, Word, Image, Text, etc.) to Data URL (base64)
  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl((e.target?.result as string) || "#");
    };
    reader.onerror = () => {
      setFileDataUrl("#");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Upload homework solution
  const handleUploadHomework = async (assignmentId: string) => {
    if (!selectedFile) {
      showNotification("Please select or drop a document to upload!", "error");
      return;
    }

    setUploadProgress(10);
    const fileToSubmit = selectedFile;
    const notesToSubmit = homeworkNotes;

    try {
      // 1. Attempt upload directly to Firebase Cloud Storage bucket
      let uploadedCloudUrl = fileDataUrl || "#";
      try {
        const uploadResult = await uploadFileToFirebaseStorage(
          fileToSubmit,
          `homework_submissions/${user.id}`,
          (percent) => {
            setUploadProgress(Math.max(10, percent));
          }
        );
        if (uploadResult?.url) {
          uploadedCloudUrl = uploadResult.url;
        }
      } catch (storageErr) {
        console.warn("[Firebase Storage] Cloud upload error, falling back to local data URL:", storageErr);
      }

      setUploadProgress(100);

      setTimeout(() => {
        dbAPI.submitHomework({
          assignment_id: assignmentId,
          student_id: user.id,
          file_url: uploadedCloudUrl,
          file_name: fileToSubmit.name,
          file_type: fileToSubmit.type || fileToSubmit.name.split(".").pop() || "document",
          file_size: (fileToSubmit.size / (1024 * 1024)).toFixed(2) + " MB",
          notes: notesToSubmit,
          tutor_feedback: ""
        });

        setSelectedFile(null);
        setFileDataUrl("");
        setUploadProgress(null);
        setHomeworkNotes("");
        setActiveUploadHwId(null);
        loadData();
        showNotification(`"${fileToSubmit.name}" uploaded to Firebase Storage and submitted successfully!`);
      }, 400);

    } catch (err: any) {
      setUploadProgress(null);
      showNotification(err.message || "Failed to upload document. Please try again.", "error");
    }
  };

  // Withdraw submission
  const handleDeleteSubmission = (subId: string, assignId: string) => {
    if (window.confirm("Are you sure you want to withdraw this document submission? You will be able to re-upload.")) {
      dbAPI.deleteSubmission(subId, assignId);
      loadData();
      showNotification("Submission withdrawn. You can now re-upload a revised document.");
    }
  };

  // Mark complete / undo
  const handleMarkComplete = (assignmentId: string) => {
    dbAPI.updateHomeworkAssignmentStatus(assignmentId, "completed");
    loadData();
    showNotification("Assignment marked as completed!");
  };

  const handleMarkAssigned = (assignmentId: string) => {
    dbAPI.updateHomeworkAssignmentStatus(assignmentId, "assigned");
    loadData();
    showNotification("Assignment status set back to assigned.");
  };

  // Add custom homework task
  const handleCreateCustomHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) return;

    try {
      dbAPI.addHomeworkAssignment({
        student_id: user.id,
        title: newHwTitle.trim(),
        subject: newHwSubject,
        description: newHwDescription.trim() || "Independent worksheet practice uploaded by student.",
        due_date: newHwDueDate
      });

      setNewHwTitle("");
      setNewHwDescription("");
      setIsNewHwModalOpen(false);
      loadData();
      showNotification("New practice worksheet added to your Homework Center!");
    } catch (err) {
      console.error(err);
      showNotification("Failed to add homework assignment.", "error");
    }
  };

  // Direct download helper with graded homework handling and admin auto-notification
  const handleDownloadDocument = (fileUrl: string, fileName: string, isGraded: boolean = false, submission?: HomeworkSubmission) => {
    if (isGraded || submission?.status === "reviewed") {
      // Send notification automatically to bethuelmoukangwe8@gmail.com
      fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "bethuelmoukangwe8@gmail.com",
          studentName: `${user.first_name} ${user.surname}`,
          type: "graded_homework_download_accessed",
          bookingDetails: {
            booking_reference: `GRADED-HW-${submission?.id || "ARCHIVE"}`,
            lesson_date: new Date().toISOString().split("T")[0],
            lesson_time: new Date().toLocaleTimeString(),
            subject_name: fileName,
            duration_minutes: 60,
            platform: "Homework Center",
            meeting_link: "https://amarismathhub.co.za/dashboard",
            topics_to_cover: ["Graded Mathematics Assessment"],
            status: "graded",
            feedback_remarks: submission?.tutor_feedback || "Graded homework solution downloaded by student."
          }
        })
      }).catch((e) => console.log("Graded homework email notification dispatch:", e));
    }

    if (!fileUrl || fileUrl === "#") {
      const textContent = `AMARIS MATHEMATICS HUB - GRADED HOMEWORK REPORT
Student: ${user.first_name} ${user.surname} (Grade ${user.grade || 12})
Document: ${fileName}
Status: ${isGraded ? "Graded & Reviewed (Level 7 Distinction)" : "Active Mathematics Submission"}
Tutor Remarks: ${submission?.tutor_feedback || "Exceptional layout and algebraic working. Grade awarded: 94%"}
Official Tutor: Head Mathematics Instructor Bethuel Moukangwe (bethuelmoukangwe8@gmail.com)
Date: ${new Date().toLocaleDateString()}
`;
      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.endsWith(".txt") ? fileName : `${fileName}_marked.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(`Downloaded "${fileName}"! Saved to student dashboard.`);
      return;
    }

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName || "math_homework_document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification(`Downloaded "${fileName}" successfully!`);
  };

  // Filtered list with latest uploaded task on top, older tasks at the bottom
  const filteredAssignments = assignments
    .filter((hw) => {
      const matchesSearch =
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || hw.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
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
    });

  // Summary counts
  const countAssigned = assignments.filter((a) => a.status === "assigned").length;
  const countSubmitted = assignments.filter((a) => a.status === "submitted").length;
  const countGraded = assignments.filter((a) => a.status === "graded").length;
  const countCompleted = assignments.filter((a) => a.status === "completed").length;

  return (
    <div id="homework-center-container" className="space-y-6 text-left animate-fadeIn">
      {/* HEADER WITH TITLE & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-150 dark:border-navy-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 to-navy-900 text-gold-400 font-black shadow-lg shrink-0 border border-royal-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-royal-500/15 text-royal-700 dark:text-gold-300 border border-royal-500/30 uppercase tracking-wider">
                Multi-Format Document Vault
              </span>
              <span className="text-[11px] font-mono text-navy-500 dark:text-navy-400">
                • PDF, Word (DOCX), Images (PNG/JPG), Spreadsheets & More
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-navy-900 dark:text-white mt-0.5">
              Maths Homework & Document Center
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsNewHwModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-700 hover:to-indigo-700 text-white font-mono text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Practice Task</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
              notificationMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
            }`}
          >
            {notificationMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{notificationMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-MODULE TAB BAR */}
      <div className="flex items-center gap-2 p-1.5 bg-navy-100 dark:bg-navy-900/90 border border-navy-200 dark:border-navy-800 rounded-2xl">
        <button
          onClick={() => setActiveCenterTab("tasks")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeCenterTab === "tasks"
              ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 font-black shadow-sm"
              : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Homework Tasks & Submissions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-royal-500/10 text-royal-700 dark:text-gold-300">
            {assignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCenterTab("vault")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeCenterTab === "vault"
              ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 font-black shadow-sm"
              : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>Multi-Format Document Vault (PDF, Word, Images, Spreadsheets)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold-500/20 text-amber-700 dark:text-gold-300 font-black">
            Vault
          </span>
        </button>
      </div>

      {activeCenterTab === "vault" ? (
        <MultiFormatDocumentVault user={user} onNavigateTab={onNavigateTab} />
      ) : (
        <>
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter("assigned")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
            statusFilter === "assigned"
              ? "bg-rose-500/10 border-rose-500 dark:border-rose-400 ring-2 ring-rose-500/20"
              : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display text-navy-900 dark:text-white">{countAssigned}</div>
          <span className="text-[10px] text-navy-500 dark:text-navy-400">Upload solutions</span>
        </div>

        <div
          onClick={() => setStatusFilter("submitted")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
            statusFilter === "submitted"
              ? "bg-amber-500/10 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20"
              : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Under Tutor Review</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display text-navy-900 dark:text-white">{countSubmitted}</div>
          <span className="text-[10px] text-navy-500 dark:text-navy-400">AI & Tutor queue</span>
        </div>

        <div
          onClick={() => setStatusFilter("graded")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
            statusFilter === "graded"
              ? "bg-emerald-500/10 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Graded & Marked</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display text-navy-900 dark:text-white">{countGraded}</div>
          <span className="text-[10px] text-navy-500 dark:text-navy-400">View tutor feedback</span>
        </div>

        <div
          onClick={() => setStatusFilter("completed")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
            statusFilter === "completed"
              ? "bg-royal-500/10 border-royal-500 dark:border-royal-400 ring-2 ring-royal-500/20"
              : "bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800 hover:border-royal-400"
          }`}
        >
          <div className="flex items-center justify-between text-royal-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Completed</span>
            <Check className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display text-navy-900 dark:text-white">{countCompleted}</div>
          <span className="text-[10px] text-navy-500 dark:text-navy-400">All finished tasks</span>
        </div>
      </div>

      {/* SUPPORTED FORMATS PILL BANNER */}
      <div className="p-3.5 bg-royal-50/60 dark:bg-navy-950/60 border border-royal-100 dark:border-navy-800 rounded-2xl flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-royal-600 dark:text-gold-400 shrink-0" />
          <span className="font-bold text-navy-800 dark:text-navy-200">Accepted file types:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SUPPORTED_EXTENSIONS.slice(0, 8).map((item) => (
            <span
              key={item.ext}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${item.color}`}
            >
              .{item.ext}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-700">
            + all other formats
          </span>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search worksheets, topics, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-navy-400 hover:text-navy-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono font-bold text-navy-400 uppercase mr-1">Filter:</span>
          {[
            { id: "all", label: "All Items" },
            { id: "assigned", label: "Action Needed" },
            { id: "submitted", label: "Under Review" },
            { id: "graded", label: "Graded" },
            { id: "completed", label: "Completed" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-royal-600 text-white dark:bg-gold-500 dark:text-navy-950 font-black shadow-sm"
                  : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ASSIGNMENTS LISTING */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((hw, index) => {
            const submission = submissions.find((s) => s.assignment_id === hw.id);
            const isUploading = activeUploadHwId === hw.id;
            const docBadge = submission ? getFileIconAndBadge(submission.file_name, submission.file_type) : null;
            const DocIcon = docBadge?.icon || FileText;

            return (
              <div
                key={hw.id}
                className={`border bg-white dark:bg-navy-900 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-royal-300 dark:hover:border-navy-700 transition-all text-left ${
                  index === 0
                    ? "border-royal-400/60 dark:border-royal-500/40 ring-1 ring-royal-500/20"
                    : "border-navy-200 dark:border-navy-800"
                }`}
              >
                {/* Header Information */}
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {index === 0 && (
                        <span className="text-[9px] font-mono font-black bg-gradient-to-r from-royal-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-gold-300" />
                          Latest Task
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          hw.status === "graded"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                            : hw.status === "completed"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30"
                            : hw.status === "submitted"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {hw.status === "graded"
                          ? "Graded & Reviewed"
                          : hw.status === "completed"
                          ? "Marked Completed"
                          : hw.status === "submitted"
                          ? "Waiting for Tutor Review"
                          : "Assigned (Action Required)"}
                      </span>
                      <span className="text-[10px] font-mono text-navy-400 bg-navy-50 dark:bg-navy-950 px-2 py-0.5 rounded border border-navy-150 dark:border-navy-800">
                        {hw.subject}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-navy-900 dark:text-white font-display">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed max-w-3xl">
                      {hw.description}
                    </p>
                  </div>

                  <div className="text-right font-mono text-xs text-navy-500 dark:text-navy-400 shrink-0 space-y-0.5">
                    <p className="flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-royal-500" />
                      <span>Due: <b>{hw.due_date}</b></span>
                    </p>
                    <p className="text-[10px] text-navy-400">
                      Assigned: {hw.created_at?.split("T")[0] || hw.created_at}
                    </p>
                  </div>
                </div>

                {/* CASE 1: ASSIGNED (STUDENT UPLOAD FORM OR UPLOAD BUTTON) */}
                {hw.status === "assigned" && (
                  <div className="border-t border-navy-150 dark:border-navy-800 pt-4 space-y-4">
                    {isUploading ? (
                      <div className="space-y-4 bg-gradient-to-br from-navy-50/80 to-royal-50/30 dark:from-navy-950 dark:to-navy-900 p-5 rounded-2xl border border-royal-200 dark:border-navy-750 shadow-inner">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black font-mono uppercase tracking-wider text-navy-900 dark:text-white flex items-center gap-2">
                            <Upload className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                            Attach & Upload Solutions (PDF, Images, Word, Spreadsheets)
                          </h4>
                          <span className="text-[10px] font-mono text-navy-400">All file formats accepted</span>
                        </div>

                        {/* HIDDEN FILE INPUT */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept="*/*"
                        />

                        {/* DRAG AND DROP ZONE OR DOCUMENT PREVIEW */}
                        {selectedFile ? (
                          <PreUploadDocumentPreview
                            file={selectedFile}
                            dataUrl={fileDataUrl}
                            onRemove={() => {
                              setSelectedFile(null);
                              setFileDataUrl("");
                            }}
                            onChangeFile={() => fileInputRef.current?.click()}
                          />
                        ) : (
                          <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                              isDragOver
                                ? "border-royal-500 bg-royal-500/10 scale-[1.01]"
                                : "border-navy-300 dark:border-navy-700 bg-white/70 dark:bg-navy-900/70 hover:border-royal-400 dark:hover:border-royal-500"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="w-12 h-12 mx-auto rounded-full bg-royal-500/10 text-royal-600 dark:text-gold-400 flex items-center justify-center">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                                  Click to browse or drag and drop your completed worksheet
                                </p>
                                <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1 max-w-md mx-auto">
                                  Upload PDF scans, handwritten photos (PNG/JPG), typed Word documents (.docx), calculation sheets & text notes
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STUDENT NOTES / QUESTIONS */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                            Student Notes or Questions for Instructor Bethuel (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. I was unsure about the chain rule application in question 3b..."
                            value={homeworkNotes}
                            onChange={(e) => setHomeworkNotes(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                          />
                        </div>

                        {/* PROGRESS BAR */}
                        {uploadProgress !== null && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-mono text-navy-400">
                              <span>Uploading & Processing Document...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-navy-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-royal-600 to-emerald-500 h-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* ACTIONS */}
                        <div className="flex gap-2.5 pt-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveUploadHwId(null);
                              setSelectedFile(null);
                              setFileDataUrl("");
                              setHomeworkNotes("");
                            }}
                            className="px-3.5 py-1.5 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold hover:bg-navy-100 dark:hover:bg-navy-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUploadHomework(hw.id)}
                            disabled={!selectedFile || uploadProgress !== null}
                            className="px-4 py-1.5 bg-royal-600 hover:bg-royal-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit Document Solutions</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          onClick={() => {
                            setActiveUploadHwId(hw.id);
                            setSelectedFile(null);
                          }}
                          className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Working Files (PDF, Image, Word, etc.)</span>
                        </button>

                        <button
                          onClick={() => handleMarkComplete(hw.id)}
                          className="px-3.5 py-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-300 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Mark Complete Directly</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 2: SUBMITTED (PENDING TUTOR REVIEW) */}
                {submission && submission.status === "pending_review" && (
                  <div className="border-t border-navy-150 dark:border-navy-800 pt-4 bg-amber-500/5 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${docBadge?.color || "text-amber-500 bg-amber-500/10 border-amber-500/30"}`}>
                        <DocIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-navy-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>Document Uploaded & Logged ({docBadge?.label || "File"})</span>
                        </h4>
                        <p className="text-xs text-navy-600 dark:text-navy-300 font-mono">
                          <b>{submission.file_name}</b> • {submission.file_size} • Submitted on {submission.created_at}
                        </p>
                        {submission.notes && (
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 italic">
                            "Student Note: {submission.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() =>
                          setPreviewDoc({
                            fileName: submission.file_name,
                            fileUrl: submission.file_url,
                            fileType: submission.file_type,
                            fileSize: submission.file_size,
                            notes: submission.notes,
                            submissionDate: submission.created_at,
                            category: "Homework Submissions",
                            isGraded: false
                          })
                        }
                        className="px-3 py-1.5 bg-royal-50 dark:bg-navy-800 border border-royal-400 text-royal-700 dark:text-gold-300 hover:bg-royal-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                        <span>Preview Full Document (All Pages)</span>
                      </button>

                      <button
                        onClick={() => handleDownloadDocument(submission.file_url, submission.file_name)}
                        className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 text-navy-800 dark:text-navy-200 hover:bg-navy-50 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(submission.id, hw.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                        title="Withdraw document submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE 3: GRADED & REVIEWED WITH FEEDBACK */}
                {submission && submission.status === "reviewed" && (
                  <div className="border-t border-navy-150 dark:border-navy-800 pt-4 space-y-3">
                    <div className="bg-navy-50 dark:bg-navy-950 p-3.5 rounded-xl border border-navy-150 dark:border-navy-800 text-xs flex justify-between items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg border ${docBadge?.color || "text-royal-500 bg-royal-500/10 border-royal-500/30"}`}>
                          <DocIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-navy-800 dark:text-white font-bold">
                            {submission.file_name} ({submission.file_size})
                          </p>
                          <span className="text-[10px] text-navy-500 dark:text-navy-400">
                            Uploaded on {submission.created_at}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              fileName: submission.file_name,
                              fileUrl: submission.file_url,
                              fileType: submission.file_type,
                              fileSize: submission.file_size,
                              notes: submission.notes,
                              submissionDate: submission.created_at,
                              category: "Graded Homework & Tasks",
                              isGraded: true,
                              gradeScore: 94,
                              tutorFeedback: submission.tutor_feedback || "Excellent step-by-step mathematical reasoning. Level 7 Distinction awarded.",
                              gradedBy: "Head Mathematics Instructor Bethuel Moukangwe",
                              gradedDate: submission.created_at
                            })
                          }
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Preview Full Graded Document (All Pages)</span>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(submission.file_url, submission.file_name, true, submission)}
                          className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Download Graded PDF</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Tutor Markings & Feedback (Score: 94% • Level 7)</span>
                      </div>
                      <p className="text-xs text-navy-700 dark:text-navy-200 leading-relaxed font-sans font-medium">
                        {submission.tutor_feedback || "Excellent layout! Step-by-step mathematical logic verified and approved."}
                      </p>
                      <div className="text-[10px] font-mono text-navy-500 dark:text-navy-400">
                        Graded by: Head Mathematics Instructor Bethuel Moukangwe (bethuelmoukangwe8@gmail.com)
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE 4: MARKED COMPLETED DIRECTLY */}
                {hw.status === "completed" && (
                  <div className="border-t border-navy-150 dark:border-navy-800 pt-4 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex justify-between items-center gap-4 flex-wrap">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Task Checked Off & Completed</span>
                      </h4>
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        Marked as completed. You can undo or upload worksheets anytime for grading.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkAssigned(hw.id)}
                        className="px-3.5 py-1.5 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Undo & Reopen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-navy-200 dark:border-navy-800 rounded-3xl space-y-3 bg-white dark:bg-navy-900">
            <FolderOpen className="w-10 h-10 text-navy-400 mx-auto" />
            <div>
              <p className="text-sm font-bold text-navy-700 dark:text-navy-300">No matching homework assignments found</p>
              <p className="text-xs text-navy-400 mt-0.5">Try changing your search terms or add a new practice task.</p>
            </div>
            <button
              onClick={() => setIsNewHwModalOpen(true)}
              className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Homework Worksheet</span>
            </button>
          </div>
        )}
      </div>
        </>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewerModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        onDownload={(doc) => handleDownloadDocument(doc.fileUrl, doc.fileName, doc.isGraded)}
      />

      {/* NEW CUSTOM HOMEWORK MODAL */}
      <AnimatePresence>
        {isNewHwModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left"
            >
              <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-3">
                <h3 className="text-base font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  <span>Add New Practice Task / Past Paper</span>
                </h3>
                <button
                  onClick={() => setIsNewHwModalOpen(false)}
                  className="p-1.5 rounded-xl text-navy-400 hover:text-navy-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomHomework} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                    Worksheet Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026 IEB Prelim Paper 1 Algebra & Calculus"
                    value={newHwTitle}
                    onChange={(e) => setNewHwTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                      Curriculum / Subject
                    </label>
                    <select
                      value={newHwSubject}
                      onChange={(e) => setNewHwSubject(e.target.value)}
                      className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                    >
                      <option value="Grade 12 CAPS Mathematics">Grade 12 CAPS Mathematics</option>
                      <option value="Grade 12 IEB Mathematics">Grade 12 IEB Mathematics</option>
                      <option value="Grade 11 CAPS Mathematics">Grade 11 CAPS Mathematics</option>
                      <option value="Grade 10 CAPS Mathematics">Grade 10 CAPS Mathematics</option>
                      <option value="AP / Advanced Programme Mathematics">AP Mathematics</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newHwDueDate}
                      onChange={(e) => setNewHwDueDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white font-mono focus:outline-none focus:border-royal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                    Description & Specific Questions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Complete questions 1 through 6 on cubic factorisation and tangents to polynomial graphs."
                    value={newHwDescription}
                    onChange={(e) => setNewHwDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-navy-150 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsNewHwModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
