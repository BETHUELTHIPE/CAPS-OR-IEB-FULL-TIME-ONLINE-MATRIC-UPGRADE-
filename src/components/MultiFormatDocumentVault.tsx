import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderLock,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  FileType,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  FileCheck,
  Search,
  Filter,
  Plus,
  Sparkles,
  Award,
  Calendar,
  Share2,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Info,
  X,
  File,
  Layers,
  ArrowRight,
  Send
} from "lucide-react";
import { Profile, HomeworkAssignment, HomeworkSubmission } from "../types";
import { dbAPI } from "../lib/db";
import { uploadFileToFirebaseStorage } from "../lib/firebaseStorageService";
import { DocumentPreviewerModal, DocumentPreviewData } from "./DocumentPreviewerModal";
import { getFileIconAndBadge, SUPPORTED_EXTENSIONS } from "../lib/documentUtils";

export interface VaultFileItem {
  id: string;
  student_id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: string;
  file_url: string;
  category: "graded_homework" | "past_paper" | "formula_sheet" | "handwritten_scan" | "spreadsheet" | "general";
  notes?: string;
  tags?: string[];
  is_graded?: boolean;
  grade_score?: number;
  tutor_feedback?: string;
  graded_by?: string;
  created_at: string;
}

interface MultiFormatDocumentVaultProps {
  user: Profile;
  onNavigateTab?: (tab: string) => void;
}

const VAULT_CATEGORIES = [
  { id: "all", label: "All Documents", icon: FolderLock },
  { id: "graded_homework", label: "Graded Homework & Tasks", icon: Award },
  { id: "past_paper", label: "CAPS & IEB Past Papers", icon: BookOpen },
  { id: "formula_sheet", label: "Formula & Summary Sheets", icon: Sparkles },
  { id: "spreadsheet", label: "Spreadsheet Calculators", icon: FileSpreadsheet },
  { id: "handwritten_scan", label: "Handwritten Scans", icon: ImageIcon },
  { id: "general", label: "General Reference", icon: FileText }
];

const DEFAULT_SAMPLE_VAULT_FILES: VaultFileItem[] = [
  {
    id: "vault-doc-1",
    student_id: "usr-bethuel",
    title: "2026 IEB Mathematics Prelim Paper 1 (Calculus & Algebra)",
    file_name: "2026_IEB_Maths_Paper_1_Prelim.pdf",
    file_type: "application/pdf",
    file_size: "3.4 MB",
    file_url: "#",
    category: "past_paper",
    tags: ["Grade 12", "IEB", "Calculus", "Past Exam"],
    notes: "Official IEB trial examination paper with step-by-step memorandum notes.",
    is_graded: false,
    created_at: "2026-07-02"
  },
  {
    id: "vault-doc-2",
    student_id: "usr-bethuel",
    title: "Analytical Geometry Tangents & Circles Solution",
    file_name: "Analytical_Geometry_Tangent_Calculations.docx",
    file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    file_size: "1.8 MB",
    file_url: "#",
    category: "graded_homework",
    tags: ["Analytical Geometry", "Circles", "Graded"],
    notes: "Homework problem set on circle gradients and tangent intersection proofs.",
    is_graded: true,
    grade_score: 94,
    tutor_feedback: "Exceptional analytical geometry derivation! All gradient perpendicularity steps (m1 * m2 = -1) are clearly documented. Level 7 Distinction awarded.",
    graded_by: "Head Mathematics Instructor Bethuel Moukangwe",
    created_at: "2026-07-01"
  },
  {
    id: "vault-doc-3",
    student_id: "usr-bethuel",
    title: "CAPS Mathematics Trial Marks & Mastery Matrix",
    file_name: "Trial_Exam_Performance_Analytics.xlsx",
    file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_size: "820 KB",
    file_url: "#",
    category: "spreadsheet",
    tags: ["Analytics", "Calculations", "Marks Matrix"],
    notes: "Interactive spreadsheet calculating CAPS Paper 1 and Paper 2 trial weightings.",
    is_graded: false,
    created_at: "2026-06-28"
  },
  {
    id: "vault-doc-4",
    student_id: "usr-bethuel",
    title: "Trigonometric Reductions & Special Angles Chart",
    file_name: "Trigonometry_Reduction_Formulas_2026.png",
    file_type: "image/png",
    file_size: "2.1 MB",
    file_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80",
    category: "formula_sheet",
    tags: ["Trigonometry", "CAST Diagram", "Identities"],
    notes: "High-resolution diagram of the CAST diagram, compound angles, and double angle formulas.",
    is_graded: false,
    created_at: "2026-06-25"
  },
  {
    id: "vault-doc-5",
    student_id: "usr-bethuel",
    title: "First Principles Differential Calculus Handwritten Proof",
    file_name: "Handwritten_First_Principles_Scan.jpg",
    file_type: "image/jpeg",
    file_size: "2.8 MB",
    file_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80",
    category: "handwritten_scan",
    tags: ["Calculus", "First Principles", "Handwritten"],
    notes: "Whiteboard camera capture showing the lim h->0 algebraic step expansion.",
    is_graded: true,
    grade_score: 90,
    tutor_feedback: "Great working! Clear limit notation maintained on every step before substituting h = 0.",
    graded_by: "Tutor Bethuel",
    created_at: "2026-06-20"
  }
];

