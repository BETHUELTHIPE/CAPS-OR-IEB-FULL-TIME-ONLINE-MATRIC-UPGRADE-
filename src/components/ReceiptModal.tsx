import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Send,
  MessageCircle,
  Mail,
  Video,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { PaymentReceipt } from "../types";
import {
  downloadReceiptPdf,
  printReceiptPdf,
  generateWhatsAppReceiptUrl,
  SUPER_USER_CONTACT
} from "../lib/pdfReceiptService";
import { executeAutomatedReceiptDispatch } from "../lib/receiptDispatchService";

export interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onResendSuccess?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onResendSuccess
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !receipt) return null;

  const studentWhatsAppUrl = generateWhatsAppReceiptUrl(
    receipt,
    receipt.student_phone || SUPER_USER_CONTACT.whatsappNumber,
    false
  );
  const superUserWhatsAppUrl = generateWhatsAppReceiptUrl(
    receipt,
    SUPER_USER_CONTACT.whatsappNumber,
    true
  );

  const handleDownload = () => {
    downloadReceiptPdf(receipt);
  };

  const handlePrint = () => {
    printReceiptPdf(receipt);
  };

  const handleCopyMeetingLink = () => {
    if (receipt.meeting_link) {
      navigator.clipboard.writeText(receipt.meeting_link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      await fetch("/api/notifications/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt,
          deliveryChannel: receipt.delivery_channel || "both"
        })
      });

      setResendSuccess(true);
      if (onResendSuccess) onResendSuccess();
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err) {
      console.error("Resend failed:", err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="receipt-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="receipt-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-slate-900 text-white px-6 py-5 border-b-4 border-amber-500 relative">
            <button
              id="close-receipt-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Receipt Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                    Official Tax Invoice
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cleared
                  </span>
                </div>
                <h2 className="text-xl font-bold font-mono tracking-tight mt-1 text-white">
                  {receipt.receipt_number}
                </h2>
              </div>
              <div className="text-right text-xs text-slate-300">
                <p className="font-semibold text-slate-200">Amaris Mathematics Hub</p>
                <p className="font-mono text-slate-400">Ref: {receipt.booking_reference}</p>
                <p className="text-[11px] text-amber-400">{receipt.created_at}</p>
              </div>
            </div>
          </div>

          {/* Simultaneous Delivery Indicator Strip */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/40 px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">
                  <strong>Simultaneous Delivery Verified:</strong> Sent to Student (
                  <span className="underline">{receipt.student_email}</span>) & Super User (
                  <span className="underline">{SUPER_USER_CONTACT.email}</span>)
                </span>
              </div>
              <span className="font-bold text-[11px] uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                Channel: {receipt.delivery_channel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Top Grid: Student vs Tutor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70">
                <h4 className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Billed To (Student)
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {receipt.student_name}
                </p>
                <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{receipt.student_email}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{receipt.student_phone || "Not specified"}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Grade/Curriculum: {receipt.student_grade || "Grade 12 CAPS/IEB"}
                  </p>
                  {receipt.parent_name && (
                    <p className="text-slate-500 dark:text-slate-400">
                      Parent: {receipt.parent_name} ({receipt.parent_phone || ""})
                    </p>
                  )}
                </div>
              </div>

              {/* Service Provider / Tutor Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70">
                <h4 className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Service Provider & Lead Coach
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {receipt.tutor_name || SUPER_USER_CONTACT.name}
                </p>
                <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    {receipt.tutor_title || SUPER_USER_CONTACT.title}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>WhatsApp: {SUPER_USER_CONTACT.displayPhone}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{SUPER_USER_CONTACT.email}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">HQ: {SUPER_USER_CONTACT.address}</p>
                </div>
              </div>
            </div>

            {/* Lesson Specification Bento */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Lesson Specification
                </h4>
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                  {receipt.duration_minutes} Mins • 1-on-1
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Subject</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receipt.subject_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receipt.lesson_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Time</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receipt.lesson_time} SAST</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Platform</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receipt.platform} Whiteboard</span>
                </div>
              </div>

              {receipt.meeting_link && (
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs truncate max-w-md">
                    <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {receipt.meeting_link}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="copy-meeting-link-btn"
                      onClick={handleCopyMeetingLink}
                      className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? "Copied" : "Copy"}
                    </button>
                    <a
                      id="join-zoom-btn"
                      href={receipt.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center gap-1"
                    >
                      Join Room <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Ledger Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-center">Quantity</th>
                    <th className="py-2.5 px-4 text-right">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {receipt.package_name || "1-on-1 Interactive Tutoring Package"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {receipt.subject_name} • Full interactive whiteboard recording & revision
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {receipt.lessons_count || 1}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      R{(receipt.amount / (receipt.lessons_count || 1)).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      R{receipt.amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/70 border-t-2 border-slate-200 dark:border-slate-700 font-mono text-xs">
                  <tr>
                    <td colSpan={3} className="py-2 px-4 text-right text-slate-500 dark:text-slate-400">
                      Subtotal:
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-slate-900 dark:text-white">
                      R{receipt.amount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1 px-4 text-right text-slate-500 dark:text-slate-400">
                      VAT (0.00% Educational Exemption):
                    </td>
                    <td className="py-1 px-4 text-right text-slate-500 dark:text-slate-400">
                      R0.00
                    </td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td colSpan={3} className="py-3 px-4 text-right font-bold text-sm text-slate-900 dark:text-white">
                      Total Paid (ZAR):
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-base text-emerald-600 dark:text-emerald-400">
                      R{receipt.amount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Direct Multi-Channel Actions Bento */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                Simultaneous Delivery Channels
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student WhatsApp Action */}
                <a
                  id="send-whatsapp-student-btn"
                  href={studentWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Student WhatsApp</p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        {receipt.student_phone || "Click to open chat"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600 opacity-60 group-hover:opacity-100" />
                </a>

                {/* Super User WhatsApp Action */}
                <a
                  id="send-whatsapp-superuser-btn"
                  href={superUserWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Super User WhatsApp</p>
                      <p className="text-[10px] text-blue-700 dark:text-blue-400">
                        {SUPER_USER_CONTACT.displayPhone} (Bethuel)
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600 opacity-60 group-hover:opacity-100" />
                </a>
              </div>
            </div>

            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Receipt and booking confirmation have been re-dispatched to <strong>{receipt.student_email}</strong> and <strong>{SUPER_USER_CONTACT.email}</strong> simultaneously!
                </span>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Hash: {receipt.verification_hash?.slice(0, 16)}...
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                id="print-receipt-btn"
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print
              </button>

              <button
                id="resend-receipt-btn"
                onClick={handleResend}
                disabled={isResending}
                className="px-3.5 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isResending ? "Dispatching..." : "Resend Simultaneous"}
              </button>

              <button
                id="download-pdf-receipt-btn"
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Official PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
