import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, MessageSquare, Send, Sparkles, Pin, BookOpen, AlertCircle, 
  Plus, Check, Search, Hash, ChevronRight, Bookmark, ThumbsUp, 
  HelpCircle, UserCheck, MessageCircle, HelpCircle as HelpIcon, ArrowLeft
} from "lucide-react";
import { Profile } from "../types";

interface StudyGroupProps {
  user: Profile | null;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: Profile["role"];
  senderAvatar?: string;
  text: string;
  timestamp: string;
  tipCategory?: string; // If it's a shared tip
  likes?: number;
  isPinned?: boolean;
  image?: string; // Supporting shared whiteboard snapshots
}

interface StudyRoom {
  id: string;
  name: string;
  grade: "Grade 10" | "Grade 11" | "Grade 12" | "All";
  description: string;
  topics: string[];
  onlineCount: number;
  pinnedTips: { id: string; author: string; topic: string; content: string; likes: number }[];
  defaultMessages: ChatMessage[];
}

const PRESET_ROOMS: StudyRoom[] = [
  {
    id: "room-g12",
    name: "Grade 12: Calculus & Euclidean Geometry",
    grade: "Grade 12",
    description: "Discussing limits, derivatives from first principles, optimization, cubic graphs, and cyclic quadrilaterals.",
    topics: ["Calculus", "Euclidean Geometry", "Sequences & Series"],
    onlineCount: 14,
    pinnedTips: [
      {
        id: "tip-1",
        author: "Tutor Bethuel",
        topic: "Euclidean Geometry",
        content: "Always state your reasons! e.g., (angle in semi-circle) or (tan-chord theorem). DBE examiners penalize missing geometric reasons heavily.",
        likes: 18
      },
      {
        id: "tip-2",
        author: "Chantel (Grade 12)",
        topic: "Calculus Limits",
        content: "Before finding the limit as h approaches 0, always factorize and simplify the numerator to cancel out the 'h' in the denominator first!",
        likes: 12
      }
    ],
    defaultMessages: [
      {
        id: "m-12-1",
        senderName: "Sipho Khumalo",
        senderRole: "student",
        text: "Hi everyone, is anyone busy with the 2024 NSC Paper 2? I am stuck on the Euclidean Geometry rider about proving similar triangles.",
        timestamp: "16:10"
      },
      {
        id: "m-12-2",
        senderName: "Lerato Mokoena",
        senderRole: "student",
        text: "Hey Sipho! Yes, I did that yesterday. The trick for similar triangles is to identify equal angles first. Look for alternate angles or angles subtended by the same arc.",
        timestamp: "16:12",
        likes: 2
      },
      {
        id: "m-12-3",
        senderName: "Tutor Bethuel",
        senderRole: "tutor",
        text: "Excellent hint, Lerato! Also, Sipho, check if there is a tangent. The Tangent-Chord Theorem is very often the link to finding that first pair of equal angles. Remember to write down: (tan-chord theorem) as your reason.",
        timestamp: "16:15",
        likes: 5
      },
      {
        id: "m-12-4",
        senderName: "Sipho Khumalo",
        senderRole: "student",
        text: "Ah! Of course, there is a tangent passing through point A. Let me try that now, thank you so much!",
        timestamp: "16:18"
      }
    ]
  },
  {
    id: "room-g11",
    name: "Grade 11: Functions & Trigonometric Equations",
    grade: "Grade 11",
    description: "Discussing parabolas, hyperbolas, trigonometric identities, general solutions, and sine/cosine/area rules.",
    topics: ["Functions", "Trigonometry", "Analytical Geometry"],
    onlineCount: 9,
    pinnedTips: [
      {
        id: "tip-3",
        author: "Tutor Bethuel",
        topic: "Trig General Solution",
        content: "Don't forget '+ k * 360°' where k ∈ ℤ for sin and cos, and '+ k * 180°' where k ∈ ℤ for tan when solving general equations!",
        likes: 15
      }
    ],
    defaultMessages: [
      {
        id: "m-11-1",
        senderName: "Anesu Dube",
        senderRole: "student",
        text: "Guys, how do we find the asymptotes of the hyperbola y = a/(x - p) + q?",
        timestamp: "15:40"
      },
      {
        id: "m-11-2",
        senderName: "Chantel Gadebe",
        senderRole: "student",
        text: "The vertical asymptote is x = p (which makes the denominator 0) and the horizontal asymptote is y = q. Just look at the values directly!",
        timestamp: "15:43",
        likes: 4
      },
      {
        id: "m-11-3",
        senderName: "Anesu Dube",
        senderRole: "student",
        text: "Super simple! What if the equation is y = 3 / (x + 2) - 4? Is p = -2?",
        timestamp: "15:45"
      },
      {
        id: "m-11-4",
        senderName: "Chantel Gadebe",
        senderRole: "student",
        text: "Yes, exactly! Because x - p is x - (-2) = x + 2, so p is -2. Thus vertical asymptote is x = -2 and horizontal is y = -4.",
        timestamp: "15:48",
        likes: 3
      }
    ]
  },
  {
    id: "room-g10",
    name: "Grade 10: Algebraic Expressions & Analytical Basics",
    grade: "Grade 10",
    description: "Mastering factorisation, exponent laws, linear graphs, basic trig ratios, and coordinate geometry formulas.",
    topics: ["Algebra", "Trigonometry Basics", "Analytical Geometry"],
    onlineCount: 8,
    pinnedTips: [
      {
        id: "tip-4",
        author: "Tutor Bethuel",
        topic: "Difference of Two Squares",
        content: "Always check if you can factorize further! (a² - b²) = (a - b)(a + b). Remember that a² + b² cannot be factorized this way.",
        likes: 11
      }
    ],
    defaultMessages: [
      {
        id: "m-10-1",
        senderName: "Keketso Molefe",
        senderRole: "student",
        text: "Hi, does anyone have a quick way of remembering SOH CAH TOA for trigonometry?",
        timestamp: "14:15"
      },
      {
        id: "m-10-2",
        senderName: "Zola Ndlovu",
        senderRole: "student",
        text: "I use: 'Some Old Hens, Chat About Hot, Tea On Aprons'! S=O/H, C=A/H, T=O/A.",
        timestamp: "14:18",
        likes: 6
      },
      {
        id: "m-10-3",
        senderName: "Keketso Molefe",
        senderRole: "student",
        text: "That is hilarious and actually so easy to remember! Thank you!",
        timestamp: "14:20"
      }
    ]
  }
];