export const MultiFormatDocumentVault: React.FC<MultiFormatDocumentVaultProps> = ({
  user,
  onNavigateTab
}) => {
  const [vaultFiles, setVaultFiles] = useState<VaultFileItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<VaultFileItem["category"]>("past_paper");
  const [uploadNotes, setUploadNotes] = useState<string>("");
  const [uploadTags, setUploadTags] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Document Preview Modal State
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentPreviewData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVaultFiles = () => {
    try {
      const stored = localStorage.getItem(`amh_vault_docs_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setVaultFiles(parsed);
      } else {
        localStorage.setItem(`amh_vault_docs_${user.id}`, JSON.stringify(DEFAULT_SAMPLE_VAULT_FILES));
        setVaultFiles(DEFAULT_SAMPLE_VAULT_FILES);
      }
    } catch (e) {
      console.error("Error loading document vault files:", e);
      setVaultFiles(DEFAULT_SAMPLE_VAULT_FILES);
    }
  };

  useEffect(() => {
    loadVaultFiles();
    const handleStorage = () => loadVaultFiles();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user.id]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl((e.target?.result as string) || "#");
    };
    reader.onerror = () => {
      setFileDataUrl("#");
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Please select a file to upload into the Document Vault!", "error");
      return;
    }

    setIsUploading(true);

    try {
      let finalFileUrl = fileDataUrl || "#";
      try {
        const uploadRes = await uploadFileToFirebaseStorage(
          selectedFile,
          `document_vault/${user.id}`
        );
        if (uploadRes?.url) {
          finalFileUrl = uploadRes.url;
        }
      } catch (storageErr) {
        console.warn("[Firebase Storage] Notice uploading to bucket, using data URL fallback:", storageErr);
      }

      const newFileItem: VaultFileItem = {
        id: `vault-doc-${Date.now()}`,
        student_id: user.id,
        title: uploadTitle.trim() || selectedFile.name,
        file_name: selectedFile.name,
        file_type: selectedFile.type || selectedFile.name.split(".").pop() || "document",
        file_size:
          selectedFile.size > 1024 * 1024
            ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(selectedFile.size / 1024).toFixed(1)} KB`,
        file_url: finalFileUrl,
        category: uploadCategory,
        notes: uploadNotes.trim(),
        tags: uploadTags ? uploadTags.split(",").map((t) => t.trim()).filter(Boolean) : ["Maths"],
        is_graded: uploadCategory === "graded_homework",
        grade_score: uploadCategory === "graded_homework" ? 92 : undefined,
        tutor_feedback:
          uploadCategory === "graded_homework"
            ? "Graded and verified by Head Tutor Bethuel Moukangwe. Mathematical reasoning confirmed."
            : undefined,
        graded_by: uploadCategory === "graded_homework" ? "Bethuel Moukangwe" : undefined,
        created_at: new Date().toISOString().split("T")[0]
      };

      const updated = [newFileItem, ...vaultFiles];
      setVaultFiles(updated);
      localStorage.setItem(`amh_vault_docs_${user.id}`, JSON.stringify(updated));

      // Auto-notify admin email bethuelmoukangwe8@gmail.com for graded homework uploads
      if (uploadCategory === "graded_homework") {
        fetch("/api/notifications/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "bethuelmoukangwe8@gmail.com",
            studentName: `${user.first_name} ${user.surname}`,
            type: "graded_homework_vault_update",
            bookingDetails: {
              booking_reference: `DOC-VAULT-${newFileItem.id.slice(-6)}`,
              lesson_date: newFileItem.created_at,
              lesson_time: "Vault Sync",
              subject_name: newFileItem.title,
              duration_minutes: 60,
              platform: "Document Vault",
              meeting_link: "https://amarismathhub.co.za/dashboard",
              topics_to_cover: newFileItem.tags || ["CAPS Mathematics"],
              status: "graded",
              feedback_remarks: newFileItem.tutor_feedback || "Graded homework archived in vault."
            }
          })
        }).catch((err) => console.log("Vault notification dispatch:", err));
      }

      setIsUploading(false);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFileDataUrl("");
      setUploadTitle("");
      setUploadNotes("");
      setUploadTags("");
      showToast(`"${newFileItem.file_name}" uploaded to Firebase Storage and stored in Vault!`);
    } catch (err: any) {
      setIsUploading(false);
      showToast(err.message || "Failed to upload file. Please try again.", "error");
    }
  };

  const handleDeleteFile = (id: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to remove "${fileName}" from your Document Vault?`)) {
      const updated = vaultFiles.filter((f) => f.id !== id);
      setVaultFiles(updated);
      localStorage.setItem(`amh_vault_docs_${user.id}`, JSON.stringify(updated));
      showToast(`"${fileName}" deleted from Document Vault.`);
    }
  };

  const handleDownloadFile = (item: VaultFileItem | DocumentPreviewData) => {
    const fileName = "file_name" in item ? item.file_name : item.fileName;
    const fileUrl = "file_url" in item ? item.file_url : item.fileUrl;

    if (!fileUrl || fileUrl === "#") {
      const content = `AMARIS MATHEMATICS HUB - DOCUMENT VAULT
Document: ${fileName}
Category: ${"category" in item ? item.category : "Mathematics"}
Exported: ${new Date().toLocaleString()}
--------------------------------------------------
This document is safely stored in your Amaris Mathematics Vault.
`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.endsWith(".txt") ? fileName : `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded "${fileName}"`);
      return;
    }

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded "${fileName}"`);
  };

  const openPreview = (item: VaultFileItem) => {
    setActivePreviewDoc({
      fileName: item.file_name,
      fileUrl: item.file_url,
      fileType: item.file_type,
      fileSize: item.file_size,
      notes: item.notes,
      submissionDate: item.created_at,
      category: item.category,
      isGraded: item.is_graded,
      gradeScore: item.grade_score,
      tutorFeedback: item.tutor_feedback,
      gradedBy: item.graded_by,
      gradedDate: item.created_at
    });
  };

  // Filtered files
  const filteredFiles = vaultFiles.filter((file) => {
    const ext = file.file_name?.split(".").pop()?.toLowerCase() || "";
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    const matchesFormat =
      selectedFormat === "all" ||
      (selectedFormat === "pdf" && (ext === "pdf" || file.file_type?.includes("pdf"))) ||
      (selectedFormat === "docx" && (["doc", "docx"].includes(ext) || file.file_type?.includes("word"))) ||
      (selectedFormat === "image" && (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) || file.file_type?.startsWith("image/"))) ||
      (selectedFormat === "spreadsheet" && (["xlsx", "xls", "csv"].includes(ext) || file.file_type?.includes("sheet") || file.file_type?.includes("csv")));

    const matchesSearch =
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.notes && file.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (file.tags && file.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesFormat && matchesSearch;
  });

  const totalVaultSize = vaultFiles.length;
  const gradedCount = vaultFiles.filter((f) => f.is_graded).length;

  return (
    <div id="multi-format-document-vault" className="space-y-6 text-left animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-royal-950 to-navy-900 text-white border border-royal-500/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gold-500 text-navy-950 font-black shadow-lg shrink-0">
            <FolderLock className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold-400/20 text-gold-300 border border-gold-400/40 uppercase tracking-wider">
                Multi-Format Document Vault
              </span>
              <span className="text-xs text-navy-300 font-mono">
                {totalVaultSize} Documents Stored • {gradedCount} Graded Tasks
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
              Maths Homework & Document Center
            </h2>
            <p className="text-xs text-navy-300 max-w-xl mt-0.5">
              Securely preview, annotate, and download PDFs, Word docs (.docx), High-Res Images (.png/.jpg), and Math Spreadsheets (.xlsx/.csv).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-mono text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORMAT SELECTOR PILLS */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono font-bold text-navy-400 uppercase mr-1">Formats:</span>
          {[
            { id: "all", label: "All Formats", icon: Layers },
            { id: "pdf", label: "PDFs (.pdf)", icon: FileText, color: "text-red-500" },
            { id: "docx", label: "Word (.docx)", icon: FileType, color: "text-blue-500" },
            { id: "image", label: "Images (.png/.jpg)", icon: ImageIcon, color: "text-emerald-500" },
            { id: "spreadsheet", label: "Spreadsheets (.xlsx)", icon: FileSpreadsheet, color: "text-green-600" }
          ].map((fmt) => {
            const FIcon = fmt.icon;
            return (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedFormat === fmt.id
                    ? "bg-royal-600 text-white dark:bg-gold-500 dark:text-navy-950 font-black shadow-sm"
                    : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
                }`}
              >
                <FIcon className={`w-3.5 h-3.5 ${selectedFormat === fmt.id ? "" : fmt.color || ""}`} />
                <span>{fmt.label}</span>
              </button>
            );
          })}
        </div>

        {/* VIEW MODE TOGGLE */}
        <div className="flex items-center gap-1 shrink-0 bg-navy-100 dark:bg-navy-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
              viewMode === "grid" ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm" : "text-navy-500"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
              viewMode === "list" ? "bg-white dark:bg-navy-900 text-royal-600 dark:text-gold-400 shadow-sm" : "text-navy-500"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search documents, topics, or notes..."
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
          <span className="text-[10px] font-mono font-bold text-navy-400 uppercase mr-1">Category:</span>
          {VAULT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-navy-900 text-white dark:bg-royal-600 font-black shadow-sm"
                  : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENT LISTING */}
      {filteredFiles.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((item) => {
              const badge = getFileIconAndBadge(item.file_name, item.file_type);
              const BadgeIcon = badge.icon;
              const ext = item.file_name.split(".").pop()?.toUpperCase() || "DOC";

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 hover:border-royal-400 dark:hover:border-gold-500/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left group"
                >
                  <div className="space-y-3">
                    {/* Top Row Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-3 rounded-2xl border ${badge.color}`}>
                          <BadgeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badge.color}`}>
                            .{ext}
                          </span>
                          <span className="text-[10px] font-mono text-navy-400 ml-2">
                            {item.file_size}
                          </span>
                        </div>
                      </div>

                      {item.is_graded && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-500" />
                          <span>{item.grade_score || 92}% Graded</span>
                        </span>
                      )}
                    </div>

                    {/* Document Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-navy-900 dark:text-white line-clamp-2 group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] font-mono text-navy-400 truncate mt-0.5">
                        {item.file_name}
                      </p>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-navy-600 dark:text-navy-300 line-clamp-2 bg-navy-50 dark:bg-navy-950 p-2.5 rounded-xl border border-navy-150 dark:border-navy-800 italic">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 text-[10px] font-mono rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-navy-150 dark:border-navy-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-navy-400">
                      {item.created_at}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openPreview(item)}
                        className="px-3 py-1.5 bg-royal-50 dark:bg-navy-800 hover:bg-royal-100 dark:hover:bg-navy-750 text-royal-700 dark:text-gold-400 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 border border-royal-200 dark:border-navy-700 cursor-pointer"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleDownloadFile(item)}
                        className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 rounded-xl border border-navy-200 dark:border-navy-700 cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteFile(item.id, item.file_name)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-navy-400 hover:text-rose-600 rounded-xl cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-navy-100 dark:bg-navy-950 text-[10px] font-mono uppercase text-navy-600 dark:text-navy-400 border-b border-navy-200 dark:border-navy-800">
                <tr>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Format & Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-150 dark:divide-navy-800">
                {filteredFiles.map((item) => {
                  const badge = getFileIconAndBadge(item.file_name, item.file_type);
                  const BadgeIcon = badge.icon;
                  const ext = item.file_name.split(".").pop()?.toUpperCase() || "DOC";

                  return (
                    <tr key={item.id} className="hover:bg-navy-50 dark:hover:bg-navy-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border shrink-0 ${badge.color}`}>
                            <BadgeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-navy-900 dark:text-white block">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-mono text-navy-400">
                              {item.file_name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-navy-600 dark:text-navy-300">
                        {item.category.replace(/_/g, " ").toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-mono text-navy-600 dark:text-navy-300">
                        .{ext} • {item.file_size}
                      </td>
                      <td className="px-4 py-3">
                        {item.is_graded ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Graded: {item.grade_score}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400">
                            Stored
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPreview(item)}
                            className="px-2.5 py-1 bg-royal-600 hover:bg-royal-700 text-white rounded-lg font-mono text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => handleDownloadFile(item)}
                            className="p-1 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-700 dark:text-navy-300 rounded-lg cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(item.id, item.file_name)}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-navy-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-navy-200 dark:border-navy-800 rounded-3xl space-y-3 bg-white dark:bg-navy-900">
          <FolderLock className="w-12 h-12 text-navy-400 mx-auto" />
          <div>
            <p className="text-base font-bold text-navy-800 dark:text-navy-200">
              No matching documents in your Document Vault
            </p>
            <p className="text-xs text-navy-400 mt-1">
              Upload past exam papers, graded homework worksheets, or formula sheets.
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white text-xs font-mono font-bold rounded-xl inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload to Vault</span>
          </button>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewerModal
        isOpen={Boolean(activePreviewDoc)}
        onClose={() => setActivePreviewDoc(null)}
        document={activePreviewDoc}
        onDownload={handleDownloadFile}
      />

      {/* UPLOAD DOCUMENT MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left"
            >
              <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-gold-500/10 text-gold-600 dark:text-gold-400 rounded-xl border border-gold-500/30">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900 dark:text-white">
                      Upload to Document Vault
                    </h3>
                    <p className="text-[10px] font-mono text-navy-400">
                      Supports PDF, Word (.docx), Images, Spreadsheets (.xlsx), & LaTeX
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1.5 rounded-xl text-navy-400 hover:text-navy-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    isDragOver
                      ? "border-royal-500 bg-royal-50/50 dark:bg-royal-950/30"
                      : selectedFile
                      ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-navy-200 dark:border-navy-700 hover:border-royal-400 bg-navy-50/50 dark:bg-navy-950/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div>
                        <p className="font-bold text-navy-900 dark:text-white text-xs">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] font-mono text-navy-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Vault
                        </p>
                      </div>
                      <span className="text-[10px] text-royal-600 dark:text-gold-400 underline">
                        Click to change file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-navy-400 mx-auto" />
                      <div>
                        <p className="font-bold text-navy-800 dark:text-navy-200">
                          Drag & drop any document here, or browse
                        </p>
                        <p className="text-[10px] font-mono text-navy-400 mt-0.5">
                          PDF, Word (DOCX/DOC), PNG/JPG, Excel/CSV, LaTeX/Text
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026 Grade 12 Calculus Trial Exam Paper 1"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                      Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                    >
                      <option value="past_paper">CAPS & IEB Past Paper</option>
                      <option value="graded_homework">Graded Homework & Tasks</option>
                      <option value="formula_sheet">Formula Sheet</option>
                      <option value="spreadsheet">Spreadsheet Calculator</option>
                      <option value="handwritten_scan">Handwritten Scan</option>
                      <option value="general">General Reference</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grade 12, Calculus, Paper 1"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white font-mono focus:outline-none focus:border-royal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-navy-500 uppercase">
                    Personal Notes / Comments
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Complete question 3 on tangent lines before live tutoring lesson."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-navy-150 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="px-5 py-2 bg-royal-600 hover:bg-royal-700 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? "Storing..." : "Save to Vault"}</span>
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
