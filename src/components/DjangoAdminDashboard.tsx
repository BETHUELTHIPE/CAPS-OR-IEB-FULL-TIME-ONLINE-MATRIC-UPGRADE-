import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Users, CreditCard, Video, ShieldAlert, FileText, Search, Plus, Trash2,
  Play, RefreshCw, Layers, Check, CheckCircle2, AlertCircle, Terminal, Cpu, Database, Server,
  ChevronRight, Filter, AlertTriangle, Coins, TrendingUp, Download, Eye, ExternalLink, Activity, Sparkles, LogOut, Lock, Ban, ShieldCheck, Mail
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, Cell, LineChart, Line, PieChart, Pie
} from "recharts";
import { getFromDB, saveToDB, generateId, generateBookingReference } from "../lib/db";
import { Profile, Booking, Payment, VideoLessonRequest, HomeworkSubmission, ActivityLog } from "../types";
import { MFASetup } from "./MFASetup";

// Django Model Custom Mappings
interface DjangoModelConfig {
  name: string;
  plural: string;
  dbKey: string;
  icon: any;
  app: "students" | "revenue" | "system" | "security";
}

const MODELS: Record<string, DjangoModelConfig> = {
  profiles: { name: "User Profile", plural: "User Profiles", dbKey: "amh_profiles", icon: Users, app: "students" },
  videos: { name: "Video request", plural: "Video requests", dbKey: "amh_video_requests", icon: Video, app: "students" },
  predictions: { name: "Exam prediction", plural: "Exam predictions", dbKey: "amh_predictions", icon: Sparkles, app: "students" },
  payments: { name: "Payment receipt", plural: "Payment receipts", dbKey: "amh_payments", icon: Coins, app: "revenue" },
  subscriptions: { name: "Student subscription", plural: "Student subscriptions", dbKey: "amh_subscriptions", icon: CreditCard, app: "revenue" },
  bookings: { name: "Booking order", plural: "Booking orders", dbKey: "amh_bookings", icon: FileText, app: "revenue" },
  servers: { name: "WSGI Server worker", plural: "WSGI Server workers", dbKey: "amh_wsgi_servers", icon: Server, app: "system" },
  database: { name: "PostgreSQL Database connection", plural: "PostgreSQL connections", dbKey: "amh_db_sockets", icon: Database, app: "system" },
  redis: { name: "Redis Cache memory node", plural: "Redis Cache memory nodes", dbKey: "amh_redis_cache", icon: Cpu, app: "system" },
  logs: { name: "Audit event log", plural: "Audit event logs", dbKey: "amh_activity_logs", icon: Terminal, app: "security" },
  failed_logins: { name: "Failed login alert", plural: "Failed login alerts", dbKey: "amh_failed_logins", icon: Lock, app: "security" },
  api_abuse: { name: "WAF abuse incident", plural: "WAF abuse incidents", dbKey: "amh_api_abuse", icon: Ban, app: "security" }
};

