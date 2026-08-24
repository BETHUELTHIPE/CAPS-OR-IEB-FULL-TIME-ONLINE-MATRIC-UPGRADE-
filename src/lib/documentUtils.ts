import {
  FileText,
  FileType,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File,
  LucideIcon
} from "lucide-react";

export interface SupportedExtension {
  ext: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

// Supported document type descriptors for badges and icons
export const SUPPORTED_EXTENSIONS: SupportedExtension[] = [
  { ext: "pdf", label: "PDF Document", icon: FileText, color: "text-red-500 bg-red-500/10 border-red-500/30" },
  { ext: "docx", label: "Word Document", icon: FileType, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  { ext: "doc", label: "Word Document", icon: FileType, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  { ext: "png", label: "PNG Image", icon: ImageIcon, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  { ext: "jpg", label: "JPEG Image", icon: ImageIcon, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { ext: "jpeg", label: "JPEG Image", icon: ImageIcon, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { ext: "webp", label: "WebP Image", icon: ImageIcon, color: "text-teal-500 bg-teal-500/10 border-teal-500/30" },
  { ext: "xlsx", label: "Excel Spreadsheet", icon: FileSpreadsheet, color: "text-green-600 bg-green-500/10 border-green-500/30" },
  { ext: "xls", label: "Excel Spreadsheet", icon: FileSpreadsheet, color: "text-green-600 bg-green-500/10 border-green-500/30" },
  { ext: "csv", label: "CSV Data", icon: FileSpreadsheet, color: "text-green-500 bg-green-500/10 border-green-500/30" },
  { ext: "pptx", label: "PowerPoint", icon: FileText, color: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
  { ext: "txt", label: "Plain Text", icon: FileCode, color: "text-slate-500 bg-slate-500/10 border-slate-500/30" },
  { ext: "tex", label: "LaTeX Document", icon: FileCode, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
  { ext: "py", label: "Python Script", icon: FileCode, color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30" },
  { ext: "zip", label: "Archive (ZIP)", icon: FileArchive, color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
];

export const getFileIconAndBadge = (fileName: string, mimeType?: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";
  const match = SUPPORTED_EXTENSIONS.find((item) => item.ext === ext);

  if (match) {
    return match;
  }

  if (mimeType?.startsWith("image/")) {
    return { ext: ext || "IMG", label: "Image File", icon: ImageIcon, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" };
  }
  if (mimeType?.includes("pdf")) {
    return { ext: "PDF", label: "PDF Document", icon: FileText, color: "text-red-500 bg-red-500/10 border-red-500/30" };
  }
  if (mimeType?.includes("word") || mimeType?.includes("officedocument.word")) {
    return { ext: "DOCX", label: "Word Document", icon: FileType, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
  }

  return { ext: ext.toUpperCase() || "DOC", label: "Document", icon: File, color: "text-royal-500 bg-royal-500/10 border-royal-500/30" };
};
