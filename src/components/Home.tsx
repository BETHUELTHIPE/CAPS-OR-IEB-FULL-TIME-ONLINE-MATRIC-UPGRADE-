import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, ArrowRight, Award, Users, Globe, Calendar, 
  BookOpen, Video, FileCheck, Star, Sparkles, ChevronDown, ChevronUp, MessageSquare,
  UserPlus, LogIn, Laptop, PlayCircle, FileUp, FileText, Database, Network, Cpu, Layers, Lock, Coins, HelpCircle, Activity, Play, RefreshCw, Server,
  Pause, Volume2, VolumeX, PictureInPicture, Maximize2, Minimize2, Tv, SkipForward, SkipBack, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { dbAPI } from "../lib/db";
import { FAQ, Testimonial } from "../types";
import { DailyChallengeQuiz } from "./DailyChallengeQuiz";
import { AmarisLogo } from "./AmarisLogo";

export const Home: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Guided Walkthrough and Flow Simulation States
  const [activeDemoTab, setActiveDemoTab] = useState<"register_login" | "book_class" | "request_video">("register_login");
  const [simState, setSimState] = useState<"idle" | "running" | "completed">("idle");
  const [simStep, setSimStep] = useState<number>(1);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  // Interactive Video walkthrough states
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const hiddenVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const lastSpokenRef = useRef<string>("");

  const togglePiP = async () => {
    try {
      if ("documentPictureInPicture" in window && (window as any).documentPictureInPicture?.window) {
        (window as any).documentPictureInPicture.window.close();
        setIsPiPActive(false);
        return;
      }

      const nextState = !isPiPActive;
      setIsPiPActive(nextState);

      if (nextState && !videoPlaying) {
        setVideoPlaying(true);
      }

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (hiddenVideoRef.current && hiddenVideoRef.current.requestPictureInPicture) {
        await hiddenVideoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.log("PiP toggle fallback to floating card component:", err);
      setIsPiPActive(prev => !prev);
    }
  };

  const videoChapters = [
    {
      title: "Welcome & Amaris Mission",
      duration: 32,
      description: "An introduction from Head Coach Bethuel on how we support CAPS & IEB Matric candidates.",
      fullSpeech: "Hello and welcome to Amaris Mathematics Hub! I am Head Coach Bethuel. Whether you are in Grade 10 to 12 or a Matric Upgrade candidate taking CAPS or IEB Mathematics, our platform is crafted for your academic success. We focus on active step-by-step problem solving. In this walkthrough, you will learn how to book live one-on-one sessions, collaborate on interactive whiteboards, and request custom HD video explanations whenever you face a challenging question.",
      subtitles: [
        { time: 0, text: "Hello and welcome to Amaris Mathematics Hub! I am Head Coach Bethuel." },
        { time: 8, text: "Whether you are in Grade 10 to 12 or a Matric Upgrade student, our hub is crafted for your success." },
        { time: 16, text: "We focus on active learning. Let us take a quick look at how simple our platform is to use." },
        { time: 24, text: "You get interactive 1-on-1 tutoring, live whiteboards, and custom step-by-step video solutions." }
      ]
    },
    {
      title: "1. Secure Registration & Login",
      duration: 30,
      description: "Input student details, select curriculum grades, and trigger secure bcrypt authentication.",
      fullSpeech: "To begin your journey with us, register a student account on the Amaris portal. Enter your full name, select your CAPS or IEB curriculum grade level, and create your secure password. Our server secures your profile immediately with industry-standard bcrypt encryption. Once registered, log in to access your personal student learning dashboard, trial exam performance trackers, and learning resources.",
      subtitles: [
        { time: 0, text: "To begin, register a student account on the Amaris portal." },
        { time: 7, text: "Enter your full name, choose CAPS or IEB curriculum grade levels, and create your password." },
        { time: 15, text: "Our server secures your profile immediately with industry-standard encryption." },
        { time: 22, text: "Once registered, log in to access your personal student learning dashboard." }
      ]
    },
    {
      title: "2. Booking a Live 1-on-1 Class",
      duration: 30,
      description: "Select custom dates, reserve slots, and connect over Google Meet with a writable whiteboard.",
      fullSpeech: "Booking your live tutoring sessions is effortless. Simply navigate to the Live Lessons tab, and choose a time slot that suits your schedule from our live tutor calendar grid. The system locks your session, creates your private Google Meet link, and opens your collaborative interactive whiteboard. Detailed progress updates and diagnostic score reports are shared directly with your parents.",
      subtitles: [
        { time: 0, text: "Booking your tutoring sessions is effortless. Simply head to the Live Lessons tab." },
        { time: 7, text: "Choose a time slot that suits your schedule from our live tutor calendar grid." },
        { time: 15, text: "The system locks your session, creates your Google Meet link, and opens your digital whiteboard." },
        { time: 22, text: "Detailed progress updates and diagnostic score reports are shared directly with parents." }
      ]
    },
    {
      title: "3. Requesting Video Solutions (R150)",
      duration: 32,
      description: "Upload challenging mathematics worksheets and stream personalized HD tutorials recorded in 24 hours.",
      fullSpeech: "When facing a difficult past paper question or a complex calculus assignment outside of class, simply snap a photo or upload your worksheet directly into your portal. For only 150 Rand, our tutors record a dedicated, step-by-step explainer video for you. It is published directly to your dashboard so you can watch, pause, and master the solution anytime before your exams.",
      subtitles: [
        { time: 0, text: "When facing a difficult exam question or a complex calculus assignment..." },
        { time: 8, text: "Simply snap a photo or upload your worksheet directly into your portal." },
        { time: 16, text: "For only R150, our tutors record a dedicated, step-by-step explainer video for you." },
        { time: 24, text: "It is published to your dashboard so you can watch and review it anytime." }
      ]
    }
  ];

  const currentChapter = videoChapters[activeChapterIndex] || videoChapters[0];
  const currentSubtitleObj = currentChapter && currentChapter.subtitles
    ? [...currentChapter.subtitles].reverse().find((sub) => videoTime >= sub.time)
    : null;
  const currentSubtitle = currentSubtitleObj ? currentSubtitleObj.text : "";

  // Web Speech API Voice Synthesis & Audio Sound Engine for Head Coach Bethuel
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (!videoPlaying || videoMuted) {
      window.speechSynthesis.cancel();
      lastSpokenRef.current = "";
      return;
    }

    // Only initiate speech when chapter changes or when playback starts
    const chapterKey = `chapter-${activeChapterIndex}`;
    if (lastSpokenRef.current !== chapterKey) {
      window.speechSynthesis.cancel();
      lastSpokenRef.current = chapterKey;

      const fullTextToSpeak = currentChapter.fullSpeech;
      const utterance = new SpeechSynthesisUtterance(fullTextToSpeak);
      
      // Articulate, natural, continuous speech cadence without cutting off
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const selectBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        // 1. Look for high quality / natural / neural English voices
        const naturalVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith("en") && 
          (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural") || v.name.includes("Enhanced") || v.name.includes("Premium") || v.name.includes("Daniel") || v.name.includes("Arthur"))
        );
        if (naturalVoice) return naturalVoice;

        // 2. Look for regional English voices (South Africa, UK, US)
        const regionalVoice = voices.find(v => 
          v.lang.toLowerCase().includes("en-za") || 
          v.lang.toLowerCase().includes("en-gb") || 
          v.lang.toLowerCase().includes("en-us")
        );
        if (regionalVoice) return regionalVoice;

        // 3. Fallback to any English voice
        const anyEnglish = voices.find(v => v.lang.toLowerCase().startsWith("en"));
        return anyEnglish || voices[0];
      };

      const speakWithVoice = () => {
        const voice = selectBestVoice();
        if (voice) {
          utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        speakWithVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          speakWithVoice();
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    }
  }, [activeChapterIndex, videoPlaying, videoMuted, currentChapter]);

  useEffect(() => {
    let interval: any;
    if (videoPlaying && currentChapter) {
      interval = setInterval(() => {
        setVideoTime((prevTime) => {
          if (prevTime >= currentChapter.duration) {
            if (activeChapterIndex < videoChapters.length - 1) {
              setActiveChapterIndex(prev => prev + 1);
              return 0;
            } else {
              setVideoPlaying(false);
              return 0;
            }
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoPlaying, activeChapterIndex, currentChapter]);

  useEffect(() => {
    setFaqs(dbAPI.getFaqs());
    setTestimonials(dbAPI.getTestimonials());
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const changeDemoTab = (tab: "register_login" | "book_class" | "request_video") => {
    setActiveDemoTab(tab);
    setSimState("idle");
    setSimStep(1);
    setSimLogs([]);
  };

  const startSimulation = () => {
    setSimStep(1);
    setSimLogs([]);
    setSimState("running");
  };

  useEffect(() => {
    let timeoutId: any;
    if (simState === "running") {
      const runCycle = () => {
        if (activeDemoTab === "register_login") {
          if (simStep === 1) {
            setSimLogs(["[AI SIMULATING] Accessing secure registration module...", "[USER_INPUT] Candidate inputs credentials: \n- Name: Amari Khumalo \n- Grade: 12 Upgrade \n- Email: amari@example.com"]);
            timeoutId = setTimeout(() => { setSimStep(2); }, 1800);
          } else if (simStep === 2) {
            setSimLogs(prev => [...prev, "[API_GATEWAY] Dispatching POST payload to `/api/auth/register`...", "[SECURITY] Hashing password with industry-standard bcrypt algorithm...", "[DATABASE] Checking for unique constraints on student table..."]);
            timeoutId = setTimeout(() => { setSimStep(3); }, 1800);
          } else if (simStep === 3) {
            setSimLogs(prev => [...prev, "[DATABASE] Creating student record in local persistent SQLite / user_profile table...", "[JWT_AUTH] Issuing secure Session Token with 24h expiry...", "[REDIRECT] Student account initialized. Loading credentials..."]);
            timeoutId = setTimeout(() => { setSimStep(4); }, 1800);
          } else if (simStep === 4) {
            setSimLogs(prev => [...prev, "[DASHBOARD_LOADED] Welcome Amari! Initializing student cockpit dashboard panels...", "[SUCCESS] Registration and Login walkthrough completed successfully!"]);
            setSimState("completed");
          }
        } else if (activeDemoTab === "book_class") {
          if (simStep === 1) {
            setSimLogs(["[AI SIMULATING] Launching interactive lesson scheduling wizard...", "[USER_INPUT] Selection: Mathematics (CAPS Grade 12)... \n- Preferred Coach: Bethuel Moukangwe"]);
            timeoutId = setTimeout(() => { setSimStep(2); }, 1800);
          } else if (simStep === 2) {
            setSimLogs(prev => [...prev, "[CALENDAR_SCAN] Scanning active tutor schedules from SQL backend database...", "[USER_INPUT] Selected Friday 15:00 - 16:00 (SAST) session slot...", "[PACKAGE_CHECK] Verifying lesson token or R350 single-hour rate..."]);
            timeoutId = setTimeout(() => { setSimStep(3); }, 1800);
          } else if (simStep === 3) {
            setSimLogs(prev => [...prev, "[API_GATEWAY] Dispatching transaction to PayFast billing interface...", "[DATABASE] Logging session placeholder reservation to prevent double-booking...", "[INTEGRATION] Communicating with API to generate live Google Meet link..."]);
            timeoutId = setTimeout(() => { setSimStep(4); }, 1800);
          } else if (simStep === 4) {
            setSimLogs(prev => [...prev, "[NOTIFICATION] Class booked! Invitation dispatched to student & tutor.", "[WHITEBOARD] Interactive whiteboard classroom workspace configured.", "[SUCCESS] Class booking demonstration completed successfully!"]);
            setSimState("completed");
          }
        } else if (activeDemoTab === "request_video") {
          if (simStep === 1) {
            setSimLogs(["[AI SIMULATING] Opening on-demand Homework Video request portal...", "[USER_INPUT] Attachment uploaded: `grade12_calculus_worksheet.pdf` (1.4MB)...", "[UPLOADER] Initiating direct S3 client-side presigned token handshake..."]);
            timeoutId = setTimeout(() => { setSimStep(2); }, 1800);
          } else if (simStep === 2) {
            setSimLogs(prev => [...prev, "[S3_STORAGE] Uploading binary directly to secure S3 storage nodes...", "[API_GATEWAY] Syncing lightweight file pointer key with PostgreSQL database...", "[MEMORY_SAFETY] Bypassed Node.js heap memory buffer allocations successfully!"]);
            timeoutId = setTimeout(() => { setSimStep(3); }, 1800);
          } else if (simStep === 3) {
            setSimLogs(prev => [...prev, "[TRANSACTION] R150 custom video fee paid securely...", "[QUEUER] Dispatched job index to Celery asynchronous work pool...", "[TUTOR_DESK] Head Coach Bethuel Moukangwe assigned to write solutions..."]);
            timeoutId = setTimeout(() => { setSimStep(4); }, 1800);
          } else if (simStep === 4) {
            setSimLogs(prev => [...prev, "[VIDEO_COMPILATION] Tutor records interactive explanation video in HD.", "[NOTIFIER] Lesson video posted back to student cockpit. Ready to stream!", "[SUCCESS] Custom video walkthrough completed successfully!"]);
            setSimState("completed");
          }
        }
      };
      runCycle();
    }
    return () => clearTimeout(timeoutId);
  }, [simState, simStep, activeDemoTab]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Background video overlay with multiple sources */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-25"
          >
            <source src="/assets/tutoring_session.mp4" type="video/mp4" />
            <source src="/tutoring_session.mp4" type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-teacher-explaining-a-lesson-on-a-whiteboard-41908-large.mp4" type="video/mp4" />
          </video>
          {/* Elegant dark overlay mask */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-950/85 to-royal-950/95" />
        </div>

        {/* Ambient background glow dots */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-royal-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10"
        >
          
          {/* Hero Left Content */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <AmarisLogo variant="icon" size="lg" />
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-royal-500/10 border border-royal-500/20 rounded-full text-gold-400 text-xs font-mono font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                South Africa's Mathematics Upgrade Specialists
              </motion.div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-none">
              CAPS OR IEB FULL TIME ONLINE MATRIC UPGRADE, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-royal-300">
                Attend your classes from home
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-navy-200 leading-relaxed max-w-xl">
              Achieve the results you need for university entrance. We offer elite 1-on-1 online mathematics coaching, custom study schedules, and matric grade improvement tutorials designed for CAPS and IEB curriculum guidelines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link 
                  to="/book" 
                  className="px-6 py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 font-extrabold text-sm rounded-xl text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Book Your First Lesson
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link 
                  to="/services" 
                  className="px-6 py-3.5 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-white font-bold text-sm rounded-xl text-center transition-all hover:bg-opacity-90 flex items-center justify-center"
                >
                  View Services
                </Link>
              </motion.div>
            </div>

            {/* Micro-incentives / Floating trust badges */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-navy-800/60 max-w-md">
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">100% Online Lessons</h4>
                  <p className="text-[10px] text-navy-400">Collaborative live board</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/10 border border-gold-500/20 rounded-lg text-gold-400">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">5-Star Google Reviews</h4>
                  <p className="text-[10px] text-navy-400">Over 1000+ graduates</p>
                </div>
              </motion.div>
            </div>

          </motion.div>

          {/* Hero Right Image & Floating elements */}
          <motion.div variants={itemVariants} className="lg:col-span-5 relative flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-navy-800 shadow-2xl"
            >
              {/* Digital workspace office showcase - Tutor teaching online */}
              <img 
                src="/src/assets/images/tutor_teaching_online_1783863452429.jpg" 
                alt="Tutor teaching mathematics online with a computer whiteboard" 
                className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";
                }}
                referrerPolicy="no-referrer"
              />
              {/* Gradient dark mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />

              {/* Floating micro card 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-4 left-4 right-4 bg-navy-900/90 border border-navy-750 backdrop-blur-md p-4 rounded-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gold-500 text-navy-950 rounded-full flex items-center justify-center font-black text-sm shadow-md">
                  85%+
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Average Grade Improvement</h4>
                  <p className="text-[10px] text-gold-400 font-mono">Interactive Virtual Whiteboard Session</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Small decorative pulse accent */}
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-royal-500/30 rounded-full blur-lg animate-pulse pointer-events-none" />
          </motion.div>

        </motion.div>
      </section>

      {/* STATISTICS COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-navy-150 dark:border-navy-800 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-navy-100 dark:divide-navy-800"
        >
          <motion.div whileHover={{ y: -4 }} className="space-y-1 p-2 transition-transform">
            <div className="w-10 h-10 bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-royal-300 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white font-display">15+ Years</h3>
            <p className="text-[11px] sm:text-xs text-navy-500 dark:text-navy-400 font-mono uppercase tracking-wider">Teaching Experience</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="space-y-1 p-2 pt-6 md:pt-2 transition-transform">
            <div className="w-10 h-10 bg-gold-100 dark:bg-gold-950 text-gold-600 dark:text-gold-400 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white font-display">1000+</h3>
            <p className="text-[11px] sm:text-xs text-navy-500 dark:text-navy-400 font-mono uppercase tracking-wider">Students Supported</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="space-y-1 p-2 pt-6 md:pt-2 transition-transform">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white font-display">100%</h3>
            <p className="text-[11px] sm:text-xs text-navy-500 dark:text-navy-400 font-mono uppercase tracking-wider">Online Lessons</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="space-y-1 p-2 pt-6 md:pt-2 transition-transform">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white font-display">24/7</h3>
            <p className="text-[11px] sm:text-xs text-navy-500 dark:text-navy-400 font-mono uppercase tracking-wider">Flexible Scheduling</p>
          </motion.div>
        </motion.div>
      </section>

      {/* PLATFORM VIDEO TOUR & INTERACTIVE TALKING GUIDE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase text-royal-600 dark:text-gold-400 bg-royal-100 dark:bg-royal-950/40 px-3 py-1 rounded-full">
            Interactive Video Tour
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-navy-900 dark:text-white">
            Meet Your Coach & Explore The Booking System
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400">
            Watch the video presentation below. Head Coach Bethuel guides you through how to register, use our calendar scheduler, write on live digital boards, and submit worksheets for custom video feedback.
          </p>
        </div>

        {/* Video Player + Chapters grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Simulated HD Video Player (col-span 7) */}
          <div className="lg:col-span-7 bg-navy-950 border border-navy-850 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between min-h-[380px] sm:min-h-[440px] relative">
            
            {/* Top Bar Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-white/90 font-bold tracking-widest uppercase">HD Walkthrough Stream</span>
                {videoPlaying && !videoMuted && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-mono rounded font-bold">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    Voice Narration Active
                  </span>
                )}
              </div>
              <div className="px-2 py-0.5 bg-royal-500/30 border border-royal-500/30 text-royal-300 text-[9px] font-mono rounded font-black">
                CHAPT. {activeChapterIndex + 1}/4
              </div>
            </div>

            {/* Simulated Video Feed Area */}
            <div className="flex-1 flex flex-col justify-between p-6 pt-16 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop')" }}>
              
              {/* Dynamic blur/glow overlay during playing */}
              <div className={`absolute inset-0 bg-navy-950/80 transition-opacity duration-500 ${videoPlaying ? "opacity-75" : "opacity-90"}`} />

              {/* Center Play Button Overlay */}
              {!videoPlaying && (
                <button 
                  onClick={() => setVideoPlaying(true)}
                  className="absolute inset-0 m-auto w-16 h-16 bg-gold-500 hover:bg-gold-600 hover:scale-110 text-navy-950 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer z-20 group"
                >
                  <Play className="w-8 h-8 fill-current ml-1 group-hover:scale-105 transition-transform" />
                </button>
              )}

              {/* Floating Tutor Card (Bethuel photo preview) */}
              <div className="relative z-10 self-start flex items-center gap-3 bg-navy-900/90 border border-navy-800 p-2.5 rounded-xl max-w-xs mt-2 backdrop-blur">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-navy-750 bg-navy-950 flex-shrink-0">
                  <img 
                    src="/public/pages/about/My_office_photo.jpeg" 
                    alt="Tutor Bethuel" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=150&auto=format&fit=crop";
                    }}
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-white leading-tight">Bethuel Moukangwe</h4>
                  <p className="text-[9px] font-mono text-gold-400">Head Coach & UNISA Grad</p>
                </div>
              </div>

              {/* Live Audio Visualizer Stream Lines (Animated when playing) */}
              <div className="relative z-10 flex items-center gap-1 justify-center py-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => {
                  const delay = (bar * 0.1) + "s";
                  return (
                    <span 
                      key={bar} 
                      style={{ animationDelay: delay }}
                      className={`w-1 bg-gradient-to-t from-gold-500 to-amber-400 rounded-full transition-all duration-300 ${
                        videoPlaying ? "h-8 animate-bounce" : "h-2 opacity-40"
                      }`} 
                    />
                  );
                })}
              </div>

              {/* Synchronized Subtitles track overlay */}
              <div className="relative z-10 w-full bg-black/75 border border-white/10 backdrop-blur-sm p-4 rounded-xl min-h-[64px] flex items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-sans font-medium text-white leading-relaxed select-none">
                  {currentSubtitle || "Click Play to begin the tour of Amaris Mathematics Hub booking systems."}
                </p>
              </div>

            </div>

            {/* Player Controls Bar */}
            <div className="bg-navy-900 px-4 py-3 border-t border-navy-850 flex items-center gap-4 relative z-10 select-none">
              
              {/* Play / Pause Toggle Button */}
              <button 
                onClick={() => setVideoPlaying(!videoPlaying)}
                className="text-white hover:text-gold-400 transition-colors shrink-0 cursor-pointer"
              >
                {videoPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Progress Bar & Slider */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[9px] font-mono text-navy-400">
                  {`0:${videoTime < 10 ? "0" + videoTime : videoTime}`}
                </span>
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    setVideoTime(Math.round(percent * currentChapter.duration));
                  }}
                  className="flex-1 h-1.5 bg-navy-800 rounded-full cursor-pointer relative group"
                >
                  <div 
                    style={{ width: `${(videoTime / currentChapter.duration) * 100}%` }}
                    className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full relative"
                  >
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-gold-600 shadow-sm" />
                  </div>
                </div>
                <span className="text-[9px] font-mono text-navy-400">
                  {`0:${currentChapter.duration}`}
                </span>
              </div>

              {/* Volume mute controller */}
              <button 
                onClick={() => setVideoMuted(!videoMuted)}
                className="text-white hover:text-gold-400 transition-colors shrink-0 cursor-pointer"
                title={videoMuted ? "Unmute Voice Narration" : "Mute Voice Narration"}
              >
                {videoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Picture-in-Picture Toggle Button */}
              <button
                onClick={togglePiP}
                className={`transition-all shrink-0 cursor-pointer p-1.5 rounded-lg flex items-center gap-1 text-xs font-mono font-bold ${
                  isPiPActive 
                    ? "text-navy-950 bg-gold-500 shadow-md scale-105" 
                    : "text-white hover:text-gold-400 bg-navy-800 hover:bg-navy-750 border border-navy-700"
                }`}
                title={isPiPActive ? "Close Floating Picture-in-Picture" : "Pop out Picture-in-Picture player"}
              >
                <PictureInPicture className="w-4 h-4" />
                <span className="hidden sm:inline">{isPiPActive ? "PiP Active" : "PiP Mode"}</span>
              </button>

            </div>

          </div>

          {/* Chapter Selector & Dynamic Guidance (col-span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Chapters list */}
            <div className="space-y-3 text-left">
              <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-wider block">
                Video Presentation Chapters
              </span>

              <div className="space-y-2">
                {videoChapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveChapterIndex(idx);
                      setVideoTime(0);
                      setVideoPlaying(true);
                    }}
                    className={`w-full flex items-start gap-4 p-3 rounded-xl border transition-all text-left cursor-pointer group ${
                      activeChapterIndex === idx 
                        ? "bg-gradient-to-r from-royal-50 to-gold-400/5 dark:from-navy-850 dark:to-gold-400/5 border-royal-200 dark:border-gold-400/30 text-royal-700 dark:text-gold-400" 
                        : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-850"
                    }`}
                  >
                    {/* Chapter Number Badge */}
                    <div className={`w-6 h-6 rounded-lg text-xs font-black font-mono flex items-center justify-center shrink-0 border ${
                      activeChapterIndex === idx 
                        ? "bg-gold-500 border-gold-600 text-navy-950" 
                        : "bg-navy-50 dark:bg-navy-850 border-navy-200 dark:border-navy-750 text-navy-500"
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-extrabold transition-colors ${
                          activeChapterIndex === idx ? "text-navy-900 dark:text-gold-400" : "text-navy-800 dark:text-navy-200"
                        }`}>
                          {ch.title}
                        </h4>
                        <span className="text-[9px] font-mono text-navy-400 shrink-0">
                          {ch.duration}s
                        </span>
                      </div>
                      <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-normal line-clamp-2">
                        {ch.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contextual Website Guidance Cards (matches selected chapter!) */}
            <div className="p-5 bg-royal-600/5 dark:bg-gold-500/5 border border-royal-100 dark:border-gold-400/10 rounded-2xl text-left space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                <h4 className="text-xs font-black font-mono uppercase text-royal-700 dark:text-gold-400 tracking-wider">
                  Real Platform Action Guides
                </h4>
              </div>

              {activeChapterIndex === 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                    Tutor Bethuel offers flexible lessons starting from <strong className="text-navy-900 dark:text-white">R350/hr</strong>, plus fully graded custom diagnostic worksheets and monthly parent summaries.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/about" className="px-3.5 py-1.5 bg-royal-600 text-white text-[10px] font-extrabold rounded-lg hover:bg-royal-700 transition">
                      About Tutor Bethuel
                    </Link>
                    <Link to="/services" className="px-3.5 py-1.5 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-[10px] font-bold rounded-lg hover:bg-opacity-80 transition">
                      Pricing Packages
                    </Link>
                  </div>
                </div>
              )}

              {activeChapterIndex === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                    Unlock your study cockpit! Standard <strong>Caps & IEB syllabus profiling</strong> assigns customized homework sets matched perfectly to your grade.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/register" className="px-3.5 py-1.5 bg-royal-600 text-white text-[10px] font-extrabold rounded-lg hover:bg-royal-700 transition">
                      Create Your Profile Now
                    </Link>
                  </div>
                </div>
              )}

              {activeChapterIndex === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                    Experience active digital whiteboard rooms! Book sessions, receive invitations instantly, and reschedule transparently up to 24 hours prior.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/book" className="px-3.5 py-1.5 bg-royal-600 text-white text-[10px] font-extrabold rounded-lg hover:bg-royal-700 transition">
                      Launch Booking Scheduler
                    </Link>
                  </div>
                </div>
              )}

              {activeChapterIndex === 3 && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                    Submit difficult geometry, statistics, or calculus problems. Our experts record step-by-step videos inside our Pretoria HQ for only <strong>R150</strong>.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/login" className="px-3.5 py-1.5 bg-royal-600 text-white text-[10px] font-extrabold rounded-lg hover:bg-royal-700 transition">
                      Upload Tricky Worksheet
                    </Link>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* DAILY MATH CHALLENGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8">
          <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-gold-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Interactive Daily Practice
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-navy-900 dark:text-white">
            Daily Syllabus Math Challenge
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400">
            Test your NSC (CAPS) and IEB Grade 10-12 exam readiness with today's featured problem. Practice algebra, calculus, geometry, and trigonometry with instant step-by-step solutions and XP rewards.
          </p>
        </div>

        <DailyChallengeQuiz />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase text-royal-600 dark:text-gold-400 bg-royal-100 dark:bg-royal-950/40 px-3 py-1 rounded-full">
            Our Offerings
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-navy-900 dark:text-white">
            Comprehensive Tutoring Services
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400">
            Every learner has unique academic hurdles. Our systems are engineered to build strong foundational knowledge and provide rigorous examination preparation.
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-3 bg-royal-50 dark:bg-royal-950/30 text-royal-600 dark:text-royal-400 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">Exam Preparation</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
              Targeted revision of previous National Senior Certificate (NSC) or IEB matric exams, teaching syllabus structures and direct marks allocation rules.
            </p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-3 bg-gold-50 dark:bg-gold-950/20 text-gold-600 dark:text-gold-400 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">Homework Coaching</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
              Step-by-step guidance on algebra, geometry, and calculus worksheets, turning frustrating struggles into rewarding learning breakthroughs.
            </p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">Online Tutoring</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
              A high-fidelity virtual classroom featuring live video streaming and interactive digital boards accessible on any mobile, tablet, or PC.
            </p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">Revision Classes</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
              Dedicated sessions for intensive curriculum reviews, perfect for catching up on entire chapters before term assessments.
            </p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">Video Lessons</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
              Submit your challenging questions or worksheets directly on your student portal, and get customized explainer video responses recorded by a tutor.
            </p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">Progress Tracking</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
              Receive structured monthly diagnostics highlighting improved areas, key milestones, and recommended focuses for parent evaluation.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* HOW AMARIS WORKS - INTERACTIVE SYSTEM BLUEPRINTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase text-royal-600 dark:text-gold-400 bg-royal-100 dark:bg-royal-950/40 px-3 py-1 rounded-full">
            Interactive Walkthrough
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-navy-900 dark:text-white">
            How Amaris Works: Real System Blueprints
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400">
            Select an operation below to explore real system architectures, step-by-step guidelines, and launch our interactive AI simulator to see the actual database & API workflows in real-time.
          </p>
        </div>

        {/* Outer container */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
          
          {/* Tab buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-navy-100 dark:border-navy-800 pb-4">
            <button
              onClick={() => changeDemoTab("register_login")}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDemoTab === "register_login"
                  ? "bg-royal-600 text-white shadow-md shadow-royal-600/10"
                  : "bg-navy-50 dark:bg-navy-850 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>1. Register & Log In</span>
            </button>

            <button
              onClick={() => changeDemoTab("book_class")}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDemoTab === "book_class"
                  ? "bg-royal-600 text-white shadow-md shadow-royal-600/10"
                  : "bg-navy-50 dark:bg-navy-850 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>2. Book a Live Class</span>
            </button>

            <button
              onClick={() => changeDemoTab("request_video")}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDemoTab === "request_video"
                  ? "bg-royal-600 text-white shadow-md shadow-royal-600/10"
                  : "bg-navy-50 dark:bg-navy-850 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>3. Request Video Solution</span>
            </button>
          </div>

          {/* Interactive display area: Steps/Diagram vs Simulator Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Side: Step Guide and Data Diagram */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* Step Descriptions based on Tab */}
              <div className="space-y-4 text-left">
                <h3 className="text-lg font-black text-navy-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-royal-300 text-xs font-bold flex items-center justify-center">
                    i
                  </span>
                  {activeDemoTab === "register_login" && "Registration & Auth Pipeline"}
                  {activeDemoTab === "book_class" && "1-on-1 Class Scheduling Pipeline"}
                  {activeDemoTab === "request_video" && "On-Demand Video Solution Pipeline"}
                </h3>

                {/* Steps Timeline */}
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-100 dark:before:bg-navy-800">
                  {activeDemoTab === "register_login" && (
                    <>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">1</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Create Student Profile</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Fill in details, select CAPS/IEB grade levels, and provide active parent/sponsor contact triggers.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">2</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Secure Password Hashing</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Credentials are secured with standard industry bcrypt. Personal keys never stay exposed.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">3</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Authorize JWT Sessions</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Upon successful credentials, secure JSON Web Tokens synchronize current active browser cookies.</p>
                        </div>
                      </div>
                    </>
                  )}

                  {activeDemoTab === "book_class" && (
                    <>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">1</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Select Topic & Tutor</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Browse and select Mathematics, select standard lessons, and choose your certified private coach.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">2</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Lock Available Time Slot</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Our calendar locks schedules. No double-bookings, with simple 24-hour rescheduling guarantees.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">3</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Auto-Generate Whiteboard & Meet</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">System registers the event, links live Google Meet classrooms, and binds digital writable whiteboards.</p>
                        </div>
                      </div>
                    </>
                  )}

                  {activeDemoTab === "request_video" && (
                    <>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">1</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Upload Homework / Exam Sheet</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Drag & drop your specific geometry, algebra, or physical science problems as PDF or images.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">2</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Direct-to-S3 Buffer Bypass</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Files stream straight to persistent cloud storage keeping Node servers responsive and secure.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-royal-600 text-white text-[10px] font-black flex items-center justify-center z-10 shrink-0">3</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-navy-900 dark:text-white">Tutor Records Step-by-Step</h4>
                          <p className="text-[10px] text-navy-500 dark:text-navy-400">Tutors map solutions and compile customized HD videos, which load onto your dashboard in under 24h.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Data Flow Blueprint Visual Diagram */}
              <div className="p-4 bg-navy-50/50 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-850 rounded-2xl text-left space-y-3">
                <span className="text-[9px] font-mono font-black text-navy-400 dark:text-navy-500 uppercase tracking-widest block">
                  REAL ARCHITECTURE BLUEPRINT (DATA FLOW)
                </span>
                
                <div className="flex flex-col gap-2 font-mono text-[10px]">
                  
                  {/* Row 1: Student Device */}
                  <div className="flex items-center justify-between border border-navy-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-2 rounded-xl">
                    <span className="text-royal-600 dark:text-gold-400 font-extrabold flex items-center gap-1">
                      <Laptop className="w-3.5 h-3.5" /> Client Browser
                    </span>
                    <span className="text-navy-400">← SSL/TLS HTTPS →</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center py-0.5">
                    <span className="text-royal-500 animate-pulse text-xs">▼</span>
                  </div>

                  {/* Row 2: API Gateway / server.ts */}
                  <div className="flex items-center justify-between border border-royal-100 dark:border-navy-800 bg-royal-50/50 dark:bg-navy-950/20 p-2 rounded-xl">
                    <span className="text-amber-600 dark:text-gold-400 font-extrabold flex items-center gap-1">
                      <Server className="w-3.5 h-3.5" /> Express Controller
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-1 rounded">
                      PORT 3000
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center py-0.5">
                    <span className="text-royal-500 animate-pulse text-xs">▼</span>
                  </div>

                  {/* Row 3: DB & Storage Engine */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-navy-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-2 rounded-xl flex items-center gap-1.5 justify-center">
                      <Database className="w-3.5 h-3.5 text-navy-400" />
                      <span>Persistent DB</span>
                    </div>
                    <div className="border border-navy-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-2 rounded-xl flex items-center gap-1.5 justify-center">
                      <Layers className="w-3.5 h-3.5 text-navy-400" />
                      <span>Cloud S3 Node</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Side: Interactive AI-Guided Simulator Panel */}
            <div className="lg:col-span-7 flex flex-col border border-navy-150 dark:border-navy-800 bg-navy-950 rounded-2xl overflow-hidden shadow-2xl relative min-h-[420px]">
              
              {/* Terminal Window Header */}
              <div className="bg-navy-900 px-4 py-3 border-b border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-[10px] text-navy-400 font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>AMARIS_PROCESS_SIMULATOR.sh</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Simulation Stage View Canvas */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                
                {/* Visual Canvas State */}
                <div className="flex-1 flex flex-col items-center justify-center bg-navy-900/60 rounded-xl border border-navy-850 p-4 min-h-[180px] text-center relative">
                  
                  {/* IDLE state */}
                  {simState === "idle" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="w-12 h-12 bg-royal-950 text-royal-400 border border-royal-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Simulator Ready</h4>
                        <p className="text-[10px] text-navy-400 max-w-sm">
                          Click "Run AI Simulation Walkthrough" below to watch step-by-step processes run through our controllers in real-time.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* RUNNING state */}
                  {simState === "running" && (
                    <div className="space-y-4 animate-fadeIn w-full max-w-xs">
                      
                      {/* Interactive Visual previews based on tab during execution */}
                      {activeDemoTab === "register_login" && (
                        <div className="space-y-3">
                          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 text-left space-y-2">
                            <div className="h-2.5 w-16 bg-navy-800 rounded animate-pulse" />
                            <div className="h-6 w-full bg-navy-900 rounded border border-royal-500/30 flex items-center px-2 text-[10px] text-navy-300">
                              amari@example.com
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-royal-400">Password Encryption:</span>
                              <span className="h-3 w-16 bg-royal-500/20 rounded animate-pulse text-[8px] text-royal-300 font-mono flex items-center justify-center font-bold">
                                BCrypt Hashing
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-amber-400 font-mono">Running transaction pipeline (Step {simStep}/4)...</p>
                        </div>
                      )}

                      {activeDemoTab === "book_class" && (
                        <div className="space-y-3">
                          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 text-left space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono text-navy-400">Class Date Selection:</span>
                              <span className="text-[9px] font-mono text-emerald-400 animate-pulse font-bold">Available</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                              <span className="bg-navy-800 p-1 rounded text-navy-500">Thu 14h</span>
                              <span className="bg-royal-600/20 border border-royal-500/40 p-1 rounded text-royal-400 font-bold animate-pulse">Fri 15h</span>
                              <span className="bg-navy-800 p-1 rounded text-navy-500">Sat 10h</span>
                              <span className="bg-navy-800 p-1 rounded text-navy-500">Sat 11h</span>
                            </div>
                            <div className="h-4 w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                              <span>Meet link compiling...</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-amber-400 font-mono">Reserving calendar schedule (Step {simStep}/4)...</p>
                        </div>
                      )}

                      {activeDemoTab === "request_video" && (
                        <div className="space-y-3">
                          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 text-left space-y-2">
                            <div className="flex justify-between text-[9px] font-mono">
                              <span className="text-navy-400">uploading: calculus_sheet.pdf</span>
                              <span className="text-royal-400 font-bold">78%</span>
                            </div>
                            <div className="w-full bg-navy-800 h-1.5 rounded overflow-hidden">
                              <div className="bg-royal-500 h-full w-[78%] animate-pulse" />
                            </div>
                            <p className="text-[8px] text-navy-500 font-mono italic">Client-side Direct Multipart Stream bypass active</p>
                          </div>
                          <p className="text-[10px] text-amber-400 font-mono">Processing upload streams (Step {simStep}/4)...</p>
                        </div>
                      )}

                    </div>
                  )}

                  {/* COMPLETED state */}
                  {simState === "completed" && (
                    <div className="space-y-4 animate-fadeIn w-full max-w-sm">
                      <div className="w-12 h-12 bg-emerald-950 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      
                      {activeDemoTab === "register_login" && (
                        <div className="bg-navy-950/80 border border-navy-800 p-3 rounded-xl text-left max-w-xs mx-auto space-y-1">
                          <p className="text-[10px] font-mono text-emerald-400 font-bold">✓ SESSION AUTHORIZED</p>
                          <p className="text-xs font-bold text-white">Student: Amari Khumalo (Gr.12)</p>
                          <p className="text-[9px] font-mono text-navy-400">Status: Registered & Logged In Successfully</p>
                        </div>
                      )}

                      {activeDemoTab === "book_class" && (
                        <div className="bg-navy-950/80 border border-navy-800 p-3 rounded-xl text-left max-w-xs mx-auto space-y-1">
                          <p className="text-[10px] font-mono text-emerald-400 font-bold">✓ CLASS RESERVED</p>
                          <p className="text-xs font-bold text-white">Mathematics with Bethuel M.</p>
                          <p className="text-[9px] font-mono text-royal-400 underline truncate">meet.google.com/ama-math-hub</p>
                        </div>
                      )}

                      {activeDemoTab === "request_video" && (
                        <div className="bg-navy-950/80 border border-navy-800 p-3 rounded-xl text-left max-w-xs mx-auto space-y-1.5">
                          <p className="text-[10px] font-mono text-emerald-400 font-bold">✓ SOLUTION POSTED (R150)</p>
                          <div className="bg-navy-900 border border-navy-800 p-1.5 rounded flex items-center gap-2">
                            <PlayCircle className="w-6 h-6 text-amber-500 animate-pulse shrink-0" />
                            <div className="truncate text-left">
                              <h5 className="text-[10px] font-bold text-white truncate">Video Solution #V-409</h5>
                              <p className="text-[8px] text-navy-400 font-mono">Ready to play • Recorded by Head Coach</p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Telemetry scrolling shell logs */}
                <div className="h-[120px] bg-black/80 border border-navy-850 rounded-xl p-3 font-mono text-[9px] text-left overflow-y-auto space-y-1 scrollbar-thin">
                  <span className="text-navy-500 block">*** AMARIS BACKEND TELEMETRY LOG STREAM ***</span>
                  {simLogs.length === 0 && (
                    <span className="text-navy-600 italic block">No active transactions. Click button below to launch...</span>
                  )}
                  {simLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`${
                        log.startsWith("[SUCCESS]") || log.startsWith("✓")
                          ? "text-emerald-400 font-bold" 
                          : log.startsWith("[USER_INPUT]") 
                          ? "text-royal-300"
                          : log.startsWith("[SYSTEM_SUCCESS]")
                          ? "text-emerald-400"
                          : log.startsWith("[COMPLETE]")
                          ? "text-emerald-300 font-extrabold animate-bounce"
                          : log.startsWith("[AI SIMULATING]") || log.startsWith("[AI INITIATED]")
                          ? "text-amber-400 font-bold"
                          : "text-navy-300"
                      } whitespace-pre-wrap`}
                    >
                      {log}
                    </div>
                  ))}
                </div>

                {/* Controller Action Triggers */}
                <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-left">
                    <span className="text-[9px] font-mono text-navy-400 block">GATEWAY CONTROLLER STATUS</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono ${simState === "running" ? "text-amber-400" : "text-emerald-400"}`}>
                      <span className={`h-2 w-2 rounded-full ${simState === "running" ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                      {simState === "idle" && "READY TO DEMONSTRATE"}
                      {simState === "running" && "SIMULATION RUNNING"}
                      {simState === "completed" && "PIPELINE VERIFIED"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={simState === "running"}
                    onClick={startSimulation}
                    className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-navy-800 disabled:to-navy-800 disabled:opacity-50 text-navy-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${simState === "running" ? "animate-spin" : ""}`} />
                    {simState === "completed" ? "Rerun Demonstration" : "Run AI Simulation Walkthrough"}
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* STUDENT TESTIMONIALS */}
      <section className="bg-navy-900 text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full">
              Success Stories
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display">
              Loved by South African Learners
            </h2>
            <p className="text-xs sm:text-sm text-navy-300">
              Read how our dedicated online support has empowered matric upgrade candidates and school pupils to raise their mathematics marks, unlock university admissions, and boost confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div 
                key={test.id} 
                className="bg-navy-950/80 border border-navy-800 p-6 rounded-2xl relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-gold-400 mb-3">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-navy-200 italic leading-relaxed mb-4">
                    "{test.content}"
                  </p>
                </div>
                <div className="border-t border-navy-800/80 pt-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-royal-600 text-white font-bold rounded-full flex items-center justify-center text-xs">
                    {test.student_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{test.student_name}</h4>
                    <p className="text-[10px] text-gold-400 font-mono">{test.grade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-mono font-bold uppercase text-royal-600 dark:text-gold-400 bg-royal-100 dark:bg-royal-950/40 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-navy-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400">
            Find immediate answers regarding South African Matric subject registration, pricing packages, lesson materials, and technical portal operations below.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div 
                key={faq.id} 
                className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-xl overflow-hidden transition-colors"
              >
                <button 
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 text-navy-900 dark:text-white hover:bg-navy-50 dark:hover:bg-navy-850 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-royal-600 dark:text-gold-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-navy-500 dark:text-navy-400 border-t border-navy-100 dark:border-navy-800 leading-relaxed bg-navy-50/20 dark:bg-navy-950/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-royal-700 to-royal-800 dark:from-royal-800 dark:to-royal-950 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-royal-400/20 rounded-full blur-2xl" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight text-white">
              Ready to Upgrade Your Academic Potential?
            </h2>
            <p className="text-xs sm:text-sm text-royal-100 leading-relaxed">
              Don't let a low mathematics mark stand between you and your dream university qualification. Sign up today and construct a personalized study program with our top-tier South African tutors.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-3">
              <Link 
                to="/register" 
                className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105"
              >
                Start Your Upgrade Journey
              </Link>
              <Link 
                to="/contact" 
                className="px-6 py-3 bg-transparent hover:bg-white/10 border border-white/20 text-white font-bold text-xs rounded-xl transition-all"
              >
                Contact via WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING PICTURE-IN-PICTURE (PiP) TUTORIAL PLAYER */}
      <AnimatePresence>
        {isPiPActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-navy-950 border-2 border-gold-500/60 rounded-2xl shadow-2xl overflow-hidden text-white font-sans backdrop-blur-xl"
          >
            {/* Header bar */}
            <div className="bg-navy-900 px-3 py-2 border-b border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PictureInPicture className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-[11px] font-mono font-bold text-white tracking-tight">Bethuel Walkthrough (PiP)</span>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsPiPActive(false)}
                  className="p-1 text-navy-400 hover:text-white hover:bg-navy-800 rounded transition-colors"
                  title="Return to inline player"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setIsPiPActive(false)}
                  className="p-1 text-navy-400 hover:text-red-400 hover:bg-navy-800 rounded transition-colors"
                  title="Close Picture-in-Picture"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Video preview area */}
            <div className="p-3 bg-gradient-to-b from-navy-950 to-navy-900 space-y-3 relative">
              <div className="flex items-center justify-between text-[10px] font-mono text-gold-400">
                <span className="truncate max-w-[200px]">Chapt {activeChapterIndex + 1}: {currentChapter.title}</span>
                <span>0:{videoTime < 10 ? "0" + videoTime : videoTime} / 0:{currentChapter.duration}</span>
              </div>

              {/* Subtitles box */}
              <div className="bg-black/80 border border-white/10 rounded-xl p-2.5 min-h-[50px] flex items-center justify-center text-center shadow-inner">
                <p className="text-xs font-medium text-white leading-tight">
                  {currentSubtitle || "Playing presentation walkthrough..."}
                </p>
              </div>

              {/* Audio visualizer */}
              <div className="flex items-center gap-1 justify-center py-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                  <span 
                    key={bar}
                    style={{ animationDelay: `${bar * 0.1}s` }}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      videoPlaying 
                        ? "h-5 bg-gradient-to-t from-gold-500 to-amber-400 animate-bounce" 
                        : "h-1.5 bg-navy-700 opacity-40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Controls bottom bar */}
            <div className="bg-navy-900 px-3 py-2 border-t border-navy-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    const prevIdx = activeChapterIndex > 0 ? activeChapterIndex - 1 : videoChapters.length - 1;
                    setActiveChapterIndex(prevIdx);
                    setVideoTime(0);
                  }}
                  className="p-1 text-white hover:text-gold-400 transition-colors"
                  title="Previous chapter"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setVideoPlaying(!videoPlaying)}
                  className="p-1.5 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 transition-all shadow"
                  title={videoPlaying ? "Pause" : "Play"}
                >
                  {videoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button 
                  onClick={() => {
                    const nextIdx = (activeChapterIndex + 1) % videoChapters.length;
                    setActiveChapterIndex(nextIdx);
                    setVideoTime(0);
                  }}
                  className="p-1 text-white hover:text-gold-400 transition-colors"
                  title="Next chapter"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setVideoMuted(!videoMuted)}
                  className="text-white hover:text-gold-400 transition-colors"
                  title={videoMuted ? "Unmute sound" : "Mute sound"}
                >
                  {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsPiPActive(false)}
                  className="px-2 py-1 bg-navy-800 hover:bg-navy-750 text-[10px] font-mono text-gold-400 font-bold rounded border border-navy-700"
                >
                  Return
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
