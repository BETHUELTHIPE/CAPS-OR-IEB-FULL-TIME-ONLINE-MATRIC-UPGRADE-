/**
 * Amaris Mathematics Hub - Math Error Synthetic Voice Text-to-Speech Engine
 * Converts LaTeX and mathematical expressions into natural spoken speech for quiz AI feedback.
 */

export interface SpeechOptions {
  rate?: number; // Speech speed rate (0.8 - 1.5)
  pitch?: number; // Voice pitch (0.5 - 1.5)
  volume?: number; // Volume (0 - 1.0)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Converts mathematical symbols and LaTeX strings into clean natural English phonetics for TTS engines.
 */
export function formatMathForSpeech(rawText: string): string {
  if (!rawText) return "";

  let spoken = rawText;

  // Remove raw LaTeX syntax markers
  spoken = spoken.replace(/\\text\{([^}]+)\}/g, "$1");
  spoken = spoken.replace(/\\quad/g, " ");
  spoken = spoken.replace(/\\;/g, " ");
  spoken = spoken.replace(/\\!/g, "");

  // Powers and Exponents
  spoken = spoken.replace(/([a-zA-Z0-9]+)\^2/g, "$1 squared");
  spoken = spoken.replace(/([a-zA-Z0-9]+)\^3/g, "$1 cubed");
  spoken = spoken.replace(/([a-zA-Z0-9]+)\^\{([^}]+)\}/g, "$1 to the power of $2");
  spoken = spoken.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, "$1 to the power of $2");

  // Roots
  spoken = spoken.replace(/\\sqrt\{([^}]+)\}/g, "square root of $1");
  spoken = spoken.replace(/\\sqrt\[3\]\{([^}]+)\}/g, "cube root of $1");
  spoken = spoken.replace(/√\(([^)]+)\)/g, "square root of $1");
  spoken = spoken.replace(/√([a-zA-Z0-9]+)/g, "square root of $1");

  // Fractions
  spoken = spoken.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2");

  // Subscripts & Terms
  spoken = spoken.replace(/T_n/g, "T n");
  spoken = spoken.replace(/T_\{([^}]+)\}/g, "T $1");
  spoken = spoken.replace(/S_\\infty/g, "S infinity");
  spoken = spoken.replace(/S_n/g, "S n");

  // Math Symbols and Operators
  spoken = spoken.replace(/\\le|\\leq|≤/g, " is less than or equal to ");
  spoken = spoken.replace(/\\ge|\\geq|≥/g, " is greater than or equal to ");
  spoken = spoken.replace(/\\neq|≠/g, " is not equal to ");
  spoken = spoken.replace(/\\approx|≈/g, " is approximately ");
  spoken = spoken.replace(/\\implies|⇒/g, " implies ");
  spoken = spoken.replace(/\\infty|∞/g, " infinity ");
  spoken = spoken.replace(/\\theta|θ/g, " theta ");
  spoken = spoken.replace(/\\pi|π/g, " pi ");
  spoken = spoken.replace(/\\pm|±/g, " plus or minus ");
  spoken = spoken.replace(/\\times|×/g, " times ");
  spoken = spoken.replace(/\\div|÷/g, " divided by ");
  spoken = spoken.replace(/\\cdot|·/g, " times ");
  spoken = spoken.replace(/\\lim_\{h\\to 0\}/g, "limit as h approaches zero");

  // Common operators
  spoken = spoken.replace(/\+/g, " plus ");
  spoken = spoken.replace(/ - /g, " minus ");
  spoken = spoken.replace(/=/g, " equals ");

  // Clean up punctuation and multiple spaces
  spoken = spoken
    .replace(/\s+/g, " ")
    .replace(/\s,/, ",")
    .replace(/\s\./, ".")
    .trim();

  return spoken;
}

class SpeechController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = typeof window !== "undefined" && "speechSynthesis" in window;

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public speakText(text: string, options: SpeechOptions = {}): boolean {
    if (!this.isSupported) {
      console.warn("Speech Synthesis API is not supported in this browser.");
      if (options.onError) options.onError("Browser Speech Synthesis API unsupported");
      return false;
    }

    // Stop any active speech first
    this.stop();

    const formattedText = formatMathForSpeech(text);
    if (!formattedText.trim()) return false;

    try {
      const utterance = new SpeechSynthesisUtterance(formattedText);
      utterance.rate = options.rate ?? 0.95; // Slightly measured rate for clear math explanations
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Karen")))
      ) || voices.find(v => v.lang.startsWith("en"));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (options.onError) options.onError(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.error("Failed to speak text:", err);
      if (options.onError) options.onError(err);
      return false;
    }
  }

  public stop(): void {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public pause(): void {
    if (this.isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.isSupported && window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }
}

export const speechEngine = new SpeechController();
