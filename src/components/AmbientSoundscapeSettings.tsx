import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain,
  Coffee,
  Radio,
  Waves,
  Sparkles,
  Music,
  Check,
  Disc,
  Sliders,
  Zap,
  Info
} from "lucide-react";

export type SoundscapeType = "off" | "rain" | "cafe" | "whitenoise" | "ocean" | "focus432" | "lofi_beats";

export interface AmbientSoundscapeConfig {
  activeSoundscape: SoundscapeType;
  volume: number; // 0 to 1
  lofiBeatsEnabled: boolean;
  vinylCrackleEnabled: boolean;
  autoPlayInFocusMode: boolean;
}

export const DEFAULT_SOUNDSCAPE_CONFIG: AmbientSoundscapeConfig = {
  activeSoundscape: "rain",
  volume: 0.6,
  lofiBeatsEnabled: fontActiveDefault("lofi"),
  vinylCrackleEnabled: true,
  autoPlayInFocusMode: true
};

function fontActiveDefault(name: string): boolean {
  return true;
}

export const STORAGE_KEY_SOUNDSCAPE = "amh_ambient_soundscape_config";

export const SOUNDSCAPE_PRESETS: {
  id: SoundscapeType;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}[] = [
  {
    id: "rain",
    name: "Rain & Pitter-Patter",
    tagline: "Cozy Rainfall",
    icon: CloudRain,
    color: "from-blue-600 to-indigo-700 text-blue-400",
    description: "Gentle pink-noise rain filter masking background household chatter for sustained focus."
  },
  {
    id: "cafe",
    name: "Cozy Student Café",
    tagline: "Warm Ambience",
    icon: Coffee,
    color: "from-amber-600 to-orange-700 text-amber-400",
    description: "Subtle warm coffee shop atmosphere with soft background hum and gentle acoustic warmth."
  },
  {
    id: "whitenoise",
    name: "Pure White / Pink Noise",
    tagline: "Distraction Shield",
    icon: Radio,
    color: "from-slate-600 to-navy-800 text-slate-300",
    description: "Smooth full-frequency static masking sudden household noises and intrusive thoughts."
  },
  {
    id: "ocean",
    name: "Shoreline Ocean Waves",
    tagline: "Calm Rhythms",
    icon: Waves,
    color: "from-cyan-600 to-blue-800 text-cyan-300",
    description: "Oscillating low-frequency shoreline surge syncing naturally with steady breathing."
  },
  {
    id: "focus432",
    name: "432Hz Alpha Focus Tone",
    tagline: "Deep Mathematics",
    icon: Sparkles,
    color: "from-purple-600 to-royal-800 text-purple-300",
    description: "Pure 432Hz sine wave resonance promoting deep concentration during complex proofs."
  },
  {
    id: "lofi_beats",
    name: "Lo-Fi Study Chill Beats",
    tagline: "Lo-Fi Music Pair",
    icon: Music,
    color: "from-gold-500 to-amber-600 text-gold-400",
    description: "Pairing relaxing lo-fi chord progressions with vinyl crackle for optimal study flow."
  }
];

