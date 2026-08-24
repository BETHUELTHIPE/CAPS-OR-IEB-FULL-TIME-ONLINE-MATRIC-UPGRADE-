import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Tag, 
  Volume2, 
  VolumeX, 
  Plus, 
  Sparkles, 
  Search, 
  Clock, 
  Star, 
  HelpCircle, 
  FileText, 
  Share2, 
  Download, 
  Check, 
  X, 
  Radio, 
  AlertCircle,
  Bookmark,
  Zap,
  RotateCcw,
  Music
} from "lucide-react";
import { Profile } from "../types";
import { uploadFileToFirebaseStorage } from "../lib/firebaseStorageService";

export interface VoiceMemo {
  id: string;
  title: string;
  category: "Question for Tutor" | "Study Reminder" | "Formula Mnemonic" | "Exam Note";
  audioUrl: string; // Base64 data URL
  durationSeconds: number;
  timestamp: string;
  isFlagged?: boolean;
  notes?: string;
  subjectTag?: string;
}

const DEFAULT_VOICE_MEMOS: VoiceMemo[] = [
  {
    id: "memo-demo-1",
    title: "Question on First Principles negative sign",
    category: "Question for Tutor",
    audioUrl: "", // Will be fallback synthesizer tone if play requested without blob
    durationSeconds: 18,
    timestamp: "Today, 10:15 SAST",
    isFlagged: true,
    notes: "Ask Mr. Khumalo why line 3 distributes negative inside bracket for f(x + h) - f(x).",
    subjectTag: "Calculus Paper 1"
  },
  {
    id: "memo-demo-2",
    title: "Trig Double Angle Cosine formula mnemonic",
    category: "Formula Mnemonic",
    audioUrl: "",
    durationSeconds: 24,
    timestamp: "Yesterday, 16:40 SAST",
    isFlagged: false,
    notes: "cos(2θ) has 3 forms: cos² - sin², 2cos² - 1, and 1 - 2sin². Use 1 - 2sin² when eliminating cos!",
    subjectTag: "Trigonometry Paper 2"
  }
];

export interface VoiceMemosRecorderProps {
  user?: Profile | null;
}

