import React, { useEffect, useRef } from "react";
import { Terminal, Shield, AlertTriangle } from "lucide-react";

interface ConsolePanelProps {
  logs: string[];
  offlineNodes: string[];
  onClearLogs: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  logs,
  offlineNodes,
  onClearLogs,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll terminal to bottom when new logs enter
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[200px] font-mono text-xs shadow-2xl overflow-hidden relative">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-200 font-bold uppercase tracking-wider text-[10px]">
            Cloud Ingress & Server Logs
          </span>
        </div>

        <div className="flex items-center gap-3">
          {offlineNodes.length > 0 && (
            <div className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 py-0.5 px-2 rounded-full text-[9px] font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              SYSTEM FAILURE IN PROGRESS
            </div>
          )}

          <button
            onClick={onClearLogs}
            className="text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-800 py-0.5 px-2 rounded transition-colors"
          >
            Clear Terminal
          </button>
        </div>
      </div>

      {/* Output Console Logs */}
      <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin text-slate-300 pr-1 z-10 select-all">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic text-center pt-8">
            Terminal connection online. Idle, awaiting dynamic pipeline simulation triggers...
          </div>
        ) : (
          logs.map((log, idx) => {
            let colorClass = "text-slate-400";
            if (log.includes("[ERROR]") || log.includes("[CRITICAL]")) {
              colorClass = "text-red-400 font-semibold";
            } else if (log.includes("[SUCCESS]") || log.includes("HIT")) {
              colorClass = "text-emerald-400 font-medium";
            } else if (log.includes("[WARN]")) {
              colorClass = "text-amber-400 font-medium";
            } else if (log.includes("SYSTEM")) {
              colorClass = "text-blue-400 font-semibold";
            }

            return (
              <div key={idx} className={`leading-relaxed ${colorClass}`}>
                <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
