import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Bot, User, Image, Paperclip, X, BookOpen, 
  HelpCircle, Lightbulb, CheckCircle2, Copy, RefreshCw, Bookmark,
  Layers, ChevronDown, Award, AlertTriangle, FileText, Calculator,
  Mic, MicOff, Volume2, VolumeX, AlertCircle, Play, Pause, Gauge,
  Download, Printer, FileCode, Check
} from "lucide-react";
import { Profile } from "../types";
import { LatexRenderer } from "./LatexRenderer";
import { LatexMathEditor } from "./LatexMathEditor";
import { ReasoningPdfExportModal } from "./ReasoningPdfExportModal";
import { FormulaQuickReferenceDrawer } from "./FormulaQuickReferenceDrawer";
import { LatexExportModal } from "./LatexExportModal";
import { downloadLatexFile, generateConversationLatex } from "../lib/latexExport";
import { uploadFileToFirebaseStorage } from "../lib/firebaseStorageService";

// Smart Helper for Spoken Math Phonetic Formatting
const formatSpokenMath = (text: string): string => {
  let result = text;
  result = result
    .replace(/\bx squared\b/gi, "x²")
    .replace(/\by squared\b/gi, "y²")
    .replace(/\bx cubed\b/gi, "x³")
    .replace(/\bplus or minus\b/gi, "±")
    .replace(/\bsquare root of\b/gi, "√")
    .replace(/\bsquare root\b/gi, "√")
    .replace(/\bdivided by\b/gi, "÷")
    .replace(/\bmultiply by\b/gi, "×")
    .replace(/\bmultiplied by\b/gi, "×")
    .replace(/\bpi\b/gi, "π")
    .replace(/\btheta\b/gi, "θ")
    .replace(/\bdelta\b/gi, "Δ")
    .replace(/\bintegral of\b/gi, "∫")
    .replace(/\bintegral\b/gi, "∫")
    .replace(/\bgreater than or equal to\b/gi, "≥")
    .replace(/\bless than or equal to\b/gi, "≤")
    .replace(/\bnot equal to\b/gi, "≠")
    .replace(/\binfinity\b/gi, "∞")
    .replace(/\balpha\b/gi, "α")
    .replace(/\bbeta\b/gi, "β");
  return result;
};