export const VoiceMemosRecorder: React.FC<VoiceMemosRecorderProps> = ({ user }) => {
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordingCategory, setRecordingCategory] = useState<VoiceMemo["category"]>("Question for Tutor");
  const [recordingTitle, setRecordingTitle] = useState<string>("");
  const [recordingNotes, setRecordingNotes] = useState<string>("");
  const [subjectTag, setSubjectTag] = useState<string>("Calculus");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Playback state
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("amh_voice_memos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMemos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setMemos(DEFAULT_VOICE_MEMOS);
  }, []);

  // Save changes
  const saveMemos = (updated: VoiceMemo[]) => {
    setMemos(updated);
    try {
      localStorage.setItem("amh_voice_memos", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Storage limit reached for voice memos:", e);
    }
  };

  // Start Recording via MediaRecorder API
  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaRecorder API is not supported in this browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          let base64Audio = reader.result as string;
          try {
            const audioFile = new File([audioBlob], `voice_memo_${Date.now()}.webm`, { type: "audio/webm" });
            const uploadRes = await uploadFileToFirebaseStorage(audioFile, `voice_memos/${user?.id || 'anonymous'}`);
            if (uploadRes?.url) {
              base64Audio = uploadRes.url;
            }
          } catch (storageErr) {
            console.warn("[Firebase Storage] Memo audio upload notice:", storageErr);
          }
          saveNewMemo(base64Audio);
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setPermissionError(
        err.message || "Microphone permission denied or not available in this frame."
      );
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Save Memo Helper
  const saveNewMemo = (base64AudioUrl: string) => {
    const newMemo: VoiceMemo = {
      id: `memo-${Date.now()}`,
      title: recordingTitle.trim() || `Voice Note ${memos.length + 1}`,
      category: recordingCategory,
      audioUrl: base64AudioUrl,
      durationSeconds: recordingTime || 5,
      timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }) + " SAST",
      isFlagged: false,
      notes: recordingNotes.trim() || undefined,
      subjectTag: subjectTag
    };

    saveMemos([newMemo, ...memos]);
    setRecordingTitle("");
    setRecordingNotes("");
    setRecordingTime(0);
  };

  // Simulate Demo Recording (If Mic is unavailable/denied in iframe)
  const handleSimulateRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 6) {
          clearInterval(timerRef.current);
          setIsRecording(false);
          // Create dummy memo
          saveNewMemo("");
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Play audio
  const handlePlayAudio = (memo: VoiceMemo) => {
    // If currently playing this memo, pause
    if (playingMemoId === memo.id && activeAudioRef.current) {
      activeAudioRef.current.pause();
      setPlayingMemoId(null);
      return;
    }

    // Stop previous audio if any
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    if (memo.audioUrl) {
      const audio = new Audio(memo.audioUrl);
      activeAudioRef.current = audio;
      audio.playbackRate = playbackSpeed;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setPlayingMemoId(null);
        setAudioProgress(0);
      };

      audio.play().then(() => {
        setPlayingMemoId(memo.id);
      }).catch(e => console.error("Audio playback error:", e));
    } else {
      // Synthetic sound indicator for default/simulated audio
      setPlayingMemoId(memo.id);
      setAudioProgress(0);
      let count = 0;
      const interval = setInterval(() => {
        count += 10;
        setAudioProgress(count);
        if (count >= 100) {
          clearInterval(interval);
          setPlayingMemoId(null);
          setAudioProgress(0);
        }
      }, 300);
    }
  };

  // Toggle Flag
  const toggleFlag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = memos.map(m => m.id === id ? { ...m, isFlagged: !m.isFlagged } : m);
    saveMemos(updated);
  };

  // Delete memo
  const handleDeleteMemo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingMemoId === id && activeAudioRef.current) {
      activeAudioRef.current.pause();
      setPlayingMemoId(null);
    }
    const updated = memos.filter(m => m.id !== id);
    saveMemos(updated);
  };

  // Filtered Memos
  const filteredMemos = memos.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.subjectTag && m.subjectTag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "All Categories" || m.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Time formatter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-xl text-navy-900 dark:text-white relative overflow-hidden space-y-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-navy-150 dark:border-navy-800 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-black shadow-lg shrink-0">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" /> MediaRecorder Audio Notes
              </span>
              <span className="text-[11px] font-mono text-navy-500 dark:text-navy-400 font-bold">
                • {memos.length} Voice Memos Recorded
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight mt-0.5">
              Study Voice Memos & Audio Reminders
            </h2>
          </div>
        </div>

        {/* PLAYBACK SPEED CONTROL */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 p-1.5 rounded-2xl shrink-0">
          <span className="text-navy-500 dark:text-navy-400 px-2 text-[10px] uppercase">Speed:</span>
          {[1, 1.25, 1.5, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                playbackSpeed === spd
                  ? "bg-rose-500 text-white font-black shadow"
                  : "text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* RECORDING CONSOLE CARD */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-navy-900 via-royal-950 to-navy-950 border border-navy-800 text-white space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">
                Voice Note Title
              </label>
              <input
                type="text"
                disabled={isRecording}
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                placeholder="e.g. Euclidean circle theorem doubt..."
                className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white placeholder-navy-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">
                Category
              </label>
              <select
                disabled={isRecording}
                value={recordingCategory}
                onChange={(e) => setRecordingCategory(e.target.value as any)}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Question for Tutor">Question for Tutor</option>
                <option value="Study Reminder">Study Reminder</option>
                <option value="Formula Mnemonic">Formula Mnemonic</option>
                <option value="Exam Note">Exam Note</option>
              </select>
            </div>

            {/* Subject Tag */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-navy-300 uppercase font-bold block">
                Subject Topic
              </label>
              <select
                disabled={isRecording}
                value={subjectTag}
                onChange={(e) => setSubjectTag(e.target.value)}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Calculus">Calculus Paper 1</option>
                <option value="Algebra">Algebra & Functions</option>
                <option value="Trigonometry">Trigonometry Paper 2</option>
                <option value="Euclidean Geometry">Euclidean Geometry</option>
                <option value="Financial Maths">Financial Maths</option>
              </select>
            </div>
          </div>

          {/* Record Button & Live Timer */}
          <div className="flex items-center gap-4 shrink-0 justify-end pt-2 md:pt-0">
            {/* Live Visualizer Waves */}
            {isRecording && (
              <div className="flex items-center gap-1 h-8">
                {[40, 80, 50, 100, 60, 90, 30].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["20%", `${h}%`, "20%"] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1.5 bg-rose-500 rounded-full"
                  />
                ))}
              </div>
            )}

            {/* Timer Display */}
            <div className="text-right">
              <span className={`text-xl font-mono font-black ${isRecording ? "text-rose-400 animate-pulse" : "text-navy-300"}`}>
                {formatTime(recordingTime)}
              </span>
              <span className="text-[9px] font-mono text-navy-400 block uppercase">
                {isRecording ? "Recording Live..." : "Ready to Record"}
              </span>
            </div>

            {/* Record Trigger Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-mono font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:scale-105"
              >
                <Mic className="w-5 h-5 fill-white" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-5 py-3 rounded-2xl bg-slate-100 text-navy-950 font-mono font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:bg-white animate-pulse"
              >
                <Square className="w-5 h-5 fill-rose-600 text-rose-600" />
                <span>Stop & Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Permission Error or Simulation Warning */}
        {permissionError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Microphone frame restriction detected. You can test recording using simulated memo audio mode.</span>
            </div>
            <button
              onClick={handleSimulateRecording}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-black text-[10px] shrink-0 cursor-pointer"
            >
              Simulate Voice Note
            </button>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voice notes by title, topic, or notes..."
            className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl pl-10 pr-4 py-2 text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3 py-2 text-xs font-mono font-bold text-navy-700 dark:text-navy-200 focus:outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="All Categories">All Categories</option>
          <option value="Question for Tutor">Question for Tutor</option>
          <option value="Study Reminder">Study Reminder</option>
          <option value="Formula Mnemonic">Formula Mnemonic</option>
          <option value="Exam Note">Exam Note</option>
        </select>
      </div>

      {/* VOICE MEMOS LIST */}
      <div className="space-y-3 relative z-10">
        {filteredMemos.length === 0 ? (
          <div className="py-12 text-center bg-navy-50 dark:bg-navy-950 border border-dashed border-navy-200 dark:border-navy-800 rounded-3xl space-y-2">
            <Mic className="w-10 h-10 text-navy-400 mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-navy-900 dark:text-white">
              No voice memos stored
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
              Record a quick audio memo above to save questions for your next AMH live tutoring lesson.
            </p>
          </div>
        ) : (
          filteredMemos.map((memo) => {
            const isPlaying = playingMemoId === memo.id;

            return (
              <div
                key={memo.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPlaying
                    ? "bg-rose-500/10 border-rose-500/60 shadow-md ring-2 ring-rose-500/20"
                    : "bg-white dark:bg-navy-950 border-navy-200 dark:border-navy-800 hover:border-navy-300 dark:hover:border-navy-700"
                }`}
              >
                {/* Left Play/Pause Trigger & Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handlePlayAudio(memo)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform cursor-pointer shadow-md ${
                      isPlaying
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-navy-100 dark:bg-navy-800 text-navy-900 dark:text-white hover:bg-rose-500 hover:text-white"
                    }`}
                    title={isPlaying ? "Pause Memo" : "Play Memo"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                        {memo.category}
                      </span>
                      {memo.subjectTag && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
                          {memo.subjectTag}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-navy-400">
                        • {memo.timestamp}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold font-display text-navy-900 dark:text-white truncate">
                      {memo.title}
                    </h3>

                    {memo.notes && (
                      <p className="text-xs text-navy-600 dark:text-navy-400 line-clamp-1 font-sans italic">
                        "{memo.notes}"
                      </p>
                    )}

                    {/* Progress Bar during playback */}
                    {isPlaying && (
                      <div className="w-full bg-navy-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-rose-500 h-full transition-all duration-100"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions & Duration */}
                <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-navy-100 dark:border-navy-800">
                  <span className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400 bg-navy-50 dark:bg-navy-900 px-2.5 py-1 rounded-xl border border-navy-150 dark:border-navy-800">
                    {formatTime(memo.durationSeconds)}
                  </span>

                  <button
                    onClick={(e) => toggleFlag(memo.id, e)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      memo.isFlagged
                        ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                        : "text-navy-400 hover:text-amber-500"
                    }`}
                    title={memo.isFlagged ? "Unflag Memo" : "Flag for Tutor Review"}
                  >
                    <Star className={`w-4 h-4 ${memo.isFlagged ? "fill-amber-500" : ""}`} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteMemo(memo.id, e)}
                    className="p-2 rounded-xl text-navy-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Memo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
