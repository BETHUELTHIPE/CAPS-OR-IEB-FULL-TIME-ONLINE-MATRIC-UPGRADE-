import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  User,
  Calculator,
  Search,
  MoreVertical,
  PhoneCall,
  Video,
  Info,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Download,
  Mic,
  MicOff,
  Trash2,
  RefreshCw,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  FileCode
} from "lucide-react";
import { Profile } from "../types";
import { LatexRenderer } from "./LatexRenderer";
import { LatexMathEditor } from "./LatexMathEditor";
import { VisualLatexToolbar } from "./VisualLatexToolbar";
import { LatexExportModal } from "./LatexExportModal";

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "tutor";
  tutorId: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  topic?: string;
  priority?: "normal" | "urgent" | "exam_prep";
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: "image" | "pdf" | "audio";
  voiceDuration?: string;
}

export interface TutorInfo {
  id: string;
  name: string;
  surname: string;
  title: string;
  specialization: string;
  avatar: string;
  isOnline: boolean;
  statusText: string;
  gradeSpecialty: string;
  rating: number;
  responseCount: string;
}

export const TUTORS_LIST: TutorInfo[] = [
  {
    id: "usr-bethuel",
    name: "Bethuel",
    surname: "Moukangwe",
    title: "Head Master Coach & Founder",
    specialization: "Calculus & Analytical Geometry (CAPS/IEB)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    isOnline: true,
    statusText: "Online • Ready for Calculus & Algebra",
    gradeSpecialty: "Grade 11 - 12 & Matric Upgrade",
    rating: 5.0,
    responseCount: "< 5 mins"
  },
  {
    id: "usr-naledi",
    name: "Naledi",
    surname: "Nkosi",
    title: "Senior CAPS Mathematics Specialist",
    specialization: "Trigonometry, Algebra & Euclidean Geometry",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    isOnline: true,
    statusText: "Online • Reviewing Practice Scans",
    gradeSpecialty: "Grade 10 - 12 CAPS",
    rating: 4.9,
    responseCount: "< 10 mins"
  },
  {
    id: "usr-thabo",
    name: "Thabo",
    surname: "Mokoena",
    title: "IEB & Advanced Programme Specialist",
    specialization: "AP Maths, Sequences, Series & Financial Maths",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    isOnline: false,
    statusText: "Away • Back at 14:00 CAT",
    gradeSpecialty: "IEB & AP Mathematics",
    rating: 4.95,
    responseCount: "~ 15 mins"
  }
];

export interface DirectTutorMessagingProps {
  user: Profile | null;
  initialTutorId?: string;
  className?: string;
}