// Convert LaTeX math constructs into clean spoken words for Text-to-Speech
const convertLatexToSpokenText = (text: string): string => {
  if (!text) return "";
  let spoken = text;
  // Strip Markdown syntax
  spoken = spoken.replace(/```[\s\S]*?```/g, "");
  spoken = spoken.replace(/\*\*/g, "").replace(/\*/g, "");
  spoken = spoken.replace(/###/g, "").replace(/##/g, "").replace(/#/g, "");

  spoken = spoken
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2")
    .replace(/\\sqrt\{([^}]+)\}/g, "square root of $1")
    .replace(/\\sqrt/g, "square root of ")
    .replace(/\^2\b/g, " squared")
    .replace(/\^3\b/g, " cubed")
    .replace(/\^\{([^}]+)\}/g, " to the power of $1")
    .replace(/\\pm/g, " plus or minus ")
    .replace(/\\times/g, " multiplied by ")
    .replace(/\\div/g, " divided by ")
    .replace(/\\approx/g, " is approximately equal to ")
    .replace(/\\neq/g, " is not equal to ")
    .replace(/\\leq/g, " is less than or equal to ")
    .replace(/\\geq/g, " is greater than or equal to ")
    .replace(/\\infty/g, " infinity ")
    .replace(/\\pi/g, " pi ")
    .replace(/\\theta/g, " theta ")
    .replace(/\\alpha/g, " alpha ")
    .replace(/\\beta/g, " beta ")
    .replace(/\\int/g, " integral of ")
    .replace(/\\lim_\{([^}]+)\}/g, " limit as $1 ")
    .replace(/\\sin/g, " sine ")
    .replace(/\\cos/g, " cosine ")
    .replace(/\\tan/g, " tangent ")
    .replace(/\\log/g, " log ")
    .replace(/\\ln/g, " natural log ")
    .replace(/[\$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return spoken;
};

interface AskTutorProps {
  user: Profile | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  text: string;
  timestamp: string;
  imageData?: string;
  syllabus?: string;
  grade?: string;
  topic?: string;
  mode?: string;
}

export const AskTutor: React.FC<AskTutorProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "tutor",
      text: `Ayo ${user?.first_name || "Student"}! 🎓 Welcome to **Ask Tutor Bethuel**, your 24/7 AI Mathematics Hub tutor!

I'm aligned with both **CAPS** and **IEB** South African Grade 10-12 curricula. 

**How can I assist you today?**
- 📸 Upload a photograph of a handwritten math problem or past paper question.
- 📐 Ask for step-by-step solutions with full method marks.
- 💡 Get hints without spoiling the final answer.
- 📚 Request theorem proofs or conceptual visual explanations.

Select your syllabus and topic above, or type your question below to begin!`,
      timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Context selection states
  const [syllabus, setSyllabus] = useState<"CAPS" | "IEB">("CAPS");
  const [grade, setGrade] = useState<"Grade 10" | "Grade 11" | "Grade 12" | "Matric Upgrade">("Grade 12");
  const [topic, setTopic] = useState<string>("Differential Calculus");
  const [mode, setMode] = useState<"step_by_step" | "hint_only" | "concept" | "practice">("step_by_step");
  
  // LaTeX Math Editor modal state
  const [showLatexEditor, setShowLatexEditor] = useState(false);

  // Formula Quick-Reference Drawer state
  const [showFormulaDrawer, setShowFormulaDrawer] = useState(false);

  const handleInsertFormulaFromDrawer = (latexCode: string) => {
    setInput((prev) => (prev ? `${prev} $${latexCode}$` : `$${latexCode}$`));
  };

  // PDF Export Modal State
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [exportPdfData, setExportPdfData] = useState<{
    text: string;
    question?: string;
    topic?: string;
    syllabus?: string;
    grade?: string;
  } | null>(null);

  // LaTeX Export Modal State
  const [showLatexExportModal, setShowLatexExportModal] = useState(false);
  const [latexExportSubset, setLatexExportSubset] = useState<ChatMessage[] | null>(null);

  const handleOpenPdfExport = (tutorMsgText: string, userQuestionText?: string) => {
    setExportPdfData({
      text: tutorMsgText,
      question: userQuestionText || "CAPS/IEB Mathematics Problem Reasoning",
      topic,
      syllabus,
      grade
    });
    setShowPdfExportModal(true);
  };

  const handleExportLatexFile = (customMessages?: ChatMessage[]) => {
    const targetMessages = customMessages || messages;
    const studentName = user?.first_name ? `${user.first_name} ${user.surname || ""}`.trim() : "CAPS Math Student";
    const latexContent = generateConversationLatex({
      title: `Amaris Math - ${topic} Derivations`,
      studentName,
      tutorName: "Tutor Bethuel",
      syllabus,
      grade,
      topic,
      messages: targetMessages
    });
    const sanitizedFileName = `amaris_${topic.toLowerCase().replace(/[^a-z0-9]/g, "_")}_derivations.tex`;
    downloadLatexFile(latexContent, sanitizedFileName);
  };
  
  // Image upload state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Web Speech API Speech-to-Text Dictation State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const toggleSpeechDictation = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimTranscript("");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser. Please try Google Chrome, MS Edge, or Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-ZA"; // Default South African English

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let finalStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalStr += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (finalStr) {
          const formatted = formatSpokenMath(finalStr);
          if (formatted.toLowerCase().includes("send question") || formatted.toLowerCase().includes("solve problem")) {
            const cleanedText = formatted.replace(/send question|solve problem/gi, "").trim();
            if (cleanedText) {
              setInput(prev => (prev ? `${prev} ${cleanedText}` : cleanedText));
            }
            recognition.stop();
            setIsListening(false);
            setTimeout(() => handleSendMessage(), 300);
          } else {
            setInput(prev => (prev ? `${prev} ${formatted}` : formatted));
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSpeechError("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else if (event.error !== "no-speech") {
          setSpeechError(`Speech error (${event.error}). Try speaking closer to your microphone.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setSpeechError("Could not connect to microphone speech engine.");
      setIsListening(false);
    }
  };

  // Web Speech API Text-to-Speech (Voice Readout & Reading Speed Control)
  const [readingSpeed, setReadingSpeed] = useState<number>(0.95);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const activeSpeakingTextRef = useRef<string | null>(null);

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
    activeSpeakingTextRef.current = null;
  };

  const handleToggleSpeakMessage = (msgId: string, rawText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Text-to-speech audio playback is not supported in this browser.");
      return;
    }

    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    const spokenText = convertLatexToSpokenText(rawText);
    if (!spokenText) return;

    activeSpeakingTextRef.current = spokenText;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = readingSpeed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.lang.startsWith("en-ZA") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-US")) || voices[0];
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
      activeSpeakingTextRef.current = null;
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
      activeSpeakingTextRef.current = null;
    };

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleReadingSpeedChange = (newSpeed: number) => {
    setReadingSpeed(newSpeed);
    // Dynamically update active speech if currently speaking
    if (currentlySpeakingId && activeSpeakingTextRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeSpeakingTextRef.current);
      utterance.rate = newSpeed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(v => v.lang.startsWith("en-ZA") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-US")) || voices[0];
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onend = () => {
        setCurrentlySpeakingId(null);
        activeSpeakingTextRef.current = null;
      };

      utterance.onerror = () => {
        setCurrentlySpeakingId(null);
        activeSpeakingTextRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    }
  };
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be under 10MB.");
        return;
      }
      setAttachedFileName(file.name);
      
      // Fast preview via dataUrl
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Background upload to Firebase Storage
      try {
        const studentId = user?.id || "anonymous";
        const uploadRes = await uploadFileToFirebaseStorage(file, `ask_tutor_images/${studentId}`);
        if (uploadRes?.url) {
          setAttachedImage(uploadRes.url);
        }
      } catch (uploadErr) {
        console.warn("[Firebase Storage] Image upload notice, using local data URL fallback:", uploadErr);
      }
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    setAttachedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (customPrompt?: string, overrideMode?: "step_by_step" | "hint_only" | "concept" | "practice") => {
    const messageText = customPrompt || input.trim();
    if ((!messageText && !attachedImage) || loading) return;

    if (!customPrompt) setInput("");

    const currentMode = overrideMode || mode;
    const userMsgId = "msg-" + Date.now();
    const timestampStr = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: messageText || "Please solve and analyze the attached math problem in detail.",
      timestamp: timestampStr,
      imageData: attachedImage || undefined,
      syllabus,
      grade,
      topic,
      mode: currentMode,
    };

    setMessages(prev => [...prev, newUserMessage]);
    
    // Reset attached image after sending
    const sentImage = attachedImage;
    removeAttachedImage();
    
    setLoading(true);

    try {
      const apiHistory = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.text
      }));

      const res = await fetch("/api/ai/tutor-bethuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newUserMessage.text,
          history: apiHistory.slice(-8), // send last 8 turns for context efficiency
          studentName: user ? `${user.first_name} ${user.surname}` : "Student",
          syllabus,
          grade,
          topic,
          mode: currentMode,
          imageData: sentImage || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.text) {
        setMessages(prev => [
          ...prev,
          {
            id: "msg-" + Date.now() + "-reply",
            role: "tutor",
            text: data.text,
            timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
          }
        ]);
      } else {
        throw new Error(data.error || "Failed to communicate with Tutor Bethuel AI");
      }
    } catch (err: any) {
      console.error("Ask Tutor AI Error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: "msg-" + Date.now() + "-err",
          role: "tutor",
          text: `Ayo! I experienced a temporary network connection glitch. Let's try sending that again!\n\n*(Technical Note: ${err.message || "Server connection timeout"})*`,
          timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Solution text copied to clipboard!");
  };

  const topicsList = [
    "Algebra & Equations",
    "Sequences & Series",
    "Functions & Inverse Graphs",
    "Trigonometry & Identities",
    "Differential Calculus",
    "Analytical Geometry",
    "Euclidean Geometry",
    "Financial Mathematics",
    "Statistics & Regression",
    "Probability & Counting"
  ];

  const presetPrompts = [
    {
      label: "Calculus First Principles",
      prompt: "Find the derivative of f(x) = 2x^2 - 3x + 1 from first principles using the limit definition.",
      topic: "Differential Calculus",
      mode: "step_by_step" as const
    },
    {
      label: "Quadratic Formula & Roots",
      prompt: "For what values of k will the equation x^2 - kx + (k + 3) = 0 have equal real roots?",
      topic: "Algebra & Equations",
      mode: "step_by_step" as const
    },
    {
      label: "Trig Compound Reduction",
      prompt: "Prove the identity: [sin(180° - x)cos(90° + x)] / [tan(180° + x)cos(360° - x)] = -sin^2(x)",
      topic: "Trigonometry & Identities",
      mode: "step_by_step" as const
    },
    {
      label: "Present Value Annuity",
      prompt: "A home loan of R850,000 is repaid over 20 years with monthly payments at 11.5% p.a. compounded monthly. Calculate monthly installment x.",
      topic: "Financial Mathematics",
      mode: "step_by_step" as const
    },
    {
      label: "Tan-Chord Theorem Proof",
      prompt: "Explain the geometric proof and conditions for the Tan-Chord Theorem in Circle Geometry.",
      topic: "Euclidean Geometry",
      mode: "concept" as const
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-left flex flex-col h-[750px] bg-white dark:bg-navy-900 rounded-2xl p-4 sm:p-6 border border-navy-150 dark:border-navy-800 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-navy-150 dark:border-navy-800">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
            Ask Tutor Bethuel AI
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Syllabus Aligned
            </span>
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400 font-mono">
            Instant step-by-step problem solver for CAPS & IEB Matric Mathematics (Grade 10-12).
          </p>
        </div>

        {/* Live Status Indicator & Toolbar Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowFormulaDrawer(true)}
            className="px-3 py-1.5 bg-navy-100 hover:bg-navy-200 dark:bg-navy-850 dark:hover:bg-navy-800 text-navy-800 dark:text-navy-100 font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-navy-200 dark:border-navy-750"
            title="Open Formula Quick-Reference drawer with KaTeX formulas"
          >
            <BookOpen className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
            <span className="hidden sm:inline">Formulas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLatexExportSubset(null);
              setShowLatexExportModal(true);
            }}
            className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-extrabold rounded-xl text-xs font-mono flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
            title="Export full conversation & step-by-step math derivations as a LaTeX (.tex) formatted text file"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export LaTeX (.tex)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const lastTutorMsg = [...messages].reverse().find(m => m.role === "tutor");
              if (lastTutorMsg) {
                const userMsg = [...messages].reverse().find(m => m.role === "user");
                handleOpenPdfExport(lastTutorMsg.text, userMsg?.text);
              } else {
                alert("No reasoning response available yet. Ask a question first!");
              }
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-black rounded-xl text-xs font-mono flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
            title="Export latest step-by-step math solution to a KaTeX formatted PDF document"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download as PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-mono font-bold border border-emerald-500/20">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="hidden sm:inline">Gemini 3.6 Flash Active</span>
          </div>
        </div>
      </div>

      {/* Syllabus & Topic Selector Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-navy-50/80 dark:bg-navy-950/40 p-3 rounded-xl border border-navy-100 dark:border-navy-850 text-xs">
        {/* Syllabus Selector */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase mb-1">Syllabus</label>
          <div className="flex rounded-lg overflow-hidden border border-navy-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-0.5">
            <button
              type="button"
              onClick={() => setSyllabus("CAPS")}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors ${
                syllabus === "CAPS" ? "bg-royal-600 text-white" : "text-navy-600 dark:text-navy-400 hover:text-navy-900"
              }`}
            >
              CAPS
            </button>
            <button
              type="button"
              onClick={() => setSyllabus("IEB")}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors ${
                syllabus === "IEB" ? "bg-amber-500 text-navy-950" : "text-navy-600 dark:text-navy-400 hover:text-navy-900"
              }`}
            >
              IEB
            </button>
          </div>
        </div>

        {/* Grade Selector */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase mb-1">Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value as any)}
            className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
          >
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12 (NSC)</option>
            <option value="Matric Upgrade">Matric Upgrade</option>
          </select>
        </div>

        {/* Topic Selector */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase mb-1">Topic Focus</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
          >
            {topicsList.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase mb-1">Response Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500"
          >
            <option value="step_by_step">🧩 Full Step-by-Step Solution</option>
            <option value="hint_only">💡 Hint & Next Step Only</option>
            <option value="concept">📖 Concept & Theorem Proof</option>
            <option value="practice">📝 Exam Practice Generator</option>
          </select>
        </div>

        {/* Voice Reading Speed Selector */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-navy-400 dark:text-navy-500 uppercase mb-1 flex items-center justify-between">
            <span>Reading Speed</span>
            <span className="text-royal-600 dark:text-gold-400 font-bold">{readingSpeed}x</span>
          </label>
          <select
            value={readingSpeed}
            onChange={(e) => handleReadingSpeedChange(parseFloat(e.target.value))}
            className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg px-2 py-1.5 text-xs font-bold text-navy-800 dark:text-navy-200 focus:outline-none focus:border-royal-500 cursor-pointer"
          >
            <option value={0.75}>🐢 0.75x (Slow Math Cadence)</option>
            <option value={0.95}>🔉 0.95x (Relaxed Classroom)</option>
            <option value={1.0}>🔊 1.00x (Standard Speed)</option>
            <option value={1.25}>⚡ 1.25x (Brisk Review)</option>
            <option value={1.5}>🚀 1.50x (Fast Overview)</option>
          </select>
        </div>
      </div>

      {/* Message History Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-navy-50/50 dark:bg-navy-950/30 rounded-2xl border border-navy-100 dark:border-navy-850 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[92%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
              msg.role === "user" 
                ? "bg-royal-100 border-royal-200 text-royal-700 dark:bg-navy-800 dark:border-navy-750 dark:text-gold-400" 
                : "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-gold-400"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-1.5 max-w-full">
              {/* Context Tag Header */}
              {msg.role === "user" && (msg.topic || msg.mode) && (
                <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-navy-400">
                  {msg.syllabus && <span className="bg-navy-200 dark:bg-navy-800 px-1.5 py-0.5 rounded">{msg.syllabus}</span>}
                  {msg.topic && <span className="bg-navy-200 dark:bg-navy-800 px-1.5 py-0.5 rounded">{msg.topic}</span>}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-royal-600 text-white rounded-tr-none shadow-md"
                  : "bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 text-navy-900 dark:text-navy-100 rounded-tl-none shadow-sm"
              }`}>
                {/* Image Preview if user uploaded a picture */}
                {msg.imageData && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/20 dark:border-navy-700 max-w-xs">
                    <img src={msg.imageData} alt="Math Problem Scan" className="w-full h-auto object-cover max-h-48" />
                  </div>
                )}

                {msg.role === "tutor" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-navy-800 dark:text-navy-100 space-y-2">
                    <LatexRenderer text={msg.text} />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>

              {/* Actions & Timestamp */}
              <div className={`flex items-center gap-3 text-[10px] font-mono text-navy-400 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}>
                <span>{msg.timestamp}</span>
                {msg.role === "tutor" && (
                  <>
                    <button
                      onClick={() => handleCopyText(msg.text)}
                      className="flex items-center gap-1 hover:text-royal-500 transition-colors cursor-pointer"
                      title="Copy Solution"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={() => handleToggleSpeakMessage(msg.id, msg.text)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono transition-all cursor-pointer border ${
                        currentlySpeakingId === msg.id 
                          ? "bg-rose-600 text-white border-rose-500 font-bold shadow-xs animate-pulse" 
                          : "hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-600 dark:text-navy-300 border-navy-200 dark:border-navy-750"
                      }`}
                      title={currentlySpeakingId === msg.id ? "Stop voice readout" : `Read aloud at ${readingSpeed}x speed`}
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-white" />
                          <span>Stop ({readingSpeed}x)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-royal-500" />
                          <span>Listen ({readingSpeed}x)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const messageIdx = messages.findIndex(m => m.id === msg.id);
                        const prevUserMsg = messageIdx > 0 ? messages[messageIdx - 1] : undefined;
                        handleOpenPdfExport(msg.text, prevUserMsg?.role === "user" ? prevUserMsg.text : undefined);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md font-mono transition-all cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-gold-400 border border-amber-500/30"
                      title="Download as KaTeX formatted print-ready PDF"
                    >
                      <Download className="w-3 h-3 text-amber-500" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const messageIdx = messages.findIndex(m => m.id === msg.id);
                        const prevUserMsg = messageIdx > 0 ? messages[messageIdx - 1] : undefined;
                        const subset = [
                          ...(prevUserMsg?.role === "user" ? [prevUserMsg] : []),
                          msg
                        ];
                        setLatexExportSubset(subset);
                        setShowLatexExportModal(true);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md font-mono transition-all cursor-pointer bg-royal-500/10 hover:bg-royal-500/20 text-royal-600 dark:text-royal-300 border border-royal-500/30"
                      title="Export this step-by-step math derivation as a LaTeX (.tex) file"
                    >
                      <FileCode className="w-3 h-3 text-royal-500" />
                      <span>Export .tex</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-gold-400 border border-amber-200 dark:border-amber-500/30">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-navy-600 dark:text-navy-300">Tutor Bethuel is analyzing your math problem...</span>
              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Preset Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-wider block">
          Suggested Practice & Past Exam Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {presetPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => {
                setTopic(p.topic);
                setMode(p.mode);
                handleSendMessage(p.prompt, p.mode);
              }}
              className="px-2.5 py-1 bg-navy-50 hover:bg-navy-100 dark:bg-navy-850 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-300 font-sans font-semibold text-[11px] rounded-lg border border-navy-150 dark:border-navy-800 transition-all cursor-pointer text-left flex items-center gap-1.5"
            >
              <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Attached Image Bar */}
      {attachedImage && (
        <div className="flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Image className="w-4 h-4 text-amber-500" />
            <span className="font-mono font-bold truncate max-w-xs">{attachedFileName || "Math Scan Attached"}</span>
          </div>
          <button
            type="button"
            onClick={removeAttachedImage}
            className="p-1 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Speech Error Alert Banner */}
      {speechError && (
        <div className="flex items-center justify-between p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-mono text-[11px]">{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg text-rose-600 dark:text-rose-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Speech Dictation Banner */}
      {isListening && (
        <div className="p-3 bg-gradient-to-r from-rose-900/90 via-navy-900 to-amber-950/90 border-2 border-rose-500/60 rounded-xl text-white text-xs space-y-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75" />
                <div className="p-1 bg-rose-600 text-white rounded-full">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="font-mono font-bold text-rose-300 text-[11px] block">Live Hands-Free Speech Dictation</span>
                <span className="text-[10px] text-slate-300">Speak clearly. Say <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">"send question"</code> to submit hands-free.</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInput("")}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-mono text-slate-200 rounded transition-colors cursor-pointer"
              >
                Clear Input
              </button>
              <button
                type="button"
                onClick={toggleSpeechDictation}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] font-mono rounded flex items-center gap-1 transition-colors cursor-pointer"
              >
                <MicOff className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>
          </div>

          {/* Audio Wave Visualizer Bars & Interim Transcript */}
          <div className="bg-black/60 border border-white/10 rounded-lg p-2.5 flex items-center gap-3">
            <div className="flex items-center gap-1 shrink-0">
              {[1, 2, 3, 4, 5].map((bar) => (
                <span
                  key={bar}
                  style={{ animationDelay: `${bar * 0.15}s` }}
                  className="w-1 h-4 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full animate-bounce"
                />
              ))}
            </div>
            <p className="font-mono text-xs text-amber-200 italic truncate">
              {interimTranscript ? `"${interimTranscript}..."` : "Listening for math dictation..."}
            </p>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach photo of handwritten or printed math problem"
          disabled={loading}
          className="px-3.5 py-3 bg-navy-50 hover:bg-navy-100 dark:bg-navy-850 dark:hover:bg-navy-800 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowLatexEditor(true)}
          title="Open LaTeX Equation Editor & Symbol Palette"
          disabled={loading}
          className="px-3.5 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Calculator className="w-4 h-4" />
          <span className="hidden md:inline text-xs font-mono">LaTeX Math Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setShowFormulaDrawer(true)}
          title="Open Searchable Formula Quick-Reference Drawer"
          disabled={loading}
          className="px-3 py-3 bg-royal-600/10 hover:bg-royal-600/20 border border-royal-500/30 rounded-xl text-royal-700 dark:text-gold-400 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden xl:inline text-xs font-mono">Formula Bank</span>
        </button>

        {/* Web Speech API Microphone Dictation Toggle Button */}
        <button
          type="button"
          onClick={toggleSpeechDictation}
          disabled={loading}
          title={isListening ? "Stop voice dictation" : "Dictate question hands-free (Web Speech API)"}
          className={`px-3.5 py-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isListening 
              ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/30 animate-pulse" 
              : "bg-navy-50 hover:bg-navy-100 dark:bg-navy-850 dark:hover:bg-navy-800 border-navy-200 dark:border-navy-800 text-rose-600 dark:text-rose-400"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-rose-500" />}
          <span className="hidden lg:inline font-mono">{isListening ? "Listening..." : "Dictate"}</span>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening to your dictation..." : `Ask about ${topic} (${syllabus} ${grade})...`}
          disabled={loading}
          className={`flex-1 px-4 py-3 bg-navy-50 dark:bg-navy-950 border rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 disabled:opacity-60 transition-colors ${
            isListening ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-950/10" : "border-navy-200 dark:border-navy-800"
          }`}
        />

        <button
          type="submit"
          disabled={(!input.trim() && !attachedImage) || loading}
          className="px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 font-black text-xs rounded-xl flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Solve</span>
        </button>
      </form>

      {/* Modal for LaTeX Editor inside AskTutor */}
      {showLatexEditor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowLatexEditor(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
            <LatexMathEditor
              onSendToTutor={(latex) => {
                setInput(prev => (prev ? prev + " " + latex : latex));
                setShowLatexEditor(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Print-Ready PDF Export Modal */}
      {exportPdfData && (
        <ReasoningPdfExportModal
          isOpen={showPdfExportModal}
          onClose={() => setShowPdfExportModal(false)}
          reasoningText={exportPdfData.text}
          question={exportPdfData.question}
          topic={exportPdfData.topic || topic}
          syllabus={exportPdfData.syllabus || syllabus}
          grade={exportPdfData.grade || grade}
          studentName={user?.first_name ? `${user.first_name} ${user.surname || ""}`.trim() : "CAPS Math Student"}
        />
      )}

      {/* Searchable Formula Quick-Reference Drawer */}
      <FormulaQuickReferenceDrawer
        isOpen={showFormulaDrawer}
        onClose={() => setShowFormulaDrawer(false)}
        onInsertFormula={handleInsertFormulaFromDrawer}
      />

      {/* LaTeX Formatted Derivations & Conversation Export Modal */}
      <LatexExportModal
        isOpen={showLatexExportModal}
        onClose={() => {
          setShowLatexExportModal(false);
          setLatexExportSubset(null);
        }}
        messages={latexExportSubset || messages}
        studentName={user?.first_name ? `${user.first_name} ${user.surname || ""}`.trim() : "CAPS Math Student"}
        tutorName="Tutor Bethuel"
        syllabus={syllabus}
        grade={grade}
        topic={topic}
      />
    </div>
  );
};
