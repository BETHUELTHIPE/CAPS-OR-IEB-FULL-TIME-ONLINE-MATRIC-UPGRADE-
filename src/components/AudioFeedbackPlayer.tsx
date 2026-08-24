import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Square, Pause, RotateCcw, Sparkles, Mic, Headphones } from "lucide-react";
import { speechEngine, formatMathForSpeech } from "../lib/speechUtils";

interface AudioFeedbackPlayerProps {
  /** The text explanation / math error breakdown to speak */
  textToSpeak: string;
  /** Label describing the audio section (e.g. "AI Error Explanation" or "Worked CAPS Solution") */
  label?: string;
  /** Optional auto-play trigger on mount if global audio response is enabled */
  autoPlay?: boolean;
  /** Size variant */
  compact?: boolean;
}

export const AudioFeedbackPlayer: React.FC<AudioFeedbackPlayerProps> = ({
  textToSpeak,
  label = "Synthetic Voice Explanation",
  autoPlay = false,
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(speechEngine.checkSupport());

    if (autoPlay && textToSpeak && speechEngine.checkSupport()) {
      handlePlay();
    }

    return () => {
      speechEngine.stop();
    };
  }, [textToSpeak]);

  const handlePlay = () => {
    if (!textToSpeak) return;

    if (isPlaying) {
      speechEngine.stop();
      setIsPlaying(false);
      return;
    }

    const success = speechEngine.speakText(textToSpeak, {
      rate: speechRate,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: (err) => {
        console.error("Speech Error:", err);
        setIsPlaying(false);
      }
    });

    if (!success) {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    speechEngine.stop();
    setIsPlaying(false);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (isPlaying) {
      speechEngine.stop();
      speechEngine.speakText(textToSpeak, {
        rate,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={handlePlay}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isPlaying
              ? "bg-rose-500 text-white animate-pulse shadow-md"
              : "bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 hover:bg-royal-200 dark:hover:bg-navy-750"
          }`}
          title={isPlaying ? "Stop Synthetic Voice Explanation" : "Listen to Synthetic Voice Explanation"}
          aria-label={isPlaying ? "Stop audio explanation" : "Play audio response for math explanation"}
        >
          {isPlaying ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen (Voice)</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-royal-900/40 via-navy-900/50 to-navy-900/40 border border-royal-500/30 text-white font-mono space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isPlaying ? "bg-amber-400 text-navy-950 animate-bounce" : "bg-royal-600/50 text-gold-300"}`}>
            {isPlaying ? <Headphones className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-xs font-bold text-gold-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold-400" />
              {label}
            </span>
            <span className="text-[10px] text-navy-300 block">
              {isPlaying ? "Synthetic Voice Audio Active..." : "Hear AI math error explanation & step-by-step breakdown"}
            </span>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="hidden sm:flex items-center bg-navy-950/80 p-0.5 rounded-lg border border-navy-700 text-[10px]">
            {[0.8, 0.95, 1.25].map(rate => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                  speechRate === rate ? "bg-gold-400 text-navy-950" : "text-navy-300 hover:text-white"
                }`}
              >
                {rate === 0.8 ? "0.8x" : rate === 0.95 ? "1x" : "1.25x"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePlay}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow ${
              isPlaying
                ? "bg-rose-500 hover:bg-rose-600 text-white"
                : "bg-gold-400 hover:bg-gold-300 text-navy-950"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Equalizer Wave Animation when Playing */}
      {isPlaying && (
        <div className="flex items-center gap-1 pt-1 justify-center">
          <span className="w-1 h-3 bg-gold-400 rounded-full animate-[pulse_0.6s_infinite]" />
          <span className="w-1 h-5 bg-amber-400 rounded-full animate-[pulse_0.4s_infinite]" />
          <span className="w-1 h-2 bg-gold-400 rounded-full animate-[pulse_0.8s_infinite]" />
          <span className="w-1 h-6 bg-gold-300 rounded-full animate-[pulse_0.5s_infinite]" />
          <span className="w-1 h-4 bg-amber-300 rounded-full animate-[pulse_0.7s_infinite]" />
          <span className="text-[10px] text-amber-300 font-bold ml-2">
            Reading math error analysis out loud...
          </span>
        </div>
      )}
    </div>
  );
};
