import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  FileText, 
  User, 
  Calendar, 
  Layers, 
  Cpu, 
  Lock, 
  Unlock, 
  Tag, 
  ShieldCheck, 
  Hash, 
  Check, 
  Sparkles,
  Zap,
  HardDrive
} from "lucide-react";
import { PDFTechnicalMetadata } from "../services/pdfMetadataService";

export interface PDFMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: PDFTechnicalMetadata | null;
}

export const PDFMetadataModal: React.FC<PDFMetadataModalProps> = ({
  isOpen,
  onClose,
  metadata
}) => {
  const [copiedHash, setCopiedHash] = React.useState(false);

  if (!isOpen || !metadata) return null;

  const handleCopyHash = () => {
    if (metadata?.sha256_hash) {
      navigator.clipboard.writeText(metadata.sha256_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-navy-950 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-gold-500 text-navy-950 rounded-xl shadow-md">
                <FileText className="w-5 h-5 font-black" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Technical PDF Metadata
                </h3>
                <p className="text-[11px] font-mono text-navy-300 truncate max-w-xs">
                  {metadata.file_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-navy-800 text-navy-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono">
            {/* Document Verification Banner */}
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  Verified Technical Extraction
                </span>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-sans leading-normal">
                  PDF structure, page trees, fonts, author attributes, and binary checksum successfully extracted.
                </p>
              </div>
            </div>

            {/* Basic Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-navy-50/80 dark:bg-navy-900/60 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1">
                <div className="flex items-center gap-1.5 text-navy-400 text-[10px] uppercase tracking-wider font-bold">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>Author / Institution</span>
                </div>
                <p className="text-navy-900 dark:text-white font-bold leading-snug">
                  {metadata.author}
                </p>
              </div>

              <div className="p-3 bg-navy-50/80 dark:bg-navy-900/60 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1">
                <div className="flex items-center gap-1.5 text-navy-400 text-[10px] uppercase tracking-wider font-bold">
                  <Layers className="w-3.5 h-3.5 text-royal-500" />
                  <span>Total Pages & Format</span>
                </div>
                <p className="text-navy-900 dark:text-white font-bold">
                  {metadata.total_pages} Pages • {metadata.paper_format}
                </p>
              </div>

              <div className="p-3 bg-navy-50/80 dark:bg-navy-900/60 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1">
                <div className="flex items-center gap-1.5 text-navy-400 text-[10px] uppercase tracking-wider font-bold">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Creation Timestamp</span>
                </div>
                <p className="text-navy-900 dark:text-white font-bold">
                  {formatDate(metadata.creation_date)}
                </p>
              </div>

              <div className="p-3 bg-navy-50/80 dark:bg-navy-900/60 rounded-xl border border-navy-150 dark:border-navy-800 space-y-1">
                <div className="flex items-center gap-1.5 text-navy-400 text-[10px] uppercase tracking-wider font-bold">
                  <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                  <span>File Size & Specification</span>
                </div>
                <p className="text-navy-900 dark:text-white font-bold">
                  {metadata.file_size} • {metadata.pdf_version}
                </p>
              </div>
            </div>

            {/* Software Creator & Producer Specs */}
            <div className="space-y-2 border-t border-navy-150 dark:border-navy-850 pt-4">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-royal-600 dark:text-gold-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-royal-500" />
                <span>PDF Generation Engine & Software</span>
              </h4>
              <div className="p-3 bg-navy-950 text-navy-100 rounded-xl border border-navy-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-navy-400">Creator Application:</span>
                  <span className="font-bold text-amber-400">{metadata.creator}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] border-t border-navy-850 pt-1.5">
                  <span className="text-navy-400">PDF Producer:</span>
                  <span className="font-bold text-navy-200">{metadata.producer}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] border-t border-navy-850 pt-1.5">
                  <span className="text-navy-400">Color Profile:</span>
                  <span className="font-bold text-emerald-400">{metadata.color_space}</span>
                </div>
              </div>
            </div>

            {/* Security & Fast Web View Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-navy-50/80 dark:bg-navy-900/60 rounded-xl border border-navy-150 dark:border-navy-800 flex items-center gap-2">
                {metadata.encrypted ? (
                  <Lock className="w-4 h-4 text-red-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-emerald-500" />
                )}
                <div>
                  <span className="text-[10px] text-navy-400 uppercase tracking-wider font-bold block">
                    Encryption
                  </span>
                  <span className="text-xs font-bold text-navy-900 dark:text-white">
                    {metadata.encrypted ? "Password Protected" : "None (Unlocked)"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-navy-50/80 dark:bg-navy-900/60 rounded-xl border border-navy-150 dark:border-navy-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-[10px] text-navy-400 uppercase tracking-wider font-bold block">
                    Fast Web View
                  </span>
                  <span className="text-xs font-bold text-navy-900 dark:text-white">
                    {metadata.linearized ? "Enabled (Linearized)" : "Standard"}
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded Font Subsets */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-navy-700 dark:text-navy-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Embedded Font Subsets ({metadata.font_subsets.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {metadata.font_subsets.map((font, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-navy-200 rounded-lg text-[10px] font-mono border border-navy-200 dark:border-navy-800 font-bold"
                  >
                    {font}
                  </span>
                ))}
              </div>
            </div>

            {/* SHA-256 Checksum Hash */}
            <div className="space-y-1 border-t border-navy-150 dark:border-navy-850 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-navy-500 dark:text-navy-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-royal-500" /> SHA-256 Binary Hash
                </span>
                <button
                  onClick={handleCopyHash}
                  className="px-2 py-0.5 bg-royal-500/10 hover:bg-royal-500/20 text-royal-600 dark:text-royal-300 rounded font-bold transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-500" /> : null}
                  <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
                </button>
              </div>
              <div className="p-2.5 bg-navy-950 text-gold-400 font-mono text-[10px] rounded-xl border border-navy-800 break-all select-all">
                {metadata.sha256_hash}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-navy-900 text-white border-t border-navy-800 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-navy-400">
              Amaris PDF Technical Metadata Service v1.2
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-black rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
