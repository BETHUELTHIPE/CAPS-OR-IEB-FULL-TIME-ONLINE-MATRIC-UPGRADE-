import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import {
  AlertTriangle, CheckCircle, Clock, User, Server, Plus, Download,
  Search, Filter, Send, Activity, FileText, Terminal, ArrowRight,
  Trash2, ShieldAlert, Edit, Save, RefreshCw, Cpu, Database, Zap,
  X, Check, AlertCircle, Sparkles, Network, BookOpen
} from "lucide-react";

// Structure definition of an incident
export interface IncidentTimelineEvent {
  id: string;
  timestamp: string; // e.g. "09:05"
  message: string;
  author: string;
}

export interface SystemIncident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "mitigated" | "resolved";
  component: string; // Database, Cache, Payment, SMTP, Video Streaming, Classroom Canvas
  assignedTo: string;
  date: string; // e.g. "2026-07-18"
  time: string; // e.g. "09:00"
  description: string;
  rootCause: string;
  resolution: string;
  downtimeMinutes: number;
  studentsAffected: number;
  failedRequestsCount: number;
  timeline: IncidentTimelineEvent[];
}

export const IncidentResponseCenter: React.FC = () => {
  // Database keys mapping
  const DB_KEY = "amh_incidents";

  // State hook for storing loaded incidents
  const [incidents, setIncidents] = useState<SystemIncident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [componentFilter, setComponentFilter] = useState<string>("all");

  // Create Incident Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newSeverity, setNewSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [newStatus, setNewStatus] = useState<"open" | "investigating" | "mitigated" | "resolved">("open");
  const [newComponent, setNewComponent] = useState<string>("Database");
  const [newAssignee, setNewAssignee] = useState<string>("Bethuel Thipe");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newRootCause, setNewRootCause] = useState<string>("");
  const [newResolution, setNewResolution] = useState<string>("");
  const [newDowntime, setNewDowntime] = useState<number>(0);
  const [newStudentsAffected, setNewStudentsAffected] = useState<number>(0);

  // Edit fields state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editSeverity, setEditSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [editStatus, setEditStatus] = useState<"open" | "investigating" | "mitigated" | "resolved">("open");
  const [editComponent, setEditComponent] = useState<string>("");
  const [editAssignee, setEditAssignee] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editRootCause, setEditRootCause] = useState<string>("");
  const [editResolution, setEditResolution] = useState<string>("");
  const [editDowntime, setEditDowntime] = useState<number>(0);
  const [editStudentsAffected, setEditStudentsAffected] = useState<number>(0);

  // Custom Timeline addition state
  const [timelineTime, setTimelineTime] = useState<string>("");
  const [timelineMsg, setTimelineMsg] = useState<string>("");
  const [timelineAuthor, setTimelineAuthor] = useState<string>("Bethuel Thipe");

  // Notifications Toast list
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: "alert" | "success" }[]>([]);

  // Load baseline incidents on mount if not in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SystemIncident[];
        setIncidents(parsed);
        if (parsed.length > 0) {
          setSelectedIncidentId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse incidents, loading seed data", e);
        loadSeedData();
      }
    } else {
      loadSeedData();
    }
  }, []);

  const loadSeedData = () => {
    const seed: SystemIncident[] = [
      {
        id: "INC-2026-001",
        title: "PostgreSQL Connection Limit Exhausted in Johannesburg Region",
        severity: "critical",
        status: "resolved",
        component: "Database",
        assignedTo: "Thabo Mokoena",
        date: "2026-07-18",
        time: "09:00",
        description: "Grade 12 Calculus workbook uploads collided with 2,400 concurrent matriculants requesting performance prediction trial score charts. The pg_stat_activity logs revealed 100% database connection limit exhaustion.",
        rootCause: "Database connection pool allocation size limits on Gunicorn/Express web servers were locked at 20 instead of scaling on-demand. Lacked a proper connection pool proxy middleware.",
        resolution: "Provisioned and deployed pgBouncer middleware to pool requests and increased connection ceiling parameters to 150. Flushed blocked sessions cleanly.",
        downtimeMinutes: 12,
        studentsAffected: 1450,
        failedRequestsCount: 820,
        timeline: [
          { id: "e1", timestamp: "09:00", message: "Automated Prometheus alert fired: PostgreSQL active connections > 95%", author: "System Monitor" },
          { id: "e2", timestamp: "09:03", message: "On-call engineer Thabo Mokoena acknowledged and initiated core dump triage", author: "Thabo Mokoena" },
          { id: "e3", timestamp: "09:07", message: "Isolated and throttled un-cached algebra study guide lookups to save server CPU", author: "Thabo Mokoena" },
          { id: "e4", timestamp: "09:10", message: "Enabled pgBouncer connection manager proxy and adjusted system configs", author: "Thabo Mokoena" },
          { id: "e5", timestamp: "09:12", message: "Connections returned to nominal state. Verified CAPS homework portal is responsive", author: "Thabo Mokoena" }
        ]
      },
      {
        id: "INC-2026-002",
        title: "PayFast Secure EFT Webhook Signature Decryption Malfunctions",
        severity: "high",
        status: "resolved",
        component: "Payment",
        assignedTo: "Bethuel Thipe",
        date: "2026-07-15",
        time: "14:20",
        description: "Webhook callback requests sent by PayFast after immediate student payment checkouts failed SSL and signature decryption. This prevented automated student profile package unlocks.",
        rootCause: "PayFast updated their external secure root certificate authorities. The server trust store was using outdated certificate references which failed TLS checks.",
        resolution: "Manually re-synchronized server trust store bundle parameters, updated decrypted hash constants, and queued backlog of 28 payments to process.",
        downtimeMinutes: 0,
        studentsAffected: 85,
        failedRequestsCount: 28,
        timeline: [
          { id: "e6", timestamp: "14:20", message: "Sentry alert triggered: webhooks signature verification failed consistently", author: "System Monitor" },
          { id: "e7", timestamp: "14:25", message: "Bethuel Thipe analyzed transaction payload files in the telemetry log", author: "Bethuel Thipe" },
          { id: "e8", timestamp: "14:32", message: "Validated certificate mismatch on the PayFast webhook SSL handshake", author: "Bethuel Thipe" },
          { id: "e9", timestamp: "14:38", message: "Imported the new root SSL bundle and completed signature processing checks", author: "Bethuel Thipe" },
          { id: "e10", timestamp: "14:40", message: "All outstanding workshop bookings successfully auto-unlocked and marked paid", author: "Bethuel Thipe" }
        ]
      },
      {
        id: "INC-2026-003",
        title: "Redis Cache Eviction Overload on IEB/CAPS Formula sheets",
        severity: "medium",
        status: "investigating",
        component: "Cache",
        assignedTo: "Naledi Nkosi",
        date: "2026-07-19",
        time: "08:15",
        description: "Massive influx of Grade 11 Analytical Geometry search queries caused rapid eviction of Grade 12 Euclidean Geometry PDF cheat-sheets, increasing average page load times.",
        rootCause: "The Redis instance maxmemory policy is set to volatile-lru under low memory resources, leading to hot key evictions.",
        resolution: "Reviewing configuration commands to adjust maxmemory parameter to 1GB and change strategy to volatile-lru.",
        downtimeMinutes: 0,
        studentsAffected: 620,
        failedRequestsCount: 110,
        timeline: [
          { id: "e11", timestamp: "08:15", message: "Redis cache hit ratio metric dropped sharply from 95% down to 48%", author: "System Monitor" },
          { id: "e12", timestamp: "08:22", message: "Naledi Nkosi assigned to monitor memory allocation parameters and hot keys", author: "Naledi Nkosi" }
        ]
      }
    ];

    setIncidents(seed);
    saveIncidentsToDB(seed);
    setSelectedIncidentId(seed[0].id);
  };

  const saveIncidentsToDB = (data: SystemIncident[]) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  };

  // Toast Notification Generator
  const triggerToast = (text: string, type: "alert" | "success") => {
    const id = `toast-${Math.random().toString(36).substr(2, 5)}`;
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Set selected incident fields for editing
  const handleStartEdit = (inc: SystemIncident) => {
    setEditTitle(inc.title);
    setEditSeverity(inc.severity);
    setEditStatus(inc.status);
    setEditComponent(inc.component);
    setEditAssignee(inc.assignedTo);
    setEditDescription(inc.description);
    setEditRootCause(inc.rootCause);
    setEditResolution(inc.resolution);
    setEditDowntime(inc.downtimeMinutes);
    setEditStudentsAffected(inc.studentsAffected);
    setIsEditing(true);
  };

  // Save edited incident
  const handleSaveEdit = (id: string) => {
    const updated = incidents.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          title: editTitle,
          severity: editSeverity,
          status: editStatus,
          component: editComponent,
          assignedTo: editAssignee,
          description: editDescription,
          rootCause: editRootCause,
          resolution: editResolution,
          downtimeMinutes: editDowntime,
          studentsAffected: editStudentsAffected
        };
      }
      return inc;
    });

    setIncidents(updated);
    saveIncidentsToDB(updated);
    setIsEditing(false);
    triggerToast(`Incident details updated successfully`, "success");
  };

  // Add timeline event
  const handleAddTimelineEvent = (incidentId: string) => {
    if (!timelineTime || !timelineMsg) {
      triggerToast("Please provide both time and message parameters", "alert");
      return;
    }

    const updated = incidents.map(inc => {
      if (inc.id === incidentId) {
        const newEvent: IncidentTimelineEvent = {
          id: `e-${Date.now()}`,
          timestamp: timelineTime,
          message: timelineMsg,
          author: timelineAuthor
        };
        return {
          ...inc,
          timeline: [...inc.timeline, newEvent]
        };
      }
      return inc;
    });

    setIncidents(updated);
    saveIncidentsToDB(updated);
    setTimelineTime("");
    setTimelineMsg("");
    triggerToast("Custom timeline milestone logged", "success");
  };

  // Delete timeline event
  const handleDeleteTimelineEvent = (incidentId: string, eventId: string) => {
    const updated = incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          timeline: inc.timeline.filter(ev => ev.id !== eventId)
        };
      }
      return inc;
    });
    setIncidents(updated);
    saveIncidentsToDB(updated);
    triggerToast("Timeline event deleted", "success");
  };

  // Create manual incident
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      triggerToast("Please fill in the title and description fields", "alert");
      return;
    }

    const newId = `INC-2026-${String(incidents.length + 1).padStart(3, "0")}`;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5);

    const newlyCreated: SystemIncident = {
      id: newId,
      title: newTitle,
      severity: newSeverity,
      status: newStatus,
      component: newComponent,
      assignedTo: newAssignee,
      date: dateStr,
      time: timeStr,
      description: newDescription,
      rootCause: newRootCause || "Undergoing active investigation...",
      resolution: newResolution || "Awaiting action remediation plan...",
      downtimeMinutes: newDowntime,
      studentsAffected: newStudentsAffected,
      failedRequestsCount: 0,
      timeline: [
        { id: `e-${Date.now()}`, timestamp: timeStr, message: `Incident logged manually: ${newTitle}`, author: "System Log" }
      ]
    };

    const nextIncidents = [newlyCreated, ...incidents];
    setIncidents(nextIncidents);
    saveIncidentsToDB(nextIncidents);
    setSelectedIncidentId(newId);

    // Reset fields
    setNewTitle("");
    setNewDescription("");
    setNewRootCause("");
    setNewResolution("");
    setNewDowntime(0);
    setNewStudentsAffected(0);
    setIsCreateModalOpen(false);

    triggerToast(`New incident ${newId} logged successfully`, "success");
  };

  // Delete incident
  const handleDeleteIncident = (id: string) => {
    if (confirm(`Are you sure you want to delete incident ${id}?`)) {
      const next = incidents.filter(i => i.id !== id);
      setIncidents(next);
      saveIncidentsToDB(next);
      if (selectedIncidentId === id) {
        setSelectedIncidentId(next.length > 0 ? next[0].id : null);
      }
      triggerToast(`Incident ${id} deleted from database`, "success");
    }
  };

  // Trigger Mock Incident Sandbox Actions
  const handleTriggerMockIncident = (type: "smtp_fail" | "ws_crash" | "pay_timeout") => {
    let mockTitle = "";
    let mockComp = "";
    let mockDesc = "";
    let mockSeverity: "critical" | "high" | "medium" | "low" = "high";

    switch (type) {
      case "smtp_fail":
        mockTitle = "Nodemailer SMTP Connection Timeout on Outlook Relay Gateways";
        mockComp = "SMTP";
        mockDesc = "System failed to dispatch 420 automated CAPS registration and payment confirmation emails. SMTP host address 'smtp.amaris.co.za' failed to respond under 5000ms threshold during peak morning study workshops.";
        mockSeverity = "high";
        break;
      case "ws_crash":
        mockTitle = "WebSocket Live Whiteboard Canvas State Desynchronization Spike";
        mockComp = "Classroom Canvas";
        mockDesc = "Live interactive vector lines were failing to sync across tutoring classrooms. Students reported drawing lag exceeding 12 seconds followed by total frame disconnected states.";
        mockSeverity = "critical";
        break;
      case "pay_timeout":
        mockTitle = "PayFast checkout container memory exhaustion loop";
        mockComp = "Payment";
        mockDesc = "Simulated load spikes on PayFast gateway redirect links triggered excessive garbage collection pauses in the payment server process core, capping system CPU at 98%.";
        mockSeverity = "high";
        break;
    }

    const newId = `INC-2026-${String(incidents.length + 1).padStart(3, "0")}`;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5);

    const mockInc: SystemIncident = {
      id: newId,
      title: mockTitle,
      severity: mockSeverity,
      status: "open",
      component: mockComp,
      assignedTo: "Bethuel Thipe",
      date: dateStr,
      time: timeStr,
      description: mockDesc,
      rootCause: "Under investigation. Triage system scanning active process registers...",
      resolution: "Awaiting remediation steps...",
      downtimeMinutes: 0,
      studentsAffected: Math.floor(Math.random() * 800) + 100,
      failedRequestsCount: Math.floor(Math.random() * 250) + 40,
      timeline: [
        { id: `e-${Date.now()}`, timestamp: timeStr, message: `System Alert: Triggered telemetry incident for ${mockTitle}`, author: "Datadog Telemetry" }
      ]
    };

    const nextIncidents = [mockInc, ...incidents];
    setIncidents(nextIncidents);
    saveIncidentsToDB(nextIncidents);
    setSelectedIncidentId(newId);

    triggerToast(`🚨 CRITICAL TRACE: ${mockTitle} is active!`, "alert");
  };

  // Generate beautiful PDF postmortem using jsPDF
  const handleExportPdfPostmortem = (inc: SystemIncident) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Style Constants
      const primaryColor = [30, 58, 138]; // Dark Navy (#1e3a8a)
      const accentColor = [197, 160, 89]; // Gold (#c5a059)
      const neutralDark = [33, 41, 54]; // Slate Charcoal
      const bgLight = [248, 250, 252]; // Soft off-white Slate-50

      // PAGE HEADER DESIGN
      // Top Navy Header Box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 38, "F");

      // Top Gold Accent Bar
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 38, 210, 3, "F");

      // Title Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AMARIS MATHEMATICS HUB — CAPS/IEB PORTAL", 15, 16);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(219, 234, 254); // Light blue
      doc.text("OFFICIAL ROOT CAUSE & OPERATIONS POSTMORTEM REPORT", 15, 22);

      doc.setFont("Courier", "bold");
      doc.setFontSize(10);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`INCIDENT STATUS: ${inc.status.toUpperCase()} | SEVERITY: ${inc.severity.toUpperCase()}`, 15, 30);

      // Metas Panel (Right aligned in header)
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`ID: ${inc.id}`, 155, 16);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Date: ${inc.date} ${inc.time}`, 155, 22);
      doc.text(`Classroom Zone: South Africa`, 155, 28);

      // BODY CONTENT
      let currentY = 50;

      // Incident Title block
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      doc.text("1. EXECUTIVE INCIDENT TITLE", 15, currentY);
      
      currentY += 6;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      // Wrap Title text
      const splitTitle = doc.splitTextToSize(inc.title, 180);
      doc.text(splitTitle, 15, currentY);
      
      currentY += (splitTitle.length * 5) + 3;

      // Details Table Mock Block
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.rect(15, currentY, 180, 24, "F");
      doc.setDrawColor(226, 232, 240); // border gray
      doc.rect(15, currentY, 180, 24, "S");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // Gray label
      
      doc.text("AFFECTED MODULE", 20, currentY + 6);
      doc.text("ASSIGNED ENGINEER", 70, currentY + 6);
      doc.text("TOTAL DOWNTIME", 125, currentY + 6);
      doc.text("STUDENTS AFFECTED", 165, currentY + 6);

      doc.setFont("Courier", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      
      doc.text(inc.component.toUpperCase(), 20, currentY + 14);
      doc.text(inc.assignedTo.toUpperCase(), 70, currentY + 14);
      doc.text(`${inc.downtimeMinutes} MINUTES`, 125, currentY + 14);
      doc.text(`${inc.studentsAffected} USERS`, 165, currentY + 14);

      currentY += 34;

      // 2. Incident Description
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      doc.text("2. FAILURE SYMPTOM DESCRIPTION", 15, currentY);
      
      currentY += 5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const splitDesc = doc.splitTextToSize(inc.description, 180);
      doc.text(splitDesc, 15, currentY);

      currentY += (splitDesc.length * 4.5) + 6;

      // 3. Root Cause
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      doc.text("3. DIAGNOSTIC ROOT CAUSE ANALYSIS (RCA)", 15, currentY);
      
      currentY += 5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const splitRoot = doc.splitTextToSize(inc.rootCause, 180);
      doc.text(splitRoot, 15, currentY);

      currentY += (splitRoot.length * 4.5) + 6;

      // 4. Action Taken & Resolution
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      doc.text("4. REMEDIATION ACTION PLAN & RESOLUTION", 15, currentY);
      
      currentY += 5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const splitRes = doc.splitTextToSize(inc.resolution, 180);
      doc.text(splitRes, 15, currentY);

      currentY += (splitRes.length * 4.5) + 8;

      // 5. Timeline of recovery steps
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      doc.text("5. CHRONOLOGICAL RECOVERY TIMELINE LOG", 15, currentY);

      currentY += 5;
      inc.timeline.forEach((item, index) => {
        if (currentY > 275) {
          doc.addPage();
          currentY = 25;
        }
        
        doc.setFont("Courier", "bold");
        doc.setFontSize(9);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(`[${item.timestamp} SAST]`, 15, currentY);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const textWidth = doc.splitTextToSize(`${item.message} (Logged by: ${item.author})`, 145);
        doc.text(textWidth, 42, currentY);

        // draw small timeline node circles
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(38, currentY - 1, 1, "F");

        currentY += (textWidth.length * 4) + 2.5;
      });

      currentY += 8;
      if (currentY > 265) {
        doc.addPage();
        currentY = 25;
      }

      // Sign-off
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY, 195, currentY);
      
      currentY += 8;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("PREPARED BY:", 15, currentY);
      doc.text("VERIFIED BY EXECUTIVE ADMIN:", 110, currentY);

      currentY += 12;
      doc.setFont("Courier", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      doc.text(inc.assignedTo.toUpperCase(), 15, currentY);
      doc.text("BETHUEL THIPE (CHIEF OPERATIONS)", 110, currentY);

      currentY += 4;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("ON-CALL REMEDIATION LEAD SIGN-OFF", 15, currentY);
      doc.text("AMARIS SYSTEM SRE OPERATIONS TEAM", 110, currentY);

      // Save output
      doc.save(`AMH-Postmortem-${inc.id}.pdf`);
      triggerToast(`Postmortem PDF for ${inc.id} downloaded!`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to generate PDF postmortem document", "alert");
    }
  };

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Filtering incidents
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || inc.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || inc.severity === severityFilter;
    const matchesComponent = componentFilter === "all" || inc.component.toLowerCase() === componentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSeverity && matchesComponent;
  });

  // Derived KPI metrics
  const totalCount = incidents.length;
  const activeCount = incidents.filter(i => i.status === "open" || i.status === "investigating").length;
  const mitigatedCount = incidents.filter(i => i.status === "mitigated").length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;
  
  const totalDowntime = incidents.reduce((acc, curr) => acc + curr.downtimeMinutes, 0);
  const avgDowntime = totalCount > 0 ? (totalDowntime / totalCount).toFixed(1) : "0";
  const totalAffectedStudents = incidents.reduce((acc, curr) => acc + curr.studentsAffected, 0);

  const getSeverityColor = (sev: "critical" | "high" | "medium" | "low") => {
    switch (sev) {
      case "critical":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-royal-500/15 text-royal-600 dark:text-royal-400 border-royal-500/30";
      case "low":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
  };

  const getStatusBadge = (stat: "open" | "investigating" | "mitigated" | "resolved") => {
    switch (stat) {
      case "open":
        return "bg-rose-500/20 text-rose-500 border border-rose-500/30 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded";
      case "investigating":
        return "bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded animate-pulse";
      case "mitigated":
        return "bg-royal-500/20 text-royal-500 border border-royal-500/30 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded";
      case "resolved":
        return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded";
    }
  };

  return (
    <div className="space-y-6 text-left relative" id="amh-incident-response-center">
      {/* Toast notifications */}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none" id="incident-toasts-container">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-3.5 rounded-xl border shadow-lg text-xs font-bold pointer-events-auto flex items-center gap-2.5 max-w-sm ${
                n.type === "alert" 
                  ? "bg-rose-950/95 text-rose-300 border-rose-800" 
                  : "bg-navy-950/95 text-emerald-400 border-emerald-800"
              }`}
            >
              {n.type === "alert" ? <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" /> : <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />}
              <span>{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header section */}
      <div className="border-b border-navy-150 dark:border-navy-800 pb-4 space-y-1" id="incident-header-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-wider font-sans flex items-center gap-2">
                Incident Response Command Center
              </h2>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Track, assign, and resolve active CAPS/IEB platform bottlenecks, memory spikes, and payment callback errors in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-log-manual-incident"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Manual Incident
            </button>
            <button
              type="button"
              id="btn-reset-seed-incidents"
              onClick={loadSeedData}
              className="p-2 border border-navy-200 dark:border-navy-800 text-navy-600 dark:text-navy-400 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800 transition-all cursor-pointer"
              title="Reset Seed Incidents"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* System Health KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-rose-500/15 border border-rose-500/20 text-rose-500 rounded-lg shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-navy-400 block uppercase">Active Backlog</span>
            <span className="text-xl font-black text-navy-900 dark:text-white font-mono">{activeCount} Incidents</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 rounded-lg shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-navy-400 block uppercase">Resolved Total</span>
            <span className="text-xl font-black text-navy-900 dark:text-white font-mono">{resolvedCount} cases</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded-lg shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-navy-400 block uppercase">Avg MTTR</span>
            <span className="text-xl font-black text-navy-900 dark:text-white font-mono">{avgDowntime} mins</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-royal-500/15 border border-royal-500/20 text-royal-500 rounded-lg shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-navy-400 block uppercase">Students Affected</span>
            <span className="text-xl font-black text-navy-900 dark:text-white font-mono">{totalAffectedStudents} users</span>
          </div>
        </div>
      </div>

      {/* Mock Incident Simulator Sandbox Section */}
      <div className="bg-navy-950 text-white p-4 rounded-2xl border border-navy-850 shadow-sm space-y-3" id="mock-incident-sandbox">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-gold-500/15 border border-gold-500/30 text-gold-400 rounded-lg">
              <Terminal className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-mono font-black text-gold-400 uppercase tracking-widest">
              Simulated Load Spike Incident Spawner Sandbox
            </h3>
          </div>
          <span className="text-[9px] font-mono text-navy-400 uppercase">Emergency Testing Area</span>
        </div>
        <p className="text-xs text-navy-300">
          Inject active CAPS workspace failures into local monitoring states. Triggering an incident logs a trace in localStorage and displays an alert.
        </p>
        <div className="flex flex-wrap gap-2 pt-1" id="sandbox-triggers-row">
          <button
            type="button"
            id="btn-trigger-smtp-fail"
            onClick={() => handleTriggerMockIncident("smtp_fail")}
            className="px-3 py-2 bg-navy-900 hover:bg-navy-800 border border-navy-800 hover:border-gold-400 rounded-xl text-[10px] font-mono text-navy-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Trigger SMTP Gateway Timeout
          </button>
          <button
            type="button"
            id="btn-trigger-ws-crash"
            onClick={() => handleTriggerMockIncident("ws_crash")}
            className="px-3 py-2 bg-navy-900 hover:bg-navy-800 border border-navy-800 hover:border-rose-500 rounded-xl text-[10px] font-mono text-navy-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Network className="w-3.5 h-3.5 text-rose-500" />
            Trigger Whiteboard WebSocket Crash
          </button>
          <button
            type="button"
            id="btn-trigger-pay-timeout"
            onClick={() => handleTriggerMockIncident("pay_timeout")}
            className="px-3 py-2 bg-navy-900 hover:bg-navy-800 border border-navy-800 hover:border-royal-500 rounded-xl text-[10px] font-mono text-navy-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-royal-500" />
            Trigger PayFast redirections Loop
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-4 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-center" id="incident-filters-bar">
        {/* Search */}
        <div className="md:col-span-4 relative" id="search-input-wrapper">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-incident-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active trace logs or IDs..."
            className="w-full pl-9 pr-3 py-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none focus:border-royal-600 focus:bg-white dark:focus:bg-navy-900 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2.5 flex items-center gap-1.5" id="status-filter-wrapper">
          <Filter className="w-3.5 h-3.5 text-navy-400 shrink-0" />
          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="md:col-span-2.5" id="severity-filter-wrapper">
          <select
            id="select-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full p-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Severity: All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Component Filter */}
        <div className="md:col-span-3" id="component-filter-wrapper">
          <select
            id="select-component-filter"
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="w-full p-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Module: All Modules</option>
            <option value="Database">Database</option>
            <option value="Cache">Cache</option>
            <option value="Payment">Payment</option>
            <option value="SMTP">SMTP</option>
            <option value="Classroom Canvas">Classroom Canvas</option>
          </select>
        </div>
      </div>

      {/* Main split grid: incident list (Left) and detail pane (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
          {filteredIncidents.length === 0 ? (
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-8 text-center rounded-2xl text-navy-400 text-xs italic space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
              <p>No active incidents matched the filters!</p>
              <p className="text-[10px] text-navy-500">All CAPS/IEB workspace channels are clear.</p>
            </div>
          ) : (
            filteredIncidents.map((inc) => (
              <button
                key={inc.id}
                type="button"
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  setIsEditing(false); // Cancel edit on switch
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer block relative ${
                  selectedIncidentId === inc.id
                    ? "bg-navy-950 border-gold-400 text-white dark:bg-navy-950 dark:border-gold-400 shadow-md scale-[1.01]"
                    : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-800 text-navy-800 hover:bg-navy-50/50 dark:hover:bg-navy-950/20"
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[8px] font-mono font-black text-navy-400 block uppercase tracking-wider">
                    {inc.id} • {inc.date} {inc.time}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border ${getSeverityColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    {getStatusBadge(inc.status)}
                  </div>
                </div>

                <h4 className={`text-xs font-black font-sans mt-2 leading-snug ${selectedIncidentId === inc.id ? "text-gold-400" : "text-navy-900 dark:text-white"}`}>
                  {inc.title}
                </h4>

                <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-navy-400 border-t border-navy-100/10 pt-2">
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-royal-500" />
                    {inc.component}
                  </span>
                  <span className="flex items-center gap-1 text-right">
                    <User className="w-3 h-3 text-gold-500" />
                    {inc.assignedTo}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Incident Detail Pane */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-6">
              {/* Detail Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-navy-50 dark:border-navy-850 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-royal-600 uppercase tracking-widest block">
                      Active Investigation • {selectedIncident.id}
                    </span>
                    {getStatusBadge(selectedIncident.status)}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-base font-black font-sans text-navy-900 dark:text-white uppercase tracking-wide border border-navy-100 p-1.5 rounded"
                    />
                  ) : (
                    <h3 className="text-base font-black font-sans text-navy-900 dark:text-white uppercase tracking-wide">
                      {selectedIncident.title}
                    </h3>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    type="button"
                    onClick={() => handleExportPdfPostmortem(selectedIncident)}
                    className="px-3 py-1.5 bg-navy-950 text-gold-400 border border-gold-400 hover:bg-navy-900 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF Postmortem
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteIncident(selectedIncident.id)}
                    className="p-1.5 border border-rose-500/30 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Delete Incident"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Fields and Details info */}
              <div className="space-y-4">
                {/* Metas Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-navy-50/50 dark:bg-navy-950/40 p-3.5 rounded-2xl border border-navy-100 dark:border-navy-850">
                  <div>
                    <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Severity Priority</span>
                    {isEditing ? (
                      <select
                        value={editSeverity}
                        onChange={(e) => setEditSeverity(e.target.value as any)}
                        className="w-full p-1 border text-[11px] font-mono font-bold bg-white text-navy-800"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border inline-block mt-0.5 ${getSeverityColor(selectedIncident.severity)}`}>
                        {selectedIncident.severity}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Component Module</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editComponent}
                        onChange={(e) => setEditComponent(e.target.value)}
                        className="w-full p-1 border text-[11px] font-mono font-bold bg-white text-navy-800"
                      />
                    ) : (
                      <span className="text-xs font-mono font-black text-navy-800 dark:text-white block mt-0.5 uppercase">
                        {selectedIncident.component}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Assigned To</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
                        className="w-full p-1 border text-[11px] font-mono font-bold bg-white text-navy-800"
                      />
                    ) : (
                      <span className="text-xs font-bold text-navy-800 dark:text-white block mt-0.5">
                        {selectedIncident.assignedTo}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Status Tracker</span>
                    {isEditing ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full p-1 border text-[11px] font-mono font-bold bg-white text-navy-800"
                      >
                        <option value="open">Open</option>
                        <option value="investigating">Investigating</option>
                        <option value="mitigated">Mitigated</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-navy-800 dark:text-white block mt-0.5 capitalize">
                        {selectedIncident.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Downtime and user impact grids */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-navy-100 dark:border-navy-800 p-3 rounded-xl">
                    <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Simulated System Downtime</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editDowntime}
                        onChange={(e) => setEditDowntime(parseInt(e.target.value) || 0)}
                        className="w-full p-1 border text-xs font-mono bg-white text-navy-800"
                      />
                    ) : (
                      <div className="text-sm font-black font-mono mt-0.5 text-navy-800 dark:text-white">
                        {selectedIncident.downtimeMinutes} minutes
                      </div>
                    )}
                  </div>

                  <div className="border border-navy-100 dark:border-navy-800 p-3 rounded-xl">
                    <span className="text-[9px] font-mono font-black text-navy-400 uppercase block">Matriculants Affected</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editStudentsAffected}
                        onChange={(e) => setEditStudentsAffected(parseInt(e.target.value) || 0)}
                        className="w-full p-1 border text-xs font-mono bg-white text-navy-800"
                      />
                    ) : (
                      <div className="text-sm font-black font-mono mt-0.5 text-rose-500">
                        {selectedIncident.studentsAffected} students
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Text area */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-black text-navy-500 uppercase tracking-widest block">
                    Failure Diagnosis Description
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-2 border text-xs bg-white text-navy-800 rounded-xl focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed bg-navy-50/20 dark:bg-navy-950/20 p-3 rounded-xl border border-navy-100/40 dark:border-navy-800/40">
                      {selectedIncident.description}
                    </p>
                  )}
                </div>

                {/* Root Cause & Resolution editable panes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Root cause */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black text-navy-500 uppercase tracking-widest block">
                      Root Cause Analysis (RCA)
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={editRootCause}
                        onChange={(e) => setEditRootCause(e.target.value)}
                        className="w-full p-2 border text-xs bg-white text-navy-800 rounded-xl focus:outline-none"
                      />
                    ) : (
                      <div className="text-xs text-navy-600 dark:text-navy-300 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 min-h-[80px]">
                        <span className="font-bold text-[9px] font-mono text-amber-500 block uppercase mb-1">RCA Finding</span>
                        <p className="leading-relaxed">{selectedIncident.rootCause}</p>
                      </div>
                    )}
                  </div>

                  {/* Resolution */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black text-navy-500 uppercase tracking-widest block">
                      Remediation & Lessons Learned
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={editResolution}
                        onChange={(e) => setEditResolution(e.target.value)}
                        className="w-full p-2 border text-xs bg-white text-navy-800 rounded-xl focus:outline-none"
                      />
                    ) : (
                      <div className="text-xs text-navy-600 dark:text-navy-300 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 min-h-[80px]">
                        <span className="font-bold text-[9px] font-mono text-emerald-500 block uppercase mb-1">Fix Implemented</span>
                        <p className="leading-relaxed">{selectedIncident.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggle Action Buttons */}
                <div className="flex justify-end pt-2 border-t border-navy-50 dark:border-navy-850">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3.5 py-1.5 border border-navy-200 text-navy-600 dark:text-navy-400 dark:border-navy-800 rounded-xl text-xs font-bold cursor-pointer transition-all hover:bg-navy-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(selectedIncident.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Incident Fixes
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(selectedIncident)}
                      className="px-4 py-1.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Incident Diagnostics
                    </button>
                  )}
                </div>

                {/* Chronological Timeline Milestone Logs */}
                <div className="space-y-3.5 pt-4 border-t border-navy-50 dark:border-navy-850">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-black text-navy-500 uppercase tracking-widest block">
                      Chronological Recovery Timeline Log
                    </span>
                    <span className="text-[9px] font-mono text-navy-400">
                      {selectedIncident.timeline.length} milestone steps logged
                    </span>
                  </div>

                  {/* Interactive timeline event list */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto bg-navy-50/10 dark:bg-navy-950/10 p-3 rounded-2xl border border-navy-100/50 dark:border-navy-800/50">
                    {selectedIncident.timeline.length === 0 ? (
                      <p className="text-navy-400 text-xs italic">No timeline events logged yet.</p>
                    ) : (
                      selectedIncident.timeline.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-3 text-xs border-b border-navy-100/10 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-start gap-2 leading-relaxed">
                            <span className="font-mono font-bold text-royal-600 bg-royal-500/10 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                              {item.timestamp}
                            </span>
                            <div>
                              <p className="text-navy-700 dark:text-navy-300 font-medium">
                                {item.message}
                              </p>
                              <span className="text-[9px] text-navy-400 font-mono">
                                Reporter: {item.author}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTimelineEvent(selectedIncident.id, item.id)}
                            className="p-1 text-navy-400 hover:text-rose-500 transition-all cursor-pointer rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add timeline milestone fields */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center pt-2">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={timelineTime}
                        onChange={(e) => setTimelineTime(e.target.value)}
                        placeholder="Time (e.g. 09:12)"
                        className="w-full p-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-white text-navy-800 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="md:col-span-7">
                      <input
                        type="text"
                        value={timelineMsg}
                        onChange={(e) => setTimelineMsg(e.target.value)}
                        placeholder="Triage log update message..."
                        className="w-full p-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-white text-navy-800 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <button
                        type="button"
                        onClick={() => handleAddTimelineEvent(selectedIncident.id)}
                        className="w-full py-2 bg-navy-950 text-gold-400 border border-gold-400 hover:bg-navy-900 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Send className="w-3 h-3" />
                        Log Milestone
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-12 text-center rounded-2xl text-navy-400 text-xs italic">
              Please select or log an incident from the operations list.
            </div>
          )}
        </div>
      </div>

      {/* Manual Incident Logger Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden text-left"
            >
              <div className="p-5 border-b border-navy-50 dark:border-navy-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-rose-500/15 border border-rose-500/30 text-rose-500 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-sans font-black text-navy-900 dark:text-white uppercase tracking-wider">
                    Log Manual Platform Incident Trace
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 hover:bg-navy-50 dark:hover:bg-navy-800 rounded-xl text-navy-400 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateIncident} className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                    Incident Title / Error Message
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. PayFast checkout callback gateway timeout on Grade 11 worksheet purchase"
                    className="w-full p-2.5 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Severity */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                      Severity Level
                    </label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value as any)}
                      className="w-full p-2.5 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white"
                    >
                      <option value="critical">Critical (P0)</option>
                      <option value="high">High (P1)</option>
                      <option value="medium">Medium (P2)</option>
                      <option value="low">Low (P3)</option>
                    </select>
                  </div>

                  {/* Component */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                      Platform Module
                    </label>
                    <select
                      value={newComponent}
                      onChange={(e) => setNewComponent(e.target.value)}
                      className="w-full p-2.5 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white"
                    >
                      <option value="Database">Database System</option>
                      <option value="Cache">Cache (Redis)</option>
                      <option value="Payment">Payment Checkout</option>
                      <option value="SMTP">SMTP (Nodemailer)</option>
                      <option value="Classroom Canvas">Classroom Canvas</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                      Assigned On-Call Lead
                    </label>
                    <select
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      className="w-full p-2.5 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white"
                    >
                      <option value="Bethuel Thipe">Bethuel Thipe</option>
                      <option value="Thabo Mokoena">Thabo Mokoena</option>
                      <option value="Naledi Nkosi">Naledi Nkosi</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                    Failure Diagnosis Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide a complete description of the failure logs, CPU metrics, memory blocks, or user impact factors observed..."
                    className="w-full p-2.5 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Downtime */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                      Initial Downtime (Mins)
                    </label>
                    <input
                      type="number"
                      value={newDowntime}
                      onChange={(e) => setNewDowntime(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* Affected users */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-400 uppercase tracking-widest block">
                      Matriculants Affected
                    </label>
                    <input
                      type="number"
                      value={newStudentsAffected}
                      onChange={(e) => setNewStudentsAffected(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Root Cause Optionals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-400 uppercase block">
                      Root Cause finding (Optional)
                    </label>
                    <input
                      type="text"
                      value={newRootCause}
                      onChange={(e) => setNewRootCause(e.target.value)}
                      placeholder="e.g. Outdated SSL cert..."
                      className="w-full p-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black text-navy-400 uppercase block">
                      Remediation Plan (Optional)
                    </label>
                    <input
                      type="text"
                      value={newResolution}
                      onChange={(e) => setNewResolution(e.target.value)}
                      placeholder="e.g. pgBouncer pooled..."
                      className="w-full p-2 border border-navy-100 dark:border-navy-800 rounded-xl text-xs bg-navy-50/50 dark:bg-navy-950/40 text-navy-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-navy-50 dark:border-navy-850">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-navy-200 text-navy-600 dark:text-navy-400 dark:border-navy-800 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Log manual trace
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
