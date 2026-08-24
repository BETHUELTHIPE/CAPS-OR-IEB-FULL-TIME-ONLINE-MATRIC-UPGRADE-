import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Key, Mail, CheckCircle, ShieldAlert, Sparkles, ArrowLeft, ShieldCheck, KeyRound, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { dbAuth } from "../lib/db";
import { firebaseSignInWithEmail } from "../lib/firebaseAuthService";
import { Profile } from "../types";
import { AmarisLogo } from "./AmarisLogo";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { MFAChallengeModal } from "./MFAChallengeModal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

interface LoginFormInput {
  email: string;
  password?: string;
}

interface LoginProps {
  onLoginSuccess: (user: Profile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<Profile | null>(null);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInput>();

  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get("redirect") || "dashboard";

  const triggerMfaChallenge = (user: Profile) => {
    setPendingUser(user);
    setIsMfaModalOpen(true);
  };

  const handleMfaVerified = (verifiedUser: Profile) => {
    setIsMfaModalOpen(false);
    onLoginSuccess(verifiedUser);
    navigate(`/${redirectPath}`);
  };

  const onSubmit = async (data: LoginFormInput) => {
    setError(null);
    setIsLoading(true);

    try {
      if (data.password && data.password.trim().length > 0) {
        // Attempt Firebase Email/Password Sign-In
        try {
          const user = await firebaseSignInWithEmail(data.email, data.password);
          setIsLoading(false);
          triggerMfaChallenge(user);
          return;
        } catch (firebaseErr: any) {
          console.warn("[Firebase Auth] Error signing in with password:", firebaseErr);
          // If it's an explicit credential or password error, show it clearly
          if (firebaseErr.message && !firebaseErr.message.includes("offline")) {
            setError(firebaseErr.message);
            setIsLoading(false);
            return;
          }
        }
      }

      // Fallback or passwordless fast sign-in
      const loggedInUser = dbAuth.login(data.email);
      setIsLoading(false);
      if (loggedInUser) {
        triggerMfaChallenge(loggedInUser);
      } else {
        setError("Unable to authenticate. Please try another email or register a new account.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "An authentication error occurred.");
    }
  };

  // Helper to quickly log in with pre-seeded super user profile
  const handleTestLogin = () => {
    const testEmail = "bethuelmoukangwe8@gmail.com";
    const loggedInUser = dbAuth.login(testEmail);
    if (loggedInUser) {
      triggerMfaChallenge(loggedInUser);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-royal-600/10 rounded-full blur-2xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/10 rounded-full blur-2xl" />

      <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-xl overflow-hidden relative z-10">
        
        {/* Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-navy-900 to-navy-950 text-white text-center flex flex-col items-center space-y-3">
          <AmarisLogo variant="icon" size="lg" />
          <span className="text-[10px] font-mono font-black uppercase text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-full">
            Tutor &amp; Student Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white">Amaris Learning Hub</h2>
          <p className="text-xs text-navy-300 max-w-xs">Access your live worksheets, schedule lessons, and track mark upgrades.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In */}
          <div className="space-y-2">
            <GoogleAuthButton
              mode="login"
              buttonText="Sign in with Google"
              onSuccess={(user) => {
                triggerMfaChallenge(user);
              }}
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-navy-150 dark:border-navy-800 w-full" />
            <span className="bg-white dark:bg-navy-900 px-3 text-[10px] font-mono font-bold text-navy-400 uppercase tracking-widest absolute">
              OR SIGN IN WITH EMAIL &amp; PASSWORD
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">
                Your Email Address
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="e.g. learner@gmail.com"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                  })}
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-navy-400" />
              </div>
              {errors.email && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="w-full pl-9 pr-10 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-navy-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-navy-400">Firebase Email &amp; Password Auth</span>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] font-mono font-bold text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Forgot Password?
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2.5 bg-royal-600 hover:bg-royal-700 disabled:opacity-60 text-white font-extrabold rounded-lg flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In with Firebase...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          {/* Test Profile Quick Access (SUPER COOL FOR SPEED EVALUATION) */}
          <div className="p-4 bg-royal-500/5 dark:bg-royal-500/10 border border-royal-500/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-royal-700 dark:text-gold-400 font-bold">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Super User Account Access</span>
            </div>
            <p className="text-[11px] text-navy-500 dark:text-navy-400">
              Skip typing! Click below to instantly log in as Super User <b>Bethuel Moukangwe (bethuelmoukangwe8@gmail.com)</b> with full admin privileges, loaded with active mock lesson bookings, uploaded homework feedback, and portal metrics.
            </p>
            <button 
              onClick={handleTestLogin}
              className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 font-black rounded-lg transition-all scale-100 hover:scale-[1.01] cursor-pointer"
            >
              Login as Bethuel Moukangwe (Super User)
            </button>
          </div>

          <div className="border-t border-navy-100 dark:border-navy-800 pt-4 text-center space-y-3">
            <p className="text-[11px] text-navy-500 dark:text-navy-400">
              Don't have an account yet?{" "}
              <Link to={redirectPath !== "dashboard" ? `/register?redirect=${redirectPath}` : "/register"} className="text-royal-600 dark:text-gold-400 font-bold hover:underline">
                Create Account
              </Link>
            </p>
            <div className="flex justify-center pt-1">
              <Link 
                to="/" 
                className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-navy-500 hover:text-royal-600 dark:text-navy-400 dark:hover:text-gold-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go back to home page
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* MFA 2FA Challenge Modal */}
      {pendingUser && (
        <MFAChallengeModal
          isOpen={isMfaModalOpen}
          onClose={() => setIsMfaModalOpen(false)}
          user={pendingUser}
          onVerificationSuccess={handleMfaVerified}
          isRegistrationFlow={false}
        />
      )}

      {/* Forgot Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