export const StudyGroup: React.FC<StudyGroupProps> = ({ user }) => {
  const [rooms, setRooms] = useState<StudyRoom[]>(() => {
    const saved = localStorage.getItem("amaris_study_rooms");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return PRESET_ROOMS;
  });

  const [activeRoomId, setActiveRoomId] = useState<string>("room-g12");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem("amaris_study_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Initialize with presets
    const initial: Record<string, ChatMessage[]> = {};
    PRESET_ROOMS.forEach(r => {
      initial[r.id] = r.defaultMessages;
    });
    return initial;
  });

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "tips" | "members" | "whiteboard">("chat");
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  // Whiteboard states
  const whiteboardRef = useRef<HTMLCanvasElement>(null);
  const [wbColor, setWbColor] = useState("#f59e0b"); // default amber-500
  const [wbWidth, setWbWidth] = useState(4);
  const [wbIsDrawing, setWbIsDrawing] = useState(false);
  const [wbIsEraser, setWbIsEraser] = useState(false);
  const [wbBg, setWbBg] = useState("#0b1329"); // slate dark background
  const [wbShapes, setWbShapes] = useState<"free" | "line">("free");
  const [wbLineStart, setWbLineStart] = useState<{ x: number; y: number } | null>(null);
  const [wbLineCurrent, setWbLineCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isSimulatingDrawing, setIsSimulatingDrawing] = useState(false);

  // Math Tip Creator States
  const [isTipCreatorOpen, setIsTipCreatorOpen] = useState(false);
  const [tipTopic, setTipTopic] = useState("");
  const [tipContent, setTipContent] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Active room data
  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
  const roomMessages = messages[activeRoomId] || [];

  // Filtered rooms based on search
  const filteredRooms = rooms.filter(r => {
    return r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("amaris_study_rooms", JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem("amaris_study_messages", JSON.stringify(messages));
    // Scroll to bottom when room or messages change
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, activeRoomId]);

  // Initialize whiteboard grid when tab is active
  useEffect(() => {
    if (activeTab === "whiteboard") {
      setTimeout(() => {
        loadWhiteboardTemplate("grid");
      }, 150);
    }
  }, [activeTab]);

  // Whiteboard Helpers
  const startWbDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Prevent scrolling on touch screens while drawing
      if (e.cancelable) e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    if (wbShapes === "line") {
      setWbLineStart({ x, y });
      setWbLineCurrent({ x, y });
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = wbIsEraser ? wbBg : wbColor;
      ctx.lineWidth = wbWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    setWbIsDrawing(true);
  };

  const drawWb = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!wbIsDrawing) return;
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.cancelable) e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    if (wbShapes === "line") {
      setWbLineCurrent({ x, y });
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopWbDrawing = () => {
    if (!wbIsDrawing) return;
    if (wbShapes === "line" && wbLineStart && wbLineCurrent) {
      const canvas = whiteboardRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(wbLineStart.x, wbLineStart.y);
          ctx.lineTo(wbLineCurrent.x, wbLineCurrent.y);
          ctx.strokeStyle = wbIsEraser ? wbBg : wbColor;
          ctx.lineWidth = wbWidth;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }
    }
    setWbLineStart(null);
    setWbLineCurrent(null);
    setWbIsDrawing(false);
  };

  const clearWb = () => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = wbBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const loadWhiteboardTemplate = (templateName: string) => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // First clear
    ctx.fillStyle = wbBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (templateName === "grid") {
      // Draw grid lines
      ctx.strokeStyle = "#162544"; // subtle dark grid lines
      ctx.lineWidth = 1;
      for (let i = 40; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 40; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw standard axes
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      // X-axis
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    } else if (templateName === "circle") {
      // Circle geometry template
      ctx.strokeStyle = "#162544";
      ctx.lineWidth = 1;
      for (let i = 80; i < canvas.width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw circular locus
      ctx.strokeStyle = "#f59e0b"; // Orange
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 30, 100, 0, 2 * Math.PI);
      ctx.stroke();

      // Center mark
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 30, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Tangent line at bottom
      ctx.strokeStyle = "#3b82f6"; // Blue tangent
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 180, canvas.height / 2 + 70);
      ctx.lineTo(canvas.width / 2 + 180, canvas.height / 2 + 70);
      ctx.stroke();

      // Chord / triangle inside circle
      ctx.strokeStyle = "#e2e8f0"; // White/light chord
      ctx.lineWidth = 2;
      ctx.beginPath();
      // top apex on circle
      ctx.moveTo(canvas.width / 2, canvas.height / 2 - 130);
      // bottom-left corner of chord
      ctx.lineTo(canvas.width / 2 - 80, canvas.height / 2 + 30);
      // bottom-right corner of chord
      ctx.lineTo(canvas.width / 2 + 80, canvas.height / 2 + 30);
      ctx.closePath();
      ctx.stroke();

      // Text labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 12px monospace";
      ctx.fillText("Center (O)", canvas.width / 2 - 35, canvas.height / 2 - 45);
      ctx.fillText("Tangent Line (AB)", canvas.width / 2 - 170, canvas.height / 2 + 90);
      ctx.fillText("x", canvas.width / 2 - 50, canvas.height / 2 + 20);
      ctx.fillText("y", canvas.width / 2 + 45, canvas.height / 2 + 20);
    } else if (templateName === "parabola") {
      // Draw grid
      ctx.strokeStyle = "#162544";
      ctx.lineWidth = 1;
      for (let i = 40; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw Axis
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Curve: y = a(x-p)^2 + q
      ctx.strokeStyle = "#10b981"; // Emerald
      ctx.lineWidth = 3;
      ctx.beginPath();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let x = -160; x <= 160; x++) {
        const plotX = centerX + x;
        const mathX = x / 35; 
        const mathY = (mathX * mathX) - 2; // y = x^2 - 2
        const plotY = centerY - mathY * 35; // invert for canvas coordinates

        if (x === -160) {
          ctx.moveTo(plotX, plotY);
        } else {
          ctx.lineTo(plotX, plotY);
        }
      }
      ctx.stroke();

      // Roots/turning points tags
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 11px monospace";
      ctx.fillText("Turning Point (0, -2)", centerX + 10, centerY + 80);
      ctx.fillText("f(x) = x² - 2", centerX - 120, centerY - 80);
    }
  };

  const simulatePeerDrawing = () => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsSimulatingDrawing(true);
    let step = 0;
    const drawingSteps = [
      { type: "text", x: 50, y: 50, text: "Lerato Mokoena is writing steps...", color: "#38bdf8" },
      { type: "line", x1: 50, y1: 65, x2: 320, y2: 65, color: "#475569" },
      { type: "text", x: 60, y: 100, text: "Let's prove similar triangles: ΔABC ||| ΔADE", color: "#f59e0b" },
      { type: "text", x: 60, y: 130, text: "1. Angle A = Angle A    [Common Angle]", color: "#ffffff" },
      { type: "text", x: 60, y: 160, text: "2. Angle B1 = Angle D1  [Corresponding Angles; BC || DE]", color: "#ffffff" },
      { type: "text", x: 60, y: 190, text: "3. Angle C1 = Angle E1  [Corresponding Angles; BC || DE]", color: "#ffffff" },
      { type: "text", x: 60, y: 220, text: "∴ ΔABC ||| ΔADE        [Angle, Angle, Angle]", color: "#10b981" },
      { type: "text", x: 50, y: 260, text: "✓ Done! Peer review this, please.", color: "#10b981" }
    ];

    const timer = setInterval(() => {
      if (step >= drawingSteps.length) {
        clearInterval(timer);
        setIsSimulatingDrawing(false);
        return;
      }

      const item = drawingSteps[step];
      ctx.fillStyle = item.color;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2.5;

      if (item.type === "text" && item.text) {
        ctx.font = "13px JetBrains Mono, monospace";
        ctx.fillText(item.text, item.x!, item.y!);
      } else if (item.type === "line") {
        ctx.beginPath();
        ctx.moveTo(item.x1!, item.y1!);
        ctx.lineTo(item.x2!, item.y2!);
        ctx.stroke();
      }

      step++;
    }, 1200);
  };

  const shareWhiteboardSnap = () => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    
    const senderName = user ? `${user.first_name} ${user.surname}` : "Guest Student";
    const senderRole = user?.role || "student";
    
    // Get DataURL representation
    const dataUrl = canvas.toDataURL("image/png");
    
    const messageText = `🎨 SHARED WHITEBOARD DRAWING SNAPSHOT: \n"Check out this diagram. We are discussing the general properties on the Interactive Whiteboard now! Let me know if you see any errors in our steps."`;

    const newMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      senderName,
      senderRole,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      likes: 2,
      image: dataUrl
    };

    setMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage]
    }));

    // Redirect to chat tab to view shared whiteboard
    setActiveTab("chat");
  };

  // Handle send message
  const handleSendMessage = (textToSend?: string) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    const senderName = user ? `${user.first_name} ${user.surname}` : "Guest Student";
    const senderRole = user?.role || "student";

    const newMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      senderName,
      senderRole,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      likes: 0
    };

    setMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage]
    }));

    if (!textToSend) {
      setInputValue("");
    }

    // Trigger auto-reply for simulated discussion activity
    triggerSimulatedReply(messageText);
  };

  // Automated smart response simulator
  const triggerSimulatedReply = (userMsg: string) => {
    const cleaned = userMsg.toLowerCase();
    setTimeout(() => {
      let replyText = "";
      let replySender = "Bethuel (Lead Tutor)";
      let replyRole: "student" | "tutor" | "admin" = "tutor";

      if (cleaned.includes("calculus") || cleaned.includes("derivative") || cleaned.includes("limit")) {
        replyText = "Great point about calculus! Remember that the derivative f'(x) from first principles is essentially the limit as h approaches 0 of the average gradient formula. Make sure to substitute carefully and clear the 'h' multiplier.";
        replySender = "Tutor Bethuel";
        replyRole = "tutor";
      } else if (cleaned.includes("geometry") || cleaned.includes("theorem") || cleaned.includes("circle")) {
        replyText = "Euclidean geometry can be very visual. I recommend highlighting cyclic quadrilaterals in one colour, and tangents in another. This makes it instantly obvious which theorems apply!";
        replySender = "Zola Ndlovu";
        replyRole = "student";
      } else if (cleaned.includes("trig") || cleaned.includes("sin") || cleaned.includes("cos")) {
        replyText = "When doing trig general solutions, double check if you have a quadratic trig equation (e.g. 2sin²θ + sinθ - 1 = 0). If so, replace sinθ with 'k' to make factorising easier!";
        replySender = "Tutor Bethuel";
        replyRole = "tutor";
      } else if (cleaned.includes("help") || cleaned.includes("stuck") || cleaned.includes("question")) {
        replyText = "Feel free to type out your specific equation or share a screenshot tip! There's always someone online in this grade forum to assist.";
        replySender = "Chantel Gadebe";
        replyRole = "student";
      } else {
        // Default warm response
        const randomReplies = [
          "I totally agree with that. Mathematics is all about finding patterns!",
          "That is a great perspective. Thanks for sharing that tip with us.",
          "Awesome contribution! Let's stay focused on our NSC trial exams preparation.",
          "Good job. That shortcut is going to save so much time in Paper 1!"
        ];
        replyText = randomReplies[Math.floor(Math.random() * randomReplies.length)];
        const senders = [
          { name: "Sipho Khumalo", role: "student" as const },
          { name: "Lerato Mokoena", role: "student" as const },
          { name: "Chantel Gadebe", role: "student" as const }
        ];
        const chosen = senders[Math.floor(Math.random() * senders.length)];
        replySender = chosen.name;
        replyRole = chosen.role;
      }

      const simMessage: ChatMessage = {
        id: "msg-sim-" + Date.now(),
        senderName: replySender,
        senderRole: replyRole,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        likes: 0
      };

      setMessages(prev => ({
        ...prev,
        [activeRoomId]: [...(prev[activeRoomId] || []), simMessage]
      }));
    }, 1500);
  };

  // Like a message
  const handleLikeMessage = (msgId: string) => {
    setMessages(prev => {
      const roomMsgs = prev[activeRoomId] || [];
      const updated = roomMsgs.map(m => {
        if (m.id === msgId) {
          return { ...m, likes: (m.likes || 0) + 1 };
        }
        return m;
      });
      return { ...prev, [activeRoomId]: updated };
    });
  };

  // Pinned tips manipulation
  const handleAddTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipTopic.trim() || !tipContent.trim()) return;

    const author = user ? `${user.first_name} ${user.surname}` : "Anonymity Student";
    const newTip = {
      id: "tip-" + Date.now(),
      author,
      topic: tipTopic,
      content: tipContent,
      likes: 0
    };

    setRooms(prev => prev.map(r => {
      if (r.id === activeRoomId) {
        return {
          ...r,
          pinnedTips: [newTip, ...r.pinnedTips]
        };
      }
      return r;
    }));

    // Post to chat as well
    const announcementText = `💡 SHARED A NEW MATH TIP on [${tipTopic}]: "${tipContent}"`;
    handleSendMessage(announcementText);

    // Reset fields
    setTipTopic("");
    setTipContent("");
    setIsTipCreatorOpen(false);
    setActiveTab("tips");
  };

  const handleLikeTip = (tipId: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === activeRoomId) {
        return {
          ...r,
          pinnedTips: r.pinnedTips.map(t => {
            if (t.id === tipId) {
              return { ...t, likes: t.likes + 1 };
            }
            return t;
          })
        };
      }
      return r;
    }));
  };

  const insertFormulaTemplate = (formula: string) => {
    setInputValue(prev => prev + " " + formula);
  };

  // Preset quick formulas to drop into chat
  const quickFormulas = [
    { label: "Quad Eq", code: "x = (-b ± √(b² - 4ac)) / 2a" },
    { label: "Arithmetic Tn", code: "T_n = a + (n - 1)d" },
    { label: "Geometric Tn", code: "T_n = a * r^(n-1)" },
    { label: "Compound Int", code: "A = P(1 + i)ⁿ" },
    { label: "Area Rule", code: "Area = 0.5 * a * b * sin(C)" },
    { label: "Calculus Limit", code: "f'(x) = lim[h→0] (f(x+h) - f(x))/h" }
  ];

  return (
    <div className="bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row h-[720px] text-left animate-fadeIn">
      
      {/* ROOMS SIDEBAR */}
      <div className={`w-full md:w-80 border-r border-navy-150 dark:border-navy-850 bg-navy-50/20 dark:bg-navy-900/40 flex flex-col shrink-0 ${
        isMobileListOpen ? "block" : "hidden md:flex"
      }`}>
        <div className="p-4 border-b border-navy-150 dark:border-navy-850 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-royal-100 dark:bg-navy-800 text-royal-600 dark:text-gold-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black font-mono uppercase tracking-wider text-navy-900 dark:text-white">
                Grade Forums
              </h3>
              <p className="text-[10px] text-navy-400 font-mono">Join peer classrooms & rooms</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-navy-400" />
            <input
              type="text"
              placeholder="Filter study rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-[11px] text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
            />
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredRooms.map((room) => {
            const isSelected = room.id === activeRoomId;
            return (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  setIsMobileListOpen(false);
                  setActiveTab("chat");
                }}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 border ${
                  isSelected
                    ? "bg-royal-50/80 dark:bg-navy-850/80 border-royal-200/50 dark:border-navy-800 text-royal-900 dark:text-gold-400 shadow-xs"
                    : "bg-transparent border-transparent text-navy-600 dark:text-navy-300 hover:bg-navy-50/50 dark:hover:bg-navy-850"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400 px-1.5 py-0.5 rounded">
                    {room.grade}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    {room.onlineCount} online
                  </span>
                </div>

                <div className="font-extrabold text-xs tracking-tight line-clamp-1">
                  {room.name.split(":")[1] || room.name}
                </div>

                <p className="text-[10px] text-navy-400 dark:text-navy-400 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {room.topics.map((t, i) => (
                    <span key={i} className="text-[8px] font-mono text-navy-400 dark:text-navy-500 bg-navy-100/40 dark:bg-navy-900/60 px-1 py-0.5 rounded">
                      #{t.replace(" ", "")}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-navy-50 dark:bg-navy-900/20 border-t border-navy-150 dark:border-navy-850 text-center">
          <p className="text-[9px] text-navy-400 font-mono">
            💡 Switch classrooms to help peers in lower grades with basic algebra!
          </p>
        </div>
      </div>

      {/* CHAT/BOARD AREA */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-navy-950 ${
        isMobileListOpen ? "hidden md:flex" : "flex"
      }`}>
        
        {/* ROOM TOP BAR */}
        <div className="p-4 border-b border-navy-150 dark:border-navy-850 flex items-center justify-between flex-wrap gap-2 shrink-0 bg-white dark:bg-navy-950">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileListOpen(true)}
              className="md:hidden p-1 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-white rounded"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-royal-500 dark:text-gold-400" />
                <h2 className="text-sm font-black text-navy-900 dark:text-white leading-tight">
                  {activeRoom.name}
                </h2>
              </div>
              <p className="text-[10px] text-navy-400 mt-0.5 max-w-md line-clamp-1">
                {activeRoom.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-navy-50 dark:bg-navy-900 p-1 rounded-xl border border-navy-100 dark:border-navy-800">
            {[
              { id: "chat", label: "Group Chat", icon: MessageSquare },
              { id: "whiteboard", label: "Whiteboard", icon: Sparkles },
              { id: "tips", label: `Study Tips (${activeRoom.pinnedTips.length})`, icon: Bookmark },
              { id: "members", label: "Peers Online", icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsTipCreatorOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 shadow-xs border border-navy-100 dark:border-navy-700"
                      : "text-navy-500 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* WORKSPACE PANELS */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: GROUP CHAT LOG */}
            {activeTab === "chat" && (
              <motion.div
                key="chat-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {roomMessages.map((msg) => {
                    const isMe = user && msg.senderName === `${user.first_name} ${user.surname}`;
                    const isTutor = msg.senderRole === "tutor" || msg.senderRole === "admin";
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-2xl ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                          isTutor
                            ? "bg-amber-500 text-navy-950 font-black ring-2 ring-amber-500/20"
                            : isMe
                              ? "bg-royal-600 text-white"
                              : "bg-navy-100 dark:bg-navy-850 text-navy-700 dark:text-navy-300"
                        }`}>
                          {msg.senderName.charAt(0)}
                        </div>

                        <div className="space-y-1">
                          {/* Sender meta */}
                          <div className={`flex items-center gap-1.5 text-[10px] ${isMe ? "justify-end" : ""}`}>
                            <span className="font-extrabold text-navy-800 dark:text-white">
                              {msg.senderName}
                            </span>
                            {isTutor && (
                              <span className="text-[8px] font-mono font-black uppercase bg-amber-500 text-navy-950 px-1 rounded">
                                TUTOR
                              </span>
                            )}
                            <span className="text-navy-400 font-mono">{msg.timestamp}</span>
                          </div>

                          {/* Message bubble */}
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-royal-600 text-white rounded-tr-none"
                              : isTutor
                                ? "bg-amber-500/5 border border-amber-500/20 text-navy-900 dark:text-white rounded-tl-none"
                                : "bg-navy-50 dark:bg-navy-900 text-navy-900 dark:text-white rounded-tl-none border border-navy-100 dark:border-navy-850"
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.image && (
                              <div className="mt-2.5 rounded-xl overflow-hidden border border-navy-200 dark:border-navy-800 bg-navy-950 p-1.5 max-w-sm">
                                <img
                                  src={msg.image}
                                  alt="Shared Whiteboard Snapshot"
                                  className="w-full h-auto rounded-lg max-h-48 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                          </div>

                          {/* Actions / Likes */}
                          <div className={`flex items-center gap-2 mt-1 ${isMe ? "justify-end" : ""}`}>
                            <button
                              onClick={() => handleLikeMessage(msg.id)}
                              className="text-[10px] text-navy-400 hover:text-royal-500 dark:hover:text-gold-400 transition-colors flex items-center gap-1 font-mono"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{msg.likes || 0} likes</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Formula Dropper and Input */}
                <div className="p-3 border-t border-navy-150 dark:border-navy-850 bg-white dark:bg-navy-950 shrink-0 space-y-3">
                  
                  {/* Quick Formulator */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-[8px] font-mono font-black text-navy-400 uppercase tracking-widest shrink-0">
                      Formula Shortcuts:
                    </span>
                    {quickFormulas.map((formula, idx) => (
                      <button
                        key={idx}
                        onClick={() => insertFormulaTemplate(formula.code)}
                        className="px-2 py-1 bg-navy-50 hover:bg-navy-100 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-lg text-[9px] font-mono border border-navy-150 dark:border-navy-800 shrink-0 transition-all cursor-pointer"
                        title={formula.code}
                      >
                        {formula.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Send a math question or tip to ${activeRoom.name}...`}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      className="flex-1 px-4 py-2.5 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:border-royal-500"
                    />

                    <button
                      onClick={() => handleSendMessage()}
                      className="p-2.5 bg-royal-600 hover:bg-royal-750 text-white rounded-xl transition-all hover:scale-105 cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: STUDY TIPS & HANDY SHORTCUTS */}
            {activeTab === "tips" && (
              <motion.div
                key="tips-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 overflow-y-auto p-6 space-y-6 h-full"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest">
                      Shared Study Tips & Shortcuts
                    </h3>
                    <p className="text-[11px] text-navy-400">
                      Formulas, exam tricks, and visual guides pinned by classmates or tutor Bethuel.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsTipCreatorOpen(!isTipCreatorOpen)}
                    className="px-3 py-1.5 bg-royal-600 hover:bg-royal-750 text-white font-bold rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    {isTipCreatorOpen ? "View All Pinned Tips" : "Share a Math Tip"}
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isTipCreatorOpen ? (
                  /* Create Tip Form */
                  <form onSubmit={handleAddTip} className="bg-navy-50/50 dark:bg-navy-900/40 p-5 rounded-2xl border border-navy-150 dark:border-navy-850 space-y-4 max-w-xl animate-fadeIn">
                    <h4 className="text-xs font-black text-navy-900 dark:text-white">Pin a New Mathematics Tip</h4>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-navy-400">MATH TOPIC (e.g. Calculus, Trigonometry)</label>
                      <input
                        type="text"
                        placeholder="e.g. Euclidean Geometry"
                        value={tipTopic}
                        onChange={(e) => setTipTopic(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-xs focus:outline-none focus:border-royal-500 text-navy-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-navy-400">TIP EXPLANATION & SHORTCUT FORMULA</label>
                      <textarea
                        placeholder="Write down the shortcut, proof reminder, or calculator guide..."
                        value={tipContent}
                        onChange={(e) => setTipContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-xs focus:outline-none focus:border-royal-500 text-navy-900 dark:text-white resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-royal-600 hover:bg-royal-750 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Post & Pin Tip</span>
                    </button>
                  </form>
                ) : (
                  /* Tips Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeRoom.pinnedTips.map((tip) => (
                      <div
                        key={tip.id}
                        className="p-4 bg-navy-50/20 dark:bg-navy-900/20 border border-navy-150 dark:border-navy-850 hover:border-royal-100 dark:hover:border-navy-800 rounded-2xl space-y-3 transition-all relative overflow-hidden"
                      >
                        <div className="absolute right-3 top-3 text-royal-600 dark:text-gold-400">
                          <Pin className="w-3.5 h-3.5 rotate-45" />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-black uppercase bg-royal-100 text-royal-700 dark:bg-navy-800 dark:text-gold-400 px-1.5 py-0.5 rounded">
                            {tip.topic}
                          </span>
                          <h5 className="text-[11px] text-navy-400 font-mono mt-1">
                            Shared by: <span className="font-bold text-navy-800 dark:text-white">{tip.author}</span>
                          </h5>
                        </div>

                        <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed font-mono whitespace-pre-wrap">
                          {tip.content}
                        </p>

                        <div className="flex items-center gap-2 pt-2 border-t border-navy-100 dark:border-navy-850">
                          <button
                            onClick={() => handleLikeTip(tip.id)}
                            className="text-[10px] text-navy-400 hover:text-emerald-500 flex items-center gap-1 font-mono cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Helpful ({tip.likes})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: INTERACTIVE WHITEBOARD */}
            {activeTab === "whiteboard" && (
              <motion.div
                key="whiteboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
                  <div>
                    <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-royal-500" />
                      Collaborative Class Whiteboard
                    </h3>
                    <p className="text-[11px] text-navy-400">
                      Solve tough matric problems or sketch geometry properties alongside classmates.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={simulatePeerDrawing}
                      disabled={isSimulatingDrawing}
                      className="px-3 py-1.5 border border-royal-200/50 hover:bg-royal-50 dark:border-navy-800 dark:hover:bg-navy-900 text-royal-600 dark:text-gold-400 font-mono text-[10px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSimulatingDrawing ? "Lerato is drawing..." : "Simulate Peer Input"}
                    </button>
                    <button
                      onClick={shareWhiteboardSnap}
                      className="px-3 py-1.5 bg-royal-600 hover:bg-royal-750 text-white font-mono text-[10px] uppercase font-black tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Share Board to Chat
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                  {/* LEFT: Drawing Canvas */}
                  <div className="flex-1 bg-navy-950 rounded-2xl border border-navy-850 p-3 flex flex-col relative overflow-hidden">
                    {/* Control Bar */}
                    <div className="flex items-center justify-between border-b border-navy-850 pb-2.5 mb-3 gap-2 flex-wrap text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-navy-400">Brush Color:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { name: "Orange", hex: "#f59e0b" },
                            { name: "Emerald", hex: "#10b981" },
                            { name: "White", hex: "#ffffff" },
                            { name: "Blue", hex: "#3b82f6" },
                            { name: "Red", hex: "#ef4444" }
                          ].map(color => (
                            <button
                              key={color.hex}
                              onClick={() => {
                                setWbColor(color.hex);
                                setWbIsEraser(false);
                              }}
                              className={`w-5 h-5 rounded-full transition-all cursor-pointer border ${
                                wbColor === color.hex && !wbIsEraser
                                  ? "ring-2 ring-royal-500 scale-110 border-white"
                                  : "border-transparent opacity-80 hover:opacity-100"
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="h-4 w-[1px] bg-navy-850 hidden sm:block" />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setWbIsEraser(!wbIsEraser);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer border ${
                            wbIsEraser
                              ? "bg-red-500/10 border-red-500/50 text-red-400 font-bold"
                              : "border-navy-800 text-navy-400 hover:text-white"
                          }`}
                        >
                          🧹 Eraser Mode
                        </button>

                        <button
                          onClick={() => {
                            setWbShapes(wbShapes === "free" ? "line" : "free");
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer border ${
                            wbShapes === "line"
                              ? "bg-royal-500/10 border-royal-500/50 text-royal-400 font-bold"
                              : "border-navy-800 text-navy-400 hover:text-white"
                          }`}
                        >
                          📐 Ruler Line
                        </button>
                      </div>

                      <div className="h-4 w-[1px] bg-navy-850" />

                      {/* Brush Weight */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-navy-400">Brush: {wbWidth}px</span>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={wbWidth}
                          onChange={e => setWbWidth(parseInt(e.target.value))}
                          className="w-16 h-1 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-royal-500"
                        />
                      </div>

                      <div className="h-4 w-[1px] bg-navy-850" />

                      <button
                        onClick={clearWb}
                        className="px-2 py-1 rounded-lg border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-400 font-mono text-[10px] transition-all cursor-pointer"
                      >
                        Clear Board
                      </button>
                    </div>

                    {/* Main Interactive Canvas Element */}
                    <div className="flex-1 relative border border-navy-850 rounded-xl overflow-hidden cursor-crosshair bg-[#0b1329]">
                      <canvas
                        ref={whiteboardRef}
                        width={800}
                        height={480}
                        onMouseDown={startWbDrawing}
                        onMouseMove={drawWb}
                        onMouseUp={stopWbDrawing}
                        onMouseLeave={stopWbDrawing}
                        onTouchStart={startWbDrawing}
                        onTouchMove={drawWb}
                        onTouchEnd={stopWbDrawing}
                        className="w-full h-full block bg-[#0b1329]"
                      />

                      {/* Straight Line Preview Overlay */}
                      {wbShapes === "line" && wbLineStart && wbLineCurrent && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                          <line
                            x1={`${(wbLineStart.x / 800) * 100}%`}
                            y1={`${(wbLineStart.y / 480) * 100}%`}
                            x2={`${(wbLineCurrent.x / 800) * 100}%`}
                            y2={`${(wbLineCurrent.y / 480) * 100}%`}
                            stroke={wbIsEraser ? wbBg : wbColor}
                            strokeWidth={wbWidth}
                            strokeDasharray="4 4"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Math Presets & Tips sidebar */}
                  <div className="w-full lg:w-60 bg-navy-50/10 dark:bg-navy-900/10 border border-navy-150 dark:border-navy-850 p-4 rounded-2xl flex flex-col gap-4 text-left">
                    <div>
                      <h4 className="text-xs font-mono font-black text-navy-800 dark:text-white uppercase tracking-wider">
                        Math Templates
                      </h4>
                      <p className="text-[10px] text-navy-400 mt-0.5 leading-relaxed">
                        Load preset grids and mathematics shapes to draw over.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => loadWhiteboardTemplate("grid")}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-900 hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 rounded-xl text-left text-xs text-navy-800 dark:text-navy-200 transition-all cursor-pointer font-medium flex items-center justify-between"
                      >
                        <span>📉 Coordinate Grid</span>
                        <span className="text-[9px] font-mono text-royal-500 font-bold bg-royal-50 dark:bg-navy-800 dark:text-gold-400 px-1.5 py-0.5 rounded">
                          AXIS
                        </span>
                      </button>

                      <button
                        onClick={() => loadWhiteboardTemplate("circle")}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-900 hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 rounded-xl text-left text-xs text-navy-800 dark:text-navy-200 transition-all cursor-pointer font-medium flex items-center justify-between"
                      >
                        <span>⭕ Geometry Circle</span>
                        <span className="text-[9px] font-mono text-royal-500 font-bold bg-royal-50 dark:bg-navy-800 dark:text-gold-400 px-1.5 py-0.5 rounded">
                          GEO
                        </span>
                      </button>

                      <button
                        onClick={() => loadWhiteboardTemplate("parabola")}
                        className="w-full px-3 py-2 bg-white dark:bg-navy-900 hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-200 dark:border-navy-800 rounded-xl text-left text-xs text-navy-800 dark:text-navy-200 transition-all cursor-pointer font-medium flex items-center justify-between"
                      >
                        <span>📈 Parabola Curve</span>
                        <span className="text-[9px] font-mono text-royal-500 font-bold bg-royal-50 dark:bg-navy-800 dark:text-gold-400 px-1.5 py-0.5 rounded">
                          ALGEBRA
                        </span>
                      </button>
                    </div>

                    <div className="border-t border-navy-200 dark:border-navy-800 pt-3 mt-1">
                      <h5 className="text-[10px] font-mono font-bold text-navy-400 uppercase tracking-wide">
                        Drawing Tips
                      </h5>
                      <ul className="text-[10px] text-navy-400 space-y-2 mt-2 list-disc list-inside">
                        <li>Tap <b>Ruler Line</b> to draw straight arrows or geometric line proofs.</li>
                        <li>Load the <b>Geometry Circle</b> to discuss tangent properties easily.</li>
                        <li>Click <b>Share to Chat</b> to capture your working solution and post it directly to the feed!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: ACTIVE PEERS LIST */}
            {activeTab === "members" && (
              <motion.div
                key="members-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 overflow-y-auto p-6 space-y-6 h-full"
              >
                <div>
                  <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest">
                    Peers Currently in {activeRoom.name.split(":")[0]}
                  </h3>
                  <p className="text-[11px] text-navy-400">
                    Connect and message fellow students or Amaris certified tutors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Lead tutor always first */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-navy-950 flex items-center justify-center font-black text-sm">
                      B
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs text-navy-900 dark:text-white">Bethuel Thipe</span>
                        <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase bg-amber-500 text-navy-950 px-1 rounded block w-fit mt-0.5">
                        Lead Tutor
                      </span>
                      <span className="text-[9px] text-emerald-500 flex items-center gap-1 mt-1 font-mono">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Active Online
                      </span>
                    </div>
                  </div>

                  {/* Preset students based on room */}
                  {[
                    { name: "Sipho Khumalo", role: "Student (Matric)", active: true, id: "sipho" },
                    { name: "Lerato Mokoena", role: "Student (Matric)", active: true, id: "lerato" },
                    { name: "Chantel Gadebe", role: "Student (Grade 12)", active: true, id: "chantel" },
                    { name: "Zola Ndlovu", role: "Student (Grade 11)", active: false, id: "zola" },
                    { name: "Anesu Dube", role: "Student (Grade 11)", active: true, id: "anesu" }
                  ].map((peer, idx) => (
                    <div key={idx} className="p-4 bg-navy-50/20 dark:bg-navy-900/20 border border-navy-150 dark:border-navy-850 hover:border-royal-100 dark:hover:border-navy-800 rounded-2xl flex items-center gap-3 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 flex items-center justify-center font-bold text-sm uppercase">
                        {peer.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-navy-900 dark:text-white block">
                          {peer.name}
                        </span>
                        <span className="text-[9px] font-mono text-navy-400 block">
                          {peer.role}
                        </span>
                        {peer.active ? (
                          <span className="text-[9px] text-emerald-500 flex items-center gap-1 mt-1 font-mono">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Active Online
                          </span>
                        ) : (
                          <span className="text-[9px] text-navy-400 flex items-center gap-1 mt-1 font-mono">
                            <span className="w-1.5 h-1.5 bg-navy-300 rounded-full" />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};
