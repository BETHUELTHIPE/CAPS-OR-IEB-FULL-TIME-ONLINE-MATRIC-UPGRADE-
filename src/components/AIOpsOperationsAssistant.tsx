import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Cpu, Database, AlertTriangle, CheckCircle, Gauge, RefreshCw,
  TrendingUp, Send, Code, FileText, Lightbulb, Activity, HardDrive,
  ShieldAlert, Zap, AlertCircle, Terminal, HelpCircle, ChevronRight, Play, CheckCircle2
} from "lucide-react";

interface Telemetry {
  cpuUsage: number;
  dbConnections: number;
  redisMemory: number;
  celeryQueue: number;
  nginxLatency: number;
  cacheHitRatio: number;
}

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "warning" | "resolved";
  source: string;
  triggeredAt: string;
  description: string;
}

interface Incident {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved";
  component: string;
  startedAt: string;
  description: string;
}

export const AIOpsOperationsAssistant: React.FC = () => {
  // 1. Live Simulated Telemetry States (Can be modified by user using Sliders)
  const [telemetry, setTelemetry] = useState<Telemetry>({
    cpuUsage: 42,
    dbConnections: 34,
    redisMemory: 4.8,
    celeryQueue: 0,
    nginxLatency: 45,
    cacheHitRatio: 98.4
  });

  // 2. Active Alerts State
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "ALT-101",
      title: "Host Server CPU Usage > 80%",
      severity: "warning",
      source: "Node Exporter",
      triggeredAt: "10:42:15 SAST",
      description: "Primary VM CPU core capacity has reached critical levels, likely driven by concurrent requests to the exam-prediction engine."
    },
    {
      id: "ALT-102",
      title: "PostgreSQL DB Connection Pool Limit Exhausted",
      severity: "critical",
      source: "Postgres Exporter",
      triggeredAt: "11:15:30 SAST",
      description: "Active connections to postgresql-prod instance has breached the Gunicorn connection pool limit, causing queued waiting times."
    },
    {
      id: "ALT-103",
      title: "Redis Key Eviction Failure",
      severity: "warning",
      source: "Redis Exporter",
      triggeredAt: "11:18:05 SAST",
      description: "Redis master instance memory allocation limit reached. Dynamic matriculation sandbox sessions are failing to write new session states."
    }
  ]);

  // 3. Historical Incidents State
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "INC-2810",
      title: "Classroom Whiteboard Vector Storage Fail",
      severity: "High",
      status: "Investigating",
      component: "Classroom Canvas",
      startedAt: "25 minutes ago",
      description: "Live whiteboard drawing states fail to synchronize with regional cache due to persistent websocket message dropouts."
    },
    {
      id: "INC-2940",
      title: "Celery Workers Out Of Sync (Matric prediction delay)",
      severity: "High",
      status: "Open",
      component: "Exam Predictor Model",
      startedAt: "12 minutes ago",
      description: "Network split detected between the machine learning prediction worker nodes and the main Celery broker queue."
    }
  ]);

  // 4. Interactive Chat States
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string; timestamp: string }[]>([
    {
      sender: "ai",
      text: "Ayo! I am the **AMH AIOps Operations Assistant**, powered by **Gemini**. I have live read-access to the South African platform's hypervisor metrics, database connection pools, and Celery tasks. Tell me what alert or incident you want me to analyze, or ask me an infrastructure question!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 5. Diagnostic overlay states
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState<boolean>(false);
  const [activeAnalysisType, setActiveAnalysisType] = useState<"alert" | "correlation" | "prediction" | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  // Call server-side Gemini endpoint /api/aiops/chat
  const sendToAIOps = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: messageText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/aiops/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          context: {
            telemetry,
            activeAlerts: alerts,
            activeIncidents: incidents
          }
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, {
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      console.error("AIOps assistant API call error:", err);
      setChatMessages(prev => [...prev, {
        sender: "ai",
        text: "I experienced an error connecting to the central AI controller. However, base operations appear intact. Please retry in a few moments.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run a targeted diagnosis with Gemini
  const diagnoseWithAI = async (type: "alert" | "correlation" | "prediction", targetData: string) => {
    setDiagnosticLoading(true);
    setDiagnosticResult(null);
    setActiveAnalysisType(type);

    let prompt = "";
    if (type === "alert") {
      prompt = `Diagnose this active system alert: "${targetData}". 
Explain why this happened in plain but highly technical terms (mentioning CAPS matric workload peaks if applicable), how it correlates with the live telemetry, and provide 3 specific recovery action steps.`;
    } else if (type === "correlation") {
      prompt = `Review these two active incidents: 
1. ${incidents[0]?.title} (${incidents[0]?.description})
2. ${incidents[1]?.title} (${incidents[1]?.description})
Correlate them using live telemetry CPU: ${telemetry.cpuUsage}%, DB connections: ${telemetry.dbConnections}, Redis Memory: ${telemetry.redisMemory}GB. Is there a common failure denominator, like network partition or resource limit? Suggest recovery plan.`;
    } else if (type === "prediction") {
      prompt = `Analyze current system telemetry trends:
- CPU: ${telemetry.cpuUsage}%
- Postgres connections: ${telemetry.dbConnections}/150 max
- Redis Memory: ${telemetry.redisMemory}GB
- Celery Queue: ${telemetry.celeryQueue} tasks
- Nginx latency: ${telemetry.nginxLatency}ms
Predict potential performance bottlenecks or system exhaustions in the next 24 hours under a high-school traffic surge, and recommend preemptive scaling steps.`;
    }

    try {
      const response = await fetch("/api/aiops/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          context: {
            telemetry,
            activeAlerts: alerts,
            activeIncidents: incidents
          }
        })
      });
      const data = await response.json();
      setDiagnosticResult(data.reply);
    } catch (err) {
      console.error("Diagnosis error:", err);
      setDiagnosticResult("Error generating diagnostic report. Please check API credentials.");
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendToAIOps(inputMessage);
    }
  };

  const handleSliderChange = (key: keyof Telemetry, val: number) => {
    setTelemetry(prev => {
      const updated = { ...prev, [key]: val };
      // Simulate cache hit ratio dropping as latency / connection queue scales up
      if (key === "dbConnections") {
        updated.cacheHitRatio = Math.max(72.5, Math.min(99.9, Number((99.5 - (val / 6)).toFixed(1))));
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg animate-pulse">
              <Brain className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
              AIOps Operations Assistant
            </h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Powered by Gemini 3.5 Flash, explaining active telemetry, correlating microservice events, and delivering recovery playbooks.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Gemini Agent Online
          </span>
        </div>
      </div>

      {/* Main Grid: Telemetry & Actions Left, Chat Terminal Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Width: 5) - Telemetry sandbox & Alerts */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Telemetry Sandbox Card */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-gold-500" />
                Live Telemetry Sandbox
              </h3>
              <span className="text-[9px] font-mono text-navy-400">Tweak to simulate surge</span>
            </div>

            <div className="space-y-3.5">
              {/* CPU slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-navy-500 dark:text-navy-300 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-royal-500" />
                    Host CPU Utilization
                  </span>
                  <span className={`font-black ${telemetry.cpuUsage > 80 ? "text-rose-500" : telemetry.cpuUsage > 60 ? "text-amber-500" : "text-emerald-500"}`}>
                    {telemetry.cpuUsage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={telemetry.cpuUsage}
                  onChange={(e) => handleSliderChange("cpuUsage", Number(e.target.value))}
                  className="w-full accent-royal-500 cursor-pointer"
                />
              </div>

              {/* DB Connections slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-navy-500 dark:text-navy-300 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-royal-500" />
                    PostgreSQL Pool Size
                  </span>
                  <span className={`font-black ${telemetry.dbConnections > 120 ? "text-rose-500 animate-pulse" : telemetry.dbConnections > 80 ? "text-amber-500" : "text-emerald-500"}`}>
                    {telemetry.dbConnections} / 150 conn
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={telemetry.dbConnections}
                  onChange={(e) => handleSliderChange("dbConnections", Number(e.target.value))}
                  className="w-full accent-royal-500 cursor-pointer"
                />
              </div>

              {/* Celery Queue slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-navy-500 dark:text-navy-300 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-royal-500" />
                    Celery Task Backlog
                  </span>
                  <span className={`font-black ${telemetry.celeryQueue > 50 ? "text-rose-500" : telemetry.celeryQueue > 15 ? "text-amber-500" : "text-emerald-500"}`}>
                    {telemetry.celeryQueue} tasks
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={telemetry.celeryQueue}
                  onChange={(e) => handleSliderChange("celeryQueue", Number(e.target.value))}
                  className="w-full accent-royal-500 cursor-pointer"
                />
              </div>

              {/* Latency slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-navy-500 dark:text-navy-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-royal-500" />
                    Nginx Gateway Latency
                  </span>
                  <span className={`font-black ${telemetry.nginxLatency > 300 ? "text-rose-500" : telemetry.nginxLatency > 150 ? "text-amber-500" : "text-emerald-500"}`}>
                    {telemetry.nginxLatency}ms
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  value={telemetry.nginxLatency}
                  onChange={(e) => handleSliderChange("nginxLatency", Number(e.target.value))}
                  className="w-full accent-royal-500 cursor-pointer"
                />
              </div>

              {/* Metrics Readout Panel */}
              <div className="grid grid-cols-2 gap-2 bg-navy-50 dark:bg-navy-900/60 p-2.5 rounded-xl border border-navy-100 dark:border-navy-850 text-[10.5px] font-mono">
                <div>
                  <span className="text-navy-400 block text-[9px] uppercase">Redis Cache Mem</span>
                  <span className="text-navy-800 dark:text-navy-200 font-bold">{telemetry.redisMemory} GB</span>
                </div>
                <div>
                  <span className="text-navy-400 block text-[9px] uppercase">Cache Hit Ratio</span>
                  <span className="text-emerald-500 font-bold">{telemetry.cacheHitRatio}%</span>
                </div>
              </div>

              {/* Predictor Trigger Button */}
              <button
                type="button"
                onClick={() => diagnoseWithAI("prediction", "")}
                disabled={diagnosticLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-royal-600 hover:bg-royal-600/15 text-royal-600 dark:text-gold-400 dark:border-gold-500/30 dark:hover:bg-gold-500/10 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                Predict Resource Bottleneck
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Active Alerts Dashboard
              </h3>
              <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono px-1.5 py-0.5 rounded font-black">
                {alerts.length} Triggered
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className="border border-navy-100 dark:border-navy-800/80 p-3 rounded-xl bg-navy-50/25 dark:bg-navy-900/20 text-left space-y-2 hover:border-royal-500/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono font-bold text-navy-400 block tracking-wider uppercase">
                        {alert.id} • {alert.source}
                      </span>
                      <h4 className="text-xs font-bold text-navy-900 dark:text-white leading-tight">
                        {alert.title}
                      </h4>
                    </div>
                    <span className={`text-[8.5px] font-mono uppercase font-black px-1.5 py-0.5 rounded border shrink-0 ${
                      alert.severity === "critical"
                        ? "bg-rose-500/15 border-rose-500/20 text-rose-500"
                        : "bg-amber-500/15 border-amber-500/20 text-amber-500"
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-navy-500 leading-normal">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-navy-100/30 text-[10px] text-navy-400">
                    <span className="font-mono">{alert.triggeredAt}</span>
                    <button
                      type="button"
                      onClick={() => diagnoseWithAI("alert", `${alert.id}: ${alert.title}`)}
                      disabled={diagnosticLoading}
                      className="text-royal-600 dark:text-gold-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      Diagnose Alert <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Correlation Trigger */}
          <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-850 pb-2.5">
              <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-500" />
                AIOps Incident Correlator
              </h3>
            </div>

            <p className="text-[11px] text-navy-500 leading-normal">
              Detect common denominators and network partition faults between concurrent platform incidents.
            </p>

            <div className="bg-purple-500/5 border border-purple-500/20 p-3 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-purple-500 font-mono text-[10px] uppercase">Concurrent Incidents</div>
              <ul className="list-disc pl-4 text-navy-700 dark:text-navy-300 space-y-1 text-[10.5px]">
                <li className="truncate"><b>{incidents[0]?.id}</b>: {incidents[0]?.title}</li>
                <li className="truncate"><b>{incidents[1]?.id}</b>: {incidents[1]?.title}</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => diagnoseWithAI("correlation", "")}
              disabled={diagnosticLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-600/10 hover:bg-purple-600/15 text-purple-600 border border-purple-500/25 dark:text-purple-400 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Correlate Microservices With AI
            </button>
          </div>

        </div>

        {/* Right Column (Width: 7) - Chat Terminal & Diagnostic Stream */}
        <div className="lg:col-span-7 flex flex-col h-[740px] border border-navy-150 dark:border-navy-800 rounded-2xl bg-white dark:bg-navy-950 shadow-sm overflow-hidden">
          
          {/* Diagnostic Overlay (Displays results when any diagnostic is generated) */}
          <AnimatePresence>
            {(diagnosticLoading || diagnosticResult) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-navy-950 border-b border-navy-850 p-4 shrink-0 text-left space-y-2.5 relative max-h-[300px] overflow-y-auto"
              >
                <button
                  type="button"
                  onClick={() => {
                    setDiagnosticResult(null);
                    setDiagnosticLoading(false);
                  }}
                  className="absolute top-3 right-3 text-navy-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
                <div className="flex items-center gap-1.5 text-gold-400 text-xs font-mono font-black uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-gold-500 animate-pulse" />
                  Gemini Diagnostic stream — {activeAnalysisType === "alert" ? "Active Alert Remediation" : activeAnalysisType === "correlation" ? "Incident Correlation" : "Resource Capacity Prediction"}
                </div>

                {diagnosticLoading ? (
                  <div className="py-8 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 mx-auto text-gold-500 animate-spin" />
                    <p className="text-xs text-gold-400 font-mono">Querying deep-analysis models at regional cluster point...</p>
                  </div>
                ) : (
                  <div className="text-[11.5px] font-mono text-emerald-400 leading-relaxed space-y-2 whitespace-pre-wrap">
                    {diagnosticResult}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Chat Console Header */}
          <div className="bg-navy-50 dark:bg-navy-900 border-b border-navy-150 dark:border-navy-800 p-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-xs font-mono font-black uppercase tracking-wider text-navy-900 dark:text-white">
                Core Operations Agent Console
              </span>
            </div>
            <span className="text-[9px] font-mono text-navy-400 uppercase font-black bg-navy-200/50 dark:bg-navy-950 px-2 py-0.5 rounded border border-navy-200/30">
              Agent Node ID: AMH-OPS-411
            </span>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[580px] bg-navy-950/5 dark:bg-navy-950/20">
            {chatMessages.map((msg, index) => {
              const isAi = msg.sender === "ai";
              return (
                <div 
                  key={index}
                  className={`flex ${isAi ? "justify-start" : "justify-end"} items-start gap-2.5`}
                >
                  {isAi && (
                    <div className="p-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 shrink-0">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[85%] space-y-1">
                    <div className={`p-3 rounded-2xl text-[12px] leading-relaxed text-left border ${
                      isAi 
                        ? "bg-white dark:bg-navy-900 border-navy-100 dark:border-navy-850 text-navy-800 dark:text-navy-200 shadow-sm"
                        : "bg-royal-600 text-white border-royal-500 font-medium"
                    }`}>
                      {/* Very simple custom renderer to support bolding in description */}
                      {msg.text.split("\n").map((line, i) => {
                        // Match bold tokens **text**
                        const parts = line.split("**");
                        return (
                          <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                            {parts.map((part, indexPart) => {
                              if (indexPart % 2 === 1) {
                                return <strong key={indexPart} className="font-extrabold text-navy-950 dark:text-white bg-gold-500/10 px-1 rounded">{part}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                    <span className="text-[9px] font-mono text-navy-400 self-start px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start items-center gap-2.5">
                <div className="p-1 bg-emerald-500/15 text-emerald-400 rounded animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-850 p-2.5 px-4 rounded-xl text-xs text-navy-400 font-mono animate-pulse">
                  System model thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Chips */}
          <div className="p-2 border-t border-navy-100 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-900/40 flex flex-wrap gap-1.5 justify-start">
            <button
              type="button"
              onClick={() => sendToAIOps("Simulate Gunicorn pool exhaustion during peak homework uploads")}
              className="text-[9.5px] font-mono text-navy-600 dark:text-navy-300 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 px-2.5 py-1 rounded-full hover:bg-royal-600 hover:text-white dark:hover:bg-gold-500/10 transition-all cursor-pointer"
            >
              ⚡ Sim Pool Exhaustion
            </button>
            <button
              type="button"
              onClick={() => sendToAIOps("What happens if Redis memory breaches MaxMemory policy?")}
              className="text-[9.5px] font-mono text-navy-600 dark:text-navy-300 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 px-2.5 py-1 rounded-full hover:bg-royal-600 hover:text-white dark:hover:bg-gold-500/10 transition-all cursor-pointer"
            >
              📚 Why Redis LRU Matters
            </button>
            <button
              type="button"
              onClick={() => sendToAIOps("Recommend automated recovery action for Celery network splits")}
              className="text-[9.5px] font-mono text-navy-600 dark:text-navy-300 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 px-2.5 py-1 rounded-full hover:bg-royal-600 hover:text-white dark:hover:bg-gold-500/10 transition-all cursor-pointer"
            >
              🛠️ Celery Runbook
            </button>
          </div>

          {/* Interactive Input Form */}
          <div className="p-3 bg-white dark:bg-navy-900 border-t border-navy-150 dark:border-navy-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask AIOps Assistant..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-white text-xs border border-navy-150 dark:border-navy-800 rounded-xl px-4 py-2.5 outline-none focus:border-royal-500 transition-all"
            />
            <button
              type="button"
              onClick={() => sendToAIOps(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-royal-600 hover:bg-royal-700 disabled:opacity-50 text-white rounded-xl shadow transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