export const AmbientSoundscapeSettings: React.FC = () => {
  const [config, setConfig] = useState<AmbientSoundscapeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUNDSCAPE);
      return saved ? JSON.parse(saved) : DEFAULT_SOUNDSCAPE_CONFIG;
    } catch (e) {
      return DEFAULT_SOUNDSCAPE_CONFIG;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  // Save config changes to localStorage & trigger storage event for listeners
  const updateConfig = (updater: (prev: AmbientSoundscapeConfig) => AmbientSoundscapeConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY_SOUNDSCAPE, JSON.stringify(next));
        window.dispatchEvent(new Event("amh_soundscape_changed"));
      } catch (e) {
        console.error("Error saving soundscape config:", e);
      }
      return next;
    });
  };

  // Stop Web Audio synth nodes
  const stopAudioSynth = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
  };

  // Web Audio Synth engine for preview in settings
  useEffect(() => {
    stopAudioSynth();

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
        // Soft Pink/Brown Noise Rain Generator
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
        // Cafe Ambient: Low hum + warm mid noise
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
        // White Noise Static
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
        // Ocean Wave Oscillating Lowpass Noise
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

        // LFO for surge effect
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // 0.15 Hz wave cycle
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
        // 432Hz Sine Tone Generator
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
        // Lo-Fi Chord Progression Synthesizer (Cmaj7 -> Am7 -> Dm7 -> G7)
        const chordFrequencies = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [293.66, 349.23, 440.00, 523.25], // Dm7
          [196.00, 246.94, 293.66, 349.23]  // G7
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
        const lofiInterval = setInterval(playChord, 4000);
        activeNodesRef.current.push({ stop: () => clearInterval(lofiInterval) });

        // Add Vinyl Crackle Layer
        if (config.vinylCrackleEnabled) {
          const bufferSize = ctx.sampleRate * 2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            const crackle = Math.random() < 0.001 ? (Math.random() * 2 - 1) * 0.1 : 0;
            data[i] = crackle;
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
      console.warn("Error starting soundscape synth:", e);
    }

    return () => {
      stopAudioSynth();
    };
  }, [isPlaying, config.activeSoundscape, config.volume, config.vinylCrackleEnabled]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectPreset = (id: SoundscapeType) => {
    updateConfig((prev) => ({ ...prev, activeSoundscape: id }));
    if (!isPlaying && id !== "off") {
      setIsPlaying(true);
    }
  };

  return (
    <div className="pt-6 border-t border-navy-100 dark:border-navy-800 space-y-6 text-left">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-gold-600 text-navy-950 font-black shadow-md shrink-0">
            <Headphones className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                🎧 Concentration Ambient Soundscapes & Lo-fi Player
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-gold-400 border border-amber-500/30 uppercase">
                Lo-fi Concentrator
              </span>
            </div>
            <p className="text-xs text-navy-500 dark:text-navy-400 font-sans mt-0.5">
              Select ambient background soundscapes (Rain, Cafe, White Noise, Ocean Waves) paired with your Lo-fi study player for deep concentration during CAPS/IEB math sessions.
            </p>
          </div>
        </div>

        {/* Master Play / Pause Soundscape Preview */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-4 py-2.5 rounded-2xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isPlaying
                ? "bg-emerald-500 hover:bg-emerald-400 text-navy-950 ring-4 ring-emerald-500/20"
                : "bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 hover:brightness-110"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Soundscape</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Soundscape Preview</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SOUNDSCAPE SELECTION GRID (RAIN, CAFE, WHITE NOISE, OCEAN, 432HZ, LOFI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {SOUNDSCAPE_PRESETS.map((preset) => {
          const IconComp = preset.icon;
          const isSelected = config.activeSoundscape === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-navy-900 dark:bg-navy-950 border-amber-400 ring-2 ring-amber-400/40 text-white shadow-xl"
                  : "bg-navy-50/60 dark:bg-navy-950/40 border-navy-150 dark:border-navy-850 hover:border-gold-500 text-navy-800 dark:text-navy-200"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${preset.color} shrink-0`}>
                  <IconComp className="w-5 h-5 text-white" />
                </div>

                {isSelected ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-amber-400 text-navy-950 flex items-center gap-1 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-navy-400 hover:text-navy-700 dark:hover:text-navy-200">
                    Select
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black font-display text-navy-900 dark:text-white">
                    {preset.name}
                  </h4>
                  <span className="text-[10px] font-mono text-amber-500 font-bold">{preset.tagline}</span>
                </div>
                <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              {/* Animated Audio Bars inside selected card */}
              {isSelected && isPlaying && (
                <div className="flex items-end gap-1 h-3 pt-1">
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3.5" style={{ animationDelay: "300ms" }} />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: "450ms" }} />
                  <span className="text-[9px] font-mono text-amber-400 font-bold ml-1">Live Audio Synth</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTROLS & VOLUME ADJUSTER */}
      <div className="p-4 rounded-2xl border bg-navy-50/50 dark:bg-navy-950/40 border-navy-150 dark:border-navy-850 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-royal-600 dark:text-gold-400" />
            <span className="text-xs font-bold text-navy-900 dark:text-white uppercase font-mono">
              Soundscape Master Volume: {Math.round(config.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <VolumeX className="w-4 h-4 text-navy-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateConfig((prev) => ({ ...prev, volume: val }));
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
        </div>

        {/* TOGGLE OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-navy-100 dark:border-navy-800">
          {/* Lo-fi Vinyl Crackle Layer */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800">
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-gold-500" /> Vinyl Warmth & Crackle Layer
              </span>
              <span className="block text-[10px] text-navy-500 dark:text-navy-400">
                Adds analog vintage vinyl texture to Lo-fi beats and cafe soundscapes.
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateConfig((prev) => ({ ...prev, vinylCrackleEnabled: !prev.vinylCrackleEnabled }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                config.vinylCrackleEnabled ? "bg-emerald-500" : "bg-navy-200 dark:bg-navy-850"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  config.vinylCrackleEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Auto-start in Pomodoro Focus Mode */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800">
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Auto-Start in Pomodoro Sessions
              </span>
              <span className="block text-[10px] text-navy-500 dark:text-navy-400">
                Automatically start chosen soundscape when timer starts in Deep Focus Zone.
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateConfig((prev) => ({ ...prev, autoPlayInFocusMode: !prev.autoPlayInFocusMode }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                config.autoPlayInFocusMode ? "bg-emerald-500" : "bg-navy-200 dark:bg-navy-850"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  config.autoPlayInFocusMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
