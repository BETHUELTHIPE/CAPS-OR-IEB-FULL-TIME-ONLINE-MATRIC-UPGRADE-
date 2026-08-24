import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, PartyPopper, Star, Award } from "lucide-react";

export interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  shape: "rect" | "circle" | "star";
  vx: number;
  vy: number;
  scale: number;
}

const CONFETTI_COLORS = [
  "#f59e0b", // Gold/Amber
  "#eab308", // Yellow
  "#3b82f6", // Royal Blue
  "#10b981", // Emerald
  "#ec4899", // Pink/Rose
  "#8b5cf6", // Purple
  "#06b6d4"  // Cyan
];

export interface CelebrationConfettiProps {
  active?: boolean;
  subjectName?: string;
  milestonePercent?: number;
  onComplete?: () => void;
}

export const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({
  active = false,
  subjectName,
  milestonePercent,
  onComplete
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [celebrationSubject, setCelebrationSubject] = useState(subjectName || "Mathematics");
  const [celebrationPercent, setCelebrationPercent] = useState(milestonePercent || 10);

  // Listen to global celebration burst event
  useEffect(() => {
    const handleBurst = (e: Event) => {
      const customEvent = e as CustomEvent<{ subject: string; milestonePercent: number }>;
      if (customEvent.detail) {
        setCelebrationSubject(customEvent.detail.subject);
        setCelebrationPercent(customEvent.detail.milestonePercent);
        triggerBurst();
      }
    };

    window.addEventListener("amh_celebration_burst", handleBurst);
    return () => window.removeEventListener("amh_celebration_burst", handleBurst);
  }, []);

  useEffect(() => {
    if (active) {
      if (subjectName) setCelebrationSubject(subjectName);
      if (milestonePercent) setCelebrationPercent(milestonePercent);
      triggerBurst();
    }
  }, [active, subjectName, milestonePercent]);

  const triggerBurst = () => {
    // Generate 50 festive particles
    const newParticles: ConfettiParticle[] = Array.from({ length: 50 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 50 + (Math.random() * 0.5 - 0.25);
      const velocity = 8 + Math.random() * 14;
      return {
        id: `particle-${Date.now()}-${i}`,
        x: 50 + (Math.random() * 20 - 10), // start near center top
        y: 20 + (Math.random() * 10 - 5),
        size: 8 + Math.random() * 10,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * 360,
        shape: i % 3 === 0 ? "star" : i % 2 === 0 ? "rect" : "circle",
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity * 0.8 + 4,
        scale: 0.8 + Math.random() * 0.6
      };
    });

    setParticles(newParticles);
    setIsVisible(true);

    // Play subtle synthesized audio chime if AudioContext is available
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.12, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.35);
        });
      }
    } catch (e) {
      // Audio autoplay restrictions fallback silently
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setParticles([]);
      if (onComplete) onComplete();
    }, 4500);

    return () => clearTimeout(timer);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-[99999] flex items-center justify-center overflow-hidden">
          {/* Confetti Particles Canvas Layer */}
          <div className="absolute inset-0">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  opacity: 1,
                  scale: 0.2,
                  rotate: p.rotation
                }}
                animate={{
                  left: `${p.x + p.vx * 2.5}%`,
                  top: `${p.y + p.vy * 4 + 30}%`,
                  opacity: [1, 1, 0.8, 0],
                  scale: [0.2, p.scale, p.scale, 0.4],
                  rotate: p.rotation + 720
                }}
                transition={{
                  duration: 3.5,
                  ease: [0.25, 1, 0.5, 1]
                }}
                style={{
                  position: "absolute",
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.shape !== "star" ? p.color : "transparent",
                  borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "3px" : "0px",
                  boxShadow: `0 0 10px ${p.color}`
                }}
              >
                {p.shape === "star" && (
                  <Star className="w-full h-full fill-amber-400 text-amber-300 drop-shadow-md" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Celebratory Banner Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="bg-gradient-to-r from-navy-950 via-royal-950 to-amber-950 border-2 border-gold-400 text-white p-5 sm:p-6 rounded-3xl shadow-2xl shadow-amber-500/30 max-w-md mx-4 text-center space-y-3 relative overflow-hidden pointer-events-auto border-gold-400/80 backdrop-blur-md"
          >
            {/* Background Glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-royal-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-gold-300 text-navy-950 ring-4 ring-gold-400/40 shadow-lg mx-auto mb-1 animate-bounce">
              <PartyPopper className="w-8 h-8 fill-navy-950 text-navy-950" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-gold-500/20 text-gold-300 border border-gold-500/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" />
                Curriculum Milestone Unlocked!
              </span>

              <h3 className="text-2xl font-black font-display text-white tracking-tight">
                {celebrationPercent}% Mastered in {celebrationSubject}!
              </h3>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Congratulations! You crossed a new 10% curriculum milestone threshold. Keep pushing toward CAPS/IEB Distinction!
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono font-bold text-gold-400 bg-black/40 py-2 px-4 rounded-xl border border-gold-400/20">
              <Trophy className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Reward Unlocked: +{celebrationPercent * 5} Milestone XP!</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