export const DjangoAdminDashboard: React.FC = () => {
  // Navigation
  const [currentModelKey, setCurrentModelKey] = useState<string | null>(null); // null means home dashboard

  // Data State Pools
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [videosList, setVideosList] = useState<VideoLessonRequest[]>([]);
  const [predictionsList, setPredictionsList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [bookingsList, setBookingList] = useState<Booking[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [failedLogins, setFailedLogins] = useState<any[]>([]);
  const [apiAbuseList, setApiAbuseList] = useState<any[]>([]);
  
  // System Health States (Prometheus/Grafana Engine Feed)
  const [systemUptime, setSystemUptime] = useState<number>(345600); // 4 days in seconds
  const [gunicornThreads, setGunicornThreads] = useState<number>(8);
  const [celeryQueueLength, setCeleryQueueLength] = useState<number>(0);
  const [postgresCacheRatio, setPostgresCacheRatio] = useState<number>(99.4);
  const [redisEvictions, setRedisEvictions] = useState<number>(0);
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [memoryUsage, setMemoryUsage] = useState<number>(38);
  const [networkInBytes, setNetworkInBytes] = useState<number>(45210);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [curriculumFilter, setCurriculumFilter] = useState("all");

  // Selection Tracking (for checkboxes)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // System CLI Console State
  const [cliLogs, setCliLogs] = useState<string[]>([
    "[Django WSGI Thread #2] Initialized Gunicorn Core successfully bound to 0.0.0.0:3000.",
    "[Celery Worker Engine] Joined RabbitMQ/Redis Broker. Listening to 'predictions_queue'...",
    "[Postgres Socket #4] Database hit ratio: 99.45% | Locks count: 0 deadlocks active.",
    "Type any python command or click macro below to query metrics API."
  ]);
  const [cliInput, setCliInput] = useState("");

  // CRUD Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  
  // Django Success Messaging
  const [djangoMessage, setDjangoMessage] = useState<string | null>(null);

  // Load all DB data
  const loadDjangoDB = () => {
    // Sync with existing localStorage keys
    const profs = getFromDB<Profile>("amh_profiles");
    const vids = getFromDB<VideoLessonRequest>("amh_video_requests");
    const pays = getFromDB<Payment>("amh_payments");
    const books = getFromDB<Booking>("amh_bookings");
    const subs = JSON.parse(localStorage.getItem("amh_subscriptions") || "[]");
    const actLogs = getFromDB<ActivityLog>("amh_activity_logs");

    // Predictions (Fallback seed if empty)
    let preds = JSON.parse(localStorage.getItem("amh_predictions") || "[]");
    if (preds.length === 0) {
      preds = [
        { id: "prd-101", student_name: "Sipho Ndlovu", curriculum: "CAPS", paper_type: "p1", target_year: 2026, status: "completed", accuracy_rate: 94.5, created_at: "2026-07-10T12:00:00Z" },
        { id: "prd-102", student_name: "Lerato Mokoena", curriculum: "IEB", paper_type: "p2", target_year: 2026, status: "completed", accuracy_rate: 92.1, created_at: "2026-07-12T14:30:00Z" }
      ];
      localStorage.setItem("amh_predictions", JSON.stringify(preds));
    }

    // Failed Logins (Seed if empty)
    let fls = JSON.parse(localStorage.getItem("amh_failed_logins") || "[]");
    if (fls.length === 0) {
      fls = [
        { id: "flg-501", ip_address: "102.65.12.98", username: "admin_thipe", country: "South Africa", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), threat_level: "high", status: "blocked" },
        { id: "flg-502", ip_address: "196.21.43.12", username: "student_lerato", country: "South Africa", timestamp: new Date(Date.now() - 1200000).toISOString(), threat_level: "medium", status: "logged" }
      ];
      localStorage.setItem("amh_failed_logins", JSON.stringify(fls));
    }

    // API Abuse (Seed if empty)
    let abuse = JSON.parse(localStorage.getItem("amh_api_abuse") || "[]");
    if (abuse.length === 0) {
      abuse = [
        { id: "abs-901", ip_address: "102.65.12.98", type: "sqli_attempt", url: "/api/auth/login", timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(), status: "mitigated", rule_matched: "WAF SQLi Rule #403" },
        { id: "abs-902", ip_address: "41.13.120.44", type: "xss_attempt", url: "/api/homework/submit", timestamp: new Date(Date.now() - 50 * 60000).toISOString(), status: "blocked", rule_matched: "XSS Infiltration Filter" }
      ];
      localStorage.setItem("amh_api_abuse", JSON.stringify(abuse));
    }

    setProfilesList(profs);
    setVideosList(vids);
    setPredictionsList(preds);
    setPaymentsList(pays);
    setBookingList(books);
    setSubscriptionsList(subs);
    setActivityLogs(actLogs);
    setFailedLogins(fls);
    setApiAbuseList(abuse);
  };

  useEffect(() => {
    loadDjangoDB();

    // Setup periodic Telemetry Simulator for Prometheus Scrapers
    const promInterval = setInterval(() => {
      setCpuUsage(prev => Math.max(8, Math.min(95, prev + Math.floor(Math.random() * 5) - 2)));
      setMemoryUsage(prev => Math.max(25, Math.min(88, prev + Math.floor(Math.random() * 3) - 1)));
      setNetworkInBytes(prev => prev + Math.floor(Math.random() * 800) - 200);
      setSystemUptime(prev => prev + 2);
    }, 2000);

    return () => clearInterval(promInterval);
  }, []);

  const triggerDjangoMessage = (msg: string) => {
    setDjangoMessage(msg);
    setTimeout(() => setDjangoMessage(null), 5000);
  };

  // Checkbox Selection Helpers
  const handleToggleSelectAll = (ids: string[]) => {
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Django Actions Processing
  const handleExecuteAction = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one record to perform actions.");
      return;
    }
    if (!selectedAction) {
      alert("Please select an administrative action from the dropdown.");
      return;
    }

    // Process Actions based on active model
    let updatedCount = selectedIds.length;

    if (selectedAction === "delete_selected") {
      if (confirm(`Are you sure you want to permanently delete these ${updatedCount} selected records?`)) {
        if (currentModelKey === "profiles") {
          const filtered = profilesList.filter(p => !selectedIds.includes(p.id));
          saveToDB("amh_profiles", filtered);
        } else if (currentModelKey === "bookings") {
          const filtered = bookingsList.filter(b => !selectedIds.includes(b.id));
          saveToDB("amh_bookings", filtered);
        } else if (currentModelKey === "payments") {
          const filtered = paymentsList.filter(p => !selectedIds.includes(p.id));
          saveToDB("amh_payments", filtered);
        } else if (currentModelKey === "videos") {
          const filtered = videosList.filter(v => !selectedIds.includes(v.id));
          saveToDB("amh_video_requests", filtered);
        } else if (currentModelKey === "predictions") {
          const filtered = predictionsList.filter(p => !selectedIds.includes(p.id));
          localStorage.setItem("amh_predictions", JSON.stringify(filtered));
        } else if (currentModelKey === "subscriptions") {
          const filtered = subscriptionsList.filter(s => !selectedIds.includes(s.id));
          localStorage.setItem("amh_subscriptions", JSON.stringify(filtered));
        } else if (currentModelKey === "failed_logins") {
          const filtered = failedLogins.filter(f => !selectedIds.includes(f.id));
          localStorage.setItem("amh_failed_logins", JSON.stringify(filtered));
        } else if (currentModelKey === "api_abuse") {
          const filtered = apiAbuseList.filter(a => !selectedIds.includes(a.id));
          localStorage.setItem("amh_api_abuse", JSON.stringify(filtered));
        } else if (currentModelKey === "logs") {
          const filtered = activityLogs.filter(l => !selectedIds.includes(l.id));
          saveToDB("amh_activity_logs", filtered);
        }

        // Add to audit trail
        const auditLog: ActivityLog = {
          id: generateId("log"),
          user_name: "Bethuel Thipe (Django Admin)",
          action: "Bulk Delete",
          details: `Deleted ${updatedCount} records from model: ${MODELS[currentModelKey || ""].plural}`,
          created_at: new Date().toISOString(),
          type: "auth"
        };
        const currentLogs = getFromDB<ActivityLog>("amh_activity_logs");
        saveToDB("amh_activity_logs", [auditLog, ...currentLogs]);

        triggerDjangoMessage(`Successfully deleted ${updatedCount} ${MODELS[currentModelKey || ""].plural} items from system database.`);
        setSelectedIds([]);
        loadDjangoDB();
      }
    } else if (selectedAction === "mark_completed" && currentModelKey === "bookings") {
      const updated = bookingsList.map(b => {
        if (selectedIds.includes(b.id)) return { ...b, status: "completed" as const };
        return b;
      });
      saveToDB("amh_bookings", updated);
      triggerDjangoMessage(`Successfully marked ${updatedCount} booking orders as Completed.`);
      setSelectedIds([]);
      loadDjangoDB();
    } else if (selectedAction === "mark_successful" && currentModelKey === "payments") {
      const updated = paymentsList.map(p => {
        if (selectedIds.includes(p.id)) return { ...p, status: "successful" as const };
        return p;
      });
      saveToDB("amh_payments", updated);
      triggerDjangoMessage(`Successfully verified ${updatedCount} PayFast Instant EFT payments.`);
      setSelectedIds([]);
      loadDjangoDB();
    } else if (selectedAction === "mark_active" && currentModelKey === "subscriptions") {
      const updated = subscriptionsList.map(s => {
        if (selectedIds.includes(s.id)) return { ...s, status: "active" };
        return s;
      });
      localStorage.setItem("amh_subscriptions", JSON.stringify(updated));
      triggerDjangoMessage(`Staggered renew complete for ${updatedCount} student subscriptions.`);
      setSelectedIds([]);
      loadDjangoDB();
    } else if (selectedAction === "celery_predict_retry" && currentModelKey === "predictions") {
      setCeleryQueueLength(prev => prev + updatedCount);
      triggerDjangoMessage(`Dispatched Celery task process_exam_delivery_dispatch. Scheduled ${updatedCount} mock exam predictions for delivery.`);
      setTimeout(() => setCeleryQueueLength(0), 4000);
      setSelectedIds([]);
    } else if (selectedAction === "waf_block_ip" && (currentModelKey === "failed_logins" || currentModelKey === "api_abuse")) {
      const targets = currentModelKey === "failed_logins" ? failedLogins : apiAbuseList;
      const ipsToBlock = targets.filter(t => selectedIds.includes(t.id)).map(t => t.ip_address);
      
      // Sync into Security Dashboard BlockedIPs
      const blockedIPs = JSON.parse(localStorage.getItem("amh_blocked_ips") || "[]");
      let added = 0;
      ipsToBlock.forEach(ip => {
        if (!blockedIPs.some((b: any) => b.ip === ip)) {
          blockedIPs.push({
            ip,
            reason: "Volumetric brute force / payload infraction caught on Django Admin",
            blockedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
            country: "South Africa (ZA)",
            attemptsCount: 14
          });
          added++;
        }
      });
      localStorage.setItem("amh_blocked_ips", JSON.stringify(blockedIPs));
      triggerDjangoMessage(`AWS WAF Rule locked down ${added} host IP address(es) completely.`);
      setSelectedIds([]);
    } else {
      alert("This action is not applicable to the current model Change-List.");
    }
  };

  // Simulated CLI Commands Engine
  const handleRunCliCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    let reply = `Command not recognized. Type 'help' or use macros for help.`;

    if (cmd === "help") {
      reply = `Available Django commands:\n- python manage.py check_smtp_relay\n- python manage.py collectstatic\n- python manage.py clear_redis_cache\n- python manage.py pg_stat_activity\n- python manage.py test_celery_broker`;
    } else if (cmd.includes("check_smtp_relay")) {
      reply = `[SMTP Auth] Connecting to AWS SES SMTP relay node on port 465...\n[SMTP Link] Connection secured via TLS.\n[SUCCESS] Auth completed. outbound@amarismathematics.co.za verified. Transports nominal.`;
    } else if (cmd.includes("collectstatic")) {
      reply = `[Static Collector] Scanning assets in all app modules...\n[Static Collector] Found 418 files to aggregate.\n[SUCCESS] Copied 418 static assets into AWS S3 distribution cloud bucket /static/.`;
    } else if (cmd.includes("clear_redis_cache")) {
      setRedisEvictions(prev => prev + 12);
      reply = `[Redis Cache] Engaged flushall daemon.\n[SUCCESS] Purged 104 dynamic user-state keys. Gunicorn buffer freed up.`;
    } else if (cmd.includes("pg_stat_activity")) {
      reply = `[PostgreSQL] ACTIVE SOCKET CONFLICTS: None\nLocks count: 0 deadlocks\nCache hit ratio: ${postgresCacheRatio}%\nIdle transactions count: 4\nActive write transactions: 1`;
    } else if (cmd.includes("test_celery_broker")) {
      reply = `[Celery Task] Heartbeat sent to Redis broker.\nHeartbeat response: ACK (0.015ms)\nRegistered queues: [predictions_queue, video_recordings_queue, notification_outbox]`;
    }

    setCliLogs(prev => [...prev, `>>> ${cliInput}`, reply]);
    setCliInput("");
  };

  const handleMacroCommand = (cmd: string) => {
    setCliInput(cmd);
    setTimeout(() => {
      setCliLogs(prev => {
        let reply = `Executing command: ${cmd}`;
        if (cmd.includes("check_smtp_relay")) {
          reply = `[SMTP Auth] Connecting to AWS SES SMTP relay on port 465...\n[SUCCESS] Outbound connection verified. AWS SES is ONLINE.`;
        } else if (cmd.includes("clear_redis_cache")) {
          setRedisEvictions(prev => prev + 4);
          reply = `[Redis Cache] Flushed volatile Gunicorn cache objects. Purged 86 inactive student sessions.`;
        } else if (cmd.includes("pg_stat_activity")) {
          reply = `[PostgreSQL] CPU load: 12% | Cache Ratio: ${postgresCacheRatio}% | Active Sockets: 34 pool connections.`;
        }
        return [...prev, `>>> ${cmd}`, reply];
      });
      setCliInput("");
    }, 150);
  };

  // Django CRUD: Add/Edit Model form creation
  const handleOpenAddForm = () => {
    if (!currentModelKey) return;
    
    // Setup initial fields depending on selected model
    const fields: Record<string, string> = {};
    if (currentModelKey === "profiles") {
      fields.first_name = ""; fields.surname = ""; fields.email = ""; fields.school = ""; fields.grade = "Grade 12 CAPS"; fields.role = "student";
    } else if (currentModelKey === "payments") {
      fields.student_name = ""; fields.amount = "1100"; fields.method = "Instant EFT (PayFast)"; fields.reference = "PF-" + Math.floor(100000 + Math.random() * 900000);
    } else if (currentModelKey === "bookings") {
      fields.student_name = ""; fields.lesson_date = new Date().toISOString().split("T")[0]; fields.lesson_time = "15:00"; fields.topics = "Calculus limits";
    } else if (currentModelKey === "predictions") {
      fields.student_name = ""; fields.curriculum = "CAPS"; fields.paper_type = "p1"; fields.accuracy_rate = "94";
    } else {
      alert("Creation form is only available for operational data models (Profiles, Payments, Bookings, Predictions).");
      return;
    }

    setFormFields(fields);
    setShowAddModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModelKey) return;

    if (currentModelKey === "profiles") {
      const newProf: Profile = {
        id: generateId("usr"),
        first_name: formFields.first_name || "New",
        surname: formFields.surname || "Student",
        email: formFields.email || "student@amarismathematics.co.za",
        phone: "082 555 1234",
        whatsapp_number: "082 555 1234",
        province: "Gauteng",
        school: formFields.school || "Amaris Academy",
        grade: formFields.grade || "Grade 12 CAPS",
        parent_name: "Parent",
        parent_phone: "+27 82 555 1234",
        role: (formFields.role as "student" | "admin" | "tutor") || "student",
        avatar_url: ""
      };
      const profs = getFromDB<Profile>("amh_profiles");
      profs.push(newProf);
      saveToDB("amh_profiles", profs);
      triggerDjangoMessage(`Successfully registered student candidate ${newProf.first_name} ${newProf.surname} into CAPS core.`);
    } else if (currentModelKey === "payments") {
      const newPay: Payment = {
        id: generateId("pay"),
        booking_id: "bk-simulated",
        student_id: "usr-guest",
        amount: Number(formFields.amount) || 1100,
        currency: "ZAR",
        payment_method: formFields.method || "EFT PayFast",
        transaction_id: formFields.reference || ("PF-" + Math.floor(Math.random() * 900000)),
        status: "successful",
        created_at: new Date().toISOString()
      };
      const pays = getFromDB<Payment>("amh_payments");
      pays.push(newPay);
      saveToDB("amh_payments", pays);
      triggerDjangoMessage(`Simulated PayFast EFT transaction ${newPay.transaction_id} verified successfully.`);
    } else if (currentModelKey === "bookings") {
      const newBook: Booking = {
        id: generateId("bk"),
        student_id: "usr-bethuel",
        subject_id: "sub-1",
        package_id: "pkg-1",
        booking_reference: generateBookingReference(),
        lesson_date: formFields.lesson_date || "2026-07-20",
        lesson_time: formFields.lesson_time || "15:00",
        duration_minutes: 60,
        platform: "Google Meet",
        topics_to_cover: [formFields.topics || "General Math Revision"],
        notes: "Created via Django Enterprise Operations Console.",
        status: "confirmed",
        meeting_link: "https://meet.google.com/amh-maths-upgrade",
        created_at: new Date().toISOString().split("T")[0]
      };
      const books = getFromDB<Booking>("amh_bookings");
      books.push(newBook);
      saveToDB("amh_bookings", books);
      triggerDjangoMessage(`Booked slot reference ${newBook.booking_reference} synchronised with tutor Google Calendar.`);
    } else if (currentModelKey === "predictions") {
      const newPred = {
        id: "prd-" + Math.floor(1000 + Math.random() * 9000),
        student_name: formFields.student_name || "Bethuel Thipe",
        curriculum: formFields.curriculum || "CAPS",
        paper_type: formFields.paper_type || "p1",
        target_year: 2026,
        status: "completed",
        accuracy_rate: Number(formFields.accuracy_rate) || 94,
        created_at: new Date().toISOString()
      };
      const preds = JSON.parse(localStorage.getItem("amh_predictions") || "[]");
      preds.push(newPred);
      localStorage.setItem("amh_predictions", JSON.stringify(preds));
      triggerDjangoMessage(`Predicted examination syllabus booklet compiled and watermarked.`);
    }

    setShowAddModal(false);
    loadDjangoDB();

    // Log the event to Django Audit logs
    const auditLog: ActivityLog = {
      id: generateId("log"),
      user_name: "Bethuel Thipe (Django Admin)",
      action: "Create Record",
      details: `Added new row into model ${MODELS[currentModelKey].plural}`,
      created_at: new Date().toISOString(),
      type: "auth"
    };
    const currentLogs = getFromDB<ActivityLog>("amh_activity_logs");
    saveToDB("amh_activity_logs", [auditLog, ...currentLogs]);
  };

  // Helper to format timestamps gracefully
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans bg-[#f8f9fa] dark:bg-navy-950 p-1 rounded-2xl">
      
      {/* ==================== DJANGO BRANDING HEADER ==================== */}
      <header className="bg-[#124c3e] text-white p-4 rounded-t-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md border-b border-emerald-900">
        <div className="flex items-center gap-3">
          <div className="bg-[#0c3c26] text-gold-400 p-2.5 rounded-xl font-mono text-xs font-black tracking-widest flex items-center gap-1 shadow-inner border border-emerald-950">
            <span className="text-emerald-400">django</span>_admin
          </div>
          <div className="space-y-0.5 text-left">
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 font-display">
              AMARIS Mathematics Hub Administration
              <span className="text-[10px] bg-emerald-700/80 text-emerald-300 border border-emerald-600/30 px-1.5 py-0.5 rounded font-mono font-black uppercase">
                v5.0.1
              </span>
            </h1>
            <p className="text-[10.5px] text-emerald-200/90 font-mono">
              Enterprise Operations Control Centre • Simulated Gunicorn WSGI Server Active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 text-xs font-mono">
          <button 
            onClick={() => setCurrentModelKey(null)}
            className="px-3 py-1.5 rounded bg-emerald-800/80 hover:bg-emerald-700 hover:text-white transition-all border border-emerald-700 font-bold flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-gold-400" />
            Home Dashboard
          </button>
          <span className="bg-emerald-800/30 border border-emerald-700/40 px-3 py-1.5 rounded text-emerald-300 font-bold">
            User: <b className="text-white">bethuel_admin</b>
          </span>
        </div>
      </header>

      {/* Django Notification banner */}
      <AnimatePresence>
        {djangoMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-bold font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>django.contrib.messages: {djangoMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pb-4">
        {/* ==================== VIEW 1: HOME PANEL (MODEL INDEX) ==================== */}
        {currentModelKey === null && (
          <div className="space-y-6">
            
            {/* Real-time Prometheus Scraped Metrics API Overlay Banner */}
            <section className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-850 pb-3 flex-wrap gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-navy-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#124c3e] animate-pulse" />
                    Prometheus Metrics API Telemetry Feed
                  </h3>
                  <p className="text-[11px] text-navy-500 font-mono">
                    Underlying engine: Prometheus + Node Exporter scraper polling every 1500ms.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-xs font-mono font-bold text-emerald-600">GRAFANA ONLINE</span>
                </div>
              </div>

              {/* Dynamic Health Metrics widgets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-[#f8fbf9] dark:bg-navy-950 border border-emerald-500/10 dark:border-emerald-500/5 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-navy-400 uppercase tracking-widest font-black block">WSGI CPU Load</span>
                  <div className="text-lg font-black text-navy-900 dark:text-white font-mono flex items-baseline gap-1">
                    {cpuUsage}%
                    <span className="text-[9px] text-navy-400 font-normal">limit: 90%</span>
                  </div>
                  <div className="w-full bg-navy-150 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${cpuUsage}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-[#f8fbf9] dark:bg-navy-950 border border-emerald-500/10 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-navy-400 uppercase tracking-widest font-black block">PostgreSQL Cache Ratio</span>
                  <div className="text-lg font-black text-emerald-600 font-mono">
                    {postgresCacheRatio}%
                  </div>
                  <span className="text-[9px] text-navy-400 block font-mono">HIT: 0 deadlocks active</span>
                </div>

                <div className="p-3 bg-[#f8fbf9] dark:bg-navy-950 border border-emerald-500/10 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-navy-400 uppercase tracking-widest font-black block">Redis Evictions</span>
                  <div className="text-lg font-black text-navy-900 dark:text-white font-mono">
                    {redisEvictions} <span className="text-xs text-navy-400">keys</span>
                  </div>
                  <span className="text-[9px] text-navy-500 block font-mono">Policy: volatile-lru</span>
                </div>

                <div className="p-3 bg-[#f8fbf9] dark:bg-navy-950 border border-emerald-500/10 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-navy-400 uppercase tracking-widest font-black block">Celery Backlog Queue</span>
                  <div className="text-lg font-black text-navy-900 dark:text-white font-mono flex items-baseline gap-1">
                    {celeryQueueLength}
                    {celeryQueueLength > 0 && <span className="text-[9px] text-amber-500 animate-pulse font-bold">DISPATCHING</span>}
                  </div>
                  <span className="text-[9px] text-navy-500 block font-mono">Broker: Redis master</span>
                </div>
              </div>
            </section>

            {/* Django Admin Main Apps Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Django Model Registry Groups */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. STUDENTS APP */}
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-sm overflow-hidden text-left">
                  <h3 className="bg-[#124c3e]/10 text-[#124c3e] dark:text-emerald-400 font-mono font-black text-xs px-4 py-2.5 uppercase border-b border-navy-100 dark:border-navy-800 tracking-wider">
                    High_School_Students App (CAPS / IEB Portal)
                  </h3>
                  <div className="divide-y divide-navy-100 dark:divide-navy-800 font-mono text-xs">
                    
                    {/* User Profiles model */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">User Profiles</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {profilesList.length} rows
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setCurrentModelKey("profiles"); handleOpenAddForm(); }} className="p-1 hover:bg-[#124c3e]/10 rounded text-[#124c3e]" title="Add record"><Plus className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setCurrentModelKey("profiles")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Change</button>
                        </div>
                      </div>
                    </div>

                    {/* Videos Requests model */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Video solve requests</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {videosList.length} rows
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setCurrentModelKey("videos")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Change</button>
                        </div>
                      </div>
                    </div>

                    {/* Exam Predictions model */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Exam predictions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {predictionsList.length} rows
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setCurrentModelKey("predictions"); handleOpenAddForm(); }} className="p-1 hover:bg-[#124c3e]/10 rounded text-[#124c3e]" title="Add record"><Plus className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setCurrentModelKey("predictions")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Change</button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. REVENUE APP */}
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-sm overflow-hidden text-left">
                  <h3 className="bg-[#124c3e]/10 text-[#124c3e] dark:text-emerald-400 font-mono font-black text-xs px-4 py-2.5 uppercase border-b border-navy-100 dark:border-navy-800 tracking-wider">
                    Checkout_Engine App (EFT & PayFast Operations)
                  </h3>
                  <div className="divide-y divide-navy-100 dark:divide-navy-800 font-mono text-xs">
                    
                    {/* Payment Receipts model */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Payment receipts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {paymentsList.length} rows
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setCurrentModelKey("payments"); handleOpenAddForm(); }} className="p-1 hover:bg-[#124c3e]/10 rounded text-[#124c3e]" title="Add record"><Plus className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setCurrentModelKey("payments")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Change</button>
                        </div>
                      </div>
                    </div>

                    {/* Student Subscriptions model */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Student subscriptions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {subscriptionsList.length} rows
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setCurrentModelKey("subscriptions")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Change</button>
                        </div>
                      </div>
                    </div>

                    {/* Booking orders model */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Booking orders</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {bookingsList.length} rows
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setCurrentModelKey("bookings"); handleOpenAddForm(); }} className="p-1 hover:bg-[#124c3e]/10 rounded text-[#124c3e]" title="Add record"><Plus className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setCurrentModelKey("bookings")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Change</button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. SYSTEM HEALTH APP */}
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-sm overflow-hidden text-left">
                  <h3 className="bg-[#124c3e]/10 text-[#124c3e] dark:text-emerald-400 font-mono font-black text-xs px-4 py-2.5 uppercase border-b border-navy-100 dark:border-navy-800 tracking-wider">
                    Prometheus_Metrics_API App (System Hardware & Sockets)
                  </h3>
                  <div className="divide-y divide-navy-100 dark:divide-navy-800 font-mono text-xs">
                    
                    {/* WSGI Server workers */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Gunicorn WSGI threads</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {gunicornThreads} workers nominal
                        </span>
                        <button onClick={() => { handleMacroCommand("gunicorn -w 16"); }} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Tune Pool</button>
                      </div>
                    </div>

                    {/* PostgreSQL connections */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">PostgreSQL connections pool</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          34 sockets healthy
                        </span>
                        <button onClick={() => setCurrentModelKey("database")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Query pg_stat</button>
                      </div>
                    </div>

                    {/* Redis cache memory nodes */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Redis cache memory nodes</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          ElastiCache active
                        </span>
                        <button onClick={() => { handleMacroCommand("python manage.py clear_redis_cache"); }} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white border border-red-700 rounded font-bold text-[10px] cursor-pointer">Purge Keys</button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 4. SECURITY & AUDIT APP */}
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-sm overflow-hidden text-left">
                  <h3 className="bg-[#124c3e]/10 text-[#124c3e] dark:text-emerald-400 font-mono font-black text-xs px-4 py-2.5 uppercase border-b border-navy-100 dark:border-navy-800 tracking-wider">
                    Security_Gateway App (WAF, Failed Logins, & Auditing)
                  </h3>
                  <div className="divide-y divide-navy-100 dark:divide-navy-800 font-mono text-xs">
                    
                    {/* Audit event logs */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Audit logs</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {activityLogs.length} entries
                        </span>
                        <button onClick={() => setCurrentModelKey("logs")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Change</button>
                      </div>
                    </div>

                    {/* Failed Logins */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">Failed login alerts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {failedLogins.length} rows
                        </span>
                        <button onClick={() => setCurrentModelKey("failed_logins")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Inspect</button>
                      </div>
                    </div>

                    {/* API Abuse list */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <Ban className="w-4 h-4 text-[#124c3e]" />
                        <span className="font-bold text-navy-800 dark:text-navy-200">WAF abuse incidents</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded font-extrabold">
                          {apiAbuseList.length} rows
                        </span>
                        <button onClick={() => setCurrentModelKey("api_abuse")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Inspect</button>
                      </div>
                    </div>

                    {/* Firebase Multi-Factor Authentication (TOTP) */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-navy-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-[#124c3e]" />
                        <div>
                          <span className="font-bold text-navy-800 dark:text-navy-200 block">Firebase MFA Setup (TOTP)</span>
                          <span className="text-[10px] text-navy-400">Authenticator QR code & recovery keys</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                          Enrolled
                        </span>
                        <button onClick={() => setCurrentModelKey("mfa_setup")} className="px-2.5 py-1 bg-[#124c3e] hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Configure</button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column: Django Admin Interactive Console & Sockets logs */}
              <div className="space-y-6">
                
                {/* Simulated CLI Terminal */}
                <div className="bg-navy-900 border border-navy-800 text-white rounded-2xl shadow-xl overflow-hidden text-left flex flex-col h-[400px]">
                  <div className="bg-navy-950 px-4 py-2.5 border-b border-navy-850 flex items-center justify-between font-mono text-[10px] font-black text-navy-400">
                    <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-400" /> django manage.py shell</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">BASH ACTIVE</span>
                  </div>
                  
                  {/* Logs area */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-2 font-mono text-[11px] leading-relaxed max-h-[300px]">
                    {cliLogs.map((log, idx) => (
                      <div key={idx} className="whitespace-pre-wrap break-all border-b border-navy-800/40 pb-1">
                        {log.startsWith(">>>") ? (
                          <span className="text-emerald-400 font-bold">{log}</span>
                        ) : log.startsWith("[SUCCESS]") ? (
                          <span className="text-emerald-500 font-bold">{log}</span>
                        ) : log.startsWith("[WARN]") || log.startsWith("[CRIT]") ? (
                          <span className="text-rose-400 font-bold">{log}</span>
                        ) : (
                          <span className="text-navy-200">{log}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Macros buttons bar */}
                  <div className="p-2 border-t border-navy-800 bg-navy-950/60 flex flex-wrap gap-1 font-mono text-[9px]">
                    <button onClick={() => handleMacroCommand("python manage.py check_smtp_relay")} className="px-2 py-1 bg-navy-800 hover:bg-[#124c3e] rounded font-bold border border-navy-700/60 transition-all cursor-pointer">check_smtp</button>
                    <button onClick={() => handleMacroCommand("python manage.py clear_redis_cache")} className="px-2 py-1 bg-navy-800 hover:bg-[#124c3e] rounded font-bold border border-navy-700/60 transition-all cursor-pointer">clear_redis</button>
                    <button onClick={() => handleMacroCommand("python manage.py pg_stat_activity")} className="px-2 py-1 bg-navy-800 hover:bg-[#124c3e] rounded font-bold border border-navy-700/60 transition-all cursor-pointer">pg_stat</button>
                  </div>

                  {/* Input bar */}
                  <form onSubmit={handleRunCliCommand} className="flex border-t border-navy-850">
                    <span className="bg-navy-950 px-3 py-2.5 text-emerald-400 font-bold font-mono text-xs">{">>>"}</span>
                    <input
                      type="text"
                      value={cliInput}
                      onChange={(e) => setCliInput(e.target.value)}
                      placeholder="Type a python script... (e.g. 'help')"
                      className="flex-1 bg-navy-950 text-white font-mono text-xs px-2 py-2 focus:outline-none placeholder-navy-500"
                    />
                    <button type="submit" className="bg-[#124c3e] hover:bg-emerald-800 px-4 text-xs font-mono font-black text-white uppercase tracking-wider transition-all cursor-pointer">Run</button>
                  </form>
                </div>

                {/* Audit logs quick outbox overview */}
                <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                  <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider border-b border-navy-100 dark:border-navy-850 pb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Recent Actions Log (Auditable)
                  </h3>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {activityLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="text-[11px] font-mono border-b border-navy-50 dark:border-navy-850 pb-2 space-y-0.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-navy-800 dark:text-navy-300">{log.user_name}</span>
                          <span className="text-navy-400">{formatDate(log.created_at)}</span>
                        </div>
                        <div className="text-navy-900 dark:text-white font-bold">{log.action}</div>
                        <div className="text-navy-500 text-[10px] italic">{log.details}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==================== VIEW 2: MODEL CHANGE-LIST (DETAILED RECORDS PANEL) ==================== */}
        {currentModelKey === "mfa_setup" ? (
          <div className="space-y-6">
            <nav className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-sm">
              <button onClick={() => setCurrentModelKey(null)} className="text-[#124c3e] hover:underline font-bold cursor-pointer">Home</button>
              <ChevronRight className="w-3 h-3 text-navy-400" />
              <span className="text-navy-400 uppercase tracking-tight">Security App</span>
              <ChevronRight className="w-3 h-3 text-navy-400" />
              <span className="text-navy-900 dark:text-white font-extrabold">Firebase MFA Setup (TOTP)</span>
            </nav>

            <MFASetup />
          </div>
        ) : currentModelKey !== null && (
          <div className="space-y-6">
            
            {/* Django Breadcrumb Navigation Bar */}
            <nav className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-sm">
              <button onClick={() => setCurrentModelKey(null)} className="text-[#124c3e] hover:underline font-bold cursor-pointer">Home</button>
              <ChevronRight className="w-3 h-3 text-navy-400" />
              <span className="text-navy-400 uppercase tracking-tight">{MODELS[currentModelKey]?.app || "System"} App</span>
              <ChevronRight className="w-3 h-3 text-navy-400" />
              <span className="text-navy-900 dark:text-white font-extrabold">{MODELS[currentModelKey]?.plural || currentModelKey}</span>
            </nav>

            {/* Model-Specific Live Telemetry Header card */}
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-left">
              <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-850 pb-2 mb-3">
                <h3 className="text-xs font-mono font-black text-[#124c3e] dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4 h-4 animate-pulse" />
                  Model Telemetry overlay
                </h3>
                <span className="text-[10px] font-mono text-navy-400">Scraped metrics active</span>
              </div>

              {currentModelKey === "profiles" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Total Registrations</span>
                    <b className="text-lg text-navy-900 dark:text-white">{profilesList.length} Students</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Role Division</span>
                    <b className="text-lg text-emerald-600">{profilesList.filter(p => p.role === "student").length} Learners / {profilesList.filter(p => p.role === "tutor").length} Tutors</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">AWS SES Outbox</span>
                    <b className="text-lg text-navy-900 dark:text-white">Active</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Last Sign In</span>
                    <b className="text-lg text-navy-900 dark:text-white">Just Now (Johannesburg)</b>
                  </div>
                </div>
              )}

              {currentModelKey === "payments" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">EFT Earnings Pool</span>
                    <b className="text-lg text-emerald-600">R {paymentsList.reduce((acc, curr) => acc + curr.amount, 0)} ZAR</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Webhook Latency</span>
                    <b className="text-lg text-navy-900 dark:text-white">125ms</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">PayFast Status</span>
                    <b className="text-lg text-emerald-600">ONLINE (SANDBOX)</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Audit Lock Status</span>
                    <b className="text-lg text-navy-900 dark:text-white">HMAC SHA-256</b>
                  </div>
                </div>
              )}

              {currentModelKey === "bookings" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Total Tutoring Hours</span>
                    <b className="text-lg text-navy-900 dark:text-white">{bookingsList.length * 1} hour(s)</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Google Calendar API</span>
                    <b className="text-lg text-emerald-600">Sync Online</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Active Double-Booking Block</span>
                    <b className="text-lg text-emerald-600">Enabled</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Post-Session Rating Prompt</span>
                    <b className="text-lg text-navy-900 dark:text-white">Active (t &gt; 1hr)</b>
                  </div>
                </div>
              )}

              {currentModelKey === "predictions" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Trend Analysis Accuracy</span>
                    <b className="text-lg text-emerald-600">93.8% aggregate</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Celery Worker Pools</span>
                    <b className="text-lg text-navy-900 dark:text-white">Active (8 threads)</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Watermarked PDF S3 Bucket</span>
                    <b className="text-lg text-navy-900 dark:text-white">Secured via AWS KMS</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Meta WhatsApp Webhooks</span>
                    <b className="text-lg text-emerald-600">Listening (Graph API v18)</b>
                  </div>
                </div>
              )}

              {!["profiles", "payments", "bookings", "predictions"].includes(currentModelKey) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Hardware Sockets status</span>
                    <b className="text-lg text-emerald-600">Healthy</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Host Environment</span>
                    <b className="text-lg text-navy-900 dark:text-white">GCP Cloud Run Container</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">Port Inbound</span>
                    <b className="text-lg text-navy-900 dark:text-white">3000</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-navy-400 block uppercase">System Availability Rate</span>
                    <b className="text-lg text-emerald-600">99.998%</b>
                  </div>
                </div>
              )}
            </div>

            {/* Change list controls and table layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: Filter and Actions controls & Table */}
              <div className="lg:col-span-9 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-sm overflow-hidden text-left">
                
                {/* Search Bar */}
                <div className="p-4 border-b border-navy-100 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      placeholder={`Search ${MODELS[currentModelKey].plural}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-navy-950 text-navy-900 dark:text-white placeholder-navy-400 pl-10 pr-4 py-2 border border-navy-200 dark:border-navy-800 rounded-xl text-xs focus:outline-none focus:border-[#124c3e] font-mono"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={loadDjangoDB}
                      className="p-2 border border-navy-200 dark:border-navy-800 text-navy-600 dark:text-navy-300 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-all cursor-pointer"
                      title="Sync records"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    {["profiles", "payments", "bookings", "predictions"].includes(currentModelKey) && (
                      <button
                        onClick={handleOpenAddForm}
                        className="px-4 py-2 bg-[#124c3e] hover:bg-emerald-800 text-white font-mono text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Add {MODELS[currentModelKey].name}
                      </button>
                    )}
                  </div>
                </div>

                {/* Django Admin Actions Bar */}
                <div className="px-4 py-3 bg-[#fdfaf2] dark:bg-navy-950/40 border-b border-navy-100 dark:border-navy-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-navy-500 font-bold">Action:</span>
                    <select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 text-navy-800 dark:text-white px-2 py-1.5 rounded focus:outline-none text-xs"
                    >
                      <option value="">---------</option>
                      <option value="delete_selected">Delete selected {MODELS[currentModelKey].plural}</option>
                      
                      {currentModelKey === "bookings" && (
                        <option value="mark_completed">Mark selected bookings as Completed</option>
                      )}
                      {currentModelKey === "payments" && (
                        <option value="mark_successful">Verify select PayFast transactions</option>
                      )}
                      {currentModelKey === "subscriptions" && (
                        <option value="mark_active">Stagger subscription renewal checks</option>
                      )}
                      {currentModelKey === "predictions" && (
                        <option value="celery_predict_retry">Force trigger background Celery predictions retry</option>
                      )}
                      {(currentModelKey === "failed_logins" || currentModelKey === "api_abuse") && (
                        <option value="waf_block_ip">Trigger AWS WAF Firewall blocks on host IP</option>
                      )}
                    </select>
                    <button
                      onClick={handleExecuteAction}
                      className="px-4 py-1.5 bg-[#f5dfb8] hover:bg-amber-200 text-amber-950 border border-amber-300/40 font-black rounded uppercase tracking-wider transition-all text-[11px] cursor-pointer"
                    >
                      Go
                    </button>
                  </div>

                  <div className="text-navy-500 font-bold">
                    {selectedIds.length} of {selectedIds.length} selected
                  </div>
                </div>

                {/* Main Changes-List Data Grid Table */}
                <div className="overflow-x-auto">
                  
                  {/* profiles TABLE */}
                  {currentModelKey === "profiles" && (() => {
                    const filtered = profilesList.filter(p => {
                      const query = searchQuery.toLowerCase();
                      const matchSearch = p.first_name.toLowerCase().includes(query) || p.surname.toLowerCase().includes(query) || p.email.toLowerCase().includes(query) || p.school.toLowerCase().includes(query);
                      const matchRole = roleFilter === "all" ? true : p.role === roleFilter;
                      return matchSearch && matchRole;
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Candidate / Full Name</th>
                            <th className="p-3">Email Address</th>
                            <th className="p-3">Curriculum Grade</th>
                            <th className="p-3">School Centre</th>
                            <th className="p-3">Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleToggleSelect(p.id)} /></td>
                              <td className="p-3 font-bold text-[#124c3e] dark:text-emerald-400">{p.first_name} {p.surname}</td>
                              <td className="p-3 font-semibold text-navy-700 dark:text-navy-300">{p.email}</td>
                              <td className="p-3">{p.grade}</td>
                              <td className="p-3 truncate max-w-[150px]">{p.school}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                  p.role === "admin" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                  p.role === "tutor" ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                                  "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                }`}>
                                  {p.role}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* payments TABLE */}
                  {currentModelKey === "payments" && (() => {
                    const filtered = paymentsList.filter(p => {
                      const query = searchQuery.toLowerCase();
                      const matchSearch = p.transaction_id.toLowerCase().includes(query) || p.payment_method.toLowerCase().includes(query);
                      const matchStatus = statusFilter === "all" ? true : p.status === statusFilter;
                      return matchSearch && matchStatus;
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Transaction ID</th>
                            <th className="p-3">Simulated Gateway</th>
                            <th className="p-3">ZAR Amount</th>
                            <th className="p-3">Time Settled</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleToggleSelect(p.id)} /></td>
                              <td className="p-3 font-bold text-[#124c3e] dark:text-emerald-400">{p.transaction_id}</td>
                              <td className="p-3">{p.payment_method}</td>
                              <td className="p-3 font-bold text-navy-900 dark:text-white">R {p.amount}</td>
                              <td className="p-3 font-medium text-navy-500">{formatDate(p.created_at)}</td>
                              <td className="p-3">
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* bookings TABLE */}
                  {currentModelKey === "bookings" && (() => {
                    const filtered = bookingsList.filter(b => {
                      const query = searchQuery.toLowerCase();
                      const matchSearch = b.booking_reference.toLowerCase().includes(query) || b.lesson_time.includes(query);
                      const matchStatus = statusFilter === "all" ? true : b.status === statusFilter;
                      return matchSearch && matchStatus;
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Order Ref</th>
                            <th className="p-3">Syllabus Topics</th>
                            <th className="p-3">Allocated Date</th>
                            <th className="p-3">Hour Slot</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(b => (
                            <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => handleToggleSelect(b.id)} /></td>
                              <td className="p-3 font-bold text-[#124c3e] dark:text-emerald-400">{b.booking_reference}</td>
                              <td className="p-3 font-semibold truncate max-w-[200px]">{b.topics_to_cover.join(", ")}</td>
                              <td className="p-3">{b.lesson_date}</td>
                              <td className="p-3">{b.lesson_time}</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                  b.status === "confirmed" ? "bg-green-500/10 border-green-500/20 text-green-600 animate-pulse" :
                                  b.status === "completed" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                  "bg-red-500/10 border-red-500/20 text-red-500"
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* predictions TABLE */}
                  {currentModelKey === "predictions" && (() => {
                    const filtered = predictionsList.filter(p => {
                      const query = searchQuery.toLowerCase();
                      const matchSearch = p.student_name.toLowerCase().includes(query) || p.curriculum.toLowerCase().includes(query);
                      const matchCurriculum = curriculumFilter === "all" ? true : p.curriculum === curriculumFilter;
                      return matchSearch && matchCurriculum;
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Syllabus Run</th>
                            <th className="p-3">Paper Target</th>
                            <th className="p-3">Accuracy Match</th>
                            <th className="p-3">S3 Document</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleToggleSelect(p.id)} /></td>
                              <td className="p-3 font-bold text-navy-800 dark:text-navy-200">{p.student_name}</td>
                              <td className="p-3 text-[#124c3e] dark:text-emerald-400 font-extrabold">{p.curriculum}</td>
                              <td className="p-3 uppercase">Paper {p.paper_type} ({p.target_year})</td>
                              <td className="p-3 font-bold text-emerald-600">{p.accuracy_rate}%</td>
                              <td className="p-3 text-[10px] text-[#124c3e] hover:underline cursor-pointer">S3_Watermarked_{p.id}.pdf</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* videos TABLE */}
                  {currentModelKey === "videos" && (() => {
                    const filtered = videosList.filter(v => {
                      const query = searchQuery.toLowerCase();
                      return v.chapter_title.toLowerCase().includes(query) || v.subject.toLowerCase().includes(query);
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Chapter Title</th>
                            <th className="p-3">Curriculum Section</th>
                            <th className="p-3">ZAR Price</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Payment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => handleToggleSelect(v.id)} /></td>
                              <td className="p-3 font-bold text-[#124c3e] dark:text-emerald-400 truncate max-w-[200px]">{v.chapter_title}</td>
                              <td className="p-3 font-medium text-navy-500">{v.subject}</td>
                              <td className="p-3 font-bold">R {v.price}</td>
                              <td className="p-3 font-bold text-navy-800">{v.duration_minutes} Mins</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                  v.payment_status === "paid" ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-red-500/10 border-red-500/20 text-red-500"
                                }`}>
                                  {v.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* subscriptions TABLE */}
                  {currentModelKey === "subscriptions" && (() => {
                    const filtered = subscriptionsList.filter(s => {
                      const query = searchQuery.toLowerCase();
                      return s.student_name.toLowerCase().includes(query) || s.package_name.toLowerCase().includes(query);
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Subscriber student</th>
                            <th className="p-3">Plan Details</th>
                            <th className="p-3">Billing Cycle</th>
                            <th className="p-3">ZAR Cost</th>
                            <th className="p-3">Next Bill Date</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => handleToggleSelect(s.id)} /></td>
                              <td className="p-3 font-bold text-[#124c3e] dark:text-emerald-400">{s.student_name}</td>
                              <td className="p-3 font-medium text-navy-500">{s.package_name}</td>
                              <td className="p-3 uppercase">{s.billing_cycle}</td>
                              <td className="p-3 font-bold">R {s.amount}</td>
                              <td className="p-3 font-medium text-navy-500">{s.next_billing_date}</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                  s.status === "active" ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-red-500/10 border-red-500/20 text-red-500"
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* failed_logins TABLE */}
                  {currentModelKey === "failed_logins" && (() => {
                    const filtered = failedLogins.filter(f => {
                      const query = searchQuery.toLowerCase();
                      return f.ip_address.toLowerCase().includes(query) || f.username.toLowerCase().includes(query);
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Suspicious IP Host</th>
                            <th className="p-3">Attempted User</th>
                            <th className="p-3">Geolocation Location</th>
                            <th className="p-3">Timestamp SAST</th>
                            <th className="p-3">Threat Level</th>
                            <th className="p-3">Action Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(f => (
                            <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(f.id)} onChange={() => handleToggleSelect(f.id)} /></td>
                              <td className="p-3 font-bold text-red-600">{f.ip_address}</td>
                              <td className="p-3 font-bold text-[#124c3e] dark:text-emerald-400">{f.username}</td>
                              <td className="p-3 font-medium text-navy-500">{f.country}</td>
                              <td className="p-3 font-medium text-navy-400">{formatDate(f.timestamp)}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                                  f.threat_level === "high" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                                }`}>
                                  {f.threat_level}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border bg-red-500/10 border-red-500/20 text-red-500">
                                  {f.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* api_abuse TABLE */}
                  {currentModelKey === "api_abuse" && (() => {
                    const filtered = apiAbuseList.filter(a => {
                      const query = searchQuery.toLowerCase();
                      return a.ip_address.toLowerCase().includes(query) || a.type.toLowerCase().includes(query);
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Attacker IP Host</th>
                            <th className="p-3">WAF Intercept Event</th>
                            <th className="p-3">Target URL</th>
                            <th className="p-3">Payload Details</th>
                            <th className="p-3">Timestamp SAST</th>
                            <th className="p-3">WAF Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(a => (
                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => handleToggleSelect(a.id)} /></td>
                              <td className="p-3 font-bold text-red-600">{a.ip_address}</td>
                              <td className="p-3 font-extrabold text-[#124c3e] dark:text-emerald-400 uppercase tracking-wider">{a.type}</td>
                              <td className="p-3 font-semibold text-navy-700 dark:text-navy-300">{a.url}</td>
                              <td className="p-3 truncate max-w-[150px] font-mono text-[10px]">{a.rule_matched}</td>
                              <td className="p-3 font-medium text-navy-400">{formatDate(a.timestamp)}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                                  a.status === "blocked" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                                }`}>
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* logs TABLE */}
                  {currentModelKey === "logs" && (() => {
                    const filtered = activityLogs.filter(l => {
                      const query = searchQuery.toLowerCase();
                      return l.user_name.toLowerCase().includes(query) || l.action.toLowerCase().includes(query);
                    });

                    return (
                      <table className="w-full text-left font-mono text-xs divide-y divide-navy-100 dark:divide-navy-850">
                        <thead className="bg-[#f8f9fa] dark:bg-navy-950 text-navy-500 uppercase tracking-tight text-[10px] font-bold">
                          <tr>
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => handleToggleSelectAll(filtered.map(f => f.id))} />
                            </th>
                            <th className="p-3">Actor Admin</th>
                            <th className="p-3">Action Event</th>
                            <th className="p-3">Metadata / Details</th>
                            <th className="p-3">Timestamp SAST</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50 dark:divide-navy-850">
                          {filtered.map(l => (
                            <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition-colors">
                              <td className="p-3"><input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => handleToggleSelect(l.id)} /></td>
                              <td className="p-3 font-bold text-[#124c3e] dark:text-emerald-400">{l.user_name}</td>
                              <td className="p-3 font-bold text-navy-800 dark:text-navy-200">{l.action}</td>
                              <td className="p-3 truncate max-w-[250px] font-medium text-navy-500">{l.details}</td>
                              <td className="p-3 font-medium text-navy-400">{formatDate(l.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* Empty state filter fallback */}
                  {((currentModelKey === "profiles" && profilesList.length === 0) ||
                    (currentModelKey === "payments" && paymentsList.length === 0) ||
                    (currentModelKey === "bookings" && bookingsList.length === 0) ||
                    (currentModelKey === "predictions" && predictionsList.length === 0) ||
                    (currentModelKey === "failed_logins" && failedLogins.length === 0) ||
                    (currentModelKey === "api_abuse" && apiAbuseList.length === 0)) && (
                    <div className="py-16 text-center text-navy-400 space-y-2">
                      <AlertCircle className="w-10 h-10 mx-auto opacity-50" />
                      <p className="font-bold">No operational records found matching the criteria.</p>
                    </div>
                  )}

                </div>

                {/* Django Change list Pagination footer */}
                <div className="p-4 border-t border-navy-100 dark:border-navy-850 bg-[#f8f9fa] dark:bg-navy-950 flex justify-between items-center text-xs font-mono">
                  <div className="text-navy-500 font-bold">1 model index page</div>
                  <div className="flex gap-1.5 text-navy-700">
                    <span className="px-2.5 py-1 bg-white border border-navy-200 rounded text-navy-400">Previous</span>
                    <span className="px-3 py-1 bg-[#124c3e] text-white border border-emerald-800 rounded font-bold">1</span>
                    <span className="px-2.5 py-1 bg-white border border-navy-200 rounded text-navy-400">Next</span>
                  </div>
                </div>

              </div>

              {/* Right Side: Django Admin Model Filter Rails */}
              <div className="lg:col-span-3 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-left">
                <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider border-b border-navy-100 dark:border-navy-850 pb-2.5 flex items-center gap-1.5 mb-4">
                  <Filter className="w-4 h-4 text-[#124c3e]" />
                  Filter Change-List
                </h3>

                <div className="space-y-6 font-mono text-xs text-navy-700 dark:text-navy-300">
                  
                  {/* Profiles App Filter options */}
                  {currentModelKey === "profiles" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-navy-400 block uppercase">By Operational Role:</span>
                        <div className="space-y-1 pl-1">
                          <button onClick={() => setRoleFilter("all")} className={`block text-left w-full truncate ${roleFilter === "all" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>All Roles</button>
                          <button onClick={() => setRoleFilter("student")} className={`block text-left w-full truncate ${roleFilter === "student" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Learner Upgrade</button>
                          <button onClick={() => setRoleFilter("tutor")} className={`block text-left w-full truncate ${roleFilter === "tutor" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Staff Tutor</button>
                          <button onClick={() => setRoleFilter("admin")} className={`block text-left w-full truncate ${roleFilter === "admin" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Root Administrator</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Predictions App Filter options */}
                  {currentModelKey === "predictions" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-navy-400 block uppercase">By CAPS / IEB Syllabus:</span>
                        <div className="space-y-1 pl-1">
                          <button onClick={() => setCurriculumFilter("all")} className={`block text-left w-full truncate ${curriculumFilter === "all" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>All Curriculums</button>
                          <button onClick={() => setCurriculumFilter("CAPS")} className={`block text-left w-full truncate ${curriculumFilter === "CAPS" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>NSC (CAPS) Grade 10-12</button>
                          <button onClick={() => setCurriculumFilter("IEB")} className={`block text-left w-full truncate ${curriculumFilter === "IEB" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>IEB Independent Board</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Status Filters */}
                  {["payments", "bookings", "subscriptions"].includes(currentModelKey) && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-navy-400 block uppercase">By Transaction Status:</span>
                        <div className="space-y-1 pl-1">
                          <button onClick={() => setStatusFilter("all")} className={`block text-left w-full truncate ${statusFilter === "all" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>All Transactions</button>
                          <button onClick={() => setStatusFilter("successful")} className={`block text-left w-full truncate ${statusFilter === "successful" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Settled Successfully</button>
                          <button onClick={() => setStatusFilter("confirmed")} className={`block text-left w-full truncate ${statusFilter === "confirmed" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Confirmed Bookings</button>
                          <button onClick={() => setStatusFilter("completed")} className={`block text-left w-full truncate ${statusFilter === "completed" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Completed Sessions</button>
                          <button onClick={() => setStatusFilter("active")} className={`block text-left w-full truncate ${statusFilter === "active" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Active Subscriptions</button>
                          <button onClick={() => setStatusFilter("past_due")} className={`block text-left w-full truncate ${statusFilter === "past_due" ? "text-[#124c3e] font-black border-l-2 border-[#124c3e] pl-1.5" : "hover:underline"}`}>Past Due / Blocked</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generic System/Logs details */}
                  {!["profiles", "predictions", "payments", "bookings", "subscriptions"].includes(currentModelKey) && (
                    <div className="space-y-3 font-mono text-[11px] leading-relaxed text-navy-500">
                      <p>Currently viewing static database operational rows. Filters are disabled on system health indices.</p>
                      <p className="text-emerald-600 font-bold">To update telemetry configurations, run management script inside Django BASH console.</p>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* ==================== DJANGO ADD / EDIT MODEL POPUP FORM ==================== */}
      {showAddModal && currentModelKey && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-navy-200 dark:border-navy-800 text-left"
          >
            {/* Form Header styled in classic Django teal */}
            <div className="bg-[#124c3e] text-white p-4 font-mono font-black text-xs uppercase tracking-wider">
              Add new {MODELS[currentModelKey].name}
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs font-mono">
              
              {currentModelKey === "profiles" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">First Name:</label>
                    <input type="text" required value={formFields.first_name} onChange={(e) => setFormFields({...formFields, first_name: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Surname:</label>
                    <input type="text" required value={formFields.surname} onChange={(e) => setFormFields({...formFields, surname: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Email Address:</label>
                    <input type="email" required value={formFields.email} onChange={(e) => setFormFields({...formFields, email: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">School Name:</label>
                    <input type="text" required value={formFields.school} onChange={(e) => setFormFields({...formFields, school: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-navy-500 font-bold">Syllabus Grade:</label>
                      <select value={formFields.grade} onChange={(e) => setFormFields({...formFields, grade: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none">
                        <option value="Grade 12 CAPS">Grade 12 CAPS</option>
                        <option value="Grade 12 IEB">Grade 12 IEB</option>
                        <option value="Matric Upgrade">Matric Upgrade</option>
                        <option value="AP Mathematics">AP Mathematics</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-navy-500 font-bold">Role Type:</label>
                      <select value={formFields.role} onChange={(e) => setFormFields({...formFields, role: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none">
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {currentModelKey === "payments" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Student Name:</label>
                    <input type="text" required value={formFields.student_name} onChange={(e) => setFormFields({...formFields, student_name: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" placeholder="e.g. Sipho Ndlovu" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">ZAR Amount (R):</label>
                    <input type="number" required value={formFields.amount} onChange={(e) => setFormFields({...formFields, amount: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Payment Gateway:</label>
                    <select value={formFields.method} onChange={(e) => setFormFields({...formFields, method: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none">
                      <option value="Instant EFT (PayFast)">Instant EFT (PayFast)</option>
                      <option value="Credit Card (PayFast)">Credit Card (PayFast)</option>
                      <option value="Local South African EFT">Local South African EFT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">PayFast Receipt Reference:</label>
                    <input type="text" required value={formFields.reference} onChange={(e) => setFormFields({...formFields, reference: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                </>
              )}

              {currentModelKey === "bookings" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Student Candidate:</label>
                    <input type="text" required value={formFields.student_name} onChange={(e) => setFormFields({...formFields, student_name: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-navy-500 font-bold">Lesson Date:</label>
                      <input type="date" required value={formFields.lesson_date} onChange={(e) => setFormFields({...formFields, lesson_date: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-navy-500 font-bold">Hour Slot:</label>
                      <input type="text" required value={formFields.lesson_time} onChange={(e) => setFormFields({...formFields, lesson_time: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" placeholder="e.g. 15:00 - 16:00" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Syllabus Topics to Cover:</label>
                    <input type="text" required value={formFields.topics} onChange={(e) => setFormFields({...formFields, topics: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" placeholder="e.g. Differential calculus optimization, derivatives" />
                  </div>
                </>
              )}

              {currentModelKey === "predictions" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Student Candidate:</label>
                    <input type="text" required value={formFields.student_name} onChange={(e) => setFormFields({...formFields, student_name: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-navy-500 font-bold">Syllabus:</label>
                      <select value={formFields.curriculum} onChange={(e) => setFormFields({...formFields, curriculum: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none">
                        <option value="CAPS">NSC (CAPS)</option>
                        <option value="IEB">IEB Independent</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-navy-500 font-bold">Paper Target:</label>
                      <select value={formFields.paper_type} onChange={(e) => setFormFields({...formFields, paper_type: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none">
                        <option value="p1">Paper 1 (Calculus)</option>
                        <option value="p2">Paper 2 (Geometry)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-500 font-bold">Trend Analysis Match (%):</label>
                    <input type="number" required value={formFields.accuracy_rate} onChange={(e) => setFormFields({...formFields, accuracy_rate: e.target.value})} className="w-full bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 border border-navy-200 dark:border-navy-800 rounded focus:outline-none" min="50" max="100" />
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-4 justify-end border-t border-navy-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:bg-slate-50 dark:hover:bg-navy-850 rounded text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#124c3e] hover:bg-emerald-800 text-white font-bold rounded text-xs transition-all cursor-pointer"
                >
                  Save Row
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