export const DirectTutorMessaging: React.FC<DirectTutorMessagingProps> = ({
  user,
  initialTutorId = "usr-bethuel",
  className = ""
}) => {
  const [selectedTutorId, setSelectedTutorId] = useState<string>(initialTutorId);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("Differential Calculus");
  const [messagePriority, setMessagePriority] = useState<"normal" | "urgent" | "exam_prep">("normal");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showLatexEditor, setShowLatexEditor] = useState<boolean>(false);
  const [showLatexExportModal, setShowLatexExportModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTutor = TUTORS_LIST.find((t) => t.id === selectedTutorId) || TUTORS_LIST[0];

  // Load chat history for the active student + tutor from localStorage
  useEffect(() => {
    const studentId = user?.id || "guest-student";
    const storageKey = `amh_direct_messages_${studentId}_${selectedTutorId}`;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Seed initial friendly message from the tutor
        const initialSeed: DirectMessage[] = [
          {
            id: `msg-seed-1`,
            senderId: selectedTutorId,
            senderName: `${activeTutor.name} ${activeTutor.surname}`,
            senderRole: "tutor",
            tutorId: selectedTutorId,
            text: `Ayo ${user?.first_name || "Learner"}! 👋 Welcome to your private 1-on-1 direct tutor messaging desk.\n\nI'm **${activeTutor.name}**, your assigned ${activeTutor.title}.\n\nHow can I help you excel in your Mathematics practice today?\n- Send me a photo scan of your handwritten step-by-step attempt.\n- Ask for guidance on complex CAPS/IEB exam proof steps.\n- Type any formula in KaTeX using the calculator button below!`,
            timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
            status: "read",
            topic: "General Guidance",
            priority: "normal"
          }
        ];
        setMessages(initialSeed);
        localStorage.setItem(storageKey, JSON.stringify(initialSeed));
      }
    } catch (err) {
      console.error("Error loading tutor direct messages:", err);
    }
  }, [selectedTutorId, user?.id, activeTutor.name, activeTutor.surname, activeTutor.title]);

  // Save messages to localStorage on updates
  const saveMessagesToStorage = (updated: DirectMessage[]) => {
    const studentId = user?.id || "guest-student";
    const storageKey = `amh_direct_messages_${studentId}_${selectedTutorId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist messages:", e);
    }
  };

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Voice recording simulation timer
  useEffect(() => {
    if (isRecordingVoice) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Handle Image attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size exceeds 5MB limit. Please upload a smaller scan.");
        return;
      }
      setAttachedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Math Insert helper
  const handleInsertSymbol = (symbolLatex: string) => {
    setInputMessage((prev) => prev + ` ${symbolLatex} `);
  };

  // Send Student Message
  const handleSendMessage = () => {
    if (!inputMessage.trim() && !attachedImage && !isRecordingVoice) return;

    const studentId = user?.id || "usr-student";
    const studentName = user ? `${user.first_name} ${user.surname}` : "Student Learner";

    let attachmentObj: Partial<DirectMessage> = {};
    if (attachedImage) {
      attachmentObj = {
        attachmentUrl: attachedImage,
        attachmentName: attachedFileName || "Math_Problem_Scan.png",
        attachmentType: "image"
      };
    } else if (isRecordingVoice) {
      const minutes = Math.floor(recordingSeconds / 60);
      const secs = recordingSeconds % 60;
      const formattedDuration = `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
      attachmentObj = {
        attachmentName: "Voice_Explanation_Question.mp3",
        attachmentType: "audio",
        voiceDuration: formattedDuration
      };
      setIsRecordingVoice(false);
    }

    const newMessage: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: studentId,
      senderName: studentName,
      senderRole: "student",
      tutorId: selectedTutorId,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
      status: "delivered",
      topic: selectedTopic,
      priority: messagePriority,
      ...attachmentObj
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    saveMessagesToStorage(updated);

    // Reset inputs
    setInputMessage("");
    setAttachedImage(null);
    setAttachedFileName("");

    // Simulate Real-time Tutor Reply
    triggerTutorReply(newMessage);
  };

  // Generate Tutor Response with KaTeX Math
  const triggerTutorReply = (studentMsg: DirectMessage) => {
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      const textLower = studentMsg.text.toLowerCase();

      if (textLower.includes("derivative") || textLower.includes("calculus") || textLower.includes("lim")) {
        replyText = `Great question on Calculus! 📐\n\nWhen finding the derivative from first principles for $f(x) = x^2 - 3x$, remember to apply the limit definition:\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n1. Substitute $(x+h)$ into $f(x)$:\n$$f(x+h) = (x+h)^2 - 3(x+h) = x^2 + 2xh + h^2 - 3x - 3h$$\n2. Subtract $f(x)$:\n$$f(x+h) - f(x) = 2xh + h^2 - 3h = h(2x + h - 3)$$\n3. Divide by $h$ and evaluate $h \\to 0$:\n$$f'(x) = 2x - 3$$\n\nLet me know if you'd like to sketch this gradient curve on our interactive whiteboard!`;
      } else if (textLower.includes("trig") || textLower.includes("sin") || textLower.includes("cos")) {
        replyText = `Excellent Trigonometry query! 🌟\n\nFor CAPS & IEB paper 2 reduction formulas, keep the quadrant signs in mind:\n- $\\sin(180^\\circ - \\theta) = \\sin \\theta$ (Quadrant II: Sine is positive)\n- $\\cos(180^\\circ + \\theta) = -\\cos \\theta$ (Quadrant III: Cosine is negative)\n- $\\sin^2 \\theta + \\cos^2 \\theta = 1$ (Pythagorean identity)\n\nDouble angle expansion:\n$$\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$$`;
      } else if (textLower.includes("quad") || textLower.includes("formula") || textLower.includes("solve")) {
        replyText = `Got it! Here is the exact quadratic step breakdown:\n\nFor $ax^2 + bx + c = 0$, use:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nRemember to write down your $a, b, c$ values clearly before substituting to ensure full method marks from the matric marker!`;
      } else if (studentMsg.attachmentType === "image") {
        replyText = `I've received your handwritten scan **${studentMsg.attachmentName}**! 📸\n\nI am reviewing line-by-line now. Your algebraic distribution in step 2 looks solid. Just be mindful of the negative sign when expanding $-(3x - 4)$. Keep up the high-level work!`;
      } else if (studentMsg.attachmentType === "audio") {
        replyText = `Received your voice question (${studentMsg.voiceDuration})! 🎙️\n\nI've listened to your note. You're spot on regarding the horizontal asymptote $y = q$. Since $q = -2$, the hyperbola curve shifts down by 2 units.`;
      } else {
        replyText = `Thank you for reaching out, ${user?.first_name || "Learner"}! 🎯\n\nI've noted your question regarding **${studentMsg.topic}**. Here is the core CAPS/IEB formula reference:\n\n$$T_n = a + (n - 1)d$$\n\nLet me know if you want me to generate a custom step-by-step worked video for your student portal!`;
      }

      const tutorReplyMsg: DirectMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: selectedTutorId,
        senderName: `${activeTutor.name} ${activeTutor.surname}`,
        senderRole: "tutor",
        tutorId: selectedTutorId,
        text: replyText,
        timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
        status: "read",
        topic: studentMsg.topic,
        priority: studentMsg.priority
      };

      setMessages((prev) => {
        const updatedWithReply = [...prev, tutorReplyMsg];
        saveMessagesToStorage(updatedWithReply);
        return updatedWithReply;
      });

      setIsTyping(false);
    }, 2200);
  };

  const filteredMessages = messages.filter((m) => {
    if (filterPriority !== "all" && m.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      return m.text.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className={`bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[750px] max-h-[88vh] ${className}`}>
      
      {/* LEFT SIDEBAR: TUTOR LIST & FILTERS */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/60 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-navy-800 bg-slate-100/80 dark:bg-navy-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-royal-600 dark:text-gold-400" />
            <h3 className="text-sm font-extrabold font-display text-slate-900 dark:text-white">
              Assigned Math Tutors
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            3 Online
          </span>
        </div>

        {/* Search inside tutor list */}
        <div className="p-3 border-b border-slate-200 dark:border-navy-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-royal-500"
            />
          </div>
        </div>

        {/* Tutor Selection Cards */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {TUTORS_LIST.map((tutor) => {
            const isSelected = tutor.id === selectedTutorId;
            return (
              <div
                key={tutor.id}
                onClick={() => setSelectedTutorId(tutor.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                  isSelected
                    ? "bg-white dark:bg-navy-800 border-royal-500/60 shadow-sm ring-1 ring-royal-500/30"
                    : "bg-white/60 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800/80 hover:bg-white dark:hover:bg-navy-800/50"
                }`}
              >
                {/* Avatar with status dot */}
                <div className="relative shrink-0">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-navy-700 shadow-xs"
                  />
                  <span
                    className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-navy-900 ${
                      tutor.isOnline ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tutor.name} {tutor.surname}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-gold-500 flex items-center gap-0.5">
                      ★ {tutor.rating}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-sans">
                    {tutor.title}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-300">
                      {tutor.gradeSpecialty.split(" ")[0]}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 truncate">
                      Reply {tutor.responseCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Priority Filter */}
        <div className="p-3 border-t border-slate-200 dark:border-navy-800 bg-slate-100/50 dark:bg-navy-900 text-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Filter Messages
          </span>
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All" },
              { id: "normal", label: "Normal" },
              { id: "urgent", label: "Urgent" },
              { id: "exam_prep", label: "Exam" }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPriority(p.id)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  filterPriority === p.id
                    ? "bg-royal-600 text-white border-royal-600"
                    : "bg-white dark:bg-navy-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white dark:bg-navy-950 min-w-0">
        
        {/* CHAT HEADER */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-navy-800 bg-slate-50/80 dark:bg-navy-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={activeTutor.avatar}
                alt={activeTutor.name}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-navy-700 shadow-xs"
              />
              <span
                className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-navy-900 ${
                  activeTutor.isOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold font-display text-slate-900 dark:text-white truncate">
                  {activeTutor.name} {activeTutor.surname}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  VERIFIED TUTOR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate">
                {activeTutor.statusText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowLatexExportModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-royal-600/10 hover:bg-royal-600/20 text-royal-600 dark:text-royal-300 border border-royal-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Conversation as LaTeX (.tex) Formatted File"
            >
              <FileCode className="w-3.5 h-3.5 text-royal-500" />
              <span className="hidden sm:inline">Export LaTeX (.tex)</span>
              <span className="sm:hidden">.tex</span>
            </button>

            <button
              onClick={() => setShowLatexEditor(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-gold-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Launch KaTeX Equation Editor"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Math Editor</span>
            </button>
          </div>
        </div>

        {/* CHAT MESSAGES SCROLL AREA */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-navy-950">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-xs font-mono">No messages found. Send a message to start conversing with {activeTutor.name}.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isStudent = msg.senderRole === "student";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                    isStudent ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border shadow-xs ${
                      isStudent
                        ? "bg-royal-600 text-white border-royal-500"
                        : "bg-navy-900 text-gold-400 border-navy-700"
                    }`}
                  >
                    {isStudent ? (user?.first_name?.charAt(0) || "S") : activeTutor.name.charAt(0)}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    {/* Header info */}
                    <div
                      className={`flex items-center gap-2 text-[10px] font-mono ${
                        isStudent ? "justify-end text-slate-400" : "justify-start text-slate-400"
                      }`}
                    >
                      <span className="font-bold text-slate-600 dark:text-slate-300">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                      {msg.topic && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                          {msg.topic}
                        </span>
                      )}
                    </div>

                    {/* Content Box */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 border shadow-xs ${
                        isStudent
                          ? "bg-royal-600 text-white border-royal-500 rounded-tr-xs"
                          : "bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-navy-800 rounded-tl-xs"
                      }`}
                    >
                      {/* Priority Warning Tag if urgent */}
                      {msg.priority === "urgent" && (
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" />
                          <span>URGENT HOMEWORK HELP</span>
                        </div>
                      )}

                      {/* Rendered Text with KaTeX Support */}
                      <div className="whitespace-pre-line font-sans">
                        <LatexRenderer text={msg.text} />
                      </div>

                      {/* Image Attachment Preview */}
                      {msg.attachmentType === "image" && msg.attachmentUrl && (
                        <div
                          onClick={() => setPreviewImageModal(msg.attachmentUrl!)}
                          className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-navy-800 cursor-pointer group relative max-w-xs"
                        >
                          <img
                            src={msg.attachmentUrl}
                            alt={msg.attachmentName || "Attachment"}
                            className="w-full max-h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono font-bold">
                            Click to Expand
                          </div>
                        </div>
                      )}

                      {/* Audio Voice Note Preview */}
                      {msg.attachmentType === "audio" && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-amber-300 border border-slate-800 flex items-center gap-2 font-mono text-[11px]">
                          <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>Voice Question ({msg.voiceDuration || "0:15"})</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery Status for Student */}
                    {isStudent && (
                      <div className="flex justify-end text-[10px] text-royal-400 gap-1 font-mono">
                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                        <span>Delivered</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 animate-pulse pl-10">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{activeTutor.name} is reviewing & typing solution...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ATTACHMENT PREVIEW BAR */}
        {(attachedImage || isRecordingVoice) && (
          <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2 truncate">
              {attachedImage ? (
                <>
                  <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">Attached Scan: {attachedFileName}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
                  <span>Recording Voice Note... {recordingSeconds}s</span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                setAttachedImage(null);
                setIsRecordingVoice(false);
              }}
              className="text-amber-600 hover:text-rose-500 cursor-pointer font-bold ml-2"
            >
              Remove
            </button>
          </div>
        )}

        {/* INPUT TOOLBAR & CONTROLS */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50/90 dark:bg-navy-900/90 space-y-3 shrink-0">
          
          {/* Context Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Topic Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Topic:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-2 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="Differential Calculus">Differential Calculus</option>
                <option value="Algebra & Surds">Algebra & Surds</option>
                <option value="Sequences & Series">Sequences & Series</option>
                <option value="Trigonometry">Trigonometry</option>
                <option value="Analytical Geometry">Analytical Geometry</option>
                <option value="Financial Maths">Financial Maths</option>
                <option value="Euclidean Geometry">Euclidean Geometry</option>
                <option value="Statistics & Probability">Statistics & Probability</option>
              </select>
            </div>

            {/* Priority Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Priority:</span>
              <select
                value={messagePriority}
                onChange={(e) => setMessagePriority(e.target.value as any)}
                className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-2 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="normal">Normal Question</option>
                <option value="urgent">Urgent Homework Help</option>
                <option value="exam_prep">Exam Proof Check</option>
              </select>
            </div>
          </div>

          {/* Attachments and Voice Bar */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Attach Scan Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Attach handwritten scan or math diagram"
            >
              <Paperclip className="w-3.5 h-3.5 text-royal-500" />
              <span>Attach Scan</span>
            </button>

            {/* Record Voice Question */}
            <button
              onClick={() => setIsRecordingVoice(!isRecordingVoice)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                isRecordingVoice
                  ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                  : "bg-white dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800"
              }`}
              title="Record voice explanation question"
            >
              <Mic className="w-3.5 h-3.5 text-rose-500" />
              <span>{isRecordingVoice ? `Recording ${recordingSeconds}s` : "Voice Note"}</span>
            </button>
          </div>

          {/* Visual LaTeX Toolbar & Message Text Box */}
          <VisualLatexToolbar
            value={inputMessage}
            onChange={setInputMessage}
            placeholder={`Ask Tutor ${activeTutor.name} a question... Insert equations with the math palette or visual builder!`}
            rows={2}
            onSend={handleSendMessage}
            buttonText="Send Question"
          />
        </div>
      </div>

      {/* LATEX MATH EDITOR MODAL OVERLAY */}
      {showLatexEditor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                KaTeX Formula Editor
              </h3>
              <button
                onClick={() => setShowLatexEditor(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LatexMathEditor
              onSendToTutor={(latex) => {
                setInputMessage((prev) => prev + ` ${latex} `);
                setShowLatexEditor(false);
              }}
            />
          </div>
        </div>
      )}

      {/* LIGHTBOX FOR IMAGE PREVIEW */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-2 right-2 p-2 bg-navy-900 text-white rounded-full border border-navy-700"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImageModal}
              alt="Scan Full View"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-navy-800"
            />
          </div>
        </div>
      )}

      {/* LaTeX Conversation Export Modal */}
      <LatexExportModal
        isOpen={showLatexExportModal}
        onClose={() => setShowLatexExportModal(false)}
        messages={messages.map((m) => ({
          role: m.senderRole === "student" ? "student" : "tutor",
          senderName: m.senderName,
          text: m.text,
          timestamp: m.timestamp,
          topic: m.topic || selectedTopic
        }))}
        studentName={user?.first_name ? `${user.first_name} ${user.surname || ""}`.trim() : "CAPS Math Student"}
        tutorName={`${activeTutor.name} ${activeTutor.surname}`}
        syllabus="CAPS & IEB"
        grade={activeTutor.gradeSpecialty}
        topic={selectedTopic}
      />
    </div>
  );
};
