import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Image as ImageIcon,
  FileType,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
  Eye,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Maximize2,
  X,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileCheck
} from "lucide-react";
import { getFileIconAndBadge } from "../lib/documentUtils";

interface PreUploadDocumentPreviewProps {
  file: File;
  dataUrl: string;
  onRemove: () => void;
  onChangeFile: () => void;
}

export const PreUploadDocumentPreview: React.FC<PreUploadDocumentPreviewProps> = ({
  file,
  dataUrl,
  onRemove,
  onChangeFile
}) => {
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  const isImage = file.type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(fileExt);
  const isPdf = file.type.includes("pdf") || fileExt === "pdf";
  const isWord = file.type.includes("word") || ["doc", "docx"].includes(fileExt);
  const isSpreadsheet = file.type.includes("sheet") || file.type.includes("csv") || ["xlsx", "xls", "csv"].includes(fileExt);

  const badgeInfo = getFileIconAndBadge(file.name, file.type);
  const IconComponent = badgeInfo.icon;

  const fileSizeFormatted =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

  const lastModifiedFormatted = new Date(file.lastModified).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* HEADER BAR FOR PREVIEW */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-navy-150 dark:border-navy-800">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-500" />
          <span className="font-mono font-bold uppercase tracking-wider text-navy-800 dark:text-navy-200">
            Document Pre-Submission Preview
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Attached & Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onChangeFile}
            className="text-[11px] font-mono text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Replace File</span>
          </button>
          <span className="text-navy-300 dark:text-navy-700">•</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] font-mono text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* MAIN PREVIEW CONTAINER */}
      <div className="p-4 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl shadow-sm flex flex-col md:flex-row gap-5 items-stretch">
        
        {/* LEFT COLUMN: THUMBNAIL / FORMAT VISUALIZER */}
        <div className="w-full md:w-56 shrink-0 flex flex-col items-center justify-center relative rounded-xl overflow-hidden bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-800 p-2 min-h-[160px] group">
          {isImage && dataUrl && dataUrl !== "#" ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden min-h-[140px]">
              <motion.img
                src={dataUrl}
                alt={file.name}
                className="max-h-36 max-w-full object-contain rounded-lg shadow-sm transition-transform duration-200"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoomLevel})`
                }}
              />
              
              {/* IMAGE CONTROLS OVERLAY */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent p-2 flex items-center justify-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="p-1.5 rounded-lg bg-navy-900/90 text-white hover:bg-royal-600 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 rounded-lg bg-navy-900/90 text-white hover:bg-royal-600 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg bg-navy-900/90 text-white hover:bg-royal-600 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  title="Fullscreen Preview"
                  className="p-1.5 rounded-lg bg-royal-600 text-white hover:bg-royal-700 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : isPdf ? (
            /* PDF DOCUMENT THUMBNAIL MOCKUP */
            <div className="w-full flex flex-col items-center justify-center py-4 px-3 text-center space-y-2 relative">
              <div className="w-16 h-20 bg-white dark:bg-navy-900 rounded-lg border-2 border-red-500/40 shadow-md p-2 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-red-600 font-mono">PDF</span>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div className="space-y-1 my-auto">
                  <div className="w-full h-1 bg-red-200 dark:bg-red-950 rounded" />
                  <div className="w-3/4 h-1 bg-navy-200 dark:bg-navy-800 rounded" />
                  <div className="w-full h-1 bg-navy-200 dark:bg-navy-800 rounded" />
                  <div className="w-1/2 h-1 bg-navy-200 dark:bg-navy-800 rounded" />
                </div>
                <span className="text-[7px] text-navy-400 font-mono self-end">CAPS</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                PDF Worksheet
              </span>
            </div>
          ) : isWord ? (
            /* WORD DOCUMENT THUMBNAIL MOCKUP */
            <div className="w-full flex flex-col items-center justify-center py-4 px-3 text-center space-y-2 relative">
              <div className="w-16 h-20 bg-white dark:bg-navy-900 rounded-lg border-2 border-blue-500/40 shadow-md p-2 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-blue-600 font-mono">DOCX</span>
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="space-y-1 my-auto">
                  <div className="w-full h-1 bg-blue-200 dark:bg-blue-950 rounded" />
                  <div className="w-full h-1 bg-navy-200 dark:bg-navy-800 rounded" />
                  <div className="w-4/5 h-1 bg-navy-200 dark:bg-navy-800 rounded" />
                  <div className="w-2/3 h-1 bg-navy-200 dark:bg-navy-800 rounded" />
                </div>
                <span className="text-[7px] text-navy-400 font-mono self-end">Word</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Word Document
              </span>
            </div>
          ) : isSpreadsheet ? (
            /* SPREADSHEET THUMBNAIL MOCKUP */
            <div className="w-full flex flex-col items-center justify-center py-4 px-3 text-center space-y-2 relative">
              <div className="w-16 h-20 bg-white dark:bg-navy-900 rounded-lg border-2 border-green-500/40 shadow-md p-2 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-green-600 font-mono">XLSX</span>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-1 my-auto">
                  <div className="h-2 bg-green-100 dark:bg-green-950 rounded text-[6px]" />
                  <div className="h-2 bg-green-200 dark:bg-green-900 rounded text-[6px]" />
                  <div className="h-2 bg-navy-100 dark:bg-navy-800 rounded text-[6px]" />
                  <div className="h-2 bg-navy-100 dark:bg-navy-800 rounded text-[6px]" />
                </div>
                <span className="text-[7px] text-navy-400 font-mono self-end">Data</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                Calculation Sheet
              </span>
            </div>
          ) : (
            /* GENERIC FILE THUMBNAIL */
            <div className="w-full flex flex-col items-center justify-center py-4 px-3 text-center space-y-2">
              <div className={`p-4 rounded-2xl border ${badgeInfo.color}`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-navy-500">
                .{fileExt || "doc"}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DOCUMENT DETAILS & METADATA */}
        <div className="flex-1 flex flex-col justify-between space-y-3 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black border ${badgeInfo.color}`}>
                {badgeInfo.label}
              </span>
              <span className="text-[10px] font-mono text-navy-400 bg-navy-50 dark:bg-navy-950 px-2 py-0.5 rounded border border-navy-150 dark:border-navy-800">
                {fileSizeFormatted}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Validated for Submission
              </span>
            </div>

            <h4 className="text-sm font-extrabold text-navy-900 dark:text-white font-mono break-all line-clamp-2">
              {file.name}
            </h4>

            {/* METADATA GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-navy-500 dark:text-navy-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-royal-500" />
                <span>MIME: <b className="text-navy-700 dark:text-navy-200">{file.type || `application/${fileExt}`}</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-royal-500" />
                <span>Modified: <b className="text-navy-700 dark:text-navy-200">{lastModifiedFormatted}</b></span>
              </div>
            </div>
          </div>

          {/* INSPECT ACTION BUTTON */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFullscreenModalOpen(true)}
              className="px-3 py-1.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-800 dark:text-navy-200 border border-navy-200 dark:border-navy-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
              <span>Inspect Document Preview</span>
            </button>
            <span className="text-[10px] text-navy-400 italic">
              Click to verify legibility of your handwritten steps or proofs
            </span>
          </div>
        </div>
      </div>

      {/* FULLSCREEN INSPECT LIGHTBOX MODAL */}
      <AnimatePresence>
        {isFullscreenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-750 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative text-left"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${badgeInfo.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 dark:text-white truncate max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-[10px] font-mono text-navy-400">
                      {badgeInfo.label} • {fileSizeFormatted}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(false)}
                  className="p-1.5 rounded-xl text-navy-400 hover:text-navy-600 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[65vh] overflow-auto rounded-2xl bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-800 p-4 flex flex-col items-center justify-center min-h-[250px]">
                {isImage && dataUrl && dataUrl !== "#" ? (
                  <div className="space-y-4 flex flex-col items-center justify-center">
                    <img
                      src={dataUrl}
                      alt={file.name}
                      className="max-h-[50vh] w-auto rounded-xl object-contain shadow-lg"
                      style={{
                        transform: `rotate(${rotation}deg)`
                      }}
                    />
                    <div className="flex items-center gap-2 bg-white dark:bg-navy-900 px-3 py-1.5 rounded-xl border border-navy-200 dark:border-navy-800 shadow-sm text-xs font-mono">
                      <button
                        type="button"
                        onClick={handleRotate}
                        className="px-2 py-1 rounded bg-navy-100 dark:bg-navy-800 hover:bg-royal-600 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Rotate 90°</span>
                      </button>
                      <span className="text-navy-400">Rotation: {rotation}°</span>
                    </div>
                  </div>
                ) : isPdf ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy-900 dark:text-white">PDF Document Ready for Submission</h4>
                      <p className="text-xs text-navy-500 dark:text-navy-400 mt-1 max-w-md mx-auto">
                        Your multi-page PDF document has been validated and encoded for transmission to Tutor Bethuel Moukangwe.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-navy-900 rounded-xl border border-navy-200 dark:border-navy-800 max-w-sm mx-auto text-left text-[11px] font-mono text-navy-600 dark:text-navy-300 space-y-1">
                      <p>• File Size: <b>{fileSizeFormatted}</b></p>
                      <p>• File Extension: <b>.pdf</b></p>
                      <p>• Ready for annotation and grading.</p>
                    </div>
                  </div>
                ) : isWord ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                      <FileType className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy-900 dark:text-white">Microsoft Word Document (.docx)</h4>
                      <p className="text-xs text-navy-500 dark:text-navy-400 mt-1 max-w-md mx-auto">
                        Your typed solutions or mathematical proofs are loaded and ready for submission.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-navy-900 rounded-xl border border-navy-200 dark:border-navy-800 max-w-sm mx-auto text-left text-[11px] font-mono text-navy-600 dark:text-navy-300 space-y-1">
                      <p>• File Size: <b>{fileSizeFormatted}</b></p>
                      <p>• File Extension: <b>.{fileExt}</b></p>
                      <p>• Formatted Word document.</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center ${badgeInfo.color}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy-900 dark:text-white">{badgeInfo.label}</h4>
                      <p className="text-xs text-navy-500 dark:text-navy-400 mt-1 max-w-md mx-auto">
                        Document formatted as <b>.{fileExt}</b> ({fileSizeFormatted}). Ready for upload.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-navy-150 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(false)}
                  className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Looks Good, Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
