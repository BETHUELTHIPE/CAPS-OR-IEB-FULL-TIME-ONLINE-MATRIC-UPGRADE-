import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Download,
  Save,
  Check,
  Shield,
  Brain,
  Database,
  Server,
  Code,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Cpu,
  Mail,
  Zap,
  Globe,
  Terminal,
  Activity,
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  ChevronRight,
  HelpCircle,
  Lock,
  Flame,
  Clock,
  BarChart3
} from "lucide-react";
import { Profile } from "../types";

export interface SystemDocumentationProps {
  user: Profile | null;
}

export const SystemDocumentation: React.FC<SystemDocumentationProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<string>("all");
  const [savedToAdmin, setSavedToAdmin] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Trigger print dialog pre-configured for PDF export
  const handlePrintPDF = () => {
    window.print();
  };

  // Save PDF Document Record to Admin Local Storage & System Activity Log
  const handleSaveToAdminDashboard = () => {
    setSaving(true);
    setTimeout(() => {
      try {
        const docRecord = {
          id: "doc-manual-" + Date.now(),
          title: "Amaris Mathematics Hub — Complete System & Operations Manual (PDF)",
          version: "3.6.0-PROD",
          generated_by: user?.first_name ? `${user.first_name} ${user.surname}` : "Super Admin",
          created_at: new Date().toISOString(),
          file_size: "1.4 MB",
          download_url: "#",
          category: "Technical Documentation"
        };

        const existing = JSON.parse(localStorage.getItem("amh_admin_documents") || "[]");
        localStorage.setItem("amh_admin_documents", JSON.stringify([docRecord, ...existing]));

        // Log to activity log
        const logs = JSON.parse(localStorage.getItem("amh_activity_logs") || "[]");
        logs.unshift({
          id: "log-" + Date.now(),
          user_name: user?.first_name || "Super Admin",
          action: "Saved System Documentation PDF",
          details: "Saved official system documentation PDF copy to Admin Storage & Ledger",
          type: "system",
          created_at: new Date().toISOString()
        });
        localStorage.setItem("amh_activity_logs", JSON.stringify(logs));

        setSavedToAdmin(true);
        setTimeout(() => setSavedToAdmin(false), 4000);
      } catch (err) {
        console.error("Error saving document to admin dashboard:", err);
      } finally {
        setSaving(false);
      }
    }, 600);
  };

  const copySnippet = (snippet: string, key: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* PRINT-ONLY CSS HEADER INJECTION */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .page-break {
            page-break-before: always;
          }
          .shadow-xl, .shadow-2xl, .shadow-md {
            box-shadow: none !important;
          }
          .border-navy-800, .border-navy-750 {
            border-color: #cbd5e1 !important;
          }
          .bg-navy-900, .bg-navy-950 {
            background-color: #f8fafc !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* ACTION BAR (NO PRINT) */}
      <div className="no-print bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-royal-600 via-royal-700 to-navy-950 text-gold-400 shadow-lg shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 uppercase">
                Official Admin Manual v3.6.0
              </span>
              <span className="text-xs font-mono text-navy-400 font-semibold">• Super Admin Console</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-navy-900 dark:text-white">
              Platform & Architecture Documentation
            </h2>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Complete technical specification, CAPS/IEB syllabus workflows, Gemini AI integration, database schemas, and administrative control center procedures.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleSaveToAdminDashboard}
            disabled={saving}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              savedToAdmin
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-200 border-navy-200 dark:border-navy-750 hover:border-gold-500"
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
                <span>Saving Document...</span>
              </>
            ) : savedToAdmin ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Saved to Admin Dashboard!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                <span>Save to Admin Storage</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Documentation</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTATION CONTENT CONTAINER */}
      <div id="pdf-doc-content" className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 md:p-10 shadow-xl space-y-10 text-navy-900 dark:text-navy-100">
        
        {/* DOCUMENT HEADER COVER */}
        <div className="border-b-2 border-gold-500/40 pb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-royal-600 dark:text-gold-400 uppercase tracking-widest">
                <span>Amaris Mathematics Hub (AMH)</span>
                <span>•</span>
                <span>Technical Operations Manual</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display text-navy-900 dark:text-white mt-1">
                System Specification & Developer Manual
              </h1>
            </div>
            <div className="text-right text-xs font-mono text-navy-500 dark:text-navy-400 space-y-0.5">
              <div>Version: <span className="font-bold text-navy-900 dark:text-white">3.6.0-PROD</span></div>
              <div>Published: <span className="font-bold text-navy-900 dark:text-white">August 2026</span></div>
              <div>Syllabus: <span className="font-bold text-gold-600 dark:text-gold-400">NSC CAPS & IEB Grade 10-12</span></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-100 dark:border-navy-850 flex items-center justify-between text-xs text-navy-700 dark:text-navy-300">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Classification: <strong className="text-navy-900 dark:text-white">Confidential Operations & System Manual</strong></span>
            </div>
            <div>Authorized User: <strong className="text-royal-600 dark:text-gold-400">{user?.first_name ? `${user.first_name} ${user.surname} (Super Admin)` : "Super Admin Console"}</strong></div>
          </div>
        </div>

        {/* SECTION 1: EXECUTIVE OVERVIEW */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-black font-display text-navy-900 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-2">
            <div className="p-2 rounded-xl bg-royal-500/10 text-royal-600 dark:text-royal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>1. Executive Overview & Academic Scope</span>
          </div>

          <p className="text-sm leading-relaxed text-navy-700 dark:text-navy-200">
            <strong>Amaris Mathematics Hub (AMH)</strong> is a premium, full-stack online learning and virtual tutoring platform engineered specifically for South African high school students (Grades 10–12) taking <strong>NSC (CAPS)</strong> and <strong>IEB</strong> Mathematics. Founded and directed by Lead Instructor <strong>Bethuel Moukangwe (BSc Mathematics)</strong>, the platform bridges classroom learning with real-time AI assistance, 1-on-1 virtual whiteboard tutoring, and structured exam preparation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-150 dark:border-navy-800 space-y-1.5">
              <div className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase">Core Objective</div>
              <div className="text-sm font-bold text-navy-900 dark:text-white">Level 7 Distinction Rate</div>
              <p className="text-xs text-navy-600 dark:text-navy-400">Empowering students to achieve 80%+ (Level 7) in final Matric trial examinations.</p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-150 dark:border-navy-800 space-y-1.5">
              <div className="text-xs font-mono font-bold text-royal-600 dark:text-royal-400 uppercase">Syllabus Coverage</div>
              <div className="text-sm font-bold text-navy-900 dark:text-white">CAPS & IEB Curricula</div>
              <p className="text-xs text-navy-600 dark:text-navy-400">Comprehensive coverage across Algebra, Differential Calculus, Trigonometric Proofs & Geometry.</p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-150 dark:border-navy-800 space-y-1.5">
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">AI Infrastructure</div>
              <div className="text-sm font-bold text-navy-900 dark:text-white">Gemini 3.6 Flash Engine</div>
              <p className="text-xs text-navy-600 dark:text-navy-400">Server-side proxy powering 24/7 tutor assistance and end-of-week performance digests.</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: SYSTEM ARCHITECTURE & TECH STACK */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-black font-display text-navy-900 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-2">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span>2. System Architecture & Technical Stack</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-navy-900 dark:text-white">2.1 Technology Overview</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-navy-150 dark:border-navy-800 rounded-xl overflow-hidden">
                <thead className="bg-navy-100 dark:bg-navy-950 font-mono text-navy-800 dark:text-navy-200 uppercase">
                  <tr>
                    <th className="p-3 border-b border-navy-200 dark:border-navy-800">Layer</th>
                    <th className="p-3 border-b border-navy-200 dark:border-navy-800">Framework / Technology</th>
                    <th className="p-3 border-b border-navy-200 dark:border-navy-800">Purpose & Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  <tr>
                    <td className="p-3 font-bold font-mono text-royal-600 dark:text-gold-400">Frontend UI</td>
                    <td className="p-3">React 18 + Vite + TypeScript</td>
                    <td className="p-3">Single-page web application with reactive state rendering</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold font-mono text-royal-600 dark:text-gold-400">Styling & Theme</td>
                    <td className="p-3">Tailwind CSS + Motion (Framer)</td>
                    <td className="p-3">High-contrast Navy/Gold premium palette with fluid micro-interactions</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold font-mono text-royal-600 dark:text-gold-400">Backend Runtime</td>
                    <td className="p-3">Express (Node.js) on Port 3000</td>
                    <td className="p-3">Bundled CommonJS server (`dist/server.cjs`) handling API proxies & SMTP</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold font-mono text-royal-600 dark:text-gold-400">AI Intelligence</td>
                    <td className="p-3">@google/genai SDK (Gemini 3.6 Flash)</td>
                    <td className="p-3">Server-side prompt completion for AskTutor, Quizzes, and Weekly Insights</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold font-mono text-royal-600 dark:text-gold-400">Database Engine</td>
                    <td className="p-3">Firebase Firestore + localStorage DB</td>
                    <td className="p-3">Cloud data persistence for profiles, bookings, quiz scores & pomodoro logs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold font-mono text-royal-600 dark:text-gold-400">Email Gateway</td>
                    <td className="p-3">Nodemailer SMTP Transporter</td>
                    <td className="p-3">Transactional dispatch for lesson confirmations, weekly digests & reminders</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 3: STUDENT PLATFORM CAPABILITIES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-black font-display text-navy-900 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <span>3. Major Student Capabilities & AI Features</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-150 dark:border-navy-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>AskTutor AI & Voice Synthesis</span>
              </div>
              <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                24/7 intelligent math solver supporting step-by-step CAPS/IEB explanations, practice problem generation, LaTeX rendering, and multi-speed Voice Text-to-Speech (0.75x slow math cadence to 1.5x fast overview).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-150 dark:border-navy-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
                <BarChart3 className="w-4 h-4 text-royal-500" />
                <span>Weekly Insights Generator</span>
              </div>
              <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                Gemini-powered end-of-week progress digest. Aggregates quiz accuracy, Pomodoro focus time, and module completion progress from Firestore to generate personalized encouraging summaries and action items.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-150 dark:border-navy-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Collaborative Virtual Whiteboard</span>
              </div>
              <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                Interactive canvas simulator with brush size controls, geometric shape tools (Line, Rectangle, Circle), vector eraser, undo/redo state stacks, and step-by-step scan uploads.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-50 dark:bg-navy-950/60 border border-navy-150 dark:border-navy-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Gamification & Streaks</span>
              </div>
              <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                Daily streak retention engine, XP milestone trackers, unlockable achievement badges, and global student leaderboards tracking CAPS trial mock exam performance.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: SUPER ADMIN CONTROL CENTER */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-black font-display text-navy-900 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <span>4. Super Admin & Operations Control Center</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-navy-700 dark:text-navy-200 leading-relaxed">
              The Super Admin Console provides operational governance across financial revenue, tutor bookings, homework integrity grading, resource library management, and infrastructure monitoring:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-navy-800 dark:text-navy-200">
              <li className="flex items-start gap-2 p-3 rounded-xl bg-navy-50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Revenue Analytics & PayFast Audit</strong>: Live ZAR transaction tracking, automated ledger exports, and payment status verification.</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-navy-50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Booking & Google Meet Integration</strong>: Confirming student lessons, automatically issuing Google Meet virtual room links, and managing cancellation slots.</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-navy-50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Tutor Weekly Availability Grid</strong>: Weekly interactive schedule matrix enabling tutors to open/block time slots with real-time student notification alerts.</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-navy-50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Resource Naming & Standardization</strong>: Bulk renaming PDF study files according to CAPS/IEB naming patterns with embedded technical metadata extraction.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 5: DATABASE SCHEMA & PERSISTENCE */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-black font-display text-navy-900 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <span>5. Database Schemas & Persistence Reference</span>
          </div>

          <p className="text-xs text-navy-700 dark:text-navy-200">
            Amaris Mathematics Hub uses standard client-side <code>localStorage</code> synchronization keys along with Firebase Firestore cloud collections:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-navy-150 dark:border-navy-800 rounded-xl overflow-hidden">
              <thead className="bg-navy-100 dark:bg-navy-950 font-mono text-navy-800 dark:text-navy-200 uppercase">
                <tr>
                  <th className="p-3 border-b border-navy-200 dark:border-navy-800">Storage Key / Collection</th>
                  <th className="p-3 border-b border-navy-200 dark:border-navy-800">Data Type / Interface</th>
                  <th className="p-3 border-b border-navy-200 dark:border-navy-800">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800 font-mono text-[11px]">
                <tr>
                  <td className="p-3 text-gold-600 dark:text-gold-400 font-bold">amh_profiles</td>
                  <td className="p-3">Profile[]</td>
                  <td className="p-3 font-sans">Student, Parent, and Tutor user account registrations</td>
                </tr>
                <tr>
                  <td className="p-3 text-gold-600 dark:text-gold-400 font-bold">amh_bookings</td>
                  <td className="p-3">Booking[]</td>
                  <td className="p-3 font-sans">Tutoring lessons, meeting links, ratings and feedback remarks</td>
                </tr>
                <tr>
                  <td className="p-3 text-gold-600 dark:text-gold-400 font-bold">amh_payments</td>
                  <td className="p-3">Payment[]</td>
                  <td className="p-3 font-sans">EFT / PayFast checkout transaction records</td>
                </tr>
                <tr>
                  <td className="p-3 text-gold-600 dark:text-gold-400 font-bold">amh_weekly_insights</td>
                  <td className="p-3">WeeklyInsight[]</td>
                  <td className="p-3 font-sans">Gemini-drafted end-of-week performance digests & key wins</td>
                </tr>
                <tr>
                  <td className="p-3 text-gold-600 dark:text-gold-400 font-bold">amh_tutor_availability</td>
                  <td className="p-3">Record&lt;string, string[]&gt;</td>
                  <td className="p-3 font-sans">Weekly tutor availability schedule mapped by weekday names</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6: API ENDPOINTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-black font-display text-navy-900 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <span>6. Server API Endpoints Reference</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-navy-950 text-navy-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-navy-950 font-bold">POST</span>
                <span className="text-gold-400 font-bold">/api/gemini/tutor</span>
              </div>
              <p className="font-sans text-[11px] text-navy-300">
                Proxies user queries to Gemini 3.6 Flash for step-by-step CAPS/IEB math solutions and quiz generation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 text-navy-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-navy-950 font-bold">POST</span>
                <span className="text-gold-400 font-bold">/api/gemini/weekly-insights</span>
              </div>
              <p className="font-sans text-[11px] text-navy-300">
                Aggregates quiz results, Pomodoro focus minutes, and module progress to draft weekly student insights.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 text-navy-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold">POST</span>
                <span className="text-gold-400 font-bold">/api/notifications/send-email</span>
              </div>
              <p className="font-sans text-[11px] text-navy-300">
                Dispatches transactional HTML emails via Nodemailer for booking confirmations, reminders, and weekly digests.
              </p>
            </div>
          </div>
        </section>

        {/* DOCUMENT FOOTER SIGN-OFF */}
        <div className="pt-8 border-t border-navy-200 dark:border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-navy-500 dark:text-navy-400 font-mono">
          <div className="space-y-1">
            <div className="font-bold text-navy-900 dark:text-white">Amaris Mathematics Hub Operations & Tech Committee</div>
            <div>Head Instructor: Bethuel Moukangwe (BSc Mathematics)</div>
          </div>
          <div className="text-right">
            <div>Document Ref: <strong className="text-gold-600 dark:text-gold-400">AMH-DOC-2026-v3.6</strong></div>
            <div>All rights reserved © 2026 Amaris Mathematics Hub</div>
          </div>
        </div>

      </div>
    </div>
  );
};
