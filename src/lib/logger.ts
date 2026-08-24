import { generateId } from "./db";

export interface LogPayload {
  id?: string;
  timestamp?: string;
  level: "info" | "warn" | "error" | "critical";
  message: string;
  component?: string;
  stack?: string;
  metadata?: Record<string, any>;
  actor?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  userAgent?: string;
  url?: string;
}

class CentralizedLogger {
  private isInitialized = false;
  private queue: LogPayload[] = [];
  private isProcessing = false;

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;

    // Listen to uncaught exceptions
    window.addEventListener("error", (event) => {
      this.error(
        event.message || "Uncaught Error",
        event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : "window.onerror",
        event.error?.stack,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    });

    // Listen to unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      const message = typeof reason === "string" ? reason : reason?.message || "Unhandled Promise Rejection";
      const stack = reason?.stack || undefined;

      this.error(
        `Unhandled Promise Rejection: ${message}`,
        "unhandledrejection",
        stack,
        { reason: String(reason) }
      );
    });

    console.log("CentralizedLogger service initialized successfully.");
  }

  public info(message: string, component = "App", metadata?: Record<string, any>) {
    this.enqueue({ level: "info", message, component, metadata });
  }

  public warn(message: string, component = "App", metadata?: Record<string, any>) {
    this.enqueue({ level: "warn", message, component, metadata });
  }

  public error(message: string, component = "App", stack?: string, metadata?: Record<string, any>) {
    this.enqueue({ level: "error", message, component, stack, metadata });
  }

  public logAdminEvent(action: string, component: string, metadata?: Record<string, any>, user?: any) {
    this.enqueue({
      level: "info",
      message: `[ADMIN_ACTION] ${action}`,
      component,
      metadata: {
        isAdminAction: true,
        action,
        ...metadata
      },
      actor: user ? {
        id: user.id,
        name: `${user.first_name || ""} ${user.surname || ""}`.trim() || user.name,
        email: user.email,
        role: user.role
      } : undefined
    });
  }

  private enqueue(payload: LogPayload) {
    const userProfile = this.getUserProfile();
    const entry: LogPayload = {
      id: payload.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: payload.timestamp || new Date().toISOString(),
      level: payload.level,
      message: payload.message,
      component: payload.component || "Client",
      stack: payload.stack,
      metadata: payload.metadata,
      actor: payload.actor || (userProfile ? {
        id: userProfile.id,
        name: `${userProfile.first_name || ""} ${userProfile.surname || ""}`.trim() || userProfile.email,
        email: userProfile.email,
        role: userProfile.role
      } : undefined),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server/Node",
      url: typeof window !== "undefined" ? window.location.href : ""
    };

    // Save to local cache for offline availability
    this.saveToLocalCache(entry);

    // Queue for network transmit
    this.queue.push(entry);
    this.flushQueue();
  }

  private async flushQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      try {
        await fetch("/api/logs/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });
      } catch (err) {
        // If network request fails, retain in local storage
        console.warn("CentralizedLogger: Failed to send log to server, preserved in local cache.", err);
      }
    }

    this.isProcessing = false;
  }

  private getUserProfile() {
    try {
      if (typeof localStorage === "undefined") return null;
      const profilesStr = localStorage.getItem("amh_profiles");
      if (!profilesStr) return null;
      const profiles = JSON.parse(profilesStr);
      return Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
    } catch {
      return null;
    }
  }

  private saveToLocalCache(entry: LogPayload) {
    try {
      if (typeof localStorage === "undefined") return;
      const existing = JSON.parse(localStorage.getItem("amh_centralized_logs") || "[]");
      const updated = [entry, ...(Array.isArray(existing) ? existing : [])].slice(0, 100);
      localStorage.setItem("amh_centralized_logs", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }
}

export const logger = new CentralizedLogger();
