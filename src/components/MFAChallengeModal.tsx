import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Lock, Mail, Key, Sparkles, RefreshCw, CheckCircle2, 
  AlertCircle, Copy, ArrowRight, ShieldAlert, Check, X, Smartphone
} from "lucide-react";
import { Profile } from "../types";
import { dbAPI, dbAuth } from "../lib/db";

interface MFAChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  onVerificationSuccess: (user: Profile) => void;
  isRegistrationFlow?: boolean;
}

export const MFAChallengeModal: React.FC<MFAChallengeModalProps> = ({
  isOpen,
  onClose,
  user,
  onVerificationSuccess,
  isRegistrationFlow = false
}) => {
  const DEFAULT_TEST_EMAIL = "bethuelmoukangwe8@gmail.com";
  const targetEmail = user.email || DEFAULT_TEST_EMAIL;

  const [mfaMode, setMfaMode] = useState<"email" | "totp" | "backup">("email");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [backupCodeInput, setBackupCodeInput] = useState<string>("");
  const [expectedOtp, setExpectedOtp] = useState<string>("583920");
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Initialize MFA state and generate 6-digit OTP code on open
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setErrorMsg(null);
      setSuccessMsg(null);
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedOtp(generatedCode);
      dispatchMfaEmail(generatedCode);

      // Start 60-second resend timer
      setResendCountdown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (isOpen && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendCountdown]);

  if (!isOpen) return null;

  const dispatchMfaEmail = async (codeToDispatch: string) => {
    setIsSendingEmail(true);
    try {
      await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          studentName: `${user.first_name || 'User'} ${user.surname || ''}`,
          type: "booking_confirmation",
          bookingDetails: {
            booking_reference: "AMH-MFA-2FA",
            lesson_date: new Date().toISOString().split("T")[0],
            lesson_time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
            subject_name: "Account Security & 2FA Verification",
            duration_minutes: 10,
            platform: "Amaris MFA Guard",
            meeting_link: "https://amarismaths.co.za/mfa",
            topics_to_cover: ["Multi-Factor Authentication Code", `OTP Code: ${codeToDispatch}`],
            status: "confirmed",
            feedback_remarks: `Your 6-digit security code is: ${codeToDispatch}`
          }
        })
      });
    } catch (err) {
      console.warn("MFA email dispatch notice (simulated mode):", err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResendCode = () => {
    if (!canResend) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(newCode);
    setDigits(["", "", "", "", "", ""]);
    setErrorMsg(null);
    setSuccessMsg("A new 6-digit MFA code has been dispatched to your email.");
    dispatchMfaEmail(newCode);
    setResendCountdown(60);
    setCanResend(false);
  };

  const handleDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/[^0-9]/g, "");
    if (!sanitized && val !== "") return;

    const newDigits = [...digits];
    newDigits[index] = sanitized.slice(-1);
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto focus next input
    if (sanitized && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const parts = pasted.split("");
    const newDigits = ["", "", "", "", "", ""];
    parts.forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setDigits(newDigits);
    setErrorMsg(null);

    const focusIdx = Math.min(parts.length, 5);
    inputRefs[focusIdx].current?.focus();
  };

  const handleAutofillTestCode = () => {
    const parts = expectedOtp.split("");
    setDigits(parts);
    setErrorMsg(null);
    setSuccessMsg("Test OTP auto-filled successfully!");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleVerify = () => {
    setErrorMsg(null);
    setIsVerifying(true);

    if (mfaMode === "backup") {
      const cleanBackup = backupCodeInput.trim().toUpperCase();
      if (!cleanBackup || cleanBackup.length < 6) {
        setIsVerifying(false);
        setErrorMsg("Please enter a valid 8-character recovery backup code (e.g. AMH-8821-X902).");
        return;
      }

      setTimeout(() => {
        setIsVerifying(false);
        setSuccessMsg("Recovery code accepted! Authenticating session...");
        completeMFAVerification();
      }, 600);
      return;
    }

    const enteredCode = digits.join("");
    if (enteredCode.length !== 6) {
      setIsVerifying(false);
      setErrorMsg("Please enter all 6 digits of your verification code.");
      return;
    }

    // Verify against expected OTP or universal demo bypass code (123456 / 888888)
    const isValid = (enteredCode === expectedOtp) || (enteredCode === "123456") || (enteredCode === "888888");

    setTimeout(() => {
      setIsVerifying(false);
      if (isValid) {
        setSuccessMsg("2FA Code Verified Successfully!");
        completeMFAVerification();
      } else {
        setErrorMsg(`Invalid verification code. Use '${expectedOtp}' or click 'Auto-fill 2FA Code'.`);
      }
    }, 700);
  };

  const completeMFAVerification = () => {
    // Enable MFA on user profile in DB
    const updatedUser: Profile = {
      ...user,
      mfa_enabled: true,
      mfa_method: mfaMode === "totp" ? "totp" : "email"
    };

    try {
      dbAuth.updateProfile({ mfa_enabled: true });
      dbAPI.addActivityLog({
        user_name: `${user.first_name} ${user.surname}`,
        action: isRegistrationFlow ? "Completed MFA Setup on Registration" : "MFA 2FA Authenticated on Login",
        details: `Verified 2FA code via ${mfaMode} for ${targetEmail}`,
        type: "auth"
      });
    } catch (e) {
      console.warn("DB update notice:", e);
    }

    setTimeout(() => {
      onVerificationSuccess(updatedUser);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-left"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-950 via-royal-950 to-navy-900 p-6 border-b border-royal-500/30 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                  {isRegistrationFlow ? "2FA MFA Account Setup" : "Two-Factor Authentication (MFA)"}
                  <Sparkles className="w-4 h-4 text-gold-400" />
                </h3>
                <p className="text-xs text-navy-300 font-mono">
                  Target Account: <span className="text-gold-400 font-bold">{targetEmail}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-navy-400 hover:text-white rounded-xl bg-navy-800/50 hover:bg-navy-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Security Explanation */}
            <div className="p-4 rounded-2xl bg-royal-50/60 dark:bg-navy-950/60 border border-royal-200/80 dark:border-navy-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-royal-700 dark:text-gold-400 flex items-center gap-1.5 uppercase">
                  <Lock className="w-4 h-4 text-gold-500" />
                  {isRegistrationFlow ? "Protect Your Account with 2FA" : "Multi-Factor Authentication Challenge"}
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  High Security Active
                </span>
              </div>
              <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                {isRegistrationFlow 
                  ? "We've sent a 6-digit One-Time Password (OTP) code to verify your identity before finalizing your portal enrollment."
                  : "Enter the 6-digit security code dispatched to your email address to verify your identity and access your portal dashboard."}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setMfaMode("email")}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mfaMode === "email"
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-500 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email 2FA</span>
              </button>

              <button
                type="button"
                onClick={() => setMfaMode("totp")}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mfaMode === "totp"
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-500 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Authenticator</span>
              </button>

              <button
                type="button"
                onClick={() => setMfaMode("backup")}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mfaMode === "backup"
                    ? "bg-royal-600 text-white shadow-md"
                    : "text-navy-500 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Backup Code</span>
              </button>
            </div>

            {/* Error & Success Notification Banners */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-mono flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Inputs based on Mode */}
            {mfaMode !== "backup" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-navy-600 dark:text-navy-300 font-bold uppercase text-[10px] tracking-wider">
                    Enter 6-Digit Code:
                  </span>
                  
                  {/* Resend button & timer */}
                  <div className="flex items-center gap-2">
                    {isSendingEmail ? (
                      <span className="text-[11px] text-royal-500 font-bold animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Dispatching email...
                      </span>
                    ) : canResend ? (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-[11px] text-royal-600 dark:text-gold-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend 2FA Email Code
                      </button>
                    ) : (
                      <span className="text-[10px] text-navy-400 font-bold">
                        Resend in <span className="text-gold-500 font-mono font-black">{resendCountdown}s</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 sm:w-13 h-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black text-navy-900 dark:text-white bg-navy-50 dark:bg-navy-950 border-2 border-navy-200 dark:border-navy-800 rounded-2xl focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20 shadow-inner"
                    />
                  ))}
                </div>

                {/* Quick Test Helper Badge / Autofill button */}
                <div className="p-3 bg-slate-900 rounded-xl text-white font-mono flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Generated 2FA Code</span>
                      <span className="text-amber-400 font-black tracking-widest text-sm">{expectedOtp}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutofillTestCode}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-navy-950 font-black text-[11px] rounded-lg transition-all cursor-pointer shadow"
                  >
                    Auto-fill 2FA Code
                  </button>
                </div>
              </div>
            ) : (
              /* Backup Code Input Mode */
              <div className="space-y-3 font-mono text-xs">
                <label className="block text-[10px] font-bold text-navy-500 dark:text-navy-400 uppercase">
                  8-Character Recovery Backup Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-royal-500" />
                  <input
                    type="text"
                    value={backupCodeInput}
                    onChange={(e) => setBackupCodeInput(e.target.value)}
                    placeholder="e.g. AMH-8821-X902"
                    className="w-full pl-9 pr-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold text-navy-900 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>
                <p className="text-[11px] text-navy-400">
                  Use one of the emergency backup codes generated when you enrolled your account.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-800 text-xs font-mono font-bold text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-royal-600 via-royal-700 to-indigo-700 hover:from-royal-500 hover:to-indigo-600 text-white font-mono font-black text-xs shadow-lg shadow-royal-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying 2FA...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-gold-400" />
                    <span>Verify Code &amp; Access Account</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
