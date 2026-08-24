import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Server, Database, Network, ShieldCheck, Cpu, RefreshCw, Zap,
  AlertTriangle, CheckCircle, Terminal, Info, Play, Pause,
  Radio, Layers, Sliders, Settings, Layout, Search, Mail, Eye
} from "lucide-react";

// Types for Node and Connection
export interface TopologyNode {
  id: string;
  name: string;
  type: "load_balancer" | "app_server" | "cache" | "database" | "smtp" | "worker";
  status: "nominal" | "degraded" | "down" | "idle";
  cpu: number;
  memory: number;
  activeRequests: number;
  uptime: string;
  region: string;
  errorRate: number;
  port: number;
}

export interface TopologyLink {
  id: string;
  from: string;
  to: string;
  latencyMs: number;
  bandwidthMbps: number;
  packetLoss: number;
  status: "active" | "congested" | "broken";
}

export const InfrastructureTopologyMap: React.FC = () => {
  // Baseline Nodes configuration
  const [nodes, setNodes] = useState<TopologyNode[]>([
    {
      id: "ns-cf",
      name: "Cloudflare CDN / DNS Edge",
      type: "load_balancer",
      status: "nominal",
      cpu: 18,
      memory: 24,
      activeRequests: 1450,
      uptime: "34d 12h",
      region: "Global Edge",
      errorRate: 0.01,
      port: 443
    },
    {
      id: "ns-lb",
      name: "Nginx Gateway proxy",
      type: "load_balancer",
      status: "nominal",
      cpu: 28,
      memory: 40,
      activeRequests: 1450,
      uptime: "18d 4h",
      region: "za-jhn-1",
      errorRate: 0.02,
      port: 80
    },
    {
      id: "ns-app-1",
      name: "Express Web App Server (Primary)",
      type: "app_server",
      status: "nominal",
      cpu: 45,
      memory: 62,
      activeRequests: 850,
      uptime: "9d 18h",
      region: "za-jhn-1",
      errorRate: 0.05,
      port: 3000
    },
    {
      id: "ns-app-2",
      name: "Express Web App Server (Secondary)",
      type: "app_server",
      status: "nominal",
      cpu: 38,
      memory: 58,
      activeRequests: 600,
      uptime: "9d 18h",
      region: "za-jhn-1",
      errorRate: 0.04,
      port: 3000
    },
    {
      id: "ns-redis",
      name: "Redis Session Cache Store",
      type: "cache",
      status: "nominal",
      cpu: 22,
      memory: 85,
      activeRequests: 2400,
      uptime: "45d 8h",
      region: "za-jhn-1",
      errorRate: 0.00,
      port: 6379
    },
    {
      id: "ns-db-primary",
      name: "PostgreSQL Database (Primary)",
      type: "database",
      status: "nominal",
      cpu: 52,
      memory: 78,
      activeRequests: 420,
      uptime: "98d 2h",
      region: "za-jhn-1",
      errorRate: 0.01,
      port: 5432
    },
    {
      id: "ns-db-replica",
      name: "PostgreSQL Database (Replica-Read)",
      type: "database",
      status: "nominal",
      cpu: 30,
      memory: 72,
      activeRequests: 1030,
      uptime: "98d 2h",
      region: "za-cpt-2",
      errorRate: 0.01,
      port: 5432
    },
    {
      id: "ns-celery",
      name: "Celery Prediction Workers",
      type: "worker",
      status: "nominal",
      cpu: 34,
      memory: 45,
      activeRequests: 45,
      uptime: "4d 1h",
      region: "za-jhn-1",
      errorRate: 0.02,
      port: 8888
    },
    {
      id: "ns-smtp",
      name: "SMTP Nodemailer Outbox Relay",
      type: "smtp",
      status: "nominal",
      cpu: 12,
      memory: 20,
      activeRequests: 8,
      uptime: "14d 6h",
      region: "za-jhn-1",
      errorRate: 0.10,
      port: 587
    }
  ]);

  // Network Links mapping with corresponding metrics
  const [links, setLinks] = useState<TopologyLink[]>([
    { id: "lk-cf-lb", from: "ns-cf", to: "ns-lb", latencyMs: 14, bandwidthMbps: 850, packetLoss: 0.01, status: "active" },
    { id: "lk-lb-app1", from: "ns-lb", to: "ns-app-1", latencyMs: 2, bandwidthMbps: 1000, packetLoss: 0.00, status: "active" },
    { id: "lk-lb-app2", from: "ns-lb", to: "ns-app-2", latencyMs: 3, bandwidthMbps: 1000, packetLoss: 0.00, status: "active" },
    { id: "lk-app1-redis", from: "ns-app-1", to: "ns-redis", latencyMs: 1, bandwidthMbps: 2500, packetLoss: 0.00, status: "active" },
    { id: "lk-app2-redis", from: "ns-app-2", to: "ns-redis", latencyMs: 1, bandwidthMbps: 2500, packetLoss: 0.00, status: "active" },
    { id: "lk-app1-db", from: "ns-app-1", to: "ns-db-primary", latencyMs: 4, bandwidthMbps: 1200, packetLoss: 0.01, status: "active" },
    { id: "lk-app2-db", from: "ns-app-2", to: "ns-db-primary", latencyMs: 4, bandwidthMbps: 1200, packetLoss: 0.01, status: "active" },
    { id: "lk-db-replica", from: "ns-db-primary", to: "ns-db-replica", latencyMs: 18, bandwidthMbps: 450, packetLoss: 0.05, status: "active" },
    { id: "lk-app1-celery", from: "ns-app-1", to: "ns-celery", latencyMs: 5, bandwidthMbps: 800, packetLoss: 0.00, status: "active" },
    { id: "lk-app2-celery", from: "ns-app-2", to: "ns-celery", latencyMs: 6, bandwidthMbps: 800, packetLoss: 0.00, status: "active" },
    { id: "lk-app1-smtp", from: "ns-app-1", to: "ns-smtp", latencyMs: 12, bandwidthMbps: 100, packetLoss: 0.12, status: "active" }
  ]);

  // Selected state
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ns-app-1");
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Auto Refresh & Simulator variables
  const [isLiveRefreshing, setIsLiveRefreshing] = useState<boolean>(true);
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(1.0); // 1x, 2x, 5x, 10x surge
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[INFRA_TOPOLOGY] Initializing real-time microservices mapping client...",
    "[INFRA_TOPOLOGY] Connection established with za-jhn-1 region hypervisors.",
    "[INFRA_TOPOLOGY] Listening for network packet telemetry traces..."
  ]);

  // Log auxiliary triggers
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Live noise simulation loop
  useEffect(() => {
    if (!isLiveRefreshing) return;

    const interval = setInterval(() => {
      // 1. Mutate Node metrics slightly to show real-time feedback
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.status === "down") return node;

          // Introduce minor variance
          const baseCpuChange = Math.floor(Math.random() * 5) - 2;
          const newCpu = Math.max(5, Math.min(100, node.cpu + baseCpuChange));
          
          // Request fluctuation based on traffic multiplier
          const reqVariance = Math.floor(Math.random() * 20) - 10;
          const baseReq = node.activeRequests;
          const multiplierFactor = node.type === "load_balancer" ? 300 : 150;
          const targetReq = Math.max(0, Math.round((baseReq + reqVariance) * (1 + (trafficMultiplier - 1) * 0.1)));

          // Check if degraded limits hit
          let currentStatus = node.status;
          if (newCpu > 85) {
            currentStatus = "degraded";
          } else if (currentStatus === "degraded" && newCpu <= 80) {
            currentStatus = "nominal";
          }

          return {
            ...node,
            cpu: newCpu,
            activeRequests: targetReq,
            status: currentStatus
          };
        })
      );

      // 2. Mutate Connection Link metrics slightly
      setLinks(prevLinks =>
        prevLinks.map(link => {
          if (link.status === "broken") return link;

          const latencyChange = Math.floor(Math.random() * 3) - 1;
          const newLatency = Math.max(1, link.latencyMs + latencyChange);
          const lossChange = (Math.random() * 0.02) - 0.01;
          const newLoss = Math.max(0, Number((link.packetLoss + lossChange).toFixed(3)));

          // Determine status
          let lkStatus = link.status;
          if (newLatency > 50 || newLoss > 0.15) {
            lkStatus = "congested";
          } else if (lkStatus === "congested" && newLatency <= 35 && newLoss <= 0.10) {
            lkStatus = "active";
          }

          return {
            ...link,
            latencyMs: newLatency,
            packetLoss: newLoss,
            status: lkStatus
          };
        })
      );

      // Chance to push generic network log
      if (Math.random() > 0.7) {
        const pingMs = Math.floor(Math.random() * 15) + 1;
        addLog(`Heartbeat packet acknowledged. Ping latency to Cape Town: ${pingMs}ms`);
      }

    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveRefreshing, trafficMultiplier]);

  // Trigger Node State Failure manually
  const toggleNodeFailure = (nodeId: string) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          const nextStatus = n.status === "down" ? "nominal" : "down";
          
          if (nextStatus === "down") {
            addLog(`🚨 CRITICAL FAULT: Node [${n.name}] manual shutdown triggered!`);
            // Break all connected links
            breakConnectedLinks(nodeId, true);
          } else {
            addLog(`✅ REMEDIATION: Node [${n.name}] powered on and verified nominal.`);
            breakConnectedLinks(nodeId, false);
          }

          return {
            ...n,
            status: nextStatus,
            cpu: nextStatus === "down" ? 0 : 35,
            activeRequests: nextStatus === "down" ? 0 : 450
          };
        }
        return n;
      })
    );
  };

  const breakConnectedLinks = (nodeId: string, shouldBreak: boolean) => {
    setLinks(prev =>
      prev.map(lk => {
        if (lk.from === nodeId || lk.to === nodeId) {
          return {
            ...lk,
            status: shouldBreak ? "broken" : "active",
            latencyMs: shouldBreak ? 999 : 5,
            packetLoss: shouldBreak ? 1.0 : 0.0
          };
        }
        return lk;
      })
    );
  };

  // Trigger Network congestion load test
  const triggerTrafficSpike = () => {
    addLog(`⚠️ SIMULATING PEAK USER SPIKE: Applying 10x dynamic load matrices...`);
    setTrafficMultiplier(10.0);
    setNodes(prev =>
      prev.map(n => {
        if (n.status === "down") return n;
        return {
          ...n,
          cpu: Math.min(98, Math.round(n.cpu * 1.8)),
          activeRequests: Math.round(n.activeRequests * 4.2),
          status: "degraded"
        };
      })
    );
    setLinks(prev =>
      prev.map(lk => {
        if (lk.status === "broken") return lk;
        return {
          ...lk,
          latencyMs: Math.round(lk.latencyMs * 2.5),
          status: "congested",
          packetLoss: Math.min(0.25, lk.packetLoss + 0.08)
        };
      })
    );
    setTimeout(() => {
      setTrafficMultiplier(1.0);
      addLog(`✅ SPIKE REMEDIATED: Re-routing nodes to normal CAPS baseline capacity.`);
    }, 12000);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const selectedLink = links.find(l => l.id === selectedLinkId);

  // SVG Positions Mapping for custom topology visualization
  const positions: Record<string, { x: number; y: number }> = {
    "ns-cf": { x: 50, y: 150 },         // DNS Edge
    "ns-lb": { x: 180, y: 150 },        // Nginx LB
    "ns-app-1": { x: 340, y: 80 },      // Express App 1
    "ns-app-2": { x: 340, y: 220 },     // Express App 2
    "ns-redis": { x: 520, y: 40 },      // Redis Cache
    "ns-db-primary": { x: 520, y: 180 }, // Postgres Main
    "ns-db-replica": { x: 670, y: 180 }, // Replica Read
    "ns-celery": { x: 520, y: 280 },    // Celery ML
    "ns-smtp": { x: 670, y: 80 }        // SMTP Outbox
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "load_balancer":
        return <Network className="w-5 h-5 text-sky-500" />;
      case "app_server":
        return <Server className="w-5 h-5 text-indigo-500" />;
      case "cache":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "database":
        return <Database className="w-5 h-5 text-emerald-500" />;
      case "smtp":
        return <Mail className="w-5 h-5 text-pink-500" />;
      case "worker":
        return <Cpu className="w-5 h-5 text-purple-500" />;
      default:
        return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Topology Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 dark:border-navy-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-royal-500/10 text-royal-600 dark:text-gold-400 rounded-lg shrink-0">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-navy-900 dark:text-white uppercase tracking-tight">
              Infrastructure Topology Map
            </h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Real-time interactive routing diagram showing active load balances, Redis cache relays, and Johannesburg primary Postgres write tunnels.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={triggerTrafficSpike}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            Inject 10x Load Spike
          </button>

          <button
            type="button"
            onClick={() => setIsLiveRefreshing(!isLiveRefreshing)}
            className={`px-3 py-2 border rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              isLiveRefreshing 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800" 
                : "bg-navy-50 text-navy-600 border-navy-200 dark:bg-navy-900"
            }`}
          >
            {isLiveRefreshing ? <Radio className="w-3.5 h-3.5 animate-pulse" /> : <Pause className="w-3.5 h-3.5" />}
            {isLiveRefreshing ? "Streaming Live" : "Paused"}
          </button>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topology Map Canvas View (Col-span: 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-4 shadow-sm flex flex-col relative overflow-hidden min-h-[480px]">
          
          <div className="flex justify-between items-center pb-3 border-b border-navy-50 dark:border-navy-850">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navy-400">
              Interactive Dependency Canvas (Click Node or Link)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono text-navy-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" /> Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" /> Congested
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block animate-ping" /> Down
              </span>
            </div>
          </div>

          {/* SVG Connection Lines overlay and Interactive canvas layout */}
          <div className="relative flex-1 w-full min-h-[380px] mt-4 select-none">
            
            {/* SVG Lines Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 1 }}>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#c5a059" />
                </marker>
              </defs>

              {links.map((link) => {
                const fromPos = positions[link.from];
                const toPos = positions[link.to];
                if (!fromPos || !toPos) return null;

                // Connection line status style mapping
                let strokeColor = "rgba(148, 163, 184, 0.4)"; // default gray
                let strokeDash = "0";
                let animationDuration = "20s";

                if (link.status === "active") {
                  strokeColor = "rgba(16, 185, 129, 0.5)"; // green
                  animationDuration = `${Math.max(1, 10 - link.latencyMs)}s`;
                } else if (link.status === "congested") {
                  strokeColor = "rgba(245, 158, 11, 0.7)"; // amber
                  strokeDash = "4, 4";
                  animationDuration = "2s";
                } else if (link.status === "broken") {
                  strokeColor = "rgba(239, 68, 68, 0.6)"; // red
                  strokeDash = "8, 8";
                  animationDuration = "0s";
                }

                const isSelected = selectedLinkId === link.id;

                return (
                  <g key={link.id}>
                    {/* Hover hotspot line */}
                    <line
                      x1={`${fromPos.x}%`}
                      y1={`${fromPos.y}px`}
                      x2={`${toPos.x}%`}
                      y2={`${toPos.y}px`}
                      stroke="transparent"
                      strokeWidth="10"
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedLinkId(link.id);
                        setSelectedNodeId(""); // clear node selection
                        addLog(`Analyzed connection link trace: [${link.from}] → [${link.to}]`);
                      }}
                    />

                    {/* Rendered connection line */}
                    <line
                      x1={`${fromPos.x}%`}
                      y1={`${fromPos.y}px`}
                      x2={`${toPos.x}%`}
                      y2={`${toPos.y}px`}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "4" : "2"}
                      strokeDasharray={strokeDash}
                      className="transition-all"
                    />

                    {/* Animated flow dots for active/congested networks */}
                    {link.status !== "broken" && (
                      <line
                        x1={`${fromPos.x}%`}
                        y1={`${fromPos.y}px`}
                        x2={`${toPos.x}%`}
                        y2={`${toPos.y}px`}
                        stroke={link.status === "congested" ? "#f59e0b" : "#10b981"}
                        strokeWidth="3"
                        strokeDasharray="4, 25"
                        style={{
                          animation: `dash ${animationDuration} linear infinite`,
                          zIndex: 2
                        }}
                      />
                    )}

                    {/* Latency text tag overlay midpoint */}
                    <foreignObject
                      x={`${(fromPos.x + toPos.x) / 2}%`}
                      y={`${(fromPos.y + toPos.y) / 2 - 10}px`}
                      width="50"
                      height="20"
                      style={{ overflow: "visible" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLinkId(link.id);
                          setSelectedNodeId("");
                        }}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-tight border cursor-pointer select-none -translate-x-1/2 ${
                          link.status === "broken"
                            ? "bg-rose-900 border-rose-600 text-rose-300"
                            : link.status === "congested"
                            ? "bg-amber-950 border-amber-600 text-amber-300 animate-pulse"
                            : "bg-navy-950 border-emerald-600 text-emerald-300"
                        }`}
                      >
                        {link.status === "broken" ? "Err" : `${link.latencyMs}ms`}
                      </button>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {/* Interactive Node Buttons mapped absolute */}
            {nodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === node.id;
              
              // Status ring color
              let ringColor = "ring-emerald-500/30 border-emerald-500";
              let badgeColor = "bg-emerald-500";
              if (node.status === "degraded") {
                ringColor = "ring-amber-500/30 border-amber-500";
                badgeColor = "bg-amber-500";
              } else if (node.status === "down") {
                ringColor = "ring-rose-500/40 border-rose-500 animate-pulse";
                badgeColor = "bg-rose-500";
              }

              return (
                <div
                  key={node.id}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}px`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 10
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setSelectedLinkId(null); // clear link selection
                      addLog(`Auditing hardware register: [${node.name}]`);
                    }}
                    className={`p-3.5 bg-white dark:bg-navy-900 border-2 rounded-2xl ring-4 flex flex-col items-center justify-center shadow-lg transition-all ${
                      isSelected 
                        ? "border-gold-400 ring-gold-400/20 scale-110" 
                        : `${ringColor} hover:scale-105`
                    }`}
                  >
                    {getNodeIcon(node.type)}

                    {/* Status Dot */}
                    <span className={`w-2 h-2 rounded-full absolute top-1 right-1 ${badgeColor}`} />
                    
                    {/* Mini Load readouts inside node button on map */}
                    {node.status !== "down" && (
                      <span className="text-[7.5px] font-mono text-navy-400 font-bold block mt-1.5">
                        {node.cpu}% CPU
                      </span>
                    )}
                    {node.status === "down" && (
                      <span className="text-[7px] font-mono font-black text-rose-500 uppercase block mt-1.5 animate-pulse">
                        Offline
                      </span>
                    )}
                  </button>

                  {/* Text label underneath node */}
                  <span className="absolute left-1/2 -translate-x-1/2 top-11 text-[9px] font-mono font-black text-navy-700 dark:text-navy-300 bg-white/90 dark:bg-navy-950/90 border border-navy-100 dark:border-navy-850 px-1.5 rounded shadow-sm whitespace-nowrap">
                    {node.id.toUpperCase().replace("NS-", "")}
                  </span>
                </div>
              );
            })}

          </div>

          {/* Map bottom instruction bar */}
          <div className="mt-4 pt-3 border-t border-navy-50 dark:border-navy-850 flex flex-col sm:flex-row justify-between gap-2 text-[10px] font-mono text-navy-400">
            <span>Region deployment: JHB-1 Johannesburg Primary, Secondary Read replicator CPT-2.</span>
            <span className="text-royal-500 dark:text-gold-400 font-bold">Click node to edit performance register configs.</span>
          </div>
        </div>

        {/* Detailed Inspector sidebar panel (Col-span: 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Node Inspector */}
          {selectedNodeId && (
            <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-royal-500/15 text-royal-600 dark:text-gold-400 rounded-lg">
                    <Info className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">
                    Node Inspector
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-navy-400 uppercase">{selectedNode.id}</span>
              </div>

              {/* Node Title */}
              <div className="space-y-1 text-left">
                <h4 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-wide">
                  {selectedNode.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded border ${
                    selectedNode.status === "nominal"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : selectedNode.status === "degraded"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse"
                  }`}>
                    STATUS: {selectedNode.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-navy-400 font-mono">Port: {selectedNode.port}</span>
                </div>
              </div>

              {/* Hardware metrics details */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl text-left bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">CPU Core Load</span>
                  <span className="text-base font-black font-mono text-navy-800 dark:text-white">{selectedNode.cpu}%</span>
                </div>

                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl text-left bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">Memory Block</span>
                  <span className="text-base font-black font-mono text-navy-800 dark:text-white">{selectedNode.memory}%</span>
                </div>

                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl text-left bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">Active Requests</span>
                  <span className="text-base font-black font-mono text-navy-800 dark:text-white">
                    {selectedNode.activeRequests.toLocaleString()}/s
                  </span>
                </div>

                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl text-left bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">Error Traces</span>
                  <span className="text-base font-black font-mono text-rose-500">{(selectedNode.errorRate * 100).toFixed(2)}%</span>
                </div>
              </div>

              {/* Geographic Region info */}
              <div className="bg-navy-50 dark:bg-navy-900/40 p-3 rounded-2xl border border-navy-100 dark:border-navy-850 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-navy-400">VM Architecture:</span>
                  <span className="font-mono font-bold text-navy-800 dark:text-navy-200">GCP Cloud Run Compute</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">Physical Zone:</span>
                  <span className="font-mono font-bold text-navy-800 dark:text-navy-200">{selectedNode.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">Node Uptime:</span>
                  <span className="font-mono font-bold text-navy-800 dark:text-navy-200">{selectedNode.uptime}</span>
                </div>
              </div>

              {/* Simulated Failure Toggle */}
              <div className="pt-2 border-t border-navy-100 dark:border-navy-850 space-y-2.5">
                <button
                  type="button"
                  onClick={() => toggleNodeFailure(selectedNode.id)}
                  className={`w-full py-2 px-3 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedNode.status === "down"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {selectedNode.status === "down" ? "Restore Node" : "Kill Microservice Node"}
                </button>
              </div>

            </div>
          )}

          {/* Link Inspector */}
          {selectedLinkId && selectedLink && (
            <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-royal-500/15 text-royal-600 dark:text-gold-400 rounded-lg">
                    <Radio className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">
                    Connection Inspector
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-navy-400 uppercase">LINK</span>
              </div>

              {/* Link metadata */}
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-bold text-navy-900 dark:text-white uppercase font-mono tracking-wide">
                  {selectedLink.from} ➔ {selectedLink.to}
                </h4>
                <span className={`text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded border inline-block ${
                  selectedLink.status === "active"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : selectedLink.status === "congested"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse"
                }`}>
                  LINK STATE: {selectedLink.status.toUpperCase()}
                </span>
              </div>

              {/* Link stats */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-left">
                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">Round Trip Latency</span>
                  <span className="text-sm font-black font-mono text-navy-800 dark:text-white">{selectedLink.latencyMs} ms</span>
                </div>

                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">Bandwidth Pipe</span>
                  <span className="text-sm font-black font-mono text-navy-800 dark:text-white">{selectedLink.bandwidthMbps} Mbps</span>
                </div>

                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">Network Packet Loss</span>
                  <span className="text-sm font-black font-mono text-navy-800 dark:text-white">{(selectedLink.packetLoss * 100).toFixed(2)}%</span>
                </div>

                <div className="border border-navy-100 dark:border-navy-850 p-2.5 rounded-xl bg-navy-50/50 dark:bg-navy-900/10">
                  <span className="text-[9px] font-mono text-navy-400 block uppercase font-bold">MTU Frame Size</span>
                  <span className="text-sm font-black font-mono text-navy-800 dark:text-white">1500 bytes</span>
                </div>
              </div>

              {/* Sim link latency booster */}
              <div className="pt-2 border-t border-navy-100 dark:border-navy-850">
                <button
                  type="button"
                  onClick={() => {
                    setLinks(prev =>
                      prev.map(l => {
                        if (l.id === selectedLink.id) {
                          const isCongested = l.status === "congested";
                          return {
                            ...l,
                            status: isCongested ? "active" : "congested",
                            latencyMs: isCongested ? 5 : 85,
                            packetLoss: isCongested ? 0.0 : 0.18
                          };
                        }
                        return l;
                      })
                    );
                    addLog(`Toggled latency parameters on link ${selectedLink.id}`);
                  }}
                  className="w-full py-2 px-3 bg-navy-900 text-gold-400 hover:bg-navy-800 border border-gold-400 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Toggle Latency / Packet Loss Spike
                </button>
              </div>

            </div>
          )}

          {/* Streaming logs monitor terminal log */}
          <div className="bg-navy-950 text-white border border-navy-850 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-navy-850 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-gold-400">
                <Terminal className="w-4 h-4 text-gold-500" />
                SRE Telemetry Live Logger
              </div>
              <button
                type="button"
                onClick={() => setTerminalLogs([])}
                className="text-[9px] font-mono text-navy-400 hover:text-white hover:underline cursor-pointer"
              >
                Clear Terminal
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[9.5px] text-emerald-400 text-left pr-1 select-text">
              {terminalLogs.length === 0 ? (
                <div className="text-navy-500 italic py-4">Terminal is empty. Trigger node events or load spikes to stream...</div>
              ) : (
                terminalLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-navy-600 shrink-0 select-none">&gt;</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Styled Animations CSS block */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>

    </div>
  );
};
