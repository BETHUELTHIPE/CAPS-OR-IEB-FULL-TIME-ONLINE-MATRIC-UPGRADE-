import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Headphones,
  Play,
  Pause,
  CloudRain,
  Coffee,
  Radio,
  Waves,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Settings,
  X,
  Volume1
} from "lucide-react";
import {
  SoundscapeType,
  AmbientSoundscapeConfig,
  DEFAULT_SOUNDSCAPE_CONFIG,
  STORAGE_KEY_SOUNDSCAPE,
  SOUNDSCAPE_PRESETS
} from "./AmbientSoundscapeSettings";

export interface LofiSoundscapePlayerBarProps {
  onOpenSettings?: () => void;
  className?: string;
}

export const LofiSoundscapePlayerBar: React.FC<LofiSoundscapePlayerBarProps> = ({
  onOpenSettings,
  className = ""
}) => {
  const [config, setConfig] = useState<AmbientSoundscapeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUNDSCAPE);
      return saved ? JSON.parse(saved) : DEFAULT_SOUNDSCAPE_CONFIG;
    } catch (e) {
      return DEFAULT_SOUNDSCAPE_CONFIG;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  // Listen to external settings changes
  useEffect(() => {
    const handleConfigChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SOUNDSCAPE);
        if (saved) {
          setConfig(JSON.parse(saved));
        }
      } catch (e) {}
    };

    window.addEventListener("amh_soundscape_changed", handleConfigChange);
    window.addEventListener("storage", handleConfigChange);
    return () => {
      window.removeEventListener("amh_soundscape_changed", handleConfigChange);
      window.removeEventListener("storage", handleConfigChange);
    };
  }, []);

  const updateConfig = (newType: SoundscapeType) => {
    const updated = { ...config, activeSoundscape: newType };
    setConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SOUNDSCAPE, JSON.stringify(updated));
      window.dispatchEvent(new Event("amh_soundscape_changed"));
    } catch (e) {}
  };

  const stopSynth = () => {
    activeNodesRef.current.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
  };

  // Web Audio Synth Audio Engine
  useEffect(() => {
    stopSynth();

    if (!isPlaying || config.activeSoundscape === "off") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(config.volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      activeNodesRef.current.push(masterGain);

      const type = config.activeSoundscape;

      if (type === "rain") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = buffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        rainSource.connect(filter);
        filter.connect(masterGain);
        rainSource.start();
        activeNodesRef.current.push(rainSource);
      } else if (type === "cafe") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.02;
        }

        const cafeSource = ctx.createBufferSource();
        cafeSource.buffer = buffer;
        cafeSource.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(400, ctx.currentTime);
        bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

        cafeSource.connect(bandpass);
        bandpass.connect(masterGain);
        cafeSource.start();
        activeNodesRef.current.push(cafeSource);
      } else if (type === "whitenoise") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.02;
        }

        const whiteSource = ctx.createBufferSource();
        whiteSource.buffer = buffer;
        whiteSource.loop = true;

        whiteSource.connect(masterGain);
        whiteSource.start();
        activeNodesRef.current.push(whiteSource);
      } else if (type === "ocean") {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.03;
        }

        const oceanSource = ctx.createBufferSource();
        oceanSource.buffer = buffer;
        oceanSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(300, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(200, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        oceanSource.connect(filter);
        filter.connect(masterGain);

        oceanSource.start();
        lfo.start();
        activeNodesRef.current.push(oceanSource, lfo);
      } else if (type === "focus432") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(432, ctx.currentTime);

        const toneGain = ctx.createGain();
        toneGain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc.connect(toneGain);
        toneGain.connect(masterGain);
        osc.start();
        activeNodesRef.current.push(osc);
      } else if (type === "lofi_beats") {
        const chordFrequencies = [
          [261.63, 329.63, 392.00, 493.88],
          [220.00, 261.63, 329.63, 392.00],
          [293.66, 349.23, 440.00, 523.25],
          [196.00, 246.94, 293.66, 349.23]
        ];

        let chordIdx = 0;
        const playChord = () => {
          if (!isPlaying) return;
          const freqGroup = chordFrequencies[chordIdx % chordFrequencies.length];
          chordIdx++;

          freqGroup.forEach((freq) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            g.gain.setValueAtTime(0.015, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8);

            osc.connect(g);
            g.connect(masterGain);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 4.0);
          });
        };

        playChord();
        const interval = setInterval(playChord, 4000);
        activeNodesRef.current.push({ stop: () => clearInterval(interval) });

        if (config.vinylCrackleEnabled) {
          const bufferSize = ctx.sampleRate * 2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() < 0.001 ? (Math.random() * 2 - 1) * 0.1 : 0;
          }
          const vinylSource = ctx.createBufferSource();
          vinylSource.buffer = buffer;
          vinylSource.loop = true;
          vinylSource.connect(masterGain);
          vinylSource.start();
          activeNodesRef.current.push(vinylSource);
        }
      }
    } catch (e) {
      console.warn("Lo-fi bar audio error:", e);
    }

    return () => {
      stopSynth();
    };
  }, [isPlaying, config.activeSoundscape, config.volume, config.vinylCrackleEnabled]);

  const activePreset = SOUNDSCAPE_PRESETS.find((p) => p.id === config.activeSoundscape) || SOUNDSCAPE_PRESETS[0];
  const IconComponent = activePreset.icon;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-navy-900/90 dark:bg-navy-950/90 border border-amber-500/40 text-white shadow-lg backdrop-blur">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isPlaying
              ? "bg-amber-500 text-navy-950 shadow-xs"
              : "bg-navy-800 text-amber-400 hover:text-white"
          }`}
          title={isPlaying ? "Pause Ambient Soundscape" : "Play Ambient Soundscape"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        {/* Current Soundscape Indicator Button */}
        <button
          type="button"
          onClick={() => setShowQuickMenu(!showQuickMenu)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-xs font-mono font-bold transition-all cursor-pointer"
        >
          <IconComponent className="w-3.5 h-3.5 text-gold-400" />
          <span className="hidden sm:inline font-extrabold text-amber-400">{activePreset.name}</span>
          <span className="sm:hidden text-[11px] text-amber-400 font-extrabold">{activePreset.tagline}</span>
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-2.5 ml-1">
              <span className="w-0.5 bg-gold-400 animate-bounce h-2.5" style={{ animationDelay: "0ms" }} />
              <span className="w-0.5 bg-gold-400 animate-bounce h-1.5" style={{ animationDelay: "150ms" }} />
              <span className="w-0.5 bg-gold-400 animate-bounce h-2" style={{ animationDelay: "300ms" }} />
            </span>
          )}
        </button>

        {/* Quick Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setShowQuickMenu(!showQuickMenu)}
          className="p-1.5 rounded-xl text-navy-400 hover:text-amber-400 hover:bg-navy-800 transition-colors cursor-pointer"
          title="Switch Ambient Soundscape"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* QUICK SOUNDSCAPE SWITCHER POPOVER */}
      <AnimatePresence>
        {showQuickMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 z-50 w-72 bg-navy-950 border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl text-white space-y-3"
          >
            <div className="flex items-center justify-between border-b border-navy-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-mono font-black uppercase tracking-wide text-white">
                  Ambient Concentration Soundscapes
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickMenu(false)}
                className="p-1 rounded-lg text-navy-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {SOUNDSCAPE_PRESETS.map((preset) => {
                const ItemIcon = preset.icon;
                const isSel = config.activeSoundscape === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateConfig(preset.id);
                      if (!isPlaying) setIsPlaying(true);
                      setShowQuickMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      isSel
                        ? "bg-amber-500 text-navy-950 font-black"
                        : "text-navy-300 hover:bg-navy-850 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ItemIcon className={`w-4 h-4 shrink-0 ${isSel ? "text-navy-950" : "text-amber-400"}`} />
                      <span className="truncate">{preset.name}</span>
                    </div>
                    {isSel && <span className="text-[9px] font-black uppercase shrink-0">Active</span>}
                  </button>
                );
              })}
            </div>

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenSettings();
                }}
                className="w-full py-2 bg-navy-850 hover:bg-navy-800 border border-navy-750 rounded-xl text-xs font-mono font-bold text-amber-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Dashboard Soundscape Settings</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
